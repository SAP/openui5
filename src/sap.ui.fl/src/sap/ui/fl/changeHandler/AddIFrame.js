/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/common/revertAddedControls"
], function(
	revertAddedControls
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
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @ui5-restricted sap.ui.fl
	 */
	AddIFrame._createIFrame = function (oChange, mPropertyBag, sIFrameId) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var oView = mPropertyBag.view;
		var oComponent = mPropertyBag.appComponent;
		var mIFrameSettings = {};
		["url", "width", "height"].forEach(function (sIFrameProperty) {
			mIFrameSettings[sIFrameProperty] = oChangeDefinition.content[sIFrameProperty];
		});
		var oIFrame = oModifier.createControl("sap.ui.fl.util.IFrame", oComponent, oView, sIFrameId, mIFrameSettings, false);
		return oIFrame;
	};

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
		var sIFrameId = "iframe_" + oChangeDefinition.content.baseId;
		var iIndex = oChangeDefinition.content.index;
		if (undefined === iIndex) {
			var aAggregationContent = oModifier.getAggregation(oControl, sAggregationName);
			iIndex = aAggregationContent.length /* last by default */;
		}
		var oIFrame = AddIFrame._createIFrame(oChange, mPropertyBag, sIFrameId);
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
	 * @param {object} oSpecificChangeInfo Must contain UI extension settings
	 * @param {string} oSpecificChangeInfo.targetAggregation Aggregation to add the extension to
	 * @param {string} oSpecificChangeInfo.baseId Base ID to allocate controls
	 * @param {string} oSpecificChangeInfo.width IFrame Width
	 * @param {string} oSpecificChangeInfo.height IFrame Height
	 * @param {string} oSpecificChangeInfo.url IFrame Url
	 * @ui5-restricted sap.ui.fl
	 */
	AddIFrame.completeChangeContent = function (oChange, oSpecificChangeInfo) {
		var oChangeJson = oChange.getDefinition();
		// Required settings
		["targetAggregation", "baseId", "url"].forEach(function (sRequiredProperty) {
			if (!Object.prototype.hasOwnProperty.call(oSpecificChangeInfo, sRequiredProperty)) {
				throw new Error("Attribute missing from the change specific content '" + sRequiredProperty + "'");
			}
		});
		oChangeJson.content = Object.assign({}, oSpecificChangeInfo);
	};

	return AddIFrame;
}, /* bExport= */true);
