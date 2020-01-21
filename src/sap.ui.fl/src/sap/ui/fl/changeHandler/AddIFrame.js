/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/common/revertAddedControls",
	"sap/ui/fl/changeHandler/common/getTargetAggregationIndex",
	"sap/ui/fl/changeHandler/common/createIFrame"
], function(
	revertAddedControls,
	getTargetAggregationIndex,
	createIFrame
) {
	"use strict";

	/**
	 * Change handler for adding UI Extension
	 *
	 * @alias sap.ui.fl.changeHandler.AddIFrame
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.72
	 * @private
	 */
	var AddIFrame = {};

	/**
	 * Add the IFrame control to the target control within the target aggregation.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @ui5-restricted sap.ui.fl
	 */
	AddIFrame.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var oView = mPropertyBag.view;
		var sAggregationName = oChangeDefinition.content.targetAggregation;
		var oAggregationDefinition = oModifier.findAggregation(oControl, sAggregationName);
		if (!oAggregationDefinition) {
			throw new Error("The given Aggregation is not available in the given control: " + oModifier.getId(oControl));
		}
		var iIndex = getTargetAggregationIndex(oChange, oControl, mPropertyBag);
		var oIFrame = createIFrame(oChange, mPropertyBag, oChangeDefinition.content.selector);
		oModifier.insertAggregation(oControl, sAggregationName, oIFrame, iIndex, oView);
		oChange.setRevertData([oModifier.getId(oIFrame)]);
	};

	/**
	 * Reverts previously applied change.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @ui5-restricted sap.ui.fl
	 */
	AddIFrame.revertChange = revertAddedControls;

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.Change} oChange Change object to be completed
	 * @param {object} oSpecificChangeInfo Specific change information
	 * @param {object} oSpecificChangeInfo.content Must contain UI extension settings
	 * @param {string} oSpecificChangeInfo.content.targetAggregation Aggregation to add the extension to
	 * @param {string} oSpecificChangeInfo.content.baseId Base ID to allocate controls
	 * @param {string} [oSpecificChangeInfo.content.width] IFrame Width
	 * @param {string} [oSpecificChangeInfo.content.height] IFrame Height
	 * @param {string} oSpecificChangeInfo.content.url IFrame Url
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @ui5-restricted sap.ui.fl
	 */
	AddIFrame.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		var oChangeJson = oChange.getDefinition();
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;
		// Required settings
		["targetAggregation", "baseId", "url"].forEach(function (sRequiredProperty) {
			if (!Object.prototype.hasOwnProperty.call(oSpecificChangeInfo.content, sRequiredProperty)) {
				throw new Error("Attribute missing from the change specific content '" + sRequiredProperty + "'");
			}
		});
		oChangeJson.content = Object.assign(oChangeJson.content || {}, oSpecificChangeInfo.content);
		oChangeJson.content.selector = oModifier.getSelector(oChangeJson.content.baseId, oAppComponent);
	};

	return AddIFrame;
}, /* bExport= */true);
