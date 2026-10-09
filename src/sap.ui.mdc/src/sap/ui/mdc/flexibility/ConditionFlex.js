/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/Log',
	'sap/ui/mdc/condition/FilterOperatorUtil',
	'sap/ui/mdc/flexibility/Util',
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/changeHandler/common/ChangeCategories",
	"./helpers/addKeyOrName"
], (Log, FilterOperatorUtil, Util, ChangeClassification, ChangeCategories, addKeyOrName) => {
	"use strict";

	/**
	 * When currently triggering changes in parallel (such as in/out parameters)
	 * queueing becomes necessary since ControPersonalizationWriteAPI#add process parallel
	 * appliance in parallel
	 */
	const fnQueueChange = function(oControl, fTask) {
		const fCleanupPromiseQueue = function(pOriginalPromise) {
			if (oControl._pQueue === pOriginalPromise) {
				delete oControl._pQueue;
			}
		};

		oControl._pQueue = oControl._pQueue instanceof Promise ? oControl._pQueue.then(fTask) : fTask();
		oControl._pQueue.then(fCleanupPromiseQueue.bind(null, oControl._pQueue));

		return oControl._pQueue;
	};

	const fAddCondition = function(oChange, oControl, mPropertyBag, sChangeReason) {

		const bIsRevert = (sChangeReason === Util.REVERT);
		const oChangeContent = addKeyOrName(bIsRevert ? oChange.getRevertData() : oChange.getContent());

		let mConditionsData, aConditions = null;
		const oModifier = mPropertyBag.modifier;

		return fnQueueChange(oControl, () => {
			return oModifier.getProperty(oControl, "filterConditions")
				.then((mFilterConditions) => {
					// Shallow-copy the outer map and only copy the target field's array to avoid
					// an O(n) deep-copy of all conditions on every per-condition apply (see O(n²) issue).
					mConditionsData = Object.assign({}, mFilterConditions);
					if (mConditionsData) {
						for (const sFieldPath in mConditionsData) {
							if (sFieldPath === oChangeContent.key) {
								aConditions = mConditionsData[sFieldPath] = mConditionsData[sFieldPath].slice();
								break;
							}
						}
					}

					if (!aConditions) {
						mConditionsData[oChangeContent.key] = [];
						aConditions = mConditionsData[oChangeContent.key];
					}

					if (!bIsRevert) {
						// Set revert data on the change
						oChange.setRevertData({
							key: oChangeContent.key,
							/**
							 * @deprecated As of version 1.124.0
							 */
							name: oChangeContent.key,
							condition: oChangeContent.condition
						});
					}

					const nConditionIdx = FilterOperatorUtil.indexOfCondition(oChangeContent.condition, aConditions);
					if (nConditionIdx < 0) {
						aConditions.push(oChangeContent.condition);

						// 'filterConditions' property needs to be updated for change selector
						oModifier.setProperty(oControl, "filterConditions", mConditionsData);


						return oModifier.getProperty(oControl, "delegate")
							.then((oDelegate) => {
								return Util.getModule(oDelegate.name);
							})
							.then((Delegate) => {
								const fnDelegateAddCondition = Delegate && (Delegate.getFilterDelegate ? Delegate.getFilterDelegate().addCondition : Delegate.addCondition);
								if (fnDelegateAddCondition) {
									return fnDelegateAddCondition(oControl, oChangeContent.key, mPropertyBag)
										.catch((oEx) => {
											Log.error("Error during Delegate.addCondition call: " + oEx);
										});
								}
							})
							.finally(() => {
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
		const oChangeContent = addKeyOrName(bIsRevert ? oChange.getRevertData() : oChange.getContent());

		let mConditionsData, aConditions, nDelIndex = -1;
		const oModifier = mPropertyBag.modifier;

		return fnQueueChange(oControl, () => {
			return oModifier.getProperty(oControl, "filterConditions")
				.then((mFilterConditions) => {
					// Shallow-copy the outer map and only copy the target field's array to avoid
					// an O(n) deep-copy of all conditions on every per-condition revert (see O(n²) issue).
					mConditionsData = Object.assign({}, mFilterConditions);

					if (mConditionsData) {
						for (const sFieldPath in mConditionsData) {
							if (sFieldPath === oChangeContent.key) {
								aConditions = mConditionsData[sFieldPath] = mConditionsData[sFieldPath].slice();
								break;
							}
						}
					}

					if (!bIsRevert) {
						// Set revert data on the change
						oChange.setRevertData({
							key: oChangeContent.key,
							/**
							 * @deprecated As of version 1.124.0
							 */
							name: oChangeContent.key,
							condition: oChangeContent.condition
						});
					}

					if (aConditions && (aConditions.length > 0)) {

						nDelIndex = FilterOperatorUtil.indexOfCondition(oChangeContent.condition, aConditions);
						if (nDelIndex >= 0) {
							aConditions.splice(nDelIndex, 1);
							//					if (aConditions.length === 0) {
							//						delete mConditionsData[oChangeContent.key];
							//					}
							// 'filterConditions' property needs to be updated for change selector
							oModifier.setProperty(oControl, "filterConditions", mConditionsData);

							return oModifier.getProperty(oControl, "delegate")
								.then((oDelegate) => {
									return Util.getModule(oDelegate.name);
								})
								.then((Delegate) => {
									const fnDelegateRemoveCondition = Delegate && (Delegate.getFilterDelegate ? Delegate.getFilterDelegate().removeCondition : Delegate.removeCondition);
									if (fnDelegateRemoveCondition) {
										return fnDelegateRemoveCondition(oControl, oChangeContent.key, mPropertyBag)
											.catch((oEx) => {
												Log.error("Error during Delegate.removeCondition call: " + oEx);
											});
									}
								})
								.finally(() => {
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
		const oContent = addKeyOrName(oChange.getContent());
		return {
			classification: ChangeClassification.Reverse,
			affectedControl: oChange.getSelector(),
			uniqueKey: oContent.key + '_' + JSON.stringify(oContent.condition)
		};
	};

	const fGetChangeVisualizationInfo = function(oChange, oAppComponent) {
		const oContent = addKeyOrName(oChange.getContent());
		const oFilterBar = oAppComponent.byId(oChange.getSelector().id);
		const mVersionInfo = { descriptionPayload: {} };
		let sKey;
		let aArgs = [oContent.key, oContent.condition.operator];
		let vValue;

		if (oChange.getChangeType() === "addCondition") {
			mVersionInfo.descriptionPayload.category = ChangeCategories.ADD;
			sKey = "filterbar.COND_ADD_CHANGE";
		} else {
			mVersionInfo.descriptionPayload.category = ChangeCategories.REMOVE;
			sKey = "filterbar.COND_DEL_CHANGE";
		}

		const oProperty = oFilterBar?.getPropertyHelper()?.getProperty(oContent.key, true);
		if (oProperty) {
			aArgs.splice(0, 1, oProperty.label);

			const oOperator = FilterOperatorUtil.getOperator(oContent.condition.operator);
			if (oOperator) {
				const sOpText = oOperator.getLongText(oProperty.dataType);
				if (sOpText) {
					aArgs.splice(1, 1, sOpText);
				}
				let mCurrentState = null;
				if (oFilterBar.getInternalConditions) {
					mCurrentState = oFilterBar.getInternalConditions();
				} else if (oFilterBar.getInbuiltFilter && oFilterBar.getInbuiltFilter() && oFilterBar.getInbuiltFilter().getInternalConditions) {
					mCurrentState = oFilterBar.getInbuiltFilter().getInternalConditions();
				}

				if ((oContent.condition.values.length > 0) && mCurrentState) {
					const aConditions = mCurrentState[oContent.key];
					const mInternalCondition = aConditions?.find((oCondition) => oCondition.values[0] === oContent.condition.values[0]);
					if (mInternalCondition) {
						vValue = oOperator.format(mInternalCondition, oProperty.typeConfig.typeInstance, oProperty.display, true);
						if (vValue) {
							aArgs.push(vValue);
						}
					}
				}
			}
		}

		if (!vValue) {
			if ((oContent.condition.values.length) === 2) {
				sKey += "_2";
				aArgs = aArgs.concat(oContent.condition.values);
			} else if ((oContent.condition.values.length) > 2) {
				sKey += "_3";
				aArgs = aArgs.concat(oContent.condition.values);
			} else if ((oContent.condition.values.length) === 0) {
				sKey += "_0";
			}
		}

		aArgs = aArgs.concat(vValue ? vValue : oContent.condition.values);

		return Util.getInactiveAwareResourceText(oFilterBar, oContent.key, sKey, aArgs).then((sDescription) => {
			mVersionInfo.descriptionPayload.description = sDescription;

			mVersionInfo.updateRequired = true;
			return mVersionInfo;
		});
	};

	const ConditionFlex = {};

	ConditionFlex.addCondition = Util.createChangeHandler({
		apply: fAddCondition,
		revert: fRemoveCondition,
		getCondenserInfo: fGetCondenserInfoCondition,
		getChangeVisualizationInfo: fGetChangeVisualizationInfo
	});

	ConditionFlex.removeCondition = Util.createChangeHandler({
		apply: fRemoveCondition,
		revert: fAddCondition,
		getCondenserInfo: fGetCondenserInfoCondition,
		getChangeVisualizationInfo: fGetChangeVisualizationInfo
	});

	return ConditionFlex;
});