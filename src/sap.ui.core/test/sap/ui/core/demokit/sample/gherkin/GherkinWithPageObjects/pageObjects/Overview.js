sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/actions/Press"], function(Opa5, Press){
	"use strict";

	//don't repeat yourself in tests
	var fnPress = function(sId){
		return this.waitFor({
			id : sId,
			actions: new Press()
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