/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.FacetFilter", function() {
	"use strict";

	it("should load test page",function(){
		expect(takeScreenshot(element(by.id("listUpdateModel")))).toLookAs("initial");
	});

	// verify facet list opens and contains the correct items
	it("should open listUpdateModel FacetFilter", function() {
		var oFacetDialog = element(by.control({ controlType: "sap.m.Dialog" }));
		element(by.id("listUpdateModel")).click();
		expect(takeScreenshot(oFacetDialog)).toLookAs("listUpdateModel_FacetFilter");
	});

	it("should navigate to listUpdateModel FacetFilter second page", function () {
		var oFacetDialog = element(by.control({ controlType: "sap.m.Dialog" }));
		element(by.id("listUpdateModel"))
			.element(by.control({
				controlType: "sap.m.StandardListItem"
			})).click();

		expect(takeScreenshot(oFacetDialog)).toLookAs("listUpdateModel_SecondPage");
	});

	it("should update list in listUpdateModel FacetFilter", function () {
		var oFacetDialog = element(by.control({ controlType: "sap.m.Dialog" }));

		element(by.id("listUpdateModel"))
			.element(by.control({
				controlType: "sap.m.Bar"
			}))
			.element(by.control({
				controlType: "sap.m.Button"
			})).click();

		expect(takeScreenshot(oFacetDialog)).toLookAs("listUpdateModel_updatedFacetPage");
	});
});
