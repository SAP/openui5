/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/core/message/Message",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataMessageParser",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/test/TestUtils"
], function (Log, coreLibrary, Message, MessageScope, ODataMessageParser, ODataMetadata, ODataUtils,
		 TestUtils) {
	/*global QUnit,sinon*/
	/*eslint camelcase: 0, no-warning-comments: 0*/
	"use strict";

	var sClassName = "sap.ui.model.odata.ODataMessageParser",
		// shortcuts for enums
		MessageType = coreLibrary.MessageType;

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
		new Message({fullTarget : "/As(1)/ToB/ToCs(2)/x", message : "keep", target : "/Cs(2)/x"}),
		// multi-target messages
		new Message({message : "removed", target : ["/Bs", "/As"]}), // test: consider *all* targets
		new Message({message : "removed", target : ["/Bs", "/As(1)/y"]}),
		new Message({message : "keep", target : ["/Bs", "/As(2)"]})
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
		new Message({fullTarget : "/As(1)/ToB/ToCs(2)/x", message : "keep", target : "/Cs(2)/x"}),
		// multi-target messages
		new Message({message : "removed", target : ["/Bs", "/As"], technical : true}),
		new Message({message : "removed", target : ["/Bs", "/As(1)/y"], technical : true}),
		new Message({message : "keep", target : ["/Bs", "/As(2)"], technical : true})
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

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages, "last messages");
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
		}),
		// multi-target messages with deepPath matches
		new Message({
			fullTarget : ["/C(2)/ToB", "/C(2)/ToAs(1)/y"],
			message : "removed",
			target : ["/Bs(3)", "/As(1)/y"]
		}),
		new Message({
			fullTarget : ["/C(2)/ToB", "/C(2)/ToAs(1)/ToB/ToCs(3)/x"],
			message : "removed",
			target : ["/Bs(3)", "/Cs(3)/x"]
		}),
		new Message({
			fullTarget : ["/C(2)/ToB", "/C(1)/ToAs(1)/ToB/ToCs(3)/x"],
			message : "keep",
			target : ["/Bs(3)", "/Cs(3)/x"]
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
[{
	request : {method : "POST"},
	response : {headers : {}},
	result : undefined
}, {
	request : {method : "POST"},
	response : {
		headers : {},
		statusCode : 201
	},
	result : undefined
}, {
	request : {method : "POST"},
	response : {
		headers : {location : "foo"},
		statusCode : 201
	},
	result : true
}, {
	request : {method : "GET"},
	response : {
		headers : {location : "foo"},
		statusCode : 201
	},
	result : undefined
}, {
	request : {key : "~foo"},
	response : {headers : {}},
	result : undefined
}, {
	request : {created : true, key : "~foo"},
	response : {headers : {}},
	result : undefined
}, {
	request : {created : true, key : "~foo"},
	response : {
		headers : {},
		statusCode : 400
	},
	result : false
}].forEach(function (oFixture, i) {
	QUnit.test("_isResponseForCreate: " + i, function (assert) {
		var mRequestInfo = {
				request : oFixture.request,
				response : oFixture.response
			};

		// code under test
		assert.strictEqual(ODataMessageParser._isResponseForCreate(mRequestInfo), oFixture.result);
	});
});

	//*********************************************************************************************
["/~target", "/#TRANSIENT#/~target"].forEach(function (sODataTarget) {
	[false, true].forEach(function (bIsTechnical) {
		var sTitle = "_createTarget: absolute target with processor, " + sODataTarget
			+ ", bIsTechnical=" + bIsTechnical;

	QUnit.test(sTitle, function (assert) {
		var oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {}
				},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {request : {}, response : {}, url : "~requestURL"},
			oTargetInfo;

		this.mock(oODataMessageParser._processor).expects("resolve")
			.withExactArgs("/~target", undefined, true)
			.returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~canonicalTarget")
			.returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			sODataTarget, mRequestInfo, bIsTechnical, /*bODataTransition*/ false);

		assert.strictEqual(oTargetInfo.deepPath, "~reducedPath");
		assert.strictEqual(oTargetInfo.target, "~normalizedTarget");
	});
	});
});

	//*********************************************************************************************
["~target", "/#TRANSIENT#~target"].forEach(function (sODataTarget, i) {
	[{
		isTechnical : false,
		request : {
			deepPath : "~deepPath",
			headers : {"sap-message-scope" : "foo"},
			method : "~method"
		}
	}, {
		isTechnical : false,
		request : {deepPath : "~deepPath", method : "~method"}
	}, {
		isTechnical : true,
		request : {
			deepPath : "~deepPath",
			headers : {"sap-message-scope" : "BusinessObject"},
			method : "~method"
		}
	}].forEach(function (oFixture, j) {
	var sTitle = "_createTarget: relative target with processor; #" + i + "/" + j;

	QUnit.test(sTitle, function (assert) {
		var oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {
				request : oFixture.request,
				response : {},
				url : "~requestURL"
			},
			oTargetInfo,
			mUrlData = {url : "~parsedUrl"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(undefined);
		this.mock(oODataMessageParser).expects("_parseUrl")
			.withExactArgs("~requestURL")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_isCollection")
			.withExactArgs("/~parsedUrl")
			.returns(false);
		this.mock(oODataMessageParser._processor).expects("resolve")
			.withExactArgs("/~parsedUrl/~target", undefined, true)
			.returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~deepPath/~target")
			.returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			sODataTarget, mRequestInfo, oFixture.isTechnical, /*bODataTransition*/ false);

		assert.strictEqual(oTargetInfo.deepPath, "~reducedPath");
		assert.strictEqual(oTargetInfo.target, "~normalizedTarget");
	});
	});
});

	//*********************************************************************************************
[{
	sODataTarget : "",
	bODataTransition : false
}, {
	sODataTarget : undefined,
	bODataTransition : false
}, {
	sODataTarget : "",
	bODataTransition : true
}].forEach(function (oFixture, i) {
	var sTitle = "_createTarget: no or empty target for technical message; # " + i;

	QUnit.test(sTitle, function (assert) {
		var oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {
				request : {headers : {}, method : "~method"},
				response : {},
				url : "~requestURL"
			},
			oTargetInfo,
			mUrlData = {url : "~parsedUrl"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(undefined);
		this.mock(oODataMessageParser).expects("_parseUrl")
			.withExactArgs("~requestURL")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_isCollection")
			.withExactArgs("/~parsedUrl")
			.returns(false);
		this.mock(oODataMessageParser._processor).expects("resolve")
			.withExactArgs("/~parsedUrl", undefined, true)
			.returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~canonicalTarget")
			.returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			oFixture.sODataTarget, mRequestInfo, true, oFixture.bODataTransition);

		assert.strictEqual(oTargetInfo.deepPath, "~reducedPath");
		assert.strictEqual(oTargetInfo.target, "~normalizedTarget");
	});
});

	//*********************************************************************************************
	QUnit.test("_createTarget: target relative to an entity", function (assert) {
		var oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {
				request : {deepPath : "~deepPath", headers : {}, method : "~method"},
				response : {},
				url : "~requestURL"
			},
			oTargetInfo,
			mUrlData = {url : "~parsedUrl('key')"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(undefined);
		this.mock(oODataMessageParser).expects("_parseUrl")
			.withExactArgs("~requestURL")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_isCollection").never();
		this.mock(oODataMessageParser._processor).expects("resolve")
			.withExactArgs("/~parsedUrl('key')/~target", undefined, true)
			.returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~deepPath/~target")
			.returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			"~target", mRequestInfo, false, /*bODataTransition*/ false);

		assert.strictEqual(oTargetInfo.deepPath, "~reducedPath");
		assert.strictEqual(oTargetInfo.target, "~normalizedTarget");
	});

	//*********************************************************************************************
[{
	resolveCalls : [{
		path : "/BusinessPartnerSet('2')/ToSalesOrders('1')/"
			+ "ToLineItems(SalesOrderID='1',ItemPosition='10')",
		result : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')"
	}, {
		path : "/SalesOrderSet('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
		result : "/SalesOrderLineItemsSet(SalesOrderID='1',ItemPosition='10')"
	}],
	target : "ToSalesOrders('1')/ToLineItems(SalesOrderID='1',ItemPosition='10')",
	targetToNormalize : "/SalesOrderLineItemsSet(SalesOrderID='1',ItemPosition='10')"
}, {
	resolveCalls : [{
		path : "/BusinessPartnerSet('2')/ToSalesOrders('1')/ToProduct",
		result : "/SalesOrderSet('1')/ToProduct"
	}, {
		path : "/SalesOrderSet('1')/ToProduct",
		result : undefined
	}],
	target : "ToSalesOrders('1')/ToProduct",
	targetToNormalize : "/SalesOrderSet('1')/ToProduct"
}].forEach(function (oFixture, i) {
	QUnit.test("_createTarget: multiple resolve steps needed", function (assert) {
		var oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {},
				_processor : {
					resolve : function () {}
				}
			},
			oProcessorMock = this.mock(oODataMessageParser._processor),
			mRequestInfo = {
				request : {deepPath : "~deepPath", headers : {}, method : "~method"},
				response : {},
				url : "BusinessPartnerSet('2')"
			},
			oTargetInfo,
			mUrlData = {url : "BusinessPartnerSet('2')"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(undefined);
		this.mock(oODataMessageParser).expects("_parseUrl")
			.withExactArgs("BusinessPartnerSet('2')")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_isCollection").never();
		oFixture.resolveCalls.forEach(function (oResolveCall) {
			oProcessorMock.expects("resolve")
				.withExactArgs(oResolveCall.path, undefined, true)
				.returns(oResolveCall.result);
		});
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~deepPath/" + oFixture.target)
			.returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs(oFixture.targetToNormalize)
			.returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			oFixture.target, mRequestInfo, false, false);

		assert.strictEqual(oTargetInfo.deepPath, "~reducedPath");
		assert.strictEqual(oTargetInfo.target, "~normalizedTarget");
	});
});

	//*********************************************************************************************
[undefined, "/~deepPath"].forEach(function (sDeepPath) {
	QUnit.test("_createTarget: function call; deepPath = " + sDeepPath, function (assert) {
		var oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {
				request : {
					deepPath : sDeepPath,
					functionMetadata : "~functionMetadata",
					functionTarget : "/~functionTarget",
					headers : {},
					method : "~method"
				},
				response : {},
				url : "~requestURL"
			},
			oTargetInfo,
			mUrlData = {url : "~parsedUrl"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo)).returns(undefined);
		this.mock(oODataMessageParser).expects("_parseUrl").withExactArgs("~requestURL")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_isCollection")
			.withExactArgs("/~functionTarget").returns(false);
		this.mock(oODataMessageParser._processor).expects("resolve")
			.withExactArgs("/~functionTarget/~target", undefined, true).returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs(sDeepPath ? "/~deepPath/~target" : "/~target").returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey").withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			"~target", mRequestInfo, false, false);

		assert.strictEqual(oTargetInfo.deepPath, "~reducedPath");
		assert.strictEqual(oTargetInfo.target, "~normalizedTarget");
	});
});

	//*********************************************************************************************
	QUnit.test("_createTarget: function call, no functionMetadata", function (assert) {
		var oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {
				request : {
					deepPath : "/~deepPath",
					headers : {},
					method : "~method"
				},
				response : {},
				url : "~requestURL"
			},
			oTargetInfo,
			mUrlData = {url : "~parsedUrl"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo)).returns(undefined);
		this.mock(oODataMessageParser).expects("_parseUrl").withExactArgs("~requestURL")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_isCollection")
			.withExactArgs("/~parsedUrl").returns(false);
		this.mock(oODataMessageParser._processor).expects("resolve")
			.withExactArgs("/~parsedUrl/~target", undefined, true).returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("/~deepPath/~target").returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey").withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			"~target", mRequestInfo, false, false);

		assert.strictEqual(oTargetInfo.deepPath, "~reducedPath");
		assert.strictEqual(oTargetInfo.target, "~normalizedTarget");
	});

	//*********************************************************************************************
	QUnit.test("_createTarget: created entity", function (assert) {
		var oODataMessageParser = {
				_serviceUrl : "~serviceUrl",
				_metadata : {
					_getReducedPath : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {
				request : {deepPath : "~deepPath", method : "POST"},
				response : {
					headers : {location : "https://foo.com/~serviceUrl/~uriFromLocation"}
				},
				url : "~requestURL"
			},
			oTargetInfo,
			mUrlData = {url : "https://foo.com/~serviceUrl/~parsedUrl"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(true);
		this.mock(oODataMessageParser).expects("_parseUrl")
			.withExactArgs("https://foo.com/~serviceUrl/~uriFromLocation")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_isCollection")
			.withExactArgs("/~parsedUrl")
			.returns(true);
		this.mock(oODataMessageParser._processor).expects("resolve")
			// collection -> no / between path and target
			.withExactArgs("/~parsedUrl~target", undefined, true)
			.returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~deepPath~target") // collection -> no / between path and target
			.returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			"~target", mRequestInfo, false, false);

		assert.strictEqual(oTargetInfo.deepPath, "~reducedPath");
		assert.strictEqual(oTargetInfo.target, "~normalizedTarget");
	});

	//*********************************************************************************************
	QUnit.test("_createTarget: entity creation failed", function (assert) {
		var oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {
				request : {
					created : true,
					deepPath : "~deepPath",
					key : "~tempKey",
					method : "POST"
				},
				response : {statusCode : 400}
			},
			oTargetInfo,
			mUrlData = {url : "~parsedUrl"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(false);
		this.mock(oODataMessageParser).expects("_parseUrl")
			.withExactArgs("~tempKey")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_isCollection")
			.withExactArgs("/~parsedUrl")
			.returns(false);
		this.mock(oODataMessageParser._processor).expects("resolve")
			.withExactArgs("/~parsedUrl", undefined, true)
			.returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~deepPath") // collection -> no / between path and target
			.returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			/*sTarget*/ undefined, mRequestInfo, true, false);

		assert.strictEqual(oTargetInfo.deepPath, "~reducedPath");
		assert.strictEqual(oTargetInfo.target, "~normalizedTarget");
	});

	//*********************************************************************************************
	QUnit.test("_createTarget: no target; unbound message", function (assert) {
		var oODataMessageParser = {},
			mRequestInfo = {
				request : {headers : {"sap-message-scope" : "BusinessObject"}}
			},
			oTargetInfo;

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			/*sTarget*/ undefined, mRequestInfo, false, false);

		assert.strictEqual(oTargetInfo.deepPath, "");
		assert.strictEqual(oTargetInfo.target, "");
	});

	//*********************************************************************************************
	QUnit.test("_createTarget: no target; unbound transient technical message", function (assert) {
		var oTargetInfo;

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call({}, /*sTarget*/ undefined,
			"~mRequestInfo", true, true);

		assert.strictEqual(oTargetInfo.deepPath, "");
		assert.strictEqual(oTargetInfo.target, "");
	});


	//*********************************************************************************************
[
	{propertyref : undefined, target : "target", warning : false},
	{propertyref : "foo", target : "target", warning : true},
	{propertyref : "target", target : undefined, warning : false},
	{additionalTargets : ["bar"], target : "target"}
].forEach(function (oFixture, i) {
	QUnit.test("_createTargets, " + i, function (assert) {
		var oMessageObject = {
				additionalTargets : oFixture.additionalTargets,
				propertyref : oFixture.propertyref,
				target : oFixture.target,
				transition : "transition"
			},
			oODataMessageParser = {
				_createTarget : function () {}
			},
			oParserMock = this.mock(oODataMessageParser),
			mRequestInfo = {
				url : "~requestURL"
			},
			oTargetInfo;

		if (oFixture.warning) {
			this.oLogMock.expects("warning")
				.withExactArgs("Used the message's 'target' property for target calculation;"
						+ " the property 'propertyref' is deprecated and must not be used together"
						+ " with 'target'",
					"~requestURL", sClassName);
		}
		oParserMock.expects("_createTarget")
			.withExactArgs("target", sinon.match.same(mRequestInfo), "bIsTechnical", "transition")
			.returns({deepPath : "deepPath", target : "ui5MessageTarget"});
		if (oFixture.additionalTargets) {
			oParserMock.expects("_createTarget")
				.withExactArgs("bar", sinon.match.same(mRequestInfo), "bIsTechnical", "transition")
				.returns({deepPath : "barDeepPath", target : "barUi5MessageTarget"});
		}

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTargets
			.call(oODataMessageParser, oMessageObject, mRequestInfo, "bIsTechnical");

		assert.strictEqual(oTargetInfo.aDeepPaths.length, oFixture.additionalTargets ? 2 : 1);
		assert.strictEqual(oTargetInfo.aDeepPaths[0], "deepPath");
		assert.strictEqual(oTargetInfo.aTargets.length, oFixture.additionalTargets ? 2 : 1);
		assert.strictEqual(oTargetInfo.aTargets[0], "ui5MessageTarget");
		if (oFixture.additionalTargets) {
			assert.strictEqual(oTargetInfo.aDeepPaths[1], "barDeepPath");
			assert.strictEqual(oTargetInfo.aTargets[1], "barUi5MessageTarget");
		}
	});
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
}, {
	oMessage : new Message({message : "new", persistent : false, technical : true}),
	bExpectError : false
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
				+ "response, but requested only transition messages", undefined, sClassName);
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
			aMessages, mRequestInfo/* , mGetEntities, mChangeEntities, bSimpleMessageLifecycle*/);

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages);
	});
});

	//*********************************************************************************************
	QUnit.test("_propagateMessages: Messages belong to collections", function (assert) {
		var mGetEntities = {"Foo('1')" : true},
			oLastMessage1 = new Message({message : "delete", fullTarget : "/Foo('1')"}),
			oLastMessage2 = new Message({message : "keep", fullTarget : "/Foo('2')"}),
			oMessageProcessor = {fireMessageChange : function () {}},
			oNewMessage = new Message({message : "new", fullTarget : "/Foo('1')"}),
			aMessages = [oNewMessage],
			aNewLastMessages = [oLastMessage2, oNewMessage],
			oODataMessageParser = {
				_getAffectedTargets : function () {},
				_lastMessages : [oLastMessage1, oLastMessage2],
				getProcessor : function () {}
			},
			mRequestInfo = {
				request : {
					deepPath : "/Foo",
					functionMetadata : {},
					updateAggregatedMessages : true
				},
				response : {
					statusCode : 200
				}
			};

		this.mock(ODataMetadata).expects("_returnsCollection")
			.withExactArgs(mRequestInfo.request.functionMetadata).returns(true);
		this.mock(oODataMessageParser).expects("_getAffectedTargets")
			.withExactArgs(aMessages, mRequestInfo, mGetEntities, "~mChangeEntities");
		this.mock(oODataMessageParser).expects("getProcessor").withExactArgs()
			.returns(oMessageProcessor);
		this.mock(oMessageProcessor).expects("fireMessageChange")
			.withExactArgs(sinon.match({
				oldMessages : sinon.match([oLastMessage1]),
				newMessages : sinon.match.same(aMessages)
			}))
			.returns(oMessageProcessor);

		// code under test
		ODataMessageParser.prototype._propagateMessages.call(oODataMessageParser,
			aMessages, mRequestInfo , mGetEntities, "~mChangeEntities", "~bSimpleMessageLifeCycle");

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages);
	});

	//*********************************************************************************************
[undefined, {}].forEach(function (mGetEntities) {
	QUnit.test("_propagateMessages: mGetEntities: " + mGetEntities, function (assert) {
		var oLastMessage1 = new Message({message : "keep", fullTarget : "/Foo('1')"}),
			oLastMessage2 = new Message({message : "keep", fullTarget : "/Foo('2')"}),
			oMessageProcessor = {fireMessageChange : function () {}},
			aMessages = [],
			aNewLastMessages = [oLastMessage1, oLastMessage2],
			oODataMessageParser = {
				_getAffectedTargets : function () {},
				_lastMessages : [oLastMessage1, oLastMessage2],
				getProcessor : function () {}
			},
			mRequestInfo = {
				request : {
					deepPath : "/Foo",
					functionMetadata : {},
					updateAggregatedMessages : true
				},
				response : {
					statusCode : 200
				}
			};

		this.mock(ODataMetadata).expects("_returnsCollection")
			.withExactArgs(sinon.match.same(mRequestInfo.request.functionMetadata)).returns(true);
		this.mock(oODataMessageParser).expects("_getAffectedTargets")
			.withExactArgs(sinon.match.same(aMessages), sinon.match.same(mRequestInfo),
				{}, "~mChangeEntities");
		this.mock(oODataMessageParser).expects("getProcessor").withExactArgs()
			.returns(oMessageProcessor);
		this.mock(oMessageProcessor).expects("fireMessageChange")
			.withExactArgs(sinon.match({
				oldMessages : [],
				newMessages : []
			}))
			.returns(oMessageProcessor);

		// code under test
		ODataMessageParser.prototype._propagateMessages.call(oODataMessageParser,
			aMessages, mRequestInfo , mGetEntities, "~mChangeEntities", "~bSimpleMessageLifeCycle");

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages);
	});
});

	//*********************************************************************************************
	QUnit.test("_propagateMessages: return type is no collection", function (assert) {
		var mGetEntities = {"Foo('1')" : true},
			oLastMessage1 = new Message({message : "delete", fullTarget : "/Foo('1')"}),
			oMessageProcessor = {fireMessageChange : function () {}},
			oNewMessage = new Message({message : "new", fullTarget : "/Foo('1')"}),
			aMessage = [oNewMessage],
			aNewLastMessages = [oNewMessage],
			oODataMessageParser = {
				_getAffectedTargets : function () {},
				_lastMessages : [oLastMessage1],
				getProcessor : function () {}
			},
			mRequestInfo = {
				request : {
					deepPath : "/Foo('1')",
					functionMetadata : {},
					updateAggregatedMessages : true
				},
				response : {
					statusCode : 200
				}
			};

		this.mock(ODataMetadata).expects("_returnsCollection")
			.withExactArgs(mRequestInfo.request.functionMetadata).returns(false);
		this.mock(oODataMessageParser).expects("_getAffectedTargets")
			.withExactArgs(sinon.match.same(aMessage), sinon.match.same(mRequestInfo),
				sinon.match.same(mGetEntities), "~mChangeEntities");
		this.mock(oODataMessageParser).expects("getProcessor").withExactArgs()
			.returns(oMessageProcessor);
		this.mock(oMessageProcessor).expects("fireMessageChange")
			.withExactArgs(sinon.match({
				oldMessages : sinon.match([oLastMessage1]),
				newMessages : sinon.match.same(aMessage)
			}))
			.returns(oMessageProcessor);

		// code under test
		ODataMessageParser.prototype._propagateMessages.call(oODataMessageParser,
			aMessage, mRequestInfo , mGetEntities, "~mChangeEntities", "~bSimpleMessageLifeCycle");

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages);
	});

	//*********************************************************************************************
[{
	oMessageObject : {
		"@sap.severity" : "warning",
		description : "~description",
		target : "~target",
		"transient" : true
	},
	oExpectedMessage : {
		code : "",
		description : "~description",
		descriptionUrl : "",
		persistent : true,
		type : "Warning"
	}
}, {
	oMessageObject : {
		deepPath : "~deepPath",
		target : "/#TRANSIENT#/~target"
	},
	oExpectedMessage : {
		code : "",
		descriptionUrl : "",
		persistent : true,
		type : "None"
	}
}, {
	oMessageObject : {
		message : "~message",
		longtext_url : "~url",
		transition : true
	},
	oExpectedMessage : {
		code : "",
		descriptionUrl : "~url",
		message : "~message",
		persistent : true,
		type : "None"
	}
}, {
	oMessageObject : {
		code : "~code",
		message : {value : "~messageFromValue"},
		severity : "Error"
	},
	oExpectedMessage : {
		code : "~code",
		descriptionUrl : "",
		message : "~messageFromValue",
		persistent : false,
		type : "Error"
	}
}, {
	oMessageObject : {
		code : "~code",
		message : {value : "~messageFromValue"},
		severity : "Error"
	},
	oExpectedMessage : {
		code : "~code",
		descriptionUrl : "",
		message : "~messageFromValue",
		persistent : true,
		type : "Error"
	},
	bIsTechnical : true,
	bPersistTechnicalMessages : true
}, {
	oMessageObject : {
		code : "~code",
		message : {value : "~messageFromValue"},
		severity : "Error"
	},
	oExpectedMessage : {
		code : "~code",
		descriptionUrl : "",
		message : "~messageFromValue",
		persistent : false,
		type : "Error"
	},
	bIsTechnical : true,
	bPersistTechnicalMessages : false
}].forEach(function (oFixture, i) {
	QUnit.test("_createMessage: " + i, function (assert) {
		var aDeepPaths = ["~fullTargetFrom_createTarget0", "~fullTargetFrom_createTarget1"],
			oExpectedMessage = oFixture.oExpectedMessage,
			bIsTechnical = !!oFixture.bIsTechnical,
			oMessage,
			oMessageObject = oFixture.oMessageObject,
			oODataMessageParser = {
				_createTargets : function () {},
				_bPersistTechnicalMessages : oFixture.bPersistTechnicalMessages,
				_processor : "~_processor"
			},
			mRequestInfo = {
				response : {headers : "~headers", statusCode : "~statusCode"}
			},
			aTargets = ["~targetFrom_createTarget0", "~targetFrom_createTarget1"];

		this.mock(oODataMessageParser).expects("_createTargets")
			.withExactArgs(sinon.match.same(oMessageObject)
					.and(sinon.match.has("transition", oExpectedMessage.persistent)),
				sinon.match.same(mRequestInfo), oFixture.bIsTechnical)
			.callsFake(function (oMessageObject) {
				return {
					aDeepPaths : aDeepPaths,
					aTargets : aTargets
				};
			});

		// code under test
		oMessage = ODataMessageParser.prototype._createMessage.call(oODataMessageParser,
			oMessageObject, mRequestInfo, oFixture.bIsTechnical);

		assert.ok(oMessage instanceof Message);
		assert.strictEqual(oMessage.code, oExpectedMessage.code);
		assert.strictEqual(oMessage.description, oExpectedMessage.description);
		assert.strictEqual(oMessage.descriptionUrl, oExpectedMessage.descriptionUrl);
		assert.strictEqual(oMessage.fullTarget, "~fullTargetFrom_createTarget0");
		assert.deepEqual(oMessage.aFullTargets, aDeepPaths);
		assert.strictEqual(oMessage.message, oExpectedMessage.message);
		assert.strictEqual(oMessage.persistent, oExpectedMessage.persistent);
		assert.strictEqual(oMessage.processor, "~_processor");
		assert.strictEqual(oMessage.target, "~targetFrom_createTarget0");
		assert.deepEqual(oMessage.aTargets, aTargets);
		assert.strictEqual(oMessage.technical, bIsTechnical);
		assert.deepEqual(oMessage.technicalDetails,
			{headers : "~headers", statusCode : "~statusCode"});
		assert.strictEqual(oMessage.type, oExpectedMessage.type);
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

	//*********************************************************************************************
[{
	oResult : {"" : true}
}, {
	mGetEntities : {"get" : true},
	mChangeEntities : {"change" : true},
	oResult : {"" : true, "get" : true, "change" : true}
}, {
	oRequest : {key : "key", created : true},
	oResult : {"" : true, "key" : true}
}, {
	sUrl : "serviceUrl/requestTarget",
	oResult : {"" : true}
}, {
	oEntitySet : {name : "name"},
	oResult : {"" : true, "name" : true}
}, {
	aMessageTargets : [""], // unbound message
	oResult : {"" : true}
}, {
	aMessageTargets : ["target0", "/target1", "target2/", "/target3/"], // single segment targets
	oResult : {"" : true, "target0" : true, "target1" : true, "target2" : true, "target3" : true}
}, {
	// multi segment targets
	aMessageTargets : ["parentEntity/property", "parentEntity/navProperty/property2"],
	bNavPropCalled : true,
	oResult : {
		"" : true,
		"parentEntity/property" : true,
		"parentEntity" : true,
		"parentEntity/navProperty/property2" : true,
		"parentEntity/navProperty" : true
	}
}, {
	aMessageTargets : [ // multi-target messages
		["parentEntity/property", "parentEntity/navProperty/property2"],
		["target0", "/target1", "target2/", "/target3/"]
	],
	oResult : {
		"" : true,
		"parentEntity/property" : true,
		"parentEntity" : true,
		"parentEntity/navProperty/property2" : true,
		"parentEntity/navProperty" : true,
		"target0" : true,
		"target1" : true,
		"target2" : true,
		"target3" : true
	}
}].forEach(function (oFixture, i) {
	QUnit.test("_getAffectedTargets, " + i, function (assert) {
		var mAffectedTargets,
			aMessages = [],
			oODataMessageParser = {
				_metadata : {
					_getEntitySetByPath : function () {}
				},
				_parseUrl : function () {},
				_serviceUrl : "serviceUrl"
			},
			mRequestInfo = {
				request : oFixture.oRequest,
				url : "url"
			},
			that = this;

		this.mock(oODataMessageParser).expects("_parseUrl").withExactArgs("url")
			.returns({url : oFixture.sUrl || "requestTarget"});
		this.mock(oODataMessageParser._metadata).expects("_getEntitySetByPath")
			.withExactArgs("requestTarget")
			.returns(oFixture.oEntitySet);
		if (oFixture.aMessageTargets) {
			oFixture.aMessageTargets.forEach(function (vTarget) {
				var oMessage = {getTargets : function () {}};

				that.mock(oMessage).expects("getTargets").withExactArgs()
					.returns(Array.isArray(vTarget) ? vTarget : [vTarget]);
				aMessages.push(oMessage);
			});
		}

		// code under test
		mAffectedTargets = ODataMessageParser.prototype._getAffectedTargets.call(
			oODataMessageParser, aMessages, mRequestInfo, oFixture.mGetEntities || {},
			oFixture.mChangeEntities || {});

		assert.deepEqual(mAffectedTargets, oFixture.oResult);
	});
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

	//*********************************************************************************************
[{
	method : "_parseHeader",
	statusCode : 200
}, {
	method : "_parseHeader",
	statusCode : 299
}, {
	method : "_parseBody",
	statusCode : 400
}, {
	method : "_parseBody",
	statusCode : 599
}, {
	method : "_parseHeader",
	requestMethod : "MERGE",
	statusCode : 204
}].forEach(function (oFixture, i) {
	[false, true].forEach(function (bMessageScopeSupported, j) {
		[false, true].forEach(function (bStatusCodeAsString, k) {
	QUnit.test("parse: " + i + "," + j + "," + k, function (assert) {
		var oODataMessageParser = {
				_parseBody : function () {},
				_parseHeader : function () {},
				_propagateMessages : function () {}
			},
			oRequest = {
				method : oFixture.requestMethod || "GET",
				requestUri : "~requestUri"
			},
			oResponse = {
				statusCode : bStatusCodeAsString ? String(oFixture.statusCode) : oFixture.statusCode
			},
			mRequestInfo = {
				request : oRequest,
				response : oResponse,
				url : "~requestUri"
			};

		this.mock(oODataMessageParser).expects(oFixture.method)
			.withExactArgs([], sinon.match.same(oResponse), mRequestInfo)
			.callsFake(function (aMessages) { // check proper handling of "ref" parameter aMessages
				aMessages.push("~message");
			});
		this.mock(oODataMessageParser).expects("_propagateMessages")
			.withExactArgs(["~message"], mRequestInfo, "~mGetEntities", "~mChangeEntities",
				!bMessageScopeSupported);

		// code under test
		ODataMessageParser.prototype.parse.call(oODataMessageParser, oResponse, oRequest,
			"~mGetEntities", "~mChangeEntities", bMessageScopeSupported);
	});
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bStatusCodeAsString) {
	QUnit.test("parse: unsupported status code, " + bStatusCodeAsString, function (assert) {
		var oODataMessageParser = {
				_addGenericError : function () {},
				_parseBody : function () {},
				_parseHeader : function () {},
				_propagateMessages : function () {}
			},
			oRequest = {method : "GET", requestUri : "~requestUri"},
			oResponse = {statusCode : bStatusCodeAsString ? "301" : 301},
			mRequestInfo = {
				request : oRequest,
				response : oResponse,
				url : "~requestUri"
			};

		this.mock(oODataMessageParser).expects("_parseBody").never();
		this.mock(oODataMessageParser).expects("_parseHeader").never();
		this.mock(oODataMessageParser).expects("_addGenericError")
			.withExactArgs([], mRequestInfo)
			.callsFake(function (aMessages, mRequestInfo) {
				aMessages.push("~genericMessage");
			});
		this.mock(oODataMessageParser).expects("_propagateMessages")
			.withExactArgs(["~genericMessage"], mRequestInfo, "~mGetEntities", "~mChangeEntities",
				false);

		// code under test
		ODataMessageParser.prototype.parse.call(oODataMessageParser, oResponse, oRequest,
			"~mGetEntities", "~mChangeEntities", true);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bStatusCodeAsString) {
	QUnit.test("parse: ignore GET with 204 response, " + bStatusCodeAsString, function (assert) {
		var oODataMessageParser = {
				_parseBody : function () {},
				_parseHeader : function () {},
				_propagateMessages : function () {}
			},
			oRequest = {method : "GET", requestUri : "~requestUri"},
			oResponse = {statusCode : bStatusCodeAsString ? "204" : 204};

		this.mock(oODataMessageParser).expects("_parseBody").never();
		this.mock(oODataMessageParser).expects("_parseHeader").never();
		this.mock(oODataMessageParser).expects("_propagateMessages").never();

		// code under test
		ODataMessageParser.prototype.parse.call(oODataMessageParser, oResponse, oRequest,
			"~mGetEntities", "~mChangeEntities", true);
	});
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
