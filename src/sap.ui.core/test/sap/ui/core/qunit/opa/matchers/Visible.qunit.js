/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/test/matchers/Visible',
	'jquery.sap.global',
	'sap/m/Button'
], function (Visible, $, Button) {
	"use strict";

	QUnit.module("Matching", {
		beforeEach: function () {
			this.oVisibleMatcher = new Visible();
			this.oSpy = sinon.spy(this.oVisibleMatcher._oLogger, "debug");
			this.oButton = new Button();
		},

		afterEach: function () {
			this.oButton.destroy();
		}
	});

	QUnit.test("Should not match a Button without domref", function (assert) {
		// Act
		var oResult = this.oVisibleMatcher.isMatching(this.oButton);

		// Assert
		assert.ok(!oResult, "Control isn't matching");
		sinon.assert.calledWith(this.oSpy,  sinon.match(/is not rendered/));
	});

	QUnit.test("Should not match an invisible Button", function (assert) {
		// Arrange
		this.oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		// make the button invisible after rendering it
		this.oButton.$().hide();

		// Act
		var oResult = this.oVisibleMatcher.isMatching(this.oButton);

		// Assert
		assert.ok(!oResult, "Control isn't matching");
		sinon.assert.calledWith(this.oSpy,  sinon.match(/is not visible/));
	});

	QUnit.test("Should match a visible Button", function (assert) {
		// Arrange
		this.oButton.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Act
		var oResult = this.oVisibleMatcher.isMatching(this.oButton);

		// Assert
		assert.ok(oResult, "Control is matching");
		sinon.assert.notCalled(this.oSpy);
	});

});
