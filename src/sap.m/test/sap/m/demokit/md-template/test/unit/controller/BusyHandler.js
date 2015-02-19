sap.ui.require(
	[
		"sap/ui/demo/mdtemplate/controller/BusyHandler",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function(BusyHandler) {
		"use strict";

		QUnit.module("Initialization", {
			setup: function () {
				sinon.config.useFakeTimers = false;
			}
		});

		QUnit.test("Should set the control busy without delay", function (assert) {
			var oComponentStub = {
				oWhenMetadataIsLoaded: {
					then: function (fnResolve, fnReject) {
						// do nothing
					}
				},
				_oRootView: new sap.m.Label()
			};
			new BusyHandler(oComponentStub);

			assert.strictEqual(oComponentStub._oRootView.getBusyIndicatorDelay(), 0, "The root view has no busy indicator delay set.");
			assert.strictEqual(oComponentStub._oRootView.getBusy(), true, "The root view is busy.");
		});

		QUnit.asyncTest("Should set the control not busy and reset the delay", function (assert) {
			var oComponentStub = {
				oWhenMetadataIsLoaded: {
					then: function (fnResolve, fnReject) {
						// immediately resolve the promise for this test
						setTimeout(function () {
							fnResolve();

							assert.strictEqual(oComponentStub._oRootView.getBusyIndicatorDelay(), oComponentStub._oRootView.getMetadata()._mDefaults.busyIndicatorDelay, "The root view has the busy indicator delay set.");
							assert.strictEqual(oComponentStub._oRootView.getBusy(), false, "The root view is not busy.");

							QUnit.start();
						}, 0);
					}
				},
				_oRootView: new sap.m.Label()
			};
			new BusyHandler(oComponentStub);
		});
	}
);
