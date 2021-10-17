import Component from "sap/ui/core/Component";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import UriParameters from "sap/base/util/UriParameters";
var oUriParameters = UriParameters.fromQuery(window.location.search);
if (!oUriParameters.get("sap-ui-language")) {
    sap.ui.getCore().getConfiguration().setLanguage("de");
}
var sManifestParam = oUriParameters.get("manifest");
var sManifest = sManifestParam ? sManifestParam + "/manifest.appdescr" : true;
Component.create({
    name: "sap.ui.demo.terminologies",
    manifest: sManifest
}).then(function (oComponent) {
    var oContainer = new ComponentContainer({
        component: oComponent
    });
    oContainer.placeAt("content");
});