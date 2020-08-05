/*global QUnit*/
sap.ui.define([
	'sap/ui/test/matchers/_Visitor',
	'sap/m/Button',
	'sap/m/Toolbar',
	'sap/m/Page'
], function (_Visitor, Button, Toolbar, Page) {
	"use strict";

	QUnit.module("_Visitor", {
		beforeEach: function () {
			this.oButton = new Button();
			this.oToolbar = new Toolbar({
				content: [this.oButton]
			});
			this.oPage = new Page({
				content: [this.oToolbar]
			});
			this.oPage.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.oVisitor = new _Visitor();
		},
		afterEach: function () {
			this.oPage.destroy();
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Should match control", function (assert) {
		assert.ok(this.oVisitor.isMatching(this.oButton, function (oControl) {
			return oControl.getEnabled() === true;
		}), "Control matches condition");
	});

	QUnit.test("Should match ancestor", function (assert) {
		assert.ok(this.oVisitor.isMatching(this.oButton, function (oControl) {
			return oControl.getMetadata().getName() === "sap.m.Page";
		}), "Control matches condition");
	});

	QUnit.test("Should match direct ancestor only", function (assert) {
		assert.ok(!this.oVisitor.isMatching(this.oButton, function (oControl) {
			return oControl.getMetadata().getName() === "sap.m.Page";
		}, true), "Control matches condition");
	});
});
