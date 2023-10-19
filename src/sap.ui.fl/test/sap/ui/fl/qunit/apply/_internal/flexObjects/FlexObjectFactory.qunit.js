/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/UpdatableChange",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	States,
	UpdatableChange,
	UIChange,
	FlexObjectFactory,
	Layer,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("Basic creation", {
		before() {
			this.oBackendResponse = {
				fileName: "foo",
				fileType: "change",
				content: {
					originalControlType: "sap.m.Label"
				},
				layer: Layer.CUSTOMER,
				namespace: "apps/sap.ui.demoapps.rta.fiorielements/changes/",
				support: {
					sapui5Version: "1.100.0-SNAPSHOT"
				},
				someUnknownProperty: "shouldNotLeadToProblems"
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a FlexObject is created", function(assert) {
			var oFlexObject = FlexObjectFactory.createFromFileContent(this.oBackendResponse);
			assert.ok(oFlexObject instanceof UIChange, "then the factory chooses the proper class based on the fileType");
			assert.strictEqual(
				oFlexObject.getLayer(),
				this.oBackendResponse.layer,
				"then root level properties are set"
			);
			assert.strictEqual(
				oFlexObject.getId(),
				this.oBackendResponse.fileName,
				"then root level properties are properly mapped"
			);
			assert.deepEqual(
				oFlexObject.getContent(),
				this.oBackendResponse.content,
				"then object properties are set"
			);
			assert.strictEqual(
				oFlexObject.getSupportInformation().sapui5Version,
				this.oBackendResponse.support.sapui5Version,
				"then nested properties are set"
			);
			assert.strictEqual(
				oFlexObject.getFlexObjectMetadata().namespace,
				this.oBackendResponse.namespace,
				"then properties are grouped according to the mappingInfo"
			);
			assert.strictEqual(
				oFlexObject.getSupportInformation().generator,
				"FlexObjectFactory.createFromFileContent",
				"then the default generator is set"
			);
		});

		QUnit.test("when a custom object class is provided", function(assert) {
			var oFlexObject = FlexObjectFactory.createFromFileContent(this.oBackendResponse, UpdatableChange);
			assert.ok(oFlexObject instanceof UpdatableChange, "then the provided object class is used");
		});

		QUnit.test("when the persisted flag is set", function(assert) {
			var oFlexObject = FlexObjectFactory.createFromFileContent(this.oBackendResponse, null, true);
			assert.strictEqual(
				oFlexObject.getState(),
				States.LifecycleState.PERSISTED,
				"then the state of the flex object is set to PERSISTED"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});