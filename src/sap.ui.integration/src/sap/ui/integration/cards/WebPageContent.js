/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseContent",
	"./WebPageContentRenderer",
	"sap/ui/util/isCrossOriginURL",
	"sap/m/IllustratedMessageType",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/core/Lib"
], function (
	BaseContent,
	WebPageContentRenderer,
	isCrossOriginURL,
	IllustratedMessageType,
	BindingHelper,
	Library
) {
	"use strict";

	var FRAME_LOADED = "_frameLoaded";
	var LOAD_TIMEOUT = 15 * 1000; // wait maximum 15s for the frame to load
	const oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

	/**
	 * Constructor for a new <code>WebPageContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays web content.
	 *
	 * @extends sap.ui.integration.cards.BaseContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.90
	 * @alias sap.ui.integration.cards.WebPageContent
	 */
	var WebPageContent = BaseContent.extend("sap.ui.integration.cards.WebPageContent", {
		metadata: {
			properties: {

				/**
				 * The height of the iframe
				 */
				minHeight: {
					type: "sap.ui.core.CSSSize",
					defaultValue: WebPageContentRenderer.MIN_WEB_PAGE_CONTENT_HEIGHT,
					bindable: true
				},

				/**
				 * The source of the iframe
				 */
				src: {
					type: "sap.ui.core.URI",
					bindable: true
				},

				/**
				 * Sandbox attribute of the iframe. Full restrictions by default
				 */
				sandbox: {
					type: "string",
					defaultValue: "",
					bindable: true
				},

				/**
				 * Allow attribute of the iframe. No features are available by default
				 *
				 * Note: <code>allow</code> with value <code>fullscreen</code> is not supported for Safari and Firefox.
				 * For browser support specifics @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy/fullscreen
				*/
				allow: {
					type: "string",
					bindable: true
				},

				/**
				 * AllowFullscreen attribute of the iframe.
				 */
				allowFullscreen: {
					type: "boolean",
					defaultValue: false,
					bindable: true
				},

				/**
				 * If set to <code>true</code>, the <code>sandbox</code> attribute will not be added
				 * Note: Omitting the <code>sandbox</code> attribute opens a security vulnerability and must be done with great caution and only if the content of the iframe page is fully trusted.
				 * @experimental
				 */
				omitSandbox: {
					type: "boolean",
					defaultValue: false,
					bindable: true
				}
			},
			library: "sap.ui.integration"
		},
		renderer: WebPageContentRenderer
	});

	WebPageContent.prototype.init = function () {
		BaseContent.prototype.init.apply(this, arguments);

		this._onFrameLoadedBound = this._onFrameLoaded.bind(this);
		this._sPrevSrc = this.getSrc();

		this.attachEventOnce("_dataReady", () => {
			this._bDataReady = true;
		});
	};

	WebPageContent.prototype.exit = function () {
		BaseContent.prototype.exit.apply(this, arguments);

		if (this._iLoadTimeout) {
			clearTimeout(this._iLoadTimeout);
		}
	};

	WebPageContent.prototype.onBeforeRendering = function () {
		BaseContent.prototype.onBeforeRendering.apply(this, arguments);

		if (this.getDomRef("frame")) {
			this.getDomRef("frame").removeEventListener("load", this._onFrameLoadedBound);
		}

		const sCurrSrc = this.getSrc();

		if (this._isDataReady() && sCurrSrc !== undefined && this._sPrevSrc !== sCurrSrc) {
			this._sPrevSrc = sCurrSrc;

			if (this._checkSrc()) {
				this._bSrcChecked = true;
				this._raceFrameLoad();
			}
		}
	};

	WebPageContent.prototype.onAfterRendering = function () {
		BaseContent.prototype.onAfterRendering.apply(this, arguments);

		if (this.getDomRef("frame")) {
			this.getDomRef("frame").addEventListener("load", this._onFrameLoadedBound);
		}
	};

	/**
	 * @override
	 */
	WebPageContent.prototype.applyConfiguration = function () {
		const oConfiguration = this.getParsedConfiguration();

		//workaround until actions refactor
		this.fireEvent("_actionContentReady"); // todo

		if (!oConfiguration) {
			return;
		}

		this.applySettings({
			src: BindingHelper.formattedProperty(oConfiguration.src, (sValue) => this._oIconFormatter.formatSrc(sValue) ),
			sandbox: oConfiguration.sandbox,
			minHeight: oConfiguration.minHeight,
			allow: oConfiguration.allow,
			allowFullscreen: oConfiguration.allowFullscreen || oConfiguration.allowfullscreen,
			omitSandbox: oConfiguration.omitSandbox
		});
	};

	/**
	 * @override
	 */
	WebPageContent.prototype._supportsOverflow = function () {
		return false;
	};

	WebPageContent.prototype._isDataReady = function () {
		if (!this.getCardInstance()) {
			return this._bDataReady;
		}

		return this._bDataReady && this.getCardInstance().isDataReady();
	};

	WebPageContent.prototype._checkSrc = function () {
		const oCard = this.getCardInstance(),
			sCurrSrc = this.getSrc();

		if (!oCard) {
			return false;
		}

		if (!sCurrSrc) {
			this.handleError({
				illustrationType: IllustratedMessageType.UnableToLoad,
				title: oResourceBundle.getText("CARD_WEB_PAGE_EMPTY_URL_ERROR"),
				description: oResourceBundle.getText("CARD_ERROR_CONFIGURATION_DESCRIPTION")
			});
			return false;
		}

		if (isCrossOriginURL(sCurrSrc) && !sCurrSrc.startsWith("https")) {
			this.handleError({
				illustrationType: IllustratedMessageType.UnableToLoad,
				title: oResourceBundle.getText("CARD_WEB_PAGE_HTTPS_URL_ERROR"),
				description: oResourceBundle.getText("CARD_ERROR_REQUEST_ACCESS_DENIED_DESCRIPTION")
			});
			return false;
		}

		return true;
	};

	/**
	 * Shows error if FRAME_LOADED event didn't fire for 15 seconds
	 */
	WebPageContent.prototype._raceFrameLoad = function () {
		this.awaitEvent(FRAME_LOADED);

		if (this._iLoadTimeout) {
			clearTimeout(this._iLoadTimeout);
		}

		this._iLoadTimeout = setTimeout(function () {
			this.fireEvent(FRAME_LOADED);

			var iSeconds = LOAD_TIMEOUT / 1000;

			this.handleError({
				illustrationType: IllustratedMessageType.UnableToLoad,
				title: oResourceBundle.getText("CARD_WEB_PAGE_TIMEOUT_ERROR", [iSeconds]),
				details: "Failed to load '" + this.getSrc() + "' after " + iSeconds + " seconds."
			});
		}.bind(this), LOAD_TIMEOUT);
	};

	/**
	 * Fires FRAME_LOADED event when the iframe is loaded
	 */
	WebPageContent.prototype._onFrameLoaded = function () {
		this.fireEvent(FRAME_LOADED);
		clearTimeout(this._iLoadTimeout);
	};

	return WebPageContent;
});