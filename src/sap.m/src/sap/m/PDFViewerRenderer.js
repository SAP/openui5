/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/PDFViewer"
	],

	function (PDFViewer) {
		"use strict";

		function shouldShowToolbar(oControl) {
			return (!!oControl.getTitle() || oControl.getShowDownloadButton()) && !oControl._bIsPopupOpen;
		}

		/**
		 * Pdf viewer renderer.
		 * @namespace
		 */
		var PDFViewerRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm
		 *            the RenderManager that can be used for writing to
		 *            the Render-Output-Buffer
		 * @param {sap.m.PDFViewer} oControl
		 *            the PdfViewer component to be rendered
		 */
		PDFViewerRenderer.render = function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addStyle("width", oControl._getRenderWidth());
			oRm.addStyle("height", oControl._getRenderHeight());
			oRm.writeStyles();
			oRm.writeClasses();
			this._writeAccessibilityTags(oRm, oControl);
			oRm.write(">");

			if (shouldShowToolbar(oControl)) {
				oRm.renderControl(oControl._objectsRegister.getOverflowToolbarControl());
			}

			if (oControl._isSourceValidToDisplay() && oControl._isEmbeddedModeAllowed() && PDFViewer._isPdfPluginEnabled()) {
				this.renderPdfContent(oRm, oControl);
			}

			oRm.write("</div>");
		};

		PDFViewerRenderer._writeAccessibilityTags = function (oRm, oControl) {
			oRm.writeAttribute("role", "document");
			oRm.writeAttribute("aria-label", oControl._getLibraryResourceBundle().getText("PDF_VIEWER_ACCESSIBILITY_LABEL"));
		};

		PDFViewerRenderer.renderPdfContent = function (oRm, oControl) {
			if (oControl._shouldRenderPdfContent()) {
				oRm.write("<iframe");
				oRm.addClass("sapMPDFViewerContent");
				oRm.addClass("sapMPDFViewerLoading");
				if (shouldShowToolbar(oControl)) {
					oRm.addClass("sapMPDFViewerReducedContent");
				}
				oRm.writeClasses();
				oRm.write(">");
				oRm.write("</iframe>");
			} else {
				this.renderErrorContent(oRm, oControl);
			}
		};

		PDFViewerRenderer.renderErrorContent = function (oRm, oControl) {
			var oErrorContent = oControl.getErrorPlaceholder() ? oControl.getErrorPlaceholder() :
					oControl._objectsRegister.getPlaceholderMessagePageControl();

			oRm.write("<div");
			oRm.addClass("sapMPDFViewerError");
			if (!oControl._bIsPopupOpen) {
				oRm.addClass("sapMPDFViewerEmbeddedContent");
			}
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oErrorContent);
			oRm.write("</div>");
		};

		return PDFViewerRenderer;
	}, /* bExport= */ true);
