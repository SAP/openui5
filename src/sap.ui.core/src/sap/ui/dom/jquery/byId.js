/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";

	/**
	 * Shortcut for jQuery("#" + id) with additionally the ID being escaped properly.
	 * Example: returns the jQuery object for the DOM element with the given ID
	 *
	 * Use this method instead of jQuery(...) if you know the argument is exactly one ID and
	 * the ID is not known in advance because it is in a variable (as opposed to a string
	 * constant with known content).
	 *
	 * @function
	 * @param {string} sId The ID to search for and construct the jQuery object
	 * @param {Element} oContext The context DOM Element
	 * @return {Object} The jQuery object for the DOM element identified by the given sId
	 * @private
	 * @exports sap/ui/dom/jquery/byId
	 */
	var fnById = function byId(sId, oContext) {
		var escapedId = "";
		if (sId) {
			// Note: This does not escape all relevant characters according to jQuery's documentation
			// (see http://api.jquery.com/category/selectors/)
			// As the behavior hasn't been changed for a long time it is not advisable to change it in
			// future as users might be already escaping characters on their own or relying on the fact
			// selector like byId("my-id > div") can be used.
			escapedId = "#" + sId.replace(/(:|\.)/g,'\\$1');
		}
		return jQuery(escapedId, oContext);
	};

	return fnById;

});

