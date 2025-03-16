/*!
 * ${copyright}
 */

/* global globalThis */

/**
 * Provide boot relevant configuration.
 * @private
 * @ui5-restricted sap.base, sap.ui.core
 */

(() => {
	"use strict";

	sap.ui.loader.config({bundlesUI5:{
		"bootAppCacheBuster.js":['sap/base/strings/capitalize.js','sap/ui/base/ExpressionParser.js','sap/ui/core/AppCacheBuster.js'],
		"bootCalendar.js":['sap/base/util/Properties.js','sap/ui/core/date/Buddhist.js','sap/ui/core/date/Gregorian.js','sap/ui/core/date/Islamic.js','sap/ui/core/date/Japanese.js','sap/ui/core/date/Persian.js'],
		"bootFESR.js":['sap/ui/performance/BeaconRequest.js','sap/ui/performance/trace/FESR.js'],
		"bootRendering.js":['sap/ui/core/Rendering.js','sap/ui/performance/trace/FESRHelper.js'],
		"bootTheming.js":['sap/ui/core/Theming.js','sap/ui/core/theming/ThemeManager.js'],
		"sap/ui/core/chunk_sap_ui_base_BindingInfo.js":['sap/base/strings/escapeRegExp.js','sap/ui/base/BindingInfo.js','sap/ui/base/BindingParser.js','sap/ui/model/FilterOperator.js'],
		"sap/ui/core/chunk_sap_ui_base_ManagedObject.js":['sap/base/util/JSTokenizer.js','sap/base/util/deepClone.js','sap/ui/base/DesignTime.js','sap/ui/base/ManagedObject.js','sap/ui/base/ManagedObjectMetadata.js','sap/ui/core/theming/ThemeHelper.js','sap/ui/model/BindingMode.js','sap/ui/model/Filter.js','sap/ui/model/Sorter.js','sap/ui/performance/Measurement.js','sap/ui/util/ActivityDetection.js','sap/ui/util/_enforceNoReturnValue.js'],
		"sap/ui/core/chunk_sap_ui_base_Object.js":['sap/ui/base/Metadata.js','sap/ui/base/Object.js'],
		"sap/ui/core/chunk_sap_ui_core__IconRegistry.js":['sap/base/util/syncFetch.js','sap/ui/core/_IconRegistry.js'],
		"sap/ui/core/chunk_sap_ui_core_CalendarType.js":['sap/base/future.js','sap/base/util/ObjectPath.js','sap/base/util/resolveReference.js','sap/ui/base/DataType.js'],
		"sap/ui/core/chunk_sap_ui_core_date_CalendarUtils.js":['sap/ui/core/LocaleData.js','sap/ui/core/date/CalendarUtils.js'],
		"sap/ui/core/chunk_sap_ui_core_date_UniversalDate.js":['sap/base/i18n/Formatting.js','sap/base/i18n/ResourceBundle.js','sap/base/i18n/date/CalendarWeekNumbering.js','sap/base/strings/formatMessage.js','sap/base/util/Version.js','sap/base/util/array/uniqueSort.js','sap/base/util/deepEqual.js','sap/base/util/deepExtend.js','sap/base/util/isEmptyObject.js','sap/base/util/merge.js','sap/ui/VersionInfo.js','sap/ui/base/Event.js','sap/ui/base/EventProvider.js','sap/ui/core/Supportability.js','sap/ui/core/_UrlResolver.js','sap/ui/core/date/UI5Date.js','sap/ui/core/date/UniversalDate.js','sap/ui/core/date/_Calendars.js'],
		"sap/ui/core/chunk_sap_ui_core_Locale.js":['sap/ui/core/Locale.js'],
		"sap/ui/core/chunk_sap_ui_core_support_trace_E2eTraceLib.js":['sap/ui/core/support/trace/E2eTraceLib.js'],
		"sap/ui/core/chunk_sap_ui_performance_trace_Passport.js":['sap/ui/performance/XHRInterceptor.js','sap/ui/performance/trace/Passport.js'],
	}});

	sap.ui.loader.config({depCacheUI5:{
		"sap/base/future.js": ["sap/base/assert.js","sap/base/config.js","sap/base/Log.js"],
		"sap/base/i18n/date/CalendarWeekNumbering.js": ["sap/base/i18n/date/_EnumHelper.js"],
		"sap/base/i18n/Formatting.js": ["sap/base/assert.js","sap/base/config.js","sap/base/Eventing.js","sap/base/Log.js","sap/base/i18n/Localization.js","sap/base/i18n/LanguageTag.js","sap/base/i18n/date/CalendarType.js","sap/base/i18n/date/CalendarWeekNumbering.js","sap/base/util/deepEqual.js","sap/base/util/extend.js","sap/base/util/isEmptyObject.js"],
		"sap/base/i18n/ResourceBundle.js": ["sap/base/assert.js","sap/base/Log.js","sap/base/i18n/Localization.js","sap/base/strings/formatMessage.js","sap/base/util/Properties.js","sap/base/util/merge.js"],
		"sap/base/strings/formatMessage.js": ["sap/base/assert.js"],
		"sap/base/util/array/uniqueSort.js": ["sap/base/assert.js"],
		"sap/base/util/deepClone.js": ["sap/base/util/isPlainObject.js"],
		"sap/base/util/deepEqual.js": ["sap/base/Log.js"],
		"sap/base/util/deepExtend.js": ["sap/base/util/_merge.js"],
		"sap/base/util/merge.js": ["sap/base/util/_merge.js"],
		"sap/base/util/Properties.js": ["sap/base/util/LoaderExtensions.js"],
		"sap/base/util/resolveReference.js": ["sap/base/util/ObjectPath.js"],
		"sap/base/util/syncFetch.js": ["sap/base/util/fetch.js","sap/ui/base/SyncPromise.js"],
		"sap/ui/base/BindingInfo.js": ["sap/ui/base/DesignTime.js","sap/ui/base/BindingParser.js","sap/ui/model/BindingMode.js","sap/base/Log.js"],
		"sap/ui/base/BindingParser.js": ["sap/ui/base/ExpressionParser.js","sap/ui/model/BindingMode.js","sap/ui/model/Filter.js","sap/ui/model/Sorter.js","sap/base/future.js","sap/base/util/JSTokenizer.js","sap/base/util/resolveReference.js"],
		"sap/ui/base/DataType.js": ["sap/base/future.js","sap/base/assert.js","sap/base/util/isPlainObject.js","sap/base/util/resolveReference.js","sap/base/i18n/date/_EnumHelper.js"],
		"sap/ui/base/DesignTime.js": ["sap/base/config.js"],
		"sap/ui/base/Event.js": ["sap/ui/base/Object.js","sap/base/assert.js"],
		"sap/ui/base/EventProvider.js": ["sap/ui/base/Event.js","sap/ui/base/Object.js","sap/base/assert.js","sap/base/Log.js"],
		"sap/ui/base/ExpressionParser.js": ["sap/base/Log.js","sap/base/strings/escapeRegExp.js","sap/base/util/deepEqual.js","sap/base/util/JSTokenizer.js","sap/ui/performance/Measurement.js","sap/ui/thirdparty/URI.js"],
		"sap/ui/base/ManagedObject.js": ["sap/ui/base/DataType.js","sap/ui/base/EventProvider.js","sap/ui/base/ManagedObjectMetadata.js","sap/ui/base/Object.js","sap/ui/base/BindingInfo.js","sap/ui/util/ActivityDetection.js","sap/ui/util/_enforceNoReturnValue.js","sap/base/future.js","sap/base/Log.js","sap/base/assert.js","sap/base/util/deepClone.js","sap/base/util/deepEqual.js","sap/base/util/uid.js","sap/base/util/extend.js","sap/base/util/isEmptyObject.js"],
		"sap/ui/base/ManagedObjectMetadata.js": ["sap/ui/base/DataType.js","sap/ui/base/Metadata.js","sap/ui/base/Object.js","sap/base/Log.js","sap/base/assert.js","sap/base/config.js","sap/base/strings/capitalize.js","sap/base/strings/escapeRegExp.js","sap/base/util/merge.js","sap/base/util/isPlainObject.js"],
		"sap/ui/base/Metadata.js": ["sap/base/assert.js","sap/base/Log.js","sap/base/util/array/uniqueSort.js"],
		"sap/ui/base/Object.js": ["sap/ui/base/Metadata.js"],
		"sap/ui/core/_IconRegistry.js": ["sap/ui/thirdparty/URI.js","sap/base/i18n/ResourceBundle.js","sap/base/Log.js","sap/base/util/fetch.js","sap/base/util/syncFetch.js","sap/base/util/isPlainObject.js","sap/ui/core/Lib.js","sap/ui/core/Theming.js","sap/ui/core/theming/ThemeHelper.js"],
		"sap/ui/core/_UrlResolver.js": ["sap/ui/thirdparty/URI.js"],
		"sap/ui/core/AppCacheBuster.js": ["sap/ui/base/ManagedObject.js","sap/ui/thirdparty/URI.js","sap/base/config.js","sap/base/Log.js","sap/base/i18n/Localization.js","sap/base/util/extend.js","sap/base/util/mixedFetch.js","sap/base/strings/escapeRegExp.js","sap/ui/core/_IconRegistry.js"],
		"sap/ui/core/date/Buddhist.js": ["sap/ui/core/date/UniversalDate.js","sap/ui/core/date/_Calendars.js","sap/base/i18n/date/CalendarType.js"],
		"sap/ui/core/date/CalendarUtils.js": ["sap/base/i18n/Formatting.js","sap/base/i18n/date/CalendarWeekNumbering.js","sap/ui/core/Locale.js","sap/ui/core/LocaleData.js"],
		"sap/ui/core/date/Gregorian.js": ["sap/ui/core/date/UniversalDate.js","sap/ui/core/date/_Calendars.js","sap/base/i18n/date/CalendarType.js"],
		"sap/ui/core/date/Islamic.js": ["sap/ui/core/date/UniversalDate.js","sap/base/Log.js","sap/base/i18n/Formatting.js","sap/base/i18n/date/CalendarType.js","sap/ui/core/date/_Calendars.js"],
		"sap/ui/core/date/Japanese.js": ["sap/ui/core/date/UniversalDate.js","sap/ui/core/date/_Calendars.js","sap/base/i18n/date/CalendarType.js"],
		"sap/ui/core/date/Persian.js": ["sap/ui/core/date/UniversalDate.js","sap/ui/core/date/_Calendars.js","sap/base/i18n/date/CalendarType.js"],
		"sap/ui/core/date/UI5Date.js": ["sap/base/Log.js","sap/base/i18n/Localization.js","sap/base/i18n/date/TimezoneUtils.js"],
		"sap/ui/core/date/UniversalDate.js": ["sap/base/i18n/Formatting.js","sap/base/i18n/date/CalendarWeekNumbering.js","sap/ui/base/Object.js","sap/ui/core/Locale.js","sap/ui/core/LocaleData.js","sap/ui/core/date/_Calendars.js","sap/ui/core/date/CalendarUtils.js","sap/ui/core/date/UI5Date.js"],
		"sap/ui/core/Locale.js": ["sap/base/assert.js","sap/ui/base/Object.js","sap/base/i18n/LanguageTag.js"],
		"sap/ui/core/LocaleData.js": ["sap/ui/core/Locale.js","sap/base/assert.js","sap/base/i18n/Formatting.js","sap/base/i18n/LanguageTag.js","sap/base/i18n/Localization.js","sap/base/i18n/date/CalendarType.js","sap/base/i18n/date/CalendarWeekNumbering.js","sap/base/util/extend.js","sap/base/util/LoaderExtensions.js","sap/ui/base/Object.js","sap/ui/base/SyncPromise.js"],
		"sap/ui/core/Rendering.js": ["sap/base/config.js","sap/base/Log.js","sap/ui/base/EventProvider.js","sap/ui/performance/trace/Interaction.js","sap/ui/performance/Measurement.js"],
		"sap/ui/core/support/trace/E2eTraceLib.js": ["sap/ui/Device.js","sap/ui/performance/trace/Passport.js","sap/base/Log.js","sap/ui/thirdparty/URI.js","sap/ui/core/support/trace/EppLib.js"],
		"sap/ui/core/Supportability.js": ["sap/base/config.js"],
		"sap/ui/core/Theming.js": ["sap/base/assert.js","sap/base/config.js","sap/base/Event.js","sap/base/Eventing.js","sap/base/future.js","sap/base/Log.js","sap/base/i18n/Localization.js","sap/base/util/deepEqual.js","sap/ui/core/theming/ThemeHelper.js"],
		"sap/ui/core/theming/ThemeHelper.js": ["sap/base/future.js","sap/base/Log.js"],
		"sap/ui/core/theming/ThemeManager.js": ["sap/base/assert.js","sap/base/Eventing.js","sap/base/future.js","sap/base/Log.js","sap/base/i18n/Localization.js","sap/base/util/each.js","sap/base/util/LoaderExtensions.js","sap/ui/Device.js","sap/ui/VersionInfo.js","sap/ui/core/Lib.js","sap/ui/core/Theming.js","sap/ui/core/theming/ThemeHelper.js","sap/ui/dom/includeStylesheet.js"],
		"sap/ui/model/Filter.js": ["sap/ui/model/FilterOperator.js","sap/base/Log.js","sap/base/i18n/Localization.js","sap/ui/base/Object.js"],
		"sap/ui/model/Sorter.js": ["sap/base/Log.js","sap/base/i18n/Localization.js","sap/ui/base/Object.js"],
		"sap/ui/performance/Measurement.js": ["sap/base/Log.js","sap/base/util/now.js"],
		"sap/ui/performance/trace/FESR.js": ["sap/base/config.js","sap/ui/thirdparty/URI.js","sap/ui/Device.js","sap/ui/performance/trace/Passport.js","sap/ui/performance/trace/Interaction.js","sap/ui/performance/XHRInterceptor.js","sap/ui/performance/BeaconRequest.js","sap/base/util/Version.js"],
		"sap/ui/performance/trace/Passport.js": ["sap/ui/performance/XHRInterceptor.js","sap/ui/thirdparty/URI.js"],
		"sap/ui/performance/XHRInterceptor.js": ["sap/base/Log.js"],
		"sap/ui/util/_enforceNoReturnValue.js": ["sap/base/future.js"],
		"sap/ui/util/ActivityDetection.js": ["sap/ui/core/Theming.js"],
		"sap/ui/VersionInfo.js": ["sap/base/util/LoaderExtensions.js"],
	}});

	// location to manifest
	globalThis["sap-ui-config"] = globalThis["sap-ui-config"] ? globalThis["sap-ui-config"] : {};
	if (!globalThis["sap-ui-config"].bootManifest) {
		globalThis["sap-ui-config"].bootManifest = "sap/ui/core/boot/boot.json";
	}
	if (!globalThis["sap-ui-config"].splashLocation) {
		globalThis["sap-ui-config"].splashLocation = "sap/ui/core/boot/splash.html";
	}

	// enable non blocking loader
	globalThis["sap-ui-config"].xxMaxLoaderTaskDuration = 0;

	let sBaseUrl, rBootScripts, aScripts, i;

	function findBaseUrl(oScript, rUrlPattern) {
		var sUrl = oScript && oScript.getAttribute("src"),
			oMatch = rUrlPattern.exec(sUrl);
		if ( oMatch ) {
			sBaseUrl = oMatch[1] || "";
			return true;
		}
		return false;
	}

	// Prefer script tags which have the sap-ui-bootstrap ID
	// This prevents issues when multiple script tags point to files named
	// "sap-ui-core.js", for example when using the cache buster for UI5 resources
	if ( !findBaseUrl(document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]'), /^((?:[^?#]*\/)?resources\/)/ ) ) {

		// only when there's no such script tag, check all script tags
		rBootScripts = /^([^?#]*\/)?(?:sap-ui-(?:core|custom|boot|merged)(?:-[^?#/]*)?|jquery.sap.global|ui5loader(?:-autoconfig)?)\.js(?:[?#]|$)/;
		aScripts = document.scripts;
		for ( i = 0; i < aScripts.length; i++ ) {
			if ( findBaseUrl(aScripts[i], rBootScripts) ) {
				break;
			}
		}
	}

	sap.ui.loader.config({
		baseUrl: sBaseUrl,

		map: {
			"*": {
				'blanket': 'sap/ui/thirdparty/blanket',
				'crossroads': 'sap/ui/thirdparty/crossroads',
				'd3': 'sap/ui/thirdparty/d3',
				'handlebars': 'sap/ui/thirdparty/handlebars',
				'hasher': 'sap/ui/thirdparty/hasher',
				'IPv6': 'sap/ui/thirdparty/IPv6',
				'jquery': 'sap/ui/thirdparty/jquery',
				'jszip': 'sap/ui/thirdparty/jszip',
				'less': 'sap/ui/thirdparty/less',
				'OData': 'sap/ui/thirdparty/datajs',
				'punycode': 'sap/ui/thirdparty/punycode',
				'SecondLevelDomains': 'sap/ui/thirdparty/SecondLevelDomains',
				'sinon': 'sap/ui/thirdparty/sinon',
				'signals': 'sap/ui/thirdparty/signals',
				'URI': 'sap/ui/thirdparty/URI',
				'URITemplate': 'sap/ui/thirdparty/URITemplate',
				'esprima': 'sap/ui/documentation/sdk/thirdparty/esprima'
			}
		},

		shim: {
			'sap/ui/thirdparty/bignumber': {
				amd: true,
				exports: 'BigNumber'
			},
			'sap/ui/thirdparty/blanket': {
				amd: true,
				exports: 'blanket' // '_blanket', 'esprima', 'falafel', 'inBrowser', 'parseAndModify'
			},
			'sap/ui/thirdparty/caja-html-sanitizer': {
				amd: false,
				exports: 'html' // 'html_sanitizer', 'html4'
			},
			'sap/ui/thirdparty/crossroads': {
				amd: true,
				exports: 'crossroads',
				deps: ['sap/ui/thirdparty/signals']
			},
			'sap/ui/thirdparty/d3': {
				amd: true,
				exports: 'd3'
			},
			'sap/ui/thirdparty/datajs': {
				amd: true,
				exports: 'OData' // 'datajs'
			},
			'sap/ui/thirdparty/handlebars': {
				amd: true,
				exports: 'Handlebars'
			},
			'sap/ui/thirdparty/hasher': {
				amd: true,
				exports: 'hasher',
				deps: ['sap/ui/thirdparty/signals']
			},
			'sap/ui/thirdparty/IPv6': {
				amd: true,
				exports: 'IPv6'
			},
			'sap/ui/thirdparty/iscroll-lite': {
				amd: false,
				exports: 'iScroll'
			},
			'sap/ui/thirdparty/iscroll': {
				amd: false,
				exports: 'iScroll'
			},
			'sap/ui/thirdparty/jszip': {
				amd: true,
				exports: 'JSZip'
			},
			'sap/ui/thirdparty/less': {
				amd: true,
				exports: 'less'
			},
			'sap/ui/thirdparty/qunit-2': {
				amd: false,
				exports: 'QUnit'
			},
			'sap/ui/thirdparty/punycode': {
				amd: true,
				exports: 'punycode'
			},
			'sap/ui/thirdparty/RequestRecorder': {
				amd: true,
				exports: 'RequestRecorder',
				deps: ['sap/ui/thirdparty/URI', 'sap/ui/thirdparty/sinon']
			},
			'sap/ui/thirdparty/require': {
				exports: 'define' // 'require', 'requirejs'
			},
			'sap/ui/thirdparty/SecondLevelDomains': {
				amd: true,
				exports: 'SecondLevelDomains'
			},
			'sap/ui/thirdparty/signals': {
				amd: true,
				exports: 'signals'
			},
			'sap/ui/thirdparty/sinon': {
				amd: true,
				exports: 'sinon'
			},
			'sap/ui/thirdparty/sinon-4': {
				amd: true,
				exports: 'sinon'
			},
			'sap/ui/thirdparty/sinon-server': {
				amd: true,
				exports: 'sinon' // really sinon! sinon-server is a subset of server and uses the same global for export
			},
			'sap/ui/thirdparty/URI': {
				amd: true,
				exports: 'URI'
			},
			'sap/ui/thirdparty/URITemplate': {
				amd: true,
				exports: 'URITemplate',
				deps: ['sap/ui/thirdparty/URI']
			},
			'sap/ui/thirdparty/vkbeautify': {
				amd: false,
				exports: 'vkbeautify'
			},
			'sap/ui/thirdparty/zyngascroll': {
				amd: false,
				exports: 'Scroller' // 'requestAnimationFrame', 'cancelRequestAnimationFrame', 'core'
			},
			'sap/ui/demokit/js/esprima': {
				amd: true,
				exports: 'esprima'
			},
			'sap/ui/documentation/sdk/thirdparty/esprima': {
				amd: true,
				exports: 'esprima'
			},
			'sap/viz/libs/canvg': {
				deps: ['sap/viz/libs/rgbcolor']
			},
			'sap/viz/libs/rgbcolor': {
			},
			'sap/viz/libs/sap-viz': {
				deps: ['sap/viz/library', 'sap/ui/thirdparty/jquery', 'sap/ui/thirdparty/d3', 'sap/viz/libs/canvg']
			},
			'sap/viz/libs/sap-viz-info-charts': {
				deps: ['sap/viz/libs/sap-viz-info-framework']
			},
			'sap/viz/libs/sap-viz-info-framework': {
				deps: ['sap/ui/thirdparty/jquery', 'sap/ui/thirdparty/d3']
			},
			'sap/viz/ui5/container/libs/sap-viz-controls-vizcontainer': {
				deps: ['sap/viz/libs/sap-viz', 'sap/viz/ui5/container/libs/common/libs/rgbcolor/rgbcolor_static']
			},
			'sap/viz/ui5/controls/libs/sap-viz-vizframe/sap-viz-vizframe': {
				deps: ['sap/viz/libs/sap-viz-info-charts']
			},
			'sap/viz/ui5/controls/libs/sap-viz-vizservices/sap-viz-vizservices': {
				deps: ['sap/viz/libs/sap-viz-info-charts']
			},
			'sap/viz/resources/chart/templates/standard_fiori/template': {
				deps: ['sap/viz/libs/sap-viz-info-charts']
			}
		}
	});
})();
