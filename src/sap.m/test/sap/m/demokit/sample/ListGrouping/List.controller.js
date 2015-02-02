sap.ui.controller("sap.m.sample.ListGrouping.List", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	getGroupHeader: function (oGroup){
		return new sap.m.GroupHeaderListItem( {
			title: oGroup.key,
			upperCase: false
		} );
	}
});
