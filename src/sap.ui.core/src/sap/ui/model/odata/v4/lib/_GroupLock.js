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
	 * @param {boolean} [bLocked=false]
	 *   Whether the lock is locked
	 * @param {object} [oOwner]
	 *   The lock's owner for debugging
	 * @param {number} [iSerialNumber=Infinity]
	 *   A serial number which may be used on unlock
	 *
	 * @alias sap.ui.model.odata.v4.lib._GroupLock
	 * @constructor
	 * @private
	 */
	function _GroupLock(sGroupId, bLocked, oOwner, iSerialNumber) {
		this.sGroupId = sGroupId;
		this.bLocked = !!bLocked; // whether it is locked; explicitely unlocked if undefined
		this.oOwner = oOwner;
		this.oPromise = null; // the promise resolving when the lock is unlocked
		this.iSerialNumber = iSerialNumber === undefined ? Infinity : iSerialNumber;
	}

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
	 * Returns an unlocked group lock for the same group ID.
	 *
	 * @returns {sap.ui.model.odata.v4.lib._GroupLock}
	 *   The group lock
	 *
	 * @public
	 */
	_GroupLock.prototype.getUnlockedCopy = function () {
		return new _GroupLock(this.sGroupId, undefined, this.oOwner, this.iSerialNumber);
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
	 * Returns a string representation of this object including the lock status and the owner.
	 *
	 * @returns {string} A string description of this lock
	 *
	 * @public
	 */
	_GroupLock.prototype.toString = function () {
		var sDescription = "sap.ui.model.odata.v4.lib._GroupLock("
				+ (this.isLocked() ? "locked" : "unlocked")
				+ ",group=" + this.sGroupId;

		if (this.oOwner) {
			sDescription += ",owner=" + this.oOwner;
		}
		if (this.iSerialNumber !== Infinity) {
			sDescription += ",serialNumber=" + this.iSerialNumber;
		}
		return sDescription + ")";
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
	_GroupLock.$cached = new _GroupLock("$cached");

	// avoid "unlocked twice" for this instance
	_GroupLock.$cached.unlock = function () {};

	return _GroupLock;
}, /* bExport= */false);
