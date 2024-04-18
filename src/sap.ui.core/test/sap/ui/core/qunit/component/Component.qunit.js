sap.ui.define([
	'sap/ui/qunit/utils/createAndAppendDiv',
	"sap/ui/qunit/utils/nextUIUpdate",
	'sap/ui/core/Component',
	'sap/ui/core/Supportability',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/ComponentRegistry',
	'sap/ui/core/Messaging',
	'sap/ui/core/UIComponentMetadata',
	'sap/ui/test/routing/Component',
	'sap/ui/test/routing/RouterExtension',
	'sap/base/Log',
	'sap/base/util/deepExtend',
	'sap/base/util/LoaderExtensions',
	'sap/ui/core/Manifest',
	'sap/base/i18n/ResourceBundle',
	'sap/ui/VersionInfo'
], function (createAndAppendDiv, nextUIUpdate, Component, Supportability, ComponentContainer, ComponentRegistry, Messaging, UIComponentMetadata, SamplesRoutingComponent, SamplesRouterExtension, Log, deepExtend, LoaderExtensions, Manifest, ResourceBundle, VersionInfo) {

	"use strict";
	/*global sinon, QUnit, foo*/

	function cleanUpRegistry() {
		ComponentRegistry.forEach(function(oComponent) {
			oComponent.destroy();
		});
	}

	createAndAppendDiv(["comparea1", "comparea2"]);

	//******************************************************
	//Test preparation for custom component configuration
	var TestComp1 = Component.extend("test.comp1.Component", {
		metadata: {
			"version": "1.0",
			"properties" : {
				"test" : "string"
			},
			"my.custom.config" : {
				"property1" : "value1",
				"property2" : "value2"
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
			return Component.create({
				name: "sap.ui.test.verticalLayout",
				id: "vLayout",
				componentData: {
					"foo": "bar"
				}
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
		var resources = {
			css: [{ uri: "css/vlayout.css" }],
			js: [{ uri: "/js/includeme.js" }]
		};
		var components =  {
			"samples.components.styledbutton" : {}
		};
		var oComp = this.oComp;
		assert.equal(oComp.getManifestEntry("/sap.app/applicationVersion/version"), "1.0", "Version retrieved");
		assert.deepEqual(oComp.getManifestEntry("/sap.ui5/resources"), resources, "Resources retrieved");
		assert.notEqual(oComp.getManifestEntry("/sap.ui5/dependencies"), null, "Dependencies retrieved");
		assert.deepEqual(oComp.getManifestEntry("/sap.ui5/dependencies/components"), components, "Child components retrieved");
		assert.equal(oComp.getManifestEntry("/sap.ui5/dependencies/minUI5Version"), "1.13.0", "UI5 Version retrieved");
	});

	QUnit.test("Components Includes", function(assert){
		assert.ok(typeof foo == 'function', "function foo from included js exists");
		assert.equal(foo(), "bar", "function from JS include invoked");
		var oLink = document.querySelector(
			"link[data-sap-ui-manifest-uid='" + this.oComp.getManifestObject()._uid + "']"
		);
		assert.ok(oLink, "Stylsheet from include has been inserted");
		assert.equal(oLink.getAttribute("href"),
			"test-resources/sap/ui/core/qunit/component/testdata/verticalLayout/css/vlayout.css",
			"Stylesheet with correct href has been inserted"
		);
	});

	QUnit.test("Factory Function", function(assert){
		var oComp = this.oComp;
		var oComponent = Component.getComponentById(oComp.getId());
		assert.equal(oComponent, oComp, "Factory function returns the same instance!");

		return Component.create({
			name: "sap.ui.test.verticalLayout",
			id: "factoryVLayout"
		}).then(function() {
			assert.ok(!!oComponent, "Component has been created!");
			assert.equal(oComponent.getMetadata(), oComp.getMetadata(), "Component is equal!");
		});
	});

	QUnit.test("Component Data", function(assert){
		var oComp = this.oComp;
		var oCompCont1 = this.oCompCont1;
		assert.ok(!!oComp.getComponentData(), "Component has component data");
		assert.equal(oComp.getComponentData().foo, "bar", "Component data is correct");
		var oComponent = ComponentRegistry.get(oCompCont1.getComponent());
		assert.ok(!!oComponent.getComponentData(), "Component has component data");
		assert.equal(oComponent.getComponentData().foo, "bar", "Component data is correct");
	});

	QUnit.test("Create instance without factory", function(assert) {

		var oComponent = new TestComp1();

		assert.equal(oComponent.getMetadata(), TestComp1.getMetadata(), "getMetadata returns static Metadata");
		assert.deepEqual(oComponent.getManifest(), TestComp1.getMetadata()._getManifest(), "_getManifest() returns static Metadata manifest");

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

	QUnit.module("Routing classes: Loading behavior", {
		/**
		 * @deprecated since 1.120
		 */
		beforeEach() {
			this.requireSyncSpy = sinon.spy(sap.ui, "requireSync");
		},
		/**
		 * @deprecated since 1.120
		 */
		afterEach() {
			this.requireSyncSpy.restore();
		}
	});

	QUnit.test("[Router] manifest = false", async function(assert) {
		const oComp = await Component.create({
			name: "sap.ui.test.routerPreloading",
			manifest: false
		});

		assert.ok(oComp.getRouter().isA("sap.m.routing.Router"), "sap.m.routing.Router was correctly instantiated");

		/** @deprecated since 1.120 */
		assert.equal(this.requireSyncSpy.callCount, 0, "No sync request issued");

		oComp.destroy();
	});

	QUnit.test("[Router] manifest = true", async function(assert) {
		const oComp = await Component.create({
			name: "sap.ui.test.routerPreloading"
			// manifest: true // implicitly set
		});

		assert.ok(oComp.getRouter().isA("sap.m.routing.Router"), "sap.m.routing.Router was correctly instantiated");

		/** @deprecated since 1.120 */
		assert.equal(this.requireSyncSpy.callCount, 0, "No sync request issued");

		oComp.destroy();
	});

	QUnit.test("[Targets] manifest = false", async function(assert) {
		const oComp = await Component.create({
			name: "sap.ui.test.targetsPreloading",
			manifest: false
		});

		assert.ok(oComp.getTargets().isA("sap.m.routing.Targets"), "sap.m.routing.Router was correctly instantiated");

		/** @deprecated since 1.120 */
		assert.equal(this.requireSyncSpy.callCount, 0, "No sync request issued");

		oComp.destroy();
	});

	QUnit.test("[Targets] manifest = true", async function(assert) {
		const oComp = await Component.create({
			name: "sap.ui.test.targetsPreloading",
			manifest: false
		});

		assert.ok(oComp.getTargets().isA("sap.m.routing.Targets"), "sap.m.routing.Router was correctly instantiated");

		/** @deprecated since 1.120 */
		assert.equal(this.requireSyncSpy.callCount, 0, "No sync request issued");

		oComp.destroy();
	});

	QUnit.module("Special Cases & Compatibility Check", {
		before: function() {
			// Root View
			sap.ui.define("sap/test/HandleValidationRootView", ["sap/ui/core/mvc/View", "sap/m/Button"], function(View, Button) {
				return View.extend("sap.test.HandleValidationRootView", {
					createContent: function() {
						return Promise.resolve(new Button());
					}
				});
			});

			// Component Class
			sap.ui.define("sap/test/handleValidation/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
				return UIComponent.extend("sap.test.handleValidation.Component", {
					metadata: {
						manifest: {
							"sap.ui5": {
								"dependencies": {
									"libs": {
										"sap.ui.core": {},
										"sap.m": {}
									}
								},
								"handleValidation": false,
								"rootView": {
									"viewName": "module:sap/test/HandleValidationRootView",
									"async": true
								}
							}
						}
					}
				});
			});
		},
		afterEach: function() {
			// Clear all messages so the tests don't interfere with eachother
			Messaging.removeAllMessages();
		}
	});

	QUnit.test("handleValidation - Standard Component Manifest", function(assert) {
		var oComponentGeneric;

		return Component.create({
			name: "sap.test.handleValidation",
			id: "componentGeneric"
		}).then(function(oComp) {
			oComponentGeneric = oComp;
			assert.ok(oComp, "Component created.");
			assert.strictEqual(false, oComp.getManifestEntry("/sap.ui5/handleValidation"), "Correct handleValidation value was returned on instance: false");

			// fire a validation error -> should NOT create a Message via Messaging
			// the Component has set "handleValidation" to <false> and thus is not registered to the
			// Messaging
			oComp.fireValidationError({
				element: oComp,
				property: "handleValidationTest",
				newValue: false
			});

			var aMessages = Messaging.getMessageModel().getData();

			assert.equal(aMessages.length, 0, "No messages must be created. The Component should not be registered to the Messaging.");

		}).finally(function() {
			oComponentGeneric.destroy();
		});
	});

	QUnit.test("handleValidation - Instance-Specific Manifest", function(assert) {
		var oComponentInstanceSpecific;

		return Component.create({
			id: "componentSpecific",
			manifest: {
				"sap.app": {
					id: "sap.test.handleValidation",
					type: "application"
				},
				"sap.ui5": {
					"dependencies": {
						"libs": {
							"sap.ui.core": {},
							"sap.m": {}
						}
					},
					"handleValidation": true,
					"rootView": {
						"viewName": "module:sap/test/HandleValidationRootView",
						"async": true
					}
				}
			}
		}).then(function(oComp) {
			oComponentInstanceSpecific = oComp;
			assert.ok(oComp, "Component created.");
			assert.strictEqual(true, oComp.getManifestEntry("/sap.ui5/handleValidation"), "Correct handleValidation value was returned on instance: true");

			// fire a validation error -> should create a Message via the Messaging
			// the Component has set "handleValidation" to <true> and thus is automatically registered to the
			// Messaging
			oComp.fireValidationError({
				element: oComp,
				property: "handleValidationTest",
				newValue: true
			});

			var aMessages = Messaging.getMessageModel().getData();

			assert.equal(aMessages.length, 1, "One messages must be created. The Component is automatically registered to the Messaging.");

		}).finally(function() {
			oComponentInstanceSpecific.destroy();
		});
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
			assert.ok(/Error from test\/inline\/errorHandling1\/Component/.test(oError.message),
				"Error from Component.js should be propagated");
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
			assert.ok(/Error from test\/inline\/errorHandling2\/Component/.test(oError.message),
				"Error from Component.js should be propagated");
		});

	});

	QUnit.module("Creation Context", {
		beforeEach: function() {
			return Component.create({
				name: "sap.ui.test.verticalLayout",
				id: "vLayout",
				componentData: {
					"foo": "bar"
				}
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
		var sRefComponentId = Component.getOwnerIdFor(oLayout);
		assert.equal(this.oComp.getId(), sRefComponentId, "The nested control has the correct component context");
		// check the nested component having the ID of the parent component
		var oNestedComponentContainer = this.oComp.byId("ContButton");
		var sNestedComponentId = oNestedComponentContainer.getComponent();
		var oNestedComponent = Component.getComponentById(sNestedComponentId);
		assert.equal(sRefComponentId, Component.getOwnerIdFor(oNestedComponent), "The nested component has the correct component context");
		// check the control in the nested component to have the correct component context
		var oNestedControl = oNestedComponent.byId("mybutn");
		assert.equal(sNestedComponentId, Component.getOwnerIdFor(oNestedControl), "The nested control has the correct component context");
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

	QUnit.module("Routing - General", {
		beforeEach : function () {
			// System under test
			return Component.create({
				name: "sap.ui.test.routing"
			}).then(function(oComponent) {
				this.oComponent = oComponent;
			}.bind(this));
		},
		afterEach: function() {
			this.oComponent.destroy();
		}
	});

	QUnit.test("Should create a custom router class", function(assert) {
		var oRouter = this.oComponent.getRouter();
		var pTargetParentId = oRouter._oConfig.targetParent;
		var oView = this.oComponent.getRootControl();

		return pTargetParentId.then(function(sId) {
			//Assert
			assert.ok(oRouter instanceof SamplesRouterExtension, "the created router was an extension");
			assert.strictEqual(sId, oView.getId(), "the viewid is the targetParent");

			//Cleanup
			this.oComponent.destroy();
			assert.ok(oRouter.bIsDestroyed, "Router got destroyed when the component is destroyed");
		}.bind(this));
	});

	QUnit.test("Should return the targets instance of the router", function (assert) {
		//Act - initialize the component to create the router
		var oTargets = this.oComponent.getTargets();
		var oTarget = oTargets.getTarget("myTarget");
		var pTargetRootViewId = oTarget._oOptions.rootView;
		var oView = this.oComponent.getRootControl();

		return pTargetRootViewId.then(function(sId) {
			//Assert
			assert.ok(oTargets, "the component created targets");
			assert.ok(oTarget, "the component created a target instance");
			assert.strictEqual(sId, oView.getId(), "the viewid is the rootView");

			//Cleanup
			this.oComponent.destroy();
			assert.ok(oTargets.bIsDestroyed, "Targets got destroyed when the component is destroyed");
		}.bind(this));
	});

	QUnit.module("Routing - Targets", {
		beforeEach : function (assert) {
			var done = assert.async();
			var that = this;
			sap.ui.require(["sap/m/routing/Targets"], function() {
				// System under test
				Component.create({
					name: "sap.ui.test.routing.targets",
					async: true
				}).then(function(oComponent) {
					that.oComponent = oComponent;
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
		var oTarget = oTargets.getTarget("myTarget");

		var pTargetRootViewId = oTarget._oOptions.rootView;

		return pTargetRootViewId.then(function(sId) {
			var oView = this.oComponent.getRootControl();
			//Assert
			assert.ok(oTargets, "the component created targets");
			assert.ok(oTarget, "the component created a target instance");
			assert.strictEqual(sId, oView.getId(), "the viewid is the rootView");
			assert.strictEqual(oViews._oComponent, this.oComponent, "the views instance knows its component");

			//Cleanup
			this.oComponent.destroy();
			assert.ok(oTargets.bIsDestroyed, "Targets got destroyed when the component is destroyed");
			assert.ok(oViews.bIsDestroyed, "Views created by the component got destroyed");
		}.bind(this));
	});

	QUnit.module("Root control", {
		beforeEach : function () {
			// System under test
			return Component.create({
				name: "sap.ui.test.routing"
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
		assert.ok(oRootControl, "the returned control is the rootView");
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
			assert.equal(oComponent, Component.getComponentById("myTestComp"), "Component.get returns right component");
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
		Component.create({
			manifest: "anylocation/manifest.json"
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
		Component.load({
			manifest: "anylocation/manifest.json"
		}).then(function(fnComponentClass) {

			assert.ok(fnComponentClass.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
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
		Component.load({
			manifest: "anyotherlocation2/manifest.json",
			url : "test-resources/sap/ui/core/samples/components/oneview/"
		}).then(function(fnComponentClass) {

			assert.ok(fnComponentClass.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
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

	QUnit.test("On instance created callback / hook (async, no promise)", function(assert) {

		var oCallbackComponent;
		var oConfig = {
			manifest: "anylocation/manifest.json",
			async: true
		};

		// set the instance created callback hook
		Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			oCallbackComponent = oComponent;

			assert.ok(true, "sap.ui.core.Component._fnOnInstanceCreated called!");
			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.deepEqual(vCallbackConfig, oConfig, "sap.ui.core.Component._fnOnInstanceCreated oConfig passed!");

			// All return values other than promises should be ignored
			return 123;
		};

		return Component.create({
			manifest: "anylocation/manifest.json"
		}).then(function(oComponent) {
			assert.equal(oComponent, oCallbackComponent, "Returned component instances should be the same as within callback.");
		});
	});

	QUnit.test("On instance created callback / hook (async, no promise, error)", function(assert) {

		// set the instance created callback hook
		Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			throw new Error("Error from _fnOnInstanceCreated");
		};

		return Component.create({
			manifest: "anylocation/manifest.json"
		}).then(function(oComponent) {
			assert.ok(false, "Promise should not resolve");
		}, function(oError) {
			assert.equal(oError.message, "Error from _fnOnInstanceCreated", "Promise should reject with error from hook");
		});
	});

	QUnit.test("On instance created callback / hook (async, with promise)", function(assert) {

		var oCallbackComponent;
		var oConfig = {
			manifest: "anylocation/manifest.json",
			async: true
		};

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

		return Component.create({
			manifest: "anylocation/manifest.json"
		}).then(function(oComponent) {
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

		return Component.create({
			manifest: "anylocation/manifest.json"
		}).then(function(oComponent) {
			assert.ok(false, "Promise should not resolve");
			Component._fnOnInstanceCreated = null;
		}, function(oError) {
			assert.equal(oError.message, "Error from _fnOnInstanceCreated", "Promise should reject with error from hook");
			Component._fnOnInstanceCreated = null;
		});
	});

	QUnit.test("On instance created callback / hook called before view init", function(assert) {
		assert.expect(3);

		var bAfterInitCalled = false;

		sap.ui.define("sap/test/myView", ["sap/ui/core/mvc/View", "sap/m/Button"], function(View, Button) {
			return View.extend("sap.test.myView", {
				createContent: function() {
					this.attachAfterInit(function() {
						bAfterInitCalled = true;
						assert.ok(bAfterInitCalled, "AfterInit called");

					});
					return Promise.resolve(new Button());
				}
			});
		});

		sap.ui.define("sap/test/myComponent/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
			return UIComponent.extend("sap.test.myComponent", {
				metadata: {
					manifest: {
						"dependencies": {
							"libs": {
								"sap.ui.core": {},
								"sap.m": {}
							}
						},
						"sap.ui5": {
							"rootView": {
								"viewName": "module:sap/test/myView",
								"async": true
							}
						}
					}
				}
			});
		});

		// set the instance created callback hook
		Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			assert.equal(bAfterInitCalled, false, "_fnOnInstanceCreated should be called before view init");
			return Promise.resolve();
		};

		return Component.create({
			name: "sap.test.myComponent"
		}).then(function(oComponent) {
			assert.ok(oComponent, "Component created");
		});
	});

	QUnit.test("Usage of manifest property in component configuration for URL", function(assert) {

		return Component.create({
			manifest: "anylocation/manifest.json"
		}).then(function(oComponent) {
			assert.ok(true, "Component is loaded properly!");
		}, function(oError) {
			assert.ok(false, "Component should be loaded!");
		});

	});

	QUnit.test("Usage of manifest property in component configuration for manifest object", function(assert) {

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

		return Component.create({
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

		var pComponent = Component.create({
			name : "my.usage"
		});
		var oSpy = sinon.spy(Component, "create");

		return pComponent.then(function(oComponent) {
			return new Promise(function(resolve, reject) {
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

					var mSettings = deepExtend({}, mConfig.settings, { componentData: mConfig.componentData });
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
					}).catch(function(oError) {
						assert.ok(false, "createComponent must not be failing!");
					}).then(function() {
						oSpy.restore();
						oComponent.destroy();
						resolve();
					});
				});
			});
		});

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
				var mSettings = deepExtend({}, mConfig.settings, { componentData: mConfig.componentData });
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

	QUnit.test("Preload non-lazy component usages", function(assert) {

		var oSpy = sinon.spy(sap.ui.loader._, "loadJSResourceAsync");

		return Component.create({
			name : "my.preloadusage",
			manifest: "anylocation/manifest.json"
		}).then(function(oPreloadComponent) {
			assert.ok(oSpy.calledOnceWithExactly("nonLazyUsage/Component-preload.js"), "Only the non-lazy component usage should be preloaded!");
			oSpy.restore();
			oPreloadComponent.destroy();
		});

	});

	/**
	 * Legacy tests with an already loaded manifest.json for a Component with metadata based on a "component.json".
	 * @deprecated
	 */
	QUnit.test("Component.create with loaded manifest content (legacy, component.json)", function(assert) {
		var oProcessI18nSpy = this.spy(Manifest.prototype, "_processI18n");

		return LoaderExtensions.loadResource(
			"sap/ui/test/mixed_legacyAPIs/manifest.json",
			{async: true}
		).then(function(oManifest) {
			return Component.create({
				manifest: oManifest
			});
		}).then(function(oComponent) {
			assert.ok(oComponent, "Component instance is created");
			var iSyncCall = oProcessI18nSpy.getCalls().reduce(function(acc, oCall) {
				if (oCall.args.length === 0 || !oCall.args[0]) {
					acc++;
				}
				return acc;
			}, 0);
			assert.equal(iSyncCall, 0, "No sync loading of i18n is done");
		});
	});

	QUnit.test("Component.create with loaded manifest content", function(assert) {
		var oProcessI18nSpy = this.spy(Manifest.prototype, "_processI18n");

		return LoaderExtensions.loadResource(
			"sap/ui/test/mixed/manifest.json",
			{async: true}
		).then(function(oManifest) {
			return Component.create({
				manifest: oManifest
			});
		}).then(function(oComponent) {
			assert.ok(oComponent, "Component instance is created");
			var iSyncCall = oProcessI18nSpy.getCalls().reduce(function(acc, oCall) {
				if (oCall.args.length === 0 || !oCall.args[0]) {
					acc++;
				}
				return acc;
			}, 0);
			assert.equal(iSyncCall, 0, "No sync loading of i18n is done");
		});
	});

	/**
	 * Legacy tests with an inheritance chain that contains a "component.json" based parent.
	 * @deprecated
	 */
	QUnit.test("Check the loading of i18n of a component and its inheriting parent (legacy, component.json)", function(assert) {
		var oProcessI18nSpy = this.spy(Manifest.prototype, "_processI18n");

		return Component.create({
			name: "sap.ui.test.inherit"
		}).then(function(oComponent) {
			assert.ok(oComponent, "Component instance is created");

			// _processI18n are called 3 times:
			//  1. for the oComponent instance itself
			//  2. for the sap.ui.test.inherit ComponentMetadata
			//  3. for the inheriting parent sap.ui.test.inherit.parent ComponentMetadata (component.json based)
			assert.equal(oProcessI18nSpy.callCount, 3, "_processI18n is called for the expected times");

			var iSyncCall = oProcessI18nSpy.getCalls().reduce(function(acc, oCall) {
				if (oCall.args.length === 0 || !oCall.args[0]) {
					acc++;
				}
				return acc;
			}, 0);

			assert.equal(iSyncCall, 0, "No sync loading of i18n is done");
		});
	});

	QUnit.test("Check the loading of i18n of a component and its inheriting parent", function(assert) {
		var oProcessI18nSpy = this.spy(Manifest.prototype, "_processI18n");

		return Component.create({
			name: "sap.ui.test.inheritAsync"
		}).then(function(oComponent) {
			assert.ok(oComponent, "Component instance is created");

			// _processI18n are called 4 times:
			//  1. for the oComponent instance itself
			//  2. for the sap.ui.test.inheritAsync ComponentMetadata
			//  3. for the inheriting parent sap.ui.test.inheritAsync.parentB ComponentMetadata
			//  4. for the inheriting parent sap.ui.test.inheritAsync.parentA ComponentMetadata
			assert.equal(oProcessI18nSpy.callCount, 4, "_processI18n is called for the expected times");

			var iSyncCall = oProcessI18nSpy.getCalls().reduce(function(acc, oCall) {
				if (oCall.args.length === 0 || !oCall.args[0]) {
					acc++;
				}
				return acc;
			}, 0);

			assert.equal(iSyncCall, 0, "No sync loading of i18n is done");
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
						"": {
							"type": "sap.ui.model.json.JSONModel"
						},
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

	QUnit.test("Component.getOwnModels", function(assert) {
		return Component.create({
			manifest: this.oManifest
		}).then(function(oComponent) {
			var oOwnModels = oComponent.getOwnModels();

			assert.ok(oOwnModels, "Manifest models should be returned.");
			assert.equal(Object.keys(oOwnModels).length, 3, "The correct number of models should be returned.");

			assert.notOk(oOwnModels.hasOwnProperty(""), "Empty string as key shouldn't be available.");

			assert.ok(oOwnModels.hasOwnProperty("undefined"), "Default model should be available.");
			assert.ok(oOwnModels.hasOwnProperty("i18n-component"), "i18n-component model should be available");
			assert.ok(oOwnModels.hasOwnProperty("i18n-manifest"), "i18n-manifest model should be available");

			assert.ok(oOwnModels.undefined.isA("sap.ui.model.json.JSONModel"), "Correct model instance should be returned.");
			assert.ok(oOwnModels["i18n-component"].isA("sap.ui.model.resource.ResourceModel"), "Correct model instance should be returned.");
			assert.ok(oOwnModels["i18n-manifest"].isA("sap.ui.model.resource.ResourceModel"), "Correct model instance should be returned.");
		});
	});


	QUnit.test("Relative URLs for ResourceModel (enhanceWith)", function(assert) {

		var oResourceBundleCreateSpy = this.spy(ResourceBundle, "create");

		// load the test component
		return Component.create({
			manifest : "anylocation/manifest.json"
		}).then(function(oComponent) {

			var aI18NCmpEnhanceWith = oResourceBundleCreateSpy.getCall(0).args[0].enhanceWith;
			assert.strictEqual(aI18NCmpEnhanceWith[0].bundleUrl, "test-resources/sap/ui/core/samples/components/button/custom/i18n.properties", "Bundle URL of enhancing model must not be modified!");
			assert.strictEqual(aI18NCmpEnhanceWith[1].bundleUrlRelativeTo, "manifest", "Bundle URL should be relative to manifest!");
			assert.strictEqual(aI18NCmpEnhanceWith[1].bundleUrl, "anylocation/other/i18n.properties", "Bundle URL of enhancing model must not be modified!");

			var aI18NMFEnhanceWith = oResourceBundleCreateSpy.getCall(1).args[0].enhanceWith;
			assert.strictEqual(aI18NMFEnhanceWith[0].bundleUrlRelativeTo, "manifest", "Bundle URL should be relative to manifest!");
			assert.strictEqual(aI18NMFEnhanceWith[0].bundleUrl, "anylocation/custom/i18n.properties", "Bundle URL of enhancing model must be adopted relative to manifest!");
			assert.strictEqual(aI18NMFEnhanceWith[1].bundleUrl, "test-resources/sap/ui/core/samples/components/button/other/i18n.properties", "Bundle URL of enhancing model must not be modified!");

			oComponent.destroy();
			oResourceBundleCreateSpy.restore();
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
		LoaderExtensions.registerResourcePath("test/resourceRoots/component1", {
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
		LoaderExtensions.registerResourcePath("test/resourceRoots/component2", {
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

		sap.ui.require.preload({
			"test/resourceRoots/parentcomponent1/manifest.json": JSON.stringify({
				"sap.app": {
					"id": "test.resourceRoots.parentcomponent1"
				}
			})
		});
		sap.ui.define("test/resourceRoots/parentcomponent1/Component", ["sap/ui/core/Component"], function(Component) {
			return Component.extend("test.resourceRoots.parentcomponent1.Component", {
				metadata: {
					manifest: "json"
				}
			});
		});

		sap.ui.require.preload({
			"test/resourceRoots/component3/manifest.json": JSON.stringify({
				"sap.app": {
					"id": "test.resourceRoots.component3"
				}
			})
		});
		sap.ui.define("test/resourceRoots/component3/Component", ["test/resourceRoots/parentcomponent1/Component"], function(Component) {
			return Component.extend("test.resourceRoots.component3.Component", {
				metadata: {
					manifest: "json"
				}
			});
		});

		return Component.create({
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
			}
		}).then(function() {

			assert.equal(sap.ui.require.toUrl("test/resourceRoots/parentcomponent1"), "/final/test/resourceRoots/parentcomponent1",
				"Passing asyncHints with final URL should register final resourceRoot");

		});
	});


	/**
	 * @deprecated Since 1.119
	 */
	QUnit.module("Window Event Handler", {
		beforeEach: function() {

			this.addEventListenerSpy = this.spy(window, "addEventListener");
			this.removeEventListenerSpy = this.spy(window, "removeEventListener");
		},
		afterEach: function () {
			this.addEventListenerSpy.restore();
			this.removeEventListenerSpy.restore();
		}
	});

	/**
	 * @deprecated Since 1.119
	 */
	QUnit.test("onWindowError", function(assert) {
		var MyOnWindowErrorComponent = Component.extend("test.onWindowError.Component");

		MyOnWindowErrorComponent.prototype.onWindowError = sinon.stub();

		this.oComponent = new MyOnWindowErrorComponent();

		assert.equal(typeof this.oComponent._fnWindowErrorHandler, "function", "Handler has been created");

		sinon.assert.calledWithExactly(this.addEventListenerSpy, "error", this.oComponent._fnWindowErrorHandler);
		assert.equal(this.addEventListenerSpy.getCall(0).thisValue, window, "addEventListener has been called on the window object");

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
		sinon.assert.calledWithExactly(this.removeEventListenerSpy, "error", handler);
		assert.equal(this.removeEventListenerSpy.getCall(0).thisValue, window, "removeEventListener has been called on the window object");
	});

	/**
	 * @deprecated Since 1.119
	 */
	QUnit.test("onWindowBeforeUnload", function(assert) {
		var MyOnWindowBeforeUnloadComponent = Component.extend("test.onWindowBeforeUnload.Component");

		MyOnWindowBeforeUnloadComponent.prototype.onWindowBeforeUnload = sinon.stub();

		this.oComponent = new MyOnWindowBeforeUnloadComponent();

		assert.equal(typeof this.oComponent._fnWindowBeforeUnloadHandler, "function", "Handler has been created");
		sinon.assert.calledWithExactly(this.addEventListenerSpy, "beforeunload", this.oComponent._fnWindowBeforeUnloadHandler);
		assert.equal(this.addEventListenerSpy.getCall(0).thisValue, window, "addEventListener has been called on the window object");

		var oFakeEvent = {preventDefault: function() {}};
		this.oComponent._fnWindowBeforeUnloadHandler(oFakeEvent);
		sinon.assert.calledOnce(this.oComponent.onWindowBeforeUnload);
		sinon.assert.calledWithExactly(this.oComponent.onWindowBeforeUnload, oFakeEvent);


		var handler = this.oComponent._fnWindowBeforeUnloadHandler;

		this.oComponent.destroy();

		assert.equal(this.oComponent._fnWindowBeforeUnloadHandler, undefined, "Handler has been removed");
		sinon.assert.calledWithExactly(this.removeEventListenerSpy, "beforeunload", handler);
		assert.equal(this.removeEventListenerSpy.getCall(0).thisValue, window, "removeEventListener has been called on the window object");
	});

	/**
	 * @deprecated Since 1.119
	 */
	QUnit.test("onWindowUnload", function(assert) {
		var MyOnWindowUnloadComponent = Component.extend("test.onWindowUnload.Component");

		MyOnWindowUnloadComponent.prototype.onWindowUnload = sinon.stub();

		this.oComponent = new MyOnWindowUnloadComponent();

		assert.equal(typeof this.oComponent._fnWindowUnloadHandler, "function", "Handler has been created");
		sinon.assert.calledWithExactly(this.addEventListenerSpy, "unload", this.oComponent._fnWindowUnloadHandler);
		assert.equal(this.addEventListenerSpy.getCall(0).thisValue, window, "addEventListener has been called on the window object");

		var oFakeEvent = {};
		this.oComponent._fnWindowUnloadHandler(oFakeEvent);
		sinon.assert.calledOnce(this.oComponent.onWindowUnload);
		sinon.assert.calledWithExactly(this.oComponent.onWindowUnload, oFakeEvent);


		var handler = this.oComponent._fnWindowUnloadHandler;

		this.oComponent.destroy();

		assert.equal(this.oComponent._fnWindowUnloadHandler, undefined, "Handler has been removed");
		sinon.assert.calledWithExactly(this.removeEventListenerSpy, "unload", handler);
		assert.equal(this.removeEventListenerSpy.getCall(0).thisValue, window, "removeEventListener has been called on the window object");
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

		/**
		 * @deprecated As of 1.120, Component.registry has been deprecated
		 */
		assert.ok(Component.hasOwnProperty("registry"), "Component has static property to access registry");
		assert.equal(ComponentRegistry.size, 3, "Return number of registered component instances");
		assert.deepEqual(Object.keys(ComponentRegistry.all()).sort(), ["A", "B", "C"], "Return all registered component instances");
		assert.ok(ComponentRegistry.get("B") === oFooB, "Return reference of component B from registry by ID");

		ComponentRegistry.forEach(fnCallbackSpy);
		assert.ok(fnCallbackSpy.calledThrice, "Callback was executed 3 times");

		aFilteredComponents = ComponentRegistry.filter(function(oComponent) {
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
						"type": "sap.ui.model.odata.v2.ODataModel",
						"uri": "./some/odata/service/"
					}
				}
			}
		};

		Component._fnPreprocessManifest = function(oManifestJSON) {
			// To test if the modification is correctly passed back to the
			// Component's manifest processing, we just change the class of a given model v2 -> v4
			oManifestJSON["sap.ui5"]["models"]["myModel"].type = "sap.ui.model.odata.v4.ODataModel";

			return Promise.resolve(oManifestJSON);
		};

		return Component.create({
			name: "sap.ui.test.other",
			manifest: oManifestJSON
		}).then(function(oComponent) {
			// check if the modification was correctly taken over
			var oModel = oComponent.getModel("myModel");
			assert.ok(oModel.isA("sap.ui.model.odata.v4.ODataModel"), "Manifest was modified to use v4 instead of v2 ODataModel.");
		});
	});

	QUnit.test("Hook is called when manifest is given in config object and there is one new library dependency (Hook modifies the manifest)", function(assert) {
		var oManifestJSON = {
			"sap.app": {
				"id": "sap.ui.test.other",
				"type": "application",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},
			"sap.ui5": {
				"dependencies": {
					"minUI5Version": "1.71.0",
					"libs": {
						"sap.m": {
							"minVersion": "1.72"
						}
					}
				}
			}
		};

		var oConfig = {
			manifest: oManifestJSON,
			async: true,
			name: "sap.ui.test.other"
		};

		var oManifestJSONCopy;
		Component._fnPreprocessManifest = function(oManifestJSON, oConfig) {
			// Copy is required to check if this method is called with the correct raw manifest but not the modified one
			oManifestJSONCopy = deepExtend({}, oManifestJSON);

			// To test if the new app desc change is correctly passed back to the
			// Component's manifest processing, we just add a new library as a new application dependency
			oManifestJSONCopy["sap.ui5"].dependencies.libs["sap.uxap"] = {
				minVersion: "1.72",
				lazy: true
			};

			return Promise.resolve(oManifestJSONCopy);
		};

		var oPreprocessManifestSpy = this.spy(Component, "_fnPreprocessManifest");

		return Component.create({
			name: "sap.ui.test.other",
			manifest: oManifestJSON
		}).then(function(oComponent) {
			// check if the new dependency is correctly taken over
			var oSapUi5Property = oComponent.getManifestEntry("sap.ui5");
			var oSapUxapLib = oSapUi5Property["dependencies"]["libs"]["sap.uxap"];
			var oExpectedSapUxapLib = {minVersion: "1.72", lazy: true};
			assert.equal(oSapUxapLib.minVersion, oExpectedSapUxapLib.minVersion, "minVersion is correct");
			assert.equal(oSapUxapLib.lazy, oExpectedSapUxapLib.lazy, "lazy is correct");
			assert.ok(oPreprocessManifestSpy.calledOnceWithExactly(oManifestJSON, oConfig), "then the hook is called once with correct parameters");
			assert.notDeepEqual(oManifestJSON, oManifestJSONCopy, "then the objects containing manifest info are not equal");
		});
	});

	QUnit.test("Hook is called when manifest is loaded from the default location (Hook modifies the manifest)", function(assert) {
		// register hook and modify the manifest
		Component._fnPreprocessManifest = function(oManifestJSON) {
			// To test if the modification is correctly passed back to the
			// Component's manifest processing, we just change the class of a given model v2 -> v4
			oManifestJSON["sap.ui5"]["models"]["sfapi"].type = "sap.ui.model.odata.v4.ODataModel";

			return Promise.resolve(oManifestJSON);
		};

		// loading manifest from default location
		return Component.create({
			name: "sap.ui.test.v2asyncRootView"
		}).then(function(oComponent) {
			// check if the modification was correctly taken over
			var oModel = oComponent.getModel("sfapi");
			assert.ok(oModel.isA("sap.ui.model.odata.v4.ODataModel"), "Manifest was modified to use v4 instead of v2 ODataModel.");
		});
	});

	QUnit.test("Hook is called when manifest is loaded from the default location and there is one new library dependency (Hook modifies the manifest)", function(assert) {
		var oManifestJSONCopy;
		var oManifestJSONClosure;
		// register hook and modify the manifest
		Component._fnPreprocessManifest = function(oManifestJSON) {
			// Copy is required to check if it is called with the correct manifest but not the modified one
			oManifestJSONCopy = deepExtend({}, oManifestJSON);

			oManifestJSONClosure = oManifestJSON;

			// To test if the new app desc change is correctly passed back to the
			// Component's manifest processing, we just add a new library as a new application dependency
			oManifestJSONCopy["sap.ui5"].dependencies.libs["sap.uxap"] = {
				minVersion: "1.72",
				lazy: true
			};

			return Promise.resolve(oManifestJSONCopy);
		};

		var oPreprocessManifestSpy = this.spy(Component, "_fnPreprocessManifest");

		// loading manifest from default location
		return Component.create({
			name: "sap.ui.test.v2"
		}).then(function(oComponent) {
			// check if the new dependency is correctly taken over
			var oSapUi5Property = oComponent.getManifestEntry("sap.ui5");
			var oSapUxapLib = oSapUi5Property["dependencies"]["libs"]["sap.uxap"];
			var oExpectedSapUxapLib = {minVersion: "1.72", lazy: true};
			assert.equal(oSapUxapLib.minVersion, oExpectedSapUxapLib.minVersion, "minVersion is correct");
			assert.equal(oSapUxapLib.lazy, oExpectedSapUxapLib.lazy, "lazy is correct");
			assert.ok(oPreprocessManifestSpy.calledOnce, "then the hook is called once");
			assert.notDeepEqual(oManifestJSONClosure, oManifestJSONCopy, "then the objects containing manifest info are not equal");
		});
	});

	QUnit.test("Hook is called when manifest is loaded from the given manifest URL", function(assert) {
		var sManifestUrl = sap.ui.require.toUrl("sap/ui/test/v2/manifest.json");

		// register hook and modify the manifest
		Component._fnPreprocessManifest = function(oManifestJSON) {
			// To test if the modification is correctly passed back to the
			// Component's manifest processing, we just change the class of a given model v2 -> v4
			oManifestJSON["sap.ui5"]["models"]["sfapi"].type = "sap.ui.model.odata.v4.ODataModel";

			return Promise.resolve(oManifestJSON);
		};

		return Component.create({
			name: "sap.ui.test.v2asyncRootView",
			manifest: sManifestUrl
		}).then(function(oComponent) {
			// check if the modification was correctly taken over
			var oModel = oComponent.getModel("sfapi");
			assert.ok(oModel.isA("sap.ui.model.odata.v4.ODataModel"), "Manifest was modified to use v4 instead of v2 ODataModel.");
		});
	});

	QUnit.test("Hook is called when manifest is loaded from the given manifest URL and and there is one new library dependency (Hook modifies the manifest)", function(assert) {
		var sManifestUrl = sap.ui.require.toUrl("sap/ui/test/v2/manifest.json");
		var oManifestJSONCopy;
		var oManifestJSONClosure;

		// register hook and modify the manifest
		Component._fnPreprocessManifest = function(oManifestJSON) {
			// Copy is required to check if it is called with the correct manifest but not the modified one
			var oManifestJSONCopy = deepExtend({}, oManifestJSON);

			oManifestJSONClosure = oManifestJSON;

			// To test if the new app desc change is correctly passed back to the
			// Component's manifest processing, we just add a new library as a new application dependency
			oManifestJSONCopy["sap.ui5"].dependencies.libs["sap.uxap"] = {
				minVersion: "1.72",
				lazy: true
			};

			return Promise.resolve(oManifestJSONCopy);
		};

		var oPreprocessManifestSpy = this.spy(Component, "_fnPreprocessManifest");

		return Component.create({
			name: "sap.ui.test.v2asyncRootView",
			manifest: sManifestUrl
		}).then(function(oComponent) {
			// check if the new dependency is correctly taken over
			var oSapUi5Property = oComponent.getManifestEntry("sap.ui5");
			var oSapUxapLib = oSapUi5Property["dependencies"]["libs"]["sap.uxap"];
			var oExpectedSapUxapLib = {minVersion: "1.72", lazy: true};
			assert.equal(oSapUxapLib.minVersion, oExpectedSapUxapLib.minVersion, "minVersion is correct");
			assert.equal(oSapUxapLib.lazy, oExpectedSapUxapLib.lazy, "lazy is correct");
			assert.ok(oPreprocessManifestSpy.calledOnce, "then the hook is called once");
			assert.notDeepEqual(oManifestJSONClosure, oManifestJSONCopy, "then the objects containing manifest info are not equal");
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
		var oLogStub = this.stub(Log, "error");

		return Component.create({
			name: "sap.ui.test.v2empty"
		}).then(function() {
			assert.ok(false, "shouldn't reach here");
		}).catch(function(oError) {
			assert.equal(oError.message, sErrorText, "Error was thrown, and Promise is rejected with the correct reason");
			assert.ok(oLogStub.calledWithExactly("Failed to execute flexibility hook for manifest preprocessing.", oError), "Correct Error was logged for supportability");
		});
	});

	QUnit.test("When Manifest-Loading fails (404), the hook should not be called", function(assert) {
		Component._fnPreprocessManifest = function() {
			assert.ok(false, "Should not be called when Manifest Request failed.");
		};

		// create a legacy Component without a manifest.json
		// Manifest-first loading fails with 404, but is ignored, since the component controller contains metadata.
		return Component.create({
			name: "sap.ui.test.other"
		}).then(function(oComponent) {
			assert.ok(oComponent, "Component was created.");
		}).catch(function() {
			assert.ok(false, "Should not be called. Hook should not be called (fail) when no manifest exists.");
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

	QUnit.module("Text Verticalization", {
		beforeEach: function() {
		},
		afterEach: function() {
			this.oComponent.destroy();
		}
	});

	QUnit.test("Component0 with Terminologies defined in Component Metadata", function (assert) {
		var oCreateManifestModelsSpy = sinon.spy(Component, "_createManifestModels");

		return Component.create({
			name: "testdata.terminologies",
			manifest: false,
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			// Check Resource Model creation
			var oSettings = oCreateManifestModelsSpy.getCall(0).args[0].i18n.settings[0];
			assert.equal(oCreateManifestModelsSpy.callCount, 1, "_createManifestModels should be called for the i18n model");
			assert.equal(oSettings.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/terminologies/i18n/i18n.properties", "The bundleUrl should be resolved correctly");
			assert.equal(oSettings.terminologies.oil.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/terminologies/i18n/terminologies.oil.i18n.properties", "The bundleUrl should be resolved correctly");
			assert.equal(oSettings.terminologies.retail.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/terminologies/i18n/terminologies.retail.i18n.properties", "The bundleUrl should be resolved correctly");
			assert.ok(oSettings.hasOwnProperty("supportedLocales"), "The property 'supportedLocales' should be available");
			assert.ok(oSettings.hasOwnProperty("fallbackLocale"), "The property 'fallbackLocale' should be available");

			// resolve bundle urls
			var oEnhanceWith0 = oSettings.enhanceWith[0];
			assert.equal(oEnhanceWith0.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/appvar1path/i18n/i18n.properties", "The bundleUrl should be resolved correctly");
			assert.equal(oEnhanceWith0.terminologies.oil.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/appvar1path/i18n.terminologies.oil.i18n.properties", "The bundleUrl should be resolved correctly");
			assert.equal(oEnhanceWith0.terminologies.retail.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/appvar1path/i18n.terminologies.retail.i18n.properties", "The bundleUrl should be resolved correctly");
			assert.ok(oEnhanceWith0.hasOwnProperty("supportedLocales"), "The property 'supportedLocales' should be available");
			assert.ok(oEnhanceWith0.hasOwnProperty("fallbackLocale"), "The property 'fallbackLocale' should be available");

			// bundle names shouldn't be resolved
			var oEnhanceWith1 = oSettings.enhanceWith[1];
			assert.equal(oEnhanceWith1.bundleName, "appvar2.i18n.i18n.properties", "The bundleName should be correct");
			assert.equal(oEnhanceWith1.terminologies.oil.bundleName, "appvar2.i18n.terminologies.oil.i18n", "The bundleName should be correct");
			assert.equal(oEnhanceWith1.terminologies.retail.bundleName, "appvar2.i18n.terminologies.retail.i18n", "The bundleName should be correct");
			assert.ok(oEnhanceWith1.hasOwnProperty("supportedLocales"), "The property 'supportedLocales' should be available");
			assert.ok(oEnhanceWith1.hasOwnProperty("fallbackLocale"), "The property 'fallbackLocale' should be available");

			assert.deepEqual(this.oComponent.getActiveTerminologies(), ["oil", "retail"], "The list of terminologies should be correct");

			oCreateManifestModelsSpy.restore();
		}.bind(this));
	});

	QUnit.test("Component0 - Propagate Terminologies via owner component", function (assert) {
		return Component.create({
			name: "testdata.terminologies",
			manifest: false,
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			assert.ok(this.oComponent.getActiveTerminologies(), "Active terminologies should be available");

			return this.oComponent.createComponent("myReusedTerminologies").then(function (oReuseComponent) {
				assert.ok(oReuseComponent, "Component should be loaded");
				assert.ok(oReuseComponent.getActiveTerminologies(), "The list of terminologies should be available on the reuse component");
				assert.deepEqual(oReuseComponent.getActiveTerminologies(), this.oComponent.getActiveTerminologies(), "The list of terminologies should be correct");
				return oReuseComponent;
			}.bind(this)).then(function (oReuseComponent) {
				oReuseComponent.destroy();
			});
		}.bind(this));
	});

	QUnit.test("Component0 - Propagate Terminologies via Configuration", function (assert) {
		return Component.create({
			name: "testdata.terminologies",
			manifest: false,
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			var oUsage = {
				usage: "myReusedTerminologies"
			};

			return this.oComponent.createComponent(oUsage).then(function (oReuseComponent) {
				assert.ok(oReuseComponent, "Component should be loaded");
				assert.ok(oReuseComponent.getActiveTerminologies(), "The list of terminologies should be available on the reuse component");
				assert.deepEqual(oReuseComponent.getActiveTerminologies(), ["oil", "retail"], "The list of terminologies should be correct");
				return oReuseComponent;
			}).then(function (oReuseComponent) {
				oReuseComponent.destroy();
			});
		}.bind(this));
	});

	QUnit.test("Component0 - Propagate Terminologies via API with ignoring the usage parameters", function (assert) {
		return Component.create({
			name: "testdata.terminologies",
			manifest: false,
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			var oUsage = {
				usage: "myReusedTerminologies",
				activeTerminologies: ["fashion"]
			};
			return this.oComponent.createComponent(oUsage).then(function(oComponent) {
				assert.ok(oComponent, "Component should be loaded");
				assert.deepEqual(oComponent.getActiveTerminologies(), ["oil", "retail"], "The list of terminologies should be correct");
				oComponent.destroy();
			});
		}.bind(this));
	});

	QUnit.test("Component0 - Check if activeTerminologies are defined in the manifest in component usage", function (assert) {
		return Component.create({
			name: "testdata.terminologies",
			manifest: false,
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			var oUsage = {
				usage: "myReusedTerminologies2"
			};

			assert.throws(function() {
				this.oComponent.createComponent(oUsage);
			}, new Error("Terminologies vector can't be used in component usages"), "Error should be thrown");
		}.bind(this));
	});

	QUnit.test("Component1 with Terminologies defined in manifest.json file", function (assert) {
		var oResourceBundleCreateSpy = sinon.spy(ResourceBundle, "create");
		var oCreateManifestModelsSpy = sinon.spy(Component, "_createManifestModels");

		return Component.create({
			name: "testdata.terminologies.component1",
			manifest: true,
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			var oSettingsBeforeLoad = oResourceBundleCreateSpy.getCall(0).args[0];
			assert.equal(oSettingsBeforeLoad.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component1/i18n/i18n.properties", "The bundleUrl should be resolved correctly");
			assert.ok(oSettingsBeforeLoad.hasOwnProperty("supportedLocales"), "The property 'supportedLocales' should be available");
			assert.ok(oSettingsBeforeLoad.hasOwnProperty("fallbackLocale"), "The property 'fallbackLocale' should be available");

			// resolve bundle urls
			var oEnhanceWith0 = oSettingsBeforeLoad.enhanceWith[0];
			assert.equal(oEnhanceWith0.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/appvar1path/i18n/i18n.properties", "The bundleUrl should be resolved correctly");
			assert.equal(oEnhanceWith0.terminologies.oil.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/appvar1path/i18n.terminologies.oil.i18n.properties", "The bundleUrl should be resolved correctly");
			assert.equal(oEnhanceWith0.terminologies.retail.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/appvar1path/i18n.terminologies.retail.i18n.properties", "The bundleUrl should be resolved correctly");
			assert.ok(oEnhanceWith0.hasOwnProperty("supportedLocales"), "The property 'supportedLocales' should be available");
			assert.ok(oEnhanceWith0.hasOwnProperty("fallbackLocale"), "The property 'fallbackLocale' should be available");

			// bundle names shouldn't be resolved
			var oEnhanceWith1 = oSettingsBeforeLoad.enhanceWith[1];
			assert.equal(oEnhanceWith1.bundleName, "appvar2.i18n.i18n.properties", "The bundleName should be correct");
			assert.equal(oEnhanceWith1.terminologies.oil.bundleName, "appvar2.i18n.terminologies.oil.i18n", "The bundleName should be correct");
			assert.equal(oEnhanceWith1.terminologies.retail.bundleName, "appvar2.i18n.terminologies.retail.i18n", "The bundleName should be correct");
			assert.ok(oEnhanceWith1.hasOwnProperty("supportedLocales"), "The property 'supportedLocales' should be available");
			assert.ok(oEnhanceWith1.hasOwnProperty("fallbackLocale"), "The property 'fallbackLocale' should be available");

			// check if already processed properties have been removed when the ResourceModel constructor is called
			var oSettingsAfterLoad = oCreateManifestModelsSpy.getCall(0).args[0].i18n.settings[0];
			assert.notOk(oSettingsAfterLoad.enhanceWith, "enhanceWith was removed");
			assert.notOk(oSettingsAfterLoad.terminologies, "terminologies was removed");
			assert.notOk(oSettingsAfterLoad.activeTerminologies, "terminologies was removed");

			assert.deepEqual(this.oComponent.getActiveTerminologies(), ["oil", "retail"], "The list of terminologies should be correct");

			oResourceBundleCreateSpy.restore();
			oCreateManifestModelsSpy.restore();
		}.bind(this));
	});

	QUnit.test("Component2 - Pass Terminologies from 'sap.app.i18n' via ComponentMetadata to ResourceBundle", function (assert) {
		var oExpected = {
			bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component2/i18n/i18n.properties",
			async: true,
			activeTerminologies: ["oil", "retail"],
			supportedLocales: ["en", "de"],
			fallbackLocale: "en",
			terminologies: {
				oil: {
					bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component2/i18n/terminologies.oil.i18n.properties",
					supportedLocales: ["en"]
				},
				retail: {
					bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component2/i18n/terminologies.retail.i18n.properties",
					supportedLocales: ["de"]
				}
			},
			enhanceWith: [
				{
					bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n/i18n.properties",
					bundleUrlRelativeTo: "manifest",
					supportedLocales: ["en", "de"],
					fallbackLocale: "en",
					terminologies: {
						oil: {
							bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.oil.i18n.properties",
							supportedLocales: ["en"]
						},
						retail: {
							bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.retail.i18n.properties",
							supportedLocales: ["de"],
							bundleUrlRelativeTo: "manifest"
						}
					}
				},
				{
					bundleName: "appvar2.i18n.i18n.properties",
					supportedLocales: ["en", "de"],
					fallbackLocale: "en",
					terminologies: {
						oil: {
							bundleName: "appvar2.i18n.terminologies.oil.i18n",
							supportedLocales: ["en"]
						},
						retail: {
							bundleName: "appvar2.i18n.terminologies.retail.i18n",
							supportedLocales: ["de"]
						}
					}
				}
			]
		};
		var oResourceBundleCreateStub = sinon.stub(ResourceBundle, "create").callsFake(function (mParams) {
			if (mParams.async) {
				assert.deepEqual(mParams, oExpected, "ResourceBundle.create should be called with the correct arguments");
				return Promise.resolve({
					getText: function () { assert.ok(true, "ResourceBundle was stubbed successfully"); }
				});
			}
			return {
				getText: function () { assert.ok(true, "ResourceBundle was stubbed successfully"); }
			};
		});
		return Component.create({
			name: "testdata.terminologies.component2",
			manifest: false,
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;
			assert.ok(true, "assertions have been successful");
			oResourceBundleCreateStub.restore();
		}.bind(this));
	});

	QUnit.test("Component3 - Pass Terminologies from 'sap.app.i18n' to ResourceBundle (with manifest.json)", function (assert) {
		var oExpected = {
			bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/i18n.properties",
			async: true,
			activeTerminologies: ["oil", "retail"],
			supportedLocales: ["en", "de"],
			terminologies: {
				oil: {
					bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.oil.i18n.properties",
					supportedLocales: ["en"]
				},
				retail: {
					bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component3/i18n/terminologies.retail.i18n.properties",
					supportedLocales: ["de"]
				}
			},
			enhanceWith: [
				{
					bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n/i18n.properties",
					bundleUrlRelativeTo: "manifest",
					supportedLocales: ["en", "de"],
					terminologies: {
						oil: {
							bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.oil.i18n.properties",
							supportedLocales: ["en"]
						},
						retail: {
							bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/appvar1path/i18n.terminologies.retail.i18n.properties",
							supportedLocales: ["de"],
							bundleUrlRelativeTo: "manifest"
						}
					}
				},
				{
					bundleName: "appvar2.i18n.i18n.properties",
					supportedLocales: ["en", "de"],
					terminologies: {
						oil: {
							bundleName: "appvar2.i18n.terminologies.oil.i18n",
							supportedLocales: ["en"]
						},
						retail: {
							bundleName: "appvar2.i18n.terminologies.retail.i18n",
							supportedLocales: ["de"]
						}
					}
				}
			]
		};

		var oResourceBundleCreateSpy = this.spy(ResourceBundle, "create");
		var oManifestI18nSpy = sinon.spy(Manifest.prototype, "_loadI18n");

		return Component.create({
			name: "testdata.terminologies.component3",
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;
			assert.ok(true, "assertions have been successful");

			assert.equal(oResourceBundleCreateSpy.callCount, 2, "ResourceBundle.create is call twice");
			assert.deepEqual(oResourceBundleCreateSpy.getCall(0).args[0], oExpected, "ResourceBundle.create should be called with the correct arguments");

			// check how many "data-loading" calls are made from the Manifest
			// TODO: The number of loading calls will sink down to 1 with an additional optimization on ComponentMetadata.prototype._applyManifest
			assert.equal(oManifestI18nSpy.callCount, 2, "Only two calls made to Manifest.prototype._loadI18n");
			assert.ok(oManifestI18nSpy.getCall(0).args[0], "Manifest.prototype._loadI18n: 1st time called with async=true, after Component preload");
			assert.ok(oManifestI18nSpy.getCall(1).args[0], "Manifest.prototype._loadI18n: 2nd time called with async=true");

			oManifestI18nSpy.restore();
			oResourceBundleCreateSpy.restore();
		}.bind(this));
	});

	QUnit.test("Component4 - Pass Terminologies from 'sap.app.i18n' to ResourceBundle (with manifest.json from a different location)", function (assert) {
		var oExpected = {
			bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/i18n/i18n.properties",
			async: true,
			activeTerminologies: ["oil", "retail"],
			supportedLocales: ["en", "de"],
			fallbackLocale: "en",
			terminologies: {
				oil: {
					bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/i18n/terminologies.oil.i18n.properties",
					supportedLocales: ["en"]
				},
				retail: {
					bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/i18n/terminologies.retail.i18n.properties",
					supportedLocales: ["de"]
				}
			},
			enhanceWith: [
				{
					bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/appvar1path/i18n/i18n.properties",
					supportedLocales: ["en", "de"],
					fallbackLocale: "en",
					terminologies: {
						oil: {
							bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/appvar1path/i18n.terminologies.oil.i18n.properties",
							supportedLocales: ["en"]
						},
						retail: {
							bundleUrl: "test-resources/sap/ui/core/qunit/component/testdata/appvar1path/i18n.terminologies.retail.i18n.properties",
							supportedLocales: ["de"]
						}
					}
				},
				{
					bundleName: "appvar2.i18n.i18n.properties",
					supportedLocales: ["en", "de"],
					fallbackLocale: "en",
					terminologies: {
						oil: {
							bundleName: "appvar2.i18n.terminologies.oil.i18n",
							supportedLocales: ["en"]
						},
						retail: {
							bundleName: "appvar2.i18n.terminologies.retail.i18n",
							supportedLocales: ["de"]
						}
					}
				}
			]
		};
		var oResourceBundleCreateStub = sinon.stub(ResourceBundle, "create").callsFake(function (mParams) {
			if (mParams.async) {
				assert.deepEqual(mParams, oExpected, "ResourceBundle.create should be called with the correct arguments");
				return Promise.resolve({
					getText: function () { assert.ok(true, "ResourceBundle was stubbed successfully"); }
				});
			}
			return {
				getText: function () { assert.ok(true, "ResourceBundle was stubbed successfully"); }
			};
		});
		return Component.create({
			name: "testdata.terminologies.component4",
			manifest: "test-resources/sap/ui/core/qunit/component/testdata/terminologies/manifest.json",
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;
			assert.ok(true, "assertions have been successful");
			oResourceBundleCreateStub.restore();
		}.bind(this));
	});

	QUnit.test("Component5 - Map i18n.uri to i18n.settings.bundleUrl and pass correctly", function (assert) {
		// Example: uri defined instead of bundleUrl
		//
		// "models": {
		// 	"i18n": {
		// 		"type": "sap.ui.model.resource.ResourceModel",
		//		"uri": "i18n/i18n.properties",
		//			"settings": {
		// 				[...]
		var oCreateManifestModelsSpy = sinon.spy(Component, "_createManifestModels");

		return Component.create({
			name: "testdata.terminologies.component5",
			manifest: true,
			activeTerminologies: ["oil", "retail"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			var oSettings = oCreateManifestModelsSpy.getCall(0).args[0].i18n.settings[0];
			assert.ok(oSettings.hasOwnProperty("bundleUrl"), "Property 'bundleUrl' should be avaialble");
			assert.equal(oSettings.bundleUrl, "test-resources/sap/ui/core/qunit/component/testdata/terminologies/component5/i18n/i18n.properties", "The bundleUrl should be resolved correctly");

			oCreateManifestModelsSpy.restore();
		}.bind(this));
	});

	QUnit.module("Multiple minUI5Version");

	QUnit.test("Ensure that each major version can only be included once", async function (assert) {
		assert.expect(1);
		const oStub = sinon.stub(Supportability, "isDebugModeEnabled").callsFake(() => { return true; });
	    const oLogStub = sinon.stub(Log, "isLoggable").callsFake(() => { return true; });

		await Component.create({
			name: "testdata.minUI5Version"
		}).catch((error) => {
			assert.equal(error.message, "The minimal UI5 versions defined in the manifest must not include multiple versions with the same major version, Component: testdata.minUI5Version.", "Error thrown because manifest contains multiple minUI5Versions with the same major version");
			oStub.restore();
			oLogStub.restore();
		});
	});
});
