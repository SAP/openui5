import oCore from "sap/ui/core/Core";
import VersionInfo from "sap/ui/VersionInfo";
export class ControlIterator {
    static aKnownOpenUI5Libraries = [
        "sap.f",
        "sap.m",
        "sap.tnt",
        "sap.ui.codeeditor",
        "sap.ui.commons",
        "sap.ui.core",
        "sap.ui.documentation",
        "sap.ui.dt",
        "sap.ui.fl",
        "sap.ui.integration",
        "sap.ui.layout",
        "sap.ui.rta",
        "sap.ui.suite",
        "sap.ui.support",
        "sap.ui.table",
        "sap.ui.unified",
        "sap.ui.ux3",
        "sap.uxap"
    ];
    static aKnownRuntimeLayerLibraries = ControlIterator.aKnownOpenUI5Libraries.concat([
        "sap.chart",
        "sap.makit",
        "sap.me",
        "sap.ndc",
        "sap.suite.ui.microchart",
        "sap.ui.comp",
        "sap.ui.generic.app",
        "sap.ui.generic.template",
        "sap.ui.mdc",
        "sap.ui.richtexteditor",
        "sap.viz"
    ]);
    static isKnownRuntimeLayerLibrary(sLibName: any) {
        return ControlIterator.aKnownRuntimeLayerLibraries.indexOf(sLibName) > -1;
    }
    static loadLibraries(vLibraries: any) {
        if (vLibraries === "openui5") {
            vLibraries = ControlIterator.aKnownOpenUI5Libraries;
        }
        else if (vLibraries === "sapui5.runtime") {
            vLibraries = ControlIterator.aKnownRuntimeLayerLibraries;
        }
        var fnFilter;
        if (Array.isArray(vLibraries)) {
            fnFilter = makeLibraryFilter(vLibraries);
        }
        else if (typeof vLibraries === "function") {
            fnFilter = vLibraries;
        }
        else if (vLibraries == null) {
            fnFilter = alwaysTrue;
        }
        else {
            throw new TypeError("unexpected filter " + vLibraries);
        }
        return getAllLibraries(fnFilter);
    }
    static run(fnCallback: any, mOptions: any) {
        window.setTimeout(function () {
            _run(fnCallback, mOptions);
        }, 1);
    }
}
var aControlsThatCannotBeRenderedGenerically = [
    "sap.chart.Chart",
    "sap.m.ColumnHeaderPopover",
    "sap.m.FacetFilterItem",
    "sap.m.internal.NumericInput",
    "sap.m.IconTabBarSelectList",
    "sap.m.LightBox",
    "sap.m.Menu",
    "sap.m.NotificationListBase",
    "sap.m.NotificationListItem",
    "sap.m.QuickViewBase",
    "sap.m.QuickViewGroup",
    "sap.m.QuickViewGroupElement",
    "sap.m.TabStripItem",
    "sap.m.TimePickerSlider",
    "sap.m.TimePickerSliders",
    "sap.m.UploadCollectionToolbarPlaceholder",
    "sap.m.Wizard",
    "sap.makit.Chart",
    "sap.me.TabContainer",
    "sap.suite.ui.microchart.InteractiveBarChart",
    "sap.suite.ui.microchart.InteractiveDonutChart",
    "sap.tnt.NavigationList",
    "sap.ui.comp.smartform.Group",
    "sap.ui.comp.smartform.GroupElement",
    "sap.ui.comp.valuehelpdialog.ValueHelpDialog",
    "sap.ui.core.mvc.HTMLView",
    "sap.ui.core.mvc.JSONView",
    "sap.ui.core.mvc.JSView",
    "sap.ui.core.mvc.TemplateView",
    "sap.ui.core.mvc.View",
    "sap.ui.core.mvc.XMLView",
    "sap.ui.core.tmpl.Template",
    "sap.ui.core.UIComponent",
    "sap.ui.core.util.Export",
    "sap.ui.documentation.BorrowedList",
    "sap.ui.documentation.LightTable",
    "sap.ui.integration.cards.AnalyticalContent",
    "sap.ui.integration.cards.AnalyticsCloudContent",
    "sap.ui.integration.cards.CalendarContent",
    "sap.ui.layout.BlockLayoutRow",
    "sap.ui.layout.form.ResponsiveGridLayoutPanel",
    "sap.ui.layout.form.ResponsiveLayoutPanel",
    "sap.ui.mdc.chart.ChartTypeButton",
    "sap.ui.richtexteditor.RichTextEditor",
    "sap.ui.richtexteditor.ToolbarWrapper",
    "sap.ui.rta.AddElementsDialog",
    "sap.ui.rta.ContextMenu",
    "sap.ui.suite.TaskCircle",
    "sap.ui.table.ColumnMenu",
    "sap.ui.unified.Menu",
    "sap.ui.ux3.ActionBar",
    "sap.ui.ux3.ExactList.LB",
    "sap.ui.ux3.NotificationBar",
    "sap.uiext.inbox.composite.InboxTaskTitleControl",
    "sap.uiext.inbox.InboxFormattedTextView",
    "sap.uiext.inbox.InboxTaskDetails",
    "sap.uiext.inbox.InboxToggleTextView",
    "sap.uiext.inbox.SubstitutionRulesManager",
    "sap.uxap.AnchorBar",
    "sap.uxap.BlockBase",
    "sap.uxap.BreadCrumbs",
    "sap.uxap.ObjectPageHeader",
    "sap.uxap.ObjectPageSubSection",
    "sap.viz.ui5.controls.common.BaseControl",
    "sap.viz.ui5.controls.VizRangeSlider",
    "sap.viz.ui5.controls.VizTooltip",
    "sap.viz.ui5.core.BaseChart"
];
function controlCanBeRendered(sControlName, fnControlClass) {
    if (!controlCanBeInstantiated(sControlName, fnControlClass)) {
        return false;
    }
    if (aControlsThatCannotBeRenderedGenerically.indexOf(sControlName) > -1) {
        return false;
    }
    return true;
}
var aControlsThatCannotBeInstantiated = [
    "sap.makit.Chart",
    "sap.ui.commons.SearchField",
    "sap.ui.commons.SearchField.CB",
    "sap.ui.commons.SearchFieldCB",
    "sap.ui.commons.Tab",
    "sap.ui.comp.transport.TransportDialog",
    "sap.ui.core.ComponentContainer",
    "sap.ui.core.mvc.HTMLView",
    "sap.ui.core.mvc.JSONView",
    "sap.ui.core.mvc.JSView",
    "sap.ui.core.mvc.TemplateView",
    "sap.ui.core.mvc.View",
    "sap.ui.core.mvc.XMLView",
    "sap.ui.core.XMLComposite",
    "sap.ui.mdc.BaseControl",
    "sap.ui.mdc.odata.v4.microchart.MicroChart",
    "sap.ui.mdc.ValueHelpDialog",
    "sap.ui.mdc.XMLComposite",
    "sap.ui.rta.AddElementsDialog",
    "sap.ui.rta.ContextMenu"
];
function controlCanBeInstantiated(sControlName, fnControlClass) {
    if (aControlsThatCannotBeInstantiated.indexOf(sControlName) > -1) {
        return false;
    }
    if (!fnControlClass) {
        return false;
    }
    var oMetadata = fnControlClass.getMetadata();
    if (oMetadata.isAbstract()) {
        return false;
    }
    return true;
}
function nop() {
}
function alwaysTrue() {
    return true;
}
function alwaysFalse() {
    return false;
}
function toName(oLibrary) {
    return oLibrary.name;
}
function getAllLibraries(fnFilter) {
    fnFilter = fnFilter || alwaysTrue;
    return VersionInfo.load().then(function (oInfo) {
        return oInfo.libraries.map(toName).filter(fnFilter);
    }).then(function (aLibraries) {
        return Promise.all(aLibraries.map(function (sLibName) {
            return oCore.loadLibrary(sLibName, { async: true }).catch(nop);
        }));
    }).then(function () {
        var mLibraries = oCore.getLoadedLibraries();
        for (var sLibName in mLibraries) {
            if (!fnFilter(sLibName)) {
                delete mLibraries[sLibName];
            }
        }
        return mLibraries;
    });
}
function loadControlClass(sClassName) {
    var sModuleName = sClassName.replace(/\./g, "/");
    return new Promise(function (resolve, reject) {
        sap.ui.require([sModuleName], function (FNClass) {
            resolve(FNClass);
        }, function (oErr) {
            reject(new Error("failed to load class " + sModuleName + ":" + oErr));
        });
    });
}
function makeLibraryFilter(aLibrariesToTest, aExcludedLibraries, bIncludeDistLayer) {
    if (aLibrariesToTest) {
        return function (sLibName) {
            return aLibrariesToTest.indexOf(sLibName) >= 0;
        };
    }
    else if (bIncludeDistLayer) {
        return function (sLibName) {
            return aExcludedLibraries.indexOf(sLibName) < 0;
        };
    }
    return function (sLibName) {
        return aExcludedLibraries.indexOf(sLibName) < 0 && (bIncludeDistLayer || ControlIterator.isKnownRuntimeLayerLibrary(sLibName));
    };
}
function checkLibraries(mLibraries, QUnit) {
    QUnit.test("Should load at least one library and some controls", function (assert) {
        assert.expect(2);
        var bLibFound = false;
        for (var sLibName in mLibraries) {
            if (mLibraries[sLibName]) {
                if (!bLibFound) {
                    assert.ok(mLibraries[sLibName], "Should have loaded at least one library");
                    bLibFound = true;
                }
                var iControls = mLibraries[sLibName].controls ? mLibraries[sLibName].controls.length : 0;
                if (iControls > 0) {
                    assert.ok(iControls > 0, "Should find at least 10 controls in a library");
                    break;
                }
            }
        }
    });
}
var shouldTestControl = function (sControlName, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable) {
    if (!sControlName || aControlsToTest.length && aControlsToTest.indexOf(sControlName) < 0 || aExcludedControls.indexOf(sControlName) >= 0) {
        return Promise.resolve(false);
    }
    return loadControlClass(sControlName).then(function (FNControlClass) {
        var oInfo = {
            name: sControlName,
            "class": FNControlClass,
            canBeInstantiated: controlCanBeInstantiated(sControlName, FNControlClass),
            canBeRendered: controlCanBeRendered(sControlName, FNControlClass)
        };
        if (!bIncludeNonInstantiable && !oInfo.canBeInstantiated) {
            return false;
        }
        if (!bIncludeNonRenderable && !oInfo.canBeRendered) {
            return false;
        }
        return oInfo;
    }, alwaysFalse);
};
var loopControlsInLibrary = function (aControls, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
    return new Promise(function (resolve, reject) {
        var iControlCountInLib = 0;
        var loop = function (i) {
            if (i < aControls.length) {
                var sControlName = aControls[i];
                handleControl(sControlName, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function (bCountThisControl) {
                    if (bCountThisControl) {
                        iControlCountInLib++;
                    }
                    loop(i + 1);
                });
            }
            else {
                resolve(iControlCountInLib);
            }
        };
        loop(0);
    });
};
function handleControl(sControlName, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
    return shouldTestControl(sControlName, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable).then(function (oControlInfo) {
        if (oControlInfo) {
            fnCallback(sControlName, oControlInfo.class, {
                canInstantiate: oControlInfo.canBeInstantiated,
                canRender: oControlInfo.canBeRendered
            });
        }
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(!!oControlInfo);
            }, 0);
        });
    });
}
function _run(fnCallback, mOptions) {
    if (!mOptions) {
        mOptions = {};
    }
    var fnDone = mOptions.done || nop;
    var aLibrariesToTest = mOptions.librariesToTest || undefined;
    var aExcludedLibraries = mOptions.excludedLibraries || [];
    var aControlsToTest = mOptions.controlsToTest || [];
    var aExcludedControls = mOptions.excludedControls || [];
    var bIncludeDistLayer = (mOptions.includeDistLayer !== undefined) ? mOptions.includeDistLayer : false;
    var bIncludeElements = (mOptions.includeElements !== undefined) ? mOptions.includeElements : false;
    var bIncludeNonRenderable = (mOptions.includeNonRenderable !== undefined) ? mOptions.includeNonRenderable : true;
    var bIncludeNonInstantiable = (mOptions.includeNonInstantiable !== undefined) ? mOptions.includeNonInstantiable : false;
    var QUnit = mOptions.qunit;
    if (QUnit) {
        QUnit.test("Checking the given QUnit object", function (assert) {
            assert.ok(true, "The given QUnit should be able to assert");
        });
    }
    else {
        var assert = {
            ok: function (bCondition, sText) {
                if (!bCondition) {
                    throw new Error(sText);
                }
            },
            expect: nop
        };
        QUnit = {
            module: nop,
            test: function (text, fnCallback) {
                fnCallback(assert);
            }
        };
    }
    QUnit.test("Checking the given options", function (assert) {
        assert.ok(mOptions.librariesToTest === undefined || Array.isArray(mOptions.librariesToTest), "The given librariesToTest must be undefined or an array, but is: " + mOptions.librariesToTest);
        assert.ok(mOptions.excludedLibraries === undefined || Array.isArray(mOptions.excludedLibraries), "The given excludedLibraries must be undefined or an array, but is: " + mOptions.excludedLibraries);
        assert.ok(mOptions.excludedControls === undefined || Array.isArray(mOptions.excludedControls), "The given excludedControls must be undefined or an array, but is: " + mOptions.excludedControls);
        assert.ok(mOptions.includeDistLayer === undefined || typeof mOptions.includeDistLayer === "boolean", "The given includeDistLayer must be undefined or a boolean, but is: " + mOptions.includeDistLayer);
        assert.ok(mOptions.includeElements === undefined || typeof mOptions.includeElements === "boolean", "The given includeElements must be undefined or a boolean, but is: " + mOptions.includeElements);
        assert.ok(mOptions.includeNonRenderable === undefined || typeof mOptions.includeNonRenderable === "boolean", "The given includeNonRenderable must be undefined or a boolean, but is: " + mOptions.includeNonRenderable);
        assert.ok(mOptions.includeNonInstantiable === undefined || typeof mOptions.includeNonInstantiable === "boolean", "The given includeNonInstantiable must be undefined or a boolean, but is: " + mOptions.includeNonInstantiable);
        assert.ok(fnDone === undefined || typeof fnDone === "function", "The given done callback must be undefined or a function, but is: " + fnDone);
    });
    var fnFilter = makeLibraryFilter(aLibrariesToTest, aExcludedLibraries, bIncludeDistLayer);
    return getAllLibraries(fnFilter).then(function (mLibraries) {
        checkLibraries(mLibraries, QUnit);
        return mLibraries;
    }).then(function (mLibraries) {
        return loopLibraries(mLibraries, bIncludeElements, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function (aResults) {
            fnDone({
                testedControlCount: aResults[0],
                testedLibraryCount: aResults[1]
            });
        });
    });
}
function loopLibraries(mLibraries, bIncludeElements, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
    return new Promise(function (resolve) {
        var aLibraryNames = Object.keys(mLibraries), iControlCount = 0, iLibCount = 0;
        var loop = function (i) {
            if (i < aLibraryNames.length) {
                var sLibName = aLibraryNames[i];
                handleLibrary(mLibraries, sLibName, bIncludeElements, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function (aResult) {
                    iControlCount += aResult[0];
                    if (aResult[1]) {
                        iLibCount++;
                    }
                    loop(i + 1);
                });
            }
            else {
                resolve([iControlCount, iLibCount]);
            }
        };
        loop(0);
    });
}
function handleLibrary(mLibraries, sLibName, bIncludeElements, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback) {
    return new Promise(function (resolve) {
        var oLibrary = mLibraries[sLibName];
        if (!oLibrary) {
            resolve([0, false]);
            return;
        }
        var aControls = oLibrary.controls;
        if (bIncludeElements) {
            aControls = aControls.concat(oLibrary.elements.slice());
        }
        loopControlsInLibrary(aControls, aControlsToTest, aExcludedControls, bIncludeNonRenderable, bIncludeNonInstantiable, fnCallback).then(function (iAnalyzedControls) {
            resolve([iAnalyzedControls, true]);
        });
    });
}