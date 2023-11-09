/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/condenser/Classification"
], function (CondenserClassification) {
	"use strict";

	var RenameFormElement = {};

	var isProvided = function (sString) {
		return typeof (sString) === "string";
	};

	RenameFormElement.applyChange = function (oChangeWrapper, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier,
			sValue = oChangeWrapper.getText("fieldLabel");

		return Promise.resolve()
			.then(function () {
				return oModifier.getAggregation(oControl, "label");
			})
			.then(function (vLabel) {
				// setLabel called with a string
				if (typeof vLabel === "string") {
					oChangeWrapper.setRevertData(vLabel);
					return oModifier.setProperty(oControl, "label", sValue);
				}

				// setLabel called with a label control
				return oModifier.getProperty(vLabel, "text").then(function (sLabel) {
					oChangeWrapper.setRevertData(sLabel);
					oModifier.setProperty(vLabel, "text", sValue);
				});
			});
	};

	RenameFormElement.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		if (!(oSpecificChangeInfo.renamedElement && oSpecificChangeInfo.renamedElement.id)) {
			throw new Error("Rename of label cannot be executed: oSpecificChangeInfo.renamedElement attribute required");
		}

		if (!isProvided(oSpecificChangeInfo.value)) {
			throw new Error("Rename of label cannot be executed: oSpecificChangeInfo.value attribute required");
		}

		oChange.setText("fieldLabel", oSpecificChangeInfo.value, "XGRP");
	};

	RenameFormElement.revertChange = function (oChangeWrapper, oControl, mPropertyBag) {
		var sOldText = oChangeWrapper.getRevertData(),
			oModifier = mPropertyBag.modifier;

		return Promise.resolve()
			.then(function () {
				return oModifier.getAggregation(oControl, "label");
			})
			.then(function (vLabel) {
				if (typeof vLabel === "string") {
					oModifier.setProperty(oControl, "label", sOldText);
				} else {
					oModifier.setProperty(vLabel, "text", sOldText);
				}
				oChangeWrapper.resetRevertData();
			});
	};

	RenameFormElement.getChangeVisualizationInfo = function(oChange) {
		var sLabel = oChange.getText("fieldLabel");

		return {
			descriptionPayload: {
				originalLabel: oChange.getRevertData(),
				newLabel: sLabel
			}
		};
	};

	RenameFormElement.getCondenserInfo = function(oChange) {
		return {
			affectedControl: oChange.getSelector(),
			classification: CondenserClassification.LastOneWins,
			uniqueKey: "label"
		};
	};

	return RenameFormElement;
});