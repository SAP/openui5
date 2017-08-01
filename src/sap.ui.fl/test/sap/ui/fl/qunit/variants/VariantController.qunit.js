/*global sinon QUnit */
jQuery.sap.require("sap.ui.qunit.qunit-coverage");

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/LrepConnector",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/fl/Cache",
	"sap/ui/fl/Change",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/variants/VariantController",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory"
], function(LrepConnector, FakeLrepConnector, Cache, Change, ChangePersistence, VariantController, VariantModel, FlexControllerFactory, Utils, ChangePersistenceFactory) {
	"use strict";
	sinon.config.useFakeTimers = false;
	QUnit.start();

	var sandbox = sinon.sandbox.create();

	var oFakeLrepConnector = new FakeLrepConnector("Dummy path");

	var fnGetChanges = function(aChanges, sSelectorId, iLength, assert){
		var aVarMgmtChanges = this.oFlexController._oChangePersistence._mChanges.mChanges[sSelectorId]
			.map(function(oChange) {
				return oChange.getDefinition().fileName;
			});

		for (var i = 0; i < aChanges.length; i++){

			var iIndex = aVarMgmtChanges.indexOf(aChanges[i].getDefinition().fileName);
			assert.ok(iIndex > -1, "change present in current map");
			assert.ok(jQuery.isArray(this.oFlexController._oChangePersistence._mChanges.mDependencies[aChanges[i].getKey()].dependencies), "dependency map present for change in current map");
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

	QUnit.test("when calling 'getVariants' of the VariantController", function(assert) {
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
		var oVariantController = new VariantController("MyComponent", "1.2.3", this.oResponse);
		var aExpectedVariants = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants;
		var aVariants = oVariantController.getVariants("idMain1--variantManagementOrdersTable");
		assert.deepEqual(aExpectedVariants, aVariants, "then the variants of a given variantManagmentId are returned");
		assert.equal(aVariants[0].content.fileName, "idMain1--variantManagementOrdersTable", "and ordered with standard variant first");
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

	QUnit.test("when calling 'getChangesForVariantSwitch' of the VariantController", function(assert) {
		var oChangeContent0 = {"fileName":"change0"};
		var oChangeContent1 = {"fileName":"change1"};
		var oChangeContent2 = {"fileName":"change2"};
		var oChangeContent3 = {"fileName":"change3"};
		var oChangeContent4 = {"fileName":"change4"};

		var oFakeVariantResponse = {
			"changes" : {
				"variantSection" : {
					"variantManagementId" : {
						"variants" : [{
							"content" : {
								"fileName": "variant0"
							},
							"changes" : [oChangeContent0, oChangeContent1, oChangeContent2]
						},
						{
							"content" : {
								"fileName": "variant1"
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
		//var oRevertedChange = new Change(this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].changes[1]);

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
		var done = assert.async();
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
								]
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
								]
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
								]
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
		var oData = oVariantController._fillVariantModel();
		assert.propEqual(oData, oExpectedData, "then correct variant model data is returned");
		done();
	});

	//Integration test
	QUnit.test("when calling 'switchChangesAndPropagate'", function(assert) {
		var done = assert.async();
		assert.expect(18);
		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(this.oResponse));
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
		var oComponent = {
			name: "MyComponent",
			appVersion: "1.2.3",
			getId : function() {return "RTADemoAppMD";},
			getManifestObject : function() {return oManifest;}
		};

		this.oFlexController = FlexControllerFactory.createForControl(oComponent, oManifest);

		var aRevertedChanges = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[0].changes
			.map(function(oChangeContent) {
				var oChange =  new Change(oChangeContent);
				oChange._aDependentIdList = [];
				return oChange;
			});

		var aExpectedChanges = this.oResponse.changes.variantSection["idMain1--variantManagementOrdersTable"].variants[1].changes
			.map(function(oChangeContent) {
				var oChange =  new Change(oChangeContent);
				oChange._aDependentIdList = [];
				return oChange;
		});

		var oData, oModel, sCurrentVariant;
		this.mPropertyBag = {viewId: "view1--view2"};

		return this.oFlexController._oChangePersistence.loadChangesMapForComponent(oComponent, this.mPropertyBag)
			.then(function() {
				assert.ok(this.oFlexController._oChangePersistence._mChanges.mDependencies[aRevertedChanges[1].getKey()] instanceof Object);
				fnGetChanges.call(this, aRevertedChanges, "RTADemoAppMD---detail--GroupElementDatesShippingStatus", 7, assert);
				//this.oFlexController._oChangePersistence._mChanges.mChanges = {"dummyControlSelector": aRevertedChanges};

				oData = this.oFlexController.getVariantModelData();
				oModel = new VariantModel(oData, this.oFlexController, oComponent);

				sCurrentVariant = oModel.getCurrentVariantRef("idMain1--variantManagementOrdersTable");
				assert.equal(sCurrentVariant, "variant0", "the current variant key before switch is correct");
				oModel._updateCurrentVariant("idMain1--variantManagementOrdersTable", "idMain1--variantManagementOrdersTable")
				.then(function() {
					assert.ok(this.oFlexController._oChangePersistence._mChanges.mDependencies[aExpectedChanges[1].getKey()] instanceof Object);
					fnGetChanges.call(this, aExpectedChanges, "RTADemoAppMD---detail--GroupElementDatesShippingStatus", 7, assert);

					sCurrentVariant = oModel.getCurrentVariantRef("idMain1--variantManagementOrdersTable");
					assert.equal(sCurrentVariant, "idMain1--variantManagementOrdersTable", "the current variant key after switch is correct");

					done();
				}.bind(this));
			}.bind(this));
	});

});
