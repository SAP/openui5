import SyncPromise from "sap/ui/base/SyncPromise";
function _GroupLock(sGroupId, oOwner, bLocked, bModifying, iSerialNumber, fnCancel) {
    if (!oOwner) {
        throw new Error("Missing owner");
    }
    if (bModifying && !bLocked) {
        throw new Error("A modifying group lock has to be locked");
    }
    this.fnCancel = fnCancel;
    this.bCanceled = false;
    this.sGroupId = sGroupId;
    this.bLocked = !!bLocked;
    this.bModifying = !!bModifying;
    this.oOwner = oOwner;
    this.oPromise = null;
    this.iSerialNumber = iSerialNumber === undefined ? Infinity : iSerialNumber;
}
_GroupLock.prototype.cancel = function () {
    if (!this.bCanceled) {
        this.bCanceled = true;
        if (this.fnCancel) {
            this.fnCancel();
        }
        this.unlock(true);
    }
};
_GroupLock.prototype.getGroupId = function () {
    return this.sGroupId;
};
_GroupLock.prototype.getSerialNumber = function () {
    return this.iSerialNumber;
};
_GroupLock.prototype.getUnlockedCopy = function () {
    return new _GroupLock(this.sGroupId, this.oOwner, false, false, this.iSerialNumber);
};
_GroupLock.prototype.isCanceled = function () {
    return this.bCanceled;
};
_GroupLock.prototype.isLocked = function () {
    return this.bLocked;
};
_GroupLock.prototype.isModifying = function () {
    return this.bModifying;
};
_GroupLock.prototype.toString = function () {
    return "sap.ui.model.odata.v4.lib._GroupLock(group=" + this.sGroupId + ", owner=" + this.oOwner + (this.isLocked() ? ", locked" : "") + (this.isModifying() ? ", modifying" : "") + (this.iSerialNumber !== Infinity ? ", serialNumber=" + this.iSerialNumber : "") + ")";
};
_GroupLock.prototype.unlock = function (bForce) {
    if (this.bLocked === undefined && !bForce) {
        throw new Error("GroupLock unlocked twice");
    }
    this.bLocked = undefined;
    if (this.oPromise) {
        this.oPromise.$resolve();
    }
};
_GroupLock.prototype.waitFor = function (sGroupId) {
    var fnResolve;
    if (this.bLocked && this.sGroupId === sGroupId) {
        if (!this.oPromise) {
            this.oPromise = new SyncPromise(function (resolve) {
                fnResolve = resolve;
            });
            this.oPromise.$resolve = fnResolve;
        }
        return this.oPromise;
    }
};
_GroupLock.$cached = new _GroupLock("$cached", "sap.ui.model.odata.v4.lib._GroupLock");
_GroupLock.$cached.unlock = function () { };