/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/base/ManagedObject",
	"sap/base/util/merge",
	"sap/ui/documentation/sdk/controller/util/JSDocUtil",
	"sap/base/security/sanitizeHTML",
	"sap/ui/documentation/sdk/controller/util/URLUtil",
	"sap/base/strings/formatMessage"
], function (BaseObject, ManagedObject, merge, JSDocUtil, sanitizeHTML, URLUtil, formatMessage) {
	"use strict";

	// regexp for an extra route parameter in the format: a single 'p' letter followed by a digit
	// this is used in the router configuration to declare optional extra parameters
	var REGEXP_ROUTE_SPECIAL_PARAMETER = /^p\d+$/;

	var oFormatter = BaseObject.extend("sap.ui.documentation.sdk.model.formatter"),
		oStaticAPI = {
			/**
			 * Formats a library namespace to link to the API reference if it starts with sap.
			 *
			 * @public
			 * @param {string} sLink value to be formatted
			 * @returns {string} formatted link
			 */
			crossLink: function (sLink) {
				if (sLink[0] === "#") {
					sLink = document.location.href.substring(0, document.location.href.search("demoapps\.html")) + sLink;
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
					return this.formatter.crossLink("api/" + sNamespace);
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
			 * Formats an ApiRef entity name.
			 *
			 * @public
			 * @param {string} sOrigName the value to be formatted
			 * @returns {string} the formatted text
			 */
			apiRefEntityName: function (sOrigName) { // TODO: move this to preprocessor instead and remove this function
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
			apiRefAggregationAltTypes: function (altTypes) {
				return altTypes && altTypes.join(", ");
			},

			/**
			 * Formats the info for visibility of some API (e.g. method, property)
			 *
			 * @protected
			 * @param {string} sVisibility the declared visibility e.g. "public"
			 * @param {Array} aAllowedFor the types that are allowed to access a restricted API
			 * @returns {string | undefined} the formatted text
			 */
			formatVisibility: function (sVisibility, aAllowedFor) {
				var sFormatted = sVisibility;
				if (aAllowedFor && Array.isArray(aAllowedFor)) {
					sFormatted += (" to " + aAllowedFor.join(", "));
				}
				return sFormatted;
			},

			formatVersionTitle: async function (sPattern, sTitle) {
				if (sTitle) {
					return this.formatMessage(sPattern, sTitle);
				}

				return (await this.getModel("i18n").getResourceBundle()).getText("API_DETAIL_NA_VERSION");
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

			formatImportantMessage: function (sMsg, sParam) {
				var sParam = this._getFullVersion();
				return formatMessage(sMsg, sParam);
			},

			formatIndexByVersionEntry: function (sControlName, sEntityName, sEntityType, bStatic, sText) {
				var sTitle = this.formatSenderLink(sControlName, sEntityName, sEntityType),
					sHref = this.formatApiHref(sControlName, sEntityName, sEntityType, bStatic),
					sDescription = this.formatLinks(sText);

				return '<a href="' + sHref + '" class="sapMLnk sapMLnkMaxWidth">' + sTitle + '</a>' + sDescription;
			},

			formatApiHref: function (sClassName, sEntityId, sEntityType, bStatic) {
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
			 * @param {string} sText - the text to be wrapped
			 * @returns {string} the formatted text
			 * @private
			 */
			formatLinks: function (sText) {
				return JSDocUtil.formatTextBlock(sText, {
					linkFormatter: function (target, text) {

						var iHashIndex;

						// If the link has a protocol, do not modify, but open in a new window
						if (target.match("://")) {
							return '<a target="_blank" href="' + target + '" rel="noopener">' + (text || target) + '</a>';
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

						return "<a href=\"api/" + target + "\" target=\"_self\">" + text + "</a>";

					}
				});
			},

			/**
			 * Converts a filePath to a format acceptable as parameters for the <code>codeFile</code> route
			 *
			 * The conversion to a parameters map is needed because the filePath contains slashes which are interpreted
			 * by the router as part of the route structure (as the slash is a special character for the router)
			 * and we cannot URL encode slashes for backend compliance reasons (Tomcat rejects encoded slashes in the URL)
			 * @param {string} sFilePath - the file path to be converted
			 * @returns {object} a map of parameters
			 * @private
			 */
			filePathToRouteParams: function (sFilePath) {
				var aFileName, oRouteParams = {};
				if (!sFilePath) {
					return {};
				}
				aFileName = sFilePath.split("/");

				aFileName.forEach(function (sPart, i) {
					oRouteParams["p" + ++i] = sPart;
				});
				return oRouteParams;
			},

			/**
			 * Parses a filePath from the parameters of the <code>codeFile</code> route
			 *
			 * see @filePathToRouteParams function documentation for details
			 * @param {object} oRouteParameters - the route parameters
			 * @returns {string} the file path
			 * @private
			 */
			routeParamsToFilePath: function (oRouteParameters) {
				var aKeys = Object.keys(oRouteParameters),
					bIsFileNameKey,
					sFileNamePart,
					aFileName = [];
				for (var i = 0; i < aKeys.length; i++) {
					bIsFileNameKey = REGEXP_ROUTE_SPECIAL_PARAMETER.test(aKeys[i]);
					sFileNamePart = bIsFileNameKey && oRouteParameters[aKeys[i]];
					if (sFileNamePart) {
						aFileName.push(sFileNamePart);
					}
					if (bIsFileNameKey && !sFileNamePart) {
						break;
					}
				}
				if (aFileName.length) {
					return aFileName.join("/");
				}
			},

			/**
			 * Formats a documentation link, intended to be open in a new window
			 *
			 * @public
			 * @param {string} sHref the link to be formatter
			 * @returns {string} the formatted link
			 */
			formatHttpHrefForNewWindow: function (sHref) {
				if (sHref && window['sap-ui-documentation-static'] && !/^https?:\/\//.test(sHref)) {
					sHref = "#/" + sHref;
				}
				return sHref;
			},

			// Formatter for links, coming from api.json text in static documentation format
			formatMessageStripLinks: function (sText) {
				var bStatic = window['sap-ui-documentation-static'];

				if (sText) {

					sText = sanitizeHTML(sText, {
						uriRewriter: function (sUrl) {
							if (bStatic && URLUtil.hasSEOOptimizedFormat(sUrl)) {
								sUrl = URLUtil.convertToNonSEOFormat(sUrl).replace(/^\//, "");
							}
							return sUrl;
						}
					});
				}
				return sText;
			},

			/**
			 * Formats the value of the <code>visibile</code> property of the cards in the Tools section
			 *
			 * @param {object} oData the model data
			 * @returns {boolean} true if the card is visible
			 * @protected
			 */
			formatResourceCardVisibility: function (oData) {
				if (!oData) {
					return false;
				}

				if (oData.hideOnPhone
					&& this.getOwnerComponent().getModel("device").getProperty("/system/phone")) {
					return false;
				}

				if (oData.isDistributionScope
					&& this.getOwnerComponent().getModel("versionData").getProperty("/isOpenUI5")) {
					return false;
				}

				return true;
			},

			/**
			 * Formats the version status based on the provided parameters.
			 *
			 * @param {boolean} bShowVersionSwitchButton - Determines if the version switch button is shown.
			 * @param {boolean} isDevVersion - Indicates if the current version is a development version.
			 * @param {string} version - The current version string.
			 * @returns {string} The formatted version status.
			 */
			formatVersionStatus: async function (bShowVersionSwitchButton, isDevVersion, version) {

				var oResourceBundle = await this.getModel("i18n").getResourceBundle();

				if (bShowVersionSwitchButton) {
					return "";
				}

				var versionStatus = oResourceBundle.getText("APP_VERSION_VERSION") + " " + version;

				if (isDevVersion) {
					versionStatus += " " + oResourceBundle.getText("APP_VERSION_IN_PROGRESS");
				}

				return versionStatus;
			},

			/**
			 * This function gets a resource bundle and returns a title based on the category provided.
			 *
			 * @param {string} sCategory - The category to use for getting the title.
			 * @returns {string} The title associated with the category from the resource bundle.
			 */
			getDemoAppsCategoryTitle: async function (sCategory) {
				var oResourceBundle = await this.getModel("i18n").getResourceBundle();
				return oResourceBundle.getText("DEMO_APPS_CATEGORY_" + sCategory.toUpperCase());
			},

			/**
			 * This function generates a category class string for demo apps.
			 *
			 * @param {string} sCategory - The category of the demo app.
			 * @returns {string} The generated category class string.
			 */
			getDemoAppsCategoryClass: function (sCategory) {
				return "sapUiDemoKitDemoAppsCategory" + sCategory;
			},

			/*
			 * make ManagedObject.escapeSettingsValue available via this formatter
			 */
			escapeSettingsValue: ManagedObject.escapeSettingsValue,

			getUrlForType: function(sType) {
				if (!sType) {
					return sType;
				}
				return "api/" + sType.replace("[]", "");
			},

			stringify: function (oObject) {
				return JSON.stringify(oObject, null, 2);
			},
			stringifyJSDocType: function (oObject, aTyoes, sType, bLinkEnabled) {
				oObject = oFormatter.formatJSDocType(oObject, aTyoes, sType, bLinkEnabled);
				return JSON.stringify(oObject, null, 2);
			},
			formatJSDocType: function (oObject, aTyoes, sType, bLinkEnabled) {
				oObject ??= oFormatter.convertLegacyJSDocTypes(aTyoes, sType, bLinkEnabled);
				return oObject;
			},
			convertLegacyJSDocTypes: function(aTypes, sType, bLinkEnabled) {
				if (!aTypes && !sType) {
					return;
				}
				aTypes || (aTypes = [{value: sType, linkEnabled: bLinkEnabled}]);
				// try to get the old 'types' array and convert it to the new typeInfo structure
				if ( Array.isArray(aTypes) ) {
					const UI5Types = [];
					const template = aTypes.map(({value, name, linkEnabled}) => {
						const simpleType = value || name;
						if ( linkEnabled ) {
							UI5Types.push(simpleType);
							return `\${${UI5Types.length - 1}}`;
						}
						return simpleType;
					}).join(" | ");
					return {
						template,
						UI5Types
					};
				}
			}
		};

	return merge(oFormatter, oStaticAPI);
});