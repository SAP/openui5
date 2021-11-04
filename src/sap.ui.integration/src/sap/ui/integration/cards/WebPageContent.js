/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseContent",
	"./WebPageContentRenderer",
	"sap/ui/core/Core",
	"sap/ui/integration/util/BindingHelper"
], function (
	BaseContent,
	WebPageContentRenderer,
	Core,
	BindingHelper
) {
	"use strict";

	var FRAME_LOADED = "_frameLoaded";
	var LOAD_TIMEOUT = 15 * 1000; // wait maximum 15s for the frame to load
	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");

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

		this.getDomRef("frame").addEventListener("load", this._onFrameLoadedBound);
		this._checkSrc();
	};

	/**
	 * @override
	 */
	WebPageContent.prototype.setConfiguration = function (oConfiguration) {
		BaseContent.prototype.setConfiguration.apply(this, arguments);
		oConfiguration = this.getParsedConfiguration();

		//workaround until actions refactor
		this.fireEvent("_actionContentReady"); // todo

		if (!oConfiguration) {
			return this;
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

		return this;
	};

	WebPageContent.prototype._checkSrc = function () {
		var sCurrSrc = this.getSrc();

		if (sCurrSrc === "") {
			this.handleError(
				"Src of WebPage content is empty",
				oResourceBundle.getText("CARD_WEB_PAGE_EMPTY_URL_ERROR")
			);
			return;
		}

		if (!sCurrSrc.startsWith("https://")) {
			this.handleError(
				"Please use a secure URL (https://)",
				oResourceBundle.getText("CARD_WEB_PAGE_HTTPS_URL_ERROR")
			);
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
			var iSeconds = LOAD_TIMEOUT / 1000;

			this.handleError(
				"Failed to load '" + this.getSrc() + "' after " + iSeconds + " seconds.",
				oResourceBundle.getText("CARD_WEB_PAGE_TIMEOUT_ERROR", [iSeconds])
			);
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
