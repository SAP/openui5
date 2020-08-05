/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/ui/fl/changeHandler/AddIFrame",
	"sap/ui/fl/changeHandler/common/getTargetAggregationIndex",
	"sap/ui/fl/changeHandler/common/createIFrame"
], function (
	Utils,
	Log,
	BaseAddIFrame,
	getTargetAggregationIndex,
	createIFrame
) {
	"use strict";

	/**
	 * AddIFrameObjectPageLayout change handler for AddIFrame (in particular to handle sections)
	 *
	 * @constructor
	 * @alias sap.uxap.changeHandler.AddIFrameObjectPageLayout
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.75
	 * @experimental Since 1.75
	 */
	 var AddIFrameObjectPageLayout = Object.assign({}, BaseAddIFrame);

	 /**
	 * Adds the IFrame control to the target control within the target aggregation.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @ui5-restricted sap.uxap
	 */
	AddIFrameObjectPageLayout.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oChangeDefinition = oChange.getDefinition();
		var sAggregationName = oChangeDefinition.content.targetAggregation;
		if (sAggregationName !== "sections") {
			return BaseAddIFrame.applyChange(oChange, oControl, mPropertyBag);
		}
		// Create a section, sub section and insert the IFrame
		var oView = mPropertyBag.view;
		var oComponent = mPropertyBag.appComponent;
		var oBaseSelector = oChangeDefinition.content.selector;
		var sDefaultTitle = sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_TITLE_FOR_IFRAME");

		var oOPSection = oModifier.createControl("sap.uxap.ObjectPageSection", oComponent, oView, oBaseSelector, {
			title: sDefaultTitle
		}, false);

		var oOPSubSectionSelector = Object.create(oBaseSelector);
		oOPSubSectionSelector.id += "-subSection";
		var oOPSubSection = oModifier.createControl("sap.uxap.ObjectPageSubSection", oComponent, oView, oOPSubSectionSelector, {
			title: sDefaultTitle
		}, false);
		oModifier.insertAggregation(oOPSection, "subSections", oOPSubSection, 0, oView);

		var oIFrameSelector = Object.create(oBaseSelector);
		oIFrameSelector.id += "-iframe";
		var oIFrame = createIFrame(oChange, mPropertyBag, oIFrameSelector);
		oModifier.insertAggregation(oOPSubSection, "blocks", oIFrame, 0, oView);

		var iIndex = getTargetAggregationIndex(oChange, oControl, mPropertyBag);
		oModifier.insertAggregation(oControl, "sections", oOPSection, iIndex, oView);

		oChange.setRevertData([oModifier.getId(oOPSection)]);
	};

	return AddIFrameObjectPageLayout;
}, /* bExport= */true);
