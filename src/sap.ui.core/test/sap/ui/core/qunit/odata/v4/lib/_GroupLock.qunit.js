/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_GroupLock"
], function (Log, _GroupLock) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._GroupLock", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("unlocked, initialized", function (assert) {
		var oGroupLock = new _GroupLock("foo");

		assert.strictEqual(oGroupLock.getGroupId(), "foo");
		assert.notOk(oGroupLock.isLocked());

		assert.strictEqual(oGroupLock.waitFor("foo"), undefined);
		assert.strictEqual(oGroupLock.waitFor("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("locked", function (assert) {
		var oGroupLock,
			oPromise1,
			oPromise2;

		// code under test
		oGroupLock = new _GroupLock("foo", true);

		assert.strictEqual(oGroupLock.getGroupId(), "foo");
		assert.ok(oGroupLock.isLocked());

		// code under test
		oPromise1 = oGroupLock.waitFor("foo");
		oPromise2 = oGroupLock.waitFor("foo");

		assert.ok(oPromise1.isPending());
		assert.ok(oPromise2.isPending());

		// code under test
		assert.strictEqual(oGroupLock.waitFor("bar"), undefined);

		// code under test
		oGroupLock.unlock();

		assert.ok(oPromise1.isFulfilled());
		assert.ok(oPromise2.isFulfilled());
		assert.notOk(oGroupLock.isLocked());
	});

	//*********************************************************************************************
	QUnit.test("multiple unlocks", function (assert) {
		var oGroupLock = new _GroupLock("group");

		oGroupLock.unlock();
		assert.throws(function () {
			oGroupLock.unlock();
		}, new Error("GroupLock unlocked twice"));

		oGroupLock.unlock(true); // no error!
	});

	//*********************************************************************************************
	QUnit.test("getUnlockedCopy", function (assert) {
		var oGroupLock1 = new _GroupLock("group", true, {/*owner*/}, 42),
			oGroupLock2;

		// code under test
		oGroupLock2 = oGroupLock1.getUnlockedCopy();

		assert.strictEqual(oGroupLock2.getGroupId(), oGroupLock1.getGroupId());
		assert.notOk(oGroupLock2.isLocked());
		assert.strictEqual(oGroupLock2.oOwner, oGroupLock1.oOwner);
		assert.strictEqual(oGroupLock2.getSerialNumber(), oGroupLock1.getSerialNumber());
	});

	//*********************************************************************************************
	QUnit.test("owner & toString", function (assert) {
		var oGroupLock,
			oOwner = {
				toString : function () {
					return "owner";
				}
			};

		oGroupLock = new _GroupLock("group", true);
		assert.strictEqual(oGroupLock.toString(),
			"sap.ui.model.odata.v4.lib._GroupLock(locked,group=group)");

		oGroupLock = new _GroupLock("group", false, oOwner);
		assert.strictEqual(oGroupLock.oOwner, oOwner);
		assert.strictEqual(oGroupLock.toString(),
			"sap.ui.model.odata.v4.lib._GroupLock(unlocked,group=group,owner=owner)");

		oGroupLock = new _GroupLock("group", false, undefined, 0);
		assert.strictEqual(oGroupLock.toString(),
			"sap.ui.model.odata.v4.lib._GroupLock(unlocked,group=group,serialNumber=0)");
	});

	//*********************************************************************************************
	QUnit.test("constants", function (assert) {
		assert.strictEqual(_GroupLock.$cached.getGroupId(), "$cached");
		assert.notOk(_GroupLock.$cached.isLocked());
		assert.strictEqual(_GroupLock.$cached.oOwner, undefined);

		// ensure that $cached can be unlocked several times
		_GroupLock.$cached.unlock();
		_GroupLock.$cached.unlock();
	});

	//*********************************************************************************************
	QUnit.test("serial number", function (assert) {
		assert.strictEqual((new _GroupLock("group", true, "owner", 42)).getSerialNumber(), 42);
		assert.strictEqual((new _GroupLock("group", true, "owner")).getSerialNumber(), Infinity);
		assert.strictEqual((new _GroupLock("group", true, "owner", 0)).getSerialNumber(), 0);
	});
});