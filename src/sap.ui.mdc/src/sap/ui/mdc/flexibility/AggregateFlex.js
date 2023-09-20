/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/Engine",
	"sap/ui/mdc/flexibility/Util",
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(Engine, Util, CondenserClassification) {
	"use strict";

	const fFinalizeAggregateChange = function (oChange, oControl, oAggregateContent, bIsRevert) {
		if (bIsRevert) {
			// Clear the revert data on the change
			oChange.resetRevertData();
		} else {
			// Set revert data on the change
			oChange.setRevertData(oAggregateContent);
		}
	};

	const fAddAggregate = function (oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function (resolve, reject) {
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oModifier = mPropertyBag.modifier;
			const oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "aggregateConditions"))
				.then(function(oAggregateConditions) {
					const oAggregations = oAggregateConditions ? oAggregateConditions : {};
					oAggregations[oChangeContent.name] = {};
					const oAggregateContent = {
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

	const fRemoveAggregate = function (oChange, oControl, mPropertyBag, sChangeReason) {
		return new Promise(function (resolve, reject) {
			const bIsRevert = (sChangeReason === Util.REVERT);
			const oModifier = mPropertyBag.modifier;
			const oChangeContent = bIsRevert ? oChange.getRevertData() : oChange.getContent();
			Promise.resolve()
				.then(oModifier.getProperty.bind(oModifier, oControl, "aggregateConditions"))
				.then(function(oAggregateConditions) {
					const aValue = oAggregateConditions ? oAggregateConditions : {};

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

	const Aggregate = {};

	const fGetCondenserInfoCondition = function(oChange, mPropertyBag) {
		const oContent = oChange.getContent();
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