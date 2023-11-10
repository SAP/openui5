/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/service/ServiceFactoryRegistry",
	"sap/ui/core/service/ServiceFactory"
], function(Log, Component, ServiceFactoryRegistry, ServiceFactory) {
	"use strict";

	sap.ui.define("my/Service", ["sap/ui/core/service/Service"], function(Service) {

		return Service.extend("my.Service", {

			init: function() {
				this._bInitialized = true;
			},

			exit: function() {
				this._bTerminated = true;
			},

			delayedInit: function () {
				this._bDelayedInitialized = true;
			},

			doSomething: function() {
				this._doSomething();
			},

			_doSomething: function() {
				this._iCallCount = this._iCallCount && this._iCallCount++ || 1;
			}

		});

	});

	sap.ui.define("my/ServiceFactory", ["sap/ui/core/service/ServiceFactory", "my/Service"], function(ServiceFactory, MyService) {

		return ServiceFactory.extend("my.ServiceFactory", {

			createInstance: function (oServiceContext) {
				return Promise.resolve(new MyService(oServiceContext))
					.then(function (oService) {
						// Introduced a delayed initialization that will be done later, through a setTimeout
						return new Promise(function (resolve) {
							setTimeout(function () {
								oService.delayedInit();
								resolve(oService);
							}, 1);
						});
					});
			}

		});

	});


	// ===========================================================================

	QUnit.module("Basic API", {

		beforeEach : function(assert) {

			// log spy
			this.oLogSpy = sinon.spy(Log, "warning");

		},

		afterEach : function() {

			this.oLogSpy.restore();
			delete this.oLogSpy;

		}

	});

	/*
	 * This test checks the basic API functionality of the Service Factory Registry
	 * to register/unregister/get a Service Factory.
	 */
	QUnit.test("ServiceFactoryRegistry", function(assert) {

		var done = assert.async();

		sap.ui.require(["sap/ui/core/service/ServiceFactoryRegistry", "my/ServiceFactory"], function(ServiceFactoryRegistry, MyServiceFactory) {

			var sServiceFactoryAlias = "my.ServiceFactoryAlias";
			var oServiceFactory = new MyServiceFactory();

			assert.notOk(ServiceFactoryRegistry.get(sServiceFactoryAlias), "Service Factory is not registered yet!");

			ServiceFactoryRegistry.register(sServiceFactoryAlias, oServiceFactory);

			assert.ok(ServiceFactoryRegistry.get(sServiceFactoryAlias), "Service Factory is registered!");
			assert.equal(ServiceFactoryRegistry.get(sServiceFactoryAlias), oServiceFactory, "Service Factory can be retrieved!");

			ServiceFactoryRegistry.unregister(sServiceFactoryAlias);

			assert.notOk(ServiceFactoryRegistry.get(sServiceFactoryAlias), "Service Factory is unregistered!");

			done();

		});

	});


	/*
	 * This test checks the usage of the Service Factory as a generic factory for
	 * an arbitrary Service by providing the constructor function.
	 */
	QUnit.test("ServiceFactory (generic, should work)", function(assert) {

		var done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/ServiceFactory",
			"my/Service"
		], function(ServiceFactory, MyService) {

			var oServiceFactory = new ServiceFactory(MyService);
			var oServiceContext = {
				scopeObject: {},
				scopeType: "component"
			};

			oServiceFactory.createInstance(oServiceContext).then(function(oService) {
				assert.ok(oService instanceof MyService, "Service is an instance of my.Service");
				assert.deepEqual(oService.getContext(), oServiceContext, "Service has proper context");
				done();
			}).catch(function(oError) {
				assert.ok(false, "An error must no occur here!");
				done();
			});

		});

	});


	/*
	 * This test checks the usage of the Service Factory as a generic factory for
	 * an anonymous Service by providing the object literal.
	 */
	QUnit.test("ServiceFactory (generic/anonymous, should work)", function(assert) {

		var done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/ServiceFactory",
			"sap/ui/core/service/Service"
		], function(ServiceFactory, Service) {

			var oServiceContext = {
					scopeObject: {},
					scopeType: "component"
				};

			var oServiceFactory = new ServiceFactory({
				init: function() {
					assert.deepEqual(this.getContext(), oServiceContext, "Service has proper context in init!");
				},
				exit: function() {
					assert.deepEqual(this.getContext(), oServiceContext, "Service has proper context in exit!");
				},
				doSomething: function() {
					assert.deepEqual(this.getContext(), oServiceContext, "Service has proper context in doSomething!");
				}
			});

			oServiceFactory.createInstance(oServiceContext).then(function(oService) {
				assert.ok(oService instanceof Service, "Service is an instance of sap.ui.core.service.Service");
				assert.deepEqual(oService.getContext(), oServiceContext, "Service has proper context");
				oService.doSomething();
				done();
			}).catch(function(oError) {
				assert.ok(false, "An error must no occur here!");
				done();
			});

		});

	});


	/*
	 * This test checks the usage of the Service Factory will fail to create a
	 * Service instance when no constructor function is passed.
	 */
	QUnit.test("ServiceFactory (generic, should fail)", function(assert) {

		var done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/ServiceFactory"
		], function(ServiceFactory) {

			var oServiceFactory = new ServiceFactory();
			var oServiceContext = {
				scopeObject: {},
				scopeType: "component"
			};

			oServiceFactory.createInstance(oServiceContext).then(function(oService) {
				assert.ok(false, "The createInstance function must not work here!");
				done();
			}).catch(function(oError) {
				assert.equal(oError.message, "Usage of sap.ui.core.service.ServiceFactory requires a service constructor function to create a new service instance or to override the createInstance function!");
				done();
			});

		});

	});


	/*
	 * This test checks the usage of a custom Service Factory which creates a
	 * Service instance with an own createInstance function.
	 */
	QUnit.test("ServiceFactory (specific)", function(assert) {

		var done = assert.async();

		sap.ui.require([
			"my/ServiceFactory",
			"my/Service"
		], function(MyServiceFactory, MyService) {

			var oServiceFactory = new MyServiceFactory(MyService);
			var oServiceContext = {
				scopeObject: {},
				scopeType: "component"
			};

			oServiceFactory.createInstance(oServiceContext).then(function(oService) {
				assert.ok(oService instanceof MyService, "Service is an instance of my.Service");
				assert.deepEqual(oService.getContext(), oServiceContext, "Service has proper context");
				done();
			}).catch(function(oError) {
				assert.ok(false, "An error must no occur here!");
				done();
			});

		});

	});


	/*
	 * This test checks that the Service API is working properly and that the
	 * Service interface will shield the Service instance properly.
	 */
	QUnit.test("Service", function(assert) {

		var done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/Service",
			"my/Service"
		], function(Service, MyService) {

			var oMyService = new MyService();
			var oMyServiceInterface = oMyService.getInterface();

			assert.ok(oMyService instanceof Service, "Service is instance of sap.ui.core.service.Service");
			assert.equal(typeof oMyService.getInterface, "function", "Service has getInterface function");
			assert.equal(typeof oMyService.getContext, "function", "Service has getContext function");
			assert.equal(typeof oMyService.destroy, "function", "Service has destroy function");
			assert.equal(typeof oMyService.init, "function", "Service has init function");
			assert.equal(typeof oMyService.exit, "function", "Service has exit function");
			assert.equal(typeof oMyService.doSomething, "function", "Service has doSomething function");
			assert.equal(typeof oMyService._doSomething, "function", "Service has _doSomething function");

			assert.notOk(oMyServiceInterface instanceof Service, "Service Interface must not be type sap.ui.core.service.Service");
			assert.equal(typeof oMyServiceInterface.getInterface, "undefined", "Service Interface has no getInterface function");
			assert.equal(typeof oMyServiceInterface.getContext, "undefined", "Service Interface has no getContext function");
			assert.equal(typeof oMyServiceInterface.destroy, "undefined", "Service Interface has no destroy function");
			assert.equal(typeof oMyServiceInterface.init, "undefined", "Service Interface has no init function");
			assert.equal(typeof oMyServiceInterface.exit, "undefined", "Service Interface has no exit function");
			assert.equal(typeof oMyServiceInterface.doSomething, "function", "Service Interface has doSomething function");
			assert.equal(typeof oMyServiceInterface._doSomething, "undefined", "Service Interface has no _doSomething function");

			oMyServiceInterface.doSomething();
			assert.equal(oMyService._iCallCount, 1, "Service interface forwards function call!");

			assert.ok(oMyService._bInitialized, "Service is initialized!");
			assert.notOk(oMyService._bTerminated, "Service is not terminated yet!");
			oMyService.destroy();
			assert.ok(oMyService._bTerminated, "Service is terminated!");

			done();

		});

	});


	/*
	 * The following test defines anonymous services with the shorthand notation
	 * and checks that those object literals become proper services.
	 */
	QUnit.test("Service (anonymous)", function(assert) {

		var done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/ServiceFactory",
			"sap/ui/core/service/Service"
		], function(ServiceFactory, Service) {

			var oAnonymousServiceFactory = new ServiceFactory({

				init: function() {
					this._bInitialized = true;
				},

				exit: function() {
					this._bTerminated = true;
				},

				doSomething: function() {
					this._doSomething();
				},

				_doSomething: function() {
					this._iCallCount = this._iCallCount && this._iCallCount++ || 1;
				}

			});

			oAnonymousServiceFactory.createInstance().then(function(oMyService) {

				var oMyServiceInterface = oMyService.getInterface();

				assert.ok(oMyService instanceof Service, "Service is instance of sap.ui.core.service.Service");
				assert.equal(typeof oMyService.getInterface, "function", "Service has getInterface function");
				assert.equal(typeof oMyService.getContext, "function", "Service has getContext function");
				assert.equal(typeof oMyService.destroy, "function", "Service has destroy function");
				assert.equal(typeof oMyService.init, "function", "Service has init function");
				assert.equal(typeof oMyService.exit, "function", "Service has exit function");
				assert.equal(typeof oMyService.doSomething, "function", "Service has doSomething function");
				assert.equal(typeof oMyService._doSomething, "function", "Service has _doSomething function");

				assert.notOk(oMyServiceInterface instanceof Service, "Service Interface must not be type sap.ui.core.service.Service");
				assert.equal(typeof oMyServiceInterface.getInterface, "undefined", "Service Interface has no getInterface function");
				assert.equal(typeof oMyServiceInterface.getContext, "undefined", "Service Interface has no getContext function");
				assert.equal(typeof oMyServiceInterface.destroy, "undefined", "Service Interface has no destroy function");
				assert.equal(typeof oMyServiceInterface.init, "undefined", "Service Interface has no init function");
				assert.equal(typeof oMyServiceInterface.exit, "undefined", "Service Interface has no exit function");
				assert.equal(typeof oMyServiceInterface.doSomething, "function", "Service Interface has doSomething function");
				assert.equal(typeof oMyServiceInterface._doSomething, "undefined", "Service Interface has no _doSomething function");

				oMyServiceInterface.doSomething();
				assert.equal(oMyService._iCallCount, 1, "Service interface forwards function call!");

				assert.ok(oMyService._bInitialized, "Service is initialized!");
				assert.notOk(oMyService._bTerminated, "Service is not terminated yet!");
				oMyService.destroy();
				assert.ok(oMyService._bTerminated, "Service is terminated!");

				done();

			}).catch(function(oError) {

				assert.ok(false, "createInstance must not be failing!");
				done();

			});

		});

	});


	/*
	 * The following test defines anonymous services with the shorthand notation
	 * and checks that those object literals become proper services.
	 */
	QUnit.test("Service (anonymous) - filter special members", function(assert) {

		var done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/ServiceFactory"
		], function(ServiceFactory) {

			var oAnonymousServiceFactory = new ServiceFactory({
				metadata: {},
				constructor: function() {},
				getContext: function() {},
				destroy: function() {},
				doSomething: function() {}
			});

			oAnonymousServiceFactory.createInstance().then(function(oMyService) {

				assert.equal(this.oLogSpy.callCount, 4, "4 Warnings have been reported!");
				["metadata", "constructor", "getContext", "destroy"].forEach(function(sMember, iIndex) {
					assert.equal(this.oLogSpy.getCall(iIndex).args[0], "The member " + sMember + " is not allowed for anonymous service declaration and will be ignored!", "Warning for " + sMember + " has been reported!");
				}.bind(this));

				done();

			}.bind(this)).catch(function(oError) {

				assert.ok(false, "createInstance must not be failing!");
				done();

			});

		}.bind(this));

	});


	/*
	 * This test checks that the Service Lifecycle is working properly.
	 */
	QUnit.test("Service Lifecycle", function(assert) {

		var done = assert.async();

		sap.ui.require([
			"my/Service"
		], function(MyService) {

			var oMyService = new MyService();
			assert.ok(oMyService._bInitialized, "Service init hook was called!");

			oMyService.destroy();
			assert.ok(oMyService._bTerminated, "Service exit hook was called!");

			done();

		});

	});


	// ===========================================================================

	QUnit.module("Component Usage", {

		beforeEach : async function(assert) {

			// define the manifest for the Component test
			var oManifest = this.oManifest = {
				"sap.app" : {
					"id" : "samples.components.button"
				},
				"sap.ui5" : {
					"services": {
						"MyServiceAlias": {
							"factoryName": "my.ServiceFactoryAlias"
						},
						"OtherServiceAlias": {
							"factoryName": "other.ServiceFactoryAlias"
						},
						"InvalidServiceAlias": {
							"factoryName": "invalid.ServiceFactoryAlias"
						},
						"OptionalServiceAlias": {
							"factoryName": "optional.ServiceFactoryAlias",
							"optional": true
						},
						"AutoLoadServiceAlias": {
							"factoryName": "lazy.ServiceFactoryAlias",
							"optional": true,
							"lazy": false
						},
						"SettingsServiceAlias": {
							"factoryName": "settings.ServiceFactoryAlias",
							"settings": {
								"setHierarchy": "auto",
								"setTitle": "auto"
							}
						}
					}
				}
			};


			// fake server
			var oServer = this.oServer = this._oSandbox.useFakeServer();

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


			// log spy
			this.oLogSpy = this.spy(Log, "error");

			// register the Service Factories before component creation
			await new Promise((resolve, reject) => {
				sap.ui.require(["my/ServiceFactory"], function(MyServiceFactory) {
					ServiceFactoryRegistry.register("my.ServiceFactoryAlias", new MyServiceFactory());
					ServiceFactoryRegistry.register("invalid.ServiceFactoryAlias", new ServiceFactory());
					ServiceFactoryRegistry.register("lazy.ServiceFactoryAlias", new MyServiceFactory());
					ServiceFactoryRegistry.register("settings.ServiceFactoryAlias", new MyServiceFactory());
					resolve();
				}, reject);
			});

			// create the component
			this.oComponent = await Component.create({
				manifest: "/anylocation/manifest.json"
			});
		},

		afterEach : function() {

			// unregister the Service Factory for: my.ServiceFactoryAlias
			ServiceFactoryRegistry.unregister("my.ServiceFactoryAlias");
			ServiceFactoryRegistry.unregister("lazy.ServiceFactoryAlias");
			ServiceFactoryRegistry.unregister("settings.ServiceFactoryAlias");

			this.oComponent.destroy();
			delete this.oComponent;
			delete this.oManifest;

		}

	});


	/*
	 * This test checks that a Service can be retrieved properly from the
	 * Component Service API.
	 */
	QUnit.test("Retrieve Service from existing Service Factory", function(assert) {

		var oComponent = this.oComponent;

		var done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/Service",
			"my/Service"
		], function(Service, MyService) {

			oComponent.getService("MyServiceAlias").then(function(oService) {

				assert.notOk(oService instanceof Service, "Service Interface must not be type sap.ui.core.service.Service");
				assert.equal(typeof oService.destroy, "undefined", "Service Interface has no destroy function");
				assert.equal(typeof oService.doSomething, "function", "Service Interface has doSomething function");
				assert.equal(typeof oService._doSomething, "undefined", "Service Interface has no _doSomething function");

				oComponent.getService("MyServiceAlias").then(function(oSameService) {
					assert.equal(oService, oSameService, "The service instance is the same!");
					done();
				}).catch(function(oError) {
					assert.ok(false, "getService must not be failing!");
					done();
				});

				var oServiceInstance = oComponent._mServices["MyServiceAlias"].instance;
				assert.ok(oServiceInstance._bInitialized, "Service is initialized properly!");
				oComponent.destroy();
				assert.ok(oServiceInstance._bTerminated, "Service is terminated properly!");
				assert.notOk(oComponent._mServices, "Local Service instance registry is deleted!");

			}).catch(function(oError) {
				assert.ok(false, "getService must not be failing!");
				done();

			});

		});

	});

	/*
	 * This test checks that the Promise rejects if no service is configured
	 * Component Service API.
	 */
	QUnit.test("Retrieve Service from existing Service Factory", function(assert) {

		var oComponent = this.oComponent;

		var done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/Service",
			"my/Service"
		], function(Service, MyService) {

			oComponent.getService("MyServiceAlias").then(function(oService) {

				assert.notOk(oService instanceof Service, "Service Interface must not be type sap.ui.core.service.Service");
				assert.equal(typeof oService.destroy, "undefined", "Service Interface has no destroy function");
				assert.equal(typeof oService.doSomething, "function", "Service Interface has doSomething function");
				assert.equal(typeof oService._doSomething, "undefined", "Service Interface has no _doSomething function");

				oComponent.getService("MyNonExistingAlias").then(function(oSameService) {
					assert.ok(false, "Service not configured - should not happen");
					done();
				}).catch(function(oError) {
					assert.ok(oError, "getService fails as service is not configured!");
					done();
				});

				var oServiceInstance = oComponent._mServices["MyServiceAlias"].instance;
				assert.ok(oServiceInstance._bInitialized, "Service is initialized properly!");
				oComponent.destroy();
				assert.ok(oServiceInstance._bTerminated, "Service is terminated properly!");
				assert.notOk(oComponent._mServices, "Local Service instance registry is deleted!");

			}).catch(function(oError) {

				assert.ok(false, "getService must not be failing!");
				done();

			});

		});

	});

	QUnit.test("Retrieve Service from existing Service Factory twice, with caching", function(assert) {

		var oComponent = this.oComponent,
			done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/Service",
			"my/Service"
		], function(Service, MyService) {

			var oServicePromise1 = oComponent.getService("MyServiceAlias"),
				oServicePromise2 = oComponent.getService("MyServiceAlias");

			assert.strictEqual(oServicePromise1, oServicePromise2, "The second promise comes from cache.");

			Promise.all([oServicePromise1, oServicePromise2]).then(function(aServices) {
				assert.strictEqual(aServices[0], aServices[1], "Both services should be the same.");
			}).then(done);
		});

	});

	QUnit.test("Retrieve Service while component has been destroyed", function(assert) {

		var oComponent = this.oComponent,
			done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/Service",
			"my/Service"
		], function(Service, MyService) {

			var oServicePromise = oComponent.getService("MyServiceAlias");
			oComponent.destroy();

			oServicePromise.then(function(oService) {
				assert.notOk(true, "Service Promise should reject");
			}, function(e) {
				assert.ok(e instanceof Error, "Rejected with Error.");
				assert.equal(e.message, "Service MyServiceAlias could not be loaded as its Component was destroyed.", "Rejected with message.");
			}).then(done);
		});
	});

	QUnit.test("Retrieve Service from missing Service Factory", function(assert) {

		var oComponent = this.oComponent,
			done = assert.async();

		oComponent.getService("OtherServiceAlias").then(function(oService) {
			assert.ok(false, "Service must not be created!");
		}).catch(function(oError) {
			assert.equal(oError.message, "The ServiceFactory other.ServiceFactoryAlias for Service OtherServiceAlias not found in ServiceFactoryRegistry!", "Service Factory not found Error");
			assert.equal(this.oLogSpy.callCount, 1, "getService created one error log message");
			assert.equal(this.oLogSpy.firstCall.args[0], "The ServiceFactory other.ServiceFactoryAlias for Service OtherServiceAlias not found in ServiceFactoryRegistry!", "getService created one error log message");
		}.bind(this)).then(done);

	});

	QUnit.test("Retrieve optional Service from missing Service Factory", function(assert) {

		var oComponent = this.oComponent,
			done = assert.async();

		oComponent.getService("OptionalServiceAlias").then(function(oService) {
			assert.ok(false, "Service must not be created!");
		}).catch(function(oError) {
			assert.equal(oError.message, "The ServiceFactory optional.ServiceFactoryAlias for Service OptionalServiceAlias not found in ServiceFactoryRegistry!", "Service Factory not found Error");
			assert.equal(this.oLogSpy.callCount, 0, "getService created no error log message");
		}.bind(this)).then(done);

	});

	QUnit.test("Retrieve Service from invalid Service Factory", function(assert) {

		var oComponent = this.oComponent,
			done = assert.async();

		oComponent.getService("InvalidServiceAlias").then(function(oService) {
			assert.ok(false, "Service must not be created!");
		}).catch(function(oError) {
			assert.equal(oError.message, "Usage of sap.ui.core.service.ServiceFactory requires a service constructor function to create a new service instance or to override the createInstance function!", "Service Factory not found Error");
		}).then(done);

	});

	QUnit.test("Service setting - lazy false (immediate service start)", function(assert) {

		// setup - local component to be able to place the spy
		var oSpy = this.spy(Component.prototype, "getService");

		return Component.create({
			manifest: "/anylocation/manifest.json"
		}).then(function(oComponent) {
			return oSpy.returnValues[0].then(function() {
				//assert
				sinon.assert.calledOnce(oSpy);
				sinon.assert.calledWith(oSpy, "AutoLoadServiceAlias");
				sinon.assert.calledOn(oSpy, oComponent);

				// cleanup
				oComponent.destroy();
			});
		});

	});

	QUnit.test("Pass settings to service for instantiating", function(assert) {

		var oComponent = this.oComponent,
			done = assert.async();

		sap.ui.require([
			"sap/ui/core/service/Service",
			"my/Service"
		], function(Service, MyService) {

			oComponent.getService("SettingsServiceAlias").then(function(oService) {

				var oServiceInstance = oComponent._mServices["SettingsServiceAlias"].instance;
				var oRefServiceContext = {
					"scopeObject": oComponent,
					"scopeType": "component",
					"settings": {
						"setHierarchy": "auto",
						"setTitle": "auto"
					}
				};
				assert.ok(oServiceInstance._bInitialized, "Service is initialized properly!");
				assert.deepEqual(oServiceInstance.getContext(), oRefServiceContext, "Service context should be the same.");

				done();
			}).catch(function(oError) {

				assert.ok(false, "getService must not be failing!");
				done();

			});

		});

	});
	// Component Service Loading

	// # Component service Inheritance
	QUnit.test("Inheritance - services should be inherited from parent components", function (assert) {
		var oSpy = this.spy(Component.prototype, "getService");

		sap.ui.define("test/services/base/Component", ["sap/ui/core/Component"], function (Component) {
			return Component.extend("test.services.base.Component", {
				metadata: {
					manifest: {
						"sap.ui5": {
							"services": {
								"ParentEagerService": {
									"factoryName": "lazy.ServiceFactoryAlias",
									"optional": true,
									"startup": "eager"
								},
								"ParentLazyService": {
									"factoryName": "my.ServiceFactoryAlias"
								}
							}
						}
					}
				}
			});
		});

		sap.ui.define("test/services/child/Component", ["test/services/base/Component"], function (BaseComponent) {
			return BaseComponent.extend("test.services.child.Component", {});
		});

		// load the test component
		return Component.create({
			manifest: {
				"sap.ui5": {
					"componentName": "test.services.child",
					"services": {
						"ChildEagerService": {
							"factoryName": "lazy.ServiceFactoryAlias",
							"optional": true,
							"startup": "eager"
						},
						"ChildLazyService": {
							"factoryName": "my.ServiceFactoryAlias"
						}
					}
				}
			}
		}).then(function (oComponent) {
			sinon.assert.calledTwice(oSpy);
			sinon.assert.calledWith(oSpy, "ParentEagerService");
			sinon.assert.calledWith(oSpy, "ChildEagerService");
			sinon.assert.neverCalledWith(oSpy, "ChildLazyService");
			sinon.assert.neverCalledWith(oSpy, "ParentLazyService");
			sinon.assert.calledOn(oSpy, oComponent);

			oComponent.destroy();
		});
	});


	// # Component service eager loading
	QUnit.test("Eager service in config - services will not be started before the component is made available", function (assert) {
		var oSpy = this.spy(Component.prototype, "getService");
		// load the test component
		return Component.create({
			manifest: {
				"sap.app": {
					"id": "samples.components.button"
				},
				"sap.ui5": {
					"services": {
						"EagerService": {
							"factoryName": "my.ServiceFactoryAlias",
							"optional": true,
							"startup": "eager"
						},
						"LazyService": {
							"factoryName": "lazy.ServiceFactoryAlias"
						}
					}
				}
			}
		}).then(function (oComponent) {

			sinon.assert.calledOnce(oSpy);
			sinon.assert.calledWith(oSpy, "EagerService");
			sinon.assert.neverCalledWith(oSpy, "LazyService");
			sinon.assert.calledOn(oSpy, oComponent);
			var oServiceInstance = oComponent._mServices["EagerService"].instance;
			assert.ok(!oServiceInstance, "Service is not yet initialized !");

			oComponent.destroy();
		}).finally(function () {
			ServiceFactoryRegistry.unregister("eager.ServiceFactoryAlias");
		});
	});

	QUnit.test("WaitFor service in config - services will be started before the component is made available", function (assert) {
		var oSpy = this.spy(Component.prototype, "getService");

		// load the test component
		return Component.create({
			manifest: {
				"sap.app": {
					"id": "samples.components.button"
				},
				"sap.ui5": {
					"services": {
						"WaitForService": {
							"factoryName": "my.ServiceFactoryAlias",
							"optional": true,
							"startup": "waitFor"
						},
						"LazyService": {
							"factoryName": "lazy.ServiceFactoryAlias"
						}
					}
				}
			}
		}).then(function (oComponent) {

			sinon.assert.calledOnce(oSpy);
			sinon.assert.calledWith(oSpy, "WaitForService");
			sinon.assert.neverCalledWith(oSpy, "LazyService");
			sinon.assert.calledOn(oSpy, oComponent);
			var oServiceInstance = oComponent._mServices["WaitForService"].instance;
			assert.ok(oServiceInstance._bDelayedInitialized, "Service is initialized !");

			oComponent.destroy();
		}).finally(function () {
			ServiceFactoryRegistry.unregister("eager.ServiceFactoryAlias");
		});
	});

	QUnit.test("No Services - component loading should not fail if there is no service defined", function (assert) {
		// load the test component
		return Component.create({
			manifest: {
				"sap.app": {
					"id": "samples.components.button"
				},
				"sap.ui5": {}
			}
		}).then(function () {
			assert.ok(true, "Component create works fine without services !");
		}).catch(function (oError) {
			assert.ok(false, "Component.create must not be failing!", oError);
		});
	});
});
