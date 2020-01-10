/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._GroupLock
sap.ui.define([
	"sap/ui/base/SyncPromise"
], function (SyncPromise) {
	"use strict";

	/**
	 * Constructs a potential lock for the given group ID. A group lock may be created locked or
	 * unlocked. If locked, its {@link #waitFor} returns a promise that is resolved when the lock is
	 * unlocked.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {object} oOwner
	 *   The lock's owner for debugging
	 * @param {boolean} [bLocked=false]
	 *   Whether the lock is locked
	 * @param {boolean} [bModifying]
	 *   Whether the reason for the group lock is a modifying request
	 * @param {number} [iSerialNumber=Infinity]
	 *   A serial number which may be used on unlock
	 * @param {function} [fnCancel]
	 *   Function that is called when the group lock is canceled
	 * @throws {Error}
	 *   If <code>oOwner</code> is missing, or if <code>bModifying</code> is set but
	 *   <code>bLocked</code> is unset
	 *
	 * @alias sap.ui.model.odata.v4.lib._GroupLock
	 * @constructor
	 * @private
	 */
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
		this.bLocked = !!bLocked; // whether it is locked; explicitly unlocked if undefined
		this.bModifying = !!bModifying; // whether this lock belongs to a modifying request
		this.oOwner = oOwner;
		this.oPromise = null; // the promise resolving when the lock is unlocked
		this.iSerialNumber = iSerialNumber === undefined ? Infinity : iSerialNumber;
	}

	/**
	 * Cancels and unlocks the group lock.
	 *
	 * @public
	 */
	_GroupLock.prototype.cancel = function () {
		if (!this.bCanceled) {
			this.bCanceled = true;
			if (this.fnCancel) {
				this.fnCancel();
			}
			this.unlock(true);
		}
	};

	/**
	 * Returns the group ID.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @public
	 */
	_GroupLock.prototype.getGroupId = function () {
		return this.sGroupId;
	};

	/**
	 * Returns the serial number.
	 *
	 * @returns {number}
	 *   The serial number
	 *
	 * @public
	 */
	_GroupLock.prototype.getSerialNumber = function () {
		return this.iSerialNumber;
	};

	/**
	 * Returns an unlocked group lock for the same group ID. This is required when reusing a group
	 * lock on which {@link #unlock} has already been called (e.g. when one group is used to create
	 * multiple requests).
	 *
	 * @returns {sap.ui.model.odata.v4.lib._GroupLock}
	 *   The group lock
	 *
	 * @public
	 */
	_GroupLock.prototype.getUnlockedCopy = function () {
		return new _GroupLock(this.sGroupId, this.oOwner, false, false, this.iSerialNumber);
	};

	/**
	 * Returns <code>true</code> if the lock is canceled.
	 *
	 * @returns {boolean} <code>true</code> if the lock is canceled
	 *
	 * @public
	 */
	_GroupLock.prototype.isCanceled = function () {
		return this.bCanceled;
	};

	/**
	 * Returns <code>true</code> if the lock is locked.
	 *
	 * @returns {boolean} <code>true</code> if the lock is locked
	 *
	 * @public
	 */
	_GroupLock.prototype.isLocked = function () {
		return this.bLocked;
	};

	/**
	 * Whether this lock was issued for a modifying request.
	 *
	 * @returns {boolean}
	 *   Whether this lock was issued for a modifying request
	 *
	 * @public
	 */
	_GroupLock.prototype.isModifying = function () {
		return this.bModifying;
	};

	/**
	 * Returns a string representation of this object.
	 *
	 * @returns {string} A string description of this group lock
	 *
	 * @public
	 */
	_GroupLock.prototype.toString = function () {
		return "sap.ui.model.odata.v4.lib._GroupLock(group=" + this.sGroupId
			+ ", owner=" + this.oOwner
			+ (this.isLocked() ? ", locked" : "")
			+ (this.isModifying() ? ", modifying" : "")
			+ (this.iSerialNumber !== Infinity ? ", serialNumber=" + this.iSerialNumber : "")
			+ ")";
	};

	/**
	 * Unlocks the lock. Resolves all promises returned by {@link #waitFor}.
	 *
	 * @param {boolean} [bForce=false]
	 *   Whether unlock may be called multiple times.
	 * @throws {Error}
	 *   If unlock is called a second time without <code>bForce</code>
	 *
	 * @public
	 */
	_GroupLock.prototype.unlock = function (bForce) {
		if (this.bLocked === undefined && !bForce) {
			throw new Error("GroupLock unlocked twice");
		}

		this.bLocked = undefined;
		if (this.oPromise) {
			this.oPromise.$resolve();
		}
	};

	/**
	 * Returns a promise that is resolved when this lock does no longer block the given group ID.
	 *
	 * @param {string} sGroupId The group ID
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise or <code>undefined</code> if the lock does not block this group
	 *
	 * @public
	 */
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

	/**
	 * A group lock for the pseudo-group "$cached".
	 *
	 * @type {sap.ui.model.odata.v4.lib._GroupLock}
	 */
	_GroupLock.$cached = new _GroupLock("$cached", "sap.ui.model.odata.v4.lib._GroupLock");

	// avoid "unlocked twice" for this instance
	_GroupLock.$cached.unlock = function () {};

	return _GroupLock;
}, /* bExport= */false);
