/*global QUnit*/

sap.ui.define([
	"sap/m/Input",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer"
], function(
	Input,
	jQuery,
	Component,
	ManifestUtils,
	FlexControllerFactory,
	Change,
	Layer
) {
	"use strict";

	QUnit.module("Creation of the first change without a registered propagationListener", {
		beforeEach: function() {
			return Component.create({
				name: "sap.ui.fl.qunit.integration.testComponentComplex",
				id: "sap.ui.fl.qunit.integration.testComponentComplex",
				manifestFirst: true,
				metadata: {
					manifest: "json"
				}
			})
			.then(function(oComponent) {
				this.oComponent = oComponent;
				// simulate a too late loaded fl library... resulting in a not registered propagationListener
				this.oComponent.aPropagationListeners = [];
			}.bind(this));
		},
		afterEach: function() {
			this.oComponent.destroy();
		}
	}, function() {
		QUnit.test("applies the change after the recreation of the changed control - Promises/FakePromises is intercepted", function(assert) {
			var oNewFieldInstance;
			var sFlexReference = ManifestUtils.getFlexReference({manifest: this.oComponent.getManifest()});
			var oComponentContainer = this.oComponent.getRootControl();
			var sEmbeddedComponentId = oComponentContainer.getAssociation("component");
			var oEmbeddedComponent = Component.get(sEmbeddedComponentId);
			var oView = oEmbeddedComponent.getRootControl();
			var oForm = oView.byId("myForm");
			var oInitialFieldInstance = oView.byId("myGroupField");

			var oChangeContent = {
				fileType: "change",
				layer: Layer.VENDOR,
				fileName: "a",
				namespace: "b",
				packageName: "c",
				changeType: "hideControl",
				reference: sFlexReference,
				content: ""
			};

			// simulate no component loaded callback (no loaded fl library)
			Component._fnLoadComponentCallback = undefined;

			// create a hide control change
			var oFlexController = FlexControllerFactory.create(sFlexReference);
			return oFlexController.addChange(oChangeContent, oInitialFieldInstance)
			.then(function(oChange) {
				return oFlexController.applyChange(oChange, oInitialFieldInstance);
			})

			.then(function(oChange) {
				assert.deepEqual(oInitialFieldInstance.getVisible(), false, "the label is hidden");

				// simulate an event destroying the field
				oInitialFieldInstance.destroy();

				// simulate a recreation of the control
				var oChangeApplyPromise = oChange.addChangeProcessingPromise(Change.operations.APPLY);
				oNewFieldInstance = new Input(oView.createId("myGroupField"));
				oForm.addContent(oNewFieldInstance);
				return oChangeApplyPromise;
			})

			.then(function() {
				// final check
				assert.deepEqual(oNewFieldInstance.getVisible(), false, "the label is still hidden");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
