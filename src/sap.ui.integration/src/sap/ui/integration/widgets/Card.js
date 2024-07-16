/*!
 * ${copyright}
 */
sap.ui.define([
	"./CardRenderer",
	"../cards/Footer",
	"../controls/ActionsToolbar",
	"../controls/BlockingMessage",
	"sap/ui/base/Interface",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
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
	"sap/f/CardBase",
	"sap/f/library",
	"sap/ui/integration/library",
	"sap/ui/integration/util/Destinations",
	"sap/ui/integration/util/LoadingProvider",
	"sap/ui/integration/util/HeaderFactory",
	"sap/ui/integration/util/ContentFactory",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/util/ErrorHandler",
	"sap/ui/integration/formatters/IconFormatter",
	"sap/ui/integration/cards/filters/FilterBarFactory",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/util/CardObserver",
	"sap/m/IllustratedMessageType",
	"sap/ui/integration/util/ParameterMap",
	"sap/ui/integration/util/Measurement",
	"sap/ui/integration/util/DisplayVariants"
], function(
	CardRenderer,
	Footer,
	ActionsToolbar,
	BlockingMessage,
	Interface,
	Element,
	Library,
	jQuery,
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
	CardBase,
	fLibrary,
	library,
	Destinations,
	LoadingProvider,
	HeaderFactory,
	ContentFactory,
	BindingResolver,
	ErrorHandler,
	IconFormatter,
	FilterBarFactory,
	CardActions,
	CardObserver,
	IllustratedMessageType,
	ParameterMap,
	Measurement,
	DisplayVariants
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
		NO_DATA_MESSAGES: "/sap.card/configuration/messages/noData",
		MODEL_SIZE_LIMIT: "/sap.card/configuration/modelSizeLimit"
	};

	var RESERVED_PARAMETER_NAMES = ["visibleItems", "allItems"];

	var HeaderPosition = fLibrary.cards.HeaderPosition;

	var CardArea = library.CardArea;

	var CardDataMode = library.CardDataMode;

	var CardDesign = library.CardDesign;

	var CardDisplayVariant = library.CardDisplayVariant;

	var CardPreviewMode = library.CardPreviewMode;

	var CARD_DESTROYED_ERROR = "Card is destroyed!";

	var MODULE_PREFIX = "module:";

	var DEFAULT_MODEL_SIZE_LIMIT = 1000;

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
	 */
	var Card = CardBase.extend("sap.ui.integration.widgets.Card", /** @lends sap.ui.integration.widgets.Card.prototype */ {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				/**
				 * Optional property which can be used by the host to reference the card.
				 * It will be forwarded to any children cards.
				 * Does not affect the card behavior.
				 */
				referenceId : {
					type: "string",
					defaultValue: ""
				},

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
					defaultValue: CardDataMode.Auto
				},

				/**
				 * Defines the base URL of the card manifest. It should be used when manifest property is an object instead of a URL.
				 * If both manifest URL and base URL are defined - the base URL will be used for loading dependencies.
				 * If both manifest URL and base URL are not defined - relative resources might not be loaded correctly.
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
				 * Each item in the array represents a separate level of changes. For example, the first item might be created by an administrator, the second by a page administrator and the third by the end user.
				 *
				 * The order of the items is the order in which the changes will be merged on top of each other. So the last item will overwrite the previous items where the paths match.
				 *
				 * Example:
				 * <pre>
				 * [
				 * 	{
				 * 		// Administrator
				 * 		"/sap.card/header/title": "My Configured Title in Default Language",
				 * 		"/sap.card/content/maxItems": 10,
				 * 		"texts": {
				 * 			"en-US": {
				 * 				"/sap.card/header/title": "My Configured Title in US-English"
				 * 			}
				 * 		}
				 * 	},
				 * 	{
				 * 		// Page administrator
				 * 		"/sap.card/content/maxItems": 5
				 * 	},
				 * 	{
				 * 		// End user
				 *      "/sap.card/header/title": "Title by End User",
				 * 		"/sap.card/content/maxItems": 8
				 * 	}
				 * ]
				 * </pre>
				 *
				 * @experimental Since 1.76 This API might be removed when a permanent solution for flexibility changes is implemented.
				 * @since 1.76
				 */
				manifestChanges: {
					type: "object[]",
					defaultValue: []
				},

				/**
				 * Defines the design of the <code>Card</code>.
				 * @experimental Since 1.109
				 * @since 1.109
				 */
				design: {
					type: "sap.ui.integration.CardDesign",
					group: "Appearance",
					defaultValue: CardDesign.Solid
				},

				/**
				 * Defines the display variant for card rendering and behavior.
				 * @experimental Since 1.118. For usage only by Work Zone.
				 * @since 1.118
				 */
				displayVariant: {
					type: "sap.ui.integration.CardDisplayVariant",
					group: "Appearance",
					defaultValue: CardDisplayVariant.Standard
				},

				/**
				 * Preview mode of the <code>Card</code>.
				 * Helpful in scenarios when the end user is choosing or configuring a card.
				 * <ul>
				 * <li>When set to "MockData", the card data is loaded, using a data request, as configured in the "data/mockData" in the manifest. If such configuration is missing, then the Abstract mode will be used instead.</li>
				 * <li>When set to "Abstract", the card shows abstract placeholder without loading data.</li>
				 * <li>When set to "Off", the card displays real data.</li>
				 * </ul>
				 * @experimental Since 1.112
				 * @since 1.112
				 */
				previewMode: {
					type: "sap.ui.integration.CardPreviewMode",
					group: "Behavior",
					defaultValue: CardPreviewMode.Off
				},

				/**
				 * If the card should change depending on its size.
				 * This property is temporary. Should be used to enable the feature for cards where it is needed.
				 * @experimental Since 1.127
				 * @since 1.127
				 */
				useProgressiveDisclosure: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
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
				 *
				 * When an action is triggered in the card it can be handled on several places by "action" event handlers. In consecutive order those places are: <code>Extension</code>, <code>Card</code>, <code>Host</code>.
				 * Each of them can prevent the next one to handle the action by calling <code>oEvent.preventDefault()</code>.
				 *
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
						 *     "/sap.card/configuration/filters/shipper/value": "key3",
						 *     "/sap.card/configuration/filters/item/value": "key2",
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
				manifestApplied: {},

				/**
				 * Fired when the state of the card is changed.
				 * For example - the card is ready, new page is selected, a filter is changed or data is refreshed.
				 * @experimental since 1.107
				 */
				stateChanged: {}
			},
			associations: {

				/**
				 * The host.
				 */
				host: {},

				/**
				 * The opener card.
				 * @private
				 * @ui5-private
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

		this._oIntegrationRb = Library.getResourceBundleFor("sap.ui.integration");
		this._iModelSizeLimit = DEFAULT_MODEL_SIZE_LIMIT;
		this._oDisplayVariants = new DisplayVariants(this);
		this._initModels();
		this._oContentFactory = new ContentFactory(this);
		this._oCardObserver = new CardObserver(this);
		this._aSevereErrors = [];
		this._sPerformanceId = "UI5 Integration Cards " + this.getId() + " ";
		this._aActiveLoadingProviders = [];
		this._fnOnDataReady = function () {
			this._bDataReady = true;
		}.bind(this);

		this._fireStateChangedBound = this._fireStateChanged.bind(this);
		this._sizeFormatterBound = this._oDisplayVariants.sizeFormatter.bind(this._oDisplayVariants);

		/**
		 * Facade of the {@link sap.ui.integration.widgets.Card} control.
		 * @interface
		 * @name sap.ui.integration.widgets.CardFacade
		 * @experimental since 1.79
		 * @public
		 * @author SAP SE
		 * @version ${version}
		 * @borrows sap.ui.integration.widgets.Card#getId as getId
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
		 * @borrows sap.ui.integration.widgets.Card#hideMessage as hideMessage
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
		 * @borrows sap.ui.integration.widgets.Card#validateControls as validateControls
		 * @borrows sap.ui.integration.widgets.Card#showBlockingMessage as showBlockingMessage
		 * @borrows sap.ui.integration.widgets.Card#hideBlockingMessage as hideBlockingMessage
		 * @borrows sap.ui.integration.widgets.Card#getBlockingMessage as getBlockingMessage
		 */
		this._oLimitedInterface = new Interface(this, [
			"getId",
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
			"getOpener",
			"validateControls",
			"showBlockingMessage",
			"hideBlockingMessage",
			"getBlockingMessage"
		]);
	};

	/**
	 * Initializes the internally used models.
	 */
	Card.prototype._initModels = function () {
		this._INTERNAL_MODELS = {
			"default": {
				init: () => this.setModel(new JSONModel()),
				reset: () => this.getModel().setData({})
			},
			parameters: {
				init: () => this.setModel(new JSONModel(ParameterMap.getParamsForModel()), "parameters")
			},
			filters: {
				init: () => this.setModel(new JSONModel(), "filters"),
				reset: () => this.getModel("filters").setData({})
			},
			paginator: {
				init: () => this.setModel(new JSONModel({
					skip: 0,
					pageIndex: 0
				}),  "paginator"),
				reset: () => this.getModel("paginator").setData({
					skip: 0,
					pageIndex: 0
				})
			},
			form: {
				init: () => this.setModel(new JSONModel(), "form")
			},
			messages: {
				init: () => this.setModel(new JSONModel({
					hasErrors: false,
					hasWarnings: false,
					records: []
				}), "messages")
			},
			context: {
				init: () => this.setModel(new ContextModel(), "context")
			},
			i18n: {
				init: () => this.setModel(new ResourceModel({
					bundle: this._oIntegrationRb
				}), "i18n")
			},
			size: {
				init: () => this.setModel(this._oDisplayVariants.getInitialSizeModel(), "size")
			},
			widgetInfo: {
				init: () => this.setModel(new JSONModel(), "widgetInfo")
			}
		};

		for (const modelName in this._INTERNAL_MODELS) {
			this._INTERNAL_MODELS[modelName].init();
		}
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
		const aReadyPromises = this._aReadyPromises;
		this._awaitEvent("_dataReady");
		this._awaitEvent("_dataPassedToContent");
		this._awaitEvent("_headerReady");
		this._awaitEvent("_filterBarReady");
		this._awaitEvent("_contentReady");

		Promise.all(this._aReadyPromises).then(function () {
			if ( aReadyPromises === this._aReadyPromises ) {
				this._onReady();
			}
		}.bind(this));

		this.attachEventOnce("_dataReady", this._fnOnDataReady);
	};

	/**
	 * Clears the ready state of the card.
	 *
	 * @private
	 */
	Card.prototype._clearReadyState = function () {
		this._bReady = false;
		this._bDataReady = false;
		this._aReadyPromises = [];
		this.detachEvent("_dataReady", this._fnOnDataReady);
	};

	/**
	 * Called on before rendering of the control.
	 * @private
	 */
	Card.prototype.onBeforeRendering = function () {
		var oCardContent = this.getCardContent();
		if (oCardContent && oCardContent.isA("sap.ui.integration.cards.BaseContent")) {
			oCardContent.setDesign(this.getDesign());
		}

		if (this._getActualDataMode() !== CardDataMode.Active) {
			return;
		}
		this.startManifestProcessing();
	};

	/**
	 * Called after rendering of the control.
	 * @private
	 */
	Card.prototype.onAfterRendering = function () {
		if (this._isManifestReady) {
			if (!Measurement.hasEnded(this._sPerformanceId + "firstRenderingWithStaticData")) {
				Measurement.end(this._sPerformanceId + "firstRenderingWithStaticData");
			}

			if (this._bDataReady && !Measurement.hasEnded(this._sPerformanceId + "firstRenderingWithDynamicData")) {
				Measurement.end(this._sPerformanceId + "firstRenderingWithDynamicData");
			}
		}

		var oCardDomRef = this.getDomRef();

		if (this._getActualDataMode() === CardDataMode.Auto) {
			this._oCardObserver.observe(oCardDomRef);
		} else {
			this._oCardObserver.unobserve(oCardDomRef);
		}
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

	/*
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
	 * Instantiates a card manifest and applies it.
	 *
	 * @private
	 * @param {object|string} vManifest The manifest URL or the manifest JSON.
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

		Measurement.start(this._sPerformanceId + "initManifest", "Load and initialize manifest.");
		Measurement.start(this._sPerformanceId + "firstRenderingWithStaticData", "First rendering with static data (includes initManifest).");
		Measurement.start(this._sPerformanceId + "firstRenderingWithDynamicData","First rendering with dynamic card level data (includes firstRenderingWithStaticData).");

		this._oCardManifest = new CardManifest("sap.card", vManifest, sBaseUrl, this.getManifestChanges());

		this._oCardManifest
			.load(mOptions)
			.then(function () {
				if (this.isDestroyed()) {
					throw new Error(CARD_DESTROYED_ERROR);
				}

				if (!this._oCardManifest.get("/sap.app/id")) {
					this._logSevereError("Card sap.app/id entry in the manifest is mandatory");
				}

				return this._oCardManifest.loadDependenciesAndIncludes();
			}.bind(this))
			.then(function () {
				if (this.isDestroyed()) {
					throw new Error(CARD_DESTROYED_ERROR);
				}

				Measurement.end(this._sPerformanceId + "initManifest");
				this._isManifestReady = true;
				this.fireManifestReady();

				return this._loadExtension();
			}.bind(this))
			.then(this._applyManifest.bind(this))
			.catch(function (e) {
				if (e.message === CARD_DESTROYED_ERROR) {
					return;
				}

				this._logSevereError(e.message);

				// even if manifest processing or extension loading fails
				// we want to show the maximum from the card which we can - like header, footer and etc.
				this._applyManifest();
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
				this._logSevereError("Failed to load " + sFullExtensionPath + ". Check if the path is correct. Reason: " + vErr);
				reject(vErr);
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Logs an error which does not allow the card to be rendered.
	 * Use <code>getSevereErrors()</code> method to retrieve a list of such errors.
	 * @param {string} sMessage The error message.
	 */
	Card.prototype._logSevereError = function (sMessage) {
		Log.error(sMessage);
		this._aSevereErrors.push(sMessage);
	};

	/**
	 * Retrieves a list of severe errors that appeared during card initialization.
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {array} A list of severe errors if there are any. Empty array otherwise.
	 */
	Card.prototype.getSevereErrors = function () {
		return this._aSevereErrors;
	};

	/**
	 * Causes all of the controls within the Card
	 * that support validation to validate their data.
	 * @public
	 * @experimental
	 * @returns {boolean} if all of the controls validated successfully; otherwise, false
	 */
	Card.prototype.validateControls = function () {
		this._validateContentControls(true);
		return !this.getModel("messages").getProperty("/hasErrors");
	};

	/*
	* @private
	* @ui5-restricted sap.ui.integration
	*/
	Card.prototype.getModelSizeLimit = function () {
		return this._iModelSizeLimit;
	};

	Card.prototype._validateContentControls = function (bShowValueState, bSkipFiringStateChangedEvent) {
		var oCardContent = this.getCardContent();
		if (oCardContent && oCardContent.isA("sap.ui.integration.cards.BaseContent")) {
			oCardContent.validateControls(bShowValueState, bSkipFiringStateChangedEvent);
		}
	};

	/**
	 * Prepares the manifest and applies all settings.
	 */
	Card.prototype._applyManifest = function () {
		var oCardManifest = this._oCardManifest;

		if (!oCardManifest.get("/sap.card")) {
			this._logSevereError("There must be a 'sap.card' section in the manifest.");
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
		if (this._getActualDataMode() === CardDataMode.Active) {
			this._bApplyManifest = true;
			this.invalidate();
		}
	};

	/**
	 * Sets the value of a filter in the card.
	 *
	 * @private
	 * @ui5-restricted
	 * @param {string} sFilterKey the key of the filter as defined in the manifest
	 * @param {*} vValue value to set
	 */
	Card.prototype.setFilterValue = function (sFilterKey, vValue) {
		var mFiltersConfig = this._oCardManifest.get(MANIFEST_PATHS.FILTERS);
		if (!mFiltersConfig.hasOwnProperty(sFilterKey)) {
			Log.error("Filter with key '" + sFilterKey + "' does not exist in the manifest section 'filters'.", "sap.ui.integration.widgets.Card");
			return;
		}

		var oFilterBar = this.getAggregation("_filterBar");
		if (!oFilterBar) {
			return;
		}

		var oFilter = oFilterBar._getFilters().find(function (oFilter) {
			return oFilter.getKey() === sFilterKey;
		});

		oFilter.setValueFromOutside(vValue);
	};

	/**
	 * Sets the values of form fields in the Object card.
	 * Each value in the aFormValues array must have a
	 * key and the respective value for ObjectGroupItems as defined in the card's manifest:
	 * <code>[
	 *     {
	 *         "id": "textAreaItemId",
	 *         "value": "New value"
	 *     },
	 *     {
	 *         "id": "textAreaItemId",
	 *         "value": "New value"
	 *     },
	 *     {
	 *         "id": "comboBoxItemId",
	 *         "selectedKey": "key"
	 *     }
	 * ]</code>
	 *
	 * @private
	 * @ui5-restricted
	 * @param {object[]} aFormValues Array key and value
	 */
	Card.prototype.setFormValues = function (aFormValues) {
		var oContent  = this.getCardContent();
		if (oContent && !oContent.isA("sap.ui.integration.cards.ObjectContent")) {
			Log.error("Setting form element values is available only on an Object card" , "sap.ui.integration.widgets.Card");
			return;
		}

		aFormValues.forEach(function (oFieldData) {
			oContent.setFormFieldValue(oFieldData);
		});
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

		this.refreshAllData();
		this.resetPaginator();
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 */
	Card.prototype.refreshAllData = function () {
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
			aActions = [];

		this.getAggregation("_extension");

		if (!oCardHeader) {
			return;
		}

		if (oHost) {
			aActions = aActions.concat(oHost.getActions() || []);
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
		this._oDisplayVariants = null;
		this._oContentFactory = null;
		this._oIntegrationRb = null;
		this._aActiveLoadingProviders = null;
		this._oMessage = null;
		clearTimeout(this._iFireStateChangedCallId);

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
		this.destroyAggregation("_content");
		this.destroyAggregation("_filterBar");
		this.destroyAggregation("_footer");

		this._cleanupOldManifest();
	};

	/**
	 * Cleans up internal models and other before new manifest processing.
	 */
	Card.prototype._cleanupOldManifest = function() {

		if (this._fnOnModelChange) {
			this.getModel().detachEvent("change", this._fnOnModelChange, this);
			delete this._fnOnModelChange;
		}

		for (const modelName in this._INTERNAL_MODELS) {
			if (this._INTERNAL_MODELS[modelName].reset) {
				this._INTERNAL_MODELS[modelName].reset();
			}
		}

		this._oContextParameters = null;

		this._deregisterCustomModels();

		this.destroyAggregation("_extension");

		// destroying the factory would also destroy the data provider
		if (this._oDataProviderFactory) {
			this._oDataProviderFactory.destroy();
			this._oDataProviderFactory = null;
			this._oDataProvider = null;
		}

		this._setLoadingProviderState(false);
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
	 * @returns {any} The value at the specified path.
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
	 * @private
	 * @ui5-restricted sap.ui.integration
	 */
	Card.prototype.extendStaticConfiguration = function (oConfig) {
		if (this._oMessage) {
			oConfig.messageStrip = BindingResolver.resolveValue(this._oMessage, this);
		}
	};

	/**
	 * Resolves the destination and returns its URL.
	 * @public
	 * @param {string} sKey The destination's key used in the configuration.
	 * @returns {Promise<string>} A promise which resolves with the URL of the destination.
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
		var oContent = this.getCardContent();

		if (oContent && oContent.isA("sap.ui.integration.cards.BaseContent")) {
			oContent.showMessage(sMessage, sType);
			this._oMessage = {
				text: sMessage,
				type: sType
			};
			this.scheduleFireStateChanged();
		} else {
			Log.error("'showMessage' cannot be used before the card instance is ready. Consider using the event 'manifestApplied' event.", "sap.ui.integration.widgets.Card");
		}
	};

	/**
	 * Hides the message previously shown by showMessage.
	 *
	 * @public
	 * @experimental As of version 1.117
	 */
	Card.prototype.hideMessage = function () {
		var oContent = this.getCardContent();

		if (oContent && oContent.isA("sap.ui.integration.cards.BaseContent")) {
			oContent.hideMessage();
			this._oMessage = null;
			this.scheduleFireStateChanged();
		} else {
			Log.error("'showMessage' cannot be used before the card instance is ready. Consider using the event 'manifestApplied' event.", "sap.ui.integration.widgets.Card");
		}
	};

	/**
	 * Settings for blocking message that ocurred in a {@link sap.ui.integration.widgets.Card}
	 *
	 * @typedef {object} sap.ui.integration.BlockingMessageSettings
	 * @property {sap.ui.integration.CardBlockingMessageType} type Blocking message type
	 * @property {sap.m.IllustratedMessageType} illustrationType Illustration type
	 * @property {sap.m.IllustratedMessageSize} [illustrationSize=sap.m.IllustratedMessageSize.Auto] Illustration size
	 * @property {string} title Title
	 * @property {string} [description] Description
	 * @property {string} [imageSrc] Path to a custom image to be shown on the place of the regular illustration. Relative to the card base URL.
	 * @property {Response} [httpResponse] Response object in case of a network error
	 * @property {array} [additionalContent] A list of buttons placed below the description as additional content. Experimental since 1.121
	 * @public
	 * @experimental As of version 1.114
	 */

	/**
	 * Show blocking message in the card's content area.
	 * Should be used after the <code>manifestApplied</code> event or after the <code>cardReady</code> lifecycle hook in Component cards and Extensions.
	 *
	 * @public
	 * @experimental As of version 1.114
	 * @param {sap.ui.integration.BlockingMessageSettings} oSettings Blocking message settings
	 */
	Card.prototype.showBlockingMessage = function (oSettings) {
		var oContent = this.getCardContent();

		if (oContent) {
			oContent.showBlockingMessage(oSettings);
			this.scheduleFireStateChanged();
		}
	};

	/**
	 * Get information about the blocking message in the card.
	 *
	 * @public
	 * @experimental As of version 1.114
	 * @returns {sap.ui.integration.BlockingMessageSettings|null} Information about the message or <code>null</code>, if such isn't shown.
	 */
	Card.prototype.getBlockingMessage = function () {
		var oContent = this.getCardContent();

		if (oContent && oContent.isA("sap.ui.integration.cards.BaseContent")) {
			return oContent.getBlockingMessage();
		} else if (oContent && oContent.isA("sap.ui.integration.controls.BlockingMessage")) { // case where error ocurred during content creation
			return {
				type: oContent.getType(),
				illustrationType: oContent.getIllustrationType(),
				illustrationSize: oContent.getIllustrationSize(),
				title: oContent.getTitle(),
				description: oContent.getDescription(),
				imageSrc: oContent.getImageSrc()
			};
		}

		return null;
	};

	/**
	 * Hide the blocking message that is shown in the card by <code>showBlockingMessage</code> call.
	 *
	 * @public
	 * @experimental As of version 1.114
	 */
	Card.prototype.hideBlockingMessage = function () {
		var oContent = this.getCardContent();

		if (oContent) {
			oContent.hideBlockingMessage();
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
	 * oCard.getRuntimeUrl("images/Avatar.png") === "{cardBaseUrl}/images/Avatar.png"
	 * oCard.getRuntimeUrl("http://www.someurl.com/Avatar.png") === "http://www.someurl.com/Avatar.png"
	 * oCard.getRuntimeUrl("https://www.someurl.com/Avatar.png") === "https://www.someurl.com/Avatar.png"
	 *
	 * @ui5-restricted
	 * @param {string} sUrl The URL to resolve.
	 * @returns {string} The resolved URL.
	 */
	Card.prototype.getRuntimeUrl = function (sUrl) {

		var sAppId = this._oCardManifest ? this._oCardManifest.get("/sap.app/id") : null,
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
	 * Returns the matching value from the query.
	 *
	 * size('standard') => true
	 *
	 * size({small:2, standard:5, large: 10}) => 5
	 *
	 * @private
	 * @ui5-restricted UPA
	 * @param {string|object} vQuery The query.
	 * @returns {*} The result.
	 */
	Card.prototype.sizeQuery = function (vQuery) {
		return this._oDisplayVariants.sizeFormatter(vQuery);
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

		this._checkMockPreviewMode();

		this._applyModelSizeLimit();

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
		var oPredefinedParameters = ParameterMap.getParamsForModel(),
			oCustomParameters = {},
			oCombinedParameters = this.getCombinedParameters(),
			sKey;

		for (sKey in oCombinedParameters) {
			if (RESERVED_PARAMETER_NAMES.indexOf(sKey) >= 0) {
				Log.warning("The parameter name '" + sKey + "' is reserved for cards. Can not be used for creating custom parameter.");
			} else {
				oCustomParameters[sKey] = {value: oCombinedParameters[sKey]};
			}
		}
		this.getModel("parameters").setData(merge(oPredefinedParameters, oCustomParameters));
	};

	Card.prototype._applyDataManifestSettings = function () {
		var oDataSettings = this._oCardManifest.get(MANIFEST_PATHS.DATA),
			oModel;

		if (!oDataSettings) {
			this.fireEvent("_dataReady");
			this.fireEvent("_dataPassedToContent");
			return;
		}

		this.bindObject(BindingResolver.resolveValue(oDataSettings.path || "/", this));

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);

		if (oDataSettings.name) {
			oModel = this.getModel(oDataSettings.name);
		} else if (this._oDataProvider) {
			oModel = new ObservableModel();
			oModel.setSizeLimit(this.getModelSizeLimit());
			this.setModel(oModel);
		}

		if (!oModel) {
			this.fireEvent("_dataReady");
			this.fireEvent("_dataPassedToContent");
			return;
		}

		this._fnOnModelChange = function () {
			var oCardContent = this.getCardContent();

			if (oCardContent && oCardContent.isA("sap.ui.integration.cards.BaseContent")) {
				oCardContent.onCardDataChanged();
			}

			if (this.getCardFooter()) {
				this.getCardFooter().onDataChanged();
			}

			this.fireEvent("_dataPassedToContent");
			this.onDataRequestComplete();
		};

		oModel.attachEvent("change", this._fnOnModelChange, this);

		if (this._oDataProvider) {
			this._oDataProvider.attachDataRequested(function () {
				this._setLoadingProviderState(true);
			}.bind(this));

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this.fireEvent("_dataReady");
				oModel.setData(oEvent.getParameter("data"));
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this.fireEvent("_dataReady");
				this.fireEvent("_dataPassedToContent");
				this._handleError({
					requestErrorParams: oEvent.getParameters(),
					requestSettings: this._oDataProvider.getSettings()
				});
				this.onDataRequestComplete();
			}.bind(this));

			this._oDataProvider.triggerDataUpdate();
		} else {
			this.fireEvent("_dataReady");
			this.fireEvent("_dataPassedToContent");
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
	 *
	 * @private
	 */
	Card.prototype._applyModelSizeLimit = function () {
		var iModelSizeLimit = this._oCardManifest.get(MANIFEST_PATHS.MODEL_SIZE_LIMIT);
		this._iModelSizeLimit = iModelSizeLimit !== undefined ? iModelSizeLimit : DEFAULT_MODEL_SIZE_LIMIT;
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @ui5-restricted
	 * @private
	 * @returns {sap.f.cards.IHeader} The header of the card
	 */
	Card.prototype.getCardHeader = function () {
		return this.getAggregation("_header");
	};

	/**
	 * Implements sap.f.ICard interface.
	 *
	 * @ui5-restricted
	 * @private
	 * @returns {sap.f.cards.HeaderPosition} The position of the header of the card.
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
	 * @ui5-restricted
	 * @private
	 * @returns {sap.ui.core.Control} The content of the card
	 */
	Card.prototype.getCardContent = function () {
		return this.getAggregation("_content");
	};

	/**
	 * @ui5-restricted
	 * @private
	 * @returns {sap.ui.integration.cards.Footer} The footer of the card
	 */
	Card.prototype.getCardFooter = function () {
		return this.getAggregation("_footer");
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
			this._oActionsToolbar.setEnabled(false);
		}

		return this._oActionsToolbar;
	};

	/**
	 * Lazily load and create a specific type of card header based on sap.card/header part of the manifest
	 *
	 * @private
	 */
	Card.prototype._applyHeaderManifestSettings = function () {
		var oPrevHeader = this.getAggregation("_header");

		if (oPrevHeader) {
			oPrevHeader.setToolbar(null); // ensure that actionsToolbar won't be destroyed
			this.destroyAggregation("_header");
		}

		var oHeader = this.createHeader();

		if (!oHeader) {
			this.fireEvent("_headerReady");
			return;
		}

		oHeader.attachEvent("_error", function (oEvent) {
			this._handleError(oEvent.getParameter("errorInfo"));
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

		this.destroyAggregation("_footer");

		if (this._shouldIgnoreFooter()) {
			return;
		}
		var oFooter = this.createFooter();

		if (oFooter) {
			this.setAggregation("_footer", oFooter);
		}

		this.fireEvent("_footerReady");
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

		return Element.getElementById(sHost);
	};

	/**
	 * Creates specific type of card content based on sap.card/content part of the manifest
	 *
	 * @private
	 */
	Card.prototype._applyContentManifestSettings = function () {
		var sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE),
			oContentManifest = this.getContentManifest(),
			sAriaText = sCardType + " " + this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD"),
			oContent;

		this.destroyAggregation("_content");
		this._ariaText.setText(sAriaText);

		if (this._shouldIgnoreContent()) {
			this.fireEvent("_contentReady");
			return;
		}

		try {
			oContent = this.createContent({
				cardType: sCardType,
				contentManifest: oContentManifest,
				serviceManager: this._oServiceManager,
				dataProviderFactory: this._oDataProviderFactory,
				iconFormatter: this._oIconFormatter,
				noDataConfiguration: this._oCardManifest.get(MANIFEST_PATHS.NO_DATA_MESSAGES)
			});
		} catch (e) {
			this._handleError({
				illustrationType: IllustratedMessageType.ErrorScreen,
				title: this.getTranslatedText("CARD_ERROR_CONFIGURATION_TITLE"),
				description: this.getTranslatedText("CARD_ERROR_CONFIGURATION_DESCRIPTION"),
				details: e.message,
				originalError: e
			});
			return;
		}

		this._setCardContent(oContent);
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {boolean} If the card is rendered as a tile variant
	 */
	Card.prototype.isTileDisplayVariant = function () {
		const aTileVariants = [
			CardDisplayVariant.TileStandard,
			CardDisplayVariant.TileStandardWide,
			CardDisplayVariant.TileFlat,
			CardDisplayVariant.TileFlatWide
		];
		return aTileVariants.indexOf(this.getDisplayVariant()) > -1;
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {boolean} If the card is rendered as a compactheader variant
	 */
	Card.prototype.isCompactHeader = function () {
		return this.getDisplayVariant() === CardDisplayVariant.CompactHeader;
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {boolean} If the card is rendered as a smallheader variant
	 */
	Card.prototype.isSmallHeader = function () {
		return this.getDisplayVariant() === CardDisplayVariant.SmallHeader;
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {boolean} If the card is rendered as a tile variant
	 */
	Card.prototype.isHeaderDisplayVariant = function () {
		const aHeaderVariants = [
			CardDisplayVariant.SmallHeader,
			CardDisplayVariant.StandardHeader,
			CardDisplayVariant.CompactHeader
		];
		return aHeaderVariants.indexOf(this.getDisplayVariant()) > -1;
	};

	/**
	 * Checks if this is a Component Card. Manifest must be loaded for that check.
	 * @private
	 * @returns {boolean} True if this is a Component Card.
	 */
	Card.prototype._isComponentCard = function () {
		const sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE);

		return sCardType?.toLowerCase() === "component";
	};

	/**
	 * Checks if the content section should be ignored.
	 * @private
	 * @returns {boolean} True if the content section should be ignored.
	 */
	Card.prototype._shouldIgnoreContent = function () {
		if (this._isComponentCard()) {
			return false;
		}

		const bIsTile = this.isTileDisplayVariant();
		const bIsHeader = this.isHeaderDisplayVariant();
		const bHasNoContent = !this._oCardManifest.get(MANIFEST_PATHS.CONTENT);

		return bIsTile || bHasNoContent || bIsHeader;
	};

	/**
	 * Checks if the content section should be ignored.
	 * @private
	 * @returns {boolean} True if the content section should be ignored.
	 */
	Card.prototype._shouldIgnoreFooter = function () {
		const bIsTile = this.isTileDisplayVariant();
		const bIsHeader = this.isHeaderDisplayVariant();
		return bIsTile || bIsHeader;
	};

	Card.prototype.createHeader = function () {
		var oManifestHeader = this._oCardManifest.get(MANIFEST_PATHS.HEADER),
			oHeaderFactory = new HeaderFactory(this);

		return oHeaderFactory.create(oManifestHeader, this._getActionsToolbar() /** move the toolbar to the next header */);
	};

	Card.prototype.createFilterBar = function () {
		var mFiltersConfig = this._oCardManifest.get(MANIFEST_PATHS.FILTERS),
			oFactory = new FilterBarFactory(this);

		return oFactory.create(mFiltersConfig, this.getModel("filters"), (oEvent) => {
			this._fireConfigurationChange({
				[`/sap.card/configuration/filters/${oEvent.getParameter("key")}/value`]: oEvent.getParameter("value")
			});
			this.resetPaginator();
		});
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
			bIsComponent = this._isComponentCard(),
			oContentManifest = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
			bHasContent = !!oContentManifest;

		if (bHasContent && !sCardType) {
			this._logSevereError("Card type property is mandatory!");
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
		oContent.attachEvent("_error", function (oEvent) {
			this._handleError(oEvent.getParameter("errorInfo"));
		}.bind(this));

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
	 * Handler for error states.
	 * If the content is not provided in the manifest, or the card is not of type Component, the error message will be displayed in the header.
	 * If a message is not provided, a default message will be displayed.
	 *
	 * @private
	 */
	Card.prototype._handleError = function (mErrorInfo) {
		const oExtensionMessage = this._extensionErrorOverride(mErrorInfo);
		if (oExtensionMessage) {
			this.showBlockingMessage(oExtensionMessage);
			return;
		}

		const sLogMessage = mErrorInfo.requestErrorParams ? mErrorInfo.requestErrorParams.message : mErrorInfo.title,
			oContent = this.getCardContent();

		let mMessageSettings;

		Log.error(sLogMessage, mErrorInfo.originalError, "sap.ui.integration.widgets.Card");
		this.fireEvent("_error", { message: sLogMessage });

		if (mErrorInfo.requestErrorParams) {
			mMessageSettings = ErrorHandler.configureDataRequestErrorInfo(mErrorInfo, this);
		} else {
			mMessageSettings = ErrorHandler.configureErrorInfo(mErrorInfo, this);
		}

		if (!this._shouldIgnoreContent()) {
			if (oContent && oContent.isA("sap.ui.integration.cards.BaseContent")) {
				this.showBlockingMessage(mMessageSettings);
			} else { // case where error ocurred during content creation
				this.destroyAggregation("_content");
				this.setAggregation("_content", BlockingMessage.create(mMessageSettings, this));
				this.fireEvent("_contentReady"); // content won't show up so mark it as ready
			}
		} else {
			this.getCardHeader().setAggregation("_error", BlockingMessage.create(mMessageSettings, this));
		}
	};

	Card.prototype._extensionErrorOverride = function (mErrorInfo) {
		const oExtension = this.getAggregation("_extension");

		if (!oExtension || !oExtension.overrideBlockingMessage) {
			return null;
		}

		const oResponse = mErrorInfo?.requestErrorParams?.response;
		return oExtension.overrideBlockingMessage(oResponse);
	};

	/**
	 * @ui5-restricted sap.ui.integration
	 * @private
	 * @returns {object} The content message if any.
	 */
	Card.prototype.getContentMessage = function () {
		return this.getCardContent()?.getBlockingMessageStaticConfiguration();
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

		this.setProperty("dataMode", sMode);

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
	 * @returns {Promise<object>} Promise resolves after the designtime configuration is loaded.
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
				oArea = this.getCardContent();
				if (oArea && oArea.isA("sap.ui.integration.cards.BaseContent")) {
					oArea.showLoadingPlaceholders();
				}
				break;
			default:
				this.showLoadingPlaceholders(CardArea.Header);
				this.showLoadingPlaceholders(CardArea.Filters);
				this.showLoadingPlaceholders(CardArea.Content);
				this._setLoadingProviderState(true);
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
				oArea = this.getCardContent();
				if (oArea && oArea.isA("sap.ui.integration.cards.BaseContent")) {
					oArea.hideLoadingPlaceholders();
				}
				break;

			default:
				this.hideLoadingPlaceholders(CardArea.Header);
				this.hideLoadingPlaceholders(CardArea.Filters);
				this.hideLoadingPlaceholders(CardArea.Content);
				this._setLoadingProviderState(false);
		}

		return this;
	};

	/**
	 * Decides if the card needs a loading placeholder
	 *
	 * @returns {boolean} Should card have a loading placeholder
	 */
	Card.prototype.isLoading = function () {
		return this.getAggregation("_loadingProvider").getLoading();
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

	Card.prototype.onDataRequestComplete = function () {
		var oContent = this.getCardContent();

		this.hideLoadingPlaceholders(CardArea.Header);
		this.hideLoadingPlaceholders(CardArea.Filters);

		if (oContent && oContent.isA("sap.ui.integration.cards.BaseContent") && oContent.isReady()) {
			this.hideLoadingPlaceholders(CardArea.Content);
		}

		this._setLoadingProviderState(false);

		this._fireContentDataChange();
	};

	/**
	 * Performs an HTTP request using the given configuration.
	 *
	 * @public
	 * @experimental since 1.79
	 * @param {object} oConfiguration The configuration of the request.
	 * @param {string} oConfiguration.url The URL of the resource.
	 * @param {string} [oConfiguration.mode="cors"] The mode of the request. Possible values are "cors", "no-cors", "same-origin".
	 * @param {string} [oConfiguration.method="GET"] The HTTP method. Possible values are "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", and "HEAD".
	 * @param {object} [oConfiguration.parameters] The request parameters. If the HTTP method is "POST", "PUT", "PATCH", or "DELETE" the parameters will be put as key/value pairs into the body of the request.
	 * @param {string} [oConfiguration.dataType="json"] Deprecated. Use the correct Accept headers and correct Content-Type header in the response.
	 * @param {object} [oConfiguration.headers] The HTTP headers of the request.
	 * @param {boolean} [oConfiguration.withCredentials=false] Indicates whether cross-site requests should be made using credentials.
	 * @returns {Promise<any>} Resolves when the request is successful, rejects otherwise.
	 */
	Card.prototype.request = function (oConfiguration) {
		return this.processDestinations(oConfiguration).then((oResult) => {
			return new Promise((resolve, reject) => {
				this._oDataProviderFactory
				.create({ request: oResult },
					undefined,
					undefined,
					undefined,
					true)
				.setAllowCustomDataType(true)
				.attachDataChanged((e) => { resolve(e.getParameter("data")); })
				.attachError((e) => { reject([e.getParameter("message"), e.getParameter("response"), e.getParameter("responseText"), e.getParameter("settings")]); })
				.triggerDataUpdate();
			});
		});
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

	Card.prototype.setPreviewMode = function (sPreviewMode) {
		var sOldMode = this.getPreviewMode();
		this.setProperty("previewMode", sPreviewMode);

		if (sOldMode !== this.getPreviewMode()) {
			this._bApplyManifest = true;
		}

		return this;
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

		mNamespaces.size = this._sizeFormatterBound;

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

			if (this._INTERNAL_MODELS[sModelName]) {
				Log.error("The model name (data section name) '" + sModelName + "' is reserved for cards. Can not be used for creating a custom model.");
				return;
			}

			if (this._aCustomModels.indexOf(sModelName) > -1) {
				Log.error("The model name (data section name) '" + sModelName + "' is already used.");
				return;
			}

			var oModel = new ObservableModel();
			oModel.setSizeLimit(this.getModelSizeLimit());
			this.setModel(oModel, sModelName);
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

		if (!this.isReady()) {
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

	/**
	 * Schedules to fire the stateChanged event. If called multiple times in the same tick, only one stateChanged will be fired.
	 * @private
	 * @ui5-restricted sap.ui.integration
	 */
	Card.prototype.scheduleFireStateChanged = function () {
		if (this._iFireStateChangedCallId) {
			clearTimeout(this._iFireStateChangedCallId);
		}

		this._iFireStateChangedCallId = setTimeout(this._fireStateChangedBound, 0);
	};

	/**
	 * Fires the stateChanged event of the card and of the host if any.
	 * @private
	 */
	Card.prototype._fireStateChanged = function () {
		var oHostInstance = this.getHostInstance();

		if (!this.isReady()) {
			return;
		}

		this.fireStateChanged();

		if (oHostInstance) {
			oHostInstance.fireCardStateChanged({
				card: this
			});
		}
	};

	/**
	 * Fires the initial ready event of the card and of the host if any.
	 * This ready event is fired only once and will not be fired consecutively, even if the card is fully refreshed.
	 * @private
	 */
	Card.prototype._fireInitialized = function () {
		if (this._bInitializedFired) {
			return;
		}

		var oHostInstance = this.getHostInstance();

		this.fireEvent("_initialized");
		this._bInitializedFired = true;

		if (oHostInstance) {
			oHostInstance.fireCardInitialized({
				card: this
			});
		}
	};

	Card.prototype._fireDataChange = function () {
		this.fireEvent("_dataChange");
		this.scheduleFireStateChanged();
	};

	Card.prototype._fireContentDataChange = function () {
		this.fireEvent("_contentDataChange");
		this._fireDataChange();
	};

	Card.prototype._onReady = function () {
		this._bReady = true;
		this._setActionButtonsEnabled(true);
		this._validateContentControls(false, true);
		this.fireEvent("_ready");
		this._fireInitialized();
		this.scheduleFireStateChanged();
	};

	/**
	 * @private
	 */
	Card.prototype._setLoadingProviderState = function (bLoading) {
		var oLoadingProvider = this.getAggregation("_loadingProvider");

		if (this._isDataProviderJson()) {
			return;
		}

		oLoadingProvider.setLoading(bLoading);

		if (bLoading) {
			this.addActiveLoadingProvider(oLoadingProvider);
		} else {
			this.removeActiveLoadingProvider(oLoadingProvider);
		}
	};

	/**
	 * @private
	 */
	Card.prototype.addActiveLoadingProvider = function (oLoadingProvider) {
		if (!this.isReady()) {
			return;
		}

		if (!this.hasActiveLoadingProvider()) {
			this._setActionButtonsEnabled(false);
		}

		if (this._aActiveLoadingProviders.indexOf(oLoadingProvider) === -1) {
			this._aActiveLoadingProviders.push(oLoadingProvider);
		}
	};

	/**
	 * @private
	 */
	Card.prototype.removeActiveLoadingProvider = function (oLoadingProvider) {
		if (!this.isReady()) {
			return;
		}

		var aActiveLoadingProviders = this._aActiveLoadingProviders,
			iIndexOf = aActiveLoadingProviders.indexOf(oLoadingProvider);

		aActiveLoadingProviders.splice(iIndexOf, 1);

		if (!this.hasActiveLoadingProvider()) {
			this._setActionButtonsEnabled(true);
		}
	};

	Card.prototype._setActionButtonsEnabled = function (bValue) {
		var oFooter = this.getAggregation("_footer");
		if (oFooter) {
			oFooter.setEnabled(bValue);
		}

		if (this._oActionsToolbar) {
			this._oActionsToolbar.setEnabled(bValue);
		}
	};

	/**
	 * @private
	 */
	Card.prototype.hasActiveLoadingProvider = function () {
		return this._aActiveLoadingProviders.length > 0;
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
		var vMaxItems,
			iMaxItems,
			oFooter = this.getCardFooter();

		if (oFooter && oFooter.getPaginator()) {
			return oFooter.getPaginator().getPageSize();
		}

		vMaxItems = BindingResolver.resolveValue(oContentConfig.maxItems, this);
		if (vMaxItems == null) {
			return null;
		}

		iMaxItems = parseInt(vMaxItems);
		if (isNaN(iMaxItems)) {
			Log.error("Value for maxItems must be integer.");
			return null;
		}

		return iMaxItems;
	};

	/**
	 * @private
	 */
	Card.prototype.getContentMinItems = function (oContentConfig) {
	   var vMinItems = BindingResolver.resolveValue(oContentConfig.minItems, this),
		   iMinItems;

	   if (vMinItems == null) {
		   return this.getContentPageSize(oContentConfig);
	   }

	   iMinItems = parseInt(vMinItems);
	   if (isNaN(iMinItems)) {
		   Log.error("Value for minItems must be integer.");
		   return null;
	   }

	   return iMinItems;
   };

	Card.prototype.hasPaginator = function () {
		var oManifestFooter = this._oCardManifest.get(MANIFEST_PATHS.FOOTER);
		return oManifestFooter && oManifestFooter.paginator;
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 */
	Card.prototype.resetPaginator = function () {
		if (this.hasPaginator()) {
			this.getCardFooter().getPaginator().reset();
		}
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
		var oOpener = Element.getElementById(this.getAssociation("openerReference"));

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
				host: this.getHostInstance(),
				parameters: oParameters.parameters,
				referenceId: this.getReferenceId()
			});

		oChildCard.setAssociation("openerReference", this);

		if (oData) {
			each(oData, function (sModelName, oModelData) {
				var oModel = new JSONModel(oModelData);
				oModel.setSizeLimit(this.getModelSizeLimit());
				oChildCard.setModel(oModel, sModelName);
			}.bind(this));
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

	/**
	 * Checks if the card data provider is of JSON type.
	 * @private
	 * @returns {boolean} True if data provider is JSON.
	 */
	Card.prototype._isDataProviderJson = function () {
		return this._oDataProvider && this._oDataProvider.getSettings() && this._oDataProvider.getSettings()["json"];
	};

	/**
	 * Checks if mock data is configured when preview mode is set to MockData.
	 * @private
	 */
	Card.prototype._checkMockPreviewMode = function () {
		if (this.getPreviewMode() !== CardPreviewMode.MockData) {
			return;
		}

		var aDataSections = this._oCardManifest.findDataSections(),
			bHasMissingMockData;

		bHasMissingMockData = aDataSections.some(function (oDataSettings) {
			if (!DataProviderFactory.isProvidingConfiguration(oDataSettings)) {
				// data section with only a "path" property
				return false;
			}

			return !(oDataSettings.mockData && DataProviderFactory.isProvidingConfiguration(oDataSettings.mockData));
		});

		if (bHasMissingMockData) {
			Log.info("'mockData' configuration is missing, but the card 'previewMode' is 'MockData'. Abstract mode will be used instead.", this);
			this.setProperty("previewMode", CardPreviewMode.Abstract);
		}
	};

	Card.prototype._getActualDataMode = function () {
		var sDataMode = this.getDataMode();

		if (sDataMode === CardDataMode.Auto && this._oCardObserver.isIntersected()) {
			return CardDataMode.Active;
		}

		return sDataMode;
	};

	/**
	 * Sets the display variant and informs the size model.
	 * @param {sap.ui.integration.DisplayVariant} sValue The new display variant.
	 * @param {boolean} bSuppressInvalidate Whether to suppress invalidation.
	 * @return {sap.ui.integration.widgets.Card} Pointer to the control instance to allow method chaining.
	 */
	Card.prototype.setDisplayVariant = function (sValue, bSuppressInvalidate) {
		this.setProperty("displayVariant", sValue, bSuppressInvalidate);
		this._oDisplayVariants.updateSizeModel();
		return this;
	};

	return Card;
});
