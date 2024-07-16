/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(
	CondenserClassification
) {
	"use strict";

	/**
	 * Base Change Handler for Rename
	 *
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.BaseRename
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.46
	 *
	 * @private
	 * @ui5-restricted change handlers
	 */
	const BaseRename = {
		/**
		 * Returns an instance of the rename change handler
		 * @param {object} mRenameSettings - Settings required for the rename action
		 * @param {string} mRenameSettings.propertyName - Property from the control to be renamed (e.g. "label")
		 * @param {string} mRenameSettings.changePropertyName -  Only use if you have migration changeHandler: Property name in change (for LRep; e.g. "fieldLabel")
		 * @param {string} mRenameSettings.translationTextType - Translation text type in change (e.g. "XFLD")
		 * @return {object} The rename change handler
		 * @private
		 * @ui5-restricted change handlers
		 */
		createRenameChangeHandler(mRenameSettings) {
			mRenameSettings.changePropertyName ||= "newText";

			return {
				/**
				 * Renames a control.
				 *
				 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change wrapper object with instructions to be applied on the control map
				 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
				 * @param {object} mPropertyBag - Property bag
				 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
				 * @returns {Promise} Promise resolving when the change is applied
				 * @public
				 */
				async applyChange(oChange, oControl, mPropertyBag) {
					const oModifier = mPropertyBag.modifier;
					const sPropertyName = mRenameSettings.propertyName;
					const sValue = oChange.getText(mRenameSettings.changePropertyName);
					if (sValue) {
						const vPropertyValue = await oModifier.getPropertyBindingOrProperty(oControl, sPropertyName);
						oChange.setRevertData(vPropertyValue);
						await oModifier.setPropertyBindingOrProperty(oControl, sPropertyName, sValue);
					}
				},

				/**
				 * Reverts a Rename Change
				 *
				 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change wrapper object with instructions to be applied on the control map
				 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
				 * @param {object} mPropertyBag - Property bag
				 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
				 * @public
				 */
				revertChange(oChange, oControl, mPropertyBag) {
					const oModifier = mPropertyBag.modifier;
					const sPropertyName = mRenameSettings.propertyName;
					const vOldValue = oChange.getRevertData();

					if (vOldValue || vOldValue === "") {
						oModifier.setPropertyBindingOrProperty(oControl, sPropertyName, vOldValue);
						oChange.resetRevertData();
						return;
					}

					throw new Error("Change without sufficient information to be reverted. It probably didn't go through applyChange.");
				},

				/**
				 * Completes the change by adding change handler specific content
				 *
				 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change wrapper object to be completed
				 * @param {object} mSpecificChangeInfo with attribute (e.g. textLabel) to be included in the change
				 * @param {object} mPropertyBag - Property bag
				 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
				 * @returns {Promise} A promise resolving when the change content is completed
				 * @public
				 */
				async completeChangeContent(oChange, mSpecificChangeInfo, mPropertyBag) {
					const sChangePropertyName = mRenameSettings.changePropertyName;
					const sTranslationTextType = mRenameSettings.translationTextType;

					const oControlToBeRenamed = await mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
					oChange.setContent({
						originalControlType: mPropertyBag.modifier.getControlType(oControlToBeRenamed)
					});

					if (typeof (mSpecificChangeInfo.value) === "string") {
						oChange.setText(sChangePropertyName, mSpecificChangeInfo.value, sTranslationTextType);
					} else if (typeof (mSpecificChangeInfo.content.value) === "string") {
						oChange.setText(sChangePropertyName, mSpecificChangeInfo.content.value, sTranslationTextType);
					} else {
						throw new Error("oSpecificChangeInfo.value attribute required");
					}
				},

				/**
				 * Retrieves the condenser-specific information.
				 *
				 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object with instructions to be applied on the control map
				 * @returns {object} - Condenser-specific information
				 * @public
				 */
				getCondenserInfo(oChange) {
					return {
						affectedControl: oChange.getSelector(),
						classification: CondenserClassification.LastOneWins,
						uniqueKey: mRenameSettings.propertyName || mRenameSettings.changePropertyName
					};
				},

				/**
				 * Retrieves the information required for the change visualization.
				 *
				 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Object with change data
				 * @returns {object} - Object with a description payload containing the information required for the change visualization
				 * @public
				 */
				getChangeVisualizationInfo(oChange) {
					const oNewLabel = (
						oChange.getTexts()
						&& oChange.getTexts()[mRenameSettings.changePropertyName]
					);
					return {
						descriptionPayload: {
							originalLabel: oChange.getRevertData(),
							newLabel: oNewLabel && oNewLabel.value
						}
					};
				}
			};
		}
	};
	return BaseRename;
});
