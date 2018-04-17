/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._GroupLock
sap.ui.define([], function () {
	"use strict";

	/**
	 * Constructs a lock for the given group ID.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID
	 *
	 * @alias sap.ui.model.odata.v4.lib._GroupLock
	 * @constructor
	 * @private
	 */
	function _GroupLock(sGroupId) {
		this.sGroupId = sGroupId;
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
	 * Sets the group ID if it is undefined yet. Otherwise the parameter is ignored.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 *
	 * @public
	 */
	_GroupLock.prototype.setGroupId = function (sGroupId) {
		if (!this.sGroupId) {
			this.sGroupId = sGroupId;
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
