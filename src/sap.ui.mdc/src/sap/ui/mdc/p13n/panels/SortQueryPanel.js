/*
 * ! ${copyright}
 */
sap.ui.define([
    "./QueryPanel", "sap/m/Text", "sap/m/SegmentedButton", "sap/m/SegmentedButtonItem", "sap/ui/layout/Grid", "sap/ui/layout/GridData"
], function (QueryPanel, Text, SegmentedButton, SegmentedButtonItem, Grid, GridData) {
    "use strict";

    /**
     * Constructor for a new SortQueryPanel. The SortQueryPanel can be used
     * to personalize sorters for a control by using a sort specific QueryPanel
     * implementation. The SortQueryPanel will enhance the QueryPanel by
     * adding a toggle to switch between ascending and desceding sortorder by also
     * displaying this configuration in form of a text control.
     *
     * @class
     * @extends sap.ui.mdc.p13n.panels.QueryPanel
     *
     * @author SAP SE
     * @version ${version}
     *
     * @private
     * @ui5-restricted sap.ui.mdc
     * @experimental
     * @since 1.90
     * @alias sap.ui.mdc.p13n.panels.SortQueryPanel
     */
    var SortQueryPanel = QueryPanel.extend("sap.ui.mdc.p13n.panels.SortQueryPanel", {
        renderer: {}
    });


    SortQueryPanel.prototype._createRemoveButton = function () {
        var oRemvoeBtn = QueryPanel.prototype._createRemoveButton.apply(this, arguments);
        oRemvoeBtn.setLayoutData(new GridData({
            span: "XL3 L3 M3 S4"//on "S" the Asc/Desc text is invisible, we need to increase the size the
        }));
        return oRemvoeBtn;
    };

    SortQueryPanel.prototype._createOrderSwitch = function (sKey, bDesc) {
        var oSortOrderSwitch = new SegmentedButton({
            enabled: sKey ? true : false,
            layoutData: new GridData({
                span: "XL2 L2 M2 S4" //on "S" the Asc/Desc text is invisible, we need to increase the size then
            }),
            items: [
                new SegmentedButtonItem({
                    key: "asc",
                    icon: "sap-icon://sort-ascending"
                }),
                new SegmentedButtonItem({
                    key: "desc",
                    icon: "sap-icon://sort-descending"
                })
            ],
            select: function (oEvt) {
                var sSortOrder = oEvt.getParameter("key");
                var oText = oEvt.getSource().getParent().getContent()[2];
                oText.setText(this._getSortOrderText(sSortOrder === "desc"));
                var sKey = oEvt.oSource.getParent().getContent()[0].getSelectedItem().getKey();

                this._changeOrder(sKey, sSortOrder == "desc");
            }.bind(this)
        });

        oSortOrderSwitch.setSelectedItem(bDesc ? oSortOrderSwitch.getItems()[1] : oSortOrderSwitch.getItems()[0]);

        return oSortOrderSwitch;
    };

    SortQueryPanel.prototype._createSortOrderText = function (bDesc) {
        return new Text({
            layoutData: new GridData({
                span: "XL3 L3 M3 S3",
                visibleS: false
            }),
            text: this._getSortOrderText(bDesc)
        }).addStyleClass("sapUiTinyMarginTop");
    };

    SortQueryPanel.prototype._createQueryRowGrid = function(oItem) {
        //Enhance row with sort specific controls (Segmented Button + sort order text)
        var oSelect = this._createKeySelect(oItem.name);
        var oSortOrderSwitch = this._createOrderSwitch(oItem.name, oItem.descending);
        var oSortOrderText = this._createSortOrderText(oItem.descending);

        return new Grid({
            containerQuery: true,
            defaultSpan: "XL4 L4 M4 S4",
            content: [
                oSelect,
                oSortOrderSwitch,
                oSortOrderText
            ]
        }).addStyleClass("sapUiTinyMargin");
    };

    SortQueryPanel.prototype._selectKey = function(oEvt) {
        QueryPanel.prototype._selectKey.apply(this, arguments);
        //Enable SegmentedButton
        var oListItem = oEvt.getSource().getParent().getParent();
        var sNewKey = oEvt.getParameter("selectedItem").getKey();
        oListItem.getContent()[0].getContent()[1].setEnabled(sNewKey !== this.NONE_KEY);
    };

    SortQueryPanel.prototype._getSortOrderText = function(bDesc) {
        return bDesc ? this.getResourceText("sort.PERSONALIZATION_DIALOG_OPTION_DESCENDING") : this.getResourceText("sort.PERSONALIZATION_DIALOG_OPTION_ASCENDING");
    };

    SortQueryPanel.prototype._changeOrder = function (sKey, bDesc) {
        var aItems = this.getP13nModel().getProperty("/items").filter(function (oItem) {
            return oItem.name === sKey;
        });

        aItems[0].descending = bDesc;

        this.fireChange({
            reason: "change",
            item: aItems[0]
        });
    };

    return SortQueryPanel;

});
