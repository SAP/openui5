/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"./model/FavoriteModel",
	"./util/Sorter"
], function (UIComponent, FavoriteModel, Sorter) {
	"use strict";

	return UIComponent.extend("sap.ui.demokit.icex.Component", {
		
		metadata : {
			includes : [
				"css/style.css"
			]
		},
		
		init : function() {
			
			// call overridden init (calls createContent)
			UIComponent.prototype.init.apply(this, arguments);
			
			var sPath = jQuery.sap.getModulePath("sap.ui.demokit.icex");
			
			// set img model
			var imgModel = new sap.ui.model.json.JSONModel(sPath + "/model/img.json");
			this.setModel(imgModel, "img");
			
			// set favorite model
			var favModel = new FavoriteModel();
			this.setModel(favModel, "fav");
			
			// set groups model	(with asyn processing)
			jQuery.ajax(sPath +  "/model/groups.json", {
				dataType: "json",
				success: jQuery.proxy(this.onGroupsLoaded, this)
			});
			
		},
		
		createContent : function() {
			return sap.ui.jsview("app", "sap.ui.demokit.icex.view.App");
		},
		
		/**
		 * The sorting is done "on-the-model-data" instead of "in-the-data-binding".
		 * Why? The data is rendered with growing lists and as such needs to be already sorted in the model.
		 */
		onGroupsLoaded : function(data)  {
			
			if (data) {
				
				// memorize time (for later tracing)
				var time = new Date().getTime();
				
				// sort groups by name
				data.groups.sort(Sorter.sortByName);
				
				for (var i = 0 ; i < data.groups.length ; i++) {
					
					// count icons of group
					if (data.groups[i].icons) {
						data.groups[i].count = data.groups[i].icons.length;
					}
					
					// sort icons of group
					if (data.groups[i].icons) {
						data.groups[i].icons.sort(Sorter.sortByName);
					}
				}
				
				// add all icons from icon pool
				// MUST BE DONE AFTER GROUP SORT AS THIS GROUP IS EXPECTED AT INDEX 0 IN MASTER VIEW
				jQuery.sap.require("sap.ui.core.IconPool");
				var iconNames = sap.ui.core.IconPool.getIconNames();
				var icons = [];
				for (var i = 0 ; i < iconNames.length ; i++) {
					icons[i] = {
						name : iconNames[i]
					};
				}
				icons.sort(Sorter.sortByName);
				data.groups.splice(0, 0, {
					name : "all",
					text : "All",
					icons : icons,
					count : icons.length
				});
				
				// finally set model
				var groupsModel = new sap.ui.model.json.JSONModel(data);
				groupsModel.setSizeLimit(1000000);
				this.setModel(groupsModel);
				
				// trace ellapsed time
				jQuery.sap.log.info("Component.js: Sorted all those groups and icons in " + (new Date().getTime() - time) + " ms");
			}
		}
	});
});
