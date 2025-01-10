/*!
 * ${copyright}
 */

/* global globalThis */

/**
 * Provide boot relevant configuration.
 * @private
 * @ui5-restricted sap.base, sap.ui.core
 */

// Map Core access to boot
sap.ui.loader.config({
	map: {
		"*": {
			"sap/ui/core/Core": "sap/ui/core/boot"
		}
	}
});

sap.ui.loader.config({
	depCacheUI5: {
		"Eventing-preload-1.js": ["Eventing-preload-0.js"]
	},
	bundlesUI5: {
		"Calendar-preload.js": [
			"sap/base/future.js",
			"sap/base/i18n/Formatting.js",
			"sap/base/i18n/date/CalendarWeekNumbering.js",
			"sap/base/util/ObjectPath.js",
			"sap/base/util/array/uniqueSort.js",
			"sap/base/util/deepEqual.js",
			"sap/base/util/isEmptyObject.js",
			"sap/base/util/resolveReference.js",
			"sap/ui/base/DataType.js",
			"sap/ui/base/Metadata.js",
			"sap/ui/base/Object.js",
			"sap/ui/core/Locale.js",
			"sap/ui/core/LocaleData.js",
			"sap/ui/core/date/Buddhist.js",
			"sap/ui/core/date/CalendarUtils.js",
			"sap/ui/core/date/CalendarWeekNumbering.js",
			"sap/ui/core/date/Gregorian.js",
			"sap/ui/core/date/Islamic.js",
			"sap/ui/core/date/Japanese.js",
			"sap/ui/core/date/Persian.js",
			"sap/ui/core/date/UI5Date.js",
			"sap/ui/core/date/UniversalDate.js",
			"sap/ui/core/date/UniversalDateUtils.js",
			"sap/ui/core/date/_Calendars.js"
		],
		"Eventing-preload-0.js": [
			"sap/base/i18n/ResourceBundle.js",
			"sap/base/security/encodeCSS.js",
			"sap/base/security/encodeXML.js",
			"sap/base/strings/camelize.js",
			"sap/base/strings/capitalize.js",
			"sap/base/strings/escapeRegExp.js",
			"sap/base/strings/formatMessage.js",
			"sap/base/strings/toHex.js",
			"sap/base/util/JSTokenizer.js",
			"sap/base/util/Properties.js",
			"sap/base/util/Version.js",
			"sap/base/util/deepClone.js",
			"sap/base/util/deepExtend.js",
			"sap/base/util/merge.js",
			"sap/ui/Global.js",
			"sap/ui/VersionInfo.js",
			"sap/ui/base/BindingInfo.js",
			"sap/ui/base/BindingParser.js",
			"sap/ui/base/DesignTime.js",
			"sap/ui/base/Event.js",
			"sap/ui/base/EventProvider.js",
			"sap/ui/base/ExpressionParser.js",
			"sap/ui/base/ManagedObject.js",
			"sap/ui/base/ManagedObjectMetadata.js",
			"sap/ui/base/ManagedObjectRegistry.js",
			"sap/ui/core/AnimationMode.js",
			"sap/ui/core/Configuration.js",
			"sap/ui/core/ControlBehavior.js",
			"sap/ui/core/Element.js",
			"sap/ui/core/ElementMetadata.js",
			"sap/ui/core/ElementRegistry.js",
			"sap/ui/core/EnabledPropagator.js",
			"sap/ui/core/FocusHandler.js",
			"sap/ui/core/FocusMode.js",
			"sap/ui/core/InvisibleRenderer.js",
			"sap/ui/core/LabelEnablement.js",
			"sap/ui/core/Lib.js",
			"sap/ui/core/Patcher.js",
			"sap/ui/core/RenderManager.js",
			"sap/ui/core/Renderer.js",
			"sap/ui/core/Rendering.js",
			"sap/ui/core/Supportability.js",
			"sap/ui/core/Theming.js",
			"sap/ui/core/UIAreaRegistry.js",
			"sap/ui/core/_UrlResolver.js",
			"sap/ui/core/getCompatibilityVersion.js"
		],
		"Library-preload.js": [
			"sap/base/future.js",
			"sap/base/i18n/ResourceBundle.js",
			"sap/base/strings/formatMessage.js",
			"sap/base/util/ObjectPath.js",
			"sap/base/util/Properties.js",
			"sap/base/util/Version.js",
			"sap/base/util/array/uniqueSort.js",
			"sap/base/util/deepExtend.js",
			"sap/base/util/isEmptyObject.js",
			"sap/base/util/merge.js",
			"sap/base/util/resolveReference.js",
			"sap/ui/Global.js",
			"sap/ui/VersionInfo.js",
			"sap/ui/base/DataType.js",
			"sap/ui/base/Event.js",
			"sap/ui/base/EventProvider.js",
			"sap/ui/base/Metadata.js",
			"sap/ui/base/Object.js",
			"sap/ui/core/Lib.js",
			"sap/ui/core/Supportability.js",
			"sap/ui/core/_UrlResolver.js",
			"sap/ui/thirdparty/URI.js"
		],
		"Eventing-preload-1.js": [
			"sap/ui/core/theming/ThemeHelper.js",
			"sap/ui/core/util/_LocalizationHelper.js",
			"sap/ui/dom/findTabbable.js",
			"sap/ui/dom/jquery/Selectors.js",
			"sap/ui/events/ControlEvents.js",
			"sap/ui/events/F6Navigation.js",
			"sap/ui/events/KeyCodes.js",
			"sap/ui/events/PseudoEvents.js",
			"sap/ui/events/TouchToMouseMapping.js",
			"sap/ui/events/checkMouseEnterOrLeave.js",
			"sap/ui/events/jquery/EventSimulation.js",
			"sap/ui/model/BindingMode.js",
			"sap/ui/model/Filter.js",
			"sap/ui/model/FilterOperator.js",
			"sap/ui/model/Sorter.js",
			"sap/ui/performance/Measurement.js",
			"sap/ui/performance/trace/Interaction.js",
			"sap/ui/security/Security.js",
			"sap/ui/util/ActivityDetection.js",
			"sap/ui/util/_enforceNoReturnValue.js",
			"sap/ui/thirdparty/URI.js",
			"sap/ui/thirdparty/jquery-compat.js",
			"sap/ui/thirdparty/jquery-mobile-custom.js",
			"sap/ui/thirdparty/jquery.js"
		],
		"Theming-preload.js": [
			"sap/base/util/each.js",
			"sap/ui/core/theming/ThemeManager.js",
			"sap/ui/dom/includeStylesheet.js"
		]
	}
});

// location to manifest
globalThis["sap-ui-config"] = globalThis["sap-ui-config"] ? globalThis["sap-ui-config"] : {};
globalThis["sap-ui-config"].bootManifest = "sap/ui/core/boot/manifest.json";

// enable non blocking loader
globalThis["sap-ui-config"].xxMaxLoaderTaskDuration = 0;