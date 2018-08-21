sap.ui.define(function(require) {

	"use strict";

	return {
		name: "Package 'sap.ui.core.routing'",
		defaults: {
			page: "test-resources/sap/ui/core/qunit/routing/RoutingTest.qunit.html?test={name}",
			sinon: {
				version: 1,
				useFakeTimers: false
			},
			loader: {
				paths: {
					"qunit/view": "./fixture",
					"test/routing/target": "./fixture",
					"sap/ui/core/qunit/routing": "./"
				}
			}
		},
		tests: {
			"async/Route": {
				title: "QUnit Page for sap.ui.core.routing.Route (async)"
			},
			"async/Router": {
				title: "QUnit Page for sap.ui.core.routing.Router (async)"
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
			"sync/Route": {
				title: "QUnit Page for sap.ui.core.routing.Route (sync)",
				sinon: {
					useFakeTimers:true
				}
			},
			"sync/Router": {
				title: "QUnit Page for sap.ui.core.routing.Router (sync)",
				sinon: {
					useFakeTimers:true
				}
			},
			"sync/Target": {
				title: "QUnit Page for sap.ui.core.routing.Target (sync)",
				sinon: {
					useFakeTimers:true
				}
			},
			"sync/Targets": {
				title: "QUnit Page for sap.ui.core.routing.Targets (sync)",
				sinon: {
					useFakeTimers:true
				}
			},
			"sync/Views": {
				title: "QUnit Page for sap.ui.core.routing.Views (sync)"
			},
			"HashChanger": {
				title: "QUnit Page for sap.ui.core.navigation.HashChanger"
			},
			"History": {
				title: "QUnit Page for sap.ui.core.navigation.History",
				autostart: false // starts itself after async loading of HistoryQUnit.js
			},
			"TargetCache": {
				title: "QUnit Page for sap.ui.core.routing.TargetCache"
			}
		}
	};

});
