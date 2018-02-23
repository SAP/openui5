sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/UIComponentMetadata',
	'samples/components/loadfromfile/Component',
	'samples/components/routing/Component',
	'samples/components/routing/RouterExtension'
], function(jQuery, Component, ComponentContainer, UIComponentMetadata, SamplesLoadFromFileComponent, SamplesRoutingComponent, SamplesRouterExtension) {

	"use strict";
	/*global sinon, QUnit, foo*/

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
		assert.ok(document.getElementById("CompCont1"));
		var elem = jQuery.sap.byId("__component0---mybutn");
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

	QUnit.test("Components Metadata - Design Time", function(assert) {
		var oRequireStub = sinon.stub(sap.ui, "require"),
			oDesignTime = {
				"foo": "bar"
			};

		// pass a deep copy to the stub
		oRequireStub.withArgs(["test/dtcomp/Component.designtime"]).callsArgWithAsync(1, Object.create(oDesignTime));

		var TestDtComp = TestComp1.extend("test.dtcomp.Component", {
			metadata: {
				"designTime": true
			}
		});

		assert.expect(2);
		return TestDtComp.getMetadata().loadDesignTime().then(function(_oDesignTime) {
			//module was added
			oDesignTime.designtimeModule = "test/dtcomp/Component.designtime";
			oDesignTime._oLib = null;
			assert.deepEqual(_oDesignTime, oDesignTime, "DesignTime was loaded properly");
			sinon.assert.callCount(oRequireStub, 1);
			oRequireStub.restore();
		});
	});

	QUnit.test("Components Metadata - Load from file", function(assert){
		var oMetadata = SamplesLoadFromFileComponent.getMetadata();

		assert.deepEqual(oMetadata.getIncludes(), ["css/includeme.css", "js/includeme.js"], "Includes are available.");
		assert.ok(oMetadata.hasProperty("prop1"), "Property 'prop1' available.");
	});

	QUnit.test("Components Includes", function(assert){
		assert.ok((typeof foo == 'function'), "function foo from included js exists");
		var sFontSize = "4px";
		foo("comparea2", sFontSize);
		var sSize = jQuery("#comparea2").css('font-size');
		assert.equal(sSize, sFontSize, "function from JS include invoked");
		assert.equal(jQuery.sap.byId("vLayout---myTF").css("padding-left"), "321px", "CSS from include applied");
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
					"id" : "samples.components.button"
				}
			};
			var oAltManifest1 = this.oAltManifest1 = {
				"sap.app" : {
					"id" : "samples.components.config"
				}
			};

			var oAltManifest2 = this.oAltManifest2 = {
				"sap.app" : {
					"id" : "samples.components.oneview"
				}
			};

			// workaround sinon gh #1534
			this._oSandbox.serverPrototype = null;
			var oServer = this.oServer = this._oSandbox.useFakeServer();

			oServer.xhr.useFilters = true;
			oServer.xhr.filters = [];
			oServer.xhr.addFilter(function(method, url) {
				return (
					url !== "/anylocation/manifest.json?sap-language=EN"
					&& url !== "/anyotherlocation1/manifest.json?sap-language=EN"
					&& url !== "/anyotherlocation2/manifest.json?sap-language=EN"
				);
			});

			oServer.autoRespond = true;
			oServer.respondWith("GET", "/anylocation/manifest.json?sap-language=EN", [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifest)
			]);
			oServer.respondWith("GET", "/anyotherlocation1/manifest.json?sap-language=EN", [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oAltManifest1)
			]);
			oServer.respondWith("GET", "/anyotherlocation2/manifest.json?sap-language=EN", [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oAltManifest2)
			]);

		},
		afterEach : function() {}
	});


	QUnit.test("Manifest delegation to component instance (sync)", function(assert) {

		var oServer = this.oServer, oManifest = this.oManifest;

		//start test
		var oComponent = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json"
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
			manifestUrl : "/anylocation/manifest.json"
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

		var oServer = this.oServer, oManifest = this.oManifest;

		//start test
		var done = assert.async();
		sap.ui.component({
			manifestUrl : "/anylocation/manifest.json",
			async : true
		}).then(function(oComponent) {

			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.ok(oComponent.getManifest(), "Manifest is available");
			assert.deepEqual(oComponent.getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");

			var sAcceptLanguage = oServer.requests && oServer.requests[0] && oServer.requests[0].requestHeaders && oServer.requests[0].requestHeaders["Accept-Language"];
			assert.equal(sAcceptLanguage, "en", "Manifest was requested with proper language");

			done();

		});

	});

	QUnit.test("Manifest delegation to component instance (async, delayed instantiation)", function(assert) {

		var oServer = this.oServer, oManifest = this.oManifest;

		//start test
		var done = assert.async();
		sap.ui.component.load({
			manifestUrl : "/anylocation/manifest.json",
			async : true
		}).then(function(fnComponentClass) {

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

			done();

		});

	});

	QUnit.test("Alternate URL for component (sync)", function(assert) {

		var oServer = this.oServer, oManifest = this.oAltManifest1;

		// create an invalid registration for samples.components.config to see that the "url" parameter works
		jQuery.sap.registerModulePath("samples.components.config", "../../../../../../test-resources/invalid/");

		//start test
		var fnComponentClass = sap.ui.component.load({
			manifestUrl : "/anyotherlocation1/manifest.json",
			url : "../../../../../../test-resources/sap/ui/core/samples/components/config/"
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

		var oServer = this.oServer, oManifest = this.oAltManifest2;

		// create an invalid registration for samples.components.config to see that the "url" parameter works
		jQuery.sap.registerModulePath("samples.components.oneview", "../../../../../../test-resources/invalid/");

		//start test
		var done = assert.async();
		sap.ui.component.load({
			manifestUrl : "/anyotherlocation2/manifest.json",
			url : "../../../../../../test-resources/sap/ui/core/samples/components/oneview/",
			async : true
		}).then(function(fnComponentClass) {

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
			manifestUrl: "/anylocation/manifest.json"
		};

		var oComponent = sap.ui.component(oConfig);

		assert.equal(oComponent, oCallbackComponent, "Returned component instances should be the same as within callback.");

	});

	QUnit.test("On instance created callback / hook (sync, error)", function(assert) {

		// set the instance created callback hook
		sap.ui.core.Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			throw new Error("Error from _fnOnInstanceCreated");
		};

		assert.throws(
			function() {
				sap.ui.component({
					manifestUrl: "/anylocation/manifest.json"
				});
			},
			/Error from _fnOnInstanceCreated/,
			"Error from hook should not be caught internally"
		);
	});

	QUnit.test("On instance created callback / hook (async, no promise)", function(assert) {

		var oCallbackComponent;

		// set the instance created callback hook
		sap.ui.core.Component._fnOnInstanceCreated = function(oComponent, vCallbackConfig) {
			oCallbackComponent = oComponent;

			assert.ok(true, "sap.ui.core.Component._fnOnInstanceCreated called!");
			assert.ok(oComponent.getMetadata() instanceof UIComponentMetadata, "The metadata is instance of UIComponentMetadata");
			assert.deepEqual(vCallbackConfig, oConfig, "sap.ui.core.Component._fnOnInstanceCreated oConfig passed!");

			// All return values other than promises should be ignored
			return 123;
		};

		var oConfig = {
			manifestUrl: "/anylocation/manifest.json",
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
			manifestUrl: "/anylocation/manifest.json",
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
			manifestUrl: "/anylocation/manifest.json",
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
			manifestUrl: "/anylocation/manifest.json",
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

		sap.ui.core.Component._fnOnInstanceCreated = undefined;

		return sap.ui.component({
			manifest: "/anylocation/manifest.json"
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

	QUnit.test("Usage of manifest property in component configuration for URL (sync)", function(assert) {

		sap.ui.core.Component._fnOnInstanceCreated = undefined;

		var oComponent = sap.ui.component({
			manifest: "/anylocation/manifest.json",
			async: false
		});

		assert.ok(oComponent instanceof sap.ui.core.UIComponent, "Component is loaded properly!");
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

		assert.ok(oComponent instanceof sap.ui.core.UIComponent, "Component is loaded properly!");
		assert.equal(oComponent.getManifestObject().getComponentName(), "samples.components.oneview", "The proper component has been loaded!");

	});


	QUnit.module("Component Usage");

	sap.ui.define("my/used/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.used.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.used"
					},
					"sap.ui5" : {
					}
				}
			},
			constructor: function(mSettings) {
				UIComponent.apply(this, arguments);
				this._mSettings = mSettings;
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
								"my.used": {}
							}
						},
						"componentUsages": {
							"myUsage": {
								"name": "my.used"
							}
						}
					}
				}
			}
		});
	});

	QUnit.test("Async creation of component usage", function(assert) {

		var oComponent = sap.ui.component({
			name : "my.usage"
		});
		var oSpy = sinon.spy(oComponent, "_createComponent");

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
				assert.equal("myUsage", oSpy.args[0][0].usage, "Nested component created with config 'usage: \"myUsage\"'");
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

	QUnit.test("Sync creation of component usage", function(assert) {

		var oComponent = sap.ui.component({
			name : "my.usage"
		});
		var oSpy = sinon.spy(oComponent, "_createComponent");

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
			assert.equal("myUsage", oSpy.args[0][0].usage, "Nested component created with config 'usage: \"myUsage\"'");
			assert.equal(false, oSpy.args[0][0].async, "Nested component created with config 'async: true'");
			assert.deepEqual(mConfig.settings, oSpy.args[0][0].settings, "ComponentUsage must receive the correct settings");
			assert.deepEqual(mSettings, oComponentUsage._mSettings, "ComponentUsage must receive the correct settings");
			assert.deepEqual(mConfig.componentData, oSpy.args[0][0].componentData, "ComponentUsage must receive the correct componentData");
			assert.equal(undefined, oSpy.args[0][0].asyncHints, "ComponentUsage must not receive \"asyncHints\"");
			assert.equal(undefined, oSpy.args[0][0].anything, "ComponentUsage must not receive \"anything\"");
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
					url !== "/anylocation/manifest.json?sap-language=EN" &&
					!/\.properties(\?.*)?$/.test(url)
				);
			});

			oServer.autoRespond = true;
			oServer.respondWith("GET", "/anylocation/manifest.json?sap-language=EN", [
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

		var oServer = this.oServer, oManifest = this.oManifest;

		var oModelConfigSpy = sinon.spy(Component, "_createManifestModelConfigurations");

		// load the test component
		var oComponent = sap.ui.component({
			manifestUrl : "/anylocation/manifest.json"
		});

		var oBaseUri = new URI("/anylocation/manifest.json").absoluteTo(new URI(document.baseURI).search(""));

		var aI18NCmpEnhanceWith = oModelConfigSpy.returnValues[0]["i18n-component"].settings[0].enhanceWith;
		assert.strictEqual(aI18NCmpEnhanceWith[0].bundleUrl, "../../samples/components/button/custom/i18n.properties", "Bundle URL of enhancing model must not be modified!");
		assert.strictEqual(aI18NCmpEnhanceWith[1].bundleUrlRelativeTo, "manifest", "Bundle URL should be relative to manifest!");
		assert.strictEqual(aI18NCmpEnhanceWith[1].bundleUrl, "../../../../../../../anylocation/other/i18n.properties", "Bundle URL of enhancing model must not be modified!");

		var aI18NMFEnhanceWith = oModelConfigSpy.returnValues[0]["i18n-manifest"].settings[0].enhanceWith;
		assert.strictEqual(aI18NMFEnhanceWith[0].bundleUrlRelativeTo, "manifest", "Bundle URL should be relative to manifest!");
		assert.strictEqual(aI18NMFEnhanceWith[0].bundleUrl, "../../../../../../../anylocation/custom/i18n.properties", "Bundle URL of enhancing model must be adopted relative to manifest!");
		assert.strictEqual(aI18NMFEnhanceWith[1].bundleUrl, "../../samples/components/button/other/i18n.properties", "Bundle URL of enhancing model must not be modified!");

		oModelConfigSpy.restore();

	});

});