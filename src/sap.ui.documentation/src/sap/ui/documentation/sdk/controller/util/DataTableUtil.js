/*!
 * ${copyright}
 */

// Provides reuse functionality for Datatables
sap.ui.define([], function() {

	"use strict";

    function sortAlphaNumeric (a, b) {
		var sRegex = new RegExp("^([a-zA-Z]*)(.*)"),
			aMatched = sRegex.exec(a),
			bMatched = sRegex.exec(b),
			aFirstMached = aMatched[1],
			bFirstMatched = bMatched[1];

		if (aFirstMached > bFirstMatched) {
			return 1;
		}

		if (aFirstMached < bFirstMatched) {
			return -1;
		}

		return  parseInt(aMatched[2]) - parseInt(bMatched[2]);
	}

	return {
		sortAlphaNumeric: sortAlphaNumeric
	};

});