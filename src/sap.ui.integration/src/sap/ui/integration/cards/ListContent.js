/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseListContent",
	"./ListContentRenderer",
	"sap/ui/util/openWindow",
	"sap/m/library",
	"sap/m/List",
	"sap/m/ObjectStatus",
	"sap/ui/integration/library",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/controls/Microchart",
	"sap/ui/integration/controls/MicrochartLegend",
	"sap/ui/integration/controls/ListContentItem",
	"sap/ui/integration/controls/ActionsStrip"
], function (
	BaseListContent,
	ListContentRenderer,
	openWindow,
	mLibrary,
	List,
	ObjectStatus,
	library,
	BindingHelper,
	BindingResolver,
	Microchart,
	MicrochartLegend,
	ListContentItem,
	ActionsStrip
) {
	"use strict";

	// shortcut for sap.m.AvatarSize
	var AvatarSize = mLibrary.AvatarSize;

	// shortcut for sap.m.AvatarColor
	var AvatarColor = mLibrary.AvatarColor;

	// shortcut for sap.m.ListType;
	var ListType = mLibrary.ListType;

	// shortcut for sap.m.ListSeparators;
	var ListSeparators = mLibrary.ListSeparators;

	// shortcut for sap.ui.integration.CardActionArea
	var ActionArea = library.CardActionArea;

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = mLibrary.EmptyIndicatorMode;

	var LEGEND_COLORS_LOAD = "_legendColorsLoad";

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
			library: "sap.ui.integration",
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
	ListContent.prototype.loadDependencies = function (oCardManifest) {
		if (!this.isSkeleton() && oCardManifest.get("/sap.card/content/item/chart")) {
			return Microchart.loadDependencies();
		}

		return Promise.resolve();
	};

	/**
	 * @override
	 */
	ListContent.prototype.setConfiguration = function (oConfiguration) {
		BaseListContent.prototype.setConfiguration.apply(this, arguments);
		oConfiguration = this.getParsedConfiguration();

		if (!oConfiguration) {
			return this;
		}

		if (oConfiguration.items) {
			this._setStaticItems(oConfiguration.items);
			return this;
		}

		if (oConfiguration.item) {
			this._setItem(oConfiguration);
		}

		return this;
	};

	/**
	 * @override
	 */
	ListContent.prototype.getStaticConfiguration = function () {
		var aListItems = this.getInnerList().getItems(),
			oConfiguration = this.getParsedConfiguration(),
			bHasGroups = aListItems[0] && aListItems[0].isA("sap.m.GroupHeaderListItem"),
			aResolvedItems = [],
			aResolvedGroups = [],
			oResolvedGroup;

		aListItems.forEach(function (oItem) {
			if (oItem.isA("sap.m.GroupHeaderListItem")) {
				if (oResolvedGroup) {
					aResolvedGroups.push(oResolvedGroup);
				}

				aResolvedItems = [];
				oResolvedGroup = {
					title: oItem.getTitle(),
					items: aResolvedItems
				};
			} else {
				aResolvedItems.push(BindingResolver.resolveValue(oConfiguration.item, this, oItem.getBindingContext().getPath()));
			}
		}.bind(this));

		if (oResolvedGroup) {
			aResolvedGroups.push(oResolvedGroup);
		}

		var oStaticConfiguration = {};

		if (bHasGroups) {
			oStaticConfiguration.groups = aResolvedGroups;
		} else {
			oStaticConfiguration.groups = [
				{
					items: aResolvedItems
				}
			];
		}

		return oStaticConfiguration;
	};

	/**
	 * Handler for when data is changed.
	 */
	ListContent.prototype.onDataChanged = function () {
		this._handleNoItemsError(this.getParsedConfiguration().item);
		this._checkHiddenNavigationItems(this.getParsedConfiguration().item);
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
				showNoData: false
			});
		}

		return this._oList;
	};

	/**
	 * Binds/Sets properties to the inner item template based on the configuration object item template which is already parsed.
	 * Attaches all required actions.
	 *
	 * @private
	 * @param {Object} oConfiguration Parsed configuration object.
	 */
	ListContent.prototype._setItem = function (oConfiguration) {
		var mItem = oConfiguration.item,
			oList = this._getList(),
			bIsSkeleton = this.isSkeleton(),
			mSettings = {
				iconDensityAware: false,
				title: mItem.title && (mItem.title.value || mItem.title),
				description: mItem.description && (mItem.description.value || mItem.description),
				highlight: mItem.highlight,
				info: mItem.info && mItem.info.value,
				infoState: mItem.info && mItem.info.state,
				attributes: []
			};

		if (mItem.icon) {
			mSettings.icon = BindingHelper.formattedProperty(mItem.icon.src, function (sValue) {
				return this._oIconFormatter.formatSrc(sValue);
			}.bind(this));
			mSettings.iconAlt = mItem.icon.alt;
			mSettings.iconDisplayShape = mItem.icon.shape;
			mSettings.iconInitials = mItem.icon.initials || mItem.icon.text;

			if (mSettings.title && mSettings.description) {
				mSettings.iconSize = AvatarSize.S;
			} else {
				mSettings.iconSize = AvatarSize.XS;
			}

			mSettings.iconSize = mItem.icon.size || mSettings.iconSize;
			mSettings.iconBackgroundColor = mItem.icon.backgroundColor || (mSettings.iconInitials ? undefined : AvatarColor.Transparent);
		}

		if (mItem.attributesLayoutType) {
			mSettings.attributesLayoutType = mItem.attributesLayoutType;
		}

		if (mItem.attributes) {
			mItem.attributes.forEach(function (attr) {
				mSettings.attributes.push(new ObjectStatus({
					text: attr.value,
					state: attr.state,
					emptyIndicatorMode: EmptyIndicatorMode.On,
					visible: attr.visible
				}));
			});
		}

		if (!bIsSkeleton) {
			if (mItem.chart) {
				mSettings.microchart = this._createChartAndAddLegend(mItem.chart);
			}

			if (mItem.actionsStrip) {
				mSettings.actionsStrip = ActionsStrip.create(this.getCardInstance(), mItem.actionsStrip);
				oList.setShowSeparators(ListSeparators.All);
			} else {
				oList.setShowSeparators(ListSeparators.None);
			}
		}

		this._oItemTemplate = new ListContentItem(mSettings);
		this._oActions.attach({
			area: ActionArea.ContentItem,
			actions: mItem.actions,
			control: this,
			actionControl: this._oItemTemplate,
			enabledPropertyName: "type",
			enabledPropertyValue: ListType.Active,
			disabledPropertyValue: ListType.Inactive
		});

		var oGroup = oConfiguration.group;

		if (oGroup) {
			this._oSorter = this._getGroupSorter(oGroup);
		}
		var oBindingInfo = {
			template: this._oItemTemplate,
			sorter: this._oSorter
		};

		this._bindAggregationToControl("items", oList, oBindingInfo);
	};

	ListContent.prototype._createChartAndAddLegend = function (oChartSettings) {
		var oChart = Microchart.create(oChartSettings);

		// destroy previously created legend
		this.destroyAggregation("_legend");

		if (oChartSettings.type === "StackedBar") {
			var oLegend = new MicrochartLegend({
				chart: oChart.getChart(),
				colorsLoad: function () {
					this.fireEvent(LEGEND_COLORS_LOAD);
				}.bind(this)
			});

			oLegend.initItemsTitles(oChartSettings.bars, this.getBindingContext().getPath());

			this.setAggregation("_legend", oLegend);
			this.awaitEvent(LEGEND_COLORS_LOAD);
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
						openWindow(oItem.action.url, oItem.target || "_blank");
					});
				}
			}
			oList.addItem(oListItem);
		});

		//workaround until actions refactor
		this.fireEvent("_actionContentReady");
	};

	/**
	 * @override
	 * @returns {sap.m.List} The inner list.
	 */
	ListContent.prototype.getInnerList = function () {
		return this._getList();
	};

	return ListContent;
});