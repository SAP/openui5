/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/fieldExtensibility/cap/dialog/CustomFieldCAPDialog",
	"sap/m/MessageToast"
], function(
	jQuery,
	sinon,
	CustomFieldCAPDialog,
	MessageToast
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	var oSampleEntityTypeInfo = {
		boundEntitySet: {
			$Type: "SampleType"
		},
		entityTypes: [
			"SampleType", "SomeOtherType"
		]
	};

	function waitForDialog(oCAPDialog) {
		return new Promise(function(resolve) {
			sandbox.stub(oCAPDialog, "setProperty")
				.callThrough()
				.withArgs("_dialog")
				.callsFake(function(sPropertyName, oDialog) {
					oCAPDialog.setProperty.wrappedMethod.apply(this, arguments);
					oDialog.attachEventOnce("afterOpen", function () {
						resolve(oDialog);
					});
				});
		});
	}

	QUnit.module("Custom field dialog", {
		beforeEach: function() {
			this.oCAPDialog = new CustomFieldCAPDialog();
		},
		afterEach: function() {
			this.oCAPDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the dialog is opened", function(assert) {
			var oDialogPromise = waitForDialog(this.oCAPDialog)
				.then(function() {
					var oEditor = this.oCAPDialog._oEditor;
					return oEditor.ready()
						.then(function() {
							assert.ok(oEditor.isReady(), "then the editor is initialized");
							assert.deepEqual(
								oEditor.getJson(),
								{
									entityType: "SampleType",
									name: "NewField",
									type: "cds.String"
								},
								"then the default definition is loaded"
							);
						});
				}.bind(this));
			this.oCAPDialog.open(oSampleEntityTypeInfo);
			return oDialogPromise;
		});

		QUnit.test("when the dialog is opened twice", function(assert) {
			var oDialogPromise = waitForDialog(this.oCAPDialog)
				.then(function() {
					var oEditor = this.oCAPDialog._oEditor;
					return oEditor.ready()
						.then(function() {
							oEditor.setJson({
								name: "TestField",
								type: "cds.String",
								entityType: "SampleType"
							});
							this.oCAPDialog.onCancel();
							this.oCAPDialog.open(oSampleEntityTypeInfo);
							assert.deepEqual(oEditor.getJson(),
								{
									entityType: "SampleType",
									name: "NewField",
									type: "cds.String"
								},
								"then the editor data is reset"
							);
						}.bind(this));
				}.bind(this));
			this.oCAPDialog.open(oSampleEntityTypeInfo);
			return oDialogPromise;
		});
	});

	QUnit.module("Custom field creation", {
		beforeEach: function() {
			this.oCAPDialog = new CustomFieldCAPDialog();
			var oDialogPromise = waitForDialog(this.oCAPDialog);
			this.oCAPDialog.open(oSampleEntityTypeInfo);
			this.aRequests = [];

			return oDialogPromise.then(function() {
				return this.oCAPDialog._oEditor.ready().then(function () {
					var oFakeXHR = sandbox.useFakeXMLHttpRequest();
					oFakeXHR.onCreate = function(xhr) {
						this.aRequests.push(xhr);
					}.bind(this);
				}.bind(this));
			}.bind(this));
		},
		afterEach: function() {
			this.oCAPDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a field is created", function(assert) {
			var oSuccessSpy = sandbox.spy(MessageToast, "show");
			var oTestPayload = {
				name: "TestField",
				type: "cds.String",
				entityType: "SampleType"
			};
			this.oCAPDialog._oEditor.setJson(oTestPayload);
			this.oCAPDialog.onSave();

			assert.ok(
				this.aRequests[0].url.endsWith("/extensibility/addField"),
				"then the addField endpoint is called"
			);
			assert.deepEqual(
				JSON.parse(JSON.parse(this.aRequests[0].requestBody).definition),
				oTestPayload,
				"then the proper payload is passed"
			);
			this.aRequests[0].respond(200);
			return Promise.resolve().then(function () {
				assert.ok(oSuccessSpy.calledOnce, "then a success message is displayed");
			});
		});

		QUnit.test("when the field creation is canceled", function(assert) {
			var oTestPayload = {
				name: "TestField",
				type: "cds.String",
				entityType: "SampleType"
			};
			this.oCAPDialog._oEditor.setJson(oTestPayload);
			this.oCAPDialog.onCancel();

			assert.strictEqual(
				this.aRequests.length,
				0,
				"then the create request is not sent"
			);
		});

		// Currently broken because files are loaded which interfer with sinon xhr stub
		// Filtering the xhr doesn't seem to work for some reason
		// QUnit.test("when a field is created with a custom annotation", function(assert) {
		// 	this.oCAPDialog._oEditor.setJson({
		// 		name: "TestField",
		// 		type: "cds.Integer",
		// 		entityType: "SampleType",
		// 		"@assert.range": [0, 1],
		// 		annotations: {
		// 			"@custom.annotation": 123
		// 		}
		// 	});
		// 	this.oCAPDialog.onSave();

		// 	assert.deepEqual(
		// 		JSON.parse(JSON.parse(this.aRequests[0].requestBody).definition),
		// 		{
		// 			name: "TestField",
		// 			type: "cds.Integer",
		// 			entityType: "SampleType",
		// 			"@assert.range": [0, 1],
		// 			"@custom.annotation": 123
		// 		},
		// 		"then the custom annotation is added to the payload"
		// 	);
		// });

		QUnit.test("when a string field with a range assertion is created", function(assert) {
			this.oCAPDialog._oEditor.setJson({
				name: "TestField",
				type: "cds.String",
				entityType: "SampleType",
				"@assert.range": ["a", "b", "c"]
			});
			this.oCAPDialog.onSave();

			assert.deepEqual(
				JSON.parse(JSON.parse(this.aRequests[0].requestBody).definition),
				{
					"@assert.range": true,
					entityType: "SampleType",
					"enum": {
						a: {},
						b: {},
						c: {}
					},
					name: "TestField",
					type: "cds.String"
				},
				"then the custom annotation is added to the payload"
			);
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});