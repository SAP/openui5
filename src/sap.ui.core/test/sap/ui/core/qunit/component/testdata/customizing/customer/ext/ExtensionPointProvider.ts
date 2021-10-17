import Fragment from "sap/ui/core/Fragment";
export class ExtensionPointProvider {
    static applyExtensionPoint(oExtensionPoint: any) {
        return ExtensionPointProvider.doIt(oExtensionPoint, true);
    }
    static doIt(oExtensionPoint: any, bInsert: any) {
        var pLoaded;
        var checkForExtensionPoint = function (aControls) {
            var pNested = [];
            aControls.forEach(function (oControl, i) {
                if (oControl._isExtensionPoint) {
                    pNested.push(ExtensionPointProvider.doIt(oControl).then(function (aNestedControls) {
                        aControls.splice(i, 1);
                        aNestedControls.forEach(function (oNestedControl, j) {
                            aControls.splice(i + j, 0, oNestedControl);
                        });
                        return aControls;
                    }));
                }
            });
            if (pNested.length > 0) {
                return Promise.all(pNested).then(function () {
                    return aControls;
                });
            }
            else {
                return Promise.resolve(aControls);
            }
        };
        var fnInsert = function (aControls) {
            aControls.forEach(function (oControl, i) {
                oExtensionPoint.targetControl.insertAggregation(oExtensionPoint.aggregationName, oControl, oExtensionPoint.index + i);
            });
        };
        if (["EP1", "EP99"].indexOf(oExtensionPoint.name) >= 0) {
            if (oExtensionPoint.name == "EP1") {
                pLoaded = Fragment.load({
                    id: oExtensionPoint.view.createId("customFragment"),
                    name: "testdata.customizing.customer.ext.Custom"
                });
            }
            else if (oExtensionPoint.name == "EP99") {
                pLoaded = Fragment.load({
                    id: oExtensionPoint.view.createId("ep99"),
                    name: "testdata.customizing.customer.ext.EP99"
                });
            }
            pLoaded.then(function (vControls) {
                if (!Array.isArray(vControls)) {
                    vControls = [vControls];
                }
                return checkForExtensionPoint(vControls);
            }).then(function (vControls) {
                if (bInsert) {
                    fnInsert(vControls);
                    oExtensionPoint.ready(vControls);
                }
            });
        }
        else {
            pLoaded = new Promise(function (resolve, reject) {
                var fnProcess = function () {
                    oExtensionPoint.createDefault().then(function (aControls) {
                        return checkForExtensionPoint(aControls);
                    }).then(function (aControls) {
                        if (bInsert) {
                            fnInsert(aControls);
                            oExtensionPoint.ready(aControls);
                        }
                        resolve(aControls);
                    });
                };
                if (oExtensionPoint.name == "EPDelayed") {
                    fnProcess();
                }
                else {
                    fnProcess();
                }
            });
        }
        return pLoaded;
    }
}