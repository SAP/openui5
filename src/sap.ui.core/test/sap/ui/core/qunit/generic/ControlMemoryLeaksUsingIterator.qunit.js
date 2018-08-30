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
	"sap/ui/qunit/utils/ControlIterator",
	"sap/ui/qunit/utils/MemoryLeakCheck",
	"./helper/_LoadingIndicator",
	"./helper/_cleanupStyles"
], function(ControlIterator, MemoryLeakCheck, LoadingIndicator) {

	var loadingIndicator = new LoadingIndicator("Discovering and loading all libraries and controls... this will take a while... ");

	var aExcludedControls = [
		"sap.m.internal.NumericInput",
		"sap.m.DateTimeInput", // has a DatePicker leak
		"sap.m.PlanningCalendar", // can be rendered but fails when properties generically filled ("viewKey")
		"sap.ui.comp.odata.FieldSelector", // has a known leak
		"sap.ui.comp.valuehelpdialog.ValueHelpDialog",  // has a known leak
		"sap.ui.mdc.base.FilterField" // has a known leak
	];

	function createControlTests(aControls) {
		var oControlClass, sControlName, bCanRender;

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

		ControlIterator.run(function(sControlName, oControlClass, oInfo) { // loop over all controls
			loadingIndicator.update(sControlName); // not really updated visually (except in Firefox), but in theory the info is there  :-)
			aControls.push({name: sControlName, controlClass: oControlClass, info: oInfo});
		},{
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
		});
	}

	collectControls();
});
