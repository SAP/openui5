sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	var TextToggleButton = FragmentControl.extend("fragments.TextToggleButton", {
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
