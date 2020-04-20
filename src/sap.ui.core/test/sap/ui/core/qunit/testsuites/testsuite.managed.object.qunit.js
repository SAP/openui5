sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Managed Object",
		defaults: {
			loader:{
				paths:{
					"testdata/core": "test-resources/sap/ui/core/qunit/"
				}
			},
			qunit: {
				version: 2
			},
			module: "testdata/core/{name}.qunit"
		},
		tests: {
			DuplicateIds: {
				title: "sap.ui.core: Duplicate ID checks"
			},
			DuplicateIds_noError: {
				title: "sap.ui.core: Duplicate ID checks (with errors disabled)",
				ui5: {
					noDuplicateIds: false
				}
			},
			ManagedObject: {
				title: "sap.ui.base.ManagedObject"
			},
			ManagedObject_forwardAggregation: {
				title: "sap.ui.base.ManagedObject (forward Aggregation)"
			},
			ManagedObject_isPropertyInitial: {
				title: "sap.ui.base.ManagedObject (is Property Initial)"
			},
			ManagedObjectObserver: {
				title: "sap.ui.base.ManagedObjectObserver"
			},
			ManagedObjectRegistry: {
				title: "sap.ui.base.ManagedObjectRegistry"
			},
			ManagedObjectMetadata: {
				title: "sap.ui.base.ManagedObjectMetadata",
				sinon: {
					version: 1, // bridge does not support nested modules
					qunitBridge: true
				}
			},
			ObjectMetadata: {
				title: "sap.ui.base.Object",
				module: "testdata/core/Object.qunit"
			}
		}
	};
});
