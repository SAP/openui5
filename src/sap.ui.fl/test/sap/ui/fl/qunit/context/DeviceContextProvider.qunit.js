/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/context/DeviceContextProvider",
	"sap/ui/fl/context/Context"
],
function(
	jQuery,
	DeviceContextProvider,
	Context
) {
	"use strict";

	var mDeviceContextConfiguration = {
		"device" : "sap/ui/fl/context/DeviceContextProvider"
	};

	QUnit.module("Given an instance of the DeviceContextProvider", {
		beforeEach : function() {
			this.oDeviceContextProvider = new DeviceContextProvider();
		},
		afterEach : function() {
		}
	}, function() {
		QUnit.test("when calling getValue without restriction", function(assert) {
			return this.oDeviceContextProvider.getValue().then(function(mValue) {
				assert.equal(mValue, sap.ui.Device, " then the whole sap.ui.Device object is returned");
			});
		});
	});

	QUnit.module("Given a context with device context provider configuration", {
		beforeEach : function() {
			this.oContext = new Context({
				configuration : mDeviceContextConfiguration
			});
		}
	}, function() {
		QUnit.test("when calling getValue without restriction", function(assert) {
			return this.oContext.getValue().then(function(mValue){
				assert.equal(mValue.device, sap.ui.Device, "then the device context is filled correctly");
				assert.equal(Object.keys(mValue).length, 1, "then only the device context is available");
			});
		});

		QUnit.test("when calling getValue with the current domain as restriction", function(assert) {
			return this.oContext.getValue(["device"]).then(function(mValue){
				assert.deepEqual(mValue, {
					device : sap.ui.Device
				}, "then the device context is returned");
			});
		});

		QUnit.test("when calling getValue with restriction (device.os.windows)", function(assert) {
			return this.oContext.getValue(["device.os.windows"]).then(function(mValue){
				assert.deepEqual(mValue, {
					"device.os.windows" : sap.ui.Device.os.windows
				}, "then the device context specific value is available");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});