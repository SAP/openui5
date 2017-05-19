sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/FragmentControl'],
    function(jQuery, FragmentControl) {
	"use strict";
	var TextButton = FragmentControl.extend("fragments.TextButton", {
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
	}
	return TextButton;
}, /* bExport= */true);
