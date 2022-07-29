/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/util/merge',
	'sap/base/Log',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/flexibility/Util'
], function(merge, Log, FilterOperatorUtil, Util) {
	"use strict";

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

	var fAddCondition = function(oChange, oControl, mPropertyBag, sChangeReason) {

		var oFilterControl = fDetermineFilterControl(oControl);
		var bIsRevert = (sChangeReason === Util.REVERT);
		var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();

		if (oFilterControl && oFilterControl.applyConditionsAfterChangesApplied) {
			oFilterControl.applyConditionsAfterChangesApplied(oControl);
		}

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
					if (bIsRevert) {
						oChange.resetRevertData();
					}
				});
			}
		});
	};

	var fRemoveCondition = function(oChange, oControl, mPropertyBag, sChangeReason) {

		var oFilterControl = fDetermineFilterControl(oControl);
		var bIsRevert = (sChangeReason === Util.REVERT);
		var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();

		if (oFilterControl && oFilterControl.applyConditionsAfterChangesApplied) {
			oFilterControl.applyConditionsAfterChangesApplied(oControl);
		}

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
						if (bIsRevert) {
							oChange.resetRevertData();
						}
					});
				}
			}
		});
	};

	var ConditionFlex = {};

	ConditionFlex.addCondition = Util.createChangeHandler({
		apply: fAddCondition,
		revert: fRemoveCondition
	});

	ConditionFlex.removeCondition = Util.createChangeHandler({
		apply: fRemoveCondition,
		revert: fAddCondition
	});

	return ConditionFlex;
});
