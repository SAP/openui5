sap.ui.define(function() {
	"use strict";

	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/COMPOSITE",
		defaults: {
		},
		tests: {
			/**
			 * @deprecated As of version 1.88
			 */
			"XMLComposite": {
				title: "QUnit: XMLComposite - sap.ui.core",
				ui5: {
					libs: "sap.m"
				},
				loader: {
					paths: {
						composites: "test-resources/sap/ui/core/qunit/composite/composites",
						composites2: "test-resources/sap/ui/core/qunit/composite/composites2",
						bundles: "test-resources/sap/ui/core/qunit/composite/bundles"
					}
				},
				qunit: {
					version: 2
				},
				sinon: {
					version: 4,
					qunitBridge: true
				},
				coverage: {
					only: "sap/ui/core/XMLComposite.js"
				}
			},
			/**
			 * @deprecated As of version 1.88
			 */
			XMLCompositeMemoryLeak: {
				title: "QUnit Page for sap.ui.core.XMLComposite Memory Leaks",
				loader: {
					paths: {
						composites: "test-resources/sap/ui/core/qunit/composite/composites"
					}
				},
				qunit: {
					version: 1
				}
			}
		}
	};
});
