sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	ManifestUtils,
	FlexControllerFactory,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("sap.ui.fl.FlexControllerFactory", {
		beforeEach: function() {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("shall create a new FlexController", function(assert) {
			assert.ok(FlexControllerFactory.create("myComponent"));
		});

		QUnit.test("shall cache and reuse the created FlexController instances", function(assert) {
			var oFlexController1 = FlexControllerFactory.create("myComponent");
			var oFlexController2 = FlexControllerFactory.create("myComponent");

			assert.strictEqual(oFlexController1, oFlexController2);
		});

		QUnit.test("when createForControl() is called for a non application type component", function(assert) {
			var oMockManifest = {
				id: "MockManifestId"
			};
			var oMockControl = {
				id: "MockControlId"
			};
			var oAppComponent = {
				getManifest: function() {
					return oMockManifest;
				}
			};
			var sMockComponentName = "MockCompName";

			sandbox.stub(Utils, "getAppComponentForControl").withArgs(oMockControl).returns(oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl")
			.withArgs(oAppComponent)
			.returns(sMockComponentName);

			sandbox.stub(FlexControllerFactory, "create");

			FlexControllerFactory.createForControl(oMockControl);

			assert.ok(FlexControllerFactory.create.calledWith(sMockComponentName), "then FlexController created with the correct component name");
		});

		QUnit.test("when createForSelector is called", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForSelector").returns("myFancyFlexReference");
			sandbox.stub(FlexControllerFactory, "create");
			FlexControllerFactory.createForSelector("foo");
			assert.ok(
				FlexControllerFactory.create.calledWith("myFancyFlexReference"),
				"the create function was properly called"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});

/* global QUnit */
