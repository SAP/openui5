sap.ui.define(function(){
	"use strict";
	/**
	 * Simply replaces \n and \t in HTML strings.
	 * Used to normalize HTML string that have been written in a more human readable form.
	 * The output can then be compared more easily to the [outer|inner]HTML of a DOM node.
	 *
	 * @param {string} html the html string to uglify
	 * @returns {string} the uglified html string
	 */
	return function(html) {
		return html.replace(/[\n\t]/g, "");
	};
});