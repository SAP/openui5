/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/thirdparty/sinon-4"
], function (
	elementActionTest,
	sinon
) {
	"use strict";

	// Test "only" function + straightforward execution
	elementActionTest.only("remove");

	var fnConfirmFormElementIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.ok(oViewAfterAction.byId("formelement").getVisible() === false, "then the form element is invisible");
	};

	var fnConfirmFormElementIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.ok(oViewAfterAction.byId("formelement").getVisible() === true, "then the form element is visible");
	};

	// Use elementActionTest to check if a control is ready for the remove action of UI adaptation
	elementActionTest("Checking the remove action for a simple control", {
		xmlView:
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.layout.form">' +
				'<Form id="form">' +
					'<FormContainer id="container">' +
						'<FormElement id="formelement">' +
							'<m:Button text="click me" />' +
						'</FormElement>' +
					'</FormContainer>' +
				'</Form>' +
			'</mvc:View>',
		action: {
			name: "remove",
			controlId: "formelement",
			parameter: function (oView) {
				return {
					removedElement: oView.byId("formelement")
				};
			}
		},
		beforeAction: function () {

		},
		afterAction: function () {
			fnConfirmFormElementIsInvisible.apply(this, arguments);
		},
		beforeUndo: function () {

		},
		afterUndo: function () {
			fnConfirmFormElementIsVisible.apply(this, arguments);
		},
		beforeRedo: function () {

		},
		afterRedo: function () {
			fnConfirmFormElementIsInvisible.apply(this, arguments);
		}
	});

	var fnConfirmFormContainerIsInvisible = function(oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("container").getVisible(), false, "then the form container is invisible");
		var oButton = oViewAfterAction.byId("btn");
		oButton.firePress();
		assert.strictEqual(window.oPressSpy.callCount, 1);
		window.oPressSpy.resetHistory();
	};

	var fnConfirmFormContainerIsVisible = function(oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("container").getVisible(), true, "then the form container is visible");
	};
	elementActionTest("Checking the remove action for a simple control with always async view and preprocessors", {
		xmlView: {
			viewContent:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.layout.form">' +
					'<Form id="form">' +
						'<FormContainer id="container">' +
							'<FormElement id="formelement">' +
								'<m:Button text="click me" id="btn" press="oPressSpy" />' +
							'</FormElement>' +
						'</FormContainer>' +
					'</Form>' +
				'</mvc:View>',
			//possibility to add preprocessors or other settings you can pass to sap.ui.xmlview, e.g.
			async: true,
			preprocessors: null //add yours
		},
		action: {
			name: "remove",
			controlId: "container",
			parameter: function(oView) {
				return {
					removedElement: oView.byId("container")
				};
			}
		},
		before: function () {
			window.oPressSpy = sinon.spy();

			this.sSomeProperty = "some property";
		},
		after: function (assert) {
			delete window.oPressSpy;

			assert.strictEqual(this.sSomeProperty, "some property", "then context between hooks is shared");
		},
		afterAction: fnConfirmFormContainerIsInvisible,
		afterUndo: fnConfirmFormContainerIsVisible,
		afterRedo: fnConfirmFormContainerIsInvisible
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});