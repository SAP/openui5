sap.ui.jsview("sap.m.mvc.DetailPage", {

	getControllerName: function() {
		return "sap.m.mvc.DetailPage";
	},

	/**
	 * Creates the UI of this View
	 * 
	 * @returns {sap.ui.core.Control}
	 */
	createContent: function(oController) {

		var oPage = new sap.m.Page({
			title:"Details",
			showNavButton:true,
			navButtonText: "Countries",
			navButtonPress : [ oController.backTriggered, oController ]
		});

		// create the page content structure
		jQuery.sap.require("sap.ui.core.format.NumberFormat");
		var oList = new sap.m.List({headerText: "Country Details", items:
			[
			 	new sap.m.DisplayListItem({label:"Capital:",value:"{detailInfo/capital}"}),
			 	new sap.m.DisplayListItem({label:"Population:",value:{
			 		path:"detailInfo/population",
			 		formatter:function(iValue){ 
			 			var oFormatter = sap.ui.core.format.NumberFormat.getIntegerInstance({  // format the population count
			 				groupingEnabled: true,
			 				groupingSeparator: "."
			 			}); 
			 			return oFormatter.format(iValue);
			 		}
			 	}}),
			 	new sap.m.DisplayListItem({label:"Currency:",value:"{detailInfo/currency}"}),
			 	new sap.m.DisplayListItem({label:"Area:",value:{
			 		path:"detailInfo/area",
			 		formatter:function(iValue){ 
			 			var oFormatter = sap.ui.core.format.NumberFormat.getIntegerInstance({  // format the population count
			 				groupingEnabled: true,
			 				groupingSeparator: "."
			 			}); 
			 			var formattedNumber = oFormatter.format(iValue);
			 			return formattedNumber + " sq km";
			 		}
			 	}})
			 ]});
		oPage.addContent(oList);
		
		var oFlagArea = new sap.m.VBox({
			alignItems: sap.m.FlexAlignItems.Center,
			items: 
				[
					new sap.m.Label({text:"Flag:"}),
					new sap.m.Image({src:"{detailInfo/flagUrl}",decorative:true,densityAware:false})
				]
		});
		oPage.addContent(oFlagArea);

		this.addEventDelegate({
			onBeforeShow: function(evt) {
				this.setBindingContext(evt.data);
			}
		}, this); // give this (= the View) as additional parameter to make it available inside the delegate's functions as "this" object

		return oPage;
	}

});