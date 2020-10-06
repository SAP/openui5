sap.ui.define(["sap/ui/Device"], function(Device) {

	"use strict";

	return {
		name: "Package 'sap.ui.core.routing'",
		defaults: {
			page: "test-resources/sap/ui/core/qunit/routing/RoutingTest.qunit.html?test={name}",
			loader: {
				paths: {
					"qunit/view": "./fixture",
					"test/routing/target": "./fixture",
					"testdata": "../testdata"
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
			"sync/Route": {
				title: "QUnit Page for sap.ui.core.routing.Route (sync)",
				sinon: {
					version: 4, // Note: test manages clock on its own to allow use of sinon-4 and new bridge
					useFakeTimers:true
				}
			},
			"sync/Router": {
				title: "QUnit Page for sap.ui.core.routing.Router (sync)",
				sinon: {
					version: 4, // Note: test manages clock on its own to allow use of sinon-4 and new bridge
					useFakeTimers:true
				}
			},
			"sync/Target": {
				title: "QUnit Page for sap.ui.core.routing.Target (sync)",
				sinon: {
					version: 4, // Note: test manages clock on its own to allow use of sinon-4 and new bridge
					useFakeTimers:true
				}
			},
			"sync/Targets": {
				title: "QUnit Page for sap.ui.core.routing.Targets (sync)",
				sinon: {
					version: 4, // Note: test manages clock on its own to allow use of sinon-4 and new bridge
					useFakeTimers:true
				}
			},
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
			TargetCache: {
				title: "QUnit Page for sap.ui.core.routing.TargetCache"
			},
			HashChangerBase: {
				title: "QUnit Page for sap.ui.core.routing.HashChangerBase"
			},
			RouterHashChanger: {
				title: "QUnit Page for sap.ui.core.routing.RouterHashChanger"
			}
		}
	};

});
