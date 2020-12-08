/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/flexObjects/Variant",
	"sap/ui/fl/Change",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	Variant,
	Change,
	Utils,
	Settings,
	Layer,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var aScenarios = [{
		testName: "and a variant in the USER layer",
		// testing more is not mandatory since the USER is never transported
		variant: {
			layer: Layer.USER,
			originalLanguage: "EN"
		},
		settings: {
			isPublicLayerAvailable: true
		},
		expectedReadOnly: false
	}, {
		testName: ", a variant in the PUBLIC layer and the user is its author",
		variant: {
			layer: Layer.PUBLIC,
			user: "FRANK",
			originalLanguage: "EN"
		},
		settings: {
			isPublicLayerAvailable: true // testing the = false option is not a real case since the variant was written into it
		},
		currentUser: "FRANK",
		expectedReadOnly: false
	}, {
		testName: ", a variant in the PUBLIC layer and the user is NOT its author",
		variant: {
			layer: Layer.PUBLIC,
			user: "FRANK",
			originalLanguage: "EN"
		},
		settings: {
			isPublicLayerAvailable: true // testing the = false option is not a real case since the variant was written into it
		},
		currentUser: "PAUL",
		expectedReadOnly: true
	}, {
		testName: ", a variant in the PUBLIC layer and the current user could not be determined",
		variant: {
			layer: Layer.PUBLIC,
			user: "FRANK",
			originalLanguage: "EN"
		},
		settings: {
			isPublicLayerAvailable: true // testing the = false option is not a real case since the variant was written into it
		},
		expectedReadOnly: false
	}, {
		testName: ", a variant in the PUBLIC layer and the user is NOT its author but a key user",
		variant: {
			layer: Layer.PUBLIC,
			user: "FRANK",
			originalLanguage: "EN"
		},
		settings: {
			isKeyUser: true,
			isPublicLayerAvailable: true // testing the = false option is not a real case since the variant was written into it
		},
		currentUser: "PAUL",
		expectedReadOnly: false
	}, {
		testName: "and a variant in the CUSTOMER layer and an available PUBLIC layer",
		variant: {
			layer: Layer.CUSTOMER,
			sourceSystem: "ABC",
			sourceClient: "123",
			originalLanguage: "EN"
		},
		settings: {
			isKeyUser: true,
			isPublicLayerAvailable: true,
			system: "ABC",
			client: "123"
		},
		expectedReadOnly: true
	}, {
		testName: "and a variant in the CUSTOMER layer and an unavailable PUBLIC layer",
		variant: {
			layer: Layer.CUSTOMER,
			user: "FRANK",
			sourceSystem: "ABC",
			sourceClient: "123",
			originalLanguage: "EN"
		},
		settings: {
			isKeyUser: true,
			isPublicLayerAvailable: false,
			system: "ABC",
			client: "123"
		},
		currentUser: "FRANK",
		expectedReadOnly: false
	}, {
		testName: "and a variant from another system",
		variant: {
			layer: Layer.CUSTOMER,
			user: "FRANK",
			sourceSystem: "DEF",
			sourceClient: "123",
			originalLanguage: "EN"
		},
		settings: {
			isKeyUser: true,
			isPublicLayerAvailable: false,
			system: "ABC",
			client: "123"
		},
		currentUser: "FRANK",
		expectedReadOnly: true
	}, {
		testName: "and a variant from another client",
		variant: {
			layer: Layer.CUSTOMER,
			user: "FRANK",
			sourceSystem: "ABC",
			sourceClient: "456",
			originalLanguage: "EN"
		},
		settings: {
			isKeyUser: true,
			isPublicLayerAvailable: false,
			system: "ABC",
			client: "123"
		},
		currentUser: "FRANK",
		expectedReadOnly: true
	}, {
		testName: "and a variant in the CUSTOMER layer and an unavailable PUBLIC layer where the user is the author",
		variant: {
			layer: Layer.CUSTOMER,
			user: "FRANK",
			originalLanguage: "EN"
		},
		settings: {
			isPublicLayerAvailable: false
		},
		currentUser: "FRANK",
		expectedReadOnly: false
	}, {
		testName: "and a variant in the CUSTOMER layer and an unavailable PUBLIC layer where the user is NOT the author",
		variant: {
			layer: Layer.CUSTOMER,
			user: "Frank", // to test case sensitivity
			originalLanguage: "EN"
		},
		settings: {
			isPublicLayerAvailable: false
		},
		currentUser: "PAUL",
		expectedReadOnly: true
	}, {
		testName: "and a variant in the CUSTOMER layer and an unavailable PUBLIC layer where the user is a key user",
		variant: {
			layer: Layer.CUSTOMER,
			user: "FRANK",
			originalLanguage: "EN"
		},
		settings: {
			isKeyUser: true,
			isPublicLayerAvailable: false
		},
		currentUser: "PAUL",
		expectedReadOnly: false
	}];

	function stubCurrentUser(sUserId) {
		sandbox.stub(Utils, "getUshellContainer").returns({
			getUser: function () {
				return sUserId ? {
					getId: function () {
						return sUserId;
					}
				} : undefined;
			}
		});
	}

	function createVariant(mTestSetup) {
		var mVariantData = Change.createInitialFileContent(merge(mTestSetup.variant, {
			fileType: "variant",
			fileName: "testVariant_123",
			namespace: "testNamespace"
		}));

		var oVariant = new Variant(mVariantData);
		oVariant.getDefinition().support.user = mTestSetup.variant.user;
		oVariant.getDefinition().sourceSystem = mTestSetup.variant.sourceSystem;
		oVariant.getDefinition().sourceClient = mTestSetup.variant.sourceClient;

		return oVariant;
	}

	QUnit.module("Given isReadOnly is called", {
		beforeEach: function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		aScenarios.forEach(function (mTestSetup) {
			QUnit.test(mTestSetup.testName + " when isReadOnly is called", function(assert) {
				// mocked settings
				Settings._instance = new Settings(mTestSetup.settings);
				stubCurrentUser(mTestSetup.currentUser);

				var oVariant = createVariant(mTestSetup);

				assert.equal(mTestSetup.expectedReadOnly, oVariant.isReadOnly(), "then the boolean was determined correct");
			});
		});
	});

	QUnit.module("Given isLabelReadOnly is called", {
		beforeEach: function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		aScenarios.forEach(function (mTestSetup) {
			[{
				language: "DE",
				expectedLabelReadOnly: true
			}, {
				language: "EN",
				expectedLabelReadOnly: false
			}].forEach(function (mLanguageScenario) {
				QUnit.test(mTestSetup.testName + " when isLabelReadOnly is called", function(assert) {
					// mocked settings
					Settings._instance = new Settings(mTestSetup.settings);
					stubCurrentUser(mTestSetup.currentUser);
					var oVariant = createVariant(mTestSetup);

					sandbox.stub(Utils, "getCurrentLanguage").returns(mLanguageScenario.language);

					assert.equal(mLanguageScenario.expectedLabelReadOnly || mTestSetup.expectedReadOnly, oVariant.isLabelReadOnly(), "then the boolean was determined correct");
				});
			});
		});
	});

	QUnit.module("Given the constructor is called", {
		beforeEach: function () {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no favorite is provided", function(assert) {
			var oVariant = new Variant({});
			assert.equal(oVariant.getFavorite(), false, "then by default it is NOT a favorite");
		});

		QUnit.test("when favorite is set to false", function(assert) {
			var oVariant = new Variant({
				content: {
					favorite: false
				}
			});
			assert.equal(oVariant.getFavorite(), false, "then it is NOT a favorite");
		});

		QUnit.test("when favorite is set to true", function(assert) {
			var oVariant = new Variant({
				content: {
					favorite: true
				}
			});
			assert.equal(oVariant.getFavorite(), true, "then it is NOT a favorite");
		});

		QUnit.test("when no executeOnSelect is provided", function(assert) {
			var oVariant = new Variant({});
			assert.equal(oVariant.getExecuteOnSelect(), false, "then by default it is NOT executed on selection");
		});

		QUnit.test("when executeOnSelect is set to false", function(assert) {
			var oVariant = new Variant({
				content: {
					executeOnSelect: false
				}
			});
			assert.equal(oVariant.getExecuteOnSelect(), false, "then it is NOT executed on selection");
		});

		QUnit.test("when executeOnSelect is set to true", function(assert) {
			var oVariant = new Variant({
				content: {
					executeOnSelect: true
				}
			});
			assert.equal(oVariant.getExecuteOnSelect(), true, "then it is NOT executed on selection");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
