sap.ui.define([
	"jquery.sap.global",
	"sap/base/i18n/Localization",
	"sap/ui/base/config/URLConfigurationProvider",
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
], function(jQuery, Localization, URLConfigurationProvider, Log, Component) {


	"use strict";
	/*global sinon, QUnit*/

	// Re-assigning the 'XMLHttpRequest' property on the window in this strange way prevents Safari 12/13 (or WebKit)
	// from wrongly optimizing access. As the sinon fake server is only used in some parts of this test module Safari
	// might wrongly optimize the access (e.g. within jQuery) to override the fake server which fails those tests.
	window.XMLHttpRequest = window["XML" + "HttpRequest"];


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
			var sSAPLanguage = Localization.getSAPLogonLanguage();

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


	QUnit.module("ui5:// URL resolution for local annotations", {
		before: function() {
			// preload any used libraries / modules to avoid sync requests
			return sap.ui.getCore().loadLibraries([
					"sap.ui.layout", "sap.ui.unified", "sap.m"
			]).then(function() {
				return new Promise(function(resolve, reject) {
					sap.ui.require([
						"sap/m/Label",
						"sap/ui/core/CustomData",
						"sap/ui/core/mvc/XMLView",
						"sap/ui/core/routing/Router",
						"sap/ui/model/odata/ODataAnnotations"
					], function() {
						resolve();
					}, reject);
				});
			});
		},
		beforeEach: function() {
			bindHelper.call(this);

			this.spyModels();
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
		afterEach: function() {
			this.restoreModels();
			this.oLogSpy.restore();

			this.oComponent.destroy();

			this.restoreGetUriParameters();

			// To keep reusing the same component for async and sync path tests,
			// we need to unload the Component and remove the leftovers from the ComponentMetadata.
			// This way all tests start fresh and actually load the Component again.
			sap.ui.loader._.unloadResources('sap/ui/test/v2models/ui5urls/Component.js', true, true, true);
			delete sap.ui.test.v2models.ui5Urls.Component.getMetadata()._oManifest;

			// remove the previous path-configs/resource-roots
			sap.ui.loader.config({
				paths: {
					"cool.name.space": null,
					"this/is/a/resourceRoot": null
				}
			});
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
				sap.ui.loader._.resolveURL('test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/annotations/2?sap-language=EN&sap-client=foo'),
				sap.ui.loader._.resolveURL('test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/another/name/space/annotations/3?sap-language=EN&sap-client=foo'),
				sap.ui.loader._.resolveURL('test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/cool/name/space/annotations/4.xml?sap-language=EN&sap-client=foo'),
				sap.ui.loader._.resolveURL('resources/unkown.name.space/annotations/5.xml?sap-language=EN&sap-client=foo'),
				sap.ui.loader._.resolveURL('resources/another/unkown/name/space/annotations/6.xml?sap-language=EN&sap-client=foo'),
				sap.ui.loader._.resolveURL('test-resources/sap/ui/core/qunit/component/testdata/v2models/ui5Urls/resourceRoots/subfolder/annotations/file7.xml?sap-language=EN&sap-client=foo')
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

	QUnit.test("SYNC: Resolve annotation urls; Manifest first;", function(assert) {
		// stub uri parameters with sap-client and sap-server
		this.stubGetUriParameters();

		assert.equal(sap.ui.require.toUrl("this/is/a/resourceRoot"), "resources/this/is/a/resourceRoot", "Resource-roots not defined yet.");

		this.oComponent = sap.ui.component({
			name: "sap.ui.test.v2models.ui5urls",
			manifest: true,
			async: false
		});

		fnAssert.call(this, assert);
	});

	QUnit.test("SYNC: Resolve annotation urls; Manifest last;", function(assert) {
		// stub uri parameters with sap-client and sap-server
		this.stubGetUriParameters();

		assert.equal(sap.ui.require.toUrl("this/is/a/resourceRoot"), "resources/this/is/a/resourceRoot", "Resource-roots not defined yet.");

		this.oComponent = sap.ui.component({
			name: "sap.ui.test.v2models.ui5urls"
		});

		fnAssert.call(this, assert);
	});

	QUnit.test("metadata v1 with models", function(assert) {
		this.stubGetUriParameters();

		return Component.create({
			name: "sap.ui.test.v1",
			manifest: false
		}).then(function(oComponent) {
			this.oComponent = oComponent;

			// sap.ui.model.resource.ResourceModel
			sinon.assert.callCount(this.modelSpy.resource, 1);

			// model: "i18n"
			sinon.assert.calledWithExactly(this.modelSpy.resource, {
				bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/v1/i18n/i18n.properties"
			});

			// check if models are set on component (and save them internally)
			this.assertModelInstances({
				"i18n": this.modelSpy.resource,
				"sfapi": this.modelSpy.odataV2
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

			/**
			 * @deprecated As of version 1.48
			 */
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
});