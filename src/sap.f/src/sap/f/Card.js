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
	"sap/f/Avatar",
	"sap/ui/Device"
], function (
	library,
	Control,
	Manifest,
	CardManifest,
	Log,
	CardRenderer,
	Text,
	Avatar,
	Device
) {
	"use strict";
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
					 *       "subtitle": "Card Subtitle",
					 *       "icon": {
					 *          "src": "sap-icon://accept"
					 *       },
					 *       //Available type cards [Analytical, List]
					 *       "type": "List",
					 *       "status": "Count",
					 *       "content": {
					 *          //content depending on the type of the Card
					 *       }
					 *    }
					 * }</pre>
					 */
					manifest: {
						type: "any",
						defaultValue: ""
					},

					/**
					 * Defines the width of the Card
					 *
					 * <b>Note:</b> If no width is set, sap.f.Card will take 100% of its parent container
					 * @since 1.61
					 */
					width : {
						type : "sap.ui.core.CSSSize",
						group : "Appearance",
						defaultValue : "100%"
					},

					/**
					 * Defines the height of the Card
					 *
					 * <b>Note:</b> If no height is set, sap.f.Card will take 100% of its parent container
					 * @since 1.61
					 */
					height : {
						type : "sap.ui.core.CSSSize",
						group : "Appearance",
						defaultValue : "100%"
					}

				},
				aggregations: {
					/**
					 * @private
					 */
					_header: {
						multiple: false,
						visibility: "hidden"
					},

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
	 * Called after control is rendered.
	 * @private
	 */
	Card.prototype.onAfterRendering = function() {
		//TODO performance will be afected, but text should clamp on IE also - TBD
		if (Device.browser.msie) {
			this._oTitle.clampText();
			this._oSubTitle.clampText();
		}
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

		if (this._oTitle) {
			this._oTitle.destroy();
			this._oTitle = null;
		}

		if (this._oSubTitle) {
			this._oSubTitle.destroy();
			this._oSubTitle = null;
		}

		if (this._oAvatar) {
			this._oAvatar.destroy();
			this._oAvatar = null;
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

		this._createHeader();

		// TODO move subtitle (and any other which should be there) to _createHeader()
		this._setPropertyFromManifest("subtitle");
		this._setPropertyFromManifest("icon");
		this._setPropertyFromManifest("iconColor");
		this._setPropertyFromManifest("iconBackgroundColor");
		this._setPropertyFromManifest("backgroundColor");
		this._setPropertyFromManifest("color");
		this._setPropertyFromManifest("backgroundImage");
		this._setPropertyFromManifest("backgroundSize");

		this._setContent(sComponentName);
	};

	Card.prototype._createHeader = function (oHeader) {
		// TODO This is an experimenal implementation for different header types. Old header definition is still valid

		var oHeader = this._oCardManifest.get("sap.card/header");

		if (oHeader && oHeader.type) {

			// implementation with different header types
			switch (oHeader.type) {
				case "kpi": sap.ui.require(["sap/f/cards/header/Kpi"], this._setCardHeader.bind(this));
					break;
				default: {
					Log.error("Header type '" + oHeader.type + "' was not recognised.", "sap.f.Card");
				}
			}

		} else {

			// the default implementation - no header types
			this._createTitle();
			this._createSubTitle();
			this._createAvatar();

		}
	};

	Card.prototype._setCardHeader = function(CardHeader) {
		var mSettings = this._oCardManifest.get("sap.card/header");
		var oClonedSettings = jQuery.extend(true, {}, mSettings);

		// we don't want to pass type to the header control
		delete oClonedSettings.type; // TODO

		var oHeader = new CardHeader(oClonedSettings);
		this.setAggregation("_header", oHeader); // TODO do the same way as content? with setHeader
		this.setBusy(false);
	};

	Card.prototype._setContent = function (sComponentName) {
		var sCardType = this._oCardManifest.get("sap.card/type");

		if (!sCardType) {
			Log.error("Card type property is mandatory!");
			return;
		}

		if (sCardType === "CustomCard" && sComponentName) {
			sap.ui.require(["sap/ui/core/ComponentContainer"], function (ComponentContainer) {
				var oContent = new ComponentContainer({
					name: sComponentName,
					async: true,
					manifest: this._oCardManifest.getJson(),
					settings: {}
				});
				this.setContent(oContent);
			});
		} else {
			switch (sCardType.toLowerCase()) {
			case "list":  sap.ui.require(["sap/f/cards/content/List"], this._setCardContent.bind(this));
				break;
			case "table": sap.ui.require(["sap/f/cards/content/Table"], this._setCardContent.bind(this));
				break;
			case "analytical":
				sap.ui.getCore().loadLibrary("sap.viz", {async: true}).then(function() {
					sap.ui.require(["sap/f/cards/content/Analytical"], this._setCardContent.bind(this));
				}.bind(this)).catch(function () {
					Log.error("Analytical type card is not available with this distribution");
				});
				break;
			}
		}
	};

	Card.prototype._setCardContent = function(CardContent) {
		var mSettings = this._oCardManifest.get("sap.card/content");
		var oClonedSettings = jQuery.extend(true, {}, mSettings);
		var oContent = new CardContent(oClonedSettings);
		this.setContent(oContent);
		this.setBusy(false);
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
				id: this.getId() + "-subtitle",
				maxLines: 2,
				text: this._oCardManifest.get("sap.card/subtitle")
			}).addStyleClass("sapFCardSubtitle");
		}

		return this;
	};

	Card.prototype._createAvatar = function () {
		if (!this._oAvatar) {
			this._oAvatar = new Avatar({
				id: this.getId() + "-avatar"
			}).addStyleClass("sapFCardIcon");
			var sDisplayShape = this._oCardManifest.get("sap.card/icon/displayShape"),
				sAvatarSrc = this._oCardManifest.get("sap.card/icon/src"),
				sAvatarInitials = this._oCardManifest.get("sap.card/icon/initials");

			if (sAvatarSrc) {
				this._oAvatar.setSrc(sAvatarSrc);
			} else if (sAvatarInitials) {
				this._oAvatar.setInitials(sAvatarInitials);
			}
			if (sDisplayShape) {
				this._oAvatar.setDisplayShape(sDisplayShape);
			}
		}

		return this;
	};

	return Card;
});
