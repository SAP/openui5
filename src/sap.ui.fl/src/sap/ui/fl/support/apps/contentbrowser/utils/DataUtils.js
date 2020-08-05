/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/GroupHeaderListItem", "sap/ui/thirdparty/jquery"],
	function(GroupHeaderListItem, jQuery) {
		"use strict";

		/**
		 * Provides data utility functions for the Content Browser.
		 *
		 * @constructor
		 * @alias sap.ui.fl.support.apps.contentbrowser.utils.DataUtils
		 * @author SAP SE
		 * @version ${version}
		 * @experimental Since 1.45
		 */
		var DataUtils = {

			aBlacklist: [{
				category: "NS",
				name: "LREP_HOME_CONTENT",
				ns: "UIF/"
			}, {
				category: "NS",
				name: "virtual~",
				ns: "/"
			}],

			/**
			 * Pretty printer for specific file types.
			 *
			 * @param {Object} oData - data to be formatted
			 * @param {String} sFileType - file type of data
			 * @returns {Object} oData - data after formatting
			 * @public
			 */
			formatData: function (oData, sFileType) {
				// code extension and properties files do not need formation
				if ((sFileType === "js") || (sFileType === "properties")) {
					return oData;
				}
				// other files should be formatted to JSON
				try {
					oData = JSON.parse(oData);
					return JSON.stringify(oData, null, '\t');
				} catch (oError) {
					var ErrorUtils = sap.ui.require("sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils");
					ErrorUtils.displayError("Error", oError.name, oError.message);
					return oData;
				}
			},

			/**
			 * Factory for creating list group header objects for the metadata list.
			 * @param {Object} oGroup - group data passed from the lists model binding
			 * @returns {sap.m.GroupHeaderListItem}
			 * @public
			 */
			getGroupHeader: function (oGroup) {
				var sTitle = "{i18n>systemData}";

				if (oGroup.key === "custom") {
					sTitle = "{i18n>externalReferences}";
				}

				return new GroupHeaderListItem({
					title: sTitle,
					upperCase: false
				});
			},

			/**
			 * Verifies if item content is not in the black list.
			 * @param {Object} oContentItem - content item needs to be verified
			 * @returns {Boolean} - <code>true</code> if not in the black list
			 * @public
			 */
			isNotOnBlacklist: function (oContentItem) {
				var bNotBlacklisted = true;
				jQuery.each(this.aBlacklist, function (index, mBlacklistedElement) {
					var bAllPropertiesMatched = true;

					jQuery.each(mBlacklistedElement, function (sProperty, sValue) {
						bAllPropertiesMatched = bAllPropertiesMatched && oContentItem[sProperty] === sValue;
					});

					if (bAllPropertiesMatched) {
						bNotBlacklisted = false;
						return false; // break each
					}
				});
				return bNotBlacklisted;
			},

			/**
			 * Removes leading and trailing slashes from a string.
			 * @param {String} sNamespace - input string
			 * @returns {String} - string after removing leading and trailing slashes
			 * @public
			 */
			cleanLeadingAndTrailingSlashes: function (sNamespace) {
				if (!sNamespace) {
					return "";
				}
				if (sNamespace[0] === "/") {
					var sNamespaceWithoutLeadingSlash = sNamespace.substring(1, sNamespace.length);
					return this.cleanLeadingAndTrailingSlashes(sNamespaceWithoutLeadingSlash);
				}
				if (sNamespace[sNamespace.length - 1] === "/") {
					var sNamespaceWithoutTrailingSlash = sNamespace.substring(0, sNamespace.length - 1);
					return this.cleanLeadingAndTrailingSlashes(sNamespaceWithoutTrailingSlash);
				}
				return sNamespace;
			},

			/**
			 * Title formatter: combines the items namespace, filename and type.
			 * @param {object} mModelData
			 * @param {string} mModelData.namespace
			 * @param {string} mModelData.fileName
			 * @param {string} mModelData.fileType
			 * @returns {string} - item title after formatting
			 * @public
			 */
			formatItemTitle: function (mModelData) {
				return mModelData.namespace + mModelData.fileName + "." + mModelData.fileType;
			},

			/**
			 * Helper function to determine if a file ends with a specified suffix.
			 *
			 * @param {string} sString - string that has to be checked
			 * @param {string} sSuffix - suffix
			 * @returns {boolean} <code>true</code> if the passed suffix is the last part of the passed string
			 * @public
			 */
			endsStringWith: function (sString, sSuffix) {
				return sString.indexOf(sSuffix, sString.length - sSuffix.length) !== -1;
			}
		};

		return DataUtils;
	}, true
);