/*!
 * ${copyright}
 */

	// Provides type sap.m.upload.UploaderHttpRequestMethod
	sap.ui.define([], function() {
		"use strict";

	/**
	 * Types of HTTP request methods.
	 *
	 * @enum {string}
	 * @alias sap.m.upload.UploaderHttpRequestMethod
	 * @public
	 * @since 1.90
	 */
	var UploaderHttpRequestMethod = {

		/**
		 * HTTP request POST method.
		 * @public
		 */
		Post : "POST",

		/**
		 * HTTP request PUT method.
		 * @public
		 */
		Put : "PUT"

	};

	return UploaderHttpRequestMethod;

});