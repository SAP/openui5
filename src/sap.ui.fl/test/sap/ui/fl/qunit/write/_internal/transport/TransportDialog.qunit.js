/* global QUnit*/

sap.ui.define([
	"sap/ui/fl/write/_internal/transport/TransportDialog",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	TransportDialog,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.write._internal.transport.TransportDialog", {
		beforeEach: function () {
			this.oDialog = new TransportDialog();
		},
		afterEach: function () {
			this.oDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Shall be instantiable", function (assert) {
			assert.ok(this.oDialog);
		});

		QUnit.test("Escape handler is set", function (assert) {
			assert.ok(this.oDialog.getEscapeHandler());
			assert.equal(typeof this.oDialog.getEscapeHandler(), "function");
		});

		QUnit.test("setPackage", function (assert) {
			this.oDialog.setPkg("$TMP");
			assert.equal(this.oDialog.getProperty("pkg"), "$TMP");
		});

		QUnit.test("setLrepObject", function (assert) {
			this.oDialog.setLrepObject({type: "variant", name: "id_1414740501651_318", namespace: ""});
			assert.equal(this.oDialog.getProperty("lrepObject").name, "id_1414740501651_318");
		});

		QUnit.test("setHidePackage", function (assert) {
			this.oDialog.setHidePackage(true);
			assert.equal(this.oDialog.getProperty("hidePackage"), true);
			assert.equal(this.oDialog._oPackageListItem.getVisible(), false);
		});

		QUnit.test("setTransports", function (assert) {
			var aTransports = [
				{
					transportId: "T1",
					description: "Transport 1"
				},
				{
					transportId: "T2",
					description: "Transport 2"
				},
				{
					transportId: "T3",
					description: "Transport 3"
				},
				{
					transportId: "T4",
					description: "Transport 4"
				},
				{
					transportId: "T5",
					description: "Transport 5"
				}
			];

			this.oDialog.setTransports(aTransports);
			assert.equal(this.oDialog.getProperty("transports").length, 5);
			assert.equal(this.oDialog._oTransport.getEnabled(), true);
		});

		QUnit.test("_onPackageChangeError", function (assert) {
			this.oDialog._onPackageChangeError({});
			assert.equal(this.oDialog.getProperty("transports").length, 0);
		});

		QUnit.test("_onPackageChangeSuccess - localonly flag", function (assert) {
			this.oDialog._onPackageChangeSuccess({localonly: true});
			assert.equal(this.oDialog._oTransport.getEnabled(), false);
		});

		QUnit.test("_onPackageChangeSuccess - locked flag", function (assert) {
			var oTransports = {
				transports: [
					{
						locked: true
					}
				]
			};

			sandbox.spy(this.oDialog, "_hasLock");
			this.oDialog._onPackageChangeSuccess(oTransports);
			assert.equal(this.oDialog._oTransport.getEnabled(), true);
			assert.ok(this.oDialog._hasLock.calledOnce);
		});

		QUnit.test("_onPackageChangeSuccess - error code", function (assert) {
			this.oDialog._onPackageChangeSuccess({
				errorCode: "INVALID_PACKAGE",
				transports: []
			});
			assert.equal(this.oDialog.getButtons()[1].getEnabled(), false);
			assert.equal(this.oDialog._oPackage.getValueState(), sap.ui.core.ValueState.Error);
		});

		QUnit.test("okay callback not invoked", function (assert) {
			//no package, no hide package, no transport.
			var bPressed = false;
			var fPressed = function () {
				bPressed = true;
			};
			var aButtons = this.oDialog.getButtons();
			this.oDialog.attachOk(fPressed);
			aButtons[1].firePress();
			assert.equal(bPressed, false);
		});

		QUnit.test("okay callback invoked", function (assert) {
			//hide package set.
			var bPressed = false;
			var fPressed = function () {
				bPressed = true;
			};
			var aButtons = this.oDialog.getButtons();
			this.oDialog.attachOk(fPressed);
			aButtons[1].firePress();
			assert.equal(bPressed, false);
		});

		QUnit.test("_onOkay", function (assert) {
			var bPressed = false;
			var fPressed = function () {
				bPressed = true;
			};
			//this.oDialog._oLocal.bLocal = true;
			this.oDialog.attachOk(fPressed);
			this.oDialog._onOkay();
			assert.equal(bPressed, false);
		});

		QUnit.test("cancel callback invoked", function (assert) {
			var bPressed = false;
			var fPressed = function () {
				bPressed = true;
			};
			var aButtons = this.oDialog.getButtons();
			this.oDialog.attachCancel(fPressed);
			aButtons[2].firePress();
			assert.equal(bPressed, true);
		});

		QUnit.test("_createObjectInfo", function (assert) {
			this.oDialog.setProperty("lrepObject", {
				type: "variant",
				name: "id_1414740501651_318",
				namespace: "test_name_space"
			});
			var oInfo = this.oDialog._createObjectInfo();

			assert.equal(oInfo.name, "id_1414740501651_318");
			assert.equal(oInfo.namespace, "test_name_space");
			assert.equal(oInfo.type, "variant");
		});

		QUnit.test("local object button-pressed event", function (assert) {
			var sPackage;
			var sTransport;
			this.oDialog.attachOk(function (oParam) {
				sPackage = oParam.mParameters.selectedPackage;
				sTransport = oParam.mParameters.selectedTransport;
			});
			this.oDialog.getButtons()[0].firePress();

			assert.equal(sPackage, "$TMP");
			assert.equal(sTransport, "");
		});

		QUnit.test("_onLocal", function (assert) {
			var sPackage;
			var sTransport;
			this.oDialog.attachOk(function (oParam) {
				sPackage = oParam.mParameters.selectedPackage;
				sTransport = oParam.mParameters.selectedTransport;
			});
			this.oDialog._onLocal();

			assert.equal(sPackage, "$TMP");
			assert.equal(sTransport, "");
		});

		QUnit.test("_checkOkay returns false", function (assert) {
			this.oDialog._checkOkay();
			assert.equal(this.oDialog._checkOkay(), false);
		});

		QUnit.test("_checkOkay returns true", function (assert) {
			this.oDialog._checkOkay();
			assert.equal(this.oDialog._checkOkay("1234"), true);
		});

		QUnit.test("_checkOkay returns false, if hidePackage is set", function (assert) {
			this.oDialog.setHidePackage(true);
			assert.equal(this.oDialog._checkOkay(), false);
		});

		QUnit.test("_setTransports", function (assert) {
			var aTransports = [
				{
					transportId: "T1",
					description: "Transport 1"
				},
				{
					transportId: "T2",
					description: "Transport 2"
				},
				{
					transportId: "T3",
					description: "Transport 3"
				},
				{
					transportId: "T4",
					description: "Transport 4"
				},
				{
					transportId: "T5",
					description: "Transport 5"
				}
			];

			this.oDialog._setTransports({
				transports: aTransports
			});
			assert.equal(this.oDialog.getProperty("transports").length, 5);
			assert.equal(this.oDialog._oTransport.getEnabled(), true);
			assert.equal(!this.oDialog._oTransport.getSelectedKey(), true);
		});

		QUnit.test("_setTransports - empty transports", function (assert) {
			this.oDialog._setTransports({
				transports: []
			});
			assert.equal(this.oDialog.getProperty("transports").length, 0);
			assert.equal(this.oDialog._oTransport.getEnabled(), false);
			assert.equal(!this.oDialog._oTransport.getSelectedKey(), true);
		});

		QUnit.test("_setTransports - one transport", function (assert) {
			var aTransports = [
				{
					transportId: "T1",
					description: "Transport 1"
				}
			];

			this.oDialog._setTransports({
				transports: aTransports
			});
			assert.equal(this.oDialog.getProperty("transports").length, 1);
			assert.equal(this.oDialog._oTransport.getEnabled(), true);
			assert.equal(this.oDialog._oTransport.getSelectedKey(), "T1");
		});

		QUnit.test("_oTransport - selectionChange event - when package is hide", function (assert) {
			this.oDialog.setHidePackage(true);
			this.oDialog._oTransport.fireSelectionChange();
			assert.equal(this.oDialog.getButtons()[1].getEnabled(), true);
		});

		QUnit.test("_oTransport - selectionChange event - changing nothing", function (assert) {
			this.oDialog._oTransport.fireSelectionChange();
			assert.equal(this.oDialog.getButtons()[1].getEnabled(), false);
		});

		QUnit.test("_oTransport - selectionChange event - enabling okay button", function (assert) {
			this.oDialog._oPackage.setValue("abc123");
			this.oDialog._oTransport.fireSelectionChange();
			assert.equal(this.oDialog.getButtons()[1].getEnabled(), true);
		});

		QUnit.test("_oTransport - change event disabling okay button", function (assert) {
			this.oDialog.getButtons()[1].setEnabled(true);
			this.oDialog._oTransport.fireChange({
				newValue: "T1"
			});
			assert.equal(this.oDialog.getButtons()[1].getEnabled(), false);
		});

		QUnit.test("_oTransport - change event disabling okay button", function (assert) {
			var aTransports = [
				{
					transportId: "T1",
					description: "Transport 1"
				}
			];

			this.oDialog._setTransports({
				transports: aTransports
			});

			this.oDialog.getButtons()[1].setEnabled(true);
			this.oDialog._oTransport.fireChange({
				newValue: "Transport 1"
			});
			assert.equal(this.oDialog.getButtons()[1].getEnabled(), false);
		});

		QUnit.test("_oTransport - change event causing no change", function (assert) {
			var aTransports = [
				{
					transportId: "T1",
					description: "Transport 1"
				}
			];

			this.oDialog._setTransports({
				transports: aTransports
			});

			this.oDialog.getButtons()[1].setEnabled(true);
			this.oDialog._oTransport.fireChange({
				newValue: "T1"
			});
			assert.equal(this.oDialog.getButtons()[1].getEnabled(), true);
		});

		QUnit.test("_oPackage - liveChange - changing transport button", function (assert) {
			assert.equal(this.oDialog._oTransport.getEnabled(), false);
			this.oDialog._oPackage.fireLiveChange({liveValue: "live"});
			assert.equal(this.oDialog._oTransport.getEnabled(), true);
		});

		QUnit.test("_oPackage - liveChange - changing nothing", function (assert) {
			assert.equal(this.oDialog._oTransport.getEnabled(), false);
			this.oDialog._oPackage.fireLiveChange();
			assert.equal(this.oDialog._oTransport.getEnabled(), false);
		});

		QUnit.test("_oPackage - change event executing promise ", function (assert) {
			sap.ui.fl.write._internal.transport.Transports = function () {
				return {
					getTransports: function () {
						return {
							then: function () {
								assert.ok("promise executed");
							}
						};
					}
				};
			};
			this.oDialog._oPackage.fireChange();
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});