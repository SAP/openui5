sap.ui.define(["sap/m/StandardListItem"], function(ListItem) {
	"use strict";
	return {
		createItem: function(sId, oContext) {
			return new ListItem(sId, {
				title: "{title}"
			});
		}
	};
});
