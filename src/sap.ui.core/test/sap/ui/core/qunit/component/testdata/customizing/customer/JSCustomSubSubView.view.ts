import TextView from "sap/ui/commons/TextView";
import JSView from "sap/ui/core/mvc/JSView";
sap.ui.jsview("testdata.customizing.customer.JSCustomSubSubView", {
    createContent: function (oController) {
        return [new TextView({ text: "I am the customer replacement" }), sap.ui.extensionpoint(this, "extension44")];
    }
});