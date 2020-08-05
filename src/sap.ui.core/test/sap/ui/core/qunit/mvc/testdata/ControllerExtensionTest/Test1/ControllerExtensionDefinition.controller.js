sap.ui.define([], function () {
	"use strict";

	return {
		"triple": function(x) {
			var inp = this.getView().byId("inp");
			inp.setValue(inp.getValue() * 3);

			return x * 3;
		}
	};
});