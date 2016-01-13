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
		 * Constructs a map of query options from the given options and model options; an option
		 * overwrites a model option having the same key.
		 * The following query options are disallowed:
		 * <ul>
		 * <li> system query options (key starts with "$") except those specified in
		 *   <code>aAllowed</code>
		 * <li> parameter aliases (key starts with "@")
		 * </ul>
		 * @param {object} [mModelOptions={}]
		 *   map of query options specified for the model
		 * @param {object} [mOptions={}]
		 *   map of query options
		 * @param {string[]} [aAllowed=[]]
		 *   names of allowed system query options
		 * @throws {Error} when disallowed OData query options are provided
		 * @returns {object}
		 *   the map of query options
		 */
		buildQueryOptions : function (mModelOptions, mOptions, aAllowed) {
			var mResult = JSON.parse(JSON.stringify(mModelOptions || {}));

			Object.keys(mOptions || {}).forEach(function (sKey) {
				if (sKey[0] === "@"
					|| sKey[0] === "$" && (aAllowed || []).indexOf(sKey) === -1) {
					throw new Error("Parameter " + sKey + " is not supported");
				}
				mResult[sKey] = mOptions[sKey];
			});
			return mResult;
		},

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
