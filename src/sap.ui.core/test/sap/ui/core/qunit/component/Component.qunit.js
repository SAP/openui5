sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/UIComponent',
	'sap/ui/core/UIComponentMetadata',
	'samples/components/loadfromfile/Component',
	'samples/components/routing/Component',
	'samples/components/routing/RouterExtension',
	'sap/ui/thirdparty/URI',
	'sap/ui/base/ManagedObjectRegistry',
	'sap/base/Log',
	'sap/ui/core/Manifest'
], function(jQuery, Component, ComponentContainer, UIComponent, UIComponentMetadata, SamplesLoadFromFileComponent, SamplesRoutingComponent, SamplesRouterExtension, URI, ManagedObjectRegistry, Log, Manifest) {

	"use strict";
	/*global sinon, QUnit, foo*/

	function cleanUpRegistry() {
		Component.registry.forEach(function(oComponent) {
			oComponent.destroy();
		});
	}

	// create necessary DOM fixture
	function appendDIV(id) {
		var div = document.createElement("div");
		div.id = id;
		document.body.appendChild(div);
	}

	appendDIV("comparea1");
	appendDIV("comparea2");

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
			var that = this;
			var doneComp1 = assert.async();
			this.oCompCont1 = new ComponentContainer("CompCont1", {
				name: "samples.components.button",
				id: "myButton",
				async:true,
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
			return sap.ui.getCore().createComponent({
				name: "samples.components.verticalLayout",
				id: "vLayout",
				componentData: {
					"foo": "bar"
				},
				async: true
			}).then(function(oComp) {
				that.oComp = oComp;
				that.oCompCont = new ComponentContainer("ContVLayout", {
					component : oComp
				}).placeAt("comparea2");
			});
		},
		afterEach: function() {
			this.oCompCont1.destroy();
			this.oCompCont.destroy();
		}
	});

	QUnit.test("Simple Component Instance", function(assert){
		sap.ui.getCore().applyChanges();
		assert.ok(document.getElementById("CompCont1"));
		var elem = jQuery.sap.byId("buttonComponent---mybutn");
		assert.equal(elem.text(), "Text changed through settings", "Settings applied");
	});

	QUnit.test("Nested Components", function(assert){
		assert.ok(document.getElementById("ContVLayout"));
		//check for ids of nested elements
		assert.ok(document.getElementById("vLayout---myLayout"));
		assert.ok(document.getElementById("vLayout---nB"));
		assert.ok(document.getElementById("vLayout---myTF"));
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

	QUnit.test("Components Metadata - Load from file", function(assert){
		var oMetadata = SamplesLoadFromFileComponent.getMetadata();

		assert.deepEqual(oMetadata.getIncludes(), ["css/includeme.css", "js/includeme.js"], "Includes are available.");
		assert.ok(oMetadata.hasProperty("prop1"), "Property 'prop1' available.");
	});

	QUnit.test("Components Includes", function(assert){
		assert.ok(typeof foo == 'function', "function foo from included js exists");
		assert.equal(foo(), "bar", "function from JS include invoked");
		var oLink = document.querySelector(
			"link[data-sap-ui-manifest-uid='" + this.oComp.getManifestObject()._uid + "']"
		);
		assert.ok(oLink, "Stylsheet from include has been inserted");
		assert.equal(oLink.getAttribute("href"),
			"test-resources/sap/ui/core/samples/components/verticalLayout/css/vlayout.css",
			"Stylesheet with correct href has been inserted"
		);
	});

	QUnit.test("Factory Function", function(assert){
		var oComp = this.oComp;
		var oComponent = sap.ui.component(oComp.getId());
		assert.equal(oComponent, oComp, "Factory function returns the same instance!");
		oComponent = sap.ui.component({
			name: "samples.components.verticalLayout",
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

	QUnit.module("Factory Error Handling");

	QUnit.test("Component.js error handling (manifestFirst)", function(assert) {

		// Register manifest.json
		sap.ui.require.preload({
			"test/inline/errorHandling1/manifest.json": JSON.stringify({
				"sap.app": {
					"id": "test.inline.errorHandling1"
				}
			})
		});

		// Define failing component
		sap.ui.define("test/inline/errorHandling1/Component", ["sap/ui/core/Component"], function(Component) {
			throw new Error("Error from test/inline/errorHandling1/Component");
		});

		return Component.load({
			name: "test.inline.errorHandling1"
		}).then(function(oComponent) {
			assert.notOk(true, "Component should not be created");
		}, function(oError) {
			assert.equal(oError.message, "Error from test/inline/errorHandling1/Component", "Error from Component.js should be propagated");
		});

	});

	QUnit.test("Component.js error handling (no manifestFirst)", function(assert) {

		// Define failing component
		sap.ui.define("test/inline/errorHandling2/Component", ["sap/ui/core/Component"], function(Component) {
			throw new Error("Error from test/inline/errorHandling2/Component");
		});

		return Component.load({
			name: "test.inline.errorHandling2",
			manifest: false
		}).then(function(oComponent) {
			assert.notOk(true, "Component should not be created");
		}, function(oError) {
			assert.equal(oError.message, "Error from test/inline/errorHandling2/Component", "Error from Component.js should be propagated");
		});

	});

	QUnit.module("Creation Context", {
		beforeEach: function() {
			return sap.ui.getCore().createComponent({
				name: "samples.components.verticalLayout",
				id: "vLayout",
				componentData: {
					"foo": "bar"
				},
				async: true
			}).then(function(oComp) {
				this.oComp = oComp;
			}.bind(this));
		},
		afterEach: function() {
			this.oComp.destroy();
		}
	});

	QUnit.test("Basic Test", function(assert){
		// check that the layout has the reference to the component
		var oLayout = this.oComp.byId("myLayout");
		var sRefComponentId = oLayout._sOwnerId; // INTERNAL ONLY!
		assert.equal(this.oComp.getId(), sRefComponentId, "The nested control has the correct component context");
		// check the nested component having the ID of the parent component
		var oNestedComponentContainer = this.oComp.byId("ContButton");
		var sNestedComponentId = oNestedComponentContainer.getComponent();
		var oNestedComponent = sap.ui.component(sNestedComponentId);
		assert.equal(sRefComponentId, Component.getOwnerIdFor(oNestedComponent), "The nested component has the correct component context");
		// check the control in the nested component to have the correct component context
		var oNestedControl = oNestedComponent.byId("mybutn");
		assert.equal(sNestedComponentId, oNestedControl._sOwnerId, "The nested control has the correct component context"); // INTERNAL ONLY!
	});

	QUnit.module("Destruction");

	QUnit.test("Should destroy dependencies when the constructor is throwing an error", function (assert) {
		var fnDestroySpy;

		var FailingComponent = SamplesRoutingComponent.extend("sample.components.ComponentThatThrows", {
			init: function () {
				SamplesRoutingComponent.prototype.init.apply(this, arguments);

				fnDestroySpy = sinon.spy(this._oRouter, "destroy");

				throw new Error();
			}
		});

		assert.throws(function () {
			new FailingComponent();
		});
		sinon.assert.calledOnce(fnDestroySpy);
	});

	QUnit.module("Routing", {
		beforeEach : function () {
			// System under test
			return sap.ui.getCore().createComponent({
				name: "samples.components.routing",
				async: true
			}).then(function(oComponent) {
				this.oComponent = oComponent;
				this.oComponent.init();
			}.bind(this));
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
				sap.ui.getCore().createComponent({
					name: "samples.components.targets",
					async: true
				}).then(function(oComponent) {
					that.oComponent = oComponent;
					that.oComponent.init();
					done();
				});
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
			return sap.ui.getCore().createComponent({
				name: "samples.components.routing",
				async: true
			}).then(function(oComponent) {
				this.oComponent = oComponent;
			}.bind(this));
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
		assert.strictEqual(this.oComponent._oViewWhileCeateContent, null, "in the create content the control is still null");

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
			delete Component._fnOnInstanceCreated;
		}
	});

	QUnit.test("Component.create - manifest with URL", function(assert) {

		return Component.create({
			manifest: "anylocation/manifest.json"
		}).then(function(oComponent) {
			assert.ok(true, "Component is loaded properly!");
		}, function(oError) {
			assert.ok(false, "Component should be loaded!");
		});
	});

	QUnit.test("Component.create - manifest with URL and App Variant", function(assert) {
		var configSpy = this.spy(sap.ui.loader, "config");
		var sComponentUrl = "test-resources/sap/ui/core/samples/components/button/";

		return Component.create({
			manifest: "anyappvariantlocation/manifest.json",
			url: sComponentUrl
		}).then(function(oComponent) {
			assert.equal(2, configSpy.callCount, "sap.ui.loader.config was called twice");

			var mPathsOfFirstCall = configSpy.getCall(0).args[0].paths;
			var aKeysOfFirstCall = Object.keys(mPathsOfFirstCall);
			assert.equal(aKeysOfFirstCall.length, 1, "one path is registered");
			var sComponentName = oComponent.getManifestEntry("/sap.ui5/componentName");
			var sCompopnentModulePath = sComponentName.replace(/\./g, "/");
			var sPathKeyOfFirstCall = aKeysOfFirstCall[0];
			assert.equal(sPathKeyOfFirstCall, sCompopnentModulePath, "the component module path was registered");
			assert.equal(mPathsOfFirstCall[sPathKeyOfFirstCall], sComponentUrl, "the component module uri is correct");

			var mPathsOfSecondCall = configSpy.getCall(1).args[0].paths;
			var aKeysOfSecondCall = Object.keys(mPathsOfSecondCall);
			assert.equal(1, aKeysOfSecondCall.length, "one path is registered");
			var sAppVariantId = oComponent.getManifestEntry("/sap.app/id");
			var sAppVariantModulePath = sAppVariantId.replace(/\./g, "/");
			var sPathKeyOfSecondCall = aKeysOfSecondCall[0];
			assert.equal(sPathKeyOfSecondCall, sAppVariantModulePath, "the app variant module path was registered");
			assert.equal(mPathsOfSecondCall[sPathKeyOfSecondCall], "anyappvariantlocation/", "the component module uri is correct");
		});
	});

	QUnit.test("Component.get - manifest with URL", function(assert) {

		return Component.create({
			id: "myTestComp",
			manifest: "anylocation/manifest.json"
		}).then(function(oComponent) {
			assert.ok(true, "Component is loaded properly!");
			assert.equal(oComponent, Component.get("myTestComp"), "Component.get returns right component");
		}, function(oError) {
			assert.ok(false, "Component should be loaded!");
		});

	});


	QUnit.test("Component.load - manifest with URL", function(assert) {

		return Component.load({
			manifest: "anylocation/manifest.json"
		}).then(function(ComponentClass) {
			assert.ok(true, "Component is loaded properly!");
			assert.ok(ComponentClass.constructor && !(ComponentClass instanceof Component), "Component class loaded");
		}, function(oError) {
			assert.ok(false, "Component should be loaded!");
		});

	});

	QUnit.test("Component.create - manifest as object", function(assert) {

		return Component.create({
			manifest: {
				"sap.app" : {
					"id" : "samples.components.oneview"
				}
			}
		}).then(function(oComponent) {
			assert.equal(oComponent.getManifestObject().getComponentName(), "samples.components.oneview", "The proper component has been loaded!");
		}, function(oError) {
			assert.ok(false, "Component should be loaded!");
		});

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

	QUnit.test("Manifest delegation to component instance (async)", function(assert) {

		var oServer = this.oServer;
		var oExpectedManifest = {
			"sap.app" : {
				"id" : "samples.components.button",
				// Note: Placeholders (e.g. {{title}}) are only replaced in "manifest first" + async mode (not sync!)
				// The corresponding i18n bundle is loaded relative to the manifest.json (manifestUrl)
				"title": "Title anylocation"
			}
		};

		//start test
		var done = assert.async();
		sap.ui.component({
			manifestUrl : "anylocation/manifest.json",
			async : true
		}).then(function(oComponent) {

			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(oComponent.getManifest(), "Manifest is available");
			assert.deepEqual(oComponent.getManifest(), oExpectedManifest, "Manifest matches the manifest behind manifestUrl with processed placeholders");

			var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
			assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");

			done();

		});

	});

	QUnit.test("Manifest delegation to component instance (async, delayed instantiation)", function(assert) {

		var oServer = this.oServer;
		var oExpectedManifest = {
			"sap.app" : {
				"id" : "samples.components.button",
				// Note: Placeholders (e.g. {{title}}) are only replaced in "manifest first" + async mode (not sync!)
				// The corresponding i18n bundle is loaded relative to the manifest.json (manifestUrl)
				"title": "Title anylocation"
			}
		};

		//start test
		var done = assert.async();
		sap.ui.component.load({
			manifestUrl : "anylocation/manifest.json",
			async : true
		}).then(function(fnComponentClass) {

			assert.ok(fnComponentClass.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(fnComponentClass.getMetadata().getManifest(), "Manifest is available");
			assert.deepEqual(fnComponentClass.getMetadata().getManifest(), oExpectedManifest, "Manifest matches the manifest behind manifestUrl");
			assert.throws(function() {
				fnComponentClass.extend("new.Component", {});
			}, new Error("Extending Components created by Manifest is not supported!"), "Extend should raise an exception");

			var oComponent = new fnComponentClass();

			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(oComponent.getManifest(), "Manifest is available");
			assert.deepEqual(oComponent.getManifest(), oExpectedManifest, "Manifest matches the manifest behind manifestUrl");

			var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
			assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");

			done();

		});

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

	QUnit.test("Alternate URL for component (async)", function(assert) {

		var oServer = this.oServer;
		var oExpectedManifest = {
			"sap.app" : {
				"id" : "samples.components.oneview",
				"i18n": "someFolder/messagebundle.properties",
				// Note: Placeholders (e.g. {{title}}) are only replaced in "manifest first" + async mode (not sync!)
				// The corresponding i18n bundle is loaded relative to the manifest.json (manifestUrl)
				"title": "Title anyotherlocation2"
			}
		};

		// create an invalid registration for samples.components.config to see that the "url" parameter works
		sap.ui.loader.config({paths:{"samples/components/oneview":"test-resources/invalid/"}});

		//start test
		var done = assert.async();
		sap.ui.component.load({
			manifestUrl : "anyotherlocation2/manifest.json",
			url : "test-resources/sap/ui/core/samples/components/oneview/",
			async : true
		}).then(function(fnComponentClass) {

			assert.ok(fnComponentClass.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(fnComponentClass.getMetadata().getManifest(), "Manifest is available");
			assert.deepEqual(fnComponentClass.getMetadata().getManifest(), oExpectedManifest, "Manifest matches the manifest behind manifestUrl");
			assert.throws(function() {
				fnComponentClass.extend("new.Component", {});
			}, new Error("Extending Components created by Manifest is not supported!"), "Extend should raise an exception");

			var oComponent = new fnComponentClass();

			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(oComponent.getManifest(), "Manifest is available");
			assert.deepEqual(oComponent.getManifest(), oExpectedManifest, "Manifest matches the manifest behind manifestUrl");

			var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
			assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");

			done();

		});

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

	QUnit.test("On instance created callback / hook (async, no promise)", function(assert) {

		var oCallbackComponent;

		// set the instance created callback hook
		Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			oCallbackComponent = oComponent;

			assert.ok(true, "sap.ui.core.Component._fnOnInstanceCreated called!");
			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.deepEqual(vCallbackConfig, oConfig, "sap.ui.core.Component._fnOnInstanceCreated oConfig passed!");

			// All return values other than promises should be ignored
			return 123;
		};

		var oConfig = {
			manifestUrl: "anylocation/manifest.json",
			async: true
		};

		return sap.ui.component(oConfig).then(function(oComponent) {
			assert.equal(oComponent, oCallbackComponent, "Returned component instances should be the same as within callback.");
		});
	});

	QUnit.test("On instance created callback / hook (async, no promise, error)", function(assert) {

		// set the instance created callback hook
		Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			throw new Error("Error from _fnOnInstanceCreated");
		};

		return sap.ui.component({
			manifestUrl: "anylocation/manifest.json",
			async: true
		}).then(function(oComponent) {
			assert.ok(false, "Promise should not resolve");
		}, function(oError) {
			assert.equal(oError.message, "Error from _fnOnInstanceCreated", "Promise should reject with error from hook");
		});
	});

	QUnit.test("On instance created callback / hook (async, with promise)", function(assert) {

		var oCallbackComponent;

		// set the instance created callback hook
		Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {

			assert.ok(true, "sap.ui.core.Component._fnOnInstanceCreated called!");
			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.deepEqual(vCallbackConfig, oConfig, "sap.ui.core.Component._fnOnInstanceCreated oConfig passed!");

			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					// Delay setting reference to test is provided promise gets chained
					oCallbackComponent = oComponent;
					resolve();
				}, 0);
			});
		};

		var oConfig = {
			manifestUrl: "anylocation/manifest.json",
			async: true
		};

		return sap.ui.component(oConfig).then(function(oComponent) {
			assert.equal(oCallbackComponent, oComponent, "Returned component instances should be the same as within callback.");
		});
	});

	QUnit.test("On instance created callback / hook (async, with promise, error)", function(assert) {

		// set the instance created callback hook
		Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					reject(new Error("Error from _fnOnInstanceCreated"));
				}, 0);
			});
		};

		return sap.ui.component({
			manifestUrl: "anylocation/manifest.json",
			async: true
		}).then(function(oComponent) {
			assert.ok(false, "Promise should not resolve");
			delete Component._fnOnInstanceCreated;
		}, function(oError) {
			assert.equal(oError.message, "Error from _fnOnInstanceCreated", "Promise should reject with error from hook");
			delete Component._fnOnInstanceCreated;
		});
	});

	QUnit.test("Usage of manifest property in component configuration for URL", function(assert) {

		return sap.ui.component({
			manifest: "anylocation/manifest.json"
		}).then(function(oComponent) {
			assert.ok(true, "Component is loaded properly!");
		}, function(oError) {
			assert.ok(false, "Component should be loaded!");
		});

	});

	QUnit.test("Usage of manifest property in component configuration for manifest object", function(assert) {

		return sap.ui.component({
			manifest: {
				"sap.app" : {
					"id" : "samples.components.oneview"
				}
			}
		}).then(function(oComponent) {
			assert.equal(oComponent.getManifestObject().getComponentName(), "samples.components.oneview", "The proper component has been loaded!");
		}, function(oError) {
			assert.ok(false, "Component should be loaded!");
		});

	});

	QUnit.test("Usage of manifest property in component configuration for manifest object + resourceRoot url", function(assert) {

		sap.ui.define("samples/components/oneview2/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
			return UIComponent.extend("samples.components.oneview2.Component", {
				metadata: {
					manifest: {
						"sap.app" : {
							"id" : "samples.components.oneview2"
						}
					}
				}
			});
		});

		return sap.ui.component({
			name: "samples.components.oneview2",
			url: "/someUrl/oneview2",
			manifest: {
				"sap.app" : {
					"id" : "samples.components.oneview2"
				}
			}
		}).then(function(oComponent) {
			assert.equal(oComponent.getManifestObject().getComponentName(), "samples.components.oneview2", "The proper component has been loaded!");
			assert.equal(oComponent.getManifestObject()._oBaseUri.path(), "/someUrl/oneview2/", "Manifest baseURI is set correctly");
		}, function(oError) {
			assert.ok(false, "Component should be loaded!");
		});

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
	QUnit.test("Async creation of component usage", function(assert) {

		var oComponent = sap.ui.component({
			name : "my.usage"
		});
		var oSpy = sinon.spy(Component, "create");

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
				async: true,
				asyncHints: {},
				anything: "else"
			};
			var mSettings = jQuery.extend(true, {}, mConfig.settings, { componentData: mConfig.componentData });
			oComponent.createComponent(mConfig).then(function(oComponentUsage) {
				assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
				assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of my.used.Component");
				assert.equal(oComponent.getId(), Component.getOwnerIdFor(oComponentUsage), "ComponentUsage must be created with the creator Component as owner");
				assert.equal(1, oSpy.callCount, "Nested component created with instance factory function");
				assert.equal(true, oSpy.args[0][0].async, "Nested component created with config 'async: true'");
				assert.deepEqual(mConfig.settings, oSpy.args[0][0].settings, "ComponentUsage must receive the correct settings");
				assert.deepEqual(mSettings, oComponentUsage._mSettings, "ComponentUsage must receive the correct settings");
				assert.deepEqual(mConfig.componentData, oSpy.args[0][0].componentData, "ComponentUsage must receive the correct componentData");
				assert.equal(undefined, oSpy.args[0][0].asyncHints, "ComponentUsage must not receive \"asyncHints\"");
				assert.equal(undefined, oSpy.args[0][0].anything, "ComponentUsage must not receive \"anything\"");
				done();
			}).catch(function(oError) {
				assert.ok(false, "createComponent must not be failing!");
				done();
			});

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

	QUnit.test("Propagate cacheTokens: Async creation of sub component via createComponent()", function(assert) {
		return Component.create({
			name : "my.usage",
			manifest: false,
			asyncHints: {
				cacheTokens: {
					someToken: {}
				}
			}
		}).then(function(oComponent) {
			assert.ok(oComponent instanceof Component, "Component should be created");
			assert.ok(oComponent._mCacheTokens, "_mCacheTokens should be available");
			assert.deepEqual(oComponent._mCacheTokens.someToken, {}, "_mCacheTokens.someToken should be available");

			return oComponent.createComponent({
				usage: "mySubUsage",
				async: true,
				anything: "else"
			}).then(function(oSubComponent) {
				assert.ok(oSubComponent instanceof Component, "SubComponent should be created");
				assert.deepEqual(oSubComponent._mCacheTokens, {someToken: {}}, "_mCacheTokens of the SubComponent should be equal to the parent component (content-wise)");

				return oSubComponent.createComponent({
					usage: "mySubSubUsage",
					async: true,
					anything: "else"
				}).then(function(oSubSubComponent) {
					assert.ok(oSubSubComponent instanceof Component, "oSubSubComponent should be created");
					assert.deepEqual(oSubSubComponent._mCacheTokens, {someToken: {}}, "_mCacheTokens of the oSubSubComponent should be equal to the parent component (content-wise)");

					oComponent.destroy();
					oSubComponent.destroy();
					oSubSubComponent.destroy();
				});
			});
		});
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

	QUnit.test("Propagate cacheTokens: Async creation of sub component via Component.create()", function(assert) {
		return Component.create({
			name : "my.usage",
			asyncHints: {
				cacheTokens: {
					someToken: {}
				}
			}
		}).then(function(oRootComponent) {
			assert.ok(oRootComponent instanceof Component, "oRootComponent should be created");
			assert.ok(oRootComponent._mCacheTokens, "_mCacheTokens should be available");
			assert.deepEqual(oRootComponent._mCacheTokens.someToken, {}, "_mCacheTokens.someToken should be available");

			return oRootComponent.runAsOwner(function() {
				return Component.create({
					name: "my.used",
					asyncHints: {
						cacheTokens: {
							myOwnTokens: {}
						}
					}
				}).then(function(oSubComponent1) {
					assert.ok(oSubComponent1 instanceof Component, "oSubComponent1 should be created");
					assert.deepEqual(oSubComponent1._mCacheTokens, {myOwnTokens: {}}, "_mCacheTokens of the oSubComponent1 shouldn't be propagated from parent component oRootComponent");

					return oSubComponent1.runAsOwner(function() {
						return Component.create({
							name: "my.used"
						}).then(function(oSubComponent1_1) {
							assert.ok(oSubComponent1_1 instanceof Component, "oSubComponent1_1 should be created");
							assert.deepEqual(oSubComponent1_1._mCacheTokens, {myOwnTokens: {}}, "_mCacheTokens of the oSubComponent1_1 should be equal to parent component oSubComponent1");

							oRootComponent.destroy();
							oSubComponent1.destroy();
							oSubComponent1_1.destroy();
						});
					});
				});
			});
		});
	});

	QUnit.test("Propagate cacheTokens: Async creation of sub component via runAsOwner()", function(assert) {
		return Component.create({
			name : "my.usage",
			manifest: false,
			asyncHints: {
				cacheTokens: {
					someToken: {}
				}
			}
		}).then(function(oComponent) {
			assert.ok(oComponent instanceof Component, "Component should be created");
			assert.ok(oComponent._mCacheTokens, "_mCacheTokens should be available");
			assert.deepEqual(oComponent._mCacheTokens.someToken, {}, "_mCacheTokens.someToken should be available");

			return oComponent.runAsOwner(function() {
				return Component.create({
					name: "my.used"
				}).then(function(oSubComponent) {
					assert.ok(oSubComponent instanceof Component, "SubComponent should be created");
					assert.deepEqual(oSubComponent._mCacheTokens, {someToken: {}}, "_mCacheTokens of the SubComponent should be equal to the parent component (content-wise)");
					oComponent.destroy();
					oSubComponent.destroy();
				});
			});
		});
	});

	QUnit.test("Component.create - Async creation of component usage", function(assert) {

		var done = (function() {
			var asyncDone = assert.async();
			return function cleanup(oComponent, oSpy) {
				oSpy.restore();
				oComponent.destroy();
				asyncDone();
			};
		})();

		Component.create({
			name : "my.usage",
			manifest: false
		}).then(function (oComponent) {
			var oSpy = sinon.spy(Component, "create");

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
					asyncHints: {},
					anything: "else"
				};
				var mSettings = jQuery.extend(true, {}, mConfig.settings, { componentData: mConfig.componentData });
				oComponent.createComponent(mConfig).then(function(oComponentUsage) {
					assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
					assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of my.used.Component");
					assert.equal(oComponent.getId(), Component.getOwnerIdFor(oComponentUsage), "ComponentUsage must be created with the creator Component as owner");
					assert.equal(1, oSpy.callCount, "Nested component created with instance factory function");
					assert.equal(true, oSpy.args[0][0].async, "Nested component created with config 'async: true'");
					assert.deepEqual(mConfig.settings, oSpy.args[0][0].settings, "ComponentUsage must receive the correct settings");
					assert.deepEqual(mSettings, oComponentUsage._mSettings, "ComponentUsage must receive the correct settings");
					assert.deepEqual(mConfig.componentData, oSpy.args[0][0].componentData, "ComponentUsage must receive the correct componentData");
					assert.equal(undefined, oSpy.args[0][0].asyncHints, "ComponentUsage must not receive \"asyncHints\"");
					assert.equal(undefined, oSpy.args[0][0].anything, "ComponentUsage must not receive \"anything\"");
					done(oComponent, oSpy);
				}).catch(function(oError) {
					assert.ok(false, "createComponent must not be failing!");
					done(oComponent, oSpy);
				});

			});
		});

	});

	QUnit.test("Component.create - Async creation of component usage via usageId", function(assert) {

		var done = (function() {
			var asyncDone = assert.async();
			return function cleanup(oComponent, oSpy) {
				oSpy.restore();
				oComponent.destroy();
				asyncDone();
			};
		})();

		Component.create({
			name : "my.usage",
			manifest: false
		}).then(function (oComponent) {
			var oSpy = sinon.spy(Component, "create");

			sap.ui.require([
				"my/used/Component"
			], function(UsedComponent) {

				oComponent.createComponent("myUsage").then(function(oComponentUsage) {
					assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
					assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of my.used.Component");
					assert.equal(Component.getOwnerIdFor(oComponentUsage), oComponent.getId(), "ComponentUsage must be created with the creator Component as owner");
					assert.equal(oSpy.callCount, 1, "Nested component created with instance factory function");
					assert.equal(oSpy.args[0][0].async, true, "Nested component created with config 'async: true'");
					done(oComponent, oSpy);
				}).catch(function(oError) {
					assert.ok(false, "createComponent must not be failing!");
					done(oComponent, oSpy);
				});

			});
		});

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
			var mSettings = jQuery.extend(true, {}, mConfig.settings, { componentData: mConfig.componentData });
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

	QUnit.test("Preload non-lazy component usages", function(assert) {

		var oComponent;
		var oSpy = sinon.spy(sap.ui.loader._, "loadJSResourceAsync");
		var done = (function() {
			var asyncDone = assert.async();
			return function cleanup() {
				oSpy.restore();
				oComponent.destroy();
				asyncDone();
			};
		})();

		sap.ui.component({
			name : "my.preloadusage",
			manifest: "anylocation/manifest.json"
		}).then(function(oPreloadComponent) {

			oComponent = oPreloadComponent;

			//console.log(oSpy.calls);
			assert.ok(oSpy.calledOnceWithExactly("nonLazyUsage/Component-preload.js", true), "Only the non-lazy component usage should be preloaded!");

			done();

		});

	});


	QUnit.module("Models", {
		beforeEach : function() {

			//setup fake server
			var oManifest = this.oManifest = {
				"sap.app" : {
					"id" : "samples.components.button"
				},
				"sap.ui5": {
					"models": {
						"i18n-component": {
							"type": "sap.ui.model.resource.ResourceModel",
							"settings": {
								"bundleUrl": "i18n/i18n.properties",
								"enhanceWith": [
									{
										"bundleUrl": "custom/i18n.properties"
									},
									{
										"bundleUrl": "other/i18n.properties",
										"bundleUrlRelativeTo": "manifest"
									}
								]
							}
						},
						"i18n-manifest": {
							"type": "sap.ui.model.resource.ResourceModel",
							"settings": {
								"bundleUrl": "i18n/i18n.properties",
								"enhanceWith": [
									{
										"bundleUrl": "custom/i18n.properties",
										"bundleUrlRelativeTo": "manifest"
									},
									{
										"bundleUrl": "other/i18n.properties"
									}
								]
							}
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
				return (
					url !== "anylocation/manifest.json?sap-language=EN" &&
					!/\.properties(\?.*)?$/.test(url)
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
			oServer.respondWith("GET", /\.properties(\?.*)?$/, [
				200,
				{
					"Content-Type": "text/plain"
				},
				""
			]);

		},
		afterEach : function() {}
	});


	QUnit.test("Relative URLs for ResourceModel (enhanceWith)", function(assert) {

		var oModelConfigSpy = this.spy(Component, "_createManifestModelConfigurations");

		// load the test component
		return Component.create({
			manifest : "anylocation/manifest.json"
		}).then(function(oComponent) {

			var aI18NCmpEnhanceWith = oModelConfigSpy.returnValues[0]["i18n-component"].settings[0].enhanceWith;
			assert.strictEqual(aI18NCmpEnhanceWith[0].bundleUrl, "test-resources/sap/ui/core/samples/components/button/custom/i18n.properties", "Bundle URL of enhancing model must not be modified!");
			assert.strictEqual(aI18NCmpEnhanceWith[1].bundleUrlRelativeTo, "manifest", "Bundle URL should be relative to manifest!");
			assert.strictEqual(aI18NCmpEnhanceWith[1].bundleUrl, "anylocation/other/i18n.properties", "Bundle URL of enhancing model must not be modified!");

			var aI18NMFEnhanceWith = oModelConfigSpy.returnValues[0]["i18n-manifest"].settings[0].enhanceWith;
			assert.strictEqual(aI18NMFEnhanceWith[0].bundleUrlRelativeTo, "manifest", "Bundle URL should be relative to manifest!");
			assert.strictEqual(aI18NMFEnhanceWith[0].bundleUrl, "anylocation/custom/i18n.properties", "Bundle URL of enhancing model must be adopted relative to manifest!");
			assert.strictEqual(aI18NMFEnhanceWith[1].bundleUrl, "test-resources/sap/ui/core/samples/components/button/other/i18n.properties", "Bundle URL of enhancing model must not be modified!");

			oComponent.destroy();
		});
	});

	QUnit.test("Relative URLs for Manifest object", function(assert) {

		// load the test component
		return Component.create({
			manifest : this.oManifest,
			altManifestUrl : "manifest/from/lrep/manifest.json"
		}).then(function(oComponent) {

			assert.strictEqual(oComponent.getManifestObject().resolveUri("test"), "test-resources/sap/ui/core/samples/components/button/test", "URL is properly resolved to Component!");
			assert.strictEqual(oComponent.getManifestObject().resolveUri("test", "manifest"), "manifest/from/lrep/test", "URL is properly resolved to Manifest!");

			oComponent.destroy();
		});
	});

	QUnit.module("Register Module Paths");

	QUnit.test("Component.load with URL should not override final resource paths", function(assert) {

		// Prepare
		sap.ui.require.preload({
			"test/resourceRoots/component1/manifest.json": JSON.stringify({
				"sap.app": {
					"id": "test.resourceRoots.component1"
				}
			})
		});
		sap.ui.define("test/resourceRoots/component1/Component", ["sap/ui/core/Component"], function(Component) {
			return Component.extend("test.resourceRoots.component1.Component", {
				metadata: {
					manifest: "json"
				}
			});
		});

		// Register final resourceRoot
		jQuery.sap.registerModulePath("test.resourceRoots.component1", {
			"url": "/final/test/resourceRoots/component1",
			"final": true
		});

		// load the component and pass new URL
		return Component.load({
			name: "test.resourceRoots.component1",
			url: "/new/test/resourceRoots/component1"
		}).then(function() {

			assert.equal(sap.ui.require.toUrl("test/resourceRoots/component1"), "/final/test/resourceRoots/component1",
				"Passing an URL should not override final resourceRoots");

		});
	});

	QUnit.test("Component.create with URL should not override final resource paths", function(assert) {

		// Prepare
		sap.ui.require.preload({
			"test/resourceRoots/component2/manifest.json": JSON.stringify({
				"sap.app": {
					"id": "test.resourceRoots.component2"
				}
			})
		});
		sap.ui.define("test/resourceRoots/component2/Component", ["sap/ui/core/Component"], function(Component) {
			return Component.extend("test.resourceRoots.component2.Component", {
				metadata: {
					manifest: "json"
				}
			});
		});

		// Register final resourceRoot
		jQuery.sap.registerModulePath("test.resourceRoots.component2", {
			"url": "/final/test/resourceRoots/component2",
			"final": true
		});

		// load the component and pass new URL
		return Component.create({
			name: "test.resourceRoots.component2",
			url: "/new/test/resourceRoots/component2"
		}).then(function() {

			assert.equal(sap.ui.require.toUrl("test/resourceRoots/component2"), "/final/test/resourceRoots/component2",
				"Passing an URL should not override final resourceRoots");

		});
	});

	QUnit.test("Component.create with asyncHints.components should respect final URL flag (legacy scenario)", function(assert) {

		// Prepare
		sap.ui.require.preload({
			"test/resourceRoots/component3/manifest.json": JSON.stringify({
				"sap.app": {
					"id": "test.resourceRoots.component3"
				}
			}),
			"test/resourceRoots/component3/Component.js": function() {
				sap.ui.component.load({
					name: "test.resourceRoots.parentcomponent1",
					url: "/new/test/resourceRoots/parentcomponent1"
				});
				test.resourceRoots.parentcomponent1.Component.extend("test.resourceRoots.component3.Component", { // eslint-disable-line no-undef
					metadata: {
						manifest: "json"
					}
				});
			}
		});

		sap.ui.require.preload({
			"test/resourceRoots/parentcomponent1/manifest.json": JSON.stringify({
				"sap.app": {
					"id": "test.resourceRoots.parentcomponent1"
				}
			})
		});
		// Using predefine to make module available synchronously
		sap.ui.predefine("test/resourceRoots/parentcomponent1/Component", ["sap/ui/core/Component"], function(Component) {
			return Component.extend("test.resourceRoots.parentcomponent1.Component", {
				metadata: {
					manifest: "json"
				}
			});
		});

		return sap.ui.component({
			name: "test.resourceRoots.component3",
			asyncHints: {
				components: [
					{
						"name": "test.resourceRoots.parentcomponent1",
						"lazy": false,
						"url": {
							"url": "/final/test/resourceRoots/parentcomponent1",
							"final": true
						}
					}
				]
			},
			async: true
		}).then(function() {

			assert.equal(sap.ui.require.toUrl("test/resourceRoots/parentcomponent1"), "/final/test/resourceRoots/parentcomponent1",
				"Passing asyncHints with final URL should register final resourceRoot");

		});
	});


	QUnit.module("Window Event Handler", {
		beforeEach: function() {
			this.jQueryBindSpy = this.spy(jQuery.prototype, "bind");
			this.jQueryUnbindSpy = this.spy(jQuery.prototype, "unbind");
		}
	});

	QUnit.test("onWindowError", function(assert) {
		var MyOnWindowErrorComponent = Component.extend("test.onWindowError.Component");

		MyOnWindowErrorComponent.prototype.onWindowError = sinon.stub();

		this.oComponent = new MyOnWindowErrorComponent();

		assert.equal(typeof this.oComponent._fnWindowErrorHandler, "function", "Handler has been created");
		sinon.assert.calledWithExactly(this.jQueryBindSpy, "error", this.oComponent._fnWindowErrorHandler);
		assert.equal(this.jQueryBindSpy.getCall(0).thisValue.get(0), window, "jQuery bind has been called on the window object");

		this.oComponent._fnWindowErrorHandler({
			originalEvent: {
				message: "Some error",
				filename: "foo.js",
				lineno: 123
			}
		});
		sinon.assert.calledOnce(this.oComponent.onWindowError);
		sinon.assert.calledWithExactly(this.oComponent.onWindowError,
			"Some error", "foo.js", 123);


		var handler = this.oComponent._fnWindowErrorHandler;

		this.oComponent.destroy();

		assert.equal(this.oComponent._fnWindowErrorHandler, undefined, "Handler has been removed");
		sinon.assert.calledWithExactly(this.jQueryUnbindSpy, "error", handler);
		assert.equal(this.jQueryUnbindSpy.getCall(0).thisValue.get(0), window, "jQuery unbind has been called on the window object");
	});

	QUnit.test("onWindowBeforeUnload", function(assert) {
		var MyOnWindowBeforeUnloadComponent = Component.extend("test.onWindowBeforeUnload.Component");

		MyOnWindowBeforeUnloadComponent.prototype.onWindowBeforeUnload = sinon.stub();

		this.oComponent = new MyOnWindowBeforeUnloadComponent();

		assert.equal(typeof this.oComponent._fnWindowBeforeUnloadHandler, "function", "Handler has been created");
		sinon.assert.calledWithExactly(this.jQueryBindSpy, "beforeunload", this.oComponent._fnWindowBeforeUnloadHandler);
		assert.equal(this.jQueryBindSpy.getCall(0).thisValue.get(0), window, "jQuery bind has been called on the window object");

		var oFakeEvent = {};
		this.oComponent._fnWindowBeforeUnloadHandler(oFakeEvent);
		sinon.assert.calledOnce(this.oComponent.onWindowBeforeUnload);
		sinon.assert.calledWithExactly(this.oComponent.onWindowBeforeUnload, oFakeEvent);


		var handler = this.oComponent._fnWindowBeforeUnloadHandler;

		this.oComponent.destroy();

		assert.equal(this.oComponent._fnWindowBeforeUnloadHandler, undefined, "Handler has been removed");
		sinon.assert.calledWithExactly(this.jQueryUnbindSpy, "beforeunload", handler);
		assert.equal(this.jQueryUnbindSpy.getCall(0).thisValue.get(0), window, "jQuery unbind has been called on the window object");
	});

	QUnit.test("onWindowUnload", function(assert) {
		var MyOnWindowUnloadComponent = Component.extend("test.onWindowUnload.Component");

		MyOnWindowUnloadComponent.prototype.onWindowUnload = sinon.stub();

		this.oComponent = new MyOnWindowUnloadComponent();

		assert.equal(typeof this.oComponent._fnWindowUnloadHandler, "function", "Handler has been created");
		sinon.assert.calledWithExactly(this.jQueryBindSpy, "unload", this.oComponent._fnWindowUnloadHandler);
		assert.equal(this.jQueryBindSpy.getCall(0).thisValue.get(0), window, "jQuery bind has been called on the window object");

		var oFakeEvent = {};
		this.oComponent._fnWindowUnloadHandler(oFakeEvent);
		sinon.assert.calledOnce(this.oComponent.onWindowUnload);
		sinon.assert.calledWithExactly(this.oComponent.onWindowUnload, oFakeEvent);


		var handler = this.oComponent._fnWindowUnloadHandler;

		this.oComponent.destroy();

		assert.equal(this.oComponent._fnWindowUnloadHandler, undefined, "Handler has been removed");
		sinon.assert.calledWithExactly(this.jQueryUnbindSpy, "unload", handler);
		assert.equal(this.jQueryUnbindSpy.getCall(0).thisValue.get(0), window, "jQuery unbind has been called on the window object");
	});

	QUnit.module("Component Registry", {
		beforeEach: function () {
			cleanUpRegistry();
		},
		afterEach: function() {
			cleanUpRegistry();
		}
	});

	QUnit.test("Component registry access", function(assert) {
		var oFooA = new Component("A");
		var oFooB = new Component("B");
		var oFooC = new Component("C");
		var fnCallbackSpy = this.spy(function() {});
		var aFilteredComponents = [];

		assert.ok(Component.hasOwnProperty("registry"), "Component has static method to access registry");
		assert.equal(Component.registry.size, 3, "Return number of registered component instances");
		assert.deepEqual(Object.keys(Component.registry.all()).sort(), ["A", "B", "C"], "Return all registered component instances");
		assert.ok(Component.registry.get("B") === oFooB, "Return reference of component B from registry by ID");

		Component.registry.forEach(fnCallbackSpy);
		assert.ok(fnCallbackSpy.calledThrice, "Callback was executed 3 times");

		aFilteredComponents = Component.registry.filter(function(oComponent) {
			return ["B", "C"].indexOf(oComponent.getId()) > -1;
		});

		assert.equal(aFilteredComponents.length, 2, "Return 2 components matching the filter criteria");

		oFooA.destroy();
		oFooB.destroy();
		oFooC.destroy();
	});

	QUnit.module("Hook _fnPreprocessManifest", {
		afterEach: function() {
			Component._fnPreprocessManifest = null;
		}
	});

	QUnit.test("Hook is called when manifest is given in config object (Hook modifies the manifest)", function(assert) {
		var oManifestJSON = {
			"sap.app": {
				"id": "sap.ui.test.other",
				"type": "application",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},
			"sap.ui5": {
				"resources": {
					"css": [
						{
							"uri": "style3.css"
						}
					]
				},
				"models": {
					"myModel": {
						"type": "sap.ui.model.odata.ODataModel",
						"uri": "./some/odata/service"
					}
				}
			}
		};

		Component._fnPreprocessManifest = function(oManifestJSON) {
			// To test if the modification is correctly passed back to the
			// Component's manifest processing, we just change the class of a given model v1 -> v2
			oManifestJSON["sap.ui5"]["models"]["myModel"].type = "sap.ui.model.odata.v2.ODataModel";

			return Promise.resolve(oManifestJSON);
		};

		return Component.create({
			name: "sap.ui.test.other",
			manifest: oManifestJSON
		}).then(function(oComponent) {
			// check if the modification was correctly taken over
			var oModel = oComponent.getModel("myModel");
			assert.ok(oModel.isA("sap.ui.model.odata.v2.ODataModel"), "Manifest was modified to use v2 instead of v1 ODataModel.");
		});
	});

	QUnit.test("Hook is called when manifest is loaded from the default location (Hook modifies the manifest)", function(assert) {
		// register hook and modify the manifest
		Component._fnPreprocessManifest = function(oManifestJSON) {
			// To test if the modification is correctly passed back to the
			// Component's manifest processing, we just change the class of a given model v1 -> v2
			oManifestJSON["sap.ui5"]["models"]["sfapi"].type = "sap.ui.model.odata.v2.ODataModel";

			return Promise.resolve(oManifestJSON);
		};

		// loading manifest from default location
		return Component.create({
			name: "sap.ui.test.v2"
		}).then(function(oComponent) {
			// check if the modification was correctly taken over
			var oModel = oComponent.getModel("sfapi");
			assert.ok(oModel.isA("sap.ui.model.odata.v2.ODataModel"), "Manifest was modified to use v2 instead of v1 ODataModel.");
		});
	});

	QUnit.test("Hook is called when manifest is loaded from the given manifest URL", function(assert) {
		var sManifestUrl = sap.ui.require.toUrl("sap/ui/test/v2/manifest.json");

		// register hook and modify the manifest
		Component._fnPreprocessManifest = function(oManifestJSON) {
			// To test if the modification is correctly passed back to the
			// Component's manifest processing, we just change the class of a given model v1 -> v2
			oManifestJSON["sap.ui5"]["models"]["sfapi"].type = "sap.ui.model.odata.v2.ODataModel";

			return Promise.resolve(oManifestJSON);
		};

		return Component.create({
			name: "sap.ui.test.v2",
			manifest: sManifestUrl
		}).then(function(oComponent) {
			// check if the modification was correctly taken over
			var oModel = oComponent.getModel("sfapi");
			assert.ok(oModel.isA("sap.ui.model.odata.v2.ODataModel"), "Manifest was modified to use v2 instead of v1 ODataModel.");
		});
	});

	QUnit.test("When hook returns a rejected promise, it should also reject the Component.create with same reason", function(assert) {
		var sRejectReason = "Rejected from preprocess manifest";

		Component._fnPreprocessManifest = function() {
			return Promise.reject(sRejectReason);
		};
		this.oPreprocessManifestSpy = this.spy(Component, "_fnPreprocessManifest");

		return Component.create({
			name: "sap.ui.test.v2empty"
		}).then(function() {
			assert.ok(false, "shouldn't reach here");
		}, function(sReason) {
			assert.equal(sReason, sRejectReason, "Promise is rejected with the correct reason");
			this.oPreprocessManifestSpy.restore();
		}.bind(this));
	});

	QUnit.test("When hook causes unhandled errors, it should also reject the Component.create", function(assert) {
		var sErrorText = "Uncaught TypeError: o.x is not a function";

		Component._fnPreprocessManifest = function() {
			// provoke unhandled error
			throw new Error(sErrorText);
		};

		// spy to check if we logged the error for debugging
		var oLogSpy = this.spy(Log, "error");

		return Component.create({
			name: "sap.ui.test.v2empty"
		}).then(function() {
			assert.ok(false, "shouldn't reach here");
		}).catch(function(oError) {
			assert.equal(oError.message, sErrorText, "Error was thrown, and Promise is rejected with the correct reason");
			assert.ok(oLogSpy.calledWithExactly("Failed to execute flexibility hook for manifest preprocessing.", oError), "Correct Error was logged for supportability");
			oLogSpy.restore();
		});
	});

	QUnit.module("Commands in manifest", {
		beforeEach: function () {
			cleanUpRegistry();
		},
		afterEach: function() {
			cleanUpRegistry();
		}
	});

	QUnit.test("getCommand", function(assert) {
		assert.expect(3);
		var done = assert.async();
		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(oComponent) {
			assert.equal(Object.keys(oComponent.getCommand()).length, 2, "Two commands found");
			assert.equal(oComponent.getCommand("Save").shortcut, "Ctrl+S", "Save command found");
			assert.equal(oComponent.getCommand("Cancel").shortcut, "Ctrl+C", "Cancel command found");
			done();
		});
	});

	QUnit.test("$cmd model", function(assert) {
		assert.expect(1);
		var done = assert.async();
		// load the test component
		return Component.create({
			name: "my.command",
			manifest: false
		}).then(function(oComponent) {
			assert.ok(oComponent.getModel("$cmd"), "$cmd model created successfully");
			done();
		});
	});
});
