/*global QUnit, sinon*/
jQuery.sap.require("sap.ui.fl.Persistence");
jQuery.sap.require("sap.ui.fl.Utils");
jQuery.sap.require("sap.ui.fl.Change");
jQuery.sap.require('sap.ui.fl.DefaultVariant');
jQuery.sap.require('sap.ui.fl.LrepConnector');
jQuery.sap.require('sap.ui.core.Control');
jQuery.sap.require("sap.ui.fl.Cache");
jQuery.sap.require("sap.ui.fl.registry.Settings");

(function(utils, Persistence, Control, defaultVariant, Change, LrepConnector, Cache, Settings) {
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
					id: "myapp"
				}
			});

			Cache.setActive(false);

			oGetLayerStub = sandbox.stub(utils, "getCurrentLayer").returns("VENDOR");
			sandbox.stub(utils, "getComponentClassName").returns("testComponent");

			this.oPersistence = new Persistence(oControl, "persistencyKey");
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

	QUnit.test('setComponentName, getComponentName', function(assert) {
		var oPersistence, sComponentName;

		oPersistence = new Persistence();

		//Call CUT
		oPersistence.setComponentName("mongaboshi");
		sComponentName = oPersistence.getComponentName();

		assert.equal(sComponentName, "mongaboshi");
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

	QUnit.test("sap.ui.fl.Persistence.getComponentChanges", function(assert) {
		sandbox.stub(LrepConnector.prototype, "loadChanges").returns(Promise.resolve(oChangeOJson));

		return this.oPersistence.getComponentChanges().then(function(oResult) {
			assert.equal(Object.keys(oResult).length, 3);
		});
	});

	QUnit.test("sap.ui.fl.Persistence.getChanges shall reject when the SAPUI5 component is unknown", function(assert) {
		this.oPersistence._sComponentName = undefined;

		return this.oPersistence.getChanges()['catch'](function() {
			assert.ok(true, "Promise shall reject");
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
				isUserDependend: true
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
						"fileName": "005056AB1D001ED4968654C88CB2A21E",
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

		sandbox.stub(this.oPersistence._oConnector, 'loadChanges').returns(Promise.resolve(sampleChanges));

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

		sandbox.stub(this.oPersistence._oConnector, 'loadChanges').returns(Promise.resolve(sampleChanges));

		var persistence = this.oPersistence;
		var defaultVariantId = sampleChanges.changes.changes[1].content.defaultVariantName;

		var defaultVariantIdBeforeChangesHaveBeenFetched = persistence.getDefaultVariantIdSync();

		assert.strictEqual(defaultVariantIdBeforeChangesHaveBeenFetched, '');

		return persistence.getChanges().then(function() {
			var defaultVariantIdAfterChangesHaveBeenFetched = persistence.getDefaultVariantIdSync();

			assert.strictEqual(defaultVariantIdAfterChangesHaveBeenFetched, defaultVariantId);
		});
	});

	QUnit.test("saveAll should use the lrep connector to create the change in the backend if pending action is NEW", function(assert) {
		var oResponse = {};
		sandbox.stub(LrepConnector.prototype, "loadChanges").returns(Promise.resolve(oChangeOJson));
		var that = this;
		var spy;

		return this.oPersistence.getChanges().then(function() {
			var mParameters = {
				type: "filterBar",
				ODataService: "LineItems",
				texts: {variantName: "myVariantName"},
				content: {
					filterBarVariant: {},
					filterbar: [
						{
							group: "CUSTOM_GROUP",
							name: "MyOwnFilterField",
							partOfVariant: true,
							visibleInFilterBar: true
						}
					]
				},
				isVariant: true,
				packageName: "",
				isUserDependend: true
			};

			var sChangeId = that.oPersistence.addChange(mParameters);
			assert.ok(sChangeId);

			var oNewChange = that.oPersistence.getChange(sChangeId);
			spy = sandbox.spy(oNewChange, "getPendingAction");
			sandbox.stub(LrepConnector.prototype, "create").returns(Promise.resolve(oResponse));

			return that.oPersistence.saveAll();

		}).then(function(aResults) {
			assert.ok(jQuery.isArray(aResults));
			assert.equal(aResults.length, 1);
			assert.strictEqual(aResults[0], oResponse);
			assert.equal(spy.returnValues[0], "NEW");
		});
	});

	QUnit.test("saveAll should use the lrep connector to delete the change in the backend", function(assert) {
		var oResponse = {};
		sandbox.stub(LrepConnector.prototype, "loadChanges").returns(Promise.resolve(oChangeOJson));
		var that = this;
		var changeId = oChangeOJson.changes.changes[1].fileName;

		var deleteChangeStub = sandbox.stub(this.oPersistence._oConnector, 'deleteChange').returns(Promise.resolve(oResponse));

		return this.oPersistence.getChanges().then(function() {

			var change = that.oPersistence.getChange(changeId);
			change.markForDeletion();

			return that.oPersistence.saveAll();
		}).then(function(aResults) {
			assert.ok(jQuery.isArray(aResults));
			assert.equal(aResults.length, 1);
			assert.strictEqual(aResults[0], oResponse);
			var bIsVariant = true;
			sinon.assert.calledWith(deleteChangeStub, {
				sChangeName: "0815_2",
				sChangelist: "",
				sLayer: "USER",
				sNamespace: "localchange2"
			}, bIsVariant);
		});
	});

	QUnit.test("saveAll should trigger an event to delete the change in all Persistence instances", function(assert) {
		var bEventCaught = false;
		var sEventChangeId = '';
		sandbox.stub(LrepConnector.prototype, "loadChanges").returns(Promise.resolve(oChangeOJson));
		var that = this;
		var changeId = oChangeOJson.changes.changes[1].fileName;

		sandbox.stub(this.oPersistence._oConnector, 'deleteChange').returns(Promise.resolve({}));

		var fEventHandler = function(oEvent) {
			bEventCaught = true;
			sEventChangeId = oEvent.getParameter("id");
		};

		return this.oPersistence.getChanges().then(function() {
			var change = that.oPersistence.getChange(changeId);
			change.markForDeletion();
			change.attachEvent(Change.events.markForDeletion, fEventHandler);

			return that.oPersistence.saveAll();
		}).then(function() {
			assert.ok(bEventCaught, "Event handler shall be caught");
			assert.equal(sEventChangeId, changeId);
		});
	});

	QUnit.test("saveAll shall reject if the backend raises an error", function(assert) {
		sandbox.stub(LrepConnector.prototype, "loadChanges").returns(Promise.resolve(oChangeOJson));
		var that = this;

		sandbox.stub(this.oPersistence._oConnector, 'deleteChange').returns(Promise.reject({
			messages: [
				{text: "Backend says: Boom"}
			]
		}));

		return this.oPersistence.getChanges().then(function() {
			var change = that.oPersistence.getChange(oChangeOJson.changes.changes[1].fileName);
			change.markForDeletion();
			//Call CUT
			return that.oPersistence.saveAll();
		})['catch'](function(err) {
			assert.equal(err.messages[0].text, "Backend says: Boom");
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

	QUnit.test("setDefaultVariantId shall get the changes and update the default variant change", function(assert) {
		var getChangesStub = sandbox.stub(this.oPersistence, 'getChanges').returns(Promise.resolve({}));

		var persistence = this.oPersistence;

		return persistence.setDefaultVariantId('theNewDefaultVariantYeah').then(function(oUpdatedChange) {
			sinon.assert.called(getChangesStub);
			assert.strictEqual(oUpdatedChange.getContent().defaultVariantName, 'theNewDefaultVariantYeah');
		});
	});

	QUnit.test("_getSelector should return a map containing the stableIdPropertyName as key and its value as value", function(assert) {
		var selector = this.oPersistence._getSelector();

		var expSelector = {};
		expSelector["persistencyKey"] = "control1";

		assert.deepEqual(selector, expSelector);
	});

	QUnit.test("shall read the data from sap.ui.fl.Cache only once", function(assert) {
		var oPersistence = this.oPersistence;
		assert.strictEqual(oPersistence._bHasLoadedChangesFromBackend, false);

		sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve([]));

		return this.oPersistence.getChanges(true).then(function() {
			assert.strictEqual(oPersistence._bHasLoadedChangesFromBackend, true);
			return oPersistence.getChanges();
		}).then(function() {
			sinon.assert.calledOnce(Cache.getChangesFillingCache);
		});
	});

	QUnit.test("sap.ui.fl.Persistence.addChangeFile", function(assert) {
		var oChange;
		var oChangeFile = Change.createInitialFileContent({reference: "testcomponent"});
		oChange = this.oPersistence.addChangeFile(oChangeFile);

		assert.ok(oChange, "Change shall be created");
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

	QUnit.test("removeChangeFromPersistence shall remove the given change", function(assert) {
		var mParameters = {
			changeType: "filterVariant",
			reference: "testcomponent"
		};

		var mParameters2 = {
			changeType: "filterVariant",
			reference: "testcomponent"
		};

		var firstChange = this.oPersistence.addChangeFile(Change.createInitialFileContent(mParameters));
		var secondChange = this.oPersistence.addChangeFile(Change.createInitialFileContent(mParameters2));

		secondChange.getDefinition().creation = new Date().toISOString();
		assert.ok(this.oPersistence._oChanges[firstChange.getId()], 'Change is in _oChanges');

		this.oPersistence.removeChangeFromPersistence(firstChange);
		this.oPersistence.removeChangeFromPersistence(secondChange);

		assert.ok(!this.oPersistence._oChanges[firstChange.getId()], 'Change has been remove from _oChanges');
		assert.ok(this.oPersistence._oChanges[secondChange.getId()], 'Old change is still in _oChanges');
	});

	QUnit.test("detects an existing changes in the vendor layer", function(assert) {
		var mockedChanges = {
			"i_1": {
				"_oOriginDefinition": {
					fileType: "change",
					layer: "USER"
				}
			},
			"i_2": {
				"_oOriginDefinition": {
					fileType: "variant",
					layer: "VENDOR"
				}
			}
		};
		this.oPersistence._oChanges = mockedChanges;
		var bExistsVendorLayerVarialt = this.oPersistence._existVendorLayerChange();
		assert.ok(bExistsVendorLayerVarialt, "changes in vendor layer was detected");
	});

	QUnit.test("detects no existing chnage in the vendor layer if variants and changes in the other layers exist", function(assert) {
		var mockedChanges = {
			"i_1": {
				"_oOriginDefinition": {
					fileType: "variant",
					layer: "USER"
				}
			},
			"i_2": {
				"_oOriginDefinition": {
					fileType: "change",
					layer: "USER"
				}
			}
		};
		this.oPersistence._oChanges = mockedChanges;
		var bExistsVendorLayerVarialt = this.oPersistence._existVendorLayerChange();
		assert.equal(bExistsVendorLayerVarialt, false, "NO changes in vendor layer was detected");
	});

	QUnit.test("_getOwnerComponentOfControl detects if the control has a component as an owner", function(assert) {

		var sIdOfExpectedOwner = "idOfExpectedOwner";
		var oExpectedOwner = {/* owner object used for equals */};
		sandbox.stub(sap.ui.core.Component, "getOwnerIdFor").returns(sIdOfExpectedOwner);
		var oStub = sandbox.stub(sap.ui, "component").returns(oExpectedOwner);

		var oControl = {/* not undefined object */};
		var oResult = this.oPersistence._getOwnerComponentOfControl(oControl);

		assert.equal(oResult, oExpectedOwner);
		assert.equal(oStub.getCall(0).args[0], sIdOfExpectedOwner);
	});

	QUnit.test("_getOwnerComponentOfControl checks the parent if the control has neither a owner nor is a view", function(assert) {

		var oParent = {/* object used for equals */
			getParent: function () {
				return undefined;
			}
		};

		var oControl = {
			getParent: function () {
				return oParent;
			}
		};

		var oGetOwnerOrViewOfControlSpy = sandbox.spy(this.oPersistence, "_getOwnerComponentOfControl");

		var oResult = this.oPersistence._getOwnerComponentOfControl(oControl);

		assert.ok(oGetOwnerOrViewOfControlSpy.calledThrice, "'_getOwnerComponentOfControl' was called thrice");
		assert.equal(oGetOwnerOrViewOfControlSpy.getCall(0).args[0], oControl, "'_getOwnerComponentOfControl' was called with the initial control at the first time");
		assert.equal(oGetOwnerOrViewOfControlSpy.getCall(1).args[0], oParent, "'_getOwnerComponentOfControl' was called with the initial controls parent at the second time");
		assert.equal(oGetOwnerOrViewOfControlSpy.getCall(2).args[0], undefined, "'_getOwnerComponentOfControl' was called with undefined at the third time");
	});

	QUnit.test("_resolveFillingCacheWithChanges does not check for message bundles if no message bundle was returned", function (assert) {
		var oMockedFile = {/* no changes property */};
		var checkForMessagebundleBindingStub = sandbox.stub(this.oPersistence, "_checkForMessagebundleBinding");
		sandbox.stub(this.oPersistence, "_fillRelevantChanges");

		this.oPersistence._resolveFillingCacheWithChanges(oMockedFile);
		assert.equal(checkForMessagebundleBindingStub.callCount, 0);

		var oMockedFile = {"changes": {/* no messagebundle property */}};
		this.oPersistence._resolveFillingCacheWithChanges(oMockedFile);
		assert.equal(checkForMessagebundleBindingStub.callCount, 0);
	});

	QUnit.test("_resolveFillingCacheWithChanges checks for message bundles if a message bundle was returned", function (assert) {
		var oMockedFile = {"changes": {messagebundle: {"i_123": "Hallo Welt!"}}};
		var checkForMessagebundleBindingStub = sandbox.stub(this.oPersistence, "_checkForMessagebundleBinding");

		this.oPersistence._resolveFillingCacheWithChanges(oMockedFile);

		assert.ok(checkForMessagebundleBindingStub.calledOnce);
	});

	QUnit.test("_resolveFillingCacheWithChanges stores flex settings if setting part was returned", function (assert) {
		var oMockedFile = {
			"changes": {
				messagebundle: {"i_123": "Hallo Welt!"},
				settings: {
					isKeyUser: true
				}
			}};
		var settingsStoreInstanceStub = sandbox.stub(Settings, "_storeInstance");

		this.oPersistence._resolveFillingCacheWithChanges(oMockedFile);

		assert.ok(settingsStoreInstanceStub.calledOnce);
	});

	QUnit.test("getChanges does not check for message bundles if no message bundle is cached", function (assert) {
		this.oPersistence._bHasLoadedChangesFromBackend = true;
		this.oPersistence._oMessagebundle = undefined;
		var checkForMessagebundleBindingStub = sandbox.stub(this.oPersistence, "_checkForMessagebundleBinding");
		sandbox.stub(this.oPersistence, "_fillRelevantChanges");

		this.oPersistence.getChanges();

		assert.equal(checkForMessagebundleBindingStub.callCount, 0);
	});

	QUnit.test("getChanges checks for message bundles if a message bundle is cached", function (assert) {
		this.oPersistence._bHasLoadedChangesFromBackend = true;
		this.oPersistence._oMessagebundle = {"i_123": "Hallo Welt!"};
		var checkForMessagebundleBindingStub = sandbox.stub(this.oPersistence, "_checkForMessagebundleBinding");

		this.oPersistence.getChanges();

		assert.ok(checkForMessagebundleBindingStub.calledOnce);
	});

	QUnit.test("_checkForMessagebundleBinding does not search the owner of a component if no changes in the vendor layer exists", function (assert) {
		sandbox.stub(this.oPersistence, "_existVendorLayerChange").returns(false);
		var _getOwnerComponentOfControlStub = sandbox.stub(this.oPersistence, "_getOwnerComponentOfControl");

		this.oPersistence._checkForMessagebundleBinding();

		assert.equal(_getOwnerComponentOfControlStub.callCount, 0);
	});

	QUnit.test("_checkForMessagebundleBinding binds a json model if there are changes in the vendor layer", function (assert) {
		var oDummyOwner = new sap.ui.core.Control();	//normally a 'sap.ui.Component' but to mock less we use a simple control able to handle a setModel
		sandbox.stub(this.oPersistence, "_existVendorLayerChange").returns(true);
		sandbox.stub(this.oPersistence, "_getOwnerComponentOfControl").returns(oDummyOwner);

		this.oPersistence._checkForMessagebundleBinding();

		assert.ok(oDummyOwner.getModel("i18nFlexVendor"));
	});

	QUnit.test("_checkForMessagebundleBinding does NOT bind a json model if there are changes in the vendor layer and a model is already bound", function (assert) {
		var oDummyOwner = new sap.ui.core.Control();	//normally a 'sap.ui.Component' but to mock less we use a simple control able to handle a setModel
		var oDummyOwnerSpy = sandbox.spy(oDummyOwner, "setModel");
		sandbox.stub(this.oPersistence, "_existVendorLayerChange").returns(true);
		sandbox.stub(this.oPersistence, "_getOwnerComponentOfControl").returns(oDummyOwner);

		this.oPersistence._checkForMessagebundleBinding();
		assert.ok(oDummyOwnerSpy.calledOnce);
		this.oPersistence._checkForMessagebundleBinding();
		assert.ok(oDummyOwnerSpy.calledOnce);
	});

}(sap.ui.fl.Utils, sap.ui.fl.Persistence, sap.ui.core.Control, sap.ui.fl.DefaultVariant, sap.ui.fl.Change, sap.ui.fl.LrepConnector, sap.ui.fl.Cache, sap.ui.fl.registry.Settings));
