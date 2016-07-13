/* global QUnit sinon */

jQuery.sap.require("sap.ui.qunit.qunit-coverage");

jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

jQuery.sap.require("sap.m.Button");
jQuery.sap.require("sap.m.Input");
jQuery.sap.require("sap.m.Label");
jQuery.sap.require("sap.m.ObjectHeader");
jQuery.sap.require("sap.m.ObjectAttribute");
jQuery.sap.require("sap.ui.core.Title");
jQuery.sap.require("sap.ui.layout.form.SimpleForm");
jQuery.sap.require("sap.ui.layout.VerticalLayout");
jQuery.sap.require("sap.ui.dt.command.BaseCommand");
jQuery.sap.require("sap.ui.dt.command.CommandFactory");

(function() {
	"use strict";

	var CommandFactory = sap.ui.dt.command.CommandFactory;

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a command factory", {
		beforeEach : function(assert) {

			this.oTitle0 = new sap.ui.core.Title({
				text : "Title 0"
			});
			this.oTitle1 = new sap.ui.core.Title({
				text : "Title 1"
			});
			this.oLabel0 = new sap.m.Label({
				text : "Label 0"
			});
			this.oLabel1 = new sap.m.Label({
				text : "Label 1"
			});
			this.oLabel2 = new sap.m.Label({
				text : "Label 2"
			});
			this.oLabel3 = new sap.m.Label({
				text : "Label 3"
			});
			this.oInput0 = new sap.m.Input();
			this.oInput1 = new sap.m.Input();
			this.oInput2 = new sap.m.Input();
			this.oInput3 = new sap.m.Input();
			
			this.oSimpleForm = new sap.ui.layout.form.SimpleForm({
				layout : "ResponsiveGridLayout",
				title : "Simple Form",
				content : [this.oTitle0, this.oLabel0, this.oInput0, this.oLabel1, this.oInput1, this.oTitle1, this.oLabel2,
						this.oInput2, this.oLabel3, this.oInput3]
			});

			this.oVisibleControl = new sap.m.Button();

			// Test Setup:
			// VerticalLayout
			// content
			// ObjectHeader
			// attributes
			// ObjectAttribute
			// Button

			this.oButton = new sap.m.Button();
			this.oObjectAttribute = new sap.m.ObjectAttribute({
				text : "Some attribute"
			});
			this.oObjectHeader = new sap.m.ObjectHeader({
				// title : "header",
				attributes : [this.oObjectAttribute]
			});
			this.oLayout = new sap.ui.layout.VerticalLayout({
				content : [this.oObjectHeader, this.oButton]
			});

		},
		afterEach : function(assert) {
			this.oSimpleForm.destroy();
			this.oVisibleControl.destroy();
			this.oLayout.destroy();
		}
	});

	QUnit.test("when getting a base command,", function(assert) {
		var oCmd = new sap.ui.dt.command.BaseCommand();
		assert.ok(oCmd, "then command can be instantiated");
	});

	QUnit.test("when getting a move command,", function(assert) {
		var oCmd = CommandFactory.getCommandFor(this.oVisibleControl, "Move");
		assert.ok(oCmd, "then command can be instantiated");
		assert.strictEqual(oCmd.getName(), "Move");
		assert.strictEqual(oCmd.getElement(), this.oVisibleControl);
	});

	QUnit.test("when getting a regular Move command,", function(assert) {

		var oCmd = CommandFactory.getCommandFor(this.oLayout, "Move", {
			movedElements : [{
				element : this.oButton,
				sourceIndex : 1,
				targetIndex : 0
			}],
			source : {
				parent : this.oLayout,
				aggregation : 'content',
				index : 1
			},
			target : {
				parent : this.oLayout,
				aggregation : 'content',
				index : 0
			}
		});

		oCmd.execute();

		var aContent = this.oLayout.getContent();
		assert.equal(aContent[0].getId(), this.oButton.getId(), "then the button is at position 0");
		assert.equal(aContent[1].getId(), this.oObjectHeader.getId(), "then the object header is at position 1");
		assert.equal(aContent.length, 2, "then the content aggregation has still the expected size");
		assert.ok(oCmd, "then command can be instantiated");
	});

})();
