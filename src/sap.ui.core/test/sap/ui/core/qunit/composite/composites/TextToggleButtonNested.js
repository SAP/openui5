sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	var TextToggleButtonNested = XMLComposite.extend("composites.TextToggleButtonNested", {
		metadata: {
			events: {
				refreshed: {},
				textChanged: {}
			}
		}
	});
	// Note: it is not perfect. It would be better to forward the event 'textChanged' from
	// this XMLComposite control to the nested XMLComposite control.
	TextToggleButtonNested.prototype.onTextChanged = function() {
		this.fireTextChanged();
	};
	TextToggleButtonNested.prototype.onPressRefresh = function() {
		this.getAggregation("_content").getItems()[0].resetProperty("text");
		this.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].resetProperty("pressed");
		this.fireRefreshed();
	};
	return TextToggleButtonNested;
});
