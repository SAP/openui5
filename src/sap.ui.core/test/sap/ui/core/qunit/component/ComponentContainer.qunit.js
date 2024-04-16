sap.ui.define([
	'sap/base/future',
	'sap/base/Log',
	'sap/ui/core/library',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer'
], function(future, Log, sapUiCore, Component, ComponentContainer) {

	"use strict";
	/*global QUnit, sinon */

	var ComponentLifecycle = sapUiCore.ComponentLifecycle;

	sap.ui.loader.config({
		paths:{
			"sap/ui/test":"test-resources/sap/ui/core/qunit/component/testdata/",
			"sap/ui/test/qunitPause": "resources/sap/ui/test/qunitPause",
			"sap/ui/test/RecorderHotkeyListener": "resources/sap/ui/test/RecorderHotkeyListener"
		}
	});

	/*
	 * Helper to create a ComponentContainer with the given settings,
	 * triggering component creation and waiting for it.
	 *
	 * The returned promise resolves with the container.
	 */
	function createContainerAndWait(oSettings) {
		return new Promise(function(resolve) {
			var oComponentContainer;
			Object.assign(oSettings, {
				componentCreated: function(e) {
					resolve(oComponentContainer);
				}
			});
			oComponentContainer = new ComponentContainer(oSettings);
			// simulate onBeforeRendering to force to create the component
			oComponentContainer.onBeforeRendering();
		});
	}

	QUnit.module("General");

	QUnit.test("Should be able to set a component", function (assert) {
		var oComponentContainer = new ComponentContainer();

		return Component.create({
			name: "samples.components.button"
		}).then(function (oComponent) {
			oComponentContainer.setComponent(oComponent);

			assert.strictEqual(oComponent.getId(), oComponentContainer.getComponent(), "Was able to set component");
		});

	});

	QUnit.test("Create component async - componentCreated", function (assert) {
		var done = assert.async();
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			async: true,
			componentCreated: function(oEvent) {
				var oComponent = oEvent.getParameter("component");
				assert.strictEqual(oComponent.getId(), oComponentContainer.getComponent(), "Was able to create component, componentCreated fired");
				done();
			}
		});
		oComponentContainer.onBeforeRendering();
	});

	/**
	 * @deprecated
	 */
	QUnit.test("Create component async - componentFailed (default) (future=false)", function (assert) {
		future.active = false;
		var done = assert.async();
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.unkown",
			async: true,
			componentFailed: function(oEvent) {
				// Create Log spy within componentFailed and ignore 404 error for /samples/components/unkown/Component.js
				var oLogErrorSpy = this.spy(Log, "error");
				var oReason = oEvent.getParameter("reason");
				assert.ok(true, "Was not able to create component, componentFailed fired");
				assert.ok(oReason.message.indexOf("failed to load") === 0, "Error object is passed as reason");
				Promise.resolve().then(function() {
					assert.ok(oLogErrorSpy.calledWith(sinon.match(/Failed to load component for container/)));
					assert.strictEqual(oLogErrorSpy.callCount, 1, "One error should have been logged");
					future.active = undefined;
					done();
				});
			}.bind(this)
		});
		oComponentContainer.onBeforeRendering();
	});

	QUnit.test("Create component async - componentFailed (default) (future=true)", async function (assert) {
		future.active = true;
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.unkown",
			async: true,
			componentFailed: function(oEvent) {
				var oReason = oEvent.getParameter("reason");
				assert.ok(true, "Was not able to create component, componentFailed fired");
				assert.ok(oReason.message.indexOf("failed to load") === 0, "Error object is passed as reason");
			}
		});
		oComponentContainer.onBeforeRendering();
		await oComponentContainer._oComponentPromise.catch((err) => {
			assert.ok(err.message.includes("failed to load 'samples/components/unkown/Component.js"), "Component creation fails with correct error");
			future.active = undefined;
		});
	});

	QUnit.test("Create component async - componentFailed (prevent Default)", function (assert) {
		var done = assert.async();
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.unkown",
			async: true,
			componentFailed: function(oEvent) {
				// Create Log spy within componentFailed and ignore 404 error for /samples/components/unkown/Component.js
				var oLogErrorSpy = this.spy(Log, "error");
				var oReason = oEvent.getParameter("reason");
				assert.ok(true, "Was not able to create component, componentFailed fired");
				assert.ok(oReason.message.indexOf("failed to load") === 0, "Error object is passed as reason");
				Promise.resolve().then(function() {
					assert.strictEqual(oLogErrorSpy.callCount, 0, "no error should have been logged");
					done();
				});
				oEvent.preventDefault();
			}.bind(this)
		});
		oComponentContainer.onBeforeRendering();
	});

	QUnit.test("Should be able to create a component with URL", function (assert) {
		var done = assert.async();
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			url: "test-resources/sap/ui/core/samples/components/button",
			async: true,
			componentCreated: function () {
				assert.ok(oComponentContainer.getComponent(), "Was able to create component");
				done();
			}
		});
		oComponentContainer.onBeforeRendering();
	});

	QUnit.test("Should be able to chain setComponent", function (assert) {
		var oComponentContainer = new ComponentContainer();

		return Component.create({
			name: "samples.components.button",
			manifest: false
		}).then(function(oComponent) {

			oComponentContainer.setComponent(oComponent).setComponent(oComponent);

			assert.strictEqual(oComponent.getId(), oComponentContainer.getComponent(), "Was able to chain the setter");
		});
	});

	QUnit.test("Should call lifecycle methods of nested Component (app created)", function (assert) {
		var oComponentContainer = new ComponentContainer();

		return Component.create({
			name: "samples.components.button",
			manifest: false
		}).then(function(oComponent) {
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

			oComponentContainer.destroy();
		});

	});

	QUnit.test("Should call lifecycle methods of nested Component (created by Container, async)", function (assert) {
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			async: true
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

		var done = assert.async();
		oComponentContainer.attachComponentCreated(function() {
			oComponentContainer.onBeforeRendering();
			assert.ok(onBeforeRenderingSpy.calledOnce, "onBeforeRendering was called");
			assert.ok(onAfterRenderingSpy.notCalled, "onAfterRendering was not called");

			oComponentContainer.onAfterRendering();

			assert.ok(onBeforeRenderingSpy.calledOnce, "onBeforeRendering was called");
			assert.ok(onAfterRenderingSpy.calledOnce, "onAfterRendering was called");

			oComponentContainer.destroy();
			done();
		});

		// first call to onBeforeRendering will trigger async component creaetion,
		// componentCreated listener will trigger onBeforeRendering again
		oComponentContainer.onBeforeRendering();
		assert.ok(onBeforeRenderingSpy.notCalled, "onBeforeRendering was not called");
		assert.ok(onAfterRenderingSpy.notCalled, "onAfterRendering was not called");

	});

	QUnit.test("Should propagate the owner component (async)", function (assert) {
		var oOwnerComponent = new Component("owner");
		var oComponentContainer;

		var done = assert.async();
		function fnAsserts() {
			assert.strictEqual(Component.getOwnerComponentFor(oComponentContainer).getId(), oOwnerComponent.getId(), "owner of ComponentContainer should be the expected component");
			assert.strictEqual(Component.getOwnerComponentFor(oComponentContainer.getComponentInstance()).getId(), oOwnerComponent.getId(), "owner of created component should be the expected component");
			done();
			oComponentContainer.destroy();
			oOwnerComponent.destroy();
		}

		oOwnerComponent.runAsOwner(function() {
			oComponentContainer = new ComponentContainer({
				name: "samples.components.button",
				async: true,
				componentCreated: fnAsserts
			});
		});

		// simulate rendering
		oComponentContainer.onBeforeRendering();
	});

	QUnit.test("Should prefix Component ID when an ID preprocessor is defined", function (assert) {
		var done = assert.async(2);
		// simulates the usage in a declarative view
		var oComponentContainerNotPrefixed = new ComponentContainer({
			name: "samples.components.button",
			settings: { id: "componentId" },
			lifecycle: ComponentLifecycle.Container,
			async: true,
			componentCreated: function (oEvent) {
				assert.equal(oEvent.getParameter("component").getId(), "componentId", "Component ID is not prefixed!");
				oComponentContainerNotPrefixed.destroy();
				done();
			}
		});
		var oComponentContainerPrefixed = new ComponentContainer({
			name: "samples.components.button",
			settings: { id: "componentId" },
			lifecycle: ComponentLifecycle.Container,
			autoPrefixId: true,
			async: true,
			componentCreated: function (oEvent) {
				assert.equal(oEvent.getParameter("component").getId(), oComponentContainerPrefixed.getId() + "-componentId", "Component ID is prefixed!");
				oComponentContainerPrefixed.destroy();
				done();
			}
		});

		// simulate onBeforeRendering to force to create the component
		oComponentContainerNotPrefixed.onBeforeRendering();
		oComponentContainerPrefixed.onBeforeRendering();
	});


	QUnit.module("Lifecycle");

	QUnit.test("Legacy should destroy Component onExit but not when replaced", function (assert) {
		var done = assert.async();
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			async: true,
			componentCreated: function (oEvent) {
				var oComponent = oEvent.getParameter("component");

				Component.create({
					name: "samples.components.button"
				}).then(function (oNewComponent) {
					oComponentContainer.setComponent(oNewComponent);

					assert.notOk(oComponent.bIsDestroyed, "Component is not destroyed");

					oComponentContainer.destroy();

					assert.strictEqual(oComponentContainer.getLifecycle(), ComponentLifecycle.Legacy, "Default Component lifecycle should be Legacy");
					assert.ok(oComponentContainer.bIsDestroyed, "Component Container is destroyed");
					assert.ok(oNewComponent.bIsDestroyed, "New Component is destroyed");

					done();
				});
			}
		});
		// simulate onBeforeRendering to force to create the component
		oComponentContainer.onBeforeRendering();
	});

	QUnit.test("Application managed should not destroy Component", function (assert) {

		return Promise.all([
			// Promise 1: create a component container, trigger async component creation and wait for it to complete
			createContainerAndWait({
				name: "samples.components.button",
				manifest: false, // because samples.components.button has no manifest but static metadata
				lifecycle: ComponentLifecycle.Application,
				async: true
			}),
			// Promise 2: another component instance
			Component.create({
				name: "samples.components.button",
				manifest: false
			})
		]).then(function(aResults) {

			var oComponentContainer = aResults[0];
			var oNewComponent = aResults[1];

			var oComponent = oComponentContainer.getComponentInstance();

			oComponentContainer.setComponent(oNewComponent);
			assert.ok(!oComponent.bIsDestroyed, "Component should not have been destroyed because of lifecyle Application");

			oComponentContainer.destroy();

			assert.ok(oComponentContainer.bIsDestroyed, "Component Container should be destroyed");
			assert.ok(!oComponent.bIsDestroyed, "Old Component should not have been destroyed due to lifecyle 'Application'");
			assert.ok(!oNewComponent.bIsDestroyed, "New Component should not have destroyed due to lifecycle 'Application'");

			oComponent.destroy();
			oNewComponent.destroy();
		});
	});

	QUnit.test("Container managed should destroy Component", function (assert) {
		return Promise.all([
			createContainerAndWait({
				name: "samples.components.button",
				manifest: false,
				lifecycle: ComponentLifecycle.Container,
				async: true
			}),
			// Promise 2: another component instance
			Component.create({
				name: "samples.components.button",
				manifest: false
			})
		]).then(function(aResults) {

			var oComponentContainer = aResults[0];
			var oNewComponent = aResults[1];

			var oComponent = oComponentContainer.getComponentInstance();

			oComponentContainer.setComponent(oNewComponent);

			assert.ok(oComponent.bIsDestroyed, "Component is destroyed because it was created by the ComponentContainer");

			oComponentContainer.destroy();

			assert.ok(oComponentContainer.bIsDestroyed, "Component Container is destroyed");
			assert.ok(oNewComponent.bIsDestroyed, "New Component is destroyed because the lifecycle is managed by the Component");
		});
	});


	QUnit.module("Usage", {
		beforeEach: function() {
			return Promise.all([
				Component.create({
					name: "my.usage",
					manifest: false
				}).then(function(oComponent){
					this.oOwnerComponent = oComponent;
				}.bind(this)),
				Component.create({
					name: "sap.ui.test.v2empty",
					manifest: false
				}).then(function(oComponent) {
					this.oNewComponent = oComponent;
				}.bind(this))
			]);
		}, afterEach: function() {
			this.oNewComponent.destroy();
			this.oOwnerComponent.destroy();
		}
	});

	sap.ui.define("my/usage/Component", ["sap/ui/core/UIComponent"], function(UIComponent) {
		return UIComponent.extend("my.usage.Component", {
			metadata: {
				manifest: {
					"sap.app" : {
						"id" : "my.usage"
					},
					"sap.ui5" : {
						/*
						"dependencies": {
							"components": {
								"samples.components.button": {}
							}
						},*/
						"componentUsages": {
							"myUsage": {
								"name": "samples.components.button",
								"settings": {
									"id": "myUsage"
								}
							}
						}
					}
				}
			}
		});
	});


	QUnit.test("Container should create the component usage (async)", function (assert) {

		// create the container within the context of the owner component
		return this.oOwnerComponent.runAsOwner(function() {
			return createContainerAndWait({
				usage: "myUsage",
				async: true
			});
		}).then(function(oComponentContainer) {

			var oComponentUsage = oComponentContainer.getComponentInstance();
			var UsedComponent = sap.ui.require("samples/components/button/Component");

			assert.equal(oComponentContainer.getLifecycle(), ComponentLifecycle.Legacy, "ComponentLifecycle is Legacy by default");
			assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
			assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of samples.components.button.Component");
			assert.equal(Component.getOwnerIdFor(oComponentUsage), this.oOwnerComponent.getId(), "ComponentUsage must be created with the creator Component as owner");

			// Overwrite nested component
			oComponentContainer.setComponent(this.oNewComponent);
			assert.ok(oComponentUsage.bIsDestroyed, "Old component should be destroyed");

			// cleanup
			var oNestedComponent = oComponentContainer.getComponentInstance();
			oComponentContainer.destroy();
			assert.ok(oNestedComponent.bIsDestroyed, "Nested Component must be destroyed");

		}.bind(this));

	});

	QUnit.test("Container with ComponentLifecycle=Application", function (assert) {

		// create the container within the context of the owner component
		return this.oOwnerComponent.runAsOwner(function() {
			return createContainerAndWait({
				usage: "myUsage",
				lifecycle: ComponentLifecycle.Application,
				async: true
			});
		}).then(function(oComponentContainer) {

			var oComponentUsage = oComponentContainer.getComponentInstance();
			var UsedComponent = sap.ui.require("samples/components/button/Component");

			assert.equal(oComponentContainer.getLifecycle(), ComponentLifecycle.Application, "ComponentLifecycle is Application!");
			assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
			assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of samples.components.button.Component");
			assert.equal(Component.getOwnerIdFor(oComponentUsage), this.oOwnerComponent.getId(), "ComponentUsage must be created with the creator Component as owner");

			var oNestedComponent = oComponentContainer.getComponentInstance();
			oComponentContainer.destroy();
			assert.ok(!oNestedComponent.bIsDestroyed, "Nested Component must not be destroyed");

			oNestedComponent.destroy();

		}.bind(this));

	});

	QUnit.test("Container with autoPrefixId=true", function (assert) {

		// create the container within the context of the owner component
		return this.oOwnerComponent.runAsOwner(function() {
			return createContainerAndWait({
				id: "container",
				usage: "myUsage",
				lifecycle: ComponentLifecycle.Container,
				autoPrefixId: true,
				async: true
			});
		}).then(function(oComponentContainer) {

			var oUsageComponent = oComponentContainer.getComponentInstance();

			// assert
			assert.equal(oUsageComponent.getId(), "container-myUsage", "The id of the Component instance created for the component usage must be prefixed with the ComponentContainer id");

			// cleanup
			oComponentContainer.destroy();

		});

	});

	QUnit.module("Callback");

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
					"id" : "sap.ui.test.v2empty"
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

	QUnit.test("Manifest delegation to component instance (async)", function(assert) {

		var done = assert.async();
		var iTimeout = setTimeout(function() {
			assert.ok(false, 'Test timed out');
			done();
		}, 2000);

		var oManifest = this.oManifest;

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



	QUnit.module("Special handling of manifest property");

	QUnit.test("Converted to boolean when provided initially", function (assert) {

		assert.expect(4);

		var fnFactory = Component.create;
		var oComponentContainer;

		Component.create = function(mConfig) {
			assert.strictEqual(mConfig.manifest, true, "sap.ui.component is called with boolean true");
		};
		oComponentContainer = new ComponentContainer({
			manifest: "true",
			async: true
		});
		assert.strictEqual(oComponentContainer.getManifest(), true, "Property manifest is converted to boolean true");
		oComponentContainer._createComponent();
		oComponentContainer.destroy();

		Component.create = function(mConfig) {
			assert.strictEqual(mConfig.manifest, false, "sap.ui.component is called with boolean false");
		};
		oComponentContainer = new ComponentContainer({
			manifest: "false",
			async: true
		});
		assert.strictEqual(oComponentContainer.getManifest(), false, "Property manifest is converted to boolean false");
		oComponentContainer._createComponent();
		oComponentContainer.destroy();

		Component.create = fnFactory;

	});

	QUnit.test("Not converted to boolean when calling setManifest", function (assert) {

		assert.expect(4);

		var fnFactory = Component.create;
		var oComponentContainer;

		Component.create = function(mConfig) {
			assert.strictEqual(mConfig.manifest, "true", "sap.ui.component is called with string true");
		};
		oComponentContainer = new ComponentContainer({ async: true });
		oComponentContainer.setManifest("true");
		assert.strictEqual(oComponentContainer.getManifest(), "true", "Property manifest is not converted to boolean");
		oComponentContainer._createComponent();
		oComponentContainer.destroy();

		Component.create = function(mConfig) {
			assert.strictEqual(mConfig.manifest, "false", "sap.ui.component is called with string false");
		};
		oComponentContainer = new ComponentContainer({ async: true });
		oComponentContainer.setManifest("false");
		assert.strictEqual(oComponentContainer.getManifest(), "false", "Property manifest is not converted to boolean");
		oComponentContainer._createComponent();
		oComponentContainer.destroy();

		Component.create = fnFactory;

	});

});