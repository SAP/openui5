sap.ui.define(['sap/ui/core/XMLComposite'], function(XMLComposite) {
	"use strict";
	var oSearchField = XMLComposite.extend("sap.ui.core.sample.XMLComposite.01.comp.SearchField", {
		metadata: {
			properties: {
				placeholder: { type: "string", defaultValue: "Enter Search Term..." },
				buttonText: { type: "string", defaultValue: "Search" }
			},
			events: {
				search: {
					parameters: {
						value: {type: "string"}
					}
				}
			}
		},

		handleSearch: function() { // button was pressed, retrieve Input value + fire event
			var sSearchString = this.byId("innerInput").getValue();
			this.fireEvent("search", {value: sSearchString});
		}
	});
	return oSearchField;
});
