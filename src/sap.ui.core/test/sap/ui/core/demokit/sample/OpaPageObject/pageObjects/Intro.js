sap.ui.define(["sap/ui/test/Opa5", "sap/ui/test/actions/Press"], function(Opa5, Press){
	"use strict";

	Opa5.createPageObjects({

		onTheIntro : {
			actions : {
				iPressOnGoToOverview : function () {
					return this.waitFor({
						id : "navToOverview",
						actions: new Press()
					});
				}
			}
		}

	});

});