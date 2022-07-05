/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(
	Log,
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
				 * @returns {Promise} Promise resolving when the change is applied
				 * @public
				 */
				applyChange: function(oChange, oControl, mPropertyBag) {
					var oModifier = mPropertyBag.modifier;
					var sPropertyName = mRenameSettings.propertyName;
					var sValue = oChange.getText(mRenameSettings.changePropertyName);

					return Promise.resolve()
						.then(function() {
							if (sValue) {
								return oModifier.getPropertyBindingOrProperty(oControl, sPropertyName)
									.then(function (vPropertyValue) {
										oChange.setRevertData(vPropertyValue);
										return oModifier.setPropertyBindingOrProperty(oControl, sPropertyName, sValue);
									});
							}
							return undefined;
						});
				},

				/**
				 * Reverts a Rename Change
				 *
				 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
				 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
				 * @param {object} mPropertyBag property bag
				 * @param {object} mPropertyBag.modifier modifier for the controls
				 * @public
				 */
				revertChange: function(oChange, oControl, mPropertyBag) {
					var oModifier = mPropertyBag.modifier;
					var sPropertyName = mRenameSettings.propertyName;
					var vOldValue = oChange.getRevertData();

					if (vOldValue || vOldValue === "") {
						oModifier.setPropertyBindingOrProperty(oControl, sPropertyName, vOldValue);
						oChange.resetRevertData();
						return;
					}

					Log.error("Change doesn't contain sufficient information to be reverted. Most Likely the Change didn't go through applyChange.");
				},

				/**
				 * Completes the change by adding change handler specific content
				 *
				 * @param {sap.ui.fl.Change} oChange change wrapper object to be completed
				 * @param {object} mSpecificChangeInfo with attribute (e.g. textLabel) to be included in the change
				 * @param {object} mPropertyBag - Property bag
				 * @param {object} mPropertyBag.modifier - Modifier for the controls
				 * @returns {Promise} A promise resolving when the change content is completed
				 * @public
				 */
				completeChangeContent: function(oChange, mSpecificChangeInfo, mPropertyBag) {
					var sChangePropertyName = mRenameSettings.changePropertyName;
					var sTranslationTextType = mRenameSettings.translationTextType;

					return Promise.resolve()
						.then(function() {
							return mPropertyBag.modifier.bySelector(oChange.getSelector(), mPropertyBag.appComponent);
						})
						.then(function(oControlToBeRenamed) {
							oChange.setContent({
								originalControlType: mPropertyBag.modifier.getControlType(oControlToBeRenamed)
							});

							if (typeof (mSpecificChangeInfo.value) === "string") {
								oChange.setText(sChangePropertyName, mSpecificChangeInfo.value, sTranslationTextType);
							} else {
								return Promise.reject(new Error("oSpecificChangeInfo.value attribute required"));
							}
						});
				},

				/**
				 * Retrieves the condenser-specific information.
				 *
				 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
				 * @returns {object} - Condenser-specific information
				 * @public
				 */
				getCondenserInfo: function(oChange) {
					return {
						affectedControl: oChange.getSelector(),
						classification: CondenserClassification.LastOneWins,
						uniqueKey: mRenameSettings.propertyName || mRenameSettings.changePropertyName
					};
				},

				/**
				 * Retrieves the information required for the change visualization.
				 *
				 * @param {sap.ui.fl.Change} oChange - Object with change data
				 * @returns {object} Object with a payload containing the information required for the change visualization
				 * @public
				 */
				getChangeVisualizationInfo: function(oChange) {
					var oNewLabel = (
						oChange.getTexts()
						&& oChange.getTexts()[mRenameSettings.changePropertyName]
					);
					return {
						payload: {
							originalLabel: oChange.getRevertData(),
							newLabel: oNewLabel && oNewLabel.value
						}
					};
				}
			};
		}
	};
	return BaseRename;
},
/* bExport= */true);
