/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/support/supportRules/Constants"
], function (constants) {
	"use strict";

	return {
		resolutionUrl: function (aUrls, oUrl) {
			var sSeparator = aUrls.indexOf(oUrl) === aUrls.length - 1 ? "" : ", \u00a0";
			return oUrl.text + sSeparator;
		},
		hasResolutionUrls: function (aUrls) {
			if (aUrls && aUrls.length > 0) {
				return true;
			}
			return false;
		},

		filteredText: function (severityFilter, categoryFilter, audienceFilter, elementFilter) {
			var sResultText = "Filtered by: ";

			sResultText += severityFilter === constants.FILTER_VALUE_ALL ? "" : "Severity - " + severityFilter + ";";
			sResultText += categoryFilter === constants.FILTER_VALUE_ALL ? "" : " Category    - " + categoryFilter + ";";
			sResultText += audienceFilter === constants.FILTER_VALUE_ALL ? "" : " Audience - " + audienceFilter + ";";
			sResultText += elementFilter === constants.FILTER_VALUE_ALL ? "" : " Control Element - " + elementFilter + ";";

			return sResultText;
		}
	};
});