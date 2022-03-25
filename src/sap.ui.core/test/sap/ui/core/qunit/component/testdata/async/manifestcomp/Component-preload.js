/*eslint-disable*/
sap.ui.predefine("sap/test/manifestcomp/Component",['jquery.sap.global','sap/ui/core/Component'],function(jQuery,Component){"use strict";var ManifestComponent=Component.extend("sap.test.manifestcomp.Component",{metadata:{manifest:"json"}});return ManifestComponent;});
sap.ui.require.preload({
	"sap/test/manifestcomp/manifest.json": "{\"sap.app\":{\"id\":\"sap.test.manifestcomp\"},\"sap.ui5\":{\"dependencies\":{\"libs\":{\"sap.test.lib2\":{},\"sap.test.lib3\":{\"lazy\":true},\"sap.test.lib4\":{\"lazy\":false}},\"components\":{\"sap.test.mycomp\":{},\"sap.test.mysubcomp\":{\"lazy\":true}}}}}"
});
