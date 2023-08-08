/*!
 * ${copyright}
 */

 // Provides type sap.ui.core.message.MessageType
 sap.ui.define([], function () {
	"use strict";

	/**
	 * Specifies possible message types.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.ui.core.message.MessageType
	 */
	var MessageType = {

		/**
		 * Message should be just an information
		 * @public
		 */
		Information : "Information",

		/**
		 * Message is a warning
		 * @public
		 */
		Warning : "Warning",

		/**
		 * Message is an error
		 * @public
		 */
		Error : "Error",

		/**
		 * Message has no specific level
		 * @public
		 */
		None : "None",

		/**
		 * Message is a success message
		 * @public
		 */
		Success : "Success"

	};

	return MessageType;
});
