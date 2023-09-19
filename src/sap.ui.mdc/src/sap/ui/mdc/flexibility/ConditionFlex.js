/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/util/merge',
	'sap/base/Log',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/flexibility/Util',
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/mdc/util/mapVersions"
], function(merge, Log, FilterOperatorUtil, Util, Classification, mapVersions) {
	"use strict";

	/**
	 * When currently triggering changes in parallel (such as in/out parameters)
	 * queueing becomes necessary since ControPersonalizationWriteAPI#add process parallel
	 * appliance in parallel
	 */
	const fnQueueChange = function(oControl, fTask) {
		const fCleanupPromiseQueue = function(pOriginalPromise) {
			if (oControl._pQueue === pOriginalPromise){
				delete oControl._pQueue;
			}
		};

		oControl._pQueue = oControl._pQueue instanceof Promise ? oControl._pQueue.then(fTask) : fTask();
		oControl._pQueue.then(fCleanupPromiseQueue.bind(null, oControl._pQueue));

		return oControl._pQueue;
	};

	const fnGetDelegate = function(sDelegatePath) {
		return new Promise(function(fResolveLoad, fRejectLoad){
			sap.ui.require([
				sDelegatePath
			], fResolveLoad, fRejectLoad);
		})
		.then(function(Delegate){
			mapVersions(Delegate);
			return Delegate;
		});
	};

	const fAddCondition = function(oChange, oControl, mPropertyBag, sChangeReason) {

		const bIsRevert = (sChangeReason === Util.REVERT);
		const oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();

		let mConditionsData, aConditions = null;
		const oModifier = mPropertyBag.modifier;

		return fnQueueChange(oControl, function(){
			return oModifier.getProperty(oControl, "filterConditions")
			.then(function(mFilterConditions) {
				// 'filterConditions' property needs to be updated for change selector
				mConditionsData = merge({}, mFilterConditions);
				if (mConditionsData) {
					for (const sFieldPath in mConditionsData) {
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

				const nConditionIdx = FilterOperatorUtil.indexOfCondition(oChangeContent.condition, aConditions);
				if (nConditionIdx < 0) {
					aConditions.push(oChangeContent.condition);

					// 'filterConditions' property needs to be updated for change selector
					oModifier.setProperty(oControl, "filterConditions", mConditionsData);


					return oModifier.getProperty(oControl, "delegate")
					.then(function(oDelegate){
						return fnGetDelegate(oDelegate.name);
					})
					.then(function(Delegate){
						const fnDelegateAddCondition = Delegate && (Delegate.getFilterDelegate ? mapVersions(Delegate.getFilterDelegate()).addCondition : Delegate.addCondition);
						if (fnDelegateAddCondition) {
							return fnDelegateAddCondition(oControl, oChangeContent.name, mPropertyBag)
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
		});

	};

	const fRemoveCondition = function(oChange, oControl, mPropertyBag, sChangeReason) {

		const bIsRevert = (sChangeReason === Util.REVERT);
		const oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();

		let mConditionsData, aConditions, nDelIndex = -1;
		const oModifier = mPropertyBag.modifier;

		return fnQueueChange(oControl, function(){
			return oModifier.getProperty(oControl, "filterConditions")
			.then(function(mFilterConditions) {
				// 'filterConditions' property needs to be updated for change selector
				mConditionsData = merge({}, mFilterConditions);

				if (mConditionsData) {
					for (const sFieldPath in mConditionsData) {
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
							const fnDelegateRemoveCondition = Delegate && (Delegate.getFilterDelegate ? mapVersions(Delegate.getFilterDelegate()).removeCondition : Delegate.removeCondition);
							if (fnDelegateRemoveCondition) {
								return fnDelegateRemoveCondition(oControl, oChangeContent.name, mPropertyBag)
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
		});
	};

	const fGetCondenserInfoCondition = function(oChange, mPropertyBag) {
		const oContent = oChange.getContent();
		return {
			classification: Classification.Reverse,
			affectedControl: oChange.getSelector(),
			uniqueKey: oContent.name + '_' + JSON.stringify(oContent.condition)
		};
	};

	const ConditionFlex = {};

	ConditionFlex.addCondition = Util.createChangeHandler({
		apply: fAddCondition,
		revert: fRemoveCondition,
		getCondenserInfo: fGetCondenserInfoCondition
	});

	ConditionFlex.removeCondition = Util.createChangeHandler({
		apply: fRemoveCondition,
		revert: fAddCondition,
		getCondenserInfo: fGetCondenserInfoCondition
	});

	return ConditionFlex;
});