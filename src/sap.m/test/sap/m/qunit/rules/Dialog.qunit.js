/*global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"test-resources/sap/ui/support/TestHelper"
], function (jQuery, testRule) {
	"use strict";

	QUnit.module("Dialog rule tests", {
		setup: function () {

			var dialog1 = new sap.m.Dialog({
				title: "Dialog 1",
				ariaLabelledBy: "t1",
				buttons: [new sap.m.Button({
					press: function () {
						dialog1.close();
					},
					text: "Close"
				})],
				content: new sap.m.Table("t1", {
					columns: [
						new sap.m.Column(),
						new sap.m.Column()
					]
				})
			});

			var dialog2 = new sap.m.Dialog("d2", {
				title: "Dialog 2",
				buttons: [new sap.m.Button({
					press: function () {
						dialog2.close();
					},
					text: "Close"
				})],
				content: new sap.m.Table({
					columns: [
						new sap.m.Column(),
						new sap.m.Column()
					]
				})
			});

			var dialog3 = new sap.m.Dialog({
				title: "Dialog 3",
				buttons: [new sap.m.Button({
					press: function () {
						dialog1.close();
					},
					text: "Close"
				})],
				content: new sap.m.Table("t3", {
					columns: [
						new sap.m.Column(),
						new sap.m.Column()
					]
				})
			});

			this.b1 = new sap.m.Button({
				text:'Dialog 1',
				press: function(){
					dialog1.open();
				}
			});
			this.b1.placeAt("qunit-fixture");

			this.b2 = new sap.m.Button({
				text:'Dialog 2',
				press: function(){
					dialog2.open();
				}
			});
			this.b2.placeAt("qunit-fixture");

			this.b3 = new sap.m.Button({
				text:'Dialog 3',
				press: function(){
					dialog3.open();
				}
			});
			this.b3.placeAt("qunit-fixture");


		},
		teardown: function () {
			this.b1.destroy();
			this.b2.destroy();
			this.b3.destroy();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.m",
		ruleId: "dialogAriaLabelledBy",
		expectedNumberOfIssues: 2
	});
});
