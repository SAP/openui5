/*
 * ! ${copyright}
 */
sap.ui.define(["sap/ui/fl/apply/api/FlexRuntimeInfoAPI"], function (FlexRuntimeInfoAPI) {
	"use strict";
	var fRebindControl = function (oControl) {
		var bExecuteRebindForTable = oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound();
		var bExecuteRebindForChart = oControl && oControl.isA && (oControl.isA("sap.ui.mdc.Chart"));
		if (bExecuteRebindForTable || bExecuteRebindForChart) {
			if (!oControl._bWaitForBindChanges) {
				oControl._bWaitForBindChanges = true;
				FlexRuntimeInfoAPI.waitForChanges({
					element: oControl
				}).then(function () {
					if (bExecuteRebindForTable) {
						oControl.checkAndRebind();
					} else if (bExecuteRebindForChart) {
						oControl.rebind();
					}
					delete oControl._bWaitForBindChanges;
				});

			}
		}
	};

	var fFinalizeAggregateChange = function (oChange, oControl, oAggregateContent, bIsRevert) {
		if (bIsRevert) {
			// Clear the revert data on the change
			oChange.resetRevertData();
		} else {
			// Set revert data on the change
			oChange.setRevertData(oAggregateContent);
		}
		// Rebind Table if needed
		fRebindControl(oControl);
	};

	var fAddAggregate = function (oChange, oControl, mPropertyBag, bIsRevert) {
		return new Promise(function (resolve, reject) {
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "aggregateConditions"))
				.then(function(oAggregateConditions) {
					var oAggregations = oAggregateConditions ? oAggregateConditions : {};
					oAggregations[oChangeContent.name] = {};
					var oAggregateContent = {
						name: oChangeContent.name
					};
					oModifier.setProperty(oControl, "aggregateConditions", oAggregations);
					fFinalizeAggregateChange(oChange, oControl, oAggregateContent, bIsRevert);
					resolve();
				})
				.catch(function(oError) {
					reject(oError);
				});
		});
	};

	var fRemoveAggregate = function (oChange, oControl, mPropertyBag, bIsRevert) {
		return new Promise(function (resolve, reject) {
			var oModifier = mPropertyBag.modifier;
			var oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "aggregateConditions"))
				.then(function(oAggregateConditions) {
					var aValue = oAggregateConditions ? oAggregateConditions : {};

					if (!aValue) {
						// Nothing to remove
						reject();
					}

					delete aValue[oChangeContent.name];
					oModifier.setProperty(oControl, "aggregateConditions", aValue);
					fFinalizeAggregateChange(oChange, oControl, oChangeContent, bIsRevert);
					resolve();
				})
				.catch(function(oError) {
					reject(oError);
				});
		});
	};

	var Aggregate = {};
	Aggregate.removeAggregate = {
		"changeHandler": {
			applyChange: function (oChange, oControl, mPropertyBag) {
				return fRemoveAggregate(oChange, oControl, mPropertyBag, false);
			},
			completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
				// Not used, but needs to be there
			},
			revertChange: function (oChange, oControl, mPropertyBag) {
				return fAddAggregate(oChange, oControl, mPropertyBag, true);
			}
		},
		"layers": {
			"USER": true
		}
	};

	Aggregate.addAggregate = {
		"changeHandler": {
			applyChange: function (oChange, oControl, mPropertyBag) {
				return fAddAggregate(oChange, oControl, mPropertyBag, false);
			},
			completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
				// Not used, but needs to be there
			},
			revertChange: function (oChange, oControl, mPropertyBag) {
				return fRemoveAggregate(oChange, oControl, mPropertyBag, true);
			}
		},
		"layers": {
			"USER": true
		}
	};

	return Aggregate;
});