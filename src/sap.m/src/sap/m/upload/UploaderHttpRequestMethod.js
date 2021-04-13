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
	 * @ui5-metamodel This enumeration will also be described in the SAPUI5 (legacy) design time metamodel
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