sap.ui.define([], function() {
	"use strict";
	//@ui5-bundle fixture/bundle-and-depcache/chunkCD.js
	sap.ui.predefine("fixture/bundle-and-depcache/C", ["./F"], function() {
		"use strict";
		return "C";
	});
	sap.ui.predefine("fixture/bundle-and-depcache/D", [], function() {
		"use strict";
		return "D";
	});
});
