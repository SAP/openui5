/*!
 * ${copyright}
 */

// define jQuery for bundling sap-ui-integration-nojQuery.js
(function() {
	"use strict";
	/*global jQuery */

	var mModules = {
		"sap/ui/thirdparty/jquery": "jQuery",
		"sap/ui/thirdparty/jqueryui/jquery-ui-core": "jQuery.ui",
		"sap/ui/thirdparty/jqueryui/jquery-ui-widget": "jQuery.widget",
		"sap/ui/thirdparty/jqueryui/jquery-ui-mouse": "jQuery.ui.mouse",
		"sap/ui/thirdparty/jqueryui/jquery-ui-datepicker": "jQuery.ui.datepicker",
		"sap/ui/thirdparty/jqueryui/jquery-ui-draggable": "jQuery.ui.draggable",
		"sap/ui/thirdparty/jqueryui/jquery-ui-droppable": "jQuery.ui.droppable",
		"sap/ui/thirdparty/jqueryui/jquery-ui-position": "jQuery.ui.position",
		"sap/ui/thirdparty/jqueryui/jquery-ui-resizable": "jQuery.ui.resizable",
		"sap/ui/thirdparty/jqueryui/jquery-ui-selectable": "jQuery.ui.selectable",
		"sap/ui/thirdparty/jqueryui/jquery-ui-sortable": "jQuery.ui.sortable",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect": "jQuery.effects.effect",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-blind": "jQuery.effects.effect.blind",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-bounce": "jQuery.effects.effect.bounce",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-clip": "jQuery.effects.effect.clip",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-drop": "jQuery.effects.effect.drop",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-explode": "jQuery.effects.effect.explode",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-fade": "jQuery.effects.effect.fade",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-fold": "jQuery.effects.effect.fold",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-highlight": "jQuery.effects.effect.highlight",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-pulsate": "jQuery.effects.effect.pulsate",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-scale": "jQuery.effects.effect.scale",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-shake": "jQuery.effects.effect.shake",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-slide": "jQuery.effects.effect.slide",
		"sap/ui/thirdparty/jqueryui/jquery-ui-effect-transfer": "jQuery.effects.effect.transfer"
	};

	for (var sModuleName in mModules) {
		checkAndDefine(sModuleName, mModules[sModuleName]);
	}

	function checkAndDefine(sModuleName, sPluginName) {
		if (!isPluginDefined(sPluginName)) {
			// default behavior, load from ui5
			return;
		}

		// plugin is already on the page, don't load it from ui5
		sap.ui.define(sModuleName, function() {
			return jQuery;
		});
	}

	function isPluginDefined(sPluginName) {
		var aParts = sPluginName.split("."),
			oCurrent = window,
			bIsUndefined;

		bIsUndefined = aParts.some(function (sPartName) {
			oCurrent = oCurrent[sPartName];
			return oCurrent === undefined;
		});

		return !bIsUndefined;
	}
})();