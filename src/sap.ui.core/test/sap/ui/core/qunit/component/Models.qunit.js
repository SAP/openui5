sap.ui.define([
	"sap/base/config",
	"sap/base/future",
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/i18n/ResourceBundle",
	"sap/base/util/deepExtend",
	"sap/ui/base/config/URLConfigurationProvider",
	"sap/ui/core/Component",
	"sap/ui/core/Lib",
	"sap/ui/core/Manifest",
	"sap/ui/core/UIComponentMetadata"
], function(
	BaseConfig,
	future,
	Log,
	Localization,
	ResourceBundle,
	deepExtend,
	URLConfigurationProvider,
	Component,
	Library,
	Manifest,
	UIComponentMetadata
) {

	"use strict";
	/*global sinon, QUnit*/

	// Re-assigning the 'XMLHttpRequest' property on the window in this strange way prevents Safari 12/13 (or WebKit)
	// from wrongly optimizing access. As the sinon fake server is only used in some parts of this test module Safari
	// might wrongly optimize the access (e.g. within jQuery) to override the fake server which fails those tests.
	window.XMLHttpRequest = window["XML" + "HttpRequest"];

	var privateLoaderAPI = sap.ui.loader._;


	sap.ui.loader.config({
		paths: {
			"sap/ui/originalmodel": sap.ui.require.toUrl("sap/ui/model/"),
			"sap/ui/test/originalv2models": sap.ui.require.toUrl("sap/ui/test/v2models/")
		}
	});
	sap.ui.define("sap/ui/model/json/JSONModel", ["sap/ui/originalmodel/json/JSONModel"], function(OrigJSONModel) {
		return sinon.spy(OrigJSONModel);
	});
	/**
	 * @deprecated As of version 1.48
	 */
	sap.ui.define("sap/ui/model/odata/ODataModel", ["sap/ui/originalmodel/odata/ODataModel"], function(OrigODataModel) {
		return sinon.spy(OrigODataModel);
	});
	sap.ui.define("sap/ui/model/odata/v2/ODataModel", ["sap/ui/originalmodel/odata/v2/ODataModel"], function(OrigODataModel) {
		return sinon.spy(OrigODataModel);
	});
	sap.ui.define("sap/ui/model/odata/v4/ODataModel", ["sap/ui/originalmodel/odata/v4/ODataModel"], function(OrigODataModel) {
		return sinon.spy(OrigODataModel);
	});
	sap.ui.define("sap/ui/model/resource/ResourceModel", ["sap/ui/originalmodel/resource/ResourceModel"], function(OrigResourceModel) {
		return sinon.spy(OrigResourceModel);
	});
	sap.ui.define("sap/ui/model/xml/XMLModel", ["sap/ui/originalmodel/xml/XMLModel"], function(OrigXMLModel) {
		return sinon.spy(OrigXMLModel);
	});
	sap.ui.define("sap/ui/test/v2models/parent/CustomModel", ["sap/ui/test/originalv2models/parent/CustomModel"], function(OrigCustomModel) {
		return sinon.spy(OrigCustomModel);
	});

	function requireModelSpies() {
		return new Promise((resolve, reject) => {
			sap.ui.require([
				"sap/ui/model/json/JSONModel",
				"sap/ui/model/odata/v2/ODataModel",
				"sap/ui/model/odata/v4/ODataModel",
				"sap/ui/model/resource/ResourceModel",
				"sap/ui/model/xml/XMLModel",
				"sap/ui/test/v2models/parent/CustomModel",
				/**
				 * @deprecated As of version 1.48
				 */
				"sap/ui/model/odata/ODataModel"
			], function(
				JSONModel,
				ODataModelV2,
				ODataModelV4,
				ResourceModel,
				XMLModel,
				CustomModel,
				/**
				 * @deprecated As of version 1.48
				 */
				ODataModelV1
			) {
				const spies = {
					json: JSONModel,
					/**
					 * @deprecated As of version 1.48
					 */
					odata: ODataModelV1,
					odataV2: ODataModelV2,
					odataV4: ODataModelV4,
					resource: ResourceModel,
					xml: XMLModel,
					custom: CustomModel
				};

				/**
				 * Restore spies on the globals for v1.
				 * In v2, the Component does not access the models via globals anymore.
				 * @deprecated
				 */
				(() => {
					sap.ui.model.odata.ODataModel = ODataModelV1;
					sap.ui.model.odata.v2.ODataModel = ODataModelV2;
					sap.ui.model.odata.v4.ODataModel = ODataModelV4;
					sap.ui.model.json.JSONModel = JSONModel;
					sap.ui.model.xml.XMLModel = XMLModel;
					sap.ui.model.resource.ResourceModel = ResourceModel;
					sap.ui.test.v2models.parent.CustomModel = CustomModel;
				})();

				for (const name in spies) {
					spies[name].resetHistory?.();
				}
				resolve(spies);
			}, reject);
		});
	}

	var Helper = {
		spyModels: async function() {
			BaseConfig._.invalidate();
			this.modelSpy = await requireModelSpies();
		},
		restoreModels: function() {
			if (this.modelSpy) {
				for (var sName in this.modelSpy) {
					if (this.modelSpy[sName] && this.modelSpy[sName].resetHistory) {
						this.modelSpy[sName].resetHistory();
					}
				}
				this.modelSpy = null;
			}
		},
		stubGetUriParameters: function(mMockParams) {
			var sSAPLanguage = Localization.getSAPLogonLanguage();
			BaseConfig._.invalidate();
			this.oConfigurationStub = sinon.stub(URLConfigurationProvider, 'get');
			this.oConfigurationStub.withArgs('sapLanguage').returns(mMockParams && mMockParams.sapLanguage || sSAPLanguage);
			this.oConfigurationStub.withArgs('sapClient').returns(mMockParams && mMockParams.sapClient || 'foo');
			this.oConfigurationStub.withArgs('sapServer').returns(mMockParams && mMockParams.sapServer || 'bar');
			this.oConfigurationStub.withArgs('sapSystem').returns(mMockParams && mMockParams.sapSystem);
		},
		restoreGetUriParameters: function() {
			if (this.oConfigurationStub && this.oConfigurationStub.restore) {
				this.oConfigurationStub.restore();
				this.oConfigurationStub = null;
			}
		},
		assertModelInstances: function(mClasses) {
			this.mModels = {};
			for (var sName in mClasses) {
				var oClass = mClasses[sName];
				var oModel = this.oComponent.getModel(sName || undefined);
				this.mModels[sName] = oModel;
				QUnit.assert.ok(oModel instanceof oClass,
					'Expected model "' + sName + '" to be an instance of ' + oClass.getMetadata().getName());
			}
		},
		assertModelsDestroyed: function() {
			for (var sName in this.mModels) {
				var oModel = this.mModels[sName];
				QUnit.assert.ok(oModel && oModel.bDestroyed,
					'Expected model "' + sName + '" to be destroyed');
			}
		},
		assertModelFromManifest: function(assert, options) {
			var sComponentName = "sap.ui.core.test.component.models";
			var oManifest = new Manifest(options.manifest, {
				componentName: sComponentName,
				baseUrl: "./path/to/manifest/manifest.json",
				process: false
			});

			// deep clone is needed as manifest only returns a read-only copy (frozen object)
			var oManifestDataSources = deepExtend({}, oManifest.getEntry("/sap.app/dataSources"));
			var oManifestModels = deepExtend({}, oManifest.getEntry("/sap.ui5/models"));

			// 1. provide all model configs with a 'type'
			var mAllModelConfigs = Component._findManifestModelClasses({
				models: oManifestModels,
				dataSources: oManifestDataSources,
				componentName: sComponentName
			});
			// 2. make sure all model classes are loaded
			Component._loadManifestModelClasses(mAllModelConfigs, sComponentName);

			var oModelConfigurations = Component._createManifestModelConfigurations({
				dataSources: oManifestDataSources,
				models: mAllModelConfigs,
				manifest: oManifest,
				cacheTokens: options.cacheTokens
			});

			assert.deepEqual(oModelConfigurations, options.expected,
				"Model configuration created from manifest should be as expected.");
		}
	};
	// Binds all the helper functions to the test instance
	var bindHelper = function() {
		for (var method in Helper) {
			if (Helper.hasOwnProperty(method)) {
				this[method] = Helper[method].bind(this);
			}
		}
	};

	/**
	 * @deprecated
	 */
	function noSyncTest_beforeEach() {
		this.oSyncSpy = this.spy(sap.ui, "requireSync");
	}

	/**
	 * Tests whether a sync request was sent
	 * @param {object} assert assert
	 * @deprecated
	 */
	function noSyncTest_afterEach(assert) {
		assert.equal(this.oSyncSpy.callCount, 0, "General Test: No sync request sent");
		this.oSyncSpy.restore();
	}

	QUnit.module('default', {
		before: function() {
			// preload any used libraries / modules to avoid sync requests
			return Promise.all([
				Library.load("sap.ui.layout"),
				Library.load("sap.ui.unified"),
				Library.load("sap.m")
			]).then(function() {
				return new Promise(function(resolve, reject) {
					sap.ui.require([
						"sap/m/Label",
						"sap/ui/core/CustomData",
						"sap/ui/core/mvc/XMLView",
						"sap/ui/core/routing/Router",
						/**
						 * @deprecated As of version 1.66
						 */
						"sap/ui/model/odata/ODataAnnotations"
					], function() {
						resolve();
					}, reject);
				});
			});
		},
		beforeEach: async function() {
			bindHelper.call(this);

			/** @deprecated */
			noSyncTest_beforeEach.call(this);

			await this.spyModels();
			this.oLogSpy = this.spy(Log, "error");
		},
		afterEach: function(assert) {
			this.restoreModels();
			this.restoreGetUriParameters();

			/** @deprecated */
			noSyncTest_afterEach.call(this, assert);
		}
	});

	/**
	 * @deprecated
	 */
	QUnit.test("metadata v2 with dataSources (future=false)", function(assert) {
		future.active = false;
		this.stubGetUriParameters();

		return Component.create({
			name: "sap.ui.test.v2models.parent",
			manifest: false
		}).then(function(oComponent) {

			this.oComponent = oComponent;

			/**
			 * @deprecated As of version 1.48
			 */
			if ( this.modelSpy.odata ) {
				// sap.ui.model.odata.ODataModel
				sinon.assert.callCount(this.modelSpy.odata, 1);

				// model: "ODataModel"
				sinon.assert.calledWithExactly(this.modelSpy.odata, {
					serviceUrl: '/path/to/odata/service?sap-client=foo&sap-server=bar',
					annotationURI: [ '/path/to/odata/annotations/1', 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2' ],
					useBatch: false,
					refreshAfterChange: false,
					json: true
				});
			}

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 9);

			// model: "default-with-annotations"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/default/datasource?sap-client=foo&sap-server=bar',
				annotationURI: [
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo',
					'/path/to/odata/annotations/1?sap-language=EN&sap-client=foo'
				],
				headers: { "Cache-Control": "max-age=500" },
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "old-uri-syntax"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service'
			});

			// model: ""
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/default/datasource?sap-client=foo&sap-server=bar',
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service',
				useBatch: true,
				refreshAfterChange: true
			});

			// model: "invalid-annotations"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service?sap-client=foo&sap-server=bar',
				annotationURI: [ '/path/to/odata/annotations/1?sap-language=EN&sap-client=foo' ],
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel" with multi origin annotations
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/multi/origin/annotations/?sap-client=foo&sap-server=bar',
				annotationURI: ["/path/to/other/odata/service/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
												"test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/other/odata/service/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
												"/path/to/other/odata/service/other2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?sap-language=EN&sap-client=foo",
												"/path/to/other3/odata/service/;o=sid(G1Y.400)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo"
											],
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel-SAPClient" with SAP client
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/sapclient/?sap-client=100&sap-server=bar',
				annotationURI: [ '/path/to/odata/annotations/with/sapclient/?sap-client=200&sap-language=EN' ],
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel-unknown-odataVersion"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/unknown/odataVersion?sap-client=foo&sap-server=bar',
				metadataUrlParams: { "sap-language": "EN" }
			});


			// sap.ui.model.odata.v4.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV4, 1);

			// model: "default-with-annotations"
			sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
				odataVersion: "4.0",
				serviceUrl: '/path/to/odata/service/?sap-client=foo&sap-server=bar',
				metadataUrlParams: {"sap-language": "EN"}
			});


			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 3);

			// model: "json"
			sinon.assert.calledWithExactly(this.modelSpy.json, '/path/to/data.json?sap-client=foo&sap-server=bar');

			// model: "json-relative"
			sinon.assert.calledWithExactly(this.modelSpy.json, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/data.json?sap-client=foo&sap-server=bar');

			// model: "json-relative-2"
			sinon.assert.calledWithExactly(this.modelSpy.json, 'test-resources/sap/ui/core/qunit/component/testdata/path/to/other/data.json?sap-client=foo&sap-server=bar');


			// sap.ui.model.xml.XMLModel
			sinon.assert.callCount(this.modelSpy.xml, 2);

			// model: "xml"
			sinon.assert.calledWithExactly(this.modelSpy.xml, '/path/to/data.xml?sap-client=foo&sap-server=bar');

			// model: "xml-relative"
			sinon.assert.calledWithExactly(this.modelSpy.xml, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/data.xml?sap-client=foo&sap-server=bar');


			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);

			// model: "resourceBundle-name"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleName: "sap.ui.test.v2models.parent.i18n"
			});

			// model: "resourceBundle-legacy-uri"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/i18n.properties"
			});


			// sap.ui.test.v2models.parent.CustomModel
			sinon.assert.callCount(this.modelSpy.custom, 7);

			// model: "custom-uri-string"
			sinon.assert.calledWithExactly(this.modelSpy.custom, '/path/to/custom.datatype?sap-client=foo&sap-server=bar');

			// model: "custom-uri-relative-string"
			sinon.assert.calledWithExactly(this.modelSpy.custom, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/custom.datatype?sap-client=foo&sap-server=bar');

			// model: "custom-uri-string-with-settings"
			sinon.assert.calledWithExactly(this.modelSpy.custom, '/path/to/custom.datatype?sap-client=foo&sap-server=bar', {
				foo: 'bar'
			});

			// model: "custom-without-args"
			sinon.assert.calledWithExactly(this.modelSpy.custom);

			// model: "custom-uri-setting-name"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				myUri: '/path/to/custom.datatype?sap-client=foo&sap-server=bar'
			});

			// model: "custom-uri-setting-merge"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				uri: '/path/to/custom.datatype?sap-client=foo&sap-server=bar',
				foo: 'bar'
			});

			// model: "custom-uri-setting-already-defined"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				uri: 'foo'
			});


			// Log.error
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match(/Component Manifest: Missing \"type\" for model \"no-model-type\"/), "[\"sap.ui5\"][\"models\"][\"no-model-type\"]", this.oComponent.getMetadata().getComponentName());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match(/Class \"sap.ui.not.defined.Model\" for model \"missing-model-class\" could not be loaded./), "[\"sap.ui5\"][\"models\"][\"missing-model-class\"]", this.oComponent.getMetadata().getComponentName());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match(/Component Manifest: Class \"sap.ui.test.v2models.parent.ModelNotDefined\" for model \"model-not-found\" could not be found/), "[\"sap.ui5\"][\"models\"][\"model-not-found\"]", this.oComponent.getMetadata().getComponentName());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match(/Component Manifest: ODataAnnotation \"undefined\" for dataSource \"odata-invalid-annotations\" could not be found in manifest/), "[\"sap.app\"][\"dataSources\"][\"undefined\"]", this.oComponent.getMetadata().getComponentName());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match(/Component Manifest: Missing \"uri\" for ODataAnnotation \"annotation-without-uri\"/), "[\"sap.app\"][\"dataSources\"][\"annotation-without-uri\"]", this.oComponent.getMetadata().getComponentName());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match(/Component Manifest: dataSource \"json\" was expected to have type \"ODataAnnotation\" but was \"JSON\"/), "[\"sap.app\"][\"dataSources\"][\"json\"]", this.oComponent.getMetadata().getComponentName());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match(/Component Manifest: dataSource \"invalid\" for model \"dataSource-invalid\" not found or invalid/), "[\"sap.app\"][\"dataSources\"][\"invalid\"]", this.oComponent.getMetadata().getComponentName());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match(/Component Manifest: dataSource \"does-not-exist\" for model \"dataSource-not-found\" not found or invalid/), "[\"sap.app\"][\"dataSources\"][\"does-not-exist\"]", this.oComponent.getMetadata().getComponentName());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match(/Component Manifest: Provided OData version \"3.0\" in dataSource \"unknown-odataVersion\" for model \"v2-ODataModel-unknown-odataVersion\" is unknown. Falling back to default model type \"sap.ui.model.odata.v2.ODataModel\"./), "[\"sap.app\"][\"dataSources\"][\"unknown-odataVersion\"]", this.oComponent.getMetadata().getComponentName());


			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"": this.modelSpy.odataV2,
				"default-with-annotations": this.modelSpy.odataV2,
				"old-uri-syntax": this.modelSpy.odataV2,
				/**
				 * @deprecated As of version 1.48
				 */
				"ODataModel": this.modelSpy.odata,
				"v2-ODataModel": this.modelSpy.odataV2,
				"invalid-annotations": this.modelSpy.odataV2,
				"v2-ODataModel-OtherOrigins": this.modelSpy.odataV2,
				"ODataV4Model": this.modelSpy.odataV4,
				"json": this.modelSpy.json,
				"json-relative": this.modelSpy.json,
				"json-relative-2": this.modelSpy.json,
				"xml": this.modelSpy.xml,
				"xml-relative": this.modelSpy.xml,
				"resourceBundle-name": this.modelSpy.resource,
				"resourceBundle-legacy-uri": this.modelSpy.resource,
				"custom-uri-string": this.modelSpy.custom,
				"custom-relative-uri-string": this.modelSpy.custom,
				"custom-uri-string-with-settings": this.modelSpy.custom,
				"custom-without-args": this.modelSpy.custom,
				"custom-uri-setting-name": this.modelSpy.custom,
				"custom-uri-setting-merge": this.modelSpy.custom,
				"custom-uri-setting-already-defined": this.modelSpy.custom
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

			future.active = undefined;
		}.bind(this));
	});

	QUnit.test("metadata v2 with dataSources (future=true)", function (assert) {
		future.active = true;
		this.stubGetUriParameters();

		return Component.create({
			name: "sap.ui.test.v2models.parentValid",
			manifest: false
		}).then(function (oComponent) {

			this.oComponent = oComponent;

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 7);

			// model: "default-with-annotations"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/default/datasource?sap-client=foo&sap-server=bar',
				annotationURI: [
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo',
					'/path/to/odata/annotations/1?sap-language=EN&sap-client=foo'
				],
				headers: { "Cache-Control": "max-age=500" },
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "old-uri-syntax"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service'
			});

			// model: ""
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/default/datasource?sap-client=foo&sap-server=bar',
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service',
				useBatch: true,
				refreshAfterChange: true
			});

			// model: "v2-ODataModel" with multi origin annotations
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/multi/origin/annotations/?sap-client=foo&sap-server=bar',
				annotationURI: ["/path/to/other/odata/service/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
					"test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/other/odata/service/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
					"/path/to/other/odata/service/other2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?sap-language=EN&sap-client=foo",
					"/path/to/other3/odata/service/;o=sid(G1Y.400)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo"
				],
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel-SAPClient" with SAP client
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/sapclient/?sap-client=100&sap-server=bar',
				annotationURI: ['/path/to/odata/annotations/with/sapclient/?sap-client=200&sap-language=EN'],
				metadataUrlParams: { "sap-language": "EN" }
			});

			// sap.ui.model.odata.v4.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV4, 1);

			// model: "default-with-annotations"
			sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
				odataVersion: "4.0",
				serviceUrl: '/path/to/odata/service/?sap-client=foo&sap-server=bar',
				metadataUrlParams: { "sap-language": "EN" }
			});


			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 3);

			// model: "json"
			sinon.assert.calledWithExactly(this.modelSpy.json, '/path/to/data.json?sap-client=foo&sap-server=bar');

			// model: "json-relative"
			sinon.assert.calledWithExactly(this.modelSpy.json, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/data.json?sap-client=foo&sap-server=bar');

			// model: "json-relative-2"
			sinon.assert.calledWithExactly(this.modelSpy.json, 'test-resources/sap/ui/core/qunit/component/testdata/path/to/other/data.json?sap-client=foo&sap-server=bar');


			// sap.ui.model.xml.XMLModel
			sinon.assert.callCount(this.modelSpy.xml, 2);

			// model: "xml"
			sinon.assert.calledWithExactly(this.modelSpy.xml, '/path/to/data.xml?sap-client=foo&sap-server=bar');

			// model: "xml-relative"
			sinon.assert.calledWithExactly(this.modelSpy.xml, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/data.xml?sap-client=foo&sap-server=bar');


			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);

			// model: "resourceBundle-name"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleName: "sap.ui.test.v2models.parent.i18n"
			});

			// model: "resourceBundle-legacy-uri"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/i18n.properties"
			});


			// sap.ui.test.v2models.parent.CustomModel
			sinon.assert.callCount(this.modelSpy.custom, 7);

			// model: "custom-uri-string"
			sinon.assert.calledWithExactly(this.modelSpy.custom, '/path/to/custom.datatype?sap-client=foo&sap-server=bar');

			// model: "custom-uri-relative-string"
			sinon.assert.calledWithExactly(this.modelSpy.custom, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/custom.datatype?sap-client=foo&sap-server=bar');

			// model: "custom-uri-string-with-settings"
			sinon.assert.calledWithExactly(this.modelSpy.custom, '/path/to/custom.datatype?sap-client=foo&sap-server=bar', {
				foo: 'bar'
			});

			// model: "custom-without-args"
			sinon.assert.calledWithExactly(this.modelSpy.custom);

			// model: "custom-uri-setting-name"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				myUri: '/path/to/custom.datatype?sap-client=foo&sap-server=bar'
			});

			// model: "custom-uri-setting-merge"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				uri: '/path/to/custom.datatype?sap-client=foo&sap-server=bar',
				foo: 'bar'
			});

			// model: "custom-uri-setting-already-defined"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				uri: 'foo'
			});

			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"": this.modelSpy.odataV2,
				"default-with-annotations": this.modelSpy.odataV2,
				"old-uri-syntax": this.modelSpy.odataV2,
				"v2-ODataModel": this.modelSpy.odataV2,
				"v2-ODataModel-OtherOrigins": this.modelSpy.odataV2,
				"ODataV4Model": this.modelSpy.odataV4,
				"json": this.modelSpy.json,
				"json-relative": this.modelSpy.json,
				"json-relative-2": this.modelSpy.json,
				"xml": this.modelSpy.xml,
				"xml-relative": this.modelSpy.xml,
				"resourceBundle-name": this.modelSpy.resource,
				"resourceBundle-legacy-uri": this.modelSpy.resource,
				"custom-uri-string": this.modelSpy.custom,
				"custom-relative-uri-string": this.modelSpy.custom,
				"custom-uri-string-with-settings": this.modelSpy.custom,
				"custom-without-args": this.modelSpy.custom,
				"custom-uri-setting-name": this.modelSpy.custom,
				"custom-uri-setting-merge": this.modelSpy.custom,
				"custom-uri-setting-already-defined": this.modelSpy.custom
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

			future.active = undefined;
		}.bind(this));
	});

	QUnit.test("metadata v2 with dataSources - Invalid ODataAnnotation (future=true)", function(assert) {
		future.active = true;

		const oManifestJson = {
			"_version": "1.0.0",

			"sap.app": {
				"_version": "1.0.0",
				"id": "sap.ui.test.v2models.parent",
				"type": "application",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"i18n": "i18n.properties",
				"title": "{{title}}",
				"description": "{{description}}",
				"dataSources": {
					"default": {
						"uri": "/path/to/default/datasource"
					},
					"odata-invalid-annotations": {
						"type": "OData",
						"uri": "/path/to/odata/service",
						"settings": {
							"annotations": [ "undefined", "annotations1", "annotation-without-uri", "json" ]
						}
					}
				}
			},
			"sap.ui": {
				"_version": "1.0.0",
				"technology": "UI5"
			},
			"sap.ui5": {
				"_version": "1.0.0",
				"dependencies": {
					"minUI5Version": "1.28.0",
					"libs": {
						"sap.ui.core": {
							"minVersion": "1.28.0"
						}
					}
				},
				"models": {
					"": "default",
					"invalid-annotations": {
						"dataSource": "odata-invalid-annotations"
					}
				}
			}
		};

		return Component.create({
			name: "sap.ui.test.v2models.parent",
			manifest: oManifestJson
		}).catch((error) => {
			assert.ok(error.message.includes(`Component Manifest: ODataAnnotation "undefined" for dataSource "odata-invalid-annotations" could not be found in manifest`),
				"Error thrown because of invalid odata annotations.");

			future.active = undefined;
		});
	});

	QUnit.test("metadata v2 with dataSources - Invalid dataSource (future=true)", function(assert) {
		future.active = true;

		const oManifestJson = {
			"_version": "1.0.0",

			"sap.app": {
				"_version": "1.0.0",
				"id": "sap.ui.test.v2models.parent",
				"type": "application",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"i18n": "i18n.properties",
				"title": "{{title}}",
				"description": "{{description}}",
				"dataSources": {
					"default": {
						"uri": "/path/to/default/datasource"
					},
					"invalid": true
				}
			},
			"sap.ui": {
				"_version": "1.0.0",
				"technology": "UI5"
			},
			"sap.ui5": {
				"_version": "1.0.0",
				"dependencies": {
					"minUI5Version": "1.28.0",
					"libs": {
						"sap.ui.core": {
							"minVersion": "1.28.0"
						}
					}
				},
				"models": {
					"": "default",
					"dataSource-invalid": {
						"type": "sap.ui.model.odata.v2.ODataModel",
						"dataSource": "invalid"
					}
				}
			}
		};

		return Component.create({
			name: "sap.ui.test.v2models.parent",
			manifest: oManifestJson
		}).catch((error) => {
			assert.ok(error.message.includes(`Component Manifest: dataSource "invalid" for model "dataSource-invalid" not found or invalid`),
				"Error thrown because invalid dataSource defined.");

			future.active = undefined;
		});
	});

	QUnit.test("metadata v2 with dataSources - dataSource not found (future=true)", function(assert) {
		future.active = true;

		const oManifestJson = {
			"_version": "1.0.0",

			"sap.app": {
				"_version": "1.0.0",
				"id": "sap.ui.test.v2models.parent",
				"type": "application",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"i18n": "i18n.properties",
				"title": "{{title}}",
				"description": "{{description}}",
				"dataSources": {
					"default": {
						"uri": "/path/to/default/datasource"
					}
				}
			},
			"sap.ui": {
				"_version": "1.0.0",
				"technology": "UI5"
			},
			"sap.ui5": {
				"_version": "1.0.0",
				"dependencies": {
					"minUI5Version": "1.28.0",
					"libs": {
						"sap.ui.core": {
							"minVersion": "1.28.0"
						}
					}
				},
				"models": {
					"": "default",
					"dataSource-not-found": {
						"type": "sap.ui.model.odata.v2.ODataModel",
						"dataSource": "does-not-exist"
					}
				}
			}
		};

		return Component.create({
			name: "sap.ui.test.v2models.parent",
			manifest: oManifestJson
		}).catch((error) => {
			assert.ok(error.message.includes(`Component Manifest: dataSource "does-not-exist" for model "dataSource-not-found" not found or invalid`),
				"Error thrown because dataSource not found.");

			future.active = undefined;
		});
	});

	QUnit.test("metadata v2 with dataSources - Model not found (future=true)", function(assert) {
		future.active = true;

		const oManifestJson = {
			"_version": "1.0.0",

			"sap.app": {
				"_version": "1.0.0",
				"id": "sap.ui.test.v2models.parent",
				"type": "application",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"i18n": "i18n.properties",
				"title": "{{title}}",
				"description": "{{description}}",
				"dataSources": {
					"default": {
						"uri": "/path/to/default/datasource"
					}
				}
			},
			"sap.ui": {
				"_version": "1.0.0",
				"technology": "UI5"
			},
			"sap.ui5": {
				"_version": "1.0.0",
				"dependencies": {
					"minUI5Version": "1.28.0",
					"libs": {
						"sap.ui.core": {
							"minVersion": "1.28.0"
						}
					}
				},
				"models": {
					"": "default",
					"model-not-found": {
						"type": "sap.ui.test.v2models.parent.ModelNotDefined"
					}
				}
			}
		};

		return Component.create({
			name: "sap.ui.test.v2models.parent",
			manifest: oManifestJson
		}).catch((error) => {
			assert.ok(error.message.includes(`Component Manifest: Class "sap.ui.test.v2models.parent.ModelNotDefined" for model "model-not-found" could not be found`),
				"Error thrown because model is not found.");

			future.active = undefined;
		});

	});
	QUnit.test("metadata v2 with dataSources - Missing model class (future=true)", function(assert) {
		future.active = true;

		const oManifestJson = {
			"_version": "1.0.0",

			"sap.app": {
				"_version": "1.0.0",
				"id": "sap.ui.test.v2models.parent",
				"type": "application",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"i18n": "i18n.properties",
				"title": "{{title}}",
				"description": "{{description}}",
				"dataSources": {
					"default": {
						"uri": "/path/to/default/datasource"
					}
				}
			},
			"sap.ui": {
				"_version": "1.0.0",
				"technology": "UI5"
			},
			"sap.ui5": {
				"_version": "1.0.0",
				"dependencies": {
					"minUI5Version": "1.28.0",
					"libs": {
						"sap.ui.core": {
							"minVersion": "1.28.0"
						}
					}
				},
				"models": {
					"": "default",
					"missing-model-class": {
						"type": "sap.ui.not.defined.Model"
					}
				}
			}
		};

		return Component.create({
			name: "sap.ui.test.v2models.parent",
			manifest: oManifestJson
		}).catch((error) => {
			assert.ok(error.message.includes(`Cannot load module 'sap/ui/not/defined/Model'.`),
				"Error thrown because defined model class is not found.");

			future.active = undefined;
		});

	});

	QUnit.test("metadata v2 with dataSources - unknown-odataVersion (future=true)", function(assert) {
		future.active = true;

		const oManifestJson = {
			"_version": "1.0.0",

			"sap.app": {
				"_version": "1.0.0",
				"id": "sap.ui.test.v2models.parent1",
				"type": "application",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"i18n": "i18n.properties",
				"title": "{{title}}",
				"description": "{{description}}",
				"dataSources": {
					"default": {
						"uri": "/path/to/default/datasource"
					},

					"unknown-odataVersion": {
						"uri": "/path/to/unknown/odataVersion",
						"settings": {
							"odataVersion": "3.0"
						}
					},
					"invalid": true
				}
			},
			"sap.ui": {
				"_version": "1.0.0",
				"technology": "UI5"
			},
			"sap.ui5": {
				"_version": "1.0.0",
				"dependencies": {
					"minUI5Version": "1.28.0",
					"libs": {
						"sap.ui.core": {
							"minVersion": "1.28.0"
						}
					}
				},
				"models": {
					"": "default",
					"v2-ODataModel-unknown-odataVersion": {
						"dataSource": "unknown-odataVersion"
					},
					"dataSource-invalid": {
						"type": "sap.ui.model.odata.v2.ODataModel",
						"dataSource": "invalid"
					}
				}
			}
		};

		return Component.create({
			name: "sap.ui.test.v2models.parent",
			manifest: oManifestJson
		}).catch((error) => {
			assert.ok(error.message.includes(`Component Manifest: Provided OData version "3.0" in dataSource "unknown-odataVersion" for model "v2-ODataModel-unknown-odataVersion" is unknown.`),
				"Error thrown because unknown dataSource defined in Component Manifest.");

			future.active = undefined;
		});
	});

	QUnit.test("metadata v2 with sap-system URL parameter", function(assert) {
		this.stubGetUriParameters({ sapSystem: "BLA_123" });

		return Component.create({
			name: "sap.ui.test.v2models.parentValid",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// model: "v2-ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service;o=BLA_123',
				useBatch: true,
				refreshAfterChange: true
			});

			// model: "v2-ODataModel" with a trailing slash and URL Parameters
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/trailing/slash;o=BLA_123/?sap-client=foo&sap-server=bar',
				annotationURI: [
					'/path/to/odata/service/with/trailing/slash;o=BLA_123/annotations.xml?sap-language=EN&sap-client=foo',
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo'
				],
				useBatch: true,
				refreshAfterChange: true,
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel" with multi origin annotations
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/multi/origin/annotations;o=BLA_123/?sap-client=foo&sap-server=bar',
				annotationURI: ["/path/to/other/odata/service;o=BLA_123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
												"test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/other/odata/service;o=BLA_123/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
												"/path/to/other/odata/service/other2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?sap-language=EN&sap-client=foo",
												"/path/to/other3/odata/service/;o=sid(G1Y.400)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo"
												],
				metadataUrlParams: { "sap-language": "EN" }
			});

			//JSON Model, should not have an origin
			// model: json
			sinon.assert.calledWithExactly(this.modelSpy.json, '/path/to/data.json?sap-client=foo&sap-server=bar');

			//ResourceModel should also not have an origin attached
			// model: "resourceBundle-name"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleName: "sap.ui.test.v2models.parent.i18n"
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

		}.bind(this));
	});

	QUnit.test("metadata v2 with sap-system startup parameter", function(assert) {
		this.stubGetUriParameters();

		return Component.create({
			name: "sap.ui.test.v2models.parentValid",
			manifest: false,
			componentData: {
				startupParameters: {
					"sap-system": "STARTUP456"
				}
			}
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// model: "v2-ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service;o=STARTUP456',
				useBatch: true,
				refreshAfterChange: true
			});

			// model: "v2-ODataModel" with a trailing slash and URL Parameters
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/trailing/slash;o=STARTUP456/?sap-client=foo&sap-server=bar',
				annotationURI: [
					'/path/to/odata/service/with/trailing/slash;o=STARTUP456/annotations.xml?sap-language=EN&sap-client=foo',
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo'
				],
				useBatch: true,
				refreshAfterChange: true,
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel" with multi origin annotations
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/multi/origin/annotations;o=STARTUP456/?sap-client=foo&sap-server=bar',
				annotationURI: ["/path/to/other/odata/service;o=STARTUP456/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
												"test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/other/odata/service;o=STARTUP456/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
												"/path/to/other/odata/service/other2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?sap-language=EN&sap-client=foo",
												"/path/to/other3/odata/service/;o=sid(G1Y.400)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo"
												],
				metadataUrlParams: { "sap-language": "EN" }
			});

			//JSON Model, should not have an origin
			// model: json
			sinon.assert.calledWithExactly(this.modelSpy.json, '/path/to/data.json?sap-client=foo&sap-server=bar');

			//ResourceModel should also not have an origin attached
			// model: "resourceBundle-name"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleName: "sap.ui.test.v2models.parent.i18n"
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

		}.bind(this));
	});

	QUnit.test("metadata v2 with cacheTokens", function(assert) {

		return Component.create({
			name: "sap.ui.test.v2models.parentValid",
			manifest: false,
			asyncHints: {
				cacheTokens: {
					dataSources: {
						"/path/to/odata/service": "1476971059",
						"/path/to/odata/service/with/trailing/slash/": "1476971462",
						"/path/to/odata/service/with/trailing/slash/annotations.xml": "1476971136",
						"/path/to/odata/annotations/with/sapclient/": "1476971188",
						"path/to/local/odata/annotations/2": "1476971160"
					}
				}
			}
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// Model without "dataSource" reference should not be affected by cache tokens
			// model: "v2-ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service',
				useBatch: true,
				refreshAfterChange: true
			});

			// model: "v2-ODataModel-ServiceOrigin"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/trailing/slash/',
				metadataUrlParams: {
					"sap-language": "EN"
				},
				annotationURI: [
					'/path/to/odata/service/with/trailing/slash/annotations.xml?sap-language=EN',
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/odata/annotations/2?sap-language=EN'
				],
				useBatch: true,
				refreshAfterChange: true
			});

			// model: "v2-ODataModel-SAPClient" with SAP client
			sinon.assert.calledWithExactly(this.modelSpy.odataV2.getCall(6), {
				serviceUrl: '/path/to/odata/service/with/sapclient/?sap-client=100',
				annotationURI: [ '/path/to/odata/annotations/with/sapclient/?sap-client=200&sap-language=EN' ],
				metadataUrlParams: { 'sap-language': 'EN' }
			});

			//JSON Model, should not have an origin
			// model: json
			sinon.assert.calledWithExactly(this.modelSpy.json, '/path/to/data.json');

			//ResourceModel should also not have an origin attached
			// model: "resourceBundle-name"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleName: "sap.ui.test.v2models.parent.i18n"
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

		}.bind(this));
	});

	QUnit.test("metadata v2 with cacheTokens (sap-client as URI parameter)", function(assert) {
		this.stubGetUriParameters();

		return Component.create({
			name: "sap.ui.test.v2models.parentValid",
			manifest: false,
			asyncHints: {
				cacheTokens: {
					dataSources: {
						"/path/to/odata/service": "1476971059",
						"/path/to/odata/service/with/trailing/slash/": "1476971462",
						"/path/to/odata/service/with/trailing/slash/annotations.xml": "1476971136",
						"path/to/local/odata/annotations/2": "1476971160"
					}
				}
			}
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// Model without "dataSource" reference should not be affected by cache tokens
			// model: "v2-ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service',
				useBatch: true,
				refreshAfterChange: true
			});

			// model: "v2-ODataModel-ServiceOrigin"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/trailing/slash/?sap-client=foo&sap-server=bar',
				metadataUrlParams: {
					"sap-context-token": "1476971462",
					"sap-language": "EN"
				},
				annotationURI: [
					'/path/to/odata/service/with/trailing/slash/annotations.xml?sap-language=EN&sap-client=foo&sap-context-token=1476971136',
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo&sap-context-token=1476971160'
				],
				useBatch: true,
				refreshAfterChange: true
			});

			//JSON Model, should not have an origin
			// model: json
			sinon.assert.calledWithExactly(this.modelSpy.json, '/path/to/data.json?sap-client=foo&sap-server=bar');

			//ResourceModel should also not have an origin attached
			// model: "resourceBundle-name"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleName: "sap.ui.test.v2models.parent.i18n"
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

		}.bind(this));
	});

	QUnit.test("metadata v4 with cacheTokens", function(assert) {
		this.stubGetUriParameters({
			"sapClient": "200"
		});
		return Component.create({
			name: "sap.ui.test.v4models.cacheTokens",
			manifest: false,
			asyncHints: {
				cacheTokens: {
					dataSources: {
						"/path/to/odata/service/": "1476971059",
						"/path/to/odata/annotations/1": "1476971462",
						"/path/to/odata/annotations/2": "1476971136",
						"/path/to/odata/annotations/3": "1476971160",
						"/path/to/odata/annotations/4": "1476971188"
					}
				}
			}
		}).then(function(oComponent) {
			this.oComponent = oComponent;
			sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
				serviceUrl: '/path/to/odata/service/?sap-client=200&sap-server=bar',
				metadataUrlParams: {
					"sap-language": "EN",
					"sap-context-token": "1476971059"
				},
				annotationURI: [
					'/path/to/odata/annotations/1?sap-language=EN&sap-client=200&sap-context-token=1476971462',
					'/path/to/odata/annotations/2?sap-language=EN&sap-client=200&sap-context-token=1476971136',
					'/path/to/odata/annotations/3?sap-language=EN&sap-client=200&sap-context-token=1476971160',
					'/path/to/odata/annotations/4?sap-language=EN&sap-client=200&sap-context-token=1476971188'
				],
				operationMode: "Server"
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

		}.bind(this));
	});

	QUnit.test("metadata v4 with sap-system URL parameter", async function(assert) {
		this.stubGetUriParameters({ sapSystem: "URL_123" });

		this.oComponent = await Component.create({
			name: "sap.ui.test.v4models.sapSystem"
		});

		this.assertModelInstances({
			"v4-ODataModel": this.modelSpy.odataV4,
			"v4-ODataModel-ServiceOrigin": this.modelSpy.odataV4,
			"v4-ODataModel-OtherOrigins": this.modelSpy.odataV4
		});

		// model: "v4-ODataModel"
		sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
			serviceUrl: '/path/to/odata/service;o=URL_123/'
		});

		// model: "v4-ODataModel-ServiceOrigin" with a trailing slash and URL Parameters
		sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
			serviceUrl: '/path/to/odata/service/with/trailing/slash;o=URL_123/?sap-client=foo&sap-server=bar',
			annotationURI: [
				'/path/to/odata/service/with/trailing/slash;o=URL_123/annotations.xml?sap-language=EN&sap-client=foo',
				'test-resources/sap/ui/core/qunit/component/testdata/v4models/sapSystem/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo'
			],
			metadataUrlParams: { "sap-language": "EN" }
		});

		// model: "v4-ODataModel-OtherOrigins" with multi origin annotations
		sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
			serviceUrl: '/path/to/odata/service/with/multi/origin/annotations;o=URL_123/?sap-client=foo&sap-server=bar',
			annotationURI: ["/path/to/other/odata/service;o=URL_123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
							"test-resources/sap/ui/core/qunit/component/testdata/v4models/sapSystem/path/to/other/odata/service;o=URL_123/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
							"/path/to/other/odata/service/other2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?sap-language=EN&sap-client=foo",
							"/path/to/other3/odata/service/;o=sid(G1Y.400)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo"
							],
			metadataUrlParams: { "sap-language": "EN" }
		});

		// destroy the component
		this.oComponent.destroy();

		// check if all models got destroyed (uses the models from #assertModelInstances)
		this.assertModelsDestroyed();
	});

	QUnit.test("metadata v4 with sap-system startup parameter", async function(assert) {
		this.stubGetUriParameters();

		this.oComponent = await Component.create({
			name: "sap.ui.test.v4models.sapSystem",
			componentData: {
				startupParameters: {
					"sap-system": "STARTUP123"
				}
			}
		});

		this.assertModelInstances({
			"v4-ODataModel": this.modelSpy.odataV4,
			"v4-ODataModel-ServiceOrigin": this.modelSpy.odataV4,
			"v4-ODataModel-OtherOrigins": this.modelSpy.odataV4
		});

		// model: "v4-ODataModel"
		sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
			serviceUrl: '/path/to/odata/service;o=STARTUP123/'
		});

		// model: "v4-ODataModel-ServiceOrigin" with a trailing slash and URL Parameters
		sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
			serviceUrl: '/path/to/odata/service/with/trailing/slash;o=STARTUP123/?sap-client=foo&sap-server=bar',
			annotationURI: [
				'/path/to/odata/service/with/trailing/slash;o=STARTUP123/annotations.xml?sap-language=EN&sap-client=foo',
				'test-resources/sap/ui/core/qunit/component/testdata/v4models/sapSystem/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo'
			],
			metadataUrlParams: { "sap-language": "EN" }
		});

		// model: "v4-ODataModel-OtherOrigins" with multi origin annotations
		sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
			serviceUrl: '/path/to/odata/service/with/multi/origin/annotations;o=STARTUP123/?sap-client=foo&sap-server=bar',
			annotationURI: ["/path/to/other/odata/service;o=STARTUP123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
							"test-resources/sap/ui/core/qunit/component/testdata/v4models/sapSystem/path/to/other/odata/service;o=STARTUP123/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
							"/path/to/other/odata/service/other2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?sap-language=EN&sap-client=foo",
							"/path/to/other3/odata/service/;o=sid(G1Y.400)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo"
							],
			metadataUrlParams: { "sap-language": "EN" }
		});

		// destroy the component
		this.oComponent.destroy();

		// check if all models got destroyed (uses the models from #assertModelInstances)
		this.assertModelsDestroyed();
	});

	QUnit.test("metadata v2 with dataSources (extension inheritance)", function(assert) {
		this.stubGetUriParameters();

		return Component.create({
			name: "sap.ui.test.v2models.extension",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 7);

			// model: "default-with-annotations"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/default/datasource?sap-client=foo&sap-server=bar',
				annotationURI: [
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo',
					'/path/to/odata/annotations/1?sap-language=EN&sap-client=foo',
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/extension/path/to/local/extension/annotation?sap-language=EN&sap-client=foo'
				],
				headers: { "Cache-Control": "max-age=360" },
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "old-uri-syntax"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service'
			});

			// model: ""
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/default/extension/datasource?sap-client=foo&sap-server=bar',
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service',
				useBatch: true,
				refreshAfterChange: true,
				skipMetadataAnnotationParsing: true
			});

			// model: "v2-ODataModel" with multi origin annotations
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/multi/origin/annotations/?sap-client=foo&sap-server=bar',
				annotationURI: ["/path/to/other/odata/service/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
												"test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/other/odata/service/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
												"/path/to/other/odata/service/other2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?sap-language=EN&sap-client=foo",
												"/path/to/other3/odata/service/;o=sid(G1Y.400)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo"
												],
				metadataUrlParams: { "sap-language": "EN" }
			});

			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 3);

			// model: "json"
			sinon.assert.calledWithExactly(this.modelSpy.json, '/path/to/data.json?sap-client=foo&sap-server=bar');

			// model: "json-relative"
			sinon.assert.calledWithExactly(this.modelSpy.json, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/extension/path/to/extension/data.json?sap-client=foo&sap-server=bar');

			// model: "json-relative-2"
			sinon.assert.calledWithExactly(this.modelSpy.json, 'test-resources/sap/ui/core/qunit/component/testdata/path/to/other/data.json?sap-client=foo&sap-server=bar');


			// sap.ui.model.xml.XMLModel
			sinon.assert.callCount(this.modelSpy.xml, 3);

			// model: "xml"
			sinon.assert.calledWithExactly(this.modelSpy.xml, '/path/to/data.xml?sap-client=foo&sap-server=bar');

			// model: "xml-relative"
			sinon.assert.calledWithExactly(this.modelSpy.xml, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/data.xml?sap-client=foo&sap-server=bar');

			// model: "xml-extension"
			sinon.assert.calledWithExactly(this.modelSpy.xml, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/extension/path/to/local/data.xml?sap-client=foo&sap-server=bar');


			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);

			// model: "resourceBundle-name"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleName: "sap.ui.test.v2models.parent.i18n"
			});

			// model: "resourceBundle-legacy-uri"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/i18n.properties"
			});

			// sap.ui.test.v2models.parent.CustomModel
			sinon.assert.callCount(this.modelSpy.custom, 7);

			// model: "custom-uri-string"
			sinon.assert.calledWithExactly(this.modelSpy.custom, '/path/to/custom.datatype?sap-client=foo&sap-server=bar');

			// model: "custom-uri-relative-string"
			sinon.assert.calledWithExactly(this.modelSpy.custom, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/custom.datatype?sap-client=foo&sap-server=bar');

			// model: "custom-uri-string-with-settings"
			sinon.assert.calledWithExactly(this.modelSpy.custom, '/path/to/custom.datatype?sap-client=foo&sap-server=bar', {
				foo: 'bar'
			});

			// model: "custom-without-args"
			sinon.assert.calledWithExactly(this.modelSpy.custom);

			// model: "custom-uri-setting-name"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				myUri: '/path/to/custom.datatype?sap-client=foo&sap-server=bar'
			});

			// model: "custom-uri-setting-merge"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				uri: '/path/to/custom.datatype?sap-client=foo&sap-server=bar',
				foo: 'bar'
			});

			// model: "custom-uri-setting-already-defined"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				uri: 'foo'
			});

			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"": this.modelSpy.odataV2,
				"default-with-annotations": this.modelSpy.odataV2,
				"old-uri-syntax": this.modelSpy.odataV2,
				"v2-ODataModel": this.modelSpy.odataV2,
				"json": this.modelSpy.json,
				"json-relative": this.modelSpy.json,
				"json-relative-2": this.modelSpy.json,
				"xml": this.modelSpy.xml,
				"xml-relative": this.modelSpy.xml,
				"resourceBundle-name": this.modelSpy.resource,
				"resourceBundle-legacy-uri": this.modelSpy.resource,
				"custom-uri-string": this.modelSpy.custom,
				"custom-relative-uri-string": this.modelSpy.custom,
				"custom-uri-string-with-settings": this.modelSpy.custom,
				"custom-without-args": this.modelSpy.custom,
				"custom-uri-setting-name": this.modelSpy.custom,
				"custom-uri-setting-merge": this.modelSpy.custom,
				"custom-uri-setting-already-defined": this.modelSpy.custom
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

		}.bind(this));
	});

	QUnit.test("metadata v2 without models", function(assert) {

		return Component.create({
			name: "sap.ui.test.v2empty"
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 0);
			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 0);
			// sap.ui.model.xml.XMLModel
			sinon.assert.callCount(this.modelSpy.xml, 0);
			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 0);
			// sap.ui.test.v2models.CustomModel
			sinon.assert.callCount(this.modelSpy.custom, 0);

			assert.ok(!this.oComponent.getModel(), "Component should not have a model");
			assert.deepEqual(this.oComponent._mManifestModels, {}, "Component should not have internal model references");

			// destroy the component
			this.oComponent.destroy();

		}.bind(this));
	});

	QUnit.test("dynamic enhance of models and datasources", function(assert) {
		this.stubGetUriParameters();

		sap.ui.define("sap/ui/test/v2local/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

			var LocalComponent = UIComponent.extend("sap.ui.test.v2local.Component", {
				metadata : {
					manifest : {
						"sap.app": {
							"id": "sap.ui.test.v2local"
						}
					}
				}
			});

			LocalComponent.prototype._initComponentModels = function(mModels, mDataSources, mCacheTokens) {

				mModels = mModels || {};
				mDataSources = mDataSources || {};
				mCacheTokens = mCacheTokens || {};
				mCacheTokens.dataSources = mCacheTokens.dataSources || {};

				mModels["ODataModel"] = {
					"type": "sap.ui.model.odata.v2.ODataModel",
					"dataSource": "OData",
					"settings": {
						"useBatch": false,
						"refreshAfterChange": false
					}
				};

				mDataSources["OData"] = {
					"uri": "/path/to/odata/service",
					"type": "OData",
					"settings": {
						"odataVersion": "2.0",
						"annotations": [ "annotations" ],
						"localMetaDataUri": "/path/to/local/metadata.xml"
					}
				};

				mDataSources["annotations"] = {
					"uri": "path/to/local/odata/annotations",
					"type": "ODataAnnotation"
				};

				mCacheTokens.dataSources["/path/to/odata/service"] = "1234567890";

				UIComponent.prototype._initComponentModels.call(this, mModels, mDataSources, mCacheTokens);

			};

			return LocalComponent;

		});

		return Component.create({
			name: "sap.ui.test.v2local",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 1);

			// model: "ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service?sap-client=foo&sap-server=bar',
				annotationURI: [ 'test-resources/sap/ui/core/qunit/component/testdata/v2local/path/to/local/odata/annotations?sap-language=EN&sap-client=foo' ],
				metadataUrlParams: { "sap-context-token": '1234567890', "sap-language": 'EN' },
				useBatch: false,
				refreshAfterChange: false
			});

			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"ODataModel": this.modelSpy.odataV2
			});

			// destroy the component
			this.oComponent.destroy();

		}.bind(this));
	});

	QUnit.test("consume V2 service with V4 model", function(assert) {

		return Component.create({
			name: "sap.ui.test.v4models",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.odata.v4.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV4, 1);
			sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
				serviceUrl: '/path/to/odata/service/',
				metadataUrlParams: {"sap-language": "EN"},
				autoExpandSelect: false,
				odataVersion: "2.0",
				operationMode: "Server"
			});

			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"ODataV2Consumption": this.modelSpy.odataV4
			});

			// destroy the component
			this.oComponent.destroy();

		}.bind(this));
	});

	QUnit.test("pass unsupported service version to V4 model", function(assert) {
		return Component.create({
			name: "sap.ui.test.v4models.unsupportedVersion",
			manifest: false
		}).then(function(oComponent) {
			assert.ok(false, "creating a component that uses an unupported OData version must not succeed");
		}, function(oErr) {

			// sap.ui.model.odata.v4.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV4, 1);
			sinon.assert.calledWithExactly(this.modelSpy.odataV4, {
				serviceUrl: '/path/to/odata/service/',
				metadataUrlParams: {"sap-language": "EN"},
				autoExpandSelect: false,
				odataVersion: "foo",
				operationMode: "Server"
			});

		}.bind(this));
	});

	QUnit.test("pass 'ignoreAnnotationsFromMetadata' parameter to V2 and V4 model", function(assert) {
		// For now the 'modelsMisc' Component contains only manifest definitions for
		// the 'ignoreAnnotationsFromMetadata' parameter (aside from other necessary ones).
		// The modelsMisc Component is intended to hold tests for additional parameters that just need
		// to be passed onwards to the models.
		return Component.create({
			name: "sap.ui.test.modelsMisc"
		}).then(function(oComponent) {

			// check if models exist
			assert.ok(oComponent.getModel("V2_withoutDataSource"), "V2 Model without dataSource is set on the Component instance");
			assert.ok(oComponent.getModel("V4_withoutDataSource"), "V4 Model without dataSource is set on the Component instance");
			assert.ok(oComponent.getModel("V2_withDataSource"), "V2 Model with dataSource is set on the Component instance");
			assert.ok(oComponent.getModel("V4_withDataSource"), "V4 Model with dataSource is set on the Component instance");

			// V2 ODataModels
			assert.equal(this.modelSpy.odataV2.callCount, 2, "two V2 ODataModels created");

			assert.ok(this.modelSpy.odataV2.getCall(0).calledWith({
				ignoreAnnotationsFromMetadata: true,
				serviceUrl: "/sap/odata/v2/service/"
			}), "First V2 ODataModel was created without dataSource, ignoreAnnotationsFromMetadata paramater is <true>");

			assert.ok(this.modelSpy.odataV2.getCall(1).calledWith({
				ignoreAnnotationsFromMetadata: true,
				metadataUrlParams: {"sap-language": 'EN'},
				serviceUrl: "/sap/odata/v2/service/"
			}), "Second V2 ODataModel was created from dataSource, ignoreAnnotationsFromMetadata paramater is <true>");

			// V4 ODataModels
			assert.equal(this.modelSpy.odataV4.callCount, 2, "two V4 ODataModels created");

			assert.ok(this.modelSpy.odataV4.getCall(0).calledWith({
				ignoreAnnotationsFromMetadata: true,
				serviceUrl: "/sap/odata/v4/service/"
			}), "First V4 ODataModel was created without dataSource, ignoreAnnotationsFromMetadata paramater is <true>");

			assert.ok(this.modelSpy.odataV4.getCall(1).calledWith({
				ignoreAnnotationsFromMetadata: true,
				metadataUrlParams: {"sap-language": 'EN'},
				odataVersion: "4.0",
				serviceUrl: "/sap/odata/v4/service/"
			}), "Second V4 ODataModel was created from dataSource, ignoreAnnotationsFromMetadata paramater is <true>");

		}.bind(this));
	});

	QUnit.module("metadata v2 with dataSources (empty inheritance)", {
		beforeEach: async function() {
			bindHelper.call(this);

			/** @deprecated */
			noSyncTest_beforeEach.call(this);

			await this.spyModels();
			this.stubGetUriParameters();
			this.oLogSpy = sinon.spy(Log, "error");
		},
		afterEach: function(assert) {
			this.restoreModels();
			this.restoreGetUriParameters();
			this.oLogSpy.restore();

			/** @deprecated */
			noSyncTest_afterEach.call(this, assert);
		},
		assertAll: function(assert) {
			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 7);

			// model: "default-with-annotations"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/default/datasource?sap-client=foo&sap-server=bar',
				annotationURI: [
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo',
					'/path/to/odata/annotations/1?sap-language=EN&sap-client=foo'
				],
				headers: { "Cache-Control": "max-age=500" },
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "old-uri-syntax"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service'
			});

			// model: ""
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/default/datasource?sap-client=foo&sap-server=bar',
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service',
				useBatch: true,
				refreshAfterChange: true
			});

			// model: "v2-ODataModel" with multi origin annotations
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/multi/origin/annotations/?sap-client=foo&sap-server=bar',
				annotationURI: ["/path/to/other/odata/service/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
												"test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/other/odata/service/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
												"/path/to/other/odata/service/other2/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/?sap-language=EN&sap-client=foo",
												"/path/to/other3/odata/service/;o=sid(G1Y.400)/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo"
												],
				metadataUrlParams: { "sap-language": "EN" }
			});

			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 3);

			// model: "json"
			sinon.assert.calledWithExactly(this.modelSpy.json, '/path/to/data.json?sap-client=foo&sap-server=bar');

			// model: "json-relative"
			sinon.assert.calledWithExactly(this.modelSpy.json, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/data.json?sap-client=foo&sap-server=bar');

			// model: "json-relative-2"
			sinon.assert.calledWithExactly(this.modelSpy.json, 'test-resources/sap/ui/core/qunit/component/testdata/path/to/other/data.json?sap-client=foo&sap-server=bar');


			// sap.ui.model.xml.XMLModel
			sinon.assert.callCount(this.modelSpy.xml, 2);

			// model: "xml"
			sinon.assert.calledWithExactly(this.modelSpy.xml, '/path/to/data.xml?sap-client=foo&sap-server=bar');

			// model: "xml-relative"
			sinon.assert.calledWithExactly(this.modelSpy.xml, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/data.xml?sap-client=foo&sap-server=bar');


			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);

			// model: "resourceBundle-name"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleName: "sap.ui.test.v2models.parent.i18n"
			});

			// model: "resourceBundle-legacy-uri"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/i18n.properties"
			});


			// sap.ui.test.v2models.parent.CustomModel
			sinon.assert.callCount(this.modelSpy.custom, 7);

			// model: "custom-uri-string"
			sinon.assert.calledWithExactly(this.modelSpy.custom, '/path/to/custom.datatype?sap-client=foo&sap-server=bar');

			// model: "custom-uri-relative-string"
			sinon.assert.calledWithExactly(this.modelSpy.custom, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parentValid/path/to/local/custom.datatype?sap-client=foo&sap-server=bar');

			// model: "custom-uri-string-with-settings"
			sinon.assert.calledWithExactly(this.modelSpy.custom, '/path/to/custom.datatype?sap-client=foo&sap-server=bar', {
				foo: 'bar'
			});

			// model: "custom-without-args"
			sinon.assert.calledWithExactly(this.modelSpy.custom);

			// model: "custom-uri-setting-name"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				myUri: '/path/to/custom.datatype?sap-client=foo&sap-server=bar'
			});

			// model: "custom-uri-setting-merge"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				uri: '/path/to/custom.datatype?sap-client=foo&sap-server=bar',
				foo: 'bar'
			});

			// model: "custom-uri-setting-already-defined"
			sinon.assert.calledWithExactly(this.modelSpy.custom, {
				uri: 'foo'
			});

			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"": this.modelSpy.odataV2,
				"default-with-annotations": this.modelSpy.odataV2,
				"old-uri-syntax": this.modelSpy.odataV2,
				"v2-ODataModel": this.modelSpy.odataV2,
				"json": this.modelSpy.json,
				"json-relative": this.modelSpy.json,
				"json-relative-2": this.modelSpy.json,
				"xml": this.modelSpy.xml,
				"xml-relative": this.modelSpy.xml,
				"resourceBundle-name": this.modelSpy.resource,
				"resourceBundle-legacy-uri": this.modelSpy.resource,
				"custom-uri-string": this.modelSpy.custom,
				"custom-relative-uri-string": this.modelSpy.custom,
				"custom-uri-string-with-settings": this.modelSpy.custom,
				"custom-without-args": this.modelSpy.custom,
				"custom-uri-setting-name": this.modelSpy.custom,
				"custom-uri-setting-merge": this.modelSpy.custom,
				"custom-uri-setting-already-defined": this.modelSpy.custom
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");
		}
	});

	QUnit.test("Init component via name", function(assert) {

		return Component.create({
			name: "sap.ui.test.v2models.empty",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;
			this.assertAll(assert);
		}.bind(this));

	});

	QUnit.test("Init component via name and manifestFirst", function(assert) {

		return Component.create({
			name: "sap.ui.test.v2models.empty",
			manifest: true
		}).then(function(oComponent) {
			this.oComponent = oComponent;
			this.assertAll(assert);
		}.bind(this));

	});


	QUnit.module("Async component preload with manifest", {
		beforeEach: async function() {
			bindHelper.apply(this);

			/** @deprecated */
			noSyncTest_beforeEach.call(this);

			await this.spyModels();

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");
			// enable async preloading
			this.oConfigurationGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("");

			// unload not existing module to prevent different logs
			// depending on cached 404 response or not
			// (see "class-not-loaded" model in manifest below)
			privateLoaderAPI.unloadResources("sap/ui/sample/model/MyModel.js", false, true);

			//setup fake server
			var oManifest = this.oManifest = {
				"sap.app" : {
					"id" : "samples.components.button",
					"dataSources": {
						"ODataService1": {
							"uri": "/path/to/odata/service1",
							"settings": {
								"annotations": ["Annotation1"]
							}
						},
						"ODataService2": {
							"uri": "/path/to/odata/service2",
							"settings": {
								"annotations": ["Annotation2"]
							}
						},
						"Annotation1": {
							"type": "ODataAnnotation",
							"uri": "/path/to/odata/annotations/1"
						},
						"Annotation2": {
							"type": "ODataAnnotation",
							"uri": "/path/to/odata/annotations/2?sap-language=abc"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"odata1": {
							"dataSource": "ODataService1",
							"preload": true
						},
						"odata2": {
							"type": "sap.ui.model.odata.v2.ODataModel",
							"uri": "/path/to/odata/service2",
							"settings": {
								"metadataUrlParams": {
									"custom-param": "foo-2"
								}
							}
						},
						"odata3": {
							"dataSource": "ODataService2",
							"settings": {
								"metadataUrlParams": {
									"custom-param": "foo-3",
									"sap-context-token": "foo",
									"sap-language": "bar"
								}
							}
						},
						"json1": {
							"type": "sap.ui.model.json.JSONModel",
							"settings": {
								"data": {
									"foo": "bar"
								}
							},
							"preload": true
						},
						"json2": {
							"type": "sap.ui.model.json.JSONModel",
							"settings": {
								"data": {
									"bar": "foo"
								}
							}
						},
						"i18n1": {
							"type": "sap.ui.model.resource.ResourceModel",
							"uri": "./i18n_preload.properties",
							"preload": true,
							"settings": {
								"async": true
							}
						},
						"i18n2": {
							"type": "sap.ui.model.resource.ResourceModel",
							"uri": "./i18n.properties"
						}
					}
				}
			};

			var oServer = this.oServer = sinon.sandbox.useFakeServer();

			oServer.xhr.useFilters = true;
			oServer.xhr.filters = [];
			oServer.xhr.addFilter(function(method, url) {
				return (!/^\/anylocation\/manifest\.json\?sap-language=EN(&sap-client=foo)?$/.test(url) && !/should\/cause\/an\/error\/library-preload\.json$/.test(url));
			});

			oServer.autoRespond = true;
			oServer.respondWith("GET", /^\/anylocation\/manifest\.json\?sap-language=EN(&sap-client=foo)?$/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifest)
			]);
			oServer.respondWith("GET", /should\/cause\/an\/error\/library-preload\.json$/, [
				404,
				{
					"Content-Type": "text/plain"
				},
				"Not found"
			]);
		},
		afterEach: function(assert) {
			this.restoreModels();
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();
			this.oConfigurationGetPreloadStub.restore();
			this.oServer.restore();
			this.restoreGetUriParameters();
			Component._fnLoadComponentCallback = null;

			/** @deprecated */
			noSyncTest_afterEach.call(this, assert);
		}
	});

	QUnit.test("Early model instantiation", function(assert) {
		Component._fnLoadComponentCallback = function() {
			// OData / JSON / ResourceModels Models should be created before the Component instance

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 1);
			// model: "odata1"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: "/path/to/odata/service1",
				annotationURI: ["/path/to/odata/annotations/1?sap-language=EN"],
				metadataUrlParams: { "sap-language": "EN" }
			});

			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 1);
			// model: "json"
			sinon.assert.calledWithExactly(this.modelSpy.json, {
				data: {
					foo: "bar"
				}
			});

			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);
		}.bind(this);

		return Component.create({
			manifest: "/anylocation/manifest.json"
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// Should be called 3 times now (2nd and 3rd models created)
			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 3);

			// Should be called twice now (2nd model created)
			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 2);

			// Both models have been loaded already
			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);

			assert.ok(this.modelSpy.resource.getCall(0).returnValue, "ResourceModel should be available");
			assert.ok(this.modelSpy.resource.getCall(0).returnValue.getResourceBundle() instanceof Promise,
				"Promise should be available as async=true is set in manifest");

			assert.ok(this.modelSpy.resource.getCall(1).returnValue, "ResourceModel should be available");
			assert.ok(this.modelSpy.resource.getCall(1).returnValue.getResourceBundle() instanceof ResourceBundle,
				"ResourceBundle should be available");

			assert.ok(this.oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(this.oComponent.getManifest(), "Manifest is available");
			assert.deepEqual(this.oComponent.getManifest(), this.oManifest, "Manifest matches the manifest behind manifestUrl");

			this.assertModelInstances({
				"odata1": this.modelSpy.odataV2,
				"odata2": this.modelSpy.odataV2,
				"odata3": this.modelSpy.odataV2,
				"json1": this.modelSpy.json,
				"json2": this.modelSpy.json,
				"i18n1": this.modelSpy.resource,
				"i18n2": this.modelSpy.resource
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();
		}.bind(this));
	});

	QUnit.test("Early model instantiation (with failing ResourceBundle loading)", function(assert) {
		var that = this,
			iLoadResourceBundleAsync = 0,
			fnJQuerySapResource = ResourceBundle.create,
			oResourceBundleCreateStub = sinon.stub(ResourceBundle, "create").callsFake(function(mConfig) {
				if (mConfig.async) {
					iLoadResourceBundleAsync++;
					return Promise.reject();
				}
				return fnJQuerySapResource.apply(this, arguments);
			});

		Component._fnLoadComponentCallback = function() {
			assert.equal(iLoadResourceBundleAsync, 2, "loadResourceBundle async should be called twice before component instantiation");
			assert.equal(that.modelSpy.resource.callCount, 1, "One ResourceModel should be created (preload=true)");
		};

		return Component.create({
			manifest: "/anylocation/manifest.json"
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.resource.ResourceModel
			assert.equal(iLoadResourceBundleAsync, 2, "loadResourceBundle async should still be called 2 times");
			assert.equal(this.modelSpy.resource.callCount, 2, "ResourceModels should be created (during Component instantiation)");

			this.assertModelInstances({
				"odata1": this.modelSpy.odataV2,
				"odata2": this.modelSpy.odataV2,
				"odata3": this.modelSpy.odataV2,
				"json1": this.modelSpy.json,
				"json2": this.modelSpy.json,
				"i18n1": this.modelSpy.resource,
				"i18n2": this.modelSpy.resource
			});

			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			oResourceBundleCreateStub.restore();
		}.bind(this));
	});

	QUnit.test("Early model instantiation (with startupParameters)", function(assert) {
		Component._fnLoadComponentCallback = function() {
			// OData / JSON / Resource Models should be created before the Component instance

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 1);
			// model: "odata1"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: "/path/to/odata/service1;o=XXX",
				annotationURI: ["/path/to/odata/annotations/1?sap-language=EN"],
				metadataUrlParams: { "sap-language": "EN" }
			});

			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 1);
			// model: "json"
			sinon.assert.calledWithExactly(this.modelSpy.json, {
				data: {
					foo: "bar"
				}
			});

			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);
		}.bind(this);

		return Component.create({
			manifest: "/anylocation/manifest.json",
			componentData: {
				startupParameters: {
					"sap-system": ["XXX"]
				}
			}
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// Should be called 3 times now (2nd and 3rd models created)
			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 3);

			// Should be called twice now (2nd model created)
			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 2);

			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);


			assert.ok(this.oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(this.oComponent.getManifest(), "Manifest is available");
			assert.deepEqual(this.oComponent.getManifest(), this.oManifest, "Manifest matches the manifest behind manifestUrl");

			this.assertModelInstances({
				"odata1": this.modelSpy.odataV2,
				"odata2": this.modelSpy.odataV2,
				"odata3": this.modelSpy.odataV2,
				"json1": this.modelSpy.json,
				"json2": this.modelSpy.json,
				"i18n1": this.modelSpy.resource,
				"i18n2": this.modelSpy.resource
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			Component._fnLoadComponentCallback = null;

		}.bind(this));
	});

	QUnit.test("Early model instantiation (with cacheTokens)", function(assert) {

		this.stubGetUriParameters();

		return Component.create({
			manifest: "/anylocation/manifest.json",
			asyncHints: {
				cacheTokens: {
					dataSources: {
						"/path/to/odata/service1": "1476348072",
						"/path/to/odata/service2": "1476361076",
						"/path/to/odata/annotations/1": "1476348278",
						"/path/to/odata/annotations/2?sap-language=abc": "1476365059"
					}
				}
			},
			componentData: {
				startupParameters: {
					"sap-system": ["XXX"]
				}
			}
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 3);

			// model: "odata1"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: "/path/to/odata/service1;o=XXX?sap-client=foo&sap-server=bar",
				metadataUrlParams: {
					"sap-context-token": "1476348072",
					"sap-language": "EN"
				},
				annotationURI: [
					"/path/to/odata/annotations/1?sap-language=EN&sap-client=foo&sap-context-token=1476348278"
				]
			});

			// model: "odata2"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: "/path/to/odata/service2;o=XXX",
				metadataUrlParams: {
					"custom-param": "foo-2"
				}
			});

			// model: "odata3"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: "/path/to/odata/service2;o=XXX?sap-client=foo&sap-server=bar",
				metadataUrlParams: {
					"custom-param": "foo-3",
					"sap-context-token": "1476361076",
					"sap-language": "bar"
				},
				annotationURI: [
					"/path/to/odata/annotations/2?sap-language=abc&sap-client=foo&sap-context-token=1476365059"
				]
			});

			this.assertModelInstances({
				"odata1": this.modelSpy.odataV2,
				"odata2": this.modelSpy.odataV2,
				"odata3": this.modelSpy.odataV2,
				"json1": this.modelSpy.json,
				"json2": this.modelSpy.json,
				"i18n1": this.modelSpy.resource,
				"i18n2": this.modelSpy.resource
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

		}.bind(this));
	});

	QUnit.test("No early model instantiation (sap.ui.component.load)", function(assert) {
		return Component.load({
			manifest: "/anylocation/manifest.json"
		}).then(function(ComponentClass) {

			assert.equal(ComponentClass.getMetadata().getComponentName(), "samples.components.button", "Component class should been loaded");
			assert.notOk(ComponentClass instanceof Component, "sap.ui.component.load should not create an instance");

			// No models should have been created!

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 0);
			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 0);
			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 0);

		}.bind(this));
	});

	QUnit.test("Early model instantiation: error handling 'asyncHints.libs'", function(assert) {
		return Component.create({
			manifest: "/anylocation/manifest.json",
			asyncHints: {
				libs: ["should.cause.an.error"]
			}
		}).then(function(oComponent) {

			assert.ok(false, "Component Promise should not get resolved.");

		}, function(vError) {

			assert.ok(vError && vError.message && vError.message.indexOf("failed to") === 0,
				"Component Promise should get rejected with library loading issue.");

			// Models with preload flag should be created

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 1);
			// model: "odata"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: "/path/to/odata/service1",
				annotationURI: ["/path/to/odata/annotations/1?sap-language=EN"],
				metadataUrlParams: { "sap-language": "EN" }
			});

			var oODataModel = this.modelSpy.odataV2.getCall(0).returnValue;
			assert.ok(oODataModel.bDestroyed, "ODataModel should have been destroyed.");

			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 1);
			// model: "json"
			sinon.assert.calledWithExactly(this.modelSpy.json, {
				data: {
					foo: "bar"
				}
			});

			var oJSONModel = this.modelSpy.json.getCall(0).returnValue;
			assert.ok(oJSONModel.bDestroyed, "JSONModel should have been destroyed.");

			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);

			var oResourceModel1 = this.modelSpy.resource.getCall(0).returnValue;
			assert.ok(oResourceModel1.bDestroyed, "ResourceModel should have been destroyed.");

			var oResourceModel2 = this.modelSpy.resource.getCall(1).returnValue;
			assert.ok(oResourceModel2.bDestroyed, "ResourceModel should have been destroyed.");
		}.bind(this));
	});

	QUnit.test("Early model instantiation: error handling 'asyncHints.waitFor'", function(assert) {
		return Component.create({
			manifest: "/anylocation/manifest.json",
			asyncHints: {
				waitFor: new Promise(function(resolve, reject) {
					reject("waitFor: rejected");
				})
			}
		}).then(function(oComponent) {

			assert.ok(false, "Component Promise should not get resolved.");

		}, function(vError) {

			assert.equal(vError, "waitFor: rejected", "Component Promise should get rejected.");

			// Models with preload flag should be created

			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 1);
			// model: "odata"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: "/path/to/odata/service1",
				annotationURI: ["/path/to/odata/annotations/1?sap-language=EN"],
				metadataUrlParams: { "sap-language": "EN" }
			});

			var oODataModel = this.modelSpy.odataV2.getCall(0).returnValue;
			assert.ok(oODataModel.bDestroyed, "ODataModel should have been destroyed.");

			// sap.ui.model.json.JSONModel
			sinon.assert.callCount(this.modelSpy.json, 1);
			// model: "json"
			sinon.assert.calledWithExactly(this.modelSpy.json, {
				data: {
					foo: "bar"
				}
			});

			var oJSONModel = this.modelSpy.json.getCall(0).returnValue;
			assert.ok(oJSONModel.bDestroyed, "JSONModel should have been destroyed.");

			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 2);

			var oResourceModel1 = this.modelSpy.resource.getCall(0).returnValue;
			assert.ok(oResourceModel1.bDestroyed, "ResourceModel should have been destroyed.");

			var oResourceModel2 = this.modelSpy.resource.getCall(1).returnValue;
			assert.ok(oResourceModel2.bDestroyed, "ResourceModel should have been destroyed.");
		}.bind(this));
	});

	QUnit.module("sap.ui.model.v2.ODataModel", {
		beforeEach: function() {
			bindHelper.apply(this);

			/** @deprecated */
			noSyncTest_beforeEach.call(this);

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");

		},
		afterEach: function(assert) {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();

			/** @deprecated */
			noSyncTest_afterEach.call(this, assert);
		}
	});

	QUnit.test("Basic", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.ui5": {
					"models": {
						"": {
							"type": "sap.ui.model.odata.v2.ODataModel",
							"uri": "/foo"
						}
					}
				}
			},
			expected: {
				"": {
					"settings": [
						{
							"serviceUrl": "/foo"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With settings", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.ui5": {
					"models": {
						"": {
							"type": "sap.ui.model.odata.v2.ODataModel",
							"settings": {
								"serviceUrl": "/foo",
								"useBatch": true,
								"refreshAfterChange": true
							}
						}
					}
				}
			},
			expected: {
				"": {
					"settings": [
						{
							"serviceUrl": "/foo",
							"useBatch": true,
							"refreshAfterChange": true
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.module("sap.ui.model.v2.ODataModel (with dataSource)", {
		beforeEach: function() {
			bindHelper.apply(this);

			/** @deprecated */
			noSyncTest_beforeEach.call(this);

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");

		},
		afterEach: function(assert) {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();

			/** @deprecated */
			noSyncTest_afterEach.call(this, assert);
		}
	});

	QUnit.test("Basic", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With settings (model)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData",
							"settings": {
								"useBatch": true,
								"refreshAfterChange": true
							}
						}
					}
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"useBatch": true,
							"refreshAfterChange": true,
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With settings (dataSource)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"maxAge": 500
							}
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"headers": {
								"Cache-Control": "max-age=500"
							},
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=EN",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=EN"
							],
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations (sap-language already present)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo?sap-language=FOO",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1?sap-language=BAR",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2?sap-language=BAZ",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=BAR",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=BAZ"
							],
							"serviceUrl": "/foo?sap-language=FOO"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-language=FOO",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.module("sap.ui.model.v2.ODataModel (with sap-client/sap-server as URI Parameters)", {
		beforeEach: function() {
			bindHelper.apply(this);

			/** @deprecated */
			noSyncTest_beforeEach.call(this);

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");

			this.stubGetUriParameters();
		},
		afterEach: function(assert) {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();
			this.restoreGetUriParameters();

			/** @deprecated */
			noSyncTest_afterEach.call(this, assert);
		}
	});

	QUnit.test("Basic", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=EN&sap-client=foo",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=EN&sap-client=foo"
							],
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations (sap-client/sap-server already present)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo?sap-client=999&sap-server=XXX",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1?sap-client=888",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2?sap-client=777",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-client=888&sap-language=EN",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-client=777&sap-language=EN"
							],
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-client=999&sap-server=XXX"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=999&sap-server=XXX",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations (sap-language already present)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo?sap-language=FOO",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1?sap-language=BAR",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2?sap-language=BAZ",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=BAR&sap-client=foo",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=BAZ&sap-client=foo"
							],
							"serviceUrl": "/foo?sap-language=FOO&sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-language=FOO&sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.module("sap.ui.model.v2.ODataModel (with cacheTokens)", {
		beforeEach: function() {
			bindHelper.apply(this);

			/** @deprecated */
			noSyncTest_beforeEach.call(this);

			BaseConfig._.invalidate();
			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");
		},
		afterEach: function(assert) {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();

			/** @deprecated */
			noSyncTest_afterEach.call(this, assert);
		}
	});

	QUnit.test("Basic", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid, but sap-client parameter is missing
					"/foo": "1400000001",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"/foo?sap-client=foo&sap-server=bar": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);

		// One warning should be logged (serviceUrl)
		sinon.assert.callCount(this.oLogWarningSpy, 1);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000001\" for Model \"\" (/foo). " +
			"Missing \"sap-client\" URI parameter",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);


	});

	QUnit.test("With annotations", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid, but sap-client parameter is missing
					"/foo": "1400000001",

					// Valid, but sap-client parameter is missing
					"/path/to/odata/annotation/1": "1400000002",

					// Valid, but sap-client parameter is missing
					"path/to/local/odata/annotation/2": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=EN",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=EN"
							],
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);

		// Three warnings should be logged (serviceUrl + 2x annotationURIs)
		sinon.assert.callCount(this.oLogWarningSpy, 3);

		// Annotation1
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000002\" for DataSource \"Annotation1\" (/path/to/odata/annotation/1?sap-language=EN). " +
			"Missing \"sap-client\" URI parameter",
			"[\"sap.app\"][\"dataSources\"][\"Annotation1\"]",
			"sap.ui.core.test.component.models"
		);

		// Annotation2
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000003\" for DataSource \"Annotation2\" (path/to/local/odata/annotation/2?sap-language=EN). " +
			"Missing \"sap-client\" URI parameter",
			"[\"sap.app\"][\"dataSources\"][\"Annotation2\"]",
			"sap.ui.core.test.component.models"
		);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000001\" for Model \"\" (/foo). " +
			"Missing \"sap-client\" URI parameter",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);

	});

	QUnit.module("sap.ui.model.v2.ODataModel (with cacheTokens / with sap-client/sap-server as URI Parameters)", {
		beforeEach: function() {
			bindHelper.apply(this);

			/** @deprecated */
			noSyncTest_beforeEach.call(this);

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");

			this.stubGetUriParameters();
		},
		afterEach: function(assert) {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();
			this.restoreGetUriParameters();

			/** @deprecated */
			noSyncTest_afterEach.call(this, assert);
		}
	});

	QUnit.test("Basic", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid
					"/foo": "1400000001",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"/foo?sap-client=foo&sap-server=bar": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"metadataUrlParams": {
								"sap-context-token": "1400000001",
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid
					"/foo": "1400000001",

					// Valid
					"/path/to/odata/annotation/1": "1400000002",

					// Valid
					"path/to/local/odata/annotation/2": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=EN&sap-client=foo&sap-context-token=1400000002",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=EN&sap-client=foo&sap-context-token=1400000003"
							],
							"metadataUrlParams": {
								"sap-context-token": "1400000001",
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations (sap-client/sap-server already present with same value in URI)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo?sap-client=foo&sap-server=bar",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1?sap-client=foo",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2?sap-client=foo",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid
					"/foo?sap-client=foo&sap-server=bar": "1400000001",

					// Valid
					"/path/to/odata/annotation/1?sap-client=foo": "1400000002",

					// Valid
					"path/to/local/odata/annotation/2?sap-client=foo": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2?sap-client=foo": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-client=foo&sap-language=EN&sap-context-token=1400000002",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-client=foo&sap-language=EN&sap-context-token=1400000003"
							],
							"metadataUrlParams": {
								"sap-context-token": "1400000001",
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations (sap-client/sap-server already present with different value in URI)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo?sap-client=999&sap-server=XXX",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1?sap-client=888",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2?sap-client=777",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid, but should not be added as provided sap-client differs from config
					"/foo?sap-client=999&sap-server=XXX": "1400000001",

					// Valid, but should not be added as provided sap-client differs from config
					"/path/to/odata/annotation/1?sap-client=888": "1400000002",

					// Valid, but should not be added as provided sap-client differs from config
					"path/to/local/odata/annotation/2?sap-client=777": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2?sap-client=777": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-client=888&sap-language=EN",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-client=777&sap-language=EN"
							],
							"metadataUrlParams": {
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-client=999&sap-server=XXX"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=999&sap-server=XXX",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);

		// Three warnings should be logged (serviceUrl + 2x annotationURIs)
		sinon.assert.callCount(this.oLogWarningSpy, 3);

		// Annotation1
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000002\" for DataSource \"Annotation1\" (/path/to/odata/annotation/1?sap-client=888&sap-language=EN). " +
			"URI parameter \"sap-client=888\" must be identical with configuration \"sap-client=foo\"",
			"[\"sap.app\"][\"dataSources\"][\"Annotation1\"]",
			"sap.ui.core.test.component.models"
		);

		// Annotation2
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000003\" for DataSource \"Annotation2\" (path/to/local/odata/annotation/2?sap-client=777&sap-language=EN). " +
			"URI parameter \"sap-client=777\" must be identical with configuration \"sap-client=foo\"",
			"[\"sap.app\"][\"dataSources\"][\"Annotation2\"]",
			"sap.ui.core.test.component.models"
		);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000001\" for Model \"\" (/foo?sap-client=999&sap-server=XXX). " +
			"URI parameter \"sap-client=999\" must be identical with configuration \"sap-client=foo\"",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);

	});

	QUnit.test("With annotations (sap-client already present with same value in metadataUrlParams)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData",
							"settings": {
								"metadataUrlParams": {
									"sap-client": "foo"
								}
							}
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid, but should not be added as provided sap-client differs from config
					"/foo": "1400000001",

					// Valid, but should not be added as provided sap-client differs from config
					"/path/to/odata/annotation/1": "1400000002",

					// Valid, but should not be added as provided sap-client differs from config
					"path/to/local/odata/annotation/2": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=EN&sap-client=foo&sap-context-token=1400000002",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=EN&sap-client=foo&sap-context-token=1400000003"
							],
							"metadataUrlParams": {
								"sap-context-token": "1400000001",
								"sap-client": "foo",
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations (sap-client already present with different value in metadataUrlParams)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData",
							"settings": {
								"metadataUrlParams": {
									"sap-client": "999"
								}
							}
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid, but should not be added as provided sap-client differs from config
					"/foo": "1400000001",

					// Valid, but should not be added as provided sap-client differs from config
					"/path/to/odata/annotation/1": "1400000002",

					// Valid, but should not be added as provided sap-client differs from config
					"path/to/local/odata/annotation/2": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=EN&sap-client=foo&sap-context-token=1400000002",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=EN&sap-client=foo&sap-context-token=1400000003"
							],
							"metadataUrlParams": {
								"sap-client": "999",
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);

		// One warning should be logged (serviceUrl)
		sinon.assert.callCount(this.oLogWarningSpy, 1);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000001\" for Model \"\" (/foo?sap-client=foo&sap-server=bar). " +
			"URI parameter \"sap-client=999\" must be identical with configuration \"sap-client=foo\"",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);

	});

	QUnit.test("With annotations (sap-language already present in URI)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo?sap-language=FOO",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1?sap-language=BAR",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2?sap-language=BAZ",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid
					"/foo?sap-language=FOO": "1400000001",

					// Valid
					"/path/to/odata/annotation/1?sap-language=BAR": "1400000002",

					// Valid
					"path/to/local/odata/annotation/2?sap-language=BAZ": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2?sap-language=BAZ": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=BAR&sap-client=foo&sap-context-token=1400000002",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=BAZ&sap-client=foo&sap-context-token=1400000003"
							],
							"metadataUrlParams": {
								"sap-context-token": "1400000001"
							},
							"serviceUrl": "/foo?sap-language=FOO&sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-language=FOO&sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations (sap-language already present in metadataUrlParams)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData",
							"settings": {
								"metadataUrlParams": {
									"sap-language": "FOO"
								}
							}
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid
					"/foo": "1400000001",

					// Valid
					"/path/to/odata/annotation/1": "1400000002",

					// Valid
					"path/to/local/odata/annotation/2": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=EN&sap-client=foo&sap-context-token=1400000002",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=EN&sap-client=foo&sap-context-token=1400000003"
							],
							"metadataUrlParams": {
								"sap-language": "FOO",
								"sap-context-token": "1400000001"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations (sap-context-token already present with same value in URI)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo?sap-context-token=1400000001",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1?sap-context-token=1400000002",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2?sap-context-token=1400000003",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid, but should not be a real world use case. Just to test that the parameter won't be added twice.
					"/foo?sap-context-token=1400000001": "1400000001",

					// Valid, but should not be a real world use case. Just to test that the parameter won't be added twice.
					"/path/to/odata/annotation/1?sap-context-token=1400000002": "1400000002",

					// Valid, but should not be a real world use case. Just to test that the parameter won't be added twice.
					"path/to/local/odata/annotation/2?sap-context-token=1400000003": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2?sap-context-token=1400000003": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-context-token=1400000002&sap-language=EN&sap-client=foo",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-context-token=1400000003&sap-language=EN&sap-client=foo"
							],
							"metadataUrlParams": {
								"sap-language": "EN",
								"sap-context-token" : "1400000001"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);

		// One warnings should be logged
		sinon.assert.callCount(this.oLogWarningSpy, 1);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Move existing \"sap-context-token=1400000001\" to metadataUrlParams for Model \"\" (/foo?sap-context-token=1400000001&sap-client=foo&sap-server=bar).",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);

	});

	QUnit.test("With annotations (sap-context-token already present with different value in URI)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo?sap-context-token=1400000001",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1?sap-context-token=1400000002",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2?sap-context-token=1400000003",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData"
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid, but should not be a real world use case. Just to test that the parameter won't be added twice.
					"/foo?sap-context-token=1400000001": "1400000111",

					// Valid, but should not be a real world use case. Just to test that the parameter won't be added twice.
					"/path/to/odata/annotation/1?sap-context-token=1400000002": "1400000222",

					// Valid, but should not be a real world use case. Just to test that the parameter won't be added twice.
					"path/to/local/odata/annotation/2?sap-context-token=1400000003": "1400000333",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2?sap-context-token=1400000003": "1500000111"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-context-token=1400000222&sap-language=EN&sap-client=foo",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-context-token=1400000333&sap-language=EN&sap-client=foo"
							],
							"metadataUrlParams": {
								"sap-language": "EN",
								"sap-context-token":"1400000111"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);

		// Four warnings should be logged (2 * serviceUrl + 2x annotationURIs)
		sinon.assert.callCount(this.oLogWarningSpy, 4);

		// Annotation1
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Overriding existing \"sap-context-token=1400000002\" with provided value \"1400000222\" for DataSource \"Annotation1\" (/path/to/odata/annotation/1?sap-context-token=1400000002&sap-language=EN&sap-client=foo).",
			"[\"sap.app\"][\"dataSources\"][\"Annotation1\"]",
			"sap.ui.core.test.component.models"
		);

		// Annotation2
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Overriding existing \"sap-context-token=1400000003\" with provided value \"1400000333\" for DataSource \"Annotation2\" (path/to/local/odata/annotation/2?sap-context-token=1400000003&sap-language=EN&sap-client=foo).",
			"[\"sap.app\"][\"dataSources\"][\"Annotation2\"]",
			"sap.ui.core.test.component.models"
		);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Overriding existing \"sap-context-token=1400000001\" with provided value \"1400000111\" for Model \"\" (/foo?sap-context-token=1400000001&sap-client=foo&sap-server=bar).",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Move existing \"sap-context-token=1400000001\" to metadataUrlParams for Model \"\" (/foo?sap-context-token=1400000001&sap-client=foo&sap-server=bar).",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);

	});

	QUnit.test("With annotations (sap-context-token already present with same value in metadataUrlParams)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData",
							"settings": {
								"metadataUrlParams": {
									"sap-context-token": "1400000001"
								}
							}
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid
					"/foo": "1400000001",

					// Valid
					"/path/to/odata/annotation/1": "1400000002",

					// Valid
					"path/to/local/odata/annotation/2": "1400000003",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2": "1500000001"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=EN&sap-client=foo&sap-context-token=1400000002",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=EN&sap-client=foo&sap-context-token=1400000003"
							],
							"metadataUrlParams": {
								"sap-language": "EN",
								"sap-context-token": "1400000001"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors or warnings should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);
		sinon.assert.callCount(this.oLogWarningSpy, 0);
	});

	QUnit.test("With annotations (sap-context-token already present with different value in metadataUrlParams)", function(assert) {
		this.assertModelFromManifest(assert, {
			manifest: {
				"sap.app": {
					"dataSources": {
						"OData": {
							"uri": "/foo",
							"settings": {
								"annotations": [ "Annotation1", "Annotation2" ]
							}
						},
						"Annotation1": {
							"uri": "/path/to/odata/annotation/1",
							"type": "ODataAnnotation"
						},
						"Annotation2": {
							"uri": "path/to/local/odata/annotation/2",
							"type": "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
					"models": {
						"": {
							"dataSource": "OData",
							"settings": {
								"metadataUrlParams": {
									"sap-context-token": "1400000001"
								}
							}
						}
					}
				}
			},
			cacheTokens: {
				dataSources: {
					// Valid
					"/foo": "1400000111",

					// Valid
					"/path/to/odata/annotation/1": "1400000222",

					// Valid
					"path/to/local/odata/annotation/2": "1400000333",

					// Invalid (lookup is based on URI from manifest, not the final one)
					"path/to/manifest/path/to/local/odata/annotation/2": "1500000111"
				}
			},
			expected: {
				"": {
					"dataSource": "OData",
					"settings": [
						{
							"annotationURI": [
								"/path/to/odata/annotation/1?sap-language=EN&sap-client=foo&sap-context-token=1400000222",
								"path/to/manifest/path/to/local/odata/annotation/2?sap-language=EN&sap-client=foo&sap-context-token=1400000333"
							],
							"metadataUrlParams": {
								"sap-language": "EN",
								"sap-context-token": "1400000111"
							},
							"serviceUrl": "/foo?sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-client=foo&sap-server=bar",
					"uriSettingName": "serviceUrl"
				}
			}
		});

		// No errors should be logged
		sinon.assert.callCount(this.oLogErrorSpy, 0);

		// One warning should be logged (sap-context-token will be overridden with new value)
		sinon.assert.callCount(this.oLogWarningSpy, 1);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Overriding existing \"sap-context-token=1400000001\" with provided value \"1400000111\" for Model \"\" (/foo?sap-client=foo&sap-server=bar).",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);

	});

	QUnit.module("ui5:// URL resolution for local annotations", {
		before: function() {
			// preload any used libraries / modules to avoid sync requests
			return Promise.all([
				Library.load("sap.ui.layout"),
				Library.load("sap.ui.unified"),
				Library.load("sap.m")
			]).then(function() {
				return new Promise(function(resolve, reject) {
					sap.ui.require([
						"sap/m/Label",
						"sap/ui/core/CustomData",
						"sap/ui/core/mvc/XMLView",
						"sap/ui/core/routing/Router",
						/**
						 * @deprecated As of version 1.66
						 */
						"sap/ui/model/odata/ODataAnnotations"
					], function() {
						resolve();
					}, reject);
				});
			});
		},
		beforeEach: async function() {
			bindHelper.call(this);

			/** @deprecated */
			noSyncTest_beforeEach.call(this);

			await this.spyModels();
			this.oLogSpy = sinon.spy(Log, "error");

			sap.ui.loader.config({
				paths: {
					"path/to/odata/service": "https://remote.system:9000/odata/service",
					"sap/ui/test/v2models/ui5urls": "test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls",
					"another/name/space": "test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/another/name/space",
					"cool.name.space": "test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/cool/name/space"
				}
			});
		},
		afterEach: function(assert) {
			this.restoreModels();
			this.oLogSpy.restore();

			this.oComponent.destroy();

			this.restoreGetUriParameters();

			// To keep reusing the same component for async and sync path tests,
			// we need to unload the Component and remove the leftovers from the ComponentMetadata.
			// This way all tests start fresh and actually load the Component again.
			var TestComponent = sap.ui.require("sap/ui/test/v2models/ui5urls/Component");
			if ( TestComponent ) {
				delete TestComponent.getMetadata()._oManifest;
			}
			privateLoaderAPI.unloadResources('sap/ui/test/v2models/ui5urls/Component.js', true, true, true);

			// remove the previous path-configs/resource-roots
			sap.ui.loader.config({
				paths: {
					"cool.name.space": null,
					"this/is/a/resourceRoot": null
				}
			});

			/** @deprecated */
			noSyncTest_afterEach.call(this, assert);
		}
	});

	function fnAssert(assert) {
		// resource roots now defined after component creation
		assert.equal(
			sap.ui.require.toUrl("this/is/a/resourceRoot"),
			"test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/resourceRoots/subfolder",
			"Resource-roots is now defined."
		);

		// sap.ui.model.odata.ODataModel
		sinon.assert.callCount(this.modelSpy.odataV2, 2);

		// model: "ODataModel"
		sinon.assert.calledWithExactly(this.modelSpy.odataV2.getCall(0), {
			serviceUrl: 'https://remote.system:9000/odata/service?sap-client=foo&sap-server=bar',
			metadataUrlParams: {"sap-language": "EN"},
			annotationURI: [
				'/path/to/odata/annotations/1?sap-language=EN&sap-client=foo',
				privateLoaderAPI.resolveURL('test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/annotations/2?sap-language=EN&sap-client=foo'),
				privateLoaderAPI.resolveURL('test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/another/name/space/annotations/3?sap-language=EN&sap-client=foo'),
				privateLoaderAPI.resolveURL('test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/cool/name/space/annotations/4.xml?sap-language=EN&sap-client=foo'),
				privateLoaderAPI.resolveURL('resources/unkown.name.space/annotations/5.xml?sap-language=EN&sap-client=foo'),
				privateLoaderAPI.resolveURL('resources/another/unkown/name/space/annotations/6.xml?sap-language=EN&sap-client=foo'),
				privateLoaderAPI.resolveURL('test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/resourceRoots/subfolder/annotations/file7.xml?sap-language=EN&sap-client=foo')
			],
			useBatch: false,
			refreshAfterChange: false
		});

		// model: "OtherODataModel"
		sinon.assert.calledWithExactly(this.modelSpy.odataV2.getCall(1), {
			serviceUrl: 'https://remote.system:9000/odata/service',
			useBatch: true,
			refreshAfterChange: true
		});
	}

	QUnit.test("ASYNC: Resolve annotation urls; Manifest first;", function(assert) {
		// stub uri parameters with sap-client and sap-server
		this.stubGetUriParameters();

		assert.equal(sap.ui.require.toUrl("this/is/a/resourceRoot"), "resources/this/is/a/resourceRoot", "Resource-roots not defined yet.");

		return Component.create({
			name: "sap.ui.test.v2models.ui5urls"
		}).then(function(oComponent) {
			this.oComponent = oComponent;
			fnAssert.call(this, assert);
		}.bind(this));
	});

	QUnit.test("ASYNC: Resolve annotation urls; Manifest last;", function(assert) {
		// stub uri parameters with sap-client and sap-server
		this.stubGetUriParameters();

		assert.equal(sap.ui.require.toUrl("this/is/a/resourceRoot"), "resources/this/is/a/resourceRoot", "Resource-roots not defined yet.");

		// manifest-last   =>   Component metadata says manifest: "json", so the manifest is loaded later
		// url resolution triggered during manifest init
		// Manifest model init is triggered afterwards during Component constructor, at this time all URLs have been resolved
		return Component.create({
			name: "sap.ui.test.v2models.ui5urls",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;
			fnAssert.call(this, assert);
		}.bind(this));
	});
});
