/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/thirdparty/jquery", "sap/ui/dom/getOwnerWindow"], function(jQuery, domGetOwnerWindow) {
	"use strict";

	/**
	 * Applies the jQuery function extension:
	 * @see jQuery#rect
	 *
	 * @namespace
	 * @alias module:sap/ui/dom/jquery/rect
	 * @public
	 */

	/**
	 * Returns a rectangle describing the current visual positioning of the first DOM object in the collection
	 * (or <code>null</code> if no element was given).
	 *
	 * @return {object} An object with left, top, width and height
	 * @public
	 * @name jQuery#rect
	 * @author SAP SE
	 * @since 0.9.0
	 * @function
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

				var oWnd = domGetOwnerWindow(oDomRef);
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

