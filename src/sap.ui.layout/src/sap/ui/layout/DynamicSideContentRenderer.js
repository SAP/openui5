/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.layout.DynamicSideContent
sap.ui.define(["sap/ui/layout/library", "sap/ui/Device"],
	function(library, Device) {
		"use strict";

		// shortcut for sap.ui.layout.SideContentPosition
		var SideContentPosition = library.SideContentPosition;

		var SIDE_CONTENT_LABEL = "SIDE_CONTENT_LABEL";

		/**
		 * Renderer for sap.ui.layout.DynamicSideContent.
		 * @namespace
		 */
		var DynamicSideContentRenderer = {};

		DynamicSideContentRenderer.render = function (oRm, oSideContent) {
			oRm.write("<div");
			oRm.writeControlData(oSideContent);

			oRm.addClass("sapUiDSC");
			oRm.writeClasses();
			oRm.addStyle("height", "100%");
			oRm.writeStyles();
			oRm.write(">");

			this.renderSubControls(oRm, oSideContent);

			oRm.write("</div>");

		};

		DynamicSideContentRenderer.renderSubControls = function (oRm, oSideControl) {
			var iSideContentId = oSideControl.getId(),
				bShouldSetHeight = oSideControl._shouldSetHeight(),
				bPageRTL = sap.ui.getCore().getConfiguration().getRTL(),
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
			oRm.write("<div id='" + iSideContentId + "-MCGridCell'");

			if (oSideControl._iMcSpan) {
				oRm.addClass("sapUiDSCSpan" + oSideControl._iMcSpan);
				oRm.writeClasses();
			}
			if (bShouldSetHeight) {
				oRm.addStyle("height", "100%");
				oRm.writeStyles();
			}
			oRm.write(">");

			this.renderControls(oRm, oSideControl.getMainContent());
			oRm.write("</div>");
		};

		DynamicSideContentRenderer._renderSideContent = function(oRm, oSideControl, iSideContentId, bShouldSetHeight) {
			// on firefox the 'aside' side content is not shown when below the main content; use div instead
			var sSideContentTag = Device.browser.firefox ? "div" : "aside";

			oRm.write("<" + sSideContentTag + " id='" + iSideContentId + "-SCGridCell'");

			var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.layout");
			oRm.writeAttribute("aria-label", oMessageBundle.getText(SIDE_CONTENT_LABEL));

			oRm.writeAccessibilityState(oSideControl, {
				role: "complementary"
			});

			if (oSideControl._iScSpan) {
				oRm.addClass("sapUiDSCSpan" + oSideControl._iScSpan);
				oRm.writeClasses();
			}
			if (bShouldSetHeight) {
				oRm.addStyle("height", "100%");
				oRm.writeStyles();
			}
			oRm.write(">");

			this.renderControls(oRm, oSideControl.getSideContent());
			oRm.write("</" + sSideContentTag + ">");
		};

		return DynamicSideContentRenderer;
	}, /* bExport= */ true);
