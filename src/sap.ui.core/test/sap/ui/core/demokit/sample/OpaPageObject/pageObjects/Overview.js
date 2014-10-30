sap.ui.define(["sap/ui/test/Opa5"], function(Opa5){
	"use strict";

	//don't repeat yourself in tests
	var fnPress = function(sId){
		return this.waitFor({
			id : sId,
			success : function (oButton) {
				oButton.$().trigger("tap");
			}
		});
	};

	Opa5.createPageObjects({
		
		onTheOverview : {
			actions : {
				iPressOnGoToPage1 : function () {
					//ensure to pass the correct 'this' scope
					return fnPress.call(this, "navToPage1");
				},

				iPressOnGoToPage2 : function () {
					return fnPress.call(this, "navToPage2");
				}
			}
		}
		
	});

});