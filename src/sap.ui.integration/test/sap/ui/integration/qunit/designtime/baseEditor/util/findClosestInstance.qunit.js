/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/findClosestInstance",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout"
],
function (
	findClosestInstance,
	Button,
	VerticalLayout,
	HorizontalLayout
) {
	"use strict";

	QUnit.module("Base functionality", {
		beforeEach: function () {
			this.oLayout0 = new HorizontalLayout({
				id: "layout-0",
				content: [
					this.oLayout1 = new VerticalLayout({
						id: "layout-1",
						content: [
							this.oButton0 = new Button("button-0"),
							this.oLayout2 = new VerticalLayout({
								id: "layout-2",
								content: [
									this.oButton1 = new Button("button-1")
								]
							})
						]
					})
				]
			});
		},
		afterEach: function () {
			this.oLayout0.destroy();
		}
	}, function () {
		QUnit.test("when provided control is of a desired type", function (assert) {
			assert.strictEqual(findClosestInstance(this.oButton1, "sap.m.Button").getId(), "button-1");
		});

		QUnit.test("when desired control is ascendant of the specified control", function (assert) {
			assert.strictEqual(findClosestInstance(this.oButton1, "sap.ui.layout.HorizontalLayout").getId(), "layout-0");
		});

		QUnit.test("when desired control is not in hierarchy", function (assert) {
			assert.strictEqual(findClosestInstance(this.oButton1, "sap.m.Panel"), undefined);
		});

		QUnit.test("when search stops on the first found control of a type", function (assert) {
			assert.strictEqual(findClosestInstance(this.oButton1, "sap.ui.layout.VerticalLayout").getId(), "layout-2");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
