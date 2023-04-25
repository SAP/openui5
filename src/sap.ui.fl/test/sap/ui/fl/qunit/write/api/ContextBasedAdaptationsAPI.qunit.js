/* global QUnit */

sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	LoaderExtensions,
	Control,
	FlexState,
	InitialStorage,
	Layer,
	Settings,
	Utils,
	Version,
	ContextBasedAdaptationsAPI,
	FlexObjectState,
	Storage,
	Versions,
	ManifestUtils,
	JSONModel,
	sinon
) {
	"use strict";

	document.getElementById("qunit-fixture").style.display = "none";
	var sandbox = sinon.createSandbox();

	function stubSettings(sandbox) {
		sandbox.stub(Settings, "getInstance").resolves({
			isContextBasedAdaptationEnabled: function() {
				return true;
			},
			isSystemWithTransports: function() {
				return false;
			}
		});
	}

	function verifyVariantsAndChanges(assert, oVariant, oCopiedVariant, bIsControlVariant, bIsChange) {
		assert.strictEqual(oVariant.getChangeType(), oCopiedVariant.changeType, "there is the same change type");
		assert.notStrictEqual(oVariant.getId(), oCopiedVariant.fileName, "there is a different filename");
		assert.strictEqual(oVariant.getFileType(), oCopiedVariant.fileType, "there is the same file type");
		assert.strictEqual(oVariant.getLayer(), oCopiedVariant.layer, "there is the same layer");
		assert.strictEqual(oVariant.getNamespace(), oCopiedVariant.namespace, "there is the same name space");
		assert.strictEqual(oVariant.getSupportInformation().originalLanguage, oCopiedVariant.originalLanguage, "there is the same original language");
		assert.strictEqual(oVariant.getFlexObjectMetadata().projectId, oCopiedVariant.projectId, "there is the same project id");
		assert.strictEqual(oVariant.getFlexObjectMetadata().reference, oCopiedVariant.reference, "there is the same reference");
		if (oVariant.getSupportInformation().user) {
			assert.strictEqual(oVariant.getSupportInformation().generator, oCopiedVariant.support.generator, "there is the generator");
			assert.strictEqual(oVariant.getSupportInformation().sapui5Version, oCopiedVariant.support.sapui5Version, "there is the same sapui5Version");
		} else {
			assert.deepEqual(oVariant.getSupportInformation(), oCopiedVariant.support, "there is the same support data");
		}
		assert.deepEqual(oVariant.getTexts(), oCopiedVariant.texts, "there is the same texts object");

		if (bIsChange) {
			if (oCopiedVariant.selector.variantId) {
				assert.strictEqual(oCopiedVariant.selector.persistencyKey, oVariant.getSelector().persistencyKey, "there is the same persistencyKey");
				assert.notStrictEqual(oCopiedVariant.selector.variantId, oVariant.getSelector().variantId, "there is not the same variantId");
			}
			if (oCopiedVariant.content.defaultVariantName) {
				assert.notStrictEqual(oCopiedVariant.selector.defaultVariantName, oVariant.getContent().defaultVariantName, "there is not the same defaultVariantName");
			} else {
				assert.deepEqual(oCopiedVariant.content, oVariant.getContent(), "there is the same content object");
			}
			assert.deepEqual(oCopiedVariant.dependentSelector, oVariant.getDependentSelectors(), "there is the same dependentSelector");
		}

		if (!bIsChange) {
			assert.strictEqual(oVariant.getExecuteOnSelection(), oCopiedVariant.executeOnSelection, "there is the same executeOnSelection value");
			assert.strictEqual(oVariant.getFavorite(), oCopiedVariant.favorite, "there is the same favorite value");
			assert.strictEqual(oVariant.getStandardVariant(), oCopiedVariant.standardVariant, "there is the same standard variant value");
			assert.notStrictEqual(oVariant.getVariantId(), oCopiedVariant.variantId, "there is the same variant id");
			assert.deepEqual(oVariant.getContent(), oCopiedVariant.content, "there is the same content");
			assert.deepEqual(oVariant.getContexts(), oCopiedVariant.contexts, "there is the same contexts");
			assert.deepEqual(oVariant.getPersistencyKey(), oCopiedVariant.selector.persistencyKey, "there is the same selector");
			if (bIsControlVariant) {
				assert.strictEqual(oVariant.getVariantManagementReference(), oCopiedVariant.variantManagementReference, "there is the correct variant management reference");
				assert.notStrictEqual(oVariant.getVariantReference(), oCopiedVariant.variantReference, "there is the correct variant reference");
			}
		}
	}

	function findVariantAndVerify(assert, aVariants, aCopiedChanges, bIsControlVariant) {
		aVariants.forEach(function(oVariant) {
			// find copied variant by text in list of copied variants
			var oCopiedVariant = aCopiedChanges.find(function(oCopiedChange) {
				return oCopiedChange.texts.variantName.value === oVariant.getName();
			});
			assert.ok(oCopiedVariant !== undefined, "the correct copied comp variant is found");
			verifyVariantsAndChanges(assert, oVariant, oCopiedVariant, bIsControlVariant);
		});
	}

	function verifyChangesAreCopiedCorrectly(aCopiedChangeDefinitions, assert) {
		return FlexObjectState.getFlexObjects({ selector: this.mPropertyBag.control, invalidateCache: false, includeCtrlVariants: true, includeDirtyChanges: true })
			.then(function(aFlexObjects) {
				assert.strictEqual(aFlexObjects.length, aCopiedChangeDefinitions.length, "we have the length of objects");
				var bIsAdapationIdAdded = aCopiedChangeDefinitions.every(function(oCopiedChange) {
					return oCopiedChange.adaptationId;
				});
				assert.ok(bIsAdapationIdAdded, "adaptation id is added to every change/variant");
				var sVariant = "sap.ui.fl.apply._internal.flexObjects.Variant";
				var sFLVariant = "sap.ui.fl.apply._internal.flexObjects.FlVariant";
				var sCompVariant = "sap.ui.fl.apply._internal.flexObjects.CompVariant";
				var aCompVariants = aFlexObjects.filter(function(oFlexObject) { return oFlexObject.isA(sCompVariant); });
				var aControlVariants = aFlexObjects.filter(function(oFlexObject) { return oFlexObject.isA(sFLVariant); });
				var aChanges = aFlexObjects.filter(function(oFlexObject) {
					return !oFlexObject.isA(sVariant);
				});
				if (aCompVariants.length > 0) {
					findVariantAndVerify(assert, aCompVariants, aCopiedChangeDefinitions, false);
				} else if (aControlVariants.length > 0) {
					findVariantAndVerify(assert, aCompVariants, aCopiedChangeDefinitions, true);
				}
				if (aChanges.length > 0) {
					aChanges.forEach(function(oChange) {
						var oCopiedChange = aCopiedChangeDefinitions.find(function(oCopiedChange) {
							return oCopiedChange.creation === oChange.getCreation();
						});
						verifyVariantsAndChanges(assert, oChange, oCopiedChange, false, true);
					});
				}
			});
	}

	QUnit.module("Given ContextBasedAdaptationsAPI.initialize is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
			ContextBasedAdaptationsAPI.clearInstances();
		},
		afterEach: function() {
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

		QUnit.test("when a control and a layer were provided and a draft exists", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
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
				assert.equal(oLoadStub.callCount, 1, "contextBasedAdaptations.load was called once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
			}.bind(this));
		});

		QUnit.test("when a control and a layer were provided and a draft does not exists", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return 1;
				}
			});
			var aReturnedVersions = [
				{ version: "2" },
				{ version: "1" }
			];
			sandbox.stub(Storage.versions, "load").resolves(aReturnedVersions);
			var oLoadStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: []});

			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function(oModel) {
				assert.equal(oLoadStub.callCount, 1, "contextBasedAdaptations.load was called once");
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag), oModel, "then the adaptations model is initialized in session");
				assert.ok(oModel.updateAdaptations, "then the model was initialized with update function");
				assert.ok(oModel.insertAdaptation, "then the model was initialized with insert function");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.createModel is called", {
		beforeEach: function() {
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
				}
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
				}
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when nothing is provided", function(assert) {
			assert.throws(function() {
				ContextBasedAdaptationsAPI.createModel();
			}, new Error("Adaptations model can only be initialized with an array of adaptations"), "then adaptation model cannot be initialized and throws error");
		});

		QUnit.test("when only default adaptation is provided", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedEmptyData.allAdaptations);
			assert.deepEqual(oModel.getData(), this.oExpectedEmptyData, "then the adaptations model is created correctly with empty values");
		});

		QUnit.test("when a filled list of adaptations is provided", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
		});

		QUnit.test("when an empty list of adaptations is initialized and later updated with 2 adaptations", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedEmptyData.allAdaptations);
			assert.deepEqual(oModel.getData(), this.oExpectedEmptyData, "then the adaptations model is created correctly with empty values");
			oModel.updateAdaptations(this.oExpectedFilledData.allAdaptations);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when an empty list of adaptations is initialized and later 1 adaptation is inserted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedEmptyData.allAdaptations);
			assert.deepEqual(oModel.getData(), this.oExpectedEmptyData, "then the adaptations model is created correctly with empty values");
			var oNewAdaptation = {
				priority: 0,
				contexts: {
					role: ["SALES"]
				},
				title: "German Admin"
			};
			var oExpectedInsertedData = {allAdaptations: [oNewAdaptation, this.oDefaultAdaptation], adaptations: [oNewAdaptation], count: 1, displayedAdaptation: oNewAdaptation};
			oModel.insertAdaptation(oNewAdaptation);
			assert.deepEqual(oModel.getData(), oExpectedInsertedData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later 1 adaptation is inserted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations);
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
			var oAdaptation2 = this.oExpectedFilledData.adaptations[1];
			// rank is expected to increase as a new adaptation is inserted in between
			oAdaptation2.rank = 3;
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation1, oExpectedNewAdaptation, oAdaptation2, this.oDefaultAdaptation],
				adaptations: [oAdaptation1, oExpectedNewAdaptation, oAdaptation2],
				count: 3,
				displayedAdaptation: oExpectedNewAdaptation
			};
			oModel.insertAdaptation(oNewAdaptation);
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the first adaptation is deleted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation = this.oExpectedFilledData.adaptations[1];
			// rank is expected to decrease as the leading adaptation is deleted
			oAdaptation.rank = 1;
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation, this.oDefaultAdaptation],
				adaptations: [oAdaptation],
				count: 1,
				displayedAdaptation: oAdaptation
			};
			oModel.deleteAdaptation();
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the last adaptation is deleted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oAdaptation = this.oExpectedFilledData.adaptations[0];
			var oExpectedFilledData = {
				allAdaptations: [oAdaptation, this.oDefaultAdaptation],
				adaptations: [oAdaptation],
				count: 1,
				displayedAdaptation: oAdaptation
			};
			oModel.switchDisplayedAdaptation("id-1591275572835-1");
			oModel.deleteAdaptation();
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later an adaptation is created in the middle and then deleted again", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations);
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
				displayedAdaptation: oAdaptation2
			};
			oModel.insertAdaptation(oNewAdaptation3);
			oModel.deleteAdaptation();
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later all adaptations are deleted", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oExpectedFilledData = {
				allAdaptations: [this.oDefaultAdaptation],
				adaptations: [],
				count: 0,
				displayedAdaptation: this.oDefaultAdaptation
			};
			oModel.deleteAdaptation();
			oModel.deleteAdaptation();
			assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and later the displayed adaptation is switched", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations);
			assert.deepEqual(oModel.getData(), this.oExpectedFilledData, "then the adaptations model is created correctly");
			var oExpectedDisplayedAdaptation = this.oExpectedFilledData.adaptations[1];
			oModel.switchDisplayedAdaptation("id-1591275572835-1");
			assert.deepEqual(oModel.getProperty("/displayedAdaptation"), oExpectedDisplayedAdaptation, "then the adaptations model is updated correctly");
		});

		QUnit.test("when a list of adaptations is initialized and getIndexByAdaptationId is called", function(assert) {
			var oModel = ContextBasedAdaptationsAPI.createModel(this.oExpectedFilledData.allAdaptations);
			assert.strictEqual(oModel.getIndexByAdaptationId("id-1591275572834-1"), 0, "then the correct index is returned");
			assert.strictEqual(oModel.getIndexByAdaptationId("id-1591275572835-1"), 1, "then the correct index is returned");
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.getAdaptationsModel is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
			ContextBasedAdaptationsAPI.clearInstances();
		},
		afterEach: function() {
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
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");

			assert.throws(function() {
				ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
			}, new Error("Adaptations model for reference 'com.sap.test.app' and layer 'CUSTOMER' were not initialized."), "then the correct error message is returned");
		});

		QUnit.test("when a control and a layer were provided and adaptations model was initialized", function(assert) {
			assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
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
				}
			};
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: oExpectedFilledData.allAdaptations});
			return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function() {
				assert.ok(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is an adaptations model for this reference and layer");
				var oModel = ContextBasedAdaptationsAPI.getAdaptationsModel(this.mPropertyBag);
				assert.ok(oModel instanceof JSONModel, "then the result is of type JSONModel");
				assert.deepEqual(oModel.getData(), oExpectedFilledData, "then the adaptations model is returned with initialized values");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.create is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {}
			};
			stubSettings(sandbox);
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			this.oWriteChangesStub = sandbox.stub(Storage, "write").resolves("Success");
		},
		afterEach: function() {
			sandbox.restore();
			FlexState.clearState();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no contextBasedAdaptation is provided", function(assert) {
			delete this.mPropertyBag.contextBasedAdaptation;
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No contextBasedAdaptation was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when a control and a layer were provided and a draft exists and no changes exist", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
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
			var oPublishStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves("Success");

			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function(sResult) {
				var oArgs = oPublishStub.getCall(0).args[0];
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.parentVersion, Version.Number.Draft, "then the correct version is used");
				assert.equal(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.equal(sResult, "Success", "the context-based adaptation is created");
			});
		});

		QUnit.test("when a control and a layer were provided and a draft does not exists and no changes exist", function(assert) {
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
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
			var oPublishStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves("Success");

			return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function(sResult) {
				var oArgs = oPublishStub.getCall(0).args[0];
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.parentVersion, 1, "then the correct version is used");
				assert.equal(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.equal(sResult, "Success", "the context-based adaptation is created");
			});
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.create is called with copy of changes", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {}
			};
			stubSettings(sandbox);
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			sandbox.stub(Storage.contextBasedAdaptation, "load").resolves({adaptations: []});
			this.oWriteChangesStub = sandbox.stub(Storage, "write").resolves("Success");
			ContextBasedAdaptationsAPI.clearInstances();
		},
		afterEach: function() {
			sandbox.restore();
			FlexState.clearState();
		}
	}, function() {
		var oCompVariantFlexDataResponse = LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/variants/testCompVariants.json"),
			async: false
		});
		var oFLVariantFlexDataResponse = LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/variants/testFLVariants.json"),
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
			QUnit.test(mSetup.testName, function(assert) {
				sandbox.stub(Versions, "getVersionsModel").returns({
					getProperty: function() {
						return mSetup.stubVersionModel;
					}
				});

				sandbox.stub(Storage.versions, "load").resolves(mSetup.aReturnedVersions);
				sandbox.stub(InitialStorage, "loadFlexData").resolves(mSetup.stubResponse);
				var oPublishStub = sandbox.stub(Storage.contextBasedAdaptation, "create").resolves("Success");

				assert.notOk(ContextBasedAdaptationsAPI.hasAdaptationsModel(this.mPropertyBag), "there is no adaptations model for this reference and layer");
				return ContextBasedAdaptationsAPI.initialize(this.mPropertyBag).then(function() {
					return ContextBasedAdaptationsAPI.create(this.mPropertyBag).then(function(sResult) {
						var oArgs = oPublishStub.getCall(0).args[0];
						assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
						if (mSetup.stubVersionModel === Version.Number.Draft) {
							assert.equal(oArgs.parentVersion, Version.Number.Draft, "then the correct version is used");
						} else {
							assert.equal(oArgs.parentVersion, 1, "then the correct version is used");
						}
						assert.equal(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
						assert.equal(sResult, "Success", "the context-based adaptation is created");
						var oWriteArgs = this.oWriteChangesStub.getCall(0).args[0];
						return verifyChangesAreCopiedCorrectly.call(this, oWriteArgs.flexObjects, assert);
					}.bind(this));
				}.bind(this));
			});
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.reorder is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				parameters: {
					priorities: ["", "", "", ""]
				}
			};
			stubSettings(sandbox);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no priorities list is provided", function(assert) {
			delete this.mPropertyBag.parameters;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No valid priority list was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when control and layer and prorities list are provided", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});

			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "reorder").resolves("Success");
			return ContextBasedAdaptationsAPI.reorder(this.mPropertyBag).then(function(sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.parentVersion, 1, "then the correct version is used");
				assert.equal(oArgs.appId, "com.sap.test.app", "then the correct reference is used");
				assert.equal(sResult, "Success", "then the reorder was succesfull");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.load is called", {
		before: function() {
			this.oAppComponent = {
				getManifest: function() {
					return {};
				},
				getManifestObject: function() {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function() {
					return "sComponentId";
				},
				getComponentData: function() {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function() {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control()
			};
			stubSettings(sandbox);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no control is provided", function(assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function(assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).catch(function(sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when control and layer is provided and context-based adaptation response is returned", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
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
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.version, 1, "then correct version is used");
				assert.equal(oArgs.appId, "com.sap.test.app", "the correct reference is used");
				assert.equal(sResult.adaptations.length, 2, "the correct data length is returned");
				assert.deepEqual(sResult, aAdaptations, "then the correct data is returned");
			});
		});

		QUnit.test("when control and layer is provided and an empty response is returned", function(assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function() {
					return sActiveVersion;
				}
			});

			var oReorderStub = sandbox.stub(Storage.contextBasedAdaptation, "load").resolves();
			return ContextBasedAdaptationsAPI.load(this.mPropertyBag).then(function(sResult) {
				var oArgs = oReorderStub.getCall(0).args[0];
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.version, 1, "then the correct version is used");
				assert.equal(oArgs.appId, "com.sap.test.app", "then correct reference is used");
				assert.equal(sResult.adaptations.length, 0, "then the correct data length is returned");
				assert.deepEqual(sResult, {adaptations: []}, "then the correct data is returned");
			});
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.update is called", {
		before: function () {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getManifestObject: function () {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function () {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {},
				adaptationId: "id_12345"
			};
			stubSettings(sandbox);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when no control is provided", function (assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function (assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no contextBasedAdaptation is provided", function (assert) {
			delete this.mPropertyBag.contextBasedAdaptation;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No contextBasedAdaptation was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no adaptationId is provided", function (assert) {
			delete this.mPropertyBag.adaptationId;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No adaptationId was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when control, layer, property and adaptationId are provided", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});

			var oUpdateStub = sandbox.stub(Storage.contextBasedAdaptation, "update").resolves("Success");
			return ContextBasedAdaptationsAPI.update(this.mPropertyBag).then(function (sResult) {
				var oArgs = oUpdateStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.parentVersion, 1, "then the correct version is used");
				assert.equal(oArgs.adaptationId, "id_12345", "then the correct adaptation is used");
				assert.equal(oArgs.appId, "com.sap.test.app", "then the correct appId is used");
				assert.equal(sResult, "Success", "then the update was succesfull");
			}.bind(this));
		});
	});

	QUnit.module("Given ContextBasedAdaptationsAPI.remove is called", {
		before: function () {
			this.oAppComponent = {
				getManifest: function () {
					return {};
				},
				getManifestObject: function () {
					return {
						"sap.app": {
							id: "com.sap.test.app"
						}
					};
				},
				getId: function () {
					return "sComponentId";
				},
				getComponentData: function () {
					return {
						startupParameters: ["sap-app-id"]
					};
				}
			};
		},
		beforeEach: function () {
			this.mPropertyBag = {
				layer: Layer.CUSTOMER,
				control: new Control(),
				contextBasedAdaptation: {},
				adaptationId: "id_12345"
			};
			stubSettings(sandbox);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when no control is provided", function (assert) {
			delete this.mPropertyBag.control;
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No control was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no layer is provided", function (assert) {
			delete this.mPropertyBag.layer;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No layer was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when no adaptationId is provided", function (assert) {
			delete this.mPropertyBag.adaptationId;
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).catch(function (sError) {
				assert.equal(sError, "No adaptationId was provided", "then the correct error message is returned");
			});
		});

		QUnit.test("when control, layer, property and adaptationId are provided", function (assert) {
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			sandbox.stub(ManifestUtils, "getFlexReference").returns("com.sap.app");
			var sActiveVersion = 1;
			sandbox.stub(Versions, "getVersionsModel").returns({
				getProperty: function () {
					return sActiveVersion;
				}
			});

			var oRemoveStub = sandbox.stub(Storage.contextBasedAdaptation, "remove").resolves("Success");
			return ContextBasedAdaptationsAPI.remove(this.mPropertyBag).then(function (sResult) {
				var oArgs = oRemoveStub.getCall(0).args[0];
				assert.deepEqual(oArgs.flexObjects, this.mPropertyBag.parameters, "then the correct parameters with priority list is used");
				assert.equal(oArgs.layer, Layer.CUSTOMER, "then the correct layer is used");
				assert.equal(oArgs.parentVersion, 1, "then the correct version is used");
				assert.equal(oArgs.adaptationId, "id_12345", "then the correct adaptation is used");
				assert.equal(oArgs.appId, "com.sap.test.app", "then the correct appId is used");
				assert.equal(sResult, "Success", "then the remove was succesfull");
			}.bind(this));
		});
	});
});
