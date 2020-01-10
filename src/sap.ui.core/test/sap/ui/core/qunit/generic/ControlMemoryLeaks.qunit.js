/*
 *
 * The approach of this test is to generically identify all available libraries and control.
 * and then instantiate, render and destroy every single control. Afterwards the list of currently existing controls
 * is compared with the list before control instantiation to identify any leaked controls.
 *
 * Some controls statically create instances of sap.ui.core.InvisibleText for accessibility reasons. These
 * InvisibleText controls are re-used by all instances of the same control type and hence never destroyed.
 * While technically a leak, the overhead is small and not growing over time, so these are not considered
 * as leaks in this test. To exclude these false positives, there are TWO instances of each control type created.
 * Only leaks also caused by the second instance are considered to be real issues.
 *
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Element",
	"sap/ui/core/Control",
	"./helper/_cleanupStyles"
], function (jQuery, Element, Control) {
	"use strict";

	/*global QUnit */

	var iAllControls = 0,
		iFullyTestedControls = 0,
		iTestedWithoutRenderingControls = 0;

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
				jQuery.sap.log.info("Library '" + sInfoLibName + "' is not loaded! Trying...");
				try {
					var oLibrary = sap.ui.getCore().loadLibrary(sInfoLibName);
					mLoadedLibraries[sInfoLibName] = oLibrary.controls;
					jQuery.sap.log.info("Library '" + sInfoLibName + "...successfully.");
				} catch (e) {
					// not a control lib? This happens for e.g. "sap.ui.server.java"...
				}
			} else {
				mLoadedLibraries[sInfoLibName] = mLoadedLibraries[sInfoLibName].controls; // only the control list is needed
			}
		}

		return mLoadedLibraries;
	}


	// asserts that both given maps have the same entries
	QUnit.assert.equalElementsInControlList = function(mActual, mExpected, sMessage) {
		var aUnexpectedElements = [];

		for (var sId in mActual) {
			if (!mExpected[sId]) {
				aUnexpectedElements.push(mActual[sId]);
			}
		}

		// enrich with helpful info to more easily identify the leaked control
		for (var i = 0; i < aUnexpectedElements.length; i++) {
			if (aUnexpectedElements[i].getText) {
				aUnexpectedElements[i] += " (text: '" + aUnexpectedElements[i].getText() + "')";
			}
		}
		this.push(aUnexpectedElements.length === 0, aUnexpectedElements.join(", "), "", sMessage);
	};


	// tries to fill all control properties with string values (hoping this might trigger more leaks)
	var fillControlProperties = function(oControl) {
		var mProperties = oControl.getMetadata().getAllProperties(),
			sControlName = oControl.getMetadata().getName();

		for (var sPropertyName in mProperties) {
			var oProperty = mProperties[sPropertyName];
			try {
				if (!shouldIgnoreProperty(sControlName, sPropertyName)) {
					oControl[oProperty._sMutator]("test"); // just try a string for everything now, TODO: check type
				}
			} catch (e) {
				// type check error, ignore
			}
		}
		oControl.setTooltip("test"); // seems not to be a property...
	};


	// checks whether the given property should not be set for this test
	var shouldIgnoreProperty = function(sControlName, sPropertyName) {
		if ((sControlName === "sap.m.PlanningCalendar" || sControlName === "sap.f.PlanningCalendarInCard") && (sPropertyName === "viewKey" || sPropertyName === "builtInViews")) { // control fails when key is set where nothing is registered
			return true;
		}

		if ((sControlName === "sap.m.SinglePlanningCalendarGrid" || sControlName === "sap.m.SinglePlanningCalendarMonthGrid")
			&& sPropertyName === "startDate") {
			return true;
		}
	};


	// checks whether the control with the given name should for some reason not be tested
	var shouldIgnoreControl = function(sControlName, assert) {
		// ignore controls which are known not to work standalone - some of them cannot work, some might need to be improved
		if ([
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
			"sap.m.DateTimeInput",  // setting an invalid type crashes and only leaks a picker control because of this
			"sap.m.FacetFilterItem",
			"sap.m.LightBox",
			"sap.m.NotificationListItem",
			"sap.m.TimePickerSlider",
			"sap.m.TimePickerSliders",
			"sap.m.Wizard",
			"sap.tnt.NavigationList",
			"sap.ui.layout.BlockLayoutRow",
			"sap.ui.layout.form.ResponsiveGridLayoutPanel", // control not for stand alone usage. Only inside ResponsiveGridLayout
			"sap.ui.layout.form.ResponsiveLayoutPanel", // control not for stand alone usage. Only inside ResponsiveLayout
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
			"sap.viz.ui5.core.BaseChart"
		   ].indexOf(sControlName) > -1)  { // known to be untestable
			assert.ok(true, "WARNING: " + sControlName + " cannot be tested and has therefore been EXCLUDED.");
			return true;
		}

		// ignore controls with known memory leaks - FIXME: reduce this list after the leaks have been fixed
		if ([
			"sap.ui.comp.navpopover.NavigationPopover",                // Ticket: TODO 1
			"sap.ui.comp.odata.FieldSelector",                         // Ticket: TODO 2
			"sap.ui.comp.smartform.flexibility.DialogContent",         // Ticket: TODO 2 (looks the same)
			"sap.uiext.inbox.InboxLaunchPad",                          // Ticket: TODO 3
			"sap.uiext.inbox.InboxSplitApp",                           // Ticket: TODO 4
			"sap.uiext.inbox.composite.InboxAttachmentTile",           // Ticket: TODO 5
			"sap.uiext.inbox.composite.InboxAttachmentsTileContainer", // Ticket: TODO 6
			"sap.uiext.inbox.composite.InboxUploadAttachmentTile",     // Ticket: TODO 7
			"sap.uiext.inbox.InboxTaskCategoryFilterList",             // Ticket: TODO 8
			"sap.viz.ui5.controls.Popover"
		   ].indexOf(sControlName) > -1) { // known to be leaking
			assert.ok(true, "WARNING: " + sControlName + " is known to have memory leaks and is ignored until they are fixed.");
			return true;
		}

		// for testing:
		// if (sControlName !== "sap.m.ViewSettingsPopover") return true;
	};


	var aKnownLibraries = ["sap.ui.core","sap.chart","sap.f","sap.m","sap.makit","sap.me","sap.ndc",
						   "sap.suite.ui.microchart", "sap.tnt","sap.ui.commons","sap.ui.comp","sap.ui.dt",
						   "sap.ui.fl","sap.ui.integration","sap.ui.generic.app","sap.ui.generic.template","sap.ui.layout",
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
		var //mPrePreElements = Element.registry.all(),
			oControlClass = jQuery.sap.getObject(sControlName),
			oControl1 = new oControlClass(),
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


		// Render Control Instance 1 - some control types statically create something for re-use across all instances

		fillControlProperties(oControl1);

		if (bCanRender) {
			oControl1.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		} else {
			// reported below
		}

		oControl1.destroy();
		sap.ui.getCore().applyChanges();


		// Render Control Instance 2 - any new controls leaked?

		var mPreElements = Element.registry.all(),
			oControl2 = new oControlClass();

		fillControlProperties(oControl2);

		if (bCanRender) {
			oControl2.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oControl2.rerender();  // just re-render again - this finds problems
			sap.ui.getCore().applyChanges();

			iFullyTestedControls++;
		} else {
			iTestedWithoutRenderingControls++;
			assert.ok(true, "WARNING: " + sControlName + " cannot be rendered");
		}


		// check what's left after destruction

		oControl2.destroy();
		sap.ui.getCore().applyChanges();
		var mPostElements = Element.registry.all();

		// controls left over by second instance are real leaks that will grow proportionally to instance count => ERROR
		assert.equalElementsInControlList(mPostElements, mPreElements, "Memory leak check in " + sControlName);

		// controls left over by first instance are either real leaks or one-time static leaks, which we accept
		//assert.equalElementsInControlList(mPreElements, mPrePreElements, "Static leak check (WARNING ONLY!!) in " + sControlName);
	};



	// QUnit Setup

	QUnit.module("Memory.Controls", {
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
	});

	QUnit.start();

});
