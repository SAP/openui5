sap.ui.controller("view.Main", {

	onNavButtonPress : function () {
		this.byId("myApp").to(this.byId("secondPage").getId());
	}

});
