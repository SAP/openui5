/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
	"sap/ui/integration/designtime/baseEditor/PropertyEditor",
	"sap/ui/core/util/MockServer"
],
function (
	sinon,
	BaseEditor,
	BasePropertyEditor,
	StringEditor,
	PropertyEditor,
	MockServer
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Base functionality", {
		beforeEach: function (assert) {
			var done = assert.async();
			var mPropertyConfig = {
				foo: {
					label: "foo",
					path: "foo",
					type: "string"
				}
			};
			var mConfig = {
				context: "/",
				properties: mPropertyConfig,
				propertyEditors: {
					string: "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};
			var mJson = {
				foo: "bar"
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", done);
		},
		afterEach: function () {
			sandbox.restore();
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When an editor implements the formatter hook", function (assert) {
			var done = assert.async();
			var oFooEditor = this.oBaseEditor.getPropertyEditorsByNameSync("foo")[0];
			oFooEditor.getContent().bindProperty("value", "displayValue");
			oFooEditor.getAggregation("propertyEditor").formatValue = function (vValue) {
				return "Foo" + vValue;
			};
			oFooEditor.attachValueChange(function () {
				assert.strictEqual(oFooEditor.getValue(), "baz", "Then the editor value is not formatted");
				assert.strictEqual(oFooEditor.getContent().getValue(), "Foobaz", "Then the display value on the input control is formatted");
				done();
			});
			oFooEditor.setValue("baz");
		});

		QUnit.test("When an i18n property is requested before the BaseEditor i18n model was loaded", function (assert) {
			var oLoadI18nStub = sandbox.stub(BaseEditor.prototype, "_loadI18nBundles");
			oLoadI18nStub.callsFake(function () {
				return new Promise(function () {});
			});

			var oPropertyEditor = new PropertyEditor({
				config: {
					value: 'Test',
					type: 'string'
				}
			});

			// Create a new editor, otherwise the old, destroyed i18n model might still exist
			var oBaseEditor = new BaseEditor({
				config: {
					properties: {},
					propertyEditors: {
						string: "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
					}
				}
			});
			oBaseEditor.addContent(oPropertyEditor);

			return oPropertyEditor.ready().then(function () {
				assert.strictEqual(
					oPropertyEditor.getAggregation("propertyEditor").getI18nProperty('SOME_I18N_PROPERTY'),
					'SOME_I18N_PROPERTY',
					'Then the i18n property key is returned as a fallback'
				);
			});
		});
	});

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
			var fnDone = assert.async(3); // Wait for all string editors are created but not ready
			var mConfig = {
				context: "/",
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
				var oResult = Promise.all([
					StringEditor.prototype.asyncInit.wrappedMethod.apply(this, arguments),
					new Promise(function (resolve) {
						that.oResolveAsyncInitDelay[this.getId()] = resolve;
					}.bind(this))
				]);

				fnDone();

				return oResult;
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
			var oFooEditor = this.oBaseEditor.getPropertyEditorsByNameSync("foo")[0].getAggregation("propertyEditor");

			assert.strictEqual(oFooEditor.isReady(), false, "Then it is not ready before the initialization");
			oFooEditor.ready().then(function () {
				assert.strictEqual(oFooEditor.isReady(), true, "Then it is ready after the initialization");
				fnDone();
			});

			this.oResolveAsyncInitDelay[oFooEditor.getId()](); // Simulate that asyncInit has finished
		});

		QUnit.test("When a complex editor is created", function (assert) {
			var fnDone = assert.async();
			var oCarsEditor = this.oBaseEditor.getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
			assert.strictEqual(
				oCarsEditor._iExpectedWrapperCount,
				this.oBaseEditor.getJson().cars.length,
				"Then it waits for the expected amount of wrappers"
			);
			assert.strictEqual(oCarsEditor.isReady(), false, "Then it is not ready if the children are not ready yet");

			var aNestedEditors = oCarsEditor._aEditorWrappers.map(function (oEditorWrapper) {
				return oEditorWrapper._getPropertyEditors()[0].getAggregation("propertyEditor");
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

			var oCarsEditor = this.oBaseEditor.getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
			var aWrappers = oCarsEditor._aEditorWrappers;
			var aNestedEditors = aWrappers.map(function (oEditorWrapper) {
				return oEditorWrapper._getPropertyEditors()[0].getAggregation("propertyEditor");
			});
			aNestedEditors.forEach(function (oNestedEditor) {
				this.oResolveAsyncInitDelay[oNestedEditor.getId()]();
			}.bind(this));

			oCarsEditor.ready().then(function () {
				// Simulate value change to a nested editor
				oCarsEditor.setValue([{
					manufacturer: "Tesla"
				}]);

				assert.strictEqual(oCarsEditor.isReady(), true, "Then the ready state of the complex editor is not reset");
				assert.strictEqual(oCarsEditor._aEditorWrappers.length, 1, "Then the outdated wrapper references on the complex editor are removed");
				fnDone();
			});
		});

		QUnit.test("When the change of a complex editor leads to rerendering", function (assert) {
			var fnDone = assert.async();

			var oCarsEditor = this.oBaseEditor.getPropertyEditorsByNameSync("cars")[0].getAggregation("propertyEditor");
			var aWrappers = oCarsEditor._aEditorWrappers;
			var aNestedEditors = aWrappers.map(function (oEditorWrapper) {
				return oEditorWrapper._getPropertyEditors()[0].getAggregation("propertyEditor");
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
				var aValue = oCarsEditor.getValue();
				oCarsEditor.setValue(
					aValue.concat({
						manufacturer: "Tesla"
					})
				);
			});
		});
	});

	QUnit.module("Validation", {
		beforeEach: function (assert) {
			var mPropertyConfig = {
				invalidFoo: {
					path: "invalidFoo",
					type: "string"
				}
			};
			var mConfig = {
				context: "/",
				properties: mPropertyConfig,
				propertyEditors: {
					string: "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};
			var mJson = {
				invalidFoo: "{bar"
			};

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.ready();
		},
		afterEach: function () {
			sandbox.restore();
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("when a validator is disabled via config change", function (assert) {
			var oFooEditor = this.oBaseEditor.getPropertyEditorsByNameSync("invalidFoo")[0];

			assert.strictEqual(
				oFooEditor.getContent().getValueState(),
				"Error",
				"then the invalid value initially leads to an error"
			);

			oFooEditor.setConfig(Object.assign(
				{},
				oFooEditor.getConfig(),
				{
					validators: {
						isValidBinding: {
							isEnabled: false
						}
					}
				}
			));

			assert.strictEqual(
				oFooEditor.getContent().getValueState(),
				"None",
				"then the error state is update after the validator was disabled"
			);
		});
	});

	QUnit.module("Dynamic fragment", {
		before: function () {
			this.sFragmentWithButton = [
				'<core:FragmentDefinition',
					'xmlns="sap.m"',
					'xmlns:core="sap.ui.core"',
				'>',
					'<Button text="My Button" />',
				'</core:FragmentDefinition>'
			].join(" ");

			this.sFragmentWithLabel = [
				'<core:FragmentDefinition',
					'xmlns="sap.m"',
					'xmlns:core="sap.ui.core"',
				'>',
					'<Label text="My Label" />',
				'</core:FragmentDefinition>'
			].join(" ");

			this.CustomEditorWithDefaultFragment = BasePropertyEditor.extend("CustomEditor", {
				xmlFragment: "CustomEditor",
				renderer: BasePropertyEditor.getMetadata().getRenderer()
			});

			this.createResponse = function (sFragmentName, sFragmentContent) {
				return {
					method: "GET",
					path: sap.ui.require.toUrl(sFragmentName + ".fragment.xml"),
					response: function (xhr) {
						xhr.respondXML(200, null, sFragmentContent);
					}
				};
			};
		},
		beforeEach: function () {
			this.oMockServer = new MockServer();
		},
		afterEach: function () {
			sandbox.restore();
			this.oMockServer.destroy();
			this.oCustomEditor.destroy();
		}
	}, function () {
		QUnit.test("when default fragment is defined in a custom editor", function (assert) {
			this.oMockServer.setRequests([
				this.createResponse("CustomEditor", this.sFragmentWithButton)
			]);
			this.oMockServer.start();

			var oFragmentReadySpy = sandbox.spy();
			this.oCustomEditor = new this.CustomEditorWithDefaultFragment();
			this.oCustomEditor.onFragmentReady = oFragmentReadySpy;

			return this.oCustomEditor.ready().then(function () {
				assert.strictEqual(oFragmentReadySpy.callCount, 1, "then onFragmentReady hook is called once");

				var oControl = this.oCustomEditor.getContent();
				assert.ok(oControl, "then fragment is added to editor");
				assert.ok(oControl.isA("sap.m.Button"), "then the fragment contains button");
				assert.strictEqual(oControl.getText(), "My Button", "then the button has a correct text");
			}.bind(this));
		});

		QUnit.test("when setFragment() is called on a custom editor", function (assert) {
			var oFragmentReadySpy = sandbox.spy();
			this.oCustomEditor = new BasePropertyEditor();
			this.oCustomEditor.onFragmentReady = oFragmentReadySpy;

			this.oMockServer.setRequests([
				this.createResponse("CustomEditor", this.sFragmentWithButton)
			]);
			this.oMockServer.start();

			this.oCustomEditor.setFragment("CustomEditor");


			return this.oCustomEditor.ready().then(function () {
				assert.strictEqual(oFragmentReadySpy.callCount, 1, "then onFragmentReady hook is called once");

				var oControl = this.oCustomEditor.getContent();
				assert.ok(oControl, "then fragment is added to editor");
				assert.ok(oControl.isA("sap.m.Button"), "then the fragment contains button");
				assert.strictEqual(oControl.getText(), "My Button", "then the button has a correct text");
			}.bind(this));
		});

		QUnit.test("when setFragment() is called on a custom editor with predefined xmlFragment (default fragment)", function (assert) {
			this.oMockServer.setRequests([
				this.createResponse("CustomEditor", this.sFragmentWithButton),
				this.createResponse("AnotherFragment", this.sFragmentWithLabel)
			]);
			this.oMockServer.start();

			this.oCustomEditor = new this.CustomEditorWithDefaultFragment();


			return this.oCustomEditor.ready().then(function () {
				var oFragmentReadySpy = sandbox.spy();
				this.oCustomEditor.onFragmentReady = oFragmentReadySpy;
				this.oCustomEditor.setFragment("AnotherFragment");

				return this.oCustomEditor.ready().then(function () {
					assert.strictEqual(oFragmentReadySpy.callCount, 1, "then onFragmentReady hook is called once");

					var oControl = this.oCustomEditor.getContent();
					assert.ok(oControl, "then fragment is added to editor");
					assert.ok(oControl.isA("sap.m.Label"), "then the fragment contains button");
					assert.strictEqual(oControl.getText(), "My Label", "then button has a correct text");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when setFragment() is called several times in a row", function (assert) {
			var oFragmentReadySpy = sandbox.spy();
			this.oCustomEditor = new BasePropertyEditor();
			this.oCustomEditor.onFragmentReady = oFragmentReadySpy;

			this.oMockServer.setRequests([
				this.createResponse("CustomEditor", this.sFragmentWithButton),
				this.createResponse("AnotherFragment", this.sFragmentWithLabel)
			]);
			this.oMockServer.start();

			this.oCustomEditor.setFragment("CustomEditor");
			this.oCustomEditor.setFragment("AnotherFragment");
			this.oCustomEditor.setFragment("CustomEditor");
			this.oCustomEditor.setFragment("AnotherFragment");
			this.oCustomEditor.setFragment("CustomEditor");
			this.oCustomEditor.setFragment("AnotherFragment");

			return this.oCustomEditor.ready().then(function () {
				assert.strictEqual(oFragmentReadySpy.callCount, 1, "then onFragmentReady hook is called once");

				var oControl = this.oCustomEditor.getContent();
				assert.ok(oControl, "then fragment is added to editor");
				assert.ok(oControl.isA("sap.m.Label"), "then the fragment contains button");
				assert.strictEqual(oControl.getText(), "My Label", "then button has a correct text");
			}.bind(this));
		});

		QUnit.test("when setFragment() is called twice in a row", function (assert) {
			this.oCustomEditor = new BasePropertyEditor();

			var oCreationStub = sandbox.stub(this.oCustomEditor, "_loadFragment").callThrough();

			var oOriginalFragment;
			oCreationStub.onFirstCall().callsFake(function () {
				return this.oCustomEditor._loadFragment.wrappedMethod.apply(this, arguments)
					.then(function (oFragment) {
						oOriginalFragment = oFragment;
						return oFragment;
					});
			}.bind(this));

			this.oMockServer.setRequests([
				this.createResponse("CustomEditor", this.sFragmentWithButton),
				this.createResponse("AnotherFragment", this.sFragmentWithLabel)
			]);
			this.oMockServer.start();

			this.oCustomEditor.setFragment("CustomEditor");
			this.oCustomEditor.setFragment("AnotherFragment");

			return this.oCustomEditor.ready().then(function () {
				assert.strictEqual(oOriginalFragment.bIsDestroyed, true, "then the canceled fragment is cleaned up");
			});
		});

		QUnit.test("when BasePropertyEditor is destroyed before fragment is loaded", function (assert) {
			var fnDone = assert.async();
			var oFragmentReadySpy = sandbox.spy();
			this.oCustomEditor = new BasePropertyEditor();
			this.oCustomEditor.onFragmentReady = oFragmentReadySpy;

			this.oMockServer.setRequests([
				this.createResponse("CustomEditor", this.sFragmentWithButton)
			]);
			this.oMockServer.start();

			this.oCustomEditor.setFragment("CustomEditor");
			this.oCustomEditor.destroy();

			setTimeout(function () {
				assert.strictEqual(oFragmentReadySpy.callCount, 0, "then hook wasn't called");
				fnDone();
			}, 100);

		});
	});

	QUnit.module("Events", function () {
		QUnit.test("init event", function (assert) {
			var fnDone = assert.async();
			new BasePropertyEditor({
				init: function () {
					assert.ok(true, "init event is called properly");
					this.destroy();
					fnDone();
				}
			});
		});
	});

	QUnit.module("Given a BasePropertyEditor default config", {
		beforeEach: function () {
			var mConfig = {
				context: "/",
				properties: {
					foo: {
						path: "foo",
						type: "string",
						configB: "property B",
						configC: "property C",
						configE: {
							b: "property E"
						},
						configF: ["property F"]
					}
				},
				propertyEditors: {
					string: "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};
			var mJson = {
				foo: "bar"
			};

			sandbox.stub(StringEditor, "configMetadata").value({
				configA: {
					defaultValue: "editor default A"
				},
				configB: {
					defaultValue: "editor default B"
				},
				configD: {
					defaultValue: "editor default D"
				},
				configE: {
					defaultValue: {
						a: "editor default E"
					}
				},
				configF: {
					defaultValue: ["editor default F"]
				}
			});

			sandbox.stub(StringEditor.prototype, "onBeforeConfigChange").callsFake(function (oConfig) {
				return Object.assign(
					{},
					oConfig,
					{
						configC: "editor modification C",
						configD: "editor modification D"
					}
				);
			});

			this.oBaseEditor = new BaseEditor({
				config: mConfig,
				json: mJson
			});
			this.oBaseEditor.placeAt("qunit-fixture");
			return this.oBaseEditor.ready().then(function () {
				this.oFooEditor = this.oBaseEditor.getPropertyEditorsByNameSync("foo")[0].getAggregation("propertyEditor");
			}.bind(this));
		},
		afterEach: function () {
			sandbox.restore();
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When an editor defines a default config option which is not overridden", function (assert) {
			assert.strictEqual(
				this.oFooEditor.getConfig().configA,
				"editor default A",
				"Then it is added to the property configuration"
			);
		});

		QUnit.test("When an editor default config option is set in the property configuration", function (assert) {
			assert.strictEqual(
				this.oFooEditor.getConfig().configB,
				"property B",
				"Then the property config overrides the editor default config"
			);
		});

		QUnit.test("When an editor modifies the config in the onBeforeConfigurationChange hook", function (assert) {
			assert.strictEqual(
				this.oFooEditor.getConfig().configC,
				"editor modification C",
				"Then the property config is overridden"
			);
		});

		QUnit.test("When an editor modifies the default config in the onBeforeConfigurationChange hook", function (assert) {
			assert.strictEqual(
				this.oFooEditor.getConfig().configD,
				"editor modification D",
				"Then the editor default config is overridden"
			);
		});

		QUnit.test("When the default config contains complex values", function (assert) {
			assert.deepEqual(
				this.oFooEditor.getConfig().configE,
				{
					b: "property E"
				},
				"Then objects in the editor default config are overridden"
			);

			assert.deepEqual(
				this.oFooEditor.getConfig().configF,
				["property F"],
				"Then arrays in the editor default config are overridden"
			);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
