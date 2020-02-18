sap.ui.define([
	"jquery.sap.global",
	"sap/base/i18n/ResourceBundle",
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/xml/XMLModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/test/v2models/parent/CustomModel"
], function(jQuery, ResourceBundle, Log, Component) {

	"use strict";
	/*global sinon, QUnit*/

	// Re-assigning the 'XMLHttpRequest' property on the window in this strange way prevents Safari 12/13 (or WebKit)
	// from wrongly optimizing access. As the sinon fake server is only used in some parts of this test module Safari
	// might wrongly optimize the access (e.g. within jQuery) to override the fake server which fails those tests.
	window.XMLHttpRequest = window["XML" + "HttpRequest"];


	// used to get access to the non-public core parts
	var oRealCore;
	sap.ui.getCore().registerPlugin({
		startPlugin: function(oCore, bOnInit) {
			oRealCore = oCore;
		}
	});

	var Helper = {
		spyModels: function() {
			this.modelSpy = {
				odata: sinon.spy(sap.ui.model.odata, "ODataModel"),
				odataV2: sinon.spy(sap.ui.model.odata.v2, "ODataModel"),
				odataV4: sinon.spy(sap.ui.model.odata.v4, "ODataModel"),
				json: sinon.spy(sap.ui.model.json, "JSONModel"),
				xml: sinon.spy(sap.ui.model.xml, "XMLModel"),
				resource: sinon.spy(sap.ui.model.resource, "ResourceModel"),
				custom: sinon.spy(sap.ui.test.v2models.parent, "CustomModel")
			};
		},
		restoreModels: function() {
			if (this.modelSpy) {
				for (var sName in this.modelSpy) {
					if (this.modelSpy[sName] && this.modelSpy[sName].restore) {
						this.modelSpy[sName].restore();
					}
				}
				this.modelSpy = null;
			}
		},
		stubGetUriParameters: function(mMockParams) {
			var oGetParameterStub = sinon.stub();

			oGetParameterStub.withArgs('sap-client').returns(mMockParams && mMockParams.sapClient || 'foo');
			oGetParameterStub.withArgs('sap-server').returns(mMockParams && mMockParams.sapServer || 'bar');
			oGetParameterStub.withArgs('sap-system').returns(mMockParams && mMockParams.sapSystem);

			if (mMockParams && mMockParams["preload-component-models"]) {
				oGetParameterStub.withArgs('sap-ui-xx-preload-component-models').returns('true');
			}

			this.oGetUriParametersStub = sinon.stub(jQuery.sap, 'getUriParameters').returns({
				get: oGetParameterStub
			});

			var sSAPLanguage = sap.ui.getCore().getConfiguration().getSAPLogonLanguage();

			this.oConfigurationStub = sinon.stub(sap.ui.getCore().getConfiguration(), 'getSAPParam');
			this.oConfigurationStub.withArgs('sap-language').returns(mMockParams && mMockParams.sapLanguage || sSAPLanguage);
			this.oConfigurationStub.withArgs('sap-client').returns(mMockParams && mMockParams.sapClient || 'foo');
			this.oConfigurationStub.withArgs('sap-server').returns(mMockParams && mMockParams.sapServer || 'bar');
			this.oConfigurationStub.withArgs('sap-system').returns(mMockParams && mMockParams.sapSystem);
		},
		restoreGetUriParameters: function() {
			if (this.oGetUriParametersStub && this.oGetUriParametersStub.restore) {
				this.oGetUriParametersStub.restore();
				this.oGetUriParametersStub = null;
			}
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

			var oManifest = new sap.ui.core.Manifest(options.manifest, {
				componentName: "sap.ui.core.test.component.models",
				baseUrl: "./path/to/manifest/manifest.json",
				process: false
			});

			// deep clone is needed as manifest only returns a read-only copy (frozen object)
			var oManifestDataSources = jQuery.extend(true, {}, oManifest.getEntry("/sap.app/dataSources"));
			var oManifestModels = jQuery.extend(true, {}, oManifest.getEntry("/sap.ui5/models"));

			var oModelConfigurations = Component._createManifestModelConfigurations({
				dataSources: oManifestDataSources,
				models: oManifestModels,
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



	QUnit.module('default', {
		before: function() {
			// preload any used libraries / modules to avoid sync requests
			return Promise.all([
				sap.ui.getCore().loadLibraries([
					"sap.ui.commons", "sap.ui.layout", "sap.ui.unified"
				]),
				new Promise(function(resolve, reject) {
					sap.ui.require([
						"sap/ui/commons/Label",
						"sap/ui/core/CustomData",
						"sap/ui/core/CustomizingConfiguration",
						"sap/ui/core/mvc/XMLView",
						"sap/ui/core/routing/Router",
						"sap/ui/model/odata/ODataAnnotations"
					], function() {
						resolve();
					}, reject);
				})
			]);
		},
		beforeEach: function() {
			bindHelper.call(this);

			this.spyModels();
			this.oLogSpy = sinon.spy(Log, "error");
		},
		afterEach: function() {
			this.restoreModels();
			this.oLogSpy.restore();

			this.restoreGetUriParameters();
		}
	});

	QUnit.test("metadata v2 with dataSources", function(assert) {
		this.stubGetUriParameters();

		return Component.create({
			name: "sap.ui.test.v2models.parent",
			manifest: false
		}).then(function(oComponent) {

			this.oComponent = oComponent;

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
				synchronizationMode: "None"
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


			// jQuery.sap.log.error
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Missing \"type\" for model \"no-model-type\"", "[\"sap.ui5\"][\"models\"][\"no-model-type\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match("Class \"sap.ui.not.defined.Model\" for model \"missing-model-class\" could not be loaded."), "[\"sap.ui5\"][\"models\"][\"missing-model-class\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Class \"sap.ui.test.v2models.parent.ModelNotDefined\" for model \"model-not-found\" could not be found", "[\"sap.ui5\"][\"models\"][\"model-not-found\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: ODataAnnotation \"undefined\" for dataSource \"odata-invalid-annotations\" could not be found in manifest", "[\"sap.app\"][\"dataSources\"][\"undefined\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Missing \"uri\" for ODataAnnotation \"annotation-without-uri\"", "[\"sap.app\"][\"dataSources\"][\"annotation-without-uri\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: dataSource \"json\" was expected to have type \"ODataAnnotation\" but was \"JSON\"", "[\"sap.app\"][\"dataSources\"][\"json\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: dataSource \"invalid\" for model \"dataSource-invalid\" not found or invalid", "[\"sap.app\"][\"dataSources\"][\"invalid\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: dataSource \"does-not-exist\" for model \"dataSource-not-found\" not found or invalid", "[\"sap.app\"][\"dataSources\"][\"does-not-exist\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Provided OData version \"3.0\" in dataSource \"unknown-odataVersion\" for model \"v2-ODataModel-unknown-odataVersion\" is unknown. Falling back to default model type \"sap.ui.model.odata.v2.ODataModel\".", "[\"sap.app\"][\"dataSources\"][\"unknown-odataVersion\"]", this.oComponent.toString());


			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"": sap.ui.model.odata.v2.ODataModel,
				"default-with-annotations": sap.ui.model.odata.v2.ODataModel,
				"old-uri-syntax": sap.ui.model.odata.v2.ODataModel,
				"ODataModel": sap.ui.model.odata.ODataModel,
				"v2-ODataModel": sap.ui.model.odata.v2.ODataModel,
				"invalid-annotations": sap.ui.model.odata.v2.ODataModel,
				"v2-ODataModel-OtherOrigins": sap.ui.model.odata.v2.ODataModel,
				"ODataV4Model": sap.ui.model.odata.v4.ODataModel,
				"json": sap.ui.model.json.JSONModel,
				"json-relative": sap.ui.model.json.JSONModel,
				"json-relative-2": sap.ui.model.json.JSONModel,
				"xml": sap.ui.model.xml.XMLModel,
				"xml-relative": sap.ui.model.xml.XMLModel,
				"resourceBundle-name": sap.ui.model.resource.ResourceModel,
				"resourceBundle-legacy-uri": sap.ui.model.resource.ResourceModel,
				"custom-uri-string": sap.ui.test.v2models.parent.CustomModel,
				"custom-relative-uri-string": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-string-with-settings": sap.ui.test.v2models.parent.CustomModel,
				"custom-without-args": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-setting-name": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-setting-merge": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-setting-already-defined": sap.ui.test.v2models.parent.CustomModel
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

		}.bind(this));
	});

	QUnit.test("metadata v2 with sap-system URL parameter", function(assert) {
		this.stubGetUriParameters({ sapSystem: "BLA_123" });

		return Component.create({
			name: "sap.ui.test.v2models.parent",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// model: "ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odata, {
				serviceUrl: '/path/to/odata/service;o=BLA_123?sap-client=foo&sap-server=bar',
				annotationURI: [ '/path/to/odata/annotations/1', 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2'],
				useBatch: false,
				refreshAfterChange: false,
				json: true
			});

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
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo'
				],
				useBatch: true,
				refreshAfterChange: true,
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel" with multi origin annotations
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/multi/origin/annotations;o=BLA_123/?sap-client=foo&sap-server=bar',
				annotationURI: ["/path/to/other/odata/service;o=BLA_123/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
												"test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/other/odata/service;o=BLA_123/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
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
			name: "sap.ui.test.v2models.parent",
			manifest: false,
			componentData: {
				startupParameters: {
					"sap-system": "STARTUP456"
				}
			}
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// model: "ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odata, {
				serviceUrl: '/path/to/odata/service;o=STARTUP456?sap-client=foo&sap-server=bar',
				annotationURI: [ '/path/to/odata/annotations/1', 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2'],
				useBatch: false,
				refreshAfterChange: false,
				json: true
			});

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
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo'
				],
				useBatch: true,
				refreshAfterChange: true,
				metadataUrlParams: { "sap-language": "EN" }
			});

			// model: "v2-ODataModel" with multi origin annotations
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/odata/service/with/multi/origin/annotations;o=STARTUP456/?sap-client=foo&sap-server=bar',
				annotationURI: ["/path/to/other/odata/service;o=STARTUP456/Annotations(TechnicalName='%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE',Version='0001')/$value?sap-language=EN&sap-client=foo",
												"test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/other/odata/service;o=STARTUP456/Annotations%28TechnicalName=%27%2FIWBEP%2FTEA_TEST_ANNOTATION_FILE%27,Version=%270001%27%29/$value?sap-language=EN&sap-client=foo",
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
			name: "sap.ui.test.v2models.parent",
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

			// V1 ODataModel should not be affected by cache tokens
			// model: "ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odata, {
				serviceUrl: '/path/to/odata/service',
				annotationURI: [ '/path/to/odata/annotations/1', 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2'],
				useBatch: false,
				refreshAfterChange: false,
				json: true
			});

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
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2?sap-language=EN'
				],
				useBatch: true,
				refreshAfterChange: true
			});

			// model: "v2-ODataModel-SAPClient" with SAP client
			sinon.assert.calledWithExactly(this.modelSpy.odataV2.getCall(7), {
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
			name: "sap.ui.test.v2models.parent",
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

			// V1 ODataModel should not be affected by cache tokens
			// model: "ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odata, {
				serviceUrl: '/path/to/odata/service?sap-client=foo&sap-server=bar',
				annotationURI: [
					'/path/to/odata/annotations/1',
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2'
				],
				useBatch: false,
				refreshAfterChange: false,
				json: true
			});

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
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo&sap-context-token=1476971160'
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

	QUnit.test("metadata v2 with dataSources (extension inheritance)", function(assert) {
		this.stubGetUriParameters();

		return Component.create({
			name: "sap.ui.test.v2models.extension",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.odata.ODataModel
			sinon.assert.callCount(this.modelSpy.odata, 1);

			// model: "ODataModel"
			sinon.assert.calledWithExactly(this.modelSpy.odata, {
				serviceUrl: '/path/to/odata/service?sap-client=foo&sap-server=bar',
				annotationURI: [ '/path/to/odata/annotations/1', 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2' ],
				useBatch: true,
				skipMetadataAnnotationParsing: true,
				refreshAfterChange: false,
				json: true
			});


			// sap.ui.model.odata.v2.ODataModel
			sinon.assert.callCount(this.modelSpy.odataV2, 9);

			// model: "default-with-annotations"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/default/datasource?sap-client=foo&sap-server=bar',
				annotationURI: [
					'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/odata/annotations/2?sap-language=EN&sap-client=foo',
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

			// model: "v2-ODataModel-unknown-odataVersion"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/unknown/odataVersion?sap-client=foo&sap-server=bar',
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
			sinon.assert.calledWithExactly(this.modelSpy.xml, 'test-resources/sap/ui/core/qunit/component/testdata/v2models/parent/path/to/local/data.xml?sap-client=foo&sap-server=bar');

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


			// jQuery.sap.log.error
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Missing \"type\" for model \"no-model-type\"", "[\"sap.ui5\"][\"models\"][\"no-model-type\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match("Class \"sap.ui.not.defined.Model\" for model \"missing-model-class\" could not be loaded."), "[\"sap.ui5\"][\"models\"][\"missing-model-class\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Class \"sap.ui.test.v2models.parent.ModelNotDefined\" for model \"model-not-found\" could not be found", "[\"sap.ui5\"][\"models\"][\"model-not-found\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: ODataAnnotation \"undefined\" for dataSource \"odata-invalid-annotations\" could not be found in manifest", "[\"sap.app\"][\"dataSources\"][\"undefined\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Missing \"uri\" for ODataAnnotation \"annotation-without-uri\"", "[\"sap.app\"][\"dataSources\"][\"annotation-without-uri\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: dataSource \"json\" was expected to have type \"ODataAnnotation\" but was \"JSON\"", "[\"sap.app\"][\"dataSources\"][\"json\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: dataSource \"invalid\" for model \"dataSource-invalid\" not found or invalid", "[\"sap.app\"][\"dataSources\"][\"invalid\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: dataSource \"does-not-exist\" for model \"dataSource-not-found\" not found or invalid", "[\"sap.app\"][\"dataSources\"][\"does-not-exist\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Provided OData version \"3.0\" in dataSource \"unknown-odataVersion\" for model \"v2-ODataModel-unknown-odataVersion\" is unknown. Falling back to default model type \"sap.ui.model.odata.v2.ODataModel\".", "[\"sap.app\"][\"dataSources\"][\"unknown-odataVersion\"]", this.oComponent.toString());


			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"": sap.ui.model.odata.v2.ODataModel,
				"default-with-annotations": sap.ui.model.odata.v2.ODataModel,
				"old-uri-syntax": sap.ui.model.odata.v2.ODataModel,
				"ODataModel": sap.ui.model.odata.ODataModel,
				"v2-ODataModel": sap.ui.model.odata.v2.ODataModel,
				"invalid-annotations": sap.ui.model.odata.v2.ODataModel,
				"json": sap.ui.model.json.JSONModel,
				"json-relative": sap.ui.model.json.JSONModel,
				"json-relative-2": sap.ui.model.json.JSONModel,
				"xml": sap.ui.model.xml.XMLModel,
				"xml-relative": sap.ui.model.xml.XMLModel,
				"resourceBundle-name": sap.ui.model.resource.ResourceModel,
				"resourceBundle-legacy-uri": sap.ui.model.resource.ResourceModel,
				"custom-uri-string": sap.ui.test.v2models.parent.CustomModel,
				"custom-relative-uri-string": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-string-with-settings": sap.ui.test.v2models.parent.CustomModel,
				"custom-without-args": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-setting-name": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-setting-merge": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-setting-already-defined": sap.ui.test.v2models.parent.CustomModel
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

			// sap.ui.model.odata.ODataModel
			sinon.assert.callCount(this.modelSpy.odata, 0);
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

	QUnit.test("metadata v1 with models", function(assert) {
		this.stubGetUriParameters();

		return Component.create({
			name: "sap.ui.test.v1",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.odata.ODataModel
			sinon.assert.callCount(this.modelSpy.odata, 1);

			// model: "sfapi"
			sinon.assert.calledWithExactly(this.modelSpy.odata, {
				serviceUrl: 'test-resources/sap/ui/core/qunit/component/testdata/v1/some/odata/service',
				json: true
			});


			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 1);

			// model: "i18n"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/v1/i18n/i18n.properties"
			});

			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"i18n": sap.ui.model.resource.ResourceModel,
				"sfapi": sap.ui.model.odata.ODataModel
			});

			// destroy the component
			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			// check if internal models references were removed
			assert.ok(!this.oComponent._mManifestModels, "Component should not have internal model references anymore");

		}.bind(this));
	});

	QUnit.test("metadata v1 without models", function(assert) {

		return Component.create({
			name: "sap.ui.test.v1empty",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.odata.ODataModel
			sinon.assert.callCount(this.modelSpy.odata, 0);
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
				"ODataModel": sap.ui.model.odata.v2.ODataModel
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
				autoExpandSelect: false,
				odataVersion: "2.0",
				operationMode: "Server",
				synchronizationMode: "None"
			});

			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"ODataV2Consumption": sap.ui.model.odata.v4.ODataModel
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
				autoExpandSelect: false,
				odataVersion: "foo",
				operationMode: "Server",
				synchronizationMode: "None"
			});

		}.bind(this));
	});

	QUnit.module("metadata v2 with dataSources (empty inheritance)", {
		beforeEach: function() {
			bindHelper.call(this);

			this.spyModels();
			this.stubGetUriParameters();
			this.oLogSpy = sinon.spy(Log, "error");
		},
		afterEach: function() {
			this.restoreModels();
			this.restoreGetUriParameters();
			this.oLogSpy.restore();
		},
		assertAll: function(assert) {
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

			// model: "v2-ODataModel-unknown-odataVersion"
			sinon.assert.calledWithExactly(this.modelSpy.odataV2, {
				serviceUrl: '/path/to/unknown/odataVersion?sap-client=foo&sap-server=bar',
				metadataUrlParams: { "sap-language": "EN" }
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


			// jQuery.sap.log.error
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Missing \"type\" for model \"no-model-type\"", "[\"sap.ui5\"][\"models\"][\"no-model-type\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, sinon.match("Class \"sap.ui.not.defined.Model\" for model \"missing-model-class\" could not be loaded."), "[\"sap.ui5\"][\"models\"][\"missing-model-class\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Class \"sap.ui.test.v2models.parent.ModelNotDefined\" for model \"model-not-found\" could not be found", "[\"sap.ui5\"][\"models\"][\"model-not-found\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: ODataAnnotation \"undefined\" for dataSource \"odata-invalid-annotations\" could not be found in manifest", "[\"sap.app\"][\"dataSources\"][\"undefined\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Missing \"uri\" for ODataAnnotation \"annotation-without-uri\"", "[\"sap.app\"][\"dataSources\"][\"annotation-without-uri\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: dataSource \"json\" was expected to have type \"ODataAnnotation\" but was \"JSON\"", "[\"sap.app\"][\"dataSources\"][\"json\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: dataSource \"invalid\" for model \"dataSource-invalid\" not found or invalid", "[\"sap.app\"][\"dataSources\"][\"invalid\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: dataSource \"does-not-exist\" for model \"dataSource-not-found\" not found or invalid", "[\"sap.app\"][\"dataSources\"][\"does-not-exist\"]", this.oComponent.toString());
			sinon.assert.calledWithExactly(this.oLogSpy, "Component Manifest: Provided OData version \"3.0\" in dataSource \"unknown-odataVersion\" for model \"v2-ODataModel-unknown-odataVersion\" is unknown. Falling back to default model type \"sap.ui.model.odata.v2.ODataModel\".", "[\"sap.app\"][\"dataSources\"][\"unknown-odataVersion\"]", this.oComponent.toString());


			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"": sap.ui.model.odata.v2.ODataModel,
				"default-with-annotations": sap.ui.model.odata.v2.ODataModel,
				"old-uri-syntax": sap.ui.model.odata.v2.ODataModel,
				"ODataModel": sap.ui.model.odata.ODataModel,
				"v2-ODataModel": sap.ui.model.odata.v2.ODataModel,
				"invalid-annotations": sap.ui.model.odata.v2.ODataModel,
				"json": sap.ui.model.json.JSONModel,
				"json-relative": sap.ui.model.json.JSONModel,
				"json-relative-2": sap.ui.model.json.JSONModel,
				"xml": sap.ui.model.xml.XMLModel,
				"xml-relative": sap.ui.model.xml.XMLModel,
				"resourceBundle-name": sap.ui.model.resource.ResourceModel,
				"resourceBundle-legacy-uri": sap.ui.model.resource.ResourceModel,
				"custom-uri-string": sap.ui.test.v2models.parent.CustomModel,
				"custom-relative-uri-string": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-string-with-settings": sap.ui.test.v2models.parent.CustomModel,
				"custom-without-args": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-setting-name": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-setting-merge": sap.ui.test.v2models.parent.CustomModel,
				"custom-uri-setting-already-defined": sap.ui.test.v2models.parent.CustomModel
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
		beforeEach: function() {
			bindHelper.apply(this);

			this.spyModels();

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");

			// enable async preloading
			this.oldCfgPreload = oRealCore.oConfiguration.preload;
			oRealCore.oConfiguration.preload = "async";

			// unload not existing module to prevent different logs
			// depending on cached 404 response or not
			// (see "class-not-loaded" model in manifest below)
			jQuery.sap.unloadResources("sap/ui/sample/model/MyModel.js", false, true);

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
						},

						// This model should not get preloaded as the class is not declared and a warning should get logged
						// When creating the model on component init an error should get logged
						// but all other models should still be created
						"class-not-loaded": {
							"type": "sap.ui.sample.model.MyModel",
							"preload": true
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
		afterEach: function() {
			this.restoreModels();
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();
			this.oServer.restore();
			this.restoreGetUriParameters();
			oRealCore.oConfiguration.preload = this.oldCfgPreload;
			Component._fnLoadComponentCallback = null;
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
			assert.ok(this.modelSpy.resource.getCall(0).returnValue.getResourceBundle() instanceof Promise, "Promise should be available as async=true is set in manifest");

			assert.ok(this.modelSpy.resource.getCall(1).returnValue, "ResourceModel should be available");
			assert.ok(jQuery.sap.resources.isBundle(this.modelSpy.resource.getCall(1).returnValue.getResourceBundle()), "ResourceBundle should be available");

			// check error log for "class-not-loaded" model
			sinon.assert.calledWithExactly(this.oLogErrorSpy,
				sinon.match("Component Manifest: Class \"sap.ui.sample.model.MyModel\" for model \"class-not-loaded\" could not be loaded."),
				"[\"sap.ui5\"][\"models\"][\"class-not-loaded\"]",
				this.oComponent.toString());

			assert.ok(this.oComponent.getMetadata() instanceof sap.ui.core.UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(this.oComponent.getManifest(), "Manifest is available");
			assert.deepEqual(this.oComponent.getManifest(), this.oManifest, "Manifest matches the manifest behind manifestUrl");

			this.assertModelInstances({
				"odata1": sap.ui.model.odata.v2.ODataModel,
				"odata2": sap.ui.model.odata.v2.ODataModel,
				"odata3": sap.ui.model.odata.v2.ODataModel,
				"json1": sap.ui.model.json.JSONModel,
				"json2": sap.ui.model.json.JSONModel,
				"i18n1": sap.ui.model.resource.ResourceModel,
				"i18n2": sap.ui.model.resource.ResourceModel
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
			jQuerySapResourcesStub = sinon.stub(ResourceBundle, "create").callsFake(function(mConfig) {
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
				"odata1": sap.ui.model.odata.v2.ODataModel,
				"odata2": sap.ui.model.odata.v2.ODataModel,
				"odata3": sap.ui.model.odata.v2.ODataModel,
				"json1": sap.ui.model.json.JSONModel,
				"json2": sap.ui.model.json.JSONModel,
				"i18n1": sap.ui.model.resource.ResourceModel,
				"i18n2": sap.ui.model.resource.ResourceModel
			});

			this.oComponent.destroy();

			// check if all models got destroyed (uses the models from #assertModelInstances)
			this.assertModelsDestroyed();

			jQuerySapResourcesStub.restore();
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

			// check error log for "class-not-loaded" model
			sinon.assert.calledWithExactly(this.oLogErrorSpy,
				sinon.match("Component Manifest: Class \"sap.ui.sample.model.MyModel\" for model \"class-not-loaded\" could not be loaded."),
				"[\"sap.ui5\"][\"models\"][\"class-not-loaded\"]",
				this.oComponent.toString());

			assert.ok(this.oComponent.getMetadata() instanceof sap.ui.core.UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(this.oComponent.getManifest(), "Manifest is available");
			assert.deepEqual(this.oComponent.getManifest(), this.oManifest, "Manifest matches the manifest behind manifestUrl");

			this.assertModelInstances({
				"odata1": sap.ui.model.odata.v2.ODataModel,
				"odata2": sap.ui.model.odata.v2.ODataModel,
				"odata3": sap.ui.model.odata.v2.ODataModel,
				"json1": sap.ui.model.json.JSONModel,
				"json2": sap.ui.model.json.JSONModel,
				"i18n1": sap.ui.model.resource.ResourceModel,
				"i18n2": sap.ui.model.resource.ResourceModel
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
				"odata1": sap.ui.model.odata.v2.ODataModel,
				"odata2": sap.ui.model.odata.v2.ODataModel,
				"odata3": sap.ui.model.odata.v2.ODataModel,
				"json1": sap.ui.model.json.JSONModel,
				"json2": sap.ui.model.json.JSONModel,
				"i18n1": sap.ui.model.resource.ResourceModel,
				"i18n2": sap.ui.model.resource.ResourceModel
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

			// check warning log for "class-not-loaded" model
			sinon.assert.calledWithExactly(this.oLogWarningSpy,
				"Can not preload model \"class-not-loaded\" as required class has not been loaded: \"sap.ui.sample.model.MyModel\"",
				this.oManifest["sap.app"]["id"],
				"sap.ui.core.Component");

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

			// check warning log for "class-not-loaded" model
			sinon.assert.calledWithExactly(this.oLogWarningSpy,
				"Can not preload model \"class-not-loaded\" as required class has not been loaded: \"sap.ui.sample.model.MyModel\"",
				this.oManifest["sap.app"]["id"],
				"sap.ui.core.Component");

		}.bind(this));
	});

	QUnit.module("sap.ui.model.v2.ODataModel", {
		beforeEach: function() {
			bindHelper.apply(this);

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");

		},
		afterEach: function() {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();
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

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");

		},
		afterEach: function() {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();
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

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");

			this.stubGetUriParameters();
		},
		afterEach: function() {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();
			this.restoreGetUriParameters();
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

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");
		},
		afterEach: function() {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();
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
			"Component Manifest: Ignoring provided \"sap-context-token=1400000001\" for model \"\" (/foo). " +
			"Missing \"sap-client\" parameter",
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
			"Component Manifest: Ignoring provided \"sap-context-token=1400000002\" for ODataAnnotation \"Annotation1\" (/path/to/odata/annotation/1?sap-language=EN). " +
			"Missing \"sap-client\" URI parameter",
			"[\"sap.app\"][\"dataSources\"][\"Annotation1\"]",
			"sap.ui.core.test.component.models"
		);

		// Annotation2
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000003\" for ODataAnnotation \"Annotation2\" (path/to/local/odata/annotation/2?sap-language=EN). " +
			"Missing \"sap-client\" URI parameter",
			"[\"sap.app\"][\"dataSources\"][\"Annotation2\"]",
			"sap.ui.core.test.component.models"
		);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000001\" for model \"\" (/foo). " +
			"Missing \"sap-client\" parameter",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);

	});

	QUnit.module("sap.ui.model.v2.ODataModel (with cacheTokens / with sap-client/sap-server as URI Parameters)", {
		beforeEach: function() {
			bindHelper.apply(this);

			this.oLogErrorSpy = sinon.spy(Log, "error");
			this.oLogWarningSpy = sinon.spy(Log, "warning");

			this.stubGetUriParameters();
		},
		afterEach: function() {
			this.oLogErrorSpy.restore();
			this.oLogWarningSpy.restore();
			this.restoreGetUriParameters();
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
			"Component Manifest: Ignoring provided \"sap-context-token=1400000002\" for ODataAnnotation \"Annotation1\" (/path/to/odata/annotation/1?sap-client=888&sap-language=EN). " +
			"URI parameter \"sap-client=888\" must be identical with configuration \"sap-client=foo\"",
			"[\"sap.app\"][\"dataSources\"][\"Annotation1\"]",
			"sap.ui.core.test.component.models"
		);

		// Annotation2
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000003\" for ODataAnnotation \"Annotation2\" (path/to/local/odata/annotation/2?sap-client=777&sap-language=EN). " +
			"URI parameter \"sap-client=777\" must be identical with configuration \"sap-client=foo\"",
			"[\"sap.app\"][\"dataSources\"][\"Annotation2\"]",
			"sap.ui.core.test.component.models"
		);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000001\" for model \"\" (/foo?sap-client=999&sap-server=XXX). " +
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
			"Component Manifest: Ignoring provided \"sap-context-token=1400000001\" for model \"\" (/foo?sap-client=foo&sap-server=bar). " +
			"Parameter metadataUrlParams[\"sap-client\"] = \"999\" must be identical with configuration \"sap-client=foo\"",
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
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-context-token=1400000001&sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-context-token=1400000001&sap-client=foo&sap-server=bar",
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
			"Component Manifest: Ignoring provided \"sap-context-token=1400000001\" for model \"\" (/foo?sap-context-token=1400000001&sap-client=foo&sap-server=bar). " +
			"Model URI already contains parameter \"sap-context-token=1400000001\"",
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
								"sap-language": "EN"
							},
							"serviceUrl": "/foo?sap-context-token=1400000001&sap-client=foo&sap-server=bar"
						}
					],
					"type": "sap.ui.model.odata.v2.ODataModel",
					"uri": "/foo?sap-context-token=1400000001&sap-client=foo&sap-server=bar",
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
			"Component Manifest: Overriding existing \"sap-context-token=1400000002\" with provided value \"1400000222\" for ODataAnnotation \"Annotation1\" (/path/to/odata/annotation/1?sap-context-token=1400000002&sap-language=EN&sap-client=foo).",
			"[\"sap.app\"][\"dataSources\"][\"Annotation1\"]",
			"sap.ui.core.test.component.models"
		);

		// Annotation2
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Overriding existing \"sap-context-token=1400000003\" with provided value \"1400000333\" for ODataAnnotation \"Annotation2\" (path/to/local/odata/annotation/2?sap-context-token=1400000003&sap-language=EN&sap-client=foo).",
			"[\"sap.app\"][\"dataSources\"][\"Annotation2\"]",
			"sap.ui.core.test.component.models"
		);

		// Model (serviceUrl)
		sinon.assert.calledWithExactly(this.oLogWarningSpy,
			"Component Manifest: Ignoring provided \"sap-context-token=1400000111\" for model \"\" (/foo?sap-context-token=1400000001&sap-client=foo&sap-server=bar). " +
			"Model URI already contains parameter \"sap-context-token=1400000001\"",
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
			"Component Manifest: Overriding existing \"sap-context-token=1400000001\" with provided value \"1400000111\" for model \"\" (/foo?sap-client=foo&sap-server=bar).",
			"[\"sap.ui5\"][\"models\"][\"\"]",
			"sap.ui.core.test.component.models"
		);

	});
});