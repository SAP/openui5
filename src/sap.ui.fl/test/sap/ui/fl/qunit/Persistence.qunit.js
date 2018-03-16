/*global QUnit, sinon*/
sap.ui.require([
		"sap/ui/fl/Persistence",
		"sap/ui/fl/Utils",
		"sap/ui/fl/Change",
		"sap/ui/fl/DefaultVariant",
		"sap/ui/fl/LrepConnector",
		"sap/ui/core/Control",
		"sap/ui/fl/Cache"
	],
function( Persistence, utils, Change, defaultVariant, LrepConnector, Control, Cache) {
	'use strict';

	var oGetLayerStub;
	var oControl;
	var ui5Control;
	var sandbox = sinon.sandbox.create();

	var oChangeOJson = {
		changes: {
			changes: [
				{
					fileName: "0815_1",
					layer: "VENDOR",
					fileType: "variant",
					namespace: "localchange1",
					changeType: "filterVariant",
					creation: "2014-10-22T08:51:49.6376240Z",
					reference: "smartFilterBar",
					selector: {"persistencyKey": "control1"},
					conditions: {},
					content: {something: "createNewVariant"},
					texts: {
						variantName: {
							value: "myVariantName",
							type: "myTextType"
						}
					},
					originalLanguage: "DE",
					support: {
						generator: "Dallas beta 1",
						user: "SOMEELSE",
						service: "someService"
					}
				},
				{
					fileName: "0815_2",
					layer: "USER",
					fileType: "variant",
					namespace: "localchange2",
					changeType: "setDefaultVariant",
					creation: "2014-10-22T08:52:49.6376240Z",
					reference: "smartFilterBar",
					selector: {"persistencyKey": "control1"},
					conditions: {something: "setVariantToDefault"},
					content: {},
					texts: {
						variantName: {
							value: "myVariantName2",
							type: "myTextType"
						}
					},
					originalLanguage: "DE",
					support: {
						generator: "Dallas beta 1",
						user: "ME"
					}
				},
				{
					fileName: "0815_3",
					fileType: "change",
					layer: "USER",
					namespace: "localchange2",
					changeType: "setDefaultVariant",
					creation: "2014-10-22T08:52:49.6376240Z",
					reference: "smartFilterBar",
					selector: {"persistencyKey": "control2"},
					conditions: {something: "setVariantToDefault"},
					content: {},
					texts: {
						variantName: {
							value: "myVariantName3",
							type: "myTextType"
						}
					},
					originalLanguage: "DE",
					support: {
						generator: "Dallas beta 1",
						user: "ME"
					}
				}
			],
			messagebundle: {}
		},
		componentClassName: "smartFilterBar.Component"
	};

	sinon.config.useFakeTimers = false;

	QUnit.module("sap.ui.fl.Persistence", {
		beforeEach: function() {
			oControl = {
				_sOwnerId: "testId",
				getProperty: function(sPropertyName) {
					if (sPropertyName === "persistencyKey") {
						return "control1";
					} else {
						return "";
					}
				},
				getId: function() {
					return 'controlId';
				},
				getPersistencyKey: function() {
					return "control1";
				},
				getParent: function () {
					return undefined;
				}
			};

			sandbox.stub(utils,"getAppDescriptor").returns({
				"sap.app":{
					id: "myapp",
					applicationVersion: {
						version: "1.0.0"
					}
				}
			});

			sandbox.stub(utils,"getAppVersionFromManifest").returns("1.0.0");
			sandbox.stub(utils,"getAppComponentForControl").returns({getManifest : function(){}});

			Cache.setActive(false);

			oGetLayerStub = sandbox.stub(utils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(utils, "getComponentClassName").returns("testComponent");

			this.oPersistence = new Persistence(oControl, "persistencyKey");
			this.oPersistence._oChangePersistence._mVariantsChanges = {};
		},
		afterEach: function() {
			sandbox.restore();

			Cache.setActive(true);

			if (ui5Control) {
				ui5Control.destroy();
			}
		}
	});

	QUnit.test('initialization - stable id property name should be taken from the given parameter', function(assert) {
		var stableProperty = 'stableProp';

		var persistence = new Persistence(oControl, stableProperty);

		assert.equal(persistence._sStableIdPropertyName, stableProperty);
	});

	QUnit.test('initialization - stable id property name should default to the controls id', function(assert) {
		ui5Control = new Control('someId');
		var persistence = new Persistence(ui5Control);
		assert.equal(persistence._sStableIdPropertyName, 'id');
	});

	QUnit.test('initialization - shall use the getId method if the id is the stable id', function(assert) {
		var persistence = new Persistence(oControl, 'id');
		assert.equal(persistence._sStableId, oControl.getId());
	});

	QUnit.test("sap.ui.fl.Persistence.getChanges", function(assert) {
		sandbox.stub(LrepConnector.prototype, "loadChanges").returns(Promise.resolve(oChangeOJson));

		return this.oPersistence.getChanges().then(function(oResult) {
			assert.equal(Object.keys(oResult).length, 2);
		});
	});

	QUnit.test("sap.ui.fl.Persistence.addChange and getChange", function(assert) {
		sandbox.stub(LrepConnector.prototype, "loadChanges").returns(Promise.resolve(oChangeOJson));
		var that = this;
		return this.oPersistence.getChanges().then(function() {
			var mParameters = {
				type: "filterVariant",
				ODataService: "oDataService",
				texts: {variantName: "myVariantName"},
				content: {myContent: "something"},
				isVariant: true,
				packageName: "",
				isUserDependend: true,
				validAppVersions: {
					creation: "1.0.0",
					from: "1.0.0"
				}
			};
			var sChangeId = that.oPersistence.addChange(mParameters);

			assert.equal(Object.keys(that.oPersistence._oChanges).length, 3);

			var oNewChange = that.oPersistence.getChange(sChangeId);

			assert.ok(typeof oNewChange === "object");

			assert.equal(oNewChange.getComponent(), "testComponent");
			assert.equal(oNewChange.getContent().myContent, "something");
			assert.equal(oNewChange.getLayer(), "VENDOR");
			assert.equal(oNewChange.getPackage(), "");
			assert.equal(oNewChange.getPendingAction(), "NEW");
			assert.equal(oNewChange.getText("variantName"), "myVariantName");
			assert.equal(oNewChange.isVariant(), true);
			assert.deepEqual(oNewChange._oDefinition.validAppVersions, {creation: "1.0.0", from: "1.0.0"});
		});

	});

	QUnit.test("getExecuteOnSelect shall return null if there are no changes", function(assert) {

		sandbox.stub(this.oPersistence, 'getChanges').returns(Promise.resolve({}));

		//Call CUT
		return this.oPersistence.getExecuteOnSelect().then(function(bFlag) {
			assert.equal(bFlag, null);
		});
	});

	QUnit.test("getExecuteOnSelectSync shall return the execute on select flag synchronously", function(assert) {

		var sampleChanges = {
			"changes": {
				"changes": [
					{},
					{
						"fileName": "005056AB1D001ED4968654C88CB2A21F",
						"fileType": "change",
						"changeType": "standardVariant",
						"namespace": "localchange",
						"content": {
							"executeOnSelect": true
						},
						"selector": {
							"persistencyKey": "control1"
						},
						"layer": "USER",
						"originalLanguage": "EN"
					}
				]
			}
		};

		sandbox.stub(this.oPersistence._oChangePersistence._oConnector, 'loadChanges').returns(Promise.resolve(sampleChanges));

		var persistence = this.oPersistence;
		var bExecuteOnDefault = sampleChanges.changes.changes[1].content.executeOnSelect;

		var defaultExecuteOnSelectBeforeChangesHaveBeenFetched = persistence.getExecuteOnSelectSync();

		assert.strictEqual(defaultExecuteOnSelectBeforeChangesHaveBeenFetched, null);

		return persistence.getChanges().then(function() {
			var defaultExecuteOnSelectAfterChangesHaveBeenFetched = persistence.getExecuteOnSelectSync();

			assert.strictEqual(defaultExecuteOnSelectAfterChangesHaveBeenFetched, bExecuteOnDefault);
		});
	});

	QUnit.test("getDefaultVariantId shall return an empty string if there are no changes", function(assert) {

		sandbox.stub(this.oPersistence, 'getChanges').returns(Promise.resolve({}));

		//Call CUT
		return this.oPersistence.getDefaultVariantId().then(function(sDefaultVariantId) {
			assert.equal(sDefaultVariantId, "");
		});
	});

	QUnit.test("getDefaultVariantIdSync shall return the default change id synchronously", function(assert) {

		var sampleChanges = {
			"changes": {
				"changes": [
					{},
					{
						"fileName": "005056AB1D001ED4968654C88CB2A21E",
						"fileType": "change",
						"changeType": "defaultVariant",
						"namespace": "localchange",
						"content": {
							"defaultVariantName": "theDefaultVariantYo"
						},
						"selector": {
							"persistencyKey": "control1"
						},
						"layer": "USER",
						"originalLanguage": "EN"
					}
				]
			}
		};

		sandbox.stub(this.oPersistence._oChangePersistence._oConnector, 'loadChanges').returns(Promise.resolve(sampleChanges));

		var persistence = this.oPersistence;
		var defaultVariantId = sampleChanges.changes.changes[1].content.defaultVariantName;

		var defaultVariantIdBeforeChangesHaveBeenFetched = persistence.getDefaultVariantIdSync();

		assert.strictEqual(defaultVariantIdBeforeChangesHaveBeenFetched, '');

		return persistence.getChanges().then(function() {
			var defaultVariantIdAfterChangesHaveBeenFetched = persistence.getDefaultVariantIdSync();

			assert.strictEqual(defaultVariantIdAfterChangesHaveBeenFetched, defaultVariantId);
		});
	});

	QUnit.test("setDefaultVariantIdSync shall create a new change file for the default variant", function(assert) {
		ui5Control = new Control('someId');
		var persistence = new Persistence(ui5Control);

		//Call CUT
		var oChange = persistence.setDefaultVariantIdSync("rominikum");

		assert.ok(oChange);
		assert.ok(oChange instanceof Change);
		assert.equal(oChange.getContent().defaultVariantName, "rominikum");
		assert.deepEqual(oChange.getSelector(), {
			'id': 'someId'
		});

		assert.strictEqual(oChange.getPendingAction(), 'NEW');
	});

	QUnit.test("setDefaultVariantIdSync shall write the new change into the session state", function(assert) {
		var oChange;

		//Call CUT
		oChange = this.oPersistence.setDefaultVariantIdSync("bullabo");

		assert.equal(this.oPersistence._oChanges[oChange.getId()], oChange);
	});

	QUnit.test("setDefaultVariantIdSync shall create a new change file even if the defaultVariantId is the empty string (Standard Variant)", function(assert) {
		var oChange;

		//Call CUT
		oChange = this.oPersistence.setDefaultVariantIdSync("");
		assert.ok(oChange);
		assert.strictEqual(oChange.getContent().defaultVariantName, "");
	});

	QUnit.test('setDefaultVariantIdSync shall update the existing default variant change', function(assert) {
		var oOldChange = this.oPersistence.setDefaultVariantIdSync('oldVariantId');

		var oNewChange = this.oPersistence.setDefaultVariantIdSync('newVariantId');

		assert.strictEqual(oNewChange, oOldChange);
		assert.strictEqual(oNewChange.getContent().defaultVariantName, 'newVariantId');
	});

	QUnit.test("sap.ui.fl.Persistence.addChange shall provide an API to set the id (fileName) of the new file", function(assert) {

		var mParameters = {
			type: "filterVariant",
			id: "LethGarminil",
			ODataService: "Gargamoth",
			content: {myContent: "something"}
		};
		var sChangeId = this.oPersistence.addChange(mParameters);
		assert.equal(sChangeId, "LethGarminil");
	});

	QUnit.test("sap.ui.fl.Persistence.isVariantDownport shall return true if layer==VENDOR and hotfix==true", function(assert) {
		oGetLayerStub.restore();
		sandbox.stub(utils, "isHotfixMode").returns(true);
		sandbox.stub(utils, "getCurrentLayer").returns('VENDOR');

		var sIsVariantDownport = this.oPersistence.isVariantDownport();

		assert.strictEqual(sIsVariantDownport, true);
	});

	QUnit.test("sap.ui.fl.Persistence.isVariantDownport shall return false if layer!=VENDOR", function(assert) {
		oGetLayerStub.restore();
		sandbox.stub(utils, "getCurrentLayer").returns('CUSTOMER');

		var sIsVariantDownport = this.oPersistence.isVariantDownport();

		assert.strictEqual(sIsVariantDownport, false);
	});

	QUnit.test("sap.ui.fl.Persistence.isVariantDownport shall return false if hotfixmode is switched off", function(assert) {
		sandbox.stub(utils, "isHotfixMode").returns(false);

		var sIsVariantDownport = this.oPersistence.isVariantDownport();

		assert.strictEqual(sIsVariantDownport, false);
	});

});
