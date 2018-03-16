/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Returns the window reference for a DomRef.
	 *
	 * @function
	 * @param {Element} oDomRef The DOM reference
	 * @return {Window} Window reference
	 * @private
	 * @exports sap/ui/dom/ownerWindow
	 */
	var fnOwnerWindow = function ownerWindow(oDomRef){
		if (oDomRef.ownerDocument.parentWindow) {
			return oDomRef.ownerDocument.parentWindow;
		}
		return oDomRef.ownerDocument.defaultView;
	};

	return fnOwnerWindow;

});

