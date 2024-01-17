//@ui5-bundle testlibs/customBundle/custom-bundle.js
sap.ui.predefine("testlibs/customBundle/lib1/library", ["sap/ui/core/Lib","testlibs/customBundle/lib2/library", "testlibs/customBundle/lib4/library"],function(e,i){"use strict"; return e.init({name:"testlibs.customBundle.lib1",version:"1.0.0",dependencies:["sap.ui.core","testlibs.customBundle.lib2", "testlibs.customBundle.lib4"],noLibraryCSS:true,controls:[]});});
sap.ui.require.preload({
	"testlibs/customBundle/lib1/manifest.json":'{"_version":"1.45.0","sap.app":{"id":"testlibs.customBundle.lib1","type":"library"},"sap.ui5":{"dependencies":{"libs":{"sap.ui.core":{},"testlibs.customBundle.lib2":{}, "testlibs.customBundle.lib4":{}}},"library":{"i18n":{"bundleUrl":"i18n/i18n.properties","supportedLocales":["en"],"fallbackLocale":"en"}}}}'
});
sap.ui.predefine("testlibs/customBundle/lib4/library", ["sap/ui/core/Lib","testlibs/customBundle/lib1/library"],function(e,i){"use strict"; return e.init({name:"testlibs.customBundle.lib4",version:"1.0.0",dependencies:["sap.ui.core","testlibs.customBundle.lib1"],noLibraryCSS:true,controls:[]});});
sap.ui.require.preload({
	"testlibs/customBundle/lib4/manifest.json":'{"_version":"1.45.0","sap.app":{"id":"testlibs.customBundle.lib4","type":"library"},"sap.ui5":{"dependencies":{"libs":{"sap.ui.core":{},"testlibs.customBundle.lib1":{}}},"library":{"i18n":{"bundleUrl":"i18n/i18n.properties","supportedLocales":["en"],"fallbackLocale":"en"}}}}'
});
