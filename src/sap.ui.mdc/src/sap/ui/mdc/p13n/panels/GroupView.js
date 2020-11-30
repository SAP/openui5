/*
 * ! ${copyright}
 */
sap.ui.define([
    "./BasePanel",
	"sap/m/Label",
	"sap/base/util/deepEqual",
	"sap/m/CustomListItem",
	"sap/m/List",
	"sap/m/Panel",
	"sap/m/Toolbar",
	"sap/m/Table",
	"sap/m/Text",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/ui/core/Icon",
	"sap/m/HBox"
], function(BasePanel, Label, deepEqual, CustomListItem, List, Panel, Toolbar, Table, Text, ColumnListItem, Column, Icon, HBox) {
	"use strict";

	/**
	 * Constructor for a new GroupView
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class
	 * @extends sap.ui.mdc.p13n.panels.BasePanel
	 * @author SAP SE
	 * @constructor The GroupView is a list based view to personalize selection and filter values of a Control that allows certain filter capabilities.
	 * @private
	 * @experimental
	 * @since 1.85
	 * @alias sap.ui.mdc.p13n.panels.GroupView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GroupView = BasePanel.extend("sap.ui.mdc.p13n.panels.GroupView", {
		metadata: {
			library: "sap.ui.mdc"
		},
		renderer: {}
	});

	GroupView.prototype.init = function() {
		// Initialize the BasePanel
		BasePanel.prototype.init.apply(this, arguments);

		var oGroupPanelTemplate = new ColumnListItem({
			visible: "{" + this.P13N_MODEL + ">groupVisible}",
			cells: [
				this._createGroupPanelTemplate(this._createGroupListTemplate())
			]
		});

		this.setShowFactory(true);
		this.displayColumns();

		this._aInitializedLists = [];

		this.setTemplate(oGroupPanelTemplate);
		this._setMoveButtonVisibility(true);
	};

	GroupView.prototype.getShowFactory = function() {
		return this._bShowFactory;
	};

	GroupView.prototype.setShowFactory = function(bShow) {
		this._bShowFactory = bShow;
	};

	GroupView.prototype.getPanels = function() {
		var aPanels = [];

		this._oListControl.getItems().forEach(function(oItem){
			aPanels.push(oItem.getCells()[0]);
		});

		return aPanels;
	};

    GroupView.prototype._createGroupListTemplate = function() {
		return new List({
			selectionChange: function(oBindingInfo) {
				var sPath = oBindingInfo.getParameter("listItem").getBindingContext(this.P13N_MODEL).sPath;
				var oItem = this.getP13nModel().getProperty(sPath);
				this.fireChange({
					reason: oItem.selected ? "Add" : "Remove",
					item: oItem
				});
			}.bind(this),
			showSeparators: "None",
			items: this._getItemsBinding(false),
			mode: "MultiSelect"
		});
	};

    GroupView.prototype._createGroupPanelTemplate = function(oInnerListTemplate) {
		var P13N_MODEL = this.P13N_MODEL;
		return new Panel({
			expandable: true,
			expanded: {
				path: this.P13N_MODEL + ">group",
				formatter: function(){
					if (this.getBindingContext(P13N_MODEL)){
						var bExpanded = this.getBindingContext(P13N_MODEL).sPath.split("/")[2] === "0";
						return bExpanded;
					} else {
						return false;
					}
				}
			},

			expand: function(oEvt){

				var oSource = oEvt.getSource();
				var oInnerList = oSource.getContent()[0];
				this._addInitializedList(oInnerList);
				if (this.getShowFactory()){
					this._addFactoryControl(oInnerList);
					this.filterWithoutDestroy(this._aCurrentFilters);// --> check if there is already an existing Filter
				}

			}.bind(this),

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
				oInnerListTemplate
			]
		});
	};

	GroupView.prototype._addFactoryControl = function(oList) {

		if (oList.getItems().length == 0 || oList.getItems()[0].getContent().length < 2) {
			oList.getItems().forEach(function(oItem){
				var oContext = oItem.getBindingContext(this.P13N_MODEL);
				var oField = this.getItemFactory().call(this, oContext);

				//Add Factory Control
				oItem.addContent(oField);

				//Remove Icon
				if (oItem.getContent()[0].getItems().length > 1) {
					oItem.getContent()[0].removeItem(1);
				}
			}.bind(this));
		}

		this.addStyleClass("sapUiMDCAFLabelMarking");

	};

    GroupView.prototype._createInnerListControl = function() {
		var oList =  new Table(this.getId() + "-innerGroupViewTable", Object.assign(this._getListControlConfig(), {
			mode: "None",
			updateStarted: function(oEvt) {
				this._checkAllPanels();
			}.bind(this)
		}));

		return oList;
	};

    GroupView.prototype._getItemsBinding = function(bAddFilterField) {

		var fnCreatePlain = function(sId, oContext) {

			var aInnerListItemContent = [
				new HBox({
					width: "100%",
					justifyContent: "SpaceBetween",
					items: [
						//Icon dynamically added to the HBox
						new Label({
							required: "{" + this.P13N_MODEL + ">required}",
							text: "{" + this.P13N_MODEL + ">label}"
						})
					]
				})
			];

			return new CustomListItem({
				visible: "{" + this.P13N_MODEL + ">visibleInDialog}",
				selected: "{" + this.P13N_MODEL + ">selected}",
				tooltip: "{" + this.P13N_MODEL + ">tooltip}",
				content: aInnerListItemContent
			});

		}.bind(this);

		return {
			path: this.P13N_MODEL + ">items",
			key: "name",
			templateShareable: false,
			template: fnCreatePlain()
		};
	};

	GroupView.prototype._getIconTemplate = function() {
		return new Icon({
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
		});
	};

	GroupView.prototype._loopGroupList = function(fnCallback) {
		this._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getCells()[0];
			var oInnerList = oPanel.getContent()[0];
			this._loopItems(oInnerList, function(oItem, sKey){
				fnCallback(oItem, sKey);
			});
		}.bind(this));
	};

	GroupView.prototype._loopItems = function(oList, fnItemCallback) {
		oList.getItems().forEach(function(oItem){

			var sPath = oItem.getBindingContextPath();
			var sKey = this.getP13nModel().getProperty(sPath).name;

			fnItemCallback.call(this, oItem, sKey);
		}.bind(this));
	};

	GroupView.prototype._removeFactoryControl = function() {
        this._loopGroupList(function(oItem, sKey){
            if (oItem.getContent()[1]){

				//Remove Factory Control
                oItem.removeContent(oItem.getContent()[1]);
                var oList = oItem.getParent();
				this._addInitializedList(oList);

				//Add Icon
				var oIcon = this._getIconTemplate();
				oItem.getContent()[0].addItem(oIcon);
            }
		}.bind(this));

		this.removeStyleClass("sapUiMDCAFLabelMarking");

		return this._aInitializedLists || [];
	};

	GroupView.prototype._addInitializedList = function(oList) {
		var sListId = oList.getId();
		if (this._aInitializedLists.indexOf(sListId) < 0){
			this._aInitializedLists.push(sListId);
		}
	};

	GroupView.prototype._getInitializedLists = function(){
		var aLists = [];
		this._aInitializedLists.forEach(function(sListId){
			var oList = sap.ui.getCore().byId(sListId);
			if (oList){
				aLists.push(oList);
			}
		});
		return aLists;
	};

	GroupView.prototype.getSelectedFields = function() {
		var aSelectedItems = [];
		this._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getCells()[0];
			var oInnerList = oPanel.getContent()[0];
			this._loopItems(oInnerList, function(oItem, sKey){
				if (oItem.getSelected()){
					aSelectedItems.push(sKey);
				}
			});
		}.bind(this));

		return aSelectedItems;
	};

	GroupView.prototype.filterWithoutDestroy = function(aFilter) {
		if (deepEqual(aFilter, this._aCurrentFilters)) {
			return;
		}

		var aInitializedGroups = this._removeFactoryControl();

		this._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getCells()[0];
			var oInnerList = oPanel.getContent()[0];

			if (oInnerList.getBinding("items")){
				oInnerList.getBinding("items").filter(aFilter, true);
				this._togglePanelVisibility(oPanel);
			}

			if (this.getShowFactory() && aInitializedGroups.indexOf(oInnerList.getId()) > -1) {
				this._addFactoryControl(oInnerList);
			}
		}.bind(this));

		this._aCurrentFilters = aFilter;
	};

	GroupView.prototype.showFactory = function(bShow) {

		this.displayColumns();

        if (bShow){
			this._getInitializedLists().forEach(function(oInitializedList){
				this._addFactoryControl(oInitializedList);
			}.bind(this));
        } else {
			this._removeFactoryControl();
		}

    };

	GroupView.prototype._checkAllPanels = function () {
		this._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getCells()[0];
			this._togglePanelVisibility(oPanel);
		}.bind(this));
	};

	GroupView.prototype.setGroupExpanded = function(sGroup, bExpand){
		this._oListControl.getItems().forEach(function(oOuterItem){
			var oPanel = oOuterItem.getCells()[0];
			var sBindingPath = oPanel.getBindingContext(this.P13N_MODEL).sPath;
			var oItem = this.getP13nModel().getProperty(sBindingPath);
			if (oItem.group === sGroup) {
				oPanel.setExpanded(bExpand);
			}
		}, this);
	};

	GroupView.prototype._togglePanelVisibility = function(oPanel) {
		var oInnerList = oPanel.getContent()[0];
		var oContext = oPanel.getBindingContext(this.P13N_MODEL);

		if (oContext){
			var sPanelBindingContextPath = oContext.sPath;

			var oItem = this.getP13nModel().getProperty(sPanelBindingContextPath);
			oItem.groupVisible = oInnerList.getVisibleItems().length < 1 ? false : true;

			this.getP13nModel().setProperty(sPanelBindingContextPath, oItem);
		}

	};

	GroupView.prototype._checkFirstGroup = function() {

		//One time operation for the first panel in the group view
		if (
			!this._bInitialized &&
			this._oListControl &&
			this._oListControl.getItems().length > 0
			){
				this._bInitialized = true;
				var oFirstList = this._oListControl.getItems()[0].getCells()[0].getContent()[0];
				this._addFactoryControl(oFirstList);
				this._addInitializedList(oFirstList);
			}
	};

	GroupView.prototype.displayColumns = function() {

		var oHeader = new HBox({
			width: "100%",
			justifyContent: "SpaceBetween",
			items:[
				new HBox({
					items: [
						new Text({
							text: this.getResourceText("p13nDialog.LIST_VIEW_COLUMN")
						})
					]
				}).addStyleClass("sapUiMDCPaddingPanelLeft")
			]
		});

		if (!this.getShowFactory()) {
			oHeader.addItem(new HBox({
				width: "23.25%",
				justifyContent: "Center",
				items: [
					new Text({
						text: this.getResourceText("p13nDialog.LIST_VIEW_ACTIVE")
					})
				]
			}));
		}

        var oColumn = new Column({
			header: oHeader
		});

        this.setPanelColumns(oColumn);
    };

	GroupView.prototype.setP13nModel = function(oModel) {
		this.setModel(oModel, this.P13N_MODEL);
		this._bindListItems();
		this._checkFirstGroup();
		this._checkAllPanels();
	};

    GroupView.prototype._bindListItems = function () {
        this._oListControl.bindItems(Object.assign({
			path: this.P13N_MODEL + ">/itemsGrouped",
			key: "name",
			templateShareable: false,
			template: this.getTemplate().clone()
		}));
	};

	GroupView.prototype.exit = function() {
        BasePanel.prototype.exit.apply(this, arguments);
		this._aInitializedLists = null;
		this._bShowFactory = false;
		this._bInitialized = false;
	};

	return GroupView;

});
