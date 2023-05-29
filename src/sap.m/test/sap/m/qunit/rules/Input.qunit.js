/*global QUnit */

sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/library",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Page",
	"sap/m/Panel",
	"test-resources/sap/ui/support/TestHelper"
], function (
	XMLView,
	JSONModel,
	SimpleForm,
	layoutLib,
	Input,
	Label,
	Page,
	Panel,
	testRule
) {
	"use strict";

	QUnit.module("Input rule tests", {
		beforeEach: function () {
			this.page = new Page({
				content: [
					new Panel({
						id: "inputTestsContext",
						content: [
							new Input(),
							new Label({
								text: "Label",
								labelFor: "inputWithLabelFor"
							}),
							new Input("inputWithLabelFor")
						]
					})
				]
			});
			this.page.placeAt("qunit-fixture");

			// Input in sap.ui.layout.form.SimpleForm
			this.simpleForm = new SimpleForm({
				id: "simpleForm",
				layout: layoutLib.form.SimpleFormLayout.ColumnLayout,
				title: "Form title",
				content:[
					new Label({
						text:"Label"
					}),
					new Input("inputInSimpleForm")
				]
			});
			this.simpleForm.placeAt("qunit-fixture");

			// Input in sap.m.Table
			return XMLView.create({
				id: "tableWithTemplate",
				definition: '<mvc:View xmlns:mvc=\"sap.ui.core.mvc\" xmlns=\"sap.m\">' +
				'	<Table items="{/items}"> ' +
				"		<columns>" +
				"			<Column>" +
				'				<Label text="Column 1" />' +
				"			</Column>" +
				"		</columns>" +
				"		<ColumnListItem>" +
				"			<Input />" +
				"		</ColumnListItem>" +
				"	</Table>" +
				"</mvc:View>"
			}).then(function(oView) {
				this.view = oView;
				oView.setModel(new JSONModel({
					items: [{}, {}, {}]
				}));
				oView.placeAt("qunit-fixture");
			}.bind(this));
		},
		afterEach: function () {
			this.page.destroy();
			this.simpleForm.destroy();
			this.view.destroy();
		}
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "inputTestsContext",
		libName: "sap.m",
		ruleId: "inputNeedsLabel",
		expectedNumberOfIssues: 1
	});

	testRule({
		executionScopeType: "global",
		libName: "sap.m",
		ruleId: "inputNeedsLabel",
		expectedNumberOfIssues: 1
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "simpleForm",
		libName: "sap.m",
		ruleId: "inputNeedsLabel",
		expectedNumberOfIssues: 0
	});

	testRule({
		executionScopeType: "subtree",
		executionScopeSelectors: "tableWithTemplate",
		libName: "sap.m",
		ruleId: "inputNeedsLabel",
		expectedNumberOfIssues: 0
	});
});
