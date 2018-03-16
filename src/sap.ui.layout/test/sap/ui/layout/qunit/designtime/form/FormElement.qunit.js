/*global QUnit*/

(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/rta/test/controlEnablingCheck",
		"sap/ui/layout/designtime/form/FormElement.designtime",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/ui/layout/form/FormElement",
		"sap/ui/layout/form/ResponsiveGridLayout",
		"sap/ui/layout/form/FormContainer",
		"sap/ui/layout/form/Form",
		"sap/ui/core/Title",
		"sap/m/Input"
	], function (QUnitReport, rtaControlEnablingCheck, FormElementDesignTime,  ElementEnablementTest, FormElement, ResponsiveLayout, FormContainer, Form, Title, Input) {

		var oElement = new FormElement("E1", {
			label: "Label1"
		});

		var oElement2 = new FormElement("E2");

		var oLayout = new ResponsiveLayout("Layout");

		var oForm = new Form("F1",{
			title: new Title("F1T",{text: "Form Title"}),
			layout: oLayout,
			formContainers: [
				new FormContainer("C1",{
					title: "Container1",
					formElements: [ oElement, oElement2 ]
				})
			]
		});

		QUnit.test("Retrieve domRef of Form Element with label inside Responsive Grid Layout", function(assert) {
			assert.ok(oForm, "Form was created");
			assert.ok(FormElementDesignTime.domRef(oElement), "domRef is retrieved when label is present");
			assert.ok(FormElementDesignTime.domRef(oElement2), "domRef is retrieved when label is not present");
		});

		// Element enablement test
		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.ui.layout.form.FormElement",
			create: function () {
				return new FormElement({
					fields: [
						new Input()
					]
				});
			}
		});
		oElementEnablementTest.run().then(function(oData) {
			new QUnitReport({
				data: oData
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

		rtaControlEnablingCheck("Checking the rename action for a FormElement", {
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

		rtaControlEnablingCheck("Checking the remove action for FormElement", {
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

		rtaControlEnablingCheck("Checking the reveal action for a FormElement", {
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
})();