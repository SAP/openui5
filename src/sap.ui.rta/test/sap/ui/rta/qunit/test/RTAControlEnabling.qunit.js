/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/test/controlEnablingCheck",
	"sap/ui/qunit/utils/waitForThemeApplied"
], function (
	rtaControlEnablingCheck,
	waitForThemeApplied
) {
	"use strict";

	// Test "only" function + straightforward execution
	rtaControlEnablingCheck.only("remove");

	var fnConfirmFormElementIsInvisible = function(oUiComponent, oViewAfterAction, assert){
		assert.ok(oViewAfterAction.byId("formelement").getVisible() === false, "then the form element is invisible");
	};

	var fnConfirmFormElementIsVisible = function(oUiComponent, oViewAfterAction, assert){
		assert.ok(oViewAfterAction.byId("formelement").getVisible() === true, "then the form element is visible");
	};

	// Use rtaControlEnablingCheck to check if a control is ready for the remove action of UI adaptation
	rtaControlEnablingCheck("Checking the remove action for a simple control", {
		xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.layout.form">' +
				'<Form id="form">' +
					'<FormContainer id="container">' +
						'<FormElement id="formelement">' +
							'<m:Button text="click me" />' +
						'</FormElement>' +
					'</FormContainer>' +
				'</Form>' +
			'</mvc:View>'
		,
		placeAt: "qunit-fixture",
		action : {
			name : "remove",
			controlId : "formelement",
			parameter : function(oView){
				return {
					removedElement : oView.byId("formelement")
				};
			}
		},
		afterAction : fnConfirmFormElementIsInvisible,
		afterUndo : fnConfirmFormElementIsVisible,
		afterRedo : fnConfirmFormElementIsInvisible
	});

	var fnConfirmFormContainerIsInvisible = function(oUiComponent, oViewAfterAction, assert){
		assert.strictEqual(oViewAfterAction.byId("container").getVisible(), false, "then the form container is invisible");
	};

	var fnConfirmFormContainerIsVisible = function(oUiComponent, oViewAfterAction, assert){
		assert.strictEqual(oViewAfterAction.byId("container").getVisible(), true, "then the form container is visible");
	};
	rtaControlEnablingCheck("Checking the remove action for a simple control with always async view and preprocessors", {
		xmlView : {
			viewContent : '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.layout.form">' +
								'<Form id="form">' +
									'<FormContainer id="container">' +
										'<FormElement id="formelement">' +
											'<m:Button text="click me" />' +
										'</FormElement>' +
									'</FormContainer>' +
								'</Form>' +
							'</mvc:View>',
			//possibility to add preprocessors or other settings you can pass to sap.ui.xmlview, e.g.
			async : true,
			preprocessors : null //add yours
		},
		placeAt: "qunit-fixture",
		action : {
			name : "remove",
			controlId : "container",
			parameter : function(oView){
				return {
					removedElement : oView.byId("container")
				};
			}
		},
		afterAction : fnConfirmFormContainerIsInvisible,
		afterUndo : fnConfirmFormContainerIsVisible,
		afterRedo : fnConfirmFormContainerIsInvisible
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});

	return waitForThemeApplied();
});