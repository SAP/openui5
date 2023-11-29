/*!
 * ${copyright}
 */

/* global QUnit */
sap.ui.define([
	"sap/ui/test/generic/TestBase",
	"sap/ui/test/generic/Utils",
	"sap/ui/core/Element",
	"sap/ui/core/ElementRegistry",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(TestBase, Utils, Element, ElementRegistry, nextUIUpdate) {
	"use strict";

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
		this.pushResult({
			result: aUnexpectedElements.length === 0,
			actual: aUnexpectedElements.join(", "),
			expected: "",
			message: sMessage
		});
	};

	/**
	 * @namespace
	 * @private
	 */
	var ControlMemoryLeaks = TestBase.extend("sap.ui.core.qunit.generic.ControlMemoryLeaks", {
		/**
		 * @override
		 */
		shouldIgnoreControl: function(oClassInfo, assert) {
			var sControlName = oClassInfo.className,
				oCapabilities = this.getObjectCapabilities(sControlName) || {},
				bIgnore = false;

			if (oCapabilities.create === false) {
				assert.ok(true, "WARNING: " + sControlName + " cannot be tested and has therefore been EXCLUDED");
				bIgnore = true;
			}

			if (oCapabilities.rendererHasDependencies === true) {
				assert.ok(true, "WARNING: " + sControlName + " cannot be rendered standalone because the control renderer has dependecies to parent or other controls and has therefore been EXCLUDED");
				bIgnore = true;
			}

			if (oCapabilities.knownIssues && oCapabilities.knownIssues.memoryLeaks === true) {
				assert.ok(true, "WARNING: " + sControlName + " is known to have memory leaks and is ignored until they are fixed.");
				bIgnore = true;
			}

			return bIgnore;
		},

		/**
		 * Creates and renders two instances of the given control and asserts that the second instance does not leak any controls after destruction
		 * Has some special logic to ignore or work around problems where certain controls do not work standalone.
		 *
		 * @param {sap.ui.test.generic.ClassInfo} oClassInfo Info object containing the <code>sap.ui.test.generic.ClassInfo</code> object
		 * @return {Promise<sap.ui.core.Control>} A Promise that resolves with the control instance
		 * @override
		 */
		testControl: function(oClassInfo, assert) {
			var sControlName = oClassInfo.fnClass.getMetadata().getName();

			var bCanRender = false,
				mPreElements,
				createAndTestControl = function (bFinalIteration) {
					var oControl = Utils.createControlOrElement(oClassInfo.fnClass, this.getObjectCapabilities(sControlName)),
					testControl = async function (oControl) {
						// check whether this control can be rendered
						if (oControl.placeAt && !bFinalIteration) {
							try {
								oControl.getMetadata().getRenderer();
								bCanRender = true;
							} catch (e) {
								// ignoring this control's rendering, message is written below
							}
						}

						// Render Control Instance 1 - some control types statically create something for re-use across all instances
						Utils.fillControlProperties(oControl, this.getObjectCapabilities(sControlName));

						if (bCanRender) {
							oControl.placeAt("qunit-fixture");
							await nextUIUpdate();

							if (bFinalIteration) {
								oControl.invalidate();  // just re-render again - this finds problems
								await nextUIUpdate();
							}
						} else if (bFinalIteration) {
							assert.ok(true, "Info: " + sControlName + " cannot be rendered");
						}
						oControl.destroy();
						await nextUIUpdate();

						if (bFinalIteration) {
							var mPostElements = ElementRegistry.all();

							// controls left over by second instance are real leaks that will grow proportionally to instance count => ERROR
							assert.equalElementsInControlList(mPostElements, mPreElements, "Memory leak check in " + sControlName);
						} else {
							// Render Control Instance 2 - any new controls leaked?
							mPreElements = ElementRegistry.all();
						}
					}.bind(this);

					if (!(oControl instanceof Promise)) {
						oControl = Promise.resolve(oControl);
					}
					return oControl.then(testControl);
				}.bind(this);

			return createAndTestControl().then(createAndTestControl.bind(this, true));
		}
	});

	return new ControlMemoryLeaks().setupAndStart();
});