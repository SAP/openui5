/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	// Helper class that mimics window.localStorage
	function _LocalStorage(mData) {
		this._mData = mData || {};
	}

	_LocalStorage.prototype.getItem = function (sKey) {
		return this._mData[sKey] || null;
	};

	_LocalStorage.prototype.setItem = function (sKey, sData) {
		this._mData[sKey] = sData;
	};

	_LocalStorage.prototype.removeItem = function (sKey, sData) {
		delete this._mData[sKey];
	};

	return _LocalStorage;
});
