var exactTestData = {};

(function() {

var aTestData = [
	{name: "Country", attributes: [
		{name: "Germany", width: 215, attributes: ["Baden-Württemberg",
		                           "Bayern",
		                           "Berlin",
		                           "Brandenburg",
		                           "Bremen",
		                           "Hamburg",
		                           "Hessen",
		                           "Mecklenburg-Vorpommern",
		                           "Niedersachsen",
		                           "Nordrhein-Westfalen",
		                           "Rheinland-Pfalz",
		                           "Saarland",
		                           "Sachsen",
		                           "Sachsen-Anhalt",
		                           "Schleswig-Holstein",
		                           "Thüringen"]},
		{name: "USA", attributes: ["Alabama",
		                       "Alaska",
		                       "Arizona",
		                       "Arkansas",
		                       "California",
		                       "Colorado",
		                       "Connecticut",
		                       "Delaware",
		                       "Florida",
		                       "Georgia",
		                       "Hawaii",
		                       "Idaho",
		                       "Illinois",
		                       "Indiana",
		                       "Iowa",
		                       "Kansas",
		                       "Kentucky",
		                       "Louisiana",
		                       "Maine",
		                       "Maryland",
		                       "Massachusetts",
		                       "Michigan",
		                       "Minnesota",
		                       "Mississippi",
		                       "Missouri",
		                       "Montana",
		                       "Nebraska",
		                       "Nevada",
		                       "New Hampshire",
		                       "New Jersey",
		                       "New Mexico",
		                       "New York",
		                       "North Carolina",
		                       "North Dakota",
		                       "Ohio",
		                       "Oklahoma",
		                       "Oregon",
		                       "Pennsylvania",
		                       "Rhode Island",
		                       "South Carolina",
		                       "South Dakota",
		                       "Tennessee",
		                       "Texas",
		                       "Utah",
		                       "Vermont",
		                       "Virginia/DC",
		                       "Washington",
		                       "West Virginia",
		                       "Wisconsin",
		                       "Wyoming"]},
		"France", "Italy", "Sweden", "Spain", "Canada", "India", "Japan", "Russia", "Australia", "Austria", "Switzerland"]},
	{name: "Year", attributes: []},
	{name: "Sales Orders", attributes: []},
	{name: "Employees", attributes: []},
	{name: "Vehicle", attributes: [
		{name: "Plane", attributes: [
			{name: "Boeing", attributes: ["747-400",
			                         "747-200",
			                         "747-300",
			                         "747-100",
			                         "747SP",
			                         "777-300",
			                         "777-200"]},
			{name: "Airbus", attributes: ["A310-200",
			                          "A310-300",
			                          "A318-100",
			                          "A319-100",
			                          "A319-200",
			                          "A320-100",
			                          "A320-200",
			                          "A320-300",
			                          "A321-100",
			                          "A321-200",
			                          "A330-200",
			                          "A330-300",
			                          "A340-200",
			                          "A340-300",
			                          "A340-500"]}
		]},
		{name: "Car", attributes: [
			{name: "Audi", attributes: ["A1",
			                        "A3",
			                        "A4",
			                        "A5",
			                        "A6",
			                        "A7",
			                        "A8",
			                        "Q5",
			                        "Q7",
			                        "TT",
			                        "R8"]},
			{name: "BMW", attributes: ["BMW 3",
			                       "BMW 5",
			                       "BMW 6",
			                       "BMW 7",
			                       "BMW 8",
			                       "M3",
			                       "MINI COOPER",
			                       "Z3"]},
			{name: "Some car with a really long manufacturer name", attributes: [
			                       "Some car with a really long name"]}
		]},
		"Bus", "Train", "Ship"]}
];


var oTestDataForJSONModel = {
	atts: [ (function(){
				var res = {};
				var oCountryData = aTestData[0];
				res.name = oCountryData.name;
				res.selected = true;
				res.atts = [];
				
				var fnCreateAttributes = function(oCountry) {
					var atts = [];
					var aData = oCountry.attributes;
					for (var j = 0; j < aData.length; j++) {
						atts.push({name: aData[j], subVals: false});
					}
					return atts;
				};
				
				for (var i = 0; i < aTestData[0].attributes.length; i++) {
					var oCountry = aTestData[0].attributes[i];
					var resCountry;
					if (typeof oCountry == "string") {
						resCountry = {name: oCountry};
						if (oCountry != "Canada") {
							/*subVals not set in case of 'Canada' to test the default behavior (arrow should appear initially and then should disappear on select)*/
							resCountry.subVals = false; 
						}
					} else {
						resCountry = {name: oCountry.name};
						resCountry.atts = fnCreateAttributes(oCountry);
					}
					res.atts.push(resCountry);
				}
				return res;
			})(),
		{
			name: "Year",
			atts: (function(){
				var res = [];
				for (var i = 0; i < 100; i++) {
					res.push({name: ("" + (1950 + i)), subVals: false});
				}
				return res;
			})()
		}
	]
}; 


exactTestData.getDataForJSONModel = function(){
	return oTestDataForJSONModel;
};


exactTestData.createAttributes = function(oAttData, oParent){
	var oAtt = new sap.ui.ux3.ExactAttribute({text: oAttData.name, selected: !!oAttData.selected});
	if (oAttData.width) {
		oAtt.setWidth(oAttData.width);
	}
	oAtt.setAdditionalData({data: (oAttData.name + " (ID: " + oAtt.getId() + ")")});
	oParent.addAttribute(oAtt);
	var bHasSubValues = false;
	for (var idx in oAttData.attributes) {
		var bHasSubValues = true;
		if (typeof oAttData.attributes[idx] == "string") {
			var oAttribute = new sap.ui.ux3.ExactAttribute({text: oAttData.attributes[idx]});
			oAtt.addAttribute(oAttribute);
			oAttribute.setAdditionalData({data: (oAttribute.getText() + " (ID: " + oAttribute.getId() + ")")});
		} else {
			exactTestData.createAttributes(oAttData.attributes[idx], oAtt);
		}
	}
	oAtt.setShowSubAttributesIndicator(bHasSubValues);
};


exactTestData.initAttributes = function(oControl){
	var aData = aTestData;
	if (oControl._bTestDataInitialized) {
		return;
	}
	oControl._bTestDataInitialized = true;

	for (var idx in aData) {
		exactTestData.createAttributes(aData[idx], oControl);
	}

	//Init the Years lazily
	oControl.getAttributes()[1].attachSupplyAttributes(function(oEvent){
		var oAttribute = oEvent.getParameter("attribute");
		for (var i = 0; i < 100; i++) {
			var oAtt = new sap.ui.ux3.ExactAttribute({text: ("" + (1950 + i))});
			oAttribute.addAttribute(oAtt);
			oAtt.setAdditionalData({data: (oAtt.getText() + " (ID: " + oAtt.getId() + ")")});
		}
	});
	oControl.getAttributes()[1].setShowSubAttributesIndicator(true);

	//Init the Sales Orders lazily and reload them on every select
	oControl.getAttributes()[2].attachSupplyAttributes(function(oEvent){
		var oAttribute = oEvent.getParameter("attribute");
		oAttribute.destroyAttributes();
		for (var i = 0; i < 20; i++) {
			var oAtt = new sap.ui.ux3.ExactAttribute({text: ("SO-" + i)});
			oAttribute.addAttribute(oAtt);
			oAtt.setAdditionalData({data: (oAtt.getText() + " (ID: " + oAtt.getId() + ")")});
		}
	});
	oControl.getAttributes()[2].setShowSubAttributesIndicator(true);
	oControl.getAttributes()[2].setAutoActivateSupply(true);

	//Init the Employees lazily and asynchronously and reload them on every select 
	//oControl.getAttributes()[3].setSelected(true);
	oControl.getAttributes()[3].attachSupplyAttributes(function(oEvent){
		var oAttribute = oEvent.getParameter("attribute");
		oAttribute.destroyAttributes();
		setTimeout(function(){
			for (var i = 0; i < 100; i++) {
				var oAtt = new sap.ui.ux3.ExactAttribute({text: ("D0" + (11000 + i))});
				oAttribute.addAttribute(oAtt);
				oAtt.setAdditionalData({data: (oAtt.getText() + " (ID: " + oAtt.getId() + ")")});
			}
			sap.ui.core.BusyIndicator.hide();
		}, 2000);
		sap.ui.core.BusyIndicator.show(500);
	});
	oControl.getAttributes()[3].setShowSubAttributesIndicator(true);
	oControl.getAttributes()[3].setAutoActivateSupply(true);
};


exactTestData.initAttributesForQUnit = function(oControl, sIdPrefix){
	if (!sIdPrefix) {
		sIdPrefix = "";
	}
	function createAttr(sIdx, iSubAttCount) {
		var oAttr = new sap.ui.ux3.ExactAttribute(sIdPrefix + "att" + sIdx, {text: "" + sIdx});
		for (var i = 0; i < iSubAttCount; i++) {
			oAttr.addAttribute(new sap.ui.ux3.ExactAttribute(sIdPrefix + "att" + sIdx + "-" + (i + 1), {text: sIdx + "-" + (i + 1)}));
		}
		return oAttr;
	}
	
	var att = createAttr(1, 1);
	att.setSelected(true);
	oControl.addAttribute(att);
	att = att.getAttributes()[0];
	att.setSelected(true);
	att.addAttribute(new sap.ui.ux3.ExactAttribute(sIdPrefix + "att1-1-1", {text: "1-1-1"}));
	att = createAttr(2, 1);
	att.setSelected(true);
	oControl.addAttribute(att);
	oControl.addAttribute(createAttr(3, 1));
	oControl.addAttribute(createAttr(4, 30));
};

})();
