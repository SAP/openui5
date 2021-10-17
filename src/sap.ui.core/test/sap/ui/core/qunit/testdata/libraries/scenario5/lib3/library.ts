import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
sap.ui.getCore().initLibrary({
    name: "testlibs.scenario5.lib3",
    dependencies: [
        "testlibs.scenario5.lib6"
    ],
    noLibraryCSS: true
});