sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/JSONMODEL",
		defaults: {
			qunit: {
				version: 2
			},
			ui5: {
				language: "en-US"
			}
		},
		tests: {
			JSONBinding: {
				title: "sap.ui.model.json.JSONBinding - QUnit Tests"
			},
			JSONListBinding: {
				title: "sap.ui.model.json.JSONListBinding - QUnit Tests"
			},
			JSONModel: {
				title: "sap.ui.model.json.JSONModel - QUnit Tests",
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			JSONPropertyBinding: {
				title: "sap.ui.model.json.JSONPropertyBinding - QUnit Tests"
			},
			JSONTreeBinding: {
				title: "sap.ui.model.json.JSONTreeBinding - QUnit Tests"
			},
			JSONTwoWay: {
				title: "sap.ui.model.json.JSONTwoWay - QUnit Tests"
			}
		}
	};
});
