/*!
 * ${copyright}
 */
// Provides control sap.f.Card.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/Manifest",
	"sap/f/CardManifest",
	"sap/base/Log",
	"sap/f/CardRenderer",
	"sap/m/Text",
	"sap/f/Avatar"
], function (
	library,
	Control,
	Manifest,
	CardManifest,
	Log,
	CardRenderer,
	Text,
	Avatar
) {
	"use strict";

	var aCardContentTypes = ["List", "KPI", "Table"];

	/**
	 * Constructor for a new <code>Card</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that represents header and content area as a card. Content area of a card should use controls or component located in the sub package sal.f.cardcontents.
	 *
	 * <h3>Overview</h3>
	 *
	 * The control consist of a header and content section
	 *
	 * <h3>Usage</h3>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @experimental
	 * @since 1.60
	 * @see {@link TODO Card}
	 * @alias sap.f.Card
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
		//raster size
	var Card = Control.extend("sap.f.Card", /** @lends sap.f.Card.prototype */ {
			metadata: {
				library: "sap.f",
				properties: {

					/**
					 * Reference path to the manifest as string or a JSON object representing the manifest data for the card
					 * and the card content.
					 * Properties that are set directly on the Card will win over the settings in the manifest.
					 * Example manifest JSON for a ListCard
					 * <pre>
					 * {
					 *    "sap.app" : {
					 *        "type" : "card"
					 *    }
					 *    "sap.card" : {
					 *       "title": "Card Title",
					 *       "subTitle": "Card Subtitle",
					 *       "icon": "sap-icon://accept",
					 *       "iconColor" : "green",
					 *       //other properties from the Card interface (metadata)
					 *       "type": "ListCard",
					 *       "settings": {
					 *          //settings for the card type
					 *       }
					 *    }
					 * }</pre>
					 */
					manifest: {
						type: "any",
						defaultValue: ""
					}

				},
				aggregations: {
					/**
					 * @private
					 */
					_content: {
						multiple: false,
						visibility: "hidden"
					}

				},
				events: {
					/*
					ready: {},
					contentRequested: {},
					contentReady: {},
					*/
				}
			}
		});

	/**
	 * Initializes the control
	 * @private
	 */
	Card.prototype.init = function() {
	};

	/**
	 * Called on destroying the control
	 * @private
	 */
	Card.prototype.exit = function () {
		if (this._oCardManifest) {
			this._oCardManifest.destroy();
			this._oCardManifest = null;
		}
	};
	/**
	 * Looks up the a dom element for a given selector within the card exluding the content node.
	 * If found calls the fnModify passing the dom element
	 * @private
	 */
	Card.prototype.modifyDomRef = function (sSelector, fnModify) {
		var oDomRef = this.getDomRef(),
			oContentDomRef = this.getDomRef("content");
		if (oDomRef) {
			oDomRef = sSelector ? oDomRef.querySelector(sSelector) : oDomRef;
			if (oDomRef &&
				((oContentDomRef && !oContentDomRef.contains(oDomRef)) ||
					!oContentDomRef)) {
				fnModify(oDomRef);
			}
		}
		return this;
	};

	Card.prototype.setManifest = function (vValue) {
		this.setBusy(true);
		var oCurrentContent = this.getAggregation("_content");
		oCurrentContent && oCurrentContent.destroy("keepDom");
		this.setProperty("manifest", vValue, true);
		if (typeof vValue === "string") {
			this.initComponent(vValue);
		} else if (typeof vValue === "object") {
			this._oCardManifest = new CardManifest(vValue);
			this.applyManifestSettings();
		}
		return this;
	};

	Card.prototype.setContent = function (oContent) {
		// TODO: Ensure the content is not invalidated all the time.
		// Same goes for the header information.
		this.setAggregation("_content", oContent);
	};

	Card.prototype.exit = function () {
		if (this._oCardManifest) {
			this._oCardManifest.destroy();
			this._oCardManifest = null;
		}
	};

	Card.prototype.initComponent = function (sComponentName) {
		var sUrl = jQuery.sap.getModulePath(sComponentName) + "/manifest.json",
			oPromise = Manifest.load({
				manifestUrl: sUrl,
				async: true
			});

		oPromise.then(function (oManifest) {
			var oJson = oManifest._oRawManifest;
			this._oCardManifest = new CardManifest(oJson);
			oManifest._loadI18n(true).then(function (oBundle) {
				this._oCardManifest.registerTranslator(oBundle);
				if (this._oCardManifest.get("sap.app/type") !== "card") {
					throw Error("sap.app/type entry in manifest is not 'card'");
				}
				this.applyManifestSettings(sComponentName);
			}.bind(this));
		}.bind(this));
	};

	Card.prototype._setPropertyFromManifest = function (sProperty, sFromPath, sFromAlternativePath) {
		if (this._oCardManifest && this.isPropertyInitial(sProperty)) {
			var vValue;
			if (sFromPath) {
				vValue = this._oCardManifest.get("sap.card/" + sFromPath);
				if (!vValue && sFromAlternativePath) {
					vValue = this._oCardManifest.get("sap.card/" + sFromAlternativePath);
				}
			} else {
				vValue = this._oCardManifest.get("sap.card/" + sProperty);
			}
		}
	};

	Card.prototype.setBusy = function (bValue) {
		this.setProperty("busy", bValue, true);
		this.modifyDomRef(null, function (oDomRef) {
			if (bValue === true) {
				oDomRef.classList.add("sapFCardLoading");
			} else {
				oDomRef.classList.remove("sapFCardLoading");
			}
		});
		return this;
	};

	Card.prototype.applyManifestSettings = function (sComponentName) {

		this._createTitle();
		this._createSubTitle();
		this._createAvatar();

		this._setPropertyFromManifest("subTitle");
		this._setPropertyFromManifest("icon");
		this._setPropertyFromManifest("iconColor");
		this._setPropertyFromManifest("iconBackgroundColor");
		this._setPropertyFromManifest("backgroundColor");
		this._setPropertyFromManifest("color");
		this._setPropertyFromManifest("backgroundImage");
		this._setPropertyFromManifest("backgroundSize");

		this._setContent(sComponentName);
	};

	Card.prototype._setContent = function (sComponentName) {
		var sCardType = this._oCardManifest.get("sap.card/type");

		if (sCardType === "CustomCard" && sComponentName) {
			sap.ui.require(["sap/ui/core/ComponentContainer"], function (ComponentContainer) {
				var oContent = new ComponentContainer({
					name: sComponentName,
					async: true,
					manifest: this._oCardManifest.getJson(),
					settings: {}
				});
				this.setContent(oContent);
				this.setBusy(false);
			}.bind(this));
		} else if (aCardContentTypes.indexOf(sCardType) > -1) {
			sap.ui.require(["sap/f/cards/content/" + sCardType], function (CardContent) {
				var mSettings = this._oCardManifest.get("sap.card/content");
				var oClonedSettings = jQuery.extend(true, {}, mSettings);
				var oContent = new CardContent(oClonedSettings);
				this.setContent(oContent);
				this.setBusy(false);
			}.bind(this));
		}
	};

	Card.prototype._createTitle = function () {
		if (!this._oTitle) {
			this._oTitle = new Text({
				id: this.getId() + "-title",
				maxLines: 3,
				text: this._oCardManifest.get("sap.card/title")
			}).addStyleClass("sapFCardTitle");
		}

		return this;
	};

	Card.prototype._createSubTitle = function () {
		if (!this._oSubTitle) {
			this._oSubTitle = new Text({
				id: this.getId() + "-subTitle",
				maxLines: 3,
				text: this._oCardManifest.get("sap.card/subTitle")
			}).addStyleClass("sapFCardSubtitle");
		}

		return this;
	};

	Card.prototype._createAvatar = function () {
		if (!this._oAvatar) {
			this._oAvatar = new Avatar({
				id: this.getId() + "-avatar",
				src: this._oCardManifest.get("sap.card/icon/src")
			}).addStyleClass("sapFCardIcon");
			var sDisplayShape = this._oCardManifest.get("sap.card/icon/displayShape");

			if (sDisplayShape) {
				this._oAvatar.setDisplayShape(sDisplayShape);
			}
		}

		return this;
	};
	return Card;
});
