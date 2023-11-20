// This module uses a hard-coded module ID (1st param of sap.ui.define) which differs from the name by which it is required
// Additionally, it has a dependency to itself, but under the name by which it is required, not by the hard-coded name
//
// And yes, such modules exist in the wild.
//
sap.ui.define("fluffy-self-regarding-unicorn", [
	"fixture/inconsistent-naming/inconsistently-named-self-regarding-module"
], function(alt) {
	"use strict";
	return {
		id: "fluffy-self-regarding-unicorn",
		alt: alt
	};
});