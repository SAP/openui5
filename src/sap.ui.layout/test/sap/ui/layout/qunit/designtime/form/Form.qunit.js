sap.ui.define([
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/m/Input",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/m/Toolbar",
	"sap/m/Title",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function (
	elementDesigntimeTest,
	elementActionTest,
	Input,
	Form,
	FormContainer,
	FormElement,
	ResponsiveGridLayout,
	Toolbar,
	Title,
	JsControlTreeModifier
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
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
	})
	.then(function() {
		// Create new formContainer
		var fnConfirmFormContainerIsAddedWithNewTitle = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("idForm").getFormContainers().length, 1, "then the new FormContainer control has been added");
			var oNewFormContainer = oViewAfterAction.byId("idForm").getFormContainers()[0];
			assert.strictEqual(oNewFormContainer.getTitle().getText(),
				"New Group",
				"then the new FormContainer control has been renamed to the new value (New Group)");
		};

		var fnConfirmFormContainerIsRemoved = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("idForm").getFormContainers().length, 0, "then the new FormContainer control has been removed");
		};

		elementActionTest("Checking the createContainer action for Form control", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form">' +
				'<f:Form id="idForm">' +
					'<f:layout>' +
						'<f:ResponsiveGridLayout/>' +
					'</f:layout>' +
					'<f:formContainers>' +
					'</f:formContainers>' +
				'</f:Form>' +
			'</mvc:View>'
			,
			action : {
				name : "createContainer",
				controlId : "idForm",
				parameter : function(oView){
					return {
						label : 'New Group',
						newControlId : oView.createId(jQuery.sap.uid()),
						index : 0
					};
				}
			},
			afterAction : fnConfirmFormContainerIsAddedWithNewTitle,
			afterUndo : fnConfirmFormContainerIsRemoved,
			afterRedo : fnConfirmFormContainerIsAddedWithNewTitle
		});

		// Move action
		var fnConfirmElement1IsOn2rdPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer1").getId(),
				oViewAfterAction.byId("idForm").getFormContainers()[1].getId(),
				"then the control has been moved to the right position");
		};
		var fnConfirmElement1IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("formContainer1").getId(),
				oViewAfterAction.byId("idForm").getFormContainers()[2].getId(),
				"then the control has been moved to the previous position");
		};

		elementActionTest("Checking the move action for Form control", {
			xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m">' +
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
							sourceIndex: 2,
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

		// Add delegate tests
		function getValueHelpId(oControl) {
			return JsControlTreeModifier.getFlexDelegate(oControl).payload.valueHelpId;
		}

		function buildViewContentForAddDelegate(sDelegate) {
			return '<mvc:View id="view" xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:mdc="sap.ui.mdc"  xmlns:fl="sap.ui.fl" >' +
					sDelegate +
						'<f:layout>' +
							'<f:ResponsiveGridLayout/>' +
						'</f:layout>' +
						'<f:formContainers>' +
							'<f:FormContainer id="group" title="Online">' +
									'<f:formElements>' +
										'<f:FormElement id="fe-price" label="Web page of the contact">' +
											'<f:fields>' +
												'<mdc:Field value="{price}" editMode="{= \${view>/editMode} ? \'Editable\' : \'Display\'}" />' +
											'</f:fields>' +
										'</f:FormElement>' +
										'<f:FormElement id="fe-cc" label="Twitter account of the contact">' +
											'<f:fields>' +
												'<mdc:Field value="{currency_code}" editMode="{= \${view>/editMode} ? \'Editable\' : \'Display\'}" />' +
											'</f:fields>' +
										'</f:FormElement>' +
									'</f:formElements>' +
								'</f:FormContainer>' +
						'</f:formContainers>' +
					'</f:Form>' +
				'</mvc:View>';
		}

		function confirmFieldIsAdded(oAppComponent, oView, assert) {
			var oFormContainer = oView.byId("group");
			var aFormElements = oFormContainer.getFormElements();
			assert.equal(aFormElements.length, 3, "then a new form element exists");
			var oNewFormElement = oView.byId("my_new_control");
			assert.equal(aFormElements.indexOf(oNewFormElement), 0, "then the new form element is inserted at the correct position");
			var oField = oNewFormElement.getFields()[0];
			assert.equal(oField.getId().indexOf(oNewFormElement.getId()), 0, "then the field was assigned a stable id as suffix of the provided id");
			assert.equal(oField.getBindingPath("text"), "binding/path", "and the field inside is bound correctly");

			var sValueHelpId = getValueHelpId(oView.byId("idForm"));
			if (sValueHelpId) {
				var aDependents = oFormContainer.getDependents();
				assert.equal(aDependents.length, 1, "then one dependent was added");
				var oValueHelp = oView.byId(sValueHelpId);
				assert.equal(aDependents.indexOf(oValueHelp), 0, "then the value help element was added as a dependent");
			}
		}

		function confirmFieldIsRemoved(oAppComponent, oView, assert) {
			var oFormContainer = oView.byId("group");
			var aFormElements = oFormContainer.getFormElements();
			assert.equal(aFormElements.length, 2, "then only the old form elements exists");
			var oNewFormElement = oView.byId("my_new_control");
			assert.notOk(oNewFormElement, "then the new control was removed");

			var sValueHelpId = getValueHelpId(oView.byId("idForm"));
			if (sValueHelpId) {
				var aDependents = oFormContainer.getDependents();
				assert.equal(aDependents.length, 0, "then the dependent was removed");
				var oValueHelp = oView.byId("valueHelp");
				assert.notOk(oValueHelp, "then the value help element was destroyed");
			}
		}

		elementActionTest("Checking the add action via delegate with a payload (add form element) for a form container, returning a value help", {
			xmlView: buildViewContentForAddDelegate(
				'<f:Form id="idForm" ' +
					"fl:delegate='{" +
						'"name":"sap/ui/rta/enablement/TestDelegate",' +
						'"payload":{' +
							'"valueHelpId":"valueHelp"' +
						'}' +
					"}'" +
				'>'
			),
			action: {
				name: ["add", "delegate"],
				controlId: "group",
				parameter: function (oView) {
					return {
						index: 0,
						newControlId: oView.createId("my_new_control"),
						bindingString: "binding/path",
						parentId: oView.createId("group"),
						oDataServiceVersion: "4.0"
					};
				}
			},
			afterAction: confirmFieldIsAdded,
			afterUndo: confirmFieldIsRemoved,
			afterRedo : confirmFieldIsAdded
		});

		elementActionTest("Checking the add action via delegate without a payload (add form element) for a form container, not returning a value help", {
			xmlView:buildViewContentForAddDelegate(
				'<f:Form id="idForm" ' +
					"fl:delegate='{" +
						'"name":"sap/ui/rta/enablement/TestDelegate"' +
					"}'" +
				'>'
			),
			action: {
				name: ["add", "delegate"],
				controlId: "group",
				parameter: function (oView) {
					return {
						index: 0,
						newControlId: oView.createId("my_new_control"),
						bindingString: "binding/path",
						parentId: oView.createId("group"),
						oDataServiceVersion: "4.0"
					};
				}
			},
			afterAction: confirmFieldIsAdded,
			afterUndo: confirmFieldIsRemoved,
			afterRedo : confirmFieldIsAdded
		});
	});
});
