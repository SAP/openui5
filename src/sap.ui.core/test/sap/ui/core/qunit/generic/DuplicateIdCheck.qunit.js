
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/generic/TestBase",
	"sap/ui/test/generic/Utils",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (TestBase, Utils, nextUIUpdate) {
	"use strict";

	/**
	 * @namespace
	 * @private
	 */
	var DuplicateIdCheck = TestBase.extend("sap.ui.core.qunit.generic.DuplicateIdCheck", {
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

			if (oCapabilities.knownIssues && oCapabilities.knownIssues.id === true) {
				assert.ok(true, "WARNING: " + sControlName + " is known to have an issue with duplicate IDs and is ignored until it is fixed.");
				bIgnore = true;
			}

			return bIgnore;
		},

		/**
		 * Creates and renders two instances of the given control and asserts that the second instance does not leak any controls after destruction.
		 * Has some special logic to ignore or work around problems where certain controls do not work standalone.
		 *
		 * @param {sap.ui.test.generic.ClassInfo} oClassInfo Info object containing the <code>sap.ui.test.generic.ClassInfo</code> object
		 * @return {Promise} Promise resolved after checking the control is finished
		 * @override
		 */
		testControl: function(oClassInfo, assert) {
			var sControlName = oClassInfo.fnClass.getMetadata().getName(),
				oObjectCapabilities = this.getObjectCapabilities(sControlName);

			var sId = sControlName.replace(/\./g, "_"),
				pControls,
				bCanRender = false;

			pControls = Promise.all([
				Utils.createControlOrElement(oClassInfo.fnClass, oObjectCapabilities, {id: sId + "_1"}),
				Utils.createControlOrElement(oClassInfo.fnClass, oObjectCapabilities, {id: sId + "_2"})
			]);

			return pControls.then(function (aControls) {
				var oControl1 = aControls[0],
					oControl2 = aControls[1];
				// check whether this control can be rendered
				if (oControl1.placeAt) {
					try {
						oControl1.getMetadata().getRenderer();
						bCanRender = !(oObjectCapabilities && oObjectCapabilities.rendererHasDependencies);
					} catch (e) {
						// ignoring this control's rendering, message is written below
					}
				}

				// Render Control Instances
				return Promise.all([
					Utils.fillControlProperties(oControl1, oObjectCapabilities),
					Utils.fillControlAggregations(oControl1, this.getObjectCapabilities()),
					Utils.fillControlProperties(oControl2, oObjectCapabilities),
					Utils.fillControlAggregations(oControl2, this.getObjectCapabilities())
				]).then(async function() {
					if (bCanRender) {
						oControl1.placeAt("qunit-fixture");
						oControl2.placeAt("qunit-fixture");
						await nextUIUpdate();

						oControl1.invalidate();
						oControl2.invalidate();
						await nextUIUpdate();

						assert.ok(true, sControlName + " can be instantiated multiple times without duplicate ID errors.");
					} else {
						assert.ok(true, "INFO: " + sControlName + " cannot be rendered");
					}

					// cleanup
					oControl1.destroy();
					oControl2.destroy();
					await nextUIUpdate();
				});
			}.bind(this));
		}
	});

	return new DuplicateIdCheck().setupAndStart();
});