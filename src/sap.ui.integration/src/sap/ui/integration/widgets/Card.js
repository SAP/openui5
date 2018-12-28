/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Manifest",
	"sap/ui/integration/widgets/CardManifest",
	"sap/base/Log",
	"sap/f/CardRenderer"
], function (
	Control,
	Manifest,
	CardManifest,
	Log,
	CardRenderer
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
	 * @alias sap.ui.integration.widgets.Card
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Card = Control.extend("sap.ui.integration.widgets.Card", /** @lends sap.ui.integration.widgets.Card.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			interfaces: ["sap.f.ICard"],
			properties: {

				manifest: { type: "any", defaultValue: "" },

				/**
				 * Defines the width of the Card
				 *
				 * @since 1.61
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "auto" },

				/**
				 * Defines the height of the Card
				 *
				 * @since 1.61
				 */
				height: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "auto" }
			},
			aggregations: {
				_header: { type: "sap.f.cards.IHeader", multiple: false },
				_content: { type: "sap.ui.core.Control", multiple: false }
			}
		},
		renderer: CardRenderer
	});

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

	Card.prototype.setManifest = function (vValue) {
		this.setBusy(true);
		this.setProperty("manifest", vValue, true);
		if (typeof vValue === "string") {
			this.initManifest(vValue).then(function () {
				this._applyManifestSettings();
			}.bind(this));
		} else if (typeof vValue === "object") {
			this._oCardManifest = new CardManifest(vValue);
			this._applyManifestSettings();
		}
		return this;
	};

	Card.prototype.initManifest = function (sManifestUrl) {
		var oPromise = Manifest.load({
			manifestUrl: sManifestUrl,
			async: true
		});

		return oPromise.then(function (oManifest) {
			var oJson = oManifest._oRawManifest;
			this._oCardManifest = new CardManifest(oJson);
			return oManifest._loadI18n(true).then(function (oBundle) {
				this._oCardManifest.registerTranslator(oBundle);
				if (this._oCardManifest.get("sap.app/type") !== "card") {
					throw Error("sap.app/type entry in manifest is not 'card'");
				}
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Apply all manifest settings after the manifest is fully ready
	 */
	Card.prototype._applyManifestSettings = function () {
		this._setHeaderFromManifest();
		this._setContentFromManifest();
	};

	Card.prototype._getHeader = function () {
		return this.getAggregation("_header");
	};

	Card.prototype._getContent = function () {
		return this.getAggregation("_content");
	};

	Card.prototype._setHeaderFromManifest = function () {
		var oHeader = this._oCardManifest.get("sap.card/header");

		if (!oHeader) {
			Log.error("Card header is mandatory!");
			return;
		}

		if (oHeader.type === "numeric") {
			sap.ui.require(["sap/f/cards/NumericHeader"], this._setCardHeaderFromManifest.bind(this));
		} else {
			sap.ui.require(["sap/f/cards/Header"], this._setCardHeaderFromManifest.bind(this));
		}
	};

	Card.prototype._setContentFromManifest = function () {
		var sCardType = this._oCardManifest.get("sap.card/type");

		if (!sCardType) {
			Log.error("Card type property is mandatory!");
			return;
		}

		switch (sCardType.toLowerCase()) {
			case "list":  sap.ui.require(["sap/f/cards/ListContent"], this._setCardContentFromManifest.bind(this));
				break;
			case "table": sap.ui.require(["sap/f/cards/TableContent"], this._setCardContentFromManifest.bind(this));
				break;
			case "analytical":
				sap.ui.getCore().loadLibrary("sap.viz", { async: true }).then(function() {
					sap.ui.require(["sap/f/cards/AnalyticalContent"], this._setCardContentFromManifest.bind(this));
				}.bind(this)).catch(function () {
					Log.error("Analytical type card is not available with this distribution");
				});
				break;
		}
	};

	Card.prototype._setCardHeaderFromManifest = function (CardHeader) {
		var oClonedSettings = jQuery.extend(true, {}, this._oCardManifest.get("sap.card/header")),
			sType = oClonedSettings.type;

		delete oClonedSettings.type;

		if (oClonedSettings.icon) {
			oClonedSettings.iconSrc = oClonedSettings.icon.src;
			oClonedSettings.iconDisplayShape = oClonedSettings.icon.shape;
			oClonedSettings.iconInitials = oClonedSettings.icon.text;
			delete oClonedSettings.icon;
		}

		if (oClonedSettings.status) {
			oClonedSettings.statusText = oClonedSettings.status.text;
			delete oClonedSettings.status;
		}

		if (sType === "numeric") {
			this.setAggregation("_header", new CardHeader({
				configuration: oClonedSettings // TODO change when the final approach is cleared
			}));
		} else {
			this.setAggregation("_header", new CardHeader(oClonedSettings));
		}
	};

	Card.prototype._setCardContentFromManifest = function(CardContent) {
		var mSettings = this._oCardManifest.get("sap.card/content");
		var oClonedSettings = {
			configuration: jQuery.extend(true, {}, mSettings)
		};
		var oContent = new CardContent(oClonedSettings);
		this.setAggregation("_content", oContent);
		this.setBusy(false);
	};

	return Card;
});
