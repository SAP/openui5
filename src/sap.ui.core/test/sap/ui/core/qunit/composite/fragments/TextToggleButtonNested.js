sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	var TextToggleButtonNested = FragmentControl.extend("fragments.TextToggleButtonNested", {
		metadata: {
			events: {
				refreshed: {},
				textChanged: {}
			}
		}
	});
	// Note: it is not perfect. It would be better to forward the event 'textChanged' from
	// this fragment control to the nested fragment control.
	TextToggleButtonNested.prototype.onTextChanged = function() {
		this.fireTextChanged();
	};
	TextToggleButtonNested.prototype.onPressRefresh = function() {
		this.getAggregation("_content").getItems()[0].resetProperty("text");
		this.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].resetProperty("pressed");
		this.fireRefreshed();
	};
	return TextToggleButtonNested;
}, /* bExport= */true);
