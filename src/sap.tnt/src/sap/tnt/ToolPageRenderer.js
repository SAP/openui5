/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device"
], function (Device) {
	"use strict";

	/**
	 * ToolPage renderer
	 * @namespace
	 */
	var ToolPageRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.tnt.ToolPage} oControl an object representation of the control that should be rendered
	 */
	ToolPageRenderer.render = function (oRM, oControl) {
		oRM.openStart("div", oControl)
			.class("sapTntToolPage")
			.openEnd();

		this.renderHeaderWrapper(oRM, oControl);

		this.renderContentWrapper(oRM, oControl);

		oRM.close("div");
	};

	ToolPageRenderer.renderHeaderWrapper = function (oRM, oControl) {
		var oHeader = oControl.getHeader(),
			oSubHeader = oControl.getSubHeader();

		if (oHeader || oSubHeader) {
			oRM.openStart("div")
				.class("sapTntToolPageHeaderWrapper")
				.openEnd();
		}

		if (oHeader) {
			oRM.openStart("header").openEnd();

				oRM.openStart("div", oControl.getId() + "-header")
					.class("sapTntToolPageHeader")
					.openEnd();

				oRM.renderControl(oHeader);

				oRM.close("div");

			oRM.close("header");
		}

		if (oSubHeader && oSubHeader.getVisible()) {
			oRM.openStart("header").openEnd();

				oRM.openStart("div", oControl.getId() + "-subHeader")
					.class("sapTntToolPageHeader")
					.openEnd();

				oRM.renderControl(oSubHeader);

				oRM.close("div");

			oRM.close("header");
		}

		if (oHeader || oSubHeader) {
			oRM.close("div");
		}

	};

	ToolPageRenderer.renderContentWrapper = function (oRM, oControl) {
		oRM.openStart("div").class("sapTntToolPageContentWrapper");

		if (!Device.system.desktop || !oControl.getSideExpanded()) {
			oRM.class("sapTntToolPageAsideCollapsed");
		}

		oRM.openEnd();

		this.renderAsideContent(oRM, oControl);
		this.renderMainContent(oRM, oControl);

		oRM.close("div");
	};

	ToolPageRenderer.renderAsideContent = function (oRM, oControl) {
		var oSideContent = oControl.getSideContent();
		if (!oSideContent || !oSideContent.getVisible()) {
			return;
		}

		oRM.openStart("aside", oControl.getId() + "-aside").class("sapTntToolPageAside").openEnd();

			oRM.openStart("div").class("sapTntToolPageAsideContent").openEnd();

			var bSideExpanded = oControl.getSideExpanded();
			if (oSideContent && oSideContent.getExpanded() !== bSideExpanded) {
				oSideContent.setExpanded(bSideExpanded);
			}

			if (!Device.system.desktop) {
				oControl.setSideExpanded(false);
			}

			// The render of the aggregation should be after the above statement,
			// due to class manipulations inside the aggregation.
			oRM.renderControl(oSideContent);

			oRM.close("div");

		oRM.close("aside");
	};

	ToolPageRenderer.renderMainContent = function (oRM, oControl) {
		var aMainContent = oControl.getMainContents();
		if (!aMainContent) {
			return;
		}

		oRM.openStart("div", oControl.getId() + "-main").class("sapTntToolPageMain").openEnd();

			oRM.openStart("div").class("sapTntToolPageMainContent").openEnd();

				oRM.openStart("div").class("sapTntToolPageMainContentWrapper").openEnd();

				aMainContent.forEach(oRM.renderControl, oRM);

				oRM.close("div");

			oRM.close("div");

		oRM.close("div");
	};

	return ToolPageRenderer;
}, /* bExport= */ true);