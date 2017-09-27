/*global sinon QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/fl/FakeLrepLocalStorage",
	"sap/ui/fl/Cache",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Utils"
], function(LrepConnector,FakeLrepConnector, FakeLrepConnectorLocalStorage, FakeLrepLocalStorage, Cache, ChangePersistenceFactory, Utils) {
	"use strict";
	sinon.config.useFakeTimers = false;
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	FakeLrepConnectorLocalStorage.enableFakeConnector();

	var oFakeLrepConnectorLocalStorage = sap.ui.fl.LrepConnector.createConnector();

	var oTestData = {"fileName":"id_1445501120486_25","fileType":"change","changeType":"hideControl","component":"sap.ui.rta.test.Demo.md.Component","packageName":"$TMP","content":{},"selector":{"id":"RTADemoAppMD---detail--GroupElementDatesShippingStatus"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.rta.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}};

	var aTestData = [{"fileName":"id_1449484290389_26","fileType":"change","changeType":"moveFields","component":"sap.ui.rta.test.Demo.md.Component","packageName":"$TMP","content":{"moveFields":[{"id":"RTADemoAppMD---detail--GroupElementGeneralDataAddressStreet","index":1}]},"selector":{"id":"RTADemoAppMD---detail--GroupGeneralData"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.rta.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}},{"fileName":"id_1449484290389_27","fileType":"change","changeType":"moveFields","component":"sap.ui.rta.test.Demo.md.Component","packageName":"$TMP","content":{"moveFields":[{"id":"RTADemoAppMD---detail--GroupElementGeneralDataAddressZipCode","index":4}]},"selector":{"id":"RTADemoAppMD---detail--GroupGeneralData"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.rta.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}},{"fileName":"id_1449484290389_28","fileType":"change","changeType":"moveFields","component":"sap.ui.rta.test.Demo.md.Component","packageName":"$TMP","content":{"moveFields":[{"id":"RTADemoAppMD---detail--GroupElementDatesShippingStatus","index":4}],"targetId":"RTADemoAppMD---detail--GroupGeneralData"},"selector":{"id":"RTADemoAppMD---detail--GroupDates"},"layer":"CUSTOMER","texts":{},"namespace":"sap.ui.rta.test.Demo.md.Component","creation":"","originalLanguage":"EN","conditions":{},"support":{"generator":"Change.createInitialFileContent","service":"","user":""}}];

	QUnit.module("Given I use SAP RTA Fake Lrep Connector Local Storage", {

		beforeEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
		},
		afterEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
		}
	});

	QUnit.test("when in INITAL status", function(assert) {
		return oFakeLrepConnectorLocalStorage.loadChanges("sap.ui.fl.qunit.FakeLrepConnector")
		.then(function (oChanges) {
			assert.equal(oChanges.changes.changes.length, 0, "then no changes are available");
		});
	});


	QUnit.test("when settings are requested", function(assert) {
		return oFakeLrepConnectorLocalStorage.loadSettings("sap.ui.fl.qunit.FakeLrepConnector")
		.then(function (oSettings) {
			assert.ok(oSettings);
		});
	});


	QUnit.module("Give I want to create changes", {

		beforeEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
		},
		afterEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
		}
	});

	QUnit.test("when saving a single change", function(assert) {
		return oFakeLrepConnectorLocalStorage.create(oTestData)
		.then(function (oResult) {
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 1, "then the Local Storage saves one change.");
			assert.deepEqual(oResult.response, oTestData, "and the change definition is returned as response");
		});
	});

	QUnit.test("when updating a single change", function(assert) {
		return oFakeLrepConnectorLocalStorage.create(oTestData)
		.then(function () {
			//any update on change
			oTestData.layer = "USER";

			return oFakeLrepConnectorLocalStorage.update(oTestData);
		})
		.then(function (oResult) {
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 1, "then the Local Storage still has one change.");
			assert.deepEqual(oResult.response, FakeLrepLocalStorage.getChange(oTestData.fileName), "and the change definition is updated and updated returned");
		});
	});

	QUnit.test("when saving three changes", function(assert) {
		return oFakeLrepConnectorLocalStorage.create(aTestData)
		.then(function (oResult) {
			assert.equal(FakeLrepLocalStorage.getNumChanges(), 3, "then the Local Storage saves three changes.");
			assert.deepEqual(oResult.response, aTestData, "and the change definitions are returned");
		});
	});

	QUnit.test("when deleting a change", function(assert) {
		return oFakeLrepConnectorLocalStorage.create(aTestData)
		.then(function () {
			oFakeLrepConnectorLocalStorage.deleteChange({
				sChangeName: aTestData[0].fileName,
				sLayer: aTestData[0].layer,
				sNamespace: aTestData[0].namespace,
				sChangelist: aTestData[0].packageName
			});
		})
		.then(function () {
			assert.equal(FakeLrepLocalStorage.getNumChanges(), aTestData.length - 1, "then the Local Storage has a change less.");
		});
	});

	QUnit.test("when enabled for 2. time", function(assert) {
		FakeLrepConnectorLocalStorage.enableFakeConnector({ foo : 3 });
		var oFakeLrepConnectorLocalStorage = sap.ui.fl.LrepConnector.createConnector();
		return oFakeLrepConnectorLocalStorage.loadChanges("some.component")
		.then(function (mResult) {
			assert.deepEqual(mResult.changes.settings, {
				"isKeyUser": true,
				"isAtoAvailable": false,
				"isProductiveSystem": false
			}, "then still only the default settings are available, you cannot enable without disable the fake connector");
		});
	});

	QUnit.test("when passed different fl settings", function(assert) {
		FakeLrepConnectorLocalStorage.disableFakeConnector();
		FakeLrepConnectorLocalStorage.enableFakeConnector({
			isAtoAvailable : true
		});
		var oFakeLrepConnectorLocalStorage = sap.ui.fl.LrepConnector.createConnector();
		return oFakeLrepConnectorLocalStorage.loadChanges("some.component")
		.then(function (mResult) {
			assert.deepEqual(mResult.changes.settings, {
				"isKeyUser": true,
				"isAtoAvailable": true,
				"isProductiveSystem": false
			}, "then the settings merged together");
		});
	});

	QUnit.test("when enable then disable fake connector without app component data", function(assert) {
		FakeLrepConnectorLocalStorage.disableFakeConnector();
		//enable
		FakeLrepConnectorLocalStorage.enableFakeConnector("dummy path");
		var oConnector = LrepConnector.createConnector();
		assert.deepEqual(Cache.getEntries(), {} , "when enable fake connector, the flex cache is empty");
		assert.notEqual(FakeLrepConnectorLocalStorage.enableFakeConnector.original, undefined , "then original connector is stored");
		assert.ok(FakeLrepConnectorLocalStorage._oFakeInstance instanceof  FakeLrepConnectorLocalStorage, "then a fake instance is stored");
		assert.ok(oConnector instanceof FakeLrepConnectorLocalStorage , "new connector will be created with fake instance");

		//then disable
		FakeLrepConnectorLocalStorage.disableFakeConnector();
		oConnector = LrepConnector.createConnector();
		assert.deepEqual(Cache.getEntries(), {} , "when disable fake connector, the flex cache is empty");
		assert.equal(FakeLrepConnectorLocalStorage.enableFakeConnector.original, undefined, "then original connector is erased");
		assert.ok(oConnector instanceof LrepConnector , "new connector will be created with real instance");
		assert.equal(FakeLrepConnectorLocalStorage._oFakeInstance, undefined, "and a stored fake instance is erased");
	});

	QUnit.test("when enable then disable fake connector with app component data", function(assert) {
		var sAppComponentName = "testComponent";
		var sAppVersion = "1.2.3";
		//enable
		FakeLrepConnectorLocalStorage.enableFakeConnector("dummy path", sAppComponentName, sAppVersion);
		var oConnector = LrepConnector.createConnector();
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForComponent(sAppComponentName, sAppVersion);
		assert.deepEqual(Cache.getEntry(sAppComponentName, sAppVersion), {} , "when enable fake connector, the flex cache entry is empty");
		assert.ok(FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName][sAppVersion] instanceof LrepConnector , "then real connector instance of correspond change persistence is stored");
		assert.ok(oChangePersistence._oConnector instanceof FakeLrepConnectorLocalStorage , "then the fake connector instance is used for correspond change persistence ");
		assert.notEqual(FakeLrepConnectorLocalStorage.enableFakeConnector.original, undefined , "then original connector is stored");
		assert.ok(FakeLrepConnectorLocalStorage._oFakeInstance instanceof  FakeLrepConnectorLocalStorage, "then a fake instance is stored");
		assert.ok(oConnector instanceof FakeLrepConnectorLocalStorage , "new connector will be created with a fake instance");

		//then disable
		FakeLrepConnectorLocalStorage.disableFakeConnector(sAppComponentName, sAppVersion);
		oConnector = LrepConnector.createConnector();
		assert.deepEqual(Cache.getEntry(sAppComponentName, sAppVersion), {} , "when disable fake connector, the flex cache is empty");
		assert.ok(oChangePersistence._oConnector instanceof LrepConnector , "then the real connector instance of correspond change persistence is restored");
		assert.equal(FakeLrepConnectorLocalStorage._oBackendInstances[sAppComponentName][sAppVersion], undefined , "and the original stored instance of correspond change persistence is erased");
		assert.equal(FakeLrepConnectorLocalStorage.enableFakeConnector.original, undefined, "then original connector is erased");
		assert.ok(oConnector instanceof LrepConnector , "new connector will be created with real instance");
		assert.equal(FakeLrepConnectorLocalStorage._oFakeInstance, undefined, "and a stored fake instance is erased");
	});

	QUnit.module("Given JSON data passed during initiailization of FakeLrepConnectorLocalStorage", {
		beforeEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
			FakeLrepConnectorLocalStorage.disableFakeConnector();
			var mSettings = {};
			mSettings.sInitialComponentJsonPath = jQuery.sap.getModulePath("sap.ui.fl.qunit.testResources").replace('resources', 'test-resources') + "/TestFakeVariantLrepResponse.json";
			mSettings.isAtoAvailable = false;
			FakeLrepConnectorLocalStorage.enableFakeConnector(mSettings, "json.component", "1.0.1");
			this.oFakeLrepConnectorLocalStorage = sap.ui.fl.LrepConnector.createConnector();
			this.createChangesMapsSpy = sandbox.spy(this.oFakeLrepConnectorLocalStorage, "_createChangesMap");
			this.sortChangesSpy = sandbox.spy(this.oFakeLrepConnectorLocalStorage, "_sortChanges");
		},
		afterEach : function(assert) {
			oFakeLrepConnectorLocalStorage.deleteChanges();
			sandbox.restore();
		}
	});

	QUnit.test("when changes are loaded from FakeLrepConnectorLocalStorage only from backend/JSON response", function(assert) {
		return this.oFakeLrepConnectorLocalStorage.loadChanges("test.json.component")
			.then(function (mResult) {
				assert.equal(mResult.changes.changes.length, 3, "then three global changes read from the provided JSON file");
				assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].defaultVariant, "variant0", "then default variant for variantManagement reference 'variantManagementOrdersTable' set correctly");
				assert.equal(mResult.changes.variantSection["variantManagementOrdersObjectPage"].defaultVariant, "variant00", "then default variant for variantManagement reference 'variantManagementOrdersObjectPage' set correctly");
				assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants.length, 3, "then three variant found for variantManagement reference 'variantManagementOrdersTable'");
				assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].variantChanges["setTitle"][0].texts.title.value, "New Variant Title", "setTitle with correct value set in the loadChanges response");
				assert.ok(this.createChangesMapsSpy.calledOnce, "then _createChangesMaps called once");
				assert.ok(this.sortChangesSpy.calledOnce, "then _sortChanges called once");
			}.bind(this));
	});

	QUnit.test("when changes are loaded from FakeLrepConnectorLocalStorage from backend/JSON response & local storage", function(assert) {
		var aLocalStorageChanges = [
			{
				fileType: "change",
				fileName: "Change1"
			}, {
				fileType: "ctrl_variant_change",
				fileName: "Change1",
				variantReference: "variant0",
				changeType: "setTitle"
			}, {
				fileType: "ctrl_variant",
				fileName: "Change1",
				variantManagementReference: "idMain1--variantManagementOrdersTable"
			}
		];
		sandbox.stub(FakeLrepLocalStorage, "getChanges").returns(aLocalStorageChanges);

		return this.oFakeLrepConnectorLocalStorage.loadChanges("test.json.component")
			.then(function (mResult) {
				assert.equal(mResult.changes.changes.length, 4, "then four changes available, 3 from JSON and 1 from local storage");
				assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants.length, 4, "then 4 variants available, 3 from JSON and 1 from local storage");assert.ok(this.createChangesMapsSpy.calledOnce, "then _createChangesMaps called once");
				assert.equal(mResult.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].variantChanges["setTitle"].length, 2, "then 2 variant changes available, one from JSON and one from local storage");
				assert.ok(this.sortChangesSpy.calledOnce, "then _sortChanges called once");
			}.bind(this));
	});

	QUnit.test("when a variant change with undefined variantManagement is loaded from local storage", function(assert) {
		var aTestChangeWithoutVMRef = [{"fileName":"id_1449484290389_36","fileType":"ctrl_variant"}];
		return this.oFakeLrepConnectorLocalStorage.create(aTestChangeWithoutVMRef).then(function () {
			return this.oFakeLrepConnectorLocalStorage.loadChanges("test.json.component")
				.then(function (mResult) {
					assert.equal(mResult.changes.changes.length, 4, "then three global changes from JSON and one newly added variant with undefined variantManagement reference");
					assert.equal(mResult.changes.changes[3].fileName, aTestChangeWithoutVMRef[0].fileName, "then newly added variant added to changes");
					assert.equal(Object.keys(mResult.changes.variantSection).length, 2,  "then only 2 pre-defined variantManagement references set, none added for the newly added variant,");
			});
		}.bind(this));
	});

	QUnit.test("when _createChangesMap is called with change variant not existing", function(assert) {
		var mResult = {
			changes: {
				variantSection: {
					"varMgmt1": {},
					"varMgmt2": {}
				}
			}
		};

		var aVariants = [
			{variantManagementReference: "varMgmt3",
			fileName: "fileName3"}
		];
		assert.notOk(mResult.changes.variantSection["varMgmt3"], "then no variantManagement exists");
		var mResult = this.oFakeLrepConnectorLocalStorage._createChangesMap({}, aVariants);
		assert.equal(mResult.changes.variantSection["varMgmt3"].defaultVariant, "fileName3", "then default variant set for the newly added variantManagement reference, extracted from variant change");
	});

	QUnit.test("when _createChangesMap is called with variant change already existing", function(assert) {
		var mResult = {
			changes: {
				variantSection: {
					"varMgmt1": {
						variants: [
							{
								content: {
									fileName: "ExistingVariant1"
								},
								changes: []
							}
						]
					},
					"varMgmt2": {}
				}
			}
		};

		var aVariants = [
			{
				variantManagementReference: "varMgmt1",
				fileName: "ExistingVariant1"
			}
		];
		assert.equal(mResult.changes.variantSection["varMgmt1"].variants.length, 1, "then one variant already exists");
		var mResult = this.oFakeLrepConnectorLocalStorage._createChangesMap(mResult, aVariants);
		assert.equal(mResult.changes.variantSection["varMgmt1"].variants.length, 1, "then variant not added since a duplicate variant already exists");
	});

	QUnit.test("when _createChangesMap is called with variant change not existing", function(assert) {
		var mResult = {
			changes: {
				variantSection: {
					"varMgmt1": {
						variants: [
							{
								content: {
									fileName: "ExistingVariant1"
								},
								changes: []
							}
						]
					},
					"varMgmt2": {}
				}
			}
		};

		var aVariants = [
			{
				variantManagementReference: "varMgmt1",
				fileName: "ExistingVariant2"
			}
		];
		assert.equal(mResult.changes.variantSection["varMgmt1"].variants.length, 1, "then one variant already exists");
		var mResult = this.oFakeLrepConnectorLocalStorage._createChangesMap(mResult, aVariants);
		assert.equal(mResult.changes.variantSection["varMgmt1"].variants.length, 2, "then variant not added since a duplicate variant already exists");
		assert.ok(Array.isArray(mResult.changes.variantSection["varMgmt1"].variants[1].changes), "then the newly added variant contains changes array");
		assert.ok(Array.isArray(mResult.changes.variantSection["varMgmt1"].variants[1].variantChanges["setTitle"]), "then the newly added variant contains setTitle variant changes array");
		assert.ok(typeof mResult.changes.variantSection["varMgmt1"].variants[1].content === 'object', "then the newly added variant contains a content object");
	});

	QUnit.test("when _sortChanges is called with a mix of changes and variants", function(assert) {
		var mResult = {
			changes: {
				changes: [
					{
						fileName: "Change1",
						variantReference: ""
					}
				],
				variantSection: {
					"varMgmt1": {
						variants: [
							{
								content: {
									fileName: "ExistingVariant1"
								},
								changes: [
									{
										fileName: "Change2",
										variantReference: "varMgmt1"
									}
								],
								variantChanges: {
									setTitle: []
								}
							}
						]
					},
					"varMgmt2": {
						variants: []
					}
				}
			}
		};

		var aChanges = [
			{
				fileName: "Change3",
				variantReference: "ExistingVariant1"
			},
			{
				fileName: "Change4",
				variantReference: ""
			}
		];

		var aVariantChanges = [
			{
				fileName: "Change5",
				variantReference: "ExistingVariant1",
				changeType: "setTitle"
			},
			{
				fileName: "Change6",
				variantReference: "ExistingVariant1",
				changeType: "setTitle"
			}
		];

		assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].changes.length, 1, "then only one change in variant ExistingVariant1");
		assert.equal(mResult.changes.changes.length, 1, "then one global change exists");
		var mResult = this.oFakeLrepConnectorLocalStorage._sortChanges(mResult, aChanges, aVariantChanges);
		assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].changes.length, 2, "then two changes exist for variant ExistingVariant1");
		assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].variantChanges["setTitle"].length, 2, "then two variant changes exist for variant ExistingVariant1");
		assert.ok( mResult.changes.variantSection["varMgmt1"].variants[0].variantChanges["setTitle"][0].fileName === "Change5" &&
						mResult.changes.variantSection["varMgmt1"].variants[0].variantChanges["setTitle"][1].fileName === "Change6", "then both variant changes passed as a parameter exist in order" );
		assert.equal(mResult.changes.changes.length, 2, "then two global changes exist");
	});

	QUnit.test("when _assignVariantReferenceChanges with _getReferencedChanges is called with a valid variantReference", function(assert) {
		sandbox.stub(Utils, "getCurrentLayer").returns("CUSTOMER");
		var mResult = {
			changes: {
				changes: [
					{
						fileName: "Change1",
						variantReference: ""
					}
				],
				variantSection: {
					"varMgmt1": {
						variants: [
							{
								content: {
									fileName: "ExistingVariant1",
									variantReference: "ExistingVariant2",
									variantManagementReference: "varMgmt1"
								},
								changes: [
									{
										fileName: "Change2",
										variantReference: "ExistingVariant1"
									}
								]
							},
							{
								content: {
									fileName: "ExistingVariant2"
								},
								changes: [
									{
										fileName: "Change3",
										variantReference: "ExistingVariant2",
										layer: "VENDOR"
									},
									{
										fileName: "Change4",
										variantReference: "ExistingVariant2",
										layer: "CUSTOMER"
									}
								]
							}
						]
					}
				}
			}
		};
		var fnGetReferencedChangesSpy = sandbox.spy(this.oFakeLrepConnectorLocalStorage, "_getReferencedChanges")  ;
		assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].changes.length, 1, "then initially one change available in ExistingVariant1");
		var mResult = this.oFakeLrepConnectorLocalStorage._assignVariantReferenceChanges(mResult);
		assert.strictEqual(fnGetReferencedChangesSpy.returnValues[0][0], mResult.changes.variantSection["varMgmt1"].variants[1].changes[0], "then _getReferencedChanges returned the VENDOR layer referenced change");
		assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].changes.length, 2, "then two changes available in ExistingVariant1");
		assert.equal(mResult.changes.variantSection["varMgmt1"].variants[0].changes[0].fileName, "Change3", "then referenced change from ExistingVariant1 in the VENDOR layer is inserted before actual variant changes");
		assert.notOk(mResult.changes.variantSection["varMgmt1"].variants[0].changes.some( function (oChange) {
			return oChange.fileName === "Change4";
		}), "then referenced change from ExistingVariant1 in the CUSTOMER layer is not references");
	});
});
