import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import VersionInfo from "sap/ui/VersionInfo";
import Element from "sap/ui/core/Element";
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
    "sap.ui.core.UIComponent",
    "sap.ui.core.XMLComposite",
    "sap.ui.core.mvc.HTMLView",
    "sap.ui.core.mvc.JSONView",
    "sap.ui.core.mvc.JSView",
    "sap.ui.core.mvc.XMLView",
    "sap.ui.core.mvc.TemplateView",
    "sap.ui.core.mvc.View",
    "sap.ui.core.tmpl.Template",
    "sap.m.internal.NumericInput",
    "sap.m.DateTimeInput",
    "sap.m.FacetFilterItem",
    "sap.m.IconTabBarSelectList",
    "sap.m.LightBox",
    "sap.m.NotificationListItem",
    "sap.m.TimePickerSlider",
    "sap.m.TimePickerSliders",
    "sap.m.Wizard",
    "sap.tnt.NavigationList",
    "sap.ui.layout.BlockLayoutRow",
    "sap.ui.layout.form.ResponsiveGridLayoutPanel",
    "sap.ui.layout.form.ResponsiveLayoutPanel",
    "sap.ui.suite.TaskCircle",
    "sap.ui.ux3.ActionBar",
    "sap.ui.ux3.ExactList.LB",
    "sap.ui.ux3.NotificationBar",
    "sap.ui.rta.ContextMenu",
    "sap.ui.rta.AddElementsDialog",
    "sap.chart.Chart",
    "sap.makit.Chart",
    "sap.me.TabContainer",
    "sap.uxap.AnchorBar",
    "sap.uxap.BlockBase",
    "sap.uxap.BreadCrumbs",
    "sap.uxap.ObjectPageHeader",
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
        "viewKey",
        "builtInViews"
    ],
    "sap.m.SinglePlanningCalendarGrid": [
        "startDate"
    ],
    "sap.m.SinglePlanningCalendarMonthGrid": [
        "startDate"
    ]
};
var iAllControls = 0, iFullyTestedControls = 0, iTestedWithoutRenderingControls = 0;
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
QUnit.assert.equalElementsInControlList = function (mActual, mExpected, sMessage) {
    var aUnexpectedElements = [];
    for (var sId in mActual) {
        if (!mExpected[sId]) {
            aUnexpectedElements.push(mActual[sId]);
        }
    }
    for (var i = 0; i < aUnexpectedElements.length; i++) {
        if (aUnexpectedElements[i].getText) {
            aUnexpectedElements[i] += " (text: '" + aUnexpectedElements[i].getText() + "')";
        }
    }
    this.pushResult({
        result: aUnexpectedElements.length === 0,
        actual: aUnexpectedElements.join(", "),
        expected: "",
        message: sMessage
    });
};
var fillControlProperties = function (oControl) {
    var mProperties = oControl.getMetadata().getAllProperties(), sControlName = oControl.getMetadata().getName();
    for (var sPropertyName in mProperties) {
        var oProperty = mProperties[sPropertyName];
        try {
            if (!shouldIgnoreProperty(sControlName, sPropertyName)) {
                oControl[oProperty._sMutator]("test");
            }
        }
        catch (e) {
        }
    }
    oControl.setTooltip("test");
};
function shouldIgnoreProperty(sControlName, sPropertyName) {
    return (Array.isArray(CONTROL_PROPERTIES_TO_BE_IGNORED[sControlName]) && CONTROL_PROPERTIES_TO_BE_IGNORED[sControlName].includes(sPropertyName));
}
function shouldIgnoreControl(sControlName, assert) {
    if (CONTROLS_NOT_USABLE_STANDALONE.includes(sControlName)) {
        assert.ok(true, "WARNING: " + sControlName + " cannot be tested and has therefore been EXCLUDED.");
        return true;
    }
    if ([
        "sap.ui.mdc.p13n.panels.Wrapper",
        "sap.uiext.inbox.InboxLaunchPad",
        "sap.uiext.inbox.InboxSplitApp",
        "sap.uiext.inbox.composite.InboxAttachmentTile",
        "sap.uiext.inbox.composite.InboxAttachmentsTileContainer",
        "sap.uiext.inbox.composite.InboxUploadAttachmentTile",
        "sap.uiext.inbox.InboxTaskCategoryFilterList",
        "sap.viz.ui5.controls.Popover"
    ].indexOf(sControlName) > -1) {
        assert.ok(true, "WARNING: " + sControlName + " is known to have memory leaks and is ignored until they are fixed.");
        return true;
    }
}
function shouldIgnoreLibrary(sLibName) {
    return !aKnownLibraries.includes(sLibName);
}
function checkControl(oControlClass, assert) {
    var sControlName = oControlClass.getMetadata().getName();
    var oControl1 = new oControlClass(), bCanRender = false;
    if (oControl1.placeAt) {
        try {
            oControl1.getMetadata().getRenderer();
            bCanRender = true;
        }
        catch (e) {
        }
    }
    fillControlProperties(oControl1);
    if (bCanRender) {
        oControl1.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
    }
    else {
    }
    oControl1.destroy();
    sap.ui.getCore().applyChanges();
    var mPreElements = Element.registry.all(), oControl2 = new oControlClass();
    fillControlProperties(oControl2);
    if (bCanRender) {
        oControl2.placeAt("qunit-fixture");
        sap.ui.getCore().applyChanges();
        oControl2.rerender();
        sap.ui.getCore().applyChanges();
        iFullyTestedControls++;
    }
    else {
        iTestedWithoutRenderingControls++;
        assert.ok(true, "WARNING: " + sControlName + " cannot be rendered");
    }
    oControl2.destroy();
    sap.ui.getCore().applyChanges();
    var mPostElements = Element.registry.all();
    assert.equalElementsInControlList(mPostElements, mPreElements, "Memory leak check in " + sControlName);
}
QUnit.module("Memory.Controls", {
    afterEach: function () {
        Element.registry.forEach(function (oElement, sId) {
            oElement.destroy();
        });
    }
});