/*!
 * ${copyright}
 */
sap.ui.define([
	"../cards/ListContentRenderer",
	"sap/ui/integration/library",
	"sap/ui/core/Element",
	"sap/f/cards/loading/GenericPlaceholder",
	"sap/f/cards/loading/ListPlaceholder",
	"sap/f/cards/loading/CalendarPlaceholder",
	"sap/f/cards/loading/ObjectPlaceholder"
], function (
	ListContentRenderer,
	library,
	Element,
	GenericPlaceholder,
	ListPlaceholder,
	CalendarPlaceholder,
	ObjectPlaceholder
) {
	"use strict";

	/**
	 * Constructor for a new <code>LoadingProvider</code>.
	 *
	 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
	 * @param {object} [mSettings] Initial settings for the new data provider.
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.util.LoadingProvider
	 */
	var LoadingProvider = Element.extend("sap.ui.integration.util.LoadingProvider", {
		metadata: {
			library: "sap.ui.integration",

			properties: {
				/**
				 * The current loading state.
				 */
				loading: { type: "boolean", defaultValue: false }
			}
		}
	});

	LoadingProvider.prototype.setLoading = function (bLoading) {
		if (this.isDataProviderJson() || (this._bAwaitPagination && !bLoading)) {
			return this;
		}

		return this.setProperty("loading", bLoading);
	};

	LoadingProvider.prototype.isDataProviderJson = function () {
		return !!(this._oDataProvider && this._oDataProvider.getSettings() && this._oDataProvider.getSettings()["json"]);
	};

	LoadingProvider.prototype.setDataProvider = function (oDataProvider) {
		this._oDataProvider = oDataProvider;
	};

	LoadingProvider.prototype.destroy = function () {
		if (this._oContentPlaceholder) {
			this._oContentPlaceholder.destroy();
			this._oContentPlaceholder = null;
		}

		this._oDataProvider = null;

		Element.prototype.destroy.apply(this, arguments);
	};

	LoadingProvider.prototype.createContentPlaceholder = function (oConfiguration, sType, oCard) {
		switch (sType) {
			case "List":
				this._oContentPlaceholder = new ListPlaceholder({
					maxItems: oCard ? oCard.getContentPageSize(oConfiguration) || 2 : 2,
					item: oConfiguration.item,
					itemHeight: ListContentRenderer.getItemMinHeight(oConfiguration, oCard || this) + "rem"
				});
				break;

			case "Calendar":
				this._oContentPlaceholder = new CalendarPlaceholder({
					maxItems: oConfiguration.maxItems ? parseInt(oConfiguration.maxItems) : 2,
					maxLegendItems: oConfiguration.maxLegendItems ? parseInt(oConfiguration.maxLegendItems) : 2,
					item: oConfiguration.item ? oConfiguration.item.template : {},
					legendItem: oConfiguration.legendItem ? oConfiguration.legendItem.template : {}
				});
				break;
			case "Object":
				this._oContentPlaceholder = new ObjectPlaceholder();
				break;

			default:
				this._oContentPlaceholder = new GenericPlaceholder();
		}

		return this._oContentPlaceholder;
	};

	return LoadingProvider;
});