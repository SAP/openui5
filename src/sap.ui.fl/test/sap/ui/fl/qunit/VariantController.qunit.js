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
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/ui/fl/ChangePersistenceFactory"
], function(LrepConnector, FakeLrepConnector, Cache, Change, ChangePersistence, VariantController, FlexControllerFactory, Utils, ChangePersistenceFactory) {
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
		},
		afterEach : function(assert) {
			sandbox.restore();
		}
	});

	QUnit.test("when create change which is variant and send it to LrepConnector", function(assert) {
		var done = assert.async();
		jQuery.getJSON("./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				return oFakeLrepConnector.create(oFakeVariantResponse, "testChangeList", true).then(function(result){
					assert.deepEqual(result.response, oFakeVariantResponse , "then an exact payload was returned.");
					assert.equal(result.status, 'success' , "successfully.");
					done();
				});
		 });
	});

	QUnit.test("when calling 'getVariants' of the VariantController", function(assert) {
		var done = assert.async();
		jQuery.getJSON("./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
				var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
				var aExpectedVariants = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants;
				var aVariants = oVariantController.getVariants("variantManagementOrdersTable");
				assert.deepEqual(aExpectedVariants, aVariants, "then the variants of a given variantManagmentId are returned");
				done();
		 });
	});

	QUnit.test("when calling 'getVariants' of the VariantController with an invalid variantManagementId", function(assert) {
		var done = assert.async();
		jQuery.getJSON("./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
				var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
				var aVariants =  oVariantController.getVariants("invalidVariantManagementId");
				assert.equal(aVariants.length, 0, "then an empty array is returned");
				done();
		 });
	});

	QUnit.test("when calling 'getVariantChanges' of the VariantController", function(assert) {
		var done = assert.async();
		jQuery.getJSON("./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
				var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
				var aExpectedDefChanges = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[0].changes;
				var aExpectedChanges = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[1].changes;
				var aDefChanges = oVariantController.getVariantChanges("variantManagementOrdersTable");
				var aChanges = oVariantController.getVariantChanges("variantManagementOrdersTable", "variant1");
				assert.deepEqual(aExpectedDefChanges, aDefChanges, "then the changes of the default variant are returned");
				assert.deepEqual(aExpectedChanges, aChanges, "then the changes of the given variant are returned");
				done();
		 });
	});

	QUnit.test("when calling 'loadVariantChanges' of the VariantController without changes in variant", function(assert) {
		var done = assert.async();
		jQuery.getJSON("./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
				var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
				var aExpChanges1 = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[0].changes;
				var aExpChanges2 = oFakeVariantResponse.changes.variantSection["variantManagementOrdersObjectPage"].variants[0].changes;
				var aExpectedChanges = aExpChanges1.concat(aExpChanges2);
				var aChanges = oVariantController.loadDefaultChanges();
				assert.deepEqual(aExpectedChanges, aChanges, "then the changes of the given variant are returned");
				done();
		 });
	});

	QUnit.test("when calling 'getChangesForComponent' of the ChangePersistence", function(assert) {
		var done = assert.async();
		jQuery.getJSON("./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
			var aExpectedChanges0 = oFakeVariantResponse.changes.changes;
			var aExpectedChanges1 = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[0].changes;
			var aExpectedChanges2 = oFakeVariantResponse.changes.variantSection["variantManagementOrdersObjectPage"].variants[0].changes;
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
				assert.deepEqual(aChanges, aExpectedChanges, "the variant changes are available together with the ");
				done();
			});
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
							"fileName": "variant0",
							"changes" : [oChangeContent0, oChangeContent1, oChangeContent2]
						},
						{
							"fileName": "variant1",
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

		var oVariantController = new VariantController("MyComponent", "1.2.3", oFakeVariantResponse);
		var mChanges = oVariantController.getChangesForVariantSwitch("variantManagementId", "variant0", "variant1");
		assert.deepEqual(mChanges, {aNew : [aChanges[3], aChanges[4]], aRevert : [aChanges[2], aChanges[1]]}, "then the switches map is returned");
	});

	QUnit.test("when calling 'loadChangesMapForComponent' and afterwards 'loadSwitchChangesMapForComponent' of the ChangePersistence", function(assert) {
		var done = assert.async();
		jQuery.getJSON("./testResources/FakeVariantLrepResponse.json")
		 .done(function(oFakeVariantResponse) {
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
				var oRevertedChange = new Change(oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[0].changes[1]);

				var oNewChange = new Change(oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[1].changes[1]);

				var mExpectedSwitches = {
					aRevert : [oRevertedChange],
					aNew : [oNewChange]
				};

				var oComponent = {
					name: "MyComponent",
					appVersion: "1.2.3",
					getId : function() {return "RTADemoAppMD";}
				};
				this.oChangePersistence = new ChangePersistence(oComponent);
				this.oChangePersistence._oVariantController._mVariantManagement = oFakeVariantResponse.changes.variantSection;

				this.mPropertyBag = {viewId: "view1--view2"};
				var mSwitches = this.oChangePersistence.loadSwitchChangesMapForComponent("variantManagementOrdersTable", "variant0", "variant1");
				assert.deepEqual(mSwitches, mExpectedSwitches, "the expected changes are in the switches map");
				done();
		 });
	});

	//Integration test
	QUnit.test("when calling 'switchChangesAndPropagate'", function(assert) {
		var done = assert.async();
		jQuery.getJSON("./testResources/FakeVariantLrepResponse.json")
			.done(function(oFakeVariantResponse) {
				assert.expect(16);
				sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oFakeVariantResponse));
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

				var aRevertedChanges = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[0].changes
					.map(function(oChangeContent) {
						var oChange =  new Change(oChangeContent);
						oChange._aDependentIdList = [];
						return oChange;
					});

				var aExpectedChanges = oFakeVariantResponse.changes.variantSection["variantManagementOrdersTable"].variants[1].changes
					.map(function(oChangeContent) {
						var oChange =  new Change(oChangeContent);
						oChange._aDependentIdList = [];
						return oChange;
				});

				this.mPropertyBag = {viewId: "view1--view2"};

				return this.oFlexController._oChangePersistence.loadChangesMapForComponent(oComponent, this.mPropertyBag)
				.then(function() {
					assert.ok(this.oFlexController._oChangePersistence._mChanges.mDependencies[aRevertedChanges[1].getKey()] instanceof Object);
					fnGetChanges.call(this, aRevertedChanges, "RTADemoAppMD---detail--GroupElementDatesShippingStatus", 7, assert);

					FlexControllerFactory.switchChangesAndPropagate(oComponent, "variantManagementOrdersTable", "variant0", "variant1");

					assert.ok(this.oFlexController._oChangePersistence._mChanges.mDependencies[aExpectedChanges[1].getKey()] instanceof Object);
					fnGetChanges.call(this, aExpectedChanges, "RTADemoAppMD---detail--GroupElementDatesShippingStatus", 7, assert);

					done();
				}.bind(this));
			});
	});

});
