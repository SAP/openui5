/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/message/Message",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataMessageParser",
	"sap/ui/test/TestUtils"
], function (Log, Message, MessageScope, ODataMessageParser, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

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
	// deep path match is only done if updateAggregatedMessages is true
	QUnit.test("_propagateMessages: updateAggregatedMessages=false: " + i, function (assert) {
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
					updateAggregatedMessages : false,
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
	QUnit.test("_propagateMessages: updateAggregatedMessages=true: " + i, function (assert) {
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
					updateAggregatedMessages : true,
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
	QUnit.test("_createTarget: call _getReducedPath with a canonical path", function (assert) {
		var oMessageObject = {target : "/~target"},
			oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {}
				},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo;

		this.mock(oODataMessageParser._processor).expects("resolve")
			.withExactArgs("/~target", undefined, true)
			.returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~canonicalTarget")
			.returns("~reducedPath");

		// code under test
		ODataMessageParser.prototype._createTarget.call(oODataMessageParser, oMessageObject,
			mRequestInfo);

		assert.strictEqual(oMessageObject.canonicalTarget, "~canonicalTarget");
		assert.strictEqual(oMessageObject.deepPath, "~reducedPath");
	});

	//*********************************************************************************************
	QUnit.test("_createTarget: call _getReducedPath with deep path", function (assert) {
		var oMessageObject = {target : "~target"},
			oODataMessageParser = {
				_metadata : {
					_getFunctionImportMetadata : function () {},
					_getReducedPath : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {
				request : {deepPath : "~deepPath"},
				url : "~requestURL"
			},
			mUrlData = {url : "~parsedUrl"};

		this.mock(oODataMessageParser).expects("_parseUrl")
			.withExactArgs("~requestURL")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_getFunctionImportMetadata")
			.withExactArgs("/~parsedUrl", "GET")
			.returns(null);
		this.mock(oODataMessageParser._metadata).expects("_isCollection")
			.withExactArgs("/~parsedUrl")
			.returns(false);
		this.mock(oODataMessageParser._processor).expects("resolve")
			.withExactArgs("/~parsedUrl/~target", undefined, true)
			.returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~deepPath/~target")
			.returns("~reducedPath");

		// code under test
		ODataMessageParser.prototype._createTarget.call(oODataMessageParser, oMessageObject,
			mRequestInfo);

		assert.strictEqual(oMessageObject.canonicalTarget, "~canonicalTarget");
		assert.strictEqual(oMessageObject.deepPath, "~reducedPath");
	});

	//*********************************************************************************************
[{
	oMessage : undefined,
	bExpectError : false
}, {
	oMessage : new Message({message : "new", persistent : true}),
	bExpectError : false
}, {
	oMessage : new Message({message : "new", persistent : false}),
	bExpectError : true
}].forEach(function (oFixture, i) {
	QUnit.test("_propagateMessages: sap-messages=transientOnly, " + i, function (assert) {
		var oLastMessage = new Message({message : "keep"}),
			oMessageProcessor = {
				fireMessageChange : function () {}
			},
			aMessages = oFixture.oMessage ? [oFixture.oMessage] : [],
			aNewLastMessages = [oLastMessage],
			oODataMessageParser = {
				_getAffectedTargets : function () {},
				getProcessor : function () {},
				// members
				_lastMessages : [oLastMessage]
			},
			mRequestInfo = {
				request : {
					headers : {
						"sap-messages" : "transientOnly"
					}
				}
			};

		if (oFixture.oMessage) {
			aNewLastMessages.push(oFixture.oMessage);
		}

		if (oFixture.bExpectError) {
			this.oLogMock.expects("error").withExactArgs("Unexpected non-persistent message in "
				+ "response, but requested only transition messages", undefined,
				"sap.ui.model.odata.ODataMessageParser");
		}
		this.mock(oODataMessageParser).expects("_getAffectedTargets").never();
		this.mock(oODataMessageParser).expects("getProcessor").withExactArgs()
			.returns(oMessageProcessor);
		this.mock(oMessageProcessor).expects("fireMessageChange")
			.withExactArgs(sinon.match({
				oldMessages : [],
				newMessages : sinon.match.same(aMessages)
			}))
			.returns(oMessageProcessor);

		// code under test
		ODataMessageParser.prototype._propagateMessages.call(oODataMessageParser,
			aMessages, mRequestInfo/* , mGetEntities,
			mChangeEntities, bSimpleMessageLifecycle*/);

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages);
	});
});
});
