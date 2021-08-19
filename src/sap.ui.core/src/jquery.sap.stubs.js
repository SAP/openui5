/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/Log", "sap/base/util/defineLazyProperty", "sap/ui/thirdparty/jquery"],
	function(Log, defineLazyProperty, jQuery) {
	"use strict";

	// Make sure to initialize the jQuery.sap namespace to apply stubs
	jQuery.sap = jQuery.sap || {};

	var mStubs = {
		"jQuery.sap.": {
			target: jQuery.sap,
			stubs: {
				"jquery.sap.act": ["act"],
				"jquery.sap.dom": [
					"domById",
					"byId",
					"focus",
					"pxToRem",
					"remToPx",
					"containsOrEquals",
					"denormalizeScrollLeftRTL",
					"denormalizeScrollBeginRTL",
					"ownerWindow",
					"scrollbarSize",
					"syncStyleClass"
				],
				"jquery.sap.encoder": [
					"encodeHTML",
					"encodeXML",
					"escapeHTML",
					"encodeJS",
					"escapeJS",
					"encodeURL",
					"encodeURLParameters",
					"encodeCSS",
					"clearUrlWhitelist",
					"addUrlWhitelist",
					"removeUrlWhitelist",
					"getUrlWhitelist",
					"validateUrl",
					"_sanitizeHTML"
				],
				"jquery.sap.events": [
					"PseudoEvents",
					"ControlEvents",
					"disableTouchToMouseHandling",
					"touchEventMode",
					"bindAnyEvent",
					"unbindAnyEvent",
					"checkMouseEnterOrLeave",
					"isSpecialKey",
					"handleF6GroupNavigation",
					"_FASTNAVIGATIONKEY",
					"_refreshMouseEventDelayedFlag",
					"isMouseEventDelayed"
				],
				"jquery.sap.global": [
					"Version",
					"now",
					"debug",
					"setReboot",
					"statistics",
					"log",
					"assert",
					"factory",
					"newObject",
					"getter",
					"getObject",
					"setObject",
					"measure",
					"getModulePath",
					"getResourcePath",
					"registerModulePath",
					"registerResourcePath",
					"registerModuleShims",
					"isDeclared",
					"isResourceLoaded",
					"getAllDeclaredModules",
					"declare",
					"require",
					"preloadModules",
					"registerPreloadedModules",
					"unloadResources",
					"getResourceName",
					"loadResource",
					"_loadJSResourceAsync",
					"includeScript",
					"includeStyleSheet",
					"FrameOptions",
					"globalEval"
				],
				"jquery.sap.history": ["history"],
				"jquery.sap.keycodes": ["KeyCodes"],
				"jquery.sap.mobile": [
					"initMobile",
					"setIcons",
					"setMobileWebAppCapable"
				],
				"jquery.sap.properties": ["properties"],
				"jquery.sap.resources": ["resources"],
				"jquery.sap.script": [
					"uid",
					"hashCode",
					"unique",
					"equal",
					"each",
					"arraySymbolDiff",
					"_createJSTokenizer",
					"parseJS",
					"extend",
					"getUriParameters",
					"delayedCall",
					"clearDelayedCall",
					"intervalCall",
					"clearIntervalCall",
					"forIn",
					"arrayDiff"
				],
				"jquery.sap.sjax": [
					"sjaxSettings",
					"sjax",
					"syncHead",
					"syncGet",
					"syncPost",
					"syncGetText",
					"syncGetJSON"
				],
				"jquery.sap.storage": ["storage"],
				"jquery.sap.strings": [
					"endsWith",
					"endsWithIgnoreCase",
					"startsWith",
					"startsWithIgnoreCase",
					"charToUpperCase",
					"padLeft",
					"padRight",
					"camelCase",
					"hyphen",
					"escapeRegExp",
					"formatMessage"
				],
				"jquery.sap.trace": [
					"interaction",
					"fesr",
					"passport"
				],
				"jquery.sap.xml": [
					"parseXML",
					"serializeXML",
					"isEqualNode",
					"getParseError"
				]
			}
		},
		"jQuery.": {
			target: jQuery,
			stubs: {
				"jquery.sap.mobile": [
					"os",
					"device"
				]
			}
		},
		"jQuery Plugin ": {
			target: jQuery.fn,
			stubs: {
				"jquery.sap.ui": ["root", "uiarea", "sapui"],
				"jquery.sap.dom": ["outerHTML"],
				"sap/ui/dom/jquery/Aria": [
					"addAriaLabelledBy",
					"removeAriaLabelledBy",
					"addAriaDescribedBy",
					"removeAriaDescribedBy"
				],
				"sap/ui/dom/jquery/control": ["control"],
				"sap/ui/dom/jquery/cursorPos": ["cursorPos"],
				"sap/ui/dom/jquery/Focusable": [
					"firstFocusableDomRef",
					"lastFocusableDomRef"
				],
				"sap/ui/dom/jquery/getSelectedText": ["getSelectedText"],
				"sap/ui/dom/jquery/hasTabIndex": ["hasTabIndex"],
				"sap/ui/dom/jquery/parentByAttribute": ["parentByAttribute"],
				"sap/ui/dom/jquery/rect": ["rect"],
				"sap/ui/dom/jquery/rectContains": ["rectContains"],
				"sap/ui/dom/jquery/scrollLeftRTL": ["scrollLeftRTL"],
				"sap/ui/dom/jquery/scrollRightRTL": ["scrollRightRTL"],
				"sap/ui/dom/jquery/selectText": ["selectText"],
				"sap/ui/dom/jquery/zIndex": ["zIndex"],
				"sap/ui/dom/jquery/Selection": [
					"disableSelection",
					"enableSelection"
				]
			}
		},
		"jQuery Selector :": {
			target: jQuery.expr.pseudos,
			stubs: {
				"sap/ui/dom/jquery/Selectors": [
					"focusable",
					"sapTabbable",
					"sapFocusable"
				]
			}
		}
	};

	function lazyLoad(sModule, oTarget, sProperty, sTargetName) {
		return function() {
			Log.warning("Sync loading of module '" + sModule + "' due to usage of deprecated API '" + sTargetName + sProperty + "'", "jquery.sap.stubs", null, function() {
				return {
					type: "jquery.sap.stubs",
					name: sTargetName + sProperty
				};
			});

			sap.ui.requireSync(sModule); // legacy-relevant: lazy loading stubs for legacy APIs
			return oTarget[sProperty];
		};
	}

	function applyLazyProperties(sTargetName, oTarget, mModuleToProp) {
		if (!oTarget) {
			// Stubbing target must be defined
			return;
		}
		Object.keys(mModuleToProp).forEach(function(sModule) {
			var aProperties = mModuleToProp[sModule];
			aProperties.forEach(function(sProperty) {
				// Do not stub already defined properties
				if (oTarget && !oTarget[sProperty]) {
					defineLazyProperty(oTarget, sProperty, lazyLoad(sModule, oTarget, sProperty, sTargetName), "jquery.sap.stubs");
				}
			});
		});
	}

	Log.debug("Applying lazy loading stubs for legacy APIs", "jquery.sap.stubs");
	Object.keys(mStubs).forEach(function(sStubName) {
		var oStub = mStubs[sStubName];
		applyLazyProperties(sStubName, oStub.target, oStub.stubs);
	});

	// Export stubbing config for testing
	if (typeof window === "object" && window["jquery.sap.stubs-test"]) {
		window["jquery.sap.stubs-test"] = mStubs;
	}

	return jQuery;
});
