sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/XMLComposite'],
    function(jQuery, XMLComposite) {
	"use strict";
	var TextButton = XMLComposite.extend("composites.TextButton", {
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
