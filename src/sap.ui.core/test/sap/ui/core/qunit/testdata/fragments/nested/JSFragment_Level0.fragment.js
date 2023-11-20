sap.ui.define([
	"sap/ui/core/Fragment"
], function(Fragment) {
	"use strict";
	return {
		createContent: function () {
			return Fragment.load({
				name: "testdata.fragments.nested.JSFragment_Level1",
				type: "JS"
			});
		}
	};
});