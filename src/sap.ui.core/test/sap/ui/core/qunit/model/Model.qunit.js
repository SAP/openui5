/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/message/Message",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Model",
	"sap/ui/test/TestUtils"
], function (Log, Message, BindingMode, Model, TestUtils) {
	/*global QUnit*/
	/*eslint max-nested-callbacks: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.Model", {
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
	QUnit.test("constructor: members", function (assert) {
		var oModel = new Model();

		assert.deepEqual(oModel.aBindings, []);
		assert.deepEqual(oModel.aBindingsToRemove, []);
		assert.deepEqual(oModel.mContexts, {});
		assert.deepEqual(oModel.oData, {});
		assert.strictEqual(oModel.sDefaultBindingMode, BindingMode.TwoWay);
		assert.strictEqual(oModel.bDestroyed, false);
		assert.strictEqual(oModel.bLegacySyntax, false);
		assert.deepEqual(oModel.mMessages, {});
		assert.strictEqual(oModel.sRemoveTimer, null);
		assert.strictEqual(oModel.iSizeLimit, 100);
		assert.deepEqual(oModel.mSupportedBindingModes,
			{"OneWay": true, "TwoWay": true, "OneTime": true});
		assert.deepEqual(oModel.mUnsupportedFilterOperators, {});
		assert.strictEqual(oModel.sUpdateTimer, null);
	});

	//*********************************************************************************************
	QUnit.test("setMessages", function (assert) {
		var oMessage0 = "sap.ui.core.message.Message instance",
			oModel = new Model(),
			oModelMock = this.mock(oModel),
			mNewMessages = {path : [oMessage0]},
			oOldMessages;

		oModelMock.expects("checkMessages").never();
		oOldMessages = oModel.mMessages;

		// code under test - old messages are untouched
		oModel.setMessages();

		assert.strictEqual(oModel.mMessages, oOldMessages);

		// code under test - old messages are untouched
		oModel.setMessages({});

		assert.strictEqual(oModel.mMessages, oOldMessages);

		oModelMock.expects("checkMessages").withExactArgs();

		// code under test
		oModel.setMessages(mNewMessages);

		assert.strictEqual(oModel.mMessages, mNewMessages);

		oModelMock.expects("checkMessages").never();

		// code under test
		oModel.setMessages(mNewMessages);

		assert.strictEqual(oModel.mMessages, mNewMessages);

		oOldMessages = oModel.mMessages;
		mNewMessages = {path : [oMessage0]}; // same content but different object/array

		// code under test
		oModel.setMessages(mNewMessages);

		assert.notStrictEqual(oModel.mMessages, mNewMessages);
		assert.strictEqual(oModel.mMessages, oOldMessages);
	});

	//*********************************************************************************************
	QUnit.test("getMessagesByPath", function (assert) {
		var aMessages = [],
			oModel = new Model(),
			oModelMock = this.mock(oModel);

		oModelMock.expects("filterMatchingMessages").never();

		// code under test
		assert.deepEqual(oModel.getMessagesByPath("/foo"), []);

		oModel.mMessages = {"/foo" : aMessages, "/baz" : []};

		// code under test
		assert.strictEqual(oModel.getMessagesByPath("/foo"), aMessages);
		// code under test
		assert.deepEqual(oModel.getMessagesByPath("/bar"), []);

		oModelMock.expects("filterMatchingMessages").withExactArgs("/foo", "/bar").returns([]);
		oModelMock.expects("filterMatchingMessages").withExactArgs("/baz", "/bar").returns([]);

		// code under test
		assert.deepEqual(oModel.getMessagesByPath("/bar", true), []);

		oModel.mMessages = {
			"/baz" : "aMessages0",
			"/foo" : "aMessages1",
			"/foo/bar" : "aMessages2",
			"/qux" : "aMessages3"
		};
		oModelMock.expects("filterMatchingMessages").withExactArgs("/baz", "/foo").returns([]);
		oModelMock.expects("filterMatchingMessages").withExactArgs("/foo", "/foo")
			.returns(["oMessage0"]);
		oModelMock.expects("filterMatchingMessages").withExactArgs("/foo/bar", "/foo")
			.returns(["oMessage1", "oMessage2"]);
		oModelMock.expects("filterMatchingMessages").withExactArgs("/qux", "/foo").returns([]);

		// code under test
		assert.deepEqual(oModel.getMessagesByPath("/foo", true),
			["oMessage0", "oMessage1", "oMessage2"]);
	});

	//*********************************************************************************************
	QUnit.test("filterMatchingMessages", function (assert) {
		var aMessages0 = "aMessages0",
			aMessages1 = "aMessages1",
			oModel = new Model();

		oModel.mMessages = {
			"/foo" : aMessages0,
			"/foo/bar" : aMessages1
		};

		// code under test
		assert.strictEqual(oModel.filterMatchingMessages("/foo", ""), aMessages0);
		assert.strictEqual(oModel.filterMatchingMessages("/foo", "/"), aMessages0);
		assert.deepEqual(oModel.filterMatchingMessages("/foo", "/f"), []);
		assert.strictEqual(oModel.filterMatchingMessages("/foo", "/foo"), aMessages0);
		assert.deepEqual(oModel.filterMatchingMessages("/foo", "/foo/bar"), []);
		assert.deepEqual(oModel.filterMatchingMessages("/foo", "/baz"), []);
		assert.strictEqual(oModel.filterMatchingMessages("/foo/bar", "/foo"), aMessages1);
	});

	//*********************************************************************************************
	// BCP: 1970052240
[false, true].forEach(function (bForceUpdate0, i) {
	[false, true].forEach(function (bForceUpdate1, j) {
	QUnit.test("checkUpdate async (" + i + ", " + j + ")", function (assert) {
		var done = assert.async(),
			bForceUpdate2 = bForceUpdate0 || bForceUpdate1,
			oModel = new Model(),
			oModelMock = this.mock(oModel),
			sUpdateTimer;

		// mocks for code under test
		oModelMock.expects("checkUpdate").withExactArgs(bForceUpdate0, true).callThrough();
		oModelMock.expects("checkUpdate").withExactArgs(bForceUpdate1, true).callThrough();

		// mock for async recursive call
		oModelMock.expects("checkUpdate").withExactArgs(bForceUpdate2).callsFake(function () {
			done();
		});

		// code under test
		oModel.checkUpdate(bForceUpdate0, /*bAsync*/true);

		sUpdateTimer = oModel.sUpdateTimer;
		assert.notStrictEqual(sUpdateTimer, null);

		// code under test
		oModel.checkUpdate(bForceUpdate1, /*bAsync*/true);

		assert.strictEqual(oModel.sUpdateTimer, sUpdateTimer);
	});
	});
});

	//*********************************************************************************************
	// BCP: 1970052240
[false, true].forEach(function (bForceUpdate, i) {
	[null, 42].forEach(function (vUpdateTimer, j) {
	QUnit.test("checkUpdate sync (" + i + ", " + j + ")", function (assert) {
		var oBinding = {
				checkUpdate : function () {}
			},
			aBindings = [oBinding],
			oModel = new Model();

		if (vUpdateTimer) {
			oModel.bForceUpdate = "forceUpdate";
			this.mock(window).expects("clearTimeout").withExactArgs(42);
		}
		this.mock(oModel).expects("getBindings").returns(aBindings);
		this.mock(oBinding).expects("checkUpdate").withExactArgs(bForceUpdate);

		// code under test
		oModel.sUpdateTimer = vUpdateTimer;
		oModel.checkUpdate(bForceUpdate);

		assert.strictEqual(oModel.bForceUpdate, undefined);
		assert.strictEqual(oModel.sUpdateTimer, null);
	});
	});
});
});