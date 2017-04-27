/*global QUnit,sinon,Promise*/

jQuery.sap.require("sap.ui.fl.Utils");
jQuery.sap.require('sap.ui.fl.LrepConnector');
jQuery.sap.require('sap.ui.fl.Cache');

(function(utils, LrepConnector, $) {
	"use strict";

	sinon.config.useFakeTimers = false;

	QUnit.module("sap.ui.fl REST API's", {
		beforeEach: function() {

			this.stubs = [];
			this.componentName = "integrationTestingFlRest.Component";
			this.baseFileName = "MyOwnFilterFieldRest";
			this.namespace = "ScenarioTest";
			this.layer = "USER";

			// Has to be stubbed, as it is complex to setup a running component in the test.
			// Component must begin with a capital C, otherwise changes cannot be retrieved
			// because the generated URL would be integrationTestingFl/component-changes.json which does not work
			this.stubs.push(sinon.stub(utils, 'getComponentClassName').returns(this.componentName));

			// Stubs the tenant
			this.stubs.push(sinon.stub(utils, 'getClient').returns('000'));

			// This has to be stubbed, as loadResource from UI5 always resolves URL relative to the resources folder
			// As we are in test-resources, this does not work
			this.stubs.push(sinon.stub(LrepConnector.prototype, 'loadChanges', function(sComponentClassName) {
				var resourceName = jQuery.sap.getResourceName(sComponentClassName, "-changes.json");
				return new Promise(function(resolve, reject) {
					jQuery.ajax({
						url: '/sap/bc/ui5_ui5/sap/' + resourceName,
						headers: {
							"X-UI5-Component": sComponentClassName
						}
					}).done(function(result) {
						resolve({
							changes: result
						});

					}).fail(function(error) {
						reject(error);
					});
				});
			}));

			this.oChangeJson = {
				fileName: this.baseFileName,
				fileType: "variant",
				namespace: this.namespace,
				packageName: "$TMP",
				changeType: "filterBarVariant",
				component: this.componentName,
				creation: "2014-11-04T14:12:07",
				selector: {
					"<selectorkey>": "<selectorvalue>"
				},
				layer: this.layer,
				content: {
					sort: [
						{
							name: "abc",
							value: "def"
						}
					],
					filter: [
						{
							name: "ghi",
							value: "jkl"
						}
					]
				},
				originalLanguage: "EN",
				support: {
					generator: "Scenario Test for REST API",
					purpose: "Test REST API",
					user: "the test user"
				}
			};
		},
		afterEach: function() {
			this.stubs.forEach(function(stub) {
				stub.restore();
			});
		}
	});

	function checkCreateVariantResponseStatus(assert, params) {
		return function(result) {
			assert.equal(result.status, "success");
			return params.connector.loadChanges(params.componentName);
		};
	}


	function checkComponentChangesReturnsVariantAndDelete(assert, params, deleteWithLayer) {
		return function(result) {
			var variantChange = result.changes.changes[0];
			assert.equal(variantChange.changeType, "filterBarVariant");
			assert.equal(variantChange.fileName, params.fileName);
			assert.equal(variantChange.fileType, "variant");
			assert.equal(variantChange.namespace, params.namespace);
			assert.equal(variantChange.layer, params.expectedLayer);
			assert.equal(variantChange.content.filter.length, 1);
			assert.equal(variantChange.content.sort.length, 1);

			var deleteParams = {
				sChangeName: params.fileName,
				sNamespace: params.namespace
			};

			if (deleteWithLayer === true) {
				deleteParams.sLayer = params.expectedLayer;
			}

			return params.connector.deleteChange(deleteParams, true);
		};
	}


	function checkDeleteSendToBackend(assert, params) {
		return function(result) {
			assert.equal(result.status, "nocontent");
			return params.connector.loadChanges(params.componentName);
		};
	}


	function checkLoadingComponentChangesReturnsNothing(assert) {
		return function(result) {
			assert.equal(result.changes.changes.length, 0);
			QUnit.start();
		};
	}


	QUnit.test('Create a user dependant variant in the user layer, read it and delete it afterwards', function(assert) {
		var done = assert.async();
		var connector = LrepConnector.createConnector();

		var params = {
			connector: connector,
			componentName: this.componentName,
			fileName: this.baseFileName,
			namespace: this.namespace,
			expectedLayer: this.layer
		};

		connector.create(this.oChangeJson, null, true).then(checkCreateVariantResponseStatus(assert, params)).then(checkComponentChangesReturnsVariantAndDelete(assert, params, false)).then(checkDeleteSendToBackend(assert, params)).then(checkLoadingComponentChangesReturnsNothing(assert))['catch'](function(err) {
			assert.ok(false, err);
			done();
		});

	});

	QUnit.test('Create a non-user dependant variant, it should be created in the current layer setting; delete it afterwards', function(assert) {
		var done = assert.async();
		var expectedLayer = "VENDOR";
		this.oChangeJson.layer = expectedLayer;
		var fileName = this.baseFileName + "_" + expectedLayer;
		this.oChangeJson.fileName = fileName;

		var connector = LrepConnector.createConnector();

		var params = {
			connector: connector,
			componentName: this.componentName,
			fileName: fileName,
			namespace: this.namespace,
			expectedLayer: expectedLayer
		};

		connector.create(this.oChangeJson, null, true).then(checkCreateVariantResponseStatus(assert, params)).then(checkComponentChangesReturnsVariantAndDelete(assert, params, true)).then(checkDeleteSendToBackend(assert, params)).then(checkLoadingComponentChangesReturnsNothing(assert))['catch'](function(err) {
			assert.ok(false, err);
			done();
		});
	});

	QUnit.test('Create a non-user dependant variant, then update the texts, save it and delete it afterwards', function(assert) {
		var done = assert.async();
		var expectedLayer = "VENDOR";
		this.oChangeJson.layer = expectedLayer;
		var fileName = this.baseFileName + "_" + expectedLayer;
		this.oChangeJson.fileName = fileName;

		var that = this;
		var connector = LrepConnector.createConnector();

		var params = {
			connector: connector,
			componentName: this.componentName
		};

		connector.create(this.oChangeJson, null, true).then(checkCreateVariantResponseStatus(assert, params)).then(checkLoadingComponentChangesReturnsVariant).then(checkReturnedVariantWithChangedText).then(checkDeleteSendToBackend(assert, params)).then(checkLoadingComponentChangesReturnsNothing(assert))['catch'](function(err) {
			assert.ok(false, err);
			done();
		});

		function checkLoadingComponentChangesReturnsVariant(result) {
			var variantChange = result.changes.changes[0];
			assert.equal(variantChange.changeType, "filterBarVariant");
			assert.equal(variantChange.fileName, fileName);
			assert.equal(variantChange.fileType, "variant");
			assert.equal(variantChange.namespace, that.namespace);
			assert.equal(variantChange.layer, expectedLayer);
			assert.equal(variantChange.content.filter.length, 1);
			assert.equal(variantChange.content.sort.length, 1);

			//Update text
			if (!variantChange.texts) {
				variantChange.texts = {};
			}
			variantChange.texts = {
				"integrationTestKey": {
					"value": "integrationTestValue",
					"type": "XFLD",
					"comment": "This is generated by an integration test and does not need any translation"
				}
			};
			that.oChangeJson = variantChange;

			return connector.update(that.oChangeJson, that.oChangeJson.fileName, null, true);
		}


		function checkReturnedVariantWithChangedText(result) {
			var variantChangedText = result.response;
			assert.equal(variantChangedText.texts.integrationTestKey.value, "integrationTestValue");
			assert.equal(variantChangedText.texts.integrationTestKey.type, "XFLD");

			var params = {
				sChangeName: variantChangedText.fileName,
				sNamespace: variantChangedText.namespace,
				sLayer: variantChangedText.layer
			};

			return connector.deleteChange(params, true);
		}

	});
}(sap.ui.fl.Utils, sap.ui.fl.LrepConnector));
