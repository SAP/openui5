sap.ui.getCore().attachInit(function() {
	var button = new sap.m.Button({text: "Press me!"});
	button.placeAt("ui5content");
	var input = new sap.m.Input({value: "Change me!"});
	input.placeAt("ui5content");
	var search = new sap.m.SearchField({value: "Change me!"});
	search.placeAt("ui5content");
	jQuery("#htmlcontent").html("<button>Press me!</button><input type=\"text\" value=\"Change me!\">")
})
