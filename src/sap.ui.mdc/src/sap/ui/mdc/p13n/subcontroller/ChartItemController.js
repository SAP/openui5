/*
 * ! ${copyright}
 */

sap.ui.define([
	"./BaseController"
], function (BaseController) {
    "use strict";

    var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

    var ChartItemController = BaseController.extend("sap.ui.mdc.p13n.subcontroller.ChartItemController");

    ChartItemController.prototype.getAdaptationUI = function() {
        return "sap/ui/mdc/p13n/panels/ChartItemPanel";
    };

    ChartItemController.prototype.getDelta = function(mPropertyBag) {
        mPropertyBag.deltaAttributes.push("role");
        return BaseController.prototype.getDelta.apply(this, arguments);
    };

    ChartItemController.prototype.getContainerSettings = function() {
        return {
            title: oResourceBundle.getText("chart.PERSONALIZATION_DIALOG_TITLE")
        };
    };

    ChartItemController.prototype.getChangeOperations = function() {
        return {
            add: "addItem",
            remove: "removeItem",
            move: "moveItem"
        };
    };

	return ChartItemController;

});