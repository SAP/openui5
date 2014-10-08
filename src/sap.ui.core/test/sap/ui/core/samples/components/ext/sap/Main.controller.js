sap.ui.controller("samples.components.ext.sap.Main", {

	onInit : function () {
		jQuery.sap.log.info("samples.components.ext.sap.Main - onInit");
	},
	
	destroySub2View: function() {
		this.byId("sub2View").destroy();
	}
	
});