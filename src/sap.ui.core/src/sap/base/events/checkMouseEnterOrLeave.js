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
	 * Checks a given mouseover or mouseout event whether it is
	 * equivalent to a mouseenter or mouseleave event regarding the given DOM reference.
	 *
	 * @function
	 * @private
	 * @exports sap/base/events/checkMouseEnterOrLeave
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