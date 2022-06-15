/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/Device', "sap/base/Log", "sap/base/security/URLListValidator"],
	function (Device, Log, URLListValidator) {
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

			if (typeof navigator.pdfViewerEnabled !== "undefined") {
				if (navigator.pdfViewerEnabled || /HeadlessChrome/.test(window.navigator.userAgent)) {
					return bIsEnabled;
				} else {
					bIsEnabled = false;
				}
			} else {
				var aMimeTypes = navigator.mimeTypes;
				bIsEnabled = aAllowedMimeTypes.some(function (sAllowedMimeType) {
					var oMimeTypeItem = aMimeTypes.namedItem(sAllowedMimeType);
					return oMimeTypeItem !== null;
				});
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

			if (oControl._isEmbeddedModeAllowed() && this._isPdfPluginEnabled()) {
				this.renderPdfContent(oRm, oControl);
			}

			oRm.close("div");
		};

		PDFViewerRenderer._writeAccessibilityTags = function (oRm, oControl) {
			oRm.attr("role", "document");
			oRm.attr("aria-label", oControl._getLibraryResourceBundle().getText("PDF_VIEWER_ACCESSIBILITY_LABEL"));
		};

		PDFViewerRenderer.renderPdfContent = function (oRm, oControl) {

			if (oControl._shouldRenderPdfContent() && !(/HeadlessChrome/.test(window.navigator.userAgent))) {
				oRm.openStart("iframe", oControl.getId() + "-iframe");

				var sParametrizedSource = oControl.getSource();
				var iCrossPosition = oControl.getSource().indexOf("#");
				if (iCrossPosition > -1) {
					sParametrizedSource = sParametrizedSource.substr(0, iCrossPosition);
				}
				if (!(Device.browser.safari && sParametrizedSource.startsWith("blob:"))) {
					sParametrizedSource += "#view=FitH";
				}
				if (!URLListValidator.validate(sParametrizedSource)) {
					sParametrizedSource = encodeURI(sParametrizedSource);
				}

				if (URLListValidator.validate(sParametrizedSource)) {
					oRm.attr("src", sParametrizedSource);
				} else {
					oControl._fireErrorEvent();
				}

				oRm.class("sapMPDFViewerContent");
				oRm.class("sapMPDFViewerLoading");
				oRm.attr("aria-label", oControl._getLibraryResourceBundle().getText("PDF_VIEWER_CONTENT_ACCESSIBILITY_LABEL"));
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
