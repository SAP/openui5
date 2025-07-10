/*!
 * ${copyright}
 */

/* global QUnit */
sap.ui.define([
	"sap/ui/test/generic/TestBase",
	"sap/ui/test/generic/Utils",
	"sap/ui/core/ElementRegistry",
	"sap/base/Log"
], function (TestBase, Utils, ElementRegistry, Log) {
	"use strict";

	// Shared data accessible to all test runs
	const instancesPerControl = {};
	let payload;

	/**
	 * @namespace
	 * @private
	 */
	const ControlInstances = TestBase.extend("sap.ui.core.qunit.generic.ControlInstances", {
		/**
		 * @override
		 */
		shouldIgnoreControl: function (oClassInfo, assert) {
			const sControlName = oClassInfo.className,
				oCapabilities = this.getObjectCapabilities(sControlName) || {};
			let bIgnore = false;

			if (oCapabilities.create === false) {
				assert.ok(true, "WARNING: " + sControlName + " cannot be tested and has therefore been EXCLUDED");
				bIgnore = true;
			}

			return bIgnore;
		},

		/**
		 * Creates one instance of the given control and checks which other control instances are created on control creation.
		 *
		 * @param {sap.ui.test.generic.ClassInfo} oClassInfo
		 * @return {Promise}
		 * @override
		 */
		testControl: async function (oClassInfo, assert) {
			const sControlName = oClassInfo.fnClass.getMetadata().getName();

			// initialize the payload object to hold control instances; the library is only known inside the class
			if (!payload) {
				// this is the first control we are testing, so we initialize the payload object
				payload = {
					libraryName: this._oTestParameters.library,
					instancesPerControl
				};
			}

			const mPreElements = ElementRegistry.all();

			const oControlOrPromise = Utils.createControlOrElement(oClassInfo.fnClass, this.getObjectCapabilities(sControlName));
			const oControl = (typeof oControlOrPromise.then === "function")
				? await oControlOrPromise
				: oControlOrPromise;

			const mPostElements = ElementRegistry.all();

			// identify all other elements which were created by this tested control
			const aCreatedElements = Object.keys(mPostElements).filter(function (sId) {
				return !mPreElements[sId] && sId !== oControl.getId();
			});

			// aggregate the created elements by their control class name
			const mCreatedElementsByClass = aCreatedElements.reduce(function (mAcc, sId) {
				const oElement = ElementRegistry.get(sId);
				const sClassName = oElement.getMetadata().getName();
				if (!mAcc[sClassName]) {
					mAcc[sClassName] = 1;
				} else {
					mAcc[sClassName]++;
				}
				return mAcc;
			}, {});

			// keep track of the control instances created by this control
			instancesPerControl[sControlName] = mCreatedElementsByClass;

			// we do not want to break when there are other instances created, but we want to log them
			QUnit.assert.ok(true, "Control " + sControlName + " created the following control instances: " + JSON.stringify(mCreatedElementsByClass));

			// clean up
			oControl.destroy();
		}
	});

	// after all controls have been checked, send the instance info to the server
	QUnit.done(function () {
		if (!payload) { // if payload wasn't initialized, no control instances were tested, happens in small libs like sap.makit
			Log.info("[ControlInstances] No control instances were collected, nothing to send.");
			return;
		}
		// send the control instances to /instance-collector endpoint
		fetch("/instance-collector", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		}).then(function (response) {
			if (!response.ok) {
				Log.warning("[ControlInstances] Could not send control instances:", response.statusText);
			} else {
				Log.info("[ControlInstances] Control instances sent successfully.");
			}
		}).catch(function (error) {
			Log.warning("[ControlInstances] Could not send control instances:", error);
		});
	});

	return new ControlInstances().setupAndStart();
});
