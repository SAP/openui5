/*!
 * ${copyright}
 */
/**
 * Helper for core functionality in Support Tool infrastructure.
 */
sap.ui.define(["jquery.sap.global"],
	function (jQuery) {
		"use strict";

		var CoreHelper = {
			/***
			 * Checks of passed node has parent control of type UI5.
			 * @param node HTML element that will be checked.
			 * @param oScope Scope in witch checking will be executed.
			 * @returns {boolean} If node has parent of type UI5 control it will return true, otherwise false.
			 */
			nodeHasUI5ParentControl : function (node, oScope) {
				/**
				 * Here we white list all controls that can contain DOM elements with style different than the framework style
				 */
				var skipParents = ["sap.ui.core.HTML"],
					parentNode = jQuery(node).control()[0];

				if (!parentNode) {
					return false;
				}

				var parentName = parentNode.getMetadata().getName(),
					isParentOutOfSkipList = skipParents.indexOf(parentName) === -1,
					isParentInScope = oScope.getElements().indexOf(parentNode) > -1;

				return isParentOutOfSkipList && isParentInScope;

			},

			/***
			 * Search and filter all style sheets that are not loaded by the default theme and controls.
			 * @returns {array} List of all custom CSS files paths.
			 */
			getExternalStyleSheets : function () {
				return Array.from(document.styleSheets).filter(function (styleSheet) {
					var themeName = sap.ui.getCore().getConfiguration().getTheme(),
						styleSheetEnding = "/themes/" + themeName + "/library.css",
						hasHref = !styleSheet.href || !(styleSheet.href.indexOf(styleSheetEnding) !== -1),
						hasRules = !!styleSheet.rules;

					return hasHref && hasRules;
				});
			},

			/***
			 * Gets the right path to the style sheet.
			 * @param styleSheet Style sheet that need to be checked.
			 * @returns {string} Full path to the file if its loaded externally and "Inline" if applied style is added by <style> tag
			 */
			getStyleSheetName : function (styleSheet) {
				return styleSheet.href || "Inline";
			},

			/***
			 * Gets the only the style sheet name from source.
			 * @param styleSheet
			 * @returns {string} Name of the file source or "<style> tag" if style sheet is inline.
			 */
			getStyleSource: function (styleSheet) {
				var styleSheetSourceName;

				if (styleSheet.href) {
					// This will get only the name of the styleSheet example: "/customstyle.css"
					styleSheetSourceName = styleSheet.href.substr(styleSheet.href.lastIndexOf("/"), styleSheet.href.length - 1);
				} else {
					styleSheetSourceName = " <style> tag ";
				}

				return styleSheetSourceName;
			}
		};

		return CoreHelper;

	}, true);