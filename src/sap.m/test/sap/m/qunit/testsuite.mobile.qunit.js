sap.ui.define([
	"sap/ui/Device",
	"sap/base/util/merge",
	"sap/base/Log"
], function(Device, merge, Log) {

	"use strict";
	var mConfig = {
		name: "QUnit TestSuite for sap.m",
		defaults: {
			bootCore: true,
			ui5: {
				libs: "sap.m",
				noConflict: true,
				preload: "auto",
				"xx-waitForTheme": "init"
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
			ActionListItem: {
				title: "Test Page for sap.m.ActionListItem"
			},

			ActionSheet: {
				title: "QUnit Page for sap.m.ActionSheet"
			},

			AdditionalTextButton: {
				title: "QUnit Page for sap.m.AdditionalTextButton",
				coverage: {
					only: ["sap/m/AdditionalTextButton"]
				}
			},

			App: {
				title: "QUnit Page for sap.m.App"
			},

			AppWithBackground: {
				title: "QUnit Page for sap.m.App with Background Images"
			},

			Avatar: {
				coverage: {
					only: ["sap/m/Avatar"]
				}
			},

			BadgeEnabler: {
				coverage: {
					only: ["sap/m/BadgeEnabler"]
				}
			},

			Bar: {
				title: "QUnit Page for sap.m.Bar",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					theme: "sap_horizon"
				}
			},

			"Bar (RTL)": {
				title: "QUnit Page for sap.m.Bar",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					rtl: true,
					theme: "sap_horizon"
				},
				module: "./Bar.qunit"
			},

			BarInPageEnabler: {
				title: "QUnit Page for sap.m.BarBase"
			},

			Breadcrumbs: {
				title: "QUnit Page for sap.m.Breadcrumbs",
				sinon: {
					useFakeTimers: true
				}
			},

			BusyDialog: {
				title: "QUnit page for sap.m.BusyDialog"
			},

			BusyIndicator: {
				title: "QUnit page for sap.m.BusyIndicator"
			},

			Button: {
				title: "Test Page for sap.m.Button",
				ui5: {
					language: "en"
				},
				sinon: {
					useFakeTimers: true
				}
			},

			CSSClassesFromParameters: {
				/*
				 * Page kept because of
				 *  - Non-trivial DOM content
				 */
				page: "test-resources/sap/m/qunit/CSSClassesFromParameters.qunit.html",
				title: "QUnit Page for Theme-dependent CSS Classes",
				ui5: {
					theme: "sap_horizon"
				}
			},

			Carousel: {
				title: "Test Page for sap.m.Carousel",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en"
				},
				coverage: {
					only: [
						"sap/m/Carousel",
						"sap/m/CarouselRenderer"
					]
				}
			},

			CheckBox: {
				title: "Test Page for sap.m.CheckBox",
				qunit: {
					version: "edge"
				},
				sinon: {
					version: "edge"
				},
				ui5: {
					language: "en-US"
				}
			},

			ColorPalette: {
				title: "ColorPalette - sap.m",
				sinon: {
					version: 1 // sinon-qunit-bridge does not supported nested modules
				},
				ui5: {
					language: "en-US",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			Column: {
				title: "Column - sap.m"
			},

			ColumnHeaderPopover: {
				title: "QUnit Page for sap.m.ColumnHeaderPopover",
				ui5: {
					language: "en-US"
				}
			},

			ColumnListItem: {
				title: "ColumnListItem - sap.m"
			},

			ColumnMergeDuplicates: {
				title: "QUnit Page for Column Merge Duplicates"
			},

			ComboBox: {
				title: "Test Page for sap.m.ComboBox",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				ui5: {
					libs: "sap.m, sap.ui.layout",
					language: "en"
				}
			},

			"opa/combobox/LoadItemsOPA": {
				title: "OPA Test Page for sap.m.ComboBox",
				ui5: {
					libs: "sap.m",
					language: "en"
				}
			},

			"opa/input/SuggestionRowsPopoverOPA": {
				title: "OPA Test Page for sap.m.Input with tabular suggestions",
				ui5: {
					libs: "sap.m",
					language: "en"
				}
			},

			ContentConfig: {
				title: "QUnit Test Page for sap.m.ContentConfig",
				coverage: {
					only: "//sap\/m\/ContentConfig.*/"
				},
				ui5: {
					language: "en"
				}
			},

			CustomTreeItem: {
				title: "QUnit Page for sap.m.CustomTreeItem",
				coverage: {
					branchTracking: true,
					only: "sap/m/CustomTreeItem"
				}
			},

			DateNavigation: {
				title: "Test page for sap.m.delegate.DateNavigation",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			DatePicker: {
				title: "DatePicker - sap.m",
				qunit: {
					// one test checks a module for not being loaded, another checks it for being loaded
					// -> order of tests is significant!
					reorder: false
				},
				ui5: {
					language: "en-US",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			DateRangeSelection: {
				title: "DateRangeSelection - sap.m",
				ui5: {
					language: "en-US",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			DateTimeField: {
				title: "DateTimeField - sap.m",
				ui5: {
					language: "en-US"
				},
				sinon: {
					version: 1 // sinon-qunit-bridge does not support nested modules
				}
			},

			DateTimePicker: {
				title: "DateTimePicker - sap.m",
				coverage: {
					only: ["sap/m/DateTimePicker"]
				},
				ui5: {
					language: "en-US",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			DateTimePickerOData: {
				title: "DateTimePickerOData - sap.m",
				coverage: {
					only: ["sap/m/DateTimePicker"]
				},
				ui5: {
					language: "en-US",
					libs: ["sap.m", "sap.ui.unified"]
				}
			},

			Dialog: {
				title: "QUnit Page for sap.m.Dialog",
				sinon: {
					version: 1, // test hangs with sinon 4
					useFakeTimers: true
				},
				ui5: {
					compatVersion: "1.16"
				}
			},

			DialogRTL: {
				title: "QUnit Page for sap.m.Dialog in RTL",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					rtl: true
				}
			},

			DisplayListItem: {
				title: "Test Page for sap.m.DisplayListItem"
			},

			DraftIndicator: {
				title: "Test Page for sap.m.DraftIndicator",
				sinon: {
					useFakeTimers: true
				}
			},

			DynamicDateRange: {
				title: "Test Page for sap.m.DynamicDateRange",
				ui5: {
					language: "en-US"
				},
				coverage: {
					only: "//sap\/m\/[\\w]*DynamicDate.*/"
				}
			},

			ExpandableText: {
				title: "QUnit Tests - sap.m.ExpandableText",
				sinon: {
					useFakeTimers: true
				},
				coverage: {
					only: "sap/m/ExpandableText"
				}
			},

			ExploredSamples1: {
				title: "Test Page for 'Explored' samples from sap.m",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					},
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				ui5: {
					libs: "sap.ui.layout,sap.m,sap.ui.documentation",
					"xx-componentPreload": "off",
					modulus: [0,4]
				},
				module: "./ExploredSamples.qunit",
				autostart: false
			},

			ExploredSamples2: {
				title: "Test Page for 'Explored' samples from sap.m",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					},
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				ui5: {
					libs: "sap.ui.layout,sap.m,sap.ui.documentation",
					"xx-componentPreload": "off",
					modulus: [1, 4]
				},
				module: "./ExploredSamples.qunit",
				autostart: false
			},

			ExploredSamples3: {
				title: "Test Page for 'Explored' samples from sap.m",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					},
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				ui5: {
					libs: "sap.ui.layout,sap.m,sap.ui.documentation",
					"xx-componentPreload": "off",
					modulus: [2, 4]
				},
				module: "./ExploredSamples.qunit",
				autostart: false
			},

			ExploredSamples4: {
				title: "Test Page for 'Explored' samples from sap.m",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					},
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				ui5: {
					libs: "sap.ui.layout,sap.m,sap.ui.documentation",
					"xx-componentPreload": "off",
					modulus: [3, 4]
				},
				module: "./ExploredSamples.qunit",
				autostart: false
			},

			FacetFilter: {
				title: "FacetFilter - sap.m",
				ui5: {
					language: "en_US"
				}
			},

			FacetFilter2: {
				title: "FacetFilter 2 - sap.m",
				ui5: {
					language: "en_US"
				}
			},

			FeedInput: {
				title: "Test Page for sap.m.FeedInput",
				coverage: {
					only: "//sap\/m\/FeedInput.*/"
				}
			},

			FeedListItem: {
				title: "Test Page for sap.m.FeedListItem",
				ui5: {
					language: "en-US"
				},
				coverage: {
					only: "//sap\/m\/FeedListItem.*/"
				}
			},

			FeedListItemAction: {
				title: "QUnit Test Page for sap.m.FeedListItemAction",
				ui5: {
					language: "en"
				}
			},

			Fiori20Adapter: {
				title: "QUnit Page for Fiori20Adapter",
				ui5: {
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			FlexBox: {
				title: "QUnit Page for FlexBox - sap.m"
			},

			FlexBoxFitContainerH: {
				title: "QUnit Page for sap.m.FlexBox with FitContainer set and outer HBox"
			},

			FlexBoxFitContainerV: {
				title: "QUnit Page for sap.m.FlexBox with FitContainer set and outer VBox"
			},

			FlexBoxFitPage: {
				title: "QUnit Page for sap.m.FlexBox with FitContainer set inside a Page"
			},

			FormattedText: {
				title: "QUnit test for the sap.m.FormattedText control",
				sinon: {
					useFakeTimers: true
				}
			},

			FormattedTextAnchorGenerator: {
				title: "QUnit test for the sap.m.FormattedTextAnchorGenerator"
			},

			GenericTag: {
				title: "QUnit Test Page for sap.m.GenericTag",
				coverage: {
					only: "//sap\/m\/GenericTag.*/"
				},
				ui5: {
					language: "en"
				},
				qunit: {
					version: 'edge'
				},
				sinon: {
					version: 'edge'
				}
			},

			GenericTile: {
				title: "QUnit Test Page for sap.m.GenericTile",
				coverage: {
					only: "//sap\/m\/GenericTile.*/"
				},
				ui5: {
					language: "en",
					theme: "sap_horizon"
				}
			},

			ActionTile: {
				title: "QUnit Test Page for sap.m.ActionTile",
				coverage: {
					only: "//sap\/m\/ActionTile.*/"
				},
				ui5: {
					language: "en"
				}
			},

			LinkTileContent: {
				title: "QUnit Test Page for sap.m.LinkTileContent",
				coverage: {
					only: "//sap\/m\/LinkTileContent.*/"
				},
				ui5: {
					language: "en"
				}
			},

			"Generic Testsuite": {
				page: "test-resources/sap/m/qunit/testsuite.generic.qunit.html"
			},

			GrowingEnablement: {
				title: "QUnit Page for sap.m.GrowingEnablement",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				}
			},

			GrowingEnablement_databinding: {
				title: "QUnit Page for sap.m.GrowingEnablement and databinding"
			},

			HBox: {
				title: "QUnit Page for sap.m.HBox"
			},

			HeaderContainer: {
				title: "QUnit: HeaderContainer - sap.m",
				coverage: {
					only: "//sap\/m\/HeaderContainer.*/"
				},
				ui5: {
					libs: "sap.m, sap.ui.layout"
				}
			},

			IconTabBar: {
				title: "QUnit Page for sap.m.IconTabBar",
				sinon: {
					useFakeTimers: true
				}
			},

			IconTabBarRTL: {
				title: "QUnit Page for sap.m.IconTabBarRtl",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					rtl: true
				}
			},

			IconTabHeader: {
				title: "QUnit Page for sap.m.IconTabHeader",
				sinon: {
					useFakeTimers: true
				}
			},

			IconTabBarSelectList: {
				title: "QUnit Page for sap.m.IconTabBarSelectList",
				sinon: {
					useFakeTimers: true
				}
			},

			IllustratedMessage: {
				coverage: {
					only: ["sap/m/IllustratedMessage"]
				}
			},

			Illustration: {
				coverage: {
					only: ["sap/m/Illustration"]
				}
			},

			IllustrationPool: {
				coverage: {
					only: ["sap/m/IllustrationPool"]
				}
			},

			Image: {
				title: "Image - sap.m - QUnit test"
			},

			ImageContent: {
				title: "sap.m.ImageContent",
				coverage: {
					only: "//sap\/m\/ImageContent.*/"
				},
				ui5: {
					language: "en"
				}
			},

			Input: {
				title: "QUnit page for sap.m.Input"
			},

			InputBase: {
				title: "QUnit tests: sap.m.InputBase"
			},

			"opa/input/InputTypeAheadOPA": {
				title: "OPA Test Page for sap.m.Input",
				ui5: {
					libs: "sap.m",
					language: "en"
				}
			},

			InstanceManager: {
				title: "QUnit Page for sap.m.InstanceManager"
			},

			Label: {
				title: "QUnit page for sap.m.Label"
			},

			LibraryGetScrollDelegate: {
				title: "QUnit test: sap.m.getScrollDelegate",
				loader: {
					paths: {
						"samples/scrollcomp": "test-resources/sap/m/qunit/scrollcomp"
					}
				},
				ui5: {
					language: "en"
				}
			},

			LightBox: {
				title: "QUnit Page for sap.m.LightBox"
			},

			LightBoxItem: {
				title: "QUnit Page for sap.m.LightBoxItem",
				sinon: {
					useFakeTimers: true
				}
			},

			LightBoxMemoryLeak: {
				title: "QUnit Page for sap.m.LightBox Memory Leaks",
				qunit: {
					version: 2 // MemoryLeakCheck loads QUnit 1
				}
			},

			Link: {
				title: "QUnit page for sap.ui.m.Link",
				ui5: {
					language: "en-US"
				}
			},

			List: {
				title: "QUnit Page for sap.m.List and all sap.m List Items",
				coverage: {
					only: "sap/m/List"
				}
			},

			ListBase: {
				title: "Test Page for sap.m.ListBase",
				ui5: {
					theme: "sap_horizon",
					language: "en-US",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			ListBaseBinding: {
				title: "QUnit Page for sap.m.ListBase Binding",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				}
			},

			MarginCssClasses: {
				title: "QUnit Page for sap.m Margin CSS Classes",
				loader: {
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				}
			},

			MaskInput: {
				title: "Test Page for sap.m.MaskInput",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en-US",
					bindingSyntax: "simple"
				}
			},

			MaskInputRule: {
				title: "Test Page for sap.m.MaskInputRule",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en-US"
				}
			},

			Menu: {
				title: "QUnit page for sap.m.Menu",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en-US",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			MenuItem: {
				title: "QUnit Page for sap.m.MenuItem",
				coverage: {
					only: ["sap/m/MenuItem"]
				},
				ui5: {
					language: "en-US",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			MenuButton: {
				title: "QUnit tests: sap.m.MenuButton",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			MessageBox: {
				title: "QUnit Page for MessageBox",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en-US"
				}
			},

			MessageItem: {
				title: "QUnit Page for sap.m.MessageItem"
			},

			MessagePopover: {
				title: "QUnit Page for sap.m.MessagePopover",
				ui5: {
					theme: "sap_horizon"
				}
			},

			MessageStrip: {
				title: "QUnit Page for sap.m.MessageStrip"
			},

			MessageToast: {
				title: "QUnit tests: sap.m.MessageToast"
			},

			MessageView: {
				title: "QUnit Page for sap.m.MessageView"
			},

			MultiComboBox: {
				title: "QUnit tests: sap.m.MultiComboBox",
				ui5: {
					theme: "sap_horizon"
				}
			},

			MultiInput: {
				title: "QUnit page for sap.m.MultiInput",
				ui5: {
					theme: "sap_horizon"
				}
			},

			NavContainer: {
				title: "QUnit Page for sap.m.NavContainer",
				ui5: {
					theme: "sap_horizon"
				}
			},

			NewsContent: {
				title: "sap.m.NewsContent",
				coverage: {
					only: "//sap\/m\/NewsContent.*/"
				},
				ui5: {
					language: "en"
				}
			},

			NotificationList: {
				title: "QUnit Page for sap.m.NotificationList"
			},

			NotificationListGroup: {
				title: "QUnit Page for sap.m.NotificationListGroup"
			},

			NotificationListItem: {
				title: "QUnit Page for sap.m.NotificationListItem",
				sinon: {
					useFakeTimers: true
				}
			},

			NumericContent: {
				title: "Test Page for sap.m.NumericContent",
				coverage: {
					only: "//sap\/m\/NumericContent.*/"
				},
				ui5: {
					libs: "sap.ui.core,sap.m",
					language: "en"
				}
			},

			ObjectAttribute: {
				title: "ObjectAttribute - sap.m"
			},

			ObjectHeader: {
				title: "ObjectHeader - sap.m"
			},

			ObjectHeaderResponsive: {
				title: "QUnit Page for sap.m.ObjectHeader in Responsive mode"
			},

			ObjectIdentifier: {
				title: "ObjectIdentifier - sap.m",
				sinon: {
					useFakeTimers: true
				}
			},

			ObjectListItem: {
				title: "ObjectListItem - sap.m"
			},

			ObjectMarker: {
				title: "Test Page for sap.m.ObjectMarker",
				ui5: {
					language: "en-US"
				}
			},

			ObjectNumber: {
				title: "ObjectNumber - sap.m"
			},

			ObjectStatus: {
				title: "ObjectStatus - sap.m"
			},

			OverflowToolbar: {
				title: "Test Page for sap.m.OverflowToolbar",
				ui5: {
					libs: "sap.m,sap.ui.unified"
				},
				sinon: {
					version: 1, // one test fails with sinon-4 fakeTimer
					useFakeTimers: true
				},
				qunit: {
					version: "edge"
				}
			},

			OverflowToolbarButton: {
				title: "Test Page for sap.m.OverflowToolbarButton"
			},

			OverflowToolbarMenuButton: {
				title: "Test Page for sap.m.OverflowToolbarMenuButton"
			},

			P13nConditionPanel: {
				title: "Test Page for sap.m.P13nConditionPanel",
				ui5: {
					language: "en", // one test depends on locale specific date formatting
					libs: ["sap.m", "sap.ui.layout", "sap.ui.unified"] // to compensate 2 sync loadLibrary
				}
			},

			"p13n.AbstractContainer": {
				title: "Test Page for sap.m.p13n.AbstractContainer",
				module: "test-resources/sap/m/qunit/p13n/AbstractContainer.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.Container": {
				title: "Test Page for sap.m.p13n.Container",
				module: "test-resources/sap/m/qunit/p13n/Container.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.UIManager": {
				title: "Test Page for sap.m.p13n.UIManager",
				module: "test-resources/sap/m/qunit/p13n/UIManager.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.modules.StateHandlerRegistry": {
				title: "Test Page for sap.m.p13n.modules.StateHandlerRegistry",
				module: "test-resources/sap/m/qunit/p13n/StateHandlerRegistry.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.modules.DefaultProviderRegistry": {
				title: "Test Page for sap.m.p13n.modules.DefaultProviderRegistry",
				module: "test-resources/sap/m/qunit/p13n/DefaultProviderRegistry.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.modification.FlexModificationHandler": {
				title: "Test Page for sap.m.p13n.modification.FlexModificationHandler",
				module: "test-resources/sap/m/qunit/p13n/FlexModificationHandler.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.modification.LocalStorageModificationHandler": {
				title: "Test Page for sap.m.p13n.modification.LocalStorageModificationHandler",
				module: "test-resources/sap/m/qunit/p13n/LocalStorageModificationHandler.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.modules.xConfigAPI": {
				title: "Test Page for sap.m.p13n.modules.xConfigAPI",
				module: "test-resources/sap/m/qunit/p13n/xConfigAPI.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.handler.xConfigHandler": {
				title: "Test Page for sap.m.p13n.handler.xConfigHandler",
				module: "test-resources/sap/m/qunit/p13n/handler/xConfigHandler.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n/handler"
					}
				}
			},

			"p13n.modules.PersistenceProvider": {
				title: "Test Page for sap.m.p13n.modules.PersistenceProvider",
				module: "test-resources/sap/m/qunit/p13n/PersistenceProvider.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.BasePanel": {
				title: "Test Page for sap.m.p13n.BasePanel",
				module: "test-resources/sap/m/qunit/p13n/BasePanel.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.QueryPanel": {
				title: "Test Page for sap.m.p13n.QueryPanel",
				module: "test-resources/sap/m/qunit/p13n/QueryPanel.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.Engine": {
				title: "Test Page for sap.m.p13n.Engine",
				module: "test-resources/sap/m/qunit/p13n/Engine.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				},
				ui5: {
					language: "en-US",
					libs: ["sap.m", "sap.ui.mdc"]
				}
			},

			"p13n.SelectionController": {
				title: "Test Page for sap.m.p13n.SelectionController",
				module: "test-resources/sap/m/qunit/p13n/SelectionController.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				},
				ui5: {
					language: "en-US"
				}
			},

			"p13n.FilterController": {
				title: "Test Page for sap.m.p13n.FilterController",
				module: "test-resources/sap/m/qunit/p13n/FilterController.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.SortController": {
				title: "Test Page for sap.m.p13n.SortController",
				module: "test-resources/sap/m/qunit/p13n/SortController.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.GroupController": {
				title: "Test Page for sap.m.p13n.GroupController",
				module: "test-resources/sap/m/qunit/p13n/GroupController.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.SelectionPanel": {
				title: "Test Page for sap.m.p13n.SelectionPanel",
				module: "test-resources/sap/m/qunit/p13n/SelectionPanel.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.FilterPanel": {
				title: "Test Page for sap.m.p13n.FilterPanel",
				module: "test-resources/sap/m/qunit/p13n/FilterPanel.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.SortPanel": {
				title: "Test Page for sap.m.p13n.SortPanel",
				module: "test-resources/sap/m/qunit/p13n/SortPanel.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.GroupPanel": {
				title: "Test Page for sap.m.p13n.GroupPanel",
				module: "test-resources/sap/m/qunit/p13n/GroupPanel.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				}
			},

			"p13n.Popup": {
				title: "Test Page for sap.m.p13n.Popup",
				module: "test-resources/sap/m/qunit/p13n/Popup.qunit",
				loader: {
					paths: {
						resourceroot: "test-resources/sap/m/qunit/p13n"
					}
				},
				ui5: {
					language: "en-US"
				}
			},

			"p13n.MessageStrip": {
				title: "Test Page for sap.m.p13n.MessageStrip",
				module: "test-resources/sap/m/qunit/p13n/MessageStrip.qunit"
			},

			"p13n.Smoke": {
				title: "Test Page for sap.m.p13n Demokit samples",
				page: "test-resources/sap/m/qunit/p13n/smoke/testsuite.qunit.html"
			},

			P13nFilterPanel: {
				title: "Test Page for sap.m.P13nFilterPanel",
				ui5: {
					libs: ["sap.m", "sap.ui.layout", "sap.ui.unified"] // to compensate 2 sync loadLibrary
				}
			},

			P13nSelectionPanel: {
				title: "Test Page for sap.m.P13nSelectionPanel",
				sinon: {
					useFakeTimers: false
				}
			},

			P13nOperationsHelper: {
				title: "Test Page for sap.m.P13nOperationsHelper"
			},

			PDFViewer: {
				title: "PdfViewer - sap.m",
				coverage: {
					only: "//sap\/m\/PDF.*/"
				}
			},

			Page: {
				title: "QUnit Page for sap.m.Page (part 1)"
			},

			Page_part2: {
				title: "QUnit Page for sap.m.Page (part 2)"
			},

			PageResponsivePaddingsEnablement: {
				title: "QUnit Page for responsive paddings in sap.m.Page"
			},

			PagingButton: {
				title: "QUnit Page for sap.m.PagingButton"
			},

			Panel: {
				title: "QUnit page for sap.m.Panel"
			},

			PlanningCalendar: {
				title: "PlanningCalendar - sap.m",
				ui5: {
					libs: "sap.m, sap.ui.unified",
					language: "en_GB"
				}
			},

			PlanningCalendar2: {
				title: "PlanningCalendar 2 - sap.m",
				ui5: {
					libs: "sap.m, sap.ui.unified",
					language: "en_GB"
				}
			},

			PlanningCalendarIslamic: {
				title: "PlanningCalendar Islamic - sap.m",
				ui5: {
					libs: "sap.m, sap.ui.unified",
					language: "en_GB"
				}
			},

			PlanningCalendarHeader: {
				title: "PlanningCalendarHeader - sap.m",
				ui5: {
					libs: "sap.m, sap.ui.unified"
				}
			},

			PlanningCalendarLegend: {
				title: "PlanningCalendarLegend - sap.m",
				ui5: {
					libs: "sap.m, sap.ui.unified",
					language: "en"
				}
			},

			Popover: {
				title: "QUnit Page for sap.m.Popover"
			},

			ProgressIndicator: {
				title: "QUnit ProgressIndicator",
				sinon: {
					useFakeTimers: true
				}
			},

			PullToRefresh_desktop: {
				title: "Test Page for sap.m.PullToRefresh on Desktop"
			},

			QUnitCompositesUsingIFrames: {
				/*
				 * Page kept because of
				 *  - unhandled script
				 */
				page: "test-resources/sap/m/qunit/QUnitCompositesUsingIFrames.qunit.html"
			},

			QuickView: {
				title: "QUnit page for sap.m.QuickView",
				sinon: {
					useFakeTimers: true
				}
			},

			QuickViewCard: {
				title: "QUnit page for sap.m.QuickViewCard",
				sinon: {
					useFakeTimers: true
				}
			},

			QuickViewPage: {
				title: "QUnit page for sap.m.QuickViewPage",
				sinon: {
					useFakeTimers: true
				},
				coverage: {
					only: [ "sap/m/QuickViewPage" ]
				}
			},

			RadioButton: {
				title: "RadioButton - sap.m - QUnit test",
				sinon: {
					useFakeTimers: true
				}
			},

			RadioButtonGroup: {
				title: "RadioButton - sap.m - QUnit test",
				sinon: {
					useFakeTimers: true
				},
				coverage: {
					only: [
						"sap/m/RadioButtonGroup",
						"sap/m/RadioButtonGroupRenderer"
					]
				}
			},

			RangeSlider: {
				title: "QUnit Page for sap.m.RangeSlider",
				ui5: {
					language: "en-US"
				}
			},

			RatingIndicator: {
				title: "Test Page for sap.m.RatingIndicator",
				ui5: {
					theme: "sap_horizon"
				}
			},

			ResponsiveMarginCssClasses: {
				/*
				 * Note: this test is executed multiple times by the QUnitCompositesUsingIFrames test
				 *       with varying iframe sizes (width / height).
				 *       It is listed here to benefit from the async behavior of the test starter,
				 *       but it shall not be executed directly by the mobile testsuite.
				 *       Therefore setting 'skip' to true.
				 */
				skip: true,
				title: "QUnit Page for sap.m Margin CSS Classes",
				loader: {
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				ui5: {
					libs: ["sap.ui.layout", "sap.ui.unified", "sap.m"]
				}
			},

			ResponsivePopover: {
				title: "QUnit Page for sap.m.ResponsivePopover"
			},

			ResponsiveScale: {
				title: "Test page for sap.m.ResponsiveScale"
			},

			Rule: {
				title: "QUnit Page for Support Assistant Rules",
				ui5: {
					libs: ["sap.m", "sap.ui.support", "sap.ui.unified"],  // to compensate sync loadLibrary
					support: "silent",
					// TO BE FIXED: support lib fails when waiting for Core#init
					"xx-waitForTheme": true
				},
				module: [
					"./rules/Button.qunit",
					"./rules/DatePicker.qunit",
					"./rules/DateRangeSelection.qunit",
					"./rules/Dialog.qunit",
					"./rules/FacetFilter.qunit",
					"./rules/IconTabBar.qunit",
					"./rules/Input.qunit",
					"./rules/MaskInput.qunit",
					"./rules/ObjectHeader.qunit",
					"./rules/ObjectListItem.qunit",
					"./rules/ObjectMarker.qunit",
					"./rules/ObjectStatus.qunit",
					"./rules/StepInput.qunit",
					"./rules/Title.qunit",
					"./rules/ViewSettingsDialog.qunit"
				]
			},

			ScrollBar: {
				title: "QUnit Page for sap.m.ScrollBar"
			},

			ScrollContainer: {
				title: "QUnit Page for sap.m.ScrollContainer"
			},

			ScrollPosition: {
				title: "QUnit Page for Scroll Positions"
			},

			SearchField: {
				title: "Test Page for sap.m.SearchField"
			},

			SearchField_suggestions: {
				title: "Test Page for sap.m.SearchField with suggestions",
				sinon: {
					useFakeTimers: true
				}
			},

			SegmentedButton: {
				title: "Segmented - sap.m - QUnit test",
				sinon: {
					useFakeTimers: true
				}
			},

			Select: {
				title: "Test Page for sap.m.Select",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en"
				}
			},

			Select2: {
				title: "Separate test page for sap.m.Select"
			},

			SelectDialog: {
				title: "QUnit Page for sap.m.SelectDialog",
				sinon: {
					useFakeTimers: true
				}
			},

			SelectDialogOData: {
				title: "QUnit Page for sap.m.SelectDialog"
			},

			SelectList: {
				title: "Test Page for sap.m.SelectList",
				sinon: {
					useFakeTimers: true
				}
			},

			SelectionDetails: {
				title: "Test Page for sap.m.SelectionDetails",
				coverage: {
					only: "[sap/m/SelectionDetailsItem.js,sap/m/SelectionDetailsListItemRenderer.js]"
				},
				ui5: {
					language: "en"
				}
			},

			SelectionDetailsItem: {
				title: "QUnit Test Page for sap.m.SelectionDetailsItem",
				coverage: {
					only: "[sap/m/SelectionDetailsItem.js,sap/m/SelectionDetailsListItemRenderer.js]"
				},
				ui5: {
					language: "en"
				}
			},

			SelectionDetailsItemLine: {
				title: "QUnit Test Page for sap.m.SelectionDetailsItemLine",
				sinon: {
					useFakeTimers: true
				},
				coverage: {
					only: "sap/m/SelectionDetailsItemLine.js"
				},
				ui5: {
					language: "en"
				}
			},

			Shell: {
				title: "QUnit Page for sap.m.Shell"
			},

			SimpleFixFlex: {
				title: "Test Page for sap.m.SimpleFixFlex"
			},

			SinglePlanningCalendar: {
				title: "QUnit Page for sap.m.SinglePlanningCalendar",
				ui5: {
					language: "en",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			SinglePlanningCalendarGrid: {
				title: "QUnit Page for sap.m.SinglePlanningCalendarGrid",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			SinglePlanningCalendarMonthGrid: {
				title: "QUnit Page for sap.m.SinglePlanningCalendarMonthGrid",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en_GB",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			SlideTile: {
				title: "Test Page for sap.m.SlideTile",
				coverage: {
					only: "//sap\/m\/SlideTile.*/"
				},
				ui5: {
					language: "en"
				}
			},

			Slider: {
				title: "Test page for sap.m.Slider",
				ui5: {
					language: "en-US"
				}
			},

			SplitApp: {
				title: "QUnit Page for sap.m.SplitApp",
				ui5: {
					language: "en-US"
				}
			},

			SplitContainer: {
				title: "QUnit Page for sap.m.SplitContainer",
				ui5: {
					language: "en-US"
				}
			},

			StepInput: {
				title: "QUnit Page for sap.m.StepInput",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en-US"
				}
			},

			SuggestionsPopover: {
				title: "QUnit Page for sap.m.SuggestionsPopover",
				ui5: {
					compatVersion: "1.65"
				},
				coverage: {
					only: [
						"sap/m/SuggestionsPopover"
					]
				}
			},

			Support: {
				title: "QUnit Page for sap.m.Support",
				sinon: {
					useFakeTimers: true
				},
				coverage: {
					only: [
						"sap/m/Support"
					]
				}
			},

			Switch: {
				title: "Test Page for sap.m.Switch",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en-US"
				}
			},

			TabContainer: {
				title: "QUnit Page for sap.m.TabContainer",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en"
				}
			},

			TabStrip: {
				title: "QUnit Page for sap.m.TabStrip",
				sinon: {
					useFakeTimers: true
				},
				ui5: {
					language: "en-US"
				}
			},

			TabStripItem: {
				title: "QUnit Page for sap.m.TabStripItem",
				ui5: {
					language: "en-US"
				}
			},

			Table: {
				title: "QUnit Page for sap.m.Table",
				sinon: {
					version: 1 // custom handling of fakeTimer fails with sinon-4
				},
				coverage: {
					only: "sap/m/Table"
				},
				ui5: {
					language: "en"
				}
			},

			TableSelectDialog: {
				title: "QUnit Page for sap.m.TableSelectDialog",
				sinon: {
					version: 1, // custom handling of fakeTimer fails with sinon-4
					useFakeTimers: false // some tests activate it
				}
			},

			"table.ColumnWidthController": {
				title: "Test Page for sap.m.table.ColumnWidthController",
				module: "test-resources/sap/m/qunit/table/ColumnWidthController.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/"
				}
			},

			"table.columnmenu.Menu": {
				title: "Test Page for sap.m.table.columnmenu.Menu",
				module: "test-resources/sap/m/qunit/table/columnmenu/Menu.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.ActionItem": {
				title: "Test Page for sap.m.table.columnmenu.ActionItem",
				module: "test-resources/sap/m/qunit/table/columnmenu/ActionItem.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.Entry": {
				title: "Test Page for sap.m.table.columnmenu.Entry",
				module: "test-resources/sap/m/qunit/table/columnmenu/Entry.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.Item": {
				title: "Test Page for sap.m.table.columnmenu.Item",
				module: "test-resources/sap/m/qunit/table/columnmenu/Item.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.ItemBase": {
				title: "Test Page for sap.m.table.columnmenu.ItemBase",
				module: "test-resources/sap/m/qunit/table/columnmenu/ItemBase.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.ItemContainer": {
				title: "Test Page for sap.m.table.columnmenu.ItemContainer",
				module: "test-resources/sap/m/qunit/table/columnmenu/ItemContainer.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.QuickAction": {
				title: "Test Page for sap.m.table.columnmenu.QuickAction",
				module: "test-resources/sap/m/qunit/table/columnmenu/QuickAction.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.QuickActionBase": {
				title: "Test Page for sap.m.table.columnmenu.QuickActionBase",
				module: "test-resources/sap/m/qunit/table/columnmenu/QuickActionBase.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.QuickActionContainer": {
				title: "Test Page for sap.m.table.columnmenu.QuickActionContainer",
				module: "test-resources/sap/m/qunit/table/columnmenu/QuickActionContainer.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.QuickSort": {
				title: "Test Page for sap.m.table.columnmenu.QuickSort",
				module: "test-resources/sap/m/qunit/table/columnmenu/QuickSort.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.QuickGroup": {
				title: "Test Page for sap.m.table.columnmenu.QuickGroup",
				module: "test-resources/sap/m/qunit/table/columnmenu/QuickGroup.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			"table.columnmenu.QuickTotal": {
				title: "Test Page for sap.m.table.columnmenu.QuickTotal",
				module: "test-resources/sap/m/qunit/table/columnmenu/QuickTotal.qunit",
				paths: {
					resourceroot: "test-resources/sap/m/qunit/table/columnmenu"
				}
			},

			Text: {
				title: "QUnit Tests - sap.m.Text"
			},

			TextArea: {
				title: "Test Page for sap.m.TextArea"
			},

			TileContent: {
				title: "Test Page for sap.m.TileContent",
				coverage: {
					only: "//sap\/m\/TileContent.*/"
				}
			},

			TimePicker: {
				title: "Test Page for sap.m.TimePicker",
				ui5: {
					language: "en-US",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				}
			},

			TimePickerSliders: {
				title: "QUnit page for sap.m.TimePickerSliders"
			},

			TimePickerClocks: {
				title: "QUnit page for sap.m.TimePickerClocks"
			},

			TimePickerInputs: {
				title: "QUnit page for sap.m.TimePickerInputs"
			},

			TimePicker_Locale_bg_BG: {
				title: "Test Page for sap.m.TimePicker in Locale bg_BG",
				ui5: {
					language: "bg_BG"
				}
			},

			Title: {
				title: "QUnit Page for sap.m.Title",
				ui5: {
					language: "en"
				}
			},

			TitlePropagationSupport: {
				title: "QUnit Page for sap.m.TitlePropagationSupport"
			},

			ToggleButton: {
				title: "Test Page for sap.m.ToggleButton"
			},

			Token: {
				title: "Test Page for sap.m.Token"
			},

			Tokenizer: {
				title: "Test Page for sap.m.Tokenizer"
			},

			Toolbar: {
				title: "Test Page for sap.m.Toolbar",
				sinon: {
					version: 'edge'
				},
				qunit: {
					version: "edge"
				}
			},

			ToolbarSeparator: {
				title: "Test Page for sap.m.ToolbarSeparator",
				qunit: {
					version: 'edge'
				},
				sinon: {
					version: 'edge'
				}
			},

			ToolbarSpacer: {
				title: "Test Page for sap.m.ToolbarSpacer"
			},

			Tree: {
				title: "QUnit Page for sap.m.Tree"
			},

			Treeodata: {
				title: "QUnit Page for sap.m.Tree - odata",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				coverage: {
					branchTracking: true,
					only: "sap/ui/core/util"
				}
			},

			UploadSet: {
				title: "Test Page for sap.m.upload.UploadSet",
				coverage: {
					only: "[sap/m/upload/UploadSet.js,sap/m/upload/UploadSetItem.js,sap/m/upload/UploadSetRenderer.js,sap/m/upload/Uploader.js]"
				},
				ui5: {
					language: "en",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				},
				module: [
					"./upload/UploadSet.qunit",
					"./upload/UploadSetItem.qunit",
					"./upload/UploadSetRestrictions.qunit",
					"./upload/UploadSetToolbar.qunit",
					"./upload/UploadSetOpenFileDialog.qunit"
				]
			},

			UploadSetwithTable: {
				title: "Test Page for sap.m.upload.UploadSetwithTable",
				coverage: {
					only: "[sap/m/upload/UploadSetwithTable.js,sap/m/upload/UploadSetwithTableItem.js,sap/m/upload/FilePreviewDialog.js,sap/m/upload/UploadSetwithTableRenderer.js,sap/m/upload/UploadSetwithTableItemRenderer.js]"
				},
				ui5: {
					language: "en",
					libs: ["sap.m", "sap.ui.unified"] // to compensate sync loadLibrary
				},
				module: [
					"./upload/UploadSetwithTable.qunit",
					"./upload/UploadSetwithTableItem.qunit",
					"./upload/FilePreviewDialog.qunit"
				]
			},

			VBox: {
				title: "QUnit Page for sap.m.VBox"
			},

			ValueCSSColor: {
				title: "Test Page for sap.m.ValueCSSColor",
				ui5: {
					language: "en"
				}
			},

			ValueStateMessage: {
				title: "Test page for sap.m.delegate.ValueStateMessage",
				sinon: {
					useFakeTimers: true
				}
			},

			VariantManagement: {
				title: "Test Page for sap.m.VariantManagement",
				coverage: {
					only: ["sap/m/VariantManagement"]
				},
				ui5: {
					language: "en-US"
				}
			},

			ViewSettingsDialog: {
				title: "QUnit Page for sap.m.ViewSettingsDialog"
			},

			ViewSettingsDialogCustomTabs: {
				title: "QUnit Page for sap.m.ViewSettingsDialog (w/ Custom Tabs)"
			},

			WheelSlider: {
				title: "QUnit Page for sap.m.WheelSlider",
				ui5: {
					language: "en_US"
				},
				sinon: {
					useFakeTimers: true
				},
				coverage: {
					only: [
						"sap/m/WheelSlider",
						"sap/m/WheelSliderRenderer"
					]
				}
			},

			WheelSliderContainer: {
				title: "QUnit Page for sap.m.WheelSliderContainer",
				ui5: {
					language: "en_US"
				},
				coverage: {
					only: [
						"sap/m/WheelSliderContainer",
						"sap/m/WheelSliderContainerRenderer"
					]
				}
			},

			Wizard: {
				title: "QUnit Page for sap.m.Wizard"
			},

			WizardIntegrationOpa: {
				title: "Opa test Page for sap.m.Wizard",
				module: [
					"./WizardIntegration.opa.qunit"
				]
			},

			WizardProgressNavigator: {
				title: "QUnit Page for sap.m.WizardProgressNavigator",
				ui5: {
					language: "en"
				}
			},

			// --- refactoring stopped here (FWE) ---

			WizardStep: {
				title: "QUnit Page for sap.m.WizardStep",
				qunit: {
					version: 2
				}
			},

			"changeHandler/MoveTableColumns": {
				title: "QUnit - sap.m.changeHandler.MoveTableColumns",
				ui5: {
					libs: ["sap.m","sap.ui.fl"]
				}
			},

			"colorpalette/test/integration/opaTest": {
				/*
				 * Page kept because of
				 *  - non-trivial inline script
				 *  - Script Include of QUnitUtils
				 */
				page: "test-resources/sap/m/qunit/colorpalette/test/integration/opaTest.qunit.html",
				title: "Opa tests for sap.m.ColorPalettePopover",
				loader: {
					paths: {
						"cp/opa/test/app": "test-resources/sap/m/qunit/colorpalette/",
						"cp/opa/test/env": "test-resources/sap/m/qunit/colorpalette/test/"
					}
				}
			},

			"colorpalette/test/integration/opaTest2": {
				/*
				 * Page kept because of
				 *  - non-trivial inline script
				 *  - Script Include of QUnitUtils
				 */
				page: "test-resources/sap/m/qunit/colorpalette/test/integration/opaTest2.qunit.html",
				title: "Opa tests for sap.m.ColorPalettePopover",
				loader: {
					paths: {
						"cp/opa/test/app": "test-resources/sap/m/qunit/colorpalette/",
						"cp/opa/test/env": "test-resources/sap/m/qunit/colorpalette/test/"
					}
				}
			},

			"designtime/semantic/DetailPage": {
				title: "QUnit Page for sap.m.semantic.DetailPage design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				sinon: false,
				skip : true,
				group: "Designtime"
			},

			"designtime/ActionSheet": {
				title: "QUnit Page for sap.m.ActionSheet design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Avatar": {
				title: "QUnit Page for sap.m.Avatar design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Bar": {
				title: "QUnit Page for sap.m.Bar design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},

			"designtime/Button": {
				title: "QUnit Page for sap.m.Button design time",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},

			"designtime/CheckBox": {
				title: "QUnit Page for sap.m.CheckBox design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime",
				module: [
					"test-resources/sap/m/qunit/designtime/RatingIndicator.qunit"
				]
			},

			"designtime/CustomListItem": {
				title: "QUnit Page for sap.m.CustomListItem design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				sinon: false,
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},

			"designtime/DatePicker": {
				title: "QUnit Page for sap.m.DatePicker design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/FlexBox": {
				title: "QUnit Page for sap.m.FlexBox design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/IconTabBar": {
				title: "QUnit IconTabBar for sap.m.IconTabBar design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},

			"designtime/IconTabFilter": {
				title: "QUnit IconTabFilter for sap.m.IconTabFilter design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},

			"designtime/Image": {
				title: "QUnit Page for sap.m.Image design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/InputBase": {
				title: "QUnit Page for sap.m.InputBase design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/InputListItem": {
				title: "QUnit Page for sap.m.InputListItem design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Label": {
				title: "QUnit Page for sap.m.Label design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Library": {
				title: "QUnit Page for designtime consistency check of sap.m library",
				sinon: false,
				group: "Designtime"
			},

			"designtime/Link": {
				title: "QUnit Page for sap.m.Link design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/ListBase": {
				title: "QUnit Page for sap.m.ListBase design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/ListItemBase": {
				title: "QUnit Page for sap.m.ListItemBase design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/MenuButton": {
				title: "QUnit Page for sap.m.MenuButton design time and rta enabling",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/ObjectListItem": {
				title: "QUnit Page for sap.m.ObjectListItem design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				skip: true,
				group: "Designtime"
			},

			"designtime/OverflowToolbar": {
				title: "QUnit Page for sap.m.OverflowToolbar design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/OverflowToolbarButton": {
				title: "QUnit Page for sap.m.OverflowToolbarButton design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Page": {
				title: "QUnit Page for sap.m.Page design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},

			"designtime/Panel": {
				title: "QUnit Page for sap.m.Panel design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Popover": {
				title: "QUnit Page for sap.m.Popover design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/RadioButton": {
				title: "QUnit Page for sap.m.RadioButton design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/RatingIndicator": {
				title: "QUnit Page for sap.m.RatingIndicator design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/ScrollContainer": {
				title: "QUnit Page for sap.m.ScrollContainer design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/SearchField": {
				title: "QUnit Page for sap.m.SearchField design time and rta enabling",
				ui5: {
					libs: ["sap.m", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Select": {
				title: "QUnit Page for sap.m.Select design time",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Slider": {
				title: "QUnit Page for sap.m.Slider design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/SplitContainer": {
				title: "QUnit Page for sap.m.SplitContainer design time",
				ui5: {
					libs: "sap.m,sap.ui.dt"
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/StandardListItem": {
				title: "QUnit Page for sap.m.StandardListItem design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Table": {
				title: "QUnit Page for sap.m.Table design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"],
					language: "en"
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Text": {
				title: "QUnit Page for sap.m.Text design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Title": {
				title: "QUnit Page for sap.m.Title design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},

			"designtime/Toolbar": {
				title: "QUnit Page for sap.m.Toolbar design time and rta enabling",
				ui5: {
					libs: ["sap.m","sap.ui.rta"]
				},
				sinon: false,
				loader: {
					paths: {
						dt: "test-resources/sap/m/qunit/designtime/"
					}
				},
				group: "Designtime"
			},

			"planningcalendar/test/integration/opaTest": {
				/*
				 * Page kept because of
				 *  - non-trivial inline script
				 */
				page: "test-resources/sap/m/qunit/planningcalendar/test/integration/opaTest.qunit.html",
				title: "Opa tests for PlanningCalendar",
				loader: {
					paths: {
						"sap/ui/demo/PlanningCalendar/test": "test-resources/sap/m/qunit/planningcalendar/test/"
					}
				}
			},

			"plugins/CellSelector": {
				title: "Test Page for sap.m.plugins.CellSelector",
				module: "test-resources/sap/m/qunit/plugins/CellSelector.qunit"
			},

			"plugins/opa/CellSelector/GridTable": {
				title: "Opa tests for CellSelector with GridTable",
				module: "test-resources/sap/m/qunit/plugins/opa/CellSelector/GridTable/test/CellSelectorOPA.qunit",
				ui5: {
					libs: ["sap.m", "sap.ui.table"],
					language: "en"
				}
			},

			"plugins/opa/CellSelector/ResponsiveTable": {
				title: "Opa tests for CellSelector with ResponsiveTable",
				module: "test-resources/sap/m/qunit/plugins/opa/CellSelector/ResponsiveTable/test/CellSelectorOPA.qunit",
				ui5: {
					libs: ["sap.m"],
					language: "en"
				}
			},

			"plugins/PluginBase": {
				title: "Test Page for sap.m.plugins.PluginBase"
			},

			"plugins/DataStateIndicator": {
				title: "Test Page for sap.m.plugins.DataStateIndicator"
			},

			"plugins/ColumnResizer": {
				title: "Test Page for sap.m.plugins.ColumnResizer"
			},

			"plugins/CopyProvider": {
				title: "Test Page for sap.m.plugins.CopyProvider",
				sinon: {
					version: 'edge'
				},
				ui5: {
					libs: ["sap.m", "sap.ui.table", "sap.ui.mdc"]
				},
				coverage: {
					only: ["sap/m/plugins/CopyProvider"]
				}
			},

			"plugins/ContextMenuSetting": {
				title: "Test Page for sap.m.plugins.ContextMenuSetting",
				ui5: {
					libs: ["sap.m", "sap.ui.table", "sap.ui.unified", "sap.ui.mdc"]
				},
				coverage: {
					only: ["sap/m/plugins/ContextMenuSetting"]
				}
			},

			"plugins/PasteProvider": {
				title: "Test Page for sap.m.plugins.PasteProvider",
				ui5: {
					language: "en-US"
				}
			},

			"plugins/UploadSetwithTable": {
				title: "Test Page for sap.m.plugins.UploadSetwithTable",
				ui5: {
					libs: ["sap.m", "sap.ui.table", "sap.ui.mdc"]
				},
				coverage: {
					only: ["sap/m/plugins/UploadSetwithTable"]
				},
				module: [
					"./plugins/UploadSetwithTable/UploadSetwithTable.qunit"
				]
			},

			"routing/async/Router": {
				title: "QUnit Page for sap.m.routing.Router",
				ui5: {
					resourceroots: {
						"m.test": "test-resources/sap/m/qunit/"
					}
				}
			},

			"routing/async/Targets": {
				title: "QUnit Page for sap.m.routing.Targets",
				ui5: {
					resourceroots: {
						"m.test": "test-resources/sap/m/qunit/"
					}
				}
			},

			"routing/common/TargetHandler": {
				title: "QUnit Page for sap.m.routing.TargetHandler",
				ui5: {
					resourceroots: {
						"m.test": "test-resources/sap/m/qunit/"
					}
				}
			},

			"semantic/Segment": {
				title: "Test Page for sap.m.semantic.Segment"
			},

			"semantic/SemanticButton": {
				title: "Test Page for sap.m.semantic.SemanticButton",
				sinon: {
					useFakeTimers: true
				}
			},

			"semantic/SemanticToggleButton": {
				title: "Test Page for sap.m.semantic.SemanticToggleButton"
			},

			"semantic/SemanticPage": {
				title: "Test Page for sap.m.SemanticPage"
			},

			"semantic/SemanticSelect": {
				title: "Test Page for sap.m.semantic.SemanticSelect"
			},

			"semantic/ShareMenu": {
				title: "Test Page for sap.m.semantic.ShareMenu"
			},

			"table/Util": {
				title: "Test Page for sap.m.table.Util",
				ui5: {
					language: "en-US",
					theme: "sap_horizon"
				}
			}
		}
	};

	var bCompAvailable = false;
	var oXhr = new XMLHttpRequest();
	oXhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			switch (this.status) {
				case 200:
				case 304:
					bCompAvailable = JSON.parse(this.responseText).libraries.some(function (mLibrary) {
						return mLibrary.name === 'sap.ui.comp';
					});
					break;
				default:
					Log.info("Sorry, can't find file with library versions ¯\\_(ツ)_/¯");
			}
		}
	};

	oXhr.open("GET", sap.ui.require.toUrl("sap-ui-version.json"), false);
	oXhr.send();

	if (bCompAvailable) {
		mConfig = merge({}, mConfig, {
			tests: {
				"changeHandler/AddTableColumn": {
					title: "QUnit - legacy addTableColumn changes in sap.m.changeHandler.AddTableColumn",
					ui5: {
						libs: ["sap.m","sap.ui.fl", "sap.ui.comp", "sap.ui.unified"], // to compensate sync loadLibrary
						language: "en"
					}
				}
			}
		});
	} else {
		Log.info("sap.ui.comp not available", "enabling tests are skipped, ensure sap.ui.comp from sapui5.runtime is loaded to execute them");
	}

	return mConfig;
});
