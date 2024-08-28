/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Lib",
	"sap/ui/dt/Util",
	"sap/ui/fl/registry/Settings",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/util/validateFlexEnabled",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Log,
	Button,
	MessageBox,
	ComponentContainer,
	Lib,
	DtUtil,
	Settings,
	VerticalLayout,
	nextUIUpdate,
	validateFlexEnabled,
	RuntimeAuthoring,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sLogErrorTextPart = "Control ID was generated dynamically by SAPUI5.";
	var sMessageBoxTextKey = "MSG_UNSTABLE_ID_FOUND";
	var vLoggedErrorMatcher = sinon.match(function(vError) {
		return typeof vError === "string" && vError.startsWith(sLogErrorTextPart);
	});

	function getMockedComponent(bFlexEnabled, bWithUnstableElement) {
		var oManifest = {
			"sap.app": {
				id: "fixture.application"
			},
			"sap.ui5": { ...bFlexEnabled && {flexEnabled: true} }
		};
		var oContent = new VerticalLayout({
			id: "layoutId",
			content: [new Button("buttonId")].concat(
				bWithUnstableElement
					? createButtonWithUnstableId()
					: []
			)
		});
		return RtaQunitUtils.createAndStubAppComponent(sandbox, "fixture.application", oManifest, oContent);
	}

	function stubMessageBoxAndLog() {
		sandbox.stub(Log, "error")
		.callThrough()
		.withArgs(vLoggedErrorMatcher)
		.returns();

		sandbox.stub(MessageBox, "show");
	}

	function getText(sTextKey) {
		return Lib.getResourceBundleFor("sap.ui.rta").getText(sTextKey);
	}

	function createButtonWithUnstableId() {
		return new Button({
			text: "Missing stable id"
		});
	}

	function createButtonWithStableId(sStableId) {
		return new Button({
			id: sStableId,
			text: "Missing stable id"
		});
	}

	function setAdaptationMode(oRta) {
		oRta.setMode("adaptation");
	}

	function setNavigationMode(oRta) {
		oRta.setMode("navigation");
	}

	QUnit.module("flexEnabled set to `true` and there is unstable control when RTA is started", {
		async beforeEach() {
			this.oComponent = getMockedComponent(true, true);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			stubMessageBoxAndLog();

			sandbox.stub(Settings.prototype, "isCustomerSystem").returns(false);
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			this.oRta._oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();

			return this.oRta.start();
		},
		afterEach() {
			return this.oRta.stop().then(function() {
				this.oComponentContainer.destroy();
				sandbox.restore();
			}.bind(this));
		}
	}, function() {
		QUnit.test("base functionality", function(assert) {
			assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then an error was logged");
			assert.ok(MessageBox.show.calledWith(sinon.match(function(vMessage) {
				var sDisplayedErrorPart = vMessage.getContent()[0].getText();
				var sError = getText(sMessageBoxTextKey);
				return sError.includes(sDisplayedErrorPart);
			})), "then message box was shown");
		});

		QUnit.test("when two unstable controls are added in adaptation mode, out of which one gets destroyed shortly after", function(assert) {
			var done = assert.async();
			var oButtonWithUnstableId = createButtonWithUnstableId();
			var oButtonToBeDestroyedWithUnstableId = createButtonWithUnstableId();
			Log.error.resetHistory();
			MessageBox.show.resetHistory();

			this.oRta._oDesignTime.attachEvent("elementOverlayCreated", sandbox.stub().onSecondCall().callsFake(
				function() {
					oButtonToBeDestroyedWithUnstableId.destroy();
					DtUtil.waitForSynced(this.oRta._oDesignTime, function() {
						assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then an error was logged once");
						assert.strictEqual(Log.error.withArgs(vLoggedErrorMatcher).getCall(0).args[1], oButtonWithUnstableId.getId(), "then the error was logged for the control which was not destroyed");
						assert.ok(MessageBox.show.notCalled, "then message box was not shown");
						done();
					})();
				}.bind(this)
			));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
			this.oComponent.getRootControl().addContent(oButtonToBeDestroyedWithUnstableId);
		});

		QUnit.test("when another stable control is added in adaptation mode", function(assert) {
			var done = assert.async();
			var oButtonWithUnstableId = createButtonWithStableId(this.oComponent.createId("addedButtonWithStableId"));
			Log.error.resetHistory();
			MessageBox.show.resetHistory();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function() {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function() {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when two unstable controls are added in navigation mode, out of which one is destroyed shortly after, followed later by a switch to adaptation mode", function(assert) {
			var done = assert.async();
			var oButtonWithUnstableId = createButtonWithUnstableId();
			var oButtonToBeDestroyedWithUnstableId = createButtonWithUnstableId();
			setNavigationMode(this.oRta);
			Log.error.resetHistory();
			MessageBox.show.resetHistory();

			this.oRta._oDesignTime.attachEvent("elementOverlayCreated", sandbox.stub().onSecondCall().callsFake(
				function() {
					DtUtil.waitForSynced(this.oRta._oDesignTime, function() {
						assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged initially");
						assert.ok(MessageBox.show.notCalled, "then message box was not shown initially");
						oButtonToBeDestroyedWithUnstableId.destroy();
						setAdaptationMode(this.oRta);
						assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then one error was logged after mode switch to adaptation");
						assert.strictEqual(Log.error.withArgs(vLoggedErrorMatcher).getCall(0).args[1], oButtonWithUnstableId.getId(), "then the error was logged for the control which was not destroyed");
						assert.ok(MessageBox.show.notCalled, "then no message box was not shown after mode switch to adaptation");
						done();
					}.bind(this))();
				}.bind(this)
			));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
			this.oComponent.getRootControl().addContent(oButtonToBeDestroyedWithUnstableId);
		});

		QUnit.test("when no element overlays are created while switching between navigation and adaptation modes", function(assert) {
			setNavigationMode(this.oRta);
			Log.error.resetHistory();
			MessageBox.show.resetHistory();
			setAdaptationMode(this.oRta);
			assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
			assert.ok(MessageBox.show.notCalled, "then message box was not shown");
		});
	});

	QUnit.module("flexEnabled set to `true` and there are no unstable controls", {
		async beforeEach() {
			this.oComponent = this.oComponent = getMockedComponent(true, false);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			stubMessageBoxAndLog();

			sandbox.stub(Settings.prototype, "isCustomerSystem").returns(false);
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			this.oRta._oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();

			return this.oRta.start().then(function() {
				Log.error.resetHistory();
				MessageBox.show.resetHistory();
			});
		},
		afterEach() {
			return this.oRta.stop().then(function() {
				this.oComponentContainer.destroy();
				sandbox.restore();
			}.bind(this));
		}
	}, function() {
		QUnit.test("base functionality", function(assert) {
			validateFlexEnabled(this.oRta);
			assert.strictEqual(Log.error.withArgs(vLoggedErrorMatcher).callCount, 0, "then no error was logged");
			assert.strictEqual(MessageBox.show.callCount, 0, "then no message box was shown");
		});

		QUnit.test("when an unstable control is added in adaptation mode", function(assert) {
			var done = assert.async();
			var oButtonWithUnstableId = createButtonWithUnstableId();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function() {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function() {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then an error was logged");
					assert.ok(MessageBox.show.calledWith(sinon.match(function(vMessage) {
						var sDisplayedErrorPart = vMessage.getContent()[0].getText();
						var sError = getText(sMessageBoxTextKey);
						return sError.includes(sDisplayedErrorPart);
					})), "then message box was shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when a stable control is added in  adaptation mode", function(assert) {
			var done = assert.async();
			var oButtonWithUnstableId = createButtonWithStableId(this.oComponent.createId("addedButtonWithStableId"));

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function() {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function() {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when an unstable control is added in navigation mode, which is later switched to adaptation mode", function(assert) {
			var done = assert.async();
			var oButtonWithUnstableId = createButtonWithUnstableId();
			setNavigationMode(this.oRta);

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function() {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function() {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged initially");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown initially");
					setAdaptationMode(this.oRta);
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then an error was logged after mode switch to adaptation");
					assert.ok(MessageBox.show.calledWith(sinon.match(function(vMessage) {
						var sDisplayedErrorPart = vMessage.getContent()[0].getText();
						var sError = getText(sMessageBoxTextKey);
						return sError.includes(sDisplayedErrorPart);
					})), "then message box was shown after mode switch to adaptation");
					done();
				}.bind(this))();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});
	});

	QUnit.module("flexEnabled is not set and there is an unstable control", {
		async beforeEach() {
			this.oComponent = this.oComponent = getMockedComponent(false, false);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			}).placeAt("qunit-fixture");
			await nextUIUpdate();

			stubMessageBoxAndLog();

			sandbox.stub(Settings.prototype, "isCustomerSystem").returns(false);
			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			this.oRta._oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();

			return this.oRta.start().then(function() {
				Log.error.resetHistory();
				MessageBox.show.resetHistory();
			});
		},
		afterEach() {
			return this.oRta.stop().then(function() {
				this.oComponentContainer.destroy();
				sandbox.restore();
			}.bind(this));
		}
	}, function() {
		QUnit.test("base functionality", function(assert) {
			validateFlexEnabled(this.oRta);
			assert.strictEqual(Log.error.withArgs(vLoggedErrorMatcher).callCount, 0);
			assert.strictEqual(MessageBox.show.callCount, 0, "No warning dialog should be shown");
		});

		QUnit.test("when another unstable control is added in adaptation mode", function(assert) {
			var done = assert.async();
			var oButtonWithUnstableId = createButtonWithUnstableId();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function() {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function() {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when another stable control is added in adaptation mode", function(assert) {
			var done = assert.async();
			var oButtonWithUnstableId = createButtonWithUnstableId();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function() {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function() {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when another unstable control is added in navigation mode, which is later switched to adaptation mode", function(assert) {
			var done = assert.async();
			var oButtonWithUnstableId = createButtonWithUnstableId();
			setNavigationMode(this.oRta);

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function() {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function() {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged initially");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown initially");
					setAdaptationMode(this.oRta);
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged after switch to adaptation mode");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown after switch to adaptation mode");
					done();
				}.bind(this))();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
