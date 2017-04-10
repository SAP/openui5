sap.ui.define([	"sap/ui/core/mvc/Controller",
				"sap/ui/documentation/controller/util/JSDocUtil"],

	function (Controller, JSDocUtil) {
	"use strict";

	return Controller.extend("sap.ui.documentation.controls.HTMLBlockController", {
		onInit: function () {

		},

		onAfterRendering: function () {

		},

		onParentBlockModeChange: function(sMode) {

		},

		/**
		 * This function wraps a text in a span tag so that it can be represented in an HTML control.
		 * @param {string} text
		 * @returns {string}
		 * @private
		 */
		_wrapInSpanTag: function (text) {
			return '<div>' + JSDocUtil.formatTextBlock(text, {
					linkFormatter: function (target, text) {

						var p;

						target = target.trim().replace(/\.prototype\./g, "#");
						p = target.indexOf("#");
						if (p === 0) {
							// a relative reference - we can't support that
							return "<code>" + target.slice(1) + "</code>";
						}

						if (p > 0) {
							text = text || target; // keep the full target in the fallback text
							target = target.slice(0, p);
						}

						return "<a class=\"jsdoclink\" href=\"javascript:void(0);\" data-sap-ui-target=\"" + target + "\">" + (text || target) + "</a>";

					}
				}) + '</div>';
		}
	});
}, true);