/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataMessageParser",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/model/odata/ODataUtils"
], function (Log, Library, Messaging, Message, MessageType, MessageScope, ODataMessageParser, ODataMetadata, ODataUtils) {
	/*global QUnit,sinon*/
	/*eslint camelcase: 0, max-nested-callbacks: 0, no-warning-comments: 0*/
	"use strict";

	var sClassName = "sap.ui.model.odata.ODataMessageParser";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataMessageParser (ODataMessageParserNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
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
				getId : function() { return "myID"; },
				fireEvent : function () {},
				setMessages : function () {}
			},
			// placeholder for messages; mAffectedTargets is computed based on new messages
			aMessages = [new Message({
				message : "{sap.ui.core.message.Message} oMessage...",
				processor: oMessageProcessor
			})],
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
		this.mock(Messaging).expects("updateMessages")
			.withExactArgs(sinon.match(aExpectedMessagesToBeRemoved), sinon.match.same(aMessages));

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
				getId : function() { return "myID"; },
				fireEvent : function () {},
				setMessages : function () {}
			},
			// placeholder for messages; mAffectedTargets is computed based on new messages
			aMessages = [new Message({
				message : "{sap.ui.core.message.Message} oMessage...",
				processor: oMessageProcessor
			})],
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
		this.mock(Messaging).expects("updateMessages")
			.withExactArgs(sinon.match(aExpectedMessagesToBeRemoved), sinon.match.same(aMessages));

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
		const oODataUtilsMock = this.mock(ODataUtils);
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~reducedPath").returns("~normalizedReducedPath");
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~canonicalTarget").returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			sODataTarget, mRequestInfo, bIsTechnical, /*bODataTransition*/ false);

		assert.strictEqual(oTargetInfo.deepPath, "~normalizedReducedPath");
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
		const oODataUtilsMock = this.mock(ODataUtils);
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~reducedPath").returns("~normalizedReducedPath");
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~canonicalTarget").returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			sODataTarget, mRequestInfo, oFixture.isTechnical, /*bODataTransition*/ false);

		assert.strictEqual(oTargetInfo.deepPath, "~normalizedReducedPath");
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
		const oODataUtilsMock = this.mock(ODataUtils);
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~reducedPath").returns("~normalizedReducedPath");
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~canonicalTarget").returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			oFixture.sODataTarget, mRequestInfo, true, oFixture.bODataTransition);

		assert.strictEqual(oTargetInfo.deepPath, "~normalizedReducedPath");
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
		const oODataUtilsMock = this.mock(ODataUtils);
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~reducedPath").returns("~normalizedReducedPath");
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~canonicalTarget").returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			"~target", mRequestInfo, false, /*bODataTransition*/ false);

		assert.strictEqual(oTargetInfo.deepPath, "~normalizedReducedPath");
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
		const oODataUtilsMock = this.mock(ODataUtils);
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~reducedPath").returns("~normalizedReducedPath");
		oODataUtilsMock.expects("_normalizeKey").withExactArgs(oFixture.targetToNormalize).returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			oFixture.target, mRequestInfo, false, false);

		assert.strictEqual(oTargetInfo.deepPath, "~normalizedReducedPath");
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
		const oODataUtilsMock = this.mock(ODataUtils);
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~reducedPath").returns("~normalizedReducedPath");
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~canonicalTarget").returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			"~target", mRequestInfo, false, false);

		assert.strictEqual(oTargetInfo.deepPath, "~normalizedReducedPath");
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
		const oODataUtilsMock = this.mock(ODataUtils);
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~reducedPath").returns("~normalizedReducedPath");
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~canonicalTarget").returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			"~target", mRequestInfo, false, false);

		assert.strictEqual(oTargetInfo.deepPath, "~normalizedReducedPath");
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
		const oODataUtilsMock = this.mock(ODataUtils);
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~reducedPath").returns("~normalizedReducedPath");
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~canonicalTarget").returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			"~target", mRequestInfo, false, false);

		assert.strictEqual(oTargetInfo.deepPath, "~normalizedReducedPath");
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
		const oODataUtilsMock = this.mock(ODataUtils);
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~reducedPath").returns("~normalizedReducedPath");
		oODataUtilsMock.expects("_normalizeKey").withExactArgs("~canonicalTarget").returns("~normalizedTarget");

		// code under test
		oTargetInfo = ODataMessageParser.prototype._createTarget.call(oODataMessageParser,
			/*sTarget*/ undefined, mRequestInfo, true, false);

		assert.strictEqual(oTargetInfo.deepPath, "~normalizedReducedPath");
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
		this.mock(Messaging).expects("updateMessages")
			.withExactArgs(sinon.match([]), sinon.match.same(aMessages));

		// code under test
		ODataMessageParser.prototype._propagateMessages.call(oODataMessageParser,
			aMessages, mRequestInfo/* , mGetEntities, mChangeEntities, bSimpleMessageLifecycle*/);

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages);
	});
});

	//*********************************************************************************************
	QUnit.test("_propagateMessages: Messages belong to collections", function (assert) {
		var mGetEntities = {"Foo('1')" : true},
			oMessageProcessor = {
				getId : function() { return "myID"; },
				fireEvent : function () {},
				setMessages : function () {}
			},
			oLastMessage1 = new Message({message : "delete", fullTarget : "/Foo('1')", processor: oMessageProcessor}),
			oLastMessage2 = new Message({message : "keep", fullTarget : "/Foo('2')", processor: oMessageProcessor}),
			oNewMessage = new Message({message : "new", fullTarget : "/Foo('1')", processor: oMessageProcessor}),
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
			this.mock(Messaging).expects("updateMessages")
			.withExactArgs(sinon.match([oLastMessage1]), sinon.match.same(aMessages));

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
		this.mock(Messaging).expects("updateMessages")
			.withExactArgs(sinon.match([]), sinon.match.same(aMessages));

		// code under test
		ODataMessageParser.prototype._propagateMessages.call(oODataMessageParser,
			aMessages, mRequestInfo , mGetEntities, "~mChangeEntities", "~bSimpleMessageLifeCycle");

		assert.deepEqual(oODataMessageParser._lastMessages, aNewLastMessages);
	});
});

	//*********************************************************************************************
	QUnit.test("_propagateMessages: return type is no collection", function (assert) {
		var mGetEntities = {"Foo('1')" : true},
			oMessageProcessor = {
				getId : function() { return "myID"; },
				fireEvent : function () {},
				setMessages : function () {}
			},
			oLastMessage1 = new Message({message : "delete", fullTarget : "/Foo('1')", processor: oMessageProcessor}),
			oNewMessage = new Message({message : "new", fullTarget : "/Foo('1')", processor: oMessageProcessor}),
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
		this.mock(Messaging).expects("updateMessages")
			.withExactArgs(sinon.match([oLastMessage1]), sinon.match.same(aMessage));

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
		assert.deepEqual(oMessage.aFullTargets, aDeepPaths);
		assert.strictEqual(oMessage.message, oExpectedMessage.message);
		assert.strictEqual(oMessage.persistent, oExpectedMessage.persistent);
		assert.strictEqual(oMessage.processor, "~_processor");
		assert.deepEqual(oMessage.aTargets, aTargets);
		assert.strictEqual(oMessage.technical, bIsTechnical);
		assert.deepEqual(oMessage.technicalDetails,
			{headers : "~headers", statusCode : "~statusCode"});
		assert.strictEqual(oMessage.type, oExpectedMessage.type);
		/**
		 * @deprecated As of version 1.79.0
		*/
		(function () {
			assert.strictEqual(oMessage.fullTarget, "~fullTargetFrom_createTarget0");
			assert.strictEqual(oMessage.target, "~targetFrom_createTarget0");
		}());
	});
});

	//*********************************************************************************************
	QUnit.test("_createGenericError", function (assert) {
		var oODataMessageParser = new ODataMessageParser("/foo"),
			mRequestInfo = {
				response : {body : "~body"}
			},
			oResourceBundle = {
				getText : function () {}
			};

		this.mock(Library).expects("getResourceBundleFor")
			.withExactArgs("sap.ui.core")
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
			.returns("~oMessage");

		// code under test
		assert.deepEqual(oODataMessageParser._createGenericError(mRequestInfo), ["~oMessage"]);
	});

	//*********************************************************************************************
[{
	headers : {"Content-Type" : "application/xml;charset=utf-8"},
	expectedContentType : "application/xml"
}, {
	headers : {"CONTENT-TYPE" : "application/xml;charset=utf-8"},
	expectedContentType : "application/xml"
}, {
	headers : {"content-type" : "application/xml"},
	expectedContentType : "application/xml"
}, {
	headers : {"Content-Type" : "text/xml;charset=utf-8"},
	expectedContentType : "text/xml"
}].forEach(function (oFixture, i) {
	QUnit.test("_parseBody: xml #" + i, function (assert) {
		var oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {headers : oFixture.headers};

		this.mock(oMessageParser).expects("_parseBodyXML")
			.withExactArgs(sinon.match.same(oResponse),
				"~mRequestInfo", oFixture.expectedContentType)
			.returns("~aMessages");

		// code under test
		assert.strictEqual(oMessageParser._parseBody(oResponse, "~mRequestInfo"), "~aMessages");
	});
});

	//*********************************************************************************************
[
	{},
	{"content-type" : "foo"},
	{"Content-Type" : "application/json;charset=utf-8"},
	{"CONTENT-TYPE" : "application/json;charset=utf-8"},
	{"content-type" : "application/json"}
].forEach(function (mHeaders, i) {
	QUnit.test("_parseBody: json #" + i, function (assert) {
		var oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {headers : mHeaders};

		this.mock(oMessageParser).expects("_parseBodyJSON")
			.withExactArgs(sinon.match.same(oResponse), "~mRequestInfo")
			.returns("~aMessages");

		// code under test
		assert.strictEqual(oMessageParser._parseBody(oResponse, "~mRequestInfo"), "~aMessages");
	});
});

	//*********************************************************************************************
	QUnit.test("_parseBody: xml parse error", function (assert) {
		var oError = new Error("~error"),
			oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {headers : {"content-type" : "application/xml"}};

		this.mock(oMessageParser).expects("_parseBodyXML")
			.withExactArgs(sinon.match.same(oResponse), "~mRequestInfo", "application/xml")
			.throws(oError);

		// code under test
		assert.throws(function () {
			oMessageParser._parseBody(oResponse, "~mRequestInfo");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("_parseBody: json parse error", function (assert) {
		var oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {headers : {"content-type" : "application/json"}};

		this.mock(oMessageParser).expects("_parseBodyJSON")
			.withExactArgs(sinon.match.same(oResponse), "~mRequestInfo")
			.throws("~error");

		// code under test
		assert.throws(function () {
			oMessageParser._parseBody(oResponse, "~mRequestInfo");
		}, "~error");
	});

	//*********************************************************************************************
	QUnit.test("_parseBody: filter duplicates JSON (integrative)", function (assert) {
		var oInnerError0 = {
				code : "~code0",
				message : "foo",
				severity : "error",
				target : "",
				transition : false
			},
			oInnerError1 = {
				code : "~code1",
				message : "bar",
				severity : "error",
				target : "",
				transition : false
			},
			// use Message instances, filtering calls getCode and getMessage on these instances
			oMessage0 = new Message({code : "~code0", message : "foo"}),
			oMessage1 = new Message({code : "~code0", message : "foo"}),
			oMessage2 = new Message({code : "~code1", message : "bar"}),
			oMessageParser = new ODataMessageParser("/foo"),
			oMessageParserMock = this.mock(oMessageParser),
			mRequestInfo = {request : {headers : {}}},
			oResponse = {
				body : "{\"error\":{\"code\":\"~code0\",\"message\":{\"value\":\"foo\"},"
					+ "\"innererror\":{\"errordetails\":[{\"code\":\"~code0\",\"message\":\"foo\","
					+ "\"severity\":\"error\",\"transition\":false,\"target\":\"\"},"
					+ "{\"code\":\"~code1\",\"message\":\"bar\",\"severity\":\"error\","
					+ "\"transition\":false,\"target\":\"\"}]}}}",
				headers : {"content-type" : "application/json"}
			},
			aResult;

		oMessageParserMock.expects("_createMessage")
			.withExactArgs({
					code : "~code0",
					innererror : {errordetails : [oInnerError0, oInnerError1]},
					message : {value : "foo"},
					severity : "Error"
				}, sinon.match.same(mRequestInfo), true)
			.returns(oMessage0);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(oInnerError0, sinon.match.same(mRequestInfo), true)
			.returns(oMessage1);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(oInnerError1, sinon.match.same(mRequestInfo), true)
			.returns(oMessage2);

		// code under test
		aResult = oMessageParser._parseBody(oResponse, mRequestInfo);

		assert.strictEqual(aResult.length, 2);
		assert.strictEqual(aResult[0], oMessage1);
		assert.strictEqual(aResult[1], oMessage2);
	});

	//*********************************************************************************************
	QUnit.test("_parseBody: filter duplicates XML (integrative)", function (assert) {
		// use Message instances, filtering calls getCode and getMessage on these instances
		var oMessage0 = new Message({code : "~code0", message : "foo"}),
			oMessage1 = new Message({code : "~code0", message : "foo"}),
			oMessage2 = new Message({code : "~code1", message : "bar"}),
			oMessageParser = new ODataMessageParser("/foo"),
			oMessageParserMock = this.mock(oMessageParser),
			mRequestInfo = {request : {headers : {}}},
			oResponse = {
				body : "<error><code>~code0</code><message>foo</message><innererror><errordetails>"
					+ "<errordetail><code>~code0</code><message>foo</message><target></target>"
					+ "<severity>error</severity></errordetail><errordetail><code>~code1</code>"
					+ "<message>bar</message><target></target><severity>error</severity>"
					+ "</errordetail></errordetails></innererror></error>",
				headers : {"content-type" : "application/xml"}
			},
			aResult;

		oMessageParserMock.expects("_createMessage")
			.withExactArgs({code : "~code0", message : "foo", severity : "Error"},
				sinon.match.same(mRequestInfo), true)
			.returns(oMessage0);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs({code : "~code0", message : "foo", severity : "error", target : ""},
				sinon.match.same(mRequestInfo), true)
			.returns(oMessage1);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs({code : "~code1", message : "bar", severity : "error", target : ""},
				sinon.match.same(mRequestInfo), true)
			.returns(oMessage2);

		// code under test
		aResult = oMessageParser._parseBody(oResponse, mRequestInfo);

		assert.strictEqual(aResult.length, 2);
		assert.strictEqual(aResult[0], oMessage1);
		assert.strictEqual(aResult[1], oMessage2);
	});

	//*********************************************************************************************
[{
	code : "~code0",
	message : "foo2"
}, {
	code : "~code0.1",
	message : "foo"
}].forEach(function (oOuterMessage, i) {
	[{
		body : "{\"error\":{\"code\":\"" + oOuterMessage.code + "\",\"message\":"
			+ "{\"value\":\"" + oOuterMessage.message + "\"},"
			+ "\"innererror\":{\"errordetails\":[{\"code\":\"~code0\",\"message\":\"foo\","
			+ "\"severity\":\"error\",\"transition\":false,\"target\":\"\"},"
			+ "{\"code\":\"~code1\",\"message\":\"bar\",\"severity\":\"error\","
			+ "\"transition\":false,\"target\":\"\"}]}}}",
		headers : {"content-type" : "application/json"}
	}, {
		body : "<error><code>" + oOuterMessage.code + "</code><message>" + oOuterMessage.message
			+ "</message><innererror><errordetails>"
			+ "<errordetail><code>~code0</code><message>foo</message><target></target>"
			+ "<severity>error</severity></errordetail><errordetail><code>~code1</code>"
			+ "<message>bar</message><target></target><severity>error</severity>"
			+ "</errordetail></errordetails></innererror></error>",
		headers : {"content-type" : "application/xml"}
	}].forEach(function (oResponse) {
	var sTitle = "_parseBody: no duplicate (integrative) #" + i + ", "
			+ oResponse.headers["content-type"];

	QUnit.test(sTitle, function (assert) {
		// use Message instances, filtering calls getCode and getMessage on these instances
		var oMessage0 = new Message({code : oOuterMessage.code, message : oOuterMessage.message}),
			oMessage1 = new Message({code : "~code0", message : "foo"}),
			oMessage2 = new Message({code : "~code1", message : "bar"}),
			oMessageParser = new ODataMessageParser("/foo"),
			oMessageParserMock = this.mock(oMessageParser),
			mRequestInfo = {request : {headers : {}}},
			aResult;

		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.object.and(sinon.match.has("code", oOuterMessage.code))
					.and(/*JSON*/sinon.match.has("message", {value : oOuterMessage.message})
						.or(/*XML*/sinon.match.has("message", oOuterMessage.message))),
				sinon.match.same(mRequestInfo), true)
			.returns(oMessage0);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.object, sinon.match.same(mRequestInfo), true)
			.returns(oMessage1);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.object, sinon.match.same(mRequestInfo), true)
			.returns(oMessage2);

		// code under test
		aResult = oMessageParser._parseBody(oResponse, mRequestInfo);

		assert.strictEqual(aResult.length, 3);
		assert.strictEqual(aResult[0], oMessage0);
		assert.strictEqual(aResult[1], oMessage1);
		assert.strictEqual(aResult[2], oMessage2);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("_parseBodyXML: no error tag", function (assert) {
		var sContentType = "application/xml",
			oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {
				// valid XML, but no error or errordetail tag
				body : '<?xml version="1.0" encoding="utf-8"?><foo></foo>'
			},
			mRequestInfo = {
				response : oResponse
			};

		this.mock(oMessageParser).expects("_createGenericError")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns("~aMessages");

		// code under test
		assert.strictEqual(oMessageParser._parseBodyXML(oResponse, mRequestInfo, sContentType),
			"~aMessages");
	});

	//*********************************************************************************************
	QUnit.test("_parseBodyXML: DOMParser throws exception", function (assert) {
		var oError = Error("~error"),
			oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {body : "~foo"},
			mRequestInfo = {
				response : oResponse
			};

		this.mock(DOMParser.prototype).expects("parseFromString")
			.withExactArgs("~foo", "~content-type")
			.throws(oError);
		this.mock(oMessageParser).expects("_createGenericError").never();

		// code under test
		assert.throws(function () {
			oMessageParser._parseBodyXML(oResponse, mRequestInfo, "~content-type");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("_parseBodyJSON: no error property", function (assert) {
		var oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {
				// valid JSON, but no error property
				body : '{"foo" : "bar"}'
			},
			mRequestInfo = {
				response : oResponse
			};

		this.oLogMock.expects("error")
			.withExactArgs("Error message returned by server did not contain error-field");
		this.mock(oMessageParser).expects("_createGenericError")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns("~aMessages");

		// code under test
		assert.strictEqual(oMessageParser._parseBodyJSON(oResponse, mRequestInfo), "~aMessages");
	});

	//*********************************************************************************************
	QUnit.test("_parseBodyJSON: plain text", function (assert) {
		var oJSONSpy = sinon.spy(JSON, "parse"),
			oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {body : "~foo"},
			mRequestInfo = {
				response : oResponse
			};

		this.mock(oMessageParser).expects("_createGenericError").never();

		// code under test
		assert.throws(function () {
			oMessageParser._parseBodyJSON(oResponse, mRequestInfo);
		}, SyntaxError);

		assert.ok(oJSONSpy.calledWith("~foo"));
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
				request : oFixture.oRequest || {},
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
				_logErrorMessages : function () {},
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
			.withExactArgs(sinon.match.same(oResponse), mRequestInfo)
			.returns("~aMessages");
		this.mock(oODataMessageParser).expects("_logErrorMessages")
			.withExactArgs("~aMessages", sinon.match.same(oRequest), String(oFixture.statusCode))
			.exactly(oFixture.method === "_parseBody" ? 1 : 0);
		this.mock(oODataMessageParser).expects("_propagateMessages")
			.withExactArgs("~aMessages", mRequestInfo, "~mGetEntities", "~mChangeEntities",
				!bMessageScopeSupported);

		// code under test
		ODataMessageParser.prototype.parse.call(oODataMessageParser, oResponse, oRequest,
			"~mGetEntities", "~mChangeEntities", bMessageScopeSupported);
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("parse: catch _parseBody error", function (assert) {
		var oError = new Error("~error"),
			oMessageParser = new ODataMessageParser("/foo"),
			oRequest = {
				method : "POST",
				requestUri : "~requestUri"
			},
			oResponse = {
				statusCode : "400"
			},
			mRequestInfo = {
				request : oRequest,
				response : oResponse,
				url : "~requestUri"
			};

		this.mock(oMessageParser).expects("_parseBody")
			.withExactArgs(sinon.match.same(oResponse), mRequestInfo)
			.throws(oError);
		this.mock(oMessageParser).expects("_createGenericError")
			.withExactArgs(mRequestInfo)
			.returns("~aMessages");
		this.oLogMock.expects("debug")
			.withExactArgs("Failed to parse error messages from the response body",
				sinon.match.same(oError), sClassName);
		this.mock(oMessageParser).expects("_logErrorMessages")
			.withExactArgs("~aMessages", sinon.match.same(oRequest), "400");
		this.mock(oMessageParser).expects("_propagateMessages")
			.withExactArgs("~aMessages", mRequestInfo, "~mGetEntities", "~mChangeEntities", false);

		// code under test
		oMessageParser.parse(oResponse, oRequest, "~mGetEntities", "~mChangeEntities",
			/*bMessageScopeSupported*/ true);
	});

	//*********************************************************************************************
[false, true].forEach(function (bStatusCodeAsString) {
	QUnit.test("parse: unsupported status code, " + bStatusCodeAsString, function (assert) {
		var oODataMessageParser = {
				_createGenericError : function () {},
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
		this.mock(oODataMessageParser).expects("_createGenericError")
			.withExactArgs(mRequestInfo)
			.returns("~aMessages");
		this.oLogMock.expects("error")
			.withExactArgs("Request failed with unsupported status code 301: GET ~requestUri",
				undefined, sClassName);
		this.mock(oODataMessageParser).expects("_propagateMessages")
			.withExactArgs("~aMessages", mRequestInfo, "~mGetEntities", "~mChangeEntities", false);

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

	//*********************************************************************************************
[false, true].forEach(function (bStatusCodeAsString) {
	QUnit.test("parse: only log GET with 424 response, " + bStatusCodeAsString, function (assert) {
		var oODataMessageParser = {
				_logErrorMessages : function () {},
				_parseBody : function () {},
				_parseHeader : function () {},
				_propagateMessages : function () {}
			},
			oRequest = {method : "GET", requestUri : "~requestUri"},
			oResponse = {statusCode : bStatusCodeAsString ? "424" : 424};

		this.mock(oODataMessageParser).expects("_parseBody")
			.withExactArgs(sinon.match.same(oResponse), {
				request : sinon.match.same(oRequest),
				response : sinon.match.same(oResponse),
				url : "~requestUri"
			})
			.returns("~aMessages");
		this.mock(oODataMessageParser).expects("_logErrorMessages")
			.withExactArgs("~aMessages", sinon.match.same(oRequest), "424");
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

		// code under test
		ODataMessageParser.prototype._setPersistTechnicalMessages.call(oODataMessageParser,
			"~bPersist");

		assert.strictEqual(oODataMessageParser._bPersistTechnicalMessages, "~bPersist");
	});

	//**********************************************************************************************
[
	{code : "~code0", message : {value : "foo"}},
	{code : "~code0", message : "foo"}
].forEach(function (oOuterMessage, i) {
	QUnit.test("_getBodyMessages: filter duplicates #" + i, function (assert) {
		var aInnerMessages = [
				{code : "~code0", message : "foo"},
				{code : "~code1", message : "bar"}
			],
			// use Message instances as getCode and getMessage are called
			oMessage0 = new Message({code : "~code0", message : "foo"}),
			oMessage1 = new Message(aInnerMessages[0]),
			oMessage2 = new Message(aInnerMessages[1]),
			oMessageParser = new ODataMessageParser("/foo"),
			oMessageParserMock = this.mock(oMessageParser),
			mRequestInfo = {request : {headers : {}}},
			aResult;

		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(oOuterMessage), sinon.match.same(mRequestInfo), true)
			.returns(oMessage0);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(aInnerMessages[0]), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage1);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(aInnerMessages[1]), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage2);
		this.mock(oMessage0).expects("getCode").withExactArgs().callThrough();
		this.mock(oMessage0).expects("getMessage").withExactArgs().callThrough();

		// code under test
		aResult = oMessageParser._getBodyMessages(oOuterMessage, aInnerMessages, mRequestInfo);

		assert.strictEqual(aResult.length, 2);
		assert.strictEqual(aResult[0], oMessage1);
		assert.strictEqual(aResult[1], oMessage2);
	});
});

	//**********************************************************************************************
[{
	iGetMessageCount : 1,
	oOuterMessage : {
		code : "~code0",
		message : "foo2"
	}
}, {
	iGetMessageCount : 0,
	oOuterMessage : {
		code : "~code0.1",
		message : "foo"
	}
}].forEach(function (oFixture, i) {
	[{"Content-ID" : "id-123"}, {}].forEach(function (oRequestHeaders){
	var sTitle = "_getBodyMessages: no duplicates #" + i + "; request headers: "
			+ JSON.stringify(oRequestHeaders);

	QUnit.test(sTitle, function (assert) {
		var aInnerMessages = [
				{code : "~code0", ContentID : "", message : "foo"},
				{code : "~code1", message : "bar"}
			],
			// use Message instances as getCode and getMessage are called
			oMessage0 = new Message(oFixture.oOuterMessage),
			oMessage1 = new Message(aInnerMessages[0]),
			oMessage2 = new Message(aInnerMessages[1]),
			oMessageParser = new ODataMessageParser("/foo"),
			oMessageParserMock = this.mock(oMessageParser),
			mRequestInfo = {request : {headers : oRequestHeaders}},
			aResult;

		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(oFixture.oOuterMessage), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage0);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(aInnerMessages[0]), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage1);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(aInnerMessages[1]), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage2);
		this.mock(oMessage0).expects("getCode").withExactArgs().twice().callThrough();
		this.mock(oMessage0).expects("getMessage").withExactArgs()
			.exactly(oFixture.iGetMessageCount)
			.callThrough();

		// code under test
		aResult = oMessageParser._getBodyMessages(oFixture.oOuterMessage, aInnerMessages,
			mRequestInfo);

		assert.strictEqual(aResult.length, 3);
		assert.strictEqual(aResult[0], oMessage0);
		assert.strictEqual(aResult[1], oMessage1);
		assert.strictEqual(aResult[2], oMessage2);
	});
	});
});

	//**********************************************************************************************
	QUnit.test("_getBodyMessages: filter by ContentID", function (assert) {
		var aInnerMessages = [
				{code : "~code0", ContentID : "id-123", message : "foo"},
				{code : "~code1", ContentID : "id-456", message : "bar"},
				{code : "~code2", ContentID : "id-123", message : "baz"},
				{code : "~code3", ContentID : "id-456", message : "quz"}
			],
			// use Message instances as getCode and getMessage are called
			oMessage0 = new Message({code : "~code0", message : "foo"}),
			oMessage1 = new Message(aInnerMessages[0]),
			oMessage2 = new Message(aInnerMessages[1]),
			oMessage3 = new Message(aInnerMessages[2]),
			oMessage4 = new Message(aInnerMessages[3]),
			oMessageParser = new ODataMessageParser("/foo"),
			oMessageParserMock = this.mock(oMessageParser),
			oOuterMessage = {code : "~code1", message : {value : "bar"}},
			mRequestInfo = {request : {headers : {"Content-ID" : "id-123"}}},
			aResult;

		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(oOuterMessage), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage0);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(aInnerMessages[0]), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage1);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(aInnerMessages[1]), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage2);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(aInnerMessages[2]), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage3);
		oMessageParserMock.expects("_createMessage")
			.withExactArgs(sinon.match.same(aInnerMessages[3]), sinon.match.same(mRequestInfo),
				true)
			.returns(oMessage4);
		this.mock(oMessage0).expects("getCode").withExactArgs().callThrough();
		this.mock(oMessage0).expects("getMessage").withExactArgs().callThrough();

		// code under test
		aResult = oMessageParser._getBodyMessages(oOuterMessage, aInnerMessages, mRequestInfo);

		assert.strictEqual(aResult.length, 2);
		assert.strictEqual(aResult[0], oMessage1);
		assert.strictEqual(aResult[1], oMessage3);
	});

	//**********************************************************************************************
	QUnit.test("_parseBodyJSON: calls _getBodyMessages", function (assert) {
		var oInnerError = {
				code : "~code0",
				message : "foo",
				severity : "error",
				target : "",
				transition : false
			},
			oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {
				body : "{\"error\":{\"code\":\"~code0\",\"message\":{\"value\":\"foo\"},"
					+ "\"innererror\":{\"errordetails\":[{\"code\":\"~code0\",\"message\":\"foo\","
					+ "\"severity\":\"error\",\"transition\":false,\"target\":\"\"}]}}}"
			};

		this.mock(oMessageParser).expects("_getBodyMessages")
			.withExactArgs({
					code : "~code0",
					innererror : {
						errordetails : [oInnerError]
					},
					message : {value : "foo"},
					severity : "Error"
				}, [oInnerError], "~mRequestInfo")
			.returns("~aMessages");

		// code under test
		assert.strictEqual(oMessageParser._parseBodyJSON(oResponse, "~mRequestInfo"), "~aMessages");
	});

	//*********************************************************************************************
	QUnit.test("_parseBodyXML: calls _getBodyMessages", function (assert) {
		var oMessageParser = new ODataMessageParser("/foo"),
			oResponse = {
				body : "<error><code>~code0</code><message>foo</message><innererror><errordetails>"
					+ "<errordetail><code>~code0</code><message>foo</message><target></target>"
					+ "<severity>error</severity></errordetail></errordetails></innererror>"
					+ "</error>",
				headers : {"content-type" : "application/xml"}
			};

		this.mock(oMessageParser).expects("_getBodyMessages")
			.withExactArgs({code : "~code0", message : "foo", severity : "Error"},
				[{code : "~code0", message : "foo", target : "", severity : "error"}],
				"~mRequestInfo")
			.returns("~aMessages");

		assert.strictEqual(
			// code under test
			oMessageParser._parseBodyXML(oResponse, "~mRequestInfo", "application/xml"),
			"~aMessages");
	});

	//*********************************************************************************************
	QUnit.test("_logErrorMessages: empty aMessages array", function (assert) {
		var oMessageParser = new ODataMessageParser("/foo"),
			oRequest = {method : "~method", requestUri : "~uri"};

		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code ~statusCode: ~method ~uri",
				"Another request in the same change set failed", sClassName);

		// code under test
		oMessageParser._logErrorMessages(/*aMessages*/[], oRequest, "~statusCode");
	});

	//*********************************************************************************************
	QUnit.test("_logErrorMessages: with messages", function (assert) {
		var aExpectedMessageLogDetails = [{
				code : "~code0",
				message : "~message0",
				persistent : "~persistent0",
				targets : "~targets0",
				type : "~type0"
			}, {
				code : "~code1",
				message : "~message1",
				persistent : "~persistent1",
				targets : "~targets1",
				type : "~type1"
			}],
			oJSONSpy = sinon.spy(JSON, "stringify"),
			oMessageParser = new ODataMessageParser("/foo"),
			oMessage0 = {
				getCode : function () {},
				getMessage : function () {},
				getPersistent : function () {},
				getTargets : function () {},
				getType : function () {}
			},
			oMessage1 = {
				getCode : function () {},
				getMessage : function () {},
				getPersistent : function () {},
				getTargets : function () {},
				getType : function () {}
			},
			oRequest = {method : "~method", requestUri : "~uri"};

		this.mock(oMessage0).expects("getCode").withExactArgs().returns("~code0");
		this.mock(oMessage0).expects("getMessage").withExactArgs().returns("~message0");
		this.mock(oMessage0).expects("getPersistent").withExactArgs().returns("~persistent0");
		this.mock(oMessage0).expects("getTargets").withExactArgs().returns("~targets0");
		this.mock(oMessage0).expects("getType").withExactArgs().returns("~type0");
		this.mock(oMessage1).expects("getCode").withExactArgs().returns("~code1");
		this.mock(oMessage1).expects("getMessage").withExactArgs().returns("~message1");
		this.mock(oMessage1).expects("getPersistent").withExactArgs().returns("~persistent1");
		this.mock(oMessage1).expects("getTargets").withExactArgs().returns("~targets1");
		this.mock(oMessage1).expects("getType").withExactArgs().returns("~type1");
		this.oLogMock.expects("error")
			.withExactArgs("Request failed with status code ~statusCode: ~method ~uri",
				'[{"code":"~code0","message":"~message0","persistent":"~persistent0",'
				+ '"targets":"~targets0","type":"~type0"},{"code":"~code1","message":"~message1",'
				+ '"persistent":"~persistent1","targets":"~targets1","type":"~type1"}]',
				sClassName);

		// code under test
		oMessageParser._logErrorMessages([oMessage0, oMessage1], oRequest, "~statusCode");

		assert.ok(oJSONSpy.calledWith(aExpectedMessageLogDetails));
	});
});
