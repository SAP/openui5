/*global QUnit*/

// QUnit to be started explicitly
QUnit.config.autostart = false;
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

sap.ui.define([
	'sap/ui/rta/test/controlEnablingCheck'
],
function(rtaControlEnablingCheck){
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
	// Start QUnit tests
	QUnit.start();

});