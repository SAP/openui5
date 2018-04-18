/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._GroupLock
sap.ui.define([
	"sap/ui/base/SyncPromise"
], function (SyncPromise) {
	"use strict";

	/**
	 * Constructs a potential lock for the given group ID. The group ID may be left empty initially,
	 * you can set it later exactly once. A group lock may be created locked or unlocked. If locked,
	 * its {@link #waitFor} returns a promise that is resolved when the lock is unlocked. If a
	 * locked group lock does not have a group ID yet, it blocks all groups until the group is
	 * specified via {@link #setGroupId}.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID
	 * @param {boolean} [bLocked=false]
	 *   Whether the lock is locked
	 *
	 * @alias sap.ui.model.odata.v4.lib._GroupLock
	 * @constructor
	 * @private
	 */
	function _GroupLock(sGroupId, bLocked) {
		this.sGroupId = sGroupId;
		this.bLocked = bLocked;
		// maps a group ID to a promise waiting for it, see waitFor
		this.mPromiseForGroup = {};
		// maps a group ID to the resolve function of the promise above
		this.mResolveFunctionForGroup = {};
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
	 * Returns an unlocked group lock for the same group ID.
	 *
	 * @returns {sap.ui.model.odata.v4.lib._GroupLock}
	 *   The group lock
	 *
	 * @public
	 */
	_GroupLock.prototype.getUnlockedCopy = function () {
		return new _GroupLock(this.sGroupId);
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
	 * If the group ID is still undefined, the function sets the given group ID and resolves all
	 * promises waiting for other groups.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 *
	 * @public
	 * @see #waitFor
	 */
	_GroupLock.prototype.setGroupId = function (sGroupId) {
		if (!this.sGroupId) {
			this.sGroupId = sGroupId;
			for (sGroupId in this.mResolveFunctionForGroup) {
				if (this.sGroupId !== sGroupId) {
					this.mResolveFunctionForGroup[sGroupId]();
					delete this.mPromiseForGroup[sGroupId];
					delete this.mResolveFunctionForGroup[sGroupId];
				}
			}
		}
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
		var sGroupId;

		if (!this.mPromiseForGroup && !bForce) {
			throw new Error("GroupLock unlocked twice");
		}
		this.mPromiseForGroup = null;

		this.bLocked = false;
		for (sGroupId in this.mResolveFunctionForGroup) {
			this.mResolveFunctionForGroup[sGroupId]();
		}
		this.mResolveFunctionForGroup = null;
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
		var that = this;

		if (this.bLocked && (!this.sGroupId || this.sGroupId === sGroupId)) {
			if (!that.mPromiseForGroup[sGroupId]) {
				that.mPromiseForGroup[sGroupId] = new SyncPromise(function (resolve) {
					that.mResolveFunctionForGroup[sGroupId] = resolve;
				});
			}
			return that.mPromiseForGroup[sGroupId];
		}
	};

	/**
	 * A group lock for the pseudo-group "$cached".
	 *
	 * @type {sap.ui.model.odata.v4.lib._GroupLock}
	 */
	_GroupLock.$cached = new _GroupLock("$cached");

	return _GroupLock;
}, /* bExport= */false);
