/*globals QUnit, sinon*/
sap.ui.require([
		"sap/ui/core/support/Support",
		"sap/ui/fl/support/Flexibility",
		"sap/ui/fl/Cache",
		"sap/ui/fl/context/ContextManager",
		"jquery.sap.global",
		"sap/ui/thirdparty/qunit",
		"sap/ui/qunit/qunit-junit",
		"sap/ui/qunit/qunit-coverage",
		"sap/ui/qunit/QUnitUtils",
		"sap/ui/thirdparty/sinon",
		"sap/ui/thirdparty/sinon-qunit"
	],
	function (support, Flexibility, Cache, ContextManager) {
		'use strict';

		var sandbox = sinon.sandbox.create();

		var SupportStub = sap.ui.require("sap/ui/core/support/Support").getStub();

		QUnit.module("sap.ui.fl.support.Flexibility - onsapUiSupportFlexibilityGetChanges", {
			beforeEach: function () {
				Cache._entries = {};
				this.oFlexibility = new Flexibility(SupportStub);
			},
			afterEach: function () {
				sandbox.restore();
			}
		});

		QUnit.test("sends an empty object to the support window if the ibility cache is not filled", function (assert) {
			var done = assert.async();
			sandbox.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetChanges", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 0, "with no data in it");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetChanges();
		});

		QUnit.test("sends the data to the support window for a reference without contexts", function (assert) {
			var done = assert.async();
			var sReference = "ref1";
			var oChange = {};
			Cache._entries[sReference] = {
				file: {
					changes: {
						changes: [oChange],
						contexts: []
					}
				}
			};


			sandbox.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetChanges", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 1, "one object was passed");
				var oPassedFlexData = oPayload[0];
				assert.equal(oPassedFlexData.reference, sReference);
				assert.equal(oPassedFlexData.changes.length, 1, "a change was passed");
				assert.equal(oPassedFlexData.contexts.length, 0, "no context was passed");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetChanges();
		});

		QUnit.test("sends the data to the support window for a reference with contexts", function (assert) {
			var done = assert.async();
			var sReference = "ref1";
			var oChange = {};
			var oContext1 = {};
			var oContext2 = {};
			Cache._entries[sReference] = {
				file: {
					changes: {
						changes: [oChange],
						contexts: [oContext1, oContext2]
					}
				}
			};
			sandbox.stub(ContextManager, "getActiveContexts", function () {
				return Promise.resolve([]);
			});

			sandbox.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetChanges", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 1, "one object was passed");
				var oPassedFlexData = oPayload[0];
				assert.equal(oPassedFlexData.reference, sReference);
				assert.equal(oPassedFlexData.changes.length, 1, "a change was passed");
				assert.equal(oPassedFlexData.contexts.length, 2, "a context was passed");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetChanges();
		});

		QUnit.test("sends the data to the support window for multiple reference with and without contexts", function (assert) {
			var done = assert.async();
			var sReference1 = "ref1";
			var oChange1_1 = {};
			var oContext1_1 = {};
			var oContext1_2 = {};
			Cache._entries[sReference1] = {
				file: {
					changes: {
						changes: [oChange1_1],
						contexts: [oContext1_1, oContext1_2]
					}
				}
			};
			var sReference2 = "ref2";
			var oChange2_1 = {};
			var oChange2_2 = {};
			var oContext2_1 = {};
			Cache._entries[sReference2] = {
				file: {
					changes: {
						changes: [oChange2_1, oChange2_2],
						contexts: [oContext2_1]
					}
				}
			};
			sandbox.stub(ContextManager, "getActiveContexts", function () {
				return Promise.resolve([]);
			});

			sandbox.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetChanges", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 2, "two object were passed");
				var oPassedFlexData1 = oPayload[0];
				assert.equal(oPassedFlexData1.reference, sReference1);
				assert.equal(oPassedFlexData1.changes.length, 1, "a change was passed");
				assert.equal(oPassedFlexData1.contexts.length, 2, "two contexts were passed");
				var oPassedFlexData2 = oPayload[1];
				assert.equal(oPassedFlexData2.reference, sReference2);
				assert.equal(oPassedFlexData2.changes.length, 2, "two changes were passed");
				assert.equal(oPassedFlexData2.contexts.length, 1, "a context was passed");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetChanges();
		});
});
