/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	UI2PersonalizationStateApply,
	FlexState,
	LrepConnector,
	UI2PersonalizationState,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sErrorMsg = "not all mandatory properties were provided for the storage of the personalization";
	const sReference = "sap.ui.fl.Reference";
	const sContainerKey = "container1";
	const oFlexStatePers = {};
	oFlexStatePers[sContainerKey] = [{
		itemName: "item1"
	}, {
		itemName: "item2"
	}];

	QUnit.module("setPersonalization", {
		async beforeEach() {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {ui2personalization: oFlexStatePers});
			this.oLrepConnectorCreateStub = sandbox.stub(LrepConnector.ui2Personalization, "create");
		},
		afterEach() {
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with missing information: oPersonalization", async function(assert) {
			try {
				await UI2PersonalizationState.setPersonalization();
			} catch (oError) {
				assert.equal(oError.message, sErrorMsg, "an error is thrown");
			}
		});

		QUnit.test("with missing information: oPersonalization.reference", async function(assert) {
			try {
				await UI2PersonalizationState.setPersonalization({
					reference: "",
					containerKey: "containerKey",
					itemName: "itemName",
					content: "content"
				});
			} catch (oError) {
				assert.equal(oError.message, sErrorMsg, "an error is thrown");
			}
		});

		QUnit.test("with missing information: oPersonalization.containerKey", async function(assert) {
			try {
				await UI2PersonalizationState.setPersonalization({
					reference: "reference",
					containerKey: "",
					itemName: "itemName",
					content: "content"
				});
			} catch (oError) {
				assert.equal(oError.message, sErrorMsg, "an error is thrown");
			}
		});

		QUnit.test("with missing information: oPersonalization.itemName", async function(assert) {
			try {
				await UI2PersonalizationState.setPersonalization({
					reference: "reference",
					containerKey: "containerKey",
					itemName: "",
					content: "content"
				});
			} catch (oError) {
				assert.equal(oError.message, sErrorMsg, "an error is thrown");
			}
		});

		QUnit.test("with missing information: oPersonalization.content", async function(assert) {
			try {
				await UI2PersonalizationState.setPersonalization({
					reference: "reference",
					containerKey: "containerKey",
					itemName: "itemName",
					content: ""
				});
			} catch (oError) {
				assert.equal(oError.message, sErrorMsg, "an error is thrown");
			}
		});

		QUnit.test("with all information, LrepConnector resolving and the container already available", async function(assert) {
			const mResult = {
				response: {
					reference: sReference,
					containerKey: sContainerKey
				}
			};
			this.oLrepConnectorCreateStub.resolves(mResult);
			await UI2PersonalizationState.setPersonalization({
				reference: "reference",
				containerKey: "containerKey",
				itemName: "itemName",
				content: "content"
			});
			assert.equal(this.oLrepConnectorCreateStub.callCount, 1, "the send method was called once");
			assert.deepEqual(this.oLrepConnectorCreateStub.firstCall.args[0].flexObjects, {
				containerKey: "containerKey",
				content: "content",
				itemName: "itemName",
				reference: "reference"
			}, "the data was passed correct");
			const oNewUI2 = UI2PersonalizationStateApply.getPersonalization(sReference, sContainerKey);
			assert.deepEqual(oNewUI2.length, 3);
			assert.deepEqual(oNewUI2[2], mResult.response, "the correct object was set");
		});

		QUnit.test("with all information, LrepConnector resolving and the container not available", async function(assert) {
			const sNewContainerKey = "myFancyKey";
			const mResult = {
				response: {
					reference: sReference,
					containerKey: sNewContainerKey
				}
			};
			this.oLrepConnectorCreateStub.resolves(mResult);
			await UI2PersonalizationState.setPersonalization({
				reference: "reference",
				containerKey: "containerKey",
				itemName: "itemName",
				content: "content"
			});
			const oOldUI2 = UI2PersonalizationStateApply.getPersonalization(sReference, sContainerKey);
			const oNewUI2 = UI2PersonalizationStateApply.getPersonalization(sReference, sNewContainerKey);
			assert.deepEqual(oOldUI2.length, 2, "the old objects were not touched");
			assert.deepEqual(oNewUI2.length, 1, "the new object was added");
			assert.deepEqual(oNewUI2[0], mResult.response, "the correct object was set");
		});

		QUnit.test("with all information and LrepConnector rejecting", async function(assert) {
			this.oLrepConnectorCreateStub.rejects("MyError");
			try {
				await UI2PersonalizationState.setPersonalization({
					reference: "reference",
					containerKey: "containerKey",
					itemName: "itemName",
					content: "content"
				});
			} catch (oError) {
				assert.equal(oError, "MyError", "the error is passed through");
			}
		});
	});

	QUnit.module("deletePersonalization", {
		async beforeEach() {
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, sReference, {ui2personalization: oFlexStatePers});
			this.oLrepConnectorRemoveStub = sandbox.stub(LrepConnector.ui2Personalization, "remove");
		},
		afterEach() {
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with missing information: sReference", async function(assert) {
			try {
				await UI2PersonalizationState.deletePersonalization(undefined, sContainerKey, "sItemName");
			} catch (oError) {
				assert.equal(oError.message, sErrorMsg, "an error is thrown");
			}
		});

		QUnit.test("with missing information: sContainerKey", async function(assert) {
			try {
				await UI2PersonalizationState.deletePersonalization(sReference, undefined, "sItemName");
			} catch (oError) {
				assert.equal(oError.message, sErrorMsg, "an error is thrown");
			}
		});

		QUnit.test("with missing information: sItemName", async function(assert) {
			try {
				await UI2PersonalizationState.deletePersonalization(sReference, sContainerKey, undefined);
			} catch (oError) {
				assert.equal(oError.message, sErrorMsg, "an error is thrown");
			}
		});

		QUnit.test("with all information", async function(assert) {
			this.oLrepConnectorRemoveStub.resolves();
			await UI2PersonalizationState.deletePersonalization(sReference, sContainerKey, "item1");
			assert.equal(this.oLrepConnectorRemoveStub.callCount, 1, "the send method was called once");
			assert.deepEqual(this.oLrepConnectorRemoveStub.firstCall.args[0],
				{
					containerKey: "container1",
					itemName: "item1",
					reference: "sap.ui.fl.Reference"
				}, "the data was passed correct");
			const oNewUI2 = UI2PersonalizationStateApply.getPersonalization(sReference, sContainerKey);
			assert.equal(oNewUI2.length, 1, "one object was deleted");
		});

		QUnit.test("with all information and LrepConnector rejecting", async function(assert) {
			this.oLrepConnectorRemoveStub.rejects("MyError");
			try {
				await UI2PersonalizationState.deletePersonalization(sReference, sContainerKey, "item1");
			} catch (oError) {
				assert.equal(oError, "MyError", "the error is passed through");
			}
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
