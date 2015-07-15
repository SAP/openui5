sap.ui.jsview("view.Master", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf view.Master
	*/ 
	getControllerName : function() {
		return "view.Master";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf view.Master
	*/ 
	createContent : function(oController) {

		var oRoundsTable = new sap.m.List({
			items: {
				path: "rounds>/rounds",
				template : new sap.m.StandardListItem({
					title: "{rounds>title}",
					description: "{rounds>start_at} - {rounds>end_at}"
				})
			},
			mode:"SingleSelectMaster",
			selectionChange:[oController.onSelectionChange, oController]
		}).addStyleClass("flagList");
		
 		return new sap.m.Page({
			title: "Rounds",
			content: [
				oRoundsTable
			]
		});
	}

});