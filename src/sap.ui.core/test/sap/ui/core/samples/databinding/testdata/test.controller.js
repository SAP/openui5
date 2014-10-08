sap.ui.controller("testdata.test", {
	
	onInit: function() {
	 //alert("Dev controller init");
		
		function onPress(oEvent) {
			alert("pressed");
		}
		
		//this.getElementByLocalId(id).attachPress(onPress);
	},
	
	
	doIt: function(oEvent) {
		alert(oEvent.getSource().getId() + " does it!");
	},

	
	onBeforeRendering: function() {
		alert("Dev controller onBeforeRendering");
	},
	
	onAfterRendering: function() {
		//alert("Dev controller onAfterRendering");
	},
	
	onExit: function() {
		alert("Dev controller exit");
	}

});