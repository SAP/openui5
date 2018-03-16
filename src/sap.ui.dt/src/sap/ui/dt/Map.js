/*!
 * ${copyright}
 */

/* global Map */

sap.ui.define([
	'sap/ui/dt/Util'
], function(
	Util
) {
	"use strict";

	/**
	 * Constructor for a Map.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.54
	 * @alias sap.ui.dt.Map
	 * @experimental Since 1.56. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var createMapPolyfill = function () {
		/* eslint-disable no-extend-native */
		var Map = function () {
			this.iIndex = 0;
			this.mKeys = {};
			this.mValues = {};
		};
		Map.prototype._getNextIndex = function () {
			return this.iIndex++;
		};
		Map.prototype._findIndex = function (vKey) {
			for (var iIndex in this.mKeys) {
				if (this.mKeys[iIndex] === vKey) {
					return +iIndex;
				}
			}
		};
		Map.prototype.forEach = function (fnCallback) {
			Object.keys(this.mKeys).forEach(function (iKeyIndex) {
				fnCallback(this.mValues[iKeyIndex], this.mKeys[iKeyIndex], this);
			}, this);
		};
		Map.prototype.clear = function () {
			Object.keys(this.mKeys).forEach(function (iKeyIndex) {
				delete this.mKeys[iKeyIndex];
				delete this.mValues[iKeyIndex];
			}, this);
		};
		Map.prototype.delete = function (vKey) {
			var iKeyIndex = this._findIndex(vKey);
			if (Util.isInteger(iKeyIndex)) {
				delete this.mKeys[iKeyIndex];
				delete this.mValues[iKeyIndex];
			}
		};
		Map.prototype.get = function (vKey) {
			var iKeyIndex = this._findIndex(vKey);
			return Util.isInteger(iKeyIndex) ? this.mValues[iKeyIndex] : undefined;
		};
		Map.prototype.set = function (vKey, vValue) {
			var iNextIndex = this._getNextIndex();
			this.mKeys[iNextIndex] = vKey;
			this.mValues[iNextIndex] = vValue;
		};
		/* eslint-enable no-extend-native */

		return Map;
	};


	return 'Map' in window ? window.Map : createMapPolyfill();
}, /* bExport= */ true);
