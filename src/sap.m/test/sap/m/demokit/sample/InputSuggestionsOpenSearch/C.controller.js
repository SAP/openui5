jQuery.sap.require("sap.m.sample.InputSuggestionsOpenSearch.MockServer");

sap.ui.controller("sap.m.sample.InputSuggestionsOpenSearch.C", {

	// Start up mock server that responds to product searches
	// Then create an Open Search Provider pointing to that server.
	// NOTE: The mock server is only to simulate a remote service,
	// for demonstration purposes only!
	onInit: function (oEvent) {
		this._oServer = sap.m.sample.InputSuggestionsOpenSearch.MockServer.backendProductSearchService();
		this._oOpenSearchProvider = new sap.ui.core.search.OpenSearchProvider();
		this._oOpenSearchProvider.setSuggestUrl(this._oServer.getRootUri() + "/{searchTerms}");
	},

	handleSuggest: function (oEvent) {
		var sTerm = oEvent.getParameter("suggestValue");
		this._oOpenSearchProvider.suggest(sTerm, jQuery.proxy(function (sValue, aSuggestions) {
			if (sValue === this.getValue()) {
				this.destroySuggestionItems();
				for (var i = 0, ii = aSuggestions.length; i < ii; i++) {
					this.addSuggestionItem(new sap.ui.core.Item({
						text: aSuggestions[i]
					}));
				}
			}
		}, oEvent.getSource()));
	}

});