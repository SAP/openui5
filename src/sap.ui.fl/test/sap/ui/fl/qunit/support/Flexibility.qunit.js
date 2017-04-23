/*global QUnit,sinon*/

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
		"use strict";

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

		QUnit.test("sends an empty object to the support window if the flexibility cache is not filled", function (assert) {
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
			var sAppVersion = "1.1.1";
			var oChange = {};
			Cache._entries[sReference] = {};
			Cache._entries[sReference][sAppVersion] = {
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
				assert.equal(oPassedFlexData.reference, sReference + " - " + sAppVersion);
				assert.equal(oPassedFlexData.changes.length, 1, "a change was passed");
				assert.equal(oPassedFlexData.contexts.length, 0, "no contexts were passed");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetChanges();
		});

		QUnit.test("sends the data to the support window for a reference with contexts", function (assert) {
			var done = assert.async();
			var sReference = "ref1";
			var sAppVersion = "1.1.1";
			var oChange = {};
			var oContext1 = {};
			var oContext2 = {};
			Cache._entries[sReference] = {};
			Cache._entries[sReference][sAppVersion] = {
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
				assert.equal(oPassedFlexData.reference, sReference + " - " + sAppVersion);
				assert.equal(oPassedFlexData.changes.length, 1, "a change was passed");
				assert.equal(oPassedFlexData.contexts.length, 2, "a context was passed");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetChanges();
		});

		QUnit.test("sends the data to the support window for multiple reference with and without contexts", function (assert) {
			var done = assert.async();
			var sReference1 = "ref1";
			var sAppVersion = "1.1.1";
			var oChange1Action1 = {};
			var oContext1Action1 = {};
			var oContext1Action2 = {};
			Cache._entries[sReference1] = {};
			Cache._entries[sReference1][sAppVersion] = {
				file: {
					changes: {
						changes: [oChange1Action1],
						contexts: [oContext1Action1, oContext1Action2]
					}
				}
			};
			var sReference2 = "ref2";
			var oChange2Action1 = {};
			var oChange2Action2 = {};
			var oContext2Action1 = {};
			Cache._entries[sReference2] = {};
			Cache._entries[sReference2][sAppVersion] = {
				file: {
					changes: {
						changes: [oChange2Action1, oChange2Action2],
						contexts: [oContext2Action1]
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
				assert.equal(oPassedFlexData1.reference, sReference1 + " - " + sAppVersion);
				assert.equal(oPassedFlexData1.changes.length, 1, "a change was passed");
				assert.equal(oPassedFlexData1.contexts.length, 2, "two contexts were passed");
				var oPassedFlexData2 = oPayload[1];
				assert.equal(oPassedFlexData2.reference, sReference2 + " - " + sAppVersion);
				assert.equal(oPassedFlexData2.changes.length, 2, "two changes were passed");
				assert.equal(oPassedFlexData2.contexts.length, 1, "a context was passed");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetChanges();
		});

		QUnit.test("sends the data to the support window for multiple reference and multiple versions with and without contexts", function (assert) {
			var done = assert.async();
			var sReference1 = "ref1";
			var sAppVersion1 = "1.1.1";
			var sAppVersion2 = "2.2.2";
			var oChange1Action1 = {};
			var oChange1Action2 = {};
			var oContext1Action1 = {};
			var oContext1Action2 = {};
			Cache._entries[sReference1] = {};
			Cache._entries[sReference1][sAppVersion1] = {
				file: {
					changes: {
						changes: [oChange1Action1],
						contexts: [oContext1Action1, oContext1Action2]
					}
				}
			};
			Cache._entries[sReference1][sAppVersion2] = {
				file: {
					changes: {
						changes: [oChange1Action1, oChange1Action2],
						contexts: []
					}
				}
			};

			var sReference2 = "ref2";
			var oChange2Action1 = {};
			var oChange2Action2 = {};
			var oChange2Action3 = {};
			var oContext2Action1 = {};
			Cache._entries[sReference2] = {};
			Cache._entries[sReference2][sAppVersion1] = {
				file: {
					changes: {
						changes: [oChange2Action1, oChange2Action2],
						contexts: [oContext2Action1]
					}
				}
			};
			Cache._entries[sReference2][sAppVersion2] = {
				file: {
					changes: {
						changes: [oChange2Action1, oChange2Action2, oChange2Action3],
						contexts: [oContext2Action1]
					}
				}
			};
			sandbox.stub(ContextManager, "getActiveContexts", function () {
				return Promise.resolve([]);
			});

			sandbox.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetChanges", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 4, "four object were passed");
				var oPassedFlexData0 = oPayload[0];
				assert.equal(oPassedFlexData0.reference, sReference1 + " - " + sAppVersion1);
				assert.equal(oPassedFlexData0.changes.length, 1, "a change was passed");
				assert.equal(oPassedFlexData0.contexts.length, 2, "two contexts were passed");
				var oPassedFlexData1 = oPayload[1];
				assert.equal(oPassedFlexData1.reference, sReference1 + " - " + sAppVersion2);
				assert.equal(oPassedFlexData1.changes.length, 2, "two changes was passed");
				assert.equal(oPassedFlexData1.contexts.length, 0, "no contexts were passed");
				var oPassedFlexData2 = oPayload[2];
				assert.equal(oPassedFlexData2.reference, sReference2 + " - " + sAppVersion1);
				assert.equal(oPassedFlexData2.changes.length, 2, "two changes were passed");
				assert.equal(oPassedFlexData2.contexts.length, 1, "a context was passed");
				var oPassedFlexData3 = oPayload[3];
				assert.equal(oPassedFlexData3.reference, sReference2 + " - " + sAppVersion2);
				assert.equal(oPassedFlexData3.changes.length, 3, "three changes were passed");
				assert.equal(oPassedFlexData3.contexts.length, 1, "a context was passed");
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetChanges();
		});

		QUnit.test("sorting works for multiple reference and multiple versions", function (assert) {
			var done = assert.async();
			var sReference1 = "ref1";
			var sAppVersion1 = "1.2.02";
			var sAppVersion2 = "1.2.1";
			var sDefaultAppVersion = "DEFAULT_APP_VERSION";
			var oChange1Action1 = {};
			var oChange1Action2 = {};
			Cache._entries[sReference1] = {};
			Cache._entries[sReference1][sAppVersion1] = {
				file: {
					changes: {
						changes: [oChange1Action1],
						contexts: []
					}
				}
			};
			Cache._entries[sReference1][sAppVersion2] = {
				file: {
					changes: {
						changes: [oChange1Action1, oChange1Action2],
						contexts: []
					}
				}
			};
			Cache._entries[sReference1][sDefaultAppVersion] = {
				file: {
					changes: {
						changes: [oChange1Action1, oChange1Action2],
						contexts: []
					}
				}
			};

			var sReference2 = "ref02";
			var oChange2Action1 = {};
			var oChange2Action2 = {};
			var oChange2Action3 = {};
			Cache._entries[sReference2] = {};
			Cache._entries[sReference2][sAppVersion1] = {
				file: {
					changes: {
						changes: [oChange2Action1, oChange2Action2],
						contexts: []
					}
				}
			};
			Cache._entries[sReference2][sAppVersion2] = {
				file: {
					changes: {
						changes: [oChange2Action1, oChange2Action2, oChange2Action3],
						contexts: []
					}
				}
			};
			sandbox.stub(ContextManager, "getActiveContexts", function () {
				return Promise.resolve([]);
			});

			sandbox.stub(SupportStub, "sendEvent", function (sEventName, oPayload) {
				assert.equal(sEventName, "sapUiSupportFlexibilitySetChanges", "the SetChanges event was triggered");
				assert.equal(typeof oPayload, "object", "an object was passed as a payload");
				assert.equal(Object.keys(oPayload).length, 5, "five object were passed");
				var oPassedFlexData0 = oPayload[0];
				assert.equal(oPassedFlexData0.reference, sReference2 + " - " + sAppVersion2);
				var oPassedFlexData1 = oPayload[1];
				assert.equal(oPassedFlexData1.reference, sReference2 + " - " + sAppVersion1);
				var oPassedFlexData2 = oPayload[2];
				assert.equal(oPassedFlexData2.reference, sReference1 + " - " + "Version independent");
				var oPassedFlexData3 = oPayload[3];
				assert.equal(oPassedFlexData3.reference, sReference1 + " - " + sAppVersion2);
				var oPassedFlexData4 = oPayload[4];
				assert.equal(oPassedFlexData4.reference, sReference1 + " - " + sAppVersion1);
				done();
			});

			this.oFlexibility.onsapUiSupportFlexibilityGetChanges();
		});
});
