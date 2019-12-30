/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";

	/**
	 * IconTabBar renderer.
	 * @namespace
	 */
	var IconTabBarRenderer = {
		apiVersion: 2
	};

	/**
	 * Array of all available icon color CSS classes
	 *
	 * @private
	 */
	IconTabBarRenderer._aAllIconColors = ['sapMITBFilterCritical', 'sapMITBFilterPositive', 'sapMITBFilterNegative', 'sapMITBFilterDefault'];


	/**
	 * Renders the HTML for the IconTabBar control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.IconTabBar} oIconTabBar An object representation of the control that should be rendered
	 */
	IconTabBarRenderer.render = function(oRM, oIconTabBar){
		var oContent = oIconTabBar.getContent(),
			oHeader = oIconTabBar._getIconTabHeader();

		// start control wrapper
		oRM.openStart("div", oIconTabBar)
			.class("sapMITB");

		if (oIconTabBar.getStretchContentHeight()) {
			oRM.class("sapMITBStretch");
		}
		if (!oIconTabBar.getApplyContentPadding()) {
			oRM.class("sapMITBNoContentPadding");
		}

		oRM.class("sapMITBBackgroundDesign" + oIconTabBar.getBackgroundDesign())
			.openEnd();

		// render icon tab header (if not configured to hide by ObjectHeader)
		if (!oIconTabBar._bHideHeader) {
			oRM.renderControl(oHeader);
		}

		// render outer content
		oRM.openStart("div", oIconTabBar.getId() + "-containerContent")
			.class("sapMITBContainerContent");

		if (!oIconTabBar.getExpanded()) { // add special styles  when closed
			oRM.class("sapMITBContentClosed");
		}
		oRM.openEnd();

		// render inner content
		oRM.openStart("div",  oIconTabBar.getId() + "-content")
			.class("sapMITBContent")
			.attr("role", "tabpanel");

		if (!oIconTabBar.getExpanded()) { // hide content when closed
			oRM.style("display", "none");
		}

		if (oHeader.oSelectedItem) {
			oRM.accessibilityState({
				labelledby: oHeader.oSelectedItem.getId()
			});
		}

		oRM.openEnd();

		if (oIconTabBar.getExpanded()) {
			// content from selected item
			if (oHeader.oSelectedItem && oHeader.oSelectedItem.getContent()) {
				var oContentSelectedTab = oHeader.oSelectedItem.getContent();
				if (oContentSelectedTab.length > 0) {
					oContent = oContentSelectedTab;
				}
			}
			// render the content
			oContent.forEach(function (oControl) {
				oRM.renderControl(oControl);
			});
		}

		oRM.close("div") // inner content
			.close("div") // outer content
			.close("div"); // control wrapper
	};

	return IconTabBarRenderer;

}, /* bExport= */ true);