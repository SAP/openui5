/*global QUnit*/

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/support/Support",
	"sap/ui/core/support/Plugin",
	"sap/ui/fl/support/Flexibility",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/core/Component",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Control,
	Support,
	Plugin,
	Flexibility,
	ChangePersistenceFactory,
	Component,
	jQuery,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	var SupportStub = Support.getStub();

	QUnit.module("init", {
		before: function() {
			jQuery("body").append('<div id="sapUiSupportFlexibility-FlexCacheArea" style="display: none"></div>');
		},
		beforeEach: function() {
			this.oFlexibility = new Flexibility(SupportStub);
		},
		afterEach: function() {
			sandbox.restore();
		},
		after: function() {
			jQuery("#sapUiSupportFlexibility-FlexCacheArea").remove();
		}
	}, function() {
		QUnit.test("sets models and starts rendering for the tool part", function(assert) {
			var oRenderingSpy = sandbox.spy(this.oFlexibility, "_renderToolPlugin");
			sandbox.stub(Control.prototype, "placeAt"); // prevent the actual rendering
			sandbox.stub(Plugin.prototype.init, "apply");

			this.oFlexibility.init({
				isToolStub: function() {return true;}
			});

			return this.oFlexibility.oViewPromise.then(function() {
				var oView = this.oFlexibility.oView;
				assert.equal(oRenderingSpy.callCount, 1, "the rendering was called");
				assert.ok(oView.getModel("flexApps"));
				assert.ok(oView.getModel("flexToolSettings"));
				assert.ok(oView.getModel("flexChanges"));
				assert.ok(oView.getModel("flexChangeDetails"));
			}.bind(this));
		});
	});

	QUnit.module("onRefresh", {
		beforeEach: function() {
			this.oFlexibility = new Flexibility(SupportStub);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sends a new request for apps", function(assert) {
			var done = assert.async();
			sandbox.stub(SupportStub, "sendEvent").callsFake(function(sEventName) {
				assert.equal(sEventName, "sapUiSupportFlexibilityGetApps", "the GetChangesMaps event was triggered");
				done();
			});

			this.oFlexibility.onRefresh();
		});
	});

	QUnit.module("onsapUiSupportFlexibilityGetApps", {
		beforeEach: function() {
			this.oFlexibility = new Flexibility(SupportStub);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("sends an empty object to the support window if the flexibility cache is not filled", function(assert) {
			var done = assert.async();
			sandbox.stub(SupportStub, "sendEvent").callsFake(function(sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetApps", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 0, "with no data in it");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetApps();
		});

		QUnit.test("sends the data to the support window for a reference", function(assert) {
			var done = assert.async();
			var sReference = "testComponent";
			ChangePersistenceFactory.getChangePersistenceForComponent(sReference); // create instance

			sandbox.stub(SupportStub, "sendEvent").callsFake(function(sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetApps", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 2, "one object was passed");
				var oPassedAppData = oPayload[0];
				assert.equal(oPassedAppData.key, sReference, "the key was passed correct");
				assert.equal(oPassedAppData.text, sReference, "the app id was passed correct");
				assert.equal(oPassedAppData.additionalText, "App variant based on:\nparentTestComponent (1.2.2) in layer VENDOR\ncustomer.testComponent.id_1 (1.2.3) in layer CUSTOMER", "the app var hierarchy was passed correct");
				done();
			});
			return Component.create({name: "testComponent"}).then(function (oComponent) {
				this.oFlexibility.onsapUiSupportFlexibilityGetApps();
				oComponent.destroy();
			}.bind(this));
		});
	});

	QUnit.module("getAppVariantHierarchy", {
		beforeEach: function() {
			this.oFlexibility = new Flexibility(SupportStub);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("gets nothing if no component is registered", function(assert) {
			assert.equal(this.oFlexibility.getAppVariantHierarchy("testComponent"), "", "appVariantIdHierarchy extraced succesfully");
		});

		QUnit.test("gets app variant hierarchy if component is registered that has an appVariantHierarchy", function(assert) {
			return Component.create({name: "testComponent"}).then(function(oComponent) {
				assert.equal(this.oFlexibility.getAppVariantHierarchy("testComponent"), "App variant based on:\nparentTestComponent (1.2.2) in layer VENDOR\ncustomer.testComponent.id_1 (1.2.3) in layer CUSTOMER", "appVariantIdHierarchy extraced succesfully");
				oComponent.destroy();
			}.bind(this));
		});
	});

	QUnit.module("onsapUiSupportFlexibilityGetChangesMaps", {
		beforeEach: function() {
			this.oFlexibility = new Flexibility(SupportStub);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("collects and the data correct and sends the response to the toll plugin", function(assert) {
			var sAppReference = "ref";
			var sAppKey = sAppReference;
			var oEvent = new sap.ui.base.Event(undefined, undefined, {appKey: sAppKey});
			var oGetChangesMapStub = sandbox.spy(this.oFlexibility, "_getChangesMapForApp");

			this.oFlexibility.onsapUiSupportFlexibilityGetChangesMaps(oEvent);

			assert.equal(oGetChangesMapStub.callCount, 1, "the apps were requested once");
			var oGetAppsCall = oGetChangesMapStub.getCall(0);
			var oGetAppsCallParameters = oGetAppsCall.args;
			assert.equal(oGetAppsCallParameters[0], sAppReference, "the reference was passed correct");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});