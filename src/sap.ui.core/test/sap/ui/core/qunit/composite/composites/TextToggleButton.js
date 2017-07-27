sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	var TextToggleButton = XMLComposite.extend("composites.TextToggleButton", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Text",
					invalidate: true
				}
			},
			events: {
				textChanged: {}
			}
		}
	});
	TextToggleButton.prototype.onPress = function() {
		this.setText(this.getAggregation("_content").getItems()[1].getPressed() ? "On" : "Off");
		this.fireTextChanged();
	};
	return TextToggleButton;
}, /* bExport= */true);
