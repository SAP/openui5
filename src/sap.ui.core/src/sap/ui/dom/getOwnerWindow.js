/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Returns the window reference for a DomRef.
	 *
	 * @function
	 * @since 1.58
	 * @param {Element} oDomRef The DOM reference
	 * @return {Window} Window reference
	 * @public
	 * @alias module:sap/ui/dom/getOwnerWindow
	 */
	var fnGetOwnerWindow = function ownerWindow(oDomRef){
		if (oDomRef.ownerDocument.parentWindow) {
			return oDomRef.ownerDocument.parentWindow;
		}
		return oDomRef.ownerDocument.defaultView;
	};

	return fnGetOwnerWindow;

});

