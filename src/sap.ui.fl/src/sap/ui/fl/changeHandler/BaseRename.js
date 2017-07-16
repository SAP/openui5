/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "./Base", "sap/ui/fl/Utils"
    ], function(jQuery, Base, Utils) {
		"use strict";

		/**
		 * Base Change Handler for Rename
		 *
		 * @constructor
		 * @alias sap.ui.fl.changeHandler.BaseRename
		 * @author SAP SE
		 * @version ${version}
		 * @experimental Since 1.46
		 */
		var BaseRename = {

			/**
			 * Returns an instance of the rename change handler
			 * @param  {object} mRenameSettings The settings required for the rename action
			 *                  mRenameSettings.propertyName The property from the control to be renamed (e.g. "label")
			 *                  mRenameSettings.changePropertyName Only use if you have to have migration changeHandler: Property name in change (for LRep; e.g. "fieldLabel")
			 *                  mRenameSettings.translationTextType The translation text type in change (e.g. "XFLD")
			 * @return {any} the rename change handler object
			 */
			createRenameChangeHandler: function(mRenameSettings) {

				mRenameSettings.changePropertyName = mRenameSettings.changePropertyName || "newText";

				return {

					/**
					 * Renames a control.
					 *
					 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
					 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
					 * @param {object} mPropertyBag property bag
					 * @param {object} mPropertyBag.modifier modifier for the controls
					 * @returns {boolean} true if successful
					 * @public
					 */
					applyChange : function(oChange, oControl, mPropertyBag) {
						var oModifier = mPropertyBag.modifier;
						var sPropertyName = mRenameSettings.propertyName;
						var oChangeDefinition = oChange.getDefinition();
						var sText = oChangeDefinition.texts[mRenameSettings.changePropertyName];
						var sValue = sText.value;

						if (oChangeDefinition.texts && sText && typeof (sValue) === "string") {

							// The value can be a binding - e.g. for translatable values in WebIde
							if (Utils.isBinding(sValue)) {
								oModifier.setPropertyBinding(oControl, sPropertyName, sValue);
							} else {
								oModifier.setProperty(oControl, sPropertyName, sValue);
							}
							return true;

						} else {
							Utils.log.error("Change does not contain sufficient information to be applied: [" + oChangeDefinition.layer + "]" + oChangeDefinition.namespace + "/" + oChangeDefinition.fileName + "." + oChangeDefinition.fileType);
							//however subsequent changes should be applied
						}
					},

					/**
					 * Completes the change by adding change handler specific content
					 *
					 * @param {sap.ui.fl.Change} oChange change wrapper object to be completed
					 * @param {object} mSpecificChangeInfo with attribute (e.g. textLabel) to be included in the change
					 * @public
					 */
					completeChangeContent : function(oChange, mSpecificChangeInfo, mPropertyBag) {
						var oChangeDefinition = oChange.getDefinition();
						var sChangePropertyName = mRenameSettings.changePropertyName;
						var sTranslationTextType = mRenameSettings.translationTextType;

						var oControlToBeRenamed = mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
						oChangeDefinition.content.originalControlType = mPropertyBag.modifier.getControlType(oControlToBeRenamed);

						if (typeof (mSpecificChangeInfo.value) === "string") {
							Base.setTextInChange(oChangeDefinition, sChangePropertyName, mSpecificChangeInfo.value, sTranslationTextType);
						} else {
							throw new Error("oSpecificChangeInfo.value attribute required");
						}
					}

				};
			}
		};

		return BaseRename;
	},
/* bExport= */true);