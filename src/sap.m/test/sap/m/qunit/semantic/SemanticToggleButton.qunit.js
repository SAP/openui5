/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/m/ToggleButton",
	"sap/m/semantic/SemanticPage",
	"sap/m/semantic/FlagAction",
	"sap/m/semantic/SemanticOverflowToolbarToggleButton"
], function(
	ToggleButton,
	SemanticPage,
	FlagAction,
	SemanticOverflowToolbarToggleButton
) {
	"use strict";

	QUnit.module("private members", {
		beforeEach: function () {
			this.oSemanticToggleButtonButton = new FlagAction(); // using FlagAction for configuration
		},
		afterEach: function () {
			this.oSemanticToggleButtonButton.destroy();
			this.oSemanticToggleButtonButton = null;
		}
	});

	QUnit.test("_getClass", function (assert) {
		// Arrange
		var oClassIconOnly = this.oSemanticToggleButtonButton._getClass({constraints: "IconOnly"}),
		    oClass = this.oSemanticToggleButtonButton._getClass();

		// Assert
		assert.strictEqual(oClassIconOnly === SemanticOverflowToolbarToggleButton, true,
			"Should return SemanticOverflowToggleButton constructor");
		assert.strictEqual(oClass === ToggleButton, true,
			"Should return ToggleButton constructor");
	});
});