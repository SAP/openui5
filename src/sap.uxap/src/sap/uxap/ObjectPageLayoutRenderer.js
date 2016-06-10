/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./ObjectPageHeaderRenderer"],
	function (Renderer, ObjectPageHeaderRenderer) {
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
				bRenderHeaderContent = bIsHeaderContentVisible || bIsTitleInHeaderContent;

			if (oControl.getShowAnchorBar() && oControl._getInternalAnchorBarVisible()) {
				oAnchorBar = oControl.getAggregation("_anchorBar");
			}

			oRm.write("<div");
			oRm.writeControlData(oControl);
			if (oHeader) {
				oRm.writeAttributeEscaped("aria-label", oHeader.getObjectTitle());
			}
			oRm.addClass("sapUxAPObjectPageLayout");
			oRm.writeClasses();
			oRm.addStyle("height", oControl.getHeight());
			oRm.writeStyles();
			oRm.write(">");

            // custom scrollbar
			if (sap.ui.Device.system.desktop) {
				oRm.renderControl(oControl._getCustomScrollBar().addStyleClass("sapUxAPObjectPageCustomScroller"));
			}

			// Header
			oRm.write("<header ");
			oRm.writeAttribute("role", "header");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-headerTitle");
			oRm.addClass("sapUxAPObjectPageHeaderTitle");
			oRm.addClass("sapContrastPlus");
			oRm.writeClasses();
			oRm.write(">");
			if (oHeader) {
				oRm.renderControl(oHeader);
			}

			// Sticky Header Content
			this._renderHeaderContentDOM(oRm, oControl, bRenderHeaderContent && oControl._bHContentAlwaysExpanded, "-stickyHeaderContent");

			// Sticky anchorBar placeholder
			oRm.write("<div ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-stickyAnchorBar");
			oRm.addClass("sapUxAPObjectPageStickyAnchorBar");
			oRm.addClass("sapUxAPObjectPageNavigation");
			oRm.writeClasses();
			oRm.write(">");

			// if the content is expanded render bars outside the scrolling div
			this._renderAnchorBar(oRm, oControl, oAnchorBar, oControl._bHContentAlwaysExpanded);

			oRm.write("</div>");
			oRm.write("</header>");

			oRm.write("<div ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-opwrapper");
			oRm.addClass("sapUxAPObjectPageWrapper");
			// set transform only if we don't have title arrow inside the header content, otherwise the z-index is not working
			if (!(oControl.getShowTitleInHeaderContent() && oHeader.getShowTitleSelector())) {
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
			this._renderHeaderContentDOM(oRm, oControl, bRenderHeaderContent && !oControl._bHContentAlwaysExpanded, "-headerContent",  true);

			// Anchor Bar
			oRm.write("<section ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-anchorBar");
			// write ARIA role
			oRm.writeAttribute("role", "navigation");
			oRm.addClass("sapUxAPObjectPageNavigation");
			oRm.addClass("sapContrastPlus");
			oRm.writeClasses();
			oRm.write(">");

			this._renderAnchorBar(oRm, oControl, oAnchorBar, !oControl._bHContentAlwaysExpanded);

			oRm.write("</section>");

			// Content section
			oRm.write("<section");
			oRm.addClass("sapUxAPObjectPageContainer");
			oRm.addClass("ui-helper-clearfix");
			if (!oAnchorBar) {
				oRm.addClass("sapUxAPObjectPageContainerNoBar");
			}
			oRm.writeClasses();
			oRm.write(">");
			aSections = oControl.getAggregation("sections");
			if (jQuery.isArray(aSections)) {
				jQuery.each(aSections, function (iIndex, oSection) {
					oRm.renderControl(oSection);
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
			var aSections = oControl.getAggregation("sections");
			if (bRender) {
				if (oControl.getIsChildPage()) {
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
		 * @param bRender - shows if the control should be rendered
		 * @param sId - the id of the div that should be rendered
		 * @param bRenderAlways - shows if the DOM of the control should be rendered no matter if the control is rendered inside or not
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
			var sHeaderContentDOMId = oControl._bHContentAlwaysExpanded ? "stickyHeaderContent" : "headerContent";
			this.renderHeaderContent(oRm, oControl);
			oRm.flush(oControl.$(sHeaderContentDOMId)[0]);
		};


		return ObjectPageLayoutRenderer;

	}, /* bExport= */ true);
