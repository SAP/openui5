sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/ui/core/UIComponentMetadata"
], function(jQuery, ComponentContainer, UIComponent, UIComponentMetadata) {

	"use strict";
	/*global sinon, QUnit*/

	QUnit.module("Basic UIComponent", {
		beforeEach: function() {

			// define the Component
			sap.ui.define("my/test/Component", ["sap/ui/core/UIComponent", "sap/m/Button"], function(UIComponent, Button) {

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

			// define the Components
			jQuery.sap.registerModulePath("my.own", "/anylocation");
			sap.ui.define("my/own/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

				return UIComponent.extend("my.own.Component", {});

			});
			sap.ui.define("my/own/autoid/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

				return UIComponent.extend("my.own.autoid.Component", {
					metadata: {
						manifest: "json"
					}
				});

			});
			sap.ui.define("my/own/prefixid/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {

				return UIComponent.extend("my.own.prefixid.Component", {
					metadata: {
						manifest: "json"
					}
				});

			});

			// defined the controller
			sap.ui.define("my/own/Controller", ["sap/ui/core/mvc/Controller"], function(Controller) {

				return Controller.extend("my.own.Controller", {
					doSomething: function() {}
				});

			});

		},

		afterEach: function() {

			this.oServer.restore();

		}

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

});