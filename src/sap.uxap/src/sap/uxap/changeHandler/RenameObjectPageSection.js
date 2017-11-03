	/*!
	 * ${copyright}
	 */

	sap.ui.define([
		"sap/ui/fl/Utils",
		"sap/ui/fl/changeHandler/BaseRename"],
		function(
			Utils,
			BaseRename) {
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
				propertyName : "title",
				changePropertyName : "newText",
				translationTextType : "XGRP"
			};

			var RenameObjectPageSection = BaseRename.createRenameChangeHandler(mRenameSettings);

			RenameObjectPageSection.applyChange = function (oChange, oControl, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var sPropertyName = mRenameSettings.propertyName;
				var oChangeDefinition = oChange.getDefinition();
				var sText = oChangeDefinition.texts[mRenameSettings.changePropertyName];
				var sValue = sText.value;
				var oControlToBeRenamed = oControl;
				var aSubSections = oModifier.getAggregation(oControl, "subSections");

				// due to specific logic in the Object Page Layout, the title of the Section is
				// taken from its SubSection in case it is only one no matter if the Section has title itself.
				if (aSubSections
					&& aSubSections.length === 1
					&& oModifier.getProperty(aSubSections[0], "title")
					&& oModifier.getProperty(oModifier.getParent(oControl), "subSectionLayout") === "TitleOnTop"
				) {
					oControlToBeRenamed = aSubSections[0];
				}

				if (oChangeDefinition.texts && sText && typeof (sValue) === "string") {
					oChange.setRevertData(oModifier.getProperty(oControlToBeRenamed, sPropertyName));

					// The value can be a binding - e.g. for translatable values in WebIde
					if (Utils.isBinding(sValue)) {
						oModifier.setPropertyBinding(oControlToBeRenamed, sPropertyName, sValue);
					} else {
						oModifier.setProperty(oControlToBeRenamed, sPropertyName, sValue);
					}
					return true;

				} else {
					Utils.log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
					//however subsequent changes should be applied
				}
			};

			return RenameObjectPageSection;
		},
		/* bExport= */true);