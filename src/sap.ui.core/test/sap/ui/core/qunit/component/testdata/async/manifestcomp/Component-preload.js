//@ui5-bundle sap/test/manifestcomp/Component-preload.js
/*eslint-disable*/
sap.ui.predefine("sap/test/manifestcomp/Component",['sap/ui/core/Component'],function(Component){"use strict";var ManifestComponent=Component.extend("sap.test.manifestcomp.Component",{metadata:{manifest:"json"}});return ManifestComponent;});
sap.ui.require.preload({
    "sap/test/manifestcomp/manifest.json": "{\"_version\": \"2.0.2\",\"sap.app\":{\"applicationVersion\":{\"version\":\"1.0.0\"},\"id\":\"sap.test.manifestcomp\",\"title\":\"Application 'manifestcomp'\",\"type\":\"application\"},\"sap.ui\":{\"deviceTypes\":{\"desktop\":true,\"phone\":true,\"tablet\":true},\"technology\":\"UI5\"},\"sap.ui5\":{\"dependencies\":{\"components\":{\"sap.test.mycomp\":{},\"sap.test.mysubcomp\":{\"lazy\":true}},\"libs\":{\"sap.test.lib2\":{},\"sap.test.lib3\":{\"lazy\":true},\"sap.test.lib4\":{\"lazy\":false}}}}}"
});
