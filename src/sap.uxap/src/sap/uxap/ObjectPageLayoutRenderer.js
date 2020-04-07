/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device"],
	function(Device) {
		"use strict";

		/**
		 * @class ObjectPageRenderer renderer.
		 * @static
		 */
		var ObjectPageLayoutRenderer = {
			apiVersion: 2
		};

		ObjectPageLayoutRenderer.render = function (oRm, oControl) {
			var aSections,
				oHeader = oControl.getHeaderTitle(),
				oAnchorBar = null,
				oRb = sap.uxap.ObjectPageLayout._getLibraryResourceBundle(),
				bIsHeaderContentVisible = oControl.getHeaderContent() && oControl.getHeaderContent().length > 0 && oControl.getShowHeaderContent(),
				bIsTitleInHeaderContent = oControl.getShowTitleInHeaderContent() && oControl.getShowHeaderContent(),
				bRenderHeaderContent = bIsHeaderContentVisible || bIsTitleInHeaderContent,
				bUseIconTabBar = oControl.getUseIconTabBar(),
				bTitleClickable = oControl.getToggleHeaderOnTitleClick() && oControl.getHeaderTitle() && oControl.getHeaderTitle().supportsToggleHeaderOnTitleClick(),
				sRootAriaLabelText = oControl._getAriaLabelText("ROOT"),
				sHeaderAriaLabelText = oControl._getAriaLabelText("HEADER"),
				sBackgroundDesign = oControl.getBackgroundDesignAnchorBar(),
				oLandmarkInfo = oControl.getLandmarkInfo(),
				sHeaderTag = oControl._getHeaderTag(oLandmarkInfo),
				sFooterTag = oControl._getFooterTag(oLandmarkInfo),
				bHeaderRoleSet = oLandmarkInfo && oLandmarkInfo.getHeaderRole(),
				bHeaderLabelSet = oLandmarkInfo && oLandmarkInfo.getHeaderLabel(),
				bRootRoleSet = oLandmarkInfo && oLandmarkInfo.getRootRole(),
				bRootLabelSet = oLandmarkInfo && oLandmarkInfo.getRootLabel(),
				bNavigationRoleSet = oLandmarkInfo && oLandmarkInfo.getNavigationRole();

			if (oControl.getShowAnchorBar() && oControl._getInternalAnchorBarVisible()) {
				oAnchorBar = oControl.getAggregation("_anchorBar");
			}

			oRm.openStart("div", oControl);
			if (!bRootRoleSet) {
				oRm.attr("role", "main");
			}
			oRm.attr("aria-roledescription", oRb.getText("ROOT_ROLE_DESCRIPTION"));
			if (!bRootLabelSet) {
				oRm.attr("aria-label", sRootAriaLabelText);
			}
			oRm.class("sapUxAPObjectPageLayout");
			if (bTitleClickable) {
				oRm.class("sapUxAPObjectPageLayoutTitleClickEnabled");
			}

			if (!bRenderHeaderContent) {
				oRm.class("sapUxAPObjectPageLayoutNoHeaderContent");
			}

			if (!oAnchorBar || !oAnchorBar.getVisible()) {
				oRm.class("sapUxAPObjectPageLayoutNoAnchorBar");
			}

			oRm.style("height", oControl.getHeight());
			oRm.accessibilityState(oControl, oControl._formatLandmarkInfo(oLandmarkInfo, "Root"));
			oRm.openEnd();

			// custom scrollbar
			if (Device.system.desktop) {
				oRm.renderControl(oControl._getCustomScrollBar());
			}

			// Header
			oRm.openStart(sHeaderTag, oControl.getId() + "-headerTitle");
			if (!bHeaderRoleSet) {
				oRm.attr("role", "banner");
			}
			oRm.attr("aria-roledescription", oRb.getText("HEADER_ROLE_DESCRIPTION"));
			if (!bHeaderLabelSet) {
				oRm.attr("aria-label", sHeaderAriaLabelText);
			}
			oRm.attr("data-sap-ui-customfastnavgroup", true)
				.class("sapUxAPObjectPageHeaderTitle")
				.class("sapContrastPlus")
				.accessibilityState(oControl, oControl._formatLandmarkInfo(oLandmarkInfo, "Header"))
				.openEnd();

			if (oHeader) {
				oRm.renderControl(oHeader);
			}

			// Sticky Header Content
			this._renderHeaderContentDOM(oRm, oControl, bRenderHeaderContent && oControl._bHeaderInTitleArea, "-stickyHeaderContent");

			// Sticky anchorBar placeholder
			oRm.openStart("div", oControl.getId() + "-stickyAnchorBar");
			// write ARIA role
			if (!bNavigationRoleSet) {
				oRm.attr("role", "navigation");
			}
			oRm.attr("aria-roledescription", oRb.getText("NAVIGATION_ROLE_DESCRIPTION"));

			if (!oControl._bHeaderInTitleArea) {
				oRm.attr("aria-hidden", "true");
			}

			oRm.class("sapUxAPObjectPageStickyAnchorBar")
				.class("sapUxAPObjectPageNavigation")
				.class("ui-helper-clearfix");

			if (sBackgroundDesign) {
				oRm.class("sapUxAPObjectPageNavigation" + sBackgroundDesign);
			}

			oRm.accessibilityState(oControl, oControl._formatLandmarkInfo(oLandmarkInfo, "Navigation"));
			oRm.openEnd();

			// if the content is expanded render bars outside the scrolling div
			this._renderAnchorBar(oRm, oControl, oAnchorBar, oControl._bHeaderInTitleArea);

			oRm.close("div");
			oRm.close(sHeaderTag);

			oRm.openStart("div", oControl.getId() + "-opwrapper")
				.class("sapUxAPObjectPageWrapper");
			// set transform only if we don't have title arrow inside the header content, otherwise the z-index is not working
			// always set transform if showTitleInHeaderConent is not supported
			if (oHeader && (!oHeader.supportsTitleInHeaderContent() || !(oControl.getShowTitleInHeaderContent() && oHeader.getShowTitleSelector()))) {
				oRm.class("sapUxAPObjectPageWrapperTransform");
			}
			oRm.openEnd();

			oRm.openStart("div", oControl.getId() + "-scroll")
				.class("sapUxAPObjectPageScroll")
				.openEnd();

			// Header Content
			this._renderHeaderContentDOM(oRm, oControl, bRenderHeaderContent && !oControl._bHeaderInTitleArea, "-headerContent",  true);

			// Anchor Bar
			oRm.openStart("section", oControl.getId() + "-anchorBar");
			// write ARIA role
			if (!bNavigationRoleSet) {
				oRm.attr("role", "navigation");
			}
			oRm.attr("aria-roledescription", oRb.getText("NAVIGATION_ROLE_DESCRIPTION"));

			oRm.class("sapUxAPObjectPageNavigation")
				.class("ui-helper-clearfix")
				.class("sapContrastPlus");

			if (sBackgroundDesign) {
				oRm.class("sapUxAPObjectPageNavigation" + sBackgroundDesign);
			}

			oRm.accessibilityState(oControl, oControl._formatLandmarkInfo(oLandmarkInfo, "Navigation"));
			oRm.openEnd();

			this._renderAnchorBar(oRm, oControl, oAnchorBar, !oControl._bHeaderInTitleArea);

			oRm.close("section");

			// Content section
			oRm.openStart("section", oControl.getId() + "-sectionsContainer");
			oRm.class("sapUxAPObjectPageContainer");
			oRm.class("ui-helper-clearfix");
			if (!oAnchorBar) {
				oRm.class("sapUxAPObjectPageContainerNoBar");
			}
			oRm.accessibilityState(oControl, oControl._formatLandmarkInfo(oLandmarkInfo, "Content"));
			oRm.openEnd();
			aSections = oControl._getSectionsToRender();
			if (Array.isArray(aSections)) {
				aSections.forEach(function (oSection) {
					oRm.renderControl(oSection);
					if (bUseIconTabBar) {
						oControl._oCurrentTabSection = oSection;
					}
				});
			}
			oRm.close("section");

			// run hook method
			this.renderFooterContent(oRm, oControl);

			oRm.openStart("div", oControl.getId() + "-spacer")
				.openEnd()
				.close("div");

			oRm.close("div"); // END scroll

			oRm.close("div"); // END wrapper

			this._renderFooterContentInternal(oRm, oControl, sFooterTag, oLandmarkInfo, oRb);

			oRm.close("div"); // END page
		};

		/**
		 * This method is called to render AnchorBar
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		ObjectPageLayoutRenderer._renderAnchorBar = function (oRm, oControl, oAnchorBar, bRender) {
			var aSections = oControl.getAggregation("sections"),
				oHeaderContent;
			if (bRender) {
				oHeaderContent = oControl._getHeaderContent();
				if (oControl.getIsChildPage() && oHeaderContent && oHeaderContent.supportsChildPageDesign()) {
					oRm.openStart("div", oControl.getId() + "-childPageBar");
					if (Array.isArray(aSections) && aSections.length > 1) {
						oRm.class('sapUxAPObjectChildPage');
					}
					oRm.openEnd();
					oRm.close("div");
				}

				if (oAnchorBar) {
					oRm.renderControl(oAnchorBar);
				}
			}
		};

		/**
		 * This method is called to render header content DOM structure
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 * @param {boolean} bRender - shows if the control should be rendered
		 * @param {string} sId - the id of the div that should be rendered
		 * @param {boolean} bRenderAlways - shows if the DOM of the control should be rendered no matter if the control is rendered inside or not
		 */
		ObjectPageLayoutRenderer._renderHeaderContentDOM = function (oRm, oControl, bRender, sId, bApplyBelizePlusClass) {
			oRm.openStart("header", oControl.getId() + sId)
				.class("ui-helper-clearfix")
				.class("sapUxAPObjectPageHeaderDetails")
				.class("sapUxAPObjectPageHeaderDetailsDesign-" + oControl._getHeaderDesign());

			if (bApplyBelizePlusClass) {
				oRm.class("sapContrastPlus");
			}

			oRm.attr("data-sap-ui-customfastnavgroup", true)
				.openEnd();

			// render Header Content control
			if (bRender) {
				this.renderHeaderContent(oRm, oControl);
			}

			oRm.close("header");
		};

		/**
		 * This hook method is called to render objectpagelayout header content
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		ObjectPageLayoutRenderer.renderHeaderContent = function (oRm, oControl) {
			oRm.renderControl(oControl._getHeaderContent());
		};

		/**
		 * This hook method is called to render objectpagelayout footer content
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		ObjectPageLayoutRenderer.renderFooterContent = function (oRm, oControl) {

		};

		/**
		 * This internal method is called to render objectpagelayout footer content
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oObjectPageLayout an object representation of the control that should be rendered
		 */
		ObjectPageLayoutRenderer._renderFooterContentInternal = function (oRm, oObjectPageLayout, sFooterTag, oLandmarkInfo, oRb) {
			var oFooter = oObjectPageLayout.getFooter(),
				bFooterRoleSet = oLandmarkInfo && oLandmarkInfo.getFooterRole();

			if (!oFooter) {
				return;
			}
			oRm.openStart(sFooterTag, oObjectPageLayout.getId() + "-footerWrapper");
			oRm.class("sapUxAPObjectPageFooter")
				.class("sapMFooter-CTX")
				.class("sapContrast")
				.class("sapContrastPlus");

			if (!oObjectPageLayout.getShowFooter()) {
				oRm.class("sapUiHidden");
			}

			if (!bFooterRoleSet) {
				oRm.attr("role", "region");
			}
			oRm.attr("aria-roledescription", oRb.getText("FOOTER_ROLE_DESCRIPTION"));
			oRm.accessibilityState(oObjectPageLayout, oObjectPageLayout._formatLandmarkInfo(oLandmarkInfo, "Footer"));
			oRm.openEnd();
			oFooter.addStyleClass("sapUxAPObjectPageFloatingFooter");
			oRm.renderControl(oFooter);
			oRm.close(sFooterTag);
		};

		/**
		 * This method is called to rerender headerContent
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		ObjectPageLayoutRenderer._rerenderHeaderContentArea = function (oRm, oControl) {
			var sHeaderContentDOMId = oControl._bHeaderInTitleArea ? "stickyHeaderContent" : "headerContent",
			$headerContent;

			this.renderHeaderContent(oRm, oControl);
			$headerContent = oControl.$(sHeaderContentDOMId)[0];
			if ($headerContent) {
				oRm.flush($headerContent);
			}
		};


		return ObjectPageLayoutRenderer;

	}, /* bExport= */ true);