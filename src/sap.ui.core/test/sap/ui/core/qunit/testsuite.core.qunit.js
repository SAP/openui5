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
			}
		},
		tests: {
			"dom/activeElementFix": {
				title: "sap.ui.dom.activeElementFix"
			},
			AppCacheBuster: {
				title: "sap.ui.core.AppCacheBuster",
				page: "test-resources/sap/ui/core/qunit/AppCacheBuster.qunit.html",
				sinon: {
					version: 1
				}
			},
			baseuri: {
				title: "sap.ui.thirdparty.baseuri",
				bootCore: false
			},
			CacheManager: {
				title: "sap.ui.core.cache.CacheManager",
				sinon: {
					version: 1
				}
			},
			ContextMenuSupport: {
				title: "sap.ui.core.ContextMenuSupport"
			},
			ControlDefinition: {
				title: "ControlDefinition",
				ui5: {
					libs: "sap.m"
				},
				qunit: {
					reorder: false
				}
			},
			Core: {
				title: "sap.ui.core.Core",
				page: "test-resources/sap/ui/core/qunit/Core.qunit.html"
				/**
				 * Due to several tests (e.g. 'loadLibraries: multiple libraries (async, preloads are deactivated)') a separate HTML page is needed.
				 * The root cause is related to async loading behavior via script tags of the ui5 loader.
				 */
			},
			CoreLock: {
				title: "sap.ui.core.Core: Core unlocks unconditionally itself upon load/init",
				ui5: {
					libs: "sap.m"
				}
			},
			/**
			 * The tests for the preload files all share the same test configuration.
			 * There is only one HTML test page, which is opened with different URL parameters.
			 * The HTML test page then points to this general configuration.
			 */
			Core_libraryPreloadFiles: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=both",
				loader: {
					paths: {
						testlibs: "testdata/libraries/"
					}
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			Core_libraryPreloadFiles2: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=both,testlibs.scenario7.lib2:json,testlibs.scenario8.lib2:json,testlibs.scenario7.lib3:js,testlibs.scenario8.lib3:js"
			},
			Core_libraryPreloadFiles3: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=both,testlibs.scenario7.lib4:none,testlibs.scenario8.lib4:none,testlibs.scenario7.lib5:none,testlibs.scenario8.lib5:none"
			},
			Core_libraryPreloadFiles4: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=js"
			},
			Core_libraryPreloadFiles5: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=js,testlibs.scenario7.lib2:json,testlibs.scenario8.lib2:json,testlibs.scenario7.lib3:none,testlibs.scenario8.lib3:none"
			},
			Core_libraryPreloadFiles6: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=json"
			},
			Core_libraryPreloadFiles7: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=json,testlibs.scenario7.lib2:none,testlibs.scenario8.lib2:none,testlibs.scenario7.lib3:js,testlibs.scenario8.lib3:js"
			},
			Core_libraryPreloadFiles8: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=none"
			},
			Core_repeatedExecution: {
				title: "sap.ui.core.Core: Repeated execution",
				bootCore: false
			},
			CustomStyleClassSupport: {
				title: "sap.ui.core.Core: CustomStyleClassSupport",
				ui5: {
					libs: "sap.ui.testlib,sap.ui.legacy.testlib",
					theme: "sap_hcb"
				},
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/",
						"sap/ui/legacy/testlib": "test-resources/sap/ui/core/qunit/testdata/legacy-uilib/"
					}
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			CustomThemeFallback: {
				title: "sap.ui.core: Custom Theme Fallback",
				ui5: {
					theme: "customcss",
					themeRoots: {
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"legacy": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					}
				},
				sinon: {
					version: 1,
					qunitBridge: true,
					useFakeTimers: false
				}
			},
			Declarative: {
				title: "sap.ui.core.DeclarativeSupport",
				// we keep the HTML page here, because of the complex test fixture
				page: "test-resources/sap/ui/core/qunit/Declarative.qunit.html",
				ui5: {
					libs: "sap.ui.commons,sap.ui.ux3"
				},
				qunit: {
					version: 1 //global assert used
				}
			},
			DuplicateIds: {
				title: "sap.ui.core: Duplicate ID checks"
			},
			DuplicateIds_noError: {
				title: "sap.ui.core: Duplicate ID checks (with errors disabled)",
				ui5: {
					noDuplicateIds: false
				}
			},
			"Element": {
				title: "sap.ui.core: Element",
				module: [
					'testdata/core/Element_contextualSettings.qunit',
					'testdata/core/Element_data.qunit',
					'testdata/core/Element_delegates.qunit',
					'testdata/core/Element_dependents.qunit',
					'testdata/core/Element_focus.qunit',
					'testdata/core/Element_layoutData.qunit',
					'testdata/core/Element_metadata_selector.qunit',
					'testdata/core/Element_metadata_dnd.qunit',
					'testdata/core/Element_sourceInfo.qunit'
				]
			},
			Fragment: {
				title: "sap.ui.core.Fragment",
				ui5: {
					libs: "sap.ui.commons"
				},
				loader: {
					paths: {
						"testdata/fragments": "test-resources/sap/ui/core/qunit/testdata/fragments/",
						"my": "test-resources/sap/ui/core/qunit/fragment/"
					}
				},
				qunit: {
					version: 1,
					reorder: false
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			"IconPool-custom-theme": {
				title: "sap.ui.core.IconPool: Custom theme",
				ui5: {
					theme: "customcss",
					themeRoots: {
						"base": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					}
				},
				qunit: {
					version: 1,
					reorder: false
				}
			},
			IconPool: {
				title: "sap.ui.core.IconPool",
				ui5: {
					libs: "sap.ui.core,sap.m"
				},
				qunit: {
					version: 1,
					reorder: false
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			IntervalTrigger: {
				title: "sap.ui.core.IntervalTrigger"
			},
			JSON: {
				title: "sap.ui.core: JSON Native Support",
				ui5: {
					libs: "sap.ui.commons"
				}
			},
			LRUPersistentCache: {
				title: "sap.ui.core.cache.LRUPersistentCache",
				qunit: {
					reorder: false
				},
				sinon: {
					version: 1,
					qunitBridge: true
				},
				autostart: false
			},
			ManagedObject: {
				title: "sap.ui.base.ManagedObject",
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			ManagedObjectMetadata: {
				title: "sap.ui.base.ManagedObjectMetadata",
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			ManagedObjectObserver: {
				title: "sap.ui.base.ManagedObjectObserver"
			},
			ManagedObject_forwardAggregation: {
				title: "sap.ui.base.ManagedObject: forwardAggregation"
			},
			ManagedObject_isPropertyInitial: {
				title: "sap.ui.base.ManagedObject: isPropertyInitial"
			},
			Modularization: {
				title: "sap.ui.core: Modularization",
				qunit: {
					reorder: false
				},
				sinon: {
					version: 4,
					qunitBridge: false
				},
				module: [
					// sap/base/*
					"testdata/core/base/assert.qunit",
					"testdata/core/base/Log.qunit",

					// sap/base/i18n/*
					"testdata/core/base/i18n/ResourceBundle.qunit",

					// sap/base/security/*
					"testdata/core/base/security/encodeCSS.qunit",
					"testdata/core/base/security/encodeJS.qunit",
					"testdata/core/base/security/encodeURL.qunit",
					"testdata/core/base/security/encodeURLParameters.qunit",
					"testdata/core/base/security/encodeXML.qunit",
					"testdata/core/base/security/sanitizeHTML.qunit",
					"testdata/core/base/security/URLWhitelist.qunit",

					// sap/base/strings/*
					"testdata/core/base/strings/camelize.qunit",
					"testdata/core/base/strings/capitalize.qunit",
					"testdata/core/base/strings/escapeRegExp.qunit",
					"testdata/core/base/strings/formatMessage.qunit",
					"testdata/core/base/strings/hash.qunit",
					"testdata/core/base/strings/hyphenate.qunit",
					"testdata/core/base/strings/NormalizePolyfill.qunit",
					"testdata/core/base/strings/toHex.qunit",

					// sap/base/util/*
					"testdata/core/base/util/deepEqual.qunit",
					"testdata/core/base/util/each.qunit",
					"testdata/core/base/util/merge.qunit",
					"testdata/core/base/util/includes.qunit",
					"testdata/core/base/util/isPlainObject.qunit",
					"testdata/core/base/util/JSTokenizer.qunit",
					"testdata/core/base/util/defineLazyProperty.qunit",
					"testdata/core/base/util/LoaderExtensions.qunit",
					"testdata/core/base/util/now.qunit",
					"testdata/core/base/util/uid.qunit",
					"testdata/core/base/util/UriParameters.qunit",
					"testdata/core/base/util/values.qunit",
					"testdata/core/base/util/ObjectPath.qunit",
					"testdata/core/base/util/defineCoupledProperty.qunit",

					// sap/base/util/array/*
					"testdata/core/base/util/array/diff.qunit",
					"testdata/core/base/util/array/uniqueSort.qunit",

					// sap/ui/*
					"testdata/core/ui/Device.qunit",

					// sap/ui/base/*
					"testdata/core/ui/base/syncXHRFix.qunit",

					// sap/ui/dom/*
					"testdata/core/dom/getComputedStyleFix.qunit",
					"testdata/core/dom/includeScript.qunit",
					"testdata/core/dom/includeStylesheet.qunit",
					"testdata/core/dom/patch.qunit",

					// sap/ui/performance/trace/*
					// the Passport tests need to be executed first, as the Passport's module state
					// is influenced by the FESR, Interaction and XHRInterceptor tests
					"testdata/core/performance/trace/Passport.qunit",
					"testdata/core/performance/trace/FESR.qunit",
					"testdata/core/performance/trace/Interaction.qunit",

					// sap/ui/performance/*
					"testdata/core/performance/XHRInterceptor.qunit",

					// sap/ui/security/*
					"testdata/core/security/FrameOptions.qunit",

					// sap/ui/util/*
					"testdata/core/util/Mobile.qunit",
					"testdata/core/util/ActivityDetection.qunit",
					"testdata/core/util/Storage.qunit",
					"testdata/core/util/XMLHelper.qunit"
				]
			},
			Object: {
				title: "sap.ui.base.Object"
			},
			PlaceAt: {
				title: "sap.ui.core: Control.placeAt / Core.setRoot",
				ui5: {
					libs: "sap.ui.commons",
					language: "en"
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
			RenderManager: {
				page: "test-resources/sap/ui/core/qunit/RenderManager.qunit.html",
				title: "Test Page for RenderManager",
				qunit: {
					version: 1
				}
			},
			SinonJS: {
				title: "sap.ui.thirdparty.sinon: Support",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				qunit: {
					version: 1
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			StashedControlSupport: {
				title: "sap.ui.core.StashedControlSupport",
				ui5: {
					libs: "sap.ui.core, sap.m"
				},
				loader: {
					paths: {
						test: "test-resources/sap/ui/core/qunit/"
					}
				},
				qunit: {
					version: 1
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			ThemeCheck: {
				title: "sap.ui.core.ThemeCheck",
				ui5: {
					libs: "sap.ui.core,sap.ui.testlib",
					themeRoots: {
						"legacy": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					}
				},
				loader: {
					paths: {
							"sap/ui/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib/",
							"sap/ui/customthemefallback/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib-custom-theme-fallback/",
							"sap/ui/failingcssimport/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib-failing-css-import/"
					}
				},
				qunit: {
					reorder: false
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			ThemeParameters: {
				title: "sap.ui.core.theming.Parameters",
				ui5: {
					libs: "sap.ui.legacy.testlib",
					theme: "sap_hcb"
				},
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/",
						"sap/ui/legacy/testlib": "test-resources/sap/ui/core/qunit/testdata/legacy-uilib/"
					}
				},
				qunit: {
					reorder: false
				}
			},
			TooltipBase: {
				title: "sap.ui.core.TooltipBase",
				ui5: {
					libs: "sap.ui.commons, sap.m"
				}
			},
			UIArea: {
				title: "sap.ui.core.UIArea",
				ui5: {
					libs: "sap.ui.testlib"
				},
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
				}
			},
			Hyphenation: {
				title: "sap.ui.core.hyphenation.Hyphenation"
			},

			"jquery.sap.global-config": {
				title: "jquery.sap.global: External configuration",
				beforeBootstrap: "./jquery.sap.global-config_beforeBootstrap.qunit"
			},
			"jquery.sap.global": {
				title: "jQuery.sap.global",
				ui5: {
					libs: "sap.ui.core"
				},
				qunit: {
					version: 1
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			"jquery.sap.mobile": {
				title: "jquery.sap.mobile: 1",
				ui5: {
					theme: "base"
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			"jquery.sap.mobile2": {
				title: "jquery.sap.mobile: 2",
				ui5: {
					theme: "base"
				}
			},
			"jquery.sap.mobile3": {
				title: "jquery.sap.mobile: 3",
				ui5: {
					theme: "base"
				}
			},
			"jquery.sap.ui": {
				page: "test-resources/sap/ui/core/qunit/jquery.sap.ui.qunit.html",
				title: "jquery.sap.ui",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				}
			},
			"performance/trace/InitFESR_metatag": {
				page: "test-resources/sap/ui/core/qunit/performance/trace/InitFESR_metatag.qunit.html",
				title: "sap.ui.performance.trace.FESR: Activation of FESR via meta-tag"
			},
			"performance/trace/InitFESR_notactive": {
				title: "sap.ui.performance.trace.FESR: Inactivity of FESR"
			},
			"performance/trace/InitFESR_urlparam": {
				page: "test-resources/sap/ui/core/qunit/performance/trace/InitFESR_urlparam.qunit.html?sap-ui-fesr=true",
				title: "sap.ui.performance.trace.FESR: Activation of FESR via url-param"
			},
			"sap.ui.Global": {
				title: "sap.ui.Global",
				sinon: {
					version: 1,
					qunitBridge: true
				}
			}
		}
	};
});
