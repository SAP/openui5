/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.ShellOverlay
sap.ui.define(["sap/ui/core/Configuration"],
	function(Configuration) {
	"use strict";


	/**
	 * ShellOverlay renderer.
	 * @namespace
	 * @deprecated Since version 1.44.0.
	 */
	var ShellOverlayRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.unified.ShellOverlay} oControl an object representation of the control that should be rendered
	 */
	ShellOverlayRenderer.render = function(rm, oControl){
		rm.write("<div");
		rm.writeControlData(oControl);
		rm.addClass("sapUiUfdShellOvrly");
		if (oControl._opening) {
			rm.addClass("sapUiUfdShellOvrlyCntntHidden");
			rm.addClass("sapUiUfdShellOvrlyOpening");
		}

		if (oControl._getAnimActive()) {
			rm.addClass("sapUiUfdShellOvrlyAnim");
		}
		rm.writeClasses();
		if (Configuration.getAccessibility()) {
			rm.writeAccessibilityState(oControl, {
				role: "dialog"
			});
		}
		rm.write("><span id='", oControl.getId(), "-focfirst' tabindex='0'></span><div id='", oControl.getId(), "-inner'>");

		rm.write("<header class='sapUiUfdShellOvrlyHead'>");
		rm.write("<hr class='sapUiUfdShellOvrlyBrand'>");
		rm.write("<div class='sapUiUfdShellOvrlyHeadCntnt'");
		if (Configuration.getAccessibility()) {
			rm.writeAttribute("role", "toolbar");
		}
		rm.write("><div id='" + oControl.getId() + "-hdr-center' class='sapUiUfdShellOvrlyHeadCenter'>");
		ShellOverlayRenderer.renderSearch(rm, oControl);
		rm.write("</div>");
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified"),
			sCloseTxt = rb.getText("SHELL_OVERLAY_CLOSE");
		rm.write("<a tabindex='0' href='#' id='" + oControl.getId() + "-close' class='sapUiUfdShellOvrlyHeadClose'");
		rm.writeAttributeEscaped("title", sCloseTxt);
		if (Configuration.getAccessibility()) {
			rm.writeAttribute("role", "button");
		}
		rm.write(">");
		rm.writeEscaped(sCloseTxt);
		rm.write("</a></div></header>");
		rm.write("<div id='" + oControl.getId() + "-cntnt' class='sapUiUfdShellOvrlyCntnt'>");
		ShellOverlayRenderer.renderContent(rm, oControl);
		rm.write("</div>");

		rm.write("</div><span id='", oControl.getId(), "-foclast' tabindex='0'></span></div>");
	};

	ShellOverlayRenderer.renderSearch = function(rm, oControl) {
		var iWidth = oControl._getSearchWidth();

		rm.write("<div id='" + oControl.getId() + "-search' class='sapUiUfdShellOvrlySearch' ");
		if (iWidth > 0 && oControl._opening) {
			rm.addStyle("width", iWidth + "px'");
			rm.writeStyles();
		}
		rm.write("><div>");

		var oSearch = oControl.getSearch();
		if (oSearch) {
			rm.renderControl(oSearch);
		}
		rm.write("</div></div>");
	};

	ShellOverlayRenderer.renderContent = function(rm, oControl) {
		rm.write("<div>");
		var aContent = oControl.getContent();
		for (var i = 0; i < aContent.length; i++) {
			rm.renderControl(aContent[i]);
		}
		rm.write("</div>");
	};

	return ShellOverlayRenderer;

}, /* bExport= */ true);
