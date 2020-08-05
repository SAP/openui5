sap.ui.define([], function() {
	"use strict";

	return {
		foo: function() {
			return "foo";
		},
		bar: function() {
			return "bar";
		},
		checkExistence: function(bExist) {
			return bExist;
		},
		format: function(sText) {
			return sText;
		},
		getPath: function(bExist) {
			return "{/subbinding}";
		}
	};
}, true);
