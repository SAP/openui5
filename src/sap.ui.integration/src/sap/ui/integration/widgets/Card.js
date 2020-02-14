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
	"sap/f/cards/DataProviderFactory",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/Header",
	"sap/f/cards/BaseContent",
	"sap/f/cards/IconFormatter",
	"sap/f/cards/BindingHelper",
	"sap/f/cards/CardActions",
	"sap/f/cards/NumericSideIndicator",
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
	"sap/base/strings/formatMessage",
	"sap/ui/integration/controls/ActionsToolbar"
], function (
	jQuery,
	Core,
	Control,
	CardManifest,
	ServiceManager,
	Log,
	DataProviderFactory,
	NumericHeader,
	Header,
	BaseContent,
	IconFormatter,
	BindingHelper,
	CardActions,
	NumericSideIndicator,
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
	formatMessage,
	ActionsToolbar
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

	var AreaType = fLibrary.cards.AreaType;

	var CardDataMode = library.CardDataMode;

	/**
	 * Binds the statusText of a header to the provided format configuration.
	 *
	 * @private
	 * @param {Object} mFormat The formatting configuration.
	 * @param {sap.f.cards.IHeader} oHeader The header instance.
	 */
	function bindStatusText(mFormat, oHeader) {

		if (mFormat.parts && mFormat.translationKey && mFormat.parts.length === 2) {
			var oBindingInfo = {
				parts: [
					mFormat.translationKey,
					mFormat.parts[0].toString(),
					mFormat.parts[1].toString()
				],
				formatter: function (sText, vParam1, vParam2) {
					var sParam1 = vParam1 || mFormat.parts[0];
					var sParam2 = vParam2 || mFormat.parts[1];

					if (Array.isArray(vParam1)) {
						sParam1 = vParam1.length;
					}
					if (Array.isArray(vParam2)) {
						sParam2 = vParam2.length;
					}

					var iParam1 = parseFloat(sParam1) || 0;
					var iParam2 = parseFloat(sParam2) || 0;

					return formatMessage(sText, [iParam1, iParam2]);
				}
			};

			oHeader.bindProperty("statusText", oBindingInfo);
		}
	}

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
	 * <li>When you have to achieve simple card visualization. For such cases, use: {@link sap.f.Card Card}.</li>
	 * <li>When you have to use an application model. For such cases, use: {@link sap.f.Card Card}.</li>
	 * <li>When you need complex behavior. For such cases, use: {@link sap.f.Card Card}.</li>
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
				 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
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
						 */
						manifestParameters: {
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
		this.setBusyIndicatorDelay(0);
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

		this._oReadyPromise = Promise.all(this._aReadyPromises).then(function () {
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
		this._oReadyPromise = null;
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

	Card.prototype.setParameters = function (vValue) {
		this.setProperty("parameters", vValue);
		this._bApplyManifest = true;
		return this;
	};

	/**
	 * Instantiates a Card Manifest and applies it.
	 *
	 * @private
	 * @param {Object|string} vManifest The manifest URL or the manifest JSON.
	 * @param {string} sBaseUrl The base URL of the manifest.
	 * @returns {Promise} A promise resolved when the manifest is created and applied.
	 */
	Card.prototype.createManifest = function (vManifest, sBaseUrl) {
		var mOptions = {};
		if (typeof vManifest === "string") {
			mOptions.manifestUrl = vManifest;
			vManifest = null;
		}

		this._startBusyState("applyManifest");
		this._oCardManifest = new CardManifest("sap.card", vManifest, sBaseUrl);
		return this._oCardManifest
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
		var oParameters = this.getParameters();

		this._registerManifestModulePath();

		if (this._oCardManifest && this._oCardManifest.getResourceBundle()) {
			this._enhanceI18nModel(this._oCardManifest.getResourceBundle());
		}

		this._oCardManifest.processParameters(oParameters);
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

		if (this._oTemporaryContent) {
			this._oTemporaryContent.destroy();
			this._oTemporaryContent = null;
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

		this._oDataProviderFactory = new DataProviderFactory();

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

		if (this._oDataProvider) {
			this._startBusyState("data");
			this.setModel(new JSONModel());

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this.getModel().setData(oEvent.getParameter("data"));
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError("Data service unavailable. " + oEvent.getParameter("message"));
			}.bind(this));

			this._oDataProvider.triggerDataUpdate().then(function () {
				this.fireEvent("_cardReady");
				this._endBusyState("data");
			}.bind(this));
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
	 * Lazily load and create a specific type of card header based on sap.card/header part of the manifest
	 *
	 * @private
	 */
	Card.prototype._applyHeaderManifestSettings = function () {
		var oManifestHeader = this._oCardManifest.get(MANIFEST_PATHS.HEADER),
			oHeader,
			oPreviousHeader,
			oActionsToolbar;

		if (!oManifestHeader) {
			this.fireEvent("_headerReady");
			return;
		}

		oHeader = this._createHeader(oManifestHeader);

		oActionsToolbar = this._createActionsToolbar();
		if (oActionsToolbar) {
			oHeader.setToolbar(oActionsToolbar);
		}

		oPreviousHeader = this.getAggregation("_header");

		if (oPreviousHeader) {
			oPreviousHeader.destroy();
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

	Card.prototype._createHeader = function (mConfiguration) {

		var oHeader,
			oServiceManager = this._oServiceManager,
			oDataProviderFactory = this._oDataProviderFactory,
			sAppId = this._sAppId,
			oActions = new CardActions({
				card: this,
				areaType: AreaType.Header
			}),
			mSettings = {
				title: mConfiguration.title,
				subtitle: mConfiguration.subTitle
			};


		if (mConfiguration.status && typeof mConfiguration.status.text === "string") {
			mSettings.statusText = mConfiguration.status.text;
		}

		switch (mConfiguration.type) {
			case "Numeric":

				jQuery.extend(mSettings, {
					unitOfMeasurement: mConfiguration.unitOfMeasurement,
					details: mConfiguration.details,
					sideIndicators: mConfiguration.sideIndicators
				});

				if (mConfiguration.mainIndicator) {
					mSettings.number = mConfiguration.mainIndicator.number;
					mSettings.scale = mConfiguration.mainIndicator.unit;
					mSettings.trend = mConfiguration.mainIndicator.trend;
					mSettings.state = mConfiguration.mainIndicator.state; // TODO convert ValueState to ValueColor
				}

				mSettings = BindingHelper.createBindingInfos(mSettings);

				if (mConfiguration.sideIndicators) {
					mSettings.sideIndicators = mSettings.sideIndicators.map(function (mIndicator) { // TODO validate that it is an array and with no more than 2 elements
						return new NumericSideIndicator(mIndicator);
					});
				}

				oHeader = new NumericHeader(mSettings);
				break;
			default:
				if (mConfiguration.icon) {
					mSettings.iconSrc = mConfiguration.icon.src;
					mSettings.iconDisplayShape = mConfiguration.icon.shape;
					mSettings.iconInitials = mConfiguration.icon.text;
				}

				mSettings = BindingHelper.createBindingInfos(mSettings);

				if (mSettings.iconSrc) {
					mSettings.iconSrc = BindingHelper.formattedProperty(mSettings.iconSrc, function (sValue) {
						return IconFormatter.formatSrc(sValue, sAppId);
					});
				}

				oHeader = new Header(mSettings);
				break;
		}

		if (mConfiguration.status && mConfiguration.status.text && mConfiguration.status.text.format) {
			if (mConfiguration.status.text.format.translationKey) {
				this._loadDefaultTranslations();
			}

			bindStatusText(mConfiguration.status.text.format, oHeader);
		}

		oHeader._sAppId = sAppId;
		oHeader.setServiceManager(oServiceManager);
		oHeader.setDataProviderFactory(oDataProviderFactory);
		oHeader._setData(mConfiguration.data);
		oHeader._setAccessibilityAttributes(mConfiguration);

		oActions.attach(mConfiguration, oHeader);
		oHeader._oActions = oActions;

		return oHeader;
	};

	Card.prototype.getHostInstance = function () {
		var sHost = this.getHost();
		if (!sHost) {
			return null;
		}

		return Core.byId(sHost);
	};

	Card.prototype._createActionsToolbar = function () {
		var oHost = this.getHostInstance(),
			oActionsToolbar,
			bHasActions;

		if (!oHost) {
			return null;
		}

		oActionsToolbar = new ActionsToolbar();
		bHasActions = oActionsToolbar.createToolbar(oHost, this);

		if (bHasActions) {
			return oActionsToolbar;
		}

		return null;
	};

		/**
	 * Lazily load and create a specific type of card content based on sap.card/content part of the manifest
	 *
	 * @private
	 */
	Card.prototype._applyContentManifestSettings = function () {
		var sCardType = this._oCardManifest.get(MANIFEST_PATHS.TYPE),
			bIsComponent = sCardType && sCardType.toLowerCase() === "component",
			oManifestContent = this._oCardManifest.get(MANIFEST_PATHS.CONTENT),
			bHasContent = !!oManifestContent,
			sAriaText = sCardType + " " + this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD");

		this._ariaText.setText(sAriaText);

		if (bHasContent && !sCardType) {
			Log.error("Card type property is mandatory!");
			this.fireEvent("_contentReady");
			return;
		}

		if (!bHasContent && !bIsComponent) {
			this._endBusyState("applyManifest");
			this.fireEvent("_contentReady");
			return;
		}

		if (!oManifestContent && bIsComponent) {
			oManifestContent = this._oCardManifest.getJson();
		}

		this._setTemporaryContent();

		BaseContent
			.create(sCardType, oManifestContent, this._oServiceManager, this._oDataProviderFactory, this._sAppId)
			.then(function (oContent) {
				this._setCardContent(oContent);
			}.bind(this))
			.catch(function (sError) {
				this._handleError(sError);
			}.bind(this))
			.finally(function () {
				this._endBusyState("applyManifest");
			}.bind(this));
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
	 * @param {sap.f.cards.BaseContent} oContent The card content instance to be configured.
	 */
	Card.prototype._setCardContent = function (oContent) {

		var oCardAction = oContent.getActions();

		if (oCardAction) {
			oCardAction.setCard(this);
		}

		oContent.attachEvent("_error", function (oEvent) {
			this._handleError(oEvent.getParameter("logMessage"), oEvent.getParameter("displayMessage"));
		}.bind(this));

		oContent.setBusyIndicatorDelay(0);

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
	Card.prototype._setTemporaryContent = function () {

		var oTemporaryContent = this._getTemporaryContent(),
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
		this._endBusyStateAll();

		this.fireEvent("_error", {message:sLogMessage});

		var sDefaultDisplayMessage = "Unable to load the data.",
			sErrorMessage = sDisplayMessage || sDefaultDisplayMessage,
			oTemporaryContent = this._getTemporaryContent(),
			oPreviousContent = this.getAggregation("_content");

		var oError = new VBox({
			justifyContent: "Center",
			alignItems: "Center",
			items: [
				new Icon({ src: "sap-icon://message-error", size: "1rem" }).addStyleClass("sapUiTinyMargin"),
				new Text({ text: sErrorMessage })
			]
		});

		// only destroy previous content of type BaseContent
		if (oPreviousContent && oPreviousContent !== oTemporaryContent) {
			oPreviousContent.destroy();
			this.fireEvent("_contentReady"); // content won't show up so mark it as ready
		}

		oTemporaryContent.setBusy(false);
		oTemporaryContent.addItem(oError);

		this.setAggregation("_content", oTemporaryContent);
	};

	Card.prototype._getTemporaryContent = function () {

		if (!this._oTemporaryContent) {
			this._oTemporaryContent = new HBox({
				justifyContent: "Center",
				busyIndicatorDelay: 0,
				busy: true
			});

			this._oTemporaryContent.addStyleClass("sapFCardTemporaryContent");

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

		this._oTemporaryContent.destroyItems();

		return this._oTemporaryContent;
	};

	/**
	 * Starts busy loading for the card and writes down the reason for it being busy in a queue.
	 *
	 * @private
	 * @param {string} sState The reason to go in busy mode
	 */
	Card.prototype._startBusyState = function (sState) {
		this._busyStates.set(sState, true);
		this.setBusy(true);
	};

	/**
	 * Removes one reason for the card to be busy. If there is no other reasons for being busy - remove the busy state.
	 *
	 * @private
	 * @param {string} sState The reason to go in busy mode
	 */
	Card.prototype._endBusyState = function (sState) {
		this._busyStates.delete(sState);

		if (!this._busyStates.size) {
			this.setBusy(false);
		}
	};

	/**
	 * Force the card to stop being busy.
	 *
	 * @private
	 */
	Card.prototype._endBusyStateAll = function () {
		this._busyStates.clear();
		this.setBusy(false);
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

	return Card;
});
