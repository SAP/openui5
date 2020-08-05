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
	var PageRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Page} oPage an object representation of the control that should be rendered
	 */
	PageRenderer.render = function(oRm, oPage) {
		var oHeader = null,
			oFooter = oPage.getFooter(),
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

		oRm.openStart("div", oPage)
			.class("sapMPage")
			.class("sapMPageBg" + oPage.getBackgroundDesign());

		if (oHeader) {
			oRm.class("sapMPageWithHeader");
		}

		if (oSubHeader) {
			oRm.class("sapMPageWithSubHeader");
		}

		if (oFooter && bShowFooter) {
			// it is used in the PopOver to remove additional margin bottom for page with footer
			oRm.class("sapMPageWithFooter");
		}

		if (!oPage.getContentOnlyBusy()) {
			oRm.class("sapMPageBusyCoversAll");
		}

		if (oPage.getFloatingFooter()) {
			oRm.class("sapMPageWithFloatingFooter");
		}

		oRm.accessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "Root"));

		oRm.openEnd();

		if (oHeader) {
			this.renderHeader(oRm, oPage, oHeader, oLandmarkInfo, bLightHeader);
		}

		if (oSubHeader) {
			this.renderSubHeader(oRm, oPage, oSubHeader, oLandmarkInfo, bLightHeader);
		}

		this.renderChildControls(oRm, oPage, oLandmarkInfo);

		// render footer Element
		// if a footer is defined, it should always be rendered
		// otherwise animation on show/hide won't work always
		if (oFooter) {
			this.renderFooter(oRm, oPage, oFooter, oLandmarkInfo);
		}

		oRm.close("div");
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

	PageRenderer.renderHeader = function (oRm, oPage, oHeader, oLandmarkInfo, bLightHeader) {
		var sHeaderTag = oPage._getHeaderTag(oLandmarkInfo);

		oRm.openStart(sHeaderTag)
			.class("sapMPageHeader")
			.accessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "Header"))
			.openEnd();

		this.renderBarControl(oRm, oPage, oHeader, {
			context: "header",
			styleClass: bLightHeader ? "" : "sapContrastPlus"
		});

		oRm.close(sHeaderTag);
	};

	PageRenderer.renderSubHeader = function (oRm, oPage, oSubHeader, oLandmarkInfo, bLightHeader) {
		var sSubHeaderTag = oPage._getSubHeaderTag(oLandmarkInfo);

		oRm.openStart(sSubHeaderTag)
			.class("sapMPageSubHeader")
			.accessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "SubHeader"));

		if (oSubHeader.getDesign() == library.ToolbarDesign.Info) {
			oRm.class("sapMPageSubHeaderInfoBar");
		}

		oRm.openEnd();

		this.renderBarControl(oRm, oPage, oSubHeader, {
			context: "subHeader",
			styleClass: bLightHeader ? "" : "sapContrastPlus"
		});

		oRm.close(sSubHeaderTag);
	};

	PageRenderer.renderChildControls = function (oRm, oPage, oLandmarkInfo) {
		oRm.openStart("section", oPage.getId() + "-cont");
		oRm.accessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "Content"));

		// ensure that the content is not included in the tab chain in FF
		// when a scroll is present, as it causes loss of the visual focus outline
		if (sap.ui.Device.browser.firefox) {
			oRm.attr("tabindex", "-1");
		}

		// The vertical scroll bar should be immediately available to avoid flickering
		// and reduce size recalculations of embedded responsive controls that rely on
		// the page content width. See ScrollEnablement.js: _setOverflow
		if (oPage.getEnableScrolling()) {
			oRm.class("sapMPageEnableScrolling");
		}

		oRm.openEnd();

		var aContent = oPage.getContent();
		var l = aContent.length;

		for (var i = 0; i < l; i++) {
			oRm.renderControl(aContent[i]);
		}

		oRm.close("section");
	};

	PageRenderer.renderFooter = function (oRm, oPage, oFooter, oLandmarkInfo) {
		var sFooterTag = oPage._getFooterTag(oLandmarkInfo);

		oRm.openStart(sFooterTag)
			.class("sapMPageFooter");

		if (!oPage.getShowFooter()) {
			oRm.class("sapUiHidden");
		}
		if (oPage.getFloatingFooter()) {
			oRm.class("sapMPageFloatingFooter");
		}

		oRm.accessibilityState(oPage, oPage._formatLandmarkInfo(oLandmarkInfo, "Footer"))
			.openEnd();

		this.renderBarControl(oRm, oPage, oFooter, {
			context : "footer"
		});

		oRm.close(sFooterTag);
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
