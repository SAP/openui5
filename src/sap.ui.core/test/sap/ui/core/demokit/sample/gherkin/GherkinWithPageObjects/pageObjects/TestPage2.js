sap.ui.define(["sap/ui/test/Opa5","./Common"], function(Opa5,Common){
	"use strict";

	Opa5.createPageObjects({

		onPage2 : {
			baseClass : Common,

			assertions : {
				iShouldSeeThePage2Text : function () {
					//I can call some utility functionality from my common page object, serving as base class
					return this.iShouldSeeTheText("text2","This is Page 2");
				}
			}
		}

	});

});