sap.ui.define([], function() {
	"use strict";
	//@ui5-bundle fixture/bundle-and-depcache/chunkAB.js
	sap.ui.predefine("fixture/bundle-and-depcache/A",["./C"], function() {
		"use strict";
		return "A";
	});
	sap.ui.predefine("fixture/bundle-and-depcache/B", ["./E"], function() {
		"use strict";
		return "B";
	});
});
