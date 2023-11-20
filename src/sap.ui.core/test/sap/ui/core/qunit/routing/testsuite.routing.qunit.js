sap.ui.define(["sap/ui/Device"], function(Device) {

	"use strict";

	return {
		name: "Package 'sap.ui.core.routing'",
		defaults: {
			page: "test-resources/sap/ui/core/qunit/routing/RoutingTest.qunit.html?test={name}",
			loader: {
				paths: {
					"qunit/target": "./fixture/target",
					"qunit/view": "./fixture",
					"qunit/placeholder": "./fixture/placeholder",
					"test/routing/target": "./fixture",
					"testdata": "../testdata",
					"qunit/router": "./fixture/router"
				}
			}
		},
		tests: {
			"async/Route": {
				title: "QUnit Page for sap.ui.core.routing.Route (async)"
			},
			"async/Router": {
				title: "QUnit Page for sap.ui.core.routing.Router (async)",
				loader: {
					paths: {
						"routing": "../testdata/routing"
					}
				},
				qunit: {
					reorder: false
				}
			},
			"async/Target": {
				title: "QUnit Page for sap.ui.core.routing.Target (async)"
			},
			"async/Targets": {
				title: "QUnit Page for sap.ui.core.routing.Targets (async)"
			},
			"async/Views": {
				title: "QUnit Page for sap.ui.core.routing.Views (async)"
			},
			"async/TitleHistory": {
				title: "QUnit Page for sap.ui.core.routing.TitleHistory (async)"
			},
			/**
			 * @deprecated Since 1.90
			 */
			"sync/Route": {
				title: "QUnit Page for sap.ui.core.routing.Route (sync)",
				sinon: {
					version: 4, // Note: test manages clock on its own to allow use of sinon-4 and new bridge
					useFakeTimers:true
				}
			},
			/**
			 * @deprecated Since 1.90
			 */
			"sync/Router": {
				title: "QUnit Page for sap.ui.core.routing.Router (sync)",
				sinon: {
					version: 4, // Note: test manages clock on its own to allow use of sinon-4 and new bridge
					useFakeTimers:true
				}
			},
			/**
			 * @deprecated Since 1.90
			 */
			"sync/Target": {
				title: "QUnit Page for sap.ui.core.routing.Target (sync)",
				sinon: {
					version: 4, // Note: test manages clock on its own to allow use of sinon-4 and new bridge
					useFakeTimers:true
				}
			},
			/**
			 * @deprecated Since 1.90
			 */
			"sync/Targets": {
				title: "QUnit Page for sap.ui.core.routing.Targets (sync)",
				sinon: {
					version: 4, // Note: test manages clock on its own to allow use of sinon-4 and new bridge
					useFakeTimers:true
				}
			},
			/**
			 * @deprecated Since 1.90
			 */
			"sync/Views": {
				title: "QUnit Page for sap.ui.core.routing.Views (sync)"
			},
			HashChanger: {
				title: "QUnit Page for sap.ui.core.navigation.HashChanger"
			},
			History: {
				title: "QUnit Page for sap.ui.core.navigation.History",
				loader: {
					paths: {
						"sap/ui/core/qunit/routing": "./"
					}
				},
				autostart: false // starts itself after async loading of HistoryQUnit.js
			},
			HistoryIFrameSync: {
				title: "QUnit Page for sap.ui.core.routing.History with hash synchronization between frames"
			},
			TargetCache: {
				title: "QUnit Page for sap.ui.core.routing.TargetCache"
			},
			HashChangerBase: {
				title: "QUnit Page for sap.ui.core.routing.HashChangerBase"
			},
			RouterHashChanger: {
				title: "QUnit Page for sap.ui.core.routing.RouterHashChanger"
			},
			Placeholder: {
				title: "QUnit Page for sap.ui.core.Placeholder",
				qunit: {
					reorder: false
				}
			},
			PlaceholderOptOut: {
				title: "QUnit Page for sap.ui.core.Placeholder - Opt-out via xx-Placeholder set to false",
				qunit: {
					reorder: false
				},
				ui5: {
					"xx-placeholder": false
				}
			}
		}
	};

});
