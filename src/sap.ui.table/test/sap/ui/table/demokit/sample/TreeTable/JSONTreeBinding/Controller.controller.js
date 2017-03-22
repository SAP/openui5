sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
    "use strict";

    return Controller.extend("sap.ui.table.sample.TreeTable.JSONTreeBinding.Controller", {

        onInit : function () {
            var oModel = new JSONModel("test-resources/sap/ui/table/demokit/sample/TreeTable/JSONTreeBinding/Clothing.json");

            this.getView().setModel(oModel);
        },

        onCollapseAll: function () {
            var oTreeTable = this.getView().byId("TreeTableBasic");
            oTreeTable.collapseAll();
        },

        onExpandFirstLevel: function () {
            var oTreeTable = this.getView().byId("TreeTableBasic");
            oTreeTable.expandToLevel(1);
        }
    });

});

