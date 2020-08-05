sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/XMLMODEL",
		defaults: {
			ui5: {
				language: "en-US"
			},
			qunit: {
				version: 2
			}
		},
		tests: {
			XMLBinding: {
				title: "QUnit tests: Data binding XML Bindings"
			},
			XMLListBinding: {
				title: "QUnit tests: XML List Binding"
			},
			XMLModel: {
				title: "QUnit tests: Data binding XML Model",
				ui5: {
					libs: "sap.ui.layout,sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			XMLModelNS: {
				title: "QUnit tests: Data binding XML Model with NameSpaces"
			},
			XMLPropertyBinding: {
				title: "QUnit tests:XML Property Binding",
				ui5: {
					libs: "sap.ui.commons,sap.ui.layout,sap.m"
				}
			},
			XMLTreeBinding: {
				title: "QUnit tests: XML Tree Binding"
			},
			XMLTwoWay: {
				title: "QUnit tests: Data binding XML Two Way Binding",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				}
			}
		}
	};
});
