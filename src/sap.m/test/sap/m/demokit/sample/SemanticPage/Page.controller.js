/**
 * Created by I306504 on 2/10/2015.
 */

sap.ui.controller("sap.m.sample.SemanticPage.Page", {

	onInit: function () {
		//set explored app's demo model on this sample
		var sPath = jQuery.sap.getModulePath("sap.m.sample.SemanticPage", "/sort.json");
		var oModel = new sap.ui.model.json.JSONModel(sPath);
		this.getView().setModel(oModel);
	}

});
