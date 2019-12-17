/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector"
], function(
	sinon,
	Versions,
	Storage,
	KeyUserConnector
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Internal Caching", {
		beforeEach: function () {
			this.returnedVersions = [];
			this.oStorageLoadVersionsStub = sandbox.stub(Storage, "loadVersions").resolves(this.returnedVersions);
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given Versions.getVersions is called", function (assert) {
			var mPropertyBag = {
				layer : "CUSTOMER",
				reference : "com.sap.app"
			};

			return Versions.getVersions(mPropertyBag).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.equal(oResponse, this.returnedVersions, "and the versions list is returned");
			}.bind(this));
		});

		QUnit.test("Given Versions.getVersions is called multiple times for the same reference and layer", function (assert) {
			var mPropertyBag = {
				layer : "CUSTOMER",
				reference : "com.sap.app"
			};

			return Versions.getVersions(mPropertyBag).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.equal(oResponse, this.returnedVersions, "and the versions list is returned");
				return Versions.getVersions(mPropertyBag);
			}.bind(this)).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "no further request is sent");
				assert.equal(oResponse, this.returnedVersions, "and the versions list is returned");
			}.bind(this));
		});

		QUnit.test("Given Versions.getVersions is called multiple times for different references", function (assert) {
			var mPropertyBag1 = {
				layer : "CUSTOMER",
				reference : "com.sap.app"
			};

			var mPropertyBag2 = {
				layer : "CUSTOMER",
				reference : "com.sap.app2"
			};

			var aReturnedVersions = [];
			sandbox.stub(KeyUserConnector, "loadVersions").resolves(aReturnedVersions);

			return Versions.getVersions(mPropertyBag1).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.deepEqual(oResponse, aReturnedVersions, "and the versions list is returned");
				return Versions.getVersions(mPropertyBag2);
			}.bind(this)).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 2, "a further request is sent");
				assert.deepEqual(oResponse, aReturnedVersions, "and the versions list is returned");
			}.bind(this));
		});

		QUnit.test("Given Versions.getVersions is called multiple times for different layers", function (assert) {
			var mPropertyBag1 = {
				layer : "CUSTOMER",
				reference : "com.sap.app"
			};

			var mPropertyBag2 = {
				layer : "USER",
				reference : "com.sap.app"
			};

			return Versions.getVersions(mPropertyBag1).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.equal(oResponse, this.returnedVersions, "and the versions list is returned");
				return Versions.getVersions(mPropertyBag2);
			}.bind(this)).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 2, "a further request is sent");
				assert.equal(oResponse, this.returnedVersions, "and the versions list is returned");
			}.bind(this));
		});
	});

	QUnit.module("Calling the Storage: Given Versions.getVersions is called", {
		beforeEach: function () {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector : "KeyUserConnector", layers : ["CUSTOMER"], url: "/flexKeyUser"}
			]);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured which returns a list of versions", function (assert) {
			var mPropertyBag = {
				layer : "CUSTOMER",
				reference : "com.sap.app"
			};
			var aReturnedVersions = [];
			sandbox.stub(KeyUserConnector, "loadVersions").resolves(aReturnedVersions);

			return Versions.getVersions(mPropertyBag).then(function (oResponse) {
				assert.equal(oResponse, aReturnedVersions, "then the versions list is returned");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});