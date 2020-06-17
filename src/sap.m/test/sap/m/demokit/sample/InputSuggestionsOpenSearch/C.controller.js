sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/core/search/OpenSearchProvider",
	"./MockServer"
], function (Controller, Item, OpenSearchProvider, MockServer) {
	"use strict";

	return Controller.extend("sap.m.sample.InputSuggestionsOpenSearch.C", {

		// Start up mock server that responds to product searches
		// Then create an Open Search Provider pointing to that server.
		// NOTE: The mock server is only to simulate a remote service,
		// for demonstration purposes only!
		onInit: function () {
			MockServer.connectToMockProductSearchService().then(function (oService) {
				this._oServer = oService;
				this._oOpenSearchProvider = new OpenSearchProvider();
				this._oOpenSearchProvider.setSuggestUrl(this._oServer.getRootUri() + "/{searchTerms}");
			}.bind(this));
		},

		onSuggest: function (oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");

			this._oOpenSearchProvider.suggest(sTerm, function (sValue, aSuggestions) {
				if (sValue === this.getValue()) {
					this.destroySuggestionItems();

					for (var i = 0; i < aSuggestions.length; i++) {
						this.addSuggestionItem(new Item({
							text: aSuggestions[i]
						}));
					}
				}
			}.bind(oEvent.getSource()));
		}

	});
});