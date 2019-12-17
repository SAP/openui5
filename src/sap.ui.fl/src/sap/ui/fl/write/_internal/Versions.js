/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/Storage"
], function(
	Storage
) {
	"use strict";

	var _mInstances = {};

	/**
	 *
	 *
	 * @namespace sap.ui.fl.write._internal.Versions
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var Versions = {};

	/**
	 * @param {object} mPropertyBag - Property Bag
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer for which the versions should be retrieved
	 * @returns {Promise<sap.ui.fl.Versions[]>} Promise resolving with a list of versions if available;
	 * rejects if an error occurs or the layer does not support draft handling
	 */
	Versions.getVersions = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;

		if (_mInstances[sReference] && _mInstances[sReference][sLayer]) {
			return Promise.resolve(_mInstances[sReference][sLayer]);
		}

		return Storage.loadVersions(mPropertyBag)
			.then(function (aVersions) {
				_mInstances[sReference] = _mInstances[sReference] || {};
				_mInstances[sReference][sLayer] = aVersions;
				return _mInstances[sReference][sLayer];
			});
	};

	Versions.clearInstances = function() {
		_mInstances = {};
	};

	return Versions;
});
