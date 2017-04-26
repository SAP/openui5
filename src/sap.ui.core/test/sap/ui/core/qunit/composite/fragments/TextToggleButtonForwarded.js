sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	var TextToggleButtonForwarded = FragmentControl.extend("fragments.TextToggleButtonForwarded", {
		metadata: {
			aggregations: {
				textToggleButton: {
					type: "fragments.TextToggleButton",
					multiple: false
				}
			},
			defaultAggregation: "textToggleButton",
			events: {
				refreshed: {}
			}
		}
	});
	TextToggleButtonForwarded.prototype.onPressRefresh = function() {
		var sDefault = this.getAggregation("_content").getItems()[0]._oContent.getMetadata().getProperty("text").getDefaultValue();
		this.getAggregation("_content").getItems()[0]._oContent.setText(undefined);
		this.getAggregation("_content").getItems()[0]._oContent.getAggregation("_content").getItems()[1].setPressed(false);
		this.fireRefreshed();
	};
	return TextToggleButtonForwarded;
}, /* bExport= */true);
