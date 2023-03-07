//@ui5-bundle testlibs/scenario17/lib2/library-preload.js
sap.ui.predefine("testlibs/scenario17/lib2/library", ["sap/ui/core/Core","testlibs/scenario17/lib1/library", "testlibs/scenario17/lib3/library"],function(e,i){"use strict"; return e.initLibrary({name:"testlibs.scenario17.lib2",version:"1.0.0",dependencies:["sap.ui.core","testlibs.scenario17.lib1", "testlibs.scenario17.lib3"],noLibraryCSS:true,controls:[]});});
sap.ui.require.preload({
	"testlibs/scenario17/lib2/manifest.json":'{"_version":"1.45.0","sap.app":{"id":"testlibs.scenario17.lib2","type":"library"},"sap.ui5":{"dependencies":{"libs":{"sap.ui.core":{},"testlibs.scenario17.lib1":{}, "testlibs.scenario17.lib3":{}}},"library":{"i18n":{"bundleUrl":"i18n/i18n.properties","supportedLocales":["en"],"fallbackLocale":"en"}}}}'
});
