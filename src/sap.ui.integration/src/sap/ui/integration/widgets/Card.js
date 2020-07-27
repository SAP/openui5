/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Interface",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/integration/util/Manifest",
	"sap/ui/integration/util/ServiceManager",
	"sap/base/Log",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/ui/integration/cards/BaseContent",
	"sap/m/HBox",
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
	"sap/ui/integration/util/LoadingProvider",
	"sap/ui/integration/util/HeaderFactory",
	"sap/ui/integration/util/ContentFactory",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/formatters/IconFormatter",
	"sap/ui/integration/util/FilterBarFactory",
	"sap/m/BadgeEnabler"
], function (
	Interface,
	jQuery,
	Core,
	Control,
	CardManifest,
	ServiceManager,
	Log,
	DataProviderFactory,
	BaseContent,
	HBox,
	Icon,
	Text,
	JSONModel,
	ResourceModel,
	LoaderExtensions,
	FCardRenderer,
	fLibrary,
	library,
	InvisibleText,
	Destinations,
	LoadingProvider,
	HeaderFactory,
	ContentFactory,
	BindingHelper,
	IconFormatter,
	FilterBarFactory,
	BadgeEnabler
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
		DESTINATIONS: "/sap.card/configuration/destinations"
	};

	var HeaderPosition = fLibrary.cards.HeaderPosition;

	var CardDataMode = library.CardDataMode;

	var BADGE_AUTOHIDE_TIME = 3000;

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
			interfaces: [
				"sap.f.ICard",
				"sap.m.IBadge"
			],
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
				 * @experimental Since 1.76 This API might be removed when a permanent solution for flexibility changes is implemented.
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
		renderer: FCardRenderer
	});

	BadgeEnabler.call(Card.prototype);

	/**
	 * Initialization hook.
	 * @private
	 */
	Card.prototype.init = function () {
		this._ariaText = new InvisibleText({ id: this.getId() + "-ariaText" });
		this._oRb = Core.getLibraryResourceBundle("sap.f");
		this.setModel(new JSONModel(), "parameters");
		this._busyStates = new Map();
		this._oExtension = null;
		this._oContentFactory = new ContentFactory(this);
		this._mFilters = new Map();

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
		 * @borrows sap.ui.integration.widgets.Card#getBaseUrl as showMessage
		 */
		this._oLimitedInterface = new Interface(this, [
			"getParameters", "getCombinedParameters", "getManifestEntry", "resolveDestination", "request", "showMessage", "getBaseUrl"
		]);

		this.initBadgeEnablement({
			accentColor: "AccentColor6"
		});
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

		if (this._bApplyManifest || this._bApplyParameters || this._bApplyFilters) {
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
			this._oCardManifest.processParameters(this.getParameters());

			this._applyManifestSettings();
		}

		if (!this._bApplyManifest && this._bApplyFilters) {
			this._oCardManifest.processFilters(this._mFilters);

			this._applyManifestSettings();
		}

		this._bApplyManifest = false;
		this._bApplyParameters = false;
		this._bApplyFilters = false;
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

		if (this._oDestinations) {
			this._oDestinations.setHost(this.getHostInstance());
		}

		return this;
	};

	Card.prototype._setFilterValue = function (sKey, vValue) {
		this._mFilters.set(sKey, vValue);
		this._bApplyFilters = true;
		this.invalidate();
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
				this._registerManifestModulePath();
				this._isManifestReady = true;
				this.fireManifestReady();

				return this._loadExtension();
			}.bind(this))
			.then(function () {
				this._applyManifest();
			}.bind(this))
			.catch(this._applyManifest.bind(this));
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
			sap.ui.require([sFullExtensionPath], function (oExtension) {
				this._oExtension = oExtension;

				BindingHelper.addNamespace("extension", {
					formatters: oExtension.getFormatters()
				});
				resolve();
			}.bind(this), function (vErr) {
				Log.error("Failed to load " + sExtensionPath + ". Check if the path is correct.");
				reject(vErr);
			});
		}.bind(this));
	};

	/**
	 * Prepares the manifest and applies all settings.
	 */
	Card.prototype._applyManifest = function () {
		var oParameters = this.getParameters(),
			oFilters = this._mFilters,
			oCardManifest = this._oCardManifest;

		if (oCardManifest && oCardManifest.getResourceBundle()) {
			this._enhanceI18nModel(oCardManifest.getResourceBundle());
		}

		oCardManifest.processParameters(oParameters);

		oCardManifest.processFilters(oFilters);

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
		this._oExtension = null;
		this._oContentFactory = null;

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

		if (this._oIconFormatter) {
			this._oIconFormatter.destroy();
			this._oIconFormatter = null;
		}

		this.destroyAggregation("_header");
		this.destroyAggregation("_filterBar");
		this.destroyAggregation("_content");

		this._aReadyPromises = null;

		this._busyStates.clear();

		this._mFilters.clear();
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

		var oParams = this._oCardManifest.getProcessedParameters(this.getProperty("parameters")),
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
	 * Returns a clone of the original manifest with all changes from the manifestChanges property applied on top.
	 *
	 * Use during designtime.
	 *
	 * @experimental Since 1.76 This API might be removed when a permanent solution for flexibility changes is implemented.
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
	 * @param {sap.m.MessageType} sType Type of the message.
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
	 * Initializes internal classes needed for the card, based on the ready manifest.
	 *
	 * @private
	 */
	Card.prototype._prepareToApplyManifestSettings = function () {
		var sAppType = this._oCardManifest.get(MANIFEST_PATHS.APP_TYPE);
		if (sAppType && sAppType !== "card") {
			Log.error("sap.app/type entry in manifest is not 'card'");
		}

		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
		}

		this._oDestinations = new Destinations(this.getHostInstance(), this._oCardManifest.get(MANIFEST_PATHS.DESTINATIONS));
		this._oIconFormatter = new IconFormatter(this._oDestinations);
		this._oDataProviderFactory = new DataProviderFactory(this._oDestinations, this._oExtension);
		this._oLoadingProvider = new LoadingProvider();

		if (this._oExtension) {
			this._oExtension.onCardReady(this._oLimitedInterface);
		}
	};

	/**
	 * Apply all manifest settings after the manifest is fully ready.
	 * This includes service registration, header and content creation, data requests.
	 *
	 * @private
	 */
	Card.prototype._applyManifestSettings = function () {
		this._applyServiceManifestSettings();
		this._applyDataManifestSettings();
		this._applyHeaderManifestSettings();
		this._applyFilterBarManifestSettings();
		this._applyContentManifestSettings();
	};

	Card.prototype._applyDataManifestSettings = function () {
		var oDataSettings = BindingHelper.createBindingInfos(this._oCardManifest.get(MANIFEST_PATHS.DATA));

		if (!oDataSettings) {
			this.fireEvent("_cardReady");
			return;
		}

		this.bindObject(oDataSettings.path || "/");

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);

		if (this._oDataProvider) {
			this.setModel(new JSONModel());

			this._oDataProvider.attachDataRequested(function () {
				this.onDataRequested();
			}.bind(this));

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this.getModel().setData(oEvent.getParameter("data"));
				if (this._createContentPromise) {
					this._createContentPromise.then(function (oContent) {
						oContent.onDataChanged();
					});
				}
				this.onDataRequestComplete();
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError("Data service unavailable. " + oEvent.getParameter("message"));
				this.onDataRequestComplete();
			}.bind(this));

			this._oDataProvider.triggerDataUpdate();
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

	Card.prototype._applyFilterBarManifestSettings = function () {
		var oFilterBar = this.createFilterBar();

		this.destroyAggregation("_filterBar");

		if (!oFilterBar) {
			return;
		}

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

		return oHeaderFactory.create(oManifestHeader);
	};

	Card.prototype.createFilterBar = function () {
		var mFiltersConfig = this.getManifestEntry("/sap.card/configuration/filters"),
			mValues = this._mFilters,
			oFactory = new FilterBarFactory(this);

		return oFactory.create(mFiltersConfig, mValues);
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
		mContentConfig.cardManifest = this._oCardManifest;

		return this._oContentFactory.create(mContentConfig);
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

		this.toggleStyleClass("sapFCardAnalytical", sCardType === "analytical");
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
					sHeight = this._oContentFactory.getClass(sCardType).getMetadata().getRenderer().getMinHeight(oContentManifest, oError);

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
	 * Decides if the card needs a loading placeholder based on card level data provider
	 *
	 * @returns {Boolean} Should card has a loading placeholder based on card level data provider.
	 */
	Card.prototype.isLoading = function () {
		return this._oLoadingProvider ? this._oLoadingProvider.getLoadingState() : false;
	};

	/**
	 * Returns the DOM Element that should get the focus.
	 *
	 * @return {Element} Returns the DOM Element that should get the focus
	 * @protected
	 */
	Card.prototype.getFocusDomRef = function () {
		return this.getCardHeader() ? this.getCardHeader().getDomRef() : this.getDomRef();
	};

	Card.prototype.onDataRequested = function () {
		this._oLoadingProvider.createLoadingState(this._oDataProvider);
	};

	Card.prototype.onDataRequestComplete = function () {
		this.fireEvent("_cardReady");
		this._handleCardLoading();
		this._oLoadingProvider.setLoading(false);
	};

	/**
	 * Performs an HTTP request using the given configuration.
	 *
	 * @public
	 * @experimental since 1.79
	 * @param {object} oConfiguration The configuration of the request.
	 * @param {string} oConfiguration.url The URL of the resource.
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

	Card.prototype.onfocusin = function () {
		this._startBadgeHiding();
	};

	Card.prototype._startBadgeHiding = function () {
		if (this._iHideBadgeTimeout) {
			return;
		}

		this._iHideBadgeTimeout = setTimeout(this._hideBadge.bind(this), BADGE_AUTOHIDE_TIME);
	};

	Card.prototype._hideBadge = function () {

		var oBadgeCustomData = this.getBadgeCustomData();
		if (oBadgeCustomData) {
			oBadgeCustomData.setVisible(false);
		}

		this._iHideBadgeTimeout = null;
	};

	return Card;
});
