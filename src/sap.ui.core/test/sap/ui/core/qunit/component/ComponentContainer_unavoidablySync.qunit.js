sap.ui.define([
	'sap/base/Log',
	'sap/ui/core/library',
	'sap/ui/core/Component',
	'sap/ui/core/ComponentContainer'
], function(Log, sapUiCore, Component, ComponentContainer) {

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

	QUnit.test("Should be able to create a component by name", function (assert) {
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button"
		});
		oComponentContainer.onBeforeRendering();

		assert.ok(oComponentContainer.getComponent(), "Was able to create component");
	});

	QUnit.test("Create component sync - componentCreated", function (assert) {
		var done = assert.async();
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			async: false,
			componentCreated: function(oEvent) {
				var oComponent = oEvent.getParameter("component");
				assert.strictEqual(oComponent.getId(), oComponentContainer.getComponent(), "Was able to create component, componentCreated fired");
				done();
			}
		});
		oComponentContainer.onBeforeRendering();
	});

	QUnit.test("Should be able to create a component with URL", function (assert) {
		var oComponentContainer = new ComponentContainer({
			name: "samples.components.button",
			url: "test-resources/sap/ui/core/samples/components/button"
		});
		oComponentContainer.onBeforeRendering();

		assert.ok(oComponentContainer.getComponent(), "Was able to create component");
	});

	QUnit.test("Should call lifecycle methods of nested Component (created by Container, sync)", function (assert) {
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

		oComponentContainer.destroy();
	});

	QUnit.test("Should propagate the owner component (sync)", function (assert) {
		var oOwnerComponent = new Component("owner");
		var oComponentContainer;

		var done = assert.async();
		function fnAsserts() {
			assert.strictEqual(Component.getOwnerComponentFor(oComponentContainer).getId(), oOwnerComponent.getId(), "ComponentContainer created by owner Component");
			assert.strictEqual(Component.getOwnerComponentFor(oComponentContainer.getComponentInstance()).getId(), oOwnerComponent.getId(), "ComponentContainers Component created by owner Component");
			oComponentContainer.destroy();
			oOwnerComponent.destroy();
			done();
		}

		oOwnerComponent.runAsOwner(function() {
			oComponentContainer = new ComponentContainer({
				name: "samples.components.button",
				componentCreated: fnAsserts
			});
		});

		// simulate rendering
		oComponentContainer.onBeforeRendering();
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


	QUnit.test("Container should create the component usage (sync)", function (assert) {

		// create the container within the context of the owner component
		return this.oOwnerComponent.runAsOwner(function() {
			return createContainerAndWait({
				usage: "myUsage",
				async: false
			});
		}).then(function(oComponentContainer) {

			var oComponentUsage = oComponentContainer.getComponentInstance();
			var UsedComponent = sap.ui.require("samples/components/button/Component");

			assert.equal(oComponentContainer.getLifecycle(), ComponentLifecycle.Legacy, "ComponentLifecycle is Legacy by default");
			assert.ok(oComponentUsage instanceof Component, "ComponentUsage must be type of sap.ui.core.Component");
			assert.ok(oComponentUsage instanceof UsedComponent, "ComponentUsage must be type of samples.components.button.Component");
			assert.equal(this.oOwnerComponent.getId(), Component.getOwnerIdFor(oComponentUsage), "ComponentUsage must be created with the creator Component as owner");

			// Overwrite nested component
			oComponentContainer.setComponent(this.oNewComponent);
			assert.ok(oComponentUsage.bIsDestroyed, "Old component should be destroyed");

			// cleanup
			var oNestedComponent = oComponentContainer.getComponentInstance();
			oComponentContainer.destroy();
			assert.ok(oNestedComponent.bIsDestroyed, "Nested Component must be destroyed");

		}.bind(this));

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

	QUnit.test("Manifest delegation to component instance (sync)", function(assert) {

		var oManifest = this.oManifest;

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

	QUnit.module("Special handling of manifest property");

	QUnit.test("Converted to boolean when provided initially", function (assert) {

		assert.expect(4);

		var fnFactoryOld = sap.ui.component;
		var oComponentContainer;

		sap.ui.component = function(mConfig) {
			assert.strictEqual(mConfig.manifest, true, "sap.ui.component is called with boolean true");
		};
		oComponentContainer = new ComponentContainer({
			manifest: "true",
			async: false
		});
		assert.strictEqual(oComponentContainer.getManifest(), true, "Property manifest is converted to boolean true");
		oComponentContainer._createComponent();
		oComponentContainer.destroy();

		sap.ui.component = function(mConfig) {
			assert.strictEqual(mConfig.manifest, false, "sap.ui.component is called with boolean false");
		};
		oComponentContainer = new ComponentContainer({
			manifest: "false",
			async: false
		});
		assert.strictEqual(oComponentContainer.getManifest(), false, "Property manifest is converted to boolean false");
		oComponentContainer._createComponent();
		oComponentContainer.destroy();

		sap.ui.component = fnFactoryOld;

	});

	QUnit.test("Not converted to boolean when calling setManifest", function (assert) {

		assert.expect(4);

		var fnFactoryOld = sap.ui.component;
		var oComponentContainer;

		sap.ui.component = function(mConfig) {
			assert.strictEqual(mConfig.manifest, "true", "sap.ui.component is called with string true");
		};
		oComponentContainer = new ComponentContainer();
		oComponentContainer.setManifest("true");
		assert.strictEqual(oComponentContainer.getManifest(), "true", "Property manifest is not converted to boolean");
		oComponentContainer._createComponent();
		oComponentContainer.destroy();

		sap.ui.component = function(mConfig) {
			assert.strictEqual(mConfig.manifest, "false", "sap.ui.component is called with string false");
		};
		oComponentContainer = new ComponentContainer();
		oComponentContainer.setManifest("false");
		assert.strictEqual(oComponentContainer.getManifest(), "false", "Property manifest is not converted to boolean");
		oComponentContainer._createComponent();
		oComponentContainer.destroy();

		sap.ui.component = fnFactoryOld;

	});


});