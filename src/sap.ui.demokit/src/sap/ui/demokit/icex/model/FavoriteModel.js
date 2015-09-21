/*!
 * ${copyright}
 */

jQuery.sap.declare("sap.ui.demokit.icex.model.FavoriteModel");

jQuery.sap.require("jquery.sap.storage");
jQuery.sap.require("sap.ui.demokit.icex.util.Sorter");

sap.ui.model.json.JSONModel.extend("sap.ui.demokit.icex.model.FavoriteModel", {
	
	_STORAGE_KEY : "ICON_EXPLORER_FAVORITES",
	
	_storage : jQuery.sap.storage(jQuery.sap.storage.Type.local),
	
	constructor : function(oSettings) {
		
		// call super constructor
		sap.ui.model.json.JSONModel.apply(this, arguments);
		
		this.setSizeLimit(1000000);
		
		// load data from local storage
		var json = this._storage.get(this._STORAGE_KEY);
		var data = JSON.parse(json);
		
		// default data if storage is empty
		if (!data) {
			data = {
				count : 0,
				icons : []
			};
		}
		
		// set data
		this.setData(data);
	},
	
	isFavorite : function(name) {
		var data = this.getData();
		for (var i = 0; i < data.icons.length ; i++) {
			if (data.icons[i].name === name) {
				return true;
			}
		}
		return false;
	},
	
	toggleFavorite : function(name) {
		
		// update data
		var data = this.getData();
		var favorite = this.isFavorite(name);
		if (favorite) {
			var newIcons = jQuery.grep(data.icons, function(n){
				return n.name != name;
			});
			data.icons = newIcons;
			data.count--;
		} else {
			data.icons[data.icons.length] = {
				name : name
			};
			data.count++;
		}
		
		// sort groups by name
		// (doing this here as i had trouble doing it in controller assumeably due to async load of data)
		data.icons.sort(sap.ui.demokit.icex.util.Sorter.sortByName);
		
		// update model
		this.setData(data);
		
		// update local storage
		var s = JSON.stringify(data);
		this._storage.put(this._STORAGE_KEY, s);
		
		// done
		return !favorite;
	}
});
