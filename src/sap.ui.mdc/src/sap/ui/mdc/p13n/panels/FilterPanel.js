
/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/m/p13n/QueryPanel", "sap/m/VBox", "sap/m/Text", "sap/ui/layout/Grid", "sap/ui/layout/GridData", "sap/m/Button", "sap/m/ComboBox", 'sap/base/util/merge'

], function (QueryPanel, VBox, Text, Grid, GridData, Button, ComboBox, merge) {
    "use strict";

    var FilterPanel = QueryPanel.extend("sap.ui.mdc.p13n.panels.FilterPanel", {
        metadata: {
            properties: {
                itemFactory: {
                    type: "function"
                }
            }
        },
        renderer: {}
    });
    FilterPanel.prototype.PRESENCE_ATTRIBUTE = "active";

    FilterPanel.prototype._createQueryRowGrid = function(oItem) {
        var oSelect = oItem.name ? new VBox({
            items:[
                new Text({
                    text: oItem.label
                }).addStyleClass("sapUiTinyMarginTop").addStyleClass("sapUiTinyMarginBegin")
            ]
        }) : this._createKeySelect(oItem.name);


        var oAddButton;
        if (!oItem.name) {
            oAddButton = new Button({
                text: "Add",
                press: this._addPressed.bind(this),
                enabled: false
            });
            oAddButton.setLayoutData(new GridData({
                indent: "XL7 L7 M7 S7",
                span: "XL1 L1 M1 S1"
            }));
        }

        return new Grid({
            containerQuery: true,
            defaultSpan: "XL4 L4 M4 S4",
            content: [
                oSelect, oItem.name ? this._createFactoryControl(oItem) : oAddButton
            ]
        }).addStyleClass("sapUiTinyMargin");
    };

	FilterPanel.prototype._createKeySelect = function (sKey) {

        var oKeySelect = new ComboBox({
			width: "100%",
			items: this._getAvailableItems(),
			placeholder: "Select Filter",
			selectionChange: this._selectKey.bind(this)
		});

        return oKeySelect;
	};

	FilterPanel.prototype._getAvailableItems = function (sKey) {
        var aItems = QueryPanel.prototype._getAvailableItems.apply(this, arguments);
        aItems.shift();
        return aItems;
	};

    FilterPanel.prototype._createRemoveButton = function (bVisible) {
        var oRemoveBtn = QueryPanel.prototype._createRemoveButton.apply(this, arguments);
        oRemoveBtn.setLayoutData(new GridData({
            span: "XL1 L1 M1 S1"
        }));
        return oRemoveBtn;
    };

    FilterPanel.prototype._addPressed = function(oEvt) {
        this._selectKey();
    };

    FilterPanel.prototype._selectKey = function(oEvt) {
        var oQueryRowGrid, sKey;
        if (oEvt) {
            this._oEvt = merge({}, oEvt);
            oQueryRowGrid = oEvt.oSource.getParent();
            sKey = oEvt.oSource.getSelectedKey();
            oQueryRowGrid.getContent()[1].setEnabled(!!sKey);
        } else if (this._oEvt) {
            oEvt = this._oEvt;
            oQueryRowGrid = oEvt.oSource.getParent();
            sKey = oEvt.oSource.getSelectedKey();

            if (sKey) {
                QueryPanel.prototype._selectKey.call(this, oEvt);

                var sText = sKey ? oEvt.getParameter("selectedItem").getText() : "";

                var oSelect = oQueryRowGrid.getContent()[0];
                oQueryRowGrid.removeContent(oSelect);
                var oAddBtn = oQueryRowGrid.getContent()[0];
                oQueryRowGrid.removeContent(oAddBtn);

                // var sKey = oSelect._key;
                var oFieldBox = new VBox({
                    items:[
                        new Text({
                            text: sText
                        }).addStyleClass("sapUiTinyMarginTop").addStyleClass("sapUiTinyMarginBegin")
                    ]
                });
                oFieldBox._key = sKey;

                oQueryRowGrid.insertContent(oFieldBox,0);
                var oFilterField = this._createFactoryControl({name: sKey});
                oQueryRowGrid.insertContent(oFilterField, 1);
            }
            delete this._oEvt;
        }
    };

    FilterPanel.prototype._createFactoryControl = function(oItem) {
        var oField = this.getItemFactory().call(this, oItem);
        oField.setLayoutData(new GridData({
            span: "XL7 L7 M7 S7"
        }));
        return oField;
	};

    return FilterPanel;
});
