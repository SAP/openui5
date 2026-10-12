/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/tnt/library",
	"sap/ui/core/InvisibleText"
], function (Lib, library, InvisibleText) {
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

		this.renderFilterSection(oRM, oControl);

		this.startNavigation(oRM, oControl);

		this.renderFlexibleList(oRM, oControl);
		this.renderFixedList(oRM, oControl);

		this.endNavigation(oRM);

		this.renderFooter(oRM, oControl);

		this.endSideNavigation(oRM);
	};

	SideNavigationRenderer.startSideNavigation = function (oRM, oControl) {
		const bExpanded = oControl.getExpanded(),
			sDesign = oControl.getDesign();

		// The outer element is a plain container, not a landmark. The real navigation
		// landmark is the <div role="navigation"> rendered below the search field (see
		// startNavigation), so the search field is not part of any navigation landmark.
		oRM.openStart("div", oControl)
			.class("sapTntSideNavigation")
			.class("sapContrast")
			.class("sapContrastPlus")
			.attr("data-sap-ui-fastnavgroup", "true"); // Define group for F6 handling

		if (!bExpanded) {
			oRM.class("sapTntSideNavigationNotExpanded")
				.class("sapTntSideNavigationNotExpandedWidth");
		}

		if (sDesign !== SideNavigationDesign.Decorated) {
			oRM.class("sapTntSideNavigationDesignPlain");
		}

		const sWidth = oControl.getWidth();

		if (sWidth) {
			oRM.style("--sapTntSideNavigation_ExpandedWidth", sWidth);
		}

		oRM.openEnd();
	};

	SideNavigationRenderer.endSideNavigation = function (oRM) {
		oRM.close("div");
	};

	/**
	 * Opens the navigation landmark that wraps the navigation lists. This landmark sits
	 * below the search field (so the search is not part of it) and carries the accessible
	 * label and description of the navigation. During an active search the flexible list is
	 * merged by the application and rendered as the single list inside this landmark.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager
	 * @param {sap.tnt.SideNavigation} oControl the SideNavigation control
	 */
	SideNavigationRenderer.startNavigation = function (oRM, oControl) {
		const bExpanded = oControl.getExpanded(),
			sAriaLabel = oControl.getAriaLabel();

		oRM.openStart("div", `${oControl.getId()}-navigation`)
			.class("sapTntSideNavigationNavigation")
			.accessibilityState({
				role: "navigation",
				label: sAriaLabel || oRB.getText(bExpanded ? "SIDE_NAVIGATION_LABEL_EXPANDED" : "SIDE_NAVIGATION_LABEL_COLLAPSED"),
				describedby: InvisibleText.getStaticId("sap.tnt", "SIDE_NAVIGATION_DESCRIPTION")
			})
			.openEnd();
	};

	SideNavigationRenderer.endNavigation = function (oRM) {
		oRM.close("div");
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

		// The separator is always rendered. When the fixed list is empty - for example because the
		// application merged everything into the flexible list during a search - the separator and
		// the empty fixed list are hidden via CSS so nothing floats above an empty region.
		oRM.openStart("div")
			.class("sapTntSideNavigationSeparator")
			.accessibilityState({
				role: "separator",
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

	SideNavigationRenderer.renderFilterSection = function (oRM, oControl) {
		if (!oControl.getExpanded()) {
			return;
		}

		const oFilterSection = oControl.getAggregation("filterSection");
		if (!oFilterSection) {
			return;
		}

		oRM.openStart("div")
			.class("sapTntSideNavigationFilterSection")
			.openEnd()
			.renderControl(oFilterSection)
			.close("div");
	};

	return SideNavigationRenderer;
}, /* bExport= */ true);