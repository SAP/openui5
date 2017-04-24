sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	var TextToggleButtonNested = FragmentControl.extend("fragments.TextToggleButtonNested", {
		metadata: {
			events: {
				refreshed: {}
			}
		}
	});
	TextToggleButtonNested.prototype.onPressRefresh = function() {
		this.getAggregation("_content").getItems()[0].setText(undefined);
		this.getAggregation("_content").getItems()[0].getAggregation("_content").getItems()[1].setPressed(false);
		this.fireRefreshed();
	};
	return TextToggleButtonNested;
}, /* bExport= */true);
