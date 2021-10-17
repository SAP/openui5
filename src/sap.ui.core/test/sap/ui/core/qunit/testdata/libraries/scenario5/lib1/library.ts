import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
sap.ui.getCore().initLibrary({
    name: "testlibs.scenario5.lib1",
    dependencies: [
        "testlibs.scenario5.lib3",
        "testlibs.scenario5.lib4",
        "testlibs.scenario5.lib5"
    ],
    noLibraryCSS: true
});