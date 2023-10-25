/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/postmessage/confirmationDialog"
],
function (
	Library,
	confirmationDialog
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.m is not loaded", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("successful resolve", function (assert) {
			var oConfirm = sandbox.stub(window, 'confirm').returns(true);
			var oPromise = confirmationDialog();

			assert.ok(oPromise instanceof Promise);

			return oPromise.then(
				function () {
					assert.ok(oConfirm.calledOnce);
				},
				function () {
					assert.ok(false, 'this should never be called');
				}
			);
		});
		QUnit.test("rejection", function (assert) {
			var oConfirm = sandbox.stub(window, 'confirm').returns(false);
			var oPromise = confirmationDialog();

			assert.ok(oPromise instanceof Promise);

			return oPromise.then(
				function () {
					assert.ok(false, 'this should never be called');
				},
				function () {
					assert.ok(oConfirm.calledOnce);
				}
			);
		});
	});

	QUnit.module("sap.m is loaded", {
		beforeEach: function () {
			sandbox.stub(Library, "isLoaded", function(sName) {
				return sName === "sap.m";
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("successful resolve", function (assert) {
			var oConfirm = sandbox.spy(function (sMessage, mParameters) {
				mParameters.onClose("YES");
			});
			sandbox.stub(sap.ui, "require").withArgs(["sap/m/MessageBox"]).callsArgWithAsync(1, {
				confirm: oConfirm,
				Action: {
					YES: "YES"
				}
			});
			var oPromise = confirmationDialog();

			assert.ok(oPromise instanceof Promise);

			return oPromise.then(
				function () {
					assert.ok(oConfirm.calledOnce);
				},
				function () {
					assert.ok(false, 'this should never be called');
				}
			);
		});
		QUnit.test("rejection", function (assert) {
			var oConfirm = sandbox.spy(function (sMessage, mParameters) {
				mParameters.onClose();
			});
			sandbox.stub(sap.ui, "require").withArgs(["sap/m/MessageBox"]).callsArgWithAsync(1, {
				confirm: oConfirm,
				Action: {
					YES: "YES"
				}
			});
			var oPromise = confirmationDialog();

			assert.ok(oPromise instanceof Promise);

			return oPromise.then(
				function () {
					assert.ok(false, 'this should never be called');
				},
				function () {
					assert.ok(oConfirm.calledOnce);
				}
			);
		});
	});

});