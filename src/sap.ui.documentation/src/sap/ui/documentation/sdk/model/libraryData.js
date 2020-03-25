/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/thirdparty/jquery", 'sap/ui/documentation/library', "sap/base/Log"],function(jQuery, library, Log) {
	"use strict";

	// function to compute the app objects for a demo object
	function createDemoAppData(oDemoAppMetadata, sLibUrl, sLibNamespace) {
		// transform simple demo app link to a configuration object
		var aLinks = [];
		// transform link object to a bindable array of objects
		if (jQuery.isPlainObject(oDemoAppMetadata.links)) {
			aLinks = Object.keys(oDemoAppMetadata.links).map(function (sKey) {
				return {
					name: sKey,
					ref: oDemoAppMetadata.links[sKey]
				};
			});
		}

		var oApp = {
			lib : oDemoAppMetadata.namespace || sLibNamespace,
			name : oDemoAppMetadata.text,
			icon : oDemoAppMetadata.icon,
			desc : oDemoAppMetadata.desc,
			config : oDemoAppMetadata.config,
			teaser : oDemoAppMetadata.teaser,
			category : oDemoAppMetadata.category,
			ref : (oDemoAppMetadata.resolve === "lib" ? sLibUrl : "") + oDemoAppMetadata.ref + "?sap-ui-theme=sap_fiori_3",
			links : aLinks
		};

		return oApp;
	}

	/**
	 * Creates a JSON model structure for both all demo apps in a flat list and demo apps by category
	 * Each library contains a metadata section for demo apps with the following structure (example):
	 * demo: {
	 * 	text: "sap.m", // legacy entry, name of the library
	 * 	links: {
	 *		icon: an index of the icon font
	 *		text: the name of the app
	 *		description: a short description text
	 *		ref: a link to the demo app entry point
	 *		links: an object of links with a key (title) and value (link) each
	 *		category: one of the demo app categories (Showcase/Tutorial/Template/RTA/Misc)
	 *		config: the URL to the demo app configuration for downloading the app
	 * 	}
	 *
	 * Under path /demoApps the following properties can be found: lib, name, icon, desc, type, ref
	 * Under path /demoApps by category the apps are structured by the entry "category" and grouped in batches
	 * of 4 items so that they can be bound to the BlockLayoutRow control directly
	 * @param {array} aLibs an array of the currently loaded UI5 libraries
	 * @param {object} oDocIndicies an object of the currently loaded UI5 library docu metadata
	 * @private
	 */
	function createModelData (aLibs, oDocIndicies) {
		// generate the global model structure
		var aCategories = ["Showcase", "Tutorial", "Template", "RTA", "Misc"];
		var oDemoAppsByCategory = {};

		// create a helper structure for demo apps by category
		aCategories.forEach(function (sCategoryName) {
			oDemoAppsByCategory[sCategoryName] = [];
		});

		// create a model structure that can be bound in the view
		var oData = {
			// all demo apps in the order they were read by the metadata
			demoApps: [],
			// generated rows and cells matching for for the BlockLayout
			demoAppsByCategory: []
		};

		// loop over all libraries and add model data for each demo app
		for (var i = 0; i < aLibs.length; i++) {
			var oDemo = oDocIndicies[aLibs[i]].demo;
			if (!oDemo) {
				continue;
			}

			if (oDemo.links && oDemo.links.length > 0) {
				for (var j = 0; j < oDemo.links.length; j++) {
					var oDemoAppData = createDemoAppData(oDemo.links[j], oDocIndicies[aLibs[i]].libraryUrl, oDemo.text);
					oData.demoApps.push(oDemoAppData);

					// push demo app into helper structure
					if (aCategories.indexOf(oDemoAppData.category) < 0) {
						Log.warning("Demo app category \"" + oDemoAppData.category + "\" not found, correcting demo app \"" + oDemoAppData.name + "\" to \"Misc\"");
						oDemoAppData.category = "Misc";
					}
					if (oDemo.links[j].category !== "Tool") { // Exclude Tools from showing, but preserve them in Download dialog
						oDemoAppsByCategory[oDemoAppData.category].push(oDemoAppData);
					}
				}
			}
		}

		// create a structure in the model data that can be bound to the block layout (an array of rows)
		// each row contains an array with a headline or a maximum of 4 demo apps
		Object.keys(oDemoAppsByCategory).forEach(function (sKey) {
			// early out if category is empty
			if (oDemoAppsByCategory[sKey].length === 0) {
				return;
			}

			var aRows = [];

			// collect n rows for the demo apps itself (start a new row every 4 cells)
			var iCurrentLength = aRows.push([]);
			var iCellCounter = 0;
			for (var i = 0; i < oDemoAppsByCategory[sKey].length; i++) {
				iCellCounter++;
				if (oDemoAppsByCategory[sKey][i].teaser) { // teaser apps take two cells
					iCellCounter++;
				}
				if (iCellCounter > 4) {
					iCurrentLength = aRows.push([]);
					iCellCounter = 0;
				}
				aRows[iCurrentLength - 1].push(oDemoAppsByCategory[sKey][i]);
			}

			// push the category including its rows
			oData.demoAppsByCategory.push({
				categoryId: sKey,
				rows: aRows
			});

		});

		return oData;
	}

	return {
		/**
		 * Fills a JSON model with the demo apps metadata of all available libraries
		 * under path /demoApps the following properties can be found: lib, name, icon, desc, config, category, refs
		 * @param {sap.ui.model.json.JSONModel} oModel the helper JSON model passed in as a reference
		 * @public
		 */
		fillJSONModel: function (oModel) {
			function fnHandleLibInfoLoaded  (aLibs, oDocIndicies) {
				oModel.setProperty("/bFooterVisible", true);
				if (!aLibs) {
					return;
				}

				// set model
				var oModelData = oModel.getData();
				oModel.setData(jQuery.extend(oModelData, createModelData(aLibs, oDocIndicies)));
			}

			// load and process all lib info
			oModel.setProperty("/bFooterVisible", false);
			library._loadAllLibInfo("", "_getDocuIndex", fnHandleLibInfoLoaded);
		}
	};


});