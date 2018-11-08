/*global QUnit */
sap.ui.define("fixture/multiple-modules-per-file/conflicting-named-defines", function() {
	"use strict";
	return {
		id: "fixture/multiple-modules-per-file/conflicting-named-defines#named-1"
	};
});

sap.ui.define("fixture/multiple-modules-per-file/conflicting-named-defines", ["./dead-dependency"], function() {
	"use strict";
	QUnit.config.current.assert(false, "second module should not be executed");
	return {
		id: "fixture/multiple-modules-per-file/conflicting-named-defines#named-2"
	};
});
