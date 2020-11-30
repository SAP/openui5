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
], function(BasePanel, Label, ColumnListItem, HBox, VBox, Icon, Text, Column, Table, mlibrary) {
	"use strict";

    var ListKeyboardMode = mlibrary.ListKeyboardMode;

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

        this._aInitializedFields = [];

        var oListViewTemplate = new ColumnListItem({
            selected: "{" + this.P13N_MODEL + ">selected}",
            type: "Active",
            cells: [
                new VBox({
                    items: [
                        new Label({
                            wrapping: true,
                            tooltip: "{" + this.P13N_MODEL + ">tooltip}",
                            text: "{" + this.P13N_MODEL + ">label}"
                        })
                    ]
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

        this.setShowFactory(false);
        this.displayColumns();

        var that = this;

        if (this.getEnableReorder()) {
            oListViewTemplate.attachBrowserEvent("mouseenter", function(oEvt){
                var oIcon = this.getCells()[1].getItems()[0];
                oIcon.setVisible(false);
                that._oSelectedItem = this;
                that._updateEnableOfMoveButtons(this, false);
                that._addMoveButtons(this);
            });

            oListViewTemplate.attachBrowserEvent("mouseleave", function(oEvt){
                var bVisible = !!that.getP13nModel().getProperty(this.getBindingContextPath()).isFiltered;
                var oIcon = this.getCells()[1].getItems()[0];
                if (that._oSelectedItem) {
                    that.removeMoveButtons();
                }
                oIcon.setVisible(bVisible);
            });
            this._setMoveButtonVisibility(true);
        }

        this.setTemplate(oListViewTemplate);

    };

    ListView.prototype.removeMoveButtons = function() {
        if ((!this._oSelectedItem) || (!this._oSelectedItem.getCells()[1])){
            return;
        }
        this._oSelectedItem.getCells()[1].removeItem(this._getMoveTopButton());
        this._oSelectedItem.getCells()[1].removeItem(this._getMoveUpButton());
        this._oSelectedItem.getCells()[1].removeItem(this._getMoveDownButton());
        this._oSelectedItem.getCells()[1].removeItem(this._getMoveBottomButton());
    };

    ListView.prototype.showFactory = function(bShow) {

        this.displayColumns();

        if (bShow){
            this._addFactoryControl();
        } else {
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

    ListView.prototype._onItemPressed = function(){
        BasePanel.prototype._onItemPressed.apply(this, arguments);
        this._addMoveButtons();
    };

    ListView.prototype._moveTableItem = function(){
        this.removeMoveButtons();
        BasePanel.prototype._moveTableItem.apply(this, arguments);
    };

	ListView.prototype.getShowFactory = function() {
		return this._bShowFactory;
    };

    ListView.prototype.setShowFactory = function(bShow) {
		this._bShowFactory = bShow;
	};

    ListView.prototype.displayColumns = function() {

        var aColumns = [
            this.getResourceText("p13nDialog.LIST_VIEW_COLUMN")
        ];

        if (!this.getShowFactory()) {
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
            keyboardMode: ListKeyboardMode.Edit, //default for ACC --> tab through editable fields
            growing: true,
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
        this._oListControl.getBinding("items").filter(aFilter, true);
	};

    ListView.prototype._addMoveButtons = function() {
        var oTableItem = this._oSelectedItem;
        if (!oTableItem){
            return;
        }

        var bItemSelected = this.getP13nModel().getProperty(oTableItem.getBindingContextPath()).selected;

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
        this._bShowFactory = null;
    };

	return ListView;

});
