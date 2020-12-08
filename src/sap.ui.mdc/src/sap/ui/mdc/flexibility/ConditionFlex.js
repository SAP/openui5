/*
 * ! ${copyright}
 */
sap.ui.define([
	'sap/base/util/merge', 'sap/ui/mdc/condition/FilterOperatorUtil'
], function(merge, FilterOperatorUtil) {
	"use strict";

	var fDetermineFilterControl = function(oControl) {
		var oController = oControl && oControl.getEngine ? oControl.getEngine().getController(oControl, "Filter") : null;
		return oController ? oController.getFilterControl() : null;
	};

	var fAddCondition = function(oChange, oChangeContent, oControl, mPropertyBag, bIsRevert) {

		var oFilterControl = fDetermineFilterControl(oControl);

		if (oFilterControl && oFilterControl.applyConditionsAfterChangesApplied) {
			oFilterControl.applyConditionsAfterChangesApplied();
		}

		return new Promise(function(resolve) {

			var mConditionsData, aConditions = null, oModifier = mPropertyBag.modifier;

			// 'filterConditions' property needs to be updated for change selector
			mConditionsData = merge({}, oModifier.getProperty(oControl, "filterConditions"));
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

			var nConditionIdx = FilterOperatorUtil.indexOfCondition(oChangeContent.condition, aConditions);
			if (nConditionIdx < 0) {
				aConditions.push(oChangeContent.condition);

				// 'filterConditions' property needs to be updated for change selector
				oModifier.setProperty(oControl, "filterConditions", mConditionsData);

				if (!bIsRevert) {
					// Set revert data on the change
					oChange.setRevertData({
						name: oChangeContent.name,
						condition: oChangeContent.condition
					});
				}

				// the control providing the filter functionality needs to be used to update the ConditionModel
				if (oFilterControl && oFilterControl.addCondition) {
					oFilterControl.addCondition(oChangeContent.name, oChangeContent.condition).then(function() {
						resolve();
					});
				} else {
					resolve();
				}
			} else {
				resolve();
			}
		});
	};

	var fRemoveCondition = function(oChange, oChangeContent, oControl, mPropertyBag, bIsRevert) {

		var oFilterControl = fDetermineFilterControl(oControl);

		if (oFilterControl && oFilterControl.applyConditionsAfterChangesApplied) {
			oFilterControl.applyConditionsAfterChangesApplied();
		}

		return new Promise(function(resolve) {
			var mConditionsData, aConditions, nDelIndex = -1, oModifier = mPropertyBag.modifier;

			// 'filterConditions' property needs to be updated for change selector
			mConditionsData = merge({}, oModifier.getProperty(oControl, "filterConditions"));
			if (mConditionsData) {
				for (var sFieldPath in mConditionsData) {
					if (sFieldPath === oChangeContent.name) {
						aConditions = mConditionsData[sFieldPath];
						break;
					}
				}
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

					if (!bIsRevert) {
						// Set revert data on the change
						oChange.setRevertData({
							name: oChangeContent.name,
							condition: oChangeContent.condition
						});
					}

					// the control providing the filter functionality needs to be used to update the ConditionModel
					if (oFilterControl && oFilterControl.removeCondition) {
						oFilterControl.removeCondition(oChangeContent.name, oChangeContent.condition).then(function() {
							resolve();
						});
					} else {
						resolve();
					}
				} else {
					resolve();
				}
			} else {
				resolve();
			}

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
