import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
sap.ui.getCore().initLibrary({
    name: "testlibs.scenario2.lib2",
    dependencies: [
        "testlibs.scenario2.lib4",
        "testlibs.scenario2.lib1",
        "testlibs.scenario2.lib7"
    ],
    noLibraryCSS: true
});