/*!
 * ${copyright}
 */

// Provides control sap.ui.core.search.SearchProvider.
sap.ui.define(['sap/ui/core/Element', "sap/base/Log", 'sap/ui/core/library'],
	function(Element, Log) {
	"use strict";



	/**
	 * Constructor for a new search/SearchProvider.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @abstract
	 * @class
	 * Abstract base class for all SearchProviders which can be e.g. attached to a SearchField.
	 *
	 * Do not create instances of this class, but use a concrete subclass instead.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.search.SearchProvider
	 */
	var SearchProvider = Element.extend("sap.ui.core.search.SearchProvider", /** @lends sap.ui.core.search.SearchProvider.prototype */ { metadata : {

		"abstract": true,
		library : "sap.ui.core",
		properties : {

			/**
			 * Icon of the Search Provider
			 */
			icon : {type : "string", group : "Misc", defaultValue : null}
		}
	}});


	/**
	 * Call this function to get suggest values from the search provider.
	 * The given callback function is called with the suggest value (type 'string', 1st parameter)
	 * and an array of the suggestions (type '[string]', 2nd parameter).
	 *
	 * @param {string} sValue The value for which suggestions are requested.
	 * @param {function(string, string[])} fnCallback The callback function which is called when the suggestions are available.
	 * @public
	 */
	SearchProvider.prototype.suggest = function(sValue, fnCallback) {
		Log.warning("sap.ui.core.search.SearchProvider is the abstract base class for all SearchProviders. Do not create instances of this class, but use a concrete sub class instead.");
	};


	return SearchProvider;

});