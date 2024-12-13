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
		var PDFViewerRenderer = {};

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

			/**
			 * Case1: If display is in Embedded Mode, PDF Plugin is disabled and is Desktop Device, We render Error Content.
			 * Case2: If display is in Embedded Mode and PDF Plugin is enabled, We render PDF Content.
			 * Case3: If display is in Embedded Mode, PDF Plugin is enabled and isTrustedSource = false, We render NonTrustedSource Content.
			 */
			var bRenderEmbededMode = (oControl._isDisplayTypeEmbedded() || oControl._isDisplayTypeAuto()) && Device.system.desktop;

			if (bRenderEmbededMode) {
				if (!this._isPdfPluginEnabled()) {
					this.renderErrorContent(oRm, oControl);
				} else if (!oControl.getIsTrustedSource()) {
					this.renderNonTrustedSourceContent(oRm, oControl);
				} else  {
					this.renderPdfContent(oRm, oControl);
				}
			}

			oRm.write("</div>");
		};

		PDFViewerRenderer._writeAccessibilityTags = function (oRm, oControl) {
			oRm.writeAttribute("role", "document");
			oRm.writeAttribute("aria-label", oControl._getLibraryResourceBundle().getText("PDF_VIEWER_ACCESSIBILITY_LABEL"));
		};

		PDFViewerRenderer.renderPdfContent = function (oRm, oControl) {
			if (oControl._shouldRenderPdfContent() && !(/HeadlessChrome/.test(window.navigator.userAgent))) {
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
				oControl._objectsRegister.getErrorPlaceholderMessagePageControl();

			oRm.write("<div");
			oRm.addClass("sapMPDFViewerError");
			if (!oControl._bIsPopupOpen) {
				oRm.addClass("sapMPDFViewerEmbeddedContent");
			}
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oErrorContent);
			oRm.write("</div>");

			if (!PDFViewerRenderer._isPdfPluginEnabled()) {
				Log.warning("Either Inline viewing of pdf is disabled or pdf plug-in is unavailable on this device.");
				oControl.fireEvent("error", {}, true);
			}
		};

		PDFViewerRenderer.renderNonTrustedSourceContent = function (oRm, oControl) {
			oRm.openStart("div");
			oRm.class("sapMPDFViewerNonTrustedMessage");
			oRm.openEnd();
			oRm.renderControl(oControl._getNonTrustedSourceMessage());
			oRm.close("div");
		};

		return PDFViewerRenderer;
	}, /* bExport= */ true);
