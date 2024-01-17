//@ui5-bundle testlibs/customBundle/lib2/library-preload.js
sap.ui.predefine("testlibs/customBundle/lib2/library", ["sap/ui/core/Lib","testlibs/customBundle/lib1/library", "testlibs/customBundle/lib3/library"],function(e,i){"use strict"; return e.init({name:"testlibs.customBundle.lib2",version:"1.0.0",dependencies:["sap.ui.core","testlibs.customBundle.lib1", "testlibs.customBundle.lib3"],noLibraryCSS:true,controls:[]});});
sap.ui.require.preload({
	"testlibs/customBundle/lib2/manifest.json":'{"_version":"1.45.0","sap.app":{"id":"testlibs.customBundle.lib2","type":"library"},"sap.ui5":{"dependencies":{"libs":{"sap.ui.core":{},"testlibs.customBundle.lib1":{}, "testlibs.customBundle.lib3":{}}},"library":{"i18n":{"bundleUrl":"i18n/i18n.properties","supportedLocales":["en"],"fallbackLocale":"en"}}}}'
});
