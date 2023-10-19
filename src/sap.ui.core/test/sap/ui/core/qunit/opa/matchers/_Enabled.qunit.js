/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/test/matchers/_Enabled',
	'sap/m/Button',
	'sap/m/Page',
	'sap/m/Toolbar',
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_Enabled, Button, Page, Toolbar, nextUIUpdate) {
	"use strict";

	QUnit.module("_Enabled matcher", {
		beforeEach: function () {
			this.oButton = new Button("myButton");
			this.oPage = new Page("myPage");
			this.oToolbar = new Toolbar("myToolbar", {
				content: [this.oButton, this.oPage]
			});
			this.oToolbar.placeAt("qunit-fixture");
			this.oEnabledMatcher = new _Enabled();
			this.oSpy = sinon.spy(this.oEnabledMatcher._oLogger, "debug");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oSpy.restore();
			this.oToolbar.destroy();
			return nextUIUpdate();
		}
	});

	QUnit.test("Should match enabled control", function (assert) {
		assert.ok(this.oEnabledMatcher.isMatching(this.oButton));
		sinon.assert.notCalled(this.oSpy);
	});

	QUnit.test("Should not match disabled control", async function (assert) {
		this.oButton.setEnabled(false);
		await nextUIUpdate();

		assert.ok(!this.oEnabledMatcher.isMatching(this.oButton));
		sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Button#myButton' is not enabled");
	});

	QUnit.test("Should not match control with disabled ancestor", async function (assert) {
		this.oToolbar.setEnabled(false);
		await nextUIUpdate();

		assert.ok(!this.oEnabledMatcher.isMatching(this.oButton));
		sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Button#myButton' is not enabled");
	});

	QUnit.test("Should not match control when a parent is disabled and it has no Disabled propagator", async function (assert) {
		this.oToolbar.setEnabled(false);
		await nextUIUpdate();

		assert.ok(!this.oEnabledMatcher.isMatching(this.oPage));
		sinon.assert.calledWith(this.oSpy, "Control 'Element sap.m.Page#myPage' has a parent 'Element sap.m.Toolbar#myToolbar' that is not enabled");
	});
});
