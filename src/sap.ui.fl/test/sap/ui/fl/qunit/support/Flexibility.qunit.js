/*global QUnit*/

sap.ui.define([
	"sap/ui/core/support/Support",
	"sap/ui/core/support/Plugin",
	"sap/ui/fl/support/Flexibility",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	Support,
	Plugin,
	Flexibility,
	ChangePersistenceFactory,
	jQuery,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();
	var SupportStub = Support.getStub();

	QUnit.module("init", {
		before: function() {
			jQuery("body").append('<div id="sapUiSupportFlexibility-FlexCacheArea" style="display: none"></div>');
		},
		beforeEach: function () {
			this.oFlexibility = new Flexibility(SupportStub);
		},
		afterEach: function () {
			sandbox.restore();
		},
		after: function() {
			jQuery("#sapUiSupportFlexibility-FlexCacheArea").remove();
		}
	}, function() {
		QUnit.test("sets models and starts rendering for the tool part", function (assert) {
			var renderingSpy = sandbox.spy(this.oFlexibility, "_renderToolPlugin");
			sandbox.stub(Plugin.prototype.init, "apply");

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
	});

	QUnit.module("onRefresh", {
		beforeEach: function () {
			this.oFlexibility = new Flexibility(SupportStub);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sends a new request for apps", function (assert) {
			var done = assert.async();
			sandbox.stub(SupportStub, "sendEvent").callsFake(function (sEventName) {
				assert.equal(sEventName, "sapUiSupportFlexibilityGetApps", "the GetChangesMaps event was triggered");
				done();
			});

			this.oFlexibility.onRefresh();
		});
	});

	QUnit.module("onsapUiSupportFlexibilityGetApps", {
		beforeEach: function () {
			this.oFlexibility = new Flexibility(SupportStub);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sends an empty object to the support window if the flexibility cache is not filled", function (assert) {
			var done = assert.async();
			sandbox.stub(SupportStub, "sendEvent").callsFake(function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetApps", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 0, "with no data in it");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetApps();
		});

		QUnit.test("sends the data to the support window for a reference", function (assert) {
			var done = assert.async();
			var sReference = "ref1";
			var sAppVersion = "1.1.1";
			ChangePersistenceFactory.getChangePersistenceForComponent(sReference, sAppVersion); // create instance

			sandbox.stub(SupportStub, "sendEvent").callsFake(function (sEventName, oPayload) {
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
			var done = assert.async();
			var sReference1 = "ref1";
			var sAppVersion1 = "1.1.1";
			var sReference2 = "ref2";
			var sAppVersion2 = "2.1.1";
			ChangePersistenceFactory.getChangePersistenceForComponent(sReference1, sAppVersion1); // create instance
			ChangePersistenceFactory.getChangePersistenceForComponent(sReference1, sAppVersion2); // create instance
			ChangePersistenceFactory.getChangePersistenceForComponent(sReference2, sAppVersion1); // create instance

			sandbox.stub(SupportStub, "sendEvent").callsFake(function (sEventName, oPayload) {
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
	});

	QUnit.module("onsapUiSupportFlexibilityGetChangesMaps", {
		beforeEach: function () {
			this.oFlexibility = new Flexibility(SupportStub);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("collects and the data correct and sends the response to the toll plugin", function (assert) {
			var sAppReference = "ref";
			var sVersion = "ver";
			var sAppKey = sAppReference + this.oFlexibility.sDelimiter + sVersion;
			var oEvent = new sap.ui.base.Event(undefined, undefined, {appKey: sAppKey});
			var oGetChangesMapStub = sandbox.spy(this.oFlexibility, "_getChangesMapForApp");

			this.oFlexibility.onsapUiSupportFlexibilityGetChangesMaps(oEvent);

			assert.equal(oGetChangesMapStub.callCount, 1, "the apps were requested once");
			var oGetAppsCall = oGetChangesMapStub.getCall(0);
			var oGetAppsCallParameters = oGetAppsCall.args;
			assert.equal(oGetAppsCallParameters[0], sAppReference, "the reference was passed correct");
			assert.equal(oGetAppsCallParameters[1], sVersion, "the version was passed correct");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});