/*!
 * ${copyright}
 */

/* global console */
sap.ui.define(["sap/base/log", "sap/base/util/lazyProperty", "sap/ui/thirdparty/jquery"],
	function(log, lazyProperty, jQuery) {
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
					"syncStyleClass",
					"replaceDOM"
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
					"validateUrl"
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
					"isMouseEventDelayed",
					"_suppressTriggerEvent",
					"_releaseTriggerEvent"
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
					"syncPoint",
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
					"simulateMobileOnDesktop",
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
				"jquery.sap.unicode": ["isStringNFC"],
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
		"jQuery.support.": {
			target: jQuery.support,
			stubs: {
				"jquery.sap.mobile": [
					"retina"
				]
			}
		},
		"jQuery Plugin ": {
			target: jQuery.fn,
			stubs: {
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
				"sap/ui/dom/jquery/outerHTML": ["outerHTML"],
				"sap/ui/dom/jquery/parentByAttribute": ["parentByAttribute"],
				"sap/ui/dom/jquery/rect": ["rect"],
				"sap/ui/dom/jquery/rectContains": ["rectContains"],
				"sap/ui/dom/jquery/root": ["root"],
				"sap/ui/dom/jquery/sapui": ["sapui"],
				"sap/ui/dom/jquery/scrollLeftRTL": ["scrollLeftRTL"],
				"sap/ui/dom/jquery/scrollRightRTL": ["scrollRightRTL"],
				"sap/ui/dom/jquery/selectText": ["selectText"],
				"sap/ui/dom/jquery/uiarea": ["uiarea"],
				"sap/ui/dom/jquery/zIndex": ["zIndex"],
				"sap/ui/dom/jquery/Selection": [
					"disableSelection",
					"enableSelection"
				]
			}
		},
		"jQuery Event method ": {
			target: jQuery.Event.prototype,
			stubs: {
				"sap/ui/events/jqueryEvent": [
					"getPseudoTypes",
					"isPseudoType",
					"getOffsetX",
					"getOffsetY",
					"stopImmediatePropagation",
					"isImmediateHandlerPropagationStopped",
					"setMark",
					"isMarked",
					"getMark",
					"setMarked"
				]
			}
		},
		"jQuery Selector :": {
			target: jQuery.expr[":"],
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
			log.debug("Lazy loading module \"" + sModule + "\" triggered by usage of " + sTargetName + sProperty, "jquery.sap.stubs");
			sap.ui.requireSync(sModule);
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
				if (!oTarget[sProperty]) {
					lazyProperty(oTarget, sProperty, lazyLoad(sModule, oTarget, sProperty, sTargetName));
				}
			});
		});
	}

	log.debug("Applying lazy loading stubs for legacy APIs", "jquery.sap.stubs");
	Object.keys(mStubs).forEach(function(sStubName) {
		var oStub = mStubs[sStubName];
		applyLazyProperties(sStubName, oStub.target, oStub.stubs);
	});

	return jQuery;
});
