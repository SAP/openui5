/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/Device"],
	function (Device) {
		"use strict";

		/**
		 * @class ObjectPageRenderer renderer.
		 * @static
		 */
		var ObjectPageLayoutRenderer = {};

		ObjectPageLayoutRenderer.render = function (oRm, oControl) {
			var aSections,
				oHeader = oControl.getHeaderTitle(),
				oAnchorBar = null,
				bIsHeaderContentVisible = oControl.getHeaderContent() && oControl.getHeaderContent().length > 0 && oControl.getShowHeaderContent(),
				bIsTitleInHeaderContent = oControl.getShowTitleInHeaderContent() && oControl.getShowHeaderContent(),
				bRenderHeaderContent = bIsHeaderContentVisible || bIsTitleInHeaderContent,
				bUseIconTabBar = oControl.getUseIconTabBar(),
				bTitleClickable = oControl.getToggleHeaderOnTitleClick(),
				sTitleText;

			if (oControl.getShowAnchorBar() && oControl._getInternalAnchorBarVisible()) {
				oAnchorBar = oControl.getAggregation("_anchorBar");
			}

			oRm.write("<div");
			oRm.writeControlData(oControl);
			if (oHeader) {
				sTitleText = oHeader.getTitleText() || "";
				oRm.writeAttributeEscaped("aria-label", sTitleText);
			}
			oRm.addClass("sapUxAPObjectPageLayout");
			if (bTitleClickable) {
				oRm.addClass("sapUxAPObjectPageLayoutTitleClickEnabled");
			}
			if (oAnchorBar) {
				oRm.addClass("sapUxAPObjectPageLayoutWithNavigation");
			}
			oRm.writeClasses();
			oRm.addStyle("height", oControl.getHeight());
			oRm.writeStyles();
			oRm.write(">");

			// custom scrollbar
			if (Device.system.desktop) {
				oRm.renderControl(oControl._getCustomScrollBar().addStyleClass("sapUxAPObjectPageCustomScroller"));
			}

			// Header
			oRm.write("<header ");
			oRm.writeAttribute("role", "banner");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-headerTitle");
			oRm.writeAttribute("data-sap-ui-customfastnavgroup", true);
			oRm.addClass("sapUxAPObjectPageHeaderTitle");
			oRm.addClass("sapContrastPlus");
			oRm.writeClasses();
			oRm.write(">");
			if (oHeader) {
				oRm.renderControl(oHeader);
			}

			// Sticky Header Content
			this._renderHeaderContentDOM(oRm, oControl, bRenderHeaderContent && oControl._bHeaderInTitleArea, "-stickyHeaderContent");

			// Sticky anchorBar placeholder
			oRm.write("<div ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-stickyAnchorBar");
			oRm.addClass("sapUxAPObjectPageStickyAnchorBar");
			oRm.addClass("sapUxAPObjectPageNavigation");
			oRm.writeClasses();
			oRm.write(">");

			// if the content is expanded render bars outside the scrolling div
			this._renderAnchorBar(oRm, oControl, oAnchorBar, oControl._bHeaderInTitleArea);

			oRm.write("</div>");
			oRm.write("</header>");

			oRm.write("<div ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-opwrapper");
			oRm.addClass("sapUxAPObjectPageWrapper");
			// set transform only if we don't have title arrow inside the header content, otherwise the z-index is not working
			// always set transform if showTitleInHeaderConent is not supported
			if (oHeader && !oHeader.supportsTitleInHeaderContent() || !(oControl.getShowTitleInHeaderContent() && oHeader.getShowTitleSelector())) {
				oRm.addClass("sapUxAPObjectPageWrapperTransform");
			}
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-scroll");
			oRm.addClass("sapUxAPObjectPageScroll");
			oRm.writeClasses();
			oRm.write(">");

			// Header Content
			this._renderHeaderContentDOM(oRm, oControl, bRenderHeaderContent && !oControl._bHeaderInTitleArea, "-headerContent",  true);

			// Anchor Bar
			oRm.write("<section ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-anchorBar");
			// write ARIA role
			oRm.writeAttribute("role", "navigation");
			oRm.addClass("sapUxAPObjectPageNavigation");
			oRm.addClass("sapContrastPlus");
			oRm.writeClasses();
			oRm.write(">");

			this._renderAnchorBar(oRm, oControl, oAnchorBar, !oControl._bHeaderInTitleArea);

			oRm.write("</section>");

			// Content section
			oRm.write("<section");
			oRm.addClass("sapUxAPObjectPageContainer");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-sectionsContainer");
			oRm.addClass("ui-helper-clearfix");
			if (!oAnchorBar) {
				oRm.addClass("sapUxAPObjectPageContainerNoBar");
			}
			oRm.writeClasses();
			oRm.write(">");
			aSections = oControl._getSectionsToRender();
			if (jQuery.isArray(aSections)) {
				jQuery.each(aSections, function (iIndex, oSection) {
					oRm.renderControl(oSection);
					if (bUseIconTabBar) {
						oControl._oCurrentTabSection = oSection;
					}
				});
			}
			oRm.write("</section>");

			// run hook method
			this.renderFooterContent(oRm, oControl);

			oRm.write("<div");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-spacer");
			oRm.write("></div>");

			oRm.write("</div>");  // END scroll

			oRm.write("</div>"); // END wrapper
			this._renderFooterContentInternal(oRm, oControl);

			oRm.write("</div>"); // END page
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
					oRm.write("<div ");
					oRm.writeAttributeEscaped("id", oControl.getId() + "-childPageBar");
					if (jQuery.isArray(aSections) && aSections.length > 1) {
						oRm.addClass('sapUxAPObjectChildPage');
					}
					oRm.writeClasses();
					oRm.write("></div>");
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
			oRm.write("<header ");
			oRm.writeAttributeEscaped("id", oControl.getId() + sId);
			oRm.addClass("ui-helper-clearfix");
			oRm.addClass("sapUxAPObjectPageHeaderDetails");
			oRm.addClass("sapUxAPObjectPageHeaderDetailsDesign-" + oControl._getHeaderDesign());
			if (bApplyBelizePlusClass) {
				oRm.addClass("sapContrastPlus");
			}
			oRm.writeClasses();
			oRm.writeAttribute("data-sap-ui-customfastnavgroup", true);
			oRm.write(">");
			// render Header Content control
			if (bRender) {
				this.renderHeaderContent(oRm, oControl);
			}
			oRm.write("</header>");
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
		ObjectPageLayoutRenderer._renderFooterContentInternal = function (oRm, oObjectPageLayout) {
			var oFooter = oObjectPageLayout.getFooter();

			if (!oFooter) {
				return;
			}

			oRm.write("<footer");
			oRm.writeAttributeEscaped("id", oObjectPageLayout.getId() + "-footerWrapper");
			oRm.addClass("sapUxAPObjectPageFooter sapMFooter-CTX sapContrast sapContrastPlus");

			if (!oObjectPageLayout.getShowFooter()) {
				oRm.addClass("sapUiHidden");
			}

			oRm.writeClasses();
			oRm.write(">");
			oFooter.addStyleClass("sapUxAPObjectPageFloatingFooter");
			oRm.renderControl(oFooter);
			oRm.write("</footer>");
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
