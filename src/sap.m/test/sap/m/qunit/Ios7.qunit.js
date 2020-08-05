/*global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/m/ios7"
], function(Device, ios7) {
	"use strict";

	function stubIos7 (oSinonSandbox) {
		oSinonSandbox.stub(Device, "os", { ios : true, version : 7 });
		oSinonSandbox.stub(Device.system, "phone", true);
		oSinonSandbox.stub(Device.browser, "name", "sf");
	}

	function stubIos7Ipad (oSinonSandbox) {
		oSinonSandbox.stub(Device, "os", { ios : true, version : 7 });
		oSinonSandbox.stub(Device.system, "tablet", true);
		oSinonSandbox.stub(Device.system, "phone", false);
		oSinonSandbox.stub(Device.browser, "name", "sf");
	}

	window.orientation = 0;

	// prepare DOM
	var oInput = document.createElement("input");
	oInput.id = "input";
	document.body.appendChild(oInput);

	var oButton = document.createElement("button");
	oButton.id = "button";
	document.body.appendChild(oButton);

	function simulateKeyboardOpen() {
		jQuery("#input").trigger("focus");
	}

	function simulateKeyboardClose() {
		jQuery("#button").trigger("focus");
	}

	var fnOrientationHandler;

	function stubOrentationChange (oSinonSandbox) {
		oSinonSandbox.stub(Device.orientation, "attachHandler", function(fnHandler, oThat) {
			fnOrientationHandler = jQuery.proxy(fnHandler,oThat);
		});
	}

	function simulateOrietationChange(oSinonSandbox, bLandscape) {
		var iOrientation = bLandscape ? 90 : 0;

		oSinonSandbox.stub(window, "orientation", iOrientation);
		fnOrientationHandler({
			landscape: bLandscape
		});
	}

	function simulateWindowDifference(oSinonSandbox, iDifference) {
		oSinonSandbox.stub(window, "outerHeight", 1000);
		oSinonSandbox.stub(window, "innerHeight", 1000 - iDifference);
	}


	QUnit.module("initialization");

	QUnit.test("Should do nothing when not in ios 7", function (assert) {
		//System under Test + Act
		var sut = new sap.m._Ios7();

		assert.strictEqual(sut._bIntervallAttached, undefined, "the interval property was not initialized");
		assert.strictEqual(sut._bInputIsOpen, undefined, "the keyboard property was not initialized");
		assert.strictEqual(sut._bNavigationBarEventFired, undefined, "the navBar property was not initialized");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should have initialized the class", function(assert) {
		stubIos7(this);

		//System under Test + Act
		var sut = new sap.m._Ios7();

		//Assert
		assert.strictEqual(sut._bIntervallAttached, false, "the interval property was initialized");
		assert.strictEqual(sut._bInputIsOpen, false, "the keyboard property was initialized");
		assert.strictEqual(sut._bNavigationBarEventFired, false, "the navBar property was initialized");
		assert.strictEqual(sut.getNavigationBarHeight(), 0, "the navBar height was 0");

		//Cleanup
		sut.destroy();
	});

	QUnit.module("events", {
		beforeEach : function() {
			simulateKeyboardClose();
		}
	});

	QUnit.test("Should handle portrait orientation change", function(assert) {
		stubIos7(this);
		var oOrientationSpy = this.spy(sap.m._Ios7.prototype, "_onOrientationChange");
		var oDetachSpy = this.spy(sap.m._Ios7.prototype, "_detachNavigationBarPolling");
		var oAttachSpy = this.spy(sap.m._Ios7.prototype, "_attachNavigationBarPolling");
		var oScrollToSpy = this.spy(window, "scrollTo");
		stubOrentationChange(this);

		//System under Test
		var sut = new sap.m._Ios7();


		//Act
		simulateOrietationChange(this, false);

		assert.strictEqual(oOrientationSpy.callCount, 1, "the orientation change was registered");
		assert.strictEqual(oScrollToSpy.callCount, 1, "scroll to was called");
		assert.strictEqual(oDetachSpy.callCount, 1, "polling was detached, since we are in portrait");
		assert.strictEqual(oAttachSpy.callCount, 0, "polling not attached, since we are in portrait");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should handle landscape orientation change without keyboard open", function(assert) {
		//Arrange
		stubIos7(this);
		var oOrientationSpy = this.spy(sap.m._Ios7.prototype, "_onOrientationChange");
		var oDetachSpy = this.spy(sap.m._Ios7.prototype, "_detachNavigationBarPolling");
		var oAttachSpy = this.spy(sap.m._Ios7.prototype, "_attachNavigationBarPolling");
		var oScrollToSpy = this.spy(window, "scrollTo");
		stubOrentationChange(this);
		simulateWindowDifference(this, 0); // no navigation bar
		//System under Test
		var sut = new sap.m._Ios7();

		//Act
		simulateOrietationChange(this, true);

		assert.strictEqual(oOrientationSpy.callCount, 1, "the orientation change was registered");
		assert.strictEqual(oScrollToSpy.callCount, 1, "scroll to was called");
		assert.strictEqual(oDetachSpy.callCount, 0, "polling was not detached, since we are in landscape");
		assert.strictEqual(oAttachSpy.callCount, 1, "polling was attached, since we are in landscape and the keyboard was closed");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should handle landscape orientation change with keyboard open", function(assert) {
		//Arrange
		stubIos7(this);
		var oOrientationSpy = this.spy(sap.m._Ios7.prototype, "_onOrientationChange");
		var oDetachSpy = this.spy(sap.m._Ios7.prototype, "_detachNavigationBarPolling");
		var oAttachSpy = this.spy(sap.m._Ios7.prototype, "_attachNavigationBarPolling");
		var oScrollToSpy = this.spy(window, "scrollTo");
		stubOrentationChange(this);
		simulateWindowDifference(this, 0); // no navigation bar

		//System under Test
		var sut = new sap.m._Ios7();

		simulateKeyboardOpen();

		//Act
		simulateOrietationChange(this, true);
		simulateKeyboardOpen();

		assert.strictEqual(oOrientationSpy.callCount, 1, "the orientation change was registered");
		assert.strictEqual(oScrollToSpy.callCount, 2, "scroll to was called");
		assert.strictEqual(oDetachSpy.callCount, 2, "polling was detached, since we are in landscape and the keyboard was open");
		assert.strictEqual(oAttachSpy.callCount, 1, "polling was attached on orientation change");
		assert.strictEqual(sut._bIntervallAttached, false, "the interval property was not attached because of landscape and open keyboard");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should attach the intervall properly", function (assert) {
		stubIos7(this);
		stubOrentationChange(this);
		simulateWindowDifference(this, 0); // no navigation bar

		//System under Test
		var sut = new sap.m._Ios7();

		simulateKeyboardOpen();
		assert.strictEqual(sut._bIntervallAttached, false, "the interval property was not attached because of portrait");

		simulateOrietationChange(this, true);
		simulateKeyboardOpen();
		assert.strictEqual(sut._bIntervallAttached, false, "the interval property was not attached because of landscape with keyboard open");

		simulateKeyboardClose();
		assert.strictEqual(sut._bIntervallAttached, true, "the interval property was attached because of landscape with keyboard close");

		simulateKeyboardOpen();
		assert.strictEqual(sut._bIntervallAttached, false, "the interval property was not attached because of landscape with keyboard open");

		simulateKeyboardClose();
		assert.strictEqual(sut._bIntervallAttached, true, "the interval property was attached because of landscape with keyboard close");

		simulateOrietationChange(this, false);
		assert.strictEqual(sut._bIntervallAttached, false, "the interval property was not attached because of portrait");
	});

	QUnit.test("Should fire the navigation bar event", function (assert) {
		//Arrange
		stubIos7(this);
		stubOrentationChange(this);
		simulateWindowDifference(this, 0); // no navigation bar
		var oEventSpy = this.spy();

		//System under Test
		var sut = new sap.m._Ios7();
		sut.attachEvent("navigationBarShownInLandscape", oEventSpy);
		assert.strictEqual(sut._bInputIsOpen, false, "the keyboard property was initialized");

		simulateKeyboardOpen();
		assert.strictEqual(sut._bInputIsOpen, true, "the keyboard was opened");
		simulateOrietationChange(this, true);
		assert.strictEqual(sut._bInputIsOpen, false, "the keyboard was closed by the orientation change");
		simulateKeyboardOpen();
		//simulate the nav bar opening
		simulateWindowDifference(this, 100);
		this.clock.tick(1000);

		assert.strictEqual(oEventSpy.callCount, 0, "event was not fired because the keyboard was opened");
		assert.strictEqual(sut.getNavigationBarHeight(), 0, "the navBar height was 0");

		simulateKeyboardClose();
		this.clock.tick(1000);
		assert.strictEqual(sut._bInputIsOpen, false, "the keyboard was closed");
		assert.strictEqual(oEventSpy.callCount, 1, "event was fired");
		assert.strictEqual(sut.getNavigationBarHeight(), 100, "the navBar height was 100");

		simulateOrietationChange(this, false);
		assert.strictEqual(sut.getNavigationBarHeight(), 0, "the navBar height was 0");
		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should not fire the navigation bar event", function (assert) {
		//Arrange
		stubIos7Ipad(this);
		stubOrentationChange(this);
		simulateWindowDifference(this, 0); // no navigation bar
		var oEventSpy = this.spy();

		//System under Test
		var sut = new sap.m._Ios7();
		sut.attachEvent("navigationBarShownInLandscape", oEventSpy);
		assert.strictEqual(sut._bInputIsOpen, false, "the keyboard property was initialized");

		simulateKeyboardOpen();
		assert.strictEqual(sut._bInputIsOpen, true, "the keyboard was opened");
		simulateOrietationChange(this, true);
		assert.strictEqual(sut._bInputIsOpen, false, "the keyboard was closed by the orientation change");
		simulateKeyboardOpen();
		//simulate the nav bar opening
		simulateWindowDifference(this, 100);
		this.clock.tick(1000);

		assert.strictEqual(oEventSpy.callCount, 0, "event was not fired because the keyboard was opened");

		simulateKeyboardClose();
		this.clock.tick(1000);
		assert.strictEqual(sut._bInputIsOpen, false, "the keyboard was closed");
		assert.strictEqual(oEventSpy.callCount, 0, "event was fired");

		//Cleanup
		sut.destroy();
	});

});