sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	var TextToggleButtonForwarded = XMLComposite.extend("composites.TextToggleButtonForwarded", {
		metadata: {
			aggregations: {
				textToggleButton: {
					type: "composites.TextToggleButton",
					multiple: false
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
		XMLComposite.prototype.applySettings.apply(this, arguments);
		this.getTextToggleButton().attachTextChanged(this.onTextChanged.bind(this));
	};
	TextToggleButtonForwarded.prototype.onTextChanged = function() {
		this.fireTextChanged();
	};
	TextToggleButtonForwarded.prototype.onPressRefresh = function() {
		this.getAggregation("_content").getItems()[0]._oContent.resetProperty("text");
		this.getAggregation("_content").getItems()[0]._oContent.getAggregation("_content").getItems()[1].resetProperty("pressed");
		this.fireRefreshed();
	};
	return TextToggleButtonForwarded;
}, /* bExport= */true);
