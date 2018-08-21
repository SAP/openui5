/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	FlexControllerFactory,
	ChangePersistenceFactory,
	Utils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("sap.ui.fl.FlexControllerFactory", {
		beforeEach: function () {
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("shall provide an API to create a FlexController", function (assert) {
			assert.strictEqual(typeof FlexControllerFactory.create, 'function');
		});

		QUnit.test("shall create a new FlexController", function (assert) {
			var oFlexController;

			//Call CUT
			oFlexController = FlexControllerFactory.create("myComponent");
			assert.ok(oFlexController);
		});

		QUnit.test("shall cache and reuse the created FlexController instances", function (assert) {
			var oFlexController1, oFlexController2;

			//Call CUT
			oFlexController1 = FlexControllerFactory.create("myComponent");
			oFlexController2 = FlexControllerFactory.create("myComponent");

			assert.strictEqual(oFlexController1, oFlexController2);
		});

		 QUnit.test("does not propagate if there are no changes for the component", function (assert) {
			sandbox.stub(ChangePersistenceFactory, "_getChangesForComponentAfterInstantiation").returns(Promise.resolve({}));
			sandbox.stub(Utils, "isApplication").returns(true);

			var oComponent = {
				getManifestObject: function () {
					return {};
				},
				addPropagationListener: function () {}
			};

			var oAddPropagationListenerStub = sandbox.stub(oComponent, "addPropagationListener");

			FlexControllerFactory.getChangesAndPropagate(oComponent, {});

			assert.equal(oAddPropagationListenerStub.callCount, 0, "no propagation was triggered");
		 });

		 QUnit.test("does propagate if there are changes for the component", function (assert) {

			 var done = assert.async();
			 assert.expect(0); // assert only the addPropagationListener to be called

			 var mDeterminedChanges = {
			 "someId": [{}]
			 };

			 var oComponent = {
				 getManifestObject: function () {
					 return {};
				 },
				 addPropagationListener: function () {
					 done();
				 },
				 getManifest: function () {},
				 setModel: function () {}
			 };

			 sandbox.stub(ChangePersistenceFactory, "_getChangesForComponentAfterInstantiation").returns(Promise.resolve(function() {return mDeterminedChanges;}));
			 sandbox.stub(Utils, "isApplication").returns(true);

			 FlexControllerFactory.getChangesAndPropagate(oComponent, {});
		 });

		QUnit.test("when getChangesForPropagate() is called for a non application type component", function (assert) {
			assert.expect(4);
			var oModel = {
				addEmbeddedComponent: function () {}
			};
			var sVariantModelName = "$FlexVariants";
			var oOuterAppComponent = {
				getModel: function (sModelName) {
					assert.strictEqual(sModelName, sVariantModelName, "then variant model called on the app component");
					return oModel;
				}
			};

			var oComponent = {
				setModel: function (oModelSet, sModelName) {
					assert.strictEqual(sModelName, sVariantModelName, "then variant model set on the app component");
					assert.deepEqual(oModelSet, oModel, "then the correct model was set");
				},
				getManifestObject: function () { }
			};

			sandbox.stub(Utils, "isEmbeddedComponent").returns(true);
			sandbox.stub(Utils, "getAppComponentForControl").withArgs(oComponent, true).returns(oOuterAppComponent);
			sandbox.stub(FlexControllerFactory, "createForControl");

			FlexControllerFactory.getChangesAndPropagate(oComponent, {});

			assert.strictEqual(FlexControllerFactory.createForControl.callCount, 0, "then createForControl() not called");
		});

		QUnit.test("when createForControl() is called for a non application type component", function (assert) {
			var oMockManifest = {
				id: "MockManifestId"
			};
			var oMockControl = {
				id: "MockControlId"
			};
			var oOuterAppComponent = {
				getManifest: function () {
					return oMockManifest;
				}
			};
			var sMockComponentName = "MockCompName";
			var sMockComponentAppVersion = "1.23";

			sandbox.stub(Utils, "getAppComponentForControl").withArgs(oMockControl, true).returns(oOuterAppComponent);
			sandbox.stub(Utils, "getComponentClassName")
				.withArgs(oOuterAppComponent)
				.returns(sMockComponentName);

			sandbox.stub(Utils, "getAppVersionFromManifest")
				.withArgs(oMockManifest)
				.returns(sMockComponentAppVersion);

			sandbox.stub(FlexControllerFactory, "create");

			FlexControllerFactory.createForControl(oMockControl);

			assert.ok(FlexControllerFactory.create.calledWith(sMockComponentName, sMockComponentAppVersion), "then FlexController created with the correct component name and app version");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});