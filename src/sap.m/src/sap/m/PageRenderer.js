/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library"],
	function(library) {
	"use strict";


	/**
	 * Page renderer.
	 * @namespace
	 */
	var PageRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Page} oPage an object representation of the control that should be rendered
	 */
	PageRenderer.render = function(oRm, oPage) {
		var oHeader = null,
			oFooter = null,
			bShowFooter = oPage.getShowFooter(),
			oSubHeader = null,
			bLightHeader  = this._isLightHeader(oPage),
			oLandmarkInfo = oPage.getLandmarkInfo();

		if (oPage.getShowHeader()) {
			oHeader = oPage._getAnyHeader();
		}

		if (oPage.getShowSubHeader()) {
			oSubHeader = oPage.getSubHeader();
		}

		oFooter = oPage.getFooter();

		oRm.write("<div");
		oRm.writeControlData(oPage);
		oRm.addClass("sapMPage");

		oRm.addClass("sapMPageBg" + oPage.getBackgroundDesign());

		if (oHeader) {
			oRm.addClass("sapMPageWithHeader");
		}

		if (oSubHeader) {
			oRm.addClass("sapMPageWithSubHeader");
		}

		if (oFooter && bShowFooter) {
			// it is used in the PopOver to remove additional margin bottom for page with footer
			oRm.addClass("sapMPageWithFooter");
		}

		if (!oPage.getContentOnlyBusy()) {
			oRm.addClass("sapMPageBusyCoversAll");
		}

		if (oPage.getFloatingFooter()) {
			oRm.addClass("sapMPageWithFloatingFooter");
		}

		oRm.writeClasses();

		var sTooltip = oPage.getTooltip_AsString();

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		oRm.writeAccessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "Root"));

		oRm.write(">");

		if (oHeader) {
			var sHeaderTag = oPage._getHeaderTag(oLandmarkInfo);
			// Header
			oRm.write("<" + sHeaderTag);
			oRm.addClass("sapMPageHeader");
			oRm.writeAccessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "Header"));
			oRm.writeClasses();
			oRm.write(">");
			//render headers
			this.renderBarControl(oRm, oPage, oHeader, {
				context: "header",
				styleClass: bLightHeader ? "" : "sapContrastPlus"
			});
			oRm.write("</" + sHeaderTag + ">");
		}

		if (oSubHeader) {
			var sSubHeaderTag = oPage._getSubHeaderTag(oLandmarkInfo);
			// SubHeader
			oRm.write("<" + sSubHeaderTag);
			oRm.addClass("sapMPageSubHeader");
			oRm.writeAccessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "SubHeader"));

			if (oSubHeader.getDesign() == library.ToolbarDesign.Info) {
				oRm.addClass("sapMPageSubHeaderInfoBar");
			}

			oRm.writeClasses();
			oRm.write(">");
			this.renderBarControl(oRm, oPage, oSubHeader, {
				context: "subHeader",
				styleClass: bLightHeader ? "" : "sapContrastPlus"
			});
			oRm.write("</" + sSubHeaderTag + ">");
		}

		// render child controls
		oRm.write('<section id="' + oPage.getId() + '-cont"');

		oRm.writeAccessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "Content"));

		// The vertical scroll bar should be immediately available to avoid flickering
		// and reduce size recalculations of embedded responsive controls that rely on
		// the page content width. See ScrollEnablement.js: _setOverflow
		if (oPage.getEnableScrolling()) {
			oRm.addClass("sapMPageEnableScrolling");
			oRm.writeClasses();
		}

		oRm.write('>');

		var aContent = oPage.getContent();
		var l = aContent.length;

		for (var i = 0; i < l; i++) {
			oRm.renderControl(aContent[i]);
		}

		oRm.write("</section>");

		// render footer Element
		// if a footer is defined, it should always be rendered
		// otherwise animation on show/hide won't work always

		if (oFooter) {
			var sFooterTag = oPage._getFooterTag(oLandmarkInfo);

			oRm.write("<" + sFooterTag);
			oRm.addClass("sapMPageFooter");
			if (!oPage.getShowFooter()) {
				oRm.addClass("sapUiHidden");
			}
			if (oPage.getFloatingFooter()) {
				oRm.addClass("sapMPageFloatingFooter");
			}
			oRm.writeAccessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "Footer"));
			oRm.writeClasses();
			oRm.write(">");
			this.renderBarControl(oRm, oPage, oFooter, {
				context : "footer"
			});
			oRm.write("</" + sFooterTag + ">");
		}

		oRm.write("</div>");
	};

	/**
	 * Renders the bar control if it is defined. Also adds classes to it.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Page} oPage The Page containing the bar
	 * @param {sap.m.IBar} oBarControl the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {object} oOptions object containing the tag, contextClass and styleClass added to the bar
	 */
	PageRenderer.renderBarControl = function (oRm, oPage, oBarControl, oOptions) {
		if (!oBarControl) {
			return;
		}

		oBarControl._applyContextClassFor(oOptions.context.toLowerCase());

		oBarControl.addStyleClass(oOptions.styleClass || "");

		oRm.renderControl(oBarControl);
	};

	/**
	 *	Check whether THIS page is used in scenario where its header should be light
	 *	Important for Belize styling
	 *
	 * @param {sap.m.Page} oPage The Page containing the bar
	 * @returns {boolean}
	 * @private
	 */
	PageRenderer._isLightHeader = function (oPage) {
		var oChild = oPage,
			oParent = oPage.getParent(),
			sParentName,
			sChildName;

		// Loop back to the top to check if there's SplitContainer OR SplitApp OR QuickView and then check if child elem is
		// sap.m.NavContainer and this Nav container is the master
		while (oParent) {
			sParentName = (oParent && oParent.getMetadata().getName()) || "";
			sChildName = oChild.getMetadata().getName();

			if (((sParentName === "sap.m.Popover" || sParentName === "sap.m.Dialog")
				&& sChildName === "sap.m.NavContainer")
				|| ((sParentName === "sap.ui.comp.smartvariants.SmartVariantManagement" || sParentName === "sap.ui.comp.smartvariants.SmartVariantManagementUi2"
				|| sParentName === "sap.ui.comp.variants.VariantManagement" || sParentName === "sap.ui.fl.variants.VariantManagement" )
				&& sChildName === "sap.m.ResponsivePopover")){
				return true;
			}

			if (oParent && ["sap.m.SplitApp", "sap.m.SplitContainer"].indexOf(sParentName) > -1
				&& sChildName === "sap.m.NavContainer" && /\-Master$/.test(oChild.getId())) {
				return true;
			}

			oChild = oParent;
			oParent = oChild.getParent();
		}

		return false;
	};

	return PageRenderer;

}, /* bExport= */ true);
