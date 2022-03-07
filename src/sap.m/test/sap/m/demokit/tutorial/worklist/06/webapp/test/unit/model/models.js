/*global QUnit*/

sap.ui.define([
	"mycompany/myapp/MyWorklistApp/model/models",
	"sap/ui/Device"
], function (models, Device) {
	"use strict";

	QUnit.module("createDeviceModel", {
		afterEach : function () {
			this.oDeviceModel.destroy();
		}
	});

	function isPhoneTestCase(assert, bIsPhone) {
		// Arrange
		this.stub(Device, "system", { phone : bIsPhone });

		// System under test
		this.oDeviceModel = models.createDeviceModel();

		// Assert
		assert.strictEqual(this.oDeviceModel.getData().system.phone, bIsPhone, "IsPhone property is correct");
	}

	QUnit.test("Should initialize a device model for desktop", function (assert) {
		isPhoneTestCase.call(this, assert, false);
	});

	QUnit.test("Should initialize a device model for phone", function (assert) {
		isPhoneTestCase.call(this, assert, true);
	});

	function isTouchTestCase(assert, bIsTouch) {
		// Arrange
		this.stub(Device, "support", { touch : bIsTouch });

		// System under test
		this.oDeviceModel = models.createDeviceModel();

		// Assert
		assert.strictEqual(this.oDeviceModel.getData().support.touch, bIsTouch, "IsTouch property is correct");
	}

	QUnit.test("Should initialize a device model for non touch devices", function (assert) {
		isTouchTestCase.call(this, assert, false);
	});

	QUnit.test("Should initialize a device model for touch devices", function (assert) {
		isTouchTestCase.call(this, assert, true);
	});

	QUnit.test("The binding mode of the device model should be one way", function (assert) {

		// System under test
		this.oDeviceModel = models.createDeviceModel();

		// Assert
		assert.strictEqual(this.oDeviceModel.getDefaultBindingMode(), "OneWay", "Binding mode is correct");
	});

});
