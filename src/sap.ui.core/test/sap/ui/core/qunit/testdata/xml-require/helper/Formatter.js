sap.ui.define([], function() {
	"use strict";
	return {
		groupA: {
			upperCase: function(vText) {
				if (Array.isArray(vText)) {
					return vText[0].toUpperCase();
				} else if (typeof vText === "string") {
					return vText.toUpperCase();
				} else {
					return vText;
				}
			},
			lowerCase: function() {
			},
			keep: function(sValue) {
				return sValue;
			}
		}
	};
});
