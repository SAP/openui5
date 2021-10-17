import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
sap.ui.getCore().initLibrary({
    name: "testlibs.scenario1.lib1",
    dependencies: [
        "testlibs.scenario1.lib3",
        "testlibs.scenario1.lib4",
        "testlibs.scenario1.lib5"
    ],
    noLibraryCSS: true
});