/*global QUnit*/

// QUnit to be started explicitly
QUnit.config.autostart = false;
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

sap.ui.define([
	'sap/ui/rta/test/controlEnablingCheck',
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
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

	// Start QUnit tests
	QUnit.start();

});
