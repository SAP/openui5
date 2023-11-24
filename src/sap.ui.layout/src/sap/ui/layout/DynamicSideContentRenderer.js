/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.layout.DynamicSideContent
sap.ui.define(["sap/base/i18n/Localization", "sap/ui/core/Lib", "sap/ui/layout/library", "sap/ui/Device"], function(Localization, Library, library, Device) {
	"use strict";

	// shortcut for sap.ui.layout.SideContentPosition
	var SideContentPosition = library.SideContentPosition;

	var SIDE_CONTENT_LABEL = "SIDE_CONTENT_LABEL";

	/**
	 * Renderer for sap.ui.layout.DynamicSideContent.
	 * @namespace
	 */
	var DynamicSideContentRenderer = {
		apiVersion: 2
	};

	DynamicSideContentRenderer.render = function (oRm, oSideContent) {
		oRm.openStart("div", oSideContent);

		oRm.class("sapUiDSC");
		oRm.style("height", "100%");
		oRm.openEnd();

		this.renderSubControls(oRm, oSideContent);

		oRm.close("div");

	};

	DynamicSideContentRenderer.renderSubControls = function (oRm, oSideControl) {
		var iSideContentId = oSideControl.getId(),
			bShouldSetHeight = oSideControl._shouldSetHeight(),
			bPageRTL = Localization.getRTL(),
			position = oSideControl.getSideContentPosition();

		if ((position === SideContentPosition.Begin && !bPageRTL) || (bPageRTL && position === SideContentPosition.End)) {
			this._renderSideContent(oRm, oSideControl, iSideContentId, bShouldSetHeight);
			this._renderMainContent(oRm, oSideControl, iSideContentId, bShouldSetHeight);
		} else {
			this._renderMainContent(oRm, oSideControl, iSideContentId, bShouldSetHeight);
			this._renderSideContent(oRm, oSideControl, iSideContentId, bShouldSetHeight);
		}
	};

	DynamicSideContentRenderer.renderControls = function (oRM, aContent) {
		var iLength = aContent.length,
			i = 0;

		for (; i < iLength; i++) {
			oRM.renderControl(aContent[i]);
		}
	};

	DynamicSideContentRenderer._renderMainContent = function(oRm, oSideControl, iSideContentId, bShouldSetHeight) {
		var iMcSpan = oSideControl.getProperty("mcSpan");

		oRm.openStart("div", iSideContentId + "-MCGridCell");

		oRm.class("sapUiDSCM");

		if (iMcSpan && oSideControl.getShowSideContent() && oSideControl._SCVisible) {
			!oSideControl._getSideContentWidth() && oRm.class("sapUiDSCSpan" + oSideControl.getProperty("mcSpan"));
		} else if (iMcSpan) {
			oRm.class("sapUiDSCSpan12");
			bShouldSetHeight = true;
		}
		bShouldSetHeight && oRm.style("height", "100%");
		oRm.openEnd();

		this.renderControls(oRm, oSideControl.getMainContent());
		oRm.close("div");
	};

	DynamicSideContentRenderer._renderSideContent = function(oRm, oSideControl, iSideContentId, bShouldSetHeight) {
		// on firefox the 'aside' side content is not shown when below the main content; use div instead
		var sSideContentTag = Device.browser.firefox ? "div" : "aside",
			iScSpan = oSideControl.getProperty("scSpan");

		oRm.openStart(sSideContentTag, iSideContentId + "-SCGridCell");

		oRm.class("sapUiDSCS");

		var oMessageBundle = Library.getResourceBundleFor("sap.ui.layout");
		oRm.attr("aria-label", oMessageBundle.getText(SIDE_CONTENT_LABEL));

		oRm.accessibilityState(oSideControl, {
			role: "complementary"
		});

		if (iScSpan && oSideControl.getShowMainContent() && oSideControl._MCVisible) {
			!oSideControl._getSideContentWidth() && oRm.class("sapUiDSCSpan" + oSideControl.getProperty("scSpan"));
		} else if (iScSpan) {
			oRm.class("sapUiDSCSpan12");
			bShouldSetHeight = true;
		}
		bShouldSetHeight && oRm.style("height", "100%");
		oRm.openEnd();

		this.renderControls(oRm, oSideControl.getSideContent());
		oRm.close(sSideContentTag);
	};

	return DynamicSideContentRenderer;
});
