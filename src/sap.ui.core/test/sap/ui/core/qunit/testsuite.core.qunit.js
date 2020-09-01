sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/CORE",
		defaults: {
			loader:{
				paths:{
					"testdata/core": "test-resources/sap/ui/core/qunit/"
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			}
		},
		tests: {
			baseuri: {
				title: "sap.ui.thirdparty.baseuri",
				bootCore: false
			},
			ContextMenuSupport: {
				title: "sap.ui.core.ContextMenuSupport"
			},
			i18n_CLDR_Format: {
				title: "sap.ui.core: i18n (CLDR, Format)",
				qunit: {
					reorder: false
				},
				loader: {
					paths: {
						performance: "test-resources/sap/ui/core/qunit/performance"
					}
				},
				module: [
					"testdata/core/base/i18n/ResourceBundle.qunit"
				]
			},
			JSON: {
				title: "sap.ui.core: JSON Native Support",
				ui5: {
					libs: "sap.ui.commons"
				}
			},
			QUnit: {
				title: "sap.ui.core: General QUnit 1 checks",
				qunit: {
					version: 1
				}
			},
			QUnit2: {
				title: "QUnit tests: General QUnit 2 checks"
			},
			QUnit2NestedModules: {
				title: "sap.ui.core: QUnit 2 nested modules",
				sinon: {
					// FIXME: Doesn't work with nested modules
					qunitBridge: false
				}
			},
			SinonJS: {
				title: "sap.ui.thirdparty.sinon: Support",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				sinon: {
					version: 1, // sinon 1 itself is tested
					qunitBridge: true
				}
			},
			Hyphenation: {
				title: "sap.ui.core.hyphenation.Hyphenation"
			},
			"support/usage/EventBroadcaster": {
				title: "Event Broadcaster"
			},
			"support/RuleEngineOpaExtension": {
				title: "Rule Engine OPA Extension"
			},
			"support/plugins/ControlTree": {
				title: "Control Tree Support Plugin"
			}
		}
	};
});
