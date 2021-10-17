import Log from "sap/base/Log";
import each from "sap/base/util/each";
import ControlIterator from "sap/ui/qunit/utils/ControlIterator";
import DataType from "sap/ui/base/DataType";
import oCore from "sap/ui/core/Core";
import Text from "sap/m/Text";
sap.ui.loader.config({
    map: {
        "*": {
            "sap/ui/thirdparty/require": "test-resources/sap/ui/core/qunit/generic/helper/_emptyModule"
        }
    }
});
function noop() { }
var NO_CREATE = 1;
var NOT_A_MODULE = 2;
var NO_DESTROY = { failsOnDestroy: true };
var mLibraryConstraints = {
    "sap.ui.core": {
        elements: {
            "sap.ui.core.XMLComposite": NO_CREATE,
            "sap.ui.core.mvc.HTMLView": NO_CREATE,
            "sap.ui.core.mvc.JSONView": NO_CREATE,
            "sap.ui.core.mvc.JSView": NO_CREATE,
            "sap.ui.core.mvc.TemplateView": NO_CREATE,
            "sap.ui.core.mvc.View": NO_CREATE,
            "sap.ui.core.mvc.XMLView": NO_CREATE,
            "sap.ui.core.mvc.XMLAfterRenderingNotifier": NOT_A_MODULE,
            "sap.ui.core._StashedControl": NOT_A_MODULE
        }
    },
    "sap.m": {
        elements: {
            "sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover": NOT_A_MODULE,
            "sap.m.internal.NumericInput": NOT_A_MODULE,
            "sap.m.TablePopin": NOT_A_MODULE,
            "sap.m.PlanningCalendarHeader": { exclude: ["actions"] },
            "sap.m.SinglePlanningCalendar": NO_DESTROY
        }
    },
    "sap.uxap": {
        elements: {
            "sap.uxap.BlockBase": NO_CREATE
        }
    },
    "sap.ui.fl": {
        elements: {
            "sap.ui.fl.util.ManagedObjectModel": { exclude: ["data", "name", "object"] }
        }
    },
    "sap.ui.unified": {
        elements: {
            "sap.ui.unified._ColorPickerBox": NOT_A_MODULE
        }
    },
    "sap.chart": {
        "sap.chart.Chart": { exclude: ["data"] }
    },
    "sap.me": {
        elements: {
            "sap.me.OverlapCalendar": { exclude: ["startDate"] }
        }
    },
    "sap.suite.ui.microchart": {
        elements: {
            "sap.suite.ui.microchart.StackedBarMicroChartBar": { exclude: ["value"] }
        }
    },
    "sap.ui.comp": {
        elements: {
            "sap.ui.comp.smartmicrochart.SmartMicroChart": { exclude: ["chartType"] },
            "sap.ui.comp.smartvariants.SmartVariantManagementAdapter": { exclude: ["selectionPresentationVariants"] }
        }
    },
    "sap.ui.export": {
        elements: {}
    },
    "sap.ui.mdc": {
        elements: {
            "sap.ui.mdc.XMLComposite": NO_CREATE,
            "sap.ui.mdc.base.filterbar.FilterBar": { exclude: ["setMetadataDelegate"] },
            "sap.ui.mdc.Table": { exclude: ["content", "rowAction"], failsOnDestroy: true },
            "sap.ui.mdc.TableOld": NO_CREATE,
            "sap.ui.mdc.odata.v4.microchart.MicroChart": NO_CREATE
        }
    },
    "sap.viz": {
        elements: {
            "sap.viz.ui5.data.FlattenedDataset": { exclude: ["data"] },
            "sap.viz.ui5.controls.VizFrame": { exclude: ["legendVisible"] }
        }
    },
    "sap.uiext.inbox": {},
    "sap.service.visualization": {},
    "sap.makit": {},
    "sap.ui.composite": {},
    "sap.ui.dev": {},
    "sap.ui.dev2": {},
    "sap.suite.ui.commons": {
        elements: {}
    },
    "sap.apf": {},
    "sap.ca.scfld.md": {},
    "sap.ca.ui": {},
    "sap.collaboration": {},
    "sap.gantt": {},
    "sap.gantt.config": {},
    "sap.landvisz": {},
    "sap.ovp": {},
    "sap.portal.ui5": {},
    "sap.rules.ui": {},
    "sap.suite.ui.generic.template": {},
    "sap.ui.vbm": {},
    "sap.ui.vtm": {},
    "sap.ui.vk": {},
    "sap.fiori": {},
    "sap.ushell": {},
    "sap.diagram": {},
    "sap.zen.crosstab": {},
    "sap.zen.dsh": {},
    "sap.zen.commons": {},
    "sap.fe": {},
    "sap.fileviewer": {}
};
function loadClass(sClassName) {
    var sModuleName = sClassName.replace(/\./g, "/");
    return new Promise(function (resolve, reject) {
        sap.ui.require([sModuleName], function (FNClass) {
            resolve(FNClass);
        }, function (oErr) {
            reject(new Error("failed to load class " + sModuleName + ":" + oErr));
        });
    });
}
var mTestedAbstractClasses = Object.create(null);
function hasUntestedAbstractBaseClass(oClass, assert) {
    var oMetadata = oClass.getMetadata();
    while (oMetadata) {
        if (oMetadata.isAbstract() && !mTestedAbstractClasses[oMetadata.getName()]) {
            mTestedAbstractClasses[oMetadata.getName()] = oClass.getMetadata().getName();
            assert.ok(true, "forcing all methods to be tested to cover methods of " + oMetadata.getName());
            return true;
        }
        oMetadata = oMetadata.getParent();
    }
    return false;
}
function createAggregatedElement(sAggregationType) {
    if (sAggregationType === "sap.ui.core.Control") {
        return new Text();
    }
    else if (DataType.isInterfaceType(sAggregationType)) {
        return null;
    }
    return loadClass(sAggregationType).then(function (fnAggregatedClass) {
        return new fnAggregatedClass();
    }, function () {
        return null;
    });
}
function assertAllSettersForClass(oClass, assert, oClassConstraints) {
    var oMetadata = oClass.getMetadata(), sClassName = oMetadata.getName(), oControl;
    if (oMetadata.isAbstract()) {
        assert.ok(true, "Abstract class '" + sClassName + "' skipped");
        return;
    }
    var aExcludedSettings = oClassConstraints && Array.isArray(oClassConstraints.exclude) ? oClassConstraints.exclude : [];
    var bForceTest4AllMethods = hasUntestedAbstractBaseClass(oClass, assert);
    try {
        oControl = new oClass();
    }
    catch (e) {
        assert.ok(false, "Failed to instantiate a '" + sClassName + "' with default settings: " + (e.message || e));
        return;
    }
    var pChain = Promise.resolve();
    var iOwnSettings = 0;
    function hasOwnMethod(obj, name) {
        return Object.prototype.hasOwnProperty.call(obj, name) || Object.prototype.hasOwnProperty.call(oClass.prototype, name) || bForceTest4AllMethods;
    }
    function checkOwnMethod(sMethodName, args, sArgs) {
        if (hasOwnMethod(oControl, sMethodName)) {
            iOwnSettings++;
            try {
                assert.ok(oControl[sMethodName].apply(oControl, args) === oControl, sMethodName + "(" + sArgs + ")" + " should always return <this>");
            }
            catch (e) {
                assert.ok(true, sMethodName + "(" + sArgs + ")" + " shouldn't throw an exception");
            }
        }
    }
    each(oMetadata.getAllProperties(), function (sPropertyName, oProperty) {
        if (aExcludedSettings.indexOf(sPropertyName) >= 0) {
            assert.ok(true, "ignore property '" + sPropertyName + "'");
            return;
        }
        if (hasOwnMethod(oControl, oProperty._sMutator)) {
            iOwnSettings++;
            var oValue = oProperty.get(oControl);
            try {
                assert.ok(oControl === oProperty.set(oControl, oValue), oProperty._sMutator + "(...) should always return <this>");
            }
            catch (e) {
                var sName = oProperty.name;
                var bDateInName = sName.indexOf("Date", sName.length - 4) !== -1 || sName.substring(0, 4) === "date";
                if ((sName === "date" || bDateInName) && oProperty.type === "object") {
                    assert.ok(oControl === oProperty.set(oControl, new Date()), oProperty._sMutator + "({js date}) should always return <this>");
                }
                else {
                    assert.ok(false, oProperty._sMutator + "(" + oValue + ") fails when called " + "with value received from get with exception: " + e);
                }
            }
        }
    });
    each(oMetadata.getAllAggregations(), function (sAggregationName, oAggregation) {
        if (aExcludedSettings.indexOf(sAggregationName) >= 0) {
            assert.ok(true, "ignore aggregation '" + sAggregationName + "'");
            return;
        }
        pChain = pChain.then(function () {
            return createAggregatedElement(oAggregation.type);
        }).then(function (oElement) {
            checkOwnMethod(oAggregation._sMutator, [null], "null");
            if (oElement) {
                checkOwnMethod(oAggregation._sMutator, [oElement], "elem");
            }
            if (oAggregation.multiple) {
                checkOwnMethod(oAggregation._sInsertMutator, [null], "null");
                if (oElement) {
                    checkOwnMethod(oAggregation._sInsertMutator, [oElement], "elem");
                }
            }
            checkOwnMethod(oAggregation._sDestructor, [], "");
            if (oElement && !oElement.bIsDestroyed) {
                try {
                    oElement.destroy();
                }
                catch (e) {
                }
            }
        });
    });
    each(oMetadata.getAllAssociations(), function (sAssociationName, oAssociation) {
        if (aExcludedSettings.indexOf(sAssociationName) >= 0) {
            assert.ok(true, "ignore aggregation '" + sAssociationName + "'");
            return;
        }
        checkOwnMethod(oAssociation._sMutator, [null], "null");
        checkOwnMethod(oAssociation._sMutator, ["dummy"], "ref");
    });
    each(oMetadata.getAllEvents(), function (sEventName, oEvent) {
        if (aExcludedSettings.indexOf(sEventName) >= 0) {
            assert.ok(true, "ignore aggregation '" + sEventName + "'");
            return;
        }
        checkOwnMethod(oEvent._sMutator, [noop], "listener");
        checkOwnMethod(oEvent._sDetachMutator, [noop], "listener");
    });
    pChain = pChain.then(function () {
        try {
            oControl.destroy();
        }
        catch (e) {
            assert.ok(oClassConstraints && oClassConstraints.failsOnDestroy, "failed to destroy '" + oControl + "'" + (oClassConstraints && oClassConstraints.failsOnDestroy ? " (ignored)" : ""));
        }
        if (iOwnSettings === 0) {
            assert.ok(true, "no own settings");
        }
    });
    return pChain;
}
function isValidLibrary(sLibName) {
    return (!mLibraryConstraints.hasOwnProperty(sLibName) || mLibraryConstraints[sLibName].elements);
}