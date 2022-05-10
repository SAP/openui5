
/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/m/p13n/QueryPanel", "sap/m/VBox", "sap/m/Text", "sap/ui/layout/Grid", "sap/ui/layout/GridData", "sap/m/Button", "sap/m/ComboBox", "sap/ui/core/library"

], function (QueryPanel, VBox, Text, Grid, GridData, Button, ComboBox, coreLibrary) {
    "use strict";

    var ValueState = coreLibrary.ValueState;

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

        var aContent = [oSelect];
        if (oItem.name) {
            aContent.push(this._createFactoryControl(oItem));
        }
        return new Grid({
            containerQuery: true,
            defaultSpan: "XL4 L4 M4 S4",
            content: aContent
        }).addStyleClass("sapUiTinyMargin");
    };

    FilterPanel.prototype._getPlaceholderText = function () {
        return this._getResourceText("p13n.FILTER_PLACEHOLDER");
	};

	FilterPanel.prototype._getRemoveButtonTooltipText = function () {
		return this._getResourceText("p13n.FILTER_REMOVEICONTOOLTIP");
	};

	FilterPanel.prototype._createKeySelect = function (sKey) {

        var oComboBox = new ComboBox({
			width: "100%",
			items: this._getAvailableItems(),
			placeholder: this._getPlaceholderText(),
			selectionChange: function(oEvt) {
                var oComboBox = oEvt.getSource();
                this._selectKey(oComboBox);
            }.bind(this),
            change: function(oEvt) {
				var oComboBox = oEvt.getSource();
				var newValue = oEvt.getParameter("newValue");
				oComboBox.setValueState( newValue && !oComboBox.getSelectedItem() ? ValueState.Error : ValueState.None);
				this._selectKey();
			}.bind(this)
		});


        return oComboBox;
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

    FilterPanel.prototype._selectKey = function(oComboBox) {
        var oQueryRowGrid, sKey;
        if (oComboBox) {
            this._oComboBox = oComboBox;
            oQueryRowGrid = oComboBox.getParent();
            sKey = oComboBox.getSelectedKey();
        } else if (this._oComboBox) {
            oComboBox = this._oComboBox;
            oQueryRowGrid = oComboBox.getParent();
            sKey = oComboBox.getSelectedKey();

            if (sKey) {
                QueryPanel.prototype._selectKey.call(this, oComboBox);

                var sText = sKey ? oComboBox.getSelectedItem().getText() : "";

                var oSelect = oQueryRowGrid.getContent()[0];
                oQueryRowGrid.removeContent(oSelect);

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
            delete this._oComboBox;
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
