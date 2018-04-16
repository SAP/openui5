/*!
 * ${copyright}
 */

/* global ActiveXObject:false */

// Provides control sap.m.PDFViewer.
sap.ui.define([
		"jquery.sap.global",
		"./library",
		"sap/ui/core/Control",
		"sap/ui/Device",
		"sap/m/PDFViewerRenderManager",
		"sap/m/MessageBox"
	],
	function (jQuery, library, Control, Device, PDFViewerRenderManager, MessageBox) {
		"use strict";

		var aAllowedMimeTypes = Object.freeze([
			"application/pdf",
			"application/x-google-chrome-pdf"
		]);

		function isSupportedMimeType(sMimeType) {
			var iFoundIndex = aAllowedMimeTypes.indexOf(sMimeType);
			return iFoundIndex > -1;
		}

		/**
		 * Definition of PDFViewer control
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * This control enables you to display PDF documents within your app.
		 * It can be embedded in your user interface layout, or you can set it to open in a popup dialog.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.48
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.PDFViewer
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var PDFViewer = Control.extend("sap.m.PDFViewer",
			/** @lends sap.m.PDFViewer.prototype */
			{
				metadata: {
					library: "sap.m",
					properties: {
						/**
						 * Defines the height of the PDF viewer control, respective to the height of
						 * the parent container. Can be set to a percent, pixel, or em value.
						 */
						height: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%"},
						/**
						 * Defines the width of the PDF viewer control, respective to the width of the
						 * parent container. Can be set to a percent, pixel, or em value.
						 */
						width: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%"},
						/**
						 * Specifies the path to the PDF file to display. Can be set to a relative or
						 * an absolute path.
						 */
						source: {type: "sap.ui.core.URI", group: "Misc", defaultValue: null},
						/**
						 * A custom error message that is displayed when the PDF file cannot be loaded.
						 * @deprecated As of version 1.50.0, replaced by {@link sap.m.PDFViewer#getErrorPlaceholderMessage}.
						 */
						errorMessage: {type: "string", group: "Misc", defaultValue: null, deprecated: true},
						/**
						 * A custom text that is displayed instead of the PDF file content when the PDF
						 * file cannot be loaded.
						 */
						errorPlaceholderMessage: {type: "string", group: "Misc", defaultValue: null},
						/**
						 * A custom title for the PDF viewer popup dialog. Works only if the PDF viewer
						 * is set to open in a popup dialog.
						 * @deprecated As of version 1.50.0, replaced by {@link sap.m.PDFViewer#getTitle()}.
						 */
						popupHeaderTitle: {type: "string", group: "Misc", defaultValue: null, deprecated: true},

						/**
						 * A custom title for the PDF viewer.
						 */
						title: {type: "string", group: "Misc", defaultValue: null},

						/**
						* Shows or hides the download button.
						*/
						showDownloadButton: {type: "boolean", group: "Misc", defaultValue: true}
					},
					aggregations: {
						/**
						 * A custom control that can be used instead of the error message specified by the
						 * errorPlaceholderMessage property.
						 */
						errorPlaceholder: {type: "sap.ui.core.Control", multiple: false},
						/**
						 * A multiple aggregation for buttons that can be added to the footer of the popup
						 * dialog. Works only if the PDF viewer is set to open in a popup dialog.
						 */
						popupButtons: {type: "sap.m.Button", multiple: true, singularName: "popupButton"}
					},
					events: {
						/**
						 * This event is fired when a PDF file is loaded. If the PDF is loaded in smaller chunks,
						 * this event is fired as often as defined by the browser's plugin. This may happen after
						 * a couple chunks are processed.
						 */
						loaded: {},
						/**
						 * This event is fired when there is an error loading the PDF file.
						 */
						error: {},
						/**
						 * This event is fired when the PDF viewer control cannot check the loaded content. For
						 * example, the default configuration of the Mozilla Firefox browser may not allow checking
						 * the loaded content. This may also happen when the source PDF file is stored in a different
						 * domain.
						 * If you want no error message to be displayed when this event is fired, call the
						 * preventDefault() method inside the event handler.
						 */
						sourceValidationFailed: {}
					}
				}
			});

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer._isPdfPluginEnabled = function () {
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
			bIsEnabled = aAllowedMimeTypes.some(function (sAllowedMimeType) {
				var oMimeTypeItem = aMimeTypes.namedItem(sAllowedMimeType);
				return oMimeTypeItem !== null;
			});

			return bIsEnabled;
		};

		/**
		 * Lifecycle method
		 *
		 * @private
		 */
		PDFViewer.prototype.init = function () {
			// helper object that holds the references of nested objects
			this._objectsRegister = {};

			// state variable that shows the state of popup (rendering of pdf in popup requires it)
			this._bIsPopupOpen = false;

			this._initPopupControl();
			this._initPopupDownloadButtonControl();
			this._initPlaceholderMessagePageControl();
			this._initToolbarDownloadButtonControl();
			this._initOverflowToolbarControl();

			this._initControlState();
		};

		/**
		 * Setup state variables to default state
		 *
		 * @private
		 */
		PDFViewer.prototype._initControlState = function () {
			// state property that control if the embedded pdf should or should not rendered.
			this._bRenderPdfContent = true;

			// detect that beforeunload was fired (IE only)
			this._bOnBeforeUnloadFired = false;
		};

		PDFViewer.prototype.setWidth = function (sWidth) {
			this.setProperty("width", sWidth, true);
			var oDomRef = this.$();
			if (oDomRef === null) {
				return this;
			}

			oDomRef.css("width", this._getRenderWidth());
			return this;
		};

		PDFViewer.prototype.setHeight = function (sHeight) {
			this.setProperty("height", sHeight, true);
			var oDomRef = this.$();
			if (oDomRef === null) {
				return this;
			}

			oDomRef.css("height", this._getRenderHeight());
			return this;
		};

		PDFViewer.prototype.onBeforeRendering = function () {
			// IE things
			// because of the detecting error state in IE (double call of unload listener)
			// it is important to reset the flag before each render
			// otherwise it wrongly detects error state (the unload listener is called once even in valid use case)
			this._bOnBeforeUnloadFired = false;
		};

		/**
		 * Lifecycle method
		 *
		 * @private
		 */
		PDFViewer.prototype.onAfterRendering = function () {
			var fnInitIframeElement = function () {
				// cant use attachBrowserEvent because it attach event to component root node (this.$())
				// load event does not bubble so it has to be bind directly to iframe element
				var oIframeElement = this._getIframeDOMElement();
				var oIframeContentWindow = jQuery(oIframeElement.get(0).contentWindow);

				if (Device.browser.internet_explorer) {
					// being special does not mean useful
					// https://connect.microsoft.com/IE/feedback/details/809377/ie-11-load-event-doesnt-fired-for-pdf-in-iframe

					// onerror does not works on IE. Therefore readyonstatechange and unload events are used for error detection.
					// When invalid response is received (404, etc.), readystatechange is not fired but unload is.
					// When valid response is received, then readystatechange and 'complete' state of target's element is received.
					oIframeContentWindow.on("beforeunload", this._onBeforeUnloadListener.bind(this));
					oIframeContentWindow.on("readystatechange", this._onReadyStateChangeListener.bind(this));

					// some error codes load html file and fires loadEvent
					oIframeElement.on("load", this._onLoadIEListener.bind(this));
				} else {
					// normal browsers supports load events as specification said
					oIframeElement.on("load", this._onLoadListener.bind(this));
				}
				oIframeElement.on("error", this._onErrorListener.bind(this));

				var sParametrizedSource = this.getSource();
				var iCrossPosition = this.getSource().indexOf("#");
				if (iCrossPosition > -1) {
					sParametrizedSource = sParametrizedSource.substr(0, iCrossPosition);
				}
				sParametrizedSource += "#view=FitH";
				if (!jQuery.sap.validateUrl(sParametrizedSource)) {
					sParametrizedSource = encodeURI(sParametrizedSource);
				}

				if (jQuery.sap.validateUrl(sParametrizedSource)) {
					oIframeElement.attr("src", sParametrizedSource);
				} else {
					this._fireErrorEvent();
				}
			}.bind(this);

			try {
				this.setBusy(true);
				fnInitIframeElement();
			} catch (error) {
				this.setBusy(false);
			}
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._fireErrorEvent = function () {
			this._renderErrorState();
			this.fireEvent("error", {}, true);
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._renderErrorState = function () {
			var oDownloadButton = this._objectsRegister.getToolbarDownloadButtonControl();
			oDownloadButton.setEnabled(false);

			var oDownloadButton = this._objectsRegister.getPopupDownloadButtonControl();
			oDownloadButton.setEnabled(false);

			this.setBusy(false);
			this._bRenderPdfContent = false;
			// calls controls invalidate because the error state should be render.
			// It is controlled by the state variable called _bRenderPdfContent
			// The main invalidate set the state of the control to the default and tries to load and render pdf
			Control.prototype.invalidate.call(this);
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._fireLoadedEvent = function () {
			this._bRenderPdfContent = true;
			this.setBusy(false);
			try {
				this._getIframeDOMElement().removeClass("sapMPDFViewerLoading");
			} catch (err) {
				jQuery.log.fatal("Iframe not founded in loaded event");
				jQuery.log.fatal(err);
			}
			this.fireEvent("loaded");
		};

		/**
		 * @param oEvent
		 * @private
		 */
		PDFViewer.prototype._onLoadListener = function (oEvent) {
			try {
				var oTarget = jQuery(oEvent.target),
					bContinue = true;
				// Firefox
				// https://bugzilla.mozilla.org/show_bug.cgi?id=911444
				// because of the embedded pdf plugin in firefox it is not possible to check contentType of the iframe document
				// if the content is pdf. If the content is not a pdf and it is from the same origin, it can be accessed.
				// Other browsers allow access to the mimeType of the iframe's document if the content is from the same origin.
				var sCurrentContentType = "application/pdf";
				try {
					// browsers render pdf in iframe as html page with embed tag
					var aEmbeds = oTarget[0].contentWindow.document.embeds;
					bContinue = !!aEmbeds && aEmbeds.length === 1;
					if (bContinue) {
						sCurrentContentType = aEmbeds[0].attributes.getNamedItem("type").value;
					}
				} catch (error) {
					// even though the sourceValidationFailed event is fired, the default behaviour is to continue.
					// when preventDefault is on event object is called, the rendering ends up with error
					if (!Device.browser.firefox && this.fireEvent("sourceValidationFailed", {}, true)) {
						this._showMessageBox();
						return;
					}
				}

				if (bContinue && isSupportedMimeType(sCurrentContentType)) {
					this._fireLoadedEvent();
				} else {
					this._fireErrorEvent();
				}
			} catch (error) {
				jQuery.sap.log.fatal(false, "Fatal error during the handling of load event happened.");
				jQuery.sap.log.fatal(false, error.message);
			}
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._onErrorListener = function () {
			this._fireErrorEvent();
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._onReadyStateChangeListener = function (oEvent) {
			var INTERACTIVE_READY_STATE = "interactive";
			var COMPLETE_READY_STATE = "complete";

			switch (oEvent.target.readyState) {
				case INTERACTIVE_READY_STATE: // IE11 only fires interactive
				case COMPLETE_READY_STATE:
					// iframe content is not loaded when interactive ready state is fired
					// even though complete ready state should be fired. We were not able to simulate firing complete ready state
					// on IE. Therefore the validation of source is not possible.
					this._fireLoadedEvent();
					break;
			}
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._onBeforeUnloadListener = function () {
			// IE problems
			// when invalid response is received (404), beforeunload is fired twice
			if (this._bOnBeforeUnloadFired) {
				this._fireErrorEvent();
				return;
			}

			this._bOnBeforeUnloadFired = true;
		};

		/**
		 * @param oEvent
		 * @private
		 */
		PDFViewer.prototype._onLoadIEListener = function (oEvent) {
			try {
				// because of asynchronity of events, IE sometimes fires load event even after it unloads the content.
				// The contentWindow does not exists in these moments. On the other hand, the error state is already handled
				// by onBeforeUnloadListener, so we only need catch for catching the error and then return.
				// The problem is not with null reference. The access of the contentWindow sometimes fires 'access denied' error
				// which is not detectable otherwise.
				var sCurrentContentType = oEvent.currentTarget.contentWindow.document.mimeType;
			} catch (err) {
				return;
			}

			if (!isSupportedMimeType(sCurrentContentType)) {
				this._fireErrorEvent();
			}
		};

		/**
		 * Downloads the PDF file.
		 *
		 * @public
		 */
		PDFViewer.prototype.downloadPDF = function () {
			var oWindow = window.open(this.getSource());
			oWindow.focus();
		};

		/**
		 * @param string oClickedButtonId
		 * @private
		 */
		PDFViewer.prototype._onSourceValidationErrorMessageBoxCloseListener = function (oClickedButtonId) {
			if (oClickedButtonId === MessageBox.Action.CANCEL) {
				this._renderErrorState();
			} else {
				this._fireLoadedEvent();
			}

		};

		/**
		 * @param oEvent
		 * @private
		 */
		PDFViewer.prototype._onAfterPopupClose = function (oEvent) {
			var oPopup = this._objectsRegister.getPopup();
			// content has to be cleared from dom
			oPopup.removeAllContent();
			this._bIsPopupOpen = false;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._shouldRenderPdfContent = function () {
			return PDFViewer._isPdfPluginEnabled() && this._bRenderPdfContent && this.getSource() !== null;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isSourceValidToDisplay = function () {
			var sSource = this.getSource();
			return sSource !== null && sSource !== "" && typeof sSource !== "undefined";
		};

		/**
		 * Triggers rerendering of this element and its children.
		 *
		 * @param {sap.ui.base.ManagedObject} [oOrigin] Child control for which the method was called
		 *
		 * @public
		 */
		PDFViewer.prototype.invalidate = function (oOrigin) {
			this._initControlState();
			Control.prototype.invalidate.call(this, oOrigin);
		};

		/**
		 * Opens the PDF viewer in a popup dialog.
		 *
		 * @public
		 */
		PDFViewer.prototype.open = function () {
			if (!this._isSourceValidToDisplay()) {
				jQuery.sap.assert(false, "The PDF file cannot be opened with the given source. Given source: " + this.getSource());
				return;
			}

			if (this._isEmbeddedModeAllowed()) {
				this._openOnDesktop();
			} else {
				this._openOnMobile();
			}
		};

		/**
		 * Handles opening on desktop devices
		 * @private
		 */
		PDFViewer.prototype._openOnDesktop = function () {
			var oPopup = this._objectsRegister.getPopup();

			if (this._bIsPopupOpen) {
				return;
			}

			this._initControlState();
			this._preparePopup(oPopup);
			oPopup.addContent(this);

			this._bIsPopupOpen = true;
			oPopup.open();
		};

		/**
		 * Handles opening on mobile/tablet devices
		 * @private
		 */
		PDFViewer.prototype._openOnMobile = function () {
			var oWindow = window.open(this.getSource());
			oWindow.focus();
		};

		/**
		 * Gets the iframe element from rendered DOM
		 * @returns {*} jQuery object of iframe
		 * @private
		 */
		PDFViewer.prototype._getIframeDOMElement = function () {
			var oIframeElement = this.$().find("iframe");
			if (oIframeElement.length === 0) {
				throw Error("Underlying iframe was not found in DOM.");
			}
			if (oIframeElement.length > 1) {
				jQuery.sap.log.fatal("Initialization of iframe fails. Reason: the control somehow renders multiple iframes");
			}
			return oIframeElement;
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._isEmbeddedModeAllowed = function () {
			return Device.system.desktop;
		};

		/**
		 * @returns {jQuery.sap.util.ResourceBundle}
		 * @private
		 */
		PDFViewer.prototype._getLibraryResourceBundle = function () {
			return sap.ui.getCore().getLibraryResourceBundle("sap.m");
		};

		/**
		 * @returns {string}
		 * @private
		 */
		PDFViewer.prototype._getMessagePageErrorMessage = function () {
			return this.getErrorPlaceholderMessage() ? this.getErrorPlaceholderMessage() :
				this._getLibraryResourceBundle().getText("PDF_VIEWER_PLACEHOLDER_ERROR_TEXT");
		};

		/**
		 * @returns {string}
		 * @private
		 */
		PDFViewer.prototype._getRenderWidth = function () {
			return this._bIsPopupOpen ? '100%' : this.getWidth();
		};

		/**
		 * @returns {string}
		 * @private
		 */
		PDFViewer.prototype._getRenderHeight = function () {
			return this._bIsPopupOpen ? '100%' : this.getHeight();
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._showMessageBox = function () {
			MessageBox.show(this._getLibraryResourceBundle().getText("PDF_VIEWER_SOURCE_VALIDATION_MESSAGE_TEXT"), {
				icon: MessageBox.Icon.WARNING,
				title: this._getLibraryResourceBundle().getText("PDF_VIEWER_SOURCE_VALIDATION_MESSAGE_HEADER"),
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				defaultAction: MessageBox.Action.CANCEL,
				id: this.getId() + "-validationErrorSourceMessageBox",
				styleClass: "sapUiSizeCompact",
				contentWidth: '100px',
				onClose: this._onSourceValidationErrorMessageBoxCloseListener.bind(this)
			});
		};

		/**
		 * Lifecycle method
		 * @private
		 */
		PDFViewer.prototype.exit = function () {
			jQuery.each(this._objectsRegister, function (iIndex, fnGetObject) {
				var oObject = fnGetObject(true);
				if (oObject) {
					oObject.destroy();
				}
			});
		};

		PDFViewerRenderManager.extendPdfViewer(PDFViewer);

		return PDFViewer;
	});
