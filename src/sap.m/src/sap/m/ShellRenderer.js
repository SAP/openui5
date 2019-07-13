/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/library',
	'sap/m/library',
	'sap/ui/Device',
	"sap/base/security/encodeXML"
],
function(coreLibrary, library, Device, encodeXML) {
	"use strict";


	// shortcut for sap.m.BackgroundHelper
	var BackgroundHelper = library.BackgroundHelper;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;


	/**
	 * Shell renderer.
	 * @namespace
	 */
	var ShellRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	ShellRenderer.render = function(rm, oControl) {
		var sTitleLevel = (oControl.getTitleLevel() === TitleLevel.Auto) ? TitleLevel.H1 : oControl.getTitleLevel();

		rm.write("<div");
		rm.writeControlData(oControl);
		rm.addClass("sapMShell");

		if (oControl.getAppWidthLimited()) {
			rm.addClass("sapMShellAppWidthLimited");
		}

		BackgroundHelper.addBackgroundColorStyles(rm, oControl.getBackgroundColor(),  oControl.getBackgroundImage(), "sapMShellGlobalOuterBackground");

		rm.writeClasses();
		rm.writeStyles();

		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}

		rm.write(">");

		/* The background in "SAP_Belize_Deep" must be dark. The contrast class is set to the element wihout any children to avoid unnecessary propagation. */
		BackgroundHelper.renderBackgroundImageTag(rm, oControl, ["sapContrastPlus", "sapMShellBG", "sapUiGlobalBackgroundImageForce"],  oControl.getBackgroundImage(), oControl.getBackgroundRepeat(), oControl.getBackgroundOpacity());

		rm.write("<div class='sapMShellBrandingBar'></div>");


		rm.write("<div class='sapMShellCentralBox'>");


		// header
		var extraHeaderClass = "", extraBGClass = "";
		if (!oControl.getBackgroundImage()) {
			extraHeaderClass = "sapMShellBackgroundColorOnlyIfDefault";
			extraBGClass = "sapUiGlobalBackgroundImageOnlyIfDefault";
		}
		rm.write("<header class='sapMShellHeader " + extraHeaderClass + "' id='" + oControl.getId() + "-hdr'>");
		rm.write("<div class='" + extraBGClass + "'></div>");
		// logo
		rm.write(ShellRenderer.getLogoImageHtml(oControl));

		// header title
		if (oControl.getTitle()) {
			rm.write("<" + sTitleLevel);
			rm.write(" id='" + oControl.getId() + "-hdrTxt' class='sapMShellHeaderText'>");
			rm.writeEscaped(oControl.getTitle());
			rm.write("</" + sTitleLevel + ">");
		}

		// header right area
		rm.write("<span class='sapMShellHeaderRight'>");

		// headerRightText
		rm.write("<span id='" + oControl.getId() + "-hdrRightTxt' ");
		if (!oControl.getHeaderRightText()) {
			rm.writeAttribute("style", "display:none;");
		}
		rm.write("class='sapMShellHeaderRightText'>" + encodeXML(oControl.getHeaderRightText()) + "</span>");


		// logout button
		if (oControl.getShowLogout()) {
			var rb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			rm.write("<a id='" + oControl.getId() + "-logout' tabindex='0' role='button' class='sapMShellHeaderLogout'>" + rb.getText("SHELL_LOGOUT") + "</a>");
		}

		rm.write("</span></header>");



		// content
		rm.write("<div class='sapMShellContent sapMShellGlobalInnerBackground' id='" + oControl.getId() + "-content' data-sap-ui-root-content='true'>");
		rm.renderControl(oControl.getApp());
		rm.write("</div></div></div>");
	};

	ShellRenderer.getLogoImageHtml = function(oControl) {
		var sImage = oControl.getLogo(); // configured logo
		if (!sImage) {
			//TODO: global jquery call found
			jQuery.sap.require("sap.ui.core.theming.Parameters");
			sImage = sap.ui.core.theming.Parameters._getThemeImage(); // theme logo
		}

		var result = "";
		if (sImage) {
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			result = "<div class='sapMShellLogo'>";
			if (Device.browser.msie) {
				result += "<span class='sapMShellLogoImgAligner'></span>";
			}
			result += "<img id='" + oControl.getId() + "-logo' class='sapMShellLogoImg' src='";
			result += encodeXML(sImage);
			result += "' alt='";
			result += oRb.getText("SHELL_ARIA_LOGO");
			result += "' /></div>";
		}
		return result;
	};

	return ShellRenderer;

}, /* bExport= */ true);