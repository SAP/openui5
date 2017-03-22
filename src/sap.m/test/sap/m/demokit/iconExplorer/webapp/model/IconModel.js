/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/IconPool",
	"sap/ui/demo/iconexplorer/model/Sorter"
], function (jQuery, JSONModel, IconPool, Sorter) {
	"use strict";

	return JSONModel.extend("sap.ui.demo.iconexplorer.model.IconModel", {

		/**
		 * Loads an icon font and rearranges it based on metadata for display im the icon explorer.
		 * @class
		 * @public
		 * @alias sap.ui.demo.iconexplorer.model.IconModel
		 */
		constructor : function () {

			// call base class constructor
			JSONModel.apply(this, arguments);
			this.setSizeLimit(10000);

			// set up the JSON model data in a timeout to not block the UI while loading the app
			setTimeout(function () {
				this._iStartTime = new Date().getTime();
				this._loadIcons();
			}.bind(this), 0);

			return this;
		},

		/**
		 * Promise to register when the asynchronous loading of an icon font including its metadata is finished
		 * @return {Promise} a promise that is resolved when all icons are loaded
		 */
		iconsLoaded: function () {
			if (!this._oIconsLoadedPromise) {
				this._oIconsLoadedPromise = new Promise(function(fnResolve, fnReject) {
					this._fnIconsLoadedResolve = fnResolve;
					this._fnIconsLoadedReject = fnReject;
				}.bind(this));
			}
			return this._oIconsLoadedPromise;
		},

		/**
		 * Returns the binding path of an icon for a given icon name
		 * @param {string} sName the icon name
		 * @param {string} [sGroupPath] the path to the group to search in
		 * @return {string} the icon path
		 */
		getIconPath: function (sName, sGroupPath) {
			var sIconPath = sGroupPath || "/groups/0";
			sIconPath += "/icons";

			var aIcons = this.getProperty(sIconPath),
				iIconIndex;

			for (var i = 0; i < aIcons.length; i++) {
				if (aIcons[i].name === sName) {
					iIconIndex = i;
					break;
				}
			}

			if (iIconIndex >= 0) {
				return sIconPath + "/" + iIconIndex;
			} else {
				return this.getIconPath("error", sGroupPath);
			}
		},

		/**
		 * Returns the binding path for a given group name
		 * @param {string} sName the name of the group
		 * @return {string} the binding path for the group
		 */
		getGroupPath: function (sName) {
			var aCategories = this.getProperty("/groups"),
				iIndex = 0;

			for (var i = 0; i < aCategories.length; i++) {
				if (aCategories[i].name === sName) {
					iIndex = i;
					break;
				}
			}

			return "/groups/" + iIndex;
		},

		/**
		 * Returns the groups the icons is assigned to
		 * @param {string} sName the icon name
		 * @return {Array} the groups the icon is assigned to
		 */
		getIconGroups: function (sName) {
			var aGroups = this.getProperty("/groups"),
				aIconGroups = [];

			if (aGroups) {
				aGroups = aGroups.slice(1);

				aIconGroups = aGroups.filter(function (oGroup) {
					return oGroup.icons.some(function (oItem) {
						return oItem.name == sName;
					});
				});
			}

			return 	aIconGroups.map(function(oGroup) {
				return oGroup.text;
			});
		},

		/**
		 * Returns the unicode symbol for an icon
		 * @param {string} sName the icon name
		 * @return {string} the unicode representation of the icon
		 */
		getUnicode: function (sName) {
			var oInfo = IconPool.getIconInfo(sName);

			return (oInfo ? oInfo.content : "?");
		},

		/**
		 * Returns the unicode symbol in HTML syntax for an icon
		 * @param {string} sName the icon name
		 * @return {string} the unicode HTML representation of the icon
		 */
		getUnicodeHTML: function (sName) {
			var oInfo = IconPool.getIconInfo(sName);

			return (oInfo ? "&#x" + oInfo.content.charCodeAt(0).toString(16) + ";" : "?");
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Load and process all icons from the metadata
		 * @private
		 */
		_loadIcons: function () {
			var bGroupsLoaded = false,
				bTagsLoaded = false,
				oMetadataloaded = new Promise(function(fnResolve, fnReject) {
					// load groups asynchronously
					jQuery.ajax(jQuery.sap.getModulePath("sap.ui.demo.iconexplorer", "/model/groups.json"), {
						dataType: "json",
						success: function (oData) {
							bGroupsLoaded = true;
							this._oTempGroupData = oData;
							if (bTagsLoaded) {
								fnResolve();
							}
						}.bind(this),
						error: fnReject
					});

					// load tags asynchronously
					jQuery.ajax(jQuery.sap.getModulePath("sap.ui.demo.iconexplorer", "/model/tags.json"), {
						dataType: "json",
						success: function (oData) {
							bTagsLoaded = true;
							this._oTempTagsData = oData;
							if (bGroupsLoaded) {
								fnResolve();
							}
						}.bind(this),
						error: fnReject
					});
				}.bind(this));

			// process data once both models are loaded
			oMetadataloaded.then(this._onMetadataLoaded.bind(this), this._onError.bind(this));
		},

		/**
		 *	Post process all data for display in the icon explorer
		 * @private
		 */
		_onMetadataLoaded : function()  {
			// process groups and tags
			this._processGroups();
			this._processTags();

			// trace elapsed time
			jQuery.sap.log.info("IconModel: Loaded and sorted all icons in " + (new Date().getTime() - this._iStartTime) + " ms");

			// set the model data
			this.setData(this._oTempGroupData);

			// resolve iconsLoaded promise
			this._fnIconsLoadedResolve();

			// cleanup
			this._oTempGroupData = null;
			this._oTempTagsData = null;
		},

		/**
		 * Fires a request failed event in case the metadata for the icons could not be read
		 * @param {object} oResponse the response object from the ajax request
		 * @private
		 */
		_onError: function (oResponse) {
			oResponse.error = "Failed to load the icon metadata, check for parse errors";
			this.fireRequestFailed({response: oResponse});
			this._fnIconsLoadedReject();
		},

		/**
		 * Processes all groups: sort and enrich the model data
		 * @private
		 */
		_processGroups : function() {
			// sort groups by name (sorting is done in the model once for faster processing in the views)
			this._oTempGroupData.groups.sort(Sorter.sortByName);

			for (var i = 0; i < this._oTempGroupData.groups.length; i++) {
				// count & sort icons of group
				if (this._oTempGroupData.groups[i].icons) {
					this._oTempGroupData.groups[i].count = this._oTempGroupData.groups[i].icons.length;
					this._oTempGroupData.groups[i].icons.sort(Sorter.sortByName);
				}
			}
		},

		/**
		 * Processes all tags: relate tags to the icons in the all group
		 * @private
		 */
		_processTags : function() {
			var oData = this._oTempTagsData,
				aIconNames = IconPool.getIconNames(),
				aIcons = [];

			// add all icons from icon pool and append tag info
			aIcons = aIconNames.map(function (sIconName) {
				var oIconMetadata = oData[sIconName],
					aTags = [];

				if (oIconMetadata) {
					aTags = oIconMetadata.tags.map(function (sTag) {
						return {name: sTag};
					});
				}

				return {
					name : sIconName,
					tags : aTags,
					tagString : (oIconMetadata ? oIconMetadata.tags.join(" ") : "")
				};
			});

			// sort and add the all group at index 0
			aIcons.sort(Sorter.sortByName);
			this._oTempGroupData.groups.splice(0, 0, {
				name : "all",
				text : "All",
				icons : aIcons,
				count : aIcons.length
			});

			// calculate top
			this._calculateTagsPerGroup();
		},

		/**
		 * Calculates the top tags per category and copies over the tags to each group
		 * @private
		 */
		_calculateTagsPerGroup: function () {
			var i = 0,
				j = 0;
			for (i = 0; i < this._oTempGroupData.groups.length; i++) {
				var oTagOccurrences = {};
				for (j = 0; j < this._oTempGroupData.groups[i].icons.length; j++) {
					var oTags = this._oTempGroupData.groups[i].icons[j].tags;

					if (!oTags) {
						/* eslint-disable no-loop-func */
						var aIcons = this._oTempGroupData.groups[0].icons.filter(function (oIcon) {
							return oIcon.name === this._oTempGroupData.groups[i].icons[j].name;
						}.bind(this));
						/* eslint-enable no-alert */
						if (aIcons) {
							// copy over tags from all section
							this._oTempGroupData.groups[i].icons[j].tags = aIcons[0].tags;
							this._oTempGroupData.groups[i].icons[j].tagString = aIcons[0].tagString;
							oTags = aIcons[0].tags;
						}
					}
					if (oTags) {
						for (var k = 0; k < oTags.length; k++) {
							if (!oTagOccurrences[oTags[k].name]) {
								oTagOccurrences[oTags[k].name] = 1;
							} else {
								oTagOccurrences[oTags[k].name]++;
							}
						}
					}
				}
				/* eslint-disable no-loop-func */
				var aSortedTagsByRelevance = Object.keys(oTagOccurrences).sort(function (sKey1, sKey2) {
					if (oTagOccurrences[sKey1] === oTagOccurrences[sKey2]) {
						return 0;
					} else if (oTagOccurrences[sKey1] < oTagOccurrences[sKey2]) {
						return 1;
					} else {
						return -1;
					}
				});
				/* eslint-enable no-loop-func */

				this._oTempGroupData.groups[i].tags = [];
				for (j = 0; j < aSortedTagsByRelevance.length; j++) {
					this._oTempGroupData.groups[i].tags.push({ "name" : aSortedTagsByRelevance[j]});
				}
			}
		}
	});
});