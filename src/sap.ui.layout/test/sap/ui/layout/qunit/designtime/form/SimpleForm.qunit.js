sap.ui.require([
	"sap/ui/dt/test/report/QUnit",
	"sap/ui/dt/test/ElementEnablementTest",
	"sap/ui/rta/test/controlEnablingCheck",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/form/SimpleFormLayout",
	"sap/m/Toolbar",
	"sap/m/Button"
], function(
	QUnit,
	ElementEnablementTest,
	rtaControlEnablingCheck,
	SimpleForm,
	SimpleFormLayout,
	Toolbar,
	Button
) {
	"use strict";

	var oElementEnablementTest = new ElementEnablementTest({
		type: "sap.ui.layout.form.SimpleForm",
		create: function () {
			return new SimpleForm({
				toolbar: new Toolbar({
					content : [
						new Button({text: "Button"})
					]
				}),
				content: [
				]
			});
		}
	});
	oElementEnablementTest.run().then(function(oData) {
		var oReport = new QUnit({
			data: oData
		});
		oReport.destroy();
	});

	function fnParameterizedTest(sSimpleFormLayout) {
		function buildXMLForSimpleForm() {
			return '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m" xmlns:core="sap.ui.core">' +
				'<f:SimpleForm id="simpleForm" layout="' + sSimpleFormLayout + '" >' +
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
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[0].getId(),
				oViewAfterAction.byId("title1").getId(),
				"then the Group has been moved to the first position");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[1].getId(),
				oViewAfterAction.byId("label1").getId(),
				"then the label has moved as well");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[2].getId(),
				oViewAfterAction.byId("input1").getId(),
				"then the input has moved as well");
		}
		function fnConfirmGroup1IsOn2ndPosition(oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[5].getId(),
			oViewAfterAction.byId("title1").getId(),
			"then the Group has been moved to the right position");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[6].getId(),
				oViewAfterAction.byId("label1").getId(),
				"then the label has moved as well");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[7].getId(),
				oViewAfterAction.byId("input1").getId(),
				"then the input has moved as well");
		}

		rtaControlEnablingCheck("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + " when moving title1 to first position", {
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
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[2].getId(),
				oViewAfterAction.byId("label00").getId(),
				"then the label has been moved to the right position");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[3].getId(),
				oViewAfterAction.byId("input00").getId(),
				"then the input has been moved as well");
		}
		function fnConfirmElement00IsOn1stPosition(oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[0].getId(),
				oViewAfterAction.byId("label00").getId(),
				"then the control has been moved to the right position");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[1].getId(),
				oViewAfterAction.byId("input00").getId(),
				"then the input has been moved as well");
		}

		rtaControlEnablingCheck("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + "when moving within group0 label00 to position of label01", {
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
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[3].getId(),
				oViewAfterAction.byId("label01").getId(),
				"then the control has been moved to the right position");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[4].getId(),
				oViewAfterAction.byId("input01").getId(),
				"then the input has been moved as well");
		}
		function fnConfirmLabel01IsOn2ndPosition(oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[2].getId(),
				oViewAfterAction.byId("label01").getId(),
				"then the control has been moved to the right position");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[3].getId(),
				oViewAfterAction.byId("input01").getId(),
				"then the input has been moved as well");
		}

		rtaControlEnablingCheck("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + "when moving label01 to position of label1 (different group)", {
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
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[6].getId(),
				oViewAfterAction.byId("label00").getId(),
				"then the control has been moved to the right position");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[7].getId(),
				oViewAfterAction.byId("input00").getId(),
				"then the input has been moved as well");
		}
		function fnConfirmLabel00IsOn1stPosition(oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[0].getId(),
				oViewAfterAction.byId("label00").getId(),
				"then the control has been moved to the right position");
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[1].getId(),
				oViewAfterAction.byId("input00").getId(),
				"then the input has been moved as well");
		}

		rtaControlEnablingCheck("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + "when moving label00 into empty group", {
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
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[4].getText(),
				"New Title",
				"then the new group is added with the correct Title");
			assert.equal(oViewAfterAction.byId("simpleForm").getContent().length, 9, "then the new length is 9");
		}

		function fnConfirmNewGroupIsRemoved(oUiComponent, oViewAfterAction, assert) {
			assert.notEqual(oViewAfterAction.byId("simpleForm").getContent()[4].getText(),
				"New Title",
				"then the new group is removed");
			assert.equal(oViewAfterAction.byId("simpleForm").getContent().length, 8, "then the length is back to 8");
		}

		rtaControlEnablingCheck("Checking the move action for SimpleForm with Layout=" + sSimpleFormLayout + "when adding a new group", {
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
	}

	fnParameterizedTest(SimpleFormLayout.GridLayout);
	fnParameterizedTest(SimpleFormLayout.ResponsiveGridLayout);

});