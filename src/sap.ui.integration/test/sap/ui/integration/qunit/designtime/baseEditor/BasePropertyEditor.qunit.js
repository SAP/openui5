/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
],
function (
	sinon,
	BaseEditor,
	StringEditor
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Ready state handling", {
		beforeEach: function (assert) {
			var mPropertyConfig = {
				cars: {
					label: "cars",
					path: "cars",
					type: "array",
					template: {
						manufacturer: {
							label: "Manufacturer",
							type: "string",
							path: "manufacturer"
						}
					}
				},
				foo: {
					label: "foo",
					path: "foo",
					type: "string"
				}
			};
			var fnDone = assert.async(Object.keys(mPropertyConfig).length); // Wait for all editors to be created but not ready
			var mConfig = {
				properties: mPropertyConfig,
				propertyEditors: {
					array: "sap/ui/integration/designtime/baseEditor/propertyEditor/arrayEditor/ArrayEditor",
					string: "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};
			var mJson = {
				cars: [
					{
						manufacturer: "BMW"
					}, {
						manufacturer: "Jaguar"
					}
				],
				foo: "bar"
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			// Stub the asyncInit to artificially delay the editors getting ready
			this.oResolveAsyncInitDelay = [];
			var that = this; // Required to keep the wrappedMethod context
			var oAsyncInitStub = sandbox.stub(StringEditor.prototype, "asyncInit");
			oAsyncInitStub.callsFake(function () {
				return Promise.all([
					StringEditor.prototype.asyncInit.wrappedMethod.apply(this, arguments),
					new Promise(function (resolve) {
						that.oResolveAsyncInitDelay[this.getId()] = resolve;
					}.bind(this))
				]);
			});

			// Wait until the main property editors were added to the aggregation but are not ready yet
			var oAddPropertyEditorStub = sandbox.stub(BaseEditor.prototype, "addAggregation");
			oAddPropertyEditorStub.withArgs("_propertyEditors").callsFake(function () {
				BaseEditor.prototype.addAggregation.wrappedMethod.apply(this, arguments);
				fnDone();
			});
		},
		afterEach: function () {
			sandbox.restore();
			this.oBaseEditor.destroy();
			delete this.oResolveAsyncInitDelay;
		}
	}, function () {
		QUnit.test("When an editor is created", function (assert) {
			var fnDone = assert.async();
			var oFooEditor = this.oBaseEditor.getPropertyEditorSync("foo");

			assert.strictEqual(oFooEditor.isReady(), false, "Then it is not ready before the initialization");
			oFooEditor.ready().then(function () {
				assert.strictEqual(oFooEditor.isReady(), true, "Then it is ready after the initialization");
				fnDone();
			});

			this.oResolveAsyncInitDelay[oFooEditor.getId()](); // Simulate that asyncInit has finished
		});

		QUnit.test("When a complex editor is created", function (assert) {
			var fnDone = assert.async();
			var oCarsEditor = this.oBaseEditor.getPropertyEditorSync("cars");
			assert.strictEqual(
				oCarsEditor._iExpectedWrapperCount,
				this.oBaseEditor.getJson().cars.length,
				"Then it waits for the expected amount of wrappers"
			);
			assert.strictEqual(oCarsEditor.isReady(), false, "Then it is not ready if the children are not ready yet");

			var aNestedEditors = oCarsEditor._aEditorWrappers.map(function (oEditorWrapper) {
				return oEditorWrapper.getAggregation("propertyEditors")[0];
			});
			oCarsEditor.ready().then(function () {
				assert.ok(
					aNestedEditors.every(function (oNestedEditor) {
						return oNestedEditor.isReady();
					}),
					true,
					"Then it is ready after all children are ready"
				);
				fnDone();
			});

			aNestedEditors.forEach(function (oNestedEditor) {
				this.oResolveAsyncInitDelay[oNestedEditor.getId()]();
			}.bind(this));
		});

		QUnit.test("When the change of a complex editor leads to wrapper removal", function (assert) {
			var fnDone = assert.async();

			var oCarsEditor = this.oBaseEditor.getPropertyEditorSync("cars");
			var aWrappers = oCarsEditor._aEditorWrappers;
			var aNestedEditors = aWrappers.map(function (oEditorWrapper) {
				return oEditorWrapper.getAggregation("propertyEditors")[0];
			});
			aNestedEditors.forEach(function (oNestedEditor) {
				this.oResolveAsyncInitDelay[oNestedEditor.getId()]();
			}.bind(this));

			oCarsEditor.ready().then(function () {
				// Simulate value change to a nested editor
				var oConfig = oCarsEditor.getConfig();
				oConfig.value = [{
					manufacturer: "Tesla"
				}];
				oCarsEditor.setConfig(oConfig);

				assert.strictEqual(oCarsEditor.isReady(), true, "Then the ready state of the complex editor is not reset");
				assert.strictEqual(oCarsEditor._aEditorWrappers.length, 1, "Then the outdated wrapper references on the complex editor are removed");
				fnDone();
			});
		});

		QUnit.test("When the change of a complex editor leads to rerendering", function (assert) {
			var fnDone = assert.async();

			var oCarsEditor = this.oBaseEditor.getPropertyEditorSync("cars");
			var aWrappers = oCarsEditor._aEditorWrappers;
			var aNestedEditors = aWrappers.map(function (oEditorWrapper) {
				return oEditorWrapper.getAggregation("propertyEditors")[0];
			});
			aNestedEditors.forEach(function (oNestedEditor) {
				this.oResolveAsyncInitDelay[oNestedEditor.getId()]();
			}.bind(this));

			oCarsEditor.ready().then(function () {
				// Simulate value change to a nested editor
				oCarsEditor.attachEventOnce("ready", function () {
					assert.strictEqual(oCarsEditor.isReady(), true, "Then the ready state of the complex editor is reset");
					assert.strictEqual(oCarsEditor._aEditorWrappers.length, 3, "Then the wrapper references are updated");
					fnDone();
				});

				sandbox.restore(); // Don't intercept asyncInit anymore
				var oConfig = oCarsEditor.getConfig();
				oConfig.value.push({
					manufacturer: "Tesla"
				});
				oCarsEditor.setConfig(oConfig);
			});
		});
	});
});
