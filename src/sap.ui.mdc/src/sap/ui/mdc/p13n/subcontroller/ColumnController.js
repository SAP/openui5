/*
 * ! ${copyright}
 */

sap.ui.define([
	"./BaseController"
], function (BaseController) {
    "use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
    var ColumnController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ColumnController");

    ColumnController.prototype.getContainerSettings = function() {
        return {
            title: oResourceBundle.getText("table.SETTINGS_COLUMN")
        };
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