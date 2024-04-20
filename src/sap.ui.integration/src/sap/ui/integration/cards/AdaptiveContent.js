/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/Lib",
	"sap/ui/integration/library",
	"sap/ui/core/message/MessageType",
	"sap/ui/dom/includeScript",
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/integration/cards/adaptivecards/elements/hostConfig",
	"sap/m/VBox",
	"sap/ui/core/HTML",
	"sap/ui/model/json/JSONModel",
	"sap/base/Log"
],
	function(Localization, Library, library, MessageType, includeScript, BaseContent, hostConfig, VBox, HTML, JSONModel, Log) {
		"use strict";

		// lazy dependencies, loaded on demand
		var AdaptiveCards, ACData, Markdown, UI5InputText, UI5InputNumber, UI5InputChoiceSet, UI5InputTime, UI5InputDate, UI5InputToggle, ActionRender;

		/**
		 * Constructor for a new <code>AdaptiveContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A control that is a wrapper of Microsoft's AdaptiveCard and allows its creation based on a configuration.
		 *
		 * @extends sap.ui.integration.cards.BaseContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.74
		 * @alias sap.ui.integration.cards.AdaptiveContent
		 */
		var AdaptiveContent = BaseContent.extend("sap.ui.integration.cards.AdaptiveContent", {
			metadata: {
				library: "sap.ui.integration"
			},
			renderer: {
				apiVersion: 2,
				render: function (oRm, oControl) {
					var oParentRenderer = BaseContent.getMetadata().getRenderer();

					return oParentRenderer.render.apply(this, arguments);
				}
			}
		});

		AdaptiveContent.prototype.init = function () {
			BaseContent.prototype.init.apply(this, arguments);

			this.awaitEvent("_adaptiveCardElementsReady");
			//workaround until actions refactor
			this.fireEvent("_actionContentReady"); // todo
			this.setComponentsReady(false);
			this._setupCardContent();
		};

		AdaptiveContent.prototype.onAfterRendering = function () {
			this._renderMSCardContent(this._oCardTemplate || this.getConfiguration());
		};

		/**
		 * @override
		 */
		AdaptiveContent.prototype.loadDependencies = function (oCardManifest) {
			var aPromises = [this._loadWebcomponents()];

			// load adaptivecards and modules that depend on it here
			aPromises.push(new Promise(function (resolve, reject) {
				sap.ui.require([
						"sap/ui/integration/thirdparty/adaptivecards",
						"sap/ui/integration/thirdparty/adaptivecards-templating",
						"sap/ui/integration/cards/adaptivecards/elements/UI5InputText",
						"sap/ui/integration/cards/adaptivecards/elements/UI5InputNumber",
						"sap/ui/integration/cards/adaptivecards/elements/UI5InputChoiceSet",
						"sap/ui/integration/cards/adaptivecards/elements/UI5InputTime",
						"sap/ui/integration/cards/adaptivecards/elements/UI5InputDate",
						"sap/ui/integration/cards/adaptivecards/elements/UI5InputToggle",
						"sap/ui/integration/cards/adaptivecards/overwrites/ActionRender"
					], function (
						_AdaptiveCards,
						_ACData,
						_UI5InputText,
						_UI5InputNumber,
						_UI5InputChoiceSet,
						_UI5InputTime,
						_UI5InputDate,
						_UI5InputToggle,
						_ActionRender
					) {
						AdaptiveCards = _AdaptiveCards;
						ACData = _ACData;
						UI5InputText = _UI5InputText;
						UI5InputNumber = _UI5InputNumber;
						UI5InputChoiceSet = _UI5InputChoiceSet;
						UI5InputTime = _UI5InputTime;
						UI5InputDate = _UI5InputDate;
						UI5InputToggle = _UI5InputToggle;
						ActionRender = _ActionRender;
						this._setupAdaptiveCardDependency();
						resolve();
					}.bind(this), reject);
				}.bind(this))
			);

			// load markdown-it if needed
			if (oCardManifest.get("/sap.card/configuration/enableMarkdown")) {
				aPromises.push(new Promise(function (resolve, reject) {
					sap.ui.require(["sap/ui/integration/thirdparty/markdown-it"], function (_Markdown) {
						Markdown = _Markdown;
						resolve();
					}, reject);
				}));
			}

			return Promise.all(aPromises);
		};

		/**
		 * Setup Card's structure
		 *
		 * @private
		 */
		AdaptiveContent.prototype._setupCardContent = function () {
			var oHTMLContainer = new HTML(this.getId() + "content", {
					preferDOM: false,
					content: "<div>&nbsp;</div>"
				});

			this.setAggregation("_content", new VBox({
				items: [oHTMLContainer]
			}));
		};

		/**
		 * @override
		 */
		AdaptiveContent.prototype.applyConfiguration = function () {
			var oConfiguration = this.getConfiguration();

			// if oConfiguration.request is present, load the adaptive card manifest from url
			if (oConfiguration && oConfiguration.request && oConfiguration.request.url) {
				this._loadManifestFromUrl(oConfiguration.request.url);
				return;
			}

			this._handleMarkDown();
			this._setupMSCardContent();
		};

		AdaptiveContent.prototype.onThemeChanged = function () {
			if (this.getDomRef() && AdaptiveCards) {
				this._adjustHostConfig();
				this.invalidate();
			}
		};

		/**
		 * Processes the markdown only if enableMarkdown is set to true
		 *
		 * @private
		 */
		AdaptiveContent.prototype._handleMarkDown = function () {
			var that = this;

			AdaptiveCards.AdaptiveCard.onProcessMarkdown = function (sText, oResult) {
				var oCard = that.getParent(),
					bEnableMarkdown = oCard && oCard.getManifestEntry("/sap.card/configuration/enableMarkdown");

				if (bEnableMarkdown) {
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
					that.setConfiguration(Object.assign(that.getConfiguration(), oData.getData()));
				}).then(function () {
					that._handleMarkDown();
					that._setupMSCardContent();
				}).then(function () {
					// destroy the data model, since it is not needed anymore
					oData.destroy();
					oData = null;
				}).catch(function () {
					this.fireEvent("_dataReady");
					this.fireEvent("_adaptiveCardElementsReady");

					// notify the user that the provided URL is not correct
					Log.error("No JSON file found on this URL. Please provide a correct path to the JSON-serialized card object model file.");
				}.bind(this));
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
			this.adaptiveCardInstance.hostConfig = new AdaptiveCards.HostConfig(hostConfig());
		};

		/**
		 * Synchronize UI5 and AdaptiveCards RTL mode.
		 *
		 * @private
		 */
		AdaptiveContent.prototype._isRtl = function () {
			this.adaptiveCardInstance.isRtl = function () {
				return Localization.getRTL();
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
						url: oAction.url
					};
					sType = library.CardActionType.Navigation;
				} else if (oAction instanceof AdaptiveCards.SubmitAction) {
					this.getModel("form").setProperty("/", oAction.data);

					sType = library.CardActionType.Submit;
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

		AdaptiveContent.prototype.onActionSubmitStart = function (oFormData) {
			this.getParent().setBusy(true); // Loading indicator

		};

		AdaptiveContent.prototype.onActionSubmitEnd = function (oResponse, oError) {
			var oResourceBundle = Library.getResourceBundleFor("sap.ui.integration"),
				sMessage = oError ? oResourceBundle.getText("CARDS_ADAPTIVE_ACTION_SUBMIT_ERROR") :
					oResourceBundle.getText("CARDS_ADAPTIVE_ACTION_SUBMIT_SUCCESS"),
				sMessageType = oError ? MessageType.Error : MessageType.Success;

			this.showMessage(sMessage, sMessageType);

			this.getParent().setBusy(false); // Loading indicator
		};

		/**
		 * Replaces MS Cards Elements with UI5WebComponents
		 *
		 * @private
		 */
		AdaptiveContent.prototype._replaceElements = function () {
			// Input.Text
			AdaptiveCards.GlobalRegistry.elements.unregister("Input.Text");
			AdaptiveCards.GlobalRegistry.elements.register("Input.Text", UI5InputText);

			AdaptiveCards.GlobalRegistry.elements.unregister("Input.Number");
			AdaptiveCards.GlobalRegistry.elements.register("Input.Number", UI5InputNumber);

			AdaptiveCards.GlobalRegistry.elements.unregister("Input.ChoiceSet");
			AdaptiveCards.GlobalRegistry.elements.register("Input.ChoiceSet", UI5InputChoiceSet);

			AdaptiveCards.GlobalRegistry.elements.unregister("Input.Time");
			AdaptiveCards.GlobalRegistry.elements.register("Input.Time", UI5InputTime);

			AdaptiveCards.GlobalRegistry.elements.unregister("Input.Date");
			AdaptiveCards.GlobalRegistry.elements.register("Input.Date", UI5InputDate);

			AdaptiveCards.GlobalRegistry.elements.unregister("Input.Toggle");
			AdaptiveCards.GlobalRegistry.elements.register("Input.Toggle", UI5InputToggle);
		};

		/**
		 * Sets data provider on a card level
		 *
		 * @param {Object} oDataProvider Data provider object for generating card content
		 *
		 * @public
		 */
		AdaptiveContent.prototype.setCardDataProvider = function (oDataProvider) {
			this._oCardDataProvider = oDataProvider;
		};

		/**
		 * Setup of the card content.
		 *
		 * @private
		 */
		AdaptiveContent.prototype._setupMSCardContent = function () {
			var oConfiguration = this.getConfiguration(),
				oContentTemplateData,
				oCardDataProvider = this._oCardDataProvider;

			if (!this.adaptiveCardInstance || !oConfiguration) {
				return;
			}

			// check if a data object is present in the card content
			oContentTemplateData = oConfiguration.$data || oConfiguration.data;

			// if there is no data for templating, render the MS AdaptiveCard
			if (!oContentTemplateData && !oCardDataProvider) {
				this._oCardTemplate = null;
				this._renderMSCardContent(oConfiguration);
				this.fireEvent("_dataReady");
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
			this.setDataConfiguration(oContentTemplateData);
		};

		/**
		 * Called when the data for the content was changed either by the content or by the card.
		 *
		 */
		AdaptiveContent.prototype.onDataChanged = function () {
			var sPath = this.getBindingContext().getPath(),
				oData = this.getModel().getProperty(sPath);

			// Аttaches the data with the card template
			this._oCardTemplate = this._setTemplating(this.getConfiguration(), oData);

			// Re-renders the card with the new data
			this.invalidate();
		};

		/**
		 * Rendering of a MS AdaptiveCard.
		 *
		 * @param {Object} oCard The Card to be rendered
		 * @private
		 */
		AdaptiveContent.prototype._renderMSCardContent = function (oCard) {
			var oDom = this.getAggregation("_content").getItems()[0].$(),
				bIsLoading = !!this.isLoading();

			// Do not show content until the data for it is fully loaded
			this.setBusy(bIsLoading);
			this.getAggregation("_content").toggleStyleClass("sapFCardContentHidden", bIsLoading);

			if (this.adaptiveCardInstance && oCard && oDom.length) {
				this.adaptiveCardInstance.parse(oCard);
				oDom.html(this.adaptiveCardInstance.render());

				this.fireEvent("_adaptiveCardElementsReady");

				// avoid additional tab stop
				if (this.adaptiveCardInstance.renderedElement) {
					this.adaptiveCardInstance.renderedElement.tabIndex = -1;
				}
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
			var oCardTemplate = new ACData.Template(oTemplate);

			return oCardTemplate.expand({
				$root: oData
			});
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
		AdaptiveContent.prototype._loadWebcomponents = function () {
			if (this.getComponentsReady()) {
				Log.debug("WebComponents were already loaded");

				return Promise.resolve();
			}

			return new Promise(function (resolve, reject) {
				// Thе timeout is needed to delay the check if UI5 WebComponents gets loaded from elsewhere.
				// This detection relies on the assumption that there's the full bundle and the ui5-button is present.
				setTimeout(function(){
					if (window.customElements.get("ui5-button")) {
						resolve();
						return;
					}

					includeScript({
						id: "webcomponents-bundle",
						attributes: {type: "module"},
						url: sap.ui.require.toUrl("sap/ui/integration/thirdparty/webcomponents/bundle.esm.js")
					}).then(resolve);
				});
			}).then(function () {
				this.setComponentsReady(true);
			}.bind(this));
		};

		/**
		 * Sets the Components Ready flag
		 *
		 * @param bValue
		 * @returns {this}
		 * @private
		 */
		AdaptiveContent.prototype.setComponentsReady = function (bValue) {
			this._bComponentsReady = bValue;
			return this;
		};

		/**
		 * Retrieves the Components Ready flag
		 *
		 * @returns {boolean}
		 * @private
		 */
		AdaptiveContent.prototype.getComponentsReady = function () {
			return !!this._bComponentsReady;
		};

		return AdaptiveContent;
	}
);