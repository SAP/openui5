/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseListContent",
	"./ListContentRenderer",
	"sap/m/List",
	"sap/ui/integration/library",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/controls/Microchart",
	"sap/ui/integration/controls/MicrochartLegend",
	"sap/ui/integration/controls/ListContentItem"
], function (
	BaseListContent,
	ListContentRenderer,
	List,
	library,
	BindingHelper,
	Microchart,
	MicrochartLegend,
	ListContentItem
) {
	"use strict";

	var AreaType = library.AreaType;

	/**
	 * Constructor for a new <code>ListContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that is a wrapper of a <code>sap.m.List</code> and allows its creation based on a configuration.
	 *
	 * @extends sap.ui.integration.cards.BaseListContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.62
	 * @alias sap.ui.integration.cards.ListContent
	 */
	var ListContent = BaseListContent.extend("sap.ui.integration.cards.ListContent", {
		metadata: {
			aggregations: {

				/**
				 * Legend for some Microcharts.
				 */
				_legend: {
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: ListContentRenderer
	});

	/**
	 * Called when control is initialized.
	 */
	ListContent.prototype.init = function () {
		BaseListContent.prototype.init.apply(this, arguments);

		var oList = this._getList();
		var that = this;

		this.setAggregation("_content", oList);

		oList.attachUpdateFinished(function () {
			if (that._iVisibleItems) {
				var aItems = oList.getItems();
				for (var i = that._iVisibleItems + 1; i < aItems.length; i++) {
					aItems[i].setVisible(false);
				}
			}
		});

		this._oItemTemplate = new ListContentItem({
			iconDensityAware: false
		});
	};

	/**
	 * Called when control is destroyed.
	 */
	ListContent.prototype.exit = function () {
		BaseListContent.prototype.exit.apply(this, arguments);

		if (this._oItemTemplate) {
			this._oItemTemplate.destroy();
			this._oItemTemplate = null;
		}
	};

	/**
	 * @override
	 */
	ListContent.prototype.loadDependencies = function (oConfiguration) {
		if (!oConfiguration || !oConfiguration.item || !oConfiguration.item.chart) {
			return Promise.resolve();
		}

		return Microchart.loadDependencies();
	};

	/**
	 * @override
	 */
	ListContent.prototype.destroyPlaceholder = function () {
		var oLegend = this.getAggregation("_legend");

		if (oLegend) {
			oLegend.removeStyleClass("sapFCardContentHidden");
		}

		BaseListContent.prototype.destroyPlaceholder.apply(this, arguments);
	};

	/**
	 * Setter for configuring a <code>sap.ui.integration.cards.ListContent</code>.
	 *
	 * @public
	 * @param {Object} oConfiguration Configuration object used to create the internal list.
	 * @returns {sap.ui.integration.cards.ListContent} Pointer to the control instance to allow method chaining.
	 */
	ListContent.prototype.setConfiguration = function (oConfiguration) {
		BaseListContent.prototype.setConfiguration.apply(this, arguments);

		if (!oConfiguration) {
			return this;
		}

		if (oConfiguration.items) {
			this._setStaticItems(oConfiguration.items);
			return this;
		}

		if (oConfiguration.item) {
			this._setItem(oConfiguration.item);
		}

		return this;
	};

	/**
	 * Handler for when data is changed.
	 */
	ListContent.prototype.onDataChanged = function () {
		this._checkHiddenNavigationItems(this.getConfiguration().item);
	};

	/**
	 * Lazily get a configured <code>sap.m.List</code>.
	 *
	 * @private
	 * @returns {sap.m.List} The inner list
	 */
	ListContent.prototype._getList = function () {
		if (this._bIsBeingDestroyed) {
			return null;
		}

		if (!this._oList) {
			this._oList = new List({
				id: this.getId() + "-list",
				growing: false,
				showNoData: false,
				showSeparators: "None"
			});
		}

		return this._oList;
	};

	/**
	 * Binds/Sets properties to the inner item template based on the configuration object item template which is already parsed.
	 * Attaches all required actions.
	 *
	 * @private
	 * @param {Object} mItem The item template of the configuration object.
	 */
	ListContent.prototype._setItem = function (mItem) {
		var mSettings = {
			iconDensityAware: false,
			title: mItem.title && (mItem.title.value || mItem.title),
			description: mItem.description && (mItem.description.value || mItem.description),
			highlight: mItem.highlight,
			info: mItem.info && mItem.info.value,
			infoState: mItem.info && mItem.info.state
		};

		if (mItem.icon && mItem.icon.src) {
			mSettings.icon = BindingHelper.formattedProperty(mItem.icon.src, function (sValue) {
				return this._oIconFormatter.formatSrc(sValue, this._sAppId);
			}.bind(this));
		}

		if (mItem.chart) {
			mSettings.microchart = this._createChartAndAddLegend(mItem.chart);
		}

		this._oItemTemplate = new ListContentItem(mSettings);
		this._oActions.setAreaType(AreaType.ContentItem);
		this._oActions.attach(mItem, this);

		var oBindingInfo = {
			template: this._oItemTemplate
		};
		this._filterHiddenNavigationItems(mItem, oBindingInfo);
		this._bindAggregation("items", this._getList(), oBindingInfo);
	};

	ListContent.prototype._createChartAndAddLegend = function (oChartSettings) {
		var oChart = Microchart.create(oChartSettings);

		// destroy previously created legend
		this.destroyAggregation("_legend");

		if (oChartSettings.type === "StackedBar") {
			var oLegend = new MicrochartLegend({
				chart: oChart.getChart()
			});

			oLegend.initItemsTitles(oChartSettings.bars, this.getBindingContext().getPath());

			this.setAggregation("_legend", oLegend);
		}

		return oChart;
	};

	/**
	 * Create static StandardListItems which will be mapped with the configuration that is passed.
	 *
	 * @private
	 * @param {Array} mItems The list of static items that will be used
	 */
	ListContent.prototype._setStaticItems = function (mItems) {
		var oList = this._getList();
		mItems.forEach(function (oItem) {
			var oListItem = new ListContentItem({
				iconDensityAware: false,
				title: oItem.title ? oItem.title : "",
				description: oItem.description ? oItem.description : "",
				icon: oItem.icon ? oItem.icon : "",
				infoState: oItem.infoState ? oItem.infoState : "None",
				info: oItem.info ? oItem.info : "",
				highlight: oItem.highlight ? oItem.highlight : "None"
			});

			// Here can be called _attachAction so that navigation service can be used
			if (oItem.action) {
				oListItem.setType("Navigation");

				if (oItem.action.url) {
					oListItem.attachPress(function () {
						window.open(oItem.action.url, oItem.target || "_blank");
					});
				}
			}
			oList.addItem(oListItem);
		});

		//workaround until actions refactor
		this.fireEvent("_actionContentReady");
	};

	/**
	 * @overwrite
	 * @returns {sap.m.List} The inner list.
	 */
	ListContent.prototype.getInnerList = function () {
		return this._getList();
	};

	return ListContent;
});