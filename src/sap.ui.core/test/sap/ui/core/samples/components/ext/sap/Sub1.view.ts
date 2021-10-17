import TextView from "sap/ui/commons/TextView";
import JSView from "sap/ui/core/mvc/JSView";
sap.ui.jsview("samples.components.ext.sap.Sub1", {
    createContent: function (oController) {
        return new TextView({ text: "I am the SAP original view and should be replaced" });
    }
});