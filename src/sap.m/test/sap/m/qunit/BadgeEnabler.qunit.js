/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/m/BadgeEnabler",
	"sap/base/Log",
	"sap/m/BadgeCustomData"
], function(
	Control,
	Core,
	BadgeEnabler,
	Log,
	BadgeCustomData
){
	"use strict";

	var MyCustomControl = Control.extend("sap.custom.MyCustomControl", {
		metadata: {
			library: "sap.m",
			interfaces: "sap.m.IBadge"
		},
		renderer: {
			render: function(oRm, oControl) {
				oRm.write("<div");
				oRm.writeClasses();
				oRm.writeControlData(oControl);
				oRm.writeStyles();
				oRm.write(">");
				oRm.write("</div>");
			}
		}
	});

	BadgeEnabler.call(MyCustomControl.prototype);

	MyCustomControl.prototype.init = function(){
		this.initBadgeEnablement();
	};

	MyCustomControl.prototype.onBadgeUpdate = function(){
		return true;
	};

	MyCustomControl.prototype.getAriaLabelBadgeText = function(){
		return this.getBadgeCustomData().getValue() + " items";
	};

	QUnit.module("Basic", {
		beforeEach: function() {
			this.oCustomControl = new MyCustomControl({id: "CustomControl"});
			this.oCustomControl.addCustomData(new BadgeCustomData({value: "10"}));
			this.oCustomControl.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCustomControl.destroy();
			this.oCustomControl = null;
		}
	});

	QUnit.test("Initialisation", function (assert) {

		//Assert
		assert.equal(this.oCustomControl.getCustomData()[0].getValue(), "10", "Value is properly set on BadgeCustomData");
		assert.equal(this.oCustomControl.getCustomData()[0].getVisible(), true, "Badge is visible by default");

		//Act
		this.oCustomControl.getBadgeCustomData().setVisible(false);

		//Assert
		assert.equal(this.oCustomControl._isBadgeAttached, false, "Badge Disappears with invalid data provided (empty string)");

		//Act
		this.oCustomControl.getBadgeCustomData().setVisible(true);

		//Act
		this.oCustomControl.getBadgeCustomData().setValue("undefined");

		//Assert
		assert.equal(this.oCustomControl.$("sapMBadge").attr("data-badge"), "", "Badge shows empty string when invalid data " +
			"provided ('undefined')");

		//Act
		this.oCustomControl.getBadgeCustomData().setValue("null");

		//Assert
		assert.equal(this.oCustomControl.$("sapMBadge").attr("data-badge"), "", "Badge shows empty string when invalid data " +
			"provided (null)");

		//Act
		this.oCustomControl.getBadgeCustomData().setValue("10");
		this.oCustomControl.removeAllCustomData();
		Core.applyChanges();

		//Assert
		assert.equal(this.oCustomControl._isBadgeAttached, false, "Badge Disappears when badgeCustomData is detached");

		this.oCustomControl.setBadgeAccentColor("AccentColor6");

		assert.equal(this.oCustomControl._oBadgeConfig.accentColor, "AccentColor6", "API for configuration change works correctly - color");
		assert.equal(this.oCustomControl._oBadgeContainer.hasClass("sapMBadgeAccentColor6"), true, "API for configuration change works correctly - color");

		this.oCustomControl.setBadgePosition("topRight");

		assert.equal(this.oCustomControl._oBadgeConfig.position, "topRight", "API for configuration change works correctly - position");
		assert.equal(this.oCustomControl._oBadgeContainer.hasClass("sapMBadgeTopRight"), true, "API for configuration change works correctly - position");
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oCustomControl = new MyCustomControl({id: "CustomControl"});
			this.oCustomControl.addCustomData(new BadgeCustomData({value: "10"}));
			this.oCustomControl.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCustomControl.destroy();
			this.oCustomControl = null;
		}
	});


	QUnit.test("API", function (assert) {

		//Arrange
		var oUpdateFuncStub = sinon.spy(this.oCustomControl, "onBadgeUpdate");

		//Act
		this.oCustomControl.addCustomData(new BadgeCustomData({value: "100"}));

		//Assert
		assert.equal(oUpdateFuncStub.calledOnce, true, "Update handler method called");
		assert.equal(oUpdateFuncStub.calledWith("100", "Appear", "CustomControl-sapMBadge"), true, "Update handler method called with correct data" +
			" - Appeared");

		//Act
		this.oCustomControl.getBadgeCustomData().setValue("101");

		//Assert
		assert.equal(oUpdateFuncStub.calledWith("101", "Updated", "CustomControl-sapMBadge"), true, "Update handler method called with correct data" +
			" - Updated");

		//Act
		this.oCustomControl.getBadgeCustomData().setVisible(false);

		//Assert
		assert.equal(oUpdateFuncStub.calledWith("", "Disappear", "CustomControl-sapMBadge"), true, "Update handler method called with correct data" +
			" - Disappeared");

		//Act
		this.oCustomControl.getBadgeCustomData().setVisible(true);
		this.oCustomControl.getBadgeCustomData().setValue("10");
		this.oCustomControl.getBadgeCustomData().setVisible(false);

		//Assert
		assert.equal(this.oCustomControl.getBadgeCustomData().getValue(), "10", "Value is saved aside from visibility");

		//Act
		this.oCustomControl.getBadgeCustomData().setValue("13");

		//Assert
		assert.equal(this.oCustomControl.getBadgeCustomData().getValue(), "13", "Value is updated aside from visibility");

		//Act
		this.oCustomControl.getBadgeCustomData().setVisible(true);

		//Assert
		assert.equal(this.oCustomControl.getBadgeCustomData().getValue(), "13", "Value is kept aside from visibility");

		//Act
		this.oCustomControl.removeBadgeCustomData();
		this.oCustomControl.addCustomData(new BadgeCustomData({visible: false, value: "100"}));

		//Assert
		assert.equal(this.oCustomControl.getBadgeCustomData().getValue(), "100", "Value is registered if the badge is" +
			" invisible on initialisation");

		//Act
		this.oCustomControl.getBadgeCustomData().setVisible(true);

		//Assert
		assert.equal(this.oCustomControl.$("sapMBadge").attr("data-badge"), "100", "Value is applied when badge turns" +
			"visible");

	});

	QUnit.test("null and undefined values", function (assert) {

		//Arrange
		this.oCustomControl.getBadgeCustomData().setValue(undefined);

		//Assert
		assert.equal(this.oCustomControl.$("sapMBadge").attr("data-badge"), "", "Value is set to the default, when" +
			" try adding 'undefined' as a value");

		//Arrange
		this.oCustomControl.getBadgeCustomData().setValue("10");

		//Act
		this.oCustomControl.getBadgeCustomData().setValue(null);

		//Assert
		assert.equal(this.oCustomControl.$("sapMBadge").attr("data-badge"), "", "Value is set to the default, when" +
			" try adding 'null' as a value");

	});

	QUnit.module("ACC", {
		beforeEach: function() {
			this.oCustomControl = new MyCustomControl({id: "CustomControl"});
			this.oCustomControl.addCustomData(new BadgeCustomData({value: "10"}));
			this.oCustomControl.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCustomControl.destroy();
			this.oCustomControl = null;
		}
	});

	QUnit.test("ACC", function(assert) {
		assert.equal(this.oCustomControl._oBadgeContainer.find(".sapMBadgeIndicator").attr("aria-label"), "10 items", "Aria-label with custom  text" +
			" set properly");
	});
});