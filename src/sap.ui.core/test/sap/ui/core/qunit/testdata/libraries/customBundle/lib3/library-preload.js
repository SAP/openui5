//@ui5-bundle testlibs/customBundle/lib3/library-preload.js
sap.ui.predefine("testlibs/customBundle/lib3/library", ["sap/ui/core/Lib"],function(e,i){"use strict"; return e.init({name:"testlibs.customBundle.lib3",version:"1.0.0",dependencies:["sap.ui.core"],noLibraryCSS:true,controls:[]});});
sap.ui.require.preload({
	"testlibs/customBundle/lib3/manifest.json":'{"_version":"1.45.0","sap.app":{"id":"testlibs.customBundle.lib3","type":"library"},"sap.ui5":{"dependencies":{"libs":{"sap.ui.core":{}}},"library":{"i18n":{"bundleUrl":"i18n/i18n.properties","supportedLocales":["en"],"fallbackLocale":"en"}}}}'
});
