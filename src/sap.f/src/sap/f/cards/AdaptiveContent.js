/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/integration/library",
		"sap/f/library",
		"sap/ui/dom/includeScript",
		"sap/f/cards/BaseContent",
		"sap/ui/integration/thirdparty/adaptivecards",
		"sap/ui/integration/thirdparty/adaptivecards-templating",
		"sap/ui/integration/thirdparty/markdown-it",
		"sap/f/cards/adaptivecards/elements/UI5InputText",
		"sap/f/cards/adaptivecards/elements/UI5InputNumber",
		"sap/f/cards/adaptivecards/elements/UI5InputChoiceSet",
		"sap/f/cards/adaptivecards/elements/UI5InputTime",
		"sap/f/cards/adaptivecards/elements/UI5InputDate",
		"sap/f/cards/adaptivecards/elements/UI5InputToggle",
		"sap/f/cards/adaptivecards/overwrites/ActionRender",
		"sap/f/cards/adaptivecards/elements/hostConfig",
		"sap/ui/model/json/JSONModel",
		"sap/base/Log"
	],
	function (integrationLibrary, fLibrary, includeScript, BaseContent, AdaptiveCards, ACData, Markdown, UI5InputText, UI5InputNumber, UI5InputChoiceSet, UI5InputTime, UI5InputDate, UI5InputToggle, ActionRender, HostConfig, JSONModel, Log) {
		"use strict";

		/**
		 * Constructor for a new <code>AdaptiveContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A control that is a wrapper of Microsoft's AdaptiveCard and allows its creation based on a configuration.
		 *
		 * @extends sap.f.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.74
		 * @alias sap.f.cards.AdaptiveContent
		 */
		var AdaptiveContent = BaseContent.extend("sap.f.cards.AdaptiveContent", {
			renderer: {
				apiVersion: 2,
				render: function (oRm, oControl) {
					var oParentRenderer = BaseContent.getMetadata().getRenderer();

					return oParentRenderer.render.apply(this, arguments);
				}
			}
		});

		AdaptiveContent.prototype.init = function () {
			this._bComponentsReady = false;
			this._bAdaptiveCardElementsReady = false;

			this._setupAdaptiveCardDependency();
			this._loadDependencies();
		};

		/**
		 * Setter for configuring a <code>sap.f.cards.AdaptiveContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal list.
		 */
		AdaptiveContent.prototype.setConfiguration = function (oConfiguration) {
			this._oCardConfig = oConfiguration;

			// if oConfiguration.request is present, load the adaptive card manifest from url
			if (oConfiguration && oConfiguration.request && oConfiguration.request.url) {
				this._loadManifestFromUrl(oConfiguration.request.url);
				return;
			}

			this._handleMarkDown(oConfiguration);
			this._setupMSCardContent();
		};

		/**
		 * Processes the markdown only if enableMarkdown is set to true
		 *
		 * @private
		 * @param {Object} oConfiguration The Configuration object.
		 */
		AdaptiveContent.prototype._handleMarkDown = function (oConfiguration) {
			AdaptiveCards.AdaptiveCard.onProcessMarkdown = function(sText, oResult) {
				if (oConfiguration.configuration && oConfiguration.configuration.enableMarkdown) {
					oResult.outputHtml = new Markdown().render(sText);
					oResult.didProcess = true;

					return oResult;
				}
			};
		};

		/**
		 * Loads the content of an Adaptive Card from a file.
		 *
		 * @param {string} sUrl Path to the MS Adaptive Card descriptor/manifest file.
		 * @private
		 */
		AdaptiveContent.prototype._loadManifestFromUrl = function (sUrl) {
			var oData = new JSONModel(),
				that = this;

			oData.loadData(sUrl)
				.then(function () {
					// set the data from the url as a card config
					that._oCardConfig = oData.getData();
				}).then(function () {
					that._handleMarkDown(that._oCardConfig);
					that._setupMSCardContent();
				}).then(function () {
					// destroy the data model, since it is not needed anymore
					oData.destroy();
					oData = null;
				}).catch(function () {
					// notify the user that the provided URL is not correct
					Log.error("No JSON file found on this URL. Please provide a correct path to the JSON-serialized card object model file.");
				});
		};

		AdaptiveContent.prototype.onAfterRendering = function () {
			this._setupMSCardContent();
		};

		/**
		 * Init MS AdaptiveCard and patch its default renders with UI5 WebComponents
		 *
		 * @private
		 */
		AdaptiveContent.prototype._setupAdaptiveCardDependency = function () {
			this.adaptiveCardInstance = new AdaptiveCards.AdaptiveCard();

			this._doMSCardsOverwrites();
			this._adjustHostConfig();
			this._handleActions();
			this._replaceElements();
			this._isRtl();
		};

		/**
		 * Replace Buttons with UI5-Buttons in MS Cards actions
		 *
		 * @private
		 */
		AdaptiveContent.prototype._doMSCardsOverwrites = function () {
			AdaptiveCards.Action.prototype.render = ActionRender;
		};

		/**
		 * Adjust elements' styling with custom values
		 *
		 * @private
		 */
		AdaptiveContent.prototype._adjustHostConfig = function () {
			this.adaptiveCardInstance.hostConfig = new AdaptiveCards.HostConfig(HostConfig);
		};

		/**
		 * Synchronize UI5 and AdaptiveCards RTL mode.
		 *
		 * @private
		 */
		AdaptiveContent.prototype._isRtl = function () {
			this.adaptiveCardInstance.isRtl = function () {
				return sap.ui.getCore().getConfiguration().getRTL();
			};
		};

		/**
		 * Propagate MS Cards Actions out of the Card
		 *
		 * @private
		 */
		AdaptiveContent.prototype._handleActions = function () {
			this.adaptiveCardInstance.onExecuteAction = function (oAction) {
				var sType, oPayload, oCardActions;

				if (oAction instanceof AdaptiveCards.OpenUrlAction) {
					oPayload = {
						url:  oAction.url
					};
					sType = integrationLibrary.CardActionType.Navigation;
				} else if (oAction instanceof AdaptiveCards.SubmitAction) {
					oPayload = oAction.data;
					sType = integrationLibrary.CardActionType.Submit;
				} else {
					// The other types of actions are entirely internal
					// and would not make sense to be bubbled outside the Card.
					return;
				}

				oCardActions = this.getActions();
				if (oCardActions) {
					oCardActions.fireAction(this, sType, oPayload);
				}
			}.bind(this);
		};

		/**
		 * Replaces MS Cards Elements with UI5WebComponents
		 *
		 * @private
		 */
		AdaptiveContent.prototype._replaceElements = function () {
			// Input.Text
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.unregisterType("Input.Text");
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.registerType("Input.Text", function () {
				return new UI5InputText();
			});
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.unregisterType("Input.Number");
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.registerType("Input.Number", function () {
				return new UI5InputNumber();
			});
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.unregisterType("Input.ChoiceSet");
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.registerType("Input.ChoiceSet", function () {
				return new UI5InputChoiceSet();
			});
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.unregisterType("Input.Time");
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.registerType("Input.Time", function () {
				return new UI5InputTime();
			});
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.unregisterType("Input.Date");
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.registerType("Input.Date", function () {
				return new UI5InputDate();
			});
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.unregisterType("Input.Toggle");
			AdaptiveCards.AdaptiveCard.elementTypeRegistry.registerType("Input.Toggle", function () {
				return new UI5InputToggle();
			});
		};

		/**
		 * Setup of the card content.
		 *
		 * @private
		 */
		AdaptiveContent.prototype._setupMSCardContent = function () {
			var oDom = this.$(),
				oConfiguration = this._oCardConfig,
				oContentTemplateData, oCardDataProvider;

			if (!this.adaptiveCardInstance || !oConfiguration || !(oDom && oDom.size())) {
				return;
			}

			// check if there is a data provider on card level
			if (this._oDataProviderFactory && this._oDataProviderFactory._aDataProviders && this._oDataProviderFactory._aDataProviders.length) {
				oCardDataProvider = this._oDataProviderFactory._aDataProviders[0];
			}

			// check if a data object is present in the card content
			oContentTemplateData = oConfiguration.$data || oConfiguration.data;

			// if there is no data for templating, render the MS AdaptiveCard
			if (!oContentTemplateData && !oCardDataProvider) {
				this._renderMSCardContent(oConfiguration);
				return;
			}

			// if there is no data provided on content level, check for an existing
			// setup the data provider from card level
			if (!oContentTemplateData && oCardDataProvider) {
				this._setupDataProvider(oCardDataProvider);
				return;
			}

			// if the inline $data is present, adapt it in order to
			// reuse the DataFactory logic of the Integration Card
			if (oConfiguration.$data) {
				oContentTemplateData = {
					"json": oContentTemplateData
				};
			}

			// create a data provider with the templating data and setup it
			this._setupDataProvider(this._createDataProvider(oContentTemplateData));
		};

		/**
		 * Creates a data provider.
		 *
		 * @param {Object} oData The data needed for the provider
		 * @returns {Object} The created data provider
		 * @private
		 */
		AdaptiveContent.prototype._createDataProvider = function (oData) {
			if (this._oDataProvider) {
				this._oDataProvider.destroy();
			}

			if (this._oDataProviderFactory) {
				this._oDataProvider = this._oDataProviderFactory.create(oData, this._oServiceManager);
			}

			return this._oDataProvider;
		};


		/**
		 * Setup a data provider - attach to needed events,
		 * set the templating and render the card.
		 *
		 * @param {Object} oData The data needed for the provider
		 * @returns {Object} The created data provider
		 * @private
		 */
		AdaptiveContent.prototype._setupDataProvider = function (oDataProvider) {
			var oData, oCard,
				sPath = oDataProvider && oDataProvider._oSettings.path || "";

			if (oDataProvider) {
				this.setBusy(true);

				// If a data provider is created use an own model.
				var oModel = this.setModel(new JSONModel());

				oDataProvider.attachDataChanged(function (oEvent) {
					oData = oEvent.getParameter('data');
					this._updateModel(oData);

					// if a path is present, setup this part of the data
					// as a data object for the card template.
					if (sPath.length) {
						oData = oModel.getProperty(sPath);
					}

					// attach the data with the card template
					oCard = this._setTemplating(this._oCardConfig, oData);

					// render the MS AdaptiveCard
					oCard && this._renderMSCardContent(oCard);

					this.setBusy(false);
				}.bind(this));

				oDataProvider.attachError(function (oEvent) {
					this._handleError(oEvent.getParameter("message"));
					this.setBusy(false);
				}.bind(this));

				oDataProvider.triggerDataUpdate().then(function () {
					this.fireEvent("_dataReady");
				}.bind(this));
			} else {
				this.fireEvent("_dataReady");
			}
		};

		/**
		 * Rendering of a MS AdaptiveCard.
		 *
		 * @param {Object} oCard The Card to be rendered
		 * @private
		 */
		AdaptiveContent.prototype._renderMSCardContent = function (oCard) {
			var oDom = this.$();
			if (this.adaptiveCardInstance && oCard && oDom && oDom.size()) {
				this.adaptiveCardInstance.parse(oCard);
				oDom.html(this.adaptiveCardInstance.render());

				this._bAdaptiveCardElementsReady = true;
				this._fireCardReadyEvent();
			}
		};

		AdaptiveContent.prototype._fireCardReadyEvent = function () {
			if (this._bAdaptiveCardElementsReady && this._bComponentsReady) {
				this._bReady = true;
				this.fireEvent("_ready");
			}
		};

		/**
		 * Connects the template object with the data.
		 *
		 * @param {Object} oTemplate The template object
		 * @param {Object} oData The JSON object representing the data
		 * @returns {Object} The Card to be rendered
		 *
		 * @private
		 */
		AdaptiveContent.prototype._setTemplating = function (oTemplate, oData) {
			var oCardTemplate = new ACData.Template(oTemplate),
				oContext = new ACData.EvaluationContext();

			oContext.$root = oData;

			return oCardTemplate.expand(oContext);
		};

		/**
		 * Load UI5 WebComponents
		 *
		 * We don't need to think about when the WebComponents dependency would be loaded.
		 * If preloaded, then all elements would be rendered properly. If loaded at a later time,
		 * then "the placeholders" would be patched and the WebComponents would be build later.
		 *
		 * @private
		 */
		AdaptiveContent.prototype._loadDependencies = function () {
			// Check weather the WebComponents are already loaded. We don't need to fetch the scripts again
			if (document.querySelector("#webcomponents-loader")) {
				this._bComponentsReady = true;
				this._fireCardReadyEvent();
				return;
			}

			includeScript({
				id: "webcomponents-loader",
				url: sap.ui.require.toUrl("sap/ui/integration/thirdparty/webcomponents/webcomponentsjs/webcomponents-loader.js")
			});

			// The Web Components need to wait a bit for the Web Components loader and eventual polyfills
			// to get ready. There's a CustomEvent for which we need to subscribe.
			document.addEventListener("WebComponentsReady", function () {
				includeScript({
					id: "webcomponents-bundle",
					attributes: {type: "module"},
					url: sap.ui.require.toUrl("sap/ui/integration/thirdparty/webcomponents/bundle.esm.js")
				});
				includeScript({
					id: "webcomponents-bundle-es5",
					attributes: {nomodule: "nomodule"},
					url: sap.ui.require.toUrl("sap/ui/integration/thirdparty/webcomponents/bundle.es5.js")
				});
				this._bComponentsReady = true;
				this._fireCardReadyEvent();
			}.bind(this));
		};

		return AdaptiveContent;
	}
);