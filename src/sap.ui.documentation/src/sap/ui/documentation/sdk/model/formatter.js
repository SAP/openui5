/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/documentation/sdk/controller/util/JSDocUtil"], function (JSDocUtil) {
	"use strict";

	return {
		/**
		 * Formats a library namespace to link to the API reference if it starts with sap.
		 *
		 * @public
		 * @param {string} sNamespace value to be formatted
		 * @returns {string} formatted link
		 */
		crossLink: function (sLink) {
			if (sLink[0] === "#") {
				sLink = document.location.href.substring(0,document.location.href.search("demoapps\.html")) + sLink;
			}
			return sLink;
		},

		/**
		 * Formats a library namespace to link to the API reference if it starts with sap.
		 *
		 * @public
		 * @param {string} sNamespace value to be formatted
		 * @returns {string} formatted link
		 */
		libraryLink: function (sNamespace) {
			if (sNamespace && sNamespace.search("sap\\.") === 0) {
				return this.formatter.crossLink("#docs/api/symbols/" + sNamespace + ".html");
			} else {
				return "";
			}
		},

		/**
		 * Formats a library namespace to true if it starts with sap.
		 *
		 * @public
		 * @param {string} sNamespace value to be formatted
		 * @returns {boolean} true or false
		 */
		libraryLinkEnabled: function (sNamespace) {
			return !!this.formatter.libraryLink.bind(this)(sNamespace);
		},

		/**
		 * Formats a category id to a category name.
		 *
		 * @public
		 * @param {string} sCategoryId the value to be formatted
		 * @returns {string} the formatted text
		 */
		categoryName: function (sCategoryId) {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

			return oResourceBundle.getText("demoAppCategory" + sCategoryId);
		},

		/**
		 * Formats an ApiRef entity name.
		 *
		 * @public
		 * @param {string} sOrigName the value to be formatted
		 * @returns {string} the formatted text
		 */
		apiRefEntityName: function(sOrigName) { // TODO: move this to preprocessor instead and remove this function
			if (sOrigName) {
				return sOrigName.replace("module:", "");
			}
		},

		/**
		 * Formats an ApiRef aggregation altTypes.
		 *
		 * @public
		 * @param {Array} altTypes the array of alternative types
		 * @returns {string | undefined} the formatted text
		 */
		apiRefAggregationAltTypes: function(altTypes) {
			return altTypes && altTypes.join(", ");
		},

		formatVersionTitle: function (sTitle) {
			return sTitle ? "As of " + sTitle : "Version N/A";
		},

		formatSenderLink: function (sControlName, sEntityName, sEntityType) {
			if (sEntityType === "methods") {
				return sControlName + "#" + sEntityName;
			}

			if (sEntityType === "events") {
				return sControlName + "#events:" + sEntityName;
			}

			if (sEntityType === "class") {
				return sControlName;
			}

			return "";
		},

		formatIndexByVersionEntry: function (sControlName, sEntityName, sEntityType, bStatic, sText) {
			var sTitle = this.formatSenderLink(sControlName, sEntityName, sEntityType),
				sHref = this.formatApiHref(sControlName, sEntityName, sEntityType, bStatic),
				sDescription = this.formatLinks(sText);

			return '<a href="' + sHref + '" class="sapMLnk sapMLnkMaxWidth">' + sTitle + '</a>' + sDescription;
		},

		formatApiHref: function(sClassName, sEntityId, sEntityType, bStatic) {
			var sHref;

			if (bStatic) {
				sEntityId = sClassName + "." + sEntityId;
			}

			sHref = "api/" + sClassName;
			if (sEntityType !== "class") {
				sHref += "/" + sEntityType + "/" + sEntityId;
			}
			return sHref;
		},

		/**
		 * This function wraps a text in a span tag so that it can be represented in an HTML control.
		 * @param {string} sText
		 * @returns {string}
		 * @private
		 */
		formatLinks: function (sText) {
			return JSDocUtil.formatTextBlock(sText, {
				linkFormatter: function (target, text) {

					var iHashIndex;

					// If the link has a protocol, do not modify, but open in a new window
					if (target.match("://")) {
						return '<a target="_blank" href="' + target + '">' + (text || target) + '</a>';
					}

					target = target.trim().replace(/\.prototype\./g, "#");
					iHashIndex = target.indexOf("#");

					text = text || target; // keep the full target in the fallback text

					if (iHashIndex < 0) {
						var iLastDotIndex = target.lastIndexOf("."),
							sClassName = target.substring(0, iLastDotIndex),
							sMethodName = target.substring(iLastDotIndex + 1),
							targetMethod = sMethodName;

						if (targetMethod) {
							if (targetMethod.static === true) {
								target = sClassName + '/methods/' + sClassName + '.' + sMethodName;
							} else {
								target = sClassName + '/methods/' + sMethodName;
							}
						}
					}

					if (iHashIndex === 0) {
						// a relative reference - we can't support that
						return "<code>" + target.slice(1) + "</code>";
					}

					if (iHashIndex > 0) {
						target = target.slice(0, iHashIndex) + '/methods/' + target.slice(iHashIndex + 1);
					}

					return "<a class=\"jsdoclink\" href=\"api/" + target + "\" target=\"_self\">" + text + "</a>";

				}
			});
		}
	};
});