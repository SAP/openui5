/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine",
	"sap/ui/mdc/flexibility/Util",
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(Engine, Util, CondenserClassification) {
	"use strict";

	var fRebindControl = function (oControl) {
		var bExecuteRebindForTable = oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound();
		var bExecuteRebindForChart = oControl && oControl.isA && (oControl.isA("sap.ui.mdc.Chart"));
		if (bExecuteRebindForTable || bExecuteRebindForChart) {
			if (!oControl._bWaitForBindChanges) {
				oControl._bWaitForBindChanges = true;
				Engine.getInstance().waitForChanges(oControl).then(function () {
					if (bExecuteRebindForTable) {
						oControl.rebind();
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

	var fAddAggregate = function (oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function (resolve, reject) {
			var bIsRevert = (sChangeReason === Util.REVERT);
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

	var fRemoveAggregate = function (oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function (resolve, reject) {
			var bIsRevert = (sChangeReason === Util.REVERT);
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

	var fGetCondenserInfoCondition = function(oChange, mPropertyBag) {
		var oContent = oChange.getContent();
		return {
			classification: CondenserClassification.Reverse,
			affectedControl: oChange.getSelector(),
			uniqueKey: "aggregate" + "_" + oContent.name
		};
	};

	Aggregate.addAggregate = Util.createChangeHandler({
		apply: fAddAggregate,
		revert: fRemoveAggregate,
		getCondenserInfo: fGetCondenserInfoCondition
	});

	Aggregate.removeAggregate = Util.createChangeHandler({
		apply: fRemoveAggregate,
		revert: fAddAggregate,
		getCondenserInfo: fGetCondenserInfoCondition
	});

	return Aggregate;
});