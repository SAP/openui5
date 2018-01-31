sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/library',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer'
], function(jQuery, sapUiCore, Component, ComponentContainer) {

	"use strict";
	/*global QUnit, sinon */

	var ComponentLifecycle = sapUiCore.ComponentLifecycle;

	QUnit.module("General");

	QUnit.test("Should be able to chain setComponent", function (assert) {
		var oComponentContainer = new ComponentContainer();

		var oComponent = sap.ui.component({
			name: "samples.components.button"
		});

		oComponentContainer.setComponent(oComponent).setComponent(oComponent);

		assert.strictEqual(oComponent.getId(), oComponentContainer.getComponent(), "Was able to chain the setter");
	});

	QUnit.test("Should call lifecycle methods of nested Component", function (assert) {
		var oComponentContainer = new ComponentContainer();

		var oComponent = sap.ui.component({
			name: "samples.components.button"
		});
		var onBeforeRenderingSpy = oComponent.onBeforeRendering = sinon.spy();
		var onAfterRenderingSpy = oComponent.onAfterRendering = sinon.spy();

		oComponentContainer.setComponent(oComponent);

		assert.ok(onBeforeRenderingSpy.notCalled, "onBeforeRendering was not called");
		assert.ok(onAfterRenderingSpy.notCalled, "onAfterRendering was not called");

		oComponentContainer.onBeforeRendering();

		assert.ok(onBeforeRenderingSpy.calledOnce, "onBeforeRendering was called");
		assert.ok(onAfterRenderingSpy.notCalled, "onAfterRendering was not called");

		oComponentContainer.onAfterRendering();

		assert.ok(onBeforeRenderingSpy.calledOnce, "onBeforeRendering was called");
		assert.ok(onAfterRenderingSpy.calledOnce, "onAfterRendering was called");
	});

	QUnit.test("Should call lifecycle methods of nested Component (created by Container)", function (assert) {
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button"
		});
		var fnSetComponent = oComponentContainer.setComponent;
		var onBeforeRenderingSpy = sinon.spy();
		var onAfterRenderingSpy = sinon.spy();
		oComponentContainer.setComponent = function(oComponent) {
			oComponent.onBeforeRendering = onBeforeRenderingSpy;
			oComponent.onAfterRendering = onAfterRenderingSpy;
			fnSetComponent.apply(this, arguments);
		};

		assert.ok(onBeforeRenderingSpy.notCalled, "onBeforeRendering was not called");
		assert.ok(onAfterRenderingSpy.notCalled, "onAfterRendering was not called");

		oComponentContainer.onBeforeRendering();

		assert.ok(onBeforeRenderingSpy.calledOnce, "onBeforeRendering was called");
		assert.ok(onAfterRenderingSpy.notCalled, "onAfterRendering was not called");

		oComponentContainer.onAfterRendering();

		assert.ok(onBeforeRenderingSpy.calledOnce, "onBeforeRendering was called");
		assert.ok(onAfterRenderingSpy.calledOnce, "onAfterRendering was called");
	});

	QUnit.test("Should delegate the owner component", function (assert) {
		var oOwnerComponent = new Component("owner");
		var oComponentContainer;

		oOwnerComponent.runAsOwner(function() {
			oComponentContainer = new ComponentContainer({
				name: "samples.components.button"
			});
		});

		// simulate rendering
		oComponentContainer.onBeforeRendering();

		assert.strictEqual(oOwnerComponent.getId(), Component.getOwnerComponentFor(oComponentContainer).getId(), "ComponentContainer created by owner Component");
		assert.strictEqual(oOwnerComponent.getId(), Component.getOwnerComponentFor(oComponentContainer.getComponentInstance()).getId(), "ComponentContainers Component created by owner Component");
	});

	QUnit.test("Should prefix Component ID when a ID preprocessor is defined", function (assert) {

		// simulates the usage in a declarative view
		var oComponentContainerNotPrefixed = new ComponentContainer({
			name: "samples.components.button",
			settings: { id: "componentId" },
			lifecycle: ComponentLifecycle.Container
		});
		var oComponentContainerPrefixed = new ComponentContainer({
			name: "samples.components.button",
			settings: { id: "componentId" },
			lifecycle: ComponentLifecycle.Container,
			autoPrefixId: true
		});

		// simulate onBeforeRendering to force to create the component
		oComponentContainerNotPrefixed.onBeforeRendering();
		oComponentContainerPrefixed.onBeforeRendering();

		var oComponentNotPrefixed = oComponentContainerNotPrefixed.getComponentInstance();
		var oComponentPrefixed = oComponentContainerPrefixed.getComponentInstance();

		assert.equal(oComponentNotPrefixed.getId(), "componentId", "Component ID is not prefixed!");
		assert.equal(oComponentPrefixed.getId(), oComponentContainerPrefixed.getId() + "-componentId", "Component ID is prefixed!");

		oComponentContainerNotPrefixed.destroy();
		oComponentContainerPrefixed.destroy();

	});


	QUnit.module("Lifecycle");

	QUnit.test("Legacy should destroy Component onExit but not when replaced", function (assert) {
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button"
		});
		// simulate onBeforeRendering to force to create the component
		oComponentContainer.onBeforeRendering();

		var oComponent = oComponentContainer.getComponentInstance();

		var oNewComponent = sap.ui.component({
			name: "samples.components.button"
		});
		oComponentContainer.setComponent(oNewComponent);

		assert.ok(!oComponent.bIsDestroyed, "Component is not destroyed because it not was created by the ComponentContainer");

		oComponentContainer.destroy();

		assert.strictEqual(oComponentContainer.getLifecycle(), ComponentLifecycle.Legacy, "Default Component lifecycle should be Legacy");
		assert.ok(oComponentContainer.bIsDestroyed, "Component Container is destroyed");
		assert.ok(oNewComponent.bIsDestroyed, "New Component is not destroyed");
	});

	QUnit.test("Application managed should not destroy Component", function (assert) {
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			lifecycle: ComponentLifecycle.Application
		});
		// simulate onBeforeRendering to force to create the component
		oComponentContainer.onBeforeRendering();

		var oComponent = oComponentContainer.getComponentInstance();

		var oNewComponent = sap.ui.component({
			name: "samples.components.button"
		});
		oComponentContainer.setComponent(oNewComponent);

		oComponentContainer.destroy();

		assert.ok(oComponentContainer.bIsDestroyed, "Component Container is destroyed");
		assert.ok(!oComponent.bIsDestroyed, "Component is not destroyed because it not was created by the ComponentContainer");
		assert.ok(!oNewComponent.bIsDestroyed, "New Component is not destroyed because it was not created by the ComponentContainer");
	});

	QUnit.test("Container managed should destroy Component", function (assert) {
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			lifecycle: ComponentLifecycle.Container
		});
		// simulate onBeforeRendering to force to create the component
		oComponentContainer.onBeforeRendering();

		var oComponent = oComponentContainer.getComponentInstance();

		var oNewComponent = sap.ui.component({
			name: "samples.components.button"
		});
		oComponentContainer.setComponent(oNewComponent);

		assert.ok(oComponent.bIsDestroyed, "Component is destroyed because it was created by the ComponentContainer");

		oComponentContainer.destroy();

		assert.ok(oComponentContainer.bIsDestroyed, "Component Container is destroyed");
		assert.ok(oNewComponent.bIsDestroyed, "New Component is destroyed because the lifecycle is managed by the Component");
	});


	QUnit.module("Usage");

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
								"samples.components.button": {}
							}
						},
						"componentUsages": {
							"myUsage": {
								"name": "samples.components.button"
							}
						}
					}
				}
			}
		});
	});


	QUnit.test("Container should create the component usage (sync)", function (assert) {

		var oOwnerComponent = sap.ui.component({
			name: "my.usage"
		});

		// create the container within the context of the owner component
		var oComponentContainer = oOwnerComponent.runAsOwner(function() {
			return new ComponentContainer({
				usage: "myUsage"
			});
		});

		// simulate onBeforeRendering to force to create the component
		oComponentContainer.onBeforeRendering();

		var done = (function() {
			var asyncDone = assert.async();
			return function cleanup() {
				var oNestedComponent = oComponentContainer.getComponentInstance();
				oComponentContainer.destroy();
				assert.ok(oNestedComponent.bIsDestroyed, "Nested Component must be destroyed");
				oOwnerComponent.destroy();
				asyncDone();
			};
		})();

		sap.ui.require([
			"samples/components/button/Component"
		], function(UsedComponent) {

			var oComponentUsage = oComponentContainer.getComponentInstance();

			var oNewComponent = sap.ui.component({
				name: "samples.components.button"
			});

			assert.equal(oComponentContainer.getLifecycle(), ComponentLifecycle.Legacy, "ComponentLifecycle is Legacy by default");
			assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
			assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of samples.components.button.Component");
			assert.equal(oOwnerComponent.getId(), Component.getOwnerIdFor(oComponentUsage), "ComponentUsage must be created with the creator Component as owner");

			// Overwrite nested component
			oComponentContainer.setComponent(oNewComponent);
			assert.ok(oComponentUsage.bIsDestroyed, "Old component should be destroyed");

			done();

		});

	});

	QUnit.test("Container should create the component usage (async)", function (assert) {

		var oOwnerComponent = sap.ui.component({
			name: "my.usage"
		});

		// create the container with in the context of the owner component
		var oComponentContainer = oOwnerComponent.runAsOwner(function() {
			return new ComponentContainer({
				usage: "myUsage",
				async: true
			});
		});

		// intercept first call to setComponent to know when the async loading has finished
		// TODO provide an API in ComponentContainer for that
		var oWhenComponentCreated = jQuery.Deferred();
		oComponentContainer.setComponent = function() {
			var result = ComponentContainer.prototype.setComponent.apply(this, arguments);
			oWhenComponentCreated.resolve();
			return result;
		};

		// simulate onBeforeRendering to force to create the component
		oComponentContainer.onBeforeRendering();

		var done = (function() {
			var asyncDone = assert.async();
			return function cleanup() {
				var oNestedComponent = oComponentContainer.getComponentInstance();
				oComponentContainer.destroy();
				assert.ok(oNestedComponent.bIsDestroyed, "Nested Component must be destroyed");
				oOwnerComponent.destroy();
				asyncDone();
			};
		})();

		oWhenComponentCreated.then(function() {
			sap.ui.require([
				"samples/components/button/Component"
			], function(UsedComponent) {

				var oComponentUsage = oComponentContainer.getComponentInstance();

				var oNewComponent = sap.ui.component({
					name: "samples.components.button"
				});

				assert.equal(oComponentContainer.getLifecycle(), ComponentLifecycle.Legacy, "ComponentLifecycle is Legacy by default");
				assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
				assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of samples.components.button.Component");
				assert.equal(oOwnerComponent.getId(), Component.getOwnerIdFor(oComponentUsage), "ComponentUsage must be created with the creator Component as owner");

				// Overwrite nested component
				oComponentContainer.setComponent(oNewComponent);
				assert.ok(oComponentUsage.bIsDestroyed, "Old component should be destroyed");

				done();

			});
		});

	});

	QUnit.test("Container with ComponentLifecycle=Application", function (assert) {

		var oOwnerComponent = sap.ui.component({
			name: "my.usage"
		});

		// create the container within the context of the owner component
		var oComponentContainer = oOwnerComponent.runAsOwner(function() {
			return new ComponentContainer({
				usage: "myUsage",
				lifecycle: ComponentLifecycle.Application
			});
		});

		// simulate onBeforeRendering to force to create the component
		oComponentContainer.onBeforeRendering();

		var done = (function() {
			var asyncDone = assert.async();
			return function cleanup() {
				var oNestedComponent = oComponentContainer.getComponentInstance();
				oComponentContainer.destroy();
				assert.ok(!oNestedComponent.bIsDestroyed, "Nested Component must not be destroyed");
				oNestedComponent.destroy();
				oOwnerComponent.destroy();
				asyncDone();
			};
		})();

		sap.ui.require([
			"samples/components/button/Component"
		], function(UsedComponent) {

			var oComponentUsage = oComponentContainer.getComponentInstance();

			assert.equal(oComponentContainer.getLifecycle(), ComponentLifecycle.Application, "ComponentLifecycle is Application!");
			assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
			assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of samples.components.button.Component");
			assert.equal(oOwnerComponent.getId(), Component.getOwnerIdFor(oComponentUsage), "ComponentUsage must be created with the creator Component as owner");
			done();

		});

	});

	QUnit.module("Callback");

	QUnit.test("Synchronous componentCreated callback", function (assert) {

		var done = assert.async();

		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			componentCreated: function(oEvent) {
				assert.ok(true, "ComponentContainer notified that the Component has been created");
				assert.ok(oEvent.getParameter("component") instanceof Component, "Component instance has been passed as event parameter");
				assert.strictEqual(oEvent.getParameter("component"), this.getComponentInstance(), "Component instance has been passed as event parameter");
				done();
			}
		});

		// simulate rendering
		oComponentContainer.onBeforeRendering();

	});

	QUnit.test("Asynchronous componentCreated callback", function (assert) {

		var done = assert.async();
		var iTimeout = setTimeout(function() {
			assert.ok(false, 'Test timed out');
			done();
		}, 2000);

		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			async: true,
			componentCreated: function(oEvent) {
				assert.ok(true, "ComponentContainer notified that the Component has been created");
				assert.ok(oEvent.getParameter("component") instanceof Component, "Component instance has been passed as event parameter");
				assert.strictEqual(oEvent.getParameter("component"), this.getComponentInstance(), "Component instance has been passed as event parameter");
				clearTimeout(iTimeout);
				done();
			}
		});

		// simulate rendering
		oComponentContainer.onBeforeRendering();

	});

	QUnit.module("Manifest First", {
		beforeEach : function() {

			// setup fake server
			var oManifest = this.oManifest = {
				"sap.app" : {
					"id" : "samples.components.sample"
				}
			};

			var oServer = this.oServer = sinon.sandbox.useFakeServer();

			oServer.xhr.useFilters = true;
			oServer.xhr.filters = [];
			oServer.xhr.addFilter(function(method, url) {
				return url !== "/anylocation/manifest.json?sap-language=EN";
			});

			oServer.autoRespond = true;
			oServer.respondWith("GET", "/anylocation/manifest.json?sap-language=EN", [
				200,
				{
					"Content-Type": "application/json"
				},
				JSON.stringify(oManifest)
			]);

		},
		afterEach : function() {}
	});


	QUnit.test("Manifest delegation to component instance (sync)", function(assert) {

		var oServer = this.oServer, oManifest = this.oManifest;

		// start test
		var oComponentContainer = new ComponentContainer({
			manifest: "/anylocation/manifest.json",
			async: false
		});

		// simulate rendering
		oComponentContainer.onBeforeRendering();

		// check the manifest being available properly
		var oComponent = oComponentContainer.getComponentInstance();
		assert.ok(oComponent.getManifest(), "Manifest is available");
		assert.deepEqual(oComponent.getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");

	});

	QUnit.test("Manifest delegation to component instance (async)", function(assert) {

		var done = assert.async();
		var iTimeout = setTimeout(function() {
			assert.ok(false, 'Test timed out');
			done();
		}, 2000);

		var oServer = this.oServer, oManifest = this.oManifest;

		// start test
		var oComponentContainer = new ComponentContainer({
			manifest: "/anylocation/manifest.json",
			componentCreated: function(oEvent) {
				var oComponent = oEvent.getParameter("component");
				assert.ok(oComponent.getManifest(), "Manifest is available");
				assert.deepEqual(oComponent.getManifest(), oManifest, "Manifest matches the manifest behind manifestUrl");
				clearTimeout(iTimeout);
				done();
			}
		});

		// simulate rendering
		oComponentContainer.onBeforeRendering();

	});

	QUnit.module("Race conditions");

	QUnit.test("Component created event must be fired only once", function (assert) {

		assert.expect(1);

		var done = assert.async();
		var iTimeout = setTimeout(function() {
			assert.ok(false, 'Test timed out');
			done();
		}, 2000);

		sap.ui.require(["sap/ui/core/Component", "sap/ui/core/ComponentContainer"], function(Component, ComponentContainer) {

			var oComponentContainer = new ComponentContainer({
				name: "samples.components.button",
				async: true,
				componentCreated: function(oEvent) {
					assert.ok(true, "ComponentContainer notified that the Component has been created");
					clearTimeout(iTimeout);
					done();
				}
			});

			// simulate rendering
			oComponentContainer.onBeforeRendering();
			// simulate a property update during load of component which causes re-rendering
			oComponentContainer.onBeforeRendering();

		});

	});

});