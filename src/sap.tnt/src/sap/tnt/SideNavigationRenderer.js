/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/tnt/library"
], function (Lib, library) {
	"use strict";

	// shortcut for SideNavigationDesign in sap.tnt library
	const SideNavigationDesign = library.SideNavigationDesign;

	/**
	 * SideNavigation renderer.
	 * @namespace
	 */
	const SideNavigationRenderer = {
		apiVersion: 2
	};

	// load resource bundle
	const oRB = Lib.getResourceBundleFor("sap.tnt");

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.tnt.SideNavigation} oControl an object representation of the control that should be rendered
	 */
	SideNavigationRenderer.render = function (oRM, oControl) {
		this.startSideNavigation(oRM, oControl);

		this.renderFlexibleList(oRM, oControl);
		this.renderFixedList(oRM, oControl);

		this.renderFooter(oRM, oControl);

		this.endSideNavigation(oRM);
	};

	SideNavigationRenderer.startSideNavigation = function (oRM, oControl) {
		const bExpanded = oControl.getExpanded(),
			sAriaLabel = oControl.getAriaLabel(),
			sDesign = oControl.getDesign();

		oRM.openStart("nav", oControl)
			.class("sapTntSideNavigation")
			.class("sapContrast")
			.class("sapContrastPlus")
			.accessibilityState(oControl, {
				roledescription: oRB.getText("SIDENAVIGATION_ROLE_DESCRIPTION")
			})
			.attr("data-sap-ui-fastnavgroup", "true"); // Define group for F6 handling

		if (sAriaLabel) {
			oRM.accessibilityState(oControl, {
				label: sAriaLabel
			});
		}

		if (!bExpanded) {
			oRM.class("sapTntSideNavigationNotExpanded")
				.class("sapTntSideNavigationNotExpandedWidth");
		}

		if (sDesign !== SideNavigationDesign.Decorated) {
			oRM.class("sapTntSideNavigationDesignPlain");
		}

		const sWidth = oControl.getWidth();
		if (sWidth && bExpanded) {
			oRM.style("width", sWidth);
		}

		oRM.openEnd();
	};

	SideNavigationRenderer.endSideNavigation = function (oRM) {
		oRM.close("nav");
	};

	SideNavigationRenderer.renderFlexibleList = function (oRM, oControl) {
		var oFlexibleList = oControl.getItem();

		oRM.openStart("div", `${oControl.getId()}-Flexible`)
			.class("sapTntSideNavigationFlexible")
			.openEnd();

		oRM.openStart("div", `${oControl.getId()}-Flexible-Content`)
			.class("sapTntSideNavigationFlexibleContent")
			.openEnd();

		oRM.renderControl(oFlexibleList);

		oRM.close("div")
			.close("div");
	};

	SideNavigationRenderer.renderFixedList = function (oRM, oControl) {
		var oFixedList = oControl.getFixedItem();

		if (!oFixedList) {
			return;
		}

		oRM.openStart("div")
			.class("sapTntSideNavigationSeparator")
			.accessibilityState({
				role: "separator",
				roledescription: oRB.getText("SIDENAVIGATION_ROLE_DESCRIPTION_SEPARATOR"),
				orientation: "horizontal"
			})
			.openEnd()
			.close("div");

		oRM.openStart("div")
			.class("sapTntSideNavigationFixed")
			.openEnd();

		oRM.renderControl(oFixedList);

		oRM.close("div");
	};

	SideNavigationRenderer.renderFooter = function (oRM, oControl) {
		const oFooter = oControl.getAggregation("footer");
		if (!oFooter) {
			return;
		}

		oRM.openStart("footer")
			.class("sapTntSideNavigationFooter")
			.openEnd()
			.renderControl(oFooter)
			.close("footer");
	};

	return SideNavigationRenderer;
});