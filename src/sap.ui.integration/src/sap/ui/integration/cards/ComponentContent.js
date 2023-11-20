/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseContent",
	"./ComponentContentRenderer",
	"sap/ui/integration/library",
	"sap/m/IllustratedMessageType",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Component"
], function (
	BaseContent,
	ComponentContentRenderer,
	library,
	IllustratedMessageType,
	ComponentContainer,
	Component
) {
	"use strict";

	var CardPreviewMode = library.CardPreviewMode;

	/**
	 * Constructor for a new <code>Component</code> Card Content.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that allows a Component to be put inside a card content
	 *
	 * @extends sap.ui.integration.cards.BaseContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @experimental
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.cards.ComponentContent
	 */
	var ComponentContent = BaseContent.extend("sap.ui.integration.cards.ComponentContent", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: ComponentContentRenderer
	});

	/**
	 * Global hook when a new component instance of any kind is created.
	 * @param {sap.ui.core.Component} oInstance The created component instance.
	 */
	Component._fnOnInstanceCreated = function (oInstance) {
		var oCompData = oInstance.getComponentData();
		if (oCompData && oCompData["__sapUiIntegration_card"] && oInstance.onCardReady) {
			oInstance.onCardReady(oCompData["__sapUiIntegration_card"]);
		}
	};

	ComponentContent.prototype.applyConfiguration = function () {
		var oConfiguration = this.getParsedConfiguration();

		if (!oConfiguration) {
			return;
		}

		if (this.getCardInstance().getPreviewMode() === CardPreviewMode.Abstract) {
			// TODO _updated event is always needed, so that the busy indicator knows when to stop. We should review this for contents which do not have data.
			this.fireEvent("_actionContentReady");
			return;
		}

		var oContainer = new ComponentContainer({
			manifest: oConfiguration.componentManifest,
			async: true,
			settings: {
				componentData: {
					"__sapUiIntegration_card": this.getCardInstance()
				}
			},
			componentCreated: function () {
				// TODO _updated event is always needed, so that the busy indicator knows when to stop. We should review this for contents which do not have data.
				this.fireEvent("_actionContentReady");
				this.fireEvent("_updated");
			}.bind(this),
			componentFailed: function () {
				var oCard = this.getCardInstance();

				this.fireEvent("_actionContentReady");
				this.handleError({
					illustrationType: IllustratedMessageType.ErrorScreen,
					title: oCard.getTranslatedText("CARD_DATA_LOAD_ERROR"),
					description: "Card content failed to create component"
				});
			}.bind(this)
		});

		this.setAggregation("_content", oContainer);
	};

	return ComponentContent;
});
