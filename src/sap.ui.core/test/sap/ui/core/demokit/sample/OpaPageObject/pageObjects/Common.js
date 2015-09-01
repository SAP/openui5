sap.ui.define(["sap/ui/test/Opa5"], function(Opa5){
	"use strict";

	var Common = Opa5.extend("myApp.test.pageObjects.Common",{

		//You can have some utility functionality for all Page Objects deriving from it
		//See TestPage1 and TestPage2  
		iShouldSeeTheText : function (sId,sText) {
			return this.waitFor({
				id : sId,
				success : function (oText) {
					Opa5.assert.strictEqual(oText.getText(), sText);
				}
			});
		}
		
	});
	
	return Common;

});