/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/HBox",
	"sap/m/Image",
	"sap/m/ToggleButton",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/dom/includeStylesheet"
], function (
	Control, HBox, Image, ToggleButton, Card, Core, includeStylesheet
) {
	"use strict";

	/**
	 * Constructor for a new <code>Preview</code> that show a image, abstract live preview
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.Preview
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var CardPreview = Control.extend("sap.ui.integration.designtime.editor.CardPreview", {
		metadata: {
			properties: {
				settings: {
					type: "any"
				},
				card: {
					type: "object"
				}
			},
			aggregations: {
				cardPreview: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: function (oRm, oControl) {
			if (oControl._getCurrentMode() === "None") {
				oRm.openStart("div");
				oRm.writeElementData(oControl);
				oRm.openEnd();
				return;
			}
			oRm.openStart("div");
			oRm.writeElementData(oControl);
			oRm.addClass("sapUiIntegrationDTPreview");
			if (isDark()) {
				oRm.addClass("sapUiIntegrationDTPreviewDark");
			}
			oRm.writeClasses();
			oRm.openEnd();
			oRm.renderControl(oControl._getCardPreview());
			if (oControl._getModes().indexOf("Live") > -1 && oControl._getModes().indexOf("Abstract") > -1) {
				oRm.renderControl(oControl._getModeToggleButton());
			}
			oRm.close("div");
		}
	});

	/**
	 * initialized the preview
	 */
	CardPreview.prototype.init = function () {
		//load translations
		this._oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
		//if the theme changes we should toggle the class
		Core.attachThemeChanged(function () {
			if (this.getDomRef()) {
				if (isDark()) {
					this.getDomRef().classList.add("sapUiIntegrationDTPreviewDark");
				} else {
					this.getDomRef().classList.remove("sapUiIntegrationDTPreviewDark");
				}
			} else {
				this.update();
			}
		}.bind(this));
	};

	/**
	 * returns the a preview based on the current settings
	 */
	CardPreview.prototype._getCardPreview = function () {
		var oPreview = null;
		if (this._getCurrentMode() === "Abstract") {
			if (this.getSettings().preview.src) {
				oPreview = this._getImagePlaceholder();
			} else {
				oPreview = this._getCardPlaceholderPreview();
			}
		} else if (this._getCurrentMode() === "Live") {
			oPreview = this._getCardRealPreview();
		}
		if (oPreview) {
			this.setAggregation("cardPreview", oPreview);
		}
		if (!this.getSettings().preview || this.getSettings().preview.scaled !== false) {
			oPreview.addStyleClass("sapUiIntegrationDTPreviewScale");
		} else {
			oPreview.addStyleClass("sapUiIntegrationDTPreviewNoScale");
		}
		return oPreview;
	};

	/**
	 * returns the a scaled placeholder of the card based on the current settings
	 */
	CardPreview.prototype._getCardPlaceholderPreview = function () {
		var oCard = this.getCard(),
			placeholder;

		function _map(s, x) {
			return oCard.getManifestEntry(s) ? x || "{bound}" : null;
		}
		var header = null;
		if (oCard.getManifestEntry("/sap.card/header")) {
			var type = oCard.getManifestEntry("/sap.card/header/type");
			if (type && type.toUpperCase() === "NUMERIC") {
				header = {
					"title": _map("/sap.card/header/title"),
					"type": "Numeric",
					"subTitle": _map("/sap.card/header/subTitle"),
					"unitOfMeasurement": _map("/sap.card/header/unitOfMeasurement"),
					"mainIndicator": _map("/sap.card/header/mainIndicator", {
						"number": "{bound}",
						"unit": "{bound}",
						"trend": "{bound}",
						"state": "{bound}"
					}),
					"details": _map("/sap.card/header/details"),
					"sideIndicators": [
						_map("/sap.card/header/sideIndicators/0", {
							"title": "Deviation",
							"number": "{bound}",
							"unit": "{bound}"
						}),
						_map("/sap.card/header/sideIndicators/1", {
							"title": "Target",
							"number": "{bound}",
							"unit": "{bound}"
						})
					]
				};
			} else {
				header = {
					"title": _map("/sap.card/header/title"),
					"subTitle": _map("/sap.card/header/subTitle"),
					"status": _map("/sap.card/header/status"),
					"icon": _map("/sap.card/header/icon", {
						"src": "{bound}"
					})
				};
			}
		}
		placeholder = {
			"sap.app": {
				"type": "card",
				"id": oCard.getManifestEntry("/sap.app/id") + ".abstractPreview"
			},
			"sap.card": {
				"type": oCard.getManifestEntry("/sap.card/type") === "List" ? "List" : "Component",
				"header": header,
				"content": {
					"maxItems": 6,
					"item": {
						"title": {
							"value": _map("/sap.card/content/item/value")
						},
						"icon": _map("/sap.card/content/item/icon", {
							"src": "{bound}"
						}),
						"description": _map("/sap.card/content/item/description"),
						"info": {
							"value": _map("/sap.card/content/item/info")
						}
					}
				}
			}
		};
		if (!this._oCardPlaceholder) {
			this._oCardPlaceholder = new Card();
			this._oCardPlaceholder._setPreviewMode(true);
		}
		this._oCardPlaceholder.setManifest(placeholder);
		this._oCardPlaceholder.refresh();
		return this._oCardPlaceholder;
	};

	/**
	 * returns the real scaled instance of the card
	 */
	CardPreview.prototype._getCardRealPreview = function () {
		if (!this._oCardPreview) {
			this._oCardPreview = new Card();
			this._oCardPreview.setBaseUrl(this.getCard().getBaseUrl());
		}
		this._oCardPreview.setManifest(this.getCard().getManifestEntry("/"));
		this._oCardPreview.refresh();
		return this._oCardPreview;
	};

	/**
	 * returns the image placeholder is the preview.src is maintained
	 */
	CardPreview.prototype._getImagePlaceholder = function () {
		var mSettings = this.getSettings();
		if (mSettings.preview.src) {
			if (!this._oImagePlaceholder) {
				var oHBox = new HBox();
				oHBox.addStyleClass("sapFCard");
				oHBox.setWidth("500px");
				var baseUrl = this.getCard().getBaseUrl();
				if (!baseUrl && typeof this.getCard().getManifest() === "string") {
					baseUrl = this.getCard().getManifest();
					baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/") + 1);
				}
				var src = baseUrl + "/" + mSettings.preview.src;
				var oImg = new Image({ src: src });
				oImg.addStyleClass("sapUiIntegrationDTPreviewImg");
				oImg.setWidth("500px");
				oImg.setHeight("600px");
				oHBox.addItem(oImg);
				this._oImagePlaceholder = oHBox;
			}
		}
		return this._oImagePlaceholder;
	};

	/**
	 * returns the available modes
	 */
	CardPreview.prototype._getModes = function () {
		var mSettings = this.getSettings();
		//default setting - live preview
		mSettings.preview = mSettings.preview || {};
		mSettings.preview.modes = mSettings.preview.modes || "Abstract";
		return mSettings.preview.modes;
	};

	/**
	 * returns the current mode of the preview, "Abstract" or "Live"
	 */
	CardPreview.prototype._getCurrentMode = function () {
		var sModes = this._getModes();
		if (!this._currentMode) {
			switch (sModes) {
				case "AbstractLive":
				case "Abstract":
					this._currentMode = "Abstract"; break;
				case "LiveAbstract":
				case "Live":
					this._currentMode = "Live"; break;
				default: this._currentMode = "None";
			}
		}
		return this._currentMode;
	};

	/**
	 * toggles the current mode from "Abstract" to "Live" and vice versa
	 */
	CardPreview.prototype._toggleCurrentMode = function () {
		var sModes = this._getModes();
		if (sModes.indexOf("Live") > -1 && sModes.indexOf("Abstract") > -1) {
			this._currentMode = this._getCurrentMode() === "Abstract" ? "Live" : "Abstract";
		}
	};

	/**
	 * toggles the current mode from "Abstract" to "Live" and vice versa
	 */
	CardPreview.prototype._getModeToggleButton = function () {
		var oBundle = Core.getLibraryResourceBundle("sap.ui.integration");

		if (!this._oModeToggleButton) {
			this._oModeToggleButton = new ToggleButton();
			this._oModeToggleButton.setTooltip();
			this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewButton");
			this._oModeToggleButton.attachPress(function () {
				this._toggleCurrentMode();
				this.update();
			}.bind(this));
		}
		var tb = this._oModeToggleButton,
			currentMode = this._getCurrentMode();
		if (currentMode === "None") {
			tb.setVisible(false);
		}
		if (currentMode === "Abstract") {
			tb.setIcon("sap-icon://media-play");
			tb.setPressed(false);
			tb.setTooltip(oBundle.getText("CARDEDITOR_PREVIEW_BTN_LIVEPREVIEW"));

		} else if (currentMode === "Live") {
			tb.setIcon("sap-icon://media-pause");
			tb.setPressed(true);
			tb.setTooltip(oBundle.getText("CARDEDITOR_PREVIEW_BTN_SAMPLEPREVIEW"));
		}
		return this._oModeToggleButton;
	};

	/**
	 * updates this preview
	 */
	CardPreview.prototype.update = function () {
		this.invalidate();
	};

	function isDark(rgbcolor) {
		rgbcolor = rgbcolor || window.getComputedStyle(document.body).backgroundColor;
		var match = /rgb\((\d+).*?(\d+).*?(\d+)\)/.exec(rgbcolor);
		if (!match) {
			return false;
		}
		var r = parseInt(match[1]),
			g = parseInt(match[2]),
			b = parseInt(match[3]),
			yiq = (r * 299 + g * 587 + b * 114) / 1000;
		return (yiq <= 128);
	}

	CardPreview.init = function () {
		var sCssURL = sap.ui.require.toUrl("sap.ui.integration.designtime.editor.css.CardPreview".replace(/\./g, "/") + ".css");
		includeStylesheet(sCssURL);
		this.init = function () { };
	};

	CardPreview.init();

	return CardPreview;
});