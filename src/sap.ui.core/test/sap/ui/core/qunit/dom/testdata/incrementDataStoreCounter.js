(function() {
	"use strict";

	const dataStore = sap.ui.require("test-resources/sap/ui/core/qunit/dom/testdata/dataStore");
	if ( dataStore === undefined ) {
		throw new Error("the dataStore module must have been loaded before (e.g. by the unit test module)");
	}

	if (dataStore.counter == undefined) {
		dataStore.counter = 0;
	} else {
		dataStore.counter = dataStore.counter + 1;
	}
}());