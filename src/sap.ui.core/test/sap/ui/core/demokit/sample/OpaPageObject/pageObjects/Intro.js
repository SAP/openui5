sap.ui.define(["sap/ui/test/Opa5"], function(Opa5){
	"use strict";

	Opa5.createPageObjects({

		onTheIntro : {
			actions : {
				iPressOnGoToOverview : function () {
					return this.waitFor({
						id : "navToOverview",
						success : function (oNavToOverviewButton) {
							oNavToOverviewButton.$().trigger("tap");
						}
					});
				}
			}
		}
		
	});

});