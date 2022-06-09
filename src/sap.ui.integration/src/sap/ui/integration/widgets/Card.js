/*!
 * ${copyright}
 */
sap.ui.define([
	"./CardRenderer",
	"../cards/Footer",
	"../controls/ActionsToolbar",
	"sap/ui/base/Interface",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/integration/util/Manifest",
	"sap/ui/integration/util/ServiceManager",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/base/util/deepEqual",
	"sap/base/util/each",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/model/ObservableModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/integration/model/ContextModel",
	"sap/base/util/LoaderExtensions",
	"sap/f/CardBase",
	"sap/f/library",
	"sap/ui/integration/library",
	"sap/ui/integration/util/Destinations",
	"sap/ui/integration/util/LoadingProvider",
	"sap/ui/integration/util/HeaderFactory",
	"sap/ui/integration/util/ContentFactory",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/formatters/IconFormatter",
	"sap/ui/integration/cards/filters/FilterBarFactory",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/util/CardObserver",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/ui/integration/util/Utils",
	"sap/m/HBox",
	"sap/m/library"
], function (
	CardRenderer,
	Footer,
	ActionsToolbar,
	Interface,
	jQuery,
	Core,
	CardManifest,
	ServiceManager,
	Log,
	merge,
	deepEqual,
	each,
	DataProviderFactory,
	JSONModel,
	ObservableModel,
	ResourceModel,
	ContextModel,
	LoaderExtensions,
	CardBase,
	fLibrary,
	library,
	Destinations,
	LoadingProvider,
	HeaderFactory,
	ContentFactory,
	BindingResolver,
	IconFormatter,
	FilterBarFactory,
	CardActions,
	CardObserver,
	IllustratedMessage,
	IllustratedMessageType,
	IllustratedMessageSize,
	Utils,
	HBox,
	mLibrary
) {
	"use strict";

	var MANIFEST_PATHS = {
		TYPE: "/sap.card/type",
		DATA: "/sap.card/data",
		HEADER: "/sap.card/header",
		HEADER_POSITION: "/sap.card/headerPosition",
		CONTENT: "/sap.card/content",
		FOOTER: "/sap.card/footer",
		SERVICES: "/sap.ui5/services",
		APP_TYPE: "/sap.app/type",
		PARAMS: "/sap.card/configuration/parameters",
		DESTINATIONS: "/sap.card/configuration/destinations",
		CSRF_TOKENS: "/sap.card/configuration/csrfTokens",
		FILTERS: "/sap.card/configuration/filters",
		ERROR_MESSAGES: "/sap.card/configuration/messages"
	};

	/**
	 * @const A list of model names which are used internally by the card.
	 */
	var INTERNAL_MODEL_NAMES = ["parameters", "filters", "paginator", "form", "context", "i18n"];

	var RESERVED_PARAMETER_NAMES = ["visibleItems", "allItems"];

	var HeaderPosition = fLibrary.cards.HeaderPosition;

	var CardArea = library.CardArea;

	var CardDataMode = library.CardDataMode;

	var CARD_DESTROYED_ERROR = "Card is destroyed!";

	var FlexRendertype = mLibrary.FlexRendertype;

	var FlexJustifyContent = mLibrary.FlexJustifyContent;

	var FlexAlignItems = mLibrary.FlexAlignItems;

	var MODULE_PREFIX = "module:";


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
	* <strong>You can learn more about integration cards in the {@link demo:sap/ui/integration/demokit/cardExplorer/index.html Card Explorer}</strong>
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
	 * @extends sap.f.CardBase
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
	var Card = CardBase.extend("sap.ui.integration.widgets.Card", /** @lends sap.ui.integration.widgets.Card.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			properties: {

				/**
				 * The URL of the manifest or an object.
				 */
				manifest: {
					type: "any",
					defaultValue: ""
				},

				/**
				 * Overrides the default values of the parameters, which are defined in the manifest.
				 * The value is an object containing parameters in format <code>{parameterKey: parameterValue}</code>.
				 *
				 * @experimental Since 1.65. This property might be changed in future.
				 */
				parameters: {
					type: "object",
					defaultValue: null
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
				 * @experimental Since 1.76 This API might be removed when a permanent solution for flexibility changes is implemented.
				 * @since 1.76
				 */
				manifestChanges: {
					type: "object[]"
				}
			},
			aggregations: {

				/**
				 * Actions definitions from which actions in the header menu of the card are created.
				 * <b>Note</b>: This aggregation is destroyed when the property <code>manifest</code> changes.
				 * @experimental Since 1.85. Disclaimer: this aggregation is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 * @since 1.85
				 */
				actionDefinitions: {
					type: "sap.ui.integration.ActionDefinition",
					multiple: true,
					forwarding: {
						getter: "_getActionsToolbar",
						aggregation: "actionDefinitions"
					}
				},

				/**
				 * Defines the header of the card.
				 */
				_header: {
					type: "sap.f.cards.IHeader",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Defines the filters section of the card.
				 */
				_filterBar: {
					type: "sap.ui.integration.cards.filters.FilterBar",
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
				},

				/**
				 * Defines the footer of the card.
				 */
				_footer: {
					type: "sap.ui.core.Control",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Defines the Extension of the card.
				 */
				_extension: {
					type: "sap.ui.integration.Extension",
					multiple: false,
					visibility: "hidden"
				},

				/**
				 * Defines the internally used LoadingProvider.
				 */
				_loadingProvider: {
					type: "sap.ui.core.Element",
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
				 * Fired when some configuration settings are changed as a result of user interaction.
				 * For example - filter value is changed.
				 * @experimental since 1.96
				 */
				configurationChange: {
					parameters: {
						/**
						 * Changed configuration settings.
						 *
						 * Example:
						 * <pre>
						 *  {
						 *  	"/sap.card/configuration/filters/shipper/value": "key3",
						 *  	"/sap.card/configuration/filters/item/value": "key2",
						 *  }
						 * </pre>
						 */
						changes: {
							type: "object"
						}
					}
				},

				/**
				 * Fired when the manifest is loaded.
				 * @experimental since 1.72
				 */
				manifestReady: {},

				/**
				 * Fired when card utilities (like <code>DataProviderFactory</code>) and the card elements (like header) are created and initialized.
				 *
				 * Note: The card's content may not be available yet because it may depend on other resources to load.
				 *
				 * @ui5-restricted
				 */
				manifestApplied: {}
			},
			associations: {

				/**
				 * The host.
				 */
				host: {},

				/**
				 * The opener card.
				 * @private
				 * @ui5-restricted
				 */
				openerReference: { visibility: "hidden" }
			}
		},
		renderer: CardRenderer
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	Card.prototype.init = function () {

		CardBase.prototype.init.call(this);

		this.setAggregation("_loadingProvider", new LoadingProvider());

		this._oIntegrationRb = Core.getLibraryResourceBundle("sap.ui.integration");

		this._initModels();

		this._oContentFactory = new ContentFactory(this);
		this._oCardObserver = new CardObserver(this);
		this._bFirstRendering = true;
		this._aFundamentalErrors = [];

		if (this.getProperty("dataMode") === CardDataMode.Auto) {
			this._oCardObserver.createObserver(this);
		}
		/**
		 * Facade of the {@link sap.ui.integration.widgets.Card} control.
		 * @interface
		 * @name sap.ui.integration.widgets.CardFacade
		 * @experimental since 1.79
		 * @public
		 * @author SAP SE
		 * @version ${version}
		 * @borrows sap.ui.integration.widgets.Card#getDomRef as getDomRef
		 * @borrows sap.ui.integration.widgets.Card#setVisible as setVisible
		 * @borrows sap.ui.integration.widgets.Card#getParameters as getParameters
		 * @borrows sap.ui.integration.widgets.Card#getCombinedParameters as getCombinedParameters
		 * @borrows sap.ui.integration.widgets.Card#getManifestEntry as getManifestEntry
		 * @borrows sap.ui.integration.widgets.Card#resolveDestination as resolveDestination
		 * @borrows sap.ui.integration.widgets.Card#request as request
		 * @borrows sap.ui.integration.widgets.Card#refresh as refresh
		 * @borrows sap.ui.integration.widgets.Card#refreshData as refreshData
		 * @borrows sap.ui.integration.widgets.Card#showMessage as showMessage
		 * @borrows sap.ui.integration.widgets.Card#getBaseUrl as getBaseUrl
		 * @borrows sap.ui.integration.widgets.Card#getRuntimeUrl as getRuntimeUrl
		 * @borrows sap.ui.integration.widgets.Card#getTranslatedText as getTranslatedText
		 * @borrows sap.ui.integration.widgets.Card#getModel as getModel
		 * @borrows sap.ui.integration.widgets.Card#triggerAction as triggerAction
		 * @borrows sap.ui.integration.widgets.Card#addActionDefinition as addActionDefinition
		 * @borrows sap.ui.integration.widgets.Card#removeActionDefinition as removeActionDefinition
		 * @borrows sap.ui.integration.widgets.Card#insertActionDefinition as insertActionDefinition
		 * @borrows sap.ui.integration.widgets.Card#getActionDefinition as getActionDefinition
		 * @borrows sap.ui.integration.widgets.Card#indexOfActionDefinition as indexOfActionDefinition
		 * @borrows sap.ui.integration.widgets.Card#destroyActionDefinition as destroyActionDefinition
		 * @borrows sap.ui.integration.widgets.Card#showLoadingPlaceholders as showLoadingPlaceholders
		 * @borrows sap.ui.integration.widgets.Card#hideLoadingPlaceholders as hideLoadingPlaceholders
		 * @borrows sap.ui.integration.widgets.Card#showCard as showCard
		 * @borrows sap.ui.integration.widgets.Card#hide as hide
		 * @borrows sap.ui.integration.widgets.Card#getOpener as getOpener
		 */
		this._oLimitedInterface = new Interface(this, [
			"getDomRef",
			"setVisible",
			"getParameters",
			"getCombinedParameters",
			"getManifestEntry",
			"resolveDestination",
			"request",
			"refresh",
			"refreshData",
			"showMessage",
			"getBaseUrl",
			"getRuntimeUrl",
			"getTranslatedText",
			"getModel",
			"triggerAction",
			"addActionDefinition",
			"removeActionDefinition",
			"insertActionDefinition",
			"getActionDefinition",
			"indexOfActionDefinition",
			"destroyActionDefinition",
			"showLoadingPlaceholders",
			"hideLoadingPlaceholders",
			"showCard",
			"hide",
			"getOpener"
		]);
	};

	/**
	 * Initializes the internally used models.
	 */
	Card.prototype._initModels = function () {
		this.setModel(new JSONModel());

		INTERNAL_MODEL_NAMES.forEach(function (sModelName) {
			var oModel;

			switch (sModelName) {
				case "context":
					oModel = new ContextModel();
				break;
				case "i18n":
					oModel = new ResourceModel({
						bundle: this._oIntegrationRb
					});
				break;
				default:
					oModel = new JSONModel();
				break;
			}

			this.setModel(oModel, sModelName);
		}.bind(this));
	};

	/**
	 * @inheritdoc
	 */
	Card.prototype.clone = function () {
		var oClone = CardBase.prototype.clone.apply(this, arguments);

		// Cloning will copy the models rather then clone them.
		// Therefore we should re-initialize them, so that the used models are not shared between
		// several cards which are cloned from a single template.
		oClone._initModels();

		return oClone;
	};

	/**
	 * Inits the ready state of the card by waiting for the required events.
	 *
	 * @private
	 */
	Card.prototype._initReadyState = function () {
		this._aReadyPromises = [];

		this._awaitEvent("_headerReady");
		this._awaitEvent("_filterBarReady");
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

		if (this.getDataMode() !== CardDataMode.Active) {
			return;
		}

		this.startManifestProcessing();
	};

	/**
	 * Called after rendering of the control.
	 * @private
	 */
	Card.prototype.onAfterRendering = function () {
		var oCardDomRef = this.getDomRef();

		if (this.getDataMode() === CardDataMode.Auto && this._bFirstRendering) {
			this._oCardObserver.oObserver.observe(oCardDomRef);
		}

		this._bFirstRendering = false;
	};

	/**
	 * Starts the card's manifest processing. It will load the manifest and apply the settings written in it.
	 * This method can be called if the card needs to be used without rendering.
	 * When card is rendered it starts automatically.
	 * @private
	 * @ui5-restricted
	 */
	Card.prototype.startManifestProcessing = function () {
		if (!Utils.isBindingSyntaxComplex()) {
			this._logFundamentalError(
				"Cannot parse manifest. Complex binding syntax is not enabled - " +
				"To enable it, set the 'compatVersion' configuration option to 'edge', e.g.: data-sap-ui-compatVersion='edge' - " +
				"sap.ui.integration.widgets.Card"
			);
		}

		if (this._bApplyManifest || this._bApplyParameters) {
			this._clearReadyState();
			this._initReadyState();
		}

		var vManifest = this.getManifest();
		if (vManifest && this._bApplyManifest) {
			this._cleanupOldManifest();
			this.createManifest(vManifest, this.getBaseUrl());
		}

		if (!this._bApplyManifest && this._bApplyParameters) {
			this._oCardManifest.processParameters(this._getContextAndRuntimeParams());

			this._applyManifestSettings();
		}

		this._bApplyManifest = false;
		this._bApplyParameters = false;
		this._refreshActionsMenu();
	};

	Card.prototype.setManifest = function (vValue) {
		if (!deepEqual(this.getProperty("manifest"), vValue)) {
			this.destroyActionDefinitions();
		}

		if (!vValue) {
			// Destroy the manifest when null/undefined/empty string is passed
			this._destroyManifest();
		}

		this._bApplyManifest = true;
		this.setProperty("manifest", vValue);
		return this;
	};

	Card.prototype.setManifestChanges = function (aValue) {
		this.setProperty("manifestChanges", aValue);
		this._bApplyManifest = true;
		return this;
	};

	/**
	 * @override
	 */
	Card.prototype.setParameters = function (vValue) {
		this.setProperty("parameters", vValue);
		this._bApplyParameters = true;
		return this;
	};

	/**
	 * Sets a single parameter in the parameters property
	 */
	Card.prototype.setParameter = function (sKey, vValue) {
		var mParameters = this.getParameters() || {};
		mParameters[sKey] = vValue;
		this.setParameters(mParameters);

		return this;
	};

	Card.prototype.setHost = function (vHost) {
		this.setAssociation("host", vHost);

		var oHostInstance = this.getHostInstance();

		if (vHost && !oHostInstance) {
			Log.error(
				"Host with id '" + vHost + "' is not available during card initialization. It must be available for host specific features to work.",
				"Make sure that the host already exists, before assigning it to the card.",
				"sap.ui.integration.widgets.Card"
			);
			return this;
		}

		this.getModel("context").setHost(oHostInstance);

		if (this._oDestinations) {
			this._oDestinations.setHost(oHostInstance);
		}

		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.setHost(oHostInstance);
		}

		if (oHostInstance && oHostInstance.bUseExperimentalCaching) {
			this.addStyleClass("sapFCardExperimentalCaching");
		} else {
			this.removeStyleClass("sapFCardExperimentalCaching");
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

		this._isManifestReady = false;

		if (typeof vManifest === "string") {
			mOptions.manifestUrl = vManifest;
			vManifest = null;
		}

		if (this._oCardManifest) {
			this._oCardManifest.destroy();
		}

		this._oCardManifest = new CardManifest("sap.card", vManifest, sBaseUrl, this.getManifestChanges());

		this._oCardManifest
			.load(mOptions)
			.then(function () {
				if (this.bIsDestroyed) {
					throw new Error(CARD_DESTROYED_ERROR);
				}

				this._registerManifestModulePath();
				this._isManifestReady = true;
				this.fireManifestReady();

				return this._loadExtension();
			}.bind(this))
			.then(this._applyManifest.bind(this))
			.catch(function (e) {
				if (e.message !== CARD_DESTROYED_ERROR) {
					this._applyManifest();
					return;
				}

				this._logFundamentalError(e.message);
			}.bind(this));
	};

	/**
	 * Loads extension if there is such specified in the manifest.
	 * @returns {Promise|null} Null if there is no need to load extension, else a promise.
	 */
	Card.prototype._loadExtension = function () {
		var sExtensionPath = this._oCardManifest.get("/sap.card/extension"),
			sFullExtensionPath;

		if (!sExtensionPath) {
			return null;
		}

		if (sExtensionPath.startsWith(MODULE_PREFIX)) {
			sFullExtensionPath = sExtensionPath.replace(MODULE_PREFIX, "");
		} else {
			sFullExtensionPath = this._oCardManifest.get("/sap.app/id").replace(/\./g, "/") + "/" + sExtensionPath;
		}

		return new Promise(function (resolve, reject) {
			sap.ui.require([sFullExtensionPath], function (ExtensionSubclass) {
				var oExtension = new ExtensionSubclass();
				oExtension._setCard(this, this._oLimitedInterface);
				this.setAggregation("_extension", oExtension); // the framework validates that the subclass extends "sap.ui.integration.Extension"

				resolve();
			}.bind(this), function (vErr) {
				this._logFundamentalError("Failed to load " + sFullExtensionPath + ". Check if the path is correct. Reason: " + vErr);
				reject(vErr);
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Logs an error which does not allow the card to be rendered.
	 * Use <code>getFundamentalErrors()</code> method to retrieve a list of such errors.
	 * @param {string} sMessage The error message.
	 */
	Card.prototype._logFundamentalError = function (sMessage) {
		Log.error(sMessage);
		this._aFundamentalErrors.push(sMessage);
	};

	/**
	 * Retrieves a list of fundamental errors which appeared during card initialization.
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {array} A list of fundamental errors if there are any. Empty array otherwise.
	 */
	Card.prototype.getFundamentalErrors = function () {
		return this._aFundamentalErrors;
	};

	/**
	 * Prepares the manifest and applies all settings.
	 */
	Card.prototype._applyManifest = function () {
		var oCardManifest = this._oCardManifest;

		if (!oCardManifest.get("/sap.card")) {
			this._logFundamentalError("There must be a 'sap.card' section in the manifest.");
		}

		if (oCardManifest && oCardManifest.getResourceBundle()) {
			this._enhanceI18nModel(oCardManifest.getResourceBundle());
		}

		this.getModel("context").resetHostProperties();

		if (this._hasContextParams()) {
			this._resolveContextParams().then(function (oContextParameters) {
				this._oContextParameters = oContextParameters;
				this._applyManifestWithParams();
			}.bind(this));
			return;
		}

		this._applyManifestWithParams();
	};

	/**
	 * Applies all settings with the given parameters.
	 * @private
	 */
	Card.prototype._applyManifestWithParams = function () {
		var oCardManifest = this._oCardManifest,
			oParameters = this._getContextAndRuntimeParams();

		oCardManifest.processParameters(oParameters);

		this._prepareToApplyManifestSettings().then(function () {
			this._applyManifestSettings();
		}.bind(this));
	};

	/**
	 * Enhances or creates the i18n model for the card.
	 *
	 * @param {module:sap/base/i18n/ResourceBundle} oResourceBundle The resource bundle which will be used to create the model or will enhance it.
	 * @private
	 */
	Card.prototype._enhanceI18nModel = function (oResourceBundle) {
		var oResourceModel = this.getModel("i18n"),
			oNewResourceModel;

		// the library resource bundle must not be enhanced
		// so the card resource bundle should be first
		oNewResourceModel = new ResourceModel({
			bundle: oResourceBundle,
			enhanceWith: [
				this._oIntegrationRb
			]
		});

		this.setModel(oNewResourceModel, "i18n");
		oResourceModel.destroy();
	};

	/**
	 * Checks if there are context params in the card.
	 * @private
	 * @return {boolean} True if the are context params in the card.
	 */
	Card.prototype._hasContextParams = function () {
		var oManifestParams = this._oCardManifest.get(MANIFEST_PATHS.PARAMS),
			sKey,
			vValue;

		for (sKey in oManifestParams) {
			vValue = oManifestParams[sKey].value;
			if (typeof vValue === "string" && vValue.indexOf("{context>") !== -1) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Resolves any context params in the card.
	 * Calls the host for each of them and waits for the response.
	 * @private
	 * @return {Promise} A promise which resolves when all params are resolved.
	 */
	Card.prototype._resolveContextParams = function () {
		var oContextModel = this.getModel("context"),
			oManifestParams = this._oCardManifest.get(MANIFEST_PATHS.PARAMS),
			oContextParams = {},
			sKey,
			vValue;

		for (sKey in oManifestParams) {
			vValue = oManifestParams[sKey].value;
			if (typeof vValue === "string" && vValue.indexOf("{context>") !== -1) {
				oContextParams[sKey] = vValue;
			}
		}

		// trigger getProperty for the model
		BindingResolver.resolveValue(oContextParams, this, "/");

		return oContextModel.waitForPendingProperties().then(function () {
			// properties are ready, no resolve again
			return BindingResolver.resolveValue(oContextParams, this, "/");
		}.bind(this));
	};

	/**
	 * Merge runtime params on top of context params and returns the result.
	 * @private
	 * @return {Object} The merged params.
	 */
	Card.prototype._getContextAndRuntimeParams = function () {
		var oContextParameters = this._oContextParameters || {},
			oRuntimeParameters = this.getParameters() || {};

		return merge(oContextParameters, oRuntimeParameters);
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
			this._bApplyManifest = true;
			this.invalidate();
		}
	};

	/**
	 * Refreshes the card data by triggering all data requests.
	 *
	 * @public
	 * @since 1.95
	 */
	Card.prototype.refreshData = function () {
		if (!this.isReady()) {
			return;
		}

		var oHeader = this.getCardHeader(),
			oContent = this.getCardContent(),
			oFilterBar = this.getAggregation("_filterBar");

		if (this._oDataProvider) {
			this._oDataProvider.triggerDataUpdate();
		}

		if (oHeader) {
			oHeader.refreshData();
		}

		if (oContent && oContent.isA("sap.ui.integration.cards.BaseContent")) {
			oContent.refreshData();
		} else {
			this.destroyAggregation("_content");
			this._destroyTemporaryContent();
			this._applyContentManifestSettings();
		}

		if (oFilterBar) {
			oFilterBar.refreshData();
		}
	};

	/**
	 * Refreshes the card actions menu.
	 *
	 * @private
	 */
	Card.prototype._refreshActionsMenu = function () {
		var oCardHeader = this.getCardHeader(),
			oHost = this.getHostInstance(),
			oExtension = this.getAggregation("_extension"),
			aActions = [];

		if (!oCardHeader) {
			return;
		}

		if (oHost) {
			aActions = aActions.concat(oHost.getActions() || []);
		}

		if (oExtension) {
			aActions = aActions.concat(oExtension.getActions() || []);
		}

		if (deepEqual(aActions, this._getActionsToolbar()._aActions)) {
			return;
		}

		this._getActionsToolbar().initializeContent(this);
	};

	Card.prototype.exit = function () {

		CardBase.prototype.exit.call(this);

		this._destroyManifest();
		this._oCardObserver.destroy();
		this._oCardObserver = null;
		this._oContentFactory = null;
		this._bFirstRendering = null;
		this._oIntegrationRb = null;

		if (this._oActionsToolbar) {
			this._oActionsToolbar.destroy();
			this._oActionsToolbar = null;
		}
	};

	/**
	 * Destroys everything configured by the manifest.
	 */
	Card.prototype._destroyManifest = function () {
		if (this._oCardManifest) {
			this._oCardManifest.destroy();
			this._oCardManifest = null;
		}
		if (this._oServiceManager) {
			this._oServiceManager.destroy();
			this._oServiceManager = null;
		}

		if (this._oDestinations) {
			this._oDestinations.destroy();
			this._oDestinations = null;
		}

		if (this._oIconFormatter) {
			this._oIconFormatter.destroy();
			this._oIconFormatter = null;
		}

		if (this._oActionsToolbar) {
			this._oActionsToolbar.destroy();
			this._oActionsToolbar = null;
		}

		this.destroyAggregation("_header");
		this.destroyAggregation("_filterBar");
		this.destroyAggregation("_content");
		this.destroyAggregation("_footer");

		this._cleanupOldManifest();
	};

	/**
	 * Cleans up internal models and other before new manifest processing.
	 */
	Card.prototype._cleanupOldManifest = function() {
		this._aReadyPromises = null;

		this.getModel("filters").setData({});
		this.getModel("parameters").setData({});
		this.getModel("paginator").setData({});

		this._oContextParameters = null;

		this._deregisterCustomModels();

		this.destroyAggregation("_extension");

		this._destroyTemporaryContent();

		// destroying the factory would also destroy the data provider
		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
			this._oDataProviderFactory = null;
			this._oDataProvider = null;
		}
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
			LoaderExtensions.registerResourcePath(this._sAppId.replace(/\./g, "/"), this._oCardManifest.getUrl() || "/");
		} else {
			this._logFundamentalError("Card sap.app/id entry in the manifest is mandatory");
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
	 * @override
	 */
	Card.prototype.getParameters = function () {
		var vValue = this.getProperty("parameters");
		if (vValue && typeof vValue === "object") {
			return jQuery.extend(true, {}, vValue);
		}
		return vValue;
	};

	/**
	 * Gets values of manifest parameters combined with the parameters from <code>parameters</code> property.
	 *
	 * <b>Notes</b>
	 *
	 * - Use this method when the manifest is ready. Check <code>manifestReady</code> event.
	 *
	 * - Use when developing a Component card.
	 *
	 * @public
	 * @experimental Since 1.77
	 * @returns {map} Object containing parameters in format <code>{parameterKey: parameterValue}</code>.
	 */
	Card.prototype.getCombinedParameters = function () {
		if (!this._isManifestReady) {
			Log.error("The manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.widgets.Card");
			return null;
		}

		var oParams = this._oCardManifest.getProcessedParameters(this._getContextAndRuntimeParams()),
			oResultParams = {},
			sKey;

		for (sKey in oParams) {
			oResultParams[sKey] = oParams[sKey].value;
		}

		return oResultParams;
	};

	/**
	 * Returns a value from the Manifest based on the specified path.
	 *
	 * <b>Note</b> Use this method when the manifest is ready. Check <code>manifestReady</code> event.
	 *
	 * @public
	 * @experimental Since 1.77
	 * @param {string} sPath The path to return a value for.
	 * @returns {Object} The value at the specified path.
	 */
	Card.prototype.getManifestEntry = function (sPath) {
		if (!this._isManifestReady) {
			Log.error("The manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.widgets.Card");
			return null;
		}

		return this._oCardManifest.get(sPath);
	};

	/**
	 * Returns a clone of the initial manifest without any processing and without any changes applied to it.
	 * @ui5-restricted
	 * @returns {Object} A clone of the initial raw manifest json.
	 */
	Card.prototype.getManifestRawJson = function () {
		if (!this._oCardManifest || !this._oCardManifest) {
			Log.error("The manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.widgets.Card");
			return {};
		}

		return this._oCardManifest.getInitialJson();
	};

	/**
	 * Returns a clone of the original manifest with all changes from the manifestChanges property applied on top.
	 *
	 * Use during designtime.
	 *
	 * @ui5-restricted
	 * @returns {Object} A clone of the manifest with applied changes.
	 */
	Card.prototype.getManifestWithMergedChanges = function () {
		if (!this._oCardManifest || !this._oCardManifest._oManifest) {
			Log.error("The manifest is not ready. Consider using the 'manifestReady' event.", "sap.ui.integration.widgets.Card");
			return {};
		}

		return jQuery.extend(true, {}, this._oCardManifest._oManifest.getRawJson());
	};

	/**
	 * Resolves the destination and returns its URL.
	 * @public
	 * @param {string} sKey The destination's key used in the configuration.
	 * @returns {Promise} A promise which resolves with the URL of the destination.
	 */
	Card.prototype.resolveDestination = function (sKey) {
		return this._oDestinations.getUrl(sKey);
	};

	/**
	 * Resolves the destinations and returns a Promise with the resolved configuration.
	 * @private
	 * @ui5-restricted
	 * @param {object} oConfig The configuration.
	 * @returns {Promise} A promise which resolves with the resolved configuration.
	 */
	Card.prototype.processDestinations = function (oConfig) {
		return this._oDestinations.process(oConfig);
	};

	/**
	 * Displays a message strip above the content with the given text.
	 * There can be only 1 message displayed. If there is a previous message, it is removed.
	 * Can be used only after the <code>manifestApplied</code> event is fired.
	 *
	 * @public
	 * @experimental As of version 1.81
	 * @param {string} sMessage The message.
	 * @param {sap.ui.core.MessageType} sType Type of the message.
	 */
	 Card.prototype.showMessage = function (sMessage, sType) {
		if (this._createContentPromise) {
			this._createContentPromise.then(function (oContent) {
				oContent.showMessage(sMessage, sType);
			});
		} else {
			Log.error("'showMessage' cannot be used before the card instance is ready. Consider using the event 'manifestApplied' event.", "sap.ui.integration.widgets.Card");
		}
	};

	/**
	 * Gets translated text from the i18n properties files configured for this card.
	 *
	 * For more details see {@link module:sap/base/i18n/ResourceBundle#getText}.
	 *
	 * @experimental Since 1.83. The API might change.
	 * @public
	 * @param {string} sKey Key to retrieve the text for
	 * @param {string[]} [aArgs] List of parameter values which should replace the placeholders "{<i>n</i>}"
	 *     (<i>n</i> is the index) in the found locale-specific string value. Note that the replacement is done
	 *     whenever <code>aArgs</code> is given, no matter whether the text contains placeholders or not
	 *     and no matter whether <code>aArgs</code> contains a value for <i>n</i> or not.
	 * @param {boolean} [bIgnoreKeyFallback=false] If set, <code>undefined</code> is returned instead of the key string, when the key is not found in any bundle or fallback bundle.
	 * @returns {string} The value belonging to the key, if found; otherwise the key itself or <code>undefined</code> depending on <code>bIgnoreKeyFallback</code>.
	 */
	Card.prototype.getTranslatedText = function (sKey, aArgs, bIgnoreKeyFallback) {
		var oModel = this.getModel("i18n"),
			oBundle;

		if (!oModel) {
			Log.warning("There are no translations available. Either the i18n configuration is missing or the method is called too early.");
			return null;
		}

		oBundle = oModel.getResourceBundle();

		return oBundle.getText(sKey, aArgs, bIgnoreKeyFallback);
	};

	/**
	 * Returns the <code>DataProviderFactory</code> instance configured for the card.
	 * @ui5-restricted
	 * @returns {sap.ui.integration.util.DataProviderFactory} The data provider factory.
	 */
	Card.prototype.getDataProviderFactory = function () {
		if (!this._oDataProviderFactory) {
			Log.error("The DataProviderFactory instance is not ready yet. Consider using the event 'manifestApplied'.", "sap.ui.integration.widgets.Card");
			return null;
		}

		return this._oDataProviderFactory;
	};

	/**
	 * Resolves the given URL relatively to the manifest base path.
	 * Absolute paths are not changed.
	 *
	 * @example
	 * oCard.getRuntimeUrl("images/Avatar.png") === "sample/card/images/Avatar.png"
	 * oCard.getRuntimeUrl("http://www.someurl.com/Avatar.png") === "http://www.someurl.com/Avatar.png"
	 * oCard.getRuntimeUrl("https://www.someurl.com/Avatar.png") === "https://www.someurl.com/Avatar.png"
	 *
	 * @ui5-restricted
	 * @param {string} sUrl The URL to resolve.
	 * @returns {string} The resolved URL.
	 */
	Card.prototype.getRuntimeUrl = function (sUrl) {
		var sAppId = this._sAppId,
			sAppName,
			sSanitizedUrl = sUrl && sUrl.trim().replace(/^\//, "");

		if (sAppId === null) {
			Log.error("The manifest is not ready so the URL can not be resolved. Consider using the 'manifestReady' event.", "sap.ui.integration.widgets.Card");
			return null;
		}

		if (!sAppId ||
			sUrl.startsWith("http://") ||
			sUrl.startsWith("https://") ||
			sUrl.startsWith("//")) {
			return sUrl;
		}

		sAppName = sAppId.replace(/\./g, "/");

		// do not use sap.ui.require.toUrl(sAppName + "/" + sSanitizedUrl)
		// because it doesn't work when the sSanitizedUrl starts with ".."
		return sap.ui.require.toUrl(sAppName) + "/" + sSanitizedUrl;
	};

	/**
	 * Initializes internal classes needed for the card, based on the ready manifest.
	 *
	 * @private
	 */
	Card.prototype._prepareToApplyManifestSettings = function () {
		var sAppType = this._oCardManifest.get(MANIFEST_PATHS.APP_TYPE),
			oExtension = this.getAggregation("_extension");

		if (sAppType && sAppType !== "card") {
			Log.error("sap.app/type entry in manifest is not 'card'");
		}

		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
		}

		this._oDestinations = new Destinations({
			host: this.getHostInstance(),
			card: this,
			manifestConfig: this._oCardManifest.get(MANIFEST_PATHS.DESTINATIONS)
		});
		this._oIconFormatter = new IconFormatter({
			card: this
		});

		return this.processDestinations(this._oCardManifest.getJson()).then(function (oResult) {
			this._oCardManifest.setJson(oResult);

			this._oDataProviderFactory = new DataProviderFactory({
				host: this.getHostInstance(),
				extension: oExtension,
				csrfTokensConfig: this._oCardManifest.get(MANIFEST_PATHS.CSRF_TOKENS),
				card: this
			});

			this._registerCustomModels();

			if (oExtension) {
				oExtension.onCardReady();
			}
		}.bind(this));
	};

	/**
	 * Apply all manifest settings after the manifest is fully ready.
	 * This includes service registration, header and content creation, data requests.
	 *
	 * @private
	 */
	Card.prototype._applyManifestSettings = function () {

		this._setParametersModelData();

		this._applyServiceManifestSettings();
		this._applyFilterBarManifestSettings();
		this._applyDataManifestSettings();
		this._applyHeaderManifestSettings();
		this._applyContentManifestSettings();
		this._applyFooterManifestSettings();

		this.fireManifestApplied();

	};

	/**
	 * Sets parameters data to the 'parameters' model.
	 * Excluding reserved parameter names.
	 *
	 * @private
	 */

	Card.prototype._setParametersModelData = function () {

		var oCustomParameters = {},
			oCombinedParameters = this.getCombinedParameters(),
			sKey;

		for (sKey in oCombinedParameters) {
			if (RESERVED_PARAMETER_NAMES.indexOf(sKey) >= 0) {
				Log.warning("The parameter name '" + sKey + "' is reserved for cards. Can not be used for creating custom parameter.");
			} else {
				oCustomParameters[sKey] = {value: oCombinedParameters[sKey]};
			}
		}
		this.getModel("parameters").setData(oCustomParameters);
	};

	Card.prototype._applyDataManifestSettings = function () {
		var oDataSettings = this._oCardManifest.get(MANIFEST_PATHS.DATA),
			oModel;

		if (!oDataSettings) {
			this.fireEvent("_cardReady");
			return;
		}

		this.bindObject(oDataSettings.path || "/");

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);

		this.getAggregation("_loadingProvider").setDataProvider(this._oDataProvider);

		if (oDataSettings.name) {
			oModel = this.getModel(oDataSettings.name);
		} else if (this._oDataProvider) {
			oModel = new ObservableModel();
			this.setModel(oModel);
		}

		if (!oModel) {
			this.fireEvent("_cardReady");
			return;
		}

		oModel.attachEvent("change", function () {
			var oCardContent = this.getAggregation("_content");
			if (oCardContent && !oCardContent.isA("sap.ui.integration.cards.BaseContent")) {
				this.destroyAggregation("_content");
				this._destroyTemporaryContent();
				this._applyContentManifestSettings();
			}

			if (this._createContentPromise) {
				this._createContentPromise.then(function (oContent) {
					oContent.onDataChanged();
					this.onDataRequestComplete();
				}.bind(this));
			} else {
				this.onDataRequestComplete();
			}

		}.bind(this));

		if (this._oDataProvider) {
			this._oDataProvider.attachDataRequested(function () {
				this._showLoadingPlaceholders();
			}.bind(this));

			this._oDataProvider.attachDataChanged(function (oEvent) {
				oModel.setData(oEvent.getParameter("data"));
			});

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError("Data service unavailable. " + oEvent.getParameter("message"));
				this.onDataRequestComplete();
			}.bind(this));

			this._oDataProvider.triggerDataUpdate();
		} else {
			this.fireEvent("_cardReady");
		}
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
	 * If there is actions toolbar - return it.
	 * If there isn't - create it.
	 * @private
	 * @returns {sap.ui.integration.controls.ActionsToolbar} The toolbar for the header
	 */
	Card.prototype._getActionsToolbar = function () {
		if (!this._oActionsToolbar) {
			this._oActionsToolbar = new ActionsToolbar();
			this._oActionsToolbar.setCard(this);
		}

		return this._oActionsToolbar;
	};

	/**
	 * Lazily load and create a specific type of card header based on sap.card/header part of the manifest
	 *
	 * @private
	 */
	Card.prototype._applyHeaderManifestSettings = function () {
		var oHeader = this.createHeader();

		this.destroyAggregation("_header");

		if (!oHeader) {
			this.fireEvent("_headerReady");
			return;
		}

		oHeader.attachEvent("_error", function (oEvent) {
			this._handleError(oEvent.getParameter("message"));
		}.bind(this));

		this.setAggregation("_header", oHeader);

		if (oHeader.isReady()) {
			this.fireEvent("_headerReady");
		} else {
			oHeader.attachEvent("_ready", function () {
				this.fireEvent("_headerReady");
			}.bind(this));
		}
	};

	Card.prototype._applyFilterBarManifestSettings = function () {
		var oFilterBar = this.createFilterBar();

		this.destroyAggregation("_filterBar");

		if (!oFilterBar) {
			this.fireEvent("_filterBarReady");
			return;
		}

		oFilterBar.attachEventOnce("_filterBarDataReady", function () {
			this.fireEvent("_filterBarReady");
		}.bind(this));

		this.setAggregation("_filterBar", oFilterBar);
	};

	Card.prototype._applyFooterManifestSettings = function () {
		var oFooter = this.createFooter();

		this.destroyAggregation("_footer");

		if (oFooter) {
			this.setAggregation("_footer", oFooter);
		}
	};

	/**
	 * Gets the instance of the <code>host</code> association.
	 *
	 * @public
	 * @experimental Since 1.77
	 * @returns {sap.ui.integration.Host} The host object associated with this card.
	 */
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

		if (this._bIsPreviewMode) {
			this.fireEvent("_contentReady");
			return;
		}

		this._createContentPromise = this.createContent({
			cardType: sCardType,
			contentManifest: oContentManifest,
			serviceManager: this._oServiceManager,
			dataProviderFactory: this._oDataProviderFactory,
			iconFormatter: this._oIconFormatter,
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

		return oHeaderFactory.create(oManifestHeader, this._getActionsToolbar() /** move the toolbar to the next header */);
	};

	Card.prototype.createFilterBar = function () {
		var mFiltersConfig = this._oCardManifest.get(MANIFEST_PATHS.FILTERS),
			oFactory = new FilterBarFactory(this);

		return oFactory.create(mFiltersConfig, this.getModel("filters"));
	};

	Card.prototype.createFooter = function () {
		var oManifestFooter = this._oCardManifest.get(MANIFEST_PATHS.FOOTER);

		if (!oManifestFooter) {
			return null;
		}

		return Footer.create(this, oManifestFooter);
	};

	Card.prototype.getContentManifest = function () {
		var sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE),
			bIsComponent = sCardType && sCardType.toLowerCase() === "component",
			oContentManifest = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
			bHasContent = !!oContentManifest;

		if (bHasContent && !sCardType) {
			this._logFundamentalError("Card type property is mandatory!");
			return null;
		}

		if (!bHasContent && !bIsComponent) {
			return null;
		}

		if (bIsComponent) {
			oContentManifest = merge(oContentManifest, {
				componentManifest: this._oCardManifest.getJson()
			});
		}

		return oContentManifest;
	};

	Card.prototype.createContent = function (mContentConfig) {
		mContentConfig.cardManifest = this._oCardManifest;

		return this._oContentFactory.create(mContentConfig);
	};

	/**
	 * Sets a card content.
	 *
	 * @private
	 * @param {sap.ui.integration.cards.BaseContent} oContent The card content instance to be configured.
	 */
	Card.prototype._setCardContent = function (oContent) {
		if (this._bShowContentLoadingPlaceholders) {
			oContent.showLoadingPlaceholders();
			this._bShowContentLoadingPlaceholders = false;
		}

		oContent.attachEvent("_error", function (oEvent) {
			this._handleError(oEvent.getParameter("logMessage"));
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
			oContent.attachReady(function () {
				this.fireEvent("_contentReady");
			}.bind(this));
		}
	};

	/**
	 * Sets a temporary content that will show a loading placeholder while the actual content is loading.
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

	Card.prototype._preserveMinHeightInContent = function (oError) {
		oError.addEventDelegate({
			onAfterRendering: function () {
				if (!this._oCardManifest) {
					return;
				}

				var sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE),
					oContentManifest = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
					ContentClass = this._oContentFactory.getClass(sCardType),
					sHeight;

				if (!ContentClass) {
					return;
				}

				sHeight = ContentClass.getMetadata().getRenderer().getMinHeight(oContentManifest, oError, this);

				if (this.getHeight() === "auto") { // if there is no height specified the default value is "auto"
					oError.$().css({"min-height": sHeight});
				}
			}
		}, this);
	};

	/**
	 * Destroys the previous content, unless the content is the error message.
	 *
	 * @param {sap.ui.core.Control} oContent content aggregation
	 * @private
	 */
	Card.prototype._destroyPreviousContent = function (oContent) {
		// only destroy previous content and avoid setting an error message again
		if (oContent && !oContent.hasStyleClass("sapFCardErrorContent")) {
			oContent.destroy();

			if (oContent === this._oTemporaryContent) {
				this._oTemporaryContent = null;
			}
		}
	};

	Card.prototype._destroyTemporaryContent = function () {
		if (this._oTemporaryContent) {
			this._oTemporaryContent.destroy();
			this._oTemporaryContent = null;
		}
	};

	/**
	 * Handler for error states.
	 * If the content is not provided in the manifest, the error message will be displayed in the header.
	 * If a message is not provided, a default message will be displayed.
	 *
	 * @param {string} sLogMessage Message that will be logged.
	 * @param {boolean} bNoItems No items are available after request.
	 * @private
	 */
	Card.prototype._handleError = function (sLogMessage, bNoItems) {
		if (!bNoItems) {
			Log.error(sLogMessage, null, "sap.ui.integration.widgets.Card");
		}

		this.fireEvent("_error", { message: sLogMessage });

		var oErrorConfiguration = this._oCardManifest.get(MANIFEST_PATHS.ERROR_MESSAGES),
			oError = this._getIllustratedMessage(oErrorConfiguration, bNoItems),
			oContentSection = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
			oCardContent = merge({}, this.getCardContent());

		if (oContentSection) {
			this._handleNoDataItems(oCardContent, oError, bNoItems);
			this._destroyPreviousContent(this.getCardContent());
			this._preserveMinHeightInContent(oError);
			this.setAggregation("_content", oError);
			this.fireEvent("_contentReady"); // content won't show up so mark it as ready
		} else {
			this.getCardHeader().setAggregation("_error", oError);
		}

	};

	/**
	 * Get Illustrated message.
	 *
	 * @param {object} oErrorConfiguration Error settings from manifest.
	 * @param {boolean} bNoItems No items are available after request.
	 * @private
	 */
	Card.prototype._getIllustratedMessage = function (oErrorConfiguration, bNoItems) {
		var sIllustratedMessageType = IllustratedMessageType.UnableToLoad,
			sIllustratedMessageSize = IllustratedMessageSize.Spot,
			sTitle,
			sDescription;

		//no item from request default messages, for some card types
		if (bNoItems && !oErrorConfiguration) {
			switch (this._oCardManifest.get(MANIFEST_PATHS.TYPE)) {
				case "List":
				case "Timeline":
					sIllustratedMessageType = IllustratedMessageType.NoData;
					sTitle = this._oIntegrationRb.getText("CARD_NO_ITEMS_ERROR_LISTS");
					break;
				case "Table":
					sIllustratedMessageType = IllustratedMessageType.NoEntries;
					sTitle = this._oIntegrationRb.getText("CARD_NO_ITEMS_ERROR_LISTS");
					break;
				case "Analytical":
					sIllustratedMessageType = IllustratedMessageType.NoEntries;
					sTitle = this._oIntegrationRb.getText("CARD_NO_ITEMS_ERROR_CHART");
			}
		}

		//custom no data message
		if (oErrorConfiguration && oErrorConfiguration.noData && bNoItems) {
			var oErrorData = oErrorConfiguration.noData;
				sIllustratedMessageType = IllustratedMessageType[oErrorData.type];
				sIllustratedMessageSize = IllustratedMessageSize[oErrorData.size];
				sTitle = oErrorData.title;
				sDescription = oErrorData.description;
		}


		var oIllustratedMessage = new IllustratedMessage({
			illustrationType: sIllustratedMessageType,
			illustrationSize: sIllustratedMessageSize,
			title: sTitle,
			description: sDescription ? sDescription : " "
		});

		var oFlexBox = new HBox({
			renderType: FlexRendertype.Bare,
			justifyContent: FlexJustifyContent.Center,
			alignItems: FlexAlignItems.Center,
			width: "100%",
			items: [oIllustratedMessage]
		}).addStyleClass("sapFCardErrorContent");
		return oFlexBox;
	};

	/**
	 * Handle when there is no data in error cases for manifest resolver.
	 *
	 * @param {object} oCardContent clone of the original card content before it is destroyed.
	 * @param {object} oError IllustratedMessage used for the error content.
	 * @param {boolean} bNoItems No items are available after request.
	 * @private
	 */
	Card.prototype._handleNoDataItems = function (oCardContent, oError, bNoItems) {
		if (bNoItems) {
			oError._oCardOriginalContent = oCardContent;
		}
	};

	Card.prototype._getTemporaryContent = function (sCardType, oContentManifest) {
		var oLoadingProvider = this.getAggregation("_loadingProvider");

		if (!this._oTemporaryContent && oLoadingProvider) {
			this._oTemporaryContent = oLoadingProvider.createContentPlaceholder(oContentManifest, sCardType, this);

			this._oTemporaryContent.addEventDelegate({
				onAfterRendering: function () {
					if (!this._oCardManifest) {
						return;
					}

					var sHeight = this._oContentFactory.getClass(sCardType).getMetadata().getRenderer().getMinHeight(oContentManifest, this._oTemporaryContent, this);

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
	 * @returns {this} Pointer to the control instance to allow method chaining.
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

		if (this.getProperty("dataMode") === CardDataMode.Auto) {
			this._oCardObserver.createObserver(this);
			if (!this._bFirstRendering) {
				this._oCardObserver.oObserver.observe(this.getDomRef());
			}
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
	Card.prototype.loadDesigntime = function () {
		if (this._oDesigntime) {
			return Promise.resolve(this._oDesigntime);
		}

		if (!this._oCardManifest) {
			return new Promise(function (resolve, reject) {
				this.attachManifestReady(function () {
					this.loadDesigntime().then(resolve, reject);
				}.bind(this));
			}.bind(this));
		}

		var sAppId = this._oCardManifest.get("/sap.app/id");
		if (!sAppId) {
			return Promise.reject("App id not maintained");
		}

		return new Promise(function (resolve, reject) {
			//build the module path to load as part of the widgets module path
			//handle keyword designtime removal
			var sDesigntimePath = this._oCardManifest.get("/sap.card/configuration/editor");
			if (sDesigntimePath === undefined) {
				sDesigntimePath = this._oCardManifest.get("/sap.card/designtime");
			}
			var	sFullDesigntimePath = this._oCardManifest.get("/sap.app/id").replace(/\./g, "/") + "/" + sDesigntimePath;
			if (sFullDesigntimePath) {
				sap.ui.require([sFullDesigntimePath], function (oDesigntime) {
					//successfully loaded
					oDesigntime = new oDesigntime();
					oDesigntime._readyPromise(this._oLimitedInterface, this).then(function () {
						this._oDesigntime = oDesigntime;
						resolve(oDesigntime);
					}.bind(this));
				}.bind(this), function () {
					//error
					reject({
						error: sFullDesigntimePath + " not found"
					});
				});
			} else {
				reject();
			}
		}.bind(this));
	};

	/**
	 * Displays the loading placeholders on the whole card, or a particular area of the card.
	 * <b>Note:</b> Only areas that contain binding will receive a loading placeholder.
	 *
	 * @public
	 * @param {sap.ui.integration.CardArea} [eCardArea] Area of the card to show the loading placeholders on. Possible options are 'Header', 'Content', 'Filters'. Leave empty to show loading placeholders on all areas of the card.
	 */
	Card.prototype.showLoadingPlaceholders = function (eCardArea) {
		var oArea;

		switch (eCardArea) {
			case CardArea.Header:
				oArea = this.getCardHeader();
				if (oArea) {
					oArea.showLoadingPlaceholders();
				}
				break;

			case CardArea.Filters:
				oArea = this.getAggregation("_filterBar");
				if (oArea) {
					oArea.showLoadingPlaceholders();
				}
				break;

			case CardArea.Content:
				if (this._createContentPromise) {
					this._createContentPromise.then(function (oContent) {
						oContent.showLoadingPlaceholders();
					});
				} else {
					this._bShowContentLoadingPlaceholders = true;
				}
				break;

			default:
				this.showLoadingPlaceholders(CardArea.Header);
				this.showLoadingPlaceholders(CardArea.Filters);
				this.showLoadingPlaceholders(CardArea.Content);
				this.getAggregation("_loadingProvider").setLoading(true);
		}

		return this;
	};

	/**
	 * Hides the loading placeholders on the whole card, or a particular section of the card.
	 * @public
	 * @param {sap.ui.integration.CardArea} [eCardArea] Area of the card to show the loading placeholders on. Possible options are 'Header', 'Content', 'Filters'. Leave empty to hide loading placeholders on all areas of the card.
	 */
	Card.prototype.hideLoadingPlaceholders = function (eCardArea) {
		var oArea;

		switch (eCardArea) {
			case CardArea.Header:
				oArea = this.getCardHeader();
				if (oArea) {
					oArea.hideLoadingPlaceholders();
				}
				break;

			case CardArea.Filters:
				oArea = this.getAggregation("_filterBar");
				if (oArea) {
					oArea.hideLoadingPlaceholders();
				}
				break;

			case CardArea.Content:
				if (this._createContentPromise) {
					this._createContentPromise.then(function (oContent) {
						oContent.hideLoadingPlaceholders();
					});
				} else {
					this._bShowContentLoadingPlaceholders = false;
				}
				break;

			default:
				this.hideLoadingPlaceholders(CardArea.Header);
				this.hideLoadingPlaceholders(CardArea.Filters);
				this.hideLoadingPlaceholders(CardArea.Content);
				this.getAggregation("_loadingProvider").setLoading(false);
		}

		return this;
	};

	/**
	 * Decides if the card needs a loading placeholder based on card level data provider
	 *
	 * @returns {boolean} Should card has a loading placeholder based on card level data provider.
	 */
	Card.prototype.isLoading = function () {
		var oLoadingProvider = this.getAggregation("_loadingProvider");

		return oLoadingProvider ? oLoadingProvider.getLoading() : false;
	};

	/**
	 * Returns the DOM Element that should get the focus.
	 *
	 * @return {Element} Returns the DOM Element that should get the focus
	 * @protected
	 */
	Card.prototype.getFocusDomRef = function () {
		var oHeader = this.getCardHeader();

		if (oHeader && oHeader.getFocusDomRef()) {
			return oHeader.getFocusDomRef();
		}

		return this.getDomRef();
	};

	Card.prototype._showLoadingPlaceholders = function () {
		this.getAggregation("_loadingProvider").setLoading(true);
	};

	Card.prototype.onDataRequestComplete = function () {
		var oContent = this.getCardContent(),
			oLoadingProvider = this.getAggregation("_loadingProvider");

		this.fireEvent("_cardReady");
		this.hideLoadingPlaceholders(CardArea.Header);
		this.hideLoadingPlaceholders(CardArea.Filters);

		if (oContent && oContent.isA("sap.ui.integration.cards.BaseContent") && oContent.isReady()) {
			this.hideLoadingPlaceholders(CardArea.Content);
		}

		if (oLoadingProvider) {
			oLoadingProvider.setLoading(false);
		}

		this._fireContentDataChange();
	};

	/**
	 * Performs an HTTP request using the given configuration.
	 *
	 * @public
	 * @experimental since 1.79
	 * @param {object} oConfiguration The configuration of the request.
	 * @param {string} oConfiguration.URL The URL of the resource.
	 * @param {string} [oConfiguration.mode="cors"] The mode of the request. Possible values are "cors", "no-cors", "same-origin".
	 * @param {string} [oConfiguration.method="GET"] The HTTP method. Possible values are "GET", "POST".
	 * @param {Object} [oConfiguration.parameters] The request parameters. If the method is "POST" the parameters will be put as key/value pairs into the body of the request.
	 * @param {string} [oConfiguration.dataType="json"] The expected Content-Type of the response. Possible values are "xml", "json", "text", "script", "html", "jsonp". Note: Complex Binding is not supported when a dataType is provided. Serialization of the response to an object is up to the developer.
	 * @param {Object} [oConfiguration.headers] The HTTP headers of the request.
	 * @param {boolean} [oConfiguration.withCredentials=false] Indicates whether cross-site requests should be made using credentials.
	 * @returns {Promise} Resolves when the request is successful, rejects otherwise.
	 */
	Card.prototype.request = function (oConfiguration) {
		return this.processDestinations(oConfiguration).then(function (oResult) {
			return this._oDataProviderFactory
				.create({ request: oResult })
				.setAllowCustomDataType(true)
				.getData();
		}.bind(this));
	};

	/**
	 * Triggers an action inside the card.
	 *
	 * Use this method if you need to trigger an action programmatically from inside an <code>Extension</code> or from a Component card.
	 *
	 * For other use cases use the manifest to define the actions. See {@link https://ui5.sap.com/test-resources/sap/ui/integration/demokit/cardExplorer/webapp/index.html#/learn/features/cardActions}
	 *
	 * <h3>Example</h3>
	 * <pre>
	 * oCard.triggerAction({
	 *     type: "Navigation",
	 *     parameters: {
	 *         url: "...",
	 *         target: "_blank"
	 *     }
	 * });
	 * </pre>
	 *
	 * @public
	 * @experimental since 1.84
	 * @param {object} oAction The settings of the action.
	 * @param {sap.ui.integration.CardActionType} oAction.type The type of the action.
	 * @param {object} [oAction.parameters] Additional parameters which will be used by the action handler to perform the action.
	 */
	Card.prototype.triggerAction = function (oAction) {
		CardActions.fireAction({
			card: this,
			host: this.getHostInstance(),
			action: oAction,
			parameters: oAction.parameters,
			source: this
		});
	};

	/**
	 * Sets if the card should be in a preview only mode or not.
	 *
	 * To be used only inside the designtime.
	 *
	 * @private
	 * @param {boolean} bIsPreviewMode True if the card should be in preview mode.
	 */
	Card.prototype._setPreviewMode = function (bIsPreviewMode) {
		this._bIsPreviewMode = bIsPreviewMode;

		if (bIsPreviewMode) {
			this.addStyleClass("sapFCardPreview");
		} else {
			this.removeStyleClass("sapFCardPreview");
		}

		this._bApplyManifest = true;
		this.invalidate();
	};

	/**
	 * @private
	 * @ui5-restricted
	 * @returns {object} Local binding functions for this card
	 */
	Card.prototype.getBindingNamespaces = function () {
		var mNamespaces = {},
			oExtension = this.getAggregation("_extension");

		if (oExtension) {
			mNamespaces.extension = {
				formatters: oExtension.getFormatters()
			};
		}

		return mNamespaces;
	};

	/**
	 * Creates an individual model for each named data section in the manifest.
	 * @private
	 */
	Card.prototype._registerCustomModels = function () {
		var aDataSections = this._oCardManifest.findDataSections();

		if (!this._aCustomModels) {
			this._aCustomModels = [];
		}

		// remove any old models before registering the new ones
		this._deregisterCustomModels();

		aDataSections.forEach(function (oDataSettings) {
			var sModelName = oDataSettings && oDataSettings.name;

			if (!sModelName) {
				return;
			}

			if (INTERNAL_MODEL_NAMES.indexOf(sModelName) > -1) {
				Log.error("The model name (data section name) '" + sModelName + "' is reserved for cards. Can not be used for creating a custom model.");
				return;
			}

			if (this._aCustomModels.indexOf(sModelName) > -1) {
				Log.error("The model name (data section name) '" + sModelName + "' is already used.");
				return;
			}

			this.setModel(new ObservableModel(), sModelName);
			this._aCustomModels.push(sModelName);
		}.bind(this));
	};

	/**
	 * Remove all models registered with _registerCustomModels
	 * @private
	 */
	Card.prototype._deregisterCustomModels = function () {
		if (!this._aCustomModels) {
			return;
		}

		this._aCustomModels.forEach(function (sModelName) {
			this.getModel(sModelName).destroy();
			this.setModel(null, sModelName);
		}.bind(this));

		this._aCustomModels = [];
	};

	Card.prototype._fireConfigurationChange = function (mChanges) {
		var oHostInstance = this.getHostInstance();

		if (!this._bReady) {
			return;
		}

		this.fireConfigurationChange({
			changes: mChanges
		});

		if (oHostInstance) {
			oHostInstance.fireCardConfigurationChange({
				card: this,
				changes: mChanges
			});
		}
	};

	Card.prototype._fireContentDataChange = function () {
		this.fireEvent("_contentDataChange");
	};

	/**
	 * @private
	 */
	Card.prototype.isSkeleton = function () {
		return false;
	};

	/**
	 * @private
	 */
	Card.prototype.getContentPageSize = function (oContentConfig) {
		var iMaxItems = parseInt(BindingResolver.resolveValue(oContentConfig, this).maxItems) || 0,
			oFooter = this.getAggregation("_footer"),
			oPaginator;

		if (!oFooter) {
			return iMaxItems;
		}

		oPaginator = oFooter.getAggregation("paginator");
		if (!oPaginator) {
			return iMaxItems;
		}

		if (oPaginator.getPageSize()) {
			return oPaginator.getPageSize();
		}

		return iMaxItems;
	};

	Card.prototype.hasPaginator = function () {
		var oManifestFooter = this._oCardManifest.get(MANIFEST_PATHS.FOOTER);
		return oManifestFooter && oManifestFooter.paginator;
	};

	/**
	 * Shows a child card. By default opens in a dialog.
	 * @private
	 * @ui5-restricted
	 * @param {Object} oParameters The settings for showing the card.
	 * @param {String|Object} oParameters.manifest Url to a manifest or the manifest itself.
	 * @param {String} oParameters.baseUrl If manifest is an object - specify the base url to the card.
	 * @param {Object} oParameters.parameters Parameters to be passed to the new card.
	 * @param {Object} oParameters.data Data to be passed to the new card.
	 * @returns {Promise} Promise which resolves with the created card.
	 */
	Card.prototype.showCard = function (oParameters) {
		var oChildCard = this._createChildCard(oParameters);

		oParameters._cardId = oChildCard.getId();

		this.triggerAction({
			type: "ShowCard",
			parameters: oParameters
		});

		return Promise.resolve(oChildCard);
	};

	/**
	 * Hides the card.
	 * @private
	 * @ui5-restricted
	 */
	Card.prototype.hide = function () {
		this.triggerAction({
			type: "HideCard"
		});
	};

	/**
	 * Gets the card which has opened this one if any.
	 * @private
	 * @ui5-restricted
	 * @returns {sap.ui.integration.widgets.Card} The card which opened the current one.
	 */
	Card.prototype.getOpener = function () {
		var oOpener = Core.byId(this.getAssociation("openerReference"));

		if (!oOpener) {
			return null;
		}

		return oOpener._oLimitedInterface;
	};

	/**
	 * Creates the child card.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {Object} oParameters The parameters for the card.
	 * @returns {sap.ui.integration.widgets.Card} The result card.
	 */
	Card.prototype._createChildCard = function (oParameters) {
		var vManifest = oParameters.manifest,
			sBaseUrl = oParameters.baseUrl,
			oData = oParameters.data,
			oChildCard = this._createCard({
				width: oParameters.width,
				host: this.getHostInstance(),
				parameters: oParameters.parameters
			});

		oChildCard.setAssociation("openerReference", this);

		if (oData) {
			each(oData, function (sModelName, oModelData) {
				var oModel = new JSONModel(oModelData);
				oChildCard.setModel(oModel, sModelName);
			});
		}

		if (typeof vManifest === "string") {
			oChildCard.setManifest(this.getRuntimeUrl(vManifest));
			if (sBaseUrl) {
				oChildCard.setBaseUrl(sBaseUrl);
			}
		} else {
			oChildCard.setManifest(vManifest);
			oChildCard.setBaseUrl(sBaseUrl || this.getRuntimeUrl("/"));
		}

		return oChildCard;
	};

	/**
	 * Creates a card with the given settings.
	 *
	 * @private
	 * @param {Object} oSettings The settings for the card.
	 * @returns {sap.ui.integration.widgets.Card} The result card.
	 */
	Card.prototype._createCard = function (oSettings) {
		return new Card(oSettings);
	};

	return Card;
});
