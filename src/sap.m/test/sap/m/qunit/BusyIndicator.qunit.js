(function () {
	"use strict";

	QUnit.module("sap.m.BusyIndicator API", {
		setup: function () {
			this.oBusyInd = new sap.m.BusyIndicator();

			this.oBusyInd.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
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

	QUnit.test("setTextDirection() sets the correct value to the control and the label", function (assert) {
		var dir = "RTL";
		this.oBusyInd.setTextDirection(dir);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getTextDirection(), dir, "CONTROL TEXT dir should be " + dir);
		assert.strictEqual(this.oBusyInd._busyLabel.getTextDirection(), dir, "LABEL TEXT dir should be " + dir);
	});

	QUnit.test("setCustomIcon() sets the correct value to the control and the image", function (assert) {
		var icon = "../images/settings_64.png";
		this.oBusyInd.setCustomIcon(icon);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIcon(), icon, "CONTROL ICON should be " + icon);
		assert.strictEqual(this.oBusyInd._iconImage.getSrc(), icon, "ICON src should be " + icon);
	});

	QUnit.test("setCustomIconRotationSpeed() defaults to 0 when invalid value is set", function (assert) {
		this.oBusyInd.setCustomIconRotationSpeed(-123);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oBusyInd.getCustomIconRotationSpeed(), 0, "should default to 0");

		this.oBusyInd.setCustomIconRotationSpeed("invalid");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(this.oBusyInd.getCustomIconRotationSpeed(), 0, "should default to 0");
	});

	QUnit.test("setCustomIconDensityAware() sets the correct value to the control and the image", function (assert) {
		var isAware = false;
		this.oBusyInd.setCustomIconDensityAware(isAware);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconDensityAware(), isAware, "CONTROL density aware should be " + isAware);
		assert.strictEqual(this.oBusyInd._iconImage.getDensityAware(), isAware, "ICON density aware should be " + isAware);
	});

	QUnit.test("setCustomIconWidth() sets the correct value to the control and the image", function (assert) {
		var width = "1.5rem";
		this.oBusyInd.setCustomIconWidth(width);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconWidth(), width, "CONTROL ICON width should be " + width);
		assert.strictEqual(this.oBusyInd._iconImage.getWidth(), width, "ICON width should be " + width);
	});

	QUnit.test("setCustomIconHeight() sets the correct value to the control and the image", function (assert) {
		var height = "1.75rem";
		this.oBusyInd.setCustomIconHeight(height);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oBusyInd.getCustomIconHeight(), height, "CONTROL ICON height should be " + height);
		assert.strictEqual(this.oBusyInd._iconImage.getHeight(), height, "ICON height should be " + height);
	});

	QUnit.module("sap.m.BusyIndicator Rendering", {
		setup: function () {
			this.oBusyInd = new sap.m.BusyIndicator();

			this.oBusyInd.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		teardown: function () {
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
}());
