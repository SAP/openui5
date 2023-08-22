/*!
 * ${copyright}
 */

 sap.ui.define([], () => {
	"use strict";

	/**
	 * Specifies possible message types.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.118
	 * @alias module:sap/ui/core/message/MessageType
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
