/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/core/Control",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	VersionsAPI,
	Versions,
	FlexState,
	Control,
	Utils,
	sinon
) {
	"use strict";

	jQuery("#qunit-fixture").hide();
	var sandbox = sinon.sandbox.create();


	QUnit.module("Given VersionsAPI.isDraftAvailable is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no selector is provided", function (assert) {
			var mPropertyBag = {
				layer: "CUSTOMER"
			};

			return VersionsAPI.isDraftAvailable(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No selector was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when no layer is provided", function (assert) {
			var mPropertyBag = {
				selector: new Control()
			};

			return VersionsAPI.isDraftAvailable(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				selector: new Control()
			};

			return VersionsAPI.isDraftAvailable(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "The application ID could not be determined", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided and a draft exists", function(assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				selector: new Control()
			};

			sandbox.stub(Utils, "getComponentClassName").returns("com.sap.app");
			var aReturnedVersions = [
				{versionNumber: 1},
				{versionNumber: 2},
				{versionNumber: 0}
			];
			sandbox.stub(Versions, "getVersions").resolves(aReturnedVersions);

			return VersionsAPI.isDraftAvailable(mPropertyBag)
				.then(function(oResult) {
					assert.equal(oResult, true, "then a 'true' is returned");
				});
		});

		QUnit.test("when a selector and a layer were provided and a draft does not exists", function(assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				selector: new Control()
			};

			sandbox.stub(Utils, "getComponentClassName").returns("com.sap.app");
			var aReturnedVersions = [
				{versionNumber: 1},
				{versionNumber: 2}
			];
			sandbox.stub(Versions, "getVersions").resolves(aReturnedVersions);

			return VersionsAPI.isDraftAvailable(mPropertyBag)
				.then(function(oResult) {
					assert.equal(oResult, false, "then a 'false' is returned");
				});
		});
	});

	QUnit.module("Given VersionsAPI.getVersions is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no selector is provided", function (assert) {
			var mPropertyBag = {
				layer: "CUSTOMER"
			};

			return VersionsAPI.getVersions(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No selector was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when no layer is provided", function (assert) {
			var mPropertyBag = {
				selector: new Control()
			};

			return VersionsAPI.getVersions(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				selector: new Control()
			};

			return VersionsAPI.getVersions(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "The application ID could not be determined", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided and the request returns a list of versions", function(assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				selector: new Control()
			};

			sandbox.stub(Utils, "getComponentClassName").returns("com.sap.app");
			var aReturnedVersions = [];
			sandbox.stub(Versions, "getVersions").resolves(aReturnedVersions);

			return VersionsAPI.getVersions(mPropertyBag)
				.then(function(oResult) {
					assert.equal(oResult, aReturnedVersions, "then the returned version list is passed");
				});
		});
	});

	QUnit.module("Given VersionsAPI.loadDraftForApplication is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no selector is provided", function (assert) {
			var mPropertyBag = {
				layer : "CUSTOMER"
			};

			return VersionsAPI.loadDraftForApplication(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No selector was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when no layer is provided", function (assert) {
			var mPropertyBag = {
				selector : new Control()
			};

			return VersionsAPI.loadDraftForApplication(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided, but no app ID could be determined", function (assert) {
			var mPropertyBag = {
				layer : "CUSTOMER",
				selector : new Control()
			};

			return VersionsAPI.loadDraftForApplication(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "The application ID could not be determined", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided and the request returns a list of versions", function (assert) {
			var sLayer = "CUSTOMER";
			var mPropertyBag = {
				layer : sLayer,
				selector : new Control()
			};

			var sReference = "com.sap.app";
			sandbox.stub(Utils, "getComponentClassName").returns(sReference);
			var aReturnedVersions = [];
			var oClearStateStub = sandbox.stub(FlexState, "clearState");
			var oInitializeStub = sandbox.stub(FlexState, "initialize").resolves(aReturnedVersions);

			return VersionsAPI.loadDraftForApplication(mPropertyBag)
				.then(function () {
					assert.equal(oClearStateStub.callCount, 1, "then the flex state is cleared");
					assert.equal(oClearStateStub.getCall(0).args[0], sReference, "for the given application");
					assert.equal(oInitializeStub.callCount, 1, "and reinitialized");
					var oInitializePropertyBag = oInitializeStub.getCall(0).args[0];
					assert.equal(oInitializePropertyBag.componentId, sReference, "for the same application");
					assert.equal(oInitializePropertyBag.draftLayer, sLayer, "and passing the draft layer accordingly");
				});
		});
	});

	QUnit.module("Given VersionsAPI.activateDraft is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no selector is provided", function (assert) {
			var mPropertyBag = {
				layer: "CUSTOMER"
			};

			return VersionsAPI.activateDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No selector was provided", "then an Error is thrown");
			});
		});
		QUnit.test("when no layer is provided", function (assert) {
			var mPropertyBag = {
				selector: new Control()
			};

			return VersionsAPI.activateDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided, but no app ID could be determined", function(assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				selector: new Control()
			};

			return VersionsAPI.activateDraft(mPropertyBag).catch(function (sErrorMessage) {
				assert.equal(sErrorMessage, "The application ID could not be determined", "then an Error is thrown");
			});
		});

		QUnit.test("when a selector and a layer were provided and the request returns a list of versions", function(assert) {
			var mPropertyBag = {
				layer: "CUSTOMER",
				selector: new Control()
			};

			sandbox.stub(Utils, "getComponentClassName").returns("com.sap.app");
			var aReturnedVersions = [];
			sandbox.stub(Versions, "activateDraft").resolves(aReturnedVersions);

			return VersionsAPI.activateDraft(mPropertyBag)
				.then(function(oResult) {
					assert.equal(oResult, aReturnedVersions, "then the returned version list is passed");
				});
		});
	});
});
