/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/odata/ODataUtils"
], function (ODataUtils) {
	"use strict";

	var Helper;

	Helper = {
		/**
		 * Returns the key predicate (see "4.3.1 Canonical URL") for the given entity type meta
		 * data and entity instance runtime data.
		 *
		 * @param {object} oEntityType
		 *   entity type meta data
		 * @param {object} oEntityInstance
		 *   entity instance runtime data
		 * @returns {string}
		 *   the key predicate, e.g. "(Sector='DevOps',ID='42')"
		 */
		getKeyPredicate : function (oEntityType, oEntityInstance) {
			var aKeyValuePairs = [];

			oEntityType.$Key.forEach(function (sName) {
				var sType = oEntityType[sName].$Type,
					sValue = ODataUtils.formatValue(oEntityInstance[sName], sType);

				aKeyValuePairs.push(
					encodeURIComponent(sName) + "=" + encodeURIComponent(sValue));
			});

			return "(" + aKeyValuePairs.join(",") + ")";
		}
	};

	return Helper;
}, /* bExport= */ false);
