import Log from "sap/base/Log";
import _GroupLock from "sap/ui/model/odata/v4/lib/_GroupLock";
QUnit.module("sap.ui.model.odata.v4.lib._GroupLock", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
QUnit.test("unlocked, initialized", function (assert) {
    var oOwner = {}, oGroupLock = new _GroupLock("foo", oOwner);
    assert.strictEqual(oGroupLock.isCanceled(), false);
    assert.strictEqual(oGroupLock.getGroupId(), "foo");
    assert.strictEqual(oGroupLock.oOwner, oOwner);
    assert.strictEqual(oGroupLock.isLocked(), false);
    assert.strictEqual(oGroupLock.waitFor("foo"), undefined);
    assert.strictEqual(oGroupLock.waitFor("bar"), undefined);
});
QUnit.test("owner is mandatory", function (assert) {
    assert.throws(function () {
        return new _GroupLock("group");
    }, new Error("Missing owner"));
});
QUnit.test("locked", function (assert) {
    var oGroupLock, oOwner = {}, oPromise1, oPromise2;
    oGroupLock = new _GroupLock("foo", oOwner, true);
    assert.strictEqual(oGroupLock.getGroupId(), "foo");
    assert.strictEqual(oGroupLock.oOwner, oOwner);
    assert.strictEqual(oGroupLock.isLocked(), true);
    oPromise1 = oGroupLock.waitFor("foo");
    oPromise2 = oGroupLock.waitFor("foo");
    assert.ok(oPromise1.isPending());
    assert.ok(oPromise2.isPending());
    assert.strictEqual(oGroupLock.waitFor("bar"), undefined);
    oGroupLock.unlock();
    assert.ok(oPromise1.isFulfilled());
    assert.ok(oPromise2.isFulfilled());
    assert.notOk(oGroupLock.isLocked());
});
QUnit.test("multiple unlocks", function (assert) {
    var oGroupLock = new _GroupLock("group", {});
    oGroupLock.unlock();
    assert.throws(function () {
        oGroupLock.unlock();
    }, new Error("GroupLock unlocked twice"));
    oGroupLock.unlock(true);
});
QUnit.test("getUnlockedCopy", function (assert) {
    var oGroupLock1 = new _GroupLock("group", {}, true, true, 42), oGroupLock2;
    oGroupLock2 = oGroupLock1.getUnlockedCopy();
    assert.strictEqual(oGroupLock2.getGroupId(), oGroupLock1.getGroupId());
    assert.strictEqual(oGroupLock2.oOwner, oGroupLock1.oOwner);
    assert.strictEqual(oGroupLock2.isLocked(), false);
    assert.strictEqual(oGroupLock2.isModifying(), false);
    assert.strictEqual(oGroupLock2.getSerialNumber(), oGroupLock1.getSerialNumber());
});
QUnit.test("owner & toString", function (assert) {
    var oGroupLock, oOwner = {
        toString: function () {
            return "owner";
        }
    };
    oGroupLock = new _GroupLock("group", oOwner, true);
    assert.strictEqual(oGroupLock.toString(), "sap.ui.model.odata.v4.lib._GroupLock(group=group, owner=owner, locked)");
    oGroupLock = new _GroupLock("group", oOwner, true, true);
    assert.strictEqual(oGroupLock.toString(), "sap.ui.model.odata.v4.lib._GroupLock(group=group, owner=owner, locked, modifying)");
    oGroupLock = new _GroupLock("group", oOwner, false);
    assert.strictEqual(oGroupLock.oOwner, oOwner);
    assert.strictEqual(oGroupLock.toString(), "sap.ui.model.odata.v4.lib._GroupLock(group=group, owner=owner)");
    oGroupLock = new _GroupLock("group", oOwner, false, undefined, 0);
    assert.strictEqual(oGroupLock.toString(), "sap.ui.model.odata.v4.lib._GroupLock(group=group, owner=owner, serialNumber=0)");
    oGroupLock = new _GroupLock("group", oOwner, true, true, 0);
    assert.strictEqual(oGroupLock.toString(), "sap.ui.model.odata.v4.lib._GroupLock(group=group, owner=owner, locked, modifying," + " serialNumber=0)");
});
QUnit.test("constants", function (assert) {
    assert.strictEqual(_GroupLock.$cached.getGroupId(), "$cached");
    assert.strictEqual(_GroupLock.$cached.isLocked(), false);
    assert.strictEqual(_GroupLock.$cached.isModifying(), false);
    assert.strictEqual(_GroupLock.$cached.oOwner, "sap.ui.model.odata.v4.lib._GroupLock");
    _GroupLock.$cached.unlock();
    _GroupLock.$cached.unlock();
});
QUnit.test("serial number", function (assert) {
    var oOwner = {};
    assert.strictEqual(new _GroupLock("group", oOwner, true, true, 42).getSerialNumber(), 42);
    assert.strictEqual(new _GroupLock("group", oOwner, true).getSerialNumber(), Infinity);
    assert.strictEqual(new _GroupLock("group", oOwner, true, false, 0).getSerialNumber(), 0);
});
[undefined, false, true].forEach(function (bModifying, i) {
    QUnit.test("modifying: " + bModifying, function (assert) {
        assert.strictEqual(new _GroupLock("group", {}, true, bModifying, 42).isModifying(), i === 2);
    });
});
QUnit.test("modifying: throws if not locked", function (assert) {
    assert.throws(function () {
        return new _GroupLock("group", {}, false, true, 42);
    }, new Error("A modifying group lock has to be locked"));
});
QUnit.test("cancel w/o function", function (assert) {
    var oGroupLock = new _GroupLock("group", {}, true);
    this.mock(oGroupLock).expects("unlock").withExactArgs(true);
    oGroupLock.cancel();
    assert.ok(oGroupLock.isCanceled());
});
QUnit.test("cancel w/ function", function (assert) {
    var fnCancel = sinon.spy(), oGroupLock = new _GroupLock("group", {}, true, false, undefined, fnCancel);
    assert.strictEqual(oGroupLock.fnCancel, fnCancel);
    sinon.assert.notCalled(fnCancel);
    this.mock(oGroupLock).expects("unlock").withExactArgs(true);
    oGroupLock.cancel();
    assert.ok(oGroupLock.isCanceled());
    sinon.assert.calledOnce(fnCancel);
    sinon.assert.calledWithExactly(fnCancel);
    oGroupLock.cancel();
    sinon.assert.calledOnce(fnCancel);
});