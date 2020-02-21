/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/ui/fl/changeHandler/BaseRename"
], function (
	Utils,
	Log,
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
		var aSubSections = oModifier.getAggregation(oControl, "subSections");
		// due to specific logic in the Object Page Layout, the title of the Section is
		// taken from its SubSection in case it is only one no matter if the Section has title itself.
		if (aSubSections
			&& aSubSections.length === 1
			&& oModifier.getProperty(aSubSections[0], "title")
			&& oModifier.getProperty(oModifier.getParent(oControl), "subSectionLayout") === "TitleOnTop"
		) {
			return aSubSections[0];
		}
		return oControl;
	};

	RenameObjectPageSection.applyChange = function (oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier,
			sPropertyName = mRenameSettings.propertyName,
			oChangeDefinition = oChange.getDefinition(),
			sText = oChangeDefinition.texts[mRenameSettings.changePropertyName],
			sValue = sText.value,
			oControlToBeRenamed = RenameObjectPageSection._getControlForRename(oControl, oModifier);

		if (typeof sValue === "string" && sValue.trim() === "") {
			throw new Error("Change cannot be applied as ObjectPageSubSection's title cannot be empty: ["
				+ oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
		}

		if (oChangeDefinition.texts && sText && typeof (sValue) === "string") {
			oChange.setRevertData(oModifier.getPropertyBindingOrProperty(oControlToBeRenamed, sPropertyName));
			oModifier.setPropertyBindingOrProperty(oControlToBeRenamed, sPropertyName, sValue);

			return true;
		} else {
			Log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
			//however subsequent changes should be applied
		}
	};

	RenameObjectPageSection.revertChange = function (oChange, oControl, mPropertyBag) {
		var vOldText = oChange.getRevertData(),
			oModifier = mPropertyBag.modifier,
			oControlToBeReverted = RenameObjectPageSection._getControlForRename(oControl, oModifier),
			sPropertyName = mRenameSettings.propertyName;

		if (vOldText || vOldText === "") {
			oModifier.setPropertyBindingOrProperty(oControlToBeReverted, sPropertyName, vOldText);
			oChange.resetRevertData();

			return true;
		} else {
			Log.error("Change doesn't contain sufficient information to be reverted. Most Likely the Change didn't go through applyChange.");
		}
	};


	return RenameObjectPageSection;
},
/* bExport= */true);
