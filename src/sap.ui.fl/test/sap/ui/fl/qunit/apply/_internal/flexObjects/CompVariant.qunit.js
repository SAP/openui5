/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/Layer",
	"sap/ui/fl/qunit/apply/_internal/flexObjects/getFlexObjectFileContent",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	Settings,
	CompVariant,
	FlexObjectFactory,
	States,
	Layer,
	getFlexObjectFileContent,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given sap.ui.fl.apply._internal.flexObjects.CompVariant.constructor is called", {
		afterEach() {
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
	});

	function createVariantTestData(oVariantData) {
		return merge(
			getFlexObjectFileContent(),
			{
				fileType: "variant",
				fileName: "testVariant_123",
				namespace: "testNamespace"
			},
			oVariantData
		);
	}

	QUnit.module("Given 'CompVariant' created by FlexObjectFactory.createCompVariant", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no executeOnSelect or executeOnSelection is provided", function(assert) {
			var oVariant = FlexObjectFactory.createCompVariant({});
			assert.equal(oVariant.getExecuteOnSelection(), false, "then by default it is NOT executed on selection");
		});

		QUnit.test("when content.executeOnSelect is set to false", function(assert) {
			var oVariant = FlexObjectFactory.createCompVariant({
				content: {
					executeOnSelect: false
				}
			});
			assert.equal(oVariant.getExecuteOnSelection(), false, "then it is NOT executed on selection");
		});

		QUnit.test("when content.executeOnSelect is set to true", function(assert) {
			var oVariant = FlexObjectFactory.createCompVariant({
				content: {
					executeOnSelect: true
				}
			});
			assert.equal(oVariant.getExecuteOnSelection(), true, "then it is NOT executed on selection");
		});

		QUnit.test("when content.executeOnSelection is set to false", function(assert) {
			var oVariant = FlexObjectFactory.createCompVariant({
				content: {
					executeOnSelection: false
				}
			});
			assert.equal(oVariant.getExecuteOnSelection(), false, "then it is NOT executed on selection");
		});

		QUnit.test("when content.executeOnSelection is set to true", function(assert) {
			var oVariant = FlexObjectFactory.createCompVariant({
				content: {
					executeOnSelection: true
				}
			});
			assert.equal(oVariant.getExecuteOnSelection(), true, "then it is NOT executed on selection");
		});

		QUnit.test("when executeOnSelection is set to false", function(assert) {
			var oVariant = FlexObjectFactory.createCompVariant({
				executeOnSelection: false
			});
			assert.equal(oVariant.getExecuteOnSelection(), false, "then it is NOT executed on selection");
		});

		QUnit.test("when executeOnSelection is set to true", function(assert) {
			var oVariant = FlexObjectFactory.createCompVariant({
				executeOnSelection: true
			});
			assert.equal(oVariant.getExecuteOnSelection(), true, "then it is NOT executed on selection");
		});

		QUnit.test("when 'getMappingInfo' is called", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({});
			assert.strictEqual(
				oCompVariant.getMappingInfo().persistencyKey,
				"selector.persistencyKey",
				"the persistencyKey is returned inside the 'selector' structure"
			);
		});

		QUnit.test("when 'getPackage' is called", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({
				packageName: "my-package-name"
			});
			assert.strictEqual(oCompVariant.getPackage(), "my-package-name", "then package name is returned");
		});

		QUnit.test("when 'isVariant' is called", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({});
			assert.strictEqual(oCompVariant.isVariant(), true, "then it returns true");
		});

		QUnit.test("when 'storeFavorite' is set to true", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({});
			oCompVariant.setState(States.LifecycleState.PERSISTED);
			oCompVariant.storeFavorite(true);
			assert.strictEqual(oCompVariant.getFavorite(), true, "then after setter is called, getFavorite returns 'true'");
			assert.strictEqual(oCompVariant.getState(), States.LifecycleState.UPDATED, "then the comp variant state is 'updated'");
		});

		QUnit.test("when 'getOwnerId' is called", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({
				support: {
					user: "testuser"
				}
			});
			assert.strictEqual(oCompVariant.getOwnerId(), "testuser", "then ownerId is returned");
		});

		QUnit.test("when 'storeContent' is called", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({});
			oCompVariant.storeContent({
				specialContent: "my-test-content"
			});
			assert.strictEqual(oCompVariant.getContent().specialContent, "my-test-content", "then content is stored into comp variant");
		});

		QUnit.test("when 'storeVisible' is called", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({});
			oCompVariant.storeVisible(true);
			assert.ok(oCompVariant.getVisible(), "then visible is stored into comp variant");
			oCompVariant.storeVisible(false);
			assert.notOk(oCompVariant.getVisible(), "then visible is stored into comp variant");
		});

		QUnit.test("when 'storeExecuteOnSelection' is called", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({});
			oCompVariant.setState(States.LifecycleState.PERSISTED);
			oCompVariant.storeExecuteOnSelection(true);
			assert.strictEqual(oCompVariant.getExecuteOnSelection(), true, "then after setter is called, getExecuteOnSelection returns 'true'");
			assert.strictEqual(oCompVariant.getState(), States.LifecycleState.UPDATED, "then the comp variant state is 'updated'");
		});

		QUnit.test("when 'storeName' is called", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({});
			oCompVariant.setState(States.LifecycleState.PERSISTED);
			oCompVariant.storeName("test-variant-name");
			assert.strictEqual(oCompVariant.getName(), "test-variant-name", "then after setter is called, getName returns stored name");
			assert.strictEqual(oCompVariant.getState(), States.LifecycleState.UPDATED, "then the comp variant state is 'updated'");
		});

		QUnit.test("when 'storeContexts' is called", function(assert) {
			var oCompVariant = FlexObjectFactory.createCompVariant({});
			oCompVariant.setState(States.LifecycleState.PERSISTED);
			assert.notOk(oCompVariant.hasContexts(), "the comp variant has contexts");
			oCompVariant.storeContexts({
				test: "test"
			});
			assert.ok(oCompVariant.hasContexts(), "the comp variant has contexts");
			assert.strictEqual(oCompVariant.getContexts().test, "test", "then after setter is called, getContexts returns contexts");
			assert.strictEqual(oCompVariant.getState(), States.LifecycleState.UPDATED, "then the comp variant state is 'updated'");
		});

		QUnit.test("when new variant is initialized including both name and variant id parameters", function(assert) {
			this.mFileContent = {
				variantId: "variant-id"
			};
			var oBaseVariant = FlexObjectFactory.createFromFileContent(this.mFileContent, CompVariant);
			assert.strictEqual(oBaseVariant.getVariantId(), "variant-id", "then the variant id is set correctly");
		});

		QUnit.test("when 'cloneFileContentWithNewId' is called", function(assert) {
			this.mFileContent = {
				variantId: "variant-id"
			};
			var oBaseVariant = FlexObjectFactory.createFromFileContent(this.mFileContent, CompVariant);
			var oCopiedCompVariantContent = oBaseVariant.cloneFileContentWithNewId();
			var oCopiedCompVariant = FlexObjectFactory.createFromFileContent(oCopiedCompVariantContent);

			assert.strictEqual(oBaseVariant.getSupportInformation().user, oCopiedCompVariant.getSupportInformation().user, "the user is properly set");
			assert.strictEqual(oBaseVariant.getSupportInformation().generator, oCopiedCompVariant.getSupportInformation().generator, "the generator is properly set");
			assert.strictEqual(oBaseVariant.getFlexObjectMetadata().reference, oCopiedCompVariant.getFlexObjectMetadata().reference, "the reference is properly set");
			assert.strictEqual(oBaseVariant.getName(), oCopiedCompVariant.getName(), "the variant name is properly set");
			assert.strictEqual(oBaseVariant.getLayer(), oCopiedCompVariant.getLayer(), "the layer is properly set");
			assert.notStrictEqual(oBaseVariant.getId(), oCopiedCompVariant.getId(), "the Id is properly set");
			assert.notStrictEqual(oBaseVariant.getVariantId(), oCopiedCompVariant.getVariantId(), "the variantId is properly set");
			assert.deepEqual(oBaseVariant.getContexts(), oCopiedCompVariant.getContexts(), "the contexts are properly set");
		});
	});

	var aScenarios = [{
		testName: "and a variant in the USER layer",
		// testing more is not mandatory since the USER is never transported
		variant: {
			layer: Layer.USER,
			originalLanguage: "EN",
			support: { user: undefined },
			sourceSystem: undefined,
			sourceClient: undefined
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
			support: { user: "FRANK" },
			originalLanguage: "EN",
			sourceSystem: undefined,
			sourceClient: undefined
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
			support: { user: "FRANK" },
			originalLanguage: "EN",
			sourceSystem: undefined,
			sourceClient: undefined
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
			originalLanguage: "EN",
			sourceSystem: undefined,
			sourceClient: undefined
		},
		settings: {
			isPublicLayerAvailable: true // testing the = false option is not a real case since the variant was written into it
		},
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true
	}, {
		testName: ", a variant in the PUBLIC layer and its owner could not be determined",
		variant: {
			layer: Layer.PUBLIC,
			user: "",
			originalLanguage: "EN",
			sourceSystem: undefined,
			sourceClient: undefined
		},
		settings: {
			isPublicLayerAvailable: true // testing the = false option is not a real case since the variant was written into it
		},
		currentUser: "FRANK",
		expectedEditEnabled: true,
		expectedDeleteEnabled: true,
		expectedRenameEnabled: true
	}, {
		testName: ", a variant in the PUBLIC layer and the user is NOT its author but a key user",
		variant: {
			layer: Layer.PUBLIC,
			user: "FRANK",
			originalLanguage: "EN",
			sourceSystem: undefined,
			sourceClient: undefined
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
			originalLanguage: "EN",
			support: { user: undefined }
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
			support: { user: "FRANK" },
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
			support: { user: "FRANK" },
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
			support: { user: "FRANK" },
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
			support: { user: "FRANK" },
			originalLanguage: "EN",
			sourceSystem: undefined,
			sourceClient: undefined
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
			support: { user: "FRANK" }, // to test case sensitivity
			originalLanguage: "EN",
			sourceSystem: undefined,
			sourceClient: undefined
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
			support: { user: "FRANK" },
			originalLanguage: "EN",
			sourceSystem: undefined,
			sourceClient: undefined
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
			support: { user: "FRANK" },
			originalLanguage: "EN",
			sourceSystem: undefined,
			sourceClient: undefined
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
		var mVariantData = createVariantTestData(oVariantData);
		var oVariant = FlexObjectFactory.createCompVariant(mVariantData);
		return oVariant;
	}

	QUnit.module("Given isEditEnabled/isRenameEnabled/isDeleteEnabled is called", {
		afterEach() {
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
			oVariant.setLayer("");

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
			oVariant.setLayer("");

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
			oVariant.setLayer("");

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
			oVariant.setLayer("");

			assert.equal(oVariant.isRenameEnabled(Layer.VENDOR), false, "then the boolean for renameEnabled was determined correct");
			assert.equal(oVariant.isEditEnabled(Layer.VENDOR), true, "then the boolean for editEnabled was determined correct");
			assert.equal(oVariant.isDeleteEnabled(Layer.VENDOR), false, "then the boolean for deleteEnabled was determined correct");
		});

		QUnit.test("Given settings instance is undefined", function(assert) {
			// mocked settings
			Settings._instance = undefined;

			var oVariant = createVariant({});
			oVariant.setStandardVariant(true);
			// non-persisted variants do not have any layer information
			oVariant.setLayer("");

			assert.equal(oVariant.isRenameEnabled(Layer.VENDOR), false, "then the boolean for renameEnabled was determined correct");
			assert.equal(oVariant.isEditEnabled(Layer.VENDOR), true, "then the boolean for editEnabled was determined correct");
			assert.equal(oVariant.isDeleteEnabled(Layer.VENDOR), false, "then the boolean for deleteEnabled was determined correct");
		});

		aScenarios.forEach(function(mTestSetup) {
			QUnit.test(mTestSetup.testName, function(assert) {
				// mocked settings
				Settings._instance = new Settings(mTestSetup.settings);
				stubCurrentUser(mTestSetup.currentUser);
				if (mTestSetup.sapUiLayerUrlParameter) {
					sandbox.stub(URLSearchParams.prototype, "get").returns(
						mTestSetup.sapUiLayerUrlParameter
					);
				}

				var oVariant = createVariant(mTestSetup.variant);

				assert.equal(oVariant.isRenameEnabled(), mTestSetup.expectedRenameEnabled, "then the boolean for renameEnabled was determined correct");
				assert.equal(oVariant.isEditEnabled(), mTestSetup.expectedEditEnabled, "then the boolean for editEnabled was determined correct");
				assert.equal(oVariant.isDeleteEnabled(), mTestSetup.expectedDeleteEnabled, "then the boolean for deleteEnabled was determined correct");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});