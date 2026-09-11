/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/changeHandler/AddIFrame",
	"sap/ui/fl/changeHandler/common/getTargetAggregationIndex",
	"sap/ui/fl/changeHandler/common/createIFrame",
	"sap/ui/fl/Utils"
], function(
	Library,
	BaseAddIFrame,
	getTargetAggregationIndex,
	createIFrame,
	FlexUtils
) {
	"use strict";

	/**
	 * AddIFrameObjectPageSection change handler for AddIFrame
	 * (in particular to handle subsections)
	 *
	 * @constructor
	 * @alias sap.uxap.changeHandler.AddIFrameObjectPageSection
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.149
	 */
	var AddIFrameObjectPageSection = Object.assign({}, BaseAddIFrame);

	/**
	 * Adds the IFrame control to the target control within the target aggregation.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @returns {Promise} Promise resolving when the change is successfully applied
	 * @ui5-restricted sap.uxap
	 */
	AddIFrameObjectPageSection.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oContent = oChange.getContent();
		var sAggregationName = oContent.targetAggregation;
		if (sAggregationName !== "subSections") {
			return Promise.resolve()
				.then(BaseAddIFrame.applyChange.bind(BaseAddIFrame, oChange, oControl, mPropertyBag));
		}
		// Create a sub section and insert the IFrame
		var oView = mPropertyBag.view;
		var oComponent = mPropertyBag.appComponent;
		var oBaseSelector = oContent.selector;

		const sDefaultTitle = Library.getResourceBundleFor("sap.uxap").getText("SECTION_TITLE_FOR_IFRAME");
		const sTitle = oChange.getText("title") || sDefaultTitle;

		var oOPSubSection;
		return Promise.resolve()
			.then(oModifier.createControl.bind(oModifier, "sap.uxap.ObjectPageSubSection", oComponent, oView, oBaseSelector, {
					title: sTitle
				}, false)
			)
			.then(function(oOPSubSectionLocal) {
				oOPSubSection = oOPSubSectionLocal;
				var oIFrameSelector = Object.create(oBaseSelector);
				oIFrameSelector.id += "-iframe";
				// There is no wrapping section here, so the rename info points at the subsection itself.
				// This makes the iFrame a container (asContainer=true) whose title is the subsection title,
				// so a later rename of the subsection stays in sync with the embedded content.
				const mRenameInfo = {
					sourceControlId: oModifier.getId(oOPSubSection),
					selectorControlId: oModifier.getId(oOPSubSection),
					propertyName: "title"
				};
				return createIFrame(oChange, mPropertyBag, oIFrameSelector, mRenameInfo);
			})
			.then(function(oIFrame) {
				return oModifier.insertAggregation(oOPSubSection, "blocks", oIFrame, 0, oView);
			})
			.then(getTargetAggregationIndex.bind(null, oChange, oControl, mPropertyBag))
			.then(function(iIndex) {
				return oModifier.insertAggregation(oControl, "subSections", oOPSubSection, iIndex, oView);
			})
			.then(function() {
				oChange.setRevertData([oModifier.getId(oOPSubSection)]);
			});
	};

	/**
	 * Reverts previously applied change.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag Map of properties
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @ui5-restricted sap.uxap
	 */
	AddIFrameObjectPageSection.revertChange = async function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var sAggregationName = oChange.getContent().targetAggregation;
		var oView = mPropertyBag.view || FlexUtils.getViewForControl(oControl);
		var oAppComponent = mPropertyBag.appComponent;
		var aRevertData = oChange.getRevertData() || [];

		for (const vRevertData of aRevertData) {
			var sControlId = typeof vRevertData === "string" ? vRevertData : vRevertData.id;
			var oControlToRemove = oModifier.bySelector(sControlId, oAppComponent, oView)
				|| (oView?.createId && oModifier.bySelector(oView.createId(sControlId)));
			await oModifier.removeAggregation(oControl, sAggregationName, oControlToRemove);
			if (oControlToRemove.destroy) {
				oControlToRemove.destroy();
			}
		}
		oChange.resetRevertData();
	};

	AddIFrameObjectPageSection.getCondenserInfo = function(oChange) {
		var oCondenserInfo = Object.assign({}, BaseAddIFrame.getCondenserInfo(oChange));
		var oChangeContent = oChange.getContent();
		var sAggregationName = oChangeContent.targetAggregation;
		if (sAggregationName === "subSections") {
			oCondenserInfo.updateControl = Object.assign({}, oCondenserInfo.affectedControl);
			oCondenserInfo.updateControl.id = oCondenserInfo.affectedControl.id + "-iframe";
		}
		return oCondenserInfo;
	};

	AddIFrameObjectPageSection.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		return {
			...BaseAddIFrame.getChangeVisualizationInfo(oChange, oAppComponent),
			displayControls: [oChange.getContent().selector]
		};
	};

	return AddIFrameObjectPageSection;
}, /* bExport= */true);
