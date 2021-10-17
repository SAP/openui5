import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
sap.ui.getCore().initLibrary({
    name: "testlibs.scenario15.lib2",
    dependencies: [
        "testlibs.scenario15.lib4",
        "testlibs.scenario15.lib1",
        "testlibs.scenario15.lib7"
    ],
    noLibraryCSS: true
});