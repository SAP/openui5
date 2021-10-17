import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import VersionInfo from "sap/ui/VersionInfo";
import DataType from "sap/ui/base/DataType";
import Element from "sap/ui/core/Element";
import Control from "sap/ui/core/Control";
import Item from "sap/ui/core/Item";
import CommonsTextField from "sap/ui/commons/TextField";
import MobileText from "sap/m/Text";
import includeStylesheet from "sap/ui/dom/includeStylesheet";
import require from "require";
var aKnownLibraries = [
    "sap.chart",
    "sap.f",
    "sap.m",
    "sap.makit",
    "sap.me",
    "sap.ndc",
    "sap.suite.ui.microchart",
    "sap.tnt",
    "sap.ui.codeeditor",
    "sap.ui.commons",
    "sap.ui.comp",
    "sap.ui.core",
    "sap.ui.documentation",
    "sap.ui.dt",
    "sap.ui.export",
    "sap.ui.fl",
    "sap.ui.integration",
    "sap.ui.layout",
    "sap.ui.mdc",
    "sap.ui.richtexteditor",
    "sap.ui.rta",
    "sap.ui.suite",
    "sap.ui.support",
    "sap.ui.table",
    "sap.ui.testrecorder",
    "sap.ui.unified",
    "sap.ui.ux3",
    "sap.uiext.inbox",
    "sap.uxap",
    "sap.viz"
];
var CONTROLS_NOT_USABLE_STANDALONE = [
    "sap.ui.commons.SearchField.CB",
    "sap.ui.commons.SearchFieldCB",
    "sap.ui.commons.Accordion",
    "sap.ui.core.ComponentContainer",
    "sap.ui.core.XMLComposite",
    "sap.ui.core.UIComponent",
    "sap.ui.core.mvc.HTMLView",
    "sap.ui.core.mvc.JSONView",
    "sap.ui.core.mvc.JSView",
    "sap.ui.core.mvc.XMLView",
    "sap.ui.core.mvc.TemplateView",
    "sap.ui.core.mvc.View",
    "sap.ui.core.tmpl.Template",
    "sap.m.DateTimeInput",
    "sap.m.FacetFilterItem",
    "sap.m.IconTabBarSelectList",
    "sap.m.LightBox",
    "sap.m.NotificationListGroup",
    "sap.m.NotificationListItem",
    "sap.m.internal.NumericInput",
    "sap.m.QuickViewPage",
    "sap.m.PlanningCalendar",
    "sap.f.PlanningCalendarInCard",
    "sap.m.SelectionDetailsListItem",
    "sap.m.TimePickerSlider",
    "sap.m.TimePickerSliders",
    "sap.m.Wizard",
    "sap.tnt.NavigationList",
    "sap.ui.layout.BlockLayoutRow",
    "sap.ui.layout.form.ResponsiveGridLayoutPanel",
    "sap.ui.layout.form.ResponsiveLayoutPanel",
    "sap.ui.suite.TaskCircle",
    "sap.ui.unified.calendar.TimesRow",
    "sap.ui.unified.CalendarTimeInterval",
    "sap.ui.unified.CalendarRow",
    "sap.ui.ux3.ActionBar",
    "sap.ui.ux3.ExactList.LB",
    "sap.ui.ux3.NotificationBar",
    "sap.ui.ux3.NotificationBar.NotifierView",
    "sap.ui.rta.ContextMenu",
    "sap.ui.rta.AddElementsDialog",
    "sap.ui.comp.navpopover.SmartLink",
    "sap.ui.comp.navpopover.SemanticObjectController",
    "sap.ui.comp.valuehelpdialog.ValueHelpDialog",
    "sap.ui.mdc.Chart",
    "sap.chart.Chart",
    "sap.makit.Chart",
    "sap.makit.CombinationChart",
    "sap.me.OverlapCalendar",
    "sap.me.TabContainer",
    "sap.suite.ui.microchart.InteractiveBarChart",
    "sap.suite.ui.microchart.InteractiveDonutChart",
    "sap.uxap.AnchorBar",
    "sap.uxap.BlockBase",
    "sap.uxap.BreadCrumbs",
    "sap.uxap.ObjectPageHeader",
    "sap.uxap.ObjectPageSection",
    "sap.uxap.ObjectPageSubSection",
    "sap.uiext.inbox.SubstitutionRulesManager",
    "sap.uiext.inbox.composite.InboxTaskTitleControl",
    "sap.uiext.inbox.InboxFormattedTextView",
    "sap.uiext.inbox.InboxToggleTextView",
    "sap.uiext.inbox.InboxTaskDetails",
    "sap.viz.ui5.controls.common.BaseControl",
    "sap.viz.ui5.controls.VizRangeSlider",
    "sap.viz.ui5.core.BaseChart",
    "sap.viz.ui5.VizContainer"
];
var CONTROL_PROPERTIES_TO_BE_IGNORED = {
    "sap.m.PlanningCalendar": [
        "viewKey"
    ],
    "sap.m.SinglePlanningCalendarGrid": [
        "startDate"
    ],
    "sap.m.SinglePlanningCalendarMonthGrid": [
        "startDate"
    ],
    "sap.ui.mdc.MultiValueField": [
        "dataType"
    ]
};
var iAllControls = 0, iFullyTestedControls = 0, iTestedWithoutRenderingControls = 0, aFailuresWhenFillingAggregations = [], iSuccessfullyFilledAggregations = 0, aFailuresWhenFillingProperties = [], iSuccessfullyFilledProperties = 0;
function loadClass(sClassName) {
    return new Promise(function (resolve) {
        var sModuleName = sClassName.replace(/\./g, "/");
        sap.ui.require([sModuleName], function (FNClass) {
            if (!FNClass) {
                FNClass = ObjectPath.get(sClassName);
                if (FNClass) {
                    Log.error("Module '" + sModuleName + "' exports control class only via global name");
                }
            }
            resolve(FNClass);
        }, function (err) {
            resolve(undefined);
        });
    });
}
function loadAllAvailableLibraries() {
    var mLoadedLibraries = sap.ui.getCore().getLoadedLibraries();
    return VersionInfo.load().then(function (oInfo) {
        return Promise.all(oInfo.libraries.map(function (oLibInfo) {
            var sInfoLibName = oLibInfo.name;
            if (!aKnownLibraries.includes(sInfoLibName)) {
                return;
            }
            if (!mLoadedLibraries[sInfoLibName]) {
                Log.info("Library '" + sInfoLibName + "' is not loaded! Trying...");
                return sap.ui.getCore().loadLibrary(sInfoLibName, { async: true }).then(function (oLibrary) {
                    mLoadedLibraries[sInfoLibName] = oLibrary.controls;
                    Log.info("Library '" + sInfoLibName + "...successfully.");
                }, function (err) {
                });
            }
            else {
                mLoadedLibraries[sInfoLibName] = mLoadedLibraries[sInfoLibName].controls;
            }
        }));
    }).then(function () {
        return mLoadedLibraries;
    });
}
function fillControlProperties(oControl) {
    var mProperties = oControl.getMetadata().getAllProperties(), sControlName = oControl.getMetadata().getName();
    for (var sPropertyName in mProperties) {
        var oProperty = mProperties[sPropertyName];
        try {
            if (!shouldIgnoreProperty(sControlName, sPropertyName)) {
                var vValueToSet = "text";
                oControl[oProperty._sMutator](vValueToSet);
                iSuccessfullyFilledProperties++;
            }
        }
        catch (e) {
            aFailuresWhenFillingProperties.push(oProperty.type + " (" + sControlName + "." + sPropertyName + ")");
        }
    }
    oControl.setTooltip("test");
}
function shouldIgnoreProperty(sControlName, sPropertyName) {
    return (Array.isArray(CONTROL_PROPERTIES_TO_BE_IGNORED[sControlName]) && CONTROL_PROPERTIES_TO_BE_IGNORED[sControlName].includes(sPropertyName));
}
function fillControlAggregations(oControl, assert) {
    var mAggregations = oControl.getMetadata().getAggregations();
    return Promise.all(Object.values(mAggregations).map(function (oAggregation) {
        return createAndAddAggregatedElement(oControl, oAggregation, assert).then(function (oAddedElement) {
            if (oAddedElement) {
                iSuccessfullyFilledAggregations++;
            }
            else {
                aFailuresWhenFillingAggregations.push(oAggregation.type);
            }
        }, function (e) {
            aFailuresWhenFillingAggregations.push(oAggregation.type);
        });
    }));
}
function createAndAddAggregatedElement(oControl, oAggregation, assert) {
    var sAggregationType = oAggregation.type;
    if (DataType.isInterfaceType(sAggregationType)) {
        if (sAggregationType === "sap.ui.core.Toolbar") {
            sAggregationType = "sap.m.Bar";
        }
        else {
            return Promise.resolve(undefined);
        }
    }
    return loadClass(sAggregationType).then(function (FNClass) {
        var oElement;
        if (!FNClass) {
            assert.ok(false, "No class of type " + sAggregationType + " for aggregation '" + oAggregation.name + "' of " + oControl + " could be loaded. Does this class exist? Is it properly implemented?");
            return;
        }
        if (FNClass === Control) {
            if (oControl.isA("sap.ui.commons.InPlaceEdit") && oAggregation.name === "content") {
                oElement = new CommonsTextField();
            }
            else {
                oElement = new MobileText();
            }
        }
        else if (FNClass === Element) {
            oElement = new Item();
        }
        else if (FNClass.getMetadata().isAbstract()) {
            return;
        }
        else {
            oElement = new FNClass();
        }
        if (oElement) {
            oControl[oAggregation._sMutator](oElement);
        }
        return oElement;
    });
}
function shouldIgnoreControl(sControlName, assert) {
    if (CONTROLS_NOT_USABLE_STANDALONE.indexOf(sControlName) > -1) {
        assert.ok(true, "WARNING: " + sControlName + " cannot be tested and has therefore been EXCLUDED.");
        return true;
    }
    if ([
        "sap.uiext.inbox.InboxLaunchPad"
    ].indexOf(sControlName) > -1) {
        assert.ok(true, "WARNING: " + sControlName + " is known to have an issue with duplicate IDs and is ignored until it is fixed.");
        return true;
    }
}
function shouldIgnoreLibrary(sLibName) {
    return !aKnownLibraries.includes(sLibName);
}
function checkControl(oControlClass, assert) {
    var sControlName = oControlClass.getMetadata().getName();
    assert.ok(true, sControlName);
    var sId = sControlName.replace(/\./g, "_"), oControl1 = new oControlClass(sId + "_1"), oControl2 = new oControlClass(sId + "_2"), bCanRender = false;
    if (oControl1.placeAt) {
        try {
            oControl1.getMetadata().getRenderer();
            bCanRender = true;
        }
        catch (e) {
        }
    }
    return Promise.all([
        fillControlProperties(oControl1),
        fillControlAggregations(oControl1, assert),
        fillControlProperties(oControl2),
        fillControlAggregations(oControl2, assert)
    ]).then(function () {
        if (bCanRender) {
            oControl1.placeAt("qunit-fixture");
            oControl2.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();
            oControl1.rerender();
            oControl2.rerender();
            sap.ui.getCore().applyChanges();
            iFullyTestedControls++;
            assert.ok(true, sControlName + " can be instantiated multiple times without duplicate ID errors.");
        }
        else {
            iTestedWithoutRenderingControls++;
            assert.ok(true, "WARNING: " + sControlName + " cannot be rendered");
        }
        oControl1.destroy();
        oControl2.destroy();
        sap.ui.getCore().applyChanges();
    });
}
QUnit.module("Duplicate ID issues in Controls", {
    afterEach: function () {
        Element.registry.forEach(function (oElement, sId) {
            oElement.destroy();
        });
    }
});