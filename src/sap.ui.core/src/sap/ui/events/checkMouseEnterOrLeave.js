/*!
 * ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Checks a given mouseover or mouseout event whether it is
	 * equivalent to a mouseenter or mouseleave event regarding the given DOM reference.
	 *
	 * @function
	 * @since 1.58
	 * @public
	 * @alias module:sap/ui/events/checkMouseEnterOrLeave
	 * @param {jQuery.Event} oEvent The Mouse Event
	 * @param {Element} oDomRef The domref of the element to check
	 * @returns {boolean} True if the provided event is equivalent
	 */
	var fnCheckMouseEnterOrLeave = function checkMouseEnterOrLeave(oEvent, oDomRef) {
		if (oEvent.type != "mouseover" && oEvent.type != "mouseout") {
			return false;
		}

		var isMouseEnterLeave = false;
		var element = oDomRef;
		var parent = oEvent.relatedTarget;

		try {
			while (parent && parent !== element) {
				parent = parent.parentNode;
			}

			if (parent !== element) {
				isMouseEnterLeave = true;
			}
		} catch (e) {
			//escape eslint check for empty block
		}

		return isMouseEnterLeave;
	};

	return fnCheckMouseEnterOrLeave;
});