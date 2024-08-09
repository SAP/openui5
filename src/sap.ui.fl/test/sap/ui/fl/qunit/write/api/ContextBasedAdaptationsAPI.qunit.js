/* global QUnit */
sap.ui.define([
	"sap/base/util/deepClone",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Control",
	"sap/ui/core/Lib",
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	deepClone,
	LoaderExtensions,
	Control,
	Lib,
	Manifest,
	URLHandler,
	VariantManagementState,
	FlexState,
	ManifestUtils,
	FlexInfoSession,
	InitialStorage,
	Version,
	Settings,
	VariantModel,
	FlexObjectManager,
	Storage,
	Versions,
	ContextBasedAdaptationsAPI,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Layer,
	LayerUtils,
	Utils,
	JSONModel,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	var sandbox = sinon.createSandbox();

	function stubSettings(sandbox) {
		sandbox.stub(Settings, "getInstance").resolves({
			isContextBasedAdaptationEnabled() {
				return true;
			},
			isSystemWithTransports() {
				return false;
			},
			isVariantAuthorNameAvailable() {
				return false;
			}
		});
	}

	function verifyVariantsAndChanges(assert, oOriginal, oCopy, bIsControlVariant, bIsChange, aMappedVariantIds) {
		assert.strictEqual(oCopy.changeType, oOriginal.getChangeType(), "there is the same change type");
		assert.notStrictEqual(oCopy.fileName, oOriginal.getId(), "there is a different filename");
		assert.strictEqual(oCopy.fileType, oOriginal.getFileType(), "there is the same file type");
		assert.strictEqual(oCopy.layer, Layer.CUSTOMER, "we have the layer as CUSTOMER");
		assert.strictEqual(oCopy.namespace, oOriginal.getNamespace(), "there is the same name space");
		assert.strictEqual(oCopy.originalLanguage, oOriginal.getSupportInformation().originalLanguage, "there is the same original language");
		assert.strictEqual(oCopy.projectId, oOriginal.getFlexObjectMetadata().projectId, "there is the same project id");
		assert.strictEqual(oCopy.reference, oOriginal.getFlexObjectMetadata().reference, "there is the same reference");

		assert.strictEqual(oCopy.support.clonedFrom, oOriginal.getId(), "there is the same change type");
		if (oOriginal.getSupportInformation().user) {
			assert.strictEqual(oCopy.support.generator, oOriginal.getSupportInformation().generator, "there is the same generator");
			assert.strictEqual(oCopy.support.sapui5Version, oOriginal.getSupportInformation().sapui5Version, "there is the same sapui5Version");
		} else {
			assert.deepEqual(oOriginal.getSupportInformation(), oCopy.support, "there is the same support data");
		}

		var oOriginalTexts = oOriginal.getTexts();
		assert.deepEqual(oOriginalTexts, oCopy.texts, "there is the same texts object");
		assert.notStrictEqual(oOriginalTexts.variantName && oOriginalTexts.variantName.value, "Standard VENDOR", "Must never copy VENDOR variant");

		var oOrigContent = oOriginal.getContent();
		var oCopyContent = oCopy.content;

		if (bIsChange) {
			if (oCopy.selector.variantId) {
				assert.strictEqual(oCopy.selector.persistencyKey, oOriginal.getSelector().persistencyKey, "there is the same persistencyKey");
				assert.notStrictEqual(oCopy.selector.variantId, oOriginal.getSelector().variantId, "there is not the same variantId");
			}
			if (oCopyContent.defaultVariantName) { // V2 default change
				if (oOrigContent.defaultVariantName === "id_1676895725424_1469_page") {
					assert.equal(oCopyContent.defaultVariantName, oOrigContent.defaultVariantName, "set default content still points to not copied variant from VENDOR");
				} else {
					assert.ok(aMappedVariantIds[oOrigContent.defaultVariantName], "set Default change has a mapped variant");
					assert.notStrictEqual(oCopyContent.defaultVariantName, oOrigContent.defaultVariantName, "there is not the same defaultVariantName");
					assert.equal(oCopyContent.defaultVariantName, aMappedVariantIds[oOrigContent.defaultVariantName], "set default change mapped to created variant");
				}
			} else if (oCopyContent.defaultVariant) { // V4 default change
				if (oOrigContent.defaultVariant === "id_1676895342319_007_flVariant") {
					assert.equal(oCopyContent.defaultVariant, oOrigContent.defaultVariant, "set default content still points to not copied variant from VENDOR");
				} else {
					assert.ok(aMappedVariantIds[oOrigContent.defaultVariant], "set Default change has a mapped variant");
					assert.notStrictEqual(oCopyContent.defaultVariant, oOrigContent.defaultVariant, "set default content remapped for copied variant from CUSTOMER");
					assert.equal(oCopyContent.defaultVariant, aMappedVariantIds[oOrigContent.defaultVariant], "set default change mapped to created variant");
				}
			} else {
				assert.notOk(oCopyContent.contexts, "there is no contexts set on views");
				assert.deepEqual(oCopyContent, oOrigContent, "there is the same content object");
			}
			assert.deepEqual(oCopy.dependentSelector, oOriginal.getDependentSelectors(), "there is the same dependentSelector");
		} else {
			assert.strictEqual(oOriginal.getExecuteOnSelection(), oCopy.executeOnSelection, "there is the same executeOnSelection value");
			assert.strictEqual(oOriginal.getFavorite(), oCopy.favorite, "there is the same favorite value");
			assert.notStrictEqual(oOriginal.getVariantId(), oCopy.variantId, "there is the same variant id");
			assert.deepEqual(oOrigContent, oCopyContent, "there is the same content");
			assert.deepEqual(oCopy.contexts, {}, "the context is empty");
			if (bIsControlVariant) {
				assert.strictEqual(oOriginal.getVariantManagementReference(), oCopy.variantManagementReference, "there is the correct variant management reference");
				assert.notStrictEqual(oCopy.fileName, oCopy.variantReference, "variant reference does not refer to itself");
				assert.strictEqual(oOriginal.getVariantReference(), oCopy.variantReference, "there is the correct variant reference");
			} else {
				assert.deepEqual(oOriginal.getPersistencyKey(), oCopy.selector.persistencyKey, "there is the same selector");
			}
		}
	}

	function findVariantAndVerify(assert, aOriginals, aCopiedChanges, bIsControlVariant, aMappedVariantIds) {
		aOriginals.forEach(function(oOriginal) {
			var oCopy = aCopiedChanges.find(function(oCopiedChange) {
				return oCopiedChange.support.clonedFrom === oOriginal.getId();
			});
			aMappedVariantIds[oOriginal.sId] = oCopy.fileName;
			assert.ok(oCopy !== undefined, "the correct copied comp variant is found");
			verifyVariantsAndChanges(assert, oOriginal, oCopy, bIsControlVariant, false, {});
		});
	}

	function verifyChangesAreCopiedCorrectly(aCopiedChangeDefinitions, assert) {
		return FlexObjectManager.getFlexObjects({ selector: this.mPropertyBag.control, invalidateCache: false, includeCtrlVariants: true, includeDirtyChanges: true })
		.then(function(aFlexObjects) {
			var aCustomerFlexObjects = LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(aFlexObjects, Layer.CUSTOMER);
			assert.strictEqual(aCustomerFlexObjects.length, aCopiedChangeDefinitions.length, "we have the length of objects");
			var bIsAdaptationIdAdded = aCopiedChangeDefinitions.every(function(oCopiedChange) {
				return oCopiedChange.adaptationId;
			});
			assert.ok(bIsAdaptationIdAdded, "adaptation id is added to every change/variant");
			var sVariant = "sap.ui.fl.apply._internal.flexObjects.Variant";
			var sFLVariant = "sap.ui.fl.apply._internal.flexObjects.FlVariant";
			var sCompVariant = "sap.ui.fl.apply._internal.flexObjects.CompVariant";
			var aCompVariants = aCustomerFlexObjects.filter(function(oFlexObject) { return oFlexObject.isA(sCompVariant); });
			var aControlVariants = aCustomerFlexObjects.filter(function(oFlexObject) { return oFlexObject.isA(sFLVariant); });
			var aChanges = aCustomerFlexObjects.filter(function(oFlexObject) {
				return !oFlexObject.isA(sVariant);
			});
			var aMappedVariantIds = {};
			findVariantAndVerify(assert, aCompVariants, aCopiedChangeDefinitions, false, aMappedVariantIds);
			findVariantAndVerify(assert, aControlVariants, aCopiedChangeDefinitions, true, aMappedVariantIds);
			aChanges.forEach(function(oChange) {
				var oCopiedChange = aCopiedChangeDefinitions.find(function(oCopiedChange) {
					return oCopiedChange.support.clonedFrom === oChange.getId();
				});
				verifyVariantsAndChanges(assert, oChange, oCopiedChange, false, true, aMappedVariantIds);
			});
		});
	}

	QUnit.module("Given ContextBasedAdaptationsAPI.initialize is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
			ContextBasedAdaptationsAPI.clearInstances();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when not supported layer is provided", function(assert) {
			this.mPropertyBag.layer = "VENDOR";
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return Version.Number.Draft;
				}
			});
			var aReturnedVersions = [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oLoadStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: []});

			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				assert.equal(oLoadStub.callCount, 0, "contextBasedAdaptations.load was called once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
				assert.deepEqual(oModel.getData(), {
					allAdaptations: [],
					adaptations: [],
					count: 0,
					displayedAdaptation: {},
					contextBasedAdaptationsEnabled: false
				}, "then the model was initialized with correct content");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and a draft exists, FlexInfo refers to not existing adaptation", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.test.app");
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty(sProperty) {
					return (sProperty === "/persistedVersion") ? Version.Number.Draft : undefined;
				}
			});
			var aReturnedVersions = [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			sandbox.stub(FlexInfoSession, "getByReference").returns({adaptationId: "not_existing" });
			var oLoadStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: [
				{ id: "id-1591275572834-1", type: "" },
				{ id: "id-1591275572835-1", type: "" },
				{ id: "DEFAULT", type: "DEFAULT" }
			]});

			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				assert.strictEqual(oLoadStub.callCount, 1, "contextBasedAdaptations.load was called once");
				var oArgs = oLoadStub.getCall(0).args[0];
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.version, "0", "then the correct version is set");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
				assert.deepEqual(oModel.getData(), {
					allAdaptations: [
						{ id: "id-1591275572834-1", type: "", rank: 1 },
						{ id: "id-1591275572835-1", type: "", rank: 2 },
						{ id: "DEFAULT", type: "DEFAULT", rank: 3 }
					],
					adaptations: [
						{ id: "id-1591275572834-1", type: "", rank: 1 },
						{ id: "id-1591275572835-1", type: "", rank: 2 }
					],
					count: 2,
					displayedAdaptation: { id: "id-1591275572834-1", type: "", rank: 1 },
					contextBasedAdaptationsEnabled: true
				}, "then the model was initialized with correct content, highest ranked adaptation as displayed");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and a draft does not exists, FlexInfo refers to existing adaptation", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty(sProperty) {
					return (sProperty === "/persistedVersion") ? "1" : undefined;
				}
			});
			var aReturnedVersions = [
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			sandbox.stub(FlexInfoSession, "getByReference").returns({adaptationId: "id-1591275572835-1" });
			var oLoadStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: [
				{ id: "id-1591275572834-1", type: "" },
				{ id: "id-1591275572835-1", type: "" },
				{ id: "DEFAULT", type: "DEFAULT" }
			]});

			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				assert.equal(oLoadStub.callCount, 1, "contextBasedAdaptations.load was called once");
				var oArgs = oLoadStub.getCall(0).args[0];
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.version, "1", "then the correct version is set");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
				assert.deepEqual(oModel.getData(), {
					allAdaptations: [
						{ id: "id-1591275572834-1", type: "", rank: 1 },
						{ id: "id-1591275572835-1", type: "", rank: 2},
						{ id: "DEFAULT", type: "DEFAULT", rank: 3 }
					],
					adaptations: [
						{ id: "id-1591275572834-1", type: "", rank: 1 },
						{ id: "id-1591275572835-1", type: "", rank: 2 }
					],
					count: 2,
					displayedAdaptation: { id: "id-1591275572835-1", type: "", rank: 2 },
					contextBasedAdaptationsEnabled: true
				}, "then the model was initialized with correct content, displayed adaptation is restored from FlexInfo");
			}.bind(this));
		});

		QUnit.test("when initialize is called twice within the same session all parameters", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty(sProperty) {
					return (sProperty === "/persistedVersion") ? "1" : undefined;
				}
			});
			var aReturnedVersions = [
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oLoadStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: [{ id: "DEFAULT", type: "DEFAULT" }]});

			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				assert.strictEqual(oLoadStub.callCount, 1, "contextBasedAdaptations.load was called once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
				return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag);
			}.bind(this)).then(function(oModel) {
				assert.equal(oLoadStub.callCount, 1, "contextBasedAdaptations.load was still called only once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.createModel is called", {
		beforeEach() {
			this.oDefaultAdaptation = {
				id: "DEFAULT",
				contexts: {},
				title: "",
				description: "",
				createdBy: "",
				createdAt: "",
				changedBy: "",
				changedAt: "",
				type: "DEFAULT"
			};
			this.oExpectedFilledData = {
				allAdaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022",
						type: ""
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022",
						type: ""
					},
					this.oDefaultAdaptation
				],
				adaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022",
						type: "",
						rank: 1
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022",
						type: "",
						rank: 2
					}
				],
				count: 2,
				displayedAdaptation: {
					id: "id-1591275572834-1",
					contexts: {
						role: ["SALES"]
					},
					title: "German Admin",
					description: "ACH Admin for Germany",
					createdBy: "Test User 1",
					createdAt: "May 25, 2022",
					changedBy: "Test User 1",
					changedAt: "May 27, 2022",
					type: "",
					rank: 1
				},
				contextBasedAdaptationsEnabled: true
			};
			this.oExpectedEmptyData = {
				allAdaptations: [this.oDefaultAdaptation],
				adaptations: [],
				count: 0,
				displayedAdaptation: {
					changedAt: "",
					changedBy: "",
					contexts: {},
					createdAt: "",
					createdBy: "",
					description: "",
					id: "DEFAULT",
					rank: 1,
					title: "",
					type: "DEFAULT"
				},
				contextBasedAdaptationsEnabled: true
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when nothing is provided", function(assert) {
			assert.throws(function() {
				ContextBasedAdaptationsAPI.createModel();
			}, new Error("Adaptations model can only be initialized with an array of adaptations"), "then adaptation model cannot be initialized and throws error");
		});

		QUnit.test("when only default adaptation is provided", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedEmptyData.allAdaptations, this.oDefaultAdaptation, true);
			assert.deepEqual(oModel.getData(), this.oExpectedEmptyData, "then the adaptations model is created correctly with empty values");
		});

		QUnit.test("when a filled list of adaptations is provided", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
		});

		QUnit.test("when an empty list of adaptations is initialized and later updated with 2 adaptations", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedEmptyData.allAdaptations, this.oExpectedEmptyData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedEmptyData, "then the adaptations model is created correctly with empty values");
			oModel.updateAdaptations(this.oExpectedFilledData.allAdaptations);
			oModel.switchDisplayedAdaptation(this.oExpectedFilledData.allAdaptations[0].id);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when an empty list of adaptations is initialized and later 1 adaptation is inserted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedEmptyData.allAdaptations, this.oExpectedEmptyData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedEmptyData, "then the adaptations model is created correctly with empty values");
			var oNewAdaptation = {
				id: "id-1591275572999-1",
				priority: 0,
				contexts: {
					role: ["SALES"]
				},
				title: "German Admin"
			};
			var oExpectedInsertedData = {allAdaptations: [oNewAdaptation, this.oDefaultAdaptation], adaptations: [oNewAdaptation], count: 1, displayedAdaptation: oNewAdaptation, contextBasedAdaptationsEnabled: true};
			oModel.insertAdaptation(oNewAdaptation);
			oModel.switchDisplayedAdaptation(oNewAdaptation.id);
			assert.deepEqual(oModel.getData(), oExpectedInsertedData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later 1 adaptation is inserted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oNewAdaptation = {
				id: "id-1591275572999-1",
				priority: 1,
				contexts: {
					role: ["ADMIN"]
				},
				title: "IT Chief Admin"
			};
			var oExpectedNewAdaptation = {
				id: "id-1591275572999-1",
				contexts: {
					role: ["ADMIN"]
				},
				title: "IT Chief Admin",
				rank: 2
			};

			var oAdaptation1 = this.oExpectedFilledData.adaptations[0];
			var oAdaptation2 = deepClone(this.oExpectedFilledData.adaptations[1]);
			// rank is expected to increase as a new adaptation is inserted in between
			oAdaptation2.rank = 3;
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation1, oExpectedNewAdaptation, oAdaptation2, this.oDefaultAdaptation],
				adaptations: [oAdaptation1, oExpectedNewAdaptation, oAdaptation2],
				count: 3,
				displayedAdaptation: oExpectedNewAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			oModel.insertAdaptation(oNewAdaptation);
			oModel.switchDisplayedAdaptation(oNewAdaptation.id);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the first adaptation is deleted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation = deepClone(this.oExpectedFilledData.adaptations[1]);
			// rank is expected to decrease as the leading adaptation is deleted
			oAdaptation.rank = 1;
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation, this.oDefaultAdaptation],
				adaptations: [oAdaptation],
				count: 1,
				displayedAdaptation: oAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			var sDisplayedAdaptationId = oModel.deleteAdaptation();
			oModel.switchDisplayedAdaptation(sDisplayedAdaptationId);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
			assert.strictEqual(sDisplayedAdaptationId, oAdaptation.id, "then the correct adaptationId for switch is returned");
		});

		QUnit.test("when a list of adaptations is initialized and later the last adaptation is deleted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation = this.oExpectedFilledData.adaptations[0];
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation, this.oDefaultAdaptation],
				adaptations: [oAdaptation],
				count: 1,
				displayedAdaptation: oAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			oModel.switchDisplayedAdaptation("id-1591275572835-1");
			var sDisplayedAdaptationId = oModel.deleteAdaptation();
			oModel.switchDisplayedAdaptation(sDisplayedAdaptationId);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
			assert.strictEqual(sDisplayedAdaptationId, oAdaptation.id, "then the correct adaptationId for switch is returned");
		});

		QUnit.test("when a list of adaptations is initialized and later an adaptation is created in the middle and then deleted again", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation1 = this.oExpectedFilledData.adaptations[0];
			var oAdaptation2 = this.oExpectedFilledData.adaptations[1];
			var oNewAdaptation3 = {
				id: "id-1591275512345-1",
				priority: 1,
				contexts: {
					role: ["HR_PARTNER"]
				},
				title: "HR Business Partner"
			};
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation1, oAdaptation2, this.oDefaultAdaptation],
				adaptations: [oAdaptation1, oAdaptation2],
				count: 2,
				displayedAdaptation: oAdaptation2,
				contextBasedAdaptationsEnabled: true
			};
			oModel.insertAdaptation(oNewAdaptation3);
			oModel.switchDisplayedAdaptation(oNewAdaptation3.id);
			var sDisplayedAdaptationId = oModel.deleteAdaptation();
			oModel.switchDisplayedAdaptation(sDisplayedAdaptationId);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
			assert.strictEqual(sDisplayedAdaptationId, oAdaptation2.id, "then the correct adaptationId for switch is returned");
		});

		QUnit.test("when a list of adaptations is initialized and later all adaptations are deleted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oExpectedFilledData = {
				allAdaptations: [this.oDefaultAdaptation],
				adaptations: [],
				count: 0,
				displayedAdaptation: this.oDefaultAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			oModel.deleteAdaptation();
			var sDisplayedAdaptationId = oModel.deleteAdaptation();
			oModel.switchDisplayedAdaptation(sDisplayedAdaptationId);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the displayed adaptation is moved to another rank (reorder)", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oExpectedDisplayedAdaptation = deepClone(this.oExpectedFilledData.adaptations[0]);
			oExpectedDisplayedAdaptation.rank = 2;
			var aReorderAdaptations = [
				this.oExpectedFilledData.adaptations[1],
				this.oExpectedFilledData.adaptations[0],
				this.oDefaultAdaptation
			];
			oModel.updateAdaptations(aReorderAdaptations);
			assert.deepEqual(oModel.getProperty("/displayedAdaptation"), oExpectedDisplayedAdaptation, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the displayed adaptation is switched", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oExpectedDisplayedAdaptation = this.oExpectedFilledData.adaptations[1];
			oModel.switchDisplayedAdaptation("id-1591275572835-1");
			assert.deepEqual(oModel.getProperty("/displayedAdaptation"), oExpectedDisplayedAdaptation, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the displayed adaptation is switched to the context-free adaptation", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			oModel.switchDisplayedAdaptation("DEFAULT");
			assert.deepEqual(oModel.getProperty("/displayedAdaptation"), this.oDefaultAdaptation, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the displayed adaptation is updated", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation1 = deepClone(this.oExpectedFilledData.adaptations[0]);
			oAdaptation1.rank = 2;
			var oUpdatedAdaptation = deepClone(this.oExpectedFilledData.adaptations[1]);
			oUpdatedAdaptation.title = "DLM Main Pilot";
			oUpdatedAdaptation.contexts = {
				role: ["MAIN_PILOT"]
			};
			oUpdatedAdaptation.rank = 1;
			var oExpectedFilledData = {
				allAdaptations: [oUpdatedAdaptation, oAdaptation1, this.oDefaultAdaptation],
				adaptations: [oUpdatedAdaptation, oAdaptation1],
				count: 2,
				displayedAdaptation: oUpdatedAdaptation,
				contextBasedAdaptationsEnabled: true
			};
			var oContextBasedAdaptation = {
				adaptationId: oUpdatedAdaptation.id,
				title: oUpdatedAdaptation.title,
				contexts: oUpdatedAdaptation.contexts,
				priority: 0
			};
			oModel.switchDisplayedAdaptation("id-1591275572835-1");
			oModel.updateAdaptationContent(oContextBasedAdaptation, "id-1591275572835-1");
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and getIndexByAdaptationId is called", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations, this.oExpectedFilledData.allAdaptations[0], true);
			assert.strictEqual(oModel.getIndexByAdaptationId("id-1591275572834-1"), 0, "then the correct index is returned");
			assert.strictEqual(oModel.getIndexByAdaptationId("id-1591275572835-1"), 1, "then the correct index is returned");
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.getAdaptationsModel is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
			ContextBasedAdaptationsAPI.clearInstances();
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			delete this.mPropertyBag.control;
			assert.throws(function() {
				ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
			}, new Error("No control was provided"), "then the correct error message is returned");
		});

		QUnit.test("when no layer is provided", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			delete this.mPropertyBag.layer;
			assert.throws(function() {
				ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
			}, new Error("No layer was provided"), "then the correct error message is returned");
		});

		QUnit.test("when a control and a layer were provided and adaptations model was not initialized", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);

			assert.throws(function() {
				ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
			}, new Error("Adaptations model for reference 'com.sap.test.app' and layer 'CUSTOMER' were not initialized."), "then the correct error message is returned");
		});

		QUnit.test("when a control and a layer were provided and empty adaptations model was initialized", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			var oExpectedFilledData = {
				allAdaptations: [
					{
						id: "DEFAULT",
						contexts: {},
						title: "",
						description: "",
						createdBy: "",
						createdAt: "",
						changedBy: "",
						changedAt: "",
						type: "DEFAULT"
					}
				],
				adaptations: [],
				count: 0,
				displayedAdaptation: {
					changedAt: "",
					changedBy: "",
					contexts: {},
					createdAt: "",
					createdBy: "",
					description: "",
					id: "DEFAULT",
					rank: 1,
					title: "",
					type: "DEFAULT"
				},
				contextBasedAdaptationsEnabled: true
			};
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: oExpectedFilledData.allAdaptations});
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function() {
				assert.ok(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is an adaptations model for this reference and layer");
				var oModel = ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is returned with initialized values");
				assert.strictEqual(ContextBasedAdaptationsAPI.getDisplayedAdaptationId(this.mPropertyBag), undefined, "displayed default adaptation id is undefined");
				assert.notOk(ContextBasedAdaptationsAPI.adaptationExists(this.mPropertyBag), "at least one adaptation exists");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and adaptations model was initialized", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			var oExpectedFilledData = {
				allAdaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022"
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022"
					},
					{
						id: "DEFAULT",
						contexts: {},
						title: "",
						description: "",
						createdBy: "",
						createdAt: "",
						changedBy: "",
						changedAt: "",
						type: "DEFAULT"
					}
				],
				adaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022",
						rank: 1
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022",
						rank: 2
					}
				],
				count: 2,
				displayedAdaptation: {
					id: "id-1591275572834-1",
					contexts: {
						role: ["SALES"]
					},
					title: "German Admin",
					description: "ACH Admin for Germany",
					createdBy: "Test User 1",
					createdAt: "May 25, 2022",
					changedBy: "Test User 1",
					changedAt: "May 27, 2022",
					rank: 1
				},
				contextBasedAdaptationsEnabled: true
			};
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: oExpectedFilledData.allAdaptations});
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function() {
				assert.ok(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is an adaptations model for this reference and layer");
				var oModel = ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is returned with initialized values");
				assert.strictEqual(ContextBasedAdaptationsAPI.getDisplayedAdaptationId(this.mPropertyBag), oExpectedFilledData.displayedAdaptation.id, "displayed adaptation id is correct");
				oModel.switchDisplayedAdaptation("DEFAULT");
				assert.strictEqual(ContextBasedAdaptationsAPI.getDisplayedAdaptationId(this.mPropertyBag), undefined, "displayed default adaptation id is undefined");
				assert.ok(ContextBasedAdaptationsAPI.adaptationExists(this.mPropertyBag), "at least one adaptation exists");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI is initialized with adaptations and refreshAdaptationModel is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
			ContextBasedAdaptationsAPI.clearInstances();
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.test.app");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			var aAdaptations = [
				{
					id: "id-1591275572834-1",
					contexts: {
						role: ["SALES"]
					},
					title: "German Admin",
					description: "ACH Admin for Germany",
					createdBy: "Test User 1",
					createdAt: "May 25, 2022",
					changedBy: "Test User 1",
					changedAt: "May 27, 2022"
				},
				{
					id: "id-1591275572835-1",
					contexts: {
						role: ["MARKETING_MANAGER"]
					},
					title: "DLM Copilot",
					description: "DLM copilot contexts for Europe",
					createdBy: "Test User 2",
					createdAt: "May 17, 2022",
					changedBy: "Test User 2",
					changedAt: "SEPTEMBER 07, 2022"
				},
				{
					id: "id-1591275572836-1",
					contexts: {
						role: ["HR_MANAGER"]
					},
					title: "Only for HR",
					description: "HR restricted",
					createdBy: "Test User 3",
					createdAt: "May 17, 2022",
					changedBy: "Test User 3",
					changedAt: "SEPTEMBER 07, 2022"
				},
				{
					id: "DEFAULT",
					contexts: {},
					title: "",
					description: "",
					createdBy: "",
					createdAt: "",
					changedBy: "",
					changedAt: "",
					type: "DEFAULT"
				}
			];
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: aAdaptations});
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				this.oModel = oModel;
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the displayed adaptation is still available", function(assert) {
			sandbox.stub(FlexInfoSession, "getByReference").returns({adaptationId: "id-1591275572836-1" });
			this.oModel.switchDisplayedAdaptation("id-1591275572836-1");
			return ContextBasedAdaptationsAPI.refreshAdaptationModel(this.mPropertyBag).then(function(sDisplayedAdaptationId) {
				assert.strictEqual(sDisplayedAdaptationId, "id-1591275572836-1",
					"then the displayed adaptation is the same as before the refresh has been called");
			});
		});

		QUnit.test("when the displayed adaptation is not available anymore", function(assert) {
			sandbox.stub(FlexInfoSession, "getByReference").returns({adaptationId: "not_existing" });
			this.oModel.getProperty("/allAdaptations").splice(0, 1); // simulate first adaptation is not available anymore
			return ContextBasedAdaptationsAPI.refreshAdaptationModel(this.mPropertyBag).then(function(sDisplayedAdaptationId) {
				assert.strictEqual(sDisplayedAdaptationId, "id-1591275572835-1",
					"then the displayed adaptation is the one with highest prio");
			});
		});
		QUnit.test("when the displayed adaptation is not available anymore and only default is left", function(assert) {
			sandbox.stub(FlexInfoSession, "getByReference").returns({adaptationId: "not_existing" });
			this.oModel.getProperty("/allAdaptations").splice(0, 3); // simulate all are gone except default
			return ContextBasedAdaptationsAPI.refreshAdaptationModel(this.mPropertyBag).then(function(sDisplayedAdaptationId) {
				assert.strictEqual(sDisplayedAdaptationId, "DEFAULT",
					"then the displayed adaptation is context free");
			});
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.create is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {}
			};
			stubSettings(sandbox);
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			this.oOnAllChangesSavedStub = sandbox.stub(Versions, "onAllChangesSaved");
			this.oWriteChangesStub = sandbox.stub(Storage, "write").resolves("Success");
		},
		afterEach() {
			sandbox.restore();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.create(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is called");
			}.bind(this));
		});

		QUnit.test("when no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.create(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is called");
			}.bind(this));
		});

		QUnit.test("when no contextBasedAdaptation is provided", function(assert) {
			delete this.mPropertyBag.contextBasedAdaptation;
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.create(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No contextBasedAdaptation was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is called");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and a draft exists and no changes exist", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return Version.Number.Draft;
				}
			});
			var oModel = new JSONModel({});
			oModel.insertAdaptation = function() {
				return;
			};
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(oModel);
			var aReturnedVersions = [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oCreateStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves({status: 201});

			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function(sResult) {
				var [oArgs] = oCreateStub.getCall(0).args;
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, Version.Number.Draft, "then the correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(sResult, "Success", "the context-based adaptation is created");

				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
				[oArgs] = this.oOnAllChangesSavedStub.getCall(0).args;
				assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and a draft does not exists and no changes exist", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return 1;
				}
			});
			var oModel = new JSONModel({});
			oModel.insertAdaptation = function() {
				return;
			};
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(oModel);
			var aReturnedVersions = [
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oStorageCreateStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves({status: 201});

			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function(sResult) {
				var oArgs = oStorageCreateStub.getCall(0).args[0];
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(sResult, "Success", "the context-based adaptation is created");

				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
				[oArgs] = this.oOnAllChangesSavedStub.getCall(0).args;
				assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.create is called with copy of changes", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {}
			};
			stubSettings(sandbox);
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: [{ id: "DEFAULT", type: "DEFAULT" }]});
			this.oOnAllChangesSavedStub = sandbox.stub(Versions, "onAllChangesSaved");
			this.oWriteChangesStub = sandbox.stub(Storage, "write").resolves("Success");
			ContextBasedAdaptationsAPI.clearInstances();
		},
		afterEach() {
			sandbox.restore();
			FlexState.clearState();
		}
	}, function() {
		var oCompVariantFlexDataResponse = LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/contextBasedAdaptations/testSaveAsCompVariants.json"),
			async: false
		});
		var oFLVariantFlexDataResponse = LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/contextBasedAdaptations/testSaveAsFLVariants.json"),
			async: false
		});
		[{
			testName: "when there are control variant changes and no draft exists",
			stubResponse: oFLVariantFlexDataResponse,
			aReturnedVersions: [
				{ version: "2" },
				{ version: "1" }
			],
			stubVersionModel: 1
		}, {
			testName: "when there are comp. variant changes and no draft exists",
			stubResponse: oCompVariantFlexDataResponse,
			aReturnedVersions: [
				{ version: "2" },
				{ version: "1" }
			],
			stubVersionModel: 1
		}, {
			testName: "when there are control variant changes and a draft exists",
			stubResponse: oFLVariantFlexDataResponse,
			aReturnedVersions: [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			],
			stubVersionModel: Version.Number.Draft
		}, {
			testName: "when there are comp. variant changes and a draft exists",
			stubResponse: oCompVariantFlexDataResponse,
			aReturnedVersions: [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			],
			stubVersionModel: Version.Number.Draft
		}].forEach(function(mSetup) {
			QUnit.test(mSetup.testName, async function(assert) {
				sandbox.stub(Versions, "getVersionsModel").returns({
					getProperty() {
						return mSetup.stubVersionModel;
					}
				});

				sandbox.stub(Storage.versions, "load").resolves(mSetup.aReturnedVersions);
				await FlQUnitUtils.initializeFlexStateWithData(sandbox, "com.sap.app", mSetup.stubResponse);
				var oStorageCreateStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves({status: 201});

				assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag),
					 "there is no adaptations model for this reference and layer");
				return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function() {
					return ContextBasedAdaptationsAPI.canMigrate(this.mPropertyBag);
				}.bind(this))
				.then(function(bCanMigrate) {
					assert.strictEqual(bCanMigrate, false, "then no migration needed");

					return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function(sResult) {
						var oArgs = oStorageCreateStub.getCall(0).args[0];
						assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
						if (mSetup.stubVersionModel === Version.Number.Draft) {
							assert.strictEqual(oArgs.parentVersion, Version.Number.Draft, "then the correct version is used");
						} else {
							assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
						}
						assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");

						assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
						[oArgs] = this.oOnAllChangesSavedStub.getCall(0).args;
						assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
						assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
						assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");

						assert.strictEqual(sResult, "Success", "the context-based adaptation is created");
						var oWriteArgs = this.oWriteChangesStub.getCall(0).args[0];
						return verifyChangesAreCopiedCorrectly.call(this, oWriteArgs.flexObjects, assert);
					}.bind(this));
				}.bind(this));
			});
		});
	});

	QUnit.module("When ContextBasedAdaptationsAPI.reorder is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				parameters: {
					priorities: ["", "", "", ""]
				}
			};
			stubSettings(sandbox);
			this.oOnAllChangesSavedStub = sandbox.stub(Versions, "onAllChangesSaved");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("and no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("and no priorities list is provided", function(assert) {
			delete this.mPropertyBag.parameters;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No valid priority list was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("and control and layer and priorities list are provided", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});

			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "reorder").resolves({status: 204});
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).then(function(sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(sResult.status, 204, "then the reorder was successful");

				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
				[oArgs] = this.oOnAllChangesSavedStub.getCall(0).args;
				assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");
			}.bind(this));
		});
	});

	QUnit.module("When ContextBasedAdaptationsAPI.load is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("and no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("and control and layer is provided and context-based adaptation response is returned", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			var aAdaptations = {
				adaptations: [
					{
						id: "id-1591275572834-1",
						contexts: {
							role: ["SALES"]
						},
						title: "German Admin",
						description: "ACH Admin for Germany",
						createdBy: "Test User 1",
						createdAt: "May 25, 2022",
						changedBy: "Test User 1",
						changedAt: "May 27, 2022"
					},
					{
						id: "id-1591275572835-1",
						contexts: {
							role: ["MARKETING_MANAGER"]
						},
						title: "DLM Copilot",
						description: "DLM copilot contexts for Europe",
						createdBy: "Test User 2",
						createdAt: "May 17, 2022",
						changedBy: "Test User 2",
						changedAt: "SEPTEMBER 07, 2022"
					}
				]
			};
			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves(aAdaptations);
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).then(function(sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.version, 1, "then correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "the correct reference is used");
				assert.strictEqual(sResult.adaptations.length, 2, "the correct data length is returned");
				assert.deepEqual(sResult, aAdaptations, "then the correct data is returned");
			});
		});

		QUnit.test("and control and layer is provided and an empty response is returned", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});

			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves();
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).then(function(sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.version, 1, "then the correct version is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then correct reference is used");
				assert.strictEqual(sResult.adaptations.length, 0, "then the correct data length is returned");
				assert.deepEqual(sResult, {adaptations: []}, "then the correct data is returned");
			});
		});
	});

	QUnit.module("When ContextBasedAdaptationsAPI.update is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {},
				adaptationId: "id_12345"
			};
			stubSettings(sandbox);
			this.oOnAllChangesSavedStub = sandbox.stub(Versions, "onAllChangesSaved");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("and no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("and no contextBasedAdaptation is provided", function(assert) {
			delete this.mPropertyBag.contextBasedAdaptation;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No contextBasedAdaptation was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("and no adaptationId is provided", function(assert) {
			delete this.mPropertyBag.adaptationId;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag)
			.then(function() {
				assert.ok(false, "Should not succeed");
			})
			.catch(function(sError) {
				assert.equal(sError, "No adaptationId was provided", "then the correct error message is returned");
				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 0, "Versions.OnAllChangesSaved is not called");
			}.bind(this));
		});

		QUnit.test("and control, layer, property and adaptationId are provided", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});

			var oUpdateStub = sandbox.stub(Storage.contextBasedAdaptation, "update").resolves({status: 200});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag).then(function(sResult) {
				var oArgs = oUpdateStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
				assert.strictEqual(oArgs.adaptationId, "id_12345", "then the correct adaptation is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct appId is used");

				assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 1, "Versions.OnAllChangesSaved is called");
				[oArgs] = this.oOnAllChangesSavedStub.getCall(0).args;
				assert.strictEqual(oArgs.reference, "com.sap.test.app", "then the correct reference is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer");
				assert.strictEqual(oArgs.contextBasedAdaptation, true, "then the correct contextBasedAdaptation flag is set");

				assert.strictEqual(sResult.status, 200, "then the update was successful");
			}.bind(this));
		});
	});

	QUnit.module("When ContextBasedAdaptationsAPI.remove is called", {
		before() {
			this.oAppComponent = {
				getManifest() {
					return {};
				},
				getManifestObject() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {},
				adaptationId: "id_12345"
			};
			stubSettings(sandbox);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("and no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("and no adaptationId is provided", function(assert) {
			delete this.mPropertyBag.adaptationId;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No adaptationId was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("and control, layer, property and adaptationId are provided", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return sActiveVersion;
				}
			});

			this.updateModelFromBackendDone = false;
			var oVersionsUpdateModelBackend = sandbox.stub(Versions, "updateModelFromBackend").callsFake(function() {
				return new Promise(function(resolve) {
					setTimeout(function() {
						this.updateModelFromBackendDone = true;
						resolve();
					}.bind(this), 0);
				}.bind(this));
			}.bind(this));
			var oRemoveStub = sandbox.stub(Storage.contextBasedAdaptation, "remove").resolves({status: 204});
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).then(function(sResult) {
				var oArgs = oRemoveStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.strictEqual(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.strictEqual(oArgs.parentVersion, 1, "then the correct version is used");
				assert.strictEqual(oArgs.adaptationId, "id_12345", "then the correct adaptation is used");
				assert.strictEqual(oArgs.appId, "com.sap.test.app", "then the correct appId is used");
				assert.strictEqual(sResult.status, 204, "then the remove was successful");
				var oVersionsArgs = oVersionsUpdateModelBackend.getCall(0).args[0];
				assert.deepEqual(oVersionsArgs.reference, "com.sap.test.app", "then the versions updateModelFromBackend is called with reference");
				assert.deepEqual(oVersionsArgs.layer, Layer.CUSTOMER, "then the versions updateModelFromBackend is called with layer");
				assert.ok(this.updateModelFromBackendDone, "Correct call order");
			}.bind(this));
		});
	});

	QUnit.module("When ContextBasedAdaptationsAPI.canMigrate and migrate are called", {
		before() {
			this.oResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");
			var oManifestObj = {
				"sap.app": {
					id: "com.sap.test.app"
				}
			};
			this.oManifest = new Manifest(oManifestObj);
			this.oAppComponent = {
				getManifest: function() {
					return this.oManifest;
				}.bind(this),
				getManifestObject() {
					return oManifestObj;
				},
				getId() {
					return "sComponentId";
				},
				getComponentData() {
					return {
						startupParameters: []
					};
				},
				getLocalId() {}
			};
		},
		beforeEach() {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("com.sap.app");
			sandbox.stub(URLHandler, "attachHandlers");
			this.oFlexController = FlexControllerFactory.createForControl(this.oAppComponent, this.oManifest);
			this.oModel = new VariantModel({}, {
				flexController: this.oFlexController,
				appComponent: this.oAppComponent
			});
			this.oAppComponent.getModel = function(sName) {
				return (sName === "$FlexVariants") ? this.oModel : undefined;
			}.bind(this);

			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty() {
					return Version.Number.Draft;
				}
			});
			var aReturnedVersions = [
				{ version: Version.Number.Draft },
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			stubSettings(sandbox);
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: [{ id: "DEFAULT", type: "DEFAULT" }]});
			this.oOnAllChangesSavedStub = sandbox.stub(Versions, "onAllChangesSaved");

			return Promise.all([ContextBasedAdaptationsAPI.initialize(this.mPropertyBag), this.oModel.initialize()]);
		},
		afterEach() {
			FlexState.clearState();
			ChangePersistenceFactory._instanceCache = {};
			ContextBasedAdaptationsAPI.clearInstances(this.mPropertyBag);
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given no CompVariant are present", async function(assert) {
			var oCompVariantFlexDataResponse = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/contextBasedAdaptations/testMigrateCompVariants.json"),
				async: false
			});
			oCompVariantFlexDataResponse.comp.variants = [];
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "com.sap.app", oCompVariantFlexDataResponse);

			return ContextBasedAdaptationsAPI.canMigrate(this.mPropertyBag).then(function(bCanMigrate) {
				assert.strictEqual(bCanMigrate, false, "then no migration needed");
			});
		});

		QUnit.test("Given no FLVariants are present", async function(assert) {
			var oFLVariantFlexDataResponse = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/contextBasedAdaptations/testMigrateFLVariants.json"),
				async: false
			});
			oFLVariantFlexDataResponse.variants = [];
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "com.sap.app", oFLVariantFlexDataResponse);
			return ContextBasedAdaptationsAPI.canMigrate(this.mPropertyBag).then(function(bCanMigrate) {
				assert.strictEqual(bCanMigrate, false, "then no migration needed");
			});
		});

		QUnit.test("Given no restricted CompVariants and at least one unrestricted CompVariant are present", async function(assert) {
			var oCompVariantFlexDataResponse = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/contextBasedAdaptations/testMigrateCompVariants.json"),
				async: false
			});
			oCompVariantFlexDataResponse.comp.variants = oCompVariantFlexDataResponse.comp.variants.filter(function(oCompVariant) {
				if (oCompVariant.contexts.role.length === 0) {
					return oCompVariant;
				}
				return undefined;
			});
			oCompVariantFlexDataResponse.comp.changes.forEach(function(oChange) {
				if (oChange.changeType === "updateVariant") {
					oChange.content.contexts = {role: []};
				}
			});
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "com.sap.app", oCompVariantFlexDataResponse);
			return ContextBasedAdaptationsAPI.canMigrate(this.mPropertyBag).then(function(bCanMigrate) {
				assert.strictEqual(bCanMigrate, false, "then no migration needed");
			});
		});

		QUnit.test("Given no restricted FLVariants and at least one unrestricted FLVariants are present", async function(assert) {
			var oFLVariantFlexDataResponse = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/contextBasedAdaptations/testMigrateFLVariants.json"),
				async: false
			});
			oFLVariantFlexDataResponse.variants = oFLVariantFlexDataResponse.variants.filter(function(oVariant) {
				if (oVariant.contexts && Object.keys(oVariant.contexts).length === 0) {
					return oVariant;
				}
				return undefined;
			});
			oFLVariantFlexDataResponse.variantChanges = [];
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "com.sap.app", oFLVariantFlexDataResponse);
			// Stub getAllVariants to return variants that would be visible in an RTA environment only
			var aMigrationLayers = [Layer.VENDOR, Layer.PARTNER, Layer.CUSTOMER_BASE, Layer.CUSTOMER];
			var oGetAllVariantsStub = sandbox.stub(VariantManagementState, "getAllVariants");
			oGetAllVariantsStub.callsFake(function() {
				var aOriginalReturnValue = oGetAllVariantsStub.wrappedMethod(ManifestUtils.getFlexReferenceForControl());
				return aOriginalReturnValue.filter(function(oVariant) {
					return aMigrationLayers.includes(oVariant.layer);
				});
			});

			return ContextBasedAdaptationsAPI.canMigrate(this.mPropertyBag).then(function(bCanMigrate) {
				assert.strictEqual(bCanMigrate, false, "then no migration needed");
			});
		});

		function assertMigrationContent(aExpected, assert) {
			assert.strictEqual(this.oCreateContextBasedAdaptationStub.callCount, 3, "then the correct amount of context-based adaptations are created");
			assert.strictEqual(this.oOnAllChangesSavedStub.callCount, 3, "then version model is correctly updated");
			assert.strictEqual(this.oWriteChangesStub.callCount, 1, "then only one change request is send");
			var aWrittenObjects = this.oWriteChangesStub.getCall(0).args[0].flexObjects;
			var iTotal = 0;
			aExpected.forEach(function(oExpectedContextBasedAdaptation, iIndex) {
				var sAdaptationId;
				var sTitle;
				if (oExpectedContextBasedAdaptation.adaptation) {
					var oArguments = this.oCreateContextBasedAdaptationStub.getCall(iIndex).args[0];
					sAdaptationId = oArguments.flexObject.id;
					sTitle = oExpectedContextBasedAdaptation.adaptation.title;
					assert.deepEqual(oArguments.flexObject.contexts, oExpectedContextBasedAdaptation.adaptation.contexts,
						"then the correct context-based adaptation contexts is set");
					assert.strictEqual(oArguments.flexObject.title, sTitle, "then the correct context-based adaptation title is set");
				} else {
					sTitle = "Context Free";
				}

				var aObjectsForAdaptation = aWrittenObjects.filter(function(oObject) {
					return oObject.adaptationId === sAdaptationId;
				});

				function isCloneOf(sClonedFrom, oObject) {
					return oObject.support.clonedFrom === sClonedFrom;
				}
				function isHide4CompVar(sCompVar, oObject) {
					return oObject.changeType === "updateVariant"
					&& oObject.selector.variantId === sCompVar
					&& oObject.content.visible === false;
				}

				function isHide4FLVar(sFLVar, oObject) {
					return oObject.fileType === "ctrl_variant_change"
					&& oObject.changeType === "setVisible"
					&& oObject.selector.id === sFLVar
					&& oObject.content.visible === false;
				}

				function assertExpected(expectedList, checkFnc, sMessagePart) {
					expectedList.forEach(function(sExpectedParam) {
						assert.ok(aObjectsForAdaptation.find(checkFnc.bind(undefined, sExpectedParam)), `Adaptation ${sTitle} has ${sMessagePart} ${sExpectedParam}`);
					});
				}
				var oExpectedChanges = oExpectedContextBasedAdaptation.changes;
				oExpectedChanges.hides4CompVar ||= [];
				oExpectedChanges.hides4FLVar ||= [];
				assertExpected(oExpectedChanges.clonedFrom, isCloneOf, "clone of");
				assertExpected(oExpectedChanges.hides4CompVar, isHide4CompVar, "hide for comp var");
				assertExpected(oExpectedChanges.hides4FLVar, isHide4FLVar, "hide for FL var");

				var iAdaptationTotal =
					oExpectedChanges.clonedFrom.length +
					oExpectedChanges.hides4CompVar.length +
					oExpectedChanges.hides4FLVar.length;
				iTotal += iAdaptationTotal;
				assert.strictEqual(aObjectsForAdaptation.length, iAdaptationTotal, `Adaptation ${sTitle} has correct number of changes`);
			}.bind(this));

			assert.strictEqual(aWrittenObjects.length, iTotal, "Written files has correct number");
		}

		QUnit.test("Given at least one restricted CompVariants and at least one unrestricted CompVariant are present", async function(assert) {
			var oCompVariantFlexDataResponse = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/contextBasedAdaptations/testMigrateCompVariants.json"),
				async: false
			});
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "com.sap.app", oCompVariantFlexDataResponse);
			this.oCreateContextBasedAdaptationStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves({status: 201});
			this.oWriteChangesStub = sandbox.stub(Storage, "write").resolves("Success");

			return ContextBasedAdaptationsAPI.canMigrate(this.mPropertyBag).then(function(bCanMigrate) {
				assert.strictEqual(bCanMigrate, true, "then migration needed");
				return ContextBasedAdaptationsAPI.migrate(this.mPropertyBag);
			}.bind(this)).then(function() {
				assertMigrationContent.call(this, [
					{
						adaptation: {
							contexts: {
								role: ["/IPRO/MANAGER"]
							},
							id: "someFileName",
							title: this.oResourceBundle.getText("CBA_MIGRATED_ADAPTATION_TITLE", "/IPRO/MANAGER")
						},
						changes: {
							clonedFrom: [
								"restricted4managerKeyUser_customer_page",
								"restricted4managerKeyUser_customer_page_UIChange",
								"unrestricted_customer_page",
								"updateVariant_unrestricted_customer_page",
								"unrestricted_customer_page_UIChange",
								"nonVariantUIChange",
								"control1_defaultVariant",
								"control2_defaultVariant"
							],
							hides4CompVar: []
						}
					},
					{
						adaptation: {
							contexts: {
								role: ["Z_SAP_UI_FLEX_KEY_USER"]
							},
							id: "someFileName",
							title: this.oResourceBundle.getText("CBA_MIGRATED_ADAPTATION_TITLE", "Z_SAP_UI_FLEX_KEY_USER")
						},
						changes: {
							clonedFrom: [
								"restricted4managerKeyUser_customer_page",
								"restricted4managerKeyUser_customer_page_UIChange",
								"restricted4viewerKeyUser_customer_page",
								"restricted4viewerKeyUser_customer_page_UIChange",
								"unrestricted_customer_page",
								"updateVariant_unrestricted_customer_page",
								"unrestricted_customer_page_UIChange",
								"nonVariantUIChange",
								"control1_defaultVariant",
								"control2_defaultVariant"
							],
							hides4CompVar: [
								"restricted4Manager_vendor_page"
							]
						} },
					{
						adaptation: {
							contexts: {
								role: ["/IPRO/CONTRACT_VIEWER"]
							},
							id: "someFileName",
							title: this.oResourceBundle.getText("CBA_MIGRATED_ADAPTATION_TITLE", "/IPRO/CONTRACT_VIEWER")
						},
						changes: {
							clonedFrom: [
								"restricted4viewerKeyUser_customer_page",
								"restricted4viewerKeyUser_customer_page_UIChange",
								"unrestricted_customer_page",
								"updateVariant_unrestricted_customer_page",
								"unrestricted_customer_page_UIChange",
								"nonVariantUIChange",
								"control1_defaultVariant",
								"control2_defaultVariant"
							],
							hides4CompVar: [
								"restricted4Manager_vendor_page"
							]
						}
					},
					{
						changes: {
							clonedFrom: [],
							hides4CompVar: [
								"restricted4Manager_vendor_page",
								"restricted4managerKeyUser_customer_page",
								"restricted4viewerKeyUser_customer_page"
							]
						}
					}
				], assert);
			}.bind(this));
		});

		QUnit.test("Given at least one restricted FLVariants and at least one unrestricted FLVariant are present", async function(assert) {
			var oFLVariantFlexDataResponse = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/contextBasedAdaptations/testMigrateFLVariants.json"),
				async: false
			});
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "com.sap.app", oFLVariantFlexDataResponse);
			this.oCreateContextBasedAdaptationStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves({status: 201});
			this.oWriteChangesStub = sandbox.stub(Storage, "write").resolves("Success");

			return ContextBasedAdaptationsAPI.canMigrate(this.mPropertyBag).then(function(bCanMigrate) {
				assert.strictEqual(bCanMigrate, true, "then migration needed");
				return ContextBasedAdaptationsAPI.migrate(this.mPropertyBag);
			}.bind(this)).then(function() {
				assertMigrationContent.call(this, [
					{
						adaptation: {
							contexts: {
								role: ["/IPRO/MANAGER"]
							},
							id: "someFileName",
							title: this.oResourceBundle.getText("CBA_MIGRATED_ADAPTATION_TITLE", "/IPRO/MANAGER")
						},
						changes: {
							clonedFrom: [
								"restricted4managerKeyUser_customer_page",
								"restricted4managerKeyUser_customer_page_UIChange",
								"unrestricted_customer_page",
								"updateVariant_unrestricted_customer_page",
								"unrestricted_customer_page_UIChange",
								"standard_page_UIChange",
								"nonVariantUIChange",
								"control1_defaultVariant",
								"control2_defaultVariant"
							],
							hides4FLVar: []
						}
					},
					{
						adaptation: {
							contexts: {
								role: ["Z_SAP_UI_FLEX_KEY_USER"]
							},
							id: "someFileName",
							title: this.oResourceBundle.getText("CBA_MIGRATED_ADAPTATION_TITLE", "Z_SAP_UI_FLEX_KEY_USER")
						},
						changes: {
							clonedFrom: [
								"restricted4managerKeyUser_customer_page",
								"restricted4managerKeyUser_customer_page_UIChange",
								"restricted4viewerKeyUser_customer_page",
								"restricted4viewerKeyUser_customer_page_UIChange",
								"unrestricted_customer_page",
								"updateVariant_unrestricted_customer_page",
								"unrestricted_customer_page_UIChange",
								"standard_page_UIChange",
								"nonVariantUIChange",
								"control1_defaultVariant",
								"control2_defaultVariant"
							],
							hides4FLVar: [
								"restricted4Manager_vendor_page"
							]
						} },
					{
						adaptation: {
							contexts: {
								role: ["/IPRO/CONTRACT_VIEWER"]
							},
							id: "someFileName",
							title: this.oResourceBundle.getText("CBA_MIGRATED_ADAPTATION_TITLE", "/IPRO/CONTRACT_VIEWER")
						},
						changes: {
							clonedFrom: [
								"restricted4viewerKeyUser_customer_page",
								"restricted4viewerKeyUser_customer_page_UIChange",
								"unrestricted_customer_page",
								"updateVariant_unrestricted_customer_page",
								"unrestricted_customer_page_UIChange",
								"standard_page_UIChange",
								"nonVariantUIChange",
								"control1_defaultVariant",
								"control2_defaultVariant"
							],
							hides4FLVar: [
								"restricted4Manager_vendor_page"
							]
						}
					},
					{
						changes: {
							clonedFrom: [],
							hides4FLVar: [
								"restricted4Manager_vendor_page",
								"restricted4managerKeyUser_customer_page",
								"restricted4viewerKeyUser_customer_page"
							]
						}
					}
				], assert);
			}.bind(this));
		});
	});
});
