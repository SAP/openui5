/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseListContent",
	"./ListContentRenderer",
	"sap/ui/util/openWindow",
	"sap/m/library",
	"sap/m/List",
	"sap/f/cards/loading/ListPlaceholder",
	"sap/ui/integration/controls/ObjectStatus",
	"sap/ui/integration/library",
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/integration/util/BindingResolver",
	"sap/ui/integration/controls/Microchart",
	"sap/ui/integration/controls/MicrochartLegend",
	"sap/ui/integration/controls/ListContentItem",
	"sap/ui/integration/controls/ActionsStrip",
	"sap/ui/integration/cards/list/MicrochartsResizeHelper"
], function (
	BaseListContent,
	ListContentRenderer,
	openWindow,
	mLibrary,
	List,
	ListPlaceholder,
	ObjectStatus,
	library,
	BindingHelper,
	BindingResolver,
	Microchart,
	MicrochartLegend,
	ListContentItem,
	ActionsStrip,
	MicrochartsResizeHelper
) {
	"use strict";

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
	 * Called on before rendering of the control.
	 * @private
	 */
	ListContent.prototype.onBeforeRendering = function () {
		BaseListContent.prototype.onBeforeRendering.apply(this, arguments);

		this._getList().setBackgroundDesign(this.getDesign());
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

		if (this._oMicrochartsResizeHelper) {
			this._oMicrochartsResizeHelper.destroy();
			this._oMicrochartsResizeHelper = null;
		}
	};

	/**
	 * @override
	 */
	ListContent.prototype.createLoadingPlaceholder = function (oConfiguration) {
		var oCard = this.getCardInstance(),
			iContentMinItems = oCard.getContentMinItems(oConfiguration);
		const oResolvedConfig = BindingResolver.resolveValue(oConfiguration.item, this);
		const oPlaceholderInfo = ListContentItem.getPlaceholderInfo(oResolvedConfig);

		return new ListPlaceholder({
			minItems: iContentMinItems !== null ? iContentMinItems : 2,
			hasIcon: oPlaceholderInfo.hasIcon,
			attributesLength: oPlaceholderInfo.attributesLength,
			hasChart: oPlaceholderInfo.hasChart,
			hasActionsStrip: oPlaceholderInfo.hasActionsStrip,
			hasDescription: oPlaceholderInfo.hasDescription,
			itemHeight: ListContentRenderer.getItemMinHeight(oConfiguration, this) + "rem"
		});
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
	ListContent.prototype.applyConfiguration = function () {
		BaseListContent.prototype.applyConfiguration.apply(this, arguments);

		var oConfiguration = this.getParsedConfiguration();

		if (!oConfiguration) {
			return;
		}

		if (oConfiguration.items) {
			this._setStaticItems(oConfiguration.items);
			return;
		}

		if (oConfiguration.item) {
			this._setItem(oConfiguration);
		}
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
				var oResolvedItem = BindingResolver.resolveValue(oConfiguration.item, this, oItem.getBindingContext().getPath());

				if (oResolvedItem.icon && oResolvedItem.icon.src) {
					oResolvedItem.icon.src = this._oIconFormatter.formatSrc(oResolvedItem.icon.src);
				}

				aResolvedItems.push(oResolvedItem);
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
	 * @override
	 */
	ListContent.prototype.getItemsLength = function () {
		return this._getList().getItems().filter((item) => !item.isA("sap.m.GroupHeaderListItem")).length;
	};

	/**
	 * Handler for when data is changed.
	 */
	ListContent.prototype.onDataChanged = function () {
		BaseListContent.prototype.onDataChanged.apply(this, arguments);

		this._checkHiddenNavigationItems(this.getParsedConfiguration().item);

		this._getList().getItems().forEach((oItem) => {
			if (oItem.getActionsStrip && oItem.getActionsStrip()) {
				oItem.getActionsStrip().onDataChanged();
			}
		});
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
				ariaLabelledBy: this.getHeaderTitleId(),
				updateFinished: function () {
					if (this._iVisibleItems) {
						var aItems = this._oList.getItems();
						for (var i = this._iVisibleItems + 1; i < aItems.length; i++) {
							aItems[i].setVisible(false);
						}
					}
				}.bind(this)
			});

			this._oList.addEventDelegate({
				onfocusin: function (oEvent) {
					if (!(oEvent.srcControl instanceof ListContentItem)) {
						return;
					}

					var fItemBottom = oEvent.target.getBoundingClientRect().bottom;
					var fContentBottom = this.getDomRef().getBoundingClientRect().bottom;
					var fDist = Math.abs(fItemBottom - fContentBottom);
					var ROUNDED_CORNER_PX_THRESHOLD = 10;

					if (fDist < ROUNDED_CORNER_PX_THRESHOLD) {
						oEvent.srcControl.addStyleClass("sapUiIntLCIRoundedCorners");
					}
				}
			}, this);

			this.setAggregation("_content", this._oList);
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
			oObjectStatus,
			mSettings = {
				title: mItem.title && (mItem.title.value || mItem.title),
				description: mItem.description && (mItem.description.value || mItem.description),
				descriptionVisible: mItem.description ? mItem.description.visible : undefined,
				highlight: mItem.highlight,
				highlightText: mItem.highlightText,
				hasInfo: !!mItem.info,
				info: mItem.info && mItem.info.value,
				infoState: mItem.info && mItem.info.state,
				infoVisible: mItem.info && mItem.info.visible,
				showInfoStateIcon: mItem.info && mItem.info.showStateIcon,
				customInfoStatusIcon: mItem.info && mItem.info.customStateIcon,
				attributes: []
			};

		if (mItem.icon) {
			mSettings.icon = BindingHelper.formattedProperty(mItem.icon.src, function (sValue) {
				return this._oIconFormatter.formatSrc(sValue);
			}.bind(this));
			mSettings.iconAlt = mItem.icon.alt;
			mSettings.iconDisplayShape = mItem.icon.shape;
			mSettings.iconFitType = mItem.icon.fitType;
			mSettings.iconInitials = mItem.icon.initials || mItem.icon.text;
			mSettings.iconVisible = mItem.icon.visible;

			if (mItem.icon.size) {
				mSettings.iconSize = mItem.icon.size;
			}
			mSettings.iconBackgroundColor = mItem.icon.backgroundColor || (mSettings.iconInitials ? undefined : AvatarColor.Transparent);
		}

		if (mItem.attributesLayoutType) {
			mSettings.attributesLayoutType = mItem.attributesLayoutType;
		}

		if (mItem.attributes) {
			mItem.attributes.forEach(function (attr) {
				oObjectStatus = new ObjectStatus({
					text: attr.value,
					state: attr.state,
					emptyIndicatorMode: EmptyIndicatorMode.On,
					visible: attr.visible,
					showStateIcon: attr.showStateIcon,
					icon: attr.customStateIcon
				});

				mSettings.attributes.push(oObjectStatus);
			});
		}

		if (!bIsSkeleton) {
			if (mItem.chart) {
				mSettings.microchart = this._createChartAndAddLegend(mItem.chart);
			}

			if (mItem.actionsStrip) {
				mSettings.actionsStrip = ActionsStrip.create(mItem.actionsStrip, this.getCardInstance());
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
				}.bind(this),
				visible: oChartSettings.visible
			});

			oLegend.initItemsTitles(oChartSettings.bars, this.getBindingContext().getPath());

			this.setAggregation("_legend", oLegend);
			this.awaitEvent(LEGEND_COLORS_LOAD);
		}

		this._oMicrochartsResizeHelper = new MicrochartsResizeHelper(this._oList);

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
				title: oItem.title ? oItem.title : "",
				description: oItem.description ? oItem.description : "",
				icon: oItem.icon ? oItem.icon : "",
				infoState: oItem.infoState ? oItem.infoState : "None",
				info: oItem.info ? oItem.info : "",
				highlight: oItem.highlight ? oItem.highlight : "None",
				highlightText: oItem.highlightText ? oItem.highlightText : ""
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