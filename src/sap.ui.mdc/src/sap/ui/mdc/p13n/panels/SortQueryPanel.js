/*
 * ! ${copyright}
 */
sap.ui.define([
    "./QueryPanel", "sap/m/Text", "sap/m/List", "sap/m/SegmentedButton", "sap/m/SegmentedButtonItem", "sap/m/VBox", "sap/m/library"
], function (QueryPanel, Text, List, SegmentedButton, SegmentedButtonItem, VBox, mLibrary) {
    "use strict";

    // shortcut for sap.m.FlexJustifyContent
	var FlexJustifyContent = mLibrary.FlexJustifyContent;

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
        oRemvoeBtn.addStyleClass("sapUiSmallMarginBegin");
        return oRemvoeBtn;
    };

    SortQueryPanel.prototype._getAdditionalQueryRowContent = function (oItem) {

        //Enhance row with sort specific controls (Segmented Button + sort order text)
        var oSortOrderSwitch = this._createOrderSwitch(oItem.name, oItem.descending);
        var oSortOrderText = this._createSortOrderText(oItem.descending);

        return [oSortOrderSwitch, oSortOrderText];

    };

    SortQueryPanel.prototype._createOrderSwitch = function (sKey, bDesc) {
        var oSortOrderSwitch = new SegmentedButton({
            enabled: sKey ? true : false,
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
                var oText = oEvt.getSource().getParent().getItems()[2].getItems()[0];
                oText.setText(this._getSortOrderText(sSortOrder === "desc"));
                var sKey = oEvt.oSource.getParent().getItems()[0].getSelectedItem().getKey();

                this._changeOrder(sKey, sSortOrder == "desc");
            }.bind(this)
        }).addStyleClass("sapUiSmallMarginEnd");

        oSortOrderSwitch.setSelectedItem(bDesc ? oSortOrderSwitch.getItems()[1] : oSortOrderSwitch.getItems()[0]);

        return oSortOrderSwitch;
    };

    SortQueryPanel.prototype._createSortOrderText = function (bDesc) {
        var oSortOrderText = new VBox({
            width: "40%",
            justifyContent: FlexJustifyContent.Center,
            items: [
                new Text({
                    text: this._getSortOrderText(bDesc)
                })
            ]
        });
        return oSortOrderText;
    };

    SortQueryPanel.prototype._selectKey = function(oEvt) {
        QueryPanel.prototype._selectKey.apply(this, arguments);
        //Enable SegmentedButton
        var oListItem = oEvt.getSource().getParent().getParent();
        var sNewKey = oEvt.getParameter("selectedItem").getKey();
        oListItem.getContent()[0].getItems()[1].setEnabled(sNewKey !== this.NONE_KEY);
    };

    SortQueryPanel.prototype._getSortOrderText = function(bDesc) {
        return bDesc ? this.getResourceText("sort.PERSONALIZATION_DIALOG_OPTION_DESCENDING") : this.getResourceText("sort.PERSONALIZATION_DIALOG_OPTION_ASCENDING");
    };

    SortQueryPanel.prototype._changeOrder = function (sKey, bDesc) {
        var aItems = this.getP13nModel().getProperty("/items").filter(function (oItem) {
            return oItem.name === sKey;
        });

        aItems[0].descending = bDesc;
    };


    return SortQueryPanel;

});
