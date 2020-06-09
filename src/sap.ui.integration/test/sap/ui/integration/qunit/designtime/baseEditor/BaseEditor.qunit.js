/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_merge",
	"sap/ui/integration/designtime/baseEditor/PropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
	"sap/ui/thirdparty/sinon-4"
], function (
	BaseEditor,
	_omit,
	_merge,
	PropertyEditor,
	StringEditor,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given BaseEditor is created", {
		beforeEach: function () {
			this.oBaseEditor = new BaseEditor({
				json: {
					context: {
						prop1: "value1",
						prop2: "value2",
						prop3: "value3",
						prop4: "value4"
					},
					fooPath: {
						foo1: "bar1"
					}
				}
			});
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("When config with 1 property is set", function (assert) {
			var done = assert.async();
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync().length, 1, "Then 1 property editor is created");
				assert.strictEqual(
					this.oBaseEditor.getPropertyEditorsSync()[0].getValue(),
					"value1",
					"Then value of the property is correctly set on the property editor"
				);
				done();
			}.bind(this));

			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						label: "Prop1",
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			}).then(function() {
				this.oBaseEditor.placeAt("qunit-fixture");
			}.bind(this));
		});

		QUnit.test("When config has no context", function (assert) {
			var done = assert.async();
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(
					this.oBaseEditor.getPropertyEditorsSync()[0].getValue(),
					"bar1",
					"Then absolute paths are properly resolved"
				);
				done();
			}.bind(this));
			this.oBaseEditor.setConfig({
				properties: {
					"prop1": {
						label: "Prop1",
						path: "/fooPath/foo1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			}).then(function() {
				this.oBaseEditor.placeAt("qunit-fixture");
			}.bind(this));
		});

		QUnit.test("When config has a root context", function (assert) {
			var done = assert.async();
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(
					this.oBaseEditor.getPropertyEditorsSync()[0].getValue(),
					"bar1",
					"Then bindings are properly resolved"
				);
				done();
			}.bind(this));
			this.oBaseEditor.setConfig({
				context: "/",
				properties: {
					"prop1": {
						label: "Prop1",
						path: "fooPath/foo1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			}).then(function() {
				this.oBaseEditor.placeAt("qunit-fixture");
			}.bind(this));
		});

		QUnit.test("When setJson is called with an object", function (assert) {
			var done = assert.async();
			var oJson = {
				foo: "bar"
			};
			this.oBaseEditor.attachJsonChange(function (oEvent) {
				assert.notEqual(oJson, oEvent.getParameter("json"), "Then the json value is cloned");
				done();
			});
			this.oBaseEditor.setJson(oJson);
		});

		QUnit.test("When config with 1 property with dots in its name is set", function (assert) {
			var done = assert.async();
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"my.prop.name": {
						label: "Prop1",
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});

			this.oBaseEditor.placeAt("qunit-fixture");

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsSync().length, 1, "Then 1 property editor is created");
				assert.strictEqual(
					this.oBaseEditor.getPropertyEditorsByNameSync("my.prop.name")[0].getValue(),
					"value1",
					"Then value of the property is correctly set on the property editor"
				);
				done();
			}.bind(this));
		});

		QUnit.test("When property editor changes value", function (assert) {
			var done = assert.async();
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					},
					"prop2": {
						path: "prop2",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				this.oBaseEditor.attachJsonChange(function(oEvent) {
					assert.strictEqual(oEvent.getParameter("json").context.prop1, "test", "Then the value is updated in JSON");
					done();
				});

				this.oBaseEditor.getPropertyEditorsSync()[0].setValue("test");
			}.bind(this));
		});

		QUnit.test("When property editor changes value and other properties have default values", function (assert) {
			var done = assert.async();
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						path: "undefinedPath",
						type: "string",
						defaultValue: "Test"
					},
					"prop2": {
						path: "prop2",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});
			this.oBaseEditor.getPropertyEditorsByName("prop2").then(function (aPropertyEditor) {
				var oProp2Editor = aPropertyEditor[0];
				this.oBaseEditor.attachJsonChange(function(oEvent) {
					assert.strictEqual(oEvent.getParameter("json").context.prop2, "New Value", "Then the value is updated in JSON");
					done();
				});

				oProp2Editor.setValue("New Value");
			}.bind(this));
		});

		QUnit.test("When config contains properties with tags", function (assert) {
			var done = assert.async();

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				sap.ui.getCore().applyChanges();
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByNameSync("prop2")[0].getValue(), "value2", "Then property editor getter works with property name");

				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync("commonTag").length, 2, "Then property editor getter works with one tag (1/3)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync("commonTag")[0].getValue(), "value1", "Then property editor getter works with one tag (2/3)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync("commonTag")[1].getValue(), "value2", "Then property editor getter works with one tag (3/3)");

				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync(["commonTag", "tag1"]).length, 1, "Then property editor getter works with multiple tags (1/2)");
				assert.strictEqual(this.oBaseEditor.getPropertyEditorsByTagSync(["commonTag", "tag1"])[0].getValue(), "value1", "Then property editor getter works with multiple tags (2/2)");
				done();
			}, this);

			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						tags: ["tag1", "commonTag"],
						type: "string"
					},
					"prop2": {
						path: "prop2",
						tags: ["tag2", "commonTag"],
						type: "string"
					},
					"prop3": {
						path: "prop3",
						tags: [],
						type: "string"
					},
					"prop4": {
						path: "prop4",
						type: "anotherString"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"anotherString": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});

			this.oBaseEditor.placeAt("qunit-fixture");
		});

		QUnit.test("When a new BaseEditor is configured with default values before setting the manifest", function (assert) {
			var done = assert.async();
			this.oBaseEditor = new BaseEditor();

			var oJson = {
				context: {
					prop1: "value1",
					prop2: "value2",
					prop3: "value3",
					prop4: "value4"
				},
				fooPath: {
					foo1: "bar1"
				}
			};

			this.oBaseEditor.attachEventOnce("jsonChange", function (oEvent) {
				assert.deepEqual(
					oEvent.getParameter("json"),
					oJson,
					"Then the base editor fires the first JsonChange Event with the correct manifest"
				);
				done();
			});

			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string",
						defaultValue: "Default Value"
					},
					"prop2": {
						path: "prop2",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});

			// The timeout of 300ms is required to make sure that editors could be
			// created before setJson is called with the initial manifest.
			// Therefore this test makes sure that default values do not override
			// the actual manifest.
			// While the editor creation is currently aborted immediately, this blackbox test
			// should avoid regressions in future refactorings where editors might be created.
			setTimeout(function () {
				this.oBaseEditor.setJson(oJson);
			}.bind(this), 300);
		});

		QUnit.test("When setConfig is called without i18n file", function (assert) {
			var mConfig = {
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};
			return this.oBaseEditor.setConfig(mConfig).then(function() {
				assert.deepEqual(
					this.oBaseEditor.getConfig(),
					Object.assign({}, mConfig, {
						i18n: [
							"sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"
						]
					}),
					"then default i18n package is provided"
				);
			}.bind(this));
		});

		QUnit.test("When setConfig is called with i18n file as a string", function (assert) {
			var fnDone = assert.async();

			var oServer = sinon.createFakeServer();
			oServer.respondImmediately = true;
			oServer.xhr.useFilters = true;
			oServer.xhr.addFilter(function(method, url) {
				return !url.includes("custom/bundle/i18n");
			});
			oServer.respondWith("GET", /.*/, [200, {"Content-Type": "text/plain"}, 'TEST_PROPERTY=TEST_VALUE']);

			var mConfig = {
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				},
				i18n: "custom/bundle/i18n.properties"
			};

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				assert.strictEqual(
					this.oBaseEditor.getModel("i18n").getResourceBundle().getText("TEST_PROPERTY"),
					"TEST_VALUE",
					"then i18n package is set properly"
				);

				oServer.restore();
				fnDone();
			}, this);

			this.oBaseEditor.setConfig(mConfig);
		});

		QUnit.test("When setConfig is called with i18n file as an array", function (assert) {
			var fnDone = assert.async();

			var oServer = sinon.createFakeServer();
			oServer.respondImmediately = true;
			oServer.xhr.useFilters = true;
			oServer.xhr.addFilter(function(method, url) {
				return !url.includes("custom/bundle/i18n");
			});
			oServer.respondWith("GET", /i18n\_1\.properties$/, [200, {"Content-Type": "text/plain"}, 'TEST_PROPERTY_1=TEST_VALUE_1']);
			oServer.respondWith("GET", /i18n\_2\.properties$/, [200, {"Content-Type": "text/plain"}, 'TEST_PROPERTY_2=TEST_VALUE_2']);

			var mConfig = {
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				},
				i18n: [
					"custom/bundle/i18n_1.properties",
					"custom/bundle/i18n_2.properties"
				]
			};

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				var oResourceBundle = this.oBaseEditor.getModel("i18n").getResourceBundle();
				assert.strictEqual(oResourceBundle.getText("TEST_PROPERTY_1"), "TEST_VALUE_1", "then the first custom i18n package is set properly");
				assert.strictEqual(oResourceBundle.getText("TEST_PROPERTY_2"), "TEST_VALUE_2", "then the second custom i18n package is set properly");

				oServer.restore();
				fnDone();
			}, this);

			this.oBaseEditor.setConfig(mConfig);
		});

		QUnit.test("When setConfig is called several times", function (assert) {
			var mConfig1 = {
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};

			var mConfig2 = {
				context: "context",
				properties: {
					"prop2": {
						path: "prop2",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};

			this.oBaseEditor.setConfig(mConfig1);
			return this.oBaseEditor.setConfig(mConfig2).then(function() {
				assert.deepEqual(
					_omit(this.oBaseEditor.getConfig(), "i18n"),
					mConfig2,
					"then the correct config is saved"
				);
			}.bind(this));
		});

		QUnit.test("when _addSpecificConfig is called with a specific config - 1", function(assert) {
			var mConfig = {
				context: "context",
				properties: {
					prop1: {
						path: "prop1",
						type: "select"
					},
					foo: {
						path: "prop1",
						type: "select",
						allowBindings: false,
						allowCustomValues: false
					},
					bar: {
						path: "prop1",
						type: "select",
						allowBindings: true,
						allowCustomValues: true
					}
				},
				propertyEditors: {
					select: "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				},
				layout: {
					foo: "bar"
				},
				sameProperty: "foo"
			};

			var oSpecificConfig = {
				properties: {
					parameters: {
						tags: ["general2"],
						label: "myOwnLabel",
						path: "configuration/parameters2",
						type: "select",
						allowLabelChange: false,
						allowedTypes: ["string", "number", "foo"]
					},
					prop1: {
						type: "select",
						path: "prop11"
					},
					foo: {
						path: "prop1",
						type: "select",
						allowBindings: true,
						allowCustomValues: true
					},
					bar: {
						path: "prop1",
						type: "select",
						allowBindings: false,
						allowCustomValues: false
					}
				},
				context: "whatever",
				layout: {
					foo: "foobar"
				},
				sameProperty: "bar",
				newProperty: "foo"
			};

			var mExpectedConfig = {
				context: "context",
				properties: {
					prop1: {
						type: "select",
						path: "prop1"
					},
					foo: {
						path: "prop1",
						type: "select",
						allowBindings: false,
						allowCustomValues: true
					},
					bar: {
						path: "prop1",
						type: "select",
						allowBindings: false,
						allowCustomValues: true
					}
				},
				propertyEditors: {
					select: "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				},
				layout: {
					foo: "bar"
				},
				sameProperty: "foo",
				newProperty: "foo"
			};

			return this.oBaseEditor.setConfig(mConfig)
			.then(function() {
				return this.oBaseEditor._addSpecificConfig(oSpecificConfig);
			}.bind(this))
			.then(function() {
				assert.deepEqual(
					_omit(this.oBaseEditor.getConfig(), "i18n"),
					mExpectedConfig,
					"then the correct config is saved"
				);
			}.bind(this));
		});

		QUnit.test("when _addSpecificConfig is called with a specific config - 2", function(assert) {
			var mConfig = {
				properties: {
					parameters: {
						tags: ["general"],
						label: "label",
						path: "configuration/parameters",
						type: "map",
						allowTypeChange: true,
						allowedTypes: ["string", "number", "foo", "bar"]
					}
				},
				propertyEditors: {
					map: "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor"
				},
				i18n: [
					"i18n1",
					"i18n2"
				]
			};

			var oSpecificConfig = {
				properties: {
					parameters: {
						tags: ["general2"],
						label: "myOwnLabel",
						path: "configuration/parameters2",
						type: "map",
						allowTypeChange: false,
						allowedTypes: ["string", "foo", "foobar"]
					}
				},
				context: "whatever",
				i18n: [
					"i18n2",
					"i18n3"
				]
			};

			var mExpectedConfig = {
				context: "whatever",
				properties: {
					parameters: {
						tags: ["general"],
						label: "label",
						path: "configuration/parameters",
						type: "map",
						allowTypeChange: false,
						allowedTypes: ["string", "foo"]
					}
				},
				propertyEditors: {
					map: "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor"
				},
				i18n: [
					"i18n1",
					"i18n2",
					"sap/ui/integration/designtime/baseEditor/i18n/i18n.properties",
					"i18n3"
				]
			};

			return this.oBaseEditor.setConfig(mConfig)
			.then(function() {
				return this.oBaseEditor._addSpecificConfig(oSpecificConfig);
			}.bind(this))
			.then(function() {
				assert.deepEqual(this.oBaseEditor.getConfig(), mExpectedConfig, "then the correct config is saved");
			}.bind(this));
		});

		QUnit.test("when _addSpecificConfig is called with a specific config - 3", function(assert) {
			var mConfig = {
				context: "context",
				properties: {
					parameters: {
						tags: ["general"],
						label: "label",
						path: "configuration/parameters",
						type: "map",
						allowLabelChange: true,
						allowedTypes: ["string", "number", "foo", "bar"]
					}
				},
				propertyEditors: {
					map: "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor"
				}
			};

			var oSpecificConfig = {
				properties: {
					destinations: {
						path: "configuration/parameters2",
						type: "newType",
						allowKeyChange: true,
						allowAddAndRemove: false,
						allowedValues: ["string", "foo", "foobar"]
					}
				},
				propertyEditors: {
					map: "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					newType: "sap/ui/integration/designtime/cardEditor/propertyEditor/destinationsEditor/DestinationsEditor"
				},
				context: "whatever"
			};

			var mExpectedConfig = {
				context: "context",
				properties: {},
				propertyEditors: {
					"map": "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
					"newType": "sap/ui/integration/designtime/cardEditor/propertyEditor/destinationsEditor/DestinationsEditor"
				}
			};

			return this.oBaseEditor.setConfig(mConfig)
			.then(function() {
				return this.oBaseEditor._addSpecificConfig(oSpecificConfig);
			}.bind(this))
			.then(function() {
				assert.deepEqual(
					_omit(this.oBaseEditor.getConfig(), "i18n"),
					mExpectedConfig,
					"then the correct config is saved"
				);
			}.bind(this));
		});

		QUnit.test("when addConfig is called with a default and specific config in place", function(assert) {
			var mAddedConfig = {
				properties: {
					prop1: {
						type: "select",
						path: "prop12"
					},
					foo: {
						path: "prop1",
						type: "select",
						allowBindings: false
					},
					bar: {
						path: "prop1",
						type: "select",
						allowBindings: false
					}
				}
			};
			var oSpecificConfig = {
				properties: {
					prop1: {
						type: "select",
						path: "prop12"
					},
					foo: {
						path: "prop1",
						type: "select",
						allowBindings: true
					},
					bar: {
						path: "prop1",
						type: "select",
						allowBindings: false
					}
				},
				context: "whatever"
			};
			var mExpectedConfig = {
				context: "context",
				properties: {
					prop1: {
						type: "select",
						path: "prop12"
					},
					foo: {
						path: "prop1",
						type: "select",
						allowBindings: false
					},
					bar: {
						path: "prop1",
						type: "select",
						allowBindings: false
					}
				},
				propertyEditors: {
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			};

			return this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					prop1: {
						path: "prop1",
						type: "select"
					}
				},
				propertyEditors: {
					"select": "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor"
				}
			}).then(function() {
				this.oBaseEditor._oSpecificConfig = oSpecificConfig;
				return this.oBaseEditor.addConfig(mAddedConfig);
			}.bind(this)).then(function() {
				assert.deepEqual(
					_omit(this.oBaseEditor.getConfig(), "i18n"),
					mExpectedConfig,
					"then the correct config is saved"
				);
			}.bind(this));
		});

		QUnit.test("When addConfig is called before any custom configuration is set", function (assert) {
			var mConfig = {
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};

			return this.oBaseEditor.addConfig(mConfig).then(function() {
				assert.deepEqual(
					_omit(this.oBaseEditor.getConfig(), "i18n"),
					mConfig,
					"then the correct config is saved"
				);
			}.bind(this));
		});

		QUnit.test("When addConfig is called after some configuration is set", function (assert) {
			var mConfig1 = {
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			};

			var mConfig2 = {
				properties: {
					"prop2": {
						path: "prop2",
						type: "string"
					}
				}
			};

			return this.oBaseEditor.setConfig(mConfig1)

			.then(this.oBaseEditor.addConfig.bind(this.oBaseEditor, mConfig2))

			.then(function() {
				assert.deepEqual(
					_omit(this.oBaseEditor.getConfig(), "i18n"),
					{
						context: "context",
						properties: {
							"prop1": {
								path: "prop1",
								type: "string"
							},
							"prop2": {
								path: "prop2",
								type: "string"
							}
						},
						propertyEditors: {
							"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
						}
					},
					"then the correct config is saved"
				);
			}.bind(this));
		});

		QUnit.test("When addConfig is called and custom i18n bundle is specified", function (assert) {
			var fnDone = assert.async();

			var oServer = sinon.createFakeServer();
			oServer.respondImmediately = true;
			oServer.xhr.useFilters = true;
			oServer.xhr.addFilter(function(method, url) {
				return !url.includes("custom/bundle/i18n.properties");
			});
			oServer.respondWith("GET", /.*/, [200, {"Content-Type": "text/plain"}, 'TEST_PROPERTY=TEST_VALUE']);

			var mConfig = {
				context: "context",
				properties: {
					"prop1": {
						path: "prop1",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				},
				i18n: "custom/bundle/i18n.properties"
			};

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				var oResourceBundle = this.oBaseEditor.getModel("i18n").getResourceBundle();
				assert.strictEqual(oResourceBundle.getText("TEST_PROPERTY"), "TEST_VALUE", "then the custom i18n package is set properly");
				assert.strictEqual(oResourceBundle.getText("BASE_EDITOR.BOOLEAN.TRUE_VALUE"), "True", "then the standard i18n package is set properly");

				oServer.restore();
				fnDone();
			}, this);

			this.oBaseEditor.addConfig(mConfig);
		});

		QUnit.test("When the bound value of a managed property editor changes", function (assert) {
			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"prop1": {
						label: "Prop1",
						path: "prop1",
						type: "string",
						visible: "{= ${context>prop1} === 'value1'}"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});

			this.oBaseEditor.placeAt("qunit-fixture");

			return this.oBaseEditor.ready().then(function () {
				sap.ui.getCore().applyChanges();

				var oProp1Editor = this.oBaseEditor.getPropertyEditorsByNameSync("prop1")[0];
				oProp1Editor.setValue("New prop1 value");

				return oProp1Editor.ready().then(function () {
					assert.notOk(
						oProp1Editor.getConfig().visible,
						"Then the property editor config is updated"
					);
					assert.notOk(
						oProp1Editor.getEditor().getContent()[0].getConfig()[0].visible,
						"Then the wrapper configuration is updated"
					);
				});
			}.bind(this));
		});

		QUnit.test("When an editor is registered", function(assert) {
			var done = assert.async();
			var oStringEditor;
			this.oBaseEditor.setConfig({
				properties: {},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			}).then(function() {
				oStringEditor = new PropertyEditor({
					config: {
						path: "/fooPath/foo1",
						type: "string"
					}
				});

				this.oBaseEditor.addContent(oStringEditor);
				sap.ui.getCore().applyChanges();

				return this.oBaseEditor.ready();
			}.bind(this)).then(function() {
				this.oBaseEditor.attachEventOnce("jsonChange", function(oEvent) {
					var oJson = _merge({}, oEvent.getParameter("json"));

					assert.strictEqual(
						oJson.fooPath.foo1,
						"Hello World",
						"Then the base editor is informed about the property editor value change"
					);

					oJson.fooPath.foo1 = "Foofoo";

					oStringEditor.attachEventOnce("valueChange", function() {
						assert.strictEqual(
							oStringEditor.getValue(),
							"Foofoo",
							"Then the property editor is updated by the base editor"
						);
						done();
					});

					this.oBaseEditor.setJson(oJson);
				}, this);
				oStringEditor.setValue("Hello World");
			}.bind(this));
		});

		QUnit.test("When an editor is deregistered", function (assert) {
			var oStringEditor;
			var oSpy = sandbox.spy();
			return this.oBaseEditor.setConfig({
				properties: {},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			}).then(function() {
				oStringEditor = new PropertyEditor({
					config: {
						path: "/fooPath/foo1",
						type: "string"
					}
				});

				this.oBaseEditor.addContent(oStringEditor);
				sap.ui.getCore().applyChanges();

				// Changing the path to a relative path should deregister the editor
				oStringEditor.setConfig({
					path: "someRelativePath",
					type: "string"
				});
				this.oBaseEditor.attachEventOnce("jsonChange", oSpy);

				return oStringEditor.ready();
			}.bind(this)).then(function () {
				oStringEditor.setValue("Hello World");
				assert.strictEqual(oSpy.callCount, 0, "It does't sync with the BaseEditor anymore");
			});
		});

		QUnit.test("When an editor is created (Ready handling check)", function (assert) {
			var oReadySpy = sandbox.spy();
			this.oBaseEditor.attachEventOnce("propertyEditorsReady", oReadySpy);

			var fnResolveStringEditorCreation;
			var oCreationPromise = new Promise(function (resolve) {
				fnResolveStringEditorCreation = resolve;
			});
			var oStringEditorStub = sandbox.stub(StringEditor.prototype, "asyncInit");
			oStringEditorStub.callsFake(function () {
				return Promise.all([
					StringEditor.prototype.asyncInit.wrappedMethod.apply(this, arguments),
					oCreationPromise
				]);
			});

			return this.oBaseEditor.addConfig({
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
					"number": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor"
				}
			}).then(function() {
				// Creation will be artifically delayed by oStringEditorStub
				var oStringEditor = new PropertyEditor({
					config: {
						path: '/pathToAString',
						type: 'string'
					}
				});
				this.oBaseEditor.addContent(oStringEditor);

				var oNumberEditor = new PropertyEditor({
					config: {
						path: "/pathToANumber",
						type: "number"
					}
				});
				this.oBaseEditor.addContent(oNumberEditor);
				sap.ui.getCore().applyChanges();

				oNumberEditor.ready().then(function () {
					assert.strictEqual(oReadySpy.callCount, 0, "Then the BaseEditor doesn't fire ready before its initialization isn't finished");
					assert.notOk(this.oBaseEditor.isReady(), "Then the BaseEditor is initially not ready");
					fnResolveStringEditorCreation();
				}.bind(this));
				return this.oBaseEditor.ready();
			}.bind(this)).then(function() {
				assert.ok(this.oBaseEditor.isReady(), "Then the BaseEditor gets ready");
				var aNestedEditors = this.oBaseEditor.getPropertyEditorsSync();
				assert.strictEqual(
					aNestedEditors.length,
					2,
					"Then both editors are registered on the BaseEditor"
				);
				assert.ok(
					aNestedEditors.every(function (oNestedEditor) {
						return oNestedEditor.isReady();
					}),
					"Then all nested editors are ready"
				);
				assert.strictEqual(oReadySpy.callCount, 1, "Then the ready event is fired");
			}.bind(this));
		});
	});

	QUnit.module("Given BaseEditor is created and configured", {
		beforeEach: function () {
			this.oBaseEditor = new BaseEditor({
				json: {
					context: {
						foo: "bar",
						foo2: "baz"
					}
				},
				config: {
					context: "context",
					properties: {
						"foo": {
							path: "foo",
							type: "string"
						}
					},
					propertyEditors: {
						"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
					}
				}
			});
			return this.oBaseEditor.ready();
		},
		afterEach: function () {
			this.oBaseEditor.destroy();
		}
	}, function () {
		QUnit.test("When the config is changed", function (assert) {
			var done = assert.async();

			this.oBaseEditor.attachEventOnce("propertyEditorsReady", function () {
				assert.strictEqual(
					this.oBaseEditor.getPropertyEditorsSync()[0].getValue(),
					"baz",
					"Then bindings are properly resolved"
				);
				done();
			}, this);

			this.oBaseEditor.setConfig({
				context: "context",
				properties: {
					"foo": {
						path: "foo2",
						type: "string"
					}
				},
				propertyEditors: {
					"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
				}
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});