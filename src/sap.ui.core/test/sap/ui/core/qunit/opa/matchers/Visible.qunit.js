/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/test/matchers/Visible',
	'sap/m/Button',
	"sap/ui/qunit/utils/nextUIUpdate"
], function (Visible, Button, nextUIUpdate) {
	"use strict";

	QUnit.module("Visible", {
		beforeEach: function () {
			this.oVisibleMatcher = new Visible();
			this.oSpy = sinon.spy(this.oVisibleMatcher._oLogger, "debug");
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			return nextUIUpdate();
		},

		afterEach: function () {
			this.oButton.destroy();
		}
	});

	QUnit.test("Should not match a Button without domref", async function (assert) {
		this.oButton.destroy();
		await nextUIUpdate();
		// Act
		var oResult = this.oVisibleMatcher.isMatching(this.oButton);

		// Assert
		assert.ok(!oResult, "Control isn't matching");
		sinon.assert.calledWith(this.oSpy,  sinon.match(/is not rendered/));
	});

	QUnit.test("Should not match an invisible Button", function (assert) {
		// make the button invisible after rendering it
		this.oButton.$().hide();

		// Act
		var oResult = this.oVisibleMatcher.isMatching(this.oButton);

		// Assert
		assert.ok(!oResult, "Control isn't matching");
		sinon.assert.calledWith(this.oSpy,  sinon.match(/is not visible/));
	});

	QUnit.test("Should not match an Button with style invisibility", function (assert) {
		// make the button invisible after rendering it
		this.oButton.$().css("visibility", "hidden");

		var oResult = this.oVisibleMatcher.isMatching(this.oButton);

		assert.ok(!oResult, "Should not match control with visibility: hidden");
		sinon.assert.calledWith(this.oSpy, sinon.match(/is not visible/));
	});

	QUnit.test("Should match a visible Button", function (assert) {
		// Act
		var oResult = this.oVisibleMatcher.isMatching(this.oButton);

		// Assert
		assert.ok(oResult, "Control is matching");
		sinon.assert.notCalled(this.oSpy);
	});

});
