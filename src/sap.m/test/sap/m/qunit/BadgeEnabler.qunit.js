/* global QUnit */

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
});