sap.ui.define([
], function() {
	"use strict";
	var TextToggleButtonForwarded = undefined/*XMLComposite*/.extend("composites.TextToggleButtonForwarded", {
		metadata: {
			aggregations: {
				textToggleButton: {
					type: "composites.TextToggleButton",
					multiple: false,
					forwarding: { idSuffix: "--CC", aggregation: "content" }
				}
			},
			defaultAggregation: "textToggleButton",
			events: {
				refreshed: {},
				textChanged: {}
			}
		}
	});
	TextToggleButtonForwarded.prototype.applySettings = function() {
		undefined/*XMLComposite*/.prototype.applySettings.apply(this, arguments);
		this.getTextToggleButton().attachTextChanged(this.onTextChanged.bind(this));
	};
	TextToggleButtonForwarded.prototype.onTextChanged = function() {
		this.fireTextChanged();
	};
	TextToggleButtonForwarded.prototype.onPressRefresh = function() {
		var oTextToggleButton = this.getAggregation("_content").getItems()[0].getContent();
		oTextToggleButton.resetProperty("text");
		var oToggleButton = oTextToggleButton.getAggregation("_content").getItems()[1];
		oToggleButton.resetProperty("pressed");
		this.fireRefreshed();
	};
	return TextToggleButtonForwarded;
});
