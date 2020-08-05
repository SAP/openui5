/*!
 * ${copyright}
 */

// Provides type sap.ui.unified.FileUploaderHttpRequestMethod
sap.ui.define([], function() {
	"use strict";

	/**
	 * Types of HTTP request methods.
	 *
	 * @enum {string}
	 * @alias sap.ui.unified.FileUploaderHttpRequestMethod
	 * @public
	 * @since 1.81.0
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FileUploaderHttpRequestMethod = {

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

	return FileUploaderHttpRequestMethod;

});