sap.ui.define(function() {
	"use strict";

	return {
		name: "TestSuite for sap.ui.core designtime modules",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			}
		},
		tests: {
			"Library": {
				title: "QUnit Page for designtime consistency check of sap.ui.core library",
				group: "Designtime"
			}
		}
	};
});
