import jQuery from "jquery.sap.global";
import Support from "sap/ui/core/support/Support";
QUnit.test("Load Support module and check App plugins", function (assert) {
    var mLibs = sap.ui.getCore().getLoadedLibraries(), aPluginModuleNames = [];
    for (var n in mLibs) {
        var oLib = mLibs[n], aLibPlugins = [];
        if (oLib.extensions && oLib.extensions["sap.ui.support"] && oLib.extensions["sap.ui.support"].diagnosticPlugins) {
            aLibPlugins = oLib.extensions["sap.ui.support"].diagnosticPlugins;
        }
        if (aLibPlugins && Array.isArray(aLibPlugins)) {
            for (var i = 0; i < aLibPlugins.length; i++) {
                if (typeof aLibPlugins[i] === "string" && aPluginModuleNames.indexOf(aLibPlugins[i]) === -1) {
                    aPluginModuleNames.push(aLibPlugins[i]);
                }
            }
        }
    }
    var oSupport = Support.getStub();
    assert.equal(oSupport.getType(), Support.StubType.APPLICATION, "Support stub type equals APPLICATION");
    return Support.initPlugins(oSupport, false).then(function () {
        var aPlugins = Support.getAppPlugins();
        for (var i = 0; i < aPlugins.length; i++) {
            assert.equal(aPlugins[i].isActive(), true, "Plugin '" + aPlugins[i].getMetadata().getName() + "' successfully loaded");
        }
    }).then(function () {
        Support.exitPlugins(oSupport, false);
        var aPlugins = Support.getAppPlugins();
        for (var i = 0; i < aPlugins.length; i++) {
            assert.equal(aPlugins[i].isActive(), false, "Plugin '" + aPlugins[i].getMetadata().getName() + "' successfully unloaded");
        }
    });
});