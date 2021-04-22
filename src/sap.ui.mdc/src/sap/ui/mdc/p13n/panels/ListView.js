/*
 * ! ${copyright}
 */
sap.ui.define([
    "./BasePanel",
    "sap/m/Label",
    "sap/m/ColumnListItem",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/ui/core/Icon",
    "sap/m/Text",
    "sap/m/Column",
    "sap/m/Table",
    "sap/m/library"
], function(BasePanel, Label, ColumnListItem, HBox, VBox, Icon, Text, Column, Table, mLibrary) {
	"use strict";

    // shortcut for sap.m.ListKeyboardMode
    var ListKeyboardMode = mLibrary.ListKeyboardMode;

    // shortcut for sap.m.FlexJustifyContent
	var FlexJustifyContent = mLibrary.FlexJustifyContent;

    // shortcut for sap.m.ListType
    var ListType = mLibrary.ListType;

    /**
	 * Constructor for a new ListView
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class
	 * @extends sap.ui.mdc.p13n.panels.BasePanel
	 * @author SAP SE
	 * @constructor The ListView is a list based view to personalize selection and ordering of a Control aggregation.
	 * @private
	 * @experimental
	 * @since 1.85
	 * @alias sap.ui.mdc.p13n.panels.ListView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ListView = BasePanel.extend("sap.ui.mdc.p13n.panels.ListView", {
		metadata: {
            library: "sap.ui.mdc",
            properties: {
                /**
				 * Determines whether the reordering of items should be enabled
				 */
				enableReorder: {
					type: "boolean",
					defaultValue: true
                }
            }
        },
		renderer: {}
    });

    ListView.prototype.applySettings = function(){
        BasePanel.prototype.applySettings.apply(this, arguments);
        this.addStyleClass("sapUiMDCListView");

        this._aInitializedFields = [];

        this._bShowFactory = false;
        this.displayColumns();

        this.setTemplate(this._getListTemplate());
    };

    ListView.prototype._getListTemplate = function() {
        return new ColumnListItem({
            selected: "{" + this.P13N_MODEL + ">visible}",
            visible: "{" + this.P13N_MODEL + ">visibleInDialog}",
            type: ListType.Active,
            cells: [
                new VBox({
                    items: [
                        new Label({
                            wrapping: true,
                            required: "{" + this.P13N_MODEL + ">required}",
                            tooltip: "{" + this.P13N_MODEL + ">tooltip}",
                            text: "{" + this.P13N_MODEL + ">label}"
                        })
                    ]
                }),
                new HBox({
                    justifyContent: FlexJustifyContent.Center,
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
    };

    ListView.prototype.setEnableReorder = function(bEnableReorder) {
        var oListViewTemplate = this.getTemplate();

        if (bEnableReorder) {
            oListViewTemplate.addEventDelegate({
                onmouseover: this._hoverHandler.bind(this),
                onfocusin: this._focusHandler.bind(this)
            });
        } else {
            oListViewTemplate = this._getListTemplate();
        }

        this._setMoveButtonVisibility(true);
        this.setTemplate(oListViewTemplate);

        this.setProperty("enableReorder", bEnableReorder);

        return this;
    };

    ListView.prototype._focusHandler = function(oEvt) {
        //(new) hovered item
        var oHoveredItem = sap.ui.getCore().byId(oEvt.currentTarget.id);
        this._handleActivated(oHoveredItem);
    };

    ListView.prototype._hoverHandler = function(oEvt) {
        //Only use hover if no item has been selected yet (only for hovering)
        if (this._oSelectedItem && !this._oSelectedItem.bIsDestroyed) {
            return;
        }

        //(new) hovered item
        var oHoveredItem = sap.ui.getCore().byId(oEvt.currentTarget.id);
        this._handleActivated(oHoveredItem);
    };

    ListView.prototype._handleActivated = function(oHoveredItem) {
        //remove move buttons if unselected item is hovered (not covered by updateStarted)
        this.removeMoveButtons();

        //Check if the prior hovered item had a visible icon and renable it if required
        if (this._oHoveredItem && this._oHoveredItem.getBindingContextPath()){
            var bVisible = !!this.getP13nModel().getProperty(this._oHoveredItem.getBindingContextPath()).isFiltered;
            var oOldIcon = this._oHoveredItem.getCells()[1].getItems()[0];
            oOldIcon.setVisible(bVisible);
        }

        //Store (new) hovered item and set its icon to visible: false + add move buttons to it
        var oIcon = oHoveredItem.getCells()[1].getItems()[0];
        oIcon.setVisible(false);
        this._oHoveredItem = oHoveredItem;
        this._updateEnableOfMoveButtons(oHoveredItem, false);
        this._addMoveButtons(oHoveredItem);
    };

    ListView.prototype.removeMoveButtons = function() {
        var oMoveButtonBox = this._getMoveButtonContainer();

        if (oMoveButtonBox){
            oMoveButtonBox.removeItem(this._getMoveTopButton());
            oMoveButtonBox.removeItem(this._getMoveUpButton());
            oMoveButtonBox.removeItem(this._getMoveDownButton());
            oMoveButtonBox.removeItem(this._getMoveBottomButton());
        }

    };

    ListView.prototype._getMoveButtonContainer = function() {
        if (this._oMoveBottomButton &&
            this._oMoveBottomButton.getParent() &&
            this._oMoveBottomButton.getParent().isA("sap.m.FlexBox")
        ){
            return this._oMoveBottomButton.getParent();
        }
    };

    ListView.prototype.showFactory = function(bShow) {

        this._bShowFactory = bShow;
        this.displayColumns();

        if (bShow){
            this.removeStyleClass("listViewHover");
            this._oListControl.setKeyboardMode(ListKeyboardMode.Edit); //--> tab through editable fields (fields shown)
            this._addFactoryControl();
        } else {
            this.addStyleClass("listViewHover");
            this._oListControl.setKeyboardMode(ListKeyboardMode.Navigation); //--> tab through list items (fields hidden)
            this._removeFactoryControl();
        }
    };

    ListView.prototype.setP13nModel = function(oModel) {
        this.setModel(oModel, "$p13n");
        this.setPanelMode(true);
        this._getDragDropConfig().setEnabled(this.getEnableReorder());
    };

    ListView.prototype._removeFactoryControl = function() {

        this._oListControl.getItems().forEach(function(oItem){
            var oFirstCell = oItem.getCells()[0];
            if (oFirstCell.getItems().length > 1){
                oFirstCell.removeItem(oFirstCell.getItems()[1]);
            }
        });
        this.removeStyleClass("sapUiMDCAFLabelMarkingList");

        return this._aInitializedFields;

    };

    ListView.prototype._onItemPressed = function(oEvent){
        var oTableItem = oEvent.getParameter('listItem');

        //Ignore unselected items --> BasePanel move mode only expects selected items
        if (oTableItem.getBindingContext(this.P13N_MODEL).getProperty("visible")){
            BasePanel.prototype._onItemPressed.apply(this, arguments);
            if (this.getEnableReorder()){
                this._handleActivated(oTableItem);
            }
        }
    };

    ListView.prototype._moveSelectedItem = function(){
        this._oSelectedItem = this._getMoveButtonContainer().getParent();
        BasePanel.prototype._moveSelectedItem.apply(this, arguments);
    };

    ListView.prototype._moveTableItem = function(){
        BasePanel.prototype._moveTableItem.apply(this, arguments);
        this._handleActivated(this._oSelectedItem);
    };

	ListView.prototype.getShowFactory = function() {
		return this._bShowFactory;
    };

    ListView.prototype.displayColumns = function() {

        var aColumns = [
            this.getResourceText("p13nDialog.LIST_VIEW_COLUMN")
        ];

        if (!this._bShowFactory) {
            aColumns.push(new Column({
                width: "25%",
                hAlign: "Center",
                vAlign: "Middle",
                header: new Text({
                    text: this.getResourceText("p13nDialog.LIST_VIEW_ACTIVE")
                })
            }));
        }

        this.setPanelColumns(aColumns);
    };

    ListView.prototype._addFactoryControl = function(oList) {

		this._oListControl.getItems().forEach(function(oItem){
            var oContext = oItem.getBindingContext(this.P13N_MODEL);
            var oField = this.getItemFactory().call(this, oContext);
            var oCell = oItem.getCells()[0];
            oCell.addItem(oField);
        }.bind(this));

        this.addStyleClass("sapUiMDCAFLabelMarkingList");
	};

    ListView.prototype._createInnerListControl = function() {
		return new Table(this.getId() + "-innerListViewTable", Object.assign({
            growing: true,
            growingThreshold: 25,
            growingScrollToLoad: true,
            updateStarted: function() {
                this.removeMoveButtons();
                this._removeFactoryControl();
            }.bind(this),
            updateFinished: function() {
                if (this.getShowFactory()) {
                    this._addFactoryControl();
                }
            }.bind(this)
        }, this._getListControlConfig()));
    };

    ListView.prototype.getSelectedFields = function() {
        var aSelectedItems = [];
        this._loopItems(this._oListControl, function(oItem, sKey){
            if (oItem.getSelected()){
                aSelectedItems.push(sKey);
            }
        });

        return aSelectedItems;
    };

    ListView.prototype._loopItems = function(oList, fnItemCallback) {
		oList.getItems().forEach(function(oItem){

			var sPath = oItem.getBindingContextPath();
			var sKey = this.getP13nModel().getProperty(sPath).name;

			fnItemCallback.call(this, oItem, sKey);
		}.bind(this));
	};

    ListView.prototype.filterWithoutDestroy = function(aFilter) {
        if (this._oListControl.getBinding("items")){
            this._oListControl.getBinding("items").filter(aFilter, true);
        }
	};

    ListView.prototype._addMoveButtons = function(oItem) {
        var oTableItem = oItem;
        if (!oTableItem){
            return;
        }

        var bItemSelected = this.getP13nModel().getProperty(oTableItem.getBindingContextPath()).visible;

        if (bItemSelected){
            oTableItem.getCells()[1].addItem(this._getMoveTopButton());
            oTableItem.getCells()[1].addItem(this._getMoveUpButton());
            oTableItem.getCells()[1].addItem(this._getMoveDownButton());
            oTableItem.getCells()[1].addItem(this._getMoveBottomButton());
        }
    };

    ListView.prototype.exit = function() {
        BasePanel.prototype.exit.apply(this, arguments);
        this._aInitializedFields = null;
        this._oHoveredItem = null;
        this._bShowFactory = null;
    };

	return ListView;

});
