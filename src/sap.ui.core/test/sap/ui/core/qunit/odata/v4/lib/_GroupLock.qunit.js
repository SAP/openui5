/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_GroupLock"
], function (_GroupLock) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._GroupLock", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
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
	QUnit.test("setGroupId", function (assert) {
		var oGroupLock = new _GroupLock();

		assert.strictEqual(oGroupLock.getGroupId(), undefined);

		oGroupLock.setGroupId("foo");
		assert.strictEqual(oGroupLock.getGroupId(), "foo");

		oGroupLock.setGroupId("bar");
		assert.strictEqual(oGroupLock.getGroupId(), "foo");
	});

	//*********************************************************************************************
	QUnit.test("locked, initial group", function (assert) {
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
	QUnit.test("locked, no group initially", function (assert) {
		var oGroupLock,
			oBarPromise1,
			oBarPromise2,
			oFooPromise;

		// code under test
		oGroupLock = new _GroupLock(undefined, true);

		assert.strictEqual(oGroupLock.getGroupId(), undefined);
		assert.ok(oGroupLock.isLocked());

		// code under test
		oFooPromise = oGroupLock.waitFor("foo");
		oBarPromise1 = oGroupLock.waitFor("bar");
		oBarPromise2 = oGroupLock.waitFor("bar");

		assert.ok(oFooPromise.isPending());
		assert.ok(oBarPromise1.isPending());
		assert.ok(oBarPromise2.isPending());

		// code under test
		oGroupLock.setGroupId("foo");

		assert.ok(oGroupLock.isLocked());
		assert.ok(oFooPromise.isPending());
		assert.ok(oBarPromise1.isFulfilled());
		assert.ok(oBarPromise2.isFulfilled());

		// code under test
		oGroupLock.unlock();

		assert.notOk(oGroupLock.isLocked());
		assert.ok(oFooPromise.isFulfilled());
	});

	//*********************************************************************************************
	QUnit.test("locked & unlocked w/o group", function (assert) {
		var oGroupLock = new _GroupLock(undefined, true),
			oBarPromise,
			oFooPromise;

		// code under test
		oFooPromise = oGroupLock.waitFor("foo");
		oBarPromise = oGroupLock.waitFor("bar");
		oGroupLock.unlock();

		assert.ok(oFooPromise.isFulfilled());
		assert.ok(oBarPromise.isFulfilled());
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
		var oGroupLock1 = new _GroupLock("group", true),
			oGroupLock2;

		// code under test
		oGroupLock2 = oGroupLock1.getUnlockedCopy();

		assert.strictEqual(oGroupLock2.getGroupId(), oGroupLock1.getGroupId());
		assert.notOk(oGroupLock2.isLocked());
	});

	//*********************************************************************************************
	QUnit.test("constants", function (assert) {
		assert.strictEqual(_GroupLock.$cached.getGroupId(), "$cached");

		// ensure that $cached can be unlocked several times
		_GroupLock.$cached.unlock();
		_GroupLock.$cached.unlock();
	});
});
