/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/base/util/restricted/_omit",
	"sap/ui/thirdparty/sinon-4"
], function (
	BaseEditor,
	_omit,
	sinon
) {
	"use strict";

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
		}
	}, function () {
		QUnit.test("When config with 1 property is set", function (assert) {
			var done = assert.async();
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
			});

			this.oBaseEditor.placeAt("qunit-fixture");

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
			this.oBaseEditor.setConfig(mConfig);
			assert.deepEqual(
				this.oBaseEditor.getConfig(),
				Object.assign({}, mConfig, {
					i18n: [
						"sap/ui/integration/designtime/baseEditor/i18n/i18n.properties"
					]
				}),
				"then default i18n package is provided"
			);
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
			this.oBaseEditor.setConfig(mConfig2);

			assert.deepEqual(
				_omit(this.oBaseEditor.getConfig(), "i18n"),
				mConfig2,
				"then the correct config is saved"
			);
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

			this.oBaseEditor.addConfig(mConfig);

			assert.deepEqual(
				_omit(this.oBaseEditor.getConfig(), "i18n"),
				mConfig,
				"then the correct config is saved"
			);
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

			this.oBaseEditor.setConfig(mConfig1);
			this.oBaseEditor.addConfig(mConfig2);

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


	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
