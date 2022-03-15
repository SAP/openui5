sap.ui.define([], function() {
	"use strict";
	return {
		groupA: {
			upperCase: function(sText) {
				if (sText) {
					return sText.toUpperCase();
				}
				return sText;
			},
			lowerCase: function() {
			},
			keep: function(sValue) {
				return sValue;
			}
		}
	};
});
