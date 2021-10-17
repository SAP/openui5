import Log from "sap/base/Log";
Log.info("executing library-using-AMD from separate file");
sap.ui.getCore().initLibrary({
    name: "fixture.async-sync-conflict.library-using-AMD",
    types: [
        "fixture.async-sync-conflict.library-using-AMD.subpackage.MyEnum"
    ]
});
var thisLib = fixture["async-sync-conflict"]["library-using-AMD"];
thisLib.subpackage.MyEnum = {
    Value1: "Value1",
    Value2: "Value2"
};