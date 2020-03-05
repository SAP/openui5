/* global QUnit */

sap.ui.define([
	"sap/m/BusyIndicator",
	"sap/ui/core/Core",
	"sap/ui/core/Configuration",
	"sap/ui/Device",
	"sap/ui/qunit/qunit-css",
	"sap/ui/thirdparty/qunit",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/qunit/qunit-coverage",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function (BusyIndicator, Core, Configuration, Device) {
	"use strict";

	QUnit.module("sap.m.BusyIndicator API", {
		beforeEach: function () {
			this.oBusyInd = new BusyIndicator();

			this.oBusyInd.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oBusyInd.destroy();
			this.oBusyInd = null;
		}
	});

	QUnit.test("Default value for property text", function (assert) {
		assert.strictEqual(this.oBusyInd.getText(), "", "should be an empty string");
	});

	QUnit.test("Default value for property textDirection", function (assert) {
		assert.strictEqual(this.oBusyInd.getTextDirection(), "Inherit", "should be 'Inherit'");
	});

	QUnit.test("Default value for property customIcon", function (assert) {
		assert.strictEqual(this.oBusyInd.getCustomIcon(), "", "should be an empty string");
	});

	QUnit.test("Default value for property customIconRotationSpeed", function (assert) {
		assert.strictEqual(this.oBusyInd.getCustomIconRotationSpeed(), 1000, "should be 1000ms");
	});

	QUnit.test("Default value for property customIconDensityAware", function (assert) {
		assert.strictEqual(this.oBusyInd.getCustomIconDensityAware(), true, "should be 'TRUE'");
	});

	QUnit.test("Default value for property customIconWidth", function (assert) {
		assert.strictEqual(this.oBusyInd.getCustomIconWidth(), "44px", "should be 44px");
	});

	QUnit.test("Default value for property customIconHeight", function (assert) {
		assert.strictEqual(this.oBusyInd.getCustomIconHeight(), "44px", "should be 44px");
	});

	QUnit.test("Default value for property size", function (assert) {
		assert.strictEqual(this.oBusyInd.getSize(), "1rem", "should be 1rem");
	});

	QUnit.test("setText() sets the correct value to the control and the label", function (assert) {
		var text = "something text 2";
		this.oBusyInd.setText(text);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getText(), text, "CONTROL TEXT should be " + text);
		assert.strictEqual(this.oBusyInd._busyLabel.getText(), text, "LABEL TEXT should be " + text);
	});

	QUnit.test("setText() RE-sets (updates) the correct value to the control and the label", function (assert) {
		var sText = "Some text";
		this.oBusyInd.setText(sText);
		sap.ui.getCore().applyChanges();

		var sTextTwo = "Some text 2";
		this.oBusyInd.setText(sTextTwo);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getText(), sTextTwo, "CONTROL TEXT should be " + sTextTwo);
		assert.strictEqual(this.oBusyInd._busyLabel.getText(), sTextTwo, "LABEL TEXT should be " + sTextTwo);
	});


	QUnit.test("setTextDirection() sets the correct value to the control and the label", function (assert) {
		var sText = "Some Text";
		var sDir = "RTL";

		this.oBusyInd.setText(sText);
		this.oBusyInd.setTextDirection(sDir);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getTextDirection(), sDir, "CONTROL TEXT dir should be " + sDir);
		assert.strictEqual(this.oBusyInd._busyLabel.getTextDirection(), sDir, "LABEL TEXT dir should be " + sDir);
	});

	QUnit.test("setTextDirection() RE-sets (updates) the correct value to the control and the label", function (assert) {
		var sText = "Some text";
		var sDir = "RTL";

		this.oBusyInd.setText(sText);
		this.oBusyInd.setTextDirection(sDir);
		sap.ui.getCore().applyChanges();

		var sDirTwo = "LTR";
		this.oBusyInd.setTextDirection(sDirTwo);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getTextDirection(), sDirTwo, "CONTROL TEXT dir should be " + sDirTwo);
		assert.strictEqual(this.oBusyInd._busyLabel.getTextDirection(), sDirTwo, "LABEL TEXT dir should be " + sDirTwo);
	});

	QUnit.test("setCustomIcon() sets the correct value to the control and the image", function (assert) {
		var icon = "../images/settings_64.png";
		this.oBusyInd.setCustomIcon(icon);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIcon(), icon, "CONTROL ICON should be " + icon);
		assert.strictEqual(this.oBusyInd._iconImage.getSrc(), icon, "ICON src should be " + icon);
	});

	QUnit.test("setCustomIcon() RE-sets (updates) the correct value to the control and the image", function (assert) {
		var sIcon = "../images/settings_64.png";
		var sIconTwo = "../images/edit_48.png";

		this.oBusyInd.setCustomIcon(sIcon);
		sap.ui.getCore().applyChanges();

		this.oBusyInd.setCustomIcon(sIconTwo);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIcon(), sIconTwo, "CONTROL ICON should be " + sIconTwo);
		assert.strictEqual(this.oBusyInd._iconImage.getSrc(), sIconTwo, "ICON src should be " + sIconTwo);
	});

	QUnit.test("setCustomIconRotationSpeed() defaults to 0 when invalid value is set", function (assert) {
		this.oBusyInd.setCustomIconRotationSpeed(-123);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconRotationSpeed(), 0, "should default to 0");
		assert.throws(
			function() {
				this.oBusyInd.setCustomIconRotationSpeed("invalid");
			},
			/expected int for property/,
			"raised error message contains 'expected int for property'"
		);
	});

	QUnit.test("setCustomIconDensityAware() sets the correct value to the control and the image", function (assert) {
		var sIcon = "../images/settings_64.png";
		this.oBusyInd.setCustomIcon(sIcon);

		var bIsAware = false;
		this.oBusyInd.setCustomIconDensityAware(bIsAware);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconDensityAware(), bIsAware, "CONTROL density aware should be " + bIsAware);
		assert.strictEqual(this.oBusyInd._iconImage.getDensityAware(), bIsAware, "ICON density aware should be " + bIsAware);
	});

	QUnit.test("setCustomIconDensityAware() RE-sets (updates) the correct value to the control and the image", function (assert) {
		var sIcon = "../images/settings_64.png";
		this.oBusyInd.setCustomIcon(sIcon);

		var bIsAware = false;
		this.oBusyInd.setCustomIconDensityAware(bIsAware);
		sap.ui.getCore().applyChanges();


		var bIsAwareNew = true;
		this.oBusyInd.setCustomIconDensityAware(bIsAwareNew);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconDensityAware(), bIsAwareNew, "CONTROL density aware should be " + bIsAwareNew);
		assert.strictEqual(this.oBusyInd._iconImage.getDensityAware(), bIsAwareNew, "ICON density aware should be " + bIsAwareNew);
	});

	QUnit.test("setCustomIconWidth() sets the correct value to the control and the image", function (assert) {
		var sWidth = "1.5rem";
		this.oBusyInd.setCustomIconWidth(sWidth);

		var sIcon = "../images/settings_64.png";
		this.oBusyInd.setCustomIcon(sIcon);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconWidth(), sWidth, "CONTROL ICON width should be " + sWidth);
		assert.strictEqual(this.oBusyInd._iconImage.getWidth(), sWidth, "ICON width should be " + sWidth);
	});

	QUnit.test("setCustomIconWidth() RE-sets (updates) the correct value to the control and the image", function (assert) {
		var sWidth = "1.5rem";
		this.oBusyInd.setCustomIconWidth(sWidth);

		var sIcon = "../images/settings_64.png";
		this.oBusyInd.setCustomIcon(sIcon);
		sap.ui.getCore().applyChanges();

		var sWidthNew = "2.5rem";
		this.oBusyInd.setCustomIconWidth(sWidthNew);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconWidth(), sWidthNew, "CONTROL ICON width should be " + sWidthNew);
		assert.strictEqual(this.oBusyInd._iconImage.getWidth(), sWidthNew, "ICON width should be " + sWidthNew);
	});

	QUnit.test("setCustomIconHeight() sets the correct value to the control and the image", function (assert) {
		var sIcon = "../images/settings_64.png";
		this.oBusyInd.setCustomIcon(sIcon);

		var sHeight = "1.75rem";
		this.oBusyInd.setCustomIconHeight(sHeight);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconHeight(), sHeight, "CONTROL ICON height should be " + sHeight);
		assert.strictEqual(this.oBusyInd._iconImage.getHeight(), sHeight, "ICON height should be " + sHeight);
	});

	QUnit.test("setCustomIconHeight() RE-sets (updates) the correct value to the control and the image", function (assert) {
		var sIcon = "../images/settings_64.png";
		this.oBusyInd.setCustomIcon(sIcon);

		var sHeight = "1.75rem";
		this.oBusyInd.setCustomIconHeight(sHeight);
		sap.ui.getCore().applyChanges();

		var sHeightNew = "2.75rem";
		this.oBusyInd.setCustomIconHeight(sHeightNew);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconHeight(), sHeightNew, "CONTROL ICON height should be " + sHeightNew);
		assert.strictEqual(this.oBusyInd._iconImage.getHeight(), sHeightNew, "ICON height should be " + sHeightNew);
	});

	QUnit.module("sap.m.BusyIndicator Rendering", {
		beforeEach: function () {
			this.oBusyInd = new BusyIndicator();

			this.oBusyInd.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oBusyInd.destroy();
			this.oBusyInd = null;
		}
	});

	QUnit.test("Default animation is using LocalBusyIndicator", function (assert) {
		var done = assert.async();

		setTimeout(function () {
			var $localBusyInd = this.oBusyInd.$().find(".sapUiLocalBusyIndicator");

			assert.strictEqual($localBusyInd.length, 1, "local busy indicator should be rendered");

			done();
		}.bind(this), 0);
	});

	QUnit.test("Custom icon animation is using sap.m.Image", function (assert) {
		this.oBusyInd.setCustomIcon("../images/settings_64.png");
		sap.ui.getCore().applyChanges();

		var $image = this.oBusyInd.$().find(".sapMImg");
		assert.strictEqual($image.length, 1, "sap.m.Image shoud be rendered");
	});

	QUnit.test("Setting text property renders sap.m.Label", function (assert) {
		var text = "loading...";
		this.oBusyInd.setText(text);
		sap.ui.getCore().applyChanges();

		var $label = this.oBusyInd.$().find(".sapMLabel");
		assert.strictEqual($label.length, 1, "sap.m.Label shoud be rendered");
		assert.strictEqual($label.text(), text, "rendered text should be " + text);
	});

	QUnit.test("Animations have option to be disabled globally and this behaviour should be applied when there is a custom icon in the BusyIndicator", function (assert) {
		// arrange
		this.oBusyInd.setCustomIcon("../images/settings_64.png");
		Core.applyChanges();
		var oDefaultAnimation = {
			animationName: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-name'),
			animationDuration: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-duration'),
			animationDelay: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-delay'),
			animationIterationCount: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-iteration-count'),
			animationDirection: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-direction'),
			animationFillMode: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-fill-mode'),
			animationPlayState: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-play-state')
		};

		// act
		Core.getConfiguration().setAnimationMode(Configuration.AnimationMode.none);
		Core.applyChanges();

		var oUpdatedAnimation = {
			animationName: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-name'),
			animationDuration: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-duration'),
			animationDelay: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-delay'),
			animationIterationCount: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-iteration-count'),
			animationDirection: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-direction'),
			animationFillMode: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-fill-mode'),
			animationPlayState: this.oBusyInd.$().find(".sapMBsyIndIcon").css('animation-play-state')
		};
		// assert
		assert.notDeepEqual(oUpdatedAnimation, oDefaultAnimation, "Animation is changed");
	});

	QUnit.module("sap.m.BusyIndicator with custom icon", {
		beforeEach: function () {
			this.oBusyInd = new BusyIndicator({
				customIcon:'images/synchronise_48.png',
				customIconRotationSpeed: 5000
			});

			this.oBusyInd.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oBusyInd.destroy();
			this.oBusyInd = null;
		}
	});

	QUnit.test("setCustomIconWidth sets the correct width of the custom icon", function (assert) {
		// arrange
		this.oBusyInd.setCustomIconWidth("100px");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(document.getElementById(this.oBusyInd.getId() + "-icon").style.width, "100px", "should be 100px");
	});

	QUnit.test("setCustomIconHeight sets the correct height of the custom icon", function (assert) {
		// arrange
		this.oBusyInd.setCustomIconHeight("100px");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(document.getElementById(this.oBusyInd.getId() + "-icon").style.height, "100px", "should be 100px");
	});
});
