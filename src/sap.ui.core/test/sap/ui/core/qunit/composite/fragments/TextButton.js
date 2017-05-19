sap.ui.define([
	'sap/ui/core/FragmentControl'
], function(FragmentControl) {
	"use strict";
	var TextButton = FragmentControl.extend("fragments.TextButton", {
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
}, /* bExport= */true);
