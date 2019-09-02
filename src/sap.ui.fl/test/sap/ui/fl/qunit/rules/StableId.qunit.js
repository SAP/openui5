/*global QUnit*/

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/ui/support/Bootstrap",
	"test-resources/sap/ui/support/TestHelper"
], function (
	UIComponent,
	ComponentContainer,
	XMLView,
	VerticalLayout,
	Button,
	JSONModel,
	Bootstrap,
	testRule
) {
	"use strict";

	QUnit.module("Base functionality", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent: function() {
					return new VerticalLayout({
						id: this.createId("layoutId"),
						content: [
							new Button(this.createId("buttonId")),
							new Button({
								text: "Missing stable id"
							}),
							new XMLView({ // Missing ID for view and implicit missing IDs for controls inside
								viewContent:
									'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
										'<l:VerticalLayout id="layout">' +
											'<m:Button text="Button 1" id="button1" />' +
										'</l:VerticalLayout>' +
									'</mvc:View>'
							})
						]
					});
				}
			});
			this.oComponent = new CustomComponent(); // Missing ID

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			Bootstrap.initSupportRules(["true", "silent"], {
				onReady: fnDone
			});
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			this.oComponent.destroy();
		}
	}, function () {
		testRule({
			executionScopeType: "global",
			libName: "sap.ui.fl",
			ruleId: "stableId",
			expectedNumberOfIssues: 5
		});
	});

	QUnit.module("Aggregation Binding via template", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent: function() {
					return new XMLView({
						id: this.createId("view"),
						viewContent:
							'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
								'<l:VerticalLayout id="layout" content="{/buttons}">' +
									'<l:content>' +
										'<m:Button text="{text}" />' +
									'</l:content>' +
								'</l:VerticalLayout>' +
							'</mvc:View>'
					});
				}
			});
			this.oComponent = new CustomComponent("comp");

			this.oModel = new JSONModel({
				buttons: [
					{ text: "Button 1" },
					{ text: "Button 2" },
					{ text: "Button 3" }
				]
			});
			this.oComponent.setModel(this.oModel);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			Bootstrap.initSupportRules(["true", "silent"], {
				onReady: fnDone
			});
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			this.oComponent.destroy();
		}
	}, function () {
		// Controls in bound aggregations should be ignored during the evaluation
		testRule({
			executionScopeType: "global",
			libName: "sap.ui.fl",
			ruleId: "stableId",
			expectedNumberOfIssues: 0
		});
	});

	QUnit.module("Aggregation Binding via factory function", {
		beforeEach: function (assert) {
			var fnDone = assert.async();
			var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
				createContent: function() {
					return new XMLView({
						id: this.createId("view"),
						viewContent:
							'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:l="sap.ui.layout">' +
								'<l:VerticalLayout id="layout" />' +
							'</mvc:View>'
					});
				}
			});
			this.oComponent = new CustomComponent("comp");

			this.oModel = new JSONModel({
				buttons: [
					{ text: "Button 1" },
					{ text: "Button 2" },
					{ text: "Button 3" }
				]
			});
			this.oComponent.setModel(this.oModel);

			this.oVerticalLayout = this.oComponent.getRootControl().byId("layout");
			this.oVerticalLayout.bindAggregation("content", "/buttons", function (sId) {
				return new Button(sId, {
					text: {
						path: "text"
					}
				});
			});

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			Bootstrap.initSupportRules(["true", "silent"], {
				onReady: fnDone
			});
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			this.oComponent.destroy();
		}
	}, function () {
		// Controls in bound aggregations should be ignored during the evaluation
		testRule({
			executionScopeType: "global",
			libName: "sap.ui.fl",
			ruleId: "stableId",
			expectedNumberOfIssues: 0
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});