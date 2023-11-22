/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	return function (_aAllMessages, _oRowData) {
		var aMessages,
			// 'this' is the control!
			oRowContext = this.getBindingContext();

		if (oRowContext) { // formatter is called with oRowContext null initially
			aMessages = oRowContext.getMessages();
			if (aMessages.length) {
				return aMessages[0].type;
			}
		}
		return null;
	};
}, true);
