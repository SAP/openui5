/* global QUnit */

sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/thirdparty/sinon-4"
], function(
	elementActionTest,
	sinon
) {
	"use strict";

	// Test "only" function + straightforward execution
	elementActionTest.only("remove");

	var fnConfirmFormElementIsInvisible = function(oUiComponent, oViewAfterAction, assert) {
		assert.ok(oViewAfterAction.byId("formelement").getVisible() === false, "then the form element is invisible");
	};

	var fnConfirmFormElementIsVisible = function(oUiComponent, oViewAfterAction, assert) {
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
						"</FormElement>" +
					"</FormContainer>" +
				"</Form>" +
			"</mvc:View>",
		action: {
			name: "remove",
			controlId: "formelement",
			parameter(oView) {
				return {
					removedElement: oView.byId("formelement")
				};
			}
		},
		beforeAction() {

		},
		afterAction(...aArgs) {
			fnConfirmFormElementIsInvisible.apply(this, aArgs);
		},
		beforeUndo() {

		},
		afterUndo(...aArgs) {
			fnConfirmFormElementIsVisible.apply(this, aArgs);
		},
		beforeRedo() {

		},
		afterRedo(...aArgs) {
			fnConfirmFormElementIsInvisible.apply(this, aArgs);
		},

		changeVisualization: {
			displayElementId: "container",
			info: {
				affectedControls: ["formelement"],
				displayControls: ["container"]
			}
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

	elementActionTest("Checking the remove action for a simple control with always async view, async control retrieval and preprocessors", {
		xmlView: {
			viewContent:
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.layout.form">' +
					'<Form id="form">' +
						'<FormContainer id="container">' +
							'<FormElement id="formelement">' +
								'<m:Button text="click me" id="btn" press="oPressSpy" />' +
							"</FormElement>" +
						"</FormContainer>" +
					"</Form>" +
				"</mvc:View>",
			// possibility to add preprocessors or other settings you can pass to sap.ui.xmlview, e.g.
			async: true,
			preprocessors: null // add yours
		},
		action: {
			name: "remove",
			control(oView) {
				return Promise.resolve(oView.byId("container"));
			},
			parameter(oView) {
				return {
					removedElement: oView.byId("container")
				};
			}
		},
		before() {
			window.oPressSpy = sinon.spy();

			this.sSomeProperty = "some property";
		},
		after(assert) {
			delete window.oPressSpy;

			assert.strictEqual(this.sSomeProperty, "some property", "then context between hooks is shared");
		},
		afterAction: fnConfirmFormContainerIsInvisible,
		afterUndo: fnConfirmFormContainerIsVisible,
		afterRedo: fnConfirmFormContainerIsInvisible
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});