/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/util/validateFlexEnabled",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/MessageBox",
	"sap/base/Log",
	"sap/ui/dt/Util",
	"sap/base/util/includes",
	"sap/ui/thirdparty/sinon-4"
],
function (
	validateFlexEnabled,
	UIComponent,
	ComponentContainer,
	RuntimeAuthoring,
	VerticalLayout,
	Button,
	MessageBox,
	Log,
	DtUtil,
	includes,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sLogErrorTextPart = "Control ID was generated dynamically by SAPUI5.";
	var sMessageBoxTextKey = "MSG_UNSTABLE_ID_FOUND";
	var vLoggedErrorMatcher = sinon.match(function (vError) {
		return typeof vError === "string" && vError.startsWith(sLogErrorTextPart);
	});

	function _getMockedComponent(bFlexEnabled, bWithUnstableElement) {
		var CustomComponent = UIComponent.extend("sap.ui.dt.test.Component", {
			metadata: {
				manifest: {
					"sap.app": {
						id: "fixture.application"
					},
					"sap.ui5": Object.assign({}, bFlexEnabled && {flexEnabled: true})
				}
			},
			createContent: function() {
				return new VerticalLayout({
					id: this.createId("layoutId"),
					content: [new Button(this.createId("buttonId"))].concat(
						bWithUnstableElement
							? _createButtonWithUnstableId()
							: []
					)
				});
			}
		});
		return new CustomComponent("comp");
	}

	function _stubMessageBoxAndLog() {
		sandbox.stub(Log, "error")
			.callThrough()
			.withArgs(vLoggedErrorMatcher)
			.returns();

		sandbox.stub(MessageBox, "show");
	}

	function _getText(oRta, sTextKey) {
		return oRta._getTextResources().getText(sTextKey);
	}

	function _createButtonWithUnstableId() {
		return new Button({
			text: "Missing stable id"
		});
	}

	function _createButtonWithStableId(sStableId) {
		return new Button({
			id: sStableId,
			text: "Missing stable id"
		});
	}

	function _setAdaptationMode(oRta) {
		oRta.setMode("adaptation");
	}

	function _setNavigationMode(oRta) {
		oRta.setMode("navigation");
	}

	QUnit.module("flexEnabled set to `true` and there is unstable control when RTA is started", {
		beforeEach: function () {
			this.oComponent = _getMockedComponent(true, true);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			_stubMessageBoxAndLog();

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			return this.oRta.start();
		},
		afterEach: function () {
			return this.oRta.stop().then(function() {
				this.oComponentContainer.destroy();
				sandbox.restore();
			}.bind(this));
		}
	}, function () {
		QUnit.test("base functionality", function (assert) {
			assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then an error was logged");
			assert.ok(MessageBox.show.calledWith(sinon.match(function(vMessage) {
				var sDisplayedErrorPart = vMessage.getContent()[0].getText();
				var sError = _getText(this.oRta, sMessageBoxTextKey);
				return includes(sError, sDisplayedErrorPart);
			}.bind(this))), "then message box was shown");
		});

		QUnit.test("when another unstable control is added in adaptation mode", function (assert) {
			var done = assert.async();
			var oButtonWithUnstableId = _createButtonWithUnstableId();
			Log.error.resetHistory();
			MessageBox.show.resetHistory();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function () {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function () {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then an error was logged");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when another stable control is added in adaptation mode", function (assert) {
			var done = assert.async();
			var oButtonWithUnstableId = _createButtonWithStableId(this.oComponent.createId("addedButtonWithStableId"));
			Log.error.resetHistory();
			MessageBox.show.resetHistory();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function () {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function () {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when another unstable control is added in navigation mode, which is later switched to adaptation mode", function (assert) {
			var done = assert.async();
			var oButtonWithUnstableId = _createButtonWithUnstableId();
			_setNavigationMode(this.oRta);
			Log.error.resetHistory();
			MessageBox.show.resetHistory();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function () {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function () {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged initially");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown initially");
					_setAdaptationMode(this.oRta);
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then an error was logged after mode switch to adaptation");
					assert.ok(MessageBox.show.notCalled, "then no message box was not shown after mode switch to adaptation");
					done();
				}.bind(this))();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when no element overlays are created while switching between navigation and adaptation modes", function (assert) {
			_setNavigationMode(this.oRta);
			Log.error.resetHistory();
			MessageBox.show.resetHistory();
			_setAdaptationMode(this.oRta);
			assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
			assert.ok(MessageBox.show.notCalled, "then message box was not shown");
		});
	});

	QUnit.module("flexEnabled set to `true` and there are no unstable controls", {
		beforeEach: function () {
			this.oComponent = this.oComponent = _getMockedComponent(true, false);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			_stubMessageBoxAndLog();

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			return this.oRta.start().then(function () {
				Log.error.resetHistory();
				MessageBox.show.resetHistory();
			});
		},
		afterEach: function () {
			return this.oRta.stop().then(function() {
				this.oComponentContainer.destroy();
				sandbox.restore();
			}.bind(this));
		}
	}, function () {
		QUnit.test("base functionality", function (assert) {
			validateFlexEnabled(this.oRta);
			assert.strictEqual(Log.error.withArgs(vLoggedErrorMatcher).callCount, 0, "then no error was logged");
			assert.strictEqual(MessageBox.show.callCount, 0, "then no message box was shown");
		});

		QUnit.test("when an unstable control is added in adaptation mode", function (assert) {
			var done = assert.async();
			var oButtonWithUnstableId = _createButtonWithUnstableId();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function () {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function () {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then an error was logged");
					assert.ok(MessageBox.show.calledWith(sinon.match(function (vMessage) {
						var sDisplayedErrorPart = vMessage.getContent()[0].getText();
						var sError = _getText(this.oRta, sMessageBoxTextKey);
						return includes(sError, sDisplayedErrorPart);
					}.bind(this))), "then message box was shown");
					done();
				}.bind(this))();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when a stable control is added in  adaptation mode", function (assert) {
			var done = assert.async();
			var oButtonWithUnstableId = _createButtonWithStableId(this.oComponent.createId("addedButtonWithStableId"));

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function () {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function () {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when an unstable control is added in navigation mode, which is later switched to adaptation mode", function (assert) {
			var done = assert.async();
			var oButtonWithUnstableId = _createButtonWithUnstableId();
			_setNavigationMode(this.oRta);

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function () {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function () {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged initially");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown initially");
					_setAdaptationMode(this.oRta);
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).calledOnce, "then an error was logged after mode switch to adaptation");
					assert.ok(MessageBox.show.calledWith(sinon.match(function (vMessage) {
						var sDisplayedErrorPart = vMessage.getContent()[0].getText();
						var sError = _getText(this.oRta, sMessageBoxTextKey);
						return includes(sError, sDisplayedErrorPart);
					}.bind(this))), "then message box was shown after mode switch to adaptation");
					done();
				}.bind(this))();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});
	});

	QUnit.module("flexEnabled is not set and there is an unstable control", {
		beforeEach: function () {
			this.oComponent = this.oComponent = _getMockedComponent(false, false);

			this.oComponentContainer = new ComponentContainer("CompCont1", {
				component: this.oComponent
			}).placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			_stubMessageBoxAndLog();

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponent
			});

			return this.oRta.start().then(function () {
				Log.error.resetHistory();
				MessageBox.show.resetHistory();
			});
		},
		afterEach: function () {
			return this.oRta.stop().then(function() {
				this.oComponentContainer.destroy();
				sandbox.restore();
			}.bind(this));
		}
	}, function () {
		QUnit.test("base functionality", function (assert) {
			validateFlexEnabled(this.oRta);
			assert.strictEqual(Log.error.withArgs(vLoggedErrorMatcher).callCount, 0);
			assert.strictEqual(MessageBox.show.callCount, 0, "No warning dialog should be shown");
		});

		QUnit.test("when another unstable control is added in adaptation mode", function (assert) {
			var done = assert.async();
			var oButtonWithUnstableId = _createButtonWithUnstableId();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function () {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function () {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when another stable control is added in adaptation mode", function (assert) {
			var done = assert.async();
			var oButtonWithUnstableId = _createButtonWithUnstableId();

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function () {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function () {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown");
					done();
				})();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});

		QUnit.test("when another unstable control is added in navigation mode, which is later switched to adaptation mode", function (assert) {
			var done = assert.async();
			var oButtonWithUnstableId = _createButtonWithUnstableId();
			_setNavigationMode(this.oRta);

			this.oRta._oDesignTime.attachEventOnce("elementOverlayCreated", function () {
				DtUtil.waitForSynced(this.oRta._oDesignTime, function () {
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged initially");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown initially");
					_setAdaptationMode(this.oRta);
					assert.ok(Log.error.withArgs(vLoggedErrorMatcher).notCalled, "then no error was logged after switch to adaptation mode");
					assert.ok(MessageBox.show.notCalled, "then message box was not shown after switch to adaptation mode");
					done();
				}.bind(this))();
			}.bind(this));
			this.oComponent.getRootControl().addContent(oButtonWithUnstableId);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
