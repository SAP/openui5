/*!
 * ${copyright}
 */

 /* global ActiveXObject:false */

sap.ui.define(['sap/ui/Device', "sap/base/Log"],
	function (Device, Log) {
		"use strict";

		function shouldShowToolbar(oControl) {
			return (!!oControl.getTitle() || oControl._isDisplayDownloadButton()) && !oControl._bIsPopupOpen;
		}

		var aAllowedMimeTypes = Object.freeze([
			"application/pdf",
			"application/x-google-chrome-pdf"
		]);

		/**
		 * Pdf viewer renderer.
		 * @namespace
		 */
		var PDFViewerRenderer = {
			apiVersion: 2
		};

		/**
		 * Check whether Mime type is supported
		 * @private
		 */
		PDFViewerRenderer._isSupportedMimeType = function (sMimeType) {
			var iFoundIndex = aAllowedMimeTypes.indexOf(sMimeType);
			return iFoundIndex > -1;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewerRenderer._isPdfPluginEnabled = function () {
			var bIsEnabled = true;
			if (Device.browser.firefox) {
				// https://bugzilla.mozilla.org/show_bug.cgi?id=1293406
				// mimeType is missing for firefox even though it is enabled
				return bIsEnabled;
			}

			if (Device.browser.internet_explorer) {
				// hacky code how to recognize that pdf plugin is installed and enabled
				try {
					/* eslint-disable no-new */
					new ActiveXObject("AcroPDF.PDF");
					/* eslint-enable no-new */
				} catch (e) {
					bIsEnabled = false;
				}

				return bIsEnabled;
			}

			var aMimeTypes = navigator.mimeTypes;
			if (aMimeTypes.length) {
				bIsEnabled = aAllowedMimeTypes.some(function (sAllowedMimeType) {
					var oMimeTypeItem = aMimeTypes.namedItem(sAllowedMimeType);
					return oMimeTypeItem !== null;
				});
			} else {
				//Return true if the browser is headless, since there are no plugins installed on headless browsers
				if (navigator.userAgent.match(/headless/gi)) {
					bIsEnabled = false;
				}
			}

			return bIsEnabled;
		};

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
			oRm.openStart("div", oControl);
			oRm.style("width", oControl._getRenderWidth());
			oRm.style("height", oControl._getRenderHeight());
			this._writeAccessibilityTags(oRm, oControl);
			oRm.openEnd();

			if (shouldShowToolbar(oControl)) {
				oRm.renderControl(oControl._objectsRegister.getOverflowToolbarControl());
			}

			if (oControl._isEmbeddedModeAllowed()) {
				this.renderPdfContent(oRm, oControl);
			}

			oRm.close("div");
		};

		PDFViewerRenderer._writeAccessibilityTags = function (oRm, oControl) {
			oRm.attr("role", "document");
			oRm.attr("aria-label", oControl._getLibraryResourceBundle().getText("PDF_VIEWER_ACCESSIBILITY_LABEL"));
		};

		PDFViewerRenderer.renderPdfContent = function (oRm, oControl) {
			if (oControl._shouldRenderPdfContent()) {
				oRm.openStart("iframe");
				oRm.class("sapMPDFViewerContent");
				oRm.class("sapMPDFViewerLoading");
				if (shouldShowToolbar(oControl)) {
					oRm.class("sapMPDFViewerReducedContent");
				}
				oRm.openEnd();
				oRm.close("iframe");
			} else {
				this.renderErrorContent(oRm, oControl);
				if (!PDFViewerRenderer._isPdfPluginEnabled()) {
					Log.warning("The PDF plug-in is not available on this device.");
					oControl.fireEvent("error", {}, true);
				}
			}
		};

		PDFViewerRenderer.renderErrorContent = function (oRm, oControl) {
			var oErrorContent = oControl.getErrorPlaceholder() ? oControl.getErrorPlaceholder() :
					oControl._objectsRegister.getPlaceholderMessagePageControl();

			oRm.openStart("div");
			oRm.class("sapMPDFViewerError");
			if (!oControl._bIsPopupOpen) {
				oRm.class("sapMPDFViewerEmbeddedContent");
			}
			oRm.openEnd();
			oRm.renderControl(oErrorContent);
			oRm.close("div");
		};

		return PDFViewerRenderer;
	}, /* bExport= */ true);
