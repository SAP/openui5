/*!
 * ${copyright}
 */

sap.ui.define([
	"./SelectionController", "sap/m/p13n/SelectionPanel"
], function (BaseController, SelectionPanel) {
    "use strict";

    const oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
    const ColumnController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ColumnController");

    ColumnController.prototype.getUISettings = function() {
        return {
            title: oResourceBundle.getText("table.SETTINGS_COLUMN"),
            tabText: oResourceBundle.getText("p13nDialog.TAB_Column")
        };
    };

    ColumnController.prototype.model2State = function() {
        const aItems = [];
        this._oPanel.getP13nData(true).forEach(function(oItem){
            if (oItem.visible){
                aItems.push({
                    name: oItem.name
                });
            }
        });
        return aItems;
    };

    ColumnController.prototype.createUI = function(oAdaptationData) {
        const oSelectionPanel = new SelectionPanel({
            showHeader: true,
            enableCount: true,
            title: oResourceBundle.getText("fieldsui.COLUMNS"),
            fieldColumn: oResourceBundle.getText("fieldsui.COLUMNS")
        });
        oSelectionPanel.setEnableReorder(this._bReorderingEnabled);
        return oSelectionPanel.setP13nData(oAdaptationData.items);
    };

    ColumnController.prototype.getChangeOperations = function() {
        return {
            add: "addColumn",
            remove: "removeColumn",
            move: "moveColumn"
        };
    };

	return ColumnController;

});