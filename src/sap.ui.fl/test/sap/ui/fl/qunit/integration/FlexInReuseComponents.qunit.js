/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/fl/Utils",
	"sap/ui/core/Component",
	"sap/ui/fl/LrepConnector",
	"sap/ui/thirdparty/sinon-4"
],
function (
	jQuery,
	Utils,
	Component,
	LrepConnector,
	sinon
) {
	"use strict";

	sinon.stub(LrepConnector.prototype, "loadChanges").resolves({
			"changes": [],
			"contexts": [],
			"variantSection": {},
			"settings": {
				"isKeyUser": true,
				"isAtoAvailable": false,
				"isAtoEnabled": false,
				"isProductiveSystem": false
			}
		}
	);

	QUnit.module("Creation of the first change without a registered propagationListener", {
		beforeEach: function () {
			return Component.create({
				name: "sap.ui.fl.qunit.integration.testComponentComplex",
				id: "sap.ui.fl.qunit.integration.testComponentComplex",
				manifestFirst: true,
				"metadata": {
					"manifest": "json"
				}
			})
			.then(function (oComponent) {
				this.oComponent = oComponent;
				// simulate a to late loaded fl library... resulting in a not registered propagationListener
				this.oComponent.aPropagationListeners = [];
			}.bind(this));
		},

		afterEach: function (assert) {
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("applies the change after the recreation of the changed control - without Promises/FakePromises", function (assert) {
			var sFlexReference = this.oComponent.getManifest()["sap.app"].id + ".Component";
			var oComponentContainer = this.oComponent.getRootControl();
			var sEmbeddedComponentId = oComponentContainer.getAssociation("component");
			var oEmbeddedComponent = sap.ui.getCore().getComponent(sEmbeddedComponentId);
			var oView = oEmbeddedComponent.getRootControl();
			var oForm = oView.byId("myForm");
			var oInitialFieldInstance = oView.byId("myGroupField");

			var oChangeContent = {
				"fileType": "change",
				"layer": "VENDOR",
				"fileName": "a",
				"namespace": "b",
				"packageName": "c",
				"changeType": "hideControl",
				"reference": sFlexReference,
				"content": ""
			};

			// simulate no component loaded callback (no loaded fl library)
			Component._fnLoadComponentCallback = undefined;

			// create a hide control change
			var sAppVersion = Utils.getAppVersionFromManifest(this.oComponent.getManifest());
			var oFlexController = sap.ui.fl.FlexControllerFactory.create(sFlexReference, sAppVersion);
			return oFlexController.createAndApplyChange(oChangeContent, oInitialFieldInstance)

			.then(function() {
				assert.deepEqual(oInitialFieldInstance.getVisible(), false, "the label is hidden");

				// simulate an event destroying the field
				oInitialFieldInstance.destroy();

				// simulate a recreation of the control
				var oNewFieldInstance = new sap.m.Input(oView.createId("myGroupField"));
				oForm.addContent(oNewFieldInstance);
				return oNewFieldInstance;
			})

			.then(function(oNewFieldInstance) {
				// final check
				assert.deepEqual(oNewFieldInstance.getVisible(), false, "the label is still hidden");
			});

		});

		QUnit.test("applies the change after the recreation of the changed control - with Promises/FakePromises", function (assert) {
			var sFlexReference = this.oComponent.getManifest()["sap.app"].id + ".Component";
			var oComponentContainer = this.oComponent.getRootControl();
			var sEmbeddedComponentId = oComponentContainer.getAssociation("component");
			var oEmbeddedComponent = sap.ui.getCore().getComponent(sEmbeddedComponentId);
			var oView = oEmbeddedComponent.getRootControl();
			var oForm = oView.byId("myForm");
			var oInitialFieldInstance = oView.byId("myGroupField");

			var oChangeContent = {
				"fileType": "change",
				"layer": "VENDOR",
				"fileName": "a",
				"namespace": "b",
				"packageName": "c",
				"changeType": "hideControl",
				"reference": sFlexReference,
				"content": ""
			};

			// simulate no component loaded callback (no loaded fl library)
			Component._fnLoadComponentCallback = undefined;

			// create a hide control change
			var sAppVersion = Utils.getAppVersionFromManifest(this.oComponent.getManifest());
			var oFlexController = sap.ui.fl.FlexControllerFactory.create(sFlexReference, sAppVersion);
			oFlexController.createAndApplyChange(oChangeContent, oInitialFieldInstance);

			assert.deepEqual(oInitialFieldInstance.getVisible(), false, "the label is hidden");

			// simulate an event destroying the field
			oInitialFieldInstance.destroy();

			// simulate a recreation of the control
			var oNewFieldInstance = new sap.m.Input(oView.createId("myGroupField"));
			oForm.addContent(oNewFieldInstance);

			// final check if the reapplication of the change is done
			// oForm.addContent > core.ManagedObject.setParent > core.ManagedObject.propagateProperties > FlexController.applyChangesOnControl
			assert.deepEqual(oNewFieldInstance.getVisible(), false, "the label is still hidden");
		});
	});

	QUnit.module("adding of the propagationListener", {
		beforeEach: function () {
			this.oComponent = sap.ui.component({
				name: "integration/testComponentComplex",
				id: "testComponentComplex",
				manifestFirst: true,
				"metadata": {
					"manifest": "json"
				}
			});

			//simulate the belated load of the sap.ui.fl library with the effect that the propagationListener is not registered
			this.oComponent.aPropagationListeners = [];
		},

		afterEach: function (assert) {
			this.oComponent.destroy();
		}
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
