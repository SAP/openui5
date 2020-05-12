/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/message/Message",
	"sap/ui/model/odata/MessageScope",
	"sap/ui/model/odata/ODataMessageParser",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/test/TestUtils"
], function (Log, Message, MessageScope, ODataMessageParser, ODataUtils, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint camelcase: 0, no-warning-comments: 0*/
	"use strict";

	var sClassName = "sap.ui.model.odata.ODataMessageParser";

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
[
	{propertyref : "foo", target : "/~target", warning : true},
	{propertyref : "foo", target : "/#TRANSIENT#/~target", warning : true},
	// use deprecated propertyref only if no target is given
	{propertyref : "/~target", target : undefined, warning : false},
	{propertyref : "/#TRANSIENT#/~target", target : undefined, warning : false}
].forEach(function (oTargetFixture, i) {
	[{
		isTechnical : false,
		request : {headers : {"sap-message-scope" : "foo"}}
	}, {
		isTechnical : false,
		request : {}
	}, {
		isTechnical : false,
		request : undefined
	}, {
		isTechnical : true,
		request : {headers : {"sap-message-scope" : "BusinessObject"}}
	}].forEach(function (oFixture, j) {
	var sTitle = "_createTarget: absolute target with processor; #" + i + "/" + j;

	QUnit.test(sTitle, function (assert) {
		var oMessageObject = {
				propertyref : oTargetFixture.propertyref,
				target : oTargetFixture.target
			},
			oODataMessageParser = {
				_metadata : {
					_getReducedPath : function () {}
				},
				_processor : {
					resolve : function () {}
				}
			},
			mRequestInfo = {request : oFixture.request, response : {}, url : "~requestURL"};

		if (oTargetFixture.warning) {
			this.oLogMock.expects("warning")
				.withExactArgs("Used the message's 'target' property for target calculation;"
						+ " the property 'propertyref' is deprecated and must not be used together"
						+ " with 'target'",
					"~requestURL", sClassName);
		}
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
		ODataMessageParser.prototype._createTarget.call(oODataMessageParser, oMessageObject,
			mRequestInfo, oFixture.isTechnical);

		assert.strictEqual(oMessageObject.deepPath, "~reducedPath");
		assert.strictEqual(oMessageObject.target, "~normalizedTarget");
	});
	});
});

	//*********************************************************************************************
[
	{propertyref : "foo", target : "~target", warning : true},
	{propertyref : "foo", target : "/#TRANSIENT#~target", warning : true},
	// use deprecated propertyref only if no target is given
	{propertyref : "~target", target : undefined, warning : false},
	{propertyref : "/#TRANSIENT#~target", target : undefined, warning : false}
].forEach(function (oTargetFixture, i) {
	[{
		isTechnical : false,
		request : {deepPath : "~deepPath", headers : {"sap-message-scope" : "foo"}}
	}, {
		isTechnical : false,
		request : {deepPath : "~deepPath"}
	}, {
		isTechnical : true,
		request : {deepPath : "~deepPath", headers : {"sap-message-scope" : "BusinessObject"}}
	}].forEach(function (oFixture, j) {
	var sTitle = "_createTarget: relative target with processor; #" + i + "/" + j;

	QUnit.test(sTitle, function (assert) {
		var oMessageObject = {
				propertyref : oTargetFixture.propertyref,
				target : oTargetFixture.target
			},
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
				request : oFixture.request,
				response : {},
				url : "~requestURL"
			},
			mUrlData = {url : "~parsedUrl"};

		if (oTargetFixture.warning) {
			this.oLogMock.expects("warning")
				.withExactArgs("Used the message's 'target' property for target calculation;"
						+ " the property 'propertyref' is deprecated and must not be used together"
						+ " with 'target'",
					"~requestURL", sClassName);
		}
		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(undefined);
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
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		ODataMessageParser.prototype._createTarget.call(oODataMessageParser, oMessageObject,
			mRequestInfo, oFixture.isTechnical);

		assert.strictEqual(oMessageObject.deepPath, "~reducedPath");
		assert.strictEqual(oMessageObject.target, "~normalizedTarget");
	});
	});
});

	//*********************************************************************************************
[
	{propertyref : "foo", target : "", warning : true},
	{propertyref : undefined, target : undefined, warning : false}
].forEach(function (oFixture, i) {
	var sTitle = "_createTarget: no or empty target for technical message; # " + i;

	QUnit.test(sTitle, function (assert) {
		var oMessageObject = {propertyref : oFixture.propertyref, target : oFixture.target},
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
				request : {},
				response : {},
				url : "~requestURL"
			},
			mUrlData = {url : "~parsedUrl"};

		if (oFixture.warning) {
			this.oLogMock.expects("warning")
				.withExactArgs("Used the message's 'target' property for target calculation;"
						+ " the property 'propertyref' is deprecated and must not be used together"
						+ " with 'target'",
					"~requestURL", sClassName);
		}
		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(undefined);
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
			.withExactArgs("/~parsedUrl", undefined, true)
			.returns("~canonicalTarget");
		this.mock(oODataMessageParser._metadata).expects("_getReducedPath")
			.withExactArgs("~canonicalTarget")
			.returns("~reducedPath");
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs("~canonicalTarget")
			.returns("~normalizedTarget");

		// code under test
		ODataMessageParser.prototype._createTarget.call(oODataMessageParser, oMessageObject,
			mRequestInfo, true);

		assert.strictEqual(oMessageObject.deepPath, "~reducedPath");
		assert.strictEqual(oMessageObject.target, "~normalizedTarget");
	});
});

	//*********************************************************************************************
	//*********************************************************************************************
	QUnit.test("_createTarget: created entity", function (assert) {
		var oMessageObject = {target : "~target"},
			oODataMessageParser = {
				_serviceUrl : "~serviceUrl",
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
				request : {deepPath : "~deepPath", method : "POST"},
				response : {
					headers : {location : "https://foo.com/~serviceUrl/~uriFromLocation"}
				},
				url : "~requestURL"
			},
			mUrlData = {url : "https://foo.com/~serviceUrl/~parsedUrl"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(true);
		this.mock(oODataMessageParser).expects("_parseUrl")
			.withExactArgs("https://foo.com/~serviceUrl/~uriFromLocation")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_getFunctionImportMetadata").never();
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
		ODataMessageParser.prototype._createTarget.call(oODataMessageParser, oMessageObject,
			mRequestInfo);

		assert.strictEqual(oMessageObject.deepPath, "~reducedPath");
		assert.strictEqual(oMessageObject.target, "~normalizedTarget");
	});

	//*********************************************************************************************
	QUnit.test("_createTarget: entity creation failed, no processor", function (assert) {
		var oMessageObject = {},
			oODataMessageParser = {
				_metadata : {
					_getFunctionImportMetadata : function () {},
					_isCollection : function () {}
				},
				_parseUrl : function () {}
				// test without processor
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
			mUrlData = {url : "~parsedUrl"};

		this.mock(ODataMessageParser).expects("_isResponseForCreate")
			.withExactArgs(sinon.match.same(mRequestInfo))
			.returns(false);
		this.mock(oODataMessageParser).expects("_parseUrl")
			.withExactArgs("~tempKey")
			.returns(mUrlData);
		this.mock(oODataMessageParser._metadata).expects("_getFunctionImportMetadata")
			.withExactArgs("/~parsedUrl", "POST")
			.returns(null);
		this.mock(oODataMessageParser._metadata).expects("_isCollection")
			.withExactArgs("/~parsedUrl")
			.returns(false);
		this.mock(ODataUtils).expects("_normalizeKey")
			.withExactArgs("/~parsedUrl")
			.returns("~normalizedTarget");

		// code under test
		ODataMessageParser.prototype._createTarget.call(oODataMessageParser, oMessageObject,
			mRequestInfo, true);

		assert.strictEqual(oMessageObject.deepPath, undefined);
		assert.strictEqual(oMessageObject.target, "~normalizedTarget");
	});

	//*********************************************************************************************
	QUnit.test("_createTarget: no target; unbound message", function (assert) {
		var oMessageObject = {},
			oODataMessageParser = {},
			mRequestInfo = {
				request : {headers : {"sap-message-scope" : "BusinessObject"}}
			};

		// code under test
		ODataMessageParser.prototype._createTarget.call(oODataMessageParser, oMessageObject,
			mRequestInfo, false);

		assert.strictEqual(oMessageObject.deepPath, "");
		assert.strictEqual(oMessageObject.target, "");
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
[{
	oMessageObject : {
		"@sap.severity" : "warning",
		target : "~target",
		"transient" : true
	},
	oExpectedMessage : {
		code : "",
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
}].forEach(function (oFixture, i) {
	QUnit.test("_createMessage: " + i, function (assert) {
		var oExpectedMessage = oFixture.oExpectedMessage,
			oMessage,
			oMessageObject = oFixture.oMessageObject,
			oODataMessageParser = {
				_createTarget : function () {},
				_processor : "~_processor"
			},
			mRequestInfo = {
				response : {headers : "~headers", statusCode : "~statusCode"}
			};

		this.mock(oODataMessageParser).expects("_createTarget")
			.withExactArgs(sinon.match.same(oMessageObject), sinon.match.same(mRequestInfo),
				"~bIsTechnical")
			.callsFake(function (oMessageObject) {
				oMessageObject.deepPath = "~fullTargetFrom_createTarget";
				oMessageObject.target = "~targetFrom_createTarget";
			});

		// code under test
		oMessage = ODataMessageParser.prototype._createMessage.call(oODataMessageParser,
			oMessageObject, mRequestInfo, "~bIsTechnical");

		assert.ok(oMessage instanceof Message);
		assert.strictEqual(oMessage.code, oExpectedMessage.code);
		assert.strictEqual(oMessage.descriptionUrl, oExpectedMessage.descriptionUrl);
		assert.strictEqual(oMessage.fullTarget, "~fullTargetFrom_createTarget");
		assert.strictEqual(oMessage.message, oExpectedMessage.message);
		assert.strictEqual(oMessage.persistent, oExpectedMessage.persistent);
		assert.strictEqual(oMessage.processor, "~_processor");
		assert.strictEqual(oMessage.target, "~targetFrom_createTarget");
		assert.strictEqual(oMessage.technical, "~bIsTechnical");
		assert.deepEqual(oMessage.technicalDetails,
			{headers : "~headers", statusCode : "~statusCode"});
		assert.strictEqual(oMessage.type, oExpectedMessage.type);
	});
});
});
