/*!
 * ${copyright}
 */

// Provides control sap.ui.core.search.OpenSearchProvider.
sap.ui.define([
	'./SearchProvider',
	"sap/base/Log",
	"sap/base/security/encodeURL",
	"sap/base/util/fetch",
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/library' // ensure that required DataTypes are available
],
	function(SearchProvider, Log, encodeURL, fetch, jQuery) {
	"use strict";



	/**
	 * Constructor for a new search/OpenSearchProvider.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A SearchProvider which uses the OpenSearch protocol (either JSON or XML).
	 * @extends sap.ui.core.search.SearchProvider
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.search.OpenSearchProvider
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var OpenSearchProvider = SearchProvider.extend("sap.ui.core.search.OpenSearchProvider", /** @lends sap.ui.core.search.OpenSearchProvider.prototype */ { metadata : {

		library : "sap.ui.core",
		properties : {

			/**
			 * The URL for suggestions of the search provider. As placeholder for the concrete search queries '{searchTerms}' must be used. For cross domain requests maybe a proxy must be used.
			 */
			suggestUrl : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * The type of data which is provided by the given suggestUrl: either 'json' or 'xml'.
			 */
			suggestType : {type : "string", group : "Misc", defaultValue : 'json'}
		}
	}});


	/**
	 * Call this function to get suggest values from the search provider.
	 * The given callback function is called with the suggest value (type 'string', 1st parameter)
	 * and an array of the suggestions (type '[string]', 2nd parameter).
	 *
	 * @param {string} sValue The value for which suggestions are requested.
	 * @param {function(string, string[])} fCallback The callback function which is called when the suggestions are available.
	 * @type void
	 * @public
	 */
	OpenSearchProvider.prototype.suggest = function(sValue, fCallback) {
		var sUrl = this.getSuggestUrl();
		if (!sUrl) {
			return;
		}
		sUrl = sUrl.replace("{searchTerms}", encodeURL(sValue));

		var sType = this.getSuggestType();
		var fSuccess;
		if (sType && sType.toLowerCase() === "xml") {
			//Docu: http://msdn.microsoft.com/en-us/library/cc891508%28v=vs.85%29.aspx
			sType = "xml";
			fSuccess = function(data){
				var jXMLDocument = jQuery(data);
				var jItems = jXMLDocument.find("Text");
				var aSuggestions = [];
				jItems.each(function(){
					aSuggestions.push(jQuery(this).text());
				});
				fCallback(sValue, aSuggestions);
			};
		} else {
			//Docu: http://www.opensearch.org/Specifications/OpenSearch/Extensions/Suggestions/1.1#Response_format
			sType = "json";
			fSuccess = function(data){
				fCallback(sValue, data[1]);
			};
		}
		fetch(sUrl, {
			headers: {
				Accept: fetch.ContentTypes[sType.toUpperCase()]
			}
		}).then(function(response) {
			if (response.ok) {
				return response.text().then(function (responseText) {
					var data;
					if (sType === "json") {
						data = JSON.parse(responseText);
					} else {
						// sType == "xml"
						var parser = new DOMParser();
						data = parser.parseFromString(responseText, "text/xml");
					}
					fSuccess(data);
				});
			} else {
				throw new Error(response.statusText || response.status);
			}
		}).catch(function(error) {
			Log.fatal("The following problem occurred: " + error.message);
		});
	};

	return OpenSearchProvider;

});