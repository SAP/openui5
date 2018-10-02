sap.ui.define(function() {

	"use strict";
	return {
		name: "QUnit TestSuite for sap.ui.ux3",
		defaults: {
			bootCore: true,
			ui5: {
				libs: "sap.ui.core,sap.ui.commons,sap.ui.ux3",
				theme: "sap_bluecrystal",
				noConflict: true,
				preload: "auto"
			},
			qunit: {
				version: 2,
				reorder: false
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			},
			module: "./{name}.qunit"
		},
		tests: {
			ActionBar: {
				title: "qunit Test for ActionBar",
				_alternativeTitle: "QUnit tests: sap.ui.ux3.ActionBar"
			},
			CollectionInspector: {
				title: "QUnit Page for sap.ui.ux3.CollectionInspector",
				_alternativeTitle: "QUnit Page for\n\t	sap.ui.ux3.CollectionInspector"
			},
			DataSet: {
				title: "QUnit Page for sap.ui.ux3.DataSet, sap.ui.ux3.DataSetItem +\nsap.ui.ux3.DataSetSimpleView",
				loader: {
					paths: {
						"dataset": "test-resources/sap/ui/ux3/resources/dataset"
					}
				}
			},
			DataSetPagination: {
				title: "QUnit Page for sap.ui.ux3.DataSet, sap.ui.ux3.DataSetItem + sap.ui.ux3.DataSetSimpleView",
				_alternativeTitle: "QUnit Page for sap.ui.ux3.DataSet in PaginationMode"
			},
			Exact: {
				title: "Exact - sap.ui.ux3",
				_alternativeTitle: "QUnit tests: sap.ui.ux3.Exact",
				ui5: {
					language: "en"
				}
			},
			ExactAttribute: {
				title: "ExactAttribute - sap.ui.ux3",
				_alternativeTitle: "QUnit tests: sap.ui.ux3.ExactAttribute",
				ui5: {
					language: "en"
				}
			},
			ExactBrowser: {
				title: "ExactBrowser - sap.ui.ux3",
				_alternativeTitle: "QUnit tests: sap.ui.ux3.ExactBrowser",
				ui5: {
					language: "en"
				}
			},
			FacetFilter: {
				title: "FacetFilter - sap.ui.ux3",
				_alternativeTitle: "QUnit tests: sap.ui.ux3.FacetFilter",
				ui5: {
					language: "en"
				}
			},
			Feed: {
				title: "qunit Test for Feed",
				_alternativeTitle: "QUnit tests: sap.ui.ux3.Feed"
			},
			FeedChunk: {
				title: "qunit Test for FeedChunk",
				_alternativeTitle: "QUnit tests: sap.ui.ux3.FeedChunk"
			},
			Feeder: {
				title: "qunit Test for Feeder",
				_alternativeTitle: "QUnit tests: sap.ui.ux3.Feeder"
			},
			NavigationBar: {
				title: "NavigationBar - sap.ui.ux3",
				_alternativeTitle: "QUnit Page for sap.ui.ux3.NavigationBar"
			},
			NavigationBar_swiping: {
				title: "NavigationBar swiping - sap.ui.ux3",
				_alternativeTitle: "QUnit Page for sap.ui.ux3.NavigationBar"
			},
			NotificationBar: {
				title: "NotificationBar - sap.ui.ux3",
				_alternativeTitle: "QUnit Page for sap.ui.ux3.NotificationBar"
			},
			Overlay: {
				title: "QUnit Page for sap.ui.ux3.Overlay"
			},
			OverlayContainer: {
				title: "QUnit Page for sap.ui.ux3.OverlayContainer"
			},
			OverlayDialog: {
				title: "QUnit Page for sap.ui.ux3.OverlayDialog"
			},
			QuickView: {
				title: "QUnit Test for QuickViewThing",
				_alternativeTitle: "QUnit tests: sap.ui.ux3.QuickViewThing"
			},
			Shell: {
				title: "QUnit Page for sap.ui.ux3.Shell"
			},
			ThingInspector: {
				title: "QUnit Page for sap.ui.ux3.ThingInspector"
			},
			ThingViewer: {
				title: "QUnit Page for sap.ui.ux3.ThingViewer",
				_alternativeTitle: "QUnit Page for sap.ui.ux3.ThingInspector"
			},
			ToolPopup: {
				title: "ToolPopup - sap.ui.ux3",
				_alternativeTitle: "QUnit Page for sap.ui.ux3.ToolPopup"
			}
		}
	};
});
