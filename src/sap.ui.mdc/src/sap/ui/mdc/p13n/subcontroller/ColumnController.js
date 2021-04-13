/*
 * ! ${copyright}
 */

sap.ui.define([
	"./BaseController", "sap/ui/mdc/p13n/panels/ListView", "sap/ui/mdc/p13n/panels/SelectionPanel", "sap/m/Column"
], function (BaseController, ListView, SelectionPanel, Column) {
    "use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
    var ColumnController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ColumnController");

    ColumnController.prototype.getContainerSettings = function() {
        return {
            title: oResourceBundle.getText("table.SETTINGS_COLUMN")
        };
    };

    ColumnController.prototype.getResetEnabled = function() {
        return !!this.getAdaptationControl()._bNewP13n;
    };

    ColumnController.prototype.getAdaptationUI = function(oPropertyHelper){

        var oSelectionPanel = this.getAdaptationControl()._bNewP13n ? new ListView({
            enableReorder: true,
            showHeader: true
        }) : new SelectionPanel();

        if (this.getAdaptationControl()._bNewP13n){
            oSelectionPanel.setPanelColumns([oResourceBundle.getText("fieldsui.COLUMNS"), new Column({
                width: "25%",
                hAlign: "Center",
                vAlign: "Middle"
            })]);
        }

        var oAdaptationModel = this._getP13nModel(oPropertyHelper);
        oSelectionPanel.setP13nModel(oAdaptationModel);

        return Promise.resolve(oSelectionPanel);
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