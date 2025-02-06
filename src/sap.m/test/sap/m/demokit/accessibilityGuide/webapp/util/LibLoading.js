sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Lib"
], function(
	Log,
	Library
) {
	"use strict";

	/**
	 */
	var LibLoading = {};
	LibLoading.bCommonsLibAvailable = false;

	/**
	 * Creates ajax request to load json schema
	 * @param {string} sUri Location of the resource
	 * @returns {Promise} Promise, which will be resolved with the json file content
	 * @private
	 */
	LibLoading._loadLibrary = function (sUri) {
		return new Promise(function (resolve, reject) {
			Library.load(sUri)
			.then(function () {
				resolve();
			})
			.catch(function () {
				reject("URI " + sUri + " is not available with this distribution.");
			});
		});
	};

	return LibLoading;
});