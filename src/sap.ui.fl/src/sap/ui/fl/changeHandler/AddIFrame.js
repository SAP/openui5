/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/common/revertAddedControls",
	"sap/ui/fl/changeHandler/common/getTargetAggregationIndex",
	"sap/ui/fl/changeHandler/common/createIFrame",
	"sap/ui/fl/changeHandler/condenser/Classification"
], function(
	revertAddedControls,
	getTargetAggregationIndex,
	createIFrame,
	Classification
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
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @returns {Promise} Promise resolving when the change is successfully applied
	 * @ui5-restricted sap.ui.fl
	 */
	AddIFrame.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeContent = oChange.getContent();
		var oView = mPropertyBag.view;
		var sAggregationName = oChangeContent.targetAggregation;
		var iIndex;
		var oIFrame;
		return Promise.resolve()
		.then(oModifier.findAggregation.bind(oModifier, oControl, sAggregationName))
		.then(function(oAggregationDefinition) {
			if (!oAggregationDefinition) {
				throw new Error(`The given Aggregation is not available in the given control: ${oModifier.getId(oControl)}`);
			}
			return getTargetAggregationIndex(oChange, oControl, mPropertyBag);
		})
		.then(function(iRetrievedIndex) {
			iIndex = iRetrievedIndex;
			return createIFrame(oChange, mPropertyBag, oChangeContent.selector);
		})
		.then(function(oCreatedIFrame) {
			oIFrame = oCreatedIFrame;
			return oModifier.insertAggregation(oControl, sAggregationName, oIFrame, iIndex, oView);
		})
		.then(function() {
			oChange.setRevertData([oModifier.getId(oIFrame)]);
		});
	};

	/**
	 * Reverts previously applied change.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @ui5-restricted sap.ui.fl
	 */
	AddIFrame.revertChange = revertAddedControls;

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object to be completed
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
	AddIFrame.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		const oModifier = mPropertyBag.modifier;
		const oAppComponent = mPropertyBag.appComponent;
		// Required settings
		["targetAggregation", "baseId", "url"].forEach(function(sRequiredProperty) {
			if (!Object.hasOwn(oSpecificChangeInfo.content, sRequiredProperty)) {
				throw new Error(`Attribute missing from the change specific content '${sRequiredProperty}'`);
			}
		});
		const oContent = { ...oSpecificChangeInfo.content };
		oContent.selector = oModifier.getSelector(oContent.baseId, oAppComponent);
		oChange.setContent(oContent);
	};

	AddIFrame.getChangeVisualizationInfo = function(oChange) {
		return {
			affectedControls: [oChange.getContent().selector]
		};
	};

	AddIFrame.getCondenserInfo = function(oChange) {
		var oContent = oChange.getContent();
		return {
			classification: Classification.Create,
			uniqueKey: "iFrame",
			affectedControl: oContent.selector,
			targetContainer: oChange.getSelector(),
			targetAggregation: oContent.targetAggregation,
			setTargetIndex(oChange, iNewTargetIndex) {
				oChange.getContent().index = iNewTargetIndex;
			},
			getTargetIndex(oChange) {
				return oChange.getContent().index;
			},
			update(oChange, oNewContent) {
				Object.assign(oChange.getContent(), oNewContent);
			}
		};
	};

	return AddIFrame;
});
