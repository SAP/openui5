/*global QUnit testRule*/

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button"
], function (
	jQuery,
	Component,
	ComponentContainer,
	XMLView,
	VerticalLayout,
	Button
) {
	"use strict";

	QUnit.module("sap.ui.fl stableId rule tests", {
		beforeEach: function () {
			var CustomComponent = sap.ui.core.UIComponent.extend("sap.ui.dt.test.Component", {
				createContent : function() {
					return new VerticalLayout({
						id : this.createId("layoutId"),
						content: [
							new Button(this.createId("buttonId")),
							new Button({
								text: "Missing stable id"
							}),
							new XMLView({ //missing id for view and implicit missing ids for controls inside
								viewContent : 	'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns:l="sap.ui.layout">' +
													'<l:VerticalLayout id="layout">' +
														'<m:Button text="Button 1" id="button1" />' +
													'</l:VerticalLayout>' +
												'</mvc:View>'
							})
						]
					});
				}
			});
			this.oComponent = new CustomComponent(); //missing id shouldn't care

			this.oComponentContainer = new sap.ui.core.ComponentContainer("CompCont1", {
				component: this.oComponent
			});

			this.oComponentContainer.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oComponentContainer.destroy();
			this.oComponent.destroy();
		}
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.ui.fl",
		ruleId: "stableId",
		expectedNumberOfIssues: 5
	});
});
