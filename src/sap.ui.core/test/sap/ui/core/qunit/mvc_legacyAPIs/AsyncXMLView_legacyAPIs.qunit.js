/*global QUnit, sinon */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/cache/CacheManager",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/VersionInfo",
	"../mvc/testdata/TestPreprocessor",
	"./AnyViewAsync_legacyAPIs.qunit",
	"sap/base/Log",
	"sap/base/strings/hash",
	"sap/base/util/LoaderExtensions"
], function(
	Localization,
	Cache,
	Component,
	Element,
	View,
	XMLView,
	VersionInfo,
	TestPreprocessor,
	asyncTestsuite,
	Log,
	hash,
	LoaderExtensions
) {
	"use strict";

	// setup test config with generic factory
	var oConfig = {
		type : "XML",
		receiveSource : function(source) {
			return new XMLSerializer().serializeToString(source);
		}
	};

	// set generic view factory
	oConfig.factory = function(bAsync) {
		return sap.ui.view({
			type : "XML",
			viewName : "testdata.mvc_legacyAPIs.Async",
			async : bAsync
		});
	};
	asyncTestsuite("Generic View Factory", oConfig);

	// set XMLView factory
	oConfig.factory = function(bAsync) {
		return sap.ui.xmlview({
			viewName : "testdata.mvc_legacyAPIs.Async",
			async : bAsync
		});
	};
	asyncTestsuite("XMLView Factory", oConfig);

	QUnit.module("Additional tests");

	// error
	QUnit.test("Error in template - no default aggregation defined", function(assert) {
		var sXml = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">',
				'	<m:Button>',
				'		<m:Error/>',
				'	</m:Button>',
				'</mvc:View>'
			].join(''),
			sError = "Error found in View (id: 'erroneous_view_1').\n" +
					"XML node: '<m:Error xmlns:m=\"sap.m\"/>':\n" +
					"Cannot add direct child without default aggregation defined for control sap.m.Button";
		var sId = "erroneous_view_1";

		return sap.ui.xmlview(sId, {async:true, viewContent:sXml}).loaded().catch(function(error) {
			assert.notOk(Element.getElementById(sId), "Must deregister an erroneous instance");
			assert.equal(error.message, sError, "Must reject with an error");
		});
	});

	QUnit.test("Error in template - text in aggregation", function(assert) {
		var sXml = [
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">',
			'	<m:Button>',
			'		Error',
			'	</m:Button>',
			'</mvc:View>'
			].join(''),
			sError = "Error found in View (id: 'erroneous_view_2').\n" +
					"XML node: '\t\tError\t':\n" +
					"Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed.";
		var sId = "erroneous_view_2";

		return sap.ui.xmlview(sId, {async:true, viewContent:sXml}).loaded().catch(function(error) {
			assert.notOk(Element.getElementById(sId), "Must deregister an erroneous instance");
			assert.equal(error.message, sError, "Must reject with an error");
		});
	});

	QUnit.test("Error in controller", function(assert) {
		var sXml = [
				'<mvc:View controllerName="example.mvc_legacyAPIs.test.error" xmlns:mvc="sap.ui.core.mvc">',
				'</mvc:View>'
			].join('');
		var sId = "erroneous_view_3";

		// define erroneous controller
		sap.ui.controller("example.mvc_legacyAPIs.test.error", {
			onInit: function() {
				throw new Error("Controller error");
			}
		});
		return sap.ui.xmlview(sId, {async:true, viewContent:sXml}).loaded().catch(function(error) {
			assert.notOk(Element.getElementById(sId), "Must deregister an erroneous instance");
			assert.equal(error.message, "Controller error", "Must reject with an error");
		});
	});

	QUnit.module("XMLView.create API");

	QUnit.test("Simple View + Databinding", function (assert) {
		var done = assert.async();
		sap.ui.require(["sap/ui/model/json/JSONModel"], function (JSONModel) {
			var oModel1 = new JSONModel({
				booleanValue : true,
				integerValue: "8015px",
				stringValue : 'Text1',
				data: {
					booleanValue : true,
					integerValue: 8015,
					stringValue : 'Text1'
				}
			});
			var oModel2 = new JSONModel({
				booleanValue : false,
				integerValue: "4711px",
				stringValue : '1txeT'
			});

			var xmlWithBindings = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">',
				'  <m:Button id="btn" enabled="{/booleanValue}" text="{/stringValue}" width="{/integerValue}" />',
				'</mvc:View>'
			].join('');

			XMLView.create({definition:xmlWithBindings}).then(function (oViewWithBindings1) {
				oViewWithBindings1.setModel(oModel1);
				assert.equal(oViewWithBindings1.byId("btn").getEnabled(), oModel1.getData().booleanValue, "Check 'enabled' property of button 'btn'");
				assert.equal(oViewWithBindings1.byId("btn").getText(), oModel1.getData().stringValue, "Check 'text' property of button 'btn'");
				assert.equal(oViewWithBindings1.byId("btn").getWidth(), oModel1.getData().integerValue, "Check 'width' property of button 'btn'");

				// same view with ID
				XMLView.create({id: "create", definition:xmlWithBindings}).then(function (oViewWithBindings2) {
					oViewWithBindings2.setModel(oModel2);
					assert.equal(oViewWithBindings2.byId("btn").getEnabled(), oModel2.getData().booleanValue, "Check 'enabled' property of button 'btn'");
					assert.equal(oViewWithBindings2.byId("btn").getText(), oModel2.getData().stringValue, "Check 'text' property of button 'btn'");
					assert.equal(oViewWithBindings2.byId("btn").getWidth(), oModel2.getData().integerValue, "Check 'width' property of button 'btn'");

					// check for correct ID handover
					assert.strictEqual(oViewWithBindings2.byId("create--btn"), oViewWithBindings2.byId("btn"), "Button is adressable by fully qualified ID");

					done();
				});
			});
		});
	});


	// ==== Cache-relevant test cases ===================================================

	function viewFactory(mCacheSettings, mPreprocessors) {
		return sap.ui.xmlview({
			viewName: "testdata.mvc.cache",
			async: true,
			id: "cachedView",
			preprocessors: mPreprocessors,
			cache: mCacheSettings
		});
	}

	function destroy(oView) {
		return XMLView.prototype.destroy.bind(oView);
	}

	// skip tests for unsupported browsers
	if (Cache._isSupportedEnvironment()) {

		var sLocation = window.location.host + window.location.pathname,
			sBuildTimeStamp = "12345";

		sinon.stub(VersionInfo, "load").returns(Promise.resolve({
			libraries: [{
				buildTimestamp: "12345"
			}]
		}));

		var getKeyParts = function(aKeys, sManifest, aUsedTerminologies) {
			var sUsedTerminologies = aUsedTerminologies ? aUsedTerminologies.join("_") + "_" : "";
			var sLanguageTag = Localization.getLanguageTag(),
				sHashCode = hash(sManifest || "");
			return "_" + sLanguageTag + "_" + sUsedTerminologies + sBuildTimeStamp + "_" + aKeys.join("_") + "(" + sHashCode + ")";
		};

		var calculateCacheKey = function(oComponent, oView, aKeys, aUsedTerminologies){
			return oComponent.getMetadata().getName() +  "_" + oView.getId() + getKeyParts(aKeys, JSON.stringify(oComponent.getManifest()), aUsedTerminologies);
		};

		QUnit.module("Cache API", {
			before: function() {
				return Cache.reset();
			},
			beforeEach: function() {
				this.oSpy = sinon.spy(Cache, "set");
			},
			afterEach: function() {
				this.oSpy.restore();
				Cache.reset();
			}
		});

		QUnit.test("simple cache key", function(assert) {
			var oSpy = this.oSpy, sKey = "key";
			assert.expect(1);
			return viewFactory({
				keys: [sKey]
			}).loaded().then(function(oView) {
				sinon.assert.calledWith(oSpy, sLocation + "_cachedView" + getKeyParts([sKey]));
				oView.destroy();
			});
		});

		QUnit.test("cache keys array", function(assert) {
			var oSpy = this.oSpy, sKey1 = "key1", sKey2 = "key2";
			assert.expect(1);
			return viewFactory({
				keys: [sKey1, Promise.resolve(sKey2)]
			}).loaded().then(function(oView) {
				sinon.assert.calledWith(oSpy, sLocation + "_cachedView" + getKeyParts([sKey1, sKey2]));
				oView.destroy();
			});
		});

		QUnit.test("no cache key - sync part", function(assert) {
			var error = new Error("No cache keys provided. At least one is required.");
			assert.expect(2);
			assert.throws(viewFactory.bind(null, "foo"), error, "invalid cache config");
			assert.throws(viewFactory.bind(null, {keys: []}), error, "empty array");
		});

		QUnit.test("no cache key - async part", function(assert) {
			var error = new Error("Provided cache keys may not be empty or undefined."),
				oSpy = this.oSpy,
				oLogSpy = sinon.spy(Log, "error");

			assert.expect(3);
			return viewFactory({keys: [Promise.resolve()]}).loaded().then(function(oView) {
				sinon.assert.calledWith(oLogSpy, error.message, "XMLViewCacheError", "sap.ui.core.mvc.XMLView");
				sinon.assert.calledWith(oLogSpy, "Processing the View without caching.", "sap.ui.core.mvc.XMLView");
				sinon.assert.notCalled(oSpy);
				oView.destroy();
				oLogSpy.restore();
			});
		});

		QUnit.test("cache key error", function(assert) {
			var error = new Error("Some Error"),
				oView = viewFactory({keys: [Promise.reject(error)]});

			assert.expect(1);
			return oView.loaded().catch(function(_error) {
				assert.equal(_error, error, "Loaded Promise should reject with the thrown error.");
				oView.destroy();
			});
		});

		QUnit.test("cache additional data", function(assert) {
			var oSpy = this.oSpy, aAdditionalData = ["foo"];
			var oLogSpy = sinon.spy(Log, "error");
			function _viewFactory() {
				return viewFactory({
					keys: ["key"],
					additionalData: aAdditionalData
				}, {
					xml: [{
						preprocessor: function(xml, oViewInfo, mSettings) {
							mSettings.additionalData.push("bar");
							return xml;
						},
						additionalData: aAdditionalData
					}]
				}).loaded();
			}

			assert.expect(3);
			return _viewFactory()
				.then(function(oView) {
					// check preprocessor side effect
					assert.deepEqual(oSpy.args[0][1].additionalData, ["foo", "bar"]);
					oView.destroy();
					// reset original data
					aAdditionalData = ["foo"];
				})
				.then(_viewFactory).then(function(oView) {
					// check replacement from cache
					assert.deepEqual(aAdditionalData, ["foo", "bar"]);
					assert.ok(oLogSpy.callCount === 1, "Deprecation error using a object reference");
					oLogSpy.restore();
					oView.destroy();
				});
		});

		QUnit.test("cache additional data provider", function(assert) {
			var oLogSpy = sinon.spy(Log, "error");
			var AdditionalDataClass = function() {
				this.foo = true;
			};
			var oAdditionalData = new AdditionalDataClass();

			var fnAdditionalDataProvider = {
				setAdditionalCacheData: function(vData) {
					oAdditionalData = vData[0];
					assert.ok(true, "Provide set was called");
				},
				getAdditionalCacheData: function() {
					assert.ok(true, "Provide get was called");
					return [oAdditionalData];
				}
			};

			function _viewFactory() {
				return XMLView.create({
					id: "myView",
					cache: {
						keys: ["key"],
						additionalData: fnAdditionalDataProvider

					},
					viewName: "testdata.mvc.cache",
					preprocessors: {
						xml: [{
							preprocessor: function(xml, oViewInfo, mSettings) {
								mSettings.additionalData[0].bar = true;
								return xml;
							},
							additionalData: [oAdditionalData]
						}]
					}
				});
			}

			assert.expect(7);
			return _viewFactory()
				.then(function(oView) {
					// check preprocessor side effect
					assert.ok(oAdditionalData.bar, "additionalData enhanced correctly");
					assert.ok(oAdditionalData.foo, "additionalData ok");
					oView.destroy();
					//reset data
					oAdditionalData = new AdditionalDataClass();
				})
				.then(_viewFactory).then(function(oView) {
					// check replacement from cache
					assert.ok(oAdditionalData.bar, "additionalData enhanced correctly");
					assert.ok(oAdditionalData.foo, "additionalData ok");
					assert.ok(oLogSpy.callCount === 0, "No Deprecation error logged");
					oLogSpy.restore();
					oView.destroy();
				});
		});


		QUnit.test("generic key parts", function(assert) {
			var oSpy = this.oSpy;
			var sKey = sLocation + "_cachedView" + getKeyParts(["key"]);
			assert.expect(1);
			return viewFactory({
				keys: ["key"]
			}).loaded().then(function(oView) {
				sinon.assert.calledWith(oSpy, sKey);
				oView.destroy();
			});
		});

		QUnit.test("Component integration", function(assert) {
			var oViewPromise, sKey = "key", oSpy = this.oSpy;
			function createView() {
				oViewPromise = viewFactory({
					keys: [sKey]
				});
				return oViewPromise;
			}
			new Component("comp").runAsOwner(createView.bind(this));
			return oViewPromise.loaded().then(function(oView) {
				var oComp = Component.getOwnerComponentFor(oView);
				assert.ok(oComp, "owner component is set");
				// add the components manifest stringified
				var sManifest = JSON.stringify(oComp.getManifest());
				sinon.assert.calledWith(oSpy, "sap.ui.core.Component_cachedView" + getKeyParts([sKey], sManifest));
				oView.destroy();
			});
		});

		QUnit.test("Preprocessor integration", function(assert) {
			var sKey = "key",
				oSpy = this.oSpy,
				oViewInfo = {
					name: "testdata.mvc.cache",
					componentId: undefined,
					id: "cachedView",
					caller: "Element sap.ui.core.mvc.XMLView#cachedView (testdata.mvc.cache)",
					sync: false
				};
			assert.expect(4);
			assert.ok(TestPreprocessor);
			// inject the preprocessor, ugly, but has to be done to place the spy
			View._mPreprocessors["XML"] = View._mPreprocessors["XML"] || {};
			View._mPreprocessors["XML"]["xml"] = View._mPreprocessors["XML"]["xml"] || [];
			View._mPreprocessors["XML"]["xml"].push({preprocessor: TestPreprocessor, _settings: {assert: function(){}}});
			var oGetCacheKeySpy = sinon.spy(TestPreprocessor, "getCacheKey");
			return viewFactory({keys: [sKey]}).loaded().then(function(oView) {
				sinon.assert.calledOnce(oGetCacheKeySpy);
				sinon.assert.calledWith(oGetCacheKeySpy, oViewInfo);
				// "foo" is the part coming from TestPreprocessor.js
				sinon.assert.calledWith(oSpy, sLocation + "_cachedView" + getKeyParts(["foo", sKey]));
				oSpy.restore();
				oView.destroy();
				// remove the preprocessor
				View._mPreprocessors["XML"]["xml"].splice(1,1);
			});
		});



		QUnit.module("Cache integration", {
			before: function() {
				return Cache.reset();
			},
			beforeEach: function() {
				this.oSpy = sinon.spy(LoaderExtensions, "loadResource");
			},
			afterEach: function() {
				this.oSpy.restore();
			}
		});

		QUnit.test("write to cache", function(assert) {
			var that = this, sKey = "key";
			assert.expect(4);
			return Cache.get(sLocation + "_cachedView" + getKeyParts([sKey])).then(function(oCachedResource) {
				assert.ok(!oCachedResource, "cache empty");
				return viewFactory({
					keys: [sKey]
				}).loaded().then(function(oView) {
					assert.ok(that.oSpy.calledWith("testdata/mvc/cache.view.xml"), "load resource called");
					assert.ok(oView.byId("Button2"), "controls created");
					return Cache.get(sLocation + "_cachedView" + getKeyParts([sKey])).then(function(oCachedResource) {
						assert.ok(oCachedResource, "cache filled");
					}).then(destroy(oView));
				});
			});
		});

		QUnit.test("read from cache", function(assert) {
			var that = this, sKey = "key";
			assert.expect(2);
			return viewFactory({
				keys: [sKey]
			}).loaded().then(function(oView) {
				oView.destroy();
				that.oSpy.resetHistory();
			}).then(function() {
				return viewFactory({
					keys: [sKey]
				}).loaded().then(function(oView) {
					assert.ok(!that.oSpy.calledWith("testdata/mvc/cache.view.xml"), "load resource not called");
					assert.ok(oView.byId("Button2"), "controls created");
					oView.destroy();
				});
			});
		});

		QUnit.module("Cache integration with terminologies", {
			before: function() {
				return Cache.reset();
			},
			beforeEach: function() {
				this.oSetCacheSpy = sinon.spy(Cache, "set");
			},
			afterEach: function() {
				this.oSetCacheSpy.resetHistory();
				this.oComponent.destroy();
			},
			after: function(){
				this.oSetCacheSpy.restore();
				return Cache.reset();
			}
		});

		QUnit.test("read from cache with terminologies", function(assert) {
			var done = assert.async();
			assert.expect(2);
			var sKey = "key1";
			var aUsedTerminologies = ["oil", "gas"];
			return Component.create({
				name: "testdata.mvc.terminologies",
				id: "terminologyComponent",
				activeTerminologies: aUsedTerminologies,
				manifest: false
			}).then(function (oComponent) {
				this.oComponent = oComponent;
				oComponent.getRootControl().loaded().then(function (oView) {
					assert.strictEqual(this.oSetCacheSpy.callCount, 1, "The Cache.set function should be called once");
					var sExpectedCacheKey = calculateCacheKey(oComponent, oView, [sKey], aUsedTerminologies);
					this.oSetCacheSpy.getCall(0).returnValue.then(function(){
						assert.strictEqual(this.oSetCacheSpy.getCall(0).args[0], sExpectedCacheKey, "The Cache.set should be called with the correct view cache key");
						done();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		});

	} else {

		QUnit.module("Cache integration - unsupported browser");

		QUnit.test("should not break", function(assert) {
			var sKey = "key";
			assert.expect(2);
			return viewFactory({
				keys: [sKey]
			}).loaded().then(function(oView1) {
				assert.ok(oView1.byId("Button2"), "controls created");
				oView1.destroy();
				return viewFactory({
					keys: [sKey]
				}).loaded().then(function(oView2) {
					assert.ok(oView2.byId("Button2"), "controls created");
					oView2.destroy();
				});
			});
		});

		QUnit.test("should not call the cache", function(assert) {
			var sKey = "key",
				oGetSpy = sinon.spy(Cache, "get"),
				oSetSpy = sinon.spy(Cache, "set");
			assert.expect(2);
			return viewFactory({
				keys: [sKey]
			}).loaded().then(function(oView1) {
				sinon.assert.notCalled(oGetSpy);
				sinon.assert.notCalled(oSetSpy);
				oGetSpy.restore();
				oSetSpy.restore();
			});
		});

	}
});
