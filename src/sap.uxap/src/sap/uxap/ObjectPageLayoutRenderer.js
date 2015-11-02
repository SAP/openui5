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
				oIconTabBar = null;

			if (oControl.getUseIconTabBar()) {
				oIconTabBar = oControl.getAggregation("_iconTabBar");
			} else if (oControl.getShowAnchorBar() && oControl._getInternalAnchorBarVisible()) {
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

			// Header
			oRm.write("<header ");
			oRm.writeAttribute("role", "header");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-headerTitle");
			oRm.addClass("sapUxAPObjectPageHeaderTitle");
			oRm.writeClasses();
			oRm.write(">");
			if (oHeader) {
				oRm.renderControl(oHeader);
			}

			this._renderHeaderContentDOM(oRm, oControl, oControl._bHContentAlwaysExpanded, "-stickyHeaderContent", oControl._bHContentAlwaysExpanded);

			// Sticky anchorBar placeholder
			oRm.write("<div ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-stickyAnchorBar");
			oRm.addClass("sapUxAPObjectPageStickyAnchorBar");
			oRm.addClass("sapUxAPObjectPageNavigation");
			oRm.writeClasses();
			oRm.write(">");

			// if the content is expanded render bars outside the scrolling div
			this._renderAnchorBar(oRm, oControl, oIconTabBar, oAnchorBar, oControl._bHContentAlwaysExpanded);

			oRm.write("</div>");
			oRm.write("</header>");

			oRm.write("<div ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-opwrapper");
			oRm.addClass("sapUxAPObjectPageWrapper");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-scroll");
			oRm.addClass("sapUxAPObjectPageScroll");
			oRm.writeClasses();
			oRm.write(">");

			// Header Content
			this._renderHeaderContentDOM(oRm, oControl, !oControl._bHContentAlwaysExpanded, "-headerContent", true);

			// Anchor Bar
			oRm.write("<section ");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-anchorBar");
			// write ARIA role
			oRm.writeAttribute("role", "navigaiton");
			oRm.addClass("sapUxAPObjectPageNavigation");
			oRm.writeClasses();
			oRm.write(">");

			this._renderAnchorBar(oRm, oControl, oIconTabBar, oAnchorBar, !oControl._bHContentAlwaysExpanded);

			oRm.write("</section>");

			// Content section
			oRm.write("<section");
			oRm.addClass("sapUxAPObjectPageContainer");
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
			oRm.write(">");

			oRm.write("</div>");  // END scroll

			oRm.write("</div>"); // END wrapper

			oRm.write("</div>"); // END page
		};

		/**
		 * This method is called to render AnchorBar
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		ObjectPageLayoutRenderer._renderAnchorBar = function (oRm, oControl, oIconTabBar, oAnchorBar, bRender) {
			if (bRender) {
				if (oControl.getIsChildPage()) {
					oRm.write("<div ");
					oRm.writeAttributeEscaped("id", oControl.getId() + "-childPageBar");
					oRm.addClass('sapUxAPObjectChildPage');
					if (oIconTabBar) {
						oRm.addClass('sapUxAPITBar');
					}
					oRm.writeClasses();
					oRm.write("></div>");
				}

				if (oIconTabBar) {
					oRm.renderControl(oIconTabBar);
				} else if (oAnchorBar) {
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
		ObjectPageLayoutRenderer._renderHeaderContentDOM = function (oRm, oControl, bRender, sId, bRenderAlways) {
			if (bRenderAlways) {
				oRm.write("<header ");
				oRm.writeAttributeEscaped("id", oControl.getId() + sId);
				oRm.addClass("ui-helper-clearfix");
				oRm.addClass("sapUxAPObjectPageHeaderDetails");
				oRm.addClass("sapUxAPObjectPageHeaderDetailsDesign-" + oControl._getHeaderDesign());
				oRm.writeClasses();
				oRm.writeAttribute("data-sap-ui-customfastnavgroup", true);
				oRm.write(">");
				// render Header Content control
				if (bRender) {
					this.renderHeaderContent(oRm, oControl);
				}
				oRm.write("</header>");
			}
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
		 * This method is called to rerender headerContent
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
		 */
		ObjectPageLayoutRenderer._rerenderHeaderContentArea = function (oRm, oControl) {
			var sId = oControl.getId();
			this.renderHeaderContent(oRm, oControl);
			oRm.flush(jQuery.sap.byId(sId + "-headerContent")[0]);
		};


		return ObjectPageLayoutRenderer;

	}, /* bExport= */ true);
