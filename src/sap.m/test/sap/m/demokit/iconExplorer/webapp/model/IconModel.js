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
		 * Constructor for the IconModel
		 * It contains icons from all loaded fonts, sorted into groups with the following structure
		 * /AllFonts: flat list of all loaded fonts with the technical property "name" for each entry
		 * /AllIcons: flat list of icons from all fonts that can be used for a global search
		 * /FontName: for each loaded font an entry is created containing
		 *   - [groups]: array of groups of the font as specified in the metadata and the generated "all" group
		 *             containing all icons of the font that can be used for a font-specific search
		 *     - name: group name
		 *     - count: number of icons in this group
		 *     - [icons]: array of icons consisting of the following properties
		 *         - name: technical name of the icon
		 *         - iconPath: path to the icon (used mostly for managing favorites)
		 *         - font: name of the font the icon is part of (for more binding convenience)
		 *         - delivery: SAPUI5, OpenUI5, or Other depending on the delivery channel of the font
		 *         - tags: array of tags for the icon
		 *           - name: the name of the tag
		 *         - tagString: all tags concatenated for a more efficient search
		 * @class
		 * @public
		 * @alias sap.ui.demo.iconexplorer.model.IconModel
		 */
		constructor : function () {

			// call base class constructor
			JSONModel.apply(this, arguments);

			// reset default size limit
			this.setSizeLimit(Infinity);
			return this;
		},

		/**
		 * Initializes and fills the model with groups and tags information for all icon fonts
		 * @param {Array} aIconFonts contains all fonts names we want to load
		 */
		init: function (aIconFonts) {
			// set up the JSON model data in a timeout to not block the UI while loading the app
			this._iStartTime = new Date().getTime();

			// initialize icon array for global search
			this.setProperty("/AllIcons", []);
			this.setProperty("/AllFonts", []);
			// add new array to model to check whether fonts are loaded or not
			this.setProperty("/AllFontsLoaded", []);

			var aPromises = [];
			for (var i = 0; i < aIconFonts.length; i++){
				aPromises.push(this._loadIcons(aIconFonts[i]));
			}
			this._pIconsLoaded = Promise.all(aPromises);

			// add the BusinessSuiteInAppSymbols font to the AllFontsLoaded array
			// to avoid problems with visibility because the json file is in OpenUI5 not requested
			var aAllFontsLoaded = this.getProperty("/AllFontsLoaded");
			aAllFontsLoaded["BusinessSuiteInAppSymbols"] = false;
		},

		/**
		 * Register to this promise to get notified when the icon model is initialized
		 * @returns {Promise} resolved when all icon font metadata is loaded
		 */
		iconsLoaded: function () {
			return this._pIconsLoaded;
		},

		/**
		 * Set the currently displayed main font to fetch icon and group paths correctly
		 * @param {string} sFontName a valid font name
		 */
		setFont : function (sFontName) {
			this._sFontName = sFontName;
		},

		/**
		 * Returns the binding path of an icon for a given icon name
		 * @param {string} sName the icon name
		 * @param {string} [sGroupPath] the path to the group to search in
		 * @return {string} the icon path
		 */
		getIconPath: function (sName, sGroupPath) {
			var sIconPath = sGroupPath || "/groups/0";
			sIconPath =  "/" + this._sFontName + sIconPath + "/icons";

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
			} else if (sName !== "error") {
				return this.getIconPath("error", sGroupPath);
			}
		},

		/**
		 * Returns the binding path for a given group name
		 * @param {string} sGroupName the name of the group
		 * @return {string} the binding path for the group
		 */
		getGroupPath: function (sGroupName) {
			var sGroupPath = "/" + this._sFontName + "/groups",
				aGroups = this.getProperty(sGroupPath),
				iIndex = 0;

			for (var i = 0; i < aGroups.length; i++) {
				if (aGroups[i].name === sGroupName) {
					iIndex = i;
					break;
				}
			}
			return sGroupPath + "/" + iIndex;
		},

		/**
		 * Returns the groups the icon is assigned to
		 * @param {string} sIconName the icon name
		 * @return {Array} the groups the icon is assigned to
		 */
		getIconGroups: function (sIconName) {
			var sGroupPath = "/" + this._sFontName + "/groups",
				aGroups = this.getProperty(sGroupPath),
				aIconGroups = [];

			if (aGroups) {
				aGroups = aGroups.slice(1);

				aIconGroups = aGroups.filter(function (oGroup) {
					return oGroup.icons.some(function (oItem) {
						return oItem.name == sIconName;
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
			var sFontName = (this._sFontName === "SAP-icons" ? undefined : this._sFontName),
				oInfo = IconPool.getIconInfo(this._sFontName + "/" + sName, sFontName);

			return (oInfo ? oInfo.content : "?");
		},

		/**
		 * Returns the unicode symbol in HTML syntax for an icon
		 * @param {string} sName the icon name
		 * @return {string} the unicode HTML representation of the icon
		 */
		getUnicodeHTML: function (sName) {
			var sFontName = (this._sFontName === "SAP-icons" ? undefined : this._sFontName),
				oInfo = IconPool.getIconInfo(sName, sFontName);

			return (oInfo && oInfo.content ? "&#x" + oInfo.content.charCodeAt(0).toString(16) + ";" : "?");
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Load and process groups and tags of icon fonts from the metadata
		 * @param {string} sFontName name of currently selected font to be loaded
		 * @private
		 */
		_loadIcons: function (sFontName) {
			var aPromises = [];

			["groups.json", "tags.json"].forEach(function (sName) {
				aPromises.push(new Promise(function (fnResolve, fnReject) {
					// load font metadata asynchronously
					jQuery.ajax({
						url: jQuery.sap.getModulePath("sap.ui.demo.iconexplorer", "/model/" + sFontName + "/" + sName),
						dataType: "json",
						success: function (oData) {
							fnResolve(oData);
						},
						error: function (oError) {
							fnReject(oError);
						}
					});
				}));
			} );

			//process data when groups and tags are loaded
			return Promise.all(aPromises).then(function (aData) {
				this._onMetadataLoaded(sFontName, aData[0], aData[1]);
			}.bind(this), function (oError) {
				this._onError(oError);
			}.bind(this));
		},

		/**
		 * Post process all data for display in the icon explorer
		 * @param {string} sFontName name of currently selected font to be loaded
		 * @private
		 */
		_onMetadataLoaded : function(sFontName, oGroups, oTags)  {
			var aAllFontsLoaded = this.getProperty("/AllFontsLoaded");
			// store in model which fonts are loaded (IconPool.fontLoaded returns promise if font was loaded, undefined otherwise)
			if (sFontName === "SAP-icons" || IconPool.fontLoaded(sFontName)) {
				aAllFontsLoaded[sFontName] = true;
			} else {
				aAllFontsLoaded[sFontName] = false;
			}

			this.setProperty("/AllFontsLoaded", aAllFontsLoaded);


			// process groups and tags
			this._processGroups(oGroups);
			this._processTags(sFontName, oTags, oGroups);

			var aAllFonts = this.getProperty("/AllFonts");
			aAllFonts.push({name: sFontName});

			this.setProperty("/AllFonts", aAllFonts);

			// trace elapsed time
			jQuery.sap.log.info("IconModel: Loaded and sorted all icons of " + sFontName + " in " + (new Date().getTime() - this._iStartTime) + " ms");

			// set the model data
			this.setProperty("/" + sFontName, oGroups);
		},

		/**
		 * Fires a request failed event in case the metadata for the icons could not be read
		 * @param {object} oResponse the response object from the ajax request
		 * @private
		 */
		_onError: function (oResponse) {
			oResponse.error = "Failed to load the icon metadata, check for parse errors";
			this.fireRequestFailed({response: oResponse});
		},

		/**
		 * Processes all groups: sort groups by name and enrich the model data
		 * Sorting is done in the model once for faster processing in the views
		 * @param {string} sFontName name of currently selected font to be loaded
		 * @private
		 */
		_processGroups : function(oGroups) {
			oGroups.groups.sort(Sorter.sortByName);
			oGroups.groups.forEach(function (oInnerGroup) {
				if (oInnerGroup.icons) {
					oInnerGroup.count = oInnerGroup.icons.length;
					oInnerGroup.icons.sort(Sorter.sortByName);
				}
			});
		},

		/**
		 * Processes all tags.
		 * Create an "all" group for every font under index 0.
		 * Also, create an AllIcons path in the model, that contains icons from all loaded fonts
		 * Relate tags to icons in all groups.
		 * @param {string} sFontName the Name of font we currently want to relate icon tags
		 * @param {Object} oTags raw tag data
		 * @param {Object} oGroups raw group data
		 * @private
		 */
		_processTags : function (sFontName, oTags, oGroups) {
			var	aIconNames = IconPool.getIconNames(sFontName === "SAP-icons" ? undefined : sFontName),
				sIconPath = (sFontName === "SAP-icons" ? "" : sFontName + "/"),
				sDelivery = (["SAP-icons", "SAP-icons-TNT"].indexOf(sFontName) >= 0 ? "OpenUI5" : "SAPUI5");

			// add all icons from icon pool and append tag info
			var aIcons = aIconNames.map(function (sIconName) {
				var oIconMetadata = oTags[sIconName],
					aTags = [];

				if (oIconMetadata) {
					aTags = oIconMetadata.tags.map(function (sTag) {
						return {name: sTag};
					});
				}

				return {
					name : sIconName,
					iconPath : sIconPath,
					font : sFontName,
					delivery : sDelivery,
					tags : aTags,
					tagString : (oIconMetadata ? oIconMetadata.tags.join(" ") : "")
				};
			});
			// Sort the Icons
			aIcons.sort(Sorter.sortByName);

			// add the all group for this font at index 0
			oGroups.groups.splice(0, 0, {
				name : "all",
				text : "All",
				icons : aIcons,
				count : aIcons.length
			});

			// Add all icons of this font to the AllIcons path in IconModel for the global search
			/*var aClonedIcons = aIcons.map(function (oIcon) {
				return jQuery.extend(true, {}, oIcon);
			});*/
			this.setProperty("/AllIcons", this.getProperty("/AllIcons").concat(aIcons));

			// calculate top tag and relate tags to other groups than "all"
			this._calculateTagsPerGroup(oGroups, sFontName);
		},

		/**
		 * Calculates the top tag and relates the tags from the "all" group to each group
		 * @param {string} sFontName name of currently selected font to be loaded
		 * @private
		 */
		_calculateTagsPerGroup: function (oGroups) {
			for (var i = 0; i < oGroups.groups.length; i++) {
				var oTagOccurrence = {};

				// Loop over all icons in the current group
				for (var j = 0; j < oGroups.groups[i].icons.length; j++) {
					var oTags = {};
					var aIcon = this._getIconMetadata(oGroups.groups[0], oGroups.groups[i].icons[j]);

					// Copy over tags from all sections
					if (aIcon) {
						oGroups.groups[i].icons[j].tags = aIcon.tags;
						oGroups.groups[i].icons[j].tagString = aIcon.tagString;
						oTags = aIcon.tags;
					} else {
						jQuery.sap.log.info("IconModel: Failed to load tags for " + oGroups.groups[i].icons[j].name);
					}

					// Count tag occurrence for every tag in group
					if (oTags) {
						for (var k = 0; k < oTags.length; k++) {
							if (!oTagOccurrence[oTags[k].name]) {
								oTagOccurrence[oTags[k].name] = 1;
							} else {
								oTagOccurrence[oTags[k].name]++;
							}
						}
					}
				}
				// Sort tags by their occurrence
				var aSortedGroupTags = this._sortGroupTags(oTagOccurrence);

				// Create new tags property for groups and add sorted group tags
				oGroups.groups[i].tags = [];
				for (var x = 0; x < aSortedGroupTags.length; x++) {
					oGroups.groups[i].tags.push({ "name" : aSortedGroupTags[x]});
				}
			}
		},

		/**
		 * Sort tags by their occurrence descending
		 * @param {Object} oTagOccurrence map of tags with their occurance
		 * @returns {string[]} A list of tags sorted by their occurance
		 * @private
		 */
		_sortGroupTags : function (oTagOccurrence) {
			return Object.keys(oTagOccurrence).sort(function (sKey1, sKey2) {
				if (oTagOccurrence[sKey1] === oTagOccurrence[sKey2]) {
					return 0;
				} else if (oTagOccurrence[sKey1] < oTagOccurrence[sKey2]) {
					return 1;
				} else {
					return -1;
				}
			});
		},

		/**
		 * Finds icon metadata in the all group
		 * @param {Object} oAllGroup a map of all icons for the current font
		 * @param {Object} {oCurrentIcon} the item to look up
		 * @returns {Object} the icon metadata requested
		 * @private
		 */
		_getIconMetadata : function (oAllGroup, oCurrentIcon) {
			var aIcons = oAllGroup.icons;
			for ( var i = 0; i < aIcons.length; i++ ) {
				if (aIcons[i].name === oCurrentIcon.name) {
					return aIcons[i];
				}
			}
		}
	});
});
