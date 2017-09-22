(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/dt/test/report/QUnit",
		"sap/ui/dt/test/ElementEnablementTest",
		"sap/ui/rta/test/controlEnablingCheck",
		"sap/m/Input",
		"sap/m/Label",
		"sap/ui/core/Title",
		"sap/ui/layout/form/SimpleForm",
		"sap/m/Toolbar",
		"sap/m/Button"
	], function(QUnit, ElementEnablementTest, rtaControlEnablingCheck, Input, Label, Title, SimpleForm, Toolbar, Button) {

		var oElementEnablementTest = new ElementEnablementTest({
			type: "sap.ui.layout.form.SimpleForm",
			create: function () {
				return new SimpleForm({
					toolbar: new Toolbar({
						content : [
							Button({text: "Button"})
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

		// Move Action
		var fnConfirmElement2IsOn1stPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[0].getId(),
				oViewAfterAction.byId("title2").getId(),
				"then the control has been moved to the first position");
		};
		var fnConfirmElement2IsOn2ndPosition = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[3].getId(),
				oViewAfterAction.byId("title2").getId(),
				"then the control has been moved to the right position");
		};

		rtaControlEnablingCheck("Checking the move action for SimpleForm control with first Group without title", {
			xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m" xmlns:core="sap.ui.core">' +
				'<f:SimpleForm id="simpleForm">' +
					'<f:content>' +
						'<m:Label id="label0"/>' +
						'<m:Input id="input0"/>' +
						'<core:Title id="title2"/>' +
						'<m:Label id="label1"/>' +
						'<m:Input id="input1"/>' +
					'</f:content>' +
				'</f:SimpleForm>' +
			'</mvc:View>'
			,
			action: {
				name: "move",
				controlId: "simpleForm",
				parameter: function(oView) {
					return {
						movedElements: [{
							element: oView.byId("title2").getParent(),
							sourceIndex: 1,
							targetIndex: 0
						}],
						source: {
							aggregation: "form",
							parent: oView.byId("simpleForm"),
							publicAggregation: "formContainers",
							publicParent: oView.byId("simpleForm")
						},
						target: {
							aggregation: "form",
							parent: oView.byId("simpleForm"),
							publicAggregation: "formContainers",
							publicParent: oView.byId("simpleForm")
						}
					};
				}
			},
			afterAction: fnConfirmElement2IsOn1stPosition,
			afterUndo: fnConfirmElement2IsOn2ndPosition,
			afterRedo: fnConfirmElement2IsOn1stPosition
		});

		//TODO please include when the controlEnablingCheck is ready for designtime propagation

		// AddSimpleFormGroup
		// var fnComfirmGroupIsAddedWithNewLabel = function(oUiComponent, oViewAfterAction, assert) {
		// 	assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[2].getLabel(),
		// 		"New Title",
		// 		"then the new group is added with the correct Title");
		// };

		// var fnConfirmNewGroupIsRemoved = function(oUiComponent, oViewAfterAction, assert) {
		// 	assert.strictEqual(oViewAfterAction.byId("simpleForm").getContent()[2].getLabel(),
		// 		"Old Title",
		// 		"then the new group is removed");
		// };

		// rtaControlEnablingCheck("Checking the move action for SimpleForm control with first Group without title", {
		// 	xmlView:
		// 	'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:f="sap.ui.layout.form" xmlns:m="sap.m" xmlns:core="sap.ui.core">' +
		// 		'<f:SimpleForm id="simpleForm">' +
		// 			'<f:content>' +
		// 				'<m:Label/>' +
		// 				'<m:Input/>' +
		// 				'<core:Title id="title2" text="Old Title"/>' +
		// 				'<m:Label/>' +
		// 				'<m:Input/>' +
		// 			'</f:content>' +
		// 		'</f:SimpleForm>' +
		// 	'</mvc:View>'
		// 	,
		// 	action: {
		// 		name: "createContainer",
		// 		controlId: "simpleForm--Form",
		// 		parameter: function(oView) {
		// 			return {
		// 				label: "new Title",
		// 				controlId: oView.createId(jQuery.sap.uid()),
		// 				index: 1
		// 			};
		// 		}
		// 	},
		// 	afterAction: fnComfirmGroupIsAddedWithNewLabel,
		// 	afterUndo: fnConfirmNewGroupIsRemoved,
		// 	afterRedo: fnComfirmGroupIsAddedWithNewLabel
		// });

	});
})();