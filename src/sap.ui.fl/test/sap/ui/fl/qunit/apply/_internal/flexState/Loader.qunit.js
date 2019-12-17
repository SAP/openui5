/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/thirdparty/sinon-4"
], function (
	Loader,
	CompatibilityConnector,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Loader", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when loadFlexData is called", function (assert) {
			var mPropertyBag = {
				component: "component",
				otherValue: "a"
			};
			var oLoadFlexDataStub = sandbox.stub(CompatibilityConnector, "loadChanges").returns("foo");
			assert.equal(Loader.loadFlexData(mPropertyBag), "foo", "the Loader returns whatever the CompatibilityConnector returns");
			assert.equal(oLoadFlexDataStub.callCount, 1, "the CompatibilityConnector was called");
			assert.equal(oLoadFlexDataStub.firstCall.args[0], "component", "the first argument is the component");
			assert.deepEqual(oLoadFlexDataStub.firstCall.args[1], mPropertyBag, "the second argument is the property bag");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
