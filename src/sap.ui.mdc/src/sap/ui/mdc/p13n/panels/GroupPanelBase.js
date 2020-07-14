/*
 * ! ${copyright}
 */
sap.ui.define([
    "./BasePanel",
    "sap/m/Label",
    "sap/m/CustomListItem",
    "sap/m/Panel",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/Toolbar",
    "sap/m/List",
	"sap/m/VBox",
	'sap/ui/model/Filter'
], function (BasePanel, Label, CustomListItem, Panel, Select, Item, Toolbar, List, VBox, Filter) {
	"use strict";

	/**
	 * Constructor for GroupPanelBase
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class
	 * @extends sap.ui.mdc.p13n.panels.BasePanel
	 * @author SAP SE
	 * @constructor The GroupPanelBase is meant to provide a generic panel by providing a model in the required structure as defined in P13nBuilder.
	 * @private
	 * @experimental
	 * @since 1.81
	 * @alias sap.ui.mdc.p13n.panels.GroupPanelBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GroupPanelBase = BasePanel.extend("sap.ui.mdc.p13n.panels.GroupPanelBase", {
		library: "sap.ui.mdc",
		metadata: {
			properties: {
				/**
				 * Can be used to provide a factory function to return a custom ListItemBase inheriting control.
				 * The factory is being called with the binding control and should always return a control of type sap.m.ListItemBase
				 */
				itemFactory: {
					type: "function"
				},
				/**
				 * Determines whether the First Panel should be expanded initially once the panel opens
				 */
				expandFirstGroup: {
					type: "boolean"
				}
			},
			aggregations: {
				/**
				 * Can be used to generate a custom Toolbar in the footer area of the Popover
				 */
				footerToolbar: {
					type: "sap.m.IBar",
					multiple: false
				}
			}
		},
		renderer: {}
	});

	GroupPanelBase.prototype._setInnerLayout = function() {
		var oContainer = new VBox({
			items: [
				new VBox({
					items: [
						new Select({
							width: "50%",
							items: [
								new Item({
									key: "all",
									text: this.getResourceText("p13nDialog.GROUPMODE_ALL")
								}),
								new Item({
									key: "visible",
									text: this.getResourceText("p13nDialog.GROUPMODE_VISIBLE")
								})
							],
							change: this._onGroupModeChange.bind(this)
						}),
						this._getSearchField()
					]
				}),
				this._oListControl
			]
		});

		this.addStyleClass("sapUiMDCGroupPanelBase");
		this.setAggregation("_content", oContainer);
	};

	GroupPanelBase.prototype.setItemFactory = function (fnFactory) {

		this.setProperty("itemFactory", fnFactory);
		var oOuterTemplate = this._getDefaultGroupTemplate(fnFactory);
		this.setTemplate(oOuterTemplate);

		return this;
	};

	GroupPanelBase.prototype._getDefaultGroupTemplate = function(fnFactory) {

		var bExpandFirstGroup = this.getExpandFirstGroup();

		var oP13nCellTemplate = new CustomListItem({
			visible: "{groupVisible}",
			content: [
				new Panel({
					expandable: true,
					expanded: {
						path: "group",
						formatter: function(){
							if (this.getBindingContext()){
								var bExpanded = bExpandFirstGroup && (this.getBindingContext().sPath.split("/")[2] === "0");
								return bExpanded;
							} else {
								return false;
							}
						}
					},
					width:"100%",
					headerToolbar: [
						new Toolbar({
							content: [
								new Label({
									text: "{groupLabel}",
									design: "Bold"
								})
							]
						})
					],
					content: [
						new List({
							selectionChange: function(oBindingInfo) {
								var sPath = oBindingInfo.getParameter("listItem").getBindingContext().sPath;
								var oItem = this.getModel().getProperty(sPath);
								this.fireChange({
									reason: oItem.selected ? "Add" : "Remove",
									item: oItem
								});
							}.bind(this),
							showSeparators: "None",
							mode: "MultiSelect",
							items: {
								path: "items",
								key: "name",
								factory: fnFactory
							}
						})
					]
				})
			]
		});

		return oP13nCellTemplate;
	};

    GroupPanelBase.prototype._createInnerListControl = function(){

		var oBasePanelUI = new List("idBasePanelTable", {
			rememberSelections: false,
			itemPress: [this._onItemPressed, this],
			selectionChange: [this._onSelectionChange, this],
			sticky: ["HeaderToolbar", "ColumnHeaders"],
			dragDropConfig: this._oDragDropInfo
		});

		return oBasePanelUI;
	};

	GroupPanelBase.prototype.setFooterToolbar = function(oFooterToolbar) {
		this.setAggregation("footerToolbar", oFooterToolbar);
		this.getAggregation("_content").addItem(oFooterToolbar);
		return this;
	};

	GroupPanelBase.prototype._onGroupModeChange = function(oEvt) {
		this._sModeKey = oEvt.getParameters().selectedItem.getKey();
		this._filterByModeAndSearch();
	};

	GroupPanelBase.prototype._togglePanelVisibility = function(oPanel) {
		var oInnerList = oPanel.getContent()[0];
		var sPanelBindingContextPath = oPanel.getBindingContext().sPath;

		var oItem = this.getModel().getProperty(sPanelBindingContextPath);
		oItem.groupVisible = oInnerList.getVisibleItems().length < 1 ? false : true;

		this.getModel().setProperty(sPanelBindingContextPath, oItem);
	};

	GroupPanelBase.prototype._onSearchFieldLiveChange = function (oEvent) {
		this._sSearchString = oEvent.getSource().getValue();
		this._filterByModeAndSearch();
	};

	GroupPanelBase.prototype._filterByModeAndSearch = function() {
		var aFiltersSearch = [], oFilterMode;
		var aFilters;

		if (this._sSearchString){
			aFiltersSearch = [
				new Filter("label", "Contains", this._sSearchString),
				new Filter("tooltip", "Contains", this._sSearchString)
			];
			aFilters = new Filter(aFiltersSearch, false);
		}

		if (this._sModeKey === "visible") {
			oFilterMode = new Filter("selected", "EQ", true);
			if (aFilters) {
				aFilters = new Filter([new Filter({filters: aFiltersSearch}), oFilterMode], true);
			} else {
				aFilters = oFilterMode;
			}
		}

		aFilters = aFilters ? aFilters : [];

		this._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getContent()[0];
			var oInnerList = oPanel.getContent()[0];
			oInnerList.getBinding("items").filter(aFilters, true);
			this._togglePanelVisibility(oPanel);
		}.bind(this));
	};

	GroupPanelBase.prototype._checkAllPanels = function () {

		this._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getContent()[0];
			this._togglePanelVisibility(oPanel);
		}.bind(this));
	};

	GroupPanelBase.prototype.setP13nModel = function(oP13nModel) {
		BasePanel.prototype.setP13nModel.apply(this, arguments);
		this._checkAllPanels();
	};

    GroupPanelBase.prototype._bindListItems = function() {

		var mBindingInfo = {
			path: "/itemsGrouped",
			key: "name",
			templateShareable: false,
			template: this.getTemplate().clone()
		};

		//Overwrite default binding
		BasePanel.prototype._bindListItems.call(this, mBindingInfo);
	};

	GroupPanelBase.prototype.exit = function(){
		BasePanel.prototype.exit.apply(this, arguments);
		this._sSearchString = null;
	};

	return GroupPanelBase;

});
