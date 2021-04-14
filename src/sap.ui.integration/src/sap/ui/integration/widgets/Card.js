/*!
 * ${copyright}
 */
sap.ui.define([
	"./CardRenderer",
	"../controls/ActionsToolbar",
	"sap/ui/base/Interface",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/integration/util/Manifest",
	"sap/ui/integration/util/ServiceManager",
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/base/util/deepEqual",
	"sap/base/util/isPlainObject",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/m/HBox",
	"sap/ui/core/Icon",
	"sap/m/Text",
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
	"sap/ui/integration/util/FilterBarFactory",
	"sap/ui/integration/util/CardActions",
	"sap/ui/integration/util/CardObserver"
], function (
	CardRenderer,
	ActionsToolbar,
	Interface,
	jQuery,
	Core,
	CardManifest,
	ServiceManager,
	Log,
	merge,
	deepEqual,
	isPlainObject,
	DataProviderFactory,
	HBox,
	Icon,
	Text,
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
	CardObserver
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
		PARAMS: "/sap.card/configuration/parameters",
		DESTINATIONS: "/sap.card/configuration/destinations",
		FILTERS: "/sap.card/configuration/filters"
	};

	/**
	 * @const A list of model names which are used internally by the card.
	 */
	var RESERVED_MODEL_NAMES = ["parameters", "filters", "context", "i18n"];

	var RESERVED_PARAMETER_NAMES = ["visibleItems", "allItems"];

	var HeaderPosition = fLibrary.cards.HeaderPosition;

	var CardDataMode = library.CardDataMode;

	var CARD_DESTROYED_ERROR = "Card is destroyed!";

	var CardArea = library.CardArea;

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
					type: "sap.ui.core.Control",
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

		CardBase.prototype.init.call(this);

		this.setAggregation("_loadingProvider", new LoadingProvider());
		this.setModel(new JSONModel(), "parameters");
		this.setModel(new JSONModel(), "filters");
		this.setModel(new ContextModel(), "context");
		this._busyStates = new Map();
		this._oContentFactory = new ContentFactory(this);
		this._oCardObserver = new CardObserver(this);
		this._bFirstRendering = true;

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
		 * @borrows sap.ui.integration.widgets.Card#getParameters as getParameters
		 * @borrows sap.ui.integration.widgets.Card#getCombinedParameters as getCombinedParameters
		 * @borrows sap.ui.integration.widgets.Card#getManifestEntry as getManifestEntry
		 * @borrows sap.ui.integration.widgets.Card#resolveDestination as resolveDestination
		 * @borrows sap.ui.integration.widgets.Card#request as request
		 * @borrows sap.ui.integration.widgets.Card#showMessage as showMessage
		 * @borrows sap.ui.integration.widgets.Card#getBaseUrl as getBaseUrl
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
		 */
		this._oLimitedInterface = new Interface(this, [
			"getParameters",
			"getCombinedParameters",
			"getManifestEntry",
			"resolveDestination",
			"request",
			"showMessage",
			"getBaseUrl",
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
			"hideLoadingPlaceholders"
		]);
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
		if (this._bApplyManifest || this._bApplyParameters) {
			this._clearReadyState();
			this._initReadyState();
		}

		if (this._bApplyManifest) {
			var vManifest = this.getManifest();

			if (!vManifest) {
				// Destroy the manifest when null/undefined/empty string are passed
				this.destroyManifest();
			} else {
				this.createManifest(vManifest, this.getBaseUrl());
			}
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
		this.setProperty("manifest", vValue);
		this.destroyActionDefinitions();
		this._bApplyManifest = true;
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
		this.destroyAggregation("_extension");

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
				}
			}.bind(this));
	};

	/**
	 * Loads extension if there is such specified in the manifest.
	 * @returns {Promise|null} Null if there is no need to load extension, else a promise.
	 */
	Card.prototype._loadExtension = function () {
		var sExtensionPath = this._oCardManifest.get("/sap.card/extension");

		if (!sExtensionPath) {
			return null;
		}

		var sFullExtensionPath = this._oCardManifest.get("/sap.app/id").replace(/\./g, "/") + "/" + sExtensionPath;

		return new Promise(function (resolve, reject) {
			sap.ui.require([sFullExtensionPath], function (ExtensionSubclass) {
				var oExtension = new ExtensionSubclass();
				oExtension._setCard(this, this._oLimitedInterface);
				this.setAggregation("_extension", oExtension); // the framework validates that the subclass extends "sap.ui.integration.Extension"

				resolve();
			}.bind(this), function (vErr) {
				Log.error("Failed to load " + sExtensionPath + ". Check if the path is correct. Reason: " + vErr);
				reject(vErr);
			});
		}.bind(this));
	};

	/**
	 * Prepares the manifest and applies all settings.
	 */
	Card.prototype._applyManifest = function () {
		var oCardManifest = this._oCardManifest;

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

		this._prepareToApplyManifestSettings();

		this._applyManifestSettings();
	};

	/**
	 * Loads the messagebundle.properties for the integration library.
	 * For performance only call this method when the translations will be needed.
	 *
	 * @private
	 */
	Card.prototype._loadDefaultTranslations = function () {
		if (this._defaultTranslationsLoaded) {
			return;
		}

		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");

		this._enhanceI18nModel(oResourceBundle);

		this._defaultTranslationsLoaded = true;
	};

	/**
	 * Enhances or creates the i18n model for the card.
	 *
	 * @param {module:sap/base/i18n/ResourceBundle} oResourceBundle The resource bundle which will be used to create the model or will enhance it.
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

		this.destroyManifest();
		this._oCardObserver.destroy();
		this._oCardObserver = null;
		this._busyStates = null;
		this._oContentFactory = null;
		this._bFirstRendering = null;

		if (this._oActionsToolbar) {
			this._oActionsToolbar.destroy();
			this._oActionsToolbar = null;
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

		if (this._oTemporaryContent) {
			this._oTemporaryContent.destroy();
			this._oTemporaryContent = null;
		}
		if (this._oDestinations) {
			this._oDestinations.destroy();
			this._oDestinations = null;
		}

		if (this._oIconFormatter) {
			this._oIconFormatter.destroy();
			this._oIconFormatter = null;
		}

		this.destroyAggregation("_header");
		this.destroyAggregation("_filterBar");
		this.destroyAggregation("_content");

		this._aReadyPromises = null;

		this._busyStates.clear();

		this.getModel("filters").setData({});
		this.getModel("parameters").setData({});

		this._oContextParameters = null;

		this._deregisterCustomModels();
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
	 * @param {string} sKey The destination's key used in the configuration.
	 * @returns {Promise} A promise which resolves with the URL of the destination.
	 */
	Card.prototype.resolveDestination = function (sKey) {
		return this._oDestinations.getUrl(sKey);
	};

	/**
	 * Displays a message strip on top of the content with the given text.
	 *
	 * <b>Note</b> Currently only available for an Adaptive Card.
	 *
	 * @public
	 * @experimental As of version 1.81
	 * @param {string} sMessage The message.
	 * @param {sap.ui.core.MessageType} sType Type of the message.
	 */
	Card.prototype.showMessage = function (sMessage, sType) {
		var oContent = this.getCardContent();

		if (!oContent || !oContent.showMessage) {
			Log.error("The experimental feature 'showMessage' is currently available only for an Adaptive Card.");
			return;
		}

		oContent.showMessage(sMessage, sType);
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

		this._oDestinations = new Destinations(this.getHostInstance(), this._oCardManifest.get(MANIFEST_PATHS.DESTINATIONS));
		this._oIconFormatter = new IconFormatter({
			destinations: this._oDestinations,
			card: this
		});

		this._oDataProviderFactory = new DataProviderFactory(this._oDestinations, oExtension, this);

		this._registerCustomModels();

		if (oExtension) {
			oExtension.onCardReady();
		}

		this._fillFiltersModel();
	};

	/**
	 * Fills the filters model with its initial values.
	 *
	 * @private
	 */
	Card.prototype._fillFiltersModel = function () {
		var oModel = this.getModel("filters"),
			mFiltersConfig = this._oCardManifest.get(MANIFEST_PATHS.FILTERS);

		for (var sKey in mFiltersConfig) {
			oModel.setProperty("/" + sKey, {
				"value": mFiltersConfig[sKey].value
			});
		}
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
			oFilterModel = this.getModel("filters"),
			oFilters = oFilterModel.getProperty("/"),
			oFactory = new FilterBarFactory(this);

		return oFactory.create(mFiltersConfig, oFilters);
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

	/**
	 * Handler for error states
	 *
	 * @param {string} sLogMessage Message that will be logged.
	 * @param {string} [sDisplayMessage] Message that will be displayed in the card's content. If not provided, a default message is displayed.
	 * @private
	 */
	Card.prototype._handleError = function (sLogMessage, sDisplayMessage) {
		Log.error(sLogMessage);

		this.fireEvent("_error", { message: sLogMessage });

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

			if (oPreviousContent === this._oTemporaryContent) {
				this._oTemporaryContent = null;
			}

			this.fireEvent("_contentReady"); // content won't show up so mark it as ready
		}

		//keep the min height
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

				sHeight = ContentClass.getMetadata().getRenderer().getMinHeight(oContentManifest, oError);

				if (this.getHeight() === "auto") { // if there is no height specified the default value is "auto"
					oError.$().css({"min-height": sHeight});
				}
			}
		}, this);

		this.setAggregation("_content", oError);
	};

	Card.prototype._getTemporaryContent = function (sCardType, oContentManifest) {
		var oLoadingProvider = this.getAggregation("_loadingProvider");

		if (!this._oTemporaryContent && oLoadingProvider) {
			this._oTemporaryContent = oLoadingProvider.createContentPlaceholder(oContentManifest, sCardType);

			this._oTemporaryContent.addEventDelegate({
				onAfterRendering: function () {
					if (!this._oCardManifest) {
						return;
					}

					var sHeight = this._oContentFactory.getClass(sCardType).getMetadata().getRenderer().getMinHeight(oContentManifest, this._oTemporaryContent);

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
			var sDesigntimePath = this._oCardManifest.get("/sap.card/designtime"),
				sFullDesigntimePath = this._oCardManifest.get("/sap.app/id").replace(/\./g, "/") + "/" + sDesigntimePath;
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
					oArea.getItems().forEach(function (oFilter) {
						oFilter.showLoadingPlaceholders();
					});
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
					oArea.getItems().forEach(function (oFilter) {
						oFilter.hideLoadingPlaceholders();
					});
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
	 * @returns {Boolean} Should card has a loading placeholder based on card level data provider.
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

		if (oHeader && oHeader.getDomRef()) {
			return oHeader.getDomRef();
		}

		return this.getDomRef();
	};

	Card.prototype._showLoadingPlaceholders = function () {
		this.getAggregation("_loadingProvider").setLoading(true);
	};

	Card.prototype.onDataRequestComplete = function () {
		var oContent = this.getCardContent();

		this.fireEvent("_cardReady");
		this.hideLoadingPlaceholders(CardArea.Header);
		this.hideLoadingPlaceholders(CardArea.Filters);

		if (oContent && oContent.isReady()) {
			this.hideLoadingPlaceholders(CardArea.Content);
		}

		this.getAggregation("_loadingProvider").setLoading(false);
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
	 * @param {Object} [oConfiguration.dataType="json"] The expected Content-Type of the response. Possible values are "xml", "json", "text", "script", "html", "jsonp". Note: Complex Binding is not supported when a dataType is provided. Serialization of the response to an object is up to the developer.
	 * @param {Object} [oConfiguration.headers] The HTTP headers of the request.
	 * @param {boolean} [oConfiguration.withCredentials=false] Indicates whether cross-site requests should be made using credentials.
	 * @returns {Promise} Resolves when the request is successful, rejects otherwise.
	 */
	Card.prototype.request = function (oConfiguration) {
		return this._oDataProviderFactory
			.create({ request: oConfiguration })
			.setAllowCustomDataType(true)
			.getData();
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

		aDataSections.forEach(function (oDataSettings) {
			var sModelName = oDataSettings && oDataSettings.name;

			if (!sModelName) {
				return;
			}

			if (RESERVED_MODEL_NAMES.indexOf(sModelName) > 0) {
				Log.error("The model name (data section name) '" + sModelName + "' is reserved for cards. Can not be used for creating a custom model.");
				return;
			}

			if (this._aCustomModels.indexOf(sModelName) > 0) {
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

	return Card;
});
