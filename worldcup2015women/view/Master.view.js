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

		var oRoundsTable = new sap.m.List(this.createId("masterList"), {
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

		var oPull2Refresh = new sap.m.PullToRefresh(this.createId("pull2Refresh"), {
			visible: sap.ui.Device.support.touch,
			refresh: [oController.onRefresh, this]
		});

		var oSearchField = new sap.m.SearchField(this.createId("searchField"), {
			showRefreshButton: !sap.ui.Device.support.touch,
			search: [oController.onSearch, this],
			liveChange: [oController.onSearch, this],
			width: "100%"
		});

		var oBar = new sap.m.Bar({
			contentMiddle: oSearchField
		});

 		return new sap.m.Page({
			title: "Rounds",
			subHeader: oBar,
			content: [
				oPull2Refresh,
				oRoundsTable
			]
		});
	}

});
