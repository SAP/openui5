/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.SearchProvider.
sap.ui.define(['./library', 'sap/ui/core/search/OpenSearchProvider'],
	function(library, OpenSearchProvider) {
	"use strict";



	/**
	 * Constructor for a new SearchProvider.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A SearchProvider which can be attached to a Search Field.
	 * @extends sap.ui.core.search.OpenSearchProvider
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.6.0.
	 * Replaced by sap.ui.core.search.OpenSearchProvider
	 * @alias sap.ui.commons.SearchProvider
	 */
	var SearchProvider = OpenSearchProvider.extend("sap.ui.commons.SearchProvider", /** @lends sap.ui.commons.SearchProvider.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});

	/**
	 * Called by the search field, when suggestions are requested.
	 *
	 * @private
	 */
	SearchProvider.prototype._doSuggest = function(oSearchField, sSuggestValue) {
		this.suggest(sSuggestValue, function(sValue, aSuggestions){
			if (oSearchField && oSearchField.suggest) {
				oSearchField.suggest(sValue, aSuggestions);
			}
		});
	};



	return SearchProvider;

});
