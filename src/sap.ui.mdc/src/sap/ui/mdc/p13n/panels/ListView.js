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
    "sap/ui/core/library",
    "sap/m/Text",
    "sap/m/Column",
    "sap/m/Table",
    "sap/m/library",
    "sap/m/ToolbarSpacer",
    "sap/m/Button",
    "sap/m/OverflowToolbar",
    "sap/ui/model/Filter"
], function(BasePanel, Label, ColumnListItem, HBox, VBox, Icon, coreLibrary, Text, Column, Table, mLibrary, ToolbarSpacer, Button, OverflowToolbar, Filter) {
	"use strict";

    // shortcut for sap.m.ListKeyboardMode
    var ListKeyboardMode = mLibrary.ListKeyboardMode;

    // shortcut for sap.m.FlexJustifyContent
	var FlexJustifyContent = mLibrary.FlexJustifyContent;

    // shortcut for sap.m.ListType
    var ListType = mLibrary.ListType;

    // shortcut for sap.ui.core.IconColor;
    var IconColor = coreLibrary.IconColor;

    /**
	 * Constructor for a new ListView
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The ListView is a list based view to personalize selection and ordering of a Control aggregation.
	 * @extends sap.ui.mdc.p13n.panels.BasePanel
	 * @author SAP SE
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
				 * Shows an additional header with a SearchField and 'Show Selected' button
				 */
                showHeader: {
                    type: "boolean",
                    defaultValue: false
                },
				/**
				 * Enables a count for selected items compared to available items as '<fields> (3 / 12)' in addition
				 * for the first provided column text
				 */
				enableCount: {
					type: "boolean",
					defaultValue: false
				}
            }
        },
		renderer: {
			apiVersion: 2
		}
    });

    ListView.prototype.applySettings = function(){
        this.setTemplate(this._getListTemplate());
        BasePanel.prototype.applySettings.apply(this, arguments);
        this.addStyleClass("sapUiMDCListView");

        this._aInitializedFields = [];

        //Do not show the factory by default
        this._bShowFactory = false;
        this.addStyleClass("listViewHover");

        this.displayColumns();
        this.setEnableReorder(true);
    };

    ListView.prototype.setItemFactory = function(fnItemFactory) {
        this.setProperty("itemFactory", fnItemFactory);
        this._oListControl.setGrowing(!!fnItemFactory);
        return this;
    };

    ListView.prototype._getListTemplate = function() {
        return new ColumnListItem({
            selected: "{" + this.P13N_MODEL + ">visible}",
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
                            color: IconColor.Neutral,
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

    ListView.prototype.setShowHeader = function(bShowHeader) {
        if (bShowHeader){
            var sShowSelected = this.getResourceText("p13nDialog.SHOW_SELECTED");
            var sShowAll = this.getResourceText("p13nDialog.SHOW_ALL");
            this._oListControl.setHeaderToolbar(new OverflowToolbar({
				content: [
					this._getSearchField(),
					new ToolbarSpacer(),
                    new Button({
                        press: function(oEvt){
                            this._bShowSelected = oEvt.getSource().getText() == sShowSelected;
                            this._filterList(this._bShowSelected, this._sSearch);
                            oEvt.getSource().setText(this._bShowSelected ? sShowAll : sShowSelected);
                        }.bind(this),
                        text: sShowSelected
                    })
				]
			}));
        }

        this.setProperty("showHeader", bShowHeader);

        return this;
    };

    ListView.prototype._filterList = function(bShowSelected, sSarch) {
        var oSearchFilter = [], oSelectedFilter = [];
        if (bShowSelected) {
            oSelectedFilter = new Filter(this._getPresenceAttribute(), "EQ", true);
        }
        if (sSarch) {
            oSearchFilter = new Filter("label", "Contains", sSarch);
        }
		this._oListControl.getBinding("items").filter(new Filter([].concat(oSelectedFilter, oSearchFilter), true));
	};

    ListView.prototype._onSearchFieldLiveChange = function(oEvent) {
        this._sSearch = oEvent.getSource().getValue();
        this._filterList(this._bShowSelected, this._sSearch);
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

	ListView.prototype._updateCount = function() {
        this.getP13nModel().setProperty("/selectedItems", this._oListControl.getSelectedContexts(true).length);
	};

	ListView.prototype._selectTableItem = function(oTableItem, bSelectAll) {
		BasePanel.prototype._selectTableItem.apply(this, arguments);
		this._updateCount();
	};

    ListView.prototype.setP13nModel = function(oModel) {
        this.setModel(oModel, "$p13n");
		this._updateCount();
        this.setPanelMode(true);
        this._getDragDropConfig().setEnabled(this.getEnableReorder());
    };

    ListView.prototype._removeFactoryControl = function() {
        var aItems = this._oListControl.getItems().filter(function(oItem) {
            return !oItem._bGroupHeader;
        });

        aItems.forEach(function(oItem){
            var oFirstCell = oItem.getCells()[0];
            if (oFirstCell.getItems().length > 1){
                oFirstCell.removeItem(oFirstCell.getItems()[1]);
            }
        });
        this.removeStyleClass("sapUiMDCAFLabelMarkingList");

        return this._aInitializedFields;

    };

    ListView.prototype._moveSelectedItem = function(){
        this._oSelectedItem = this._getMoveButtonContainer().getParent();
        BasePanel.prototype._moveSelectedItem.apply(this, arguments);
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

    ListView.prototype.setPanelColumns = function(aColumns) {
        this._sText = aColumns[0];
		var bEnableCount = this.getEnableCount();

		if (bEnableCount) {
			var oColumn = new Column({
				header: new Text({
					text: {
						parts: [
							{
								path: this.P13N_MODEL + '>/selectedItems'
							}, {
								path: this.P13N_MODEL + '>/items'
							}
						],
						formatter: function(iSelected, aAll) {
							return this._sText + " " + this.getResourceText('p13nDialog.HEADER_COUNT', [
								iSelected, aAll.length
							]);
						}.bind(this)
					}
				})
			});
			aColumns[0] = oColumn;
		}

        BasePanel.prototype.setPanelColumns.apply(this, arguments);
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
            growing: false,
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
        this._sSearch = null;
        this._bShowSelected = null;
    };

	return ListView;

});
