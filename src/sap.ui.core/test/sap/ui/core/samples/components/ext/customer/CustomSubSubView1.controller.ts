import Log from "sap/base/Log";
sap.ui.controller("samples.components.ext.customer.CustomSubSubView1", {
    onInit: function () {
        Log.info("CustomSubSubView1 Controller onInit()");
    },
    formatNumber: function (iNumber) {
        return "[ext" + iNumber + "]";
    }
});