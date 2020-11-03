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
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/apply/api/DelegateMediatorAPI"
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
	JSONModel,
	DelegateMediatorAPI
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
		function buildViewContentForAddDelegate(sDelegate) {
			return '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns="sap.m" xmlns:fl="sap.ui.fl">' +
					sDelegate +
						'<f:layout>' +
							'<f:ResponsiveGridLayout/>' +
						'</f:layout>' +
						'<f:formContainers>' +
							'<f:FormContainer id="group" title="Online">' +
									'<f:formElements>' +
										'<f:FormElement id="labelId1" label="Form Element 1">' +
											'<f:fields>' +
												'<Text id="textId1" text="Form Text 1" />' +
											'</f:fields>' +
										'</f:FormElement>' +
										'<f:FormElement id="labelId2" label="Form Element 2">' +
											'<f:fields>' +
												'<Text id="textId2" text="Form Text 2" />' +
											'</f:fields>' +
										'</f:FormElement>' +
									'</f:formElements>' +
								'</f:FormContainer>' +
						'</f:formContainers>' +
					'</f:Form>' +
				'</mvc:View>';
		}

		var NEW_CONTROL_ID = "my_new_control";

		function confirmFieldIsAdded(sValueHelpId, oAppComponent, oView, assert) {
			var oFormContainer = oView.byId("group");
			var aFormElements = oFormContainer.getFormElements();
			assert.equal(aFormElements.length, 3, "then a new form element exists");
			var oNewFormElement = oView.byId(NEW_CONTROL_ID);
			assert.equal(aFormElements.indexOf(oNewFormElement), 0, "then the new form element is inserted at the correct position");
			var oField = oNewFormElement.getFields()[0];
			assert.equal(oField.getId().indexOf(oNewFormElement.getId()), 0, "then the field was assigned a stable id as suffix of the provided id");
			assert.equal(oField.getBindingPath("text"), "binding/path", "and the field inside is bound correctly");

			var aDependents = oFormContainer.getDependents();
			if (sValueHelpId) {
				assert.equal(aDependents.length, 1, "then one dependent was added");
				var oValueHelp = oView.byId(oView.createId(NEW_CONTROL_ID) + "-field-" + sValueHelpId);
				assert.equal(aDependents.indexOf(oValueHelp), 0, "then the value help element was added as a dependent");
			} else {
				assert.equal(aDependents.length, 0, "then no dependents were added");
			}
		}

		function confirmFieldIsRemoved(sValueHelpId, oAppComponent, oView, assert) {
			var oFormContainer = oView.byId("group");
			var aFormElements = oFormContainer.getFormElements();
			assert.equal(aFormElements.length, 2, "then only the old form elements exists");
			var oNewFormElement = oView.byId(NEW_CONTROL_ID);
			assert.notOk(oNewFormElement, "then the new control was removed");

			if (sValueHelpId) {
				var aDependents = oFormContainer.getDependents();
				assert.equal(aDependents.length, 0, "then the dependent was removed");
				var oValueHelp = oView.byId(oView.createId(NEW_CONTROL_ID) + "-field-" + sValueHelpId);
				assert.notOk(oValueHelp, "then the value help element was destroyed");
			}
		}

		var TEST_DELEGATE_PATH = "sap/ui/rta/enablement/TestDelegate";
		elementActionTest("Checking the add action via delegate for a form container, returning a value help from payload, where Delegate.createLayout() is not responsible for controls", {
			xmlView: buildViewContentForAddDelegate(
				'<f:Form id="idForm" ' +
					"fl:delegate='{" +
						'"name":"' + TEST_DELEGATE_PATH + '",' +
						'"payload":{' +
							'"valueHelpId":"valueHelp"' + //enforce creation of valueHelp in the test delegate
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
						newControlId: oView.createId(NEW_CONTROL_ID),
						bindingString: "binding/path",
						parentId: oView.createId("group")
					};
				}
			},
			afterAction: confirmFieldIsAdded.bind(null, "valueHelp"),
			afterUndo: confirmFieldIsRemoved.bind(null, "valueHelp"),
			afterRedo : confirmFieldIsAdded.bind(null, "valueHelp")
		});

		elementActionTest("Checking the add action via delegate for a form container, where Delegate.createLayout() is not responsible for controls", {
			xmlView:buildViewContentForAddDelegate(
				'<f:Form id="idForm" ' +
					"fl:delegate='{" +
						'"name":"' + TEST_DELEGATE_PATH + '"' +
					"}'" +
				'>'
			),
			action: {
				name: ["add", "delegate"],
				controlId: "group",
				parameter: function (oView) {
					return {
						index: 0,
						newControlId: oView.createId(NEW_CONTROL_ID),
						bindingString: "binding/path",
						parentId: oView.createId("group")
					};
				}
			},
			afterAction: confirmFieldIsAdded.bind(null, null),
			afterUndo: confirmFieldIsRemoved.bind(null, null),
			afterRedo : confirmFieldIsAdded.bind(null, null)
		});

		elementActionTest("Checking the add action via delegate, returning a value help from payload, where Delegate.createLayout() is responsible for controls", {
			xmlView: buildViewContentForAddDelegate(
				'<f:Form id="idForm" ' +
					"fl:delegate='{" +
						'"name":"' + TEST_DELEGATE_PATH + '",' +
						'"payload":{' +
							'"useCreateLayout":"true",' + //enforce availability of createLayout in the test delegate
							'"valueHelpId":"valueHelp",' + //enforce creation of valueHelp in the test delegate
							'"layoutType":"sap.ui.layout.form.FormElement",' + //specify createLayout details in the test delegate
							'"labelAggregation": "label",' + //specify createLayout details in the test delegate
							'"aggregation": "fields"' + //specify createLayout details in the test delegate
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
						newControlId: oView.createId(NEW_CONTROL_ID),
						bindingString: "binding/path",
						parentId: oView.createId("group")
					};
				}
			},
			afterAction: confirmFieldIsAdded.bind(null, "valueHelp"),
			afterUndo: confirmFieldIsRemoved.bind(null, "valueHelp"),
			afterRedo : confirmFieldIsAdded.bind(null, "valueHelp")
		});

		elementActionTest("Checking the add action via delegate with a payload (add form element) for a form container, returning a value help, where Delegate.createLayout() is not responsible for delegate controls", {
			xmlView:buildViewContentForAddDelegate(
				'<f:Form id="idForm" ' +
					"fl:delegate='{" +
						'"name":"' + TEST_DELEGATE_PATH + '",' +
						'"payload":{' +
							'"valueHelpId":"valueHelp"' + //enforce creation of valueHelp in the test delegate
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
						newControlId: oView.createId(NEW_CONTROL_ID),
						bindingString: "binding/path",
						parentId: oView.createId("group")
					};
				}
			},
			afterAction: confirmFieldIsAdded.bind(null, "valueHelp"),
			afterUndo: confirmFieldIsRemoved.bind(null, "valueHelp"),
			afterRedo : confirmFieldIsAdded.bind(null, "valueHelp")
		});

		//ensure a default delegate exists for a model not used anywhere else
		var SomeModel = JSONModel.extend("sap.ui.layout.form.qunit.test.Model");
		DelegateMediatorAPI.registerDefaultDelegate({
			modelType: SomeModel.getMetadata().getName(),
			delegate: TEST_DELEGATE_PATH
		});
		elementActionTest("Checking the add action via delegate with a default delegate", {
			xmlView: buildViewContentForAddDelegate(
				'<f:Form id="idForm" >'
			),
			model : new SomeModel(),
			action: {
				name: ["add", "delegate"],
				controlId: "group",
				parameter: function (oView) {
					return {
						index: 0,
						newControlId: oView.createId(NEW_CONTROL_ID),
						bindingString: "binding/path",
						parentId: oView.createId("group"),
						modelType: SomeModel.getMetadata().getName()
					};
				}
			},
			afterAction: confirmFieldIsAdded.bind(null, null),
			afterUndo: confirmFieldIsRemoved.bind(null, null),
			afterRedo : confirmFieldIsAdded.bind(null, null)
		});

		elementActionTest("Condensing: Check move after add via delegate", {
			xmlView:buildViewContentForAddDelegate(
				'<f:Form id="idForm" ' +
					"fl:delegate='{" +
						'"name":"' + TEST_DELEGATE_PATH + '"' +
					"}'" +
				'>'
			),
			action: {
				name: "move",
				controlId: "group",
				parameter: function (oView) {
					return {
						movedElements: [{
							element: oView.byId(NEW_CONTROL_ID),
							sourceIndex: 1,
							targetIndex: 0
						}],
						source: {
							aggregation: "formElements",
							parent: oView.byId("group"),
							publicAggregation: "formElements",
							publicParent: oView.byId("group")
						},
						target: {
							aggregation: "formElements",
							parent: oView.byId("group"),
							publicAggregation: "formElements",
							publicParent: oView.byId("group")
						}
					};
				}
			},
			previousActions: [
				{
					name: ["add", "delegate"],
					controlId: "group",
					parameter: function (oView) {
						return {
							index: 1,
							newControlId: oView.createId(NEW_CONTROL_ID),
							bindingString: "binding/path",
							parentId: oView.createId("group")
						};
					}
				}
			],
			changesAfterCondensing: 2, // Not enabled for condensing yet
			afterAction: confirmFieldIsAdded.bind(null, null),
			afterUndo: confirmFieldIsRemoved.bind(null, null),
			afterRedo : confirmFieldIsAdded.bind(null, null)
		});
	});

});
