/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController", "sap/m/p13n/SelectionPanel"
], function (BaseController, SelectionPanel) {
    "use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
    var ColumnController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ColumnController", {
        constructor: function() {
			BaseController.apply(this, arguments);
			this._bResetEnabled = true;
		}
    });

    ColumnController.prototype.getUISettings = function() {
        return {
            title: oResourceBundle.getText("table.SETTINGS_COLUMN"),
            tabText: oResourceBundle.getText("p13nDialog.TAB_Column")
        };
    };

    ColumnController.prototype.model2State = function() {
        var aItems = [];
        this._oPanel.getP13nData(true).forEach(function(oItem){
            if (oItem.visible){
                aItems.push({
                    name: oItem.name
                });
            }
        });
        return aItems;
    };

    ColumnController.prototype.getAdaptationUI = function(oPropertyHelper){

        var oSelectionPanel = new SelectionPanel({
            enableReorder: true,
            showHeader: true,
            enableCount: true,
            fieldColumn: oResourceBundle.getText("fieldsui.COLUMNS")
        });
        var oAdaptationData = this.mixInfoAndState(oPropertyHelper);
        oSelectionPanel.setP13nData(oAdaptationData.items);
        this._oPanel = oSelectionPanel;
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