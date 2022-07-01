/*global QUnit*/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeRegistryItem",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	MoveControls,
	ChangeRegistryItem,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var sErrorMessageInMissingChangeHandlerCase = "The ChangeHandler is either not available or does not have all required functions";

	QUnit.module("sap.ui.fl.initial._internal.changeHandlers.ChangeRegistryItem", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("constructor - required params and their getter", function(assert) {
			var mParam = {
				changeHandler: "dummyChangeHandler",
				changeType: "dummyChangeType",
				layers: "dummyLayer",
				controlType: "sap.ui.fl.DummyControl"
			};

			var oChangeRegistryItem = new ChangeRegistryItem(mParam);

			assert.equal(oChangeRegistryItem.getChangeTypeName(), "dummyChangeType");
			assert.equal(oChangeRegistryItem.getLayers(), "dummyLayer");
			assert.equal(oChangeRegistryItem.getControlType(), "sap.ui.fl.DummyControl");
		});

		QUnit.test("constructor - exception on required params missing", function(assert) {
			var oErrorLogStub = sandbox.stub(Log, "error");

			var oChangeRegistryItem = new ChangeRegistryItem({});

			assert.ok(oChangeRegistryItem, "the item got created");
			assert.equal(oErrorLogStub.callCount, 4, "two errors got logged");
		});

		QUnit.test("getChangeHandler without applyChange function", function (assert) {
			var oMissingApply = {
				revertChange: function() {},
				completeChangeContent: function() {}
			};
			var oChangeRegistryItem = new ChangeRegistryItem({
				changeHandler: oMissingApply,
				changeType: "dummyChangeType",
				layers: "dummyLayer",
				controlType: "sap.ui.fl.DummyControl"
			});
			return oChangeRegistryItem.getChangeHandler()
				.catch(function (oError) {
					assert.equal(oError.message, sErrorMessageInMissingChangeHandlerCase, "then the change handler is not returned");
				});
		});

		QUnit.test("getChangeHandler without revertChange function", function (assert) {
			var oMissingRevert = {
				applyChange: function() {},
				completeChangeContent: function() {}
			};
			var oChangeRegistryItem = new ChangeRegistryItem({
				changeHandler: oMissingRevert,
				changeType: "dummyChangeType",
				layers: "dummyLayer",
				controlType: "sap.ui.fl.DummyControl"
			});
			return oChangeRegistryItem.getChangeHandler()
				.catch(function (oError) {
					assert.equal(oError.message, sErrorMessageInMissingChangeHandlerCase, "then the change handler is not returned");
				});
		});

		QUnit.test("getChangeHandler without completeChangeContent function", function (assert) {
			var oMissingCompleteContent = {
				applyChange: function() {},
				revertChange: function() {}
			};
			var oChangeRegistryItem = new ChangeRegistryItem({
				changeHandler: oMissingCompleteContent,
				changeType: "dummyChangeType",
				layers: "dummyLayer",
				controlType: "sap.ui.fl.DummyControl"
			});
			return oChangeRegistryItem.getChangeHandler()
				.catch(function (oError) {
					assert.equal(oError.message, sErrorMessageInMissingChangeHandlerCase, "then the change handler is not returned");
				});
		});

		QUnit.test("getChangeHandler with all functions", function (assert) {
			var oValidChangeHandler = {
				applyChange: function() {},
				revertChange: function() {},
				completeChangeContent: function() {}
			};
			var oChangeRegistryItem = new ChangeRegistryItem({
				changeHandler: oValidChangeHandler,
				changeType: "dummyChangeType",
				layers: "dummyLayer",
				controlType: "sap.ui.fl.DummyControl"
			});
			return oChangeRegistryItem.getChangeHandler()
				.then(function (oReturnedChangeHandler) {
					assert.equal(oReturnedChangeHandler, oValidChangeHandler, "then the correct change handler is returned");
				});
		});

		QUnit.test("getChangeHandler with explicit registered changeHandler path", function(assert) {
			var sExplicitRegisteredChangeHandlerPath = 'sap.ui.fl.changeHandler.MoveControls';
			var oChangeRegistryItem = new ChangeRegistryItem({
				changeHandler: sExplicitRegisteredChangeHandlerPath,
				changeType: "dummyChangeType",
				layers: "dummyLayer",
				controlType: "sap.ui.fl.DummyControl"
			});
			return oChangeRegistryItem.getChangeHandler()
				.then(function (oReturnedChangeHandler) {
					assert.equal(oReturnedChangeHandler, MoveControls, "then correct loaded changehandler is returned");
				});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
