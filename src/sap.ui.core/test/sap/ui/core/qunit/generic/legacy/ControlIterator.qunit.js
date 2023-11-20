/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/ControlIterator",
	"sap/ui/core/Control",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(ControlIterator, Control, nextUIUpdate) {
	"use strict";

	// disable require.js to avoid issues with thirdparty
	sap.ui.loader.config({
		map: {
			"*": {
				"sap/ui/thirdparty/require": "test-resources/sap/ui/core/qunit/generic/helper/_emptyModule"
			}
		}
	});

	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);


	QUnit.module("ControlIterator");

	QUnit.test("ControlIterator exists", function(assert) {

		// assert
		assert.equal(typeof ControlIterator, "object", "sap.ui.qunit.utils.ControlIterator should be loaded");
		assert.equal(typeof ControlIterator.run, "function", "sap.ui.qunit.utils.ControlIterator should have a function 'run'");
	});


	QUnit.test("ControlIterator calls the callbacks; librariesToTest option (core only); do not test Elements by default", function(assert) {
		var done = assert.async();

		var bCoreIconTested = false,
			//bCoreElementTested = false,
			countOfTestedControlsInCore = 0;

		ControlIterator.run(function(sControlName, oControlClass, oInfo) {
			countOfTestedControlsInCore++;
			console.log(sControlName); // eslint-disable-line no-console
			assert.ok(true, "sap.ui.qunit.utils.ControlIterator should call the callback (" + sControlName + ")");

			if (sControlName === "sap.ui.core.Icon") {
				bCoreIconTested = true;
				assert.strictEqual(oInfo.canRender, true, "sap.ui.core.Icon should be marked as renderable");
			}

			if (sControlName === "sap.ui.core.Element") {
				//bCoreElementTested = true;
				assert.notOk(true, "sap.ui.core.Element should be tested");
			}

		}, {
			librariesToTest: ["sap.ui.core"],
			done: function(oResult) {
				assert.ok(oResult.testedControlCount > 0, "sap.ui.qunit.utils.ControlIterator should call the done callback and report more than one control as being checked");

				assert.strictEqual(oResult.testedControlCount, countOfTestedControlsInCore, "should call the done callback and report as many controls as have actually been checked (" + countOfTestedControlsInCore + ")");
				assert.strictEqual(oResult.testedLibraryCount, 1, "should call the done callback and report one library as being checked");

				assert.ok(bCoreIconTested, "sap.ui.core.Icon should be among the tested controls");

				done();
			}
		});

		assert.strictEqual(countOfTestedControlsInCore, 0, "ControlIterator should not synchronously call the callback (to be future-proof)");
	});


	var iTotalAvailableLibraries;

	QUnit.test("ControlIterator finds at least core and some controls by default when started without a given library list", function(assert) {
		var done = assert.async(),
			count = 0;

		// assert
		ControlIterator.run(function(sControlName, oControlClass, oInfo) {
			count++;

		}, {
			done: function(oResult) {
				iTotalAvailableLibraries = oResult.testedLibraryCount;

				assert.ok(oResult.testedLibraryCount > 1, "should report more than one library as being checked (" + oResult.testedLibraryCount + ")");
				assert.ok(oResult.testedControlCount > 1, "should report more than one control as being checked");
				assert.strictEqual(oResult.testedControlCount, count, "should call the done callback and report as many controls as have actually been checked (" + count + ")");
				done();
			}
		});
	});


	QUnit.test("ControlIterator excludedLibraries option", function(assert) {
		var done = assert.async();

		// assert
		ControlIterator.run(function(sControlName, oControlClass, oInfo) {

		}, {
			excludedLibraries: ["sap.ui.core"],
			done: function(oResult) {
				assert.ok(oResult.testedLibraryCount, iTotalAvailableLibraries - 1, "should report one library less than before (" + oResult.testedLibraryCount + ")");
				done();
			}
		});
	});


	QUnit.test("ControlIterator excludedControls option; also test Elements", function(assert) {
		assert.expect(2);
		var done = assert.async(),
			bCoreItemTested = false;

		ControlIterator.run(function(sControlName, oControlClass, oInfo) {

			if (sControlName === "sap.ui.core.Icon") {
				assert.notOk(true, "sap.ui.core.Icon should NOT be tested when excluded");
			}

			if (sControlName === "sap.ui.core.Element") {
				assert.notOk(true, "sap.ui.core.Element should NOT be tested (because it is marked as abstract)");
			}

			if (sControlName === "sap.ui.core.Item") {
				bCoreItemTested = true;
				assert.ok(true, "sap.ui.core.Item should be tested now");
			}

		}, {
			librariesToTest: ["sap.ui.core"],
			excludedControls: ["sap.ui.core.Icon"],
			includeElements: true,
			done: function() {
				assert.ok(bCoreItemTested, "sap.ui.core.Item should be among the tested controls");
				done();
			}
		});
	});


	QUnit.module("ControlIterator used with single inner tests; internal QUnit checks");

	var testsCreated = new Promise(function(resolve) {
		ControlIterator.run(function(sControlName, oControlClass, oInfo) {

			QUnit.test("Testing control " + sControlName, function(assert) {
				assert.ok(true, sControlName + " would be tested now");

				assert.ok(oControlClass, "a control class should be given");

				if (oInfo.canInstantiate) {
					var oControl = new oControlClass();
					assert.ok(oControl instanceof Control, "the control instance should be instanceof Control");
					assert.strictEqual(oControl.getMetadata().getName(), sControlName, "the given control class should be what can be created from the given control name");
				}
			});

		},{
			librariesToTest: ["sap.ui.core"],
			qunit: QUnit,
			done: function() {
				resolve();
			}
		});
	});


	/*   DO NOT EXECUTE THIS by default - it would prevent controls from getting better

				QUnit.module("ControlIterator not renderable controls");

				QUnit.test("verify excluded controls can REALLY not be rendered", function(assert) {
					var aFailingControls = ControlIterator._aControlsThatCannotBeRenderedGenerically;

					sap.ui.getCore().loadLibrary("sap.ui.commons");

					aFailingControls.forEach(function(sControlName) {
						if (ControlIterator.controlCanBeInstantiated(sControlName)) {
							var oControlClass = ObjectPath.get(sControlName);
							var oControl = new oControlClass();

							assert.throws(
								function() {
									var oRenderer = oControl.getMetadata().getRenderer();
									oControl.placeAt("content");
									await nextUIUpdate();
								}, sControlName + " should not be able to render"
							);
						}
					});
				});

				TODO: add lots of timeouts and try-catch around every single control and make it work reliably
*/


	testsCreated = testsCreated.then(function() {

		QUnit.module("Verify all other controls can be rendered");

		return new Promise(function(resolve) {
			ControlIterator.run(function(sControlName, oControlClass, oInfo) {

				if (oInfo.canInstantiate && oInfo.canRender) {
					QUnit.test("Trying to render control " + sControlName, async function(assert) {
						var oControl = new oControlClass();
						oControl.placeAt("content");
						await nextUIUpdate();

						// nope :-(    assert.ok(oControl.getDomRef(), sControlName + " should have rendered something");

						oControl.destroy();
						await nextUIUpdate();

						assert.ok(true, sControlName + " seems to have rendered successfully");
					});
				}
			},{
				qunit: QUnit,
				done: resolve
			});

		});

	});

	testsCreated.then(function() {
		QUnit.start();
	});

	// TODO: also get a list of tested and ignored controls, for plausibility checks

});
