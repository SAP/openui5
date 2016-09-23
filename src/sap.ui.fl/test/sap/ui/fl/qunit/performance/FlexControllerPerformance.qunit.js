
 /*
* Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
*/
 jQuery.sap.require("sap.ui.fl.FlexController");
 jQuery.sap.require("sap.ui.fl.Change");
 jQuery.sap.require("sap.ui.fl.registry.ChangeRegistry");
 jQuery.sap.require("sap.ui.core.Control");
 jQuery.sap.require("sap.ui.fl.registry.Settings");
 jQuery.sap.require('sap.ui.fl.ChangePersistenceFactory');

 (function (FlexController, Change, ChangeRegistry, Control, FlexSettings, ChangePersistenceFactory) {
	 "use strict";
	 sinon.config.useFakeTimers = false;

	 var sandbox = sinon.sandbox.create();

	 var Measure = jQuery.sap.measure;

	 var labelChangeContent = {
		 "fileType": "change",
		 "layer": "USER",
		 "fileName": "a",
		 "namespace": "b",
		 "packageName": "c",
		 "changeType": "labelChange",
		 "creation": "",
		 "reference": "",
		 "selector": {
			 "id": "abc123"
		 },
		 "content": {
			 "something": "createNewVariant"
		 }
	 };

	 QUnit.module("sap.ui.fl.FlexController performance check", {
		 beforeEach: function () {
			 this.oFlexController = new FlexController("testScenarioComponent");
			 this.oControl = new Control("existingId");
			 this.oChange = new Change(labelChangeContent);
		 },
		 afterEach: function () {
			 sandbox.restore();
			 this.oControl.destroy();
			 ChangePersistenceFactory._instanceCache = {};
		 }
	 });

	 QUnit.test("no change flex runs 1000 times", function (assert) {
		 var done = assert.async();
		 var oInitialControl = this.oControl;

		 Measure.start();
		 Measure.setActive(true);

		 this.oFlexController._oChangePersistence.getChangesForView = function () {
			 return Promise.resolve([]);
		 };
		 this.stub(FlexSettings, "getInstance").returns(
			 Promise.resolve(new FlexSettings({}))
		 );

		 //Call CUT
		 var promise = this.oFlexController.processView(oInitialControl);

		 var runs = 1000;

		 for(var i = 0; i < runs; i++) {
			 promise.then(this.oFlexController.processView.bind(this.oFlexController))
		 };

		 promise.then(function (oControl) {
			 assert.equal(oInitialControl, oControl);
			 Measure.setActive(false);
			 Measure.end();
			 done();
		 });
	 });
 }(sap.ui.fl.FlexController, sap.ui.fl.Change, sap.ui.fl.registry.ChangeRegistry, sap.ui.core.Control, sap.ui.fl.registry.Settings, sap.ui.fl.ChangePersistenceFactory));
