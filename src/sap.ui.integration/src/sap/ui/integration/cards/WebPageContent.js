/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/IllustratedMessageType",
	"./BaseContent",
	"./WebPageContentRenderer",
	"sap/ui/integration/util/BindingHelper"
], function (
	IllustratedMessageType,
	BaseContent,
	WebPageContentRenderer,
	BindingHelper
) {
	"use strict";

	var FRAME_LOADED = "_frameLoaded";
	var LOAD_TIMEOUT = 15 * 1000; // wait maximum 15s for the frame to load

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
					defaultValue: "",
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
				 * Note: <code>allow</code> with value <code>fullscreen</code> is not supported for Safari.
				 */
				allow: {
					type: "string",
					bindable: true
				},

				/**
				 * Allowfullscreen attribute of the iframe.
				 */
				allowfullscreen: {
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
	};

	WebPageContent.prototype.exit = function () {
		BaseContent.prototype.exit.apply(this, arguments);

		if (this._iLoadTimeout) {
			clearTimeout(this._iLoadTimeout);
		}
	};

	WebPageContent.prototype.onBeforeRendering = function () {
		BaseContent.prototype.onBeforeRendering.apply(this, arguments);

		if (this.getDomRef()) {
			this.getDomRef("frame").removeEventListener("load", this._onFrameLoadedBound);
		}
	};

	WebPageContent.prototype.onAfterRendering = function () {
		BaseContent.prototype.onAfterRendering.apply(this, arguments);

		if (this.getDomRef("frame")) {
			this.getDomRef("frame").addEventListener("load", this._onFrameLoadedBound);
			this._checkSrc();
		}
	};

	/**
	 * @override
	 */
	WebPageContent.prototype.applyConfiguration = function () {
		var oConfiguration = this.getParsedConfiguration();

		//workaround until actions refactor
		this.fireEvent("_actionContentReady"); // todo

		if (!oConfiguration) {
			return;
		}

		var oSrcBinding = BindingHelper.formattedProperty(oConfiguration.src, function (sValue) {
			return this._oIconFormatter.formatSrc(sValue);
		}.bind(this));

		if (oSrcBinding) {
			this.bindSrc(oSrcBinding);
		}

		if (typeof oConfiguration.sandbox === "object") {
			this.bindSandbox(BindingHelper.reuse(oConfiguration.sandbox));
		} else {
			this.setSandbox(oConfiguration.sandbox);
		}

		if (typeof oConfiguration.minHeight === "object") {
			this.bindMinHeight(BindingHelper.reuse(oConfiguration.minHeight));
		} else {
			this.setMinHeight(oConfiguration.minHeight);
		}

		if (typeof oConfiguration.allow === "object") {
			this.bindAllow(BindingHelper.reuse(oConfiguration.allow));
		} else {
			this.setAllow(oConfiguration.allow);
		}

		if (typeof oConfiguration.allowfullscreen === "object") {
			this.bindAllowfullscreen(BindingHelper.reuse(oConfiguration.allowfullscreen));
		} else {
			this.setAllowfullscreen(oConfiguration.allowfullscreen);
		}
	};

	WebPageContent.prototype._checkSrc = function () {
		var oCard = this.getCardInstance(),
			sCurrSrc = this.getSrc();

		if (!oCard) {
			return;
		}

		if (sCurrSrc === "") {
			this.handleError({
				illustrationType: IllustratedMessageType.ErrorScreen,
				title: oCard.getTranslatedText("CARD_WEB_PAGE_EMPTY_URL_ERROR"),
				description: oCard.getTranslatedText("CARD_ERROR_CONFIGURATION_DESCRIPTION")
			});
			return;
		}

		if (!sCurrSrc.startsWith("https://")) {
			this.handleError({
				illustrationType: IllustratedMessageType.ErrorScreen,
				title: oCard.getTranslatedText("CARD_WEB_PAGE_HTTPS_URL_ERROR"),
				description: oCard.getTranslatedText("CARD_ERROR_REQUEST_ACCESS_DENIED_DESCRIPTION")
			});
			return;
		}

		if (this._sPrevSrc !== sCurrSrc) {
			this._raceFrameLoad();
			this._sPrevSrc = sCurrSrc;
		}
	};
	/**
	 * Shows error if FRAME_LOADED event didn't fire for 15 seconds
	 */
	WebPageContent.prototype._raceFrameLoad = function () {
		this.awaitEvent(FRAME_LOADED);

		this._iLoadTimeout = setTimeout(function () {
			var iSeconds = LOAD_TIMEOUT / 1000,
				oCard = this.getCardInstance();

			this.handleError({
				illustrationType: IllustratedMessageType.ReloadScreen,
				title: oCard.getTranslatedText("CARD_WEB_PAGE_TIMEOUT_ERROR", [iSeconds]),
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