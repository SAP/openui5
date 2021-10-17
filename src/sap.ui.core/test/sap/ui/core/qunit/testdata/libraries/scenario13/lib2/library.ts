import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
sap.ui.getCore().initLibrary({
    name: "testlibs.scenario13.lib2",
    dependencies: [
        "testlibs.scenario13.lib4",
        "testlibs.scenario13.lib1",
        "testlibs.scenario13.lib7"
    ],
    noLibraryCSS: true
});