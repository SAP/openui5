/*!
 * ${copyright}
 */
sap.ui.define([
		"sap/ui/integration/library",
		"sap/f/library",
		"sap/ui/dom/includeScript",
		"sap/f/cards/BaseContent",
		"sap/ui/integration/thirdparty/adaptivecards",
		"sap/f/cards/adaptivecards/elements/UI5InputText",
		"sap/f/cards/adaptivecards/elements/UI5InputNumber",
		"sap/f/cards/adaptivecards/elements/UI5InputChoiceSet",
		"sap/f/cards/adaptivecards/elements/UI5InputTime",
		"sap/f/cards/adaptivecards/elements/UI5InputDate",
		"sap/f/cards/adaptivecards/overwrites/ActionRender",
		"sap/f/cards/adaptivecards/elements/config"
	],
	function (integrationLibrary, fLibrary, includeScript, BaseContent, AdaptiveCards, UI5InputText, UI5InputNumber, UI5InputChoiceSet, UI5InputTime, UI5InputDate, ActionRender, HostConfig) {
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
			this._setupAdaptiveCardDependency();
			this._loadDependencies();
		};

		/**
		 * Setter for configuring a <code>sap.f.cards.AdaptiveContent</code>.
		 *
		 * @public
		 * @param {Object} oConfiguration Configuration object used to create the internal list.
		 * @returns {sap.f.cards.AdaptiveContent} Pointer to the control instance to allow method chaining.
		 */
		AdaptiveContent.prototype.setConfiguration = function (oConfiguration) {
			this._oCardConfig = oConfiguration;
			this._renderMSCardContent();
		};

		AdaptiveContent.prototype.onAfterRendering = function () {
			this._renderMSCardContent();
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
		 * Adjust elements' styling with custom values
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
				var sType, oPayload;

				if (oAction instanceof AdaptiveCards.OpenUrlAction) {
					oPayload = oAction.url;
					sType = integrationLibrary.CardActionType.Navigation;
				} else if (oAction instanceof AdaptiveCards.SubmitAction) {
					oPayload = oAction.data;
					sType = integrationLibrary.CardActionType.Submit;
				} else {
					// The other types of actions are entirely internal
					// and would not make sense to be bubbled outside the Card.
					return;
				}

				this.fireEvent("action", {
					actionSource: this,
					manifestParameters: oPayload,
					type: sType
				});
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
		};

		/**
		 * Renders a Card
		 *
		 * @private
		 */
		AdaptiveContent.prototype._renderMSCardContent = function () {
			var oDom = this.$();
			if (this.adaptiveCardInstance && this._oCardConfig && oDom && oDom.size()) {
				this.adaptiveCardInstance.parse(this._oCardConfig);
				oDom.html(this.adaptiveCardInstance.render());
			}
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
				return;
			}

			includeScript({
				id: "webcomponents-loader",
				url: sap.ui.require.toUrl("sap/ui/integration/thirdparty/webcomponents/webcomponentsjs/webcomponents-loader.js")
			});
			includeScript({
				id: "webcomponents-bundle",
				attributes: {type: "module"},
				url: sap.ui.require.toUrl("sap/ui/integration/thirdparty/webcomponents/bundle.esm.js")
			});
			includeScript({
				id: "webcomponents-bundle-es5",
				attributes: {nomodule: "nomodule"},
				url: sap.ui.require.toUrl("sap/ui/integration/thirdparty/webcomponents/webcomponentsjs/bundle.es5.js")
			});
		};

		return AdaptiveContent;
	}
);