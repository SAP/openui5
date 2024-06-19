/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/core/Control",
	"sap/ui/core/Lib",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/util/adaptationStarter",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Log,
	MessageBox,
	Control,
	Lib,
	FeaturesAPI,
	PersistenceWriteAPI,
	FlexUtils,
	RuntimeAuthoring,
	adaptationStarter,
	ReloadManager,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.rta");

	function setIsKeyUser(bIsKeyUser) {
		sandbox.stub(FeaturesAPI, "isKeyUser").resolves(bIsKeyUser);
	}

	function checkMessageFromStub(assert, stubbedMessageCall, sExpectedMessage, sSuccessOutput) {
		if (typeof stubbedMessageCall.args[0] === "string") {
			assert.strictEqual(
				stubbedMessageCall.args[0],
				oResourceBundle.getText(sExpectedMessage),
				sSuccessOutput
			);
		} else {
			assert.strictEqual(
				stubbedMessageCall.args[0].mAggregations.content.map(function(item, index) {
					if (index === 1) {
						return `[${item.getText()}]` + `(${item.getHref()})`;
					}
					return item.getText();
				}).join(""),
				oResourceBundle.getText(sExpectedMessage),
				sSuccessOutput
			);
		}
	}

	QUnit.module("When adaptationStarter is called... ", {
		beforeEach() {
			this.fnRtaStartStub = sandbox.stub(RuntimeAuthoring.prototype, "start").resolves();
			this.fnMessageBoxStub = sandbox.stub(MessageBox, "warning");
			setIsKeyUser(true);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with changes from other system", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "getChangesWarning").resolves({
				showWarning: true, warningType: "mixedChangesWarning"
			});

			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			}).then(function() {
				assert.strictEqual(this.fnMessageBoxStub.callCount, 1, "then the warning is shown");
				assert.strictEqual(
					this.fnMessageBoxStub.lastCall.args[1].title,
					oResourceBundle.getText("TIT_ADAPTATION_STARTER_MIXED_CHANGES_TITLE"),
					"then the title of the mixed changes message is shown correctly"
				);
				checkMessageFromStub(
					assert,
					this.fnMessageBoxStub.lastCall,
					"MSG_ADAPTATION_STARTER_MIXED_CHANGES_WARNING",
					"then the text of the mixed changes message is shown correctly"
				);
			}.bind(this));
		});

		QUnit.test("in a P System with no changes", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "getChangesWarning").resolves({
				showWarning: true, warningType: "noChangesAndPSystemWarning"
			});

			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			})
			.then(function() {
				assert.strictEqual(this.fnMessageBoxStub.callCount, 1, "then the warning is shown");
				assert.strictEqual(
					this.fnMessageBoxStub.lastCall.args[1].title,
					oResourceBundle.getText("TIT_ADAPTATION_STARTER_NO_CHANGES_IN_P_TITLE"),
					"then the title of the no changes and P system message is shown correctly"
				);
				assert.strictEqual(
					this.fnMessageBoxStub.lastCall.args[0],
					oResourceBundle.getText("MSG_ADAPTATION_STARTER_NO_CHANGES_IN_P_WARNING"),
					"then the text of the no changes and P system message is shown correctly"
				);
			}.bind(this));
		});

		QUnit.test("with changes in the same system", function(assert) {
			sandbox.stub(PersistenceWriteAPI, "getChangesWarning").resolves({
				showWarning: false
			});

			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			})
			.then(function() {
				assert.strictEqual(this.fnMessageBoxStub.callCount, 0, "then the warning is not shown");
			}.bind(this));
		});

		QUnit.test("with a layer other than CUSTOMER", function(assert) {
			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "USER"
				}
			})
			.then(function() {
				assert.strictEqual(FeaturesAPI.isKeyUser.callCount, 0, "the key user check was not performed");
				assert.strictEqual(this.fnRtaStartStub.callCount, 1, "RTA was started");
			}.bind(this));
		});

		QUnit.test("without optional parameters", async function(assert) {
			const oRuntimeAuthoring = await adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "USER"
				}
			});
			await oRuntimeAuthoring.stop(true, true);
			assert.strictEqual(oRuntimeAuthoring.isDestroyStarted(), true,
				"the instance is getting destroyed via the default stop handler");
		});

		QUnit.test("with optional parameters", function(assert) {
			const oAttachEventSpy = sandbox.spy(RuntimeAuthoring.prototype, "attachEvent");
			const oLoadPluginsStub = sandbox.stub().resolves();
			const oOnStartStub = sandbox.stub();
			const oOnFailedStub = sandbox.stub();
			const oOnStopStub = sandbox.stub();

			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "USER"
				}
			}, oLoadPluginsStub, oOnStartStub, oOnFailedStub, oOnStopStub)
			.then(function() {
				assert.ok(
					oAttachEventSpy.calledWith("start", oOnStartStub),
					"then the passed on start handler is registered as event handler"
				);
				assert.ok(
					oAttachEventSpy.calledWith("failed", oOnFailedStub),
					"then the passed on failed handler is registered as event handler"
				);
				assert.ok(
					oAttachEventSpy.calledWith("stop", oOnStopStub),
					"then the passed on stop handler is registered as event handler"
				);
			});
		});

		QUnit.test("with a control instead of an UIComponent", function(assert) {
			return adaptationStarter({
				rootControl: new Control("foo"),
				flexSettings: {
					layer: "USER"
				}
			})
			.then(function(oRta) {
				assert.strictEqual(oRta.getRootControl(), oAppComponent.getId(), "the corresponding app component is set as root control");
			});
		});

		QUnit.test("with flexEnabled=false and fiori tools parameter=true", function(assert) {
			sandbox.stub(oAppComponent, "getManifest").returns({
				"sap.ui5": {
					flexEnabled: false
				}
			});
			sandbox.stub(URLSearchParams.prototype, "get")
			.callThrough()
			.withArgs("fiori-tools-rta-mode")
			.returns("true");

			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			})
			.then(function() {
				assert.strictEqual(this.fnRtaStartStub.callCount, 1, "rta was started");
			}.bind(this));
		});
	});

	QUnit.module("Negative Tests", {
		beforeEach() {
			this.oRtaStartStub = sandbox.stub(RuntimeAuthoring.prototype, "start");
			this.fnMessageBoxStub = sandbox.stub(MessageBox, "error");
			this.oLogStub = sandbox.stub(Log, "error");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When the user is not a key user", function(assert) {
			setIsKeyUser(false);

			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			})
			.then(function() {
				assert.ok(false, "should not go here");
			})
			.catch(function(oError) {
				assert.strictEqual(this.oRtaStartStub.callCount, 0, "RuntimeAuthoring is not started");
				assert.strictEqual(this.oLogStub.callCount, 1, "an error was logged");
				assert.strictEqual(this.fnMessageBoxStub.callCount, 1, "a message box is displayed with the error");
				assert.strictEqual(
					this.fnMessageBoxStub.lastCall.args[0],
					"You do not have key user permissions. Please contact your administrator.",
					"the specific message part is correct"
				);
				assert.strictEqual(this.oLogStub.lastCall.args[0],
					"UI Adaptation could not be started", "the generic part is correct");
				assert.strictEqual(
					this.oLogStub.lastCall.args[1],
					"You do not have key user permissions. Please contact your administrator.",
					"the specific part is correct"
				);
				assert.strictEqual(oError.reason, "isKeyUser", "the reason is properly set");
			}.bind(this));
		});

		QUnit.test("When the flexEnabled flag is set to false", function(assert) {
			setIsKeyUser(true);
			sandbox.stub(oAppComponent, "getManifest").returns({
				"sap.ui5": {
					flexEnabled: false
				}
			});
			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			})
			.then(function() {
				assert.ok(false, "should not go here");
			})
			.catch(function(oError) {
				assert.strictEqual(this.oRtaStartStub.callCount, 0, "RuntimeAuthoring is not started");
				assert.strictEqual(this.oLogStub.callCount, 1, "an error was logged");
				assert.strictEqual(this.fnMessageBoxStub.callCount, 1, "a message box is displayed with the error");
				assert.strictEqual(this.oLogStub.lastCall.args[0],
					"UI Adaptation could not be started", "the generic part is correct");
				assert.strictEqual(this.oLogStub.lastCall.args[1],
					"This app is not enabled for key user adaptation", "the specific part is correct");
				assert.ok(oError instanceof Error, "then promise was rejected with an error");
				assert.strictEqual(oError.reason, "flexEnabled", "the reason is properly set");
			}.bind(this));
		});

		QUnit.test("When the flexEnabled flag is set to false in FLP", function(assert) {
			setIsKeyUser(true);
			sandbox.stub(FlexUtils, "getUshellContainer").returns(true);
			sandbox.stub(oAppComponent, "getManifest").returns({
				"sap.ui5": {
					flexEnabled: false
				}
			});
			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "CUSTOMER"
				}
			})
			.then(function() {
				assert.ok(false, "should not go here");
			})
			.catch(function(oError) {
				assert.strictEqual(this.oRtaStartStub.callCount, 0, "RuntimeAuthoring is not started");
				assert.strictEqual(this.oLogStub.callCount, 0, "no error was logged");
				assert.strictEqual(this.fnMessageBoxStub.callCount, 0, "no message box is displayed");
				assert.ok(oError instanceof Error, "then promise was rejected with an error");
				assert.strictEqual(oError.reason, "flexEnabled", "the reason is properly set");
			}.bind(this));
		});

		QUnit.test("When the passed root control does not meet expectations", function(assert) {
			setIsKeyUser(true);
			return adaptationStarter({
				rootControl: {},
				flexSettings: {
					layer: "CUSTOMER"
				}
			})
			.then(function() {
				assert.ok(false, "should not go here");
			})
			.catch(function(oError) {
				assert.strictEqual(this.oRtaStartStub.callCount, 0, "RuntimeAuthoring is not started");
				assert.strictEqual(this.oLogStub.callCount, 1, "an error was logged");
				assert.strictEqual(this.fnMessageBoxStub.callCount, 1, "a message box is displayed with the error");
				assert.ok(this.fnMessageBoxStub.lastCall.args[0].startsWith(
					"An error has occurred. Please contact SAP support by opening a ticket for component CA-UI5-FL-RTA."
				), "the generic message part is correct");
				assert.ok(this.fnMessageBoxStub.lastCall.args[0].endsWith(
					"An invalid root control was passed"
				), "the specific message part is correct");
				assert.strictEqual(this.oLogStub.lastCall.args[0],
					"UI Adaptation could not be started", "the generic part is correct");
				assert.strictEqual(this.oLogStub.lastCall.args[1],
					"An invalid root control was passed", "the specific part is correct");
				assert.ok(oError instanceof Error, "then promise was rejected with an error");
				assert.strictEqual(oError.reason, "rootControl", "the reason is properly set");
			}.bind(this));
		});

		QUnit.test("When RuntimeAuthoring.start rejects with a reload", function(assert) {
			sandbox.stub(ReloadManager, "handleReloadOnStart").returns(true);
			sandbox.stub(FlexUtils, "getUshellContainer").returns();
			this.oRtaStartStub.restore();
			return adaptationStarter({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "USER"
				}
			})
			.then(function() {
				assert.ok(false, "should not go here");
			})
			.catch(function(oError) {
				assert.notOk(
					this.oLogStub.getCalls().some((oCall) => oCall.args.includes("Reload triggered")),
					"no reload error was logged"
				);
				assert.strictEqual(
					oError.message,
					"Reload triggered",
					"then the async function throws with an error"
				);
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});