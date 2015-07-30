sap.ui.controller("sap.ui.core.mvctest.controller.Product", {


	onInit: function() {
		this.myLayout = this.getView().byId("Layout");

		this.showDetailsLink = this.getView().byId("showMore");
		this.hideDetailsLink = this.getView().byId("hideMore");

		this.myLayout.setWidths(["100px","150px"]);
		this.hideMore();
	},


	showMore: function(oEvent) {
		for (var i = 1; i < 4; i++) {
			this.getView().byId("More"+i).setVisible(true);
			this.getView().byId("TFMore"+i).setVisible(true);
		}
		this.showDetailsLink.setVisible(false);
		this.hideDetailsLink.setVisible(true);
	},

	hideMore: function(oEvent) {
		for (var i = 1; i < 4; i++) {
			this.getView().byId("More"+i).setVisible(false);
			this.getView().byId("TFMore"+i).setVisible(false);
		}
		this.showDetailsLink.setVisible(true);
		this.hideDetailsLink.setVisible(false);
	},
});
