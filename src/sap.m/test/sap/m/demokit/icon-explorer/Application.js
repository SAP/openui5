jQuery.sap.declare("Application");

jQuery.sap.require("sap.ui.app.Application");
jQuery.sap.require("model.FavoriteModel");
jQuery.sap.require("util.Sorter");

sap.ui.app.Application.extend("Application", {

	init : function() {
		
		// set img model
		var imgModel = new sap.ui.model.json.JSONModel("model/img.json");
		sap.ui.getCore().setModel(imgModel, "img");
		
		// set favorite model
		var favModel = new model.FavoriteModel();
		sap.ui.getCore().setModel(favModel, "fav");
		
		// set groups model	(with asyn processing)
		jQuery.ajax("model/groups.json", {
			dataType: "json",
			success: this.onGroupsLoaded
		});
	},
	
	main : function() {
		
		// place root control in html
		var root = this.getRoot();
		sap.ui.jsview("app", "view.App").placeAt(root);
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
			data.groups.sort(util.Sorter.sortByName);
			
			for (var i = 0 ; i < data.groups.length ; i++) {
				
				// count icons of group
				if (data.groups[i].icons) {
					data.groups[i].count = data.groups[i].icons.length;
				}
				
				// sort icons of group
				if (data.groups[i].icons) {
					data.groups[i].icons.sort(util.Sorter.sortByName);
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
			icons.sort(util.Sorter.sortByName);
			data.groups.splice(0, 0, {
				name : "all",
				text : "All",
				icons : icons,
				count : icons.length
			});
			
			// finally set model
			var groupsModel = new sap.ui.model.json.JSONModel(data);
			groupsModel.setSizeLimit(1000000);
			sap.ui.getCore().setModel(groupsModel);
			
			// trace ellapsed time
			jQuery.sap.log.info("Application.js: Sorted all those groups and icons in " + (new Date().getTime() - time) + " ms");
		}
	}
});