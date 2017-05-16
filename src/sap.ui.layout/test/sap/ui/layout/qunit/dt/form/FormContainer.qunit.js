(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/rta/test/controlEnablingCheck",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/ui/layout/form/FormContainer",
		"sap/ui/layout/form/FormElement",
		"sap/m/Input"
	], function (QUnitReport, rtaControlEnablingCheck, ElementEnablementTest, FormContainer, FormElement, Input) {


		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.ui.layout.form.FormContainer",
			create: function () {
				return new FormContainer({
					formElements: [
						new FormElement({
							fields: [
								new Input()
							]
						}),
						new FormElement({
							fields: [
								new Input()
							]
						})
					]
				});
			}
		});
		oElementEnablementTest.run().then(function(oData) {
			new QUnitReport({
				data: oData
			});
		});

		// Move action
		var fnConfirmElement1IsOn2rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("element1").getId(),
				oViewAfterAction.byId("formContainer").getFormElements()[1].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("element1").getId(),
				oViewAfterAction.byId("formContainer").getFormElements()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for FormContainer control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m">' +
			'<f:Form id="idForm">' +
				'<f:layout>' +
					'<f:ResponsiveGridLayout/>' +
				'</f:layout>' +
				'<f:formContainers>' +
					'<f:FormContainer id="formContainer">' +
						'<f:formElements>' +
							'<f:FormElement id="element1" label="labelForElement1">' +
								'<f:fields>' +
								'<m:Input/>' +
								'</f:fields>' +
							'</f:FormElement>' +
							'<f:FormElement id="element2" label="labelForElement2">' +
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
				name: "move",
				controlId: "formContainer",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("element1"),
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							aggregation: "formElements",
							parent: oView.byId("formContainer"),
							publicAggregation: "formElements",
							publicParent: oView.byId("formContainer")
						},
						target: {
							aggregation: "formElements",
							parent: oView.byId("formContainer"),
							publicAggregation: "formElements",
							publicParent: oView.byId("formContainer")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn2rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn2rdPosition
		});

		// Rename action
		var fnConfirmFormContainerRenamedWithNewValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer").getTitle().getText(),
				"New Option",
				"then the control has been renamed to the new value (New Option)");
		};

		var fnConfirmFormContainerIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer").getTitle().getText(),
				"Option 1",
				"then the control has been renamed to the old value (Option 1)");
		};

		rtaControlEnablingCheck("Checking the rename action for a FormContainer, when the title is a control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m">' +
				'<f:Form id="idForm">' +
					'<f:layout>' +
						'<f:ResponsiveGridLayout/>' +
					'</f:layout>' +
					'<f:formContainers>' +
						'<f:FormContainer id="formContainer">' +
							'<f:title>' +
								'<core:Title text="Option 1"/>' +
							'</f:title>' +
							'<f:formElements>' +
								'<f:FormElement label="labelForElement1">' +
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
				controlId: "formContainer",
				parameter: function (oView) {
					return {
						newValue: 'New Option',
						renamedElement: oView.byId("formContainer")
					};
				}
			},
			afterAction: fnConfirmFormContainerRenamedWithNewValue,
			afterUndo: fnConfirmFormContainerIsRenamedWithOldValue,
			afterRedo: fnConfirmFormContainerRenamedWithNewValue
		});

		// Rename action
		var fnConfirmFormContainerRenamedWithNewValueWhenIsAString = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer").getTitle(),
				"New Option",
				"then the control has been renamed to the new value (New Option)");
		};

		var fnConfirmFormContainerIsRenamedWithOldValueWhenIsAString = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer").getTitle(),
				"Option 1",
				"then the control has been renamed to the old value (Option 1)");
		};

		rtaControlEnablingCheck("Checking the rename action for a FormContainer, when the title is a string", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m">' +
				'<f:Form id="idForm">' +
					'<f:layout>' +
						'<f:ResponsiveGridLayout/>' +
					'</f:layout>' +
					'<f:formContainers>' +
						'<f:FormContainer id="formContainer" title="Option 1">' +
							'<f:formElements>' +
								'<f:FormElement label="labelForElement1">' +
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
				controlId: "formContainer",
				parameter: function (oView) {
					return {
						newValue: 'New Option',
						renamedElement: oView.byId("formContainer")
					};
				}
			},
			afterAction: fnConfirmFormContainerRenamedWithNewValueWhenIsAString,
			afterUndo: fnConfirmFormContainerIsRenamedWithOldValueWhenIsAString,
			afterRedo: fnConfirmFormContainerRenamedWithNewValueWhenIsAString
		});

		// Remove action
		var fnConfirmFormContainerIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer").getVisible(), false, "then the FormContainer element is invisible");
		};

		var fnConfirmFormContainerIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer").getVisible(), true, "then the FormContainer element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for FormContainer", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m">' +
				'<f:Form id="idForm">' +
					'<f:layout>' +
						'<f:ResponsiveGridLayout/>' +
					'</f:layout>' +
					'<f:formContainers>' +
						'<f:FormContainer title="Option 1" id="formContainer">' +
							'<f:formElements>' +
								'<f:FormElement label="labelForElement1">' +
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
				controlId: "formContainer"
			},
			afterAction: fnConfirmFormContainerIsInvisible,
			afterUndo: fnConfirmFormContainerIsVisible,
			afterRedo: fnConfirmFormContainerIsInvisible
		});
	});
})();