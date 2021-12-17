/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/base/util/UriParameters",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	CompVariant,
	Settings,
	Layer,
	UriParameters,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

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
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true
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
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true
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
		expectedEditEnabled: false,
		expectedDeleteEnabled: false,
		expectedRenameEnabled: false
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
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true
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
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true
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
		expectedEditEnabled: false,
		expectedDeleteEnabled: false,
		expectedRenameEnabled: false
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
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true
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
		expectedEditEnabled: false,
		expectedDeleteEnabled: false,
		expectedRenameEnabled: false
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
		expectedEditEnabled: false,
		expectedDeleteEnabled: false,
		expectedRenameEnabled: false
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
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true
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
		expectedEditEnabled: false,
		expectedDeleteEnabled: false,
		expectedRenameEnabled: false
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
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true
	}, {
		testName: "Given a VENDOR variant with a set sap-ui-layer=VENDOR parameter when isReadOnly is called",
		variant: {
			layer: Layer.VENDOR,
			user: "FRANK",
			originalLanguage: "EN"
		},
		settings: {
			isKeyUser: true,
			isPublicLayerAvailable: false
		},
		currentUser: "PAUL",
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true,
		sapUiLayerUrlParameter: Layer.VENDOR
	}];

	function stubCurrentUser(sUserId) {
		sandbox.stub(Settings.prototype, "getUserId").returns(sUserId);
	}

	function createVariant(oVariantData) {
		var mVariantData = CompVariant.createInitialFileContent(merge(oVariantData, {
			fileType: "variant",
			fileName: "testVariant_123",
			namespace: "testNamespace"
		}));

		var oVariant = new CompVariant(mVariantData);
		oVariant.getDefinition().support.user = oVariantData.user;
		oVariant.getDefinition().sourceSystem = oVariantData.sourceSystem;
		oVariant.getDefinition().sourceClient = oVariantData.sourceClient;

		return oVariant;
	}

	QUnit.module("Given isEditEnabled/isRenameEnabled/isDeleteEnabled is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a standard variant", function(assert) {
			// mocked settings
			Settings._instance = new Settings({
				isPublicLayerAvailable: false
			});

			var oVariant = createVariant({});
			oVariant.setStandardVariant(true);
			// non-persisted variants do not have any layer information
			oVariant.getDefinition().layer = "";

			assert.strictEqual(oVariant.isRenameEnabled(), false, "then the boolean for renameEnabled was determined correct");
			assert.strictEqual(oVariant.isEditEnabled(), false, "then the boolean for editEnabled was determined correct");
			assert.strictEqual(oVariant.isDeleteEnabled(), false, "then the boolean for deleteEnabled was determined correct");
		});

		QUnit.test("Given a standard variant and the active layer is CUSTOMER", function(assert) {
			// mocked settings
			Settings._instance = new Settings({
				isPublicLayerAvailable: false
			});

			var oVariant = createVariant({});
			oVariant.setStandardVariant(true);
			// non-persisted variants do not have any layer information
			oVariant.getDefinition().layer = "";

			assert.equal(oVariant.isRenameEnabled(Layer.CUSTOMER), false, "then the boolean for renameEnabled was determined correct");
			assert.equal(oVariant.isEditEnabled(Layer.CUSTOMER), false, "then the boolean for editEnabled was determined correct");
			assert.equal(oVariant.isDeleteEnabled(Layer.CUSTOMER), false, "then the boolean for deleteEnabled was determined correct");
		});

		QUnit.test("Given a standard variant and the active layer is CUSTOMER_BASE", function(assert) {
			// mocked settings
			Settings._instance = new Settings({
				isPublicLayerAvailable: false
			});

			var oVariant = createVariant({});
			oVariant.setStandardVariant(true);
			// non-persisted variants do not have any layer information
			oVariant.getDefinition().layer = "";

			assert.equal(oVariant.isRenameEnabled(Layer.CUSTOMER_BASE), false, "then the boolean for renameEnabled was determined correct");
			assert.equal(oVariant.isEditEnabled(Layer.CUSTOMER_BASE), true, "then the boolean for editEnabled was determined correct");
			assert.equal(oVariant.isDeleteEnabled(Layer.CUSTOMER_BASE), false, "then the boolean for deleteEnabled was determined correct");
		});

		QUnit.test("Given a standard variant and the active layer is VENDOR", function(assert) {
			// mocked settings
			Settings._instance = new Settings({
				isPublicLayerAvailable: false
			});

			var oVariant = createVariant({});
			oVariant.setStandardVariant(true);
			// non-persisted variants do not have any layer information
			oVariant.getDefinition().layer = "";

			assert.equal(oVariant.isRenameEnabled(Layer.VENDOR), false, "then the boolean for renameEnabled was determined correct");
			assert.equal(oVariant.isEditEnabled(Layer.VENDOR), true, "then the boolean for editEnabled was determined correct");
			assert.equal(oVariant.isDeleteEnabled(Layer.VENDOR), false, "then the boolean for deleteEnabled was determined correct");
		});

		aScenarios.forEach(function (mTestSetup) {
			QUnit.test(mTestSetup.testName, function(assert) {
				// mocked settings
				Settings._instance = new Settings(mTestSetup.settings);
				stubCurrentUser(mTestSetup.currentUser);
				if (mTestSetup.sapUiLayerUrlParameter) {
					sandbox.stub(UriParameters, "fromQuery").returns({
						get: function () {
							return mTestSetup.sapUiLayerUrlParameter;
						}
					});
				}

				var oVariant = createVariant(mTestSetup.variant);

				assert.equal(oVariant.isRenameEnabled(), mTestSetup.expectedRenameEnabled, "then the boolean for renameEnabled was determined correct");
				assert.equal(oVariant.isEditEnabled(), mTestSetup.expectedEditEnabled, "then the boolean for editEnabled was determined correct");
				assert.equal(oVariant.isDeleteEnabled(), mTestSetup.expectedDeleteEnabled, "then the boolean for deleteEnabled was determined correct");
			});
		});
	});

	QUnit.module("Given the constructor is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no favorite is provided", function(assert) {
			var oVariant = new CompVariant({});
			assert.equal(oVariant.getFavorite(), false, "then by default it is NOT a favorite");
		});

		QUnit.test("when favorite is set to false", function(assert) {
			var oVariant = new CompVariant({
				favorite: false
			});
			assert.equal(oVariant.getFavorite(), false, "then it is NOT a favorite");
		});
		QUnit.test("when favorite is set to true", function(assert) {
			var oVariant = new CompVariant({
				favorite: true
			});
			assert.equal(oVariant.getFavorite(), true, "then it is a favorite");
		});

		QUnit.test("when favorite is set to false of a VENDOR layer variant", function(assert) {
			var oVariant = new CompVariant({
				layer: Layer.VENDOR,
				favorite: false
			});
			assert.equal(oVariant.getFavorite(), false, "then it is NOT a favorite");
		});

		QUnit.test("when favorite is set to true of a VENDOR layer variant", function(assert) {
			var oVariant = new CompVariant({
				layer: Layer.VENDOR,
				favorite: true
			});
			assert.equal(oVariant.getFavorite(), true, "then it is a favorite");
		});

		QUnit.test("when favorite is not set of a VENDOR layer variant", function(assert) {
			var oVariant = new CompVariant({
				layer: Layer.VENDOR
			});
			assert.equal(oVariant.getFavorite(), true, "then it is a favorite");
		});

		QUnit.test("when favorite is set to false of a CUSTOMER_BASE layer variant", function(assert) {
			var oVariant = new CompVariant({
				layer: Layer.CUSTOMER_BASE,
				favorite: false
			});
			assert.equal(oVariant.getFavorite(), false, "then it is NOT a favorite");
		});

		QUnit.test("when favorite is set to true of a CUSTOMER_BASE layer variant", function(assert) {
			var oVariant = new CompVariant({
				layer: Layer.CUSTOMER_BASE,
				favorite: true
			});
			assert.equal(oVariant.getFavorite(), true, "then it is a favorite");
		});

		QUnit.test("when favorite is not set of a CUSTOMER_BASE layer variant", function(assert) {
			var oVariant = new CompVariant({
				layer: Layer.CUSTOMER_BASE
			});
			assert.equal(oVariant.getFavorite(), true, "then it is a favorite");
		});

		QUnit.test("when no executeOnSelect or executeOnSelection is provided", function(assert) {
			var oVariant = new CompVariant({});
			assert.equal(oVariant.getExecuteOnSelection(), false, "then by default it is NOT executed on selection");
		});

		QUnit.test("when content.executeOnSelect is set to false", function(assert) {
			var oVariant = new CompVariant({
				content: {
					executeOnSelect: false
				}
			});
			assert.equal(oVariant.getExecuteOnSelection(), false, "then it is NOT executed on selection");
		});

		QUnit.test("when content.executeOnSelect is set to true", function(assert) {
			var oVariant = new CompVariant({
				content: {
					executeOnSelect: true
				}
			});
			assert.equal(oVariant.getExecuteOnSelection(), true, "then it is NOT executed on selection");
		});

		QUnit.test("when content.executeOnSelection is set to false", function(assert) {
			var oVariant = new CompVariant({
				content: {
					executeOnSelection: false
				}
			});
			assert.equal(oVariant.getExecuteOnSelection(), false, "then it is NOT executed on selection");
		});

		QUnit.test("when content.executeOnSelection is set to true", function(assert) {
			var oVariant = new CompVariant({
				content: {
					executeOnSelection: true
				}
			});
			assert.equal(oVariant.getExecuteOnSelection(), true, "then it is NOT executed on selection");
		});

		QUnit.test("when executeOnSelection is set to false", function(assert) {
			var oVariant = new CompVariant({
				executeOnSelection: false
			});
			assert.equal(oVariant.getExecuteOnSelection(), false, "then it is NOT executed on selection");
		});

		QUnit.test("when executeOnSelection is set to true", function(assert) {
			var oVariant = new CompVariant({
				executeOnSelection: true
			});
			assert.equal(oVariant.getExecuteOnSelection(), true, "then it is NOT executed on selection");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
