/* global QUnit */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/m/Page",
	"sap/m/Button",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/service/index",
	"sap/ui/dt/Util",
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/thirdparty/sinon-4"
], function (
	UIComponent,
	ComponentContainer,
	Page,
	Button,
	RuntimeAuthoring,
	mServicesDictionary,
	DtUtil,
	ManagedObjectMetadata,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("startService()", {
		before: function () {
			QUnit.config.fixture = null;
			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function() {
					return new Page();
				}
			});

			this.oComponent = new FixtureComponent('Comp');
			this.oComponentContainer = new ComponentContainer("CompCont", {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		beforeEach: function () {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent.getRootControl()
			});
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		},
		after: function () {
			this.oComponentContainer.destroy();
			QUnit.config.fixture = '';
		}
	}, function () {
		QUnit.test("service initialisation must always wait until RTA is started", function (assert) {
			var bRtaIsStarted = false;
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var oServiceSpy = sandbox.spy(function () {
				assert.strictEqual(bRtaIsStarted, true);
				return {};
			});

			this.oRta.attachStart(function () {
				bRtaIsStarted = true;
			});

			sandbox.stub(sap.ui, "require")
				.callThrough()
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			// setTimeout() is just to postpone start a little bit
			setTimeout(function () {
				this.oRta.start();
			}.bind(this));

			return this.oRta.startService(sServiceName);
		});
	});

	QUnit.module("startService() - RTA is pre-started", {
		before: function () {
			QUnit.config.fixture = null;
			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function() {
					return new Page("mockPage");
				}
			});

			this.oComponent = new FixtureComponent('Comp');
			this.oComponentContainer = new ComponentContainer('CompCont', {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		beforeEach: function () {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent.getRootControl()
			});

			return this.oRta.start();
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		},
		after: function () {
			this.oComponentContainer.destroy();
			QUnit.config.fixture = '';
		}
	}, function () {
		QUnit.test("starting a service", function (assert) {
			var oServiceLoader = this.oRta.startService(Object.keys(mServicesDictionary).shift());

			assert.ok(oServiceLoader instanceof Promise, "promise is returned");

			return oServiceLoader
				.then(
					function (oService) {
						assert.ok(jQuery.isPlainObject(oService), "service api is returned");
					},
					function () {
						assert.ok(false, "this should never be called");
					}
				);
		});

		QUnit.test("starting a service too frequently", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var oServiceLoader1 = this.oRta.startService(sServiceName);
			var oServiceLoader2 = this.oRta.startService(sServiceName);
			var oServiceLoader3 = this.oRta.startService(sServiceName);

			assert.strictEqual(oServiceLoader1, oServiceLoader2);
			assert.strictEqual(oServiceLoader1, oServiceLoader3);
			assert.strictEqual(oServiceLoader2, oServiceLoader3);

			return Promise.all([oServiceLoader1, oServiceLoader2, oServiceLoader3]);
		});

		QUnit.test("starting a service after successful initialisation", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var oServiceSpy = sandbox.spy(function () {
				return {};
			});
			var oServiceStub = sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			return this.oRta
				.startService(sServiceName)
				.then(function () {
					assert.ok(oServiceStub.calledOnce);
					assert.ok(oServiceSpy.calledOnce);
					this.oRta.startService(sServiceName).then(function () {
						assert.ok(oServiceStub.calledOnce);
						assert.ok(oServiceSpy.calledOnce);
					});
				}.bind(this));
		});

		QUnit.test("starting a service after failed initialisation", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var oServiceStub = sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, function () {
					throw new Error('some error');
				});

			return this.oRta
				.startService(sServiceName)
				.then(
					function () {
						assert.ok(false, "this should never be called");
					},
					function () {
						assert.ok(true, "service successfully failed");
						assert.ok(oServiceStub.calledOnce);
						return this.oRta
							.startService(sServiceName)
							.then(
								function () {
									assert.ok(false, "this should never be called");
								},
								function () {
									assert.ok(true, "service successfully failed");
									assert.ok(oServiceStub.calledOnce);
								}
							);
					}.bind(this)
				);
		});

		QUnit.test("starting a service with unknown status", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, function () {
					return {};
				});

			return this.oRta
				.startService(sServiceName)
				.then(function () {
					assert.ok(true, "service successfully failed");
					this.oRta._mServices[sServiceName].status = "unknownStatus";
					return this.oRta
						.startService(sServiceName)
						.then(
							function () {
								assert.ok(false, "this should never be called");
							},
							function (oError) {
								assert.ok(true, "service successfully failed");
								assert.ok(oError.message.indexOf("Unknown service status") !== -1);
							}
						);
				}.bind(this));
		});

		QUnit.test("attempt to mutate returned object from the service", function (assert) {
			return this.oRta
				.startService(Object.keys(mServicesDictionary).shift())
				.then(function (oService) {
					assert.throws(function () {
						oService.customMethod = function () {};
					});
					assert.notOk(oService.hasOwnProperty("customMethod"));
				});
		});

		QUnit.test("service methods should be wrapped into Promises", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var fnMockService = function () {
				return {
					exports: {
						method1: function () { return 'value1'; },
						method2: function () { return 'value2'; }
					}
				};
			};

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, fnMockService);

			return this.oRta
				.startService(sServiceName)
				.then(function (oService) {
					var oMethod1 = oService.method1();
					var oMethod2 = oService.method2();

					assert.ok(oMethod1 instanceof Promise);
					assert.ok(oMethod2 instanceof Promise);

					return Promise.all([oMethod1, oMethod2])
						.then(function (aResults) {
							assert.strictEqual(aResults[0], "value1");
							assert.strictEqual(aResults[1], "value2");
						});
				});
		});

		QUnit.test("service methods should be returned only when designTime status is synced", function (assert) {
			assert.expect(3);
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var fnMockService = function () {
				return {
					exports: {
						method1: function () { return 'value1'; }
					}
				};
			};
			var oMockButton = new Button("mockButton");
			var fnDtSynced;

			sandbox.stub(sap.ui, "require")
				.callThrough()
				.withArgs([sServiceLocation]).callsArgWithAsync(1, fnMockService);

			sandbox.stub(ManagedObjectMetadata.prototype, "loadDesignTime")
				.callThrough()
				.withArgs(oMockButton).callsFake(function () {
					return new Promise(function (fnResolve) {
						fnDtSynced = fnResolve;
					});
				});

			this.oComponent.getRootControl().addContent(oMockButton);
			var fnServiceMethod1Stub = sandbox.stub().callsFake(function(oResult) {
				assert.strictEqual(oResult, "value1", "then the service method returns the correct value");
			});
			var fnSyncedEventStub = sandbox.stub().callsFake(function() {
				assert.ok(true, "then dt is synced");
			});

			// at this moment DT has syncing status since designTime for mockButton is still an unresolved promise
			return this.oRta
				.startService(sServiceName)
				.then(function (oService) {
					var oReturn = oService.method1().then(fnServiceMethod1Stub);
					this.oRta._oDesignTime.attachEventOnce("synced", fnSyncedEventStub);
					fnDtSynced({});
					return oReturn;
				}.bind(this))
				.then(function() {
					assert.ok(fnSyncedEventStub.calledBefore(fnServiceMethod1Stub), "then first the designTime was synced and then the service method is called");
				});
		});

		QUnit.test("starting unknown service", function (assert) {
			return this.oRta
				.startService("unknownServiceName")
				.then(
					function () {
						assert.ok(false, "this should never be called");
					},
					function () {
						assert.ok(true, "rejected successfully");
					}
				);
		});

		QUnit.test("network error while loading a service", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var oNetworkError = new Error('Some network error');

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(2, oNetworkError);

			return this.oRta
				.startService(sServiceName)
				.then(
					function () {
						assert.ok(false, "this should never be called");
					},
					function (oError) {
						assert.ok(true, "rejected successfully");
						assert.ok(oError.message.indexOf(oNetworkError.message) !== -1, 'error object contains error original error information');
					}
				);
		});

		QUnit.test("check whether the service is called with the right RTA instance", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var oServiceSpy = sandbox.spy(function () {
				return {};
			});

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			return this.oRta
				.startService(sServiceName)
				.then(function () {
					assert.ok(oServiceSpy.withArgs(this.oRta).calledOnce);
				}.bind(this));
		});

		QUnit.test("service fails if factory function doesn't return an object", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var oServiceSpy = sandbox.spy();

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			return this.oRta
				.startService(sServiceName)
				.then(
					function () {
						assert.ok(false, "this should never be called");
					},
					function () {
						assert.ok(true, "rejected successfully");
					}
				);
		});

		QUnit.test("service fails with any error during initialisation", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var oServiceError = new Error('Error in the service');
			var oServiceSpy = sandbox.spy(function () {
				throw oServiceError;
			});

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			return this.oRta
				.startService(sServiceName)
				.then(
					function () {
						assert.ok(false, "this should never be called");
					},
					function (oError) {
						assert.ok(true, "rejected successfully");
						assert.ok(oServiceSpy.withArgs(this.oRta).calledOnce, "service is called once");
						assert.ok(oError.message.indexOf(oServiceError.message) !== -1, "error message contains original error");
					}.bind(this)
				);
		});

		QUnit.test("async factory of the service", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var fnMockService = function () {
				return Promise.resolve({
					exports: {
						serviceMethod: function () {
							return 'value';
						}
					}
				});
			};

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, fnMockService);

			return this.oRta
				.startService(sServiceName)
				.then(
					function (oService) {
						assert.ok(jQuery.isPlainObject(oService));
						assert.ok(jQuery.isFunction(oService.serviceMethod));
						return oService.serviceMethod().then(function (vResult) {
							assert.strictEqual(vResult, 'value');
						});
					},
					function (vError) {
						assert.ok(false, "this should never be called");
						jQuery.sap.log.error(DtUtil.errorToString(vError));
					}
				);
		});

		QUnit.test("RTA instance is destroyed during initialisation", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var fnMockService = function () {
				return {};
			};
			var fnRevolveModule;

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsFake(function (aRequire, fnResolve) {
					fnRevolveModule = fnResolve;
				});

			var oServicePromise = this.oRta
				.startService(sServiceName)
				.then(
					function () {
						assert.ok(false, "this should never be called");
					},
					function () {
						assert.ok(true, "rejected successfully");
					}
				);

			this.oRta.destroy();
			fnRevolveModule(fnMockService);

			return oServicePromise;
		});

		QUnit.test("RTA instance is destroyed during async initialisation", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var fnMockService = function () {
				return new Promise(function (fnResolve) {
					this.oRta.destroy();
					fnResolve({});
				}.bind(this));
			}.bind(this);

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, fnMockService);

			return this.oRta
				.startService(sServiceName)
				.then(
					function () {
						assert.ok(false, "this should never be called");
					},
					function (oError) {
						assert.ok(true, "rejected successfully");
						assert.ok(oError.message.indexOf("RuntimeAuthoring instance is destroyed") !== -1);
					}
				);
		});
		QUnit.test("starting a service with available events", function (assert) {
			assert.expect(4);
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var fnServicePublish;
			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, function (oRta, fnPublish) {
					fnServicePublish = fnPublish;
					return {
						events: ['eventName']
					};
				});

			return this.oRta
				.startService(sServiceName)
				.then(function (oService) {
					assert.ok(typeof oService.attachEvent === 'function');
					assert.ok(typeof oService.detachEvent === 'function');
					assert.ok(typeof oService.attachEventOnce === 'function');
					var mData = {
						foo: 'bar'
					};
					oService.attachEvent('eventName', function (vData) {
						assert.deepEqual(vData, mData);
					});
					fnServicePublish('eventName', mData);
				});
		});
	});

	QUnit.module("stopService()", {
		before: function () {
			QUnit.config.fixture = null;
			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function() {
					return new Page();
				}
			});

			this.oComponent = new FixtureComponent('Comp');
			this.oComponentContainer = new ComponentContainer('CompCont', {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		beforeEach: function () {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent.getRootControl()
			});

			return this.oRta.start();
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		},
		after: function () {
			this.oComponentContainer.destroy();
			QUnit.config.fixture = '';
		}
	}, function () {
		QUnit.test("stopping running service", function (assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, '/');
			var oDestroySpy = sandbox.spy();
			var fnMockService = function () {
				return {
					destroy: oDestroySpy
				};
			};

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, fnMockService);

			return this.oRta
				.startService(sServiceName)
				.then(function () {
					this.oRta.stopService(sServiceName);
					assert.ok(oDestroySpy.calledOnce);
				}.bind(this));
		});
		QUnit.test("stopping unknown service", function (assert) {
			assert.throws(function () {
				this.oRta.stopService("unknownService");
			}.bind(this));
		});
	});

	QUnit.module("getService()", {
		before: function () {
			QUnit.config.fixture = null;
			var FixtureComponent = UIComponent.extend("fixture.UIComponent", {
				metadata: {
					manifest: {
						"sap.app": {
							id: "fixture.application"
						}
					}
				},
				createContent: function() {
					return new Page();
				}
			});

			this.oComponent = new FixtureComponent('Comp');
			this.oComponentContainer = new ComponentContainer('CompCont', {
				component: this.oComponent
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();
		},
		beforeEach: function () {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent.getRootControl()
			});

			return this.oRta.start();
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		},
		after: function () {
			this.oComponentContainer.destroy();
			QUnit.config.fixture = '';
		}
	}, function () {
		QUnit.test("check alias to startService()", function (assert) {
			var oStartServiceStub = sandbox.stub(this.oRta, "startService").callsFake(function () {
				return Promise.resolve({
					arguments: arguments
				});
			});

			return this.oRta.getService('foo').then(function (oService) {
				assert.ok(oStartServiceStub.calledOnce);
				assert.strictEqual(oService.arguments[0], 'foo');
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});