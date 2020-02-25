/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/LrepConnector",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	merge,
	UI2PersonalizationState,
	FlexState,
	LrepConnector,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sErrorMsg = "not all mandatory properties were provided for the storage of the personalization";
	var sReference = "sap.ui.fl.Reference";
	var sContainerKey = "container1";
	var oFlexStatePers = {};
	oFlexStatePers[sContainerKey] = [{
		itemName: "item1"
	}, {
		itemName: "item2"
	}];

	QUnit.module("getPersonalization", {
		beforeEach: function() {
			this.oGetPersStub = sandbox.stub(FlexState, "getUI2Personalization")
				.withArgs(sReference)
				.returns(oFlexStatePers);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when FlexState has no personalization with and without item name passed", function(assert) {
			assert.deepEqual(UI2PersonalizationState.getPersonalization(), [], "an empty array is returned");
			assert.equal(UI2PersonalizationState.getPersonalization(undefined, sContainerKey, "sItemName"), undefined, "an empty array is returned");
		});

		QUnit.test("when no container was passed, with and without item name", function(assert) {
			assert.deepEqual(UI2PersonalizationState.getPersonalization(sReference), [], "an empty array is returned");
			assert.equal(UI2PersonalizationState.getPersonalization(sReference, "", "sItemName"), undefined, "an empty array is returned");
		});

		QUnit.test("with reference and container, but no itemName", function(assert) {
			assert.deepEqual(UI2PersonalizationState.getPersonalization(sReference, sContainerKey), oFlexStatePers[sContainerKey], "the whole pers object is returned");
		});

		QUnit.test("with reference, container and itemName", function(assert) {
			assert.deepEqual(UI2PersonalizationState.getPersonalization(sReference, sContainerKey, "item1"), oFlexStatePers[sContainerKey][0], "the single pers object is returned");
		});
	});

	QUnit.module("setPersonalization", {
		beforeEach: function() {
			this.oPersState = merge({}, oFlexStatePers);
			this.oGetPersStub = sandbox.stub(FlexState, "getUI2Personalization")
				.withArgs(sReference)
				.returns(this.oPersState);
			this.oLrepConnectorSendStub = sandbox.stub(LrepConnector.prototype, "send");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with missing information: oPersonalization", function(assert) {
			return UI2PersonalizationState.setPersonalization()
				.catch(function(oError) {
					assert.equal(oError, sErrorMsg, "an error is thrown");
				});
		});

		QUnit.test("with missing information: oPersonalization.reference", function(assert) {
			return UI2PersonalizationState.setPersonalization({
				reference: "",
				containerKey: "containerKey",
				itemName: "itemName",
				content: "content"
			})
				.catch(function(oError) {
					assert.equal(oError, sErrorMsg, "an error is thrown");
				});
		});

		QUnit.test("with missing information: oPersonalization.containerKey", function(assert) {
			return UI2PersonalizationState.setPersonalization({
				reference: "reference",
				containerKey: "",
				itemName: "itemName",
				content: "content"
			})
				.catch(function(oError) {
					assert.equal(oError, sErrorMsg, "an error is thrown");
				});
		});

		QUnit.test("with missing information: oPersonalization.itemName", function(assert) {
			return UI2PersonalizationState.setPersonalization({
				reference: "reference",
				containerKey: "containerKey",
				itemName: "",
				content: "content"
			})
				.catch(function(oError) {
					assert.equal(oError, sErrorMsg, "an error is thrown");
				});
		});

		QUnit.test("with missing information: oPersonalization.content", function(assert) {
			return UI2PersonalizationState.setPersonalization({
				reference: "reference",
				containerKey: "containerKey",
				itemName: "itemName",
				content: ""
			})
				.catch(function(oError) {
					assert.equal(oError, sErrorMsg, "an error is thrown");
				});
		});

		QUnit.test("with all information, LrepConnector resolving and the container already available", function(assert) {
			var mResult = {
				response: {
					reference: sReference,
					containerKey: sContainerKey
				}
			};
			this.oLrepConnectorSendStub.resolves(mResult);
			return UI2PersonalizationState.setPersonalization({
				reference: "reference",
				containerKey: "containerKey",
				itemName: "itemName",
				content: "content"
			})
				.then(function() {
					assert.equal(this.oLrepConnectorSendStub.callCount, 1, "the send method was called once");
					assert.equal(this.oLrepConnectorSendStub.firstCall.args[0], "/sap/bc/lrep/ui2personalization/", "the passed url is correct");
					assert.deepEqual(this.oPersState[sContainerKey].length, 3);
					assert.deepEqual(this.oPersState[sContainerKey][2], mResult.response, "the correct object was set");
				}.bind(this));
		});

		QUnit.test("with all information, LrepConnector resolving and the container not available", function(assert) {
			var mResult = {
				response: {
					reference: sReference,
					containerKey: "sContainerKey"
				}
			};
			this.oLrepConnectorSendStub.resolves(mResult);
			return UI2PersonalizationState.setPersonalization({
				reference: "reference",
				containerKey: "containerKey",
				itemName: "itemName",
				content: "content"
			})
				.then(function() {
					assert.deepEqual(this.oPersState[sContainerKey].length, 2, "the old objects were not touched");
					assert.deepEqual(this.oPersState["sContainerKey"].length, 1, "the new object was added");
					assert.deepEqual(this.oPersState["sContainerKey"][0], mResult.response, "the correct object was set");
				}.bind(this));
		});

		QUnit.test("with all information and LrepConnector rejecting", function(assert) {
			this.oLrepConnectorSendStub.rejects("MyError");
			return UI2PersonalizationState.setPersonalization({
				reference: "reference",
				containerKey: "containerKey",
				itemName: "itemName",
				content: "content"
			})
				.catch(function(oError) {
					assert.equal(oError, "MyError", "the error is passed through");
				});
		});
	});

	QUnit.module("deletePersonalization", {
		beforeEach: function() {
			this.oPersState = merge({}, oFlexStatePers);
			this.oGetPersStub = sandbox.stub(FlexState, "getUI2Personalization")
				.withArgs(sReference)
				.returns(this.oPersState);
			this.oLrepConnectorSendStub = sandbox.stub(LrepConnector.prototype, "send");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with missing information: sReference", function(assert) {
			return UI2PersonalizationState.deletePersonalization(undefined, sContainerKey, "sItemName")
				.catch(function(oError) {
					assert.equal(oError, sErrorMsg, "an error is thrown");
				});
		});

		QUnit.test("with missing information: sContainerKey", function(assert) {
			return UI2PersonalizationState.deletePersonalization(sReference, undefined, "sItemName")
				.catch(function(oError) {
					assert.equal(oError, sErrorMsg, "an error is thrown");
				});
		});

		QUnit.test("with missing information: sItemName", function(assert) {
			return UI2PersonalizationState.deletePersonalization(sReference, sContainerKey, undefined)
				.catch(function(oError) {
					assert.equal(oError, sErrorMsg, "an error is thrown");
				});
		});

		QUnit.test("with all information", function(assert) {
			this.oLrepConnectorSendStub.resolves();
			var sUrl = "/sap/bc/lrep/ui2personalization/?reference=" + sReference + "&containerkey=" + sContainerKey + "&itemname=item1";
			return UI2PersonalizationState.deletePersonalization(sReference, sContainerKey, "item1")
				.then(function() {
					assert.equal(this.oLrepConnectorSendStub.callCount, 1, "the send method was called once");
					assert.equal(this.oLrepConnectorSendStub.firstCall.args[0], sUrl, "the passed url is correct");
					assert.equal(this.oPersState[sContainerKey].length, 1, "one object was deleted");
				}.bind(this));
		});

		QUnit.test("with all information and LrepConnector rejecting", function(assert) {
			this.oLrepConnectorSendStub.rejects("MyError");
			return UI2PersonalizationState.deletePersonalization(sReference, sContainerKey, "item1")
				.catch(function(oError) {
					assert.equal(oError, "MyError", "the error is passed through");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
