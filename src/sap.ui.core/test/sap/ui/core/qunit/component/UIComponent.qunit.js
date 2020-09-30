sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Component",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/ui/core/UIComponentMetadata",
	"sap/base/Log"
], function(jQuery, Component, ManagedObject, ComponentContainer, UIComponent, UIComponentMetadata, Log) {

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

	QUnit.test("UIComponent check for no autoPrefixId", function(assert) {

		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponent = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		sap.ui.getCore().applyChanges();

		assert.equal(oComponent.getAutoPrefixId(), false, "AutoPrefixId is false!");

		var oButton = sap.ui.getCore().byId("theButton");
		assert.ok(!!oButton, "Button was prefixed with Component id!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for autoPrefixId=true", function(assert) {

		this.oManifest["sap.ui5"]["autoPrefixId"] = true;
		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponent = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		sap.ui.getCore().applyChanges();

		assert.equal(oComponent.getAutoPrefixId(), true, "AutoPrefixId is true!");

		var oButton = sap.ui.getCore().byId(oComponent.createId("theButton"));
		assert.ok(!!oButton, "Button was prefixed with Component id!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for autoPrefixId=false", function(assert) {

		this.oManifest["sap.ui5"]["autoPrefixId"] = false;
		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponent = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		sap.ui.getCore().applyChanges();

		assert.equal(oComponent.getAutoPrefixId(), false, "AutoPrefixId is false!");

		var oButton = sap.ui.getCore().byId("theButton");
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
		assert.strictEqual(oRouter1.getHashChanger(), oRouterHashChanger, "The RouterHashChanger is forwarded to the created Router");

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

	QUnit.test("forwarding propagateTitle to the creation of Router", function(assert) {
		this.oManifest["sap.ui5"]["routing"] = {
			routes: {
			}
		};
		this.oServer.respondWithJSONContent(this.oManifest);

		var oComponentConstructorSpy = sinon.spy(ManagedObject.prototype, "applySettings");

		// _propagateTitle is true
		var oComponent1 = new UIComponent("component1", {
			_propagateTitle: true
		});

		// _propagateTitle is false
		var oComponent2 = new UIComponent("component2", {
			_propagateTitle: false
		});

		// _propagateTitle is undefined
		var oComponent3 = new UIComponent("component3", {
			_propagateTitle: undefined
		});

		assert.strictEqual(oComponentConstructorSpy.callCount, 3, "The constructor should be called three times");
		assert.strictEqual(oComponent1._bRoutingPropagateTitle, true, "The propagateTitle flag should be stored successfully in the component");
		assert.deepEqual(oComponentConstructorSpy.getCall(0).args[0], {}, "The settings object of the constructor should be empty");
		assert.strictEqual(oComponent2._bRoutingPropagateTitle, false, "The propagateTitle flag should be stored successfully in the component");
		assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], {}, "The settings object of the constructor should be empty");
		assert.strictEqual(oComponent3._bRoutingPropagateTitle, undefined, "The propagateTitle flag should be stored successfully in the component");
		assert.deepEqual(oComponentConstructorSpy.getCall(2).args[0], {}, "The settings object of the constructor should be empty");

		// destroy the components
		oComponent1.destroy();
		oComponent2.destroy();
		oComponent3.destroy();

		oComponentConstructorSpy.resetHistory();

		var done = assert.async();

		// _propagateTitle is true - via component load
		Component.create({
			id: "component1b",
			manifest : "/anylocation/manifest.json",
			settings: {
				_propagateTitle: true
			}
		}).then(function(oComponent){
			assert.strictEqual(oComponentConstructorSpy.callCount, 2, "The component constructor and the button constructor should be called once");
			assert.strictEqual(oComponent._bRoutingPropagateTitle, true, "The propagateTitle flag should be stored successfully in the component");
			assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], {id: "component1b"}, "The settings object of the constructor should contains only the id, the propagateTitle flag should be removed from the settings");

			oComponent.destroy();
			oComponentConstructorSpy.resetHistory();

			// _propagateTitle is false - via component load
			Component.create({
				id: "component2b",
				manifest : "/anylocation/manifest.json",
				settings: {
					_propagateTitle: false
				}
			}).then(function(oComponent){
				assert.strictEqual(oComponentConstructorSpy.callCount, 2, "The component constructor and the button constructor should be called once");
				assert.strictEqual(oComponent._bRoutingPropagateTitle, false, "The propagateTitle flag should be stored successfully in the component");
				assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], {id: "component2b"}, "The settings object of the constructor should contains only the id, the propagateTitle flag should be removed from the settings");

				oComponent.destroy();
				oComponentConstructorSpy.resetHistory();

				// _propagateTitle is undefined - via component load
				Component.create({
					id: "component3b",
					manifest : "/anylocation/manifest.json",
					settings: {
						_propagateTitle: undefined
					}
				}).then(function(oComponent){
					assert.strictEqual(oComponentConstructorSpy.callCount, 2, "The component constructor and the button constructor should be called once");
					assert.strictEqual(oComponent._bRoutingPropagateTitle, undefined, "The propagateTitle flag should be stored successfully in the component");
					assert.deepEqual(oComponentConstructorSpy.getCall(1).args[0], {id: "component3b"}, "The settings object of the constructor should contains only the id, the propagateTitle flag should be removed from the settings");
					oComponent.destroy();

					done();

					// remove the spy
					oComponentConstructorSpy.restore();
				});
			});
		});
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
						"viewName" : "error.test.JSView",
						"type" : "JS"
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

			sap.ui.predefine("error/test/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

				return UIComponent.extend("error.test.Component", {
					metadata: {
						manifest: "json"
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

	QUnit.test("UIComponent that no error is logged for View-Types other than XML when processingMode is set", function(assert) {
		var oSpy = sinon.spy(ManagedObject.prototype, "applySettings");

		var oComponent = sap.ui.component({
			name: "error.test"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		sap.ui.getCore().applyChanges();

		assert.ok(oSpy.calledWith({
			async: true,
			viewName: "error.test.JSView",
			type: "JS"
		}));

		oComponentContainer.destroy();
		oComponent.destroy();
		oSpy.restore();
	});

	QUnit.test("UIComponent check for not prefixing the views' auto id", function(assert) {

		var oComponent = sap.ui.component({
			name: "my.own.autoid"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		sap.ui.getCore().applyChanges();

		var oRootControl = oComponent.getRootControl();
		assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
		assert.ok(!jQuery.sap.startsWith(oRootControl.getId(), oComponent.getId()), "View id doesn't start with component id!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for not prefixing the views' auto id (manifest first)", function(assert) {

		var oComponent = sap.ui.component({
			manifestUrl: "/anylocation/mf1st/autoid/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		sap.ui.getCore().applyChanges();

		var oRootControl = oComponent.getRootControl();
		assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
		assert.ok(!jQuery.sap.startsWith(oRootControl.getId(), oComponent.getId()), "View id doesn't start with component id!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for prefixing view id", function(assert) {

		var oComponent = sap.ui.component({
			name: "my.own.prefixid"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		sap.ui.getCore().applyChanges();

		var oRootControl = oComponent.getRootControl();
		assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
		assert.ok(jQuery.sap.startsWith(oRootControl.getId(), oComponent.getId() + "---"), "View id starts with component id!");

		assert.ok(!!oComponent.byId("theView"), "View can be accessed with byId of Component!");
		assert.equal(oComponent.byId("theView").getId(), oComponent.createId("theView"), "View ID is prefixed with Component ID!");

		oComponentContainer.destroy();
		oComponent.destroy();

	});

	QUnit.test("UIComponent check for prefixing view id (manifest first)", function(assert) {

		var oComponent = sap.ui.component({
			manifestUrl: "/anylocation/mf1st/prefixid/manifest.json"
		});

		var oComponentContainer = new ComponentContainer({
			component: oComponent
		}).placeAt("content");

		sap.ui.getCore().applyChanges();

		var oRootControl = oComponent.getRootControl();
		assert.equal(oRootControl.getViewName(), "my.own.View", "The correct view is displayed!");
		assert.ok(jQuery.sap.startsWith(oRootControl.getId(), oComponent.getId() + "---"), "View id starts with component id!");

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

	sap.ui.require(["sap/ui/core/UIComponent", "sap/m/Button"], function (UIComponent, Button) {
		QUnit.test("UIComponent - getRootControl returns null before init", function (assert) {
			var oRootControlBeforeInit,
				oRootControlAfterInit,
				oCreatedContent;

			var MyExtension = UIComponent.extend("my.getRootControl.Component", {
				init: function () {
					oRootControlBeforeInit = this.getRootControl();
					UIComponent.prototype.init.apply(this, arguments);
					oRootControlAfterInit = this.getRootControl();
				},

				createContent: function() {
					oCreatedContent = new Button({
						"text": "The Button"
					});
					return oCreatedContent;
				}

			});

			var oComponent = new MyExtension();

			var oComponent2 = new UIComponent();
			assert.strictEqual(oRootControlBeforeInit, null);
			assert.strictEqual(oRootControlAfterInit, oCreatedContent);
			// no create content
			assert.strictEqual(oComponent2.getRootControl(), null);

			oComponent.destroy();
			oComponent2.destroy();
		});
	});

	QUnit.module("Async loading of manifest modules before component instantiation", {
		before: function () {
			//sinon.config.useFakeTimers = false;
			this.requireSpy = sinon.spy(sap.ui, "require");
			this.logWarningSpy = sinon.spy(Log, "warning");
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
					!/^\/manifestModules\/scenario\d+\/manifest.json\?sap-language=EN$/.test(url)
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
			this.requireSpy.reset();
			this.logWarningSpy.reset();
		},

		after: function() {
			//sinon.config.useFakeTimers = true;
			this.requireSpy.restore();
			this.logWarningSpy.restore();
		}
	});

	QUnit.test("Check if all resources were loaded", function(assert) {
		var oManifest = {
			"sap.app" : {
				"id" : "app"
			},
			"sap.ui5": {
				"rootView": {
					"viewName": "someRootView",
					"type": "JSON",
					"id": "app"
				},
				"models": {
					"i18n": {
						"type": "sap.ui.model.resource.ResourceModel",
						"uri": "i18n/i18n.properties"
					},
					"odm1": {
						"type": "sap.ui.model.odata.ODataModel",
						"uri": "./some/odata/service"
					},
					"odm2": {
						"type": "sap.ui.model.odata.v2.ODataModel",
						"uri": "./some/odata/service"
					}
				},
				"routing": {
					"config": {
						"viewType": "XML",
						"controlId": "app"
					},
					"routes": [
						{
							"pattern": "",
							"name": "overview",
							"target": "overview"
						}
					]
				}
			}
		};
		this.setRespondedManifest(oManifest, "scenario1");

		var requireSpy = this.requireSpy;
		sap.ui.define("manifestModules/scenario1/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
			return UIComponent.extend("manifestModules.scenario1.Component", {
				metadata: {
					manifest: "json"
				},
				constructor: function() {
					assert.ok(requireSpy.calledWith(["sap/ui/core/mvc/JSONView"]), "JSONView type required");
					assert.ok(requireSpy.calledWith(["sap/ui/model/resource/ResourceModel"]), "ResourceModel required");
					assert.ok(requireSpy.calledWith(["sap/ui/core/routing/Router"]), "Router loaded");
					assert.ok(requireSpy.calledWith(["sap/ui/model/odata/ODataModel"]), "ODataModel required");
					assert.ok(requireSpy.calledWith(["sap/ui/model/odata/v2/ODataModel"]), "ODataModel v2 required");

					assert.ok(jQuery.sap.isResourceLoaded("sap/ui/core/mvc/JSONView.js"), "JSONView type loaded");
					assert.ok(jQuery.sap.isResourceLoaded("sap/ui/model/resource/ResourceModel.js"), "ResourceModel loaded");
					assert.ok(jQuery.sap.isResourceLoaded("sap/ui/core/routing/Router.js"), "Router loaded");
					assert.ok(jQuery.sap.isResourceLoaded("sap/ui/model/odata/ODataModel.js"), "ODataModel loaded");
					assert.ok(jQuery.sap.isResourceLoaded("sap/ui/model/odata/v2/ODataModel.js"), "ODataModel v2 loaded");

					UIComponent.apply(this, arguments);
				}
			});
		});

		return sap.ui.component({
			name: "manifestModules.scenario1",
			manifest: true
		}).then(function(oInstance) {
			// console.error("instance here", oInstance);
		});
	});

	QUnit.test("Check if custom router class was loaded", function(assert) {
		var oManifest = {
			"sap.app" : {
				"id" : "app"
			},
			"sap.ui5": {
				"routing": {
					"config": {
						"routerClass": "someCustomRouter",
						"viewType": "XML",
						"controlId": "app"
					},
					"routes": [
						{
							"pattern": "",
							"name": "overview",
							"target": "overview"
						}
					]
				}
			}
		};
		this.setRespondedManifest(oManifest, "scenario2");

		var requireSpy = this.requireSpy;
		sap.ui.predefine("manifestModules/scenario2/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
			return UIComponent.extend("manifestModules.scenario2.Component", {
				metadata: {
					manifest: "json"
				},
				constructor: function() {
					assert.ok(requireSpy.calledWith(["someCustomRouter"]), "Custom Router required");
					assert.ok(jQuery.sap.isResourceLoaded("someCustomRouter.js"), "Custom Router loaded");
					UIComponent.apply(this, arguments);
				}
			});
		});
		sap.ui.predefine("someCustomRouter", ['sap/ui/core/routing/Router'], function(Router) {
			return Router.extend("someCustomRouter", {});
		});

		return sap.ui.component({
			name: "manifestModules.scenario2",
			manifest: true
		});
	});

	QUnit.test("Check if ViewType of root view (provided as string) was loaded", function(assert) {
		var oManifest = {
			"sap.app" : {
				"id" : "app"
			},
			"sap.ui5": {
				"rootView": "someRootView"
			}
		};
		this.setRespondedManifest(oManifest, "scenario3");

		var requireSpy = this.requireSpy;
		sap.ui.predefine("manifestModules/scenario3/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
			return UIComponent.extend("manifestModules.scenario3.Component", {
				metadata: {
					manifest: "json"
				},
				constructor: function() {
					assert.ok(requireSpy.calledWith(["sap/ui/core/mvc/XMLView"]), "XMLView type required");
					assert.ok(jQuery.sap.isResourceLoaded("sap/ui/core/mvc/XMLView.js"), "XMLView type loaded");
					UIComponent.apply(this, arguments);
				}
			});
		});

		return sap.ui.component({
			name: "manifestModules.scenario3",
			manifest: true
		});
	});

	QUnit.test("Check if modules could not be loaded and a warning was logged", function(assert) {
		assert.expect(3);
		var oManifest = {
			"sap.app" : {
				"id" : "app"
			},
			"sap.ui5": {
				"models": {
					"odm1": {
						"type": "sap.ui.model.odata.ODataModelNotExists",
						"uri": "./some/odata/service"
					}
				},
				"routing": {
					"config": {
						"routerClass": "someRouterNotExists",
						"viewType": "XML",
						"controlId": "app"
					},
					"routes": [
						{
							"pattern": "",
							"name": "overview",
							"target": "overview"
						}
					]
				}
			}
		};
		this.setRespondedManifest(oManifest, "scenario4");

		var logWarningSpy = this.logWarningSpy;
		sap.ui.predefine("manifestModules/scenario4/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
			return UIComponent.extend("manifestModules.scenario4.Component", {
				metadata: {
					manifest: "json"
				},
				constructor: function() {
					assert.ok(logWarningSpy.calledWith('Can not preload module "sap/ui/model/odata/ODataModelNotExists". This will most probably cause an error once the module is used later on.'), "Model not found");
					assert.ok(logWarningSpy.calledWith('Can not preload module "someRouterNotExists". This will most probably cause an error once the module is used later on.'), "Router not found");
					UIComponent.apply(this, arguments);
				}
			});
		});

		return sap.ui.component({
			name: "manifestModules.scenario4",
			manifest: true
		}).catch(function() {
			assert.ok(true, "Modules could not be loaded and an error occured.");
		});
	});
});
