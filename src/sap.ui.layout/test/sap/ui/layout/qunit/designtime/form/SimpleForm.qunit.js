sap.ui.define([
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Toolbar",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/layout/library"
], function (
	elementDesigntimeTest,
	elementActionTest,
	SimpleForm,
	Toolbar,
	Button,
	JSONModel,
	DelegateMediatorAPI,
	library
) {
	"use strict";

	// shortcut for sap.ui.layout.form.SimpleFormLayout
	var SimpleFormLayout = library.form.SimpleFormLayout;

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			timeout: 100, // timeout is required, see sap.ui.layout.form.SimpleForm#onAfterRendering method
			type: "sap.ui.layout.form.SimpleForm",
			create: function () {
				return new SimpleForm({
					toolbar: new Toolbar({
						content : [
							new Button({text: "Button"})
						]
					}),
					content: []
				});
			}
		});
	})
	.then(function() {

		var TEST_DELEGATE_PATH = "sap/ui/rta/enablement/TestDelegate";
		//ensure a default delegate exists for a model not used anywhere else
		var SomeModel = JSONModel.extend("sap.ui.layout.simpleform.qunit.test.Model");
		DelegateMediatorAPI.registerDefaultDelegate({
			modelType: SomeModel.getMetadata().getName(),
			delegate: TEST_DELEGATE_PATH
		});

		function getSimpleForm(oView) {
			return oView.byId("simpleForm");
		}

		function getGroup(oSimpleForm) {
			return oSimpleForm.getAggregation("form").getFormContainers()[1];
		}

		function fnParameterizedTest(sSimpleFormLayout) {
			function buildXMLForSimpleForm(sDelegate) {
				var sDelegateInfo = sDelegate || "";
				return '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m" xmlns:core="sap.ui.core" xmlns:fl="sap.ui.fl">' +
					'<f:SimpleForm id="simpleForm" layout="' + sSimpleFormLayout + '" \
					' + sDelegateInfo + '\
					>' +
						'<f:content>' +
							'<m:Label id="label00"/>' +
							'<m:Input id="input00"/>' +
							'<m:Label id="label01"/>' +
							'<m:Input id="input01"/>' +
							'<core:Title id="title1"/>' +
							'<m:Label id="label1"/>' +
							'<m:Input id="input1"/>' +
							'<core:Title id="title2"/>' +
						'</f:content>' +
					'</f:SimpleForm>' +
				'</mvc:View>';
			}

			// When moving title1 to first position
			function fnConfirmGroup1IsOn1stPosition(oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[0].getId(),
					oViewAfterAction.byId("title1").getId(),
					"then the Group has been moved to the first position");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[1].getId(),
					oViewAfterAction.byId("label1").getId(),
					"then the label has moved as well");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[2].getId(),
					oViewAfterAction.byId("input1").getId(),
					"then the input has moved as well");
			}
			function fnConfirmGroup1IsOn2ndPosition(oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[4].getId(),
					oViewAfterAction.byId("title1").getId(),
					"then the Group has been moved to the right position");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[5].getId(),
					oViewAfterAction.byId("label1").getId(),
					"then the label has moved as well");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[6].getId(),
					oViewAfterAction.byId("input1").getId(),
					"then the input has moved as well");
			}

			elementActionTest("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + " when moving title1 to first position", {
				xmlView: buildXMLForSimpleForm(),
				action: {
					name: "move",
					controlId: "simpleForm",
					parameter: function(oView) {
						return {
							movedElements: [{
								element: oView.byId("title1").getParent(),
								sourceIndex: 1,
								targetIndex: 0
							}],
							source: {
								aggregation: "form",
								parent: oView.byId("simpleForm")
							},
							target: {
								aggregation: "form",
								parent: oView.byId("simpleForm")
							}
						};
					}
				},
				afterAction: fnConfirmGroup1IsOn1stPosition,
				afterUndo: fnConfirmGroup1IsOn2ndPosition,
				afterRedo: fnConfirmGroup1IsOn1stPosition
			});

			// when moving within group0 label00 to position of label01
			function fnConfirmElement00IsOn2ndPosition(oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[2].getId(),
					oViewAfterAction.byId("label00").getId(),
					"then the label has been moved to the right position");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[3].getId(),
					oViewAfterAction.byId("input00").getId(),
					"then the input has been moved as well");
			}
			function fnConfirmElement00IsOn1stPosition(oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[0].getId(),
					oViewAfterAction.byId("label00").getId(),
					"then the control has been moved to the right position");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[1].getId(),
					oViewAfterAction.byId("input00").getId(),
					"then the input has been moved as well");
			}

			elementActionTest("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + "when moving within group0 label00 to position of label01", {
				xmlView: buildXMLForSimpleForm(),
				action: {
					name: "move",
					controlId: "simpleForm",
					parameter: function(oView) {
						return {
							movedElements: [{
								element: oView.byId("label00").getParent(),
								sourceIndex: 0,
								targetIndex: 1
							}],
							source: {
								aggregation: "formElements",
								parent: oView.byId("label00").getParent().getParent()
							},
							target: {
								aggregation: "formElements",
								parent: oView.byId("label00").getParent().getParent()
							}
						};
					}
				},
				afterAction: fnConfirmElement00IsOn2ndPosition,
				afterUndo: fnConfirmElement00IsOn1stPosition,
				afterRedo: fnConfirmElement00IsOn2ndPosition
			});

			// when moving label01 to position of label1 (different group)
			function fnConfirmLabel01IsOn1stPosition(oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[3].getId(),
					oViewAfterAction.byId("label01").getId(),
					"then the control has been moved to the right position");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[4].getId(),
					oViewAfterAction.byId("input01").getId(),
					"then the input has been moved as well");
			}
			function fnConfirmLabel01IsOn2ndPosition(oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[2].getId(),
					oViewAfterAction.byId("label01").getId(),
					"then the control has been moved to the right position");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[3].getId(),
					oViewAfterAction.byId("input01").getId(),
					"then the input has been moved as well");
			}

			elementActionTest("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + "when moving label01 to position of label1 (different group)", {
				xmlView: buildXMLForSimpleForm(),
				action: {
					name: "move",
					controlId: "simpleForm",
					parameter: function(oView) {
						return {
							movedElements: [{
								element: oView.byId("label01").getParent(),
								sourceIndex: 1,
								targetIndex: 0
							}],
							source: {
								aggregation: "formElements",
								parent: oView.byId("label01").getParent().getParent()
							},
							target: {
								aggregation: "formElements",
								parent: oView.byId("label1").getParent().getParent()
							}
						};
					}
				},
				afterAction: fnConfirmLabel01IsOn1stPosition,
				afterUndo: fnConfirmLabel01IsOn2ndPosition,
				afterRedo: fnConfirmLabel01IsOn1stPosition
			});

			// when moving label00 into empty group
			function fnConfirmLabel00IsOn1stPositionInDifferentGroup(oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[6].getId(),
					oViewAfterAction.byId("label00").getId(),
					"then the control has been moved to the right position");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[7].getId(),
					oViewAfterAction.byId("input00").getId(),
					"then the input has been moved as well");
			}
			function fnConfirmLabel00IsOn1stPosition(oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[0].getId(),
					oViewAfterAction.byId("label00").getId(),
					"then the control has been moved to the right position");
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[1].getId(),
					oViewAfterAction.byId("input00").getId(),
					"then the input has been moved as well");
			}

			elementActionTest("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + "when moving label00 into empty group", {
				xmlView: buildXMLForSimpleForm(),
				action: {
					name: "move",
					controlId: "simpleForm",
					parameter: function(oView) {
						return {
							movedElements: [{
								element: oView.byId("label00").getParent(),
								sourceIndex: 0,
								targetIndex: 0
							}],
							source: {
								aggregation: "formElements",
								parent: oView.byId("label00").getParent().getParent()
							},
							target: {
								aggregation: "formElements",
								parent: oView.byId("title2").getParent()
							}
						};
					}
				},
				afterAction: fnConfirmLabel00IsOn1stPositionInDifferentGroup,
				afterUndo: fnConfirmLabel00IsOn1stPosition,
				afterRedo: fnConfirmLabel00IsOn1stPositionInDifferentGroup
			});

			// Add SimpleFormGroup
			function fnComfirmGroupIsAddedWithNewLabel(oUiComponent, oViewAfterAction, assert) {
				assert.strictEqual(getSimpleForm(oViewAfterAction).getContent()[4].getText(),
					"New Title",
					"then the new group is added with the correct Title");
				assert.equal(getSimpleForm(oViewAfterAction).getContent().length, 9, "then the new length is 9");
			}

			function fnConfirmNewGroupIsRemoved(oUiComponent, oViewAfterAction, assert) {
				assert.notEqual(getSimpleForm(oViewAfterAction).getContent()[4].getText(),
					"New Title",
					"then the new group is removed");
				assert.equal(getSimpleForm(oViewAfterAction).getContent().length, 8, "then the length is back to 8");
			}

			elementActionTest("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + "when adding a new group", {
				xmlView: buildXMLForSimpleForm(),
				action: {
					name: "createContainer",
					controlId: "simpleForm--Form",
					parameter: function(oView) {
						return {
							label: "New Title",
							newControlId: oView.createId(jQuery.sap.uid()),
							index: 1
						};
					}
				},
				afterAction: fnComfirmGroupIsAddedWithNewLabel,
				afterUndo: fnConfirmNewGroupIsRemoved,
				afterRedo: fnComfirmGroupIsAddedWithNewLabel
			});

			function checkIfDependentAdded(oUiComponent, oViewAfterAction, assert) {
				var oSimpleFormDependents = getSimpleForm(oViewAfterAction).getDependents();
				assert.equal(oSimpleFormDependents[0].getId(), oViewAfterAction.createId("title1"), "then stable element of form container was added to the 'dependents' aggregation");
			}

			function checkIfDependentRemoved(oUiComponent, oViewAfterAction, assert) {
				var oSimpleFormDependents = getSimpleForm(oViewAfterAction).getDependents();
				assert.equal(oSimpleFormDependents.length, 0, "then stable element of form container was removed from the 'dependents' aggregation");
			}

			elementActionTest("Checking the remove action for SimpleForm with Layout=" + sSimpleFormLayout + "when removing a group", {
				xmlView: buildXMLForSimpleForm(),
				action: {
					name: "Remove",
					control: function(oView) {
						return getGroup(getSimpleForm(oView));
					},
					parameter: function(oView) {
						return {
							removedElement: getGroup(getSimpleForm(oView))
						};
					}
				},
				afterAction: checkIfDependentAdded,
				afterUndo: checkIfDependentRemoved,
				afterRedo: checkIfDependentAdded
			});

			/****** Add via delegate tests ***********/
			var NEW_CONTROL_ID = "my_new_control";
			function confirmFieldIsAdded(sValueHelpId, oAppComponent, oView, assert) {
				var oSimpleForm = getSimpleForm(oView);
				var aFormContent = oSimpleForm.getContent();
				var oGroup = oView.byId("title1");
				var oNewLabel = oView.byId("my_new_control-label");
				var oNewField = oView.byId(NEW_CONTROL_ID);
				var oExistingLabel = oView.byId("label1");


				assert.equal(aFormContent.length, 10, "then a new label and field are added");
				assert.equal(aFormContent.indexOf(oGroup), 4, "then the title representing the group is not moved");
				assert.equal(aFormContent.indexOf(oNewLabel), 5, "then a new label is added");
				assert.equal(aFormContent.indexOf(oNewField), 6, "then a new field is added");
				assert.equal(oNewField.getBindingPath("text"), "binding/path", "and the field inside is bound correctly");
				assert.equal(aFormContent.indexOf(oExistingLabel), 7, "then the existing label in the group is moved");

				var aDependents = oSimpleForm.getDependents();
				if (sValueHelpId) {
					assert.equal(aDependents.length, 1, "then one dependent was added");
					var oValueHelp = oView.byId(oView.createId(NEW_CONTROL_ID) + "-" + sValueHelpId);
					assert.equal(aDependents.indexOf(oValueHelp), 0, "then the value help element was added as a dependent");
				} else {
					assert.equal(aDependents.length, 0, "then no dependents were added");
				}
			}

			function confirmFieldIsRemoved(sValueHelpId, oAppComponent, oView, assert) {
				var oSimpleForm = getSimpleForm(oView);
				var aFormContent = oSimpleForm.getContent();
				var oGroup = oView.byId("title1");
				var oNewLabel = oView.byId("my_new_control-label");
				var oNewField = oView.byId(NEW_CONTROL_ID);
				var oExistingLabel = oView.byId("label1");


				assert.equal(aFormContent.length, 8, "then a new label and field are added");
				assert.equal(aFormContent.indexOf(oGroup), 4, "then the title representing the group is not moved");
				assert.notOk(oNewLabel, "then a new label is destroyed");
				assert.notOk(oNewField, "then a new field is destroyed");
				assert.equal(aFormContent.indexOf(oExistingLabel), 5, "then the existing label in the group is moved");

				if (sValueHelpId) {
					var aDependents = oSimpleForm.getDependents();
					assert.equal(aDependents.length, 0, "then the dependent was removed");
					var oValueHelp = oView.byId(oView.createId(NEW_CONTROL_ID) + "-" + sValueHelpId);
					assert.notOk(oValueHelp, "then the value help element was destroyed");
				}
			}

			elementActionTest("Checking the add action via delegate action with default delegate for SimpleForm with Layout=" + sSimpleFormLayout, {
				xmlView: buildXMLForSimpleForm(),
				model : new SomeModel(),
				action: {
					name: ["add", "delegate"],
					control: function(oView) {
						return getGroup(getSimpleForm(oView));
					},
					parameter: function (oView) {
						return {
							index: 0,
							newControlId: oView.createId(NEW_CONTROL_ID),
							bindingString: "binding/path",
							parentId: getGroup(getSimpleForm(oView)).getId(),
							modelType: SomeModel.getMetadata().getName()
						};
					}
				},
				afterAction: confirmFieldIsAdded.bind(null, false),
				afterUndo: confirmFieldIsRemoved.bind(null, false),
				afterRedo : confirmFieldIsAdded.bind(null, false)
			});

			elementActionTest("Checking the add action via delegate action with delegate, should ignore createLayout and include value helps for SimpleForm with Layout=" + sSimpleFormLayout, {
				xmlView: buildXMLForSimpleForm(
					"fl:delegate='{" +
						'"name":"' + TEST_DELEGATE_PATH + '",' +
						'"payload":{' +
							'"useCreateLayout":"true",' + //enforce availability of createLayout in the test delegate
							'"layoutType":"enforce.breaking.to.ensure.it.is.not.called",' +
							'"valueHelpId":"valueHelp"' + //enforce creation of valueHelp in the test delegate
						'}' +
					"}'"
				),
				model : new SomeModel(),
				action: {
					name: ["add", "delegate"],
					control: function(oView) {
						return getGroup(getSimpleForm(oView));
					},
					parameter: function (oView) {
						return {
							index: 0,
							newControlId: oView.createId(NEW_CONTROL_ID),
							bindingString: "binding/path",
							parentId: getGroup(getSimpleForm(oView)).getId()
						};
					}
				},
				afterAction: confirmFieldIsAdded.bind(null, "valueHelp"),
				afterUndo: confirmFieldIsRemoved.bind(null, "valueHelp"),
				afterRedo : confirmFieldIsAdded.bind(null, "valueHelp")
			});
		}

		fnParameterizedTest(SimpleFormLayout.GridLayout);
		fnParameterizedTest(SimpleFormLayout.ResponsiveGridLayout);
	});

});
