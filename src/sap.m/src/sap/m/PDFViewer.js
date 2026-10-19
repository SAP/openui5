/*!
 * ${copyright}
 */

// Provides control sap.m.PDFViewer.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/m/PDFViewerRenderManager",
	"sap/m/PDFViewerRenderer",
	"sap/base/Log",
	"sap/base/assert",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Lib"
],
	function (
		library,
		Control,
		Device,
		PDFViewerRenderManager,
		PDFViewerRenderer,
		Log,
		assert,
		jQuery,
		CoreLib
	) {
		"use strict";

		var PDFViewerDisplayType = library.PDFViewerDisplayType;

		/**
		 * Definition of PDFViewer control
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * <p>This control enables you to display PDF documents within your app.
		 * It can be embedded in your user interface layout, or you can set it to open in a popup dialog.</p>
		 * <p>Please note that the PDF Viewer control can be fully displayed on desktop devices only. On mobile
		 * devices, only the toolbar with a download button is visible.</p>
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.48
		 *
		 * @constructor
		 * @public
		 * @alias sap.m.PDFViewer
		 * @see {@link topic:cd80a8bca4ac450b86547d78f0653330 PDF Viewer}
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
						height: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%" },
						/**
						 * Defines the width of the PDF viewer control, respective to the width of the
						 * parent container. Can be set to a percent, pixel, or em value.
						 */
						width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%" },
						/**
						 * Specifies the path to the PDF file to display. Can be set to a relative or
						 * an absolute path.<br>
						 * Optionally, this property can also be set to a data URI path or a blob URL, provided
						 * that this data URI or blob URL is allowed in advance. For more information about
						 * URL filtering, see {@link topic:91f3768f6f4d1014b6dd926db0e91070 URLList Validator Filtering}.
						 *
						 * <h3>Source Validation</h3>
						 * When the source is set, the PDFViewer automatically validates the resource using a GET request
						 * to ensure it exists and is accessible. This validation:
						 * <ul>
						 * <li>Prevents loading invalid or non-existent PDF files</li>
						 * <li>If validation fails, error content is displayed instead of attempting PDF load</li>
						 * </ul>
						 */
						source: { type: "sap.ui.core.URI", group: "Misc", defaultValue: null },
						/**
						 * A custom error message that is displayed when the PDF file cannot be loaded.
						 * @deprecated As of version 1.50.0, replaced by {@link sap.m.PDFViewer#getErrorPlaceholderMessage}.
						 */
						errorMessage: { type: "string", group: "Misc", defaultValue: null, deprecated: true },
						/**
						 * A custom text that is displayed instead of the PDF file content when the PDF
						 * file cannot be loaded.
						 */
						errorPlaceholderMessage: { type: "string", group: "Misc", defaultValue: null },
						/**
						 * A custom title for the PDF viewer popup dialog. Works only if the PDF viewer
						 * is set to open in a popup dialog.
						 * @deprecated As of version 1.50.0, replaced by {@link sap.m.PDFViewer#getTitle}.
						 */
						popupHeaderTitle: { type: "string", group: "Misc", defaultValue: null, deprecated: true },

						/**
						 * A custom title for the PDF viewer.
						 */
						title: { type: "string", group: "Misc", defaultValue: null },

						/**
						* Shows or hides the download button.
						*/
						showDownloadButton: { type: "boolean", group: "Misc", defaultValue: true },

						/**
						* Defines how the PDF viewer should be displayed.
						* <ul>
						* <li>If set to <code>Link</code>, the PDF viewer appears as a toolbar with a download
						* button that can be used to download the PDF file.<br>
						* When the {@link #open} method is called, the user can either open the PDF file in a
						* new tab or download it.</li>
						* <li>If set to <code>Embedded</code>, the PDF viewer appears embedded in the parent
						* container and displays either the PDF document or the message defined by the
						* <code>errorPlaceholderMessage</code> property.</li>
						* <li>If set to <code>Auto</code>, the appearance of the PDF viewer depends on the
						* device being used:
						* <ul>
						* <li>On mobile devices (phones, tablets), the PDF viewer appears as a toolbar with
						* a download button.</li>
						* <li>On desktop devices, the PDF viewer is embedded in its parent container.</li>
						* </ul>
						* </li>
						* </ul>
						*/
						displayType: { type: "sap.m.PDFViewerDisplayType", group: "Misc", defaultValue: PDFViewerDisplayType.Auto },
						/**
						 * Parameter to determine if the given PDF is from a trusted source. If the source is valid this property can be set to true.
						 * If isTrustedSource is set to true, the PDFViewer opens with the displayType set to "Embedded" on desktop devices. This means that the PDF content is directly shown within the PDFViewer. Set this property to true only when the PDF is generated by the application or the PDF is scanned for viruses.
						 * If isTrustedSource is set to false, the PDFViewer opens with the displayType set to "Link" on desktop devices. This means that any configuration that has been provided by the application for the property displayType is overridden. In this case, the user would need to download the PDF to view its content.
						 */
						isTrustedSource: { type: "boolean", group: "Misc", defaultValue: false }
					},
					aggregations: {
						/**
						 * A custom control that can be used instead of the error message specified by the
						 * errorPlaceholderMessage property.
						 */
						errorPlaceholder: { type: "sap.ui.core.Control", multiple: false },
						/**
						 * A multiple aggregation for buttons that can be added to the footer of the popup
						 * dialog. Works only if the PDF viewer is set to open in a popup dialog.
						 */
						popupButtons: { type: "sap.m.Button", multiple: true, singularName: "popupButton" },
						/**
						 * An illustrated message is displayed when pdf cannot be displayed
						 * @private
						 */
						_illustratedMessage: { type: "sap.m.IllustratedMessage", multiple: false, visibility: "hidden" },
						/**
						 * An illustrated message is displayed when the property isTrustedSource = false
						 * @private
						 */
						_nonTrustedIllustratedMessage: { type: "sap.m.IllustratedMessage", multiple: false, visibility: "hidden" }
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
						error: {
							parameters: {
								/**
								 * The iframe element.
								 */
								target: { type: "any" }
							}
						},
						/**
						 * This event is fired when the PDF viewer control cannot check the loaded content. For
						 * example, the default configuration of the Mozilla Firefox browser may not allow checking
						 * the loaded content. This may also happen when the source PDF file is stored in a different
						 * domain.
						 * If you want no error message to be displayed when this event is fired, call the
						 * preventDefault() method inside the event handler.
						 *
						 * Modern browsers implement strict policies for validating external resources loaded within an iframe.
						 * PDFViewer cannot determine whether the resource inside the iframe is a valid PDF by itself.
						 * As the validation cannot be performed the sourceValidationFailed event cannot be triggered.
						 * @deprecated As of version 1.141.0 with no replacement.
						 */
						sourceValidationFailed: {}
					}
				},

				renderer: PDFViewerRenderer
			});


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
			this._isError = false;

			this._initPopupControl();
			this._initPopupDownloadButtonControl();
			this._initErrorPlaceholderIllustratedMessageControl();
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
			try {
				//unbind all iFrame events before rendering
				var oIframeElement = this._getIframeDOMElement();
				oIframeElement.remove();
			} catch (error) {
				Log.info(error);
			}
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

				oIframeElement.on("load", this._onLoadListener.bind(this));
				oIframeElement.on("error", this._onErrorListener.bind(this));
			}.bind(this);

			try {
				this.setBusy(true);
				fnInitIframeElement();
			} catch (error) {
				Log.info(error);
				if (this._isError) {
					this._isError = false;
					this._objectsRegister.getErrorPlaceholderIllustratedMessageControl().invalidate();
				}
				this.setBusy(false);
			}
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._fireErrorEvent = function (oEventTarget) {
			this._renderErrorState();
			this.fireError({
				target: oEventTarget || null
			});
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
			//this._isError = true;
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
				Log.fatal("Iframe not found in loaded event");
				Log.fatal(err);
			}
			this.fireEvent("loaded");
		};

		/**
		 * @private
		 * Handles the iframe load event for PDFViewer.
		 * - Checks if PDF plugin is enabled, fires error if not.
		 * - Validates the PDF source using a GET request to ensure accessibility.
		 * - Fires loaded event if validation succeeds, error event otherwise.
		 * - Catches and logs any unexpected errors, fires error event in such cases.
		 */
		PDFViewer.prototype._onLoadListener = function (oEvent) {
			try {
				// Check if PDF plugin is enabled
				if (PDFViewerRenderer._isPdfPluginEnabled()) {
					// Validate source using GET request when iframe loads
					var sSource = this.getSource();
					if (sSource) {
						// Skip validation for data URIs and blob URLs as they may not work with fetch
						// or would waste bandwidth by re-downloading embedded data
						if (this._isDataUriOrBlob(sSource)) {
							// For data URIs and blob URLs, assume valid and fire loaded event
							this._fireLoadedEvent();
						} else {
							try {
								// Source validation using GET request to check resource existence.
								// body.cancel() releases the HTTP/1.1 connection slot immediately after
								// the status check — without it, the unconsumed response body holds the
								// connection open and exhausts Chrome's 6-connection-per-origin pool when
								// 6+ PDFViewer instances load from the same origin simultaneously.
								window.fetch(sSource, { method: "GET" })
									.then(function (response) {
										var bOk = response.ok;
										if (response.body) {
											response.body.cancel();
										}
										if (bOk) {
											this._fireLoadedEvent();
										} else {
											this._fireErrorEvent(oEvent.target);
										}
									}.bind(this)).catch(function () {
										this._fireErrorEvent(oEvent.target);
									}.bind(this));
							} catch (error) {
								this._fireErrorEvent(oEvent.target);
							}
						}
					} else {
						// No valid source, fire error event
						this._fireErrorEvent(oEvent.target);
					}
				} else {
					// PDF plugin not enabled, fire error event
					this._fireErrorEvent(oEvent.target);
				}
			} catch (error) {
				// Generic Error Handling: fire error event and log details
				this._fireErrorEvent(oEvent.target);
				Log.fatal(false, "Fatal error during the handling of load event happened.");
				Log.fatal(false, error.message);
			}
		};

		/**
		 * Checks if the source is a data URI or blob URL
		 * @param {string} sSource The source URL to check
		 * @returns {boolean} true if source is data URI or blob URL
		 * @private
		 */
		PDFViewer.prototype._isDataUriOrBlob = function (sSource) {
			if (!sSource || typeof sSource !== "string") {
				return false;
			}

			var sLowerSource = sSource.toLowerCase();
			return sLowerSource.startsWith("data:") || sLowerSource.startsWith("blob:");
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._onErrorListener = function () {
			this._fireErrorEvent();
		};

		/**
		 * Downloads the PDF file.
		 *
		 * @public
		 */
		PDFViewer.prototype.downloadPDF = function () {
			var oWindow = window.open(this.getSource());
			oWindow.opener = null;
			oWindow.focus();
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
			return PDFViewerRenderer._isPdfPluginEnabled() && this._bRenderPdfContent && this._isSourceValidToDisplay();
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
				assert(false, "The PDF file cannot be opened with the given source. Given source: " + this.getSource());
				return;
			} else if (!PDFViewerRenderer._isPdfPluginEnabled()) {
				Log.warning("The PDF plug-in is not available on this device.");
			}

			if (this._isEmbeddedModeAllowed() && this.getIsTrustedSource()) {
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
			oWindow.opener = null;
			oWindow.focus();
		};

		/**
		 * Gets the iframe element from rendered DOM
		 * @returns {*} jQuery object of iframe
		 * @private
		 */
		PDFViewer.prototype._getIframeDOMElement = function () {
			var oIframeElement = this.$("iframe");
			if (oIframeElement.length === 0) {
				throw Error("Underlying iframe was not found in DOM.");
			}
			if (oIframeElement.length > 1) {
				Log.fatal("Initialization of iframe fails. Reason: the control somehow renders multiple iframes");
			}
			return oIframeElement;
		};

		/**
		 * @private
		 */
		PDFViewer.prototype._isEmbeddedModeAllowed = function () {
			//Allow Embedding only if PDFViewer plugin is present
			return this._isDisplayTypeAuto() ? Device.system.desktop : this._isDisplayTypeEmbedded();
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isDisplayTypeAuto = function () {
			return this.getDisplayType() === PDFViewerDisplayType.Auto;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isDisplayTypeEmbedded = function () {
			return this.getDisplayType() === PDFViewerDisplayType.Embedded;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isDisplayTypeLink = function () {
			return this.getDisplayType() === PDFViewerDisplayType.Link;
		};

		/**
		 * @returns {boolean}
		 * @private
		 */
		PDFViewer.prototype._isDisplayDownloadButton = function () {
			return this.getShowDownloadButton() || this._isDisplayTypeLink() || (this._isDisplayTypeAuto() && !this._isEmbeddedModeAllowed());
		};

		/**
		 * @returns {module:sap/base/i18n/ResourceBundle}
		 * @private
		 */
		PDFViewer.prototype._getLibraryResourceBundle = function () {
			return CoreLib.getResourceBundleFor("sap.m");
		};

		/**
		 * @returns {string}
		 * @private
		 */
		PDFViewer.prototype._getIllustratedMessageErrorMessage = function () {
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
			if (this._bIsPopupOpen) {
				return '100%';
			}

			if (!this._isEmbeddedModeAllowed()) {
				return 'auto';
			}

			return this.getHeight();
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

			try {
				//unbind all iFrame events before rendering
				var oIframeElement = this._getIframeDOMElement();
				oIframeElement.off();
			} catch (error) {
				Log.info(error);
			}
		};

		PDFViewerRenderManager.extendPdfViewer(PDFViewer);

		return PDFViewer;
	});
