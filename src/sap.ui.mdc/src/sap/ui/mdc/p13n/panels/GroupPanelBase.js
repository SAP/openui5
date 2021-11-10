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
	'sap/ui/model/Filter',
	"sap/ui/layout/FixFlex",
	"sap/m/Page",
	"sap/m/ColumnListItem",
	"sap/m/HBox",
	"sap/ui/core/Icon",
	"sap/m/Text",
	"sap/m/Column",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/m/Table"
], function (BasePanel, Label, CustomListItem, Panel, Select, Item, Toolbar, List, Filter, FixFlex, Page, ColumnListItem, HBox, Icon, Text, Column, SegmentedButton, SegmentedButtonItem, Table) {
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
				},
				/**
				 * Can be used to allow the selection of items
				 */
				allowSelection: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Can be used to check whether grouping/Panels should be used or not
				 */
				grouping: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Determines whether the order of items can be changed
				 */
				enableReorder: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Determines whether the list view is available
				 */
				enableListView: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Determines the default view for the GroupPanel
				 */
				defaultView: {
					type: "String"
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

	GroupPanelBase.prototype.GROUP_KEY = "group";
	GroupPanelBase.prototype.LIST_KEY = "list";

	GroupPanelBase.prototype.init = function() {
		this._mView = {};
		BasePanel.prototype.init.apply(this, arguments);

		this._sView = this.LIST_KEY;
	};

	GroupPanelBase.prototype.addCustomView = function(mViewSettings) {
		var oItem = mViewSettings.item;
		var sKey = oItem.getKey();
		var oContent = mViewSettings.content;
		var fnOnSearch = mViewSettings.search;

		if (fnOnSearch) {
			this._getSearchField().attachLiveChange(fnOnSearch);
		}

		this._mView[sKey] = oContent;
		if (this._oViewSwitch && !this._oViewSwitch.getVisible()){
			this._oViewSwitch.setVisible(true);
		}
		this._oViewSwitch.addItem(oItem);
	};

	GroupPanelBase.prototype._setInnerLayout = function() {

		if (!this._oGroupModeSelect) {
			this._oGroupModeSelect = new Select({
				items: [
					new Item({
						key: "all",
						text: this.getResourceText("p13nDialog.GROUPMODE_ALL")
					}),
					new Item({
						key: "visible",
						text: this.getResourceText("p13nDialog.GROUPMODE_VISIBLE")
					}),
					new Item({
						key: "active",
						text: this.getResourceText("p13nDialog.GROUPMODE_ACTIVE")
					}),
					new Item({
						key: "visibleactive",
						text: this.getResourceText("p13nDialog.GROUPMODE_VISIBLE_ACTIVE")
					})
				],
				tooltip: this.getResourceText("p13nDialog.QUICK_FILTER"),
				change: this._onGroupModeChange.bind(this)
			});
		}

		if (!this._oViewSwitch) {
			this._oViewSwitch = new SegmentedButton({
				visible: false,
				items: [
					new SegmentedButtonItem({
						tooltip: this.getResourceText("filterbar.ADAPT_LIST_VIEW"),
						icon: "sap-icon://list",
						key: this.LIST_KEY
					}),
					new SegmentedButtonItem({
						tooltip: this.getResourceText("filterbar.ADAPT_GROUP_VIEW"),
						icon: "sap-icon://group-2",
						key: this.GROUP_KEY
					})
				],
				selectionChange: function(oEvt) {
					var sKey = oEvt.getParameter("item").getKey();
					this.switchViewMode(sKey);
				}.bind(this)
			});
		}

		var oContainer = this._createContainer();

		this.addStyleClass("sapUiMDCGroupPanelBase");
		this.setAggregation("_content", oContainer);
	};

	GroupPanelBase.prototype._createContainer = function() {
		var oContainer = new Page({
			showHeader: false,
			content: [
				new FixFlex({
					minFlexSize: 1,
					fixContent: [
						new HBox({
							justifyContent: "SpaceBetween",
							items: [
								/* wrapping FlexBox required for the custom view toggle
								/* as the view switch will left align without a wrapper for the invisible control
								*/
								new HBox({
									items: [
										this._oGroupModeSelect
									]
								}),
								this._oViewSwitch
							]
						}),
						this._getSearchField()
					],
						flexContent: [
						this._oListControl
					]
				})
			]
		});

		return oContainer;
	};

	GroupPanelBase.prototype.setItemFactory = function (fnFactory) {

		this.setProperty("itemFactory", fnFactory);
		this._createInnerListControl();

		return this;
	};

	GroupPanelBase.prototype.setAllowSelection = function(bAllowSelection) {
		this.setProperty("allowSelection", bAllowSelection);

		this._oGroupModeSelect.setVisible(bAllowSelection);

		this._updateTemplate();
		return this;
	};

	GroupPanelBase.prototype.setEnableReorder = function(bReorder) {
		this.setProperty("enableReorder", bReorder);
		this._oReorderList.removeDragDropConfig();
		return this;
	};

	GroupPanelBase.prototype.setEnableListView = function(bEnableListView) {
		this.setProperty("enableListView", bEnableListView);
		this._oViewSwitch.setVisible(bEnableListView); //only required if atleast 2 views are present
		if (bEnableListView){
			this._mView[this.LIST_KEY] = this._oReorderList;
		} else {
			var oItem = this._oViewSwitch.getItems()[0];
			this._oViewSwitch.removeItem(oItem);
			this._sView = this.GROUP_KEY;
		}
		return this;
	};

	GroupPanelBase.prototype._getDefaultGroupTemplate = function() {
		var fnFactory = this.getItemFactory();

		var bExpandFirstGroup = this.getExpandFirstGroup();

		var oListTemplate = new List({
			selectionChange: function(oBindingInfo) {
				var sPath = oBindingInfo.getParameter("listItem").getBindingContext(this.P13N_MODEL).sPath;
				var oItem = this.getP13nModel().getProperty(sPath);
				this.fireChange({
					reason: oItem.selected ? "Add" : "Remove",
					item: oItem
				});
			}.bind(this),
			showSeparators: "None",
			mode: this.getAllowSelection() ? "MultiSelect" : "None",
			items: {
				path: this.P13N_MODEL + ">items",
				key: "name",
				factory: fnFactory
			}
		});

		var P13N_MODEL = this.P13N_MODEL;

		var oPanelTemplate = new Panel({
			expandable: true,
			expanded: {
				path: this.P13N_MODEL + ">group",
				formatter: function(){
					if (this.getBindingContext(P13N_MODEL)){
						var bExpanded = bExpandFirstGroup && (this.getBindingContext(P13N_MODEL).sPath.split("/")[2] === "0");
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
							text: "{" + this.P13N_MODEL + ">groupLabel}",
							design: "Bold"
						})
					]
				})
			],
			content: [
				oListTemplate
			]
		});

		var bGroupingEnabled = this.getGrouping();

		if (!bGroupingEnabled && !oListTemplate.hasStyleClass("sapUiMDCPanelPadding")) {
			oListTemplate.addStyleClass("sapUiMDCPanelPadding");
		} else {
			oListTemplate.removeStyleClass("sapUiMDCPanelPadding");
		}

		var oInnerTemplate = bGroupingEnabled ? oPanelTemplate : oListTemplate;

		var oP13nCellTemplate = new CustomListItem({
			visible: "{" + this.P13N_MODEL + ">groupVisible}",
			content: [
				oInnerTemplate
			]
		});

		return oP13nCellTemplate;
	};

	GroupPanelBase.prototype._updateTemplate = function() {
		var oOuterTemplate = this.getPanelMode() ? this._getSimpleLayout() : this._getDefaultGroupTemplate();
		this.setTemplate(oOuterTemplate);
	};

	GroupPanelBase.prototype._getSearchField = function() {
		var oSearchField = BasePanel.prototype._getSearchField.apply(this, arguments);
		oSearchField.setPlaceholder(this.getResourceText("p13nDialog.ADAPT_FILTER_SEARCH"));
		return oSearchField;
	};

	GroupPanelBase.prototype.setGrouping = function(bAllowGrouping) {
		this.setProperty("grouping", bAllowGrouping);
		this._updateTemplate();
		return this;
	};

    GroupPanelBase.prototype._createInnerListControl = function(){

		var bReorder = this.getPanelMode();

		if (!this._oReorderList){
			this._oReorderList = new Table(this._getListControlConfig());
			this._oReorderList.bPreventMassSelection = true;
			this._oReorderList.setMode("MultiSelect");
			this._mView[this.LIST_KEY] = this._oReorderList;
		}

		if (!this._oGroupList){
			this._oGroupList = new List(this._getListControlConfig());
			this._oGroupList.setMode("None");
			this._mView[this.GROUP_KEY] = this._oGroupList;
		}

		this._oListControl = bReorder ? this._oReorderList : this._oGroupList;

		this._setMoveButtonVisibility(bReorder);
		this._updateContainer(bReorder);

		return this._oListControl;
	};

	GroupPanelBase.prototype.setFooterToolbar = function(oFooterToolbar) {
		this.setAggregation("footerToolbar", oFooterToolbar);
		this.getAggregation("_content").setFooter(oFooterToolbar.clone());
		return this;
	};

	GroupPanelBase.prototype.setGroupExpanded = function(sGroup, bExpand){
		this._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getContent()[0];
			var sBindingPath = oPanel.getBindingContext(this.P13N_MODEL).sPath;
			var oItem = this.getP13nModel().getProperty(sBindingPath);
			if (oItem.group === sGroup) {
				oPanel.setExpanded(bExpand);
			}
		}, this);
	};

	GroupPanelBase.prototype._onGroupModeChange = function(oEvt) {
		this._sModeKey = oEvt.getParameters().selectedItem.getKey();
		this._filterByModeAndSearch();
	};

	GroupPanelBase.prototype._togglePanelVisibility = function(oPanel) {
		var oInnerList = oPanel.getContent()[0];
		var sPanelBindingContextPath = oPanel.getBindingContext(this.P13N_MODEL).sPath;

		var oItem = this.getP13nModel().getProperty(sPanelBindingContextPath);
		oItem.groupVisible = oInnerList.getVisibleItems().length < 1 ? false : true;

		this.getP13nModel().setProperty(sPanelBindingContextPath, oItem);
	};

	GroupPanelBase.prototype._onSearchFieldLiveChange = function (oEvent) {
		this._sSearchString = oEvent.getSource().getValue();
		this._filterByModeAndSearch();
	};

	GroupPanelBase.prototype._isCustomView = function() {
		return this._sView != this.GROUP_KEY && this._sView != this.LIST_KEY;
	};

	GroupPanelBase.prototype._filterByModeAndSearch = function() {
		var aFiltersSearch = [], oFilterMode;
		var aFilters;

		if (this._isCustomView()) {
			return;
		}

		if (this._sSearchString){
			aFiltersSearch = [
				new Filter("label", "Contains", this._sSearchString),
				new Filter("tooltip", "Contains", this._sSearchString)
			];
			aFilters = new Filter(aFiltersSearch, false);
		}

		var fnAppendFilter = function() {
			if (aFilters) {
				aFilters = new Filter([new Filter(aFiltersSearch), oFilterMode], true);
			} else {
				aFilters = oFilterMode;
			}
		};

		if (this._sModeKey === "visible") {
			oFilterMode = new Filter("selected", "EQ", true);
			fnAppendFilter();
		}

		if (this._sModeKey === "active") {
			oFilterMode = new Filter("isFiltered", "EQ", true);
			fnAppendFilter();
		}

		if (this._sModeKey === "visibleactive") {
			oFilterMode = oFilterMode = new Filter([
				new Filter("isFiltered", "EQ", true),
				new Filter("selected", "EQ", true)
			], true);
			fnAppendFilter();
		}

		aFilters = aFilters ? aFilters : [];

		//Update value - necessary due to view switch
		this._getSearchField().setValue(this._sSearchString);

		if (!this.getPanelMode()) {
			if (this.getGrouping()) {
				this._oListControl.getItems().forEach(function(oOuterItem){
					var oPanel = oOuterItem.getContent()[0];
					var oInnerList = oPanel.getContent()[0];
					oInnerList.getBinding("items").filter(aFilters, true);
					this._togglePanelVisibility(oPanel);
				}.bind(this));
			}
		} else {
			this._oListControl.getBinding("items").filter(aFilters, true);
		}

	};

	GroupPanelBase.prototype.getSelectedFields = function () {

		//There are no selected Fields in case this mode is disabled
		if (!this.getAllowSelection()){
			return;
		}
		var aSelectedItems = [];

		if (this.getPanelMode()) {
			this._loopItems(this._oListControl, function(oItem, sKey){
				if (oItem.getSelected()){
					aSelectedItems.push(sKey);
				}
			});
		} else {
			this._oListControl.getItems().forEach(function(oOuterItem){
				var oPanel = oOuterItem.getContent()[0];
				var oInnerList = oPanel.getContent()[0];
				this._loopItems(oInnerList, function(oItem, sKey){
					if (oItem.getSelected()){
						aSelectedItems.push(sKey);
					}
				});
			}.bind(this));
		}

		return aSelectedItems;
	};

	GroupPanelBase.prototype._loopItems = function(oList, fnItemCallback) {
		oList.getItems().forEach(function(oItem){

			var sPath = oItem.getBindingContextPath();
			var sKey = this.getP13nModel().getProperty(sPath).name;

			fnItemCallback.call(this, oItem, sKey);
		}.bind(this));
	};

	GroupPanelBase.prototype.switchListMode = function() {
		return;
	};

	GroupPanelBase.prototype._filterBySelected = function(bShowSelected, oList) {
		return;
	};

	GroupPanelBase.prototype.switchViewMode = function(sView) {

		//TODO:
		//Reconsider BasePanel derivation as the reorder toggle is not sufficient here

		var bIsStandardView = true;

		if (!this._mView[sView]) {
			throw new Error("Please provide either 'Group' or 'List' as view mode or define a custom view via 'addCustomView'");
		}

		//Same view --> do nothing
		if (sView == this._sView) {
			return;
		} else {
			this._sView = sView;
			this._oViewSwitch.setSelectedKey(sView);

			//custom view --> display custom content f
			if (this._isCustomView()) {
				bIsStandardView = false;
				var oContainer = this._createContainer();
				oContainer.getContent()[0].setFlexContent(this._mView[sView]);
				this.setAggregation("_content", oContainer);

			//predefined view --> check if a view-toggle is required
			} else {
				var bReorder = this.getPanelMode();

				//mode does not need to be updated --> only replace view
				if (sView == this.LIST_KEY && bReorder || sView == this.GROUP_KEY && !bReorder) {
					this._createInnerListControl();

				//mode needs to be updated --> trigger a toggle
				} else {
					this._togglePanelMode();
				}
			}
		}

		this._oGroupModeSelect.setVisible(bIsStandardView && this.getAllowSelection());
	};

	GroupPanelBase.prototype.getViewMode = function () {
		return this._sView;
	};

	GroupPanelBase.prototype._togglePanelMode = function() {

		//TODO: Generify for any inner template --> Currently required as this may be destroyed due to the binding
		if (this._moveTopButton.getParent()){
			this._moveTopButton.getParent().removeAllItems();
		}

		var bReorderMode = !this.getPanelMode();
		this.setPanelMode(bReorderMode);

		this._createInnerListControl();
		this._filterByModeAndSearch();

		this._getSearchField().setVisible(true);
	};

	GroupPanelBase.prototype._updateContainer = function(bReorder) {
		if (bReorder) {
			var oContainer = this._createContainer();
			this.setAggregation("_content", oContainer);
			this.setPanelColumns([
				this.getResourceText("p13nDialog.LIST_VIEW_COLUMN"),
				new Column({
					width: "25%",
					hAlign: "Center",
					vAlign: "Middle",
					header: new Text({
						text: this.getResourceText("p13nDialog.LIST_VIEW_ACTIVE")
					})
				})
			]);
		} else {
			this._setInnerLayout();
		}

		this._updateTemplate();
	};

	GroupPanelBase.prototype._getSimpleLayout = function() {
		this._bDefaultTemplateUsed = true;

		var oP13nCellTemplate = new ColumnListItem({
			selected: "{" + this.P13N_MODEL + ">selected}",
			type: "Active",
			cells: [
				new Label({
					wrapping: true,
					tooltip: "{" + this.P13N_MODEL + ">tooltip}",
					text: "{" + this.P13N_MODEL + ">label}"
				}),
				new HBox({
					justifyContent: "Center",
					items: [
						new Icon({
							src: "sap-icon://circle-task-2",
							size: "0.5rem",
							color: sap.ui.core.IconColor.Neutral,
							visible: {
								path: this.P13N_MODEL + ">isFiltered",
								formatter: function(bIsFiltered) {
									if (bIsFiltered){
										return true;
									} else {
										return false;
									}
								}
							}
						})
					]
				})
			]
		});

		var that = this;

		if (this.getEnableReorder()){
			oP13nCellTemplate.attachBrowserEvent("mouseenter", function(oEvt){
				var oIcon = this.getCells()[1].getItems()[0];
				oIcon.setVisible(false);
				that._oSelectedItem = this;
				that._updateEnableOfMoveButtons(this);
			});

			oP13nCellTemplate.attachBrowserEvent("mouseleave", function(oEvt){
				var bVisible = !!that.getP13nModel().getProperty(this.getBindingContextPath()).isFiltered;
				var oIcon = this.getCells()[1].getItems()[0];
				if (that._oSelectedItem) {
					that._oSelectedItem.getCells()[1].removeItem(that._moveTopButton);
					that._oSelectedItem.getCells()[1].removeItem(that._moveUpButton);
					that._oSelectedItem.getCells()[1].removeItem(that._moveDownButton);
					that._oSelectedItem.getCells()[1].removeItem(that._moveBottomButton);
				}
				oIcon.setVisible(bVisible);
			});
		}

		return oP13nCellTemplate;
	};

	GroupPanelBase.prototype._updateEnableOfMoveButtons = function(oTableItem) {
		if (!this.getEnableReorder()) {
			return;
		}
		BasePanel.prototype._updateEnableOfMoveButtons.apply(this, arguments);
		//oTableItem.getCells()[1].removeAllItems();
		oTableItem.getCells()[1].addItem(this._moveTopButton);
		oTableItem.getCells()[1].addItem(this._moveUpButton);
		oTableItem.getCells()[1].addItem(this._moveDownButton);
		oTableItem.getCells()[1].addItem(this._moveBottomButton);
	};

	GroupPanelBase.prototype._checkAllPanels = function () {
		this._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getContent()[0];
			this._togglePanelVisibility(oPanel);
		}.bind(this));
	};

	GroupPanelBase.prototype.getPanelMode = function() {
		if (!this.getEnableListView()){
			return false;
		} else {
			return this.getP13nModel() ? this.getP13nModel().getProperty("/reorderMode") : true;
		}
	};

	GroupPanelBase.prototype.setP13nModel = function(oP13nModel) {
		var bInitialized = !!this.getP13nModel();
		BasePanel.prototype.setP13nModel.apply(this, arguments);
		if (!bInitialized) {
			this.setPanelMode(true);
		}
		if (this.getGrouping() && !this.getPanelMode()){
			this._checkAllPanels();
		}
		this._bindListItems();

		var sDefaultView = this.getDefaultView();
		if (sDefaultView) {
			this.switchViewMode(sDefaultView);
		}
	};

    GroupPanelBase.prototype._bindListItems = function() {

		var bReorder = this.getPanelMode();

		//Overwrite default binding
		this._oListControl.bindItems(Object.assign({
			path: this.P13N_MODEL + (bReorder === true ? ">/items" : ">/itemsGrouped"),
			key: "name",
			templateShareable: false,
			template: this.getTemplate().clone()
		}));
	};

	GroupPanelBase.prototype.exit = function(){

		Object.keys(this._mView).forEach(function(sKey) {
			if ((this._sView !== sKey) && this._mView[sKey]) {
				this._mView[sKey].destroy();
			}
		}.bind(this));

		BasePanel.prototype.exit.apply(this, arguments);
		this._oGroupList = null;
		this._oReorderList = null;
		this._sSearchString = null;
		this._oResetBtn = null;

		this._mView = null;
		this._sView = null;
	};

	return GroupPanelBase;

});