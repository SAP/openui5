sap.ui.define([
	'sap/ui/qunit/utils/createAndAppendDiv',
	"sap/ui/qunit/utils/nextUIUpdate",
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/UIComponent',
	'sap/ui/core/UIComponentMetadata',
	'sap/ui/test/routing/RouterExtension',
	'sap/base/util/deepExtend'
], function (createAndAppendDiv, nextUIUpdate, Component, ComponentContainer, UIComponent, UIComponentMetadata, SamplesRouterExtension, deepExtend) {

	"use strict";
	/*global sinon, QUnit, foo*/

	createAndAppendDiv(["comparea1", "comparea2"]);

	//******************************************************
	//Test preparation for custom component configuration
	var TestComp1 = Component.extend("test.comp1.Component", {
		metadata: {
			"properties" : {
				"test" : "string"
			},
			"my.custom.config" : {
				"property1" : "value1",
				"property2" : "value2"
			}
		}
	});
	var TestComp2 = TestComp1.extend("test.comp2.Component", {
		metadata: {
			"my.custom.config" : {
				"property1" : "value3"
			}
		}
	});
	//******************************************************


	QUnit.module("Basic Components", {
		beforeEach: function(assert) {
			var doneComp1 = assert.async();
			this.oCompCont1 = new ComponentContainer("CompCont1", {
				name: "samples.components.button",
				id: "myButton",
				settings: {
					id: "buttonComponent",
					text: "Text changed through settings",
					componentData: {
						"foo": "bar"
					}
				},
				componentCreated: function() {
					doneComp1();
				}
			}).placeAt("comparea1");
			this.oComp = sap.ui.getCore().createComponent({
				name: "sap.ui.test.verticalLayout_legacyAPIs",
				id: "vLayout",
				componentData: {
					"foo": "bar"
				}
			});
			this.oCompCont = new ComponentContainer("ContVLayout", {
				component : this.oComp
			}).placeAt("comparea2");
		},
		afterEach: function() {
			this.oCompCont1.destroy();
			this.oCompCont.destroy();
		}
	});

	QUnit.test("Simple Component Instance", async function(assert){
		await nextUIUpdate();
		assert.ok(document.getElementById("CompCont1"));
		var elem = document.getElementById("buttonComponent---mybutn");
		assert.equal(elem.textContent, "Text changed through settings", "Settings applied");
	});

	QUnit.test("Nested Components", function(assert){
		assert.ok(document.getElementById("ContVLayout"));
		//check for ids of nested elements
		assert.ok(document.getElementById("vLayout---myLayout"));
		assert.ok(document.getElementById("vLayout---toolbar"));
		assert.ok(document.getElementById("vLayout---myText"));
		assert.ok(document.getElementById("vLayout---ContButton"));
		assert.ok(document.getElementById("vLayout---ContButton-uiarea"));
		assert.ok(document.getElementById("vLayout---comp_button---mybutn"));
	});

	QUnit.test("Components Metadata", function(assert){
		var includes = ["css/vlayout.css","/js/includeme.js"];
		var components =  ["samples.components.styledbutton"];
		var oComp = this.oComp;
		assert.equal(oComp.getMetadata().getVersion(), "1.0", "Version retrieved");
		assert.deepEqual(oComp.getMetadata().getIncludes(), includes, "Includes Array retrieved");
		assert.notEqual(oComp.getMetadata().getDependencies(), null, "Dependencies retrieved");
		assert.deepEqual(oComp.getMetadata().getComponents(), components, "Child components retrieved");
		assert.equal(oComp.getMetadata().getUI5Version(), "1.13.0", "UI5 Version retrieved");
	});

	QUnit.test("Components Metadata - Custom Configuration Entry", function(assert){
		var oSuccessMerged = TestComp2.getMetadata().getCustomEntry("my.custom.config", true);
		var oSuccessUnMerged = TestComp2.getMetadata().getCustomEntry("my.custom.config", false);
		var oFail = TestComp2.getMetadata().getCustomEntry("properties");

		assert.ok(!oFail, "Standard metadata can not be accessed.");
		assert.equal(oSuccessMerged.property1, "value3", "Property 1 merged and overridden.");
		assert.equal(oSuccessMerged.property2, "value2", "Property 2 merged and but not overridden.");
		assert.equal(oSuccessUnMerged.property1, "value3", "Property 1 not merged.");
		assert.ok(!oSuccessUnMerged.property2, "Property 2 not merged (does not exist).");
	});

	QUnit.test("Components Includes", function(assert){
		assert.ok(typeof foo == 'function', "function foo from included js exists");
		assert.equal(foo(), "bar", "function from JS include invoked");
		var oLink = document.querySelector(
			"link[data-sap-ui-manifest-uid='" + this.oComp.getManifestObject()._uid + "']"
		);
		assert.ok(oLink, "Stylsheet from include has been inserted");
		assert.equal(oLink.getAttribute("href"),
			"test-resources/sap/ui/core/qunit/component/testdata/verticalLayout_legacyAPIs/css/vlayout.css",
			"Stylesheet with correct href has been inserted"
		);
	});

	QUnit.test("Factory Function", function(assert){
		var oComp = this.oComp;
		var oComponent = sap.ui.component(oComp.getId());
		assert.equal(oComponent, oComp, "Factory function returns the same instance!");
		oComponent = sap.ui.component({
			name: "sap.ui.test.verticalLayout_legacyAPIs",
			id: "factoryVLayout"
		});
		assert.ok(!!oComponent, "Component has been created!");
		assert.equal(oComponent.getMetadata(), oComp.getMetadata(), "Component is equal!");
	});

	QUnit.test("Component Data", function(assert){
		var oComp = this.oComp;
		var oCompCont1 = this.oCompCont1;
		assert.ok(!!oComp.getComponentData(), "Component has component data");
		assert.equal(oComp.getComponentData().foo, "bar", "Component data is correct");
		var oComponent = sap.ui.getCore().getComponent(oCompCont1.getComponent());
		assert.ok(!!oComponent.getComponentData(), "Component has component data");
		assert.equal(oComponent.getComponentData().foo, "bar", "Component data is correct");
	});

	QUnit.test("Create instance without factory", function(assert) {

		var oComponent = new TestComp1();

		assert.equal(oComponent.getMetadata(), TestComp1.getMetadata(), "getMetadata returns static Metadata");
		assert.equal(oComponent.getManifest(), TestComp1.getMetadata().getManifest(), "getManifest returns static Metadata manifest");

		oComponent.destroy();
	});

	QUnit.test("getEventBus", function(assert) {

		var oComponent = new TestComp1();

		assert.equal(oComponent._oEventBus, undefined, "No EventBus available by default");

		var oEventBus = oComponent.getEventBus();
		assert.ok(oEventBus.isA("sap.ui.core.EventBus"), "getEventBus returns an EventBus instance");
		assert.equal(oComponent._oEventBus, oComponent.getEventBus(), "EventBus instance is stored as private property");

		oComponent.destroy();
	});


	QUnit.module("Creation Context", {
		beforeEach: function() {
			this.oComp = sap.ui.getCore().createComponent({
				name: "sap.ui.test.verticalLayout_legacyAPIs",
				id: "vLayout",
				componentData: {
					"foo": "bar"
				}
			});
		},
		afterEach: function() {
			this.oComp.destroy();
		}
	});

	QUnit.test("Basic Test", function(assert){
		// check that the layout has the reference to the component
		var oLayout = this.oComp.byId("myLayout");
		var sRefComponentId = Component.getOwnerIdFor(oLayout);
		assert.equal(this.oComp.getId(), sRefComponentId, "The nested control has the correct component context");
		// check the nested component having the ID of the parent component
		var oNestedComponentContainer = this.oComp.byId("ContButton");
		var sNestedComponentId = oNestedComponentContainer.getComponent();
		var oNestedComponent = sap.ui.component(sNestedComponentId);
		assert.equal(sRefComponentId, Component.getOwnerIdFor(oNestedComponent), "The nested component has the correct component context");
		// check the control in the nested component to have the correct component context
		var oNestedControl = oNestedComponent.byId("mybutn");
		assert.equal(sNestedComponentId, Component.getOwnerIdFor(oNestedControl), "The nested control has the correct component context");
	});

	QUnit.module("Routing", {
		beforeEach : function () {
			// System under test
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.routing_legacyAPIs"
			});
		},
		afterEach: function() {
			this.oComponent.destroy();
		}
	});

	QUnit.test("Should create a custom router class", function(assert) {
		//Act
		var oRouter = this.oComponent.getRouter();

		//Assert
		assert.ok(oRouter instanceof SamplesRouterExtension, "the created router was an extension");
		assert.strictEqual(oRouter._oConfig.targetParent, this.oComponent.oView.getId(), "the viewid is the targetParent");

		//Cleanup
		this.oComponent.destroy();
		assert.ok(oRouter.bIsDestroyed, "Router got destroyed when the component is destroyed");
	});

	QUnit.test("Should return the targets instance of the router", function (assert) {
		//Act - initialize the component to create the router
		var oTargets = this.oComponent.getTargets();

		//Assert
		assert.ok(oTargets, "the component created targets");
		var oTarget = oTargets.getTarget("myTarget");
		assert.ok(oTarget, "the component created a target instance");
		assert.strictEqual(oTarget._oOptions.rootView, this.oComponent.oView.getId(), "the viewid is the rootView");

		//Cleanup
		this.oComponent.destroy();
		assert.ok(oTargets.bIsDestroyed, "Targets got destroyed when the component is destroyed");
	});

	QUnit.module("Routing", {
		beforeEach : function (assert) {
			var done = assert.async();
			var that = this;
			sap.ui.require(["sap/m/routing/Targets"], function() {
				// System under test
				that.oComponent = sap.ui.getCore().createComponent({
					name: "sap.ui.test.routing_legacyAPIs.targets"
				});
				done();
			});
		},
		afterEach: function() {
			this.oComponent.destroy();
		}
	});

	QUnit.test("Should create the targets instance standalone", function (assert) {
		//Act - initialize the component to create the router
		var oTargets = this.oComponent.getTargets();
		var oViews = this.oComponent._oViews;

		//Assert
		assert.ok(oTargets, "the component created targets");
		var oTarget = oTargets.getTarget("myTarget");
		assert.ok(oTarget, "the component created a target instance");
		assert.strictEqual(oTarget._oOptions.rootView, this.oComponent.oView.getId(), "the viewid is the rootView");
		assert.strictEqual(oViews._oComponent, this.oComponent, "the views instance knows its component");

		//Cleanup
		this.oComponent.destroy();
		assert.ok(oTargets.bIsDestroyed, "Targets got destroyed when the component is destroyed");
		assert.ok(oViews.bIsDestroyed, "Views created by the component got destroyed");
	});

	QUnit.module("Root control", {
		beforeEach : function () {
			// System under test
			this.oComponent = sap.ui.getCore().createComponent({
				name: "sap.ui.test.routing_legacyAPIs"
			});
		},
		afterEach: function() {
			this.oComponent.destroy();
		}
	});

	QUnit.test("Should get the root control", function (assert) {
		//Act
		var oRootControl = this.oComponent.getRootControl();

		//Assert
		assert.strictEqual(this.oComponent._oViewWhileInit, oRootControl, "the root control is available in the init function");
		assert.strictEqual(this.oComponent.oView, oRootControl, "the returned control is the rootView");
		assert.strictEqual(this.oComponent._oViewWhileCreateContent, null, "in the create content the control is still null");

		//Cleanup
		this.oComponent.destroy();
		assert.ok(oRootControl.bIsDestroyed, "Root control got destroyed when the component is destroyed");
	});


	QUnit.module("Manifest First", {
		beforeEach : function() {

			//setup fake server
			var oManifest = this.oManifest = {
				"sap.app" : {
					"id" : "samples.components.button",
					"title": "{{title}}"
				}
			};
			var oAltManifest1 = this.oAltManifest1 = {
				"sap.app" : {
					"id" : "samples.components.config",
					"title": "{{title}}"
				}
			};

			var oAltManifest2 = this.oAltManifest2 = {
				"sap.app" : {
					"id" : "samples.components.oneview",
					"i18n": "someFolder/messagebundle.properties",
					"title": "{{title}}"
				}
			};
			var oAppVariantManifest = {
				"sap.app" : {
					"id" : "app.variant.id",
					"title": "{{title}}"
				},
				"sap.ui5": {
					"componentName": "samples.components.button"
				}
			};

			// workaround sinon gh #1534
			this._oSandbox.serverPrototype = null;
			var oServer = this.oServer = this._oSandbox.useFakeServer();

			oServer.xhr.useFilters = true;
			oServer.xhr.filters = [];
			oServer.xhr.addFilter(function(method, url) {
				return (
					url !== "anylocation/manifest.json?sap-language=EN"
					&& url !== "anyotherlocation1/manifest.json?sap-language=EN"
					&& url !== "anyotherlocation2/manifest.json?sap-language=EN"
					& url !== "anyappvariantlocation/manifest.json?sap-language=EN"

					&& !/anylocation\/i18n\/i18n_en\.properties$/.test(url)
					&& !/anyotherlocation2\/someFolder\/messagebundle_en\.properties$/.test(url)
				);
			});

			oServer.autoRespond = true;
			oServer.respondWith("GET", "anylocation/manifest.json?sap-language=EN", [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifest)
			]);
			oServer.respondWith("GET", "anyotherlocation1/manifest.json?sap-language=EN", [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oAltManifest1)
			]);
			oServer.respondWith("GET", "anyotherlocation2/manifest.json?sap-language=EN", [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oAltManifest2)
			]);
			oServer.respondWith("GET", "anyappvariantlocation/manifest.json?sap-language=EN", [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oAppVariantManifest)
			]);

			oServer.respondWith("GET", /anylocation\/i18n\/i18n_en\.properties$/, [
				200,
				{
					"Content-Type": "text/plain; charset=ISO-8859-1"
				},
				"title=Title anylocation"
			]);
			oServer.respondWith("GET", /anyotherlocation2\/someFolder\/messagebundle_en\.properties$/, [
				200,
				{
					"Content-Type": "text/plain; charset=ISO-8859-1"
				},
				"title=Title anyotherlocation2"
			]);
			oServer.respondWith("GET", /anyappvariantlocation\/someFolder\/messagebundle_en\.properties$/, [
				200,
				{
					"Content-Type": "text/plain; charset=ISO-8859-1"
				},
				"title=Title anyotherlocation2"
			]);

		},
		afterEach : function() {
			Component._fnOnInstanceCreated = null;
		}
	});

	QUnit.test("Manifest delegation to component instance (sync)", function(assert) {

		var oServer = this.oServer, oManifest = this.oManifest;

		//start test
		var oComponent = sap.ui.component({
			manifestUrl : "anylocation/manifest.json"
		});

		assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
		assert.ok(oComponent.getManifest(), "Manifest is available");
		assert.deepEqual(oComponent.getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");

		var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
		assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");

	});

	QUnit.test("Manifest delegation to component instance (sync, delayed instantiation)", function(assert) {

		var oServer = this.oServer, oManifest = this.oManifest;

		//start test
		var fnComponentClass = sap.ui.component.load({
			manifestUrl : "anylocation/manifest.json"
		});

		assert.ok(fnComponentClass.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
		assert.ok(fnComponentClass.getMetadata().getManifest(), "Manifest is available");
		assert.deepEqual(fnComponentClass.getMetadata().getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");
		assert.throws(function() {
			fnComponentClass.extend("new.Component", {});
		}, new Error("Extending Components created by Manifest is not supported!"), "Extend should raise an exception");

		var oComponent = new fnComponentClass();

		assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
		assert.ok(oComponent.getManifest(), "Manifest is available");
		assert.deepEqual(oComponent.getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");

		var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
		assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");

	});

	QUnit.test("Alternate URL for component (sync)", function(assert) {

		var oServer = this.oServer, oManifest = this.oAltManifest1;

		// create an invalid registration for samples.components.config to see that the "url" parameter works
		sap.ui.loader.config({paths:{"samples/components/config":"test-resources/invalid/"}});

		//start test
		var fnComponentClass = sap.ui.component.load({
			manifestUrl : "anyotherlocation1/manifest.json",
			url : "test-resources/sap/ui/core/samples/components/config/"
		});

		assert.ok(fnComponentClass.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
		assert.ok(fnComponentClass.getMetadata().getManifest(), "Manifest is available");
		assert.deepEqual(fnComponentClass.getMetadata().getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");
		assert.throws(function() {
			fnComponentClass.extend("new.Component", {});
		}, new Error("Extending Components created by Manifest is not supported!"), "Extend should raise an exception");

		var oComponent = new fnComponentClass();

		assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
		assert.ok(oComponent.getManifest(), "Manifest is available");
		assert.deepEqual(oComponent.getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");

		var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
		assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");

	});

	QUnit.test("On instance created callback / hook (sync)", function(assert) {

		var oCallbackComponent;

		// set the instance created callback hook
		Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			oCallbackComponent = oComponent;

			assert.ok(true, "sap.ui.core.Component._fnOnInstanceCreated called!");
			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.deepEqual(vCallbackConfig, oConfig, "sap.ui.core.Component._fnOnInstanceCreated oConfig passed!");

			// Promise should be ignored in sync case
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(true);
				}, 0);
			});
		};

		var oConfig = {
			manifestUrl: "anylocation/manifest.json"
		};

		var oComponent = sap.ui.component(oConfig);

		assert.equal(oComponent, oCallbackComponent, "Returned component instances should be the same as within callback.");

	});

	QUnit.test("On instance created callback / hook (sync, error)", function(assert) {

		// set the instance created callback hook
		Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			throw new Error("Error from _fnOnInstanceCreated");
		};

		assert.throws(
			function() {
				sap.ui.component({
					manifestUrl: "anylocation/manifest.json"
				});
			},
			/Error from _fnOnInstanceCreated/,
			"Error from hook should not be caught internally"
		);

	});

	QUnit.test("Usage of manifest property in component configuration for URL (sync)", function(assert) {

		var oComponent = sap.ui.component({
			manifest: "anylocation/manifest.json",
			async: false
		});

		assert.ok(oComponent instanceof UIComponent, "Component is loaded properly!");
		assert.equal(oComponent.getManifestObject().getComponentName(), "samples.components.button", "The proper component has been loaded!");

	});

	QUnit.test("Usage of manifest property in component configuration for manifest object (sync)", function(assert) {

		var oComponent = sap.ui.component({
			manifest: {
				"sap.app" : {
					"id" : "samples.components.oneview"
				}
			},
			async: false
		});

		assert.ok(oComponent instanceof UIComponent, "Component is loaded properly!");
		assert.equal(oComponent.getManifestObject().getComponentName(), "samples.components.oneview", "The proper component has been loaded!");

	});


	QUnit.module("Component Usage", {
		beforeEach : function() {

			// setup fake server
			var oManifest = this.oManifest = {
					"sap.app" : {
						"id" : "my.preloadusage"
					},
					"sap.ui5" : {
						"dependencies": {
							"components": {
								"my.used": {}
							}
						},
						"componentUsages": {
							"defaultUsage": {
								"name": "defaultUsage"
							},
							"lazyUsage": {
								"name": "lazyUsage",
								"lazy": true
							},
							"nonLazyUsage": {
								"name": "nonLazyUsage",
								"lazy": false
							},
							"nonLazyUsageNowLazy": {
								"name": "nonLazyUsage",
								"lazy": true
							},
							"nonLazyUsageAgain": {
								"name": "nonLazyUsage",
								"lazy": false
							}
						}
					}
			};

			// workaround sinon gh #1534
			this._oSandbox.serverPrototype = null;
			var oServer = this.oServer = this._oSandbox.useFakeServer();

			oServer.xhr.useFilters = true;
			oServer.xhr.filters = [];
			oServer.xhr.addFilter(function(method, url) {
				return url !== "anylocation/manifest.json?sap-language=EN";
			});

			oServer.autoRespond = true;
			oServer.respondWith("GET", "anylocation/manifest.json?sap-language=EN", [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifest)
			]);

		},
		afterEach : function() {}
	});

	sap.ui.define("my/used/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.used.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.used"
					},
					"sap.ui5" : {
						"componentUsages": {
							"mySubSubUsage": {
								"manifest": false,
								"name": "my.used"
							}
						}
					}
				}
			},
			constructor: function(mSettings) {
				UIComponent.apply(this, arguments);
				this._mSettings = mSettings;
			}
		});
	});

	sap.ui.define("my/changed/constructor/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.used.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.changed.constructor"
					},
					"sap.ui5" : {

					}
				}
			},
			constructor: function(mSettings) {
				mSettings._cacheTokens.manipulatedTokens = {};
				UIComponent.apply(this, arguments);
			}
		});
	});

	sap.ui.define("my/usage/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.usage.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.usage"
					},
					"sap.ui5" : {
						"dependencies": {
							"components": {
								"my.used": {},
								"my.changed.constructor": {}
							}
						},
						"componentUsages": {
							"myUsage": {
								"name": "my.used"
							},
							"mySubUsage": {
								"manifest": false,
								"name": "my.used"
							},
							"myConstructorUsage": {
								"manifest": false,
								"name": "my.changed.constructor"
							}
						}
					}
				}
			}
		});
	});

	sap.ui.define("my/preloadusage/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.preloadusage.Component", {
			metadata: {
				manifest: "json"
			}
		});
	});

	sap.ui.define("my/command/base/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.command.base.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.command.base.constructor"
					},
					"sap.ui5" : {
						"commands": {
							"Save": {
								"shortcut": "Ctrl+S"
							},
							"Cancel": {
								"shortcut": "Ctrl+C"
							}
						}
					}
				}
			}
		});
	});

	sap.ui.define("my/command/Component", ["my/command/base/Component"], function(oBaseComponent) {
		return oBaseComponent.extend("my.command.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.command.constructor"
					},
					"sap.ui5" : {
					}
				}
			}
		});
	});

	QUnit.test("Propagate cacheTokens: Sync creation of sub component via createComponent()", function(assert) {
		var oComponent = sap.ui.component({
			name : "my.usage",
			asyncHints: {
				cacheTokens: {
					someToken: {}
				}
			}
		});

		assert.ok(oComponent instanceof Component, "Component should be created");
		assert.ok(oComponent._mCacheTokens, "_mCacheTokens should be available");
		assert.deepEqual(oComponent._mCacheTokens.someToken, {}, "_mCacheTokens.someToken should be available");

		var oSubComponent = oComponent.createComponent({
			usage: "mySubUsage",
			async: false,
			anything: "else"
		});

		assert.ok(oSubComponent instanceof Component, "SubComponent should be created");
		assert.deepEqual(oSubComponent._mCacheTokens, oComponent._mCacheTokens, "_mCacheTokens of the SubComponent should be equal to the parent component (content-wise)");
		oComponent.destroy();
		oSubComponent.destroy();
	});

	QUnit.test("Propagate cacheTokens: Sync creation of sub component via sap.ui.component()", function(assert) {
		var oRootComponent = sap.ui.component({
			name : "my.usage",
			asyncHints: {
				cacheTokens: {
					someToken: {}
				}
			}
		});

		assert.ok(oRootComponent instanceof Component, "Component should be created");
		assert.ok(oRootComponent._mCacheTokens, "_mCacheTokens should be available");
		assert.deepEqual(oRootComponent._mCacheTokens.someToken, {}, "_mCacheTokens.someToken should be available");

		var oSubComponent1,
			oSubComponent2,
			oSubComponent1_1;

		oRootComponent.runAsOwner(function() {
			oSubComponent1 = sap.ui.component({
				name: "my.used",
				asyncHints: {
					cacheTokens: {
						myOwnTokens: {}
					}
				}
			});

			oSubComponent1.runAsOwner(function() {
				oSubComponent1_1 = sap.ui.component({
					name: "my.used"
				});
			});

			oSubComponent2 = sap.ui.component({
				name: "my.used"
			});
		});

		assert.ok(oSubComponent1 instanceof Component, "oSubComponent1 should be created");
		assert.ok(oSubComponent2 instanceof Component, "oSubComponent2 should be created");
		assert.ok(oSubComponent1_1 instanceof Component, "oSubComponent1_1 should be created");

		assert.deepEqual(oSubComponent1_1._mCacheTokens, {myOwnTokens: {}}, "_mCacheTokens of the oSubComponent1 shouldn't be propagated from parent component oRootComponent");
		assert.deepEqual(oSubComponent2._mCacheTokens, {someToken: {}}, "_mCacheTokens of the oSubComponent2 should be equal to the parent component oRootComponent (content-wise)");
		assert.deepEqual(oSubComponent1_1._mCacheTokens, {myOwnTokens: {}}, "_mCacheTokens of the oSubComponent1_1 should be equal to the parent component oSubComponent1 (content-wise)");

		// cleanup
		oRootComponent.destroy();
		oSubComponent1.destroy();
		oSubComponent2.destroy();
		oSubComponent1_1.destroy();
	});

	QUnit.test("Sync creation of component usage", function(assert) {

		var oComponent = sap.ui.component({
			name : "my.usage"
		});
		var oSpy = sinon.spy(sap.ui, "component"); // legacy factory for sync calls only

		var done = (function() {
			var asyncDone = assert.async();
			return function cleanup() {
				oSpy.restore();
				oComponent.destroy();
				asyncDone();
			};
		})();

		sap.ui.require([
			"my/used/Component"
		], function(UsedComponent) {

			var mConfig = {
				usage: "myUsage",
				settings: {
					"key1": "value1"
				},
				componentData: {
					"key2": "value2"
				},
				async: false,
				asyncHints: {},
				anything: "else"
			};
			var mSettings = deepExtend({}, mConfig.settings, { componentData: mConfig.componentData });
			var oComponentUsage = oComponent.createComponent(mConfig);
			assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
			assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of my.used.Component");
			assert.equal(oComponent.getId(), Component.getOwnerIdFor(oComponentUsage), "ComponentUsage must be created with the creator Component as owner");
			assert.equal(1, oSpy.callCount, "Nested component created with instance factory function");
			assert.equal(false, oSpy.args[0][0].async, "Nested component created with config 'async: true'");
			assert.deepEqual(mConfig.settings, oSpy.args[0][0].settings, "ComponentUsage must receive the correct settings");
			assert.deepEqual(mSettings, oComponentUsage._mSettings, "ComponentUsage must receive the correct settings");
			assert.deepEqual(mConfig.componentData, oSpy.args[0][0].componentData, "ComponentUsage must receive the correct componentData");
			assert.equal(undefined, oSpy.args[0][0].asyncHints, "ComponentUsage must not receive \"asyncHints\"");
			assert.equal(undefined, oSpy.args[0][0].anything, "ComponentUsage must not receive \"anything\"");
			done();

		});

	});

});
