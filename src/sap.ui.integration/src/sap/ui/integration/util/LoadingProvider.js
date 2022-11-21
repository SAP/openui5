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
	"sap/f/cards/loading/ObjectPlaceholder",
	"sap/f/cards/loading/TablePlaceholder",
	"sap/f/cards/loading/TimelinePlaceholder",
	"sap/f/cards/loading/AnalyticalPlaceholder",
	"../cards/TableContentRenderer",
	"../cards/TimelineContentRenderer",
	"../cards/AnalyticalContentRenderer"
], function (
	ListContentRenderer,
	library,
	Element,
	GenericPlaceholder,
	ListPlaceholder,
	CalendarPlaceholder,
	ObjectPlaceholder,
	TablePlaceholder,
	TimelinePlaceholder,
	AnalyticalPlaceholder,
	TableContentRenderer,
	TimelineContentRenderer,
	AnalyticalContentRenderer
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
		this._oDataProvider = null;

		Element.prototype.destroy.apply(this, arguments);
	};

	LoadingProvider.prototype.createContentPlaceholder = function (oConfiguration, sType, oCard) {
		var iContentMinItems;
		var oContentPlaceholder;

		switch (sType) {
			case "List":
				iContentMinItems = oCard.getContentMinItems(oConfiguration);

				oContentPlaceholder = new ListPlaceholder({
					minItems: iContentMinItems !== null ? iContentMinItems : 2,
					item: oConfiguration.item,
					itemHeight: ListContentRenderer.getItemMinHeight(oConfiguration, oCard || this) + "rem"
				});
				break;

			case "Calendar":
				iContentMinItems = oCard.getContentMinItems(oConfiguration);

				oContentPlaceholder = new CalendarPlaceholder({
					minItems: iContentMinItems !== null ? iContentMinItems : 2,
					maxLegendItems: oConfiguration.maxLegendItems ? parseInt(oConfiguration.maxLegendItems) : 2,
					item: oConfiguration.item ? oConfiguration.item.template : {},
					legendItem: oConfiguration.legendItem ? oConfiguration.legendItem.template : {}
				});
				break;
			case "Object":
				oContentPlaceholder = new ObjectPlaceholder();
				break;

			case "Table":
				iContentMinItems = oCard.getContentMinItems(oConfiguration);

				oContentPlaceholder = new TablePlaceholder({
					minItems: iContentMinItems !== null ? iContentMinItems : 2,
					itemHeight: TableContentRenderer.getItemMinHeight(oConfiguration, oCard || this) + "rem",
					columns: oConfiguration.row ? oConfiguration.row.columns.length || 2 : 2
				});
				break;

			case "Timeline":
				iContentMinItems = oCard.getContentMinItems(oConfiguration);

				oContentPlaceholder = new TimelinePlaceholder({
					minItems: iContentMinItems !== null ? iContentMinItems : 2,
					item: oConfiguration.item,
					itemHeight: TimelineContentRenderer.getItemMinHeight(oConfiguration, oCard || this) + "rem"
				});
				break;

			case "Analytical":
				oContentPlaceholder = new AnalyticalPlaceholder({
					chartType: oConfiguration.chartType,
					minHeight: AnalyticalContentRenderer.getMinHeight(oConfiguration)
				});
				break;

			default:
				oContentPlaceholder = new GenericPlaceholder();
		}

		return oContentPlaceholder;
	};

	/**
	 * Set to <code>true</code> if the loading should wait for a pagination animation.
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @param {boolean} bValue True if it should wait. False otherwise.
	 */
	LoadingProvider.prototype.setAwaitPagination = function (bValue) {
		this._bAwaitPagination = bValue;
	};

	/**
	 * Gets if the loading should wait for a pagination animation.
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {boolean} bValue True if it should wait. False otherwise.
	 */
	LoadingProvider.prototype.getAwaitPagination = function () {
		return this._bAwaitPagination;
	};

	return LoadingProvider;
});