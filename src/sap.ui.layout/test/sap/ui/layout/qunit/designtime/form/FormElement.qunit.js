/*global QUnit*/
sap.ui.define([
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/layout/designtime/form/FormElement.designtime",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/Form",
	"sap/ui/core/Title",
	"sap/m/Input"
], function (
	elementDesigntimeTest,
	elementActionTest,
	FormElementDesignTime,
	FormElement,
	ResponsiveLayout,
	FormContainer,
	Form,
	Title,
	Input
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.ui.layout.form.FormElement",
			create: function () {
				return new FormElement({
					fields: [
						new Input()
					]
				});
			}
		});
	})
	.then(function() {
		QUnit.module("Form with responsive layout", {
			beforeEach: function () {
				this.oElement = new FormElement("E1", {
					label: "Label1"
				});
				this.oElement2 = new FormElement("E2");
				this.oLayout = new ResponsiveLayout("Layout");
				this.oForm = new Form("F1",{
					title: new Title("F1T",{text: "Form Title"}),
					layout: this.oLayout,
					formContainers: [
						new FormContainer("C1",{
							title: "Container1",
							formElements: [
								this.oElement,
								this.oElement2
							]
						})
					]
				});
			},
			afterEach: function () {
				this.oForm.destroy();
			}
		}, function () {
			QUnit.test("Retrieve domRef of Form Element with label inside Responsive Grid Layout", function (assert) {
				assert.ok(FormElementDesignTime.domRef(this.oElement), "domRef is retrieved when label is present");
				assert.ok(FormElementDesignTime.domRef(this.oElement2), "domRef is retrieved when label is not present");
			});

			QUnit.test("Check rename action of Form Element without label inside Responsive Grid Layout", function (assert) {
				assert.notOk(FormElementDesignTime.actions.rename(this.oElement2), "rename is disabled");
			});
		});


		// Rename action
		var fnConfirmFormElementRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formElement").getLabel(),
				"New Option",
				"then the control has been renamed to the new value (New Option)");
		};

		var fnConfirmFormElementIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formElement").getLabel(),
				"Option 1",
				"then the control has been renamed to the old value (Option 1)");
		};

		elementActionTest("Checking the rename action for a FormElement", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m">' +
				'<f:Form id="idForm">' +
					'<f:layout>' +
						'<f:ResponsiveGridLayout/>' +
					'</f:layout>' +
					'<f:formContainers>' +
						'<f:FormContainer>' +
							'<f:formElements>' +
								'<f:FormElement id="formElement" label="Option 1">' +
									'<f:fields>' +
										'<m:Input/>' +
									'</f:fields>' +
								'</f:FormElement>' +
							'</f:formElements>' +
						'</f:FormContainer>' +
					'</f:formContainers>' +
				'</f:Form>' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "formElement",
				parameter: function (oView) {
					return {
						newValue: 'New Option',
						renamedElement: oView.byId("formElement")
					};
				}
			},
			afterAction: fnConfirmFormElementRenamedWithNewValue,
			afterUndo: fnConfirmFormElementIsRenamedWithOldValue,
			afterRedo: fnConfirmFormElementRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmFormElementIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formElement").getVisible(), false, "then the FormElement is invisible");
		};

		var fnConfirmFormElementIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formElement").getVisible(), true, "then the FormElement is visible");
		};

		elementActionTest("Checking the remove action for FormElement", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m">' +
				'<f:Form id="idForm">' +
					'<f:layout>' +
						'<f:ResponsiveGridLayout/>' +
					'</f:layout>' +
					'<f:formContainers>' +
						'<f:FormContainer>' +
							'<f:formElements>' +
								'<f:FormElement id="formElement" label="labelForElement1">' +
									'<f:fields>' +
										'<m:Input/>' +
									'</f:fields>' +
								'</f:FormElement>' +
							'</f:formElements>' +
						'</f:FormContainer>' +
					'</f:formContainers>' +
				'</f:Form>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "formElement"
			},
			afterAction: fnConfirmFormElementIsInvisible,
			afterUndo: fnConfirmFormElementIsVisible,
			afterRedo: fnConfirmFormElementIsInvisible
		});

		elementActionTest("Checking the reveal action for a FormElement", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m">' +
				'<f:Form id="idForm">' +
					'<f:layout>' +
						'<f:ResponsiveGridLayout/>' +
					'</f:layout>' +
					'<f:formContainers>' +
						'<f:FormContainer>' +
							'<f:formElements>' +
								'<f:FormElement id="formElement" visible="false" label="labelForElement1">' +
									'<f:fields>' +
										'<m:Input/>' +
									'</f:fields>' +
								'</f:FormElement>' +
							'</f:formElements>' +
						'</f:FormContainer>' +
					'</f:formContainers>' +
				'</f:Form>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "formElement"
			},
			afterAction: fnConfirmFormElementIsVisible,
			afterUndo: fnConfirmFormElementIsInvisible,
			afterRedo: fnConfirmFormElementIsVisible
		});
	});
});
