/*global strictEqual, module, asyncTest, start, sinon, Promise, ok*/

jQuery.sap.require("sap.ui.fl.Utils");
jQuery.sap.require('sap.ui.fl.LrepConnector');
jQuery.sap.require('sap.ui.fl.Cache');

(function(utils, LrepConnector, $) {
	"use strict";

	sinon.config.useFakeTimers = false;

	module("sap.ui.fl REST API's", {
		setup: function() {

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
					],
				},
				originalLanguage: "EN",
				support: {
					generator: "Scenario Test for REST API",
					purpose: "Test REST API",
					user: "the test user"
				}
			};
		},
		teardown: function() {
			this.stubs.forEach(function(stub) {
				stub.restore();
			});
		}
	});

	function checkCreateVariantResponseStatus(params) {
		return function(result) {
			equal(result.status, "success");
			return params.connector.loadChanges(params.componentName);
		}
	}
	;

	function checkComponentChangesReturnsVariantAndDelete(params, deleteWithLayer) {
		return function(result) {
			var variantChange = result.changes.changes[0];
			equal(variantChange.changeType, "filterBarVariant");
			equal(variantChange.fileName, params.fileName);
			equal(variantChange.fileType, "variant");
			equal(variantChange.namespace, params.namespace);
			equal(variantChange.layer, params.expectedLayer);
			equal(variantChange.content.filter.length, 1);
			equal(variantChange.content.sort.length, 1);

			var deleteParams = {
				sChangeName: params.fileName,
				sNamespace: params.namespace
			};

			if (deleteWithLayer === true) {
				deleteParams.sLayer = params.expectedLayer;
			}

			return params.connector.deleteChange(deleteParams, true);
		}
	}
	;

	function checkDeleteSendToBackend(params) {
		return function(result) {
			equal(result.status, "nocontent");
			return params.connector.loadChanges(params.componentName);
		}
	}
	;

	function checkLoadingComponentChangesReturnsNothing() {
		return function(result) {
			equal(result.changes.changes.length, 0);
			QUnit.start();
		}
	}
	;

	asyncTest('Create a user dependant variant in the user layer, read it and delete it afterwards', function() {
		var that = this;
		var connector = LrepConnector.createConnector();

		var params = {
			connector: connector,
			componentName: this.componentName,
			fileName: this.baseFileName,
			namespace: this.namespace,
			expectedLayer: this.layer
		};

		connector.create(this.oChangeJson, null, true).then(checkCreateVariantResponseStatus(params)).then(checkComponentChangesReturnsVariantAndDelete(params, false)).then(checkDeleteSendToBackend(params)).then(checkLoadingComponentChangesReturnsNothing())['catch'](function(err) {
			ok(false, err);
			QUnit.start();
		});

	});

	asyncTest('Create a non-user dependant variant, it should be created in the current layer setting; delete it afterwards', function() {
		var expectedLayer = "VENDOR";
		this.oChangeJson.layer = expectedLayer;
		var fileName = this.baseFileName + "_" + expectedLayer;
		this.oChangeJson.fileName = fileName;

		var that = this;
		var connector = LrepConnector.createConnector();

		var params = {
			connector: connector,
			componentName: this.componentName,
			fileName: fileName,
			namespace: this.namespace,
			expectedLayer: expectedLayer
		};

		connector.create(this.oChangeJson, null, true).then(checkCreateVariantResponseStatus(params)).then(checkComponentChangesReturnsVariantAndDelete(params, true)).then(checkDeleteSendToBackend(params)).then(checkLoadingComponentChangesReturnsNothing())['catch'](function(err) {
			ok(false, err);
			QUnit.start();
		});
	});

	asyncTest('Create a non-user dependant variant, then update the texts, save it and delete it afterwards', function() {
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

		connector.create(this.oChangeJson, null, true).then(checkCreateVariantResponseStatus(params)).then(checkLoadingComponentChangesReturnsVariant).then(checkReturnedVariantWithChangedText).then(checkDeleteSendToBackend(params)).then(checkLoadingComponentChangesReturnsNothing())['catch'](function(err) {
			ok(false, err);
			QUnit.start();
		});

		function checkLoadingComponentChangesReturnsVariant(result) {
			var variantChange = result.changes.changes[0];
			equal(variantChange.changeType, "filterBarVariant");
			equal(variantChange.fileName, fileName);
			equal(variantChange.fileType, "variant");
			equal(variantChange.namespace, that.namespace);
			equal(variantChange.layer, expectedLayer);
			equal(variantChange.content.filter.length, 1);
			equal(variantChange.content.sort.length, 1);

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
		;

		function checkReturnedVariantWithChangedText(result) {
			var variantChangedText = result.response;
			equal(variantChangedText.texts.integrationTestKey.value, "integrationTestValue");
			equal(variantChangedText.texts.integrationTestKey.type, "XFLD");

			var params = {
				sChangeName: variantChangedText.fileName,
				sNamespace: variantChangedText.namespace,
				sLayer: variantChangedText.layer
			};

			return connector.deleteChange(params, true);
		}
		;
	});
}(sap.ui.fl.Utils, sap.ui.fl.LrepConnector));
