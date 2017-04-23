/*global QUnit*/
jQuery.sap.require("sap.ui.fl.FlexControllerFactory");
jQuery.sap.require("sap.ui.fl.FlexController");
jQuery.sap.require("sap.ui.fl.ChangePersistenceFactory");
jQuery.sap.require("sap.ui.fl.Utils");

(function (FlexControllerFactory, FlexController, ChangePersistenceFactory, Utils) {
	'use strict';

	QUnit.module("sap.ui.fl.FlexControllerFactory", {
		beforeEach: function () {
		},
		afterEach: function () {
		}
	});

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
		this.stub(ChangePersistenceFactory, "_getChangesForComponentAfterInstantiation").returns(Promise.resolve({}));
		this.stub(Utils, "isApplication").returns(true);

		var oComponent = {
			getManifestObject: function () {
				return {};
			},
			addPropagationListener: function () {}
		};

		var oAddPropagationListenerStub = this.stub(oComponent, "addPropagationListener");

		FlexControllerFactory.getChangesAndPropagate(oComponent, {});

		assert.equal(oAddPropagationListenerStub.callCount, 0, "no propagation was triggered");
	 });

	 QUnit.test("does propagate if there are changes for the component", function (assert) {

		 var done = assert.async();
		 assert.expect(0); // assert only the addPropagationListener to be called

		 var mDeterminedChanges = {
		 "someId": [{}]
		 };

		 this.stub(ChangePersistenceFactory, "_getChangesForComponentAfterInstantiation").returns(Promise.resolve(function() {return mDeterminedChanges;}));
		 this.stub(Utils, "isApplication").returns(true);

		 var oComponent = {
			 getManifestObject: function () {
				 return {};
			 },
			 addPropagationListener: function () {
			 done();
			 }
		 };

		 FlexControllerFactory.getChangesAndPropagate(oComponent, {});
	 });

}(sap.ui.fl.FlexControllerFactory, sap.ui.fl.FlexController, sap.ui.fl.ChangePersistenceFactory, sap.ui.fl.Utils));

