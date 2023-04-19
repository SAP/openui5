/*global QUnit */
sap.ui.define([
	"sap/ui/test/matchers/Descendant",
	"sap/m/Button",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function (Descendant, Button, HorizontalLayout, opaTest, Opa5) {
	"use strict";

	QUnit.module("Descendant", {
		beforeEach : function(){
			this.oLayout1 = new HorizontalLayout({id: "layout1"});
			this.oLayout2 = new HorizontalLayout({id: "layout2"});
			this.oButton = new Button("myButton");
			this.oButton.placeAt(this.oLayout2);
		},
		afterEach : function(){
			this.oButton.destroy();
			this.oLayout1.destroy();
			this.oLayout2.destroy();
		}
	});

	QUnit.test("Should match direct child", function (assert) {
		[this.oButton, "myButton"].forEach(function (vButton) {
			var bResult = new Descendant(vButton)(this.oLayout1);
			assert.ok(!bResult, "Button should not be descendant of layout1");

			bResult = new Descendant(vButton)(this.oLayout2);
			assert.ok(bResult, "Button should be descendant of layout2");

			bResult = new Descendant(vButton, true)(this.oLayout2);
			assert.ok(bResult, "Button should be child of layout2");
		}.bind(this));
	});

	QUnit.test("Should match across multiple levels Descendant", function (assert) {
		this.oLayout2.placeAt(this.oLayout1);

		[this.oButton, "myButton"].forEach(function (vButton) {
			var bResult = new Descendant(this.oButton)(this.oLayout1);
			assert.ok(bResult, "Button should be descendant of layout1");

			bResult = new Descendant(this.oButton, true)(this.oLayout1);
			assert.ok(!bResult, "button should not be child of layout1");
		}.bind(this));
	});

	QUnit.test("Should match undefined Descendant", function (assert) {
		var bResult = new Descendant(undefined)(this.oButton);
		assert.ok(bResult, "Should not filter controls when no descendant is given");
	});

	opaTest("Should find descendant - iframe", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/core/qunit/opa/fixture/miniUI5Site.html");
		When.waitFor({
			controlType: "sap.m.Button",
			viewName: "myView",
			id: "myButton",
			success: function (oButton) {
				this.waitFor({
					controlType: "sap.m.Page",
					matchers: new Descendant(oButton), //instance
					success: function (aPages) {
						Opa5.assert.ok(oButton instanceof Opa5.getPlugin().getControlConstructor("sap.m.Button"), "Descendant is found in iframe");
						Opa5.assert.ok(aPages,length, 1);
						Opa5.assert.ok(aPages[0] instanceof Opa5.getPlugin().getControlConstructor("sap.m.Page"));
						this.waitFor({
							controlType: "sap.m.Page",
							matchers: new Descendant(oButton.getId()), // ID declaration
							success: function (aPages) {
								Opa5.assert.ok(aPages,length, 1);
								Opa5.assert.ok(aPages[0] instanceof Opa5.getPlugin().getControlConstructor("sap.m.Page"), "Descendant is found in iframe");
								Opa5.assert.ok(aPages[0].getId().match("page1"));
							}
						});
					}
				});
			}
		});
		Then.iTeardownMyApp();
	});
});
