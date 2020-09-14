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

	function getBaseJson(sNamespace) {
		var oJson = {
			"sap.app": {
				id: "sap-app-id"
			}
		};
		oJson[sNamespace] = {
			configuration: {
				destinations: {
					myDestination1: {
						name: "myName1"
					},
					myDestination2: {
						name: "myName2"
					}
				},
				parameters: {
					myParameter1: {
						type: "string",
						value: "myParameter1"
					},
					myParameter2: {
						type: "int",
						value: 5
					}
				}
			}
		};
		return oJson;
	}

	QUnit.module("delta change handling (sap.card namespace)", {
		beforeEach: function() {
			this.oCardEditor = new CardEditor();
			this.oBaseJson = getBaseJson("sap.card");
			this.oCardEditor.setJson(this.oBaseJson);
			this.oPropertyBag = {
				layer: "ADMIN"
			};
			sandbox.stub(this.oCardEditor, "_formatExportedDesigntimeMetadata").returnsArg(0);
		},
		afterEach: function() {
			this.oCardEditor.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getDeltaChangeDefinition - without any changes", function (assert) {
			return this.oCardEditor.getDeltaChangeDefinition(this.oPropertyBag)
			.then(function(){
				assert.ok(false, "should not go here");
			})
			.catch(function(sError) {
				assert.equal(sError, "No Change", "the function rejects with a text");
			});
		});

		QUnit.test("getDeltaChangeDefinition - with some changes in sap.card namespace", function (assert) {
			this.oBaseJson["sap.card"].configuration.destinations.myDestination1.name = "myNewName1";
			this.oBaseJson["sap.card"].configuration.destinations.myDestination3 = {
				name: "myName3"
			};
			this.oBaseJson["sap.card"].configuration.parameters.myParameter1.value = "myNewParameter1";
			this.oBaseJson["sap.card"].configuration.parameters.myParameter3 = {
				type: "int",
				value: 2
			};
			this.oCardEditor.setJson(this.oBaseJson);

			return this.oCardEditor.getDeltaChangeDefinition(this.oPropertyBag)
			.then(function(oChange) {
				var oExpectedContent = {
					configuration: {
						destinations: {
							myDestination1: {
								name: "myNewName1"
							},
							myDestination3: {
								name: "myName3"
							}
						},
						parameters: {
							myParameter1: {
								value: "myNewParameter1"
							},
							myParameter3: {
								type: "int",
								value: 2
							}
						}
					}
				};
				assert.deepEqual(oChange.content, oExpectedContent, "the content is set correctly");
				assert.equal(oChange.changeType, "appdescr_card", "the change type is set correctly");
				assert.equal(oChange.fileType, "change", "the fileType is set correctly");
				assert.ok(oChange.creation, "the creation is filled");
				assert.equal(oChange.layer, this.oPropertyBag.layer, "the layer is set correctly");
				assert.equal(oChange.reference, "sap-app-id", "the reference is set correctly");
				assert.equal(oChange.support.generator, "CardEditor", "the generator is set correctly");
				assert.equal(oChange.appDescriptorChange, true, "the appDescriptorChange is set correctly");

				// make another change and save again
				this.oBaseJson["sap.card"].configuration.destinations.myDestination1.name = "myNewName111";
				this.oBaseJson["sap.card"].configuration.destinations.myDestination3 = {
					name: "myName333"
				};
				this.oBaseJson["sap.card"].configuration.parameters.myParameter1.value = "myNewParameter111";
				this.oCardEditor.setJson(this.oBaseJson);

				return this.oCardEditor.getDeltaChangeDefinition(this.oPropertyBag);
			}.bind(this))
			.then(function(oChange) {
				var oExpectedContent = {
					configuration: {
						destinations: {
							myDestination1: {
								name: "myNewName111"
							},
							myDestination3: {
								name: "myName333"
							}
						},
						parameters: {
							myParameter1: {
								value: "myNewParameter111"
							}
						}
					}
				};
				assert.deepEqual(oChange.content, oExpectedContent, "the content is set correctly");
				assert.equal(oChange.changeType, "appdescr_card", "the change type is set correctly");
				assert.equal(oChange.fileType, "change", "the fileType is set correctly");
				assert.ok(oChange.creation, "the creation is filled");
				assert.equal(oChange.layer, this.oPropertyBag.layer, "the layer is set correctly");
				assert.equal(oChange.reference, "sap-app-id", "the reference is set correctly");
				assert.equal(oChange.support.generator, "CardEditor", "the generator is set correctly");
				assert.equal(oChange.appDescriptorChange, true, "the appDescriptorChange is set correctly");
			}.bind(this));
		});

		QUnit.test("getDesigntimeChangeDefinition - without any change", function(assert) {
			var mMetadataJson = {
				foo: "bar",
				foobar: "foo"
			};
			sandbox.stub(this.oCardEditor, "getDesigntimeMetadata").returns(mMetadataJson);
			this.oCardEditor._oInitialDesigntimeMetadata = mMetadataJson;

			return this.oCardEditor.getDesigntimeChangeDefinition(this.oPropertyBag).then(function() {
				assert.ok(false, "should not go here");
			})
			.catch(function(sError) {
				assert.equal(sError, "No Change", "the function rejects with a text");
			});
		});

		QUnit.test("getDesigntimeChangeDefinition - with several different changes", function(assert) {
			var mOldJson = {
				"path/foo": "bar",
				"path/bar": "foobar",
				"path/to/array": ["value1", "value2"],
				"path/to/object": {
					old: "foo"
				},
				"path/to/boolean/1": true,
				"path/to/boolean/2": false
			};
			var mNewJson = {
				"path/foo": "bar1",
				"path/to/array": ["value2", "value3"],
				"path/to/object": {
					"new": "foo"
				},
				"path/to/new/property": "new",
				"path/to/boolean/1": false,
				"path/to/boolean/2": true
			};
			var aChanges = [
				{
					propertyPath: "path/foo",
					operation: "UPDATE",
					propertyValue: "bar1"
				},
				{
					propertyPath: "path/to/array",
					operation: "UPDATE",
					propertyValue: ["value2", "value3"]
				},
				{
					propertyPath: "path/to/object",
					operation: "UPDATE",
					propertyValue: { "new": "foo" }
				},
				{
					propertyPath: "path/to/new/property",
					operation: "INSERT",
					propertyValue: "new"
				},
				{
					propertyPath: "path/to/boolean/1",
					operation: "UPDATE",
					propertyValue: false
				},
				{
					propertyPath: "path/to/boolean/2",
					operation: "UPDATE",
					propertyValue: true
				},
				{
					propertyPath: "path/bar",
					operation: "DELETE"
				}
			];

			sandbox.stub(this.oCardEditor, "getDesigntimeMetadata").returns(mNewJson);
			this.oCardEditor._oInitialDesigntimeMetadata = mOldJson;
			return this.oCardEditor.getDesigntimeChangeDefinition(this.oPropertyBag).then(function(oChangeDefinition) {
				var oExpectedContent = {
					entityPropertyChange: aChanges
				};
				assert.deepEqual(oChangeDefinition.content, oExpectedContent, "the content is set correctly");
				assert.equal(oChangeDefinition.changeType, "appdescr_card_designtime", "the change type is set correctly");
				assert.equal(oChangeDefinition.fileType, "change", "the fileType is set correctly");
				assert.ok(oChangeDefinition.creation, "the creation is filled");
				assert.equal(oChangeDefinition.layer, this.oPropertyBag.layer, "the layer is set correctly");
				assert.equal(oChangeDefinition.reference, "sap-app-id", "the reference is set correctly");
				assert.equal(oChangeDefinition.support.generator, "CardEditor", "the generator is set correctly");
				assert.equal(oChangeDefinition.appDescriptorChange, true, "the appDescriptorChange is set correctly");
			}.bind(this));
		});

		QUnit.test("getChanges", function(assert) {
			var oGetDeltaChangeStub = sandbox.stub(this.oCardEditor, "getDeltaChangeDefinition").resolves("runtimeChange");
			var oGetDesigntimeChangeStub = sandbox.stub(this.oCardEditor, "getDesigntimeChangeDefinition").resolves("designtimeChange");
			var oPropertyBag = {
				foo: "bar"
			};
			return this.oCardEditor.getChanges(oPropertyBag).then(function(oChanges) {
				var oExpectedReturn = {
					runtimeChange: "runtimeChange",
					designtimeChange: "designtimeChange"
				};
				assert.deepEqual(oChanges, oExpectedReturn, "both changes got returned");
				assert.equal(oGetDeltaChangeStub.callCount, 1, "the function was called");
				assert.equal(oGetDeltaChangeStub.lastCall.args[0], oPropertyBag, "the propertybag was properly passed");
				assert.equal(oGetDesigntimeChangeStub.callCount, 1, "the function was called");
				assert.equal(oGetDesigntimeChangeStub.lastCall.args[0], oPropertyBag, "the propertybag was properly passed");
			});
		});

		QUnit.test("when getChanges is called multiple times", function (assert) {
			// Create runtime change
			this.oBaseJson["sap.card"].configuration.destinations.myDestination1.name = "myNewName1";
			this.oCardEditor.setJson(this.oBaseJson);

			// Create designtime change
			var mInitialDesigntimeMetadata = {
				"path/foo": "bar1"
			};
			var mNewDesigntimeMetadata = {
				"path/foo": "baz"
			};
			this.oCardEditor._oInitialDesigntimeMetadata = mInitialDesigntimeMetadata;
			this.oCardEditor.setDesigntimeMetadata(mNewDesigntimeMetadata);

			return this.oCardEditor.getChanges(this.oPropertyBag)
				.then(function(oChanges) {
					assert.strictEqual(
						oChanges.runtimeChange.content.configuration.destinations.myDestination1.name,
						"myNewName1",
						"then the runtime change is returned on first call"
					);
					assert.strictEqual(
						oChanges.designtimeChange.content.entityPropertyChange.length,
						1,
						"then the designtime change is returned on first call"
					);

					// Call second time without new changes
					return this.oCardEditor.getChanges(this.oPropertyBag)
						.then(function() {
							assert.ok(false, "should not go here");
						})
						.catch(function(sError) {
							assert.ok(typeof sError === "string", "then no changes are returned on second call");
						});
				}.bind(this));
		});

		QUnit.test("when only one change type was made", function (assert) {
			var mInitialDesigntimeMetadata = {
				"path/foo": "bar1"
			};
			var mNewDesigntimeMetadata = {
				"path/foo": "baz"
			};
			this.oCardEditor._oInitialDesigntimeMetadata = mInitialDesigntimeMetadata;
			this.oCardEditor.setDesigntimeMetadata(mNewDesigntimeMetadata);

			return this.oCardEditor.getChanges(this.oPropertyBag)
				.then(function(oChanges) {
					assert.strictEqual(oChanges.runtimeChange, undefined, "then no runtime change is returned");
					assert.strictEqual(oChanges.designtimeChange.content.entityPropertyChange.length, 1, "then the runtime change is returned");
				});
		});

		QUnit.test("when no changes were made", function (assert) {
			return this.oCardEditor.getChanges(this.oPropertyBag)
				.then(function() {
					assert.ok(false, "should not go here");
				})
				.catch(function(sError) {
					assert.ok(typeof sError === "string", "the function rejects with a text");
				});
		});
	});

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
