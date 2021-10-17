import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
sap.ui.getCore().initLibrary({
    name: "testlibs.scenario4.lib2",
    dependencies: [
        "testlibs.scenario4.lib1"
    ],
    noLibraryCSS: true
});