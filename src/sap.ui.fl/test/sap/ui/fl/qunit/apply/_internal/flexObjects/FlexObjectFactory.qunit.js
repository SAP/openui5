/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/AnnotationChange",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/ControllerExtensionChange",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/FlVariant",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/apply/_internal/flexObjects/UpdatableChange",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	AnnotationChange,
	AppDescriptorChange,
	CompVariant,
	ControllerExtensionChange,
	FlexObjectFactory,
	FlVariant,
	States,
	UIChange,
	UpdatableChange,
	Layer,
	Utils,
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
			assert.notEqual(
				oFlexObject.getContent(),
				this.oBackendResponse.content,
				"then the reference to the original object is not the same as the one in the FlexObject"
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

		[{
			fileType: "variant",
			expectedType: CompVariant
		}, {
			fileType: "ctrl_variant",
			expectedType: FlVariant
		}, {
			fileType: "change",
			appDescriptorChange: true,
			expectedType: AppDescriptorChange
		}, {
			fileType: "change",
			changeType: "codeExt",
			expectedType: ControllerExtensionChange
		}, {
			fileType: "annotation_change",
			expectedType: AnnotationChange
		}, {
			fileType: "change",
			changeType: "defaultVariant",
			expectedType: UpdatableChange
		}, {
			fileType: "change",
			expectedType: UIChange
		}].forEach((testParameters) => {
			QUnit.test(`when a object is provided with different types (${testParameters.fileType} ${testParameters.changeType ? `- ${testParameters.changeType}` : ""})`, function(assert) {
				const oFile = {
					fileType: testParameters.fileType,
					appDescriptorChange: testParameters.appDescriptorChange,
					changeType: testParameters.changeType
				};
				const oFlexObject = FlexObjectFactory.createFromFileContent(oFile);
				assert.ok(oFlexObject instanceof testParameters.expectedType, "then the correct class is used");
			});
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

		QUnit.test("when a too long filename is used", function(assert) {
			const sFileName = "a".repeat(65);
			const oFlexObject = FlexObjectFactory.createUIChange({
				id: sFileName
			});
			assert.strictEqual(oFlexObject.getId(), sFileName, "then the id is set");

			const sExpectedFileName = "b".repeat(65);
			sandbox.stub(Utils, "createDefaultFileName").returns(sExpectedFileName);
			const sChangeType = "a".repeat(45);
			assert.throws(() => {
				FlexObjectFactory.createUIChange({
					changeType: sChangeType
				});
			}, new Error(`File name '${sExpectedFileName}' must not exceed 64 characters`), "then an error is thrown");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});