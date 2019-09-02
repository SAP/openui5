sap.ui.define([
	'sap/ui/core/XMLComposite'
], function(XMLComposite) {
	"use strict";
	var TextButton = XMLComposite.extend("composites.TextButton", {
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: "Default Text",
					invalidate: true
				}
			}
		}
	});
	TextButton.prototype.onPress = function() {
	};
	return TextButton;
});
