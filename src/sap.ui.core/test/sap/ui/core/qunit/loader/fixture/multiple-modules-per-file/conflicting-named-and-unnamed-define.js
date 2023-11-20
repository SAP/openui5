sap.ui.define("fixture/multiple-modules-per-file/conflicting-named-and-unnamed-define", function() {
	"use strict";
	return {
		id: "fixture/multiple-modules-per-file/conflicting-named-and-unnamed-define#named"
	};
});

sap.ui.define(function() {
	"use strict";
	return {
		id: "fixture/multiple-modules-per-file/conflicting-named-and-unnamed-define#unnamed"
	};
});

