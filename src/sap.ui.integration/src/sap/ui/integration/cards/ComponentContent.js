/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseContent",
	"./ComponentContentRenderer",
	"sap/ui/integration/library",
	"sap/m/IllustratedMessageType",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/ComponentHooks",
	"sap/ui/core/Lib"
], function (
	BaseContent,
	ComponentContentRenderer,
	library,
	IllustratedMessageType,
	ComponentContainer,
	ComponentHooks,
	Library
) {
	"use strict";

	const CardPreviewMode = library.CardPreviewMode;

	const CardDataMode = library.CardDataMode;

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
	ComponentHooks.onInstanceCreated.register(function (oInstance) {
		var oCompData = oInstance.getComponentData();
		if (oCompData && oCompData["__sapUiIntegration_card"] && oInstance.onCardReady) {
			oInstance.onCardReady(oCompData["__sapUiIntegration_card"]);
		}
	});

	ComponentContent.prototype.onAfterRendering = function () {
		if (this._oComponent?.tileSetVisible) {
			const oCard = this.getCardInstance();
			const isActive = oCard?._getActualDataMode() === CardDataMode.Active;

			// custom tiles temporary: pass the active/visible state
			this._oComponent.tileSetVisible(isActive);
		}
	};

	ComponentContent.prototype.refreshData = function () {
		BaseContent.prototype.refreshData.apply(this, arguments);

		if (this._oComponent?.tileRefresh) {
			// custom tiles temporary: pass refresh data
			this._oComponent.tileRefresh();
		}
	};

	ComponentContent.prototype.exit = function () {
		BaseContent.prototype.exit.apply(this, arguments);
		this._oComponent = null;
	};

	ComponentContent.prototype.applyConfiguration = function () {
		const oCard = this.getCardInstance();
		const oConfiguration = this.getParsedConfiguration();

		if (!oConfiguration) {
			return;
		}

		if (oCard.getPreviewMode() === CardPreviewMode.Abstract) {
			// TODO _updated event is always needed, so that the busy indicator knows when to stop. We should review this for contents which do not have data.
			this.fireEvent("_actionContentReady");
			return;
		}

		const oContainer = new ComponentContainer({
			manifest: oConfiguration.componentManifest,
			async: true,
			settings: {
				componentData: this._prepareComponentData()
			},
			componentCreated: (oEvent) => {
				this._oComponent = oEvent.getParameter("component");

				// TODO _updated event is always needed, so that the busy indicator knows when to stop. We should review this for contents which do not have data.
				this.fireEvent("_actionContentReady");
				this.fireEvent("_updated");
			},
			componentFailed: () => {
				this.fireEvent("_actionContentReady");
				this.handleError({
					illustrationType: IllustratedMessageType.UnableToLoad,
					title: Library.getResourceBundleFor("sap.ui.integration").getText("CARD_DATA_LOAD_ERROR"),
					description: "Card content failed to create component"
				});
			}
		});

		this.setAggregation("_content", oContainer);
	};

	ComponentContent.prototype._prepareComponentData = function () {
		const oCard = this.getCardInstance();
		const oManifestComponentData = oCard.getManifestEntry("/sap.card/configuration/componentData");

		const oComponentData = oManifestComponentData || {};

		oComponentData["__sapUiIntegration_card"] = oCard;

		return oComponentData;
	};

	return ComponentContent;
});
