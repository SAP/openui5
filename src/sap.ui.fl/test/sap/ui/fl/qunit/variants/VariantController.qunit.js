/*global sinon QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/variants/VariantController",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/m/Text"
], function(LrepConnector, FakeLrepConnector, Cache, Change, Variant, ChangePersistence, VariantController, VariantModel, FlexControllerFactory, Utils, Text) {
	"use strict";
	sinon.config.useFakeTimers = false;
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	sandbox.stub(Utils, "getCurrentLayer").returns("CUSTOMER");

	var oFakeLrepConnector = new FakeLrepConnector("Dummy path");

	var fnGetChanges = function(aChanges, sSelectorId, iLength, assert){
		var aVarMgmtChanges = this.oFlexController._oChangePersistence._mChanges.mChanges[sSelectorId]
			.map(function(oChange) {
				return oChange.getDefinition().fileName;
			});

		for (var i = 0; i < aChanges.length; i++){

			var iIndex = aVarMgmtChanges.indexOf(aChanges[i].getDefinition().fileName);
			assert.ok(iIndex > -1, "change present in current map");
			assert.ok(jQuery.isArray(this.oFlexController._oChangePersistence._mChanges.mDependencies[aChanges[i].getId()].dependencies), "dependency map present for change in current map");
		}

		assert.strictEqual(this.oFlexController._oChangePersistence._mChanges.mChanges["RTADemoAppMD---detail--GroupElementDatesShippingStatus"].length, 7, "7 changes in map");
		assert.strictEqual(Object.keys(this.oFlexController._oChangePersistence._mChanges.mDependencies).length, 6, "6 Dependency maps present");
		assert.strictEqual(Object.keys(this.oFlexController._oChangePersistence._mChanges.mDependentChangesOnMe).length, 6, "6 DependentChangesOnMe maps present");
	};

	QUnit.module("Given an instance of FakeLrepConnector", {
		beforeEach : function(assert) {
			var done = assert.async();
			jQuery.getJSON("../testResources/TestFakeVariantLrepResponse.json")
				.done(function(oFakeVariantResponse) {
					this.oResponse = {};
					this.oResponse.changes = oFakeVariantResponse;
					done();
				}.bind(this));
		},
		afterEach : function(assert) {
			sandbox.restore();
		}
	});

	QUnit.test("when create change which is variant and send it to LrepConnector", function(assert) {
		var done = assert.async();
		oFakeLrepConnector.create(this.oResponse, "testChangeList", true).then( function(result){
			assert.deepEqual(result.response, this.oResponse, "then an exact payload was returned.");
			assert.equal(result.status, 'success' , "successfully.");
			done();
		}.bind(this));
	});

	QUnit.test("when calling 'getVariant' of the VariantController", function(assert) {
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var oExpectedVariant = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0];
		var oVariant = oVariantController.getVariant("idMain1--variantManagementOrdersTable", oExpectedVariant.content.fileName);
		assert.deepEqual(oExpectedVariant, oVariant, "then the variant object of a given variantManagmentReference and variantReference is returned");
	});

	QUnit.test("when calling 'getVariants' of the VariantController", function(assert) {
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var aVariants = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants;
		var aSortedVariants = oVariantController.getVariants("idMain1--variantManagementOrdersTable");
		var aExpectedVariants = [aVariants[1], aVariants[0], aVariants[2]];
		assert.deepEqual(aExpectedVariants, aSortedVariants, "then the variants of a given variantManagmentId are returned");
		assert.equal(aExpectedVariants[0].content.fileName, "idMain1--variantManagementOrdersTable", "and ordered with standard variant first");
	});

	QUnit.test("when calling 'getVariants' of the VariantController with an invalid variantManagementId", function(assert) {
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var aVariants = oVariantController.getVariants("invalidVariantManagementId");
		assert.equal(aVariants.length, 0, "then an empty array is returned");
	});

	QUnit.test("when calling 'getVariantChanges' of the VariantController", function(assert) {
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var aExpectedDefChanges = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].changes;
		var aExpectedChanges = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[2].changes;
		var aDefChanges = oVariantController.getVariantChanges("idMain1--variantManagementOrdersTable");
		var aChanges = oVariantController.getVariantChanges("idMain1--variantManagementOrdersTable", "variant2");
		assert.deepEqual(aExpectedDefChanges, aDefChanges, "then the changes of the default variant are returned");
		assert.deepEqual(aExpectedChanges, aChanges, "then the changes of the given variant are returned");
	});

	QUnit.test("when calling 'getVariantChanges' of the VariantController", function(assert) {
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var aExpectedChanges = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[2].changes;
		var oRefChange = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].changes[0];
		aExpectedChanges.unshift(oRefChange);
		var aChanges = oVariantController.getVariantChanges("idMain1--variantManagementOrdersTable", "variant2", true);
		assert.deepEqual(aExpectedChanges, aChanges, "then two changes of variant are returned with a new referenced change");
	});

	QUnit.test("when calling 'loadVariantChanges' of the VariantController without changes in variant", function(assert) {
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var aExpChanges1 = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].changes;
		var aExpChanges2 = this.oResponse.changes.variantSection["variantManagementOrdersObjectPage"].variants[0].changes;
		var aExpectedChanges = aExpChanges1.concat(aExpChanges2);
		var aChanges = oVariantController.loadDefaultChanges();
		assert.deepEqual(aExpectedChanges, aChanges, "then the changes of the given variant are returned");
	});

	QUnit.test("when calling 'getChangesForComponent' of the ChangePersistence", function(assert) {
		var done = assert.async();
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
		var aExpectedChanges0 = this.oResponse.changes.changes;
		var aExpectedChanges1 = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].changes;
		var aExpectedChanges2 = this.oResponse.changes.variantSection["variantManagementOrdersObjectPage"].variants[0].changes;
		var aExpectedChanges = aExpectedChanges0.concat(aExpectedChanges1).concat(aExpectedChanges2).map(function(oChangeContent){
			return new Change(oChangeContent);
		});

		var oComponent = {
				name: "MyComponent",
				appVersion: "1.2.3",
			getId : function() {return "RTADemoAppMD";}
		};
		var oChangePersistence = new ChangePersistence(oComponent);

		var mPropertyBag = {viewId: "view1--view2"};
		return oChangePersistence.getChangesForComponent(oComponent, mPropertyBag).then(function(aChanges) {
			assert.equal(aChanges.length, aExpectedChanges.length, "the variant changes are available together with the component change");
			aChanges.forEach(function (oChange, i) {
				assert.deepEqual(oChange._oDefinition, aExpectedChanges[i]._oDefinition, "the change content returns correctly");
			});
			done();
		});
	});

	QUnit.test("when calling 'getChangesForVariantSwitch' of the VariantController without changes in a variant", function(assert) {
		var oChangeContent0 = {"fileName":"change0"};
		var oChangeContent1 = {"fileName":"change1"};

		var oFakeVariantResponse = {
			"changes" : {
				"variantSection" : {
					"variantManagementId" : {
						"variants" : [{
							"content" : {
								"fileName": "variant0",
								"title": "variant 0"
							},
							"changes" : []
						},
							{
								"content" : {
									"fileName": "variant1",
									"title": "variant 1"
								},
								"changes" : [oChangeContent0, oChangeContent1]
							}]
					}
				}
			}
		};
		var aChangeContents = [oChangeContent0, oChangeContent1];
		var aChanges = aChangeContents.map(function (oChangeContent) {
			return new Change(oChangeContent);
		});
		var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);

		//switch from variant0 to variant1
		var mCurrentChanges = {
			"dummyControlSelector": []
		};
		var mChanges = oVariantController.getChangesForVariantSwitch("variantManagementId", "variant0", "variant1", mCurrentChanges);
		var aExpectedNew = [aChanges[0], aChanges[1]];
		var aExpectedRevert = [];
		mChanges.aNew.forEach(function (oChange, i) {
			assert.deepEqual(oChange._oDefinition, aExpectedNew[i]._oDefinition, "the change content returns correctly");
		});
		assert.equal(mChanges.aRevert.length, 0, "the revert array is empty");

		//switch back from variant1 to variant0
		mCurrentChanges = {
			"dummyControlSelector": [aChanges[0], aChanges[1]]
		};
		mChanges = oVariantController.getChangesForVariantSwitch("variantManagementId", "variant1", "variant0", mCurrentChanges);
		aExpectedNew = [];
		aExpectedRevert = [aChanges[1], aChanges[0]];
		mChanges.aRevert.forEach(function (oChange, i) {
			assert.deepEqual(oChange._oDefinition, aExpectedRevert[i]._oDefinition, "the change content returns correctly");
		});
		assert.equal(mChanges.aNew.length, 0, "the new array is empty");

	});

	QUnit.test("when calling 'getChangesForVariantSwitch' of the VariantController", function(assert) {
		var oChangeContent0 = {"fileName":"change0", "variantReference":"variant0", "layer": "VENDOR"};
		var oChangeContent1 = {"fileName":"change1", "variantReference":"variant0"};
		var oChangeContent2 = {"fileName":"change2", "variantReference":"variant0"};
		var oChangeContent3 = {"fileName":"change3", "variantReference":"variant1"};
		var oChangeContent4 = {"fileName":"change4", "variantReference":"variant1"};

		var oFakeVariantResponse = {
			"changes" : {
				"variantSection" : {
					"variantManagementId" : {
						"variants" : [{
							"content" : {
								"fileName": "variant0",
								"title": "variant 0"
							},
							"changes" : [oChangeContent0, oChangeContent1, oChangeContent2]
						},
						{
							"content" : {
								"fileName": "variant1",
								"title": "variant 1",
								"variantReference":"variant0"
							},
							"changes" : [oChangeContent0, oChangeContent3, oChangeContent4]
						}]
					}
				}
			}
		};
		var aChangeContents = [oChangeContent0, oChangeContent1, oChangeContent2, oChangeContent3, oChangeContent4];
		var aChanges = aChangeContents.map(function (oChangeContent) {
			return new Change(oChangeContent);
		});
		var mCurrentChanges = {
			"dummyControlSelector":	[aChanges[0], aChanges[1], aChanges[2]]
		};

		var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
		var mChanges = oVariantController.getChangesForVariantSwitch("variantManagementId", "variant0", "variant1", mCurrentChanges);
		var aExpectedNew = [aChanges[3], aChanges[4]];
		var aExpectedRevert = [aChanges[2], aChanges[1]];
		mChanges.aNew.forEach(function (oChange, i) {
			assert.deepEqual(oChange._oDefinition, aExpectedNew[i]._oDefinition, "the change content returns correctly");
		});
		mChanges.aRevert.forEach(function (oChange, i) {
			assert.deepEqual(oChange._oDefinition, aExpectedRevert[i]._oDefinition, "the change content returns correctly");
		});
	});

	QUnit.test("when calling 'loadChangesMapForComponent' and afterwards 'loadSwitchChangesMapForComponent' of the ChangePersistence", function(assert) {
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
		var aExistingChanges = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].changes.map(function (oChange) {
			return new Change(oChange);
		});
		var oNewChange = new Change(this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[1].changes[1]);

		var aExpectedNew = [oNewChange];
		var aExpectedRevert = [aExistingChanges[1]];

		var oComponent = {
			name: "MyComponent",
			appVersion: "1.2.3",
			getId : function() {return "RTADemoAppMD";}
		};
		this.oChangePersistence = new ChangePersistence(oComponent);
		this.oChangePersistence._mChanges.mChanges = {"dummyControlSelector": aExistingChanges};
		this.oChangePersistence._oVariantController._mVariantManagement = this.oResponse.changes.variantSection;

		this.mPropertyBag = {viewId: "view1--view2"};
		var mSwitches = this.oChangePersistence.loadSwitchChangesMapForComponent("idMain1--variantManagementOrdersTable", "variant0", "idMain1--variantManagementOrdersTable");
		mSwitches.aNew.forEach(function (oChange, i) {
			assert.deepEqual(oChange._oDefinition, aExpectedNew[i]._oDefinition, "the change content returns correctly");
		});
		mSwitches.aRevert.forEach(function (oChange, i) {
			assert.deepEqual(oChange._oDefinition, aExpectedRevert[i]._oDefinition, "the change content returns correctly");
		});
	});

	QUnit.test("when calling '_fillVariantModel'", function(assert) {
		var oFakeVariantResponse = {
			"changes" : {
				"changes" : [
					{
						"fileName":"change1"
					}
				],
				"variantSection" : {
					"variantMgmtId1" : {
						"defaultVariant" : "variant1",
						"variants" : [
							{
								"content": {
									"fileName":"variant0",
									"title":"variant A",
									"layer":"CUSTOMER",
									"support":{
										"user":"Me"
									}
								},
								"changes" : [
									{
										"fileName":"change44"
									},
									{
										"fileName":"change45"
									}
								],
								"variantChanges" : {
									"setTitle": []
								}
							},
							{
								"content": {
									"fileName":"variant1",
									"title":"variant B",
									"layer":"CUSTOMER",
									"support":{
										"user":"Me"
									}
								},
								"changes" : [
									{
										"fileName":"change46"
									},
									{
										"fileName":"change47"
									}
								],
								"variantChanges" : {
									"setTitle": []
								}
							},
							{
								"content": {
									"fileName":"variantMgmtId1",
									"title":"Standard",
									"layer":"VENDOR",
									"support":{
										"user":"SAP"
									}
								},
								"changes" : [
									{
										"fileName":"change42"
									},
									{
										"fileName":"change43"
									}
								],
								"variantChanges" : {
									"setTitle": []
								}
							}
						]
					}
				}
			}
		};
		var oExpectedData = {
			"variantMgmtId1": {
				"defaultVariant": "variant1",
				"variants": [{
					"author": "SAP",
					"key": "variantMgmtId1",
					"layer": "VENDOR",
					"readOnly": true,
					"title": "Standard"
				},
				{
					"author": "Me",
					"key": "variant0",
					"layer": "CUSTOMER",
					"readOnly": false,
					"title": "variant A"
				},
				{
					"author": "Me",
					"key": "variant1",
					"layer": "CUSTOMER",
					"readOnly": false,
					"title": "variant B"
				}]
			}
		};
		var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
		var fnApplyChangesOnVariantSpy = sandbox.spy(oVariantController, "_applyChangesOnVariant");
		var oData = oVariantController._fillVariantModel();
		assert.equal(fnApplyChangesOnVariantSpy.callCount, 3, "_applyChangesOnVariant called thrice for 3 variants");
		assert.propEqual(oData, oExpectedData, "then correct variant model data is returned");
	});

	QUnit.test("when calling '_applyChangesOnVariant' is called with a variant to perform setTitle", function(assert) {
		var oFakeVariantResponse = {
			"changes" : {
				"changes" : [
					{
						"fileName":"change1"
					}
				],
				"variantSection" : {
					"variantMgmtId1" : {
						"defaultVariant" : "variant1",
						"variants" : [
							{
								"content": {
									"fileName":"variant0",
									"title":"variant A",
									"layer":"CUSTOMER",
									"support":{
										"user":"Me"
									}
								},
								"changes" : [
									{
										"fileName":"change44"
									},
									{
										"fileName":"change45"
									}
								],
								"variantChanges" : {
									"setTitle": [{
										"fileName": "id_1507716136285_38_setTitle",
										"fileType": "ctrl_variant_change",
										"changeType": "setTitle",
										"texts": {
											"title": {
												"value": "New Variant Title1",
												"type": "XFLD"
											}
										},
										"variantReference": "variant0"
									},
									{
										"fileName": "id_1507716136285_39_setTitle",
										"fileType": "ctrl_variant_change",
										"changeType": "setTitle",
										"texts": {
											"title": {
												"value": "New Variant Title2",
												"type": "XFLD"
											}
										},
										"variantReference": "variant0"
									}]
								}
							}
						]
					}
				}
			}
		};
		var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
		assert.strictEqual(oFakeVariantResponse.changes.variantSection["variantMgmtId1"].variants[0].content.title, "variant A", "then title of the variant is set to the intiial value");
		oVariantController._applyChangesOnVariant(oFakeVariantResponse.changes.variantSection["variantMgmtId1"].variants[0]);
		assert.strictEqual(oFakeVariantResponse.changes.variantSection["variantMgmtId1"].variants[0].content.title, "New Variant Title2", "then title of the variant is set to the last change in the setTitle array");
	});

	QUnit.test("when calling 'addVariantToVariantManagement' with a new variant and no variant reference", function(assert) {
		var oChangeContent0 = {"fileName":"change0"};
		var oChangeContent1 = {"fileName":"change1"};

		var oFakeVariantData1 = {
			"content" : {
				"title": "AA",
				"fileName": "newVariant1"
			},
			"changes" : [oChangeContent0]
		};

		var oFakeVariantData2 = {
			"content" : {
				"title": "ZZ",
				"fileName": "newVariant2"
			},
			"changes" : [oChangeContent1]
		};

		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var iIndex1 = oVariantController.addVariantToVariantManagement(oFakeVariantData1, "idMain1--variantManagementOrdersTable");
		var iIndex2 = oVariantController.addVariantToVariantManagement(oFakeVariantData2, "idMain1--variantManagementOrdersTable");

		var aVariants = oVariantController.getVariants("idMain1--variantManagementOrdersTable");

		assert.equal(iIndex1, 1, "then index 1 received on adding variant AA");
		assert.equal(iIndex2, aVariants.length - 1, "then last index received on adding variant ZZ");
		assert.equal(aVariants[1].content.fileName, "newVariant1", "then the new variant with title AA added to the second position after Standard Variant (ascending sort)");
		assert.equal(aVariants[aVariants.length - 1].content.fileName, "newVariant2", "then the new variant with title ZZ added to the last position after Standard Variant (ascending sort)");
	});

	QUnit.test("when calling '_setVariantData' with a changed title and previous index", function(assert) {
		var mPropertyBag = {
			title: "ZZZ"
		};

		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var aVariants = oVariantController.getVariants("idMain1--variantManagementOrdersTable");
		assert.equal(aVariants[1].content.fileName, "variant0", "then before renaming the title variant present at index 1");
		var iSortedIndex = oVariantController._setVariantData(mPropertyBag, "idMain1--variantManagementOrdersTable", 1);
		assert.equal(iSortedIndex, 2, "then 2 received as sorted index");
		assert.equal(aVariants[2].content.fileName, "variant0", "then after renaming the title to ZZZ variant moved to index 2");
	});

	QUnit.test("when calling '_getIndexToSortVariant' with all variants (excluding standard variant) and the variant which needs to be re-sorted", function(assert) {
		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var aVariants = oVariantController.getVariants("idMain1--variantManagementOrdersTable");
		var oVariantData = aVariants[1];
		//removing variant from array
		aVariants.splice(1, 1);
		oVariantData.content.title = "ZZZ";

		//slice to remove standard variant
		var iSortedIndex = oVariantController._getIndexToSortVariant(aVariants.slice(1), aVariants[1]);
		assert.equal(iSortedIndex, 1, "then 1 received as sorted index (excluding standard variant) which was initially 0");
	});

	QUnit.test("when calling 'addVariantToVariantManagement' on CUSTOMER layer and a variant reference from the VENDOR layer with one VENDOR and one CUSTOMER change", function(assert) {
		var oChangeContent0 = {"fileName":"change0"};

		var oFakeVariantData1 = {
			"content" : {
				"title": "AA",
				"fileName": "newVariant1",
				"variantReference": "variant0"
			},
			"changes" : [oChangeContent0]
		};

		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var iIndex1 = oVariantController.addVariantToVariantManagement(oFakeVariantData1, "idMain1--variantManagementOrdersTable");

		var aVariants = oVariantController.getVariants("idMain1--variantManagementOrdersTable");
		var aChangeFileNames = aVariants[1].changes.map(function (oChange) {
			return oChange.fileName;
		});

		assert.equal(iIndex1, 1, "then index 1 received on adding variant AA");
		assert.equal(aVariants[1].content.fileName, "newVariant1", "then the new variant with title AA added to the second position after Standard Variant (ascending sort)");
		assert.equal(aVariants[1].changes.length, 2, "then one own change and one referenced change exists");
		assert.equal(aChangeFileNames[0], aVariants[2].changes[0].fileName, "then referenced change exists and placed to the array start");
		assert.equal(aChangeFileNames.indexOf(aVariants[2].changes[1].fileName), "-1", "then CUSTOMER layer change not referenced");
	});

	QUnit.test("when calling '_getReferencedChanges' on CUSTOMER layer with variant reference to a VENDOR layer variant with one VENDOR and one CUSTOMER change", function(assert) {
		var oChangeContent0 = {"fileName":"change0"};

		var oFakeVariantData1 = {
			"content" : {
				"title": "AA",
				"fileName": "newVariant1",
				"variantReference": "variant0"
			},
			"changes" : [oChangeContent0]
		};

		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var aReferencedChanges = oVariantController._getReferencedChanges("idMain1--variantManagementOrdersTable", oFakeVariantData1);
		var aVariants = oVariantController.getVariants("idMain1--variantManagementOrdersTable");

		assert.equal(aReferencedChanges.length, 1, "then only one change returned");
		assert.equal(aReferencedChanges[0].fileName, aVariants[2].changes[0].fileName, "then only one VENDOR level change returned");
	});

	QUnit.test("when calling 'removeVariantFromVariantManagement' with a variant", function(assert) {
		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);

		var oVariantDataToBeRemoved = oVariantController.getVariants("idMain1--variantManagementOrdersTable")[0];
		var oVariantToBeRemoved = new Variant(oVariantDataToBeRemoved);
		oVariantController.removeVariantFromVariantManagement(oVariantToBeRemoved, "idMain1--variantManagementOrdersTable");
		var aVariants = oVariantController.getVariants("idMain1--variantManagementOrdersTable");
		var bPresent = aVariants.some( function(oVariant) {
			return oVariant.content.fileName === oVariantDataToBeRemoved.content.fileName;
		});
		assert.notEqual(bPresent, "then the variant was removed");
	});

	//Integration tests

	QUnit.module("Given an instance of FakeLrepConnector and a mock application", {
		beforeEach : function(assert) {
			var done = assert.async();

			sandbox.stub(Utils, "isApplication").returns(true);
			sandbox.stub(Utils, "getComponentClassName").returns("MyComponent");

			var oManifestObj = {
				"sap.app": {
					id: "MyComponent",
					"applicationVersion": {
						"version" : "1.2.3"
					}
				}
			};

			var oManifest = new sap.ui.core.Manifest(oManifestObj);
			this.oComponent = {
				name: "MyComponent",
				appVersion: "1.2.3",
				getId : function() {return "RTADemoAppMD";},
				getManifestObject : function() {return oManifest;},
				getModel: function() {}
			};

			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);

			this.oFlexController = FlexControllerFactory.createForControl(this.oComponent, oManifest);

			sandbox.stub(this.oFlexController, "_getChangeHandler").returns({
				applyChange: sandbox.stub(),
				revertChange: sandbox.stub()
			});

			sandbox.stub(this.oFlexController, "_writeAppliedChangesCustomData");

			this.mPropertyBag = {
				viewId: "view1--view2",
				modifier: {getControlType : function() {return "sap.m.Text";}},
				appComponent: this.oComponent
			};

			jQuery.getJSON("../testResources/TestFakeVariantLrepResponse.json")
				.done(function(oFakeVariantResponse) {
					this.oResponse = {};
					this.oResponse.changes = oFakeVariantResponse;

					sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));

					this.aRevertedChanges = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].changes
						.map(function(oChangeContent) {
							var oChange =  new Change(oChangeContent);
							oChange._aDependentIdList = [];
							return oChange;
						});

					this.aExpectedChanges = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[1].changes
						.map(function(oChangeContent) {
							var oChange = new Change(oChangeContent);
							oChange._aDependentIdList = [];
							return oChange;
						});

					/*To prepare VariantController data*/
					this.oFlexController._oChangePersistence.loadChangesMapForComponent(this.oComponent, this.mPropertyBag)
						.then(function() {
							var oData = this.oFlexController.getVariantModelData();
							this.oModel = new VariantModel(oData, this.oFlexController, this.oComponent);
							sandbox.stub(this.oComponent, "getModel").returns(this.oModel);
							this.oModelRemoveChangeStub = sandbox.stub(this.oModel, "_removeChange");
							this.oModelAddChangeStub = sandbox.stub(this.oModel, "_addChange");
							done();
						}.bind(this));

				}.bind(this));
		},
		afterEach : function(assert) {
			sandbox.restore();
			delete this.oFlexController;
			delete this.aRevertedChanges;
			delete this.aExpectedChanges;
			delete this.oResponse;
			delete this.oComponent;
			delete this.mPropertyBag;
		}
	});


	QUnit.test("when '_updateCurrentVariant' is triggered from the component model to carry switch and revert of changes", function(assert) {
		assert.expect(19);

		assert.ok(this.oFlexController._oChangePersistence._mChanges.mDependencies[this.aRevertedChanges[1].getId()] instanceof Object);
		fnGetChanges.call(this, this.aRevertedChanges, "RTADemoAppMD---detail--GroupElementDatesShippingStatus", 7, assert);

		var sCurrentVariant = this.oModel.getCurrentVariantReference("idMain1--variantManagementOrdersTable");
		assert.equal(sCurrentVariant, "variant0", "the current variant key before switch is correct");
		var oCurrentVariant = this.oModel.getVariant("variant0");
		assert.equal(oCurrentVariant.content.fileName, "variant0", "'getVariant' of the model returns the correct variant object");

		return this.oModel.updateCurrentVariant("idMain1--variantManagementOrdersTable", "idMain1--variantManagementOrdersTable")
		/*Dependencies still not updated as control doesn't exist*/

		.then(function() {
			assert.ok(this.oFlexController._oChangePersistence._mChanges.mDependencies[this.aExpectedChanges[1].getId()] instanceof Object);
			fnGetChanges.call(this, this.aExpectedChanges, "RTADemoAppMD---detail--GroupElementDatesShippingStatus", 7, assert);

			sCurrentVariant = this.oModel.getCurrentVariantReference("idMain1--variantManagementOrdersTable");
			assert.equal(sCurrentVariant, "idMain1--variantManagementOrdersTable", "the current variant key after switch is correct");
		}.bind(this));
	});

	QUnit.test("when triggering _addChange and _removeChange on a control via the VariantModel", function(assert) {
		var oMockControl = new Text("RTADemoAppMD---detail--GroupElementDatesShippingStatus");

		var mCustomData = {aCustomDataEntries : [this.aRevertedChanges[1].getId()]};
		sandbox.stub(this.oFlexController, "_getAppliedCustomData").returns(mCustomData);
		sandbox.stub(this.oFlexController._oChangePersistence, "_addPropagationListener");


		this.oFlexController.deleteChange(this.aRevertedChanges[1], this.oComponent);
		assert.ok(this.oModelRemoveChangeStub.calledOnce, "remove change was called from model");


		this.oFlexController.addPreparedChange(this.aExpectedChanges[1], this.oComponent);
		assert.ok(this.oModelAddChangeStub.calledOnce, "add change was called from model");

		oMockControl.destroy();
	});

	QUnit.module("Given a VariantController with variants", {
		beforeEach : function(assert) {
			this.oChangeContent0 = {"fileName":"change0", "variantReference": "variant0"};
			this.oChangeContent1 = {"fileName":"change1", "variantReference": "variant0"};
			this.oChangeContent2 = {"fileName":"change2"};

			var oFakeVariantResponse = {
				"changes" : {
					"variantSection" : {
						"variantManagementId" : {
							"variants" : [{
								"content" : {
									"fileName": "variant0",
									"title": "variant 0"
								},
								"changes" : [this.oChangeContent0, this.oChangeContent1]
							},
							{
								"content" : {
									"fileName": "variant1",
									"title": "variant 1",
									"variantReference": "variant0"
								},
								"changes" : []
							}]
						}
					}
				}
			};

			this.oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
		},
		afterEach : function(assert) {
			delete this.oVariantController;
		}
	});

	QUnit.test("when calling 'addChangeToVariant' of the VariantController", function(assert) {
		var oChangeToBeAdded1 = new Change(this.oChangeContent2);
		var oChangeToBeAdded2 = new Change(this.oChangeContent1);
		var bSuccess1 = this.oVariantController.addChangeToVariant(oChangeToBeAdded1, "variantManagementId", "variant0");
		var bSuccess2 = this.oVariantController.addChangeToVariant(oChangeToBeAdded2, "variantManagementId", "variant0");

		assert.ok(bSuccess1, "then adding a change was successful");
		assert.notOk(bSuccess2, "then adding an already existing change was unsuccessful");

		var aChanges = this.oVariantController.getVariantChanges("variantManagementId", "variant0");
		assert.equal(aChanges.length, 3, "and the number of changes in the variant is correct");
		assert.equal(aChanges[2], this.oChangeContent2, "and the lately added change is at the end of the changes array");
	});

	QUnit.test("when calling 'removeChangeFromVariant' of the VariantController", function(assert) {
		var oChangeToBeRemoved = new Change(this.oChangeContent1);
		var bSuccess = this.oVariantController.removeChangeFromVariant(oChangeToBeRemoved, "variantManagementId", "variant0");
		assert.ok(bSuccess, "then removing a change was successful");

		var aChanges = this.oVariantController.getVariantChanges("variantManagementId", "variant0");
		assert.equal(aChanges.length, 1, "and the number of changes in the variant is correct");
		assert.equal(aChanges[0], this.oChangeContent0, "and the remaining change is the correct one");
	});

});
