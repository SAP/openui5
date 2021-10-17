import createAndAppendDiv from "sap/ui/qunit/utils/createAndAppendDiv";
import URI from "sap/ui/thirdparty/URI";
var a = [];
var sPath = sap.ui.require.toUrl("testdata/core/");
var link = document.createElement("link");
link.id = "sap-ui-theme-sap.ui.layout";
link.rel = "stylesheet";
link.href = "resources/sap/ui/layout/themes/sap_belize/library.css";
link.setAttribute("data-marker", "42");
document.body.appendChild(link);
var div = createAndAppendDiv("includeStyleSheetTest");
div.className = "sap-jsunitIncludeStyleSheetTest";
div.style.height = div.style.width = "100px";
a.push(jQuery.sap.includeScript({
    url: sPath + "testdata/sapjsunittestvalueincrementor.js",
    id: "jsunitIncludeScriptTestScript",
    promisify: true
}));
a.push(jQuery.sap.includeStyleSheet({
    url: sPath + "testdata/testA.css",
    id: "jsunitIncludeStyleSheetTest",
    promisify: true
}));
function jQueryById(id) {
    return new jQuery(document.getElementById(id));
}