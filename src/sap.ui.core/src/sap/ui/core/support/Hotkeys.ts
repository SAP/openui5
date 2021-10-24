import Log from "sap/base/Log";
export class oHotkeys {
    static init(getModuleSystemInfo: any, oCfgData: any) {
        var bLeftAlt = false;
        document.addEventListener("keydown", function (e) {
            try {
                if (e.keyCode === 18) {
                    bLeftAlt = (typeof e.location !== "number" || e.location === 1);
                    return;
                }
                if (e.shiftKey && e.altKey && e.ctrlKey && bLeftAlt) {
                    if (e.keyCode === 80) {
                        e.preventDefault();
                        sap.ui.require(["sap/ui/core/support/techinfo/TechnicalInfo"], function (TechnicalInfo) {
                            TechnicalInfo.open(function () {
                                var oInfo = getModuleSystemInfo();
                                return { modules: oInfo.modules, prefixes: oInfo.prefixes, config: oCfgData };
                            });
                        }, function (oError) {
                            Log.error("Could not load module 'sap/ui/core/support/techinfo/TechnicalInfo':", oError);
                        });
                    }
                    else if (e.keyCode === 83) {
                        e.preventDefault();
                        sap.ui.require(["sap/ui/core/support/Support"], function (Support) {
                            var oSupport = Support.getStub();
                            if (oSupport.getType() != Support.StubType.APPLICATION) {
                                return;
                            }
                            oSupport.openSupportTool();
                        }, function (oError) {
                            Log.error("Could not load module 'sap/ui/core/support/Support':", oError);
                        });
                    }
                }
            }
            catch (err) {
            }
        });
    }
}