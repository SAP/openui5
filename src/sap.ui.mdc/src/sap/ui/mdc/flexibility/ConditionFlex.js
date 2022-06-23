/*
 * ! ${copyright}
 */
sap.ui.define([
	'sap/base/util/merge', 'sap/base/Log', 'sap/ui/mdc/condition/FilterOperatorUtil'
], function(merge, Log, FilterOperatorUtil) {
	"use strict";

	/*
	* NOTE: As the ConditionFlex is the central changehandler for filter condition
	* processing, it might happen that the in/out handling of the ConditionModel
	* might cause multiple condition changes to be applied in parallel. Due to the
	* asynchronous modifier handling, we need to make sure to queue these changes in their
	* incoming order as parallel processing might falsely overwrite the 'filterConditions'
	* property causing the changehandler to break the controls housekeeping and the last
	* parallel filter change would always win.
	*/
	var fnQueueChange = function(oControl, fTask) {
		var fCleanupPromiseQueue = function(pOriginalPromise) {
			if (oControl._pQueue === pOriginalPromise){
				delete oControl._pQueue;
			}
		};

		oControl._pQueue = oControl._pQueue instanceof Promise ? oControl._pQueue.then(fTask) : fTask();
		oControl._pQueue.then(fCleanupPromiseQueue.bind(null, oControl._pQueue));

		return oControl._pQueue;
	};


	var fnGetDelegate = function(sDelegatePath) {
		return new Promise(function(fResolveLoad, fRejectLoad){
			sap.ui.require([
				sDelegatePath
			], fResolveLoad, fRejectLoad);
		});
	};

	var fDetermineFilterControl = function(oControl) {
		var oController = oControl && oControl.getEngine ? oControl.getEngine().getController(oControl, "Filter") : null;
		return oController ? oController.getFilterControl() : null;
	};

	var fAddCondition = function(oChange, oChangeContent, oControl, mPropertyBag, bIsRevert) {

		var oFilterControl = fDetermineFilterControl(oControl);

		if (oFilterControl && oFilterControl.applyConditionsAfterChangesApplied) {
			oFilterControl.applyConditionsAfterChangesApplied(oControl);
		}

		return fnQueueChange(oControl, function(){
			var mConditionsData, aConditions = null, oModifier = mPropertyBag.modifier;

			return oModifier.getProperty(oControl, "filterConditions")
			.then(function(mFilterConditions) {
				// 'filterConditions' property needs to be updated for change selector
				mConditionsData = merge({}, mFilterConditions);
				if (mConditionsData) {
					for (var sFieldPath in mConditionsData) {
						if (sFieldPath === oChangeContent.name) {
							aConditions = mConditionsData[sFieldPath];
							break;
						}
					}
				}

				if (!aConditions) {
					mConditionsData[oChangeContent.name] = [];
					aConditions = mConditionsData[oChangeContent.name];
				}

				if (!bIsRevert) {
					// Set revert data on the change
					oChange.setRevertData({
						name: oChangeContent.name,
						condition: oChangeContent.condition
					});
				}

				var nConditionIdx = FilterOperatorUtil.indexOfCondition(oChangeContent.condition, aConditions);
				if (nConditionIdx < 0) {
					aConditions.push(oChangeContent.condition);

					// 'filterConditions' property needs to be updated for change selector
					oModifier.setProperty(oControl, "filterConditions", mConditionsData);

					return oModifier.getProperty(oControl, "delegate")
					.then(function(oDelegate){
						return fnGetDelegate(oDelegate.name);
					})
					.then(function(Delegate){
						var fnDelegateAddCondition = Delegate && (Delegate.getFilterDelegate ? Delegate.getFilterDelegate().addCondition : Delegate.addCondition);
						if (fnDelegateAddCondition) {
							return fnDelegateAddCondition(oChangeContent.name, oControl, mPropertyBag)
							.catch(function(oEx) {
								Log.error("Error during Delegate.addCondition call: " + oEx);
							});
						}
					})
					.finally(function() {
						if (oFilterControl && oFilterControl.addCondition) {
							return oFilterControl.addCondition(oChangeContent.name, oChangeContent.condition);
						}
					});
				}
			});
		});
	};

	var fRemoveCondition = function(oChange, oChangeContent, oControl, mPropertyBag, bIsRevert) {

		var oFilterControl = fDetermineFilterControl(oControl);

		if (oFilterControl && oFilterControl.applyConditionsAfterChangesApplied) {
			oFilterControl.applyConditionsAfterChangesApplied(oControl);
		}

		return fnQueueChange(oControl, function(){
			var mConditionsData, aConditions, nDelIndex = -1, oModifier = mPropertyBag.modifier;

			return oModifier.getProperty(oControl, "filterConditions")
				.then(function(mFilterConditions) {
					// 'filterConditions' property needs to be updated for change selector
					mConditionsData = merge({}, mFilterConditions);

					if (mConditionsData) {
						for (var sFieldPath in mConditionsData) {
							if (sFieldPath === oChangeContent.name) {
								aConditions = mConditionsData[sFieldPath];
								break;
							}
						}
					}

					if (!bIsRevert) {
						// Set revert data on the change
						oChange.setRevertData({
							name: oChangeContent.name,
							condition: oChangeContent.condition
						});
					}

					if (aConditions && (aConditions.length > 0)) {

						nDelIndex = FilterOperatorUtil.indexOfCondition(oChangeContent.condition, aConditions);
						if (nDelIndex >= 0) {
							aConditions.splice(nDelIndex, 1);
							//					if (aConditions.length === 0) {
							//						delete mConditionsData[oChangeContent.name];
							//					}
							// 'filterConditions' property needs to be updated for change selector
							oModifier.setProperty(oControl, "filterConditions", mConditionsData);

							return oModifier.getProperty(oControl, "delegate")
							.then(function(oDelegate){
								return fnGetDelegate(oDelegate.name);
							})
							.then(function(Delegate){
								var fnDelegateRemoveCondition = Delegate && (Delegate.getFilterDelegate ? Delegate.getFilterDelegate().removeCondition : Delegate.removeCondition);
								if (fnDelegateRemoveCondition) {
									return fnDelegateRemoveCondition(oChangeContent.name, oControl, mPropertyBag)
									.catch(function(oEx) {
										Log.error("Error during Delegate.removeCondition call: " + oEx);
									});
								}
							})
							.finally(function() {
								if (oFilterControl && oFilterControl.removeCondition) {
									return oFilterControl.removeCondition(oChangeContent.name, oChangeContent.condition);
								}
							});
						}
					}
				});
		});
	};

	var oConditionFlex = {};

	oConditionFlex.addCondition = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				return fAddCondition(oChange, oChange.getContent(), oControl, mPropertyBag, false);
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				// TODO
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				return fRemoveCondition(oChange, oChange.getRevertData(), oControl, mPropertyBag, true).then(function() {
					oChange.resetRevertData();
				});

			}
		},
		"layers": {
			"USER": true
		}
	};
	oConditionFlex.removeCondition = {
		"changeHandler": {
			applyChange: function(oChange, oControl, mPropertyBag) {
				return fRemoveCondition(oChange, oChange.getContent(), oControl, mPropertyBag, false);
			},
			completeChangeContent: function(oChange, mChangeSpecificInfo, mPropertyBag) {
				// TODO
			},
			revertChange: function(oChange, oControl, mPropertyBag) {
				return fAddCondition(oChange, oChange.getRevertData(), oControl, mPropertyBag, true).then(function() {
					oChange.resetRevertData();
				});

			}
		},
		"layers": {
			"USER": true
		}
	};

	return oConditionFlex;
});
