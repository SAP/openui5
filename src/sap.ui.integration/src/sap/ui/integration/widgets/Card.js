/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/ui/integration/util/CardManifest",
	"sap/ui/integration/util/ServiceManager",
	"sap/base/Log",
	"sap/f/cards/Data",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/Header",
	"sap/f/cards/BaseContent",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/Icon",
	"sap/m/Text",
	"sap/f/CardRenderer"
], function (
	jQuery,
	Control,
	CardManifest,
	ServiceManager,
	Log,
	Data,
	NumericHeader,
	Header,
	BaseContent,
	HBox,
	VBox,
	Icon,
	Text,
	CardRenderer
) {
	"use strict";

	var MANIFEST_PATHS = {
		TYPE: "/sap.card/type",
		DATA: "/sap.card/data",
		HEADER: "/sap.card/header",
		CONTENT: "/sap.card/content",
		SERVICES: "/sap.ui5/services",
		APP_TYPE: "/sap.app/type"
	};

	/**
	 * Constructor for a new <code>Card</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that represents a small container with a header and content.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @constructor
	 * @since 1.62
	 * @alias sap.ui.integration.widgets.Card
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Card = Control.extend("sap.ui.integration.widgets.Card", /** @lends sap.ui.integration.widgets.Card.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			interfaces: ["sap.f.ICard"],
			properties: {

				/**
				 * The URL of the manifest or an object.
				 */
				manifest: {
					type: "any",
					defaultValue: ""
				},

				/**
				 * Defines the width of the card.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Appearance",
					defaultValue: "100%"
				},

				/**
				 * Defines the height of the card.
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Appearance",
					defaultValue: "auto"
				}
			},
			aggregations: {

				/**
				 * Defines the header of the card.
				 */
				_header: {
					type: "sap.f.cards.IHeader",
					multiple: false,
					visibility : "hidden"
				},

				/**
				 * Defines the content of the card.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility : "hidden"
				}
			},
			associations: {

				/**
				 * The ID of the host configuration.
				 */
				hostConfigurationId: {}
			}
		},
		renderer: CardRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	Card.prototype.init = function () {
		this.setBusyIndicatorDelay(0);
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
		if (this._oServiceManager) {
			this._oServiceManager.destroy();
			this._oServiceManager = null;
		}
	};

	/**
	 * Setter for card manifest.
	 *
	 * @public
	 * @param {string|Object} vValue The manifest object or its URL.
	 * @returns {sap.ui.integration.widgets.Card} Pointer to the control instance to allow method chaining.
	 */
	Card.prototype.setManifest = function (vValue) {
		this.setBusy(true);
		this.setProperty("manifest", vValue, true);

		if (typeof vValue === "string" && vValue !== "") {
			this._oCardManifest = new CardManifest();
			this._oCardManifest.load({ manifestUrl: vValue }).then(function () {
				this._applyManifestSettings();
			}.bind(this));
		} else if (typeof vValue === "object" && !jQuery.isEmptyObject(vValue)) {
			this._oCardManifest = new CardManifest(vValue);
			this._applyManifestSettings();
		}

		return this;
	};

	/**
	 * Apply all manifest settings after the manifest is fully ready.
	 * This includes service registration, header and content creation, data requests.
	 *
	 * @private
	 */
	Card.prototype._applyManifestSettings = function () {
		if (this._oCardManifest.get(MANIFEST_PATHS.APP_TYPE) !== "card") {
			Log.error("sap.app/type entry in manifest is not 'card'");
		}

		this._registerServices();
		this._setData();
		this._setHeaderFromManifest();
		this._setContentFromManifest();
	};

	Card.prototype._setData = function () {
		var oData = this._oCardManifest.get(MANIFEST_PATHS.DATA);
		if (!oData) {
			this._oDataPromise = null;
			return;
		}

		// Do request and set to the model
		this._oDataPromise = new Promise(function (resolve, reject) {

			var oRequest = oData.request;

			if (oData.json) {
				resolve({
					json: oData.json,
					path: oData.path
				});
				return;
			}

			if (oRequest) {
				Data.fetch(oRequest).then(function (data) {
					resolve({
						json: data,
						path: oData.path
					});
				}).catch(function (oError) {
					reject(oError);
				});
			}

			// TODO: Service implementation on Card level
		});
	};

	/**
	 * Register all required services in the ServiceManager based on the card manifest.
	 *
	 * @private
	 */
	Card.prototype._registerServices = function () {
		var oServiceFactoryReferences = this._oCardManifest.get(MANIFEST_PATHS.SERVICES);
		if (!oServiceFactoryReferences) {
			return;
		}

		if (!this._oServiceManager) {
			this._oServiceManager = new ServiceManager(oServiceFactoryReferences, this);
		}

		var oHeader = this._oCardManifest.get(MANIFEST_PATHS.HEADER);
		var oContent = this._oCardManifest.get(MANIFEST_PATHS.CONTENT);

		var bHeaderWithServiceNavigation = oHeader
			&& oHeader.actions
			&& oHeader.actions[0].service
			&& oHeader.actions[0].type === "Navigation";

		// TODO: Improve... Need to decide if card or content will be responsible for the actions and their parsing.
		var bContentWithServiceNavigation = oContent
			&& oContent.item
			&& oContent.item.actions
			&& oContent.item.actions[0].service
			&& oContent.item.actions[0].type === "Navigation";

		var bContentWithDataService = oContent
			&& oContent.data
			&& oContent.data.service;

		if (bHeaderWithServiceNavigation) {
			this._oServiceManager.registerService(oHeader.actions[0].service, "sap.ui.integration.services.Navigation");
		}

		if (bContentWithServiceNavigation) {
			this._oServiceManager.registerService(oContent.item.actions[0].service, "sap.ui.integration.services.Navigation");
		}

		if (bContentWithDataService) {
			this._oServiceManager.registerService(oContent.data.service, "sap.ui.integration.services.Data");
		}
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @returns {sap.f.cards.IHeader} The header of the card
	 * @protected
	 */
	Card.prototype.getCardHeader = function () {
		return this.getAggregation("_header");
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @returns {sap.ui.core.Control} The content of the card
	 * @protected
	 */
	Card.prototype.getCardContent = function () {
		return this.getAggregation("_content");
	};

	/**
	 * Lazily load and create a specific type of card header based on sap.card/header part of the manifest
	 *
	 * @private
	 */
	Card.prototype._setHeaderFromManifest = function () {
		var oManifestHeader = this._oCardManifest.get(MANIFEST_PATHS.HEADER);

		if (!oManifestHeader) {
			Log.error("Card header is mandatory!");
			return;
		}

		var oHeader = Header;

		if (oManifestHeader.type === "Numeric") {
			oHeader = NumericHeader;
		}

		this._setCardHeaderFromManifest(oHeader);
	};

	/**
	 * Lazily load and create a specific type of card content based on sap.card/content part of the manifest
	 *
	 * @private
	 */
	Card.prototype._setContentFromManifest = function () {
		var sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE),
			bHasContent = !!this._oCardManifest.get(MANIFEST_PATHS.CONTENT);

		if (!sCardType) {
			Log.error("Card type property is mandatory!");
			return;
		}

		if (!bHasContent && sCardType.toLowerCase() !== "component") {
			this.setBusy(false);
			return;
		}

		this._setTemporaryContent();

		switch (sCardType.toLowerCase()) {
			case "list":
				sap.ui.require(["sap/f/cards/ListContent"], this._setCardContentFromManifest.bind(this));
				break;
			case "table":
				sap.ui.require(["sap/f/cards/TableContent"], this._setCardContentFromManifest.bind(this));
				break;
			case "object":
				sap.ui.require(["sap/f/cards/ObjectContent"], this._setCardContentFromManifest.bind(this));
				break;
			case "analytical":
				sap.ui.getCore().loadLibrary("sap.viz", {
					async: true
				}).then(function () {
					sap.ui.require(["sap/f/cards/AnalyticalContent"], this._setCardContentFromManifest.bind(this));
				}.bind(this)).catch(function () {
					this._handleError("Analytical type card is not available with this distribution");
				}.bind(this));
				break;
			case "timeline":
				sap.ui.getCore().loadLibrary("sap.suite.ui.commons", { async: true }).then(function() {
					sap.ui.require(["sap/f/cards/TimelineContent"], this._setCardContentFromManifest.bind(this));
				}.bind(this)).catch(function () {
					this._handleError("Timeline type card is not available with this distribution");
				}.bind(this));
				break;
			case "component":
				sap.ui.require(["sap/f/cards/ComponentContent"], this._setCardContentFromManifest.bind(this));
				break;
			default:
				Log.error(sCardType.toUpperCase() + " Card type is not supported");
		}
	};

	/**
	 * Creates a header based on sap.card/header part of the manifest
	 *
	 * @private
	 * @param {sap.f.cards.IHeader} CardHeader The header to be created
	 */
	Card.prototype._setCardHeaderFromManifest = function (CardHeader) {
		var oClonedSettings = jQuery.extend(true, {}, this._oCardManifest.get(MANIFEST_PATHS.HEADER));
		var oHeader = CardHeader.create(oClonedSettings, this._oServiceManager);

		oHeader.attachEvent("_updated", function () {
			this.fireEvent("_headerUpdated");
			this.setBusy(false);
		}.bind(this));
		oHeader.attachEvent("onAction", function (oEvent) {
			this.fireEvent("onAction", {
				manifestParameters: oEvent.getParameter("manifestParameters"),
				semanticObject: oEvent.getParameter("semanticObject"),
				type: oEvent.getParameter("type")
			});
		}.bind(this));

		if (!oClonedSettings.data || (oClonedSettings.data && oClonedSettings.data.json)) {
			var oDelegate = {
				onAfterRendering: function () {
					this.fireEvent("_headerUpdated");
					oHeader.removeEventDelegate(oDelegate);
					this.setBusy(false);
				}
			};
			oHeader.addEventDelegate(oDelegate, this);
		}

		if (Array.isArray(oClonedSettings.actions) && oClonedSettings.actions.length > 0) {
			//this._setCardHeaderActions(oHeader, oClonedSettings.actions);
			oHeader._attachActions(oClonedSettings);
		}

		this.setAggregation("_header", oHeader);

		// TODO: Refactor. All headers should have a _setData function. Move to a BaseHeader class. Remove type checking.
		if (this._oDataPromise) {
			this._oDataPromise.then(function (oData) {
				if (oHeader.isA("sap.f.cards.NumericHeader")) {
					sap.f.cards.NumericHeader._handleData(oHeader, oData);
				} else {
					sap.f.cards.Header._handleData(oHeader, oData);
				}
			}).catch(function (oError) {
				// TODO: Handle error
			});
		}
	};

	/**
	 * Called on before rendering of the control.
	 * @private
	 */
	Card.prototype.onBeforeRendering = function () {
		var sConfig = this.getHostConfigurationId();
		if (sConfig) {
			this.addStyleClass(sConfig.replace(/-/g, "_"));
		}
	};

	/**
	 * Instantiate a specific type of card content and set it as aggregation.
	 *
	 * @private
	 * @param {sap.ui.core.Control} CardContent The content to be created
	 */
	Card.prototype._setCardContentFromManifest = function (CardContent) {
		var mSettings = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
			sType = this._oCardManifest.get(MANIFEST_PATHS.TYPE).toLowerCase();

		if (!mSettings && sType === "component") {
			mSettings = this._oCardManifest.getJson();
		}

		var oClonedSettings = { configuration: jQuery.extend(true, {}, mSettings) };

		if (this._oServiceManager) {
			oClonedSettings.serviceManager = this._oServiceManager;
		}

		var oContent = new CardContent(oClonedSettings);
		oContent.attachEvent("_updated", function () {
			this.fireEvent("_contentUpdated");
			this.setBusy(false);
		}.bind(this));

		oContent.attachEvent("onAction", function (oEvent) {
			this.fireEvent("onAction", {
				manifestParameters: oEvent.getParameter("manifestParameters"),
				semanticObject: oEvent.getParameter("semanticObject"),
				type: oEvent.getParameter("type")
			});
		}.bind(this));

		oContent.attachEvent("_error", function (oEvent) {
			this._handleError(oEvent.getParameter("logMessage"), oEvent.getParameter("displayMessage"));
		}.bind(this));

		oContent.setBusyIndicatorDelay(0);
		// TO DO: decide if we want to set the content only on _updated event.
		// This will help to avoid appearance of empty table before its data comes,
		// but prevent ObjectContent to render its template, which might be useful
		this.setAggregation("_content", oContent);

		if (this._oDataPromise) {
			this._oDataPromise.then(function (oData) {
				this.setBusy(false);
				oContent._setData(oData);
			}.bind(this)).catch(function (oError) {
				this._handleError(oError);
			}.bind(this));
		}
	};

	/**
	 * Sets a temporary content that will show a busy indicator while the actual content is loading.
	 */
	Card.prototype._setTemporaryContent = function () {

		var oHBox = new HBox({ busy: true, busyIndicatorDelay: 0, height: "100%" });

		oHBox.addEventDelegate({
			onAfterRendering: function () {
				if (!this._oCardManifest) {
					return;
				}

				var sType = this._oCardManifest.get(MANIFEST_PATHS.TYPE) + "Content",
					oContent = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
					sHeight = BaseContent.getMinHeight(sType, oContent);

					oHBox.$().css({ "min-height": sHeight });
			}
		}, this);

		this.setAggregation("_content", oHBox);
	};

	/**
	 * Handler for error states
	 *
	 * @param {string} sLogMessage Message that will be logged.
	 * @param {string} [sDisplayMessage] Message that will be displayed in the card's content. If not provided, a default message is displayed.
	 * @private
	 */
	Card.prototype._handleError = function (sLogMessage, sDisplayMessage) {
		Log.error(sLogMessage);
		this.setBusy(false);

		this.fireEvent("_error");

		var sDefaultDisplayMessage = "Unable to load the data.",
			sErrorMessage = sDisplayMessage || sDefaultDisplayMessage;

		var oError = new HBox({
			height: "100%",
			justifyContent: "Center",
			items: [
				new VBox({
					justifyContent: "Center",
					alignItems: "Center",
					items: [
						new Icon({ src: "sap-icon://message-error", size: "1rem" }).addStyleClass("sapUiTinyMargin"),
						new Text({ text: sErrorMessage })
					]
				})
			]
		});

		oError.addEventDelegate({
			onAfterRendering: function () {
				if (!this._oCardManifest) {
					return;
				}

				var sType = this._oCardManifest.get(MANIFEST_PATHS.TYPE) + "Content",
					oContent = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
					sHeight = BaseContent.getMinHeight(sType, oContent);

					oError.$().css({ "min-height": sHeight });
			}
		}, this);

		this.setAggregation("_content", oError);
	};

	return Card;
});