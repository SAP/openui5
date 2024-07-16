sap.ui.define([
], function() {
	"use strict";
	var TextToggleButton = undefined/*XMLComposite*/.extend("composites.TextToggleButton", {
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
			undefined/*XMLComposite*/.apply(this,arguments);
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
		undefined/*XMLComposite*/.prototype.fragmentRetemplating.apply(this,arguments);
		this._iRetemplateCount++;
	};

	return TextToggleButton;
});
