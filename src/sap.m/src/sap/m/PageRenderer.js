/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/m/PageAccessibleLandmarkInfo'],
	function(jQuery, PageAccessibleLandmarkInfo) {
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
	 * @param {sap.ui.core.Control} oPage an object representation of the control that should be rendered
	 */
	PageRenderer.render = function(oRm, oPage) {
		var oHeader = null,
			oFooter = null,
			oSubHeader = null,
			sEnableScrolling = oPage.getEnableScrolling() ? " sapMPageScrollEnabled" : "";

		if (oPage.getShowHeader()) {
			oHeader = oPage._getAnyHeader();
		}

		if (oPage.getShowSubHeader()) {
			oSubHeader = oPage.getSubHeader();
		}

		if (oPage.getShowFooter()) {
			oFooter = oPage.getFooter();
		}
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

		if (oFooter) {
			// it is used in the PopOver to remove additional margin bottom for page with footer
			oRm.addClass("sapMPageWithFooter");
		}

		if (!oPage.getContentOnlyBusy()) {
			oRm.addClass("sapMPageBusyCoversAll");
		}

		oRm.writeClasses();

		var sTooltip = oPage.getTooltip_AsString();

		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}

		PageAccessibleLandmarkInfo._writeLandmarkInfo(oRm, oPage, "root");

		oRm.write(">");

		//render headers
		this.renderBarControl(oRm, oPage, oHeader, {
			context : "header",
			styleClass : "sapMPageHeader"
		});

		this.renderBarControl(oRm, oPage, oSubHeader, {
			context : "subHeader",
			styleClass : "sapMPageSubHeader"
		});

		// render child controls
		oRm.write('<section id="' + oPage.getId() + '-cont"');
		PageAccessibleLandmarkInfo._writeLandmarkInfo(oRm, oPage, "content");
		oRm.write('>');

		if (oPage._bUseScrollDiv) { // fallback to old rendering
			oRm.write('<div id="' + oPage.getId() + '-scroll" class="sapMPageScroll' + sEnableScrolling + '">');
		}

		var aContent = oPage.getContent();
		var l = aContent.length;

		for (var i = 0; i < l; i++) {
			oRm.renderControl(aContent[i]);
		}

		if (oPage._bUseScrollDiv) { // fallback to old rendering
			oRm.write("</div>");
		}

		oRm.write("</section>");

		// render footer Element
		this.renderBarControl(oRm, oPage, oFooter, {
			context : "footer",
			styleClass : "sapMPageFooter"
		});

		oRm.write("</div>");
	};

	/**
	 * Renders the bar control if it is defined. Also adds classes to it.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.IBar} oBarControl the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {object} oOptions object containing the tag, contextClass and styleClass added to the bar
	 */
	PageRenderer.renderBarControl = function (oRm, oPage, oBarControl, oOptions) {
		if (!oBarControl) {
			return;
		}

		oBarControl.applyTagAndContextClassFor(oOptions.context.toLowerCase());

		oBarControl._setLandmarkInfo(oPage.getLandmarkInfo(), oOptions.context);

		oBarControl.addStyleClass(oOptions.styleClass);

		oRm.renderControl(oBarControl);
	};

	return PageRenderer;

}, /* bExport= */ true);
