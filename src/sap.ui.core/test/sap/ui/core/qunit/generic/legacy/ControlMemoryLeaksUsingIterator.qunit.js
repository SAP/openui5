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

/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/ControlIterator",
	"sap/ui/qunit/utils/MemoryLeakCheck",
	"../helper/_LoadingIndicator",
	"sap/ui/dom/includeStylesheet",
	"require"
], function(ControlIterator, MemoryLeakCheck, LoadingIndicator, includeStylesheet, require) {
	"use strict";

	// disable require.js to avoid issues with thirdparty
	sap.ui.loader.config({
		map: {
			"*": {
				"sap/ui/thirdparty/require": "test-resources/sap/ui/core/qunit/generic/helper/_emptyModule"
			}
		}
	});

	var loadingIndicator = new LoadingIndicator("Discovering and loading all libraries and controls... this will take a while... ",
			"NOTE: you can select a specific library using the URL parameter 'library' (e.g. ...&library=sap.m) and/or a specific control using the URL parameter 'control' " +
			"with the full name of the control (e.g. ...&control=sap.m.Button). Giving both reduces the scanning time.");

	var aExcludedControls = [
		"sap.m.internal.NumericInput",
		"sap.m.DateTimeInput", // has a DatePicker leak
		"sap.m.PlanningCalendar", // can be rendered but fails when properties generically filled ("viewKey")
		"sap.f.PlanningCalendarInCard", // can be rendered but fails when properties generically filled ("viewKey")
		"sap.ui.comp.odata.FieldSelector", // has a known leak
		"sap.ui.comp.valuehelpdialog.ValueHelpDialog",  // has a known leak
		"sap.ui.core.util.Export", // cannot render
		"sap.ui.mdc.chart.ChartTypeButton", // cannot be instantiated without further configuration
		"sap.ui.mdc.field.FieldBase", // will not work as pars are loaded async. -> separate test in mdc
		"sap.ui.mdc.Field", // will not work as pars are loaded async. -> separate test in mdc
		"sap.ui.mdc.FilterField", // will not work as pars are loaded async. -> separate test in mdc
		"sap.ui.mdc.filterbar.p13n.AdaptationFilterBar" // has a leak that needs to be fixed
	];

	function createControlTests(aControls) {

		loadingIndicator.hide();

		aControls.forEach(function(oControlInfo) {
			MemoryLeakCheck.checkControl(
				oControlInfo.name,
				function() {
					return new oControlInfo.controlClass();
				},
				!oControlInfo.info.canRender
			);
		});

	}

	function collectControls() {
		var aControls = [];

		var mOptions = {
			excludedControls: aExcludedControls,
			excludedLibraries: ["sap.viz"],
			done: function(oResultInfo) {
				createControlTests(aControls);

				// QUnit is made available by MemoryLeakCheck
				QUnit.module("MemoryLeakCheck Summary");
				QUnit.test("Test summary (" + oResultInfo.testedControlCount + " controls in " + oResultInfo.testedLibraryCount + " libraries)", function(assert){
					assert.ok(true, "Tested Controls: " + oResultInfo.testedControlCount);
					assert.ok(true, "Tested Libraries: " + oResultInfo.testedLibraryCount);
				});

				QUnit.start();
			}
		};

		var sLib = new URLSearchParams(window.location.search).get("library");
		if (sLib) {
			mOptions.librariesToTest = [sLib];
		}

		var sControl = new URLSearchParams(window.location.search).get("control");
		if (sControl) {
			mOptions.controlsToTest = [sControl];
		}

		ControlIterator.run(function(sControlName, oControlClass, oInfo) { // loop over all controls
			loadingIndicator.update(sControlName);
			aControls.push({name: sControlName, controlClass: oControlClass, info: oInfo});
		}, mOptions);
	}

	return includeStylesheet({
		url: require.toUrl("../helper/_cleanupStyles.css")
	}).then(function() {
		collectControls();
	});

});
