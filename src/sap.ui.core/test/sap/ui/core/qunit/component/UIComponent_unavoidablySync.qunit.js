sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Component, ManagedObject, ComponentContainer, Element, UIComponent, View, Log, nextUIUpdate) {

	"use strict";
	/*global sinon, QUnit*/

	// create content div
	var oDIV = document.createElement("div");
	oDIV.id = "content";
	document.body.appendChild(oDIV);

	QUnit.module("Basic UIComponent", {
		beforeEach: function() {

			// define the Component
			sap.ui.predefine("my/test/Component", ["sap/ui/core/UIComponent", "sap/m/Button"], function(UIComponent, Button) {

				return UIComponent.extend("my.test.Component", {

					createContent: function() {
						return new Button("theButton", {
							"text": "The Button"
						});
					}

				});

			});

			// define the Manifest
			this.oManifest = {
				"sap.app" : {
					"id" : "my.test"
				},
				"sap.ui5" : {}
			};

			// create the MockServer
			var oServer = this.oServer = sinon.fakeServer.create();
			oServer.xhr.supportCORS = true;
			oServer.xhr.useFilters = true;
			oServer.xhr.filters = [];
			oServer.xhr.addFilter(function(method, url) {
				return url !== "/anylocation/manifest.json?sap-language=EN";
			});
			oServer.autoRespond = true;

			// define a shorthand function to respond with a JSON object
			oServer.respondWithJSONContent = function(oContent) {
				this.respondWith("GET", "/anylocation/manifest.json?sap-language=EN", [
					200,
					{
						"Content-Type": "application/json"
					},
					JSON.stringify(oContent)
				]);
			};

		},

		afterEach: function() {

			this.oServer.restore();

		}

	});

	QUnit.test("UIComponent ID handling", function (assert) {

		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponent = sap.ui.component({
			id : "dummy",
			manifestUrl : "/anylocation/manifest.json"
		});

		var sPrefixedId = oComponent.createId("anyid");
		var sLocalId = oComponent.getLocalId(sPrefixedId);
		var sOtherId = oComponent.getLocalId("anyview---anyid");
		assert.equal(sPrefixedId, "dummy---anyid");
		assert.equal(sLocalId, "anyid");
		assert.equal(sOtherId, null);
		assert.ok(oComponent.isPrefixedId(sPrefixedId));
		assert.notOk(oComponent.isPrefixedId(sLocalId));

		oComponent.destroy();

	});

	QUnit.test("UIComponent initialization callback hook", function(assert) {

		this.oServer.respondWithJSONContent(this.oManifest);

		UIComponent._fnOnInstanceInitialized = function(oComponent) {
			assert.equal(oComponent.getId(), "myComponent", "Initialization hook was called!");
		};

		var oComponent = sap.ui.component({
			id : "myComponent",
			manifestUrl : "/anylocation/manifest.json"
		});

		delete UIComponent._fnOnInstanceInitialized;

		oComponent.destroy();

	});

	QUnit.test("UIComponent destruction callback hook", function(assert) {

		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponent = sap.ui.component({
			id : "myComponent",
			manifestUrl : "/anylocation/manifest.json"
		});

		UIComponent._fnOnInstanceDestroy = function(oComponent) {
			assert.equal(oComponent.getId(), "myComponent", "Destruction hook was called!");
		};

		oComponent.destroy();

		delete UIComponent._fnOnInstanceDestroy;

	});

	QUnit.test("UIComponent check for no autoPrefixId", async function(assert) {

		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponent = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		await nextUIUpdate();

		assert.equal(oComponent.getAutoPrefixId(), false, "AutoPrefixId is false!");

		var oButton = Element.getElementById("theButton");
		assert.ok(!!oButton, "Button was prefixed with Component id!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for autoPrefixId=true", async function(assert) {

		this.oManifest["sap.ui5"]["autoPrefixId"] = true;
		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponent = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		await nextUIUpdate();

		assert.equal(oComponent.getAutoPrefixId(), true, "AutoPrefixId is true!");

		var oButton = Element.getElementById(oComponent.createId("theButton"));
		assert.ok(!!oButton, "Button was prefixed with Component id!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for autoPrefixId=false", async function(assert) {

		this.oManifest["sap.ui5"]["autoPrefixId"] = false;
		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponent = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		await nextUIUpdate();

		assert.equal(oComponent.getAutoPrefixId(), false, "AutoPrefixId is false!");

		var oButton = Element.getElementById("theButton");
		assert.ok(!!oButton, "Button was not prefixed with Component id!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("forwarding RouterHashChanger to the creation of Router", function(assert) {
		this.oManifest["sap.ui5"]["routing"] = {
			routes: {
			}
		};
		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponentConstructorSpy = sinon.spy(ManagedObject.prototype, "applySettings");

		// scenario 1 - "_routerHashChanger"-property is being defined - via component load
		// the "_routerHashChanger"-property is being removed from the component settings
		var oRouterHashChanger = {};
		var oComponent1 = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json",
			settings: {
				_routerHashChanger: oRouterHashChanger
			}
		});

		var oRouter1 = oComponent1.getRouter();
		assert.strictEqual(oComponentConstructorSpy.callCount, 2, "The constructor was called");
		assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], {}, "The settings object of the constructor is empty");
		assert.deepEqual(oRouter1.getHashChanger(), oRouterHashChanger, "The RouterHashChanger is forwarded to the created Router");

		// destroy the component
		oComponent1.destroy();

		// scenario 2 - "_routerHashChanger"-property is set but with value undefined
		// the "_routerHashChanger"-property is being removed from the component settings
		var oComponent2 = new UIComponent("component1", {
			_routerHashChanger: undefined
		});

		var oRouter2 = oComponent2.getRouter();
		assert.strictEqual(oComponentConstructorSpy.callCount, 3, "The constructor was called");
		assert.deepEqual(oComponentConstructorSpy.getCall(2).args[0], {}, "The settings object of the constructor is empty");
		assert.strictEqual(oRouter2, undefined, "The router is undefined");

		// destroy the component
		oComponent2.destroy();

		// scenario 3 - "_routerHashChanger"-property is set but with value undefined - via component load
		// the "_routerHashChanger"-property is being removed however a new RouterHashChanger is being created
		var oComponent3 = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json",
			settings: {
				_routerHashChanger: undefined
			}
		});
		var oRouter3 = oComponent3.getRouter();
		assert.strictEqual(oComponentConstructorSpy.callCount, 5, "The constructor was called");
		assert.deepEqual(oComponentConstructorSpy.getCall(2).args[0], {}, "The settings object of the constructor is empty");
		assert.strictEqual(oRouter3.getHashChanger().getMetadata().getName(), "sap.ui.core.routing.RouterHashChanger","The RouterHashChanger is created by the Router");

		// destroy the component
		oComponent3.destroy();

		// remove the spy
		oComponentConstructorSpy.restore();
	});

	QUnit.module("UIComponent with rootView from Manifest", {
		beforeEach: function() {

			// define the Manifests
			var oManifestAutoId = {
				"sap.app" : {
					"id" : "my.own.autoid"
				},
				"sap.ui5" : {
					"rootView" : {
						"viewName" : "my.own.View",
						"type" : "XML"
					}
				}
			};
			var oManifestPrefixId = {
				"sap.app" : {
					"id" : "my.own.prefixId"
				},
				"sap.ui5" : {
					"rootView" : {
						"viewName" : "my.own.View",
						"type" : "XML",
						"id" : "theView"
					}
				}
			};

			var oManifestJSView = {
				"sap.ui5" : {
					"rootView" : {
						"async": true,
						"viewName" : "error.test.JSView_legacyAPIs",
						"type" : "JS"
					}
				}
			};

			var oManifestMissingViewType = {
				"sap.app" : {
					"id" : "my.own.missingViewType"
				},
				"sap.ui5" : {
					"rootView" : {
						"viewName" : "my.own.View",
						"id" : "theView"
						// type -> no view type given
					}
				}
			};

			var oManifestMissingViewTypeForTypedView = {
				"sap.app" : {
					"id" : "my.own.missingViewType"
				},
				"sap.ui5" : {
					"rootView" : {
						"viewName" : "module:my/own/TypedView",
						"id" : "theView"
						// type -> no view type given, ok since typed view is used
					}
				}
			};


			// define the XMLView
			var sXMLView = '\
				<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" \
						controllerName="my.own.Controller" xmlns:html="http://www.w3.org/1999/xhtml"> \
					<Button id="theButton" text="Hello World" press="doSomething"></Button> \
				</mvc:View> \
			';

			// create the MockServer (before defining the components to support loading by name!)
			var oServer = this.oServer = sinon.fakeServer.create();
			oServer.xhr.supportCORS = true;
			oServer.xhr.useFilters = true;
			oServer.xhr.filters = [];
			oServer.xhr.addFilter(function(method, url) {
				return (!/^\/anylocation\/autoid\/manifest\.json/.test(url) &&
						!/^\/anylocation\/missingViewType\/manifest\.json/.test(url) &&
						!/^\/anylocation\/missingViewTypeForTypedView\/manifest\.json/.test(url) &&
						!/^\/anylocation\/prefixid\/manifest\.json/.test(url) &&
						!/^\/anylocation\/mf1st\/autoid\/manifest\.json/.test(url) &&
						!/^\/anylocation\/mf1st\/prefixid\/manifest\.json/.test(url) &&
						!/^\/test-resources\/sap\/ui\/core\/qunit\/component\/testdata\/view\/manifest\.json/.test(url) &&
						url !== "/anylocation/View.view.xml");
			});
			oServer.autoRespond = true;

			// define the response the manifest.json for the autoid and prefixid
			oServer.respondWith("GET", /^\/anylocation\/autoid\/manifest\.json/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifestAutoId)
			]);
			oServer.respondWith("GET", /^\/anylocation\/prefixid\/manifest\.json/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifestPrefixId)
			]);
			oServer.respondWith("GET", /^\/anylocation\/missingViewType\/manifest\.json/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifestMissingViewType)
			]);
			oServer.respondWith("GET", /^\/anylocation\/missingViewTypeForTypedView\/manifest\.json/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifestMissingViewTypeForTypedView)
			]);

			// define the response for manifest.json for the manifest first test for autoid and prefixid
			oManifestAutoId["sap.app"].id = "my.own";
			oServer.respondWith("GET", /^\/anylocation\/mf1st\/autoid\/manifest\.json/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifestAutoId)
			]);
			oManifestPrefixId["sap.app"].id = "my.own";
			oServer.respondWith("GET", /^\/anylocation\/mf1st\/prefixid\/manifest\.json/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifestPrefixId)
			]);

			// define the response for the XMLView
			oServer.respondWith("GET", "/anylocation/View.view.xml", [
				200,
				{
					"Content-Type": "application/xml"
				},
				sXMLView
			]);

			oServer.respondWith("GET", /^\/test-resources\/sap\/ui\/core\/qunit\/component\/testdata\/view\/manifest\.json/, [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifestJSView)
			]);

			// define the Components
			sap.ui.loader.config({
				paths:{
					"my/own":"/anylocation",
					"error/test": "/test-resources/sap/ui/core/qunit/component/testdata/view/"
				}
			});
			sap.ui.predefine("my/own/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

				return UIComponent.extend("my.own.Component", {});

			});
			sap.ui.predefine("my/own/autoid/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

				return UIComponent.extend("my.own.autoid.Component", {
					metadata: {
						manifest: "json"
					}
				});

			});
			sap.ui.predefine("my/own/prefixid/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

				return UIComponent.extend("my.own.prefixid.Component", {
					metadata: {
						manifest: "json"
					}
				});

			});
			sap.ui.predefine("my/own/missingViewType/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

				return UIComponent.extend("my.own.missingViewType.Component", {
					metadata: {
						manifest: "json",
						interfaces: [
							"sap.ui.core.IAsyncContentCreation"
						]
					}
				});

			});

			sap.ui.predefine("error/test/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

				return UIComponent.extend("error.test.Component", {
					metadata: {
						manifest: "json"
					}
				});

			});

			// define a simple typed view
			sap.ui.predefine("my/own/TypedView", ["sap/ui/core/mvc/View", "sap/ui/core/Icon"], function(View, Icon) {
				return View.extend("my.own.TypedView", {
					createContent: function() {
						return [new Icon({src: "sap-icon://accept" })];
					}
				});
			});

			// defined the controller
			sap.ui.predefine("my/own/Controller.controller", ["sap/ui/core/mvc/Controller"], function(Controller) {

				return Controller.extend("my.own.Controller", {
					doSomething: function() {}
				});

			});

		},

		afterEach: function() {

			this.oServer.restore();

		}

	});

	QUnit.test("UIComponent that no error is logged for View-Types other than XML when processingMode is set", async function(assert) {
		var oSpy = sinon.spy(ManagedObject.prototype, "applySettings");

		var oComponent = sap.ui.component({
			name: "error.test"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		await nextUIUpdate();

		assert.ok(oSpy.calledWith({
			async: true,
			viewName: "error.test.JSView_legacyAPIs",
			type: "JS"
		}));

		oComponentContainer.destroy();
		oComponent.destroy();
		oSpy.restore();
	});

	QUnit.test("UIComponent check for not prefixing the views' auto id", async function(assert) {

		var oComponent = sap.ui.component({
			name: "my.own.autoid"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		await nextUIUpdate();

		var oRootControl = oComponent.getRootControl();
		assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
		assert.ok(!oRootControl.getId().startsWith(oComponent.getId()), "View id doesn't start with component id!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for not prefixing the views' auto id (manifest first)", async function(assert) {

		var oComponent = sap.ui.component({
			manifestUrl: "/anylocation/mf1st/autoid/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		await nextUIUpdate();

		var oRootControl = oComponent.getRootControl();
		assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
		assert.ok(!oRootControl.getId().startsWith(oComponent.getId()), "View id doesn't start with component id!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for prefixing view id", async function(assert) {

		var oComponent = sap.ui.component({
			name: "my.own.prefixid"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		await nextUIUpdate();

		var oRootControl = oComponent.getRootControl();
		assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
		assert.ok(oRootControl.getId().startsWith(oComponent.getId() + "---"), "View id starts with component id!");

		assert.ok(!!oComponent.byId("theView"), "View can be accessed with byId of Component!");
		assert.equal(oComponent.byId("theView").getId(), oComponent.createId("theView"), "View ID is prefixed with Component ID!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for prefixing view id (manifest first)", async function(assert) {

		var oComponent = sap.ui.component({
			manifestUrl: "/anylocation/mf1st/prefixid/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		await nextUIUpdate();

		var oRootControl = oComponent.getRootControl();
		assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
		assert.ok(oRootControl.getId().startsWith(oComponent.getId() + "---"), "View id starts with component id!");

		assert.ok(!!oComponent.byId("theView"), "View can be accessed with byId of Component!");
		assert.equal(oComponent.byId("theView").getId(), oComponent.createId("theView"), "View ID is prefixed with Component ID!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent - getRootControl returns the root view", function (assert) {
		var oComponent = sap.ui.component({
			manifestUrl: "/anylocation/mf1st/prefixid/manifest.json"
		});

		assert.strictEqual(oComponent.getRootControl(), oComponent.getAggregation("rootControl"));

		oComponent.destroy();
	});

	QUnit.module("Async loading of manifest modules before component instantiation", {
		before: function () {
			//sinon.config.useFakeTimers = false;
			this.requireSpy = sinon.spy(sap.ui, "require");
			this.logWarningSpy = sinon.spy(Log, "warning");
			this.oViewCreateSpy = sinon.spy(View, "create");
		},

		beforeEach : function() {
			sap.ui.loader.config({paths:{"manifestModules":"/manifestModules/"}});

			// Define Views
			var sXMLView1 = '<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc"\></mvc:View>';

			// Setup fake server
			var oServer = this.oServer = sinon.sandbox.useFakeServer();
			oServer.xhr.useFilters = true;
			oServer.xhr.filters = [];
			oServer.xhr.addFilter(function(method, url) {
				return (
					!/^\/manifestModules\/scenario\d+[a-z]*\/manifest.json\?sap-language=EN$/.test(url)
					&& url !== sap.ui.require.toUrl("someRootView.view.xml")
					&& url !== sap.ui.require.toUrl("someRootView.view.json")
					&& url !== sap.ui.require.toUrl("someRootViewNotExists.view.xml")
				);
			});
			oServer.autoRespond = true;

			// Respond data
			oServer.respondWith("GET", sap.ui.require.toUrl("someRootView.view.xml"), [
				200,
				{ "Content-Type": "application/xml" },
				sXMLView1
			]);
			oServer.respondWith("GET", sap.ui.require.toUrl("someRootViewNotExists.view.xml"), [
				404,
				{ "Content-Type": "text/html" },
				"not found"
			]);
			oServer.respondWith("GET", sap.ui.require.toUrl("someRootView.view.json"), [
				200,
				{ "Content-Type": "application/javascript" },
				"{}"
			]);
		},

		setRespondedManifest: function(manifest, scenario) {
			// Respond data
			this.oServer.respondWith("GET", "/manifestModules/" + scenario + "/manifest.json?sap-language=EN", [
				200,
				{ "Content-Type": "application/json" },
				JSON.stringify(manifest)
			]);
		},

		afterEach: function() {
			this.oServer.restore();
			this.requireSpy.resetHistory();
			this.logWarningSpy.resetHistory();
			this.oViewCreateSpy.resetHistory();
		},

		after: function() {
			//sinon.config.useFakeTimers = true;
			this.requireSpy.restore();
			this.logWarningSpy.restore();
			this.oViewCreateSpy.restore();
		}
	});

	// TODO: Test sync only because of view creation ==> remove or keep to cover specific scenario
	QUnit.test("Component with createContent returning view", function(assert) {
		assert.expect(6);
		var oManifest = {
			"sap.app" : {
				"id" : "app"
			}
		};
		this.setRespondedManifest(oManifest, "scenario9");

		sap.ui.predefine("manifestModules/scenario9/Component", ["sap/ui/core/UIComponent", "sap/ui/core/mvc/View"], function(UIComponent, View) {
			return UIComponent.extend("manifestModules.scenario9.Component", {
				metadata: {
					manifest: "json",
					interfaces: [
						"sap.ui.core.IAsyncContentCreation"
					]
				},
				constructor: function() {
					UIComponent.apply(this, arguments);
				},
				createContent: function() {
					return sap.ui.view({
						"viewName" : "testdata.view.MainAsync",
						"type" : "XML"
					});
				}
			});
		});

		return Component.create({
			name: "manifestModules.scenario9",
			manifest: true
		}).then(function(oComponent){
			var oView = oComponent.getRootControl();
			assert.ok(oComponent.getRootControl(), "root control created");
			assert.ok(oView, "view created");
			assert.ok(oView.getContent().length > 0, "view content created");
			assert.equal(this.oViewCreateSpy.callCount, 0, "async view factory is not called");

			return oView.byId("nestedView").loaded();
		}.bind(this)).catch(function() {
			assert.ok(false, "Modules could not be loaded and an error occured.");
		});
	});

	QUnit.module("catch up (async) rootView loaded promise", {
		before: function() {
			sap.ui.predefine("my/AsyncComponent/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend("my.AsyncComponent.Component", {
					metadata: {
						manifest: {
							"sap.ui5": {
								"rootView": {
									async: true, // Flag has no impact on JS rootView therefore view and dependencies are loaded sync
									viewName: "module:my/AsyncJSView"
								}
							}
						}
					}
				});
			});
			sap.ui.predefine("my/AsyncJSView", ["sap/ui/core/mvc/View", "sap/m/Panel"], function(View, Panel) {
				return View.extend("my.AsyncJSView", {
					createContent: function() {
						return Promise.resolve(
							new Panel({id: this.createId("myPanel")})
						);
					}
				});
			});
		}
	});

	QUnit.test("Component should resolve with completed (async) rootView", function(assert) {
		assert.expect(2);
		return Component.create({
			name: "my.AsyncComponent",
			manifest: false
		}).then(function(oComponent) {
			assert.ok(oComponent.getRootControl().isA("sap.ui.core.mvc.View"), "root view created");
			assert.ok(oComponent.getRootControl().byId("myPanel"), "View content created on Component resolve");
		});
	});
});


