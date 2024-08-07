/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/changeHandler/BaseRename"
], function (
	Log,
	JsControlTreeModifier,
	BaseRename
) {
	"use strict";

	/**
	 * ObjectPageSection Change Handler for Rename
	 *
	 * @constructor
	 * @alias sap.uxap.changeHandler.RenameObjectPageSection
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.50
	 */

	var mRenameSettings = {
		propertyName: "title",
		changePropertyName: "newText",
		translationTextType: "XGRP"
	};

	var RenameObjectPageSection = BaseRename.createRenameChangeHandler(mRenameSettings);

	RenameObjectPageSection._getControlForRename = function (oControl, oModifier) {
		var aSubSections,
			vTitle;

		return Promise.resolve()
			.then(function() {
				return oModifier.getAggregation(oControl, "subSections");
			})
			.then(function(aSubSectionsLocal) {
				aSubSections = aSubSectionsLocal;

				if (aSubSections.length !== 1) {
					// if there are no or more than one sub sections, the following
					// code should not execute and oControl should be returned
					return [];
				}

				return Promise.all([oModifier.getPropertyBindingOrProperty(aSubSections[0], "title"),
					oModifier.getProperty(oModifier.getParent(oControl), "subSectionLayout")]);
			})
			.then(function(aProperties) {
				// due to specific logic in the Object Page Layout, the title of the Section is
				// taken from its SubSection in case it is only one no matter if the Section has title itself.
				vTitle = aProperties[0];

				if (aSubSections
					&& aSubSections.length === 1
					&& vTitle
					&& (typeof vTitle === "object") || (typeof vTitle === "string" && vTitle.trim() !== "")
					&& aProperties[1] === "TitleOnTop"
				) {
					return aSubSections[0];
				}
				return oControl;
			});
	};

	RenameObjectPageSection.applyChange = function (oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var sPropertyName = mRenameSettings.propertyName;
		var sValue = oChange.getText(mRenameSettings.changePropertyName);

		if (sValue && typeof sValue === "string") {
			return RenameObjectPageSection._getControlForRename(oControl, oModifier)
				.then(function(oControlToBeRenamed) {
					if (sValue.trim() === "") {
						throw new Error("Change cannot be applied as ObjectPageSubSection's title cannot be empty");
					}

					return oModifier.getPropertyBindingOrProperty(oControlToBeRenamed, sPropertyName)
						.then(function(oBindingOrProperty) {
							oChange.setRevertData(oBindingOrProperty);
							oModifier.setPropertyBindingOrProperty(oControlToBeRenamed, sPropertyName, sValue);
							return true;
						});
				});
		}
	};

	RenameObjectPageSection.revertChange = function (oChange, oControl, mPropertyBag) {
		var vOldText = oChange.getRevertData(),
			oModifier = mPropertyBag.modifier,
			sPropertyName = mRenameSettings.propertyName;
		return RenameObjectPageSection._getControlForRename(oControl, oModifier)
			.then(function(oControlToBeReverted){
				if (vOldText || vOldText === "") {
					oModifier.setPropertyBindingOrProperty(oControlToBeReverted, sPropertyName, vOldText);
					oChange.resetRevertData();
					return true;
				} else {
					Log.error("Change doesn't contain sufficient information to be reverted. Most Likely the Change didn't go through applyChange.");
				}
			});
	};

	/**
	 * Retrieves the information required for the change visualization.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Object with change data
	 * @param {sap.ui.core.UIComponent} oAppComponent Component in which the change is applied
	 * @returns {object} Object with a description payload containing the information required for the change visualization
	 * @public
	 */
	RenameObjectPageSection.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		var oNewLabel = (
			oChange.getTexts()
			&& oChange.getTexts()[mRenameSettings.changePropertyName]
		);
		var oSelector = oChange.getSelector();
		var oElement = JsControlTreeModifier.bySelector(oSelector, oAppComponent);
		var oAnchorBar = oElement.getParent().getAggregation("_anchorBar");
		var aAffectedControls = [oElement.getId()];
		var aDisplayControls = [oElement.getId()];
		oAnchorBar.getAggregation("items").forEach(function(oAnchorBarItem) {
			if (oElement.getId() === oAnchorBarItem.getKey()) {
				aDisplayControls.push(oAnchorBarItem.getId());
			}
		});
		return {
			descriptionPayload: {
				originalLabel: oChange.getRevertData(),
				newLabel: oNewLabel && oNewLabel.value
			},
			affectedControls: aAffectedControls,
			displayControls: aDisplayControls
		};
	};

	return RenameObjectPageSection;
});
