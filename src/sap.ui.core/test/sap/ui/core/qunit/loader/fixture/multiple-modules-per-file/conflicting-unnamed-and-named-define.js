sap.ui.define(function() {
	"use strict";
	return {
		id: "fixture/multiple-modules-per-file/conflicting-unnamed-and-named-define#unnamed"
	};
});

sap.ui.define("fixture/multiple-modules-per-file/conflicting-unnamed-and-named-define", function() {
	"use strict";
	return {
		id: "fixture/multiple-modules-per-file/conflicting-unnamed-and-named-define#named"
	};
});
