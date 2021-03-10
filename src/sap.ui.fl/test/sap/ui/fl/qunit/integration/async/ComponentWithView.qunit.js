/*global QUnit*/

QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/util/XMLHelper",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/XmlPreprocessorImpl",
	"sap/ui/core/cache/CacheManager",
	"sap/ui/layout/changeHandler/AddSimpleFormGroup",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Utils",
	"sap/ui/fl/initial/_internal/StorageUtils"
],
function(
	jQuery,
	XMLHelper,
	XmlTreeModifier,
	Component,
	Storage,
	XmlPreprocessorImpl,
	CacheManager,
	AddSimpleFormGroup,
	sinon,
	Utils,
	StorageUtils
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	sap.ui.getCore().loadLibrary("sap.ui.fl"); // preload lib for the spy

	var sAddedSimpleFormGroupId = "rootView--id-1504610195259-77";

	QUnit.module("Creation of the first change without a registered propagationListener", {
		beforeEach: function() {
			sandbox.stub(Storage, "loadFlexData").resolves(Object.assign(
				StorageUtils.getEmptyFlexDataResponse(),
				{
					changes: [{
						fileName: "id_1504610195273_78_addSimpleFormGroup",
						fileType: "change",
						changeType: "addSimpleFormGroup",
						reference: "sap.ui.fl.qunit.integration.async.testComponentWithView.Component",
						packageName: "$TMP",
						content: {
							group: {
								selector: {
									id: sAddedSimpleFormGroupId,
									idIsLocal: true
								},
								relativeIndex: 1
							}
						},
						selector: {
							id: "rootView--myForm",
							idIsLocal: true
						},
						layer: "CUSTOMER",
						texts: {
							groupLabel: {
								value: "New Group",
								type: "XFLD"
							}
						},
						namespace: "apps/sap.ui.demoapps.rta.freestyle/changes/",
						creation: "2017-09-05T11:16:46.701Z",
						originalLanguage: "EN",
						conditions: {},
						context: "",
						support: {
							generator: "Change.createInitialFileContent",
							service: "",
							user: "",
							sapui5Version: sap.ui.version
						},
						dependentSelector: {}
					}],
					contexts: [],
					settings: {
						isKeyUser: true,
						isAtoAvailable: false,
						isAtoEnabled: false,
						isProductiveSystem: false
					},
					etag: "MYETAG"
				})
			);
		},
		afterEach: function () {
			sandbox.restore();
			if (this.oComponent) {
				this.oComponent.destroy();
			}
		}
	}, function () {
		QUnit.test("applies the change after the recreation of the changed control", function (assert) {
			var oXmlPrepossessSpy = sandbox.spy(XmlPreprocessorImpl, "process");
			var oAddGroupChangeHandlerSpy = sandbox.spy(AddSimpleFormGroup, "applyChange");
			sandbox.stub(Utils, "isApplication").returns(true);

			return Component.create({
				name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
				id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
				manifest: true,
				componentData: {
					async: true,
					cacheKey: new Date().toString() //Needs to be different each time
				}
			}).then(function(oComponent) {
				this.oComponent = oComponent;
				return oComponent.oViewPromise;
			}.bind(this)).then(function(oView) {
				assert.ok(oView);
				assert.equal(oXmlPrepossessSpy.callCount, 1, "the xml processing was called once for the view");

				assert.equal(oAddGroupChangeHandlerSpy.callCount, 1, "the change handler was called only once");
				var oPassedModifier = oAddGroupChangeHandlerSpy.getCall(0).args[2].modifier;
				assert.equal(XmlTreeModifier, oPassedModifier, "the call was done with the xml tree modifier");
				oXmlPrepossessSpy.restore();
				oAddGroupChangeHandlerSpy.restore();
				this.oComponent.destroy();
				oView.destroy();
			}.bind(this));
		});

		if (!CacheManager._isSupportedEnvironment()) {
			QUnit.test("All further tests are skipped, as the CacheManager is not supported on the underlying environment (see assert)", function (assert) {
				assert.ok(true, "Environment: system [" + JSON.stringify(sap.ui.Device.system) + "],  browser: " + JSON.stringify(sap.ui.Device.browser));
			});
		} else {
			QUnit.test("working cache", function(assert) {
				var that = this;

				CacheManager.reset();

				var oXmlPrepossessSpy = sandbox.spy(XmlPreprocessorImpl, "process");

				// first create the application
				return Component.create({
					name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					manifest: true,
					componentData: {
						async: true,
						cacheKey: "X"
					}
				}).then(function(oComponent) {
					that.oComponent = oComponent;
					return oComponent.oViewPromise;
				}).then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 1, "the xml view was processed once");
					oView.destroy();
					that.oComponent.destroy();
				}).then(function() {
					// recreate the application from scratch (reload scenario)
					return Component.create({
						name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
						id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
						manifest: true,
						componentData: {
							async: true,
							cacheKey: "X" // same cache key
						}
					});
				}).then(function(oComponent) {
					that.oComponent = oComponent;
					return oComponent.oViewPromise;
				}).then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 1, "the view was cached so no further xml processing took place");
					oXmlPrepossessSpy.restore();
					oView.destroy();
				});
			});

			QUnit.test("cache invalidation", function(assert) {
				var that = this;

				CacheManager.reset();

				var oXmlPrepossessSpy = sandbox.spy(XmlPreprocessorImpl, "process");

				// first create the application
				return Component.create({
					name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					manifest: true,
					componentData: {
						async: true,
						cacheKey: "X"
					}
				}).then(function(oComponent) {
					that.oComponent = oComponent;
					return oComponent.oViewPromise;
				}).then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 1, "the xml view was processed once");
					oView.destroy();
					that.oComponent.destroy();
				}).then(function() {
					// recreate the application from scratch (reload scenario)
					return Component.create({
						name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
						id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
						manifest: true,
						componentData: {
							async: true,
							cacheKey: "Y" // different cache key
						}
					});
				}).then(function(oComponent) {
					that.oComponent = oComponent;
					return that.oComponent.oViewPromise;
				}).then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 2, "the view cache key changed and a new xml processing took place");
					oView.destroy();
					oXmlPrepossessSpy.restore();
				});
			});

			QUnit.test("a group is added and passed to the core/CacheManager", function(assert) {
				var oCacheManagerSpy;

				CacheManager.reset();

				var oSetCachePromise = new Promise(function(resolve) {
					var fCacheManagerSet = CacheManager.set;
					oCacheManagerSpy = sandbox.stub(CacheManager, "set").callsFake(function() {
						fCacheManagerSet.call(CacheManager, arguments[0], arguments[1]).then(function() {
							resolve();
						});
					});
				});
				var oAddGroupChangeHandlerSpy = sandbox.spy(AddSimpleFormGroup, "applyChange");

				return Component.create({
					name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					manifest: true,
					componentData: {
						async: true,
						cacheKey: "X"
					}
				}).then(function(oComponent) {
					this.oComponent = oComponent;
					return Promise.all([oComponent.oViewPromise, oSetCachePromise]);
				}.bind(this)).then(function(oView) {
					var oCacheManagerCall = oCacheManagerSpy.getCall(0);
					var sCachedXml = oCacheManagerCall.args[1].xml;
					//as cached xml string will vary in different browsers (especially namespace handling), we will parse the xml again (without tabs and newlines to reduce unwanted text nodes)
					var oCachedXmlDocument = XMLHelper.parse(sCachedXml.replace(/[\n\t]/g, '')).documentElement;
					assert.equal(oCachedXmlDocument.localName, "View", "the view is included in the cache");
					assert.equal(oCachedXmlDocument.childNodes[0].childNodes[0].localName, "SimpleForm", "the simple form is included in the cache");
					assert.equal(oCachedXmlDocument.childNodes[0].childNodes[0].childNodes.length, 4, "the simple form content includes the new nodes from the change");
					assert.equal(oCachedXmlDocument.childNodes[0].childNodes[0].childNodes[3].getAttribute("id"),
					"sap.ui.fl.qunit.integration.async.testComponentWithView---rootView--id-1504610195259-77",
					"the new title with the right id is cached");
					assert.ok(oCachedXmlDocument.childNodes[0].childNodes[0].attributes["custom.data.via.modifier:sap.ui.fl.appliedChanges.id_1504610195273_78_addSimpleFormGroup"],
					"the custom data marker that the change is applied is cached");
					assert.equal(oCachedXmlDocument.childNodes[0].childNodes[0].getAttribute("custom.data.via.modifier:sap.ui.fl.appliedChanges.id_1504610195273_78_addSimpleFormGroup"), "\\{\"groupId\":\"sap.ui.fl.qunit.integration.async.testComponentWithView---rootView--id-1504610195259-77\"\\}",
					"the custom data marker that the change is applied is cached");
					assert.ok(oAddGroupChangeHandlerSpy.calledOnce, "the change handler was called only once");
					var oPassedModifier = oAddGroupChangeHandlerSpy.getCall(0).args[2].modifier;
					assert.equal(XmlTreeModifier, oPassedModifier, "the call was done with the xml tree modifier");
					oAddGroupChangeHandlerSpy.restore();
					oView[0].destroy();
				});
			});

			QUnit.test("the cache is still valid in case the default control variant is overruled by a url parameter and stays the same in a further request", function(assert) {
				CacheManager.reset();
				var oXmlPrepossessSpy = sandbox.spy(XmlPreprocessorImpl, "process");

				var mSettings = {
					name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					async: true,
					manifestFirst: true,
					metadata: {
						manifest: "json"
					},
					componentData: {
						async: true,
						cacheKey: "X"
					}
				};

				sandbox.stub(Component.prototype, "getModel")
				.returns({
					getCurrentControlVariantIds: function () {
						return ["currentVariantReferenceInitial"];
					}
				});

				// first component instance
				return Component.create(mSettings)
				.then(function(oComponent) {
					this.oComponent = oComponent;
					return oComponent.oViewPromise;
				}.bind(this))
				.then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 1, "the xml view was processed once");
					oView.destroy();
					this.oComponent.destroy();
				}.bind(this))
				.then(Component.create.bind(Component, mSettings)) // second component instance
				.then(function(oComponent) {
					this.oComponent = oComponent;
					return this.oComponent.oViewPromise;
				}.bind(this))
				.then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 1, "the view was not processed again");
					oView.destroy();
				});
			});

			QUnit.test("the cache is invalidated in case the default control variant is overruled by a url parameter differing from the last one", function(assert) {
				CacheManager.reset();
				var oXmlPrepossessSpy = sandbox.spy(XmlPreprocessorImpl, "process");

				var mSettings = {
					name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					async: true,
					manifestFirst: true,
					metadata: {
						manifest: "json"
					},
					componentData: {
						async: true,
						cacheKey: "X"
					}
				};

				sandbox.stub(Component.prototype, "getModel")
				.onFirstCall().returns({
					getCurrentControlVariantIds: function () {
						return ["currentVariantReferenceInitial"];
					}
				})
				.onSecondCall().returns({
					getCurrentControlVariantIds: function () {
						return ["currentVariantReferenceChanged"];
					}
				});

				// first component instance
				return Component.create(mSettings)
				.then(function(oComponent) {
					this.oComponent = oComponent;
					return oComponent.oViewPromise;
				}.bind(this))
				.then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 1, "the xml view was processed once");
					oView.destroy();
					this.oComponent.destroy();
				}.bind(this))
				.then(Component.create.bind(Component, mSettings)) // second component instance
				.then(function(oComponent) {
					this.oComponent = oComponent;
					return this.oComponent.oViewPromise;
				}.bind(this)).then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 2, "the view was processed once more");
					oView.destroy();
				});
			});

			QUnit.test("the cache is invalidated in case the default control variant is no longer overruled by a url parameter", function(assert) {
				CacheManager.reset();
				var oXmlPrepossessSpy = sandbox.spy(XmlPreprocessorImpl, "process");

				var mSettings = {
					name: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					id: "sap.ui.fl.qunit.integration.async.testComponentWithView",
					async: true,
					manifestFirst: true,
					metadata: {
						manifest: "json"
					},
					componentData: {
						async: true,
						cacheKey: "X"
					}
				};

				sandbox.stub(Component.prototype, "getModel")
				.returns({
					getCurrentControlVariantIds: function () {
						return ["currentVariantReferenceInitial"];
					}
				});

				// first component instance
				return Component.create(mSettings)
				.then(function(oComponent) {
					this.oComponent = oComponent;
					return oComponent.oViewPromise;
				}.bind(this))
				.then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 1, "the xml view was processed once");
					Component.prototype.getModel.restore();
					oView.destroy();
					this.oComponent.destroy();
				}.bind(this))
				.then(Component.create.bind(Component, mSettings)) // second component instance
				.then(function(oComponent) {
					this.oComponent = oComponent;
					return this.oComponent.oViewPromise;
				}.bind(this))
				.then(function(oView) {
					assert.equal(oXmlPrepossessSpy.callCount, 2, "the view was processed once more");
					oView.destroy();
				});
			});
		}
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
