/*global QUnit */
sap.ui.define([
	"sap/ui/test/matchers/Ancestor",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout"
], function (Ancestor, Button, HorizontalLayout) {
	"use strict";

	QUnit.module("Ancestor", {
		beforeEach : function(){
			this.oLayout1 = new HorizontalLayout({id: "layout1"});
			this.oLayout2 = new HorizontalLayout({id: "layout2"});
			this.oButton = new Button();
			this.oButton.placeAt(this.oLayout2);
		},
		afterEach : function(){
			this.oButton.destroy();
			this.oLayout1.destroy();
			this.oLayout2.destroy();
		}
	});

	QUnit.test("Should match direct parent", function (assert) {
		[[this.oLayout1, this.oLayout2], ["layout1", "layout2"]].forEach(function (layouts) {
			var bResult = new Ancestor(layouts[0])(this.oButton);
			assert.strictEqual(bResult, false, "Layout1 is not an ancestor");

			bResult = new Ancestor(layouts[1])(this.oButton);
			assert.strictEqual(bResult, true, "Layout2 is an ancestor");

			bResult = new Ancestor(layouts[1], true)(this.oButton);
			assert.strictEqual(bResult, true, "Layout2 is a direct ancestor (parent)");
		}.bind(this));
	});

	QUnit.test("Should match across multiple level's ancestor", function (assert) {
		this.oLayout2.placeAt(this.oLayout1);

		[this.oLayout1, "layout1"].forEach(function (layout) {
			var bResult = new Ancestor(layout)(this.oButton);
			assert.strictEqual(bResult, true, "Layout1 is an ancestor");

			bResult = new Ancestor(layout, true)(this.oButton);
			assert.strictEqual(bResult, false, "Layout1 is not a direct ancestor");
		}.bind(this));
	});

	QUnit.test("Should match undefined ancestor", function (assert) {
		var bResult = new Ancestor(undefined)(this.oButton);
		assert.strictEqual(bResult, true, "No ancestor means valid");
	});

});
