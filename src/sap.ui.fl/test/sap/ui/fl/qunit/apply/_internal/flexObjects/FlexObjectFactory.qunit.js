/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexObjectFactory,
	FlexObject,
	Layer,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("Basic creation", {
		before: function() {
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
		afterEach: function() {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when a FlexObject is created", function (assert) {
			var oFlexObject = FlexObjectFactory.createFromFileContent(this.oBackendResponse);
			assert.ok(oFlexObject instanceof FlexObject, "then the factory chooses the proper class based on the fileType");
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
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});