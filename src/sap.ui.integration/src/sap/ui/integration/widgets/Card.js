/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/integration/util/Manifest",
	"sap/ui/integration/util/ServiceManager",
	"sap/base/Log",
	"sap/ui/integration/cards/DataProviderFactory",
	"sap/ui/integration/cards/BaseContent",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/Icon",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/base/util/LoaderExtensions",
	"sap/f/CardRenderer",
	"sap/f/library",
	"sap/ui/integration/library",
	"sap/ui/core/InvisibleText",
	"sap/ui/integration/util/Destinations",
	"sap/f/cards/loading/LoadingProvider",
	"sap/ui/integration/util/HeaderFactory",
	"sap/ui/integration/util/ContentFactory"
], function (
	jQuery,
	Core,
	Control,
	CardManifest,
	ServiceManager,
	Log,
	DataProviderFactory,
	BaseContent,
	HBox,
	VBox,
	Icon,
	Text,
	JSONModel,
	ResourceModel,
	LoaderExtensions,
	CardRenderer,
	fLibrary,
	library,
	InvisibleText,
	Destinations,
	LoadingProvider,
	HeaderFactory,
	ContentFactory
) {
	"use strict";
	/* global Map */

	var MANIFEST_PATHS = {
		TYPE: "/sap.card/type",
		DATA: "/sap.card/data",
		HEADER: "/sap.card/header",
		HEADER_POSITION: "/sap.card/headerPosition",
		CONTENT: "/sap.card/content",
		SERVICES: "/sap.ui5/services",
		APP_TYPE: "/sap.app/type",
		PARAMS: "/sap.card/configuration/parameters"
	};

	var HeaderPosition = fLibrary.cards.HeaderPosition;

	var CardDataMode = library.CardDataMode;

	/**
	 * Constructor for a new <code>Card</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that represents a container with a header and content.
	 *
	 * <h3>Overview</h3>
	 * Cards are small user interface elements which provide the most important information from an
	 * app, related to a specific role or task. The information is represented in a compact manner, allowing for actions to be executed.
	 * Cards can be described as small representations of an app which can be integrated in different systems.
	 *
	 * The integration card is defined in a declarative way, using a manifest.json to be:
	 * <ul>
	 * <li>Easily integrated into apps</li>
	 * <li>Easily reused across apps</li>
	 * <li>Understandable by other technologies</li>
	 * <li>Self-contained (has a built-in functionality and doesn't need external configuration)</li>
	 * <li>Dynamic parameter handling</li>
	 * <li>Clear separation of the roles of the card and app developers</li>
	 * </ul>
	 *
	 * The role of the card developer is to describe the card in a manifest.json file and define:
	 * <ul>
	 * <li>Header</li>
	 * <li>Content</li>
	 * <li>Data source</li>
	 * <li>Possible actions</li>
	 * </ul>
	 *
	 * The role of the app developer is to integrate the card into the app and define:
	 * <ul>
	 * <li>The dimensions of the card inside a layout of choice, using the <code>width</code> and <code>height</code> properties</li>
	 * <li>The behavior for the actions described in the manifest.json file, using the action event</li>
	 * </ul>
	 *
	* <strong>You can learn more about integration cards in the <a href="test-resources/sap/ui/integration/demokit/cardExplorer/index.html">Card Explorer</a></strong>
	 *
	 * <i>When to use</i>
	 * <ul>
	 * <li>When you want to reuse the card across apps.</li>
	 * <li>When you need easy integration and configuration.</li>
	 * </ul>
	 *
	 * <i>When not to use</i>
	 * <ul>
	 * <li>When you need more header and content flexibility.</li>
	 * <li>When you have to achieve simple card visualization. For such cases, use: {@link sap.f.Card sap.f.Card}.</li>
	 * <li>When you have to use an application model. For such cases, use: {@link sap.f.Card sap.f.Card}.</li>
	 * <li>When you need complex behavior. For such cases, use: {@link sap.f.Card sap.f.Card}.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @constructor
	 * @see {@link topic:5b46b03f024542ba802d99d67bc1a3f4 Cards}
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
				 * The parameters used in the manifest.
				 * @experimental Since 1.65. This property might be changed in future.
				 */
				parameters: {
					type: "object",
					defaultValue: null
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
				},

				/**
				 * Defines the state of the <code>Card</code>. When set to <code>Inactive</code>, the <code>Card</code> doesn't make requests.
				 * @experimental Since 1.65
				 * @since 1.65
				 */
				dataMode: {
					type: "sap.ui.integration.CardDataMode",
					group: "Behavior",
					defaultValue: CardDataMode.Active
				},

				/**
				 * Defines the base URL of the Card Manifest. It should be used when manifest property is an object instead of a URL.
				 * @experimental Since 1.70
				 * @since 1.70
				 */
				baseUrl: {
					type: "sap.ui.core.URI",
					defaultValue: null
				},

				/**
				 * Defines a list of configuration settings, which will be merged into the original manifest.
				 *
				 * This can be a list of flexibility changes generated during designtime.
				 *
				 * Each level of changes is an item in the list. The change has property "content" which contains the configuration, which will be merged on top of the original <code>sap.card</code> section.
				 *
				 * Example:
				 * <pre>
				 * [
				 *     {"content": {"header": {"title": "My title"}}},
				 *     {"content": {"header": {"title": "My new title"}}}
				 * ]
				 * </pre>
				 *
				 * @experimental Since 1.76 This api might be removed when a permanent solution for flexibility changes is implemented.
				 * @since 1.76
				 */
				manifestChanges: {
					type: "object[]"
				}
			},
			aggregations: {

				/**
				 * Defines the header of the card.
				 */
				_header: {
					type: "sap.f.cards.IHeader",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Defines the content of the card.
				 */
				_content: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				}
			},
			events: {

				/**
				 * Fired when an action is triggered on the card.
				 * @experimental since 1.64
				 * Disclaimer: this event is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				action: {
					allowPreventDefault: true,
					parameters: {

						/**
						 * The action source.
						 */
						actionSource: {
							type: "sap.ui.core.Control"
						},

						/**
						 * The manifest parameters related to the triggered action.
						 * @deprecated Since 1.76 Use the <code>parameters</code> parameter instead.
						 */
						manifestParameters: {
							type: "object"
						},

						/**
						 * The parameters related to the triggered action.
						 * @since 1.76
						 */
						parameters: {
							type: "object"
						},

						/**
						 * The type of the action.
						 */
						type: {
							type: "sap.ui.integration.CardActionType"
						}
					}
				},

				/**
				 * Fired when the manifest is loaded.
				 * @experimental since 1.72
				 */
				manifestReady: {
					parameters: {}
				}
			},
			associations: {

				/**
				 * The ID of the host configuration.
				 */
				hostConfigurationId: {},

				/**
				 * The host.
				 */
				host: {}
			}
		},
		renderer: CardRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	Card.prototype.init = function () {
		this._ariaText = new InvisibleText({id: this.getId() + "-ariaText"});
		this._oRb = Core.getLibraryResourceBundle("sap.f");
		this.setModel(new JSONModel(), "parameters");
		this._busyStates = new Map();
	};

	/**
	 * Inits the ready state of the card by waiting for the required events.
	 *
	 * @private
	 */
	Card.prototype._initReadyState = function () {
		this._aReadyPromises = [];

		this._awaitEvent("_headerReady");
		this._awaitEvent("_contentReady");
		this._awaitEvent("_cardReady");

		Promise.all(this._aReadyPromises).then(function () {
			this._bReady = true;
			this.fireEvent("_ready");
		}.bind(this));
	};

	/**
	 * Clears the ready state of the card.
	 *
	 * @private
	 */
	Card.prototype._clearReadyState = function () {
		this._bReady = false;
		this._aReadyPromises = [];
	};

	/**
	 * Called on before rendering of the control.
	 * @private
	 */
	Card.prototype.onBeforeRendering = function () {
		var sConfig = this.getHostConfigurationId();

		if (this.getDataMode() !== CardDataMode.Active) {
			return;
		}

		if (sConfig) {
			this.addStyleClass(sConfig.replace(/-/g, "_"));
		}

		if (this._bApplyManifest) {
			this._bApplyManifest = false;
			var vManifest = this.getManifest();

			this._clearReadyState();
			this._initReadyState();

			if (!vManifest) {
				// Destroy the manifest when null/undefined/empty string are passed
				this.destroyManifest();
			} else {
				this.createManifest(vManifest, this.getBaseUrl());
			}
		}
	};

	Card.prototype.setManifest = function (vValue) {
		this.setProperty("manifest", vValue);
		this._bApplyManifest = true;
		return this;
	};

	Card.prototype.setManifestChanges = function (aValue) {
		this.setProperty("manifestChanges", aValue);
		this._bApplyManifest = true;
		return this;
	};

	Card.prototype.setParameters = function (vValue) {
		this.setProperty("parameters", vValue);
		this._bApplyManifest = true;
		return this;
	};

	Card.prototype.setHost = function (vHost) {
		this.setAssociation("host", vHost);

		if (this._oDestinations) {
			this._oDestinations.setHost(this.getHostInstance());
		}

		return this;
	};

	/**
	 * Instantiates a Card Manifest and applies it.
	 *
	 * @private
	 * @param {Object|string} vManifest The manifest URL or the manifest JSON.
	 * @param {string} sBaseUrl The base URL of the manifest.
	 */
	Card.prototype.createManifest = function (vManifest, sBaseUrl) {
		var mOptions = {};
		if (typeof vManifest === "string") {
			mOptions.manifestUrl = vManifest;
			vManifest = null;
		}

		if (this._oCardManifest) {
			this._oCardManifest.destroy();
		}

		// this._startBusyState("applyManifest");
		this._oCardManifest = new CardManifest("sap.card", vManifest, sBaseUrl, this.getManifestChanges());

		this._oCardManifest
			.load(mOptions)
			.then(function () {
				this.fireManifestReady();
				this._applyManifest();
			}.bind(this))
			.catch(this._applyManifest.bind(this));
	};

	/**
	 * Prepares the manifest and applies all settings.
	 */
	Card.prototype._applyManifest = function () {
		var oParameters = this.getParameters(),
			oCardManifest = this._oCardManifest;

		this._registerManifestModulePath();

		if (oCardManifest && oCardManifest.getResourceBundle()) {
			this._enhanceI18nModel(oCardManifest.getResourceBundle());
		}

		oCardManifest.processParameters(oParameters);

		this._applyManifestSettings();
	};

	/**
	 * Loads the messagebundle.properties for the integration library.
	 * For performance only call this method when the translations will be needed.
	 *
	 * @private
	 */
	Card.prototype._loadDefaultTranslations = function () {
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");

		this._enhanceI18nModel(oResourceBundle);
	};

	/**
	 * Enhances or creates the i18n model for the card.
	 *
	 * @param {sap.base.i18n.ResourceBundle} oResourceBundle The resource bundle which will be used to create the model or will enhance it.
	 * @private
	 */
	Card.prototype._enhanceI18nModel = function (oResourceBundle) {
		var oResourceModel = this.getModel("i18n");

		if (oResourceModel) {
			oResourceModel.enhance(oResourceBundle);
			return;
		}

		oResourceModel = new ResourceModel({
			bundle: oResourceBundle
		});

		this.setModel(oResourceModel, "i18n");
	};

	/**
	 * Await for an event which controls the overall "ready" state of the card.
	 *
	 * @private
	 * @param {string} sEvent The name of the event
	 */
	Card.prototype._awaitEvent = function (sEvent) {
		this._aReadyPromises.push(new Promise(function (resolve) {
			this.attachEventOnce(sEvent, function () {
				resolve();
			});
		}.bind(this)));
	};

	/**
	 * @public
	 * @experimental Since 1.65. The API might change.
	 * @returns {boolean} If the card is ready or not.
	 */
	Card.prototype.isReady = function () {
		return this._bReady;
	};

	/**
	 * Refreshes the card by re-applying the manifest settings and triggering all data requests.
	 *
	 * @public
	 * @experimental Since 1.65. The API might change.
	 */
	Card.prototype.refresh = function () {
		if (this.getDataMode() === CardDataMode.Active) {
			this._clearReadyState();
			this._initReadyState();
			this.destroyManifest();
			this._bApplyManifest = true;
			this.invalidate();
		}
	};

	Card.prototype.exit = function () {
		this.destroyManifest();
		this._busyStates = null;
		this._oRb = null;

		if (this._ariaText) {
			this._ariaText.destroy();
			this._ariaText = null;
		}
	};

	/**
	 * Destroys everything configured by the manifest.
	 */
	Card.prototype.destroyManifest = function () {
		if (this._oCardManifest) {
			this._oCardManifest.destroy();
			this._oCardManifest = null;
		}
		if (this._oServiceManager) {
			this._oServiceManager.destroy();
			this._oServiceManager = null;
		}

		// destroying the factory would also destroy the data provider
		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
			this._oDataProviderFactory = null;
			this._oDataProvider = null;
		}

		if (this._oLoadingProvider) {
			this._oLoadingProvider.destroy();
			this._oLoadingProvider = null;
		}

		if (this._oTemporaryContent) {
			this._oTemporaryContent.destroy();
			this._oTemporaryContent = null;
		}
		if (this._oDestinations) {
			this._oDestinations.destroy();
			this._oDestinations = null;
		}

		this.destroyAggregation("_header");
		this.destroyAggregation("_content");

		this._aReadyPromises = null;

		this._busyStates.clear();
	};

	/**
	 * Registers the manifest ID as a module path.
	 */
	Card.prototype._registerManifestModulePath = function () {
		if (!this._oCardManifest) {
			return;
		}

		this._sAppId = this._oCardManifest.get("/sap.app/id");
		if (this._sAppId) {
			LoaderExtensions.registerResourcePath(this._sAppId.replace(/\./g, "/"), this._oCardManifest.getUrl());
		} else {
			Log.error("Card sap.app/id entry in the manifest is mandatory");
		}
	};

	/**
	 * Overwrites getter for card manifest.
	 *
	 * @public
	 * @returns {string|Object} Cloned of the parameters.
	 */
	Card.prototype.getManifest = function () {
		var vValue = this.getProperty("manifest");
		if (vValue && typeof vValue === "object") {
			return jQuery.extend(true, {}, vValue);
		}
		return vValue;
	};

	/**
	 * Overwrites getter for card parameters.
	 *
	 * @public
	 * @returns {Object} A Clone of the parameters.
	 */
	Card.prototype.getParameters = function () {
		var vValue = this.getProperty("parameters");
		if (vValue && typeof vValue === "object") {
			return jQuery.extend(true, {}, vValue);
		}
		return vValue;
	};

	/**
	 * Returns a clone of the original manifest with all changes from the manifestChanges property applied on top.
	 *
	 * Use during designtime.
	 *
	 * @experimental Since 1.76 This api might be removed when a permanent solution for flexibility changes is implemented.
	 * @returns {Object} A Clone of the manifest with applied changes.
	 */
	Card.prototype.getManifestWithMergedChanges = function () {
		if (!this._oCardManifest || !this._oCardManifest._oManifest) {
			Log.error("The manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.widgets.Card");
			return {};
		}

		return jQuery.extend(true, {}, this._oCardManifest._oManifest.getRawJson());
	};

	/**
	 * Apply all manifest settings after the manifest is fully ready.
	 * This includes service registration, header and content creation, data requests.
	 *
	 * @private
	 */
	Card.prototype._applyManifestSettings = function () {
		var sAppType = this._oCardManifest.get(MANIFEST_PATHS.APP_TYPE);
		if (sAppType && sAppType !== "card") {
			Log.error("sap.app/type entry in manifest is not 'card'");
		}

		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
		}

		this._oDestinations = new Destinations(this.getHostInstance(), this._oCardManifest);
		this._oDataProviderFactory = new DataProviderFactory(this._oDestinations);
		this._oLoadingProvider = new LoadingProvider();

		this._applyServiceManifestSettings();
		this._applyDataManifestSettings();
		this._applyHeaderManifestSettings();
		this._applyContentManifestSettings();
	};

	Card.prototype._applyDataManifestSettings = function () {
		var oDataSettings = this._oCardManifest.get(MANIFEST_PATHS.DATA);
		if (!oDataSettings) {
			this.fireEvent("_cardReady");
			return;
		}

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);
		this._oLoadingProvider.createLoadingState(this._oDataProvider);

		if (this._oDataProvider) {
			this.setModel(new JSONModel());

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this.getModel().setData(oEvent.getParameter("data"));
				if (this._createContentPromise) {
					this._createContentPromise.then(function (oContent) {
						oContent.onDataChanged();
					});
				}
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError("Data service unavailable. " + oEvent.getParameter("message"));
			}.bind(this));

			this._oDataProvider.triggerDataUpdate().then(function () {
				this.fireEvent("_cardReady");
				this._handleCardLoading();
			}.bind(this));
		}
	};


	/**
	 * Handles card loading.
	 *
	 * @private
	 */
	Card.prototype._handleCardLoading = function () {
		var oContent = this.getCardContent();
		if (oContent && !oContent.hasStyleClass("sapFCardErrorContent") && oContent._oLoadingPlaceholder) {
			var oControlContent = oContent.getAggregation("_content");
			if (oControlContent) {
				//restore tab chain
				oControlContent.removeStyleClass("sapFCardContentHidden");
			}
			oContent._oLoadingPlaceholder.destroy();
		}

		if (this._oLoadingProvider) {
			this._oLoadingProvider.removeHeaderPlaceholder(this.getCardHeader());
		}
		this._oLoadingProvider.setLoading(false);
	};

	/**
	 * Register all required services in the ServiceManager based on the card manifest.
	 *
	 * @private
	 */
	Card.prototype._applyServiceManifestSettings = function () {
		var oServiceFactoryReferences = this._oCardManifest.get(MANIFEST_PATHS.SERVICES);
		if (!oServiceFactoryReferences) {
			return;
		}

		if (!this._oServiceManager) {
			this._oServiceManager = new ServiceManager(oServiceFactoryReferences, this);
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
	 * @returns {sap.f.cards.HeaderPosition} The position of the header of the card.
	 * @protected
	 */
	Card.prototype.getCardHeaderPosition = function () {
		if (!this._oCardManifest) {
			return "Top";
		}
		return this._oCardManifest.get(MANIFEST_PATHS.HEADER_POSITION) || HeaderPosition.Top;
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
	Card.prototype._applyHeaderManifestSettings = function () {

		var oHeader = this.createHeader();

		if (!oHeader) {
			this.fireEvent("_headerReady");
			return;
		}

		this.destroyAggregation("_header");

		this.setAggregation("_header", oHeader);

		if (oHeader.isReady()) {
			this.fireEvent("_headerReady");
		} else {
			oHeader.attachEvent("_ready", function () {
				this.fireEvent("_headerReady");
			}.bind(this));
		}
	};

	Card.prototype.getHostInstance = function () {
		var sHost = this.getHost();
		if (!sHost) {
			return null;
		}

		return Core.byId(sHost);
	};

	/**
	 * Lazily load and create a specific type of card content based on sap.card/content part of the manifest
	 *
	 * @private
	 */
	Card.prototype._applyContentManifestSettings = function () {
		var sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE),
			oContentManifest = this.getContentManifest(),
			sAriaText = sCardType + " " + this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD");

		this._ariaText.setText(sAriaText);

		if (!oContentManifest) {
			this.fireEvent("_contentReady");
			return;
		}

		this._setTemporaryContent(sCardType, oContentManifest);

		this._createContentPromise = this.createContent({
			cardType: sCardType,
			contentManifest: oContentManifest,
			serviceManager:  this._oServiceManager,
			dataProviderFactory: this._oDataProviderFactory,
			appId: this._sAppId
		}).then(function (oContent) {
				this._setCardContent(oContent);
				return oContent;
			}.bind(this));

		this._createContentPromise.catch(function (sError) {
			if (sError) {
				this._handleError(sError);
			}
		}.bind(this));
	};

	Card.prototype.createHeader = function () {
		var oManifestHeader = this._oCardManifest.get(MANIFEST_PATHS.HEADER),
			oHeaderFactory = new HeaderFactory(this);

		return oHeaderFactory.create(oManifestHeader, this._oCardManifest);
	};

	Card.prototype.getContentManifest = function () {
		var sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE),
			bIsComponent = sCardType && sCardType.toLowerCase() === "component",
			oContentManifest = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
			bHasContent = !!oContentManifest;

		if (bHasContent && !sCardType) {
			Log.error("Card type property is mandatory!");
			return null;
		}

		if (!bHasContent && !bIsComponent) {
			return null;
		}

		if (!oContentManifest && bIsComponent) {
			oContentManifest = this._oCardManifest.getJson();
		}

		return oContentManifest;
	};

	Card.prototype.createContent = function (mContentConfig) {
		var oContentFactory = new ContentFactory(this);

		mContentConfig.cardManifest = this._oCardManifest;

		return oContentFactory.create(mContentConfig);
	};

	/**
	 * Called on after rendering of the control.
	 * @private
	 */
	Card.prototype.onAfterRendering = function () {
		var sCardType;
		if (this._oCardManifest && this._oCardManifest.get(MANIFEST_PATHS.TYPE)) {
			sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE).toLowerCase();
		}

		if (sCardType === "analytical") {
			this.$().addClass("sapFCardAnalytical");
		}
	};

	/**
	 * Sets a card content.
	 *
	 * @private
	 * @param {sap.ui.integration.cards.BaseContent} oContent The card content instance to be configured.
	 */
	Card.prototype._setCardContent = function (oContent) {

		oContent.attachEvent("_error", function (oEvent) {
			this._handleError(oEvent.getParameter("logMessage"), oEvent.getParameter("displayMessage"));
		}.bind(this));

		var oPreviousContent = this.getAggregation("_content");

		// only destroy previous content of type BaseContent
		if (oPreviousContent && oPreviousContent !== this._oTemporaryContent) {
			oPreviousContent.destroy();
		}

		// TO DO: decide if we want to set the content only on _updated event.
		// This will help to avoid appearance of empty table before its data comes,
		// but prevent ObjectContent to render its template, which might be useful
		this.setAggregation("_content", oContent);

		if (oContent.isReady()) {
			this.fireEvent("_contentReady");
		} else {
			oContent.attachEvent("_ready", function () {
				this.fireEvent("_contentReady");
			}.bind(this));
		}
	};


	/**
	 * Sets a temporary content that will show a busy indicator while the actual content is loading.
	 */
	Card.prototype._setTemporaryContent = function (sCardType, oContentManifest) {

		var oTemporaryContent = this._getTemporaryContent(sCardType, oContentManifest),
			oPreviousContent = this.getAggregation("_content");

		// only destroy previous content of type BaseContent
		if (oPreviousContent && oPreviousContent !== oTemporaryContent) {
			oPreviousContent.destroy();
		}

		this.setAggregation("_content", oTemporaryContent);
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

		this.fireEvent("_error", {message:sLogMessage});

		var sDefaultDisplayMessage = "Unable to load the data.",
			sErrorMessage = sDisplayMessage || sDefaultDisplayMessage,
			oPreviousContent = this.getAggregation("_content");

		var oError = new HBox({
			justifyContent: "Center",
			alignItems: "Center",
			items: [
				new Icon({ src: "sap-icon://message-error", size: "1rem" }).addStyleClass("sapUiTinyMargin"),
				new Text({ text: sErrorMessage })
			]
		}).addStyleClass("sapFCardErrorContent");

		// only destroy previous content of type BaseContent
		if (oPreviousContent && !oPreviousContent.hasStyleClass("sapFCardErrorContent")) {
			oPreviousContent.destroy();
			this.fireEvent("_contentReady"); // content won't show up so mark it as ready
		}

		//keep the min height
		oError.addEventDelegate({
			onAfterRendering: function () {
				if (!this._oCardManifest) {
					return;
				}
				var sType = this._oCardManifest.get(MANIFEST_PATHS.TYPE) + "Content",
					oContent = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
					sHeight = BaseContent.getMinHeight(sType, oContent, oError);

				if (this.getHeight() === "auto") { // if there is no height specified the default value is "auto"
					oError.$().css({ "min-height": sHeight });
				}
			}
		}, this);

		this.setAggregation("_content", oError);
	};

	Card.prototype._getTemporaryContent = function (sCardType, oContentManifest) {

		if (!this._oTemporaryContent && this._oLoadingProvider) {
			this._oTemporaryContent = this._oLoadingProvider.createContentPlaceholder(oContentManifest, sCardType);

			this._oTemporaryContent.addEventDelegate({
				onAfterRendering: function () {
					if (!this._oCardManifest) {
						return;
					}

					var sType = this._oCardManifest.get(MANIFEST_PATHS.TYPE) + "Content",
						oContent = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
						sHeight = BaseContent.getMinHeight(sType, oContent, this._oTemporaryContent);

					if (this.getHeight() === "auto") { // if there is no height specified the default value is "auto"
						this._oTemporaryContent.$().css({ "min-height": sHeight });
					}
				}
			}, this);
		}

		return this._oTemporaryContent;
	};

	/**
	 * Sets a new value for the <code>dataMode</code> property.
	 *
	 * @experimental Since 1.65. API might change.
	 * @param {sap.ui.integration.CardDataMode} sMode The mode to set to the Card.
	 * @returns {sap.ui.integration.widgets.Card} Pointer to the control instance to allow method chaining.
	 * @public
	 * @since 1.65
	 */
	Card.prototype.setDataMode = function (sMode) {

		if (this._oDataProviderFactory && sMode === CardDataMode.Inactive) {

			this._oDataProviderFactory.destroy();
			this._oDataProviderFactory = null;
		}

		// refresh will trigger re-rendering
		this.setProperty("dataMode", sMode, true);

		if (this.getProperty("dataMode") === CardDataMode.Active) {
			this.refresh();
		}

		return this;
	};

	/**
	 * Loads the module designtime/Card.designtime or the module given in
	 * "sap.card": {
	 *    "designtime": "designtime/Own.designtime"
	 * }
	 * This file should contain the designtime configuration for the card.
	 *
	 * Returns a promise that resolves with an object
	 * {
	 *    designtime: the designtime modules response
	 *    manifest: the complete manifest json
	 * }
	 * The promise is rejected if the module cannot be loaded with an object:
	 * {
	 *     error: "Card.designtime not found"
	 * }
	 *
	 * @public
	 * @experimental Since 1.73
	 * @returns {Promise} Promise resolves after the designtime configuration is loaded.
	 */
	Card.prototype.loadDesigntime = function() {
		if (!this._oCardManifest) {
			return Promise.reject("Manifest not yet available");
		}
		var sAppId = this._oCardManifest.get("/sap.app/id");
		if (!sAppId) {
			return Promise.reject("App id not maintained");
		}
		var sModulePath = sAppId.replace(/\./g,"/");
		return new Promise(function(resolve, reject) {
			//build the module path to load as part of the widgets module path
			var sModule = sModulePath + "/" + (this._oCardManifest.get("/sap.card/designtime") || "designtime/Card.designtime");
			if (sModule) {
				sap.ui.require([sModule, "sap/base/util/deepClone"], function(oDesigntime, deepClone) {
					//successfully loaded
					resolve({
						designtime: oDesigntime,
						manifest: deepClone(this._oCardManifest._oManifest.getRawJson(), 30)
					});
				}.bind(this), function () {
					//error
					reject({
						error: sModule + " not found"
					});
				});
			} else {
				reject();
			}
		}.bind(this));
	};

	/**
	 * Decides if the card needs a loading placeholder based on card level data provider
	 *
	 * @returns {Boolean} Should card has a loading placeholder based on card level data provider.
	 */
	Card.prototype.isLoading = function () {
		return this._oLoadingProvider ? this._oLoadingProvider.getLoadingState() : false;
	};

	return Card;
});
