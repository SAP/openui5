import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
sap.ui.getCore().initLibrary({
    name: "testlibs.scenario14.lib1",
    dependencies: [
        "testlibs.scenario14.lib2",
        "testlibs.scenario14.lib5"
    ],
    noLibraryCSS: true
});