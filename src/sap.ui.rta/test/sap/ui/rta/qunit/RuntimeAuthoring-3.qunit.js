/* global QUnit */

sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/ui/base/EventProvider",
	"sap/ui/base/Event",
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/core/Core",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/Util",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/service/index",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/Device",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	UriParameters,
	Log,
	Button,
	MessageBox,
	MessageToast,
	Page,
	EventProvider,
	Event,
	ManagedObjectMetadata,
	oCore,
	DesignTime,
	Overlay,
	DtUtil,
	KeyCodes,
	FlexRuntimeInfoAPI,
	SmartVariantManagementApplyAPI,
	PersistenceWriteAPI,
	Layer,
	FlUtils,
	AppVariantFeature,
	mServicesDictionary,
	RuntimeAuthoring,
	Utils,
	sinon,
	Device,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oTextResources = oCore.getLibraryResourceBundle("sap.ui.rta");

	var oComp = RtaQunitUtils.createAndStubAppComponent(sinon, "fixture.application", {
		"sap.app": {
			id: "fixture.application"
		}
	}, new Page("mockPage"));

	QUnit.module("startService()", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: oComp
			});
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("service initialisation must always wait until RTA is started", function(assert) {
			var bRtaIsStarted = false;
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var oServiceSpy = sandbox.spy(function() {
				assert.strictEqual(bRtaIsStarted, true);
				return {};
			});

			this.oRta.attachStart(function() {
				bRtaIsStarted = true;
			});

			sandbox.stub(sap.ui, "require")
				.callThrough()
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			// setTimeout() is just to postpone start a little bit
			setTimeout(function() {
				this.oRta.start();
			}.bind(this));

			return this.oRta.startService(sServiceName);
		});
	});

	QUnit.module("startService() - RTA is pre-started", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: oComp
			});
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("starting a service", function(assert) {
			var oServiceLoader = this.oRta.startService(Object.keys(mServicesDictionary).shift());

			assert.ok(oServiceLoader instanceof Promise, "promise is returned");

			return oServiceLoader
				.then(function(oService) {
					assert.ok(jQuery.isPlainObject(oService), "service api is returned");
				})
				.catch(function() {
					assert.ok(false, "this should never be called");
				});
		});

		QUnit.test("starting a service too frequently", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var oServiceLoader1 = this.oRta.startService(sServiceName);
			var oServiceLoader2 = this.oRta.startService(sServiceName);
			var oServiceLoader3 = this.oRta.startService(sServiceName);

			assert.strictEqual(oServiceLoader1, oServiceLoader2);
			assert.strictEqual(oServiceLoader1, oServiceLoader3);
			assert.strictEqual(oServiceLoader2, oServiceLoader3);

			return Promise.all([oServiceLoader1, oServiceLoader2, oServiceLoader3]);
		});

		QUnit.test("starting a service after successful initialisation", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var oServiceSpy = sandbox.spy(function() {
				return {};
			});
			var oServiceStub = sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			return this.oRta
				.startService(sServiceName)
				.then(function() {
					assert.ok(oServiceStub.calledOnce);
					assert.ok(oServiceSpy.calledOnce);
					this.oRta.startService(sServiceName);
				}.bind(this))
				.then(function() {
					assert.ok(oServiceStub.calledOnce);
					assert.ok(oServiceSpy.calledOnce);
				});
		});

		QUnit.test("starting a service after failed initialisation", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var oServiceStub = sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, function() {
					throw new Error("some error");
				});

			return this.oRta
				.startService(sServiceName)
				.then(function() {
					assert.ok(false, "this should never be called");
				})
				.catch(function() {
					assert.ok(true, "service successfully failed");
					assert.ok(oServiceStub.calledOnce);
					return this.oRta.startService(sServiceName);
				}.bind(this))
				.then(function() {
					assert.ok(false, "this should never be called");
				})
				.catch(function() {
					assert.ok(true, "service successfully failed");
					assert.ok(oServiceStub.calledOnce);
				});
		});

		QUnit.test("starting a service with unknown status", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, function() {
					return {};
				});

			return this.oRta
				.startService(sServiceName)
				.then(function() {
					assert.ok(true, "service successfully failed");
					this.oRta._mServices[sServiceName].status = "unknownStatus";
					return this.oRta.startService(sServiceName);
				}.bind(this))
				.then(function() {
					assert.ok(false, "this should never be called");
				})
				.catch(function(oError) {
					assert.ok(true, "service successfully failed");
					assert.ok(oError.message.indexOf("Unknown service status") !== -1);
				});
		});

		QUnit.test("attempt to mutate returned object from the service", function(assert) {
			return this.oRta
				.startService(Object.keys(mServicesDictionary).shift())
				.then(function(oService) {
					assert.throws(function() {
						oService.customMethod = function() {};
					});
					assert.notOk(oService.hasOwnProperty("customMethod"));
				});
		});

		QUnit.test("service methods should be wrapped into Promises", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var fnMockService = function() {
				return {
					exports: {
						method1: function() { return "value1"; },
						method2: function() { return "value2"; }
					}
				};
			};

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, fnMockService);

			return this.oRta
				.startService(sServiceName)
				.then(function(oService) {
					var oMethod1 = oService.method1();
					var oMethod2 = oService.method2();

					assert.ok(oMethod1 instanceof Promise);
					assert.ok(oMethod2 instanceof Promise);

					return Promise.all([oMethod1, oMethod2]);
				})
				.then(function(aResults) {
					assert.strictEqual(aResults[0], "value1");
					assert.strictEqual(aResults[1], "value2");
				});
		});

		QUnit.test("service methods should be returned only when designTime status is synced", function(assert) {
			assert.expect(3);
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var fnMockService = function() {
				return {
					exports: {
						method1: function() { return "value1"; }
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
				.withArgs(oMockButton).callsFake(function() {
					return new Promise(function(fnResolve) {
						fnDtSynced = fnResolve;
					});
				});

			oComp.getRootControl().addContent(oMockButton);
			var fnServiceMethod1Stub = sandbox.stub().callsFake(function(oResult) {
				assert.strictEqual(oResult, "value1", "then the service method returns the correct value");
			});
			var fnSyncedEventStub = sandbox.stub().callsFake(function() {
				assert.ok(true, "then dt is synced");
			});

			// at this moment DT has syncing status since designTime for mockButton is still an unresolved promise
			return this.oRta
				.startService(sServiceName)
				.then(function(oService) {
					var oReturn = oService.method1().then(fnServiceMethod1Stub);
					this.oRta._oDesignTime.attachEventOnce("synced", fnSyncedEventStub);
					fnDtSynced({});
					return oReturn;
				}.bind(this))
				.then(function() {
					assert.ok(fnSyncedEventStub.calledBefore(fnServiceMethod1Stub), "then first the designTime was synced and then the service method is called");
				});
		});

		QUnit.test("starting unknown service", function(assert) {
			return this.oRta
				.startService("unknownServiceName")
				.then(function() {
					assert.ok(false, "this should never be called");
				})
				.catch(function() {
					assert.ok(true, "rejected successfully");
				});
		});

		QUnit.test("network error while loading a service", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var oNetworkError = new Error("Some network error");

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(2, oNetworkError);

			return this.oRta
				.startService(sServiceName)
				.then(function() {
					assert.ok(false, "this should never be called");
				})
				.catch(function(oError) {
					assert.ok(true, "rejected successfully");
					assert.ok(oError.message.indexOf(oNetworkError.message) !== -1, "error object contains error original error information");
				});
		});

		QUnit.test("check whether the service is called with the right RTA instance", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var oServiceSpy = sandbox.spy(function() {
				return {};
			});

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			return this.oRta
				.startService(sServiceName)
				.then(function() {
					assert.ok(oServiceSpy.withArgs(this.oRta).calledOnce);
				}.bind(this));
		});

		QUnit.test("service fails if factory function doesn't return an object", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var oServiceSpy = sandbox.spy();

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			return this.oRta
				.startService(sServiceName)
				.then(function() {
					assert.ok(false, "this should never be called");
				})
				.catch(function() {
					assert.ok(true, "rejected successfully");
				});
		});

		QUnit.test("service fails with any error during initialisation", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var oServiceError = new Error("Error in the service");
			var oServiceSpy = sandbox.spy(function() {
				throw oServiceError;
			});

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, oServiceSpy);

			return this.oRta
				.startService(sServiceName)
				.then(function() {
					assert.ok(false, "this should never be called");
				})
				.catch(function(oError) {
					assert.ok(true, "rejected successfully");
					assert.ok(oServiceSpy.withArgs(this.oRta).calledOnce, "service is called once");
					assert.ok(oError.message.indexOf(oServiceError.message) !== -1, "error message contains original error");
				}.bind(this));
		});

		QUnit.test("async factory of the service", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var fnMockService = function() {
				return Promise.resolve({
					exports: {
						serviceMethod: function() {
							return "value";
						}
					}
				});
			};

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, fnMockService);

			return this.oRta
				.startService(sServiceName)
				.then(function(oService) {
					assert.ok(jQuery.isPlainObject(oService));
					assert.ok(typeof oService.serviceMethod === "function");
					return oService.serviceMethod();
				})
				.then(function(vResult) {
					assert.strictEqual(vResult, "value");
				})
				.catch(function(vError) {
					assert.ok(false, "this should never be called");
					Log.error(DtUtil.errorToString(vError));
				});
		});

		QUnit.test("RTA instance is destroyed during initialisation", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var fnMockService = function() {
				return {};
			};
			var fnRevolveModule;

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsFake(function(aRequire, fnResolve) {
					fnRevolveModule = fnResolve;
				});

			var oServicePromise = this.oRta
				.startService(sServiceName)
				.then(function() {
					assert.ok(false, "this should never be called");
				})
				.catch(function() {
					assert.ok(true, "rejected successfully");
				});

			this.oRta.destroy();
			fnRevolveModule(fnMockService);

			return oServicePromise;
		});

		QUnit.test("RTA instance is destroyed during async initialisation", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var fnMockService = function() {
				return new Promise(function(fnResolve) {
					this.oRta.destroy();
					fnResolve({});
				}.bind(this));
			}.bind(this);

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, fnMockService);

			return this.oRta
				.startService(sServiceName)
				.then(function() {
					assert.ok(false, "this should never be called");
				})
				.catch(function(oError) {
					assert.ok(true, "rejected successfully");
					assert.ok(oError.message.indexOf("RuntimeAuthoring instance is destroyed") !== -1);
				});
		});
		QUnit.test("starting a service with available events", function(assert) {
			assert.expect(4);
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var fnServicePublish;
			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, function(oRta, fnPublish) {
					fnServicePublish = fnPublish;
					return {
						events: ["eventName"]
					};
				});

			return this.oRta
				.startService(sServiceName)
				.then(function(oService) {
					assert.ok(typeof oService.attachEvent === "function");
					assert.ok(typeof oService.detachEvent === "function");
					assert.ok(typeof oService.attachEventOnce === "function");
					var mData = {
						foo: "bar"
					};
					oService.attachEvent("eventName", function(vData) {
						assert.deepEqual(vData, mData);
					});
					fnServicePublish("eventName", mData);
				});
		});
	});

	QUnit.module("stopService()", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: oComp
			});

			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("stopping running service", function(assert) {
			var sServiceName = Object.keys(mServicesDictionary).shift();
			var sServiceLocation = mServicesDictionary[sServiceName].replace(/\./g, "/");
			var oDestroySpy = sandbox.spy();
			var fnMockService = function() {
				return {
					destroy: oDestroySpy
				};
			};

			sandbox.stub(sap.ui, "require")
				.withArgs([sServiceLocation])
				.callsArgWithAsync(1, fnMockService);

			return this.oRta
				.startService(sServiceName)
				.then(function() {
					this.oRta.stopService(sServiceName);
					assert.ok(oDestroySpy.calledOnce);
				}.bind(this));
		});
		QUnit.test("stopping unknown service", function(assert) {
			assert.throws(function() {
				this.oRta.stopService("unknownService");
			}.bind(this));
		});
	});

	QUnit.module("getService()", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: oComp
			});

			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("check alias to startService()", function(assert) {
			var oStartServiceStub = sandbox.stub(this.oRta, "startService").callsFake(function() {
				return Promise.resolve({
					arguments: arguments
				});
			});

			return this.oRta.getService("foo").then(function(oService) {
				assert.ok(oStartServiceStub.calledOnce);
				assert.strictEqual(oService.arguments[0], "foo");
			});
		});
	});

	QUnit.module("Undo/Redo functionality", {
		beforeEach: function() {
			this.bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;

			this.fnUndoStub = sandbox.stub().resolves();
			this.fnRedoStub = sandbox.stub().resolves();

			this.oToolbarDomRef = jQuery("<input>").appendTo("#qunit-fixture").get(0);
			this.oOverlayContainer = jQuery("<button></button>").appendTo("#qunit-fixture");
			this.oAnyOtherDomRef = jQuery("<button></button>").appendTo("#qunit-fixture").get(0);
			this.oContextMenu = jQuery("<button class='sapUiDtContextMenu' ></button>").appendTo("#qunit-fixture").get(0);
			this.oContextMenu2 = jQuery("<button class='sapUiDtContextMenu' ></button>").appendTo("#qunit-fixture").get(0);

			this.oUndoEvent = new Event("dummyEvent", new EventProvider());
			this.oUndoEvent.keyCode = KeyCodes.Z;
			this.oUndoEvent.ctrlKey = true;
			this.oUndoEvent.shiftKey = false;
			this.oUndoEvent.altKey = false;
			this.oUndoEvent.stopPropagation = function() {};

			this.oRedoEvent = new Event("dummyEvent", new EventProvider());
			this.oRedoEvent.keyCode = KeyCodes.Y;
			this.oRedoEvent.ctrlKey = true;
			this.oRedoEvent.shiftKey = false;
			this.oRedoEvent.altKey = false;
			this.oRedoEvent.stopPropagation = function() {};

			sandbox.stub(Overlay, "getOverlayContainer").returns(this.oOverlayContainer);

			this.mContext = {
				getToolbar: function() {
					return {
						getDomRef: function() {
							return this.oToolbarDomRef;
						}.bind(this)
					};
				}.bind(this),
				getShowToolbars: function() {
					return true;
				},
				_onUndo: this.fnUndoStub,
				_onRedo: this.fnRedoStub
			};
		},
		afterEach: function() {
			sandbox.restore();
			Device.os.macintosh = this.bMacintoshOriginal;
		}
	}, function() {
		QUnit.test("with focus on an overlay", function(assert) {
			this.oOverlayContainer.get(0).focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on the toolbar", function(assert) {
			this.oToolbarDomRef.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});

		QUnit.test("with focus on the context menu", function(assert) {
			this.oContextMenu.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");

			this.oContextMenu2.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 2, "then _onUndo was called once again");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 2, "then _onRedo was called once again");
		});

		QUnit.test("with focus on an outside element (e.g. dialog)", function(assert) {
			this.oAnyOtherDomRef.focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 0, "then _onUndo was not called");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 0, "then _onRedo was not called");
		});

		QUnit.test("during rename", function(assert) {
			jQuery("<div></div>", {
				"class": "sapUiRtaEditableField",
				tabIndex: 1
			}).appendTo("#qunit-fixture").get(0).focus();

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 0, "then _onUndo was not called");
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 0, "then _onRedo was not called");
		});

		QUnit.test("using the public API", function(assert) {
			RuntimeAuthoring.prototype.undo.call(this.mContext);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called");
			RuntimeAuthoring.prototype.redo.call(this.mContext);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called");
		});

		QUnit.test("macintosh support", function(assert) {
			Device.os.macintosh = true;
			this.oUndoEvent.ctrlKey = false;
			this.oUndoEvent.metaKey = true;

			this.oOverlayContainer.get(0).focus();
			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oUndoEvent);
			assert.equal(this.fnUndoStub.callCount, 1, "then _onUndo was called once");

			this.oRedoEvent.keyCode = KeyCodes.Z;
			this.oRedoEvent.ctrlKey = false;
			this.oRedoEvent.metaKey = true;
			this.oRedoEvent.shiftKey = true;

			RuntimeAuthoring.prototype._onKeyDown.call(this.mContext, this.oRedoEvent);
			assert.equal(this.fnRedoStub.callCount, 1, "then _onRedo was called once");
		});
	});

	QUnit.module("miscellaneous", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when enabling restart", function(assert) {
			var sLayer = "LAYER";
			RuntimeAuthoring.enableRestart(sLayer, {});
			var sRestartingComponent = window.sessionStorage.getItem("sap.ui.rta.restart." + sLayer);
			assert.ok(RuntimeAuthoring.needsRestart(sLayer), "then restart is needed");
			assert.equal(sRestartingComponent, "fixture.application.Component", "and the component ID is set with an added .Component");
		});

		QUnit.test("when enabling and disabling restart", function(assert) {
			var sLayer = "LAYER";
			RuntimeAuthoring.enableRestart(sLayer);
			RuntimeAuthoring.enableRestart(sLayer);
			RuntimeAuthoring.enableRestart(sLayer);

			RuntimeAuthoring.disableRestart(sLayer);

			assert.notOk(RuntimeAuthoring.needsRestart(sLayer), "then restart is not needed");
		});

		QUnit.test("when RTA is created without rootControl and start is triggered", function(assert) {
			var oLogStub = sandbox.stub(Log, "error");
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: undefined
			});

			return oRuntimeAuthoring
				.start()
				.catch(function(vError) {
					assert.ok(vError, "then the promise is rejected");
					assert.equal(oLogStub.callCount, 1, "and an error is logged");
					assert.strictEqual(vError.message, "Root control not found", "with the correct Error");
				});
		});

		QUnit.test("when trying to start twice", function(assert) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			var oDesigntimeAddRootElementSpy = sandbox.spy(DesignTime.prototype, "addRootElement");
			return oRuntimeAuthoring.start().then(function() {
				assert.strictEqual(oDesigntimeAddRootElementSpy.callCount, 1, "the the designtime is going to start once");

				return oRuntimeAuthoring.start();
			})
			.catch(function(sError) {
				assert.strictEqual(oDesigntimeAddRootElementSpy.callCount, 1, "the the designtime is not started again");
				assert.strictEqual(sError, "RuntimeAuthoring is already started", "the start function rejects");
			});
		});

		QUnit.test("when the uri-parameter sap-ui-layer is set to 'VENDOR',", function(assert) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			assert.equal(oRuntimeAuthoring.getLayer(), Layer.CUSTOMER, "then the layer is the default 'CUSTOMER'");

			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns(Layer.VENDOR);

			oRuntimeAuthoring.setFlexSettings(oRuntimeAuthoring.getFlexSettings());
			assert.equal(oRuntimeAuthoring.getLayer(), Layer.VENDOR, "then the function reacts to the URL parameter and sets the layer to VENDOR");
		});

		QUnit.test("when the uri-parameter sap-ui-layer is set to 'vendor',", function(assert) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			assert.equal(oRuntimeAuthoring.getLayer(), Layer.CUSTOMER, "then the layer is the default 'CUSTOMER'");

			sandbox.stub(UriParameters.prototype, "get").withArgs("sap-ui-layer").returns("vendor");

			oRuntimeAuthoring.setFlexSettings(oRuntimeAuthoring.getFlexSettings());
			assert.equal(oRuntimeAuthoring.getLayer(), Layer.VENDOR, "then the function reacts to the URL parameter and sets the layer to VENDOR");
		});

		QUnit.test("when destroying RuntimeAuthoring after the rootControl of the UI Component was already destroyed", function(assert) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			sandbox.stub(oRuntimeAuthoring, "getRootControlInstance");
			oRuntimeAuthoring.destroy();
			assert.ok(true, "the function does not throw an error");
		});

		QUnit.test("when RTA gets started without toolbar", function(assert) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			return oRuntimeAuthoring.start().then(function() {
				assert.ok(oRuntimeAuthoring, "then RuntimeAuthoring is created");
				assert.strictEqual(jQuery(".sapUiRtaToolbar").length, 0, "then Toolbar is not visible.");
			});
		});

		QUnit.test("when setFlexSettings is called", function(assert) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			sandbox.stub(FlUtils, "buildLrepRootNamespace").returns("rootNamespace/");
			assert.deepEqual(
				oRuntimeAuthoring.getFlexSettings(),
				{
					layer: Layer.CUSTOMER,
					developerMode: true
				}
			);

			oRuntimeAuthoring.setFlexSettings({
				layer: Layer.USER,
				namespace: "namespace"
			});

			assert.deepEqual(oRuntimeAuthoring.getFlexSettings(), {
				layer: Layer.USER,
				developerMode: true,
				namespace: "namespace"
			});

			oRuntimeAuthoring.setFlexSettings({
				scenario: "scenario"
			});

			assert.deepEqual(
				oRuntimeAuthoring.getFlexSettings(),
				{
					layer: Layer.USER,
					developerMode: true,
					namespace: "rootNamespace/changes/",
					rootNamespace: "rootNamespace/",
					scenario: "scenario"
				}
			);
		});
	});

	QUnit.module("restore functionality", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			this.oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.OK);
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oHandleParametersOnExitSpy = sandbox.spy(this.oRta, "_handleUrlParameterOnExit");
			this.oReloadPageStub = sandbox.stub(this.oRta, "_reloadPage");
			return this.oRta._initVersioning();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When restore function is called in the CUSTOMER layer", function(assert) {
			var oDeleteChangesStub = sandbox.stub(this.oRta, "_deleteChanges").resolves();
			var sResetMessageKey = "FORM_PERS_RESET_MESSAGE";
			var sResetTitleKey = "FORM_PERS_RESET_TITLE";

			return this.oRta.restore().then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], sResetMessageKey, "then the message key is correct");
				assert.notEqual(oTextResources.getText(sResetMessageKey), sResetMessageKey, "then the message text is available on the resource file");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2].titleKey, sResetTitleKey, "then the title key is correct");
				assert.notEqual(oTextResources.getText(sResetTitleKey), sResetTitleKey, "then the title text is available on the resource file");
				assert.equal(oDeleteChangesStub.callCount, 1, "then _deleteChanges was called");
				assert.equal(this.oEnableRestartStub.callCount, 1, "then restart was enabled...");
				assert.equal(this.oEnableRestartStub.lastCall.args[0], Layer.CUSTOMER, "for the correct layer");

				this.oShowMessageBoxStub.reset();
				this.oShowMessageBoxStub.resolves(MessageBox.Action.CANCEL);
				return this.oRta.restore();
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(oDeleteChangesStub.callCount, 1, "then _deleteChanges was not called again");
				assert.equal(this.oEnableRestartStub.callCount, 1, "then restart was not  enabled again");
			}.bind(this));
		});

		QUnit.test("When restore function is called in the USER layer", function(assert) {
			var oDeleteChangesStub = sandbox.stub(this.oRta, "_deleteChanges").resolves();
			this.oRta.setFlexSettings({
				layer: Layer.USER
			});
			var sPersResetMessageKey = "FORM_PERS_RESET_MESSAGE_PERSONALIZATION";
			var sPersResetTitleKey = "BTN_RESTORE";

			return this.oRta.restore().then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[1], sPersResetMessageKey, "then the message key is correct");
				assert.notEqual(oTextResources.getText(sPersResetMessageKey), sPersResetMessageKey, "then the message text is available on the resource file");
				assert.equal(this.oShowMessageBoxStub.lastCall.args[2].titleKey, sPersResetTitleKey, "then the title key is correct");
				assert.notEqual(oTextResources.getText(sPersResetTitleKey), sPersResetTitleKey, "then the message text is available on the resource file");
				assert.equal(oDeleteChangesStub.callCount, 1, "then _deleteChanges was called");
				assert.equal(this.oEnableRestartStub.callCount, 1, "then restart was enabled...");
				assert.equal(this.oEnableRestartStub.lastCall.args[0], Layer.USER, "for the correct layer");

				this.oShowMessageBoxStub.reset();
				this.oShowMessageBoxStub.resolves(MessageBox.Action.CANCEL);
				return this.oRta.restore();
			}.bind(this))
			.then(function() {
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(oDeleteChangesStub.callCount, 1, "then _deleteChanges was not called again");
				assert.equal(this.oEnableRestartStub.callCount, 1, "then restart was not  enabled again");
			}.bind(this));
		});

		QUnit.test("when calling restore successfully", function(assert) {
			assert.expect(6);
			var oRemoveStub = sandbox.spy(this.oRta.getCommandStack(), "removeAllCommands");
			sandbox.stub(PersistenceWriteAPI, "reset").callsFake(function() {
				assert.deepEqual(arguments[0], {
					selector: oComp,
					layer: Layer.CUSTOMER
				}, "then the correct parameters were passed");
				return Promise.resolve();
			});
			var oFlexInfoResponse = {allContextsProvided: true, isResetEnabled: false, isPublishEnabled: false};
			var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oComp});
			window.sessionStorage.setItem("sap.ui.fl.info." + sFlexReference, JSON.stringify(oFlexInfoResponse));

			return this.oRta.restore().then(function() {
				assert.strictEqual(oRemoveStub.callCount, 1, "the command stack was cleared");
				assert.ok(oRemoveStub.calledBefore(this.oHandleParametersOnExitSpy), "the command stack was cleared before the navigation is triggered");
				assert.equal(this.oHandleParametersOnExitSpy.callCount, 1, "then delete draft url parameter");
				assert.equal(this.oReloadPageStub.callCount, 1, "then page reload is triggered");
				var sFlexInfoFromSession = window.sessionStorage.getItem("sap.ui.fl.info." + sFlexReference);
				assert.equal(sFlexInfoFromSession, null, "then flex info from session storage is null");
			}.bind(this));
		});

		QUnit.test("when calling restore successfully in AppVariant", function(assert) {
			assert.expect(3);
			sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(true);
			sandbox.stub(PersistenceWriteAPI, "reset").callsFake(function() {
				assert.deepEqual(arguments[0], {
					selector: oComp,
					layer: Layer.CUSTOMER
				}, "then the correct generator and layer was passed");
				return Promise.resolve();
			});

			return this.oRta.restore().then(function() {
				assert.equal(this.oHandleParametersOnExitSpy.callCount, 1, "then delete draft url parameter");
				assert.equal(this.oReloadPageStub.callCount, 1, "then page reload is triggered");
			}.bind(this));
		});

		QUnit.test("when calling restore and there is an error", function(assert) {
			var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oComp});
			var sInfoSessionName = "sap.ui.fl.info." + sFlexReference;
			var oFlexInfoResponse = {allContextsProvided: true, isResetEnabled: false, isPublishEnabled: false};
			window.sessionStorage.setItem(sInfoSessionName, JSON.stringify(oFlexInfoResponse));

			sandbox.stub(PersistenceWriteAPI, "reset").returns(Promise.reject("Error"));

			return this.oRta.restore().then(function() {
				assert.equal(this.oReloadPageStub.callCount, 0, "then page reload is not triggered");
				var sFlexInfoFromSession = window.sessionStorage.getItem(sInfoSessionName);
				assert.equal(sFlexInfoFromSession, JSON.stringify(oFlexInfoResponse), "then flex info from session storage still exists");
				assert.equal(this.oShowMessageBoxStub.callCount, 2, "error messages is shown");
				assert.strictEqual(this.oShowMessageBoxStub.lastCall.args[2].error, "Error", "and a message box shows the error to the user");
			}.bind(this));
		});

		QUnit.test("when calling restore and reset is cancelled", function(assert) {
			var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oComp});
			var sInfoSessionName = "sap.ui.fl.info." + sFlexReference;
			var oFlexInfoResponse = {allContextsProvided: true, isResetEnabled: false, isPublishEnabled: false};
			window.sessionStorage.setItem(sInfoSessionName, JSON.stringify(oFlexInfoResponse));

			sandbox.stub(PersistenceWriteAPI, "reset").returns(Promise.reject("cancel"));

			return this.oRta.restore().then(function() {
				assert.equal(this.oReloadPageStub.callCount, 0, "then page reload is not triggered");
				assert.equal(this.oShowMessageBoxStub.callCount, 1, "no error messages is shown");
				var sFlexInfoFromSession = window.sessionStorage.getItem(sInfoSessionName);
				assert.equal(sFlexInfoFromSession, JSON.stringify(oFlexInfoResponse), "then flex info from session storage still exists");
			}.bind(this));
		});
	});

	QUnit.module("transport functionality", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false,
				flexSettings: {
					layer: Layer.CUSTOMER
				}
			});
			sandbox.stub(this.oRta, "_serializeToLrep").resolves();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is not an application variant", function(assert) {
			var fnPublishStub = sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isApplicationVariant() got called");
				assert.deepEqual(fnPublishStub.firstCall.args[0], {
					selector: oComp,
					styleClass: Utils.getRtaStyleClassName(),
					layer: Layer.CUSTOMER,
					appVariantDescriptors: []
				}, "then style class and layer was passed correctly");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is an application variant by navigation parameters", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			sandbox.stub(MessageToast, "show");
			sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(true);
			sandbox.stub(FlUtils, "isVariantByStartupParameter").returns(true);
			var oAppVariantFeatureStub = sandbox.stub(AppVariantFeature, "getAppVariantDescriptor");
			return this.oRta.transport().then(function() {
				assert.equal(oAppVariantFeatureStub.callCount, 0, "the AppVariantFeature.getAppVariantDescriptor was not called");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() when the running application is an application variant", function(assert) {
			var fnPublishStub = sandbox.stub(PersistenceWriteAPI, "publish").resolves();
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(true);
			var oDummyObject = {
				foo: "hugo"
			};
			var aAppVariantDescriptors = [oDummyObject];
			sandbox.stub(AppVariantFeature, "getAppVariantDescriptor").resolves(oDummyObject);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
				assert.deepEqual(fnPublishStub.firstCall.args[0], {
					selector: oComp,
					appVariantDescriptors: aAppVariantDescriptors,
					layer: Layer.CUSTOMER,
					styleClass: "sapUiRTABorder"
				}, "then appVariantDescriptors, layer and styleClass parameters were passed correctly");
			});
		});

		QUnit.test("When transport function is called and Promise.reject() is returned from the flex persistence", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").rejects(new Error("Error"));
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			var oShowErrorStub = sandbox.stub(Log, "error");
			var oErrorBoxStub = sandbox.stub(MessageBox, "error");
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
				assert.equal(oShowErrorStub.callCount, 1, "then the error was logged");
				assert.equal(oErrorBoxStub.callCount, 1, "and a MessageBox.error was shown");
			});
		});

		[{
			error: {
				userMessage: "Error text 1\nError text 2\n"
			},
			errorText: "Error text 1\nError text 2\n",
			propertyName: "userMessage"
		},
		{
			error: {
				messages: [],
				message: "messageText"
			},
			errorText: "messageText",
			propertyName: "message"
		},
		{
			error: {
				messages: [],
				stack: "messageText"
			},
			errorText: "messageText",
			propertyName: "stack"
		},
		{
			error: {
				messages: [],
				status: "messageText"
			},
			errorText: "messageText",
			propertyName: "status"
		}].forEach(function(oErrorResponse) {
			QUnit.test("When transport function is called and transportChanges returns Promise.reject() with error in the property: " + oErrorResponse.propertyName, function(assert) {
				var sErrorBoxText = oTextResources.getText("MSG_LREP_TRANSFER_ERROR") + "\n"
					+ oTextResources.getText("MSG_ERROR_REASON", oErrorResponse.errorText);
				sandbox.stub(PersistenceWriteAPI, "publish").rejects(oErrorResponse.error);
				var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
				var oMessageToastStub = sandbox.stub(MessageToast, "show");
				var oShowErrorStub = sandbox.stub(Log, "error");
				var oErrorBoxStub = sandbox.stub(MessageBox, "error");
				return this.oRta.transport().then(function() {
					assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
					assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
					assert.equal(oShowErrorStub.callCount, 1, "then the error was logged");
					assert.equal(oErrorBoxStub.callCount, 1, "and a MessageBox.error was shown");
					assert.equal(oErrorBoxStub.args[0][0], sErrorBoxText, "and the shown error text is correct");
				});
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() with 'Error' as parameter", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves("Error");
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
			});
		});

		QUnit.test("When transport function is called and transportChanges returns Promise.resolve() with 'Cancel' as parameter", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "publish").resolves("Cancel");
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			var oAppVariantRunningStub = sandbox.stub(SmartVariantManagementApplyAPI, "isApplicationVariant").returns(false);
			return this.oRta.transport().then(function() {
				assert.equal(oMessageToastStub.callCount, 0, "then the messageToast was not shown");
				assert.equal(oAppVariantRunningStub.callCount, 1, "then isAppVariantRunning() got called");
			});
		});
	});

	QUnit.done(function() {
		oComp._restoreGetAppComponentStub();
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});