/*!
 * ${copyright}
 */

// Provides type sap.ui.unified.FileUploaderHttpRequestMethod
sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Types of HTTP request methods.
	 *
	 * @enum {string}
	 * @alias sap.ui.unified.FileUploaderHttpRequestMethod
	 * @public
	 * @since 1.81.0
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

	DataType.registerEnum("sap.ui.unified.FileUploaderHttpRequestMethod", FileUploaderHttpRequestMethod);

	return FileUploaderHttpRequestMethod;

});