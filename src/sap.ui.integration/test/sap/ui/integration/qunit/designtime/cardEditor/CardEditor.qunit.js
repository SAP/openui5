/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/integration/designtime/cardEditor/CardEditor",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	CardEditor,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given a CardEditor", {
		beforeEach: function() {
			this.oCardEditor = new CardEditor();
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when setDesigntimeChanges is called before init", function(assert) {
			this.oCardEditor.setDesigntimeChanges({foo: "bar"});
			assert.deepEqual(this.oCardEditor.getDesigntimeChanges(), {foo: "bar"}, "the changes were properly set");
		});

		QUnit.test("when setDesigntimeChanges is called after init", function(assert) {
			this.oCardEditor._oInitialDesigntimeMetadata = {someObject: "bar"};
			assert.throws(function() {
				this.oCardEditor.setDesigntimeChanges({foo: "bar"});
			}, /Designtime Changes can only be set initially/, "the function throws an error");
		});

		QUnit.test("when specific config is set and contains no i18n file", function (assert) {
			return this.oCardEditor._addSpecificConfig({}).then(function() {
				assert.deepEqual(
					this.oCardEditor.getConfig(),
					Object.assign({}, {
						i18n: [
							"sap/ui/integration/designtime/baseEditor/i18n/i18n.properties",
							"sap/ui/integration/designtime/cardEditor/i18n/i18n.properties"
						]
					}),
					"then default i18n package is provided"
				);
			}.bind(this));
		});

		QUnit.test("when specific config is set and contains i18n file as string", function (assert) {
			var oRequireStub = sandbox.stub(sap.ui, "require").callThrough();
			var sEditorConfigPath = "sample/card/designtime/editor.config";
			oRequireStub.withArgs([sEditorConfigPath]).callsArgWith(1, {
				i18n: "test_i18n.properties"
			});

			this.oCardEditor.setBaseUrl("/card");
			this.oCardEditor.setJson({
				"sap.app": {
					"id": "sample.card"
				},
				"sap.card": {
					"designtime": "designtime"
				}
			});

			return this.oCardEditor.ready().then(function () {
				assert.strictEqual(
					this.oCardEditor.getConfig().i18n.length,
					4,
					"Then the card-specific i18n, designtime i18n and the default i18n are merged"
				);

				assert.notStrictEqual(
					this.oCardEditor.getConfig().i18n.indexOf("test_i18n.properties"),
					-1,
					"Then the card-specific i18n is contained in the list"
				);
			}.bind(this));
		});

		QUnit.test("when specific config is set and contains an i18n string", function (assert) {
			return this.oCardEditor._addSpecificConfig({
				i18n: "i18n_file"
			}).then(function() {
				assert.deepEqual(
					this.oCardEditor.getConfig(),
					Object.assign({}, {
						i18n: [
							"i18n_file",
							"sap/ui/integration/designtime/baseEditor/i18n/i18n.properties",
							"sap/ui/integration/designtime/cardEditor/i18n/i18n.properties"
						]
					}),
					"then default i18n package and the specified package are added"
				);
			}.bind(this));
		});

		QUnit.test("when the card-specific configuration is loaded after the editor received default config and manifest", function (assert) {
			var fnDone = assert.async();

			var oInitializationSpy = sandbox.spy(this.oCardEditor, "_initialize");

			var fnResolveSetConfig;
			var oSetConfigPromise = new Promise(function (fnResolve) {
				fnResolveSetConfig = fnResolve;
			});

			this.oCardEditor.attachConfigChange(function () {
				// Default config was set
				fnResolveSetConfig();
			});

			// Fake a card-specifc editor config
			var oRequireStub = sandbox.stub(sap.ui, "require").callThrough();
			var sEditorConfigPath = "sample/card/designtime/editor.config";
			oRequireStub.withArgs([sEditorConfigPath]).callsFake(function (path, fnSuccess) {
				oSetConfigPromise.then(function () {
					fnSuccess({
						context: "sap.card",
						properties: {
							sampleString: {
								type: "string",
								path: "sampleString"
							}
						},
						propertyEditors: {
							"string": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor"
						}
					});
				});
			});

			this.oCardEditor.attachPropertyEditorsReady(function (oEvent) {
				assert.strictEqual(
					oEvent.getParameter("propertyEditors").length,
					1,
					"then only the editors specified in the card are created"
				);
				assert.strictEqual(oInitializationSpy.callCount, 1, "then the editor is only initialized once");
				fnDone();
			});
			this.oCardEditor.setBaseUrl("/card");
			this.oCardEditor.setJson({
				"sap.app": {
					"id": "sample.card"
				},
				"sap.card": {
					"designtime": "designtime",
					"sampleString": "foo"
				}
			});
		});

		QUnit.test("when a CardEditor with a default config receives a specific config", function (assert) {
			var oSpecificConfig = {
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

			return this.oCardEditor._addSpecificConfig(oSpecificConfig)
				.then(function() {
					assert.deepEqual(
						this.oCardEditor.getConfig().properties,
						oSpecificConfig.properties,
						"then the properties from the specific config are taken"
					);
				}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
