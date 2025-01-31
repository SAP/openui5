sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for BaseObject, ManagedObject and their Helpers",
		defaults: {
			loader:{
				paths:{
					"fixture": "test-resources/sap/ui/core/qunit/ui5classes/fixture/"
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			module: "./{name}.qunit"
		},
		tests: {
			AlternativeTypes: {
				title: "QUnit Page for AlternativeTypes",
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
				},
				ui5: {
					libs: "sap.ui.testlib"
				}
			},

			DataType: {
				coverage : {
					only : "sap/ui/base/DataType"
				},
				title: "QUnit Page for sap/ui/base/DataType"
			},

			ManagedObject: {
				title: "sap.ui.base.ManagedObject",
				ui5 : {
					language : "en-US"
				}
			},

			ManagedObject_BindingParser: {
				title: "sap.ui.base.ManagedObject (no core boot)",
				bootCore: false
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

			Object: {
				title: "sap.ui.base.Object"
			}
		}
	};
});
