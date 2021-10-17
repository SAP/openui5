import Core from "sap/ui/core/Core";
import coreLib from "sap/ui/core/library";
import HalfTheTruth from "testlibs/myGlobalLib/types/HalfTheTruth";
var thisLib = sap.ui.getCore().initLibrary({
    name: "testlibs.myGlobalLib",
    types: [
        "testlibs.myGlobalLib.types.HalfTheTruth"
    ],
    noLibraryCSS: true
});