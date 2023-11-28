/*
 * The approach of this test is to generically identify all available libraries and control.
 * and then instantiate, render and destroy two instances of every single control. Controls
 * that forget prefixing the ID of child controls they create will cause a duplicate ID error.
 */

/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/ui/VersionInfo",
	"sap/ui/base/DataType",
	"sap/ui/core/Element",
	"sap/ui/core/ElementRegistry",
	"sap/ui/core/Control",
	"sap/ui/core/Item",
	"sap/ui/core/Lib",
	"sap/ui/commons/TextField",
	"sap/m/Text",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/qunit/utils/nextUIUpdate",
	"require"
], function (Log, ObjectPath, VersionInfo, DataType, Element, ElementRegistry, Control, Item, Library, CommonsTextField, MobileText, includeStylesheet, nextUIUpdate, require) {
	"use strict";

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

	/*
	 * Controls which are known not to work standalone - some of them cannot work, some might need to be improved
	 */
	var CONTROLS_NOT_USABLE_STANDALONE = [
		"sap.ui.commons.SearchField.CB",
		"sap.ui.commons.SearchFieldCB",
		"sap.ui.commons.Accordion",
		"sap.ui.core.ComponentContainer",
		/**
		 * @deprecated since 1.56
		 */
		"sap.ui.core.XMLComposite",
		"sap.ui.core.UIComponent",
		/**
		 * @deprecated since 1.108
		 */
		"sap.ui.core.mvc.HTMLView",
		/**
		 * @deprecated since 1.120
		 */
		"sap.ui.core.mvc.JSONView",
		/**
		 * @deprecated since 1.90
		 */
		"sap.ui.core.mvc.JSView",
		"sap.ui.core.mvc.XMLView",
		/**
		 * @deprecated since 1.56
		 */
		"sap.ui.core.mvc.TemplateView",
		"sap.ui.core.mvc.View",
		/**
		 * @deprecated since 1.56
		 */
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
		"sap.ui.mdc.Chart", // destruction fails
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
		"sap.viz.ui5.VizContainer" // fails when "vizProperties" is set to a primitive value and also for some other property
	];

	/*
	 * Some controls are testable when only certain properties are not filled automatically
	 */
	var CONTROL_PROPERTIES_TO_BE_IGNORED = {
		"sap.m.PlanningCalendar": [
			"viewKey" // control fails when key is set where nothing is registered
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

	var iAllControls = 0,
		iFullyTestedControls = 0,
		iTestedWithoutRenderingControls = 0,
		aFailuresWhenFillingAggregations = [],
		iSuccessfullyFilledAggregations = 0,
		aFailuresWhenFillingProperties = [],
		iSuccessfullyFilledProperties = 0;


	function loadClass(sClassName) {
		return new Promise(function(resolve) {
			var sModuleName = sClassName.replace(/\./g, "/");
			sap.ui.require([sModuleName], function(FNClass) {
				if ( !FNClass ) {
					FNClass = ObjectPath.get(sClassName);
					if ( FNClass ) {
						Log.error("Module '" + sModuleName + "' exports control class only via global name");
					}
				}
				resolve(FNClass);
			}, function(err) {
				// ignore
				resolve(undefined);
			});
		});
	}

	/**
	 * Iterates over all loaded libraries, but also all available libraries and tries to load them and their control lists.
	 * @returns an object that maps each library name to an array of control names in this library
	 */
	function loadAllAvailableLibraries() {

		// We have a list of known libraries (in the bootstrap) that have to be checked. This list will be dynamically extended below with any new libraries. This static list here is just for fallback purposes.
		var mLoadedLibraries = Library.all();

		// Maybe libraries have been added, so discover what is available in order to also test them. But only do this when we are in sapui5.runtime layer, not when this test is executed in dist layer.
		return VersionInfo.load().then(function(oInfo) {
			return Promise.all(
				oInfo.libraries.map(function(oLibInfo) {
					var sInfoLibName = oLibInfo.name;

					// only load known libraries, we won't test others
					if (!aKnownLibraries.includes(sInfoLibName)) {
						return;
					}

					if (!mLoadedLibraries[sInfoLibName]) {
						Log.info("Library '" + sInfoLibName + "' is not loaded! Trying...");
						return sap.ui.getCore().loadLibrary(sInfoLibName, {async: true})
							.then(function(oLibrary) {
								mLoadedLibraries[sInfoLibName] = oLibrary.controls;
								Log.info("Library '" + sInfoLibName + "...successfully.");
							}, function(err) {
								// not a control lib? This happens for e.g. "sap.ui.server.java"...
							});
					} else {
						mLoadedLibraries[sInfoLibName] = mLoadedLibraries[sInfoLibName].controls; // only the control list is needed
						return;
					}
				}));
		}).then(function() {
			return mLoadedLibraries;
		});
	}


	// tries to fill all control properties with string values (hoping this might trigger more leaks)
	function fillControlProperties(oControl) {
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
	}


	// checks whether the given property should not be set for this test
	function shouldIgnoreProperty(sControlName, sPropertyName) {
		return (
			Array.isArray(CONTROL_PROPERTIES_TO_BE_IGNORED[sControlName])
			&& CONTROL_PROPERTIES_TO_BE_IGNORED[sControlName].includes(sPropertyName)
		);
	}


	function fillControlAggregations(oControl, assert) {
		var mAggregations = oControl.getMetadata().getAggregations();

		return Promise.all(
			Object.values(mAggregations).map(function(oAggregation) {
				return createAndAddAggregatedElement(oControl, oAggregation, assert)
				.then(function(oAddedElement) {
					if (oAddedElement) {
						iSuccessfullyFilledAggregations++;
					} else {
						aFailuresWhenFillingAggregations.push(oAggregation.type);
					}
				}, function(e) {
					// error during creating or adding a child element: not a problem, just reducing test coverage a bit
					aFailuresWhenFillingAggregations.push(oAggregation.type);
				});
			}));
	}

	function createAndAddAggregatedElement(oControl, oAggregation, assert) {
		var sAggregationType = oAggregation.type;

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
				return Promise.resolve(undefined); // really don't know
			}
		}

		return loadClass(sAggregationType).then(function(FNClass) {
			var oElement;

			if (!FNClass) {
				assert.ok(false, "No class of type " + sAggregationType + " for aggregation '" + oAggregation.name + "' of " + oControl + " could be loaded. Does this class exist? Is it properly implemented?");
				return;
			}

			if (FNClass === Control) {

				if (oControl.isA("sap.ui.commons.InPlaceEdit") && oAggregation.name === "content") {
					oElement = new CommonsTextField();
				} else {
					// this aggregation is a typical container aggregation, allowing any control as child.
					// Or it is more specific, but allows different child types, and Control is the common base class.
					// Let's try adding a Text control.
					oElement = new MobileText();
				}

			} else if (FNClass === Element) {
				// This aggregation accepts any sap.ui.core.Element?? Strange. Give an Item, then.
				oElement = new Item();

			} else if (FNClass.getMetadata().isAbstract() ) {
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
		});
	}



	// checks whether the control with the given name should for some reason not be tested
	function shouldIgnoreControl(sControlName, assert) {
		// ignore controls which are known not to work standalone - some of them cannot work, some might need to be improved
		if (CONTROLS_NOT_USABLE_STANDALONE.indexOf(sControlName) > -1) { // known to be untestable
			assert.ok(true, "WARNING: " + sControlName + " cannot be tested and has therefore been EXCLUDED.");
			return true;
		}

		// ignore controls with known duplicate ID issues - FIXME: reduce this list after the issues have been fixed
		if ([
			"sap.uiext.inbox.InboxLaunchPad"                    // Ticket: none (old control that is not really used multiple times)

		].indexOf(sControlName) > -1)  { // known to be having an issue with duplicate IDs
			assert.ok(true, "WARNING: " + sControlName + " is known to have an issue with duplicate IDs and is ignored until it is fixed.");
			return true;
		}
	}


	function shouldIgnoreLibrary(sLibName) {
		return !aKnownLibraries.includes(sLibName); // ignore dist-layer libraries
	}



	// Creates and renders two instances of the given control and asserts that the second instance does not leak any controls after destruction.
	// Has some special logic to ignore or work around problems where certain controls do not work standalone.
	function checkControl(oControlClass, assert) {
		var sControlName = oControlClass.getMetadata().getName();
		assert.ok(true, sControlName);

		var sId = sControlName.replace(/\./g, "_"),
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

		return Promise.all([
			fillControlProperties(oControl1),
			fillControlAggregations(oControl1, assert),
			fillControlProperties(oControl2),
			fillControlAggregations(oControl2, assert)
		]).then(async function() {

			if (bCanRender) {
				oControl1.placeAt("qunit-fixture");
				oControl2.placeAt("qunit-fixture");
				await nextUIUpdate();

				oControl1.invalidate();
				oControl2.invalidate();
				await nextUIUpdate();

				iFullyTestedControls++;
				assert.ok(true, sControlName + " can be instantiated multiple times without duplicate ID errors.");
			} else {
				iTestedWithoutRenderingControls++;
				assert.ok(true, "WARNING: " + sControlName + " cannot be rendered");
			}

			// cleanup
			oControl1.destroy();
			oControl2.destroy();
			await nextUIUpdate();
		});
	}




	// QUnit Setup

	QUnit.module("Duplicate ID issues in Controls", {
		afterEach: function() {
			ElementRegistry.forEach(function(oElement, sId) {
				oElement.destroy();
			});
		}
	});

	// Actual Tests

	return includeStylesheet({
		url: require.toUrl("../helper/_cleanupStyles.css")
	}).then(function() {
		return loadAllAvailableLibraries();
	}).then(function(mAllLibraries) {

		// sanity check to make sure this is actually testing something
		QUnit.test("Should load at least several expected libraries and lots of controls", function(assert) {
			assert.ok(mAllLibraries["sap.ui.core"], "Should have loaded the basic sap.ui.core library");
			assert.ok(mAllLibraries["sap.m"], "Should have loaded the declared sap.m library");
			assert.ok(mAllLibraries["sap.ui.layout"], "Should have loaded the non-declared but always existing sap.ui.layout library");

			assert.ok(mAllLibraries["sap.ui.core"].length >= 10, "Should find at least 10 controls in sap.ui.core");
			assert.ok(mAllLibraries["sap.m"].length >= 50, "Should find at least 50 controls in sap.m");
			assert.ok(mAllLibraries["sap.ui.layout"].length >= 10, "Should find at least 10 controls in sap.ui.layout");
		});

		// loop over all libs and controls and create a test for each
		Object.keys(mAllLibraries).forEach(function(sLibName) {

			// only test libraries in the sapui5.runtime layer (avoid  issues with cross-layer tests)
			if (shouldIgnoreLibrary(sLibName)) {
				return;
			}

			QUnit.test("test " + sLibName + " controls", function (assert) {
				var aControls = mAllLibraries[sLibName];

				if (!aControls.length) { // there are libraries with no controls
					assert.expect(0);
				}

				return Promise.all(
					aControls.map(function(sControlName) {
						if (sControlName) {
							iAllControls++;

							if (!shouldIgnoreControl(sControlName, assert)) {
								return loadClass(sControlName).then(function(oControlClass) {
									if ( !oControlClass ) {
										Log.error("Could not load control class " + sControlName);
										return;
									}
									return checkControl(oControlClass, assert);
								});
							}
						}
						return;
					}));

			});
		});

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

});
