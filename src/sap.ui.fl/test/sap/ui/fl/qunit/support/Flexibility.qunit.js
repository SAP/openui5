/*global QUnit*/

sap.ui.require([
		"sap/ui/core/support/Support",
		"sap/ui/core/support/Plugin",
		"sap/ui/fl/support/Flexibility",
		"sap/ui/fl/ChangePersistenceFactory",
		"jquery.sap.global",
		"sap/ui/thirdparty/qunit",
		"sap/ui/qunit/qunit-junit",
		"sap/ui/qunit/qunit-coverage",
		"sap/ui/qunit/QUnitUtils",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (support, Plugin, Flexibility, ChangePersistenceFactory) {
		"use strict";
		var SupportStub = sap.ui.require("sap/ui/core/support/Support").getStub();

		QUnit.module("sap.ui.fl.support.Flexibility - init", {
			beforeEach: function () {
				this.oFlexibility = new Flexibility(SupportStub);
			},
			afterEach: function () {
			}
		});

		QUnit.test("sets models and starts rendering for the tool part", function (assert) {
			var renderingSpy = this.spy(this.oFlexibility, "_renderToolPlugin");
			this.stub(Plugin.prototype.init, "apply");

			this.oFlexibility.init({
				isToolStub: function () {return true;}
			});

			var oView = this.oFlexibility.oView;
			assert.equal(renderingSpy.callCount, 1, "the rendering was called");
			assert.ok(oView.getModel("flexApps"));
			assert.ok(oView.getModel("flexToolSettings"));
			assert.ok(oView.getModel("flexChanges"));
			assert.ok(oView.getModel("flexChangeDetails"));
		});


		QUnit.module("sap.ui.fl.support.Flexibility - onRefresh", {
			beforeEach: function () {
				this.oFlexibility = new Flexibility(SupportStub);
			},
			afterEach: function () {
			}
		});

		QUnit.test("sends a new request for apps", function (assert) {
			var done = assert.async();
			this.stub(SupportStub, "sendEvent", function (sEventName) {
				assert.equal(sEventName, "sapUiSupportFlexibilityGetApps", "the GetChangesMaps event was triggered");
				done();
			});

			this.oFlexibility.onRefresh();
		});

		QUnit.module("sap.ui.fl.support.Flexibility - _onAppSelected", {
			beforeEach: function () {
				this.oFlexibility = new Flexibility(SupportStub);
			},
			afterEach: function () {
			}
		});

		QUnit.test("requests the current data for apps", function (assert) {
			var done = assert.async();
			this.stub(SupportStub, "sendEvent", function (sEventName) {
				assert.equal(sEventName, "sapUiSupportFlexibilityGetChangesMaps", "the GetChangesMaps event was triggered");
				done();
			});

			this.oFlexibility._onAppSelected();
		});

		QUnit.module("sap.ui.fl.support.Flexibility - onsapUiSupportFlexibilityGetApps", {
			beforeEach: function () {
				this.oFlexibility = new Flexibility(SupportStub);
			},
			afterEach: function () {
			}
		});
		QUnit.test("sends a '" + Flexibility.prototype.sNoDebug + "' flag in case the application side is not debugging the fl-library", function (assert) {
			var oConfig = sap.ui.getCore().getConfiguration();
			this.stub(oConfig, "getDebug").returns(false);

			var done = assert.async();
			this.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetApps", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "string", "a string was passed as a payload");
				assert.equal(oPayload, Flexibility.prototype.sNoDebug, "the flag was sent");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetApps();

		});

		QUnit.test("sends an empty object to the support window if the flexibility cache is not filled", function (assert) {
			var oConfig = sap.ui.getCore().getConfiguration();
			this.stub(oConfig, "getDebug").returns(true);

			var done = assert.async();
			this.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetApps", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 0, "with no data in it");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetApps();
		});

		QUnit.test("sends the data to the support window for a reference", function (assert) {
			var oConfig = sap.ui.getCore().getConfiguration();
			this.stub(oConfig, "getDebug").returns(true);

			var done = assert.async();
			var sReference = "ref1";
			var sAppVersion = "1.1.1";
			ChangePersistenceFactory.getChangePersistenceForComponent(sReference, sAppVersion); // create instance

			this.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetApps", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 1, "one object was passed");
				var oPassedAppData = oPayload[0];
				assert.equal(oPassedAppData.key, sReference + Flexibility.prototype.sDelimiter + sAppVersion, "the key was passed correct");
				assert.equal(oPassedAppData.text, sReference, "the app id was passed correct");
				assert.equal(oPassedAppData.additionalText, sAppVersion, "the app version was passed correct");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetApps();
		});

		QUnit.test("sends the data to the support window for  multiple references", function (assert) {
			var oConfig = sap.ui.getCore().getConfiguration();
			this.stub(oConfig, "getDebug").returns(true);

			var done = assert.async();
			var sReference1 = "ref1";
			var sAppVersion1 = "1.1.1";
			var sReference2 = "ref2";
			var sAppVersion2 = "2.1.1";
			ChangePersistenceFactory.getChangePersistenceForComponent(sReference1, sAppVersion1); // create instance
			ChangePersistenceFactory.getChangePersistenceForComponent(sReference1, sAppVersion2); // create instance
			ChangePersistenceFactory.getChangePersistenceForComponent(sReference2, sAppVersion1); // create instance

			this.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetApps", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 3, "three objects were passed");
				var oPassedAppData = oPayload[0];
				assert.equal(oPassedAppData.key, sReference1 + Flexibility.prototype.sDelimiter + sAppVersion1, "the key was passed correct");
				assert.equal(oPassedAppData.text, sReference1, "the app id was passed correct");
				assert.equal(oPassedAppData.additionalText, sAppVersion1, "the app version was passed correct");
				oPassedAppData = oPayload[1];
				assert.equal(oPassedAppData.key, sReference1 + Flexibility.prototype.sDelimiter + sAppVersion2, "the key was passed correct");
				assert.equal(oPassedAppData.text, sReference1, "the app id was passed correct");
				assert.equal(oPassedAppData.additionalText, sAppVersion2, "the app version was passed correct");
				oPassedAppData = oPayload[2];
				assert.equal(oPassedAppData.key, sReference2 + Flexibility.prototype.sDelimiter + sAppVersion1, "the key was passed correct");
				assert.equal(oPassedAppData.text, sReference2, "the app id was passed correct");
				assert.equal(oPassedAppData.additionalText, sAppVersion1, "the app version was passed correct");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetApps();
		});

		QUnit.module("sap.ui.fl.support.Flexibility - onsapUiSupportFlexibilitySetApps", {
			beforeEach: function () {
				this.oFlexibility = new Flexibility(SupportStub);
			},
			afterEach: function () {
			}
		});

		QUnit.test("sets the data on the apps model and preselects the first entry", function (assert) {
			this.stub(Plugin.prototype.init, "apply");
			this.oFlexibility.init({
				isToolStub: function () {return true;}
			});
			var oAppSelection = this.oFlexibility.oView.byId("appSelection");
			var oFireChangeStub = this.stub(oAppSelection, "fireChange");
			var oPassedParameters = {dummyKey: "dummyValue"};
			var oEvent = new sap.ui.base.Event(undefined, undefined, oPassedParameters);

			this.oFlexibility.onsapUiSupportFlexibilitySetApps(oEvent);

			var oData = this.oFlexibility.oAppModel.getData();
			assert.deepEqual(oData, oPassedParameters, "the data was set in the apps model");
			assert.equal(oFireChangeStub.callCount, 1, "the selection of the first entry is triggered");
		});

		QUnit.module("sap.ui.fl.support.Flexibility - onsapUiSupportFlexibilitySetChangesMaps", {
			beforeEach: function () {
				this.oFlexibility = new Flexibility(SupportStub);
			},
			afterEach: function () {
			}
		});

		QUnit.test("sets the data on the changes model", function (assert) {
			this.stub(Plugin.prototype.init, "apply");
			this.oFlexibility.init({
				isToolStub: function () {return true;}
			});
			var oPassedParameters = {dummyKey: "dummyValue"};
			var oEvent = new sap.ui.base.Event(undefined, undefined, oPassedParameters);

			this.oFlexibility.onsapUiSupportFlexibilitySetChangesMaps(oEvent);

			var oData = this.oFlexibility.oChangesModel.getData();
			assert.deepEqual(oData, oPassedParameters, "the data was set in the changes model");
		});

		QUnit.module("sap.ui.fl.support.Flexibility - onsapUiSupportFlexibilityGetChangesMaps", {
			beforeEach: function () {
				this.oFlexibility = new Flexibility(SupportStub);
			},
			afterEach: function () {
			}
		});

		QUnit.test("collects and the data correct and sends the response to the toll plugin", function (assert) {
			var sAppReference = "ref";
			var sVersion = "ver";
			var sAppKey = sAppReference + this.oFlexibility.sDelimiter + sVersion;
			var oEvent = new sap.ui.base.Event(undefined, undefined, {appKey: sAppKey});
			var oGetChangesMapStub = this.spy(this.oFlexibility, "_getChangesMapForApp");

			this.oFlexibility.onsapUiSupportFlexibilityGetChangesMaps(oEvent);

			assert.equal(oGetChangesMapStub.callCount, 1, "the apps were requested once");
			var oGetAppsCall = oGetChangesMapStub.getCall(0);
			var oGetAppsCallParameters = oGetAppsCall.args;
			assert.equal(oGetAppsCallParameters[0], sAppReference, "the reference was passed correct");
			assert.equal(oGetAppsCallParameters[1], sVersion, "the version was passed correct");
		});
});
