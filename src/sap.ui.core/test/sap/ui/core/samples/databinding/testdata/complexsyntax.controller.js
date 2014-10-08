sap.ui.controller("testdata.complexsyntax", {
	
	onInit: function() {
	 //alert("Dev controller init");
		
		function onPress(oEvent) {
			alert("pressed");
		}
		
		//this.getElementByLocalId(id).attachPress(onPress);
	},
	
	
	doIt: function(oEvent) {
		//alert(oEvent.getSource().getId() + " does it!");
	},

	
	onBeforeRendering: function() {
	//	alert("Dev controller onBeforeRendering");
	},
	
	onAfterRendering: function() {
		//alert("Dev controller onAfterRendering");
	},
	
	onExit: function() {
		//alert("Dev controller exit");
	},
	
	myFormatter: function(sName) {
		return sName.toUpperCase();
	},
	
	myGenderFormatter: function(sGender) {
		var sValue = 'Mr.';
		if (sGender === "female") {
			sValue = 'Mrs.';
		}
		return sValue;  
	}

});