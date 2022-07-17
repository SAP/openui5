/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/odata/v4/FieldValueHelpDelegate"
], function (FieldValueHelpDelegate) {
	"use strict";

	var FieldValueHelpSampleDelegate = Object.assign({}, FieldValueHelpDelegate);

	FieldValueHelpSampleDelegate.adjustSearch = function(oPayload, bTypeahead, sSearch) {

		if (bTypeahead && sSearch) {
			return '"' + sSearch + '"'; // TODO: escape " in string
		} else if (sSearch && sSearch.indexOf(" ") === -1) {
			return '"' + sSearch + '"'; // TODO: escape " in string
		} else {
			// allow OR AND ....
			return sSearch; // TODO: check for unsupported characters
		}

	};

	return FieldValueHelpSampleDelegate;
});
