/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/core/message/Message",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataMessageParser",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/test/TestUtils"
], function (Log, coreLibrary, Message, MessageScope, ODataMessageParser, ODataUtils, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

	var MessageType = coreLibrary.MessageType; // shortcuts for enums

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataMessageParser (ODataMessageParserNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
	// As, Bs, Cs: EntitySet for A, B, C
	// x, y, z: Structural property
	// ToA, ToB, ToC: Navigation to A, B, C
	// ToAs, ToBs, ToCs: Navigation to collection of A, B, C
[{
	sUrl : "As",
	mAffectedTargets : {"" : true, "As" : true},
	aLastMessages : []
}, {
	sStatusCode : 200,
	sUrl : "As(1)",
	// new message for structural property "As(1)/z"
	mAffectedTargets : {"" : true, "As" : true, "As(1)/z" : true, "As(1)" : true},
	aLastMessages : [
		// some non-persistent messages
		new Message({message : "removed", target : "/As"}),
		new Message({message : "removed", target : "/As(1)"}),
		new Message({message : "removed", target : "/As(1)/z"}),
		new Message({message : "removed", target : "/As(1)/y"}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/"}),
		new Message({message : "keep", target : "/As(2)"}),
		new Message({message : "keep", target : "/As(2)/y"}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x"}),
		// some non-persistent messages, but technical
		new Message({message : "removed", target : "/As", technical : true}),
		new Message({message : "removed", target : "/As(1)", technical : true}),
		new Message({message : "removed", target : "/As(1)/z", technical : true}),
		new Message({message : "removed", target : "/As(1)/y", technical : true}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/", technical : true}),
		new Message({message : "keep", target : "/As(2)", technical : true}),
		new Message({message : "keep", target : "/As(2)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x", technical : true}),
		// deepPath matches are ignored
		new Message({fullTarget : "/As(1)/ToB/ToCs(2)/x", message : "keep", target : "/Cs(2)/x"})
	]
}, {
	sStatusCode : 200,
	sUrl : "As(1)",
	// new message for navigation property "As(1)/ToB"
	mAffectedTargets : {"" : true, "As" : true, "As(1)/ToB" : true},
	aLastMessages : [
		// some non-persistent messages
		new Message({message : "removed", target : "/As"}),
		new Message({message : "keep", target : "/As(1)"}),
		new Message({message : "keep", target : "/As(1)/z"}),
		new Message({message : "keep", target : "/As(1)/y"}),
		// any number of leading and one trailing / are ignored
		new Message({message : "keep", target : "/////As(1)/y/"}),
		new Message({message : "keep", target : "/As(2)"}),
		new Message({message : "keep", target : "/As(2)/y"}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x"}),
		new Message({message : "keep", target : "/As(1)/toB/x"}), //why?
		// some non-persistent messages, but technical
		new Message({message : "removed", target : "/As", technical : true}),
		new Message({message : "keep", target : "/As(1)", technical : true}),
		new Message({message : "keep", target : "/As(1)/z", technical : true}),
		new Message({message : "keep", target : "/As(1)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toB/x", technical : true}),
		// any number of leading and one trailing / are ignored
		new Message({message : "keep", target : "/////As(1)/y/", technical : true}),
		new Message({message : "keep", target : "/As(2)", technical : true}),
		new Message({message : "keep", target : "/As(2)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x", technical : true}),
		// deepPath matches are ignored
		new Message({fullTarget : "/As(1)/ToB/ToCs(2)/x", message : "keep", target : "/Cs(2)/x"})
	]
}, {
	bSimpleMessageLifecycle : true,
	sStatusCode : 300,
	sUrl : "As(1)",
	// new message for structural property "As(1)/z"
	mAffectedTargets : {"" : true, "As" : true, "As(1)/z" : true, "As(1)" : true},
	aLastMessages : [
		// some non-persistent messages
		// if bSimpleMessageLifecycle is used remove also all non-technical messages that match
		new Message({message : "removed", target : "/As"}),
		new Message({message : "removed", target : "/As(1)"}),
		new Message({message : "removed", target : "/As(1)/z"}),
		new Message({message : "removed", target : "/As(1)/y"}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/"}),
		new Message({message : "keep", target : "/As(2)"}),
		new Message({message : "keep", target : "/As(2)/y"}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x"}),
		// some non-persistent messages, but technical
		new Message({message : "removed", target : "/As", technical : true}),
		new Message({message : "removed", target : "/As(1)", technical : true}),
		new Message({message : "removed", target : "/As(1)/z", technical : true}),
		new Message({message : "removed", target : "/As(1)/y", technical : true}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/", technical : true}),
		new Message({message : "keep", target : "/As(2)", technical : true}),
		new Message({message : "keep", target : "/As(2)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x", technical : true}),
		// deepPath matches are ignored
		new Message({fullTarget : "/As(1)/ToB/ToCs(2)/x", message : "keep", target : "/Cs(2)/x"})
	]
}, {
	sStatusCode : 300, // or anything above
	sUrl : "As(1)",
	// new message for structural property "As(1)/z"
	mAffectedTargets : {"" : true, "As" : true, "As(1)/z" : true, "As(1)" : true},
	aLastMessages : [
		// some non-persistent messages
		// only non-persistent technical messages are removed
		new Message({message : "keep", target : "/As"}),
		new Message({message : "keep", target : "/As(1)"}),
		new Message({message : "keep", target : "/As(1)/z"}),
		new Message({message : "keep", target : "/As(1)/y"}),
		// any number of leading and one trailing / are ignored
		new Message({message : "keep", target : "/////As(1)/y/"}),
		new Message({message : "keep", target : "/As(2)"}),
		new Message({message : "keep", target : "/As(2)/y"}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x"}),
		// some non-persistent messages, but technical
		new Message({message : "removed", target : "/As", technical : true}),
		new Message({message : "removed", target : "/As(1)", technical : true}),
		new Message({message : "removed", target : "/As(1)/z", technical : true}),
		new Message({message : "removed", target : "/As(1)/y", technical : true}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/", technical : true}),
		new Message({message : "keep", target : "/As(2)", technical : true}),
		new Message({message : "keep", target : "/As(2)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x", technical : true}),
		// deepPath matches are ignored
		new Message({fullTarget : "/As(1)/ToB/ToCs(2)/x", message : "keep", target : "/Cs(2)/x"})

	]
}].forEach(function (oFixture, i) {
	// deep path match is only done if message scope is business object and the request was
	// triggered by a refresh
	[{
		bRefresh : true,
		oRequestHeaders : undefined
	}, {
		bRefresh : true,
		oRequestHeaders : {}
	}, {
		bRefresh : false,
		oRequestHeaders : {"sap-message-scope" : MessageScope.BusinessObject}
	}].forEach(function (oRequest, j) {
	QUnit.test("_propagateMessages: MessageScope.Request " + i + "/" + j, function (assert) {
		var mChangeEntities = "{object} mChangeEntities",
			aExpectedMessagesToBeKept = [],
			aExpectedMessagesToBeRemoved = [],
			mGetEntities = "{object} mGetEntities",
			aLastMessages = oFixture.aLastMessages.concat([
				// persistent messages are never removed
				new Message({message : "keep", persistent : true, target : "/As"}),
				new Message({message : "keep", persistent : true, target : "/As(1)"}),
				new Message({message : "keep", persistent : true, target : "/As(1)/z"}),
				new Message({message : "keep", persistent : true, target : "/As(1)/y"}),
				new Message({message : "keep", persistent : true, target : "/As(2)"}),
				new Message({message : "keep", persistent : true, target : "/As(2)/y"}),
				new Message({message : "keep", persistent : true, target : "/As(1)/toBs(2)/x"})
			]),
			oMessageProcessor = {
				fireMessageChange : function () {}
			},
			// placeholder for messages; mAffectedTargets is computed based on new messages
			aMessages = ["{sap.ui.core.message.Message} oMessage..."],
			aNewLastMessages = [],
			oODataMessageParser = {
				_getAffectedTargets : function () {},
				getProcessor : function () {},
				// members
				_lastMessages : aLastMessages
			},
			mRequestInfo = {
				request : {
					deepPath : "/" + oFixture.sUrl,
					headers : oRequest.oRequestHeaders,
					refresh : oRequest.refresh,
					url : oFixture.sUrl
				},
				response : {
					statusCode : oFixture.sStatusCode
				}
			};

		aLastMessages.forEach(function (oMessage) {
			if (oMessage.message === "keep") {
				aExpectedMessagesToBeKept.push(oMessage);
				aNewLastMessages.push(oMessage);
			} else {
				aExpectedMessagesToBeRemoved.push(oMessage);
			}
		});
		aNewLastMessages.push(aMessages[0]);
		this.mock(oODataMessageParser).expects("_getAffectedTargets")
			.withExactArgs(sinon.match.same(aMessages), sinon.match.same(mRequestInfo),
				mGetEntities, mChangeEntities)
			.returns(oFixture.mAffectedTargets);
		this.mock(oODataMessageParser).expects("getProcessor").withExactArgs()
			.returns(oMessageProcessor);
		this.mock(oMessageProcessor).expects("fireMessageChange")
			.withExactArgs(sinon.match({
				newMessages : sinon.match.same(aMessages),
				oldMessages : sinon.match(aExpectedMessagesToBeRemoved)
			}))
			.returns(oMessageProcessor);

		// code under test
		ODataMessageParser.prototype._propagateMessages.call(oODataMessageParser, aMessages,
			mRequestInfo, mGetEntities, mChangeEntities, oFixture.bSimpleMessageLifecycle);

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages);
	});
	});
});

	//*********************************************************************************************
	// As, Bs, Cs: EntitySet for A, B, C
	// x, y, z: Structural property
	// ToA, ToB, ToC: Navigation to A, B, C
	// ToAs, ToBs, ToCs: Navigation to collection of A, B, C
[{
	sUrl : "As",
	mAffectedTargets : {"" : true, "As" : true},
	aLastMessages : []
}, {
	sStatusCode : 200,
	sUrl : "As(1)",
	// new message for structural property "As(1)/z"
	mAffectedTargets : {"" : true, "As" : true, "As(1)/z" : true, "As(1)" : true},
	aLastMessages : [
		// some non-persistent messages
		new Message({message : "removed", target : "/As"}),
		new Message({message : "removed", target : "/As(1)"}),
		new Message({message : "removed", target : "/As(1)/z"}),
		new Message({message : "removed", target : "/As(1)/y"}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/"}),
		new Message({message : "keep", target : "/As(2)"}),
		new Message({message : "keep", target : "/As(2)/y"}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x"}),
		// some non-persistent messages, but technical
		new Message({message : "removed", target : "/As", technical : true}),
		new Message({message : "removed", target : "/As(1)", technical : true}),
		new Message({message : "removed", target : "/As(1)/z", technical : true}),
		new Message({message : "removed", target : "/As(1)/y", technical : true}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/", technical : true}),
		new Message({message : "keep", target : "/As(2)", technical : true}),
		new Message({message : "keep", target : "/As(2)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x", technical : true}),
		// deepPath matches
		new Message({fullTarget : "/C(2)/ToAs(1)/y", message : "removed", target : "/As(1)/y"}),
		new Message({
			fullTarget : "/C(2)/ToAs(1)/ToB/ToCs(3)/x",
			message : "removed",
			target : "/Cs(3)/x"
		}),
		new Message({
			fullTarget : "/C(1)/ToAs(1)/ToB/ToCs(3)/x",
			message : "keep",
			target : "/Cs(3)/x"
		})
	]
}, {
	sStatusCode : 200,
	sUrl : "As(1)",
	// new message for navigation property "As(1)/ToB"
	mAffectedTargets : {"" : true, "As" : true, "As(1)/ToB" : true},
	aLastMessages : [
		// some non-persistent messages
		new Message({message : "removed", target : "/As"}),
		new Message({message : "keep", target : "/As(1)"}),
		new Message({message : "keep", target : "/As(1)/z"}),
		new Message({message : "keep", target : "/As(1)/y"}),
		// any number of leading and one trailing / are ignored
		new Message({message : "keep", target : "/////As(1)/y/"}),
		new Message({message : "keep", target : "/As(2)"}),
		new Message({message : "keep", target : "/As(2)/y"}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x"}),
		new Message({message : "keep", target : "/As(1)/toB/x"}), //why?
		// some non-persistent messages, but technical
		new Message({message : "removed", target : "/As", technical : true}),
		new Message({message : "keep", target : "/As(1)", technical : true}),
		new Message({message : "keep", target : "/As(1)/z", technical : true}),
		new Message({message : "keep", target : "/As(1)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toB/x", technical : true}),
		// any number of leading and one trailing / are ignored
		new Message({message : "keep", target : "/////As(1)/y/", technical : true}),
		new Message({message : "keep", target : "/As(2)", technical : true}),
		new Message({message : "keep", target : "/As(2)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x", technical : true}),
		// deepPath matches
		new Message({fullTarget : "/C(2)/ToAs(1)/y", message : "removed", target : "/As(1)/y"}),
		new Message({
			fullTarget : "/C(2)/ToAs(1)/ToB/ToCs(3)/x",
			message : "removed",
			target : "/Cs(3)/x"
		}),
		new Message({
			fullTarget : "/C(1)/ToAs(1)/ToB/ToCs(3)/x",
			message : "keep",
			target : "/Cs(3)/x"
		})
	]
}, {
	bSimpleMessageLifecycle : true,
	sStatusCode : 300, // or anything above
	sUrl : "As(1)",
	// new message for structural property "As(1)/z"
	mAffectedTargets : {"" : true, "As" : true, "As(1)/z" : true, "As(1)" : true},
	aLastMessages : [
		// some non-persistent messages
		// if bSimpleMessageLifecycle is used remove also all non-technical messages that match
		new Message({message : "removed", target : "/As"}),
		new Message({message : "removed", target : "/As(1)"}),
		new Message({message : "removed", target : "/As(1)/z"}),
		new Message({message : "removed", target : "/As(1)/y"}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/"}),
		new Message({message : "keep", target : "/As(2)"}),
		new Message({message : "keep", target : "/As(2)/y"}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x"}),
		// some non-persistent messages, but technical
		new Message({message : "removed", target : "/As", technical : true}),
		new Message({message : "removed", target : "/As(1)", technical : true}),
		new Message({message : "removed", target : "/As(1)/z", technical : true}),
		new Message({message : "removed", target : "/As(1)/y", technical : true}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/", technical : true}),
		new Message({message : "keep", target : "/As(2)", technical : true}),
		new Message({message : "keep", target : "/As(2)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x", technical : true}),
		// deepPath matches
		new Message({fullTarget : "/C(2)/ToAs(1)/y", message : "removed", target : "/As(1)/y"}),
		new Message({
			fullTarget : "/C(2)/ToAs(1)/ToB/ToCs(3)/x",
			message : "removed",
			target : "/Cs(3)/x"
		}),
		new Message({
			fullTarget : "/C(1)/ToAs(1)/ToB/ToCs(3)/x",
			message : "keep",
			target : "/Cs(3)/x"
		})
	]
}, {
	sStatusCode : 300, // or anything above
	sUrl : "As(1)",
	// new message for structural property "As(1)/z"
	mAffectedTargets : {"" : true, "As" : true, "As(1)/z" : true, "As(1)" : true},
	aLastMessages : [
		// some non-persistent messages
		// only non-persistent technical messages are removed
		new Message({message : "keep", target : "/As"}),
		new Message({message : "keep", target : "/As(1)"}),
		new Message({message : "keep", target : "/As(1)/z"}),
		new Message({message : "keep", target : "/As(1)/y"}),
		// any number of leading and one trailing / are ignored
		new Message({message : "keep", target : "/////As(1)/y/"}),
		new Message({message : "keep", target : "/As(2)"}),
		new Message({message : "keep", target : "/As(2)/y"}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x"}),
		// some non-persistent messages, but technical
		new Message({message : "removed", target : "/As", technical : true}),
		new Message({message : "removed", target : "/As(1)", technical : true}),
		new Message({message : "removed", target : "/As(1)/z", technical : true}),
		new Message({message : "removed", target : "/As(1)/y", technical : true}),
		// any number of leading and one trailing / are ignored
		new Message({message : "removed", target : "/////As(1)/y/", technical : true}),
		new Message({message : "keep", target : "/As(2)", technical : true}),
		new Message({message : "keep", target : "/As(2)/y", technical : true}),
		new Message({message : "keep", target : "/As(1)/toBs(2)/x", technical : true}),
		// deepPath matches
		new Message({fullTarget : "/C(2)/ToAs(1)/y", message : "keep", target : "/As(1)/y"}),
		new Message({
			fullTarget : "/C(2)/ToAs(1)/ToB/ToCs(3)/x",
			message : "keep",
			target : "/Cs(3)/x"
		}),
		new Message({
			fullTarget : "/C(1)/ToAs(1)/ToB/ToCs(3)/x",
			message : "keep",
			target : "/Cs(3)/x"
		})
	]
}].forEach(function (oFixture, i) {
	QUnit.test("_propagateMessages: deepPath matching " + i, function (assert) {
		var mChangeEntities = "{object} mChangeEntities",
			aExpectedMessagesToBeKept = [],
			aExpectedMessagesToBeRemoved = [],
			mGetEntities = "{object} mGetEntities",
			aLastMessages = oFixture.aLastMessages.concat([
				// persistent messages are never removed
				new Message({message : "keep", persistent : true, target : "/As"}),
				new Message({message : "keep", persistent : true, target : "/As(1)"}),
				new Message({message : "keep", persistent : true, target : "/As(1)/z"}),
				new Message({message : "keep", persistent : true, target : "/As(1)/y"}),
				new Message({message : "keep", persistent : true, target : "/As(2)"}),
				new Message({message : "keep", persistent : true, target : "/As(2)/y"}),
				new Message({message : "keep", persistent : true, target : "/As(1)/toBs(2)/x"})
			]),
			oMessageProcessor = {
				fireMessageChange : function () {}
			},
			// placeholder for messages; mAffectedTargets is computed based on new messages
			aMessages = ["{sap.ui.core.message.Message} oMessage..."],
			aNewLastMessages = [],
			oODataMessageParser = {
				_getAffectedTargets : function () {},
				getProcessor : function () {},
				// members
				_lastMessages : aLastMessages
			},
			mRequestInfo = {
				request : {
					deepPath : "/C(2)/ToAs(1)",
					headers : {"sap-message-scope" : MessageScope.BusinessObject},
					refresh : true,
					url : oFixture.sUrl
				},
				response : {
					statusCode : oFixture.sStatusCode
				}
			};

		aLastMessages.forEach(function (oMessage) {
			if (oMessage.message === "keep") {
				aExpectedMessagesToBeKept.push(oMessage);
				aNewLastMessages.push(oMessage);
			} else {
				aExpectedMessagesToBeRemoved.push(oMessage);
			}
		});
		aNewLastMessages.push(aMessages[0]);
		this.mock(oODataMessageParser).expects("_getAffectedTargets")
			.withExactArgs(sinon.match.same(aMessages), sinon.match.same(mRequestInfo),
				mGetEntities, mChangeEntities)
			.returns(oFixture.mAffectedTargets);
		this.mock(oODataMessageParser).expects("getProcessor").withExactArgs()
			.returns(oMessageProcessor);
		this.mock(oMessageProcessor).expects("fireMessageChange")
			.withExactArgs(sinon.match({
				newMessages : sinon.match.same(aMessages),
				oldMessages : sinon.match(aExpectedMessagesToBeRemoved)
			}))
			.returns(oMessageProcessor);

		// code under test
		ODataMessageParser.prototype._propagateMessages.call(oODataMessageParser, aMessages,
			mRequestInfo, mGetEntities, mChangeEntities, oFixture.bSimpleMessageLifecycle);

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages);
	});
});

	//*********************************************************************************************
	QUnit.test("_createMessage: no target for transient and technical message", function (assert) {
		var oODataMessageParser = {
				_createTarget : function () {}
			},
			oMessage,
			oMessageObject = {transition: true},
			mRequestInfo = {
				response : {
					headers : "~headers",
					statusCode : "~statusCode"
				}
			};

		this.mock(oODataMessageParser).expects("_createTarget").never();

		// code under test
		oMessage = ODataMessageParser.prototype._createMessage.call(oODataMessageParser,
			oMessageObject, mRequestInfo, true);

		assert.strictEqual(oMessage.fullTarget, "");
		assert.strictEqual(oMessage.target, "");
	});

	//*********************************************************************************************
[{
	expectedPersistentMessages : true,
	expectedTarget : "",
	persistTechnicalMessages : true,
	technicalMessage : true
}, {
	expectedPersistentMessages : false,
	expectedTarget : "~targetWithNormalizedKeys",
	persistTechnicalMessages : false,
	technicalMessage : true
}, {
	expectedPersistentMessages : false,
	expectedTarget : "~targetWithNormalizedKeys",
	persistTechnicalMessages : false,
	technicalMessage : false
}, {
	expectedPersistentMessages : false,
	expectedTarget : "~targetWithNormalizedKeys",
	persistTechnicalMessages : true,
	technicalMessage : false
}].forEach(function (oFixture) {
	var sTitle = "_createMessage - bPersistTechnicalMessages: " + oFixture.persistTechnicalMessages
			+ " technical message: " + oFixture.technicalMessage;

	QUnit.test(sTitle, function (assert) {
		var oODataMessageParser = {
				_createTarget : function () {},
				_bPersistTechnicalMessages : oFixture.persistTechnicalMessages
			},
			oMessage,
			oMessageObject = {transition: false, canonicalTarget : "~canonicalTarget" },
			mRequestInfo = {
				response : {
					headers : "~headers",
					statusCode : "~statusCode"
				}
			};

		if (oFixture.expectedTarget) {
			this.mock(oODataMessageParser).expects("_createTarget")
				.withExactArgs(oMessageObject, mRequestInfo);
			this.mock(ODataUtils).expects("_normalizeKey")
				.withExactArgs("~canonicalTarget")
				.returns(oFixture.expectedTarget);
		}

		// code under test
		oMessage = ODataMessageParser.prototype._createMessage.call(oODataMessageParser,
			oMessageObject, mRequestInfo, oFixture.technicalMessage);

		assert.ok(oMessage instanceof Message);
		assert.strictEqual(oMessage.persistent, oFixture.expectedPersistentMessages);
		assert.strictEqual(oMessage.target, oFixture.expectedTarget);
	});
});

	//*********************************************************************************************
	QUnit.test("_addGenericError", function (assert) {
		var oMessage = "~oMessage",
			aMessages = ["~message0"],
			oODataMessageParser = {
				_createMessage : function () {}
			},
			mRequestInfo = {
				response : {body : "~body"}
			},
			oResourceBundle = {
				getText : function () {}
			};

		this.mock(sap.ui.getCore()).expects("getLibraryResourceBundle")
			.withExactArgs()
			.returns(oResourceBundle);
		this.mock(oResourceBundle).expects("getText")
			.withExactArgs("CommunicationError")
			.returns("~CommunicationError");
		this.mock(oODataMessageParser).expects("_createMessage")
			.withExactArgs({
				description : "~body",
				message : "~CommunicationError",
				severity : MessageType.Error,
				transition : true
			}, sinon.match.same(mRequestInfo), true)
			.returns(oMessage);

		// code under test
		ODataMessageParser.prototype._addGenericError.call(oODataMessageParser, aMessages,
			mRequestInfo);

		assert.deepEqual(aMessages, ["~message0", "~oMessage"]);
	});

	//*********************************************************************************************
	QUnit.test("_parseBodyXML: no error tag", function (assert) {
		var sContentType = "application/xml",
			oODataMessageParser = {
				_addGenericError : function () {}
			},
			oResponse = {
				// valid XML, but no error or errordetail tag
				body : '<?xml version="1.0" encoding="utf-8"?><foo></foo>'
			},
			mRequestInfo = {
				response : oResponse
			};

		this.mock(oODataMessageParser).expects("_addGenericError")
			.withExactArgs("~aMessages", sinon.match.same(mRequestInfo));

		// code under test
		ODataMessageParser.prototype._parseBodyXML.call(oODataMessageParser, "~aMessages",
			oResponse, mRequestInfo, sContentType);
	});

	//*********************************************************************************************
	QUnit.test("_parseBodyXML: DOMParser throws exception", function (assert) {
		var // wrong content does not cause exception in Chrome but in IE, unsupported content type
			// throws exception in all browsers
			sContentType = "unknown-xml-content-type",
			oODataMessageParser = {
				_addGenericError : function () {}
			},
			oResponse = {body : "~foo"},
			mRequestInfo = {
				response : oResponse
			};

		this.mock(oODataMessageParser).expects("_addGenericError")
			.withExactArgs("~aMessages", sinon.match.same(mRequestInfo));
		this.oLogMock.expects("error")
			.withExactArgs("Error message returned by server could not be parsed");

		// code under test
		ODataMessageParser.prototype._parseBodyXML.call(oODataMessageParser, "~aMessages",
			oResponse, mRequestInfo, sContentType);
	});

	//*********************************************************************************************
	QUnit.test("_parseBodyJSON: no error property", function (assert) {
		var oODataMessageParser = {
				_addGenericError : function () {}
			},
			oResponse = {
				// valid JSON, but no error property
				body : '{"foo" : "bar"}'
			},
			mRequestInfo = {
				response : oResponse
			};

		this.mock(oODataMessageParser).expects("_addGenericError")
			.withExactArgs("~aMessages", sinon.match.same(mRequestInfo));
		this.oLogMock.expects("error")
			.withExactArgs("Error message returned by server did not contain error-field");

		// code under test
		ODataMessageParser.prototype._parseBodyJSON.call(oODataMessageParser, "~aMessages",
			oResponse, mRequestInfo);
	});

	//*********************************************************************************************
	QUnit.test("_parseBodyJSON: plain text", function (assert) {
		var oODataMessageParser = {
				_addGenericError : function () {}
			},
			oResponse = {body : "~foo"},
			mRequestInfo = {
				response : oResponse
			};

		this.mock(oODataMessageParser).expects("_addGenericError")
			.withExactArgs("~aMessages", sinon.match.same(mRequestInfo));
		this.oLogMock.expects("error")
			.withExactArgs("Error message returned by server could not be parsed");

		// code under test
		ODataMessageParser.prototype._parseBodyJSON.call(oODataMessageParser, "~aMessages",
			oResponse, mRequestInfo);
	});

	//**********************************************************************************************
	QUnit.test("ODataMessageParser constructor", function (assert) {
		this.mock(ODataMessageParser.prototype).expects("_parseUrl").withExactArgs("url")
			.returns({url : "/service/"});

		// code under test
		var oMessageParser = new ODataMessageParser("url", "~oMetadata", "~persist");

		assert.strictEqual(oMessageParser._serviceUrl, "/service/");
		assert.strictEqual(oMessageParser._metadata, "~oMetadata");
		assert.strictEqual(oMessageParser._processor, null);
		assert.strictEqual(oMessageParser._headerField, "sap-message");
		assert.deepEqual(oMessageParser._lastMessages, []);
		assert.strictEqual(oMessageParser._bPersistTechnicalMessages, "~persist");
	});

	//**********************************************************************************************
	QUnit.test("_setPersistTechnicalMessages", function (assert) {
		var oODataMessageParser = {};

		//code under test
		ODataMessageParser.prototype._setPersistTechnicalMessages.call(oODataMessageParser,
			"~bPersist");

		assert.strictEqual(oODataMessageParser._bPersistTechnicalMessages, "~bPersist");
	});
});
