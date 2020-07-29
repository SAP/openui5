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
		assert.equal(this.oCustomControl.getCustomData()[0].getKey(), "badge", "Key is properly set by default on BadgeCustomData");

		//Act
		this.oCustomControl.getBadgeCustomData("badge").setKey("Nobadge");
		//Assert
		assert.equal(this.oCustomControl.getCustomData()[0].getKey(), "badge", "Key of BadgeCustomData stays unchanged");

		//Act
		this.oCustomControl.getBadgeCustomData("badge").setValue("");

		//Assert
		assert.equal(this.oCustomControl._isBadgeAttached, false, "Badge Disappears with invalid data provided (empty string)");

		//Act
		this.oCustomControl.getBadgeCustomData("badge").setValue(undefined);

		//Assert
		assert.equal(this.oCustomControl._isBadgeAttached, false, "Badge Disappears with invalid data provided (undefined)");

		//Act
		this.oCustomControl.getBadgeCustomData("badge").setValue("undefined");

		//Assert
		assert.equal(this.oCustomControl._isBadgeAttached, false, "Badge Disappears with invalid data provided ('undefined')");

		//Act
		this.oCustomControl.getBadgeCustomData("badge").setValue("10");
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
		assert.equal(oUpdateFuncStub.calledWith("100", "Updated", "CustomControl-sapMBadge"), true, "Update handler method called with correct data" +
			"- Updated");

		//Act
		this.oCustomControl.removeBadgeCustomData();

		//Assert
		assert.equal(oUpdateFuncStub.called, true, "Update handler method called");
		assert.equal(oUpdateFuncStub.calledWith("", "Disappear", "CustomControl-sapMBadge"), true, "Update handler method called with correct data" +
			"-Appeared");

		//Act
		this.oCustomControl.addCustomData(new BadgeCustomData({value: "100"}));

		//Assert
		assert.equal(oUpdateFuncStub.called, true, "Update handler method called");
		assert.equal(oUpdateFuncStub.calledWith("100", "Appear", "CustomControl-sapMBadge"), true, "Update handler method called with correct data" +
			"-Disappeared");
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