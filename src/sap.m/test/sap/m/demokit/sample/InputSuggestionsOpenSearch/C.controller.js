sap.ui.define([
		'jquery.sap.global',
		'./MockServer',
		'sap/ui/core/Item',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/search/OpenSearchProvider'
	], function(jQuery, MockServer, Item, Controller, OpenSearchProvider) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.InputSuggestionsOpenSearch.C", {

		// Start up mock server that responds to product searches
		// Then create an Open Search Provider pointing to that server.
		// NOTE: The mock server is only to simulate a remote service,
		// for demonstration purposes only!
		onInit: function (oEvent) {
			this._oServer = MockServer.backendProductSearchService();
			this._oOpenSearchProvider = new OpenSearchProvider();
			this._oOpenSearchProvider.setSuggestUrl(this._oServer.getRootUri() + "/{searchTerms}");
		},

		handleSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			this._oOpenSearchProvider.suggest(sTerm, jQuery.proxy(function (sValue, aSuggestions) {
				if (sValue === this.getValue()) {
					this.destroySuggestionItems();
					for (var i = 0, ii = aSuggestions.length; i < ii; i++) {
						this.addSuggestionItem(new Item({
							text: aSuggestions[i]
						}));
					}
				}
			}, oEvent.getSource()));
		}

	});

	return CController;

});
