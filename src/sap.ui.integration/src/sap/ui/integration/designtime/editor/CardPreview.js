/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/integration/library",
	"sap/ui/core/Control",
	"sap/m/HBox",
	"sap/m/Image",
	"sap/m/ToggleButton",
	"./Card",
	"sap/ui/core/Core",
	"sap/ui/dom/includeStylesheet"
], function(
	Localization,
	Element,
	Library,
	library,
	Control,
	HBox,
	Image,
	ToggleButton,
	Card,
	Core,
	includeStylesheet
) {
	"use strict";

	var CardDataMode = library.CardDataMode,
		CardPreviewMode = library.CardPreviewMode;

	/**
	 * Constructor for a new <code>Preview</code> that show a image, abstract live preview
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.editor.CardPreview
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var CardPreview = Control.extend("sap.ui.integration.designtime.editor.CardPreview", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				settings: {
					type: "any"
				},
				card: {
					type: "object"
				},
				parentWidth: {
					type: "sap.ui.core.CSSSize"
				},
				parentHeight: {
					type: "sap.ui.core.CSSSize"
				}
			},
			aggregations: {
				cardPreview: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			associations: {
				_editor: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				if (oControl._getCurrentMode() === "None") {
					oRm.openStart("div", oControl);
					oRm.openEnd();
					oRm.close("div");
					return;
				}
				oRm.openStart("div", oControl);
				oRm.class("sapUiIntegrationDTPreview");
				if ((!oControl.getSettings().preview || oControl.getSettings().preview.scaled !== false) && oControl._getCurrentSize() !== "Full") {
					oRm.class("sapUiIntegrationDTPreviewScaleBackground");
				}
				if (isDark()) {
					oRm.class("sapUiIntegrationDTPreviewDark");
				}
				var sPreviewPosition = oControl.getSettings().preview.position;
				if (sPreviewPosition === "separate") {
					oRm.class("sapUiIntegrationDTPreviewSeparate");
					document.body.style.setProperty("--sapUiIntegrationEditorPreviewWidth", "100%");
					document.body.style.setProperty("--sapUiIntegrationEditorPreviewHeight", "100%");
				}
				oRm.openEnd();
				oRm.openStart("div", oControl.getId() + "-card");
				if (!oControl.getSettings().preview || oControl.getSettings().preview.scaled !== false) {
					if (oControl._getCurrentSize() !== "Full") {
						oRm.class("sapUiIntegrationDTPreviewScale");
						var sLanguge = Localization.getLanguage().replaceAll('_', '-');
						if (sLanguge.startsWith("ar") || sLanguge.startsWith("he")) {
							// for the languages "ar-SA"(Arabic) and "he-IL"(Hebrew) which write from right to left, use spec style
							oRm.class("withSpec");
						} else {
							oRm.class("noSpec");
						}
					} else {
						oRm.class("sapUiIntegrationDTPreviewNoScale");
					}
				} else {
					oRm.class("sapUiIntegrationDTPreviewNoScale");
				}
				oRm.openEnd();
					oRm.openStart("div", oControl.getId() + "-before");
					oRm.attr("tabindex", "-1");
					oRm.openEnd();
					oRm.close("div");
					oRm.renderControl(oControl._getCardPreview());
					oRm.openStart("div", oControl.getId() + "-after");
					oRm.attr("tabindex", "-1");
					oRm.openEnd();
					oRm.close("div");
				oRm.close("div");
				// TODO unsupported DOM structure: button is not a child of the root element
				var sModes = oControl._getModes();
				if (sModes.indexOf("Abstract") > -1 && (sModes.indexOf("Live") > -1 || sModes.indexOf("MockData") > -1)) {
					oRm.renderControl(oControl._getModeToggleButton());
				}

				if (sModes !== "Abstract" && (!sPreviewPosition || sPreviewPosition === "right" || sPreviewPosition === "left")) {
					oRm.renderControl(oControl._getResizeToggleButton());
				}
				if (sPreviewPosition === "top" || sPreviewPosition === "bottom") {
					document.body.style.setProperty("--sapUiIntegrationEditorPreviewWidth", oControl.getEditor().getWidth());
				}
				document.body.style.setProperty("--sapUiIntegrationEditorPreviewHeight", oControl.getEditor().getHeight());
				oRm.close("div");
			}
		}
	});

	/**
	 * initialized the preview
	 */
	CardPreview.prototype.init = function () {
		//load translations
		this._oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");
	};

	/**
	 * if the theme changes we should toggle the class
	 */
	CardPreview.prototype.onThemeChanged = function () {
		if (this.getDomRef()) {
			if (isDark()) {
				this.getDomRef().classList.add("sapUiIntegrationDTPreviewDark");
			} else {
				this.getDomRef().classList.remove("sapUiIntegrationDTPreviewDark");
			}
		} else {
			this.update();
		}
	};

	/**
	 * destroy the preview
	 */
	CardPreview.prototype.destroy = function () {
		if (this._oModeToggleButton) {
			this._oModeToggleButton.destroy();
		}
		if (this._oCardPreview) {
			this._oCardPreview.destroy();
		}
		if (this._oImagePlaceholder) {
			this._oImagePlaceholder.destroy();
		}
		if (this._oCardPlaceholder) {
			this._oCardPlaceholder.destroy();
		}
		Control.prototype.destroy.apply(this, arguments);
		document.body.style.removeProperty("--sapUiIntegrationEditorPreviewWidth");
		document.body.style.removeProperty("--sapUiIntegrationEditorPreviewHeight");
		document.body.style.removeProperty("--sapUiIntegrationEditorPreviewCardHeight");
	};

	CardPreview.prototype.onAfterRendering = function () {
		var oPreview = this.getAggregation("cardPreview"),
		    sModes = this._getModes();
		if ((sModes.indexOf("Live") > -1 || sModes.indexOf("MockData") > -1) && oPreview && oPreview.getDomRef() && oPreview.getDomRef().getElementsByClassName("sapVizFrame")) {
			window.setTimeout(function() {
				try {
					var vizFrameId = oPreview.getDomRef().getElementsByClassName("sapVizFrame")[0].id;
					var oVizFrame = Element.getElementById(vizFrameId);
					if (oVizFrame.getVizProperties() && oVizFrame.getVizProperties().legendGroup.layout.position === "bottom" && oVizFrame.getVizProperties().legendGroup.layout.alignment === "center") {
						oPreview.getDomRef().getElementsByClassName("v-m-legend")[0].transform.baseVal[0].matrix.e = 110;
					}
				} catch (error) {
					//do nothing
				}
			}, 500);
		}
	};

	CardPreview.prototype.getEditor = function () {
		var sEditorId = this.getAssociation("_editor");
		return Element.getElementById(sEditorId);
	};

	/**
	 * returns the a preview based on the current settings
	 */
	CardPreview.prototype._getCardPreview = function () {
		var oPreview = null;
		if (this._getCurrentMode() === "Abstract" && this.getSettings().preview.src) {
			oPreview = this._getImagePlaceholder();
		} else if (this._getCurrentMode() !== "None") {
			oPreview = this._getCardRealPreview();
		}
		if (oPreview) {
			this.setAggregation("cardPreview", oPreview);
			oPreview.removeStyleClass("sapUiIntegrationDTPreviewCard");
			oPreview.addStyleClass("sapUiIntegrationDTPreviewCard");
		}
		return oPreview;
	};

	/**
	 * Information that can be requested by the card to adapt the preview to the transformation scale if needed
	 * It needs to know the original height and width and the current transformation style.
	 */
	CardPreview.prototype.getTransformContentInfo = function () {
		return {
			transformStyle: "scale3d(0.45, 0.45, 1)",
			transformFactor: 0.45,
			transformOriginStyle: "0 0",
			widthStyle: "400px + 10rem",
			heightStyle: "700px - 1.5rem",
			zIndex: this.getEditor()._iZIndex
		};
	};

	/**
	 * returns the real scaled instance of the card
	 */
	CardPreview.prototype._getCardRealPreview = function () {
		var that = this;
		if (!this._oCardPreview) {
			var bReadonly = !this.getSettings().preview.interactive;
			this._oCardPreview = new Card({
				dataMode: CardDataMode.Active,
				readonly: bReadonly,
				readonlyZIndex: this.getEditor()._iZIndex + 1
			});
			this._oCardPreview.setBaseUrl(this.getCard().getBaseUrl());
			if (bReadonly) {
				this._oCardPreview.onfocusin = this._onfocusin.bind(this);
			}
			// for some Cards, such as component Card, need to reset the Card height for css since the Card Content
			// will not trigger onAfterRendering of the Card after loaded, then the height value may be wrong
			this._oCardPreview.attachEvent("_ready", function () {
				var oCardContent = this._oCardPreview.getCardContent();
				if (oCardContent) {
					oCardContent.addEventDelegate({
						"onAfterRendering": function() {
							this._resetHeight();
						}
					}, this);
				}
			}.bind(this));
			this._oCardPreview.onAfterRendering = function () {
				Card.prototype.onAfterRendering.call(this);
				that._resetHeight();
			};
		}
		if (this._currentMode === "MockData") {
			this._oCardPreview.setPreviewMode(CardPreviewMode.MockData);
		} else if (this._currentMode === "Abstract") {
			this._oCardPreview.setPreviewMode(CardPreviewMode.Abstract);
		} else if (this._currentMode === "Live") {
			this._oCardPreview.setPreviewMode(CardPreviewMode.Off);
		}
		this._initalChanges = this._initalChanges || this._oCardPreview.getManifestChanges() || [];
		var aChanges = this._initalChanges.concat([this.getEditor().getCurrentSettings()]);
		this._oCardPreview.setManifestChanges(aChanges);
		this._oCardPreview.setManifest(this.getCard()._oCardManifest._oManifest.getRawJson());
		this._oCardPreview.setHost(this.getCard().getHost());
		this._oCardPreview.attachManifestApplied(function () {
			var sShow = this._oCardPreview.getManifestEntry("/sap.card/root/show");
			if (sShow && !this._oCardPreview._refreshedByVariant) {
				var cardVariant = "";
				switch (sShow) {
					case "tile":
						cardVariant = this._oCardPreview.getManifestEntry("/sap.card/root/tileSize");
						break;
					case "header":
						cardVariant = this._oCardPreview.getManifestEntry("/sap.card/root/headerSize");
						break;
					default:
						cardVariant = this._oCardPreview.getManifestEntry("/sap.card/root/contentSize");
				}
				this._oCardPreview.setDisplayVariant(cardVariant);

				document.body.style.removeProperty("--sapUiIntegrationEditorPreviewCardHeight");
				this._oCardPreview.removeStyleClass("sapUiIntegrationDTPreviewCard");

				this._oCardPreview.removeStyleClass("sapUiIntDTPreviewCardTileStandard");
				this._oCardPreview.removeStyleClass("sapUiIntDTPreviewCardTileFlat");
				this._oCardPreview.removeStyleClass("sapUiIntDTPreviewCardTileFlatWide");
				this._oCardPreview.removeStyleClass("sapUiIntDTPreviewCardTileStandardWide");
				this._oCardPreview.removeStyleClass("sapUiIntDTPreviewCardCompactHeader");
				this._oCardPreview.removeStyleClass("sapUiIntDTPreviewCardSmallHeader");
				this._oCardPreview.removeStyleClass("sapUiIntDTPreviewCardStandardHeader");

				this._oCardPreview.addStyleClass("sapUiIntDTPreviewCard" + cardVariant);

				this._oCardPreview._refreshedByVariant = true;
				this._oCardPreview.refresh();
			}
		}.bind(this));
		this._oCardPreview._refreshedByVariant = false;
		this._oCardPreview.refresh();
		this._oCardPreview.editor = this._oCardPreview.editor || {};
		this._oCardPreview.preview = this._oCardPreview.editor.preview = this;
		return this._oCardPreview;
	};

	CardPreview.prototype._resetHeight = function () {
		var oCardDom = this._oCardPreview.getDomRef();
		if (oCardDom) {
			var sHeight = oCardDom.offsetHeight;
			if (this._getCurrentSize() !== "Full") {
				document.body.style.setProperty("--sapUiIntegrationEditorPreviewCardHeight", sHeight * 0.45 + "px");
			} else {
				document.body.style.setProperty("--sapUiIntegrationEditorPreviewCardHeight", sHeight + "px");
			}
		}
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
				var baseUrl = this.getCard().getBaseUrl();
				if (!baseUrl && typeof this.getCard().getManifest() === "string") {
					baseUrl = this.getCard().getManifest();
					baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/") + 1);
				}
				var src = baseUrl + "/" + mSettings.preview.src;
				var oImg = new Image({ src: src });
				oImg.addStyleClass("sapUiIntegrationDTPreviewImg");
				oHBox.addItem(oImg);
				this._oImagePlaceholder = oHBox;
			}
		}
		return this._oImagePlaceholder;
	};

	CardPreview.prototype._onfocusin = function (oEvent) {
		if (this._oModeToggleButton) {
			if (oEvent.srcControl !== this._oModeToggleButton && oEvent.relatedTarget !== this._oModeToggleButton.getDomRef() && oEvent.relatedTarget !== this.getDomRef("after")) {
				this.getDomRef("after").focus();
			} else {
				this.getDomRef("before").focus();
			}
		} else if (this._oSizeToggleButton){
			if (oEvent.srcControl !== this._oSizeToggleButton && oEvent.relatedTarget !== this._oSizeToggleButton.getDomRef() && oEvent.relatedTarget !== this.getDomRef("after")) {
				this.getDomRef("after").focus();
			} else {
				this.getDomRef("before").focus();
			}
		} else if (oEvent.srcControl.isA("sap.f.cards.BaseHeader")) {
			this.getDomRef("after").focus();
		} else {
			this.getDomRef("before").focus();
		}
	};

	/**
	 * returns the available modes
	 */
	CardPreview.prototype._getModes = function () {
		var mSettings = this.getSettings();
		//default setting - abstract preview
		mSettings.preview = mSettings.preview || {};
		mSettings.preview.modes = mSettings.preview.modes || "Abstract";
		// MockData mode is only used for Component Card now, replace it with "Live" for other Cards
		var sType = this.getCard().getManifestEntry("/sap.card/type");
		if (sType !== "Component") {
			mSettings.preview.modes = mSettings.preview.modes.replace("MockData", "Live");
		}
		return mSettings.preview.modes;
	};

	/**
	 * returns the current mode of the preview, "Abstract" or "Live" or "MockData"
	 */
	CardPreview.prototype._getCurrentMode = function () {
		var sModes = this._getModes();
		if (!this._currentMode) {
			switch (sModes) {
				case "Abstract":
				case "AbstractLive":
				case "AbstractMockData":
					this._currentMode = "Abstract"; break;
				case "Live":
				case "LiveAbstract":
					this._currentMode = "Live"; break;
				case "MockData":
				case "MockDataAbstract":
					this._currentMode = "MockData"; break;
				default: this._currentMode = "None";
			}
		}
		return this._currentMode;
	};

	/**
	 * toggles the current mode from "Abstract" to "Live" or "MockData" and vice versa
	 */
	CardPreview.prototype._toggleCurrentMode = function () {
		var sModes = this._getModes();
		if (sModes.indexOf("Abstract") > -1) {
			if (sModes.indexOf("Live") > -1) {
				this._currentMode = this._getCurrentMode() === "Abstract" ? "Live" : "Abstract";
			} else if (sModes.indexOf("MockData") > -1) {
				this._currentMode = this._getCurrentMode() === "Abstract" ? "MockData" : "Abstract";
			}
		}
	};

	/**
	 * toggles the current mode from "Abstract" to "Live" or "MockData" and vice versa
	 * @returns {sap.m.ToggleButton}
	 */
	 CardPreview.prototype._getModeToggleButton = function () {
		var oBundle = Library.getResourceBundleFor("sap.ui.integration");

		if (!this._oModeToggleButton) {
			this._oModeToggleButton = new ToggleButton();
			this._oModeToggleButton.setTooltip();
			this._oModeToggleButton.attachPress(function () {
				this._toggleCurrentMode();
				this.update();
			}.bind(this));
		}
		this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButton");
		this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonSpec");
		this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonFull");
		this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonFullSpec");
		this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonVerticalFull");
		this._oModeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewModeButtonVerticalFullSpec");
		var sLanguge = Localization.getLanguage().replaceAll('_', '-');
		if (this._getCurrentSize() === "Full") {
			var sPreviewPosition = this.getSettings().preview.position;
			if (sLanguge.startsWith("ar") || sLanguge.startsWith("he")) {
				// for the languages "ar-SA"(Arabic) and "he-IL"(Hebrew) which write from right to left, use spec style
				if (sPreviewPosition === "top" || sPreviewPosition === "bottom" || sPreviewPosition === "separate") {
					this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonVerticalFullSpec");
				} else {
					this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonFullSpec");
				}
			} else if (sPreviewPosition === "top" || sPreviewPosition === "bottom" || sPreviewPosition === "separate") {
				this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonVerticalFull");
			} else {
				this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonFull");
			}
		} else if (sLanguge.startsWith("ar") || sLanguge.startsWith("he")) {
			// for the languages "ar-SA"(Arabic) and "he-IL"(Hebrew) which write from right to left, use spec style
			this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButtonSpec");
		} else {
			this._oModeToggleButton.addStyleClass("sapUiIntegrationDTPreviewModeButton");
		}
		var tb = this._oModeToggleButton,
			currentMode = this._getCurrentMode();
		if (currentMode === "None") {
			tb.setVisible(false);
		}
		if (currentMode === "Abstract") {
			tb.setIcon("sap-icon://media-play");
			tb.setPressed(false);
			if (this._getModes().indexOf("MockData") > -1) {
				tb.setTooltip(oBundle.getText("CARDEDITOR_PREVIEW_BTN_MOCKDATAPREVIEW"));
			} else {
				tb.setTooltip(oBundle.getText("CARDEDITOR_PREVIEW_BTN_LIVEPREVIEW"));
			}
		} else if (currentMode === "Live" || currentMode === "MockData") {
			tb.setIcon("sap-icon://media-pause");
			tb.setPressed(true);
			tb.setTooltip(oBundle.getText("CARDEDITOR_PREVIEW_BTN_SAMPLEPREVIEW"));
		}
		return this._oModeToggleButton;
	};

	/**
	 * returns the current size of the preview, "Full" or "Normal"
	 */
	 CardPreview.prototype._getCurrentSize = function () {
		this._currentSize = this._currentSize || "Normal";
		var oSettings = this.getSettings();
		if (oSettings.preview.position && (oSettings.preview.position === "top" || oSettings.preview.position === "bottom" || oSettings.preview.position === "separate")) {
			this._currentSize = "Full";
		}
		return this._currentSize;
	};

	/**
	 * toggles the current mode from "Full" to "Nomal" and vice versa
	 */
	 CardPreview.prototype._toggleCurrentSize = function () {
		this._currentSize = this._currentSize !== "Normal" ? "Normal" : "Full";
		if (this._currentSize === "Normal") {
			this.getEditor().setWidth(this.getParentWidth());
			document.body.style.removeProperty("--sapUiIntegrationEditorPreviewWidth");
		} else {
			this.getEditor().setWidth("0");
			document.body.style.setProperty("--sapUiIntegrationEditorPreviewWidth", this.getParentWidth());
		}
	};

	/**
	 * toggles the current size from "Full" to "Normal" and vice versa
	 * @returns {sap.m.ToggleButton}
	 */
	 CardPreview.prototype._getResizeToggleButton = function () {
		var oBundle = Library.getResourceBundleFor("sap.ui.integration");

		if (!this._oSizeToggleButton) {
			this._oSizeToggleButton = new ToggleButton();
			this._oSizeToggleButton.setTooltip();
			this._oSizeToggleButton.attachPress(function () {
				this._toggleCurrentSize();
				this.update();
				this.getDomRef("before").focus();
			}.bind(this));
		}
		this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButton");
		this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonSpec");
		this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonFull");
		this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonFullSpec");
		this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonOnly");
		this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlySpec");
		this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlyFull");
		this._oSizeToggleButton.removeStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlyFullSpec");
		var sLanguge = Localization.getLanguage().replaceAll('_', '-');
		if (this._getModes() === "MockData" || this._getModes() === "Live") {
			if (this._getCurrentSize() === "Full") {
				if (sLanguge.startsWith("ar") || sLanguge.startsWith("he")) {
					this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlyFullSpec");
				} else {
					this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlyFull");
				}
			} else if (sLanguge.startsWith("ar") || sLanguge.startsWith("he")) {
				this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonOnlySpec");
			} else {
				this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonOnly");
			}
		} else {
			if (this._getCurrentSize() === "Full") {
				if (sLanguge.startsWith("ar") || sLanguge.startsWith("he")) {
					this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonFullSpec");
				} else {
					this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonFull");
				}
			} else if (sLanguge.startsWith("ar") || sLanguge.startsWith("he")) {
				// for the languages "ar-SA"(Arabic) and "he-IL"(Hebrew) which write from right to left, use spec style
				this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButtonSpec");
			} else {
				this._oSizeToggleButton.addStyleClass("sapUiIntegrationDTPreviewResizeButton");
			}
		}
		var tb = this._oSizeToggleButton,
			currentMode = this._getCurrentMode(),
			currenSize = this._getCurrentSize();
		if (currentMode === "None") {
			tb.setVisible(false);
		}
		if (currenSize === "Normal") {
			tb.setIcon("sap-icon://full-screen");
			tb.setPressed(false);
			tb.setTooltip(oBundle.getText("CARDEDITOR_PREVIEW_BTN_FULLSIZE"));
		} else if (currenSize === "Full") {
			tb.setIcon("sap-icon://exit-full-screen");
			tb.setPressed(true);
			tb.setTooltip(oBundle.getText("CARDEDITOR_PREVIEW_BTN_NORMALSIZE"));
		}
		return this._oSizeToggleButton;
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