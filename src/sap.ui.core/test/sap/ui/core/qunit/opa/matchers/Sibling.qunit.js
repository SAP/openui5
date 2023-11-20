/*global QUnit */
sap.ui.define([
	"sap/ui/test/matchers/Sibling",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Toolbar",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (Sibling, Button, HorizontalLayout, VerticalLayout, List, StandardListItem, Toolbar, nextUIUpdate) {
	"use strict";

	QUnit.module("Sibling", {
		beforeEach : function(){
			this.oButtonLeft = new Button("left");
			this.oButtonRight = new Button("right");
			this.oItem1 = new StandardListItem({ title: "Item1" });
			this.oItem2 = new StandardListItem({ title: "Item2" });
			this.oToolbar = new Toolbar();
			this.oButtonNotSibling = new Button("notSibling");
			this.oLayout = new HorizontalLayout("layout", {
				content: [
					this.oButtonLeft,
					this.oButtonRight,
					new VerticalLayout({
						content: [
							this.oButtonNotSibling
						]
					}),
					new List("list", {
						items: [
							this.oItem1,
							this.oItem2
						],
						headerToolbar: this.oToolbar
					})
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach : function(){
			this.oLayout.destroy();
		}
	});

	QUnit.test("Should match Sibling - aggregation", function (assert) {
		var bResult = new Sibling(this.oButtonRight)(this.oButtonLeft);
		assert.ok(bResult, "Should find control");
	});

	QUnit.test("Should match Sibling - dom, prev", function (assert) {
		var bResult = new Sibling(this.oItem2, {
			useDom: true,
			prev: true
		})(this.oItem1);
		assert.ok(bResult, "Should find prev control");
	});

	QUnit.test("Should match Sibling - dom, next", function (assert) {
		var bResult = new Sibling(this.oItem1, {
			useDom: true,
			next: true
		})(this.oItem2);
		assert.ok(bResult, "Should find next control");
	});

	QUnit.test("Should match undefined Sibling", function (assert) {
		var bResult = new Sibling(undefined)(this.oButtonLeft);
		assert.ok(bResult, "Should not filter controls when no sibling is given");
	});

	QUnit.test("Should not match when order is not defined - dom", function (assert) {
		var bResult = new Sibling(this.oItem1, { useDom: true })(this.oItem2);
		assert.ok(!bResult, "Should find prev control");
	});

	QUnit.test("Should match when aggregation is different", function (assert) {
		var bResult = new Sibling(this.oItem1)(this.oToolbar);
		assert.ok(bResult, "Should find relative");
	});

	QUnit.test("Should match when parent is different", function (assert) {
		var bResult = new Sibling(this.oButtonRight)(this.oButtonNotSibling);
		assert.ok(bResult, "Should find relative");
	});

	QUnit.test("Should not match when parent is different and level is set to 1", function (assert) {
		var bResult = new Sibling(this.oItem1, {
			level: 1
		})(this.oButtonNotSibling);
		assert.ok(!bResult, "Should not find sibling");
	});
});
