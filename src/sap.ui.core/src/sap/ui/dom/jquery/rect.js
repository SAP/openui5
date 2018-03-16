/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/dom/ownerWindow"], function(jQuery, domOwnerWindow) {
	"use strict";

	/**
	 * Returns a rectangle describing the current visual positioning of the first DOM object in the collection
	 * (or <code>null</code> if no element was given).
	 *
	 * @return {object} An object with left, top, width and height
	 * @private
	 * @author SAP SE
	 * @function
	 * @exports sap/ui/dom/jquery/rect
	 */
	var fnRect = function rect() {
		var oDomRef = this.get(0);

		if (oDomRef) {
			// this should be available in all 'modern browsers'
			if (oDomRef.getBoundingClientRect) {
				var oClientRect = oDomRef.getBoundingClientRect();
				var oRect = { top : oClientRect.top,
						left : oClientRect.left,
						width : oClientRect.right - oClientRect.left,
						height : oClientRect.bottom - oClientRect.top };

				var oWnd = domOwnerWindow(oDomRef);
				oRect.left += jQuery(oWnd).scrollLeft();
				oRect.top += jQuery(oWnd).scrollTop();

				return oRect;
			} else {
				// IE6 and older; avoid crashing and give some hardcoded size
				return { top : 10, left : 10, width : oDomRef.offsetWidth, height : oDomRef.offsetHeight };
			}
		}
		return null;
	};

	jQuery.fn.rect = fnRect;

	return jQuery;

});

