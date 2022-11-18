/*global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/m/Column",
	"sap/m/Dialog",
	"sap/m/Table",
	"test-resources/sap/ui/support/TestHelper"
], function (Button, Column, Dialog, Table, testRule) {
	"use strict";

	QUnit.module("Dialog rule tests", {
		beforeEach: function () {

			var dialog1 = new Dialog({
				title: "Dialog 1",
				ariaLabelledBy: "t1",
				buttons: [new Button({
					press: function () {
						dialog1.close();
					},
					text: "Close"
				})],
				content: new Table("t1", {
					columns: [
						new Column(),
						new Column()
					]
				})
			});

			var dialog2 = new Dialog("d2", {
				title: "Dialog 2",
				buttons: [new Button({
					press: function () {
						dialog2.close();
					},
					text: "Close"
				})],
				content: new Table({
					columns: [
						new Column(),
						new Column()
					]
				})
			});

			var dialog3 = new Dialog({
				title: "Dialog 3",
				buttons: [new Button({
					press: function () {
						dialog1.close();
					},
					text: "Close"
				})],
				content: new Table("t3", {
					columns: [
						new Column(),
						new Column()
					]
				})
			});

			this.b1 = new Button({
				text:'Dialog 1',
				press: function(){
					dialog1.open();
				}
			});
			this.b1.placeAt("qunit-fixture");

			this.b2 = new Button({
				text:'Dialog 2',
				press: function(){
					dialog2.open();
				}
			});
			this.b2.placeAt("qunit-fixture");

			this.b3 = new Button({
				text:'Dialog 3',
				press: function(){
					dialog3.open();
				}
			});
			this.b3.placeAt("qunit-fixture");


		},
		afterEach: function () {
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
