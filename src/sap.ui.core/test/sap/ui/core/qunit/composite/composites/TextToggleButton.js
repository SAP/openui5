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
		},
		constructor: function(sId, mSettings) {
			XMLComposite.apply(this,arguments);
			this._iRetemplateCount = 0;
		}
	});

	TextToggleButton.prototype.onPress = function() {
		this.setText(this.getAggregation("_content").getItems()[1].getPressed() ? "On" : "Off");
		this.fireTextChanged();
	};

	TextToggleButton.prototype.onPress = function() {
		this.setText(this.getAggregation("_content").getItems()[1].getPressed() ? "On" : "Off");
		this.fireTextChanged();
	};

	TextToggleButton.prototype.fragmentRetemplating = function() {
		XMLComposite.prototype.fragmentRetemplating.apply(this,arguments);
		this._iRetemplateCount++;
	};

	return TextToggleButton;
});
