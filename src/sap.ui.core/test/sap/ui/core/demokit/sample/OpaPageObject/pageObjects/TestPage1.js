sap.ui.define(["sap/ui/test/Opa5","./Common"], function(Opa5,Common){
	"use strict";

	Opa5.createPageObjects({
		onPage1 : {
			baseClass : Common,

			assertions : {
				iShouldSeeThePage1Text : function () {
					//I can call some utility functionality from my common page object, serving as base class
					return this.iShouldSeeTheText("text1","This is Page 1");
				}
			}
		}
	});

});