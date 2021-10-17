import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
sap.ui.getCore().initLibrary({
    name: "testlibs.scenario3.lib1",
    dependencies: [
        "testlibs.scenario3.lib2"
    ],
    noLibraryCSS: true
});