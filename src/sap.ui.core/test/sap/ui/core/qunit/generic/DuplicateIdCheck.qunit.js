/*
 * The approach of this test is to generically identify all available libraries and control.
 * and then instantiate, render and destroy two instances of every single control. Controls
 * that forget prefixing the ID of child controls they create will cause a duplicate ID error.
 */

/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/ui/base/DataType",
	"sap/ui/core/Element",
	"sap/ui/core/Control",
	"sap/ui/core/Item",
	"sap/ui/commons/TextField",
	"sap/m/Text",
	"./helper/_cleanupStyles"
], function (Log, ObjectPath, DataType, Element, Control, Item, CommonsTextField, MobileText) {
	"use strict";

	var iAllControls = 0,
		iFullyTestedControls = 0,
		iTestedWithoutRenderingControls = 0,
		aFailuresWhenFillingAggregations = [],
		iSuccessfullyFilledAggregations = 0,
		aFailuresWhenFillingProperties = [],
		iSuccessfullyFilledProperties = 0;


	function loadClass(sClassName) {
		var sModuleName = sClassName.replace(/\./g, "/"),
			FNClass;

		FNClass = sap.ui.require(sModuleName);
		if ( !FNClass ) {
			try {
				FNClass = sap.ui.requireSync(sModuleName);
			} catch (e) {
				// ignore
			}
		}
		if ( !FNClass ) {
			FNClass = ObjectPath.get(sClassName);
		}
		return FNClass;
	}

	/**
	 * Iterates over all loaded libraries, but also all available libraries and tries to load them and their control lists.
	 * @returns an object that maps each library name to an array of control names in this library
	 */
	function loadAllAvailableLibraries() {

		// We have a list of known libraries (in the bootstrap) that have to be checked. This list will be dynamically extended below with any new libraries. This static list here is just for fallback purposes.
		var mLoadedLibraries = sap.ui.getCore().getLoadedLibraries();

		// Maybe libraries have been added, so discover what is available in order to also test them. But only do this when we are in sapui5.runtime layer, not when this test is executed in dist layer.
		var oInfo = sap.ui.getVersionInfo();
		for (var i = 0; i < oInfo.libraries.length; i++) {
			var sInfoLibName = oInfo.libraries[i].name;
			if (!mLoadedLibraries[sInfoLibName]) {
				Log.info("Library '" + sInfoLibName + "' is not loaded! Trying...");
				try {
					var oLibrary = sap.ui.getCore().loadLibrary(sInfoLibName);
					mLoadedLibraries[sInfoLibName] = oLibrary.controls;
					Log.info("Library '" + sInfoLibName + "...successfully.");
				} catch (e) {
					// not a control lib? This happens for e.g. "sap.ui.server.java"...
				}
			} else {
				mLoadedLibraries[sInfoLibName] = mLoadedLibraries[sInfoLibName].controls; // only the control list is needed
			}
		}

		return mLoadedLibraries;
	}


	// tries to fill all control properties with string values (hoping this might trigger more leaks)
	var fillControlProperties = function(oControl) {
		var mProperties = oControl.getMetadata().getAllProperties(),
			sControlName = oControl.getMetadata().getName();

		for (var sPropertyName in mProperties) {
			var oProperty = mProperties[sPropertyName];
			try {
				if (!shouldIgnoreProperty(sControlName, sPropertyName)) {
					var vValueToSet = "text"; // just try a string as default, with some frequently happening exceptions

					/*
					 * This block increases the successfully set properties from 27% to 78%, but leads to no new memory leak detection
					 * and leads to issues in several controls. So don't do it.

					if (oProperty.type === "boolean") {
						vValueToSet = true;
					} else if (oProperty.type === "int") {
						vValueToSet = 100;
					}
					 */

					oControl[oProperty._sMutator](vValueToSet);
					iSuccessfullyFilledProperties++;
				}
			} catch (e) {
				// type check error, ignore
				aFailuresWhenFillingProperties.push(oProperty.type + " (" + sControlName + "." + sPropertyName + ")");
			}
		}
		oControl.setTooltip("test"); // seems not to be a property...
	};


	// checks whether the given property should not be set for this test
	var shouldIgnoreProperty = function(sControlName, sPropertyName) {
		if (sControlName === "sap.m.PlanningCalendar" && sPropertyName === "viewKey") { // control fails when key is set where nothing is registered
			return true;
		}

		if (sControlName === "sap.f.PlanningCalendarInCard" && sPropertyName === "viewKey") { // control fails when key is set where nothing is registered
			return true;
		}

		if ((sControlName === "sap.m.SinglePlanningCalendarGrid" || sControlName === "sap.m.SinglePlanningCalendarMonthGrid")
			&& sPropertyName === "startDate") {
			return true;
		}
	};


	function fillControlAggregations(oControl, assert) {
		var mAggregations = oControl.getMetadata().getAggregations();

		for (var sAggregationName in mAggregations) {
			var oAggregation = mAggregations[sAggregationName];
			try {
				var oAddedElement = createAndAddAggregatedElement(oControl, oAggregation, assert);
				if (oAddedElement) {
					iSuccessfullyFilledAggregations++;
				} else {
					aFailuresWhenFillingAggregations.push(oAggregation.type);
				}
			} catch (e) {
				// error during creating or adding a child element: not a problem, just reducing test coverage a bit
				aFailuresWhenFillingAggregations.push(oAggregation.type);
			}
		}
	}

	function createAndAddAggregatedElement(oControl, oAggregation, assert) {
		var oElement,
			sAggregationType = oAggregation.type;

		if ( DataType.isInterfaceType(sAggregationType) ) {
			// we can't instantiate interface types and in general don't know the implementations

			// however... we know SOME
			if ( /* sAggregationType === "sap.m.IBar" || */ sAggregationType === "sap.ui.core.Toolbar") {
				sAggregationType = "sap.m.Bar";
			/*
			} else if (false && sAggregationType ===  "sap.m.IconTab") {
				sAggregationType = "sap.m.IconTabFilter";
			*/
			} else {
				return; // really don't know
			}
		}

		var FNClass = loadClass(sAggregationType);

		if (!FNClass) {
			assert.ok(false, "No class of type " + sAggregationType + " for aggregation '" + oAggregation.name + "' of " + oControl + " could be loaded. Does this class exist? Is it properly implemented?");
		}

		if (FNClass === Control) {

			if (oControl.getMetadata().getName() === "sap.ui.commons.InPlaceEdit" && oAggregation.name === "content") {
				oElement = new CommonsTextField();
			} else {
				// this aggregation is a typical container aggregation, allowing any control as child.
				// Or it is more specific, but allows different child types, and Control is the common base class.
				// Let's try adding a Text control.
				oElement = new MobileText();
			}

		} else if (FNClass === Element) {
			// This aggregation accepts any sap.ui.Element?? Strange. Give an Item, then.
			oElement = new Item();

		} else if ( FNClass.getMetadata().isAbstract() ) {
			// we also shouldn't instantiate abstract classes
			return;

		} else {
			// A specific Control or Element type. Try to add a working instance.
			oElement = new FNClass();
		}

		// In case we were able to instantiate a suitable Element, add it into the aggregation.
		if (oElement) {
			oControl[oAggregation._sMutator](oElement);
		}
		return oElement;
	}



	// checks whether the control with the given name should for some reason not be tested
	var shouldIgnoreControl = function(sControlName, assert) {
		// ignore controls which are known not to work standalone - some of them cannot work, some might need to be improved
		if ([
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
			"sap.m.DateTimeInput", // setting an invalid type crashes and only leaks a picker control because of this
			"sap.m.FacetFilterItem",
			"sap.m.IconTabBarSelectList",
			"sap.m.LightBox",
			"sap.m.NotificationListGroup",
			"sap.m.NotificationListItem",
			"sap.m.internal.NumericInput",
			"sap.m.QuickViewPage",
			"sap.m.PlanningCalendar",
			"sap.f.PlanningCalendarInCard",
			"sap.m.SelectionDetailsListItem", // not prepared to be used standalone
			"sap.m.TimePickerSlider",
			"sap.m.TimePickerSliders",
			"sap.m.Wizard",
			"sap.tnt.NavigationList",
			"sap.ui.layout.BlockLayoutRow",
			"sap.ui.layout.form.ResponsiveGridLayoutPanel", // control not for stand alone usage. Only inside ResponsiveGridLayout
			"sap.ui.layout.form.ResponsiveLayoutPanel", // control not for stand alone usage. Only inside ResponsiveLayout
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
			"sap.viz.ui5.core.BaseChart"
		].indexOf(sControlName) > -1) { // known to be untestable
			assert.ok(true, "WARNING: " + sControlName + " cannot be tested and has therefore been EXCLUDED.");
			return true;
		}

		// ignore controls with known duplicate ID issues - FIXME: reduce this list after the issues have been fixed
		if ([
			"sap.ui.comp.smartform.flexibility.DialogContent",  // Ticket: 1670370548
			"sap.uiext.inbox.InboxLaunchPad"                    // Ticket: none (old control that is not really used multiple times)

		].indexOf(sControlName) > -1)  { // known to be having an issue with duplicate IDs
			assert.ok(true, "WARNING: " + sControlName + " is known to have an issue with duplicate IDs and is ignored until it is fixed.");
			return true;
		}
	};


	var aKnownLibraries = ["sap.ui.core","sap.chart","sap.f","sap.m","sap.makit","sap.me","sap.ndc",
						   "sap.suite.ui.microchart","sap.tnt","sap.ui.commons","sap.ui.comp","sap.ui.dt",
						   "sap.ui.fl","sap.ui.generic.app","sap.ui.generic.template","sap.ui.layout",
						   "sap.ui.richtexteditor","sap.ui.rta","sap.ui.server.java","sap.ui.suite","sap.ui.table",
						   "sap.ui.unified","sap.ui.ux3","sap.uiext.inbox","sap.uxap","sap.viz"];

	var shouldIgnoreLibrary = function(sLibName) {
		if (aKnownLibraries.indexOf(sLibName) === -1) { // ignore dist-layer libraries
			return true;
		}
	};



	// Creates and renders two instances of the given control and asserts that the second instance does not leak any controls after destruction.
	// Has some special logic to ignore or work around problems where certain controls do not work standalone.
	var checkControl = function(sControlName, assert) {
		assert.ok(true, sControlName);

		var oControlClass = loadClass(sControlName),
			sId = sControlName.replace(/\./g, "_"),
			oControl1 = new oControlClass(sId + "_1"),
			oControl2 = new oControlClass(sId + "_2"),
			bCanRender = false;

		// check whether this control can be rendered
		if (oControl1.placeAt) {
			try {
				oControl1.getMetadata().getRenderer();
				bCanRender = true;
			} catch (e) {
				// ignoring this control's rendering, message is written below
			}
		}


		// Render Control Instances

		fillControlProperties(oControl1);
		fillControlAggregations(oControl1, assert);
		fillControlProperties(oControl2);
		fillControlAggregations(oControl2, assert);

		if (bCanRender) {
			oControl1.placeAt("qunit-fixture");
			oControl2.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oControl1.rerender();
			oControl2.rerender();
			sap.ui.getCore().applyChanges();

			iFullyTestedControls++;
			assert.ok(true, sControlName + " can be instantiated multiple times without duplicate ID errors.");
		} else {
			iTestedWithoutRenderingControls++;
			assert.ok(true, "WARNING: " + sControlName + " cannot be rendered");
		}

		// cleanup
		oControl1.destroy();
		oControl2.destroy();
		sap.ui.getCore().applyChanges();
	};




	// QUnit Setup

	QUnit.module("Duplicate ID issues in Controls", {
		afterEach: function() {
			Element.registry.forEach(function(oElement, sId) {
				oElement.destroy();
			});
		}
	});




	// Actual Tests

	var mAllLibraries = loadAllAvailableLibraries();

	// sanity check to make sure this is actually testing something
	QUnit.test("Should load at least several expected libraries and lots of controls", function(assert) {
		assert.ok(mAllLibraries["sap.ui.core"], "Should have loaded the basic sap.ui.core library");
		assert.ok(mAllLibraries["sap.m"], "Should have loaded the declared sap.m library");
		assert.ok(mAllLibraries["sap.ui.layout"], "Should have loaded the non-declared but always existing sap.ui.layout library");

		assert.ok(mAllLibraries["sap.ui.core"].length >= 10, "Should find at least 10 controls in sap.ui.core");
		assert.ok(mAllLibraries["sap.m"].length >= 50, "Should find at least 50 controls in sap.m");
		assert.ok(mAllLibraries["sap.ui.layout"].length >= 10, "Should find at least 10 controls in sap.ui.layout");
	});


	function makeTest(sLibName) {
		QUnit.test("test " + sLibName + " controls", function (assert) {
			if (!mAllLibraries[sLibName].length) { // there are libraries with no controls
				assert.expect(0);
			}

			mAllLibraries[sLibName].forEach(function(sControlName) {
				if (sControlName) {
					iAllControls++;

					if (!shouldIgnoreControl(sControlName, assert)) {
						checkControl(sControlName, assert);
					}
				}
			});

		});
	}

	// loop over all libs and controls and create a test for each
	for (var sLibName in mAllLibraries) {

		// only test libraries in the sapui5.runtime layer (avoid  issues with cross-layer tests)
		if (shouldIgnoreLibrary(sLibName)) {
			continue;
		}

		makeTest(sLibName);

	}


	// display some numbers and ensure stuff was tested
	QUnit.test("Statistics", function(assert) {
		assert.ok(true, "Total number of found controls: " + iAllControls);
		assert.ok(true, "Number of fully tested controls: " + iFullyTestedControls);
		assert.ok(true, "Number of controls tested without rendering: " + iTestedWithoutRenderingControls);

		assert.ok(iFullyTestedControls >= 200 /* magic number... just make sure we have tested lots of controls */, "Should have tested lots of controls, at least 200");

		var fPropertyPercentage = Math.round(iSuccessfullyFilledProperties / (iSuccessfullyFilledProperties + aFailuresWhenFillingProperties.length) * 100);
		assert.ok(iSuccessfullyFilledProperties > 2000, "There should be more than 2000 successfully filled properties. There are " + iSuccessfullyFilledProperties + " (" + fPropertyPercentage + "% success)");
		// too many.... 6000...  assert.ok(aFailuresWhenFillingProperties.length < 20000, "Three should be less than 20000 failures when a property is filled. There are " + aFailuresWhenFillingProperties.length + ". Failing properties: " + aFailuresWhenFillingProperties.join(",\n"));

		var fAggregationPercentage = Math.round(iSuccessfullyFilledAggregations / (iSuccessfullyFilledAggregations + aFailuresWhenFillingAggregations.length) * 100);
		assert.ok(iSuccessfullyFilledAggregations > 700, "There should be more than 700 successfully filled aggregations. There are " + iSuccessfullyFilledAggregations + " (" + fAggregationPercentage + "% success)");
		assert.ok(aFailuresWhenFillingAggregations.length < 500, "There should be less than 500 failures when an aggregation is filled. There are " + aFailuresWhenFillingAggregations.length + ". Failing aggregation types: " + aFailuresWhenFillingAggregations.join(",\n"));
	});

});
