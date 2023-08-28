sap.ui.define([
],
	function() {
	"use strict";
	var TextButton = undefined/*XMLComposite*/.extend("composites.TextButton", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Text"
				}
			}
		}
	});
	TextButton.prototype._handlePress = function () {
		this.setText("red");
	};
	return TextButton;
});
