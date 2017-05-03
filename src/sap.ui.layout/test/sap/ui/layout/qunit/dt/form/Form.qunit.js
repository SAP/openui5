(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/rta/test/controlEnablingCheck",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/m/Input",
		"sap/ui/layout/form/Form",
		"sap/ui/layout/form/FormContainer",
		"sap/ui/layout/form/FormElement",
		"sap/ui/layout/form/ResponsiveGridLayout",
		"sap/m/Toolbar",
		"sap/m/Title"
	], function (QUnitReport, rtaControlEnablingCheck, ElementEnablementTest, Input, Form, FormContainer, FormElement, ResponsiveGridLayout, Toolbar, Title) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.ui.layout.form.Form",
			create: function () {
				return new Form({
					toolbar: new Toolbar({
						content : [
							new Title({text : "Title"})
						]
					}),
					layout: new ResponsiveGridLayout(),
					formContainers: [
						new FormContainer({
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
						})
					]
				});
			}
		});
		oElementEnablementTest.run().then(function(oData) {
			var oReport = new QUnitReport({
				data: oData
			});
			oReport.destroy();
		});

		// Move action
		var fnConfirmElement1IsOn2rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer1").getId(),
				oViewAfterAction.byId("idForm").getFormContainers()[1].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer1").getId(),
				oViewAfterAction.byId("idForm").getFormContainers()[0].getId(),
				"then the control has been moved to the previous position");
		};

		rtaControlEnablingCheck("Checking the move action for Form control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m">' +
				'<f:Form id="idForm">' +
					'<f:layout>' +
						'<f:ResponsiveGridLayout/>' +
					'</f:layout>' +
					'<f:formContainers>' +
					'<f:FormContainer id="element1">' +
						'<f:formElements>' +
							'<f:FormElement label="label">' +
								'<f:fields>' +
									'<m:Input/>' +
								'</f:fields>'	+
							'</f:FormElement>' +
							'<f:FormElement>' +
								'<f:fields>' +
									'<m:Input/>' +
								'</f:fields>' +
							'</f:FormElement>' +
						'</f:formElements>' +
					'</f:FormContainer>' +
					'<f:FormContainer id="element2">' +
						'<f:formElements>' +
							'<f:FormElement>' +
								'<f:fields>' +
									'<m:Input/>' +
								'</f:fields>'	+
							'</f:FormElement>' +
							'<f:FormElement>' +
								'<f:fields>' +
									'<m:Input/>' +
								'</f:fields>' +
							'</f:FormElement>' +
						'</f:formElements>' +
					'</f:FormContainer>' +
					'<f:FormContainer id="formContainer1">' +
						'<f:formElements>' +
							'<f:FormElement >' +
								'<f:fields>' +
									'<m:Input/>' +
								'</f:fields>'	+
							'</f:FormElement>' +
							'<f:FormElement>' +
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
				controlId: "idForm",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId("formContainer1"),
							sourceIndex: 0,
							targetIndex: 1
						}],
						source: {
							aggregation: "formContainers",
							parent: oView.byId("idForm"),
							publicAggregation: "formContainers",
							publicParent: oView.byId("idForm")
						},
						target: {
							aggregation: "formContainers",
							parent: oView.byId("idForm"),
							publicAggregation: "formContainers",
							publicParent: oView.byId("idForm")
						}
					};
				}
			},
			afterAction: fnConfirmElement1IsOn2rdPosition,
			afterUndo: fnConfirmElement1IsOn1stPosition,
			afterRedo: fnConfirmElement1IsOn2rdPosition
		});
	});
})();