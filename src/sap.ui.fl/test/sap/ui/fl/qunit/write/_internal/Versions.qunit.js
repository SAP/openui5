/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/ChangePersistenceFactory"
], function(
	sinon,
	Layer,
	Versions,
	Storage,
	KeyUserConnector,
	ChangePersistenceFactory
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function _prepareResponsesAndStubMethod(sReference, aReturnedVersions, sFunctionName, aDirtyChanges) {
		sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sReference);
		sandbox.stub(oChangePersistence, "getDirtyChanges").returns(aDirtyChanges);
		return sandbox.stub(oChangePersistence, sFunctionName).resolves();
	}

	QUnit.module("Internal Caching", {
		beforeEach: function () {
			this.aReturnedVersions = [];
			this.oStorageLoadVersionsStub = sandbox.stub(Storage.versions, "load").resolves(this.aReturnedVersions);
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given Versions.initialize is called", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.equal(oResponse, this.aReturnedVersions, "and the versions list is returned");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for the same reference and layer", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.equal(oResponse, this.aReturnedVersions, "and the versions list is returned");
				return Versions.initialize(mPropertyBag);
			}.bind(this)).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "no further request is sent");
				assert.equal(oResponse, this.aReturnedVersions, "and the versions list is returned");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for different references", function (assert) {
			var mPropertyBag1 = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			var mPropertyBag2 = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app2"
			};

			var aReturnedVersions = [];
			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag1).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.deepEqual(oResponse, aReturnedVersions, "and the versions list is returned");
				return Versions.initialize(mPropertyBag2);
			}.bind(this)).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 2, "a further request is sent");
				assert.deepEqual(oResponse, aReturnedVersions, "and the versions list is returned");
			}.bind(this));
		});

		QUnit.test("Given Versions.initialize is called multiple times for different layers", function (assert) {
			var mPropertyBag1 = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};

			var mPropertyBag2 = {
				layer : Layer.USER,
				reference : "com.sap.app"
			};

			return Versions.initialize(mPropertyBag1).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 1, "then a request was sent");
				assert.equal(oResponse, this.aReturnedVersions, "and the versions list is returned");
				return Versions.initialize(mPropertyBag2);
			}.bind(this)).then(function (oResponse) {
				assert.equal(this.oStorageLoadVersionsStub.callCount, 2, "a further request is sent");
				assert.equal(oResponse, this.aReturnedVersions, "and the versions list is returned");
			}.bind(this));
		});
	});

	QUnit.module("Calling the Storage: Given Versions.initialize is called", {
		beforeEach: function () {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector : "KeyUserConnector", layers : [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured which returns a list of versions", function (assert) {
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : "com.sap.app"
			};
			var aReturnedVersions = [];
			sandbox.stub(KeyUserConnector.versions, "load").resolves(aReturnedVersions);

			return Versions.initialize(mPropertyBag).then(function (oResponse) {
				assert.equal(oResponse, aReturnedVersions, "then the versions list is returned");
			});
		});
	});

	QUnit.module("Calling the Storage: Given Versions.activateDraft is called", {
		beforeEach: function () {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector : "KeyUserConnector", layers : [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured which returns a list of versions while a draft exists", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : sReference,
				nonNormalizedReference: sReference
			};

			var oFirstVersion = {
				activatedBy : "qunit",
				activatedAt : "a long while ago",
				versionNumber : 1
			};

			var oSecondVersion = {
				activatedBy : "qunit",
				activatedAt : "a while ago",
				versionNumber : 2
			};

			var aReturnedVersions = [
				{versionNumber : 0},
				oSecondVersion,
				oFirstVersion
			];

			var oSaveStub = _prepareResponsesAndStubMethod(sReference, aReturnedVersions, "saveDirtyChanges", []);

			var oActivatedVersion = {
				activatedBy : "qunit",
				activatedAt : "just now",
				versionNumber : 2
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			return Versions.initialize(mPropertyBag)
				.then(Versions.activateDraft.bind(undefined, mPropertyBag))
				.then(function (oResponse) {
					assert.equal(oSaveStub.callCount, 0, "no save changes was called");
					assert.equal(Array.isArray(oResponse), true, "then the versions list is returned");
					assert.equal(oResponse.length, 3, "with three versions");
					assert.equal(oResponse[0], oActivatedVersion, "and the newly activated is the first");
					assert.equal(oResponse[1], oSecondVersion, "where the old version is the second");
					assert.equal(oResponse[2], oFirstVersion, "where the older version is the third");
				})
				.then(Versions.getVersions.bind(Versions, mPropertyBag))
				.then(function (aVersions) {
					assert.equal(aVersions.length, 3, "with three versions");
					assert.equal(aVersions[0], oActivatedVersion, "and the newly activated is the first");
					assert.equal(aVersions[1], oSecondVersion, "where the old version is the second");
					assert.equal(aVersions[2], oFirstVersion, "where the older version is the third");
				});
		});

		QUnit.test("and a connector is configured which returns a list of versions while a draft does NOT exists", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : sReference,
				nonNormalizedReference: sReference
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			var oSaveStub = _prepareResponsesAndStubMethod(sReference, aReturnedVersions, "saveDirtyChanges", []);

			var oActivatedVersion = {
				activatedBy: "qunit",
				activatedAt: "just now",
				versionNumber: 2
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			return Versions.initialize(mPropertyBag)
				.then(Versions.activateDraft.bind(undefined, mPropertyBag))
				.catch(function (sErrorMessage) {
					assert.equal(oSaveStub.callCount, 0, "no save changes was called");
					assert.equal(sErrorMessage, "No draft exists", "then the promise is rejected with an error message");
				});
		});

		QUnit.test("and a connector is configured which returns a list of versions while a draft does NOT exists but dirty changes do", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : sReference,
				nonNormalizedReference: sReference
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			var oSaveStub = _prepareResponsesAndStubMethod(sReference, aReturnedVersions, "saveDirtyChanges", [{}]);

			var oActivatedVersion = {
				activatedBy: "qunit",
				activatedAt: "just now",
				versionNumber: 2
			};
			sandbox.stub(KeyUserConnector.versions, "activate").resolves(oActivatedVersion);

			return Versions.initialize(mPropertyBag)
				.then(Versions.activateDraft.bind(undefined, mPropertyBag))
				.then(function (oResponse) {
					assert.equal(oSaveStub.callCount, 1, "the changes were saved");
					var aSaveCallArgs = oSaveStub.getCall(0).args;
					assert.equal(aSaveCallArgs[0], false, "the caching update should not be skipped");
					assert.equal(aSaveCallArgs[1], undefined, "no list of changes is passed");
					assert.equal(aSaveCallArgs[2], true, "the draft flag is set");
					assert.equal(Array.isArray(oResponse), true, "then the versions list is returned");
					assert.equal(oResponse.length, 2, "with two versions");
					assert.equal(oResponse[0], oActivatedVersion, "and the newly activated is the second");
					assert.equal(oResponse[1], oFirstVersion, "where the older version is the first");
				})
				.then(function () {
					var aVersions = Versions.getVersions(mPropertyBag);
					assert.equal(aVersions.length, 2, "and a getting the versions anew will return two versions");
					assert.equal(aVersions[0], oActivatedVersion, "and the newly activated is the first");
					assert.equal(aVersions[1], oFirstVersion, "where the older version is the second");
				});
		});
	});

	QUnit.module("Calling the Storage: Given Versions.discardDraft is called", {
		before: function() {
			this.sComponentId = "sComponentId";
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getId: function () {
					return this.sComponentId;
				}
			};
		},
		beforeEach: function () {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getFlexibilityServices").returns([
				{connector : "KeyUserConnector", layers : [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a connector is configured and a draft exists while discard is called", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer : Layer.CUSTOMER,
				reference : sReference,
				nonNormalizedReference: sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy : "qunit",
				activatedAt : "a while ago",
				versionNumber : 1
			};

			var aReturnedVersions = [
				{versionNumber : 0},
				oFirstVersion
			];

			var oSaveStub = _prepareResponsesAndStubMethod(sReference, aReturnedVersions, "saveDirtyChanges", []);
			var oDiscardStub = sandbox.stub(KeyUserConnector.versions, "discardDraft").resolves();

			return Versions.initialize(mPropertyBag)
				.then(Versions.discardDraft.bind(undefined, mPropertyBag))
				.then(function () {
					assert.equal(oSaveStub.callCount, 0, "no save changes was called");
				})
				.then(Versions.getVersions.bind(Versions, mPropertyBag))
				.then(function (aVersions) {
					assert.equal(aVersions.length, 1, "and a getting the versions anew will return one version");
					assert.equal(oDiscardStub.callCount, 1, "discarding the draft was called");
					assert.equal(aVersions[0], oFirstVersion, "which is the activated version");
				});
		});

		QUnit.test("and a connector is configured and a draft does NOT exists while discard is called", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: sReference,
				nonNormalizedReference: sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			_prepareResponsesAndStubMethod(sReference, aReturnedVersions, "saveDirtyChanges", []);

			return Versions.initialize(mPropertyBag)
				.then(Versions.discardDraft.bind(undefined, mPropertyBag))
				.then(function (bDiscardingTookPlace) {
					assert.equal(bDiscardingTookPlace, false, "no discarding took place");
				});
		});

		QUnit.test("and a connector is configured and a draft does NOT exists but dirty changes exists " +
			"while discard is called with a flag to discard the dirty changes", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: sReference,
				nonNormalizedReference: sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			var oDeleteStub = _prepareResponsesAndStubMethod(sReference, aReturnedVersions, "deleteChange", [{}, {}]);

			return Versions.initialize(mPropertyBag)
				.then(Versions.discardDraft.bind(undefined, mPropertyBag))
				.then(function (bDiscardingTookPlace) {
					assert.equal(bDiscardingTookPlace, true, "some discarding took place");
					assert.equal(oDeleteStub.callCount, 2, "two changes were deleted");
				});
		});

		QUnit.test("and a connector is configured and a draft does NOT exists but dirty changes exists " +
			"while discard is called", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: sReference,
				nonNormalizedReference: sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion
			];

			var oDeleteStub = _prepareResponsesAndStubMethod(sReference, aReturnedVersions, "deleteChange", [{}, {}]);

			return Versions.initialize(mPropertyBag)
				.then(Versions.discardDraft.bind(undefined, mPropertyBag))
				.then(function (bDiscardingTookPlace) {
					assert.equal(bDiscardingTookPlace, true, "discarding took place");
					assert.equal(oDeleteStub.callCount, 2, "two changes were deleted");
				});
		});

		QUnit.test("and a connector is configured and a draft exists and dirty changes exists " +
			"while discard is called", function (assert) {
			var sReference = "com.sap.app";
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: sReference,
				nonNormalizedReference: sReference,
				appComponent: this.oAppComponent
			};

			var oFirstVersion = {
				activatedBy: "qunit",
				activatedAt: "a while ago",
				versionNumber: 1
			};

			var aReturnedVersions = [
				oFirstVersion,
				{versionNumber : 0}
			];

			var oDeleteStub = _prepareResponsesAndStubMethod(sReference, aReturnedVersions, "deleteChange", [{}, {}]);
			var oDiscardStub = sandbox.stub(KeyUserConnector.versions, "discardDraft").resolves();

			return Versions.initialize(mPropertyBag)
				.then(Versions.discardDraft.bind(undefined, mPropertyBag))
				.then(function (bDiscardingTookPlace) {
					assert.equal(bDiscardingTookPlace, true, "some discarding took place");
					assert.equal(oDiscardStub.callCount, 1, "discarding the draft was called");
					assert.equal(oDeleteStub.callCount, 2, "two changes were deleted");
				});
		});
	});

	QUnit.module("Given Versions.ensureDraftVersionExists is called", {
		beforeEach: function () {
		},
		afterEach: function() {
			Versions.clearInstances();
			sandbox.restore();
		}
	}, function() {
		function _setVersionsCallEnsureDraftAndCheckVersions(assert, aInitialVersions, aFinalVersions) {
			var sReference = "com.sap.app";
			var sLayer = Layer.CUSTOMER;
			var mPropertyBag = {
				reference: sReference,
				layer: sLayer
			};
			sandbox.stub(Storage.versions, "load").resolves(aInitialVersions);
			return Versions.initialize(mPropertyBag)
				.then(function() {
					Versions.ensureDraftVersionExists(mPropertyBag);
					var aVersions = Versions.getVersions(mPropertyBag);
					assert.equal(aVersions.length, aFinalVersions.length, "the number of versions is correct");
					assert.deepEqual(aVersions, aFinalVersions, "the versions objects match");
				});
		}

		QUnit.test("if no versions were present", function (assert) {
			return _setVersionsCallEnsureDraftAndCheckVersions(
				assert,
				[],
				[{versionNumber: 0}]
			);
		});

		QUnit.test("if a draft version was present", function (assert) {
			return _setVersionsCallEnsureDraftAndCheckVersions(
				assert,
				[{versionNumber: 0}],
				[{versionNumber: 0}]
			);
		});

		QUnit.test("if no draft version but other versions were present", function (assert) {
			return _setVersionsCallEnsureDraftAndCheckVersions(
				assert,
				[{versionNumber: 2}, {versionNumber: 1}],
				[{versionNumber: 0}, {versionNumber: 2}, {versionNumber: 1}]
			);
		});

		QUnit.test("if a draft version and other versions were present", function (assert) {
			return _setVersionsCallEnsureDraftAndCheckVersions(
				assert,
				[{versionNumber: 0}, {versionNumber: 2}, {versionNumber: 1}],
				[{versionNumber: 0}, {versionNumber: 2}, {versionNumber: 1}]
			);
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});