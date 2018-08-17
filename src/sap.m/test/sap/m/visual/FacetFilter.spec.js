/*global describe,it,element,by,takeScreenshot,expect*/

describe("sap.m.FacetFilter", function() {
	"use strict";

	it("should load test page",function(){
		expect(takeScreenshot(element(by.id("listUpdateModelAsync")))).toLookAs("initial");
	});

	// verify facet list opens and contains the correct items
	it("should open listUpdateModelAsync FacetFilter", function() {
		var oFacetDialog = element(by.control({ controlType: "sap.m.Dialog" }));
		element(by.id("listUpdateModelAsync")).click();
		expect(takeScreenshot(oFacetDialog)).toLookAs("listUpdateModelAsync_FacetFilter");
	});

	it("should navigate to listUpdateModelAsync FacetFilter second page", function () {
		var oFacetDialog = element(by.control({ controlType: "sap.m.Dialog" }));
		element(by.id("listUpdateModelAsync"))
			.element(by.control({
				controlType: "sap.m.StandardListItem"
			})).click();

		expect(takeScreenshot(oFacetDialog)).toLookAs("listUpdateModelAsync_SecondPage");
	});

	it("should update list in listUpdateModelAsync FacetFilter", function () {
		var oFacetDialog = element(by.control({ controlType: "sap.m.Dialog" }));

		element(by.id("listUpdateModelAsync"))
			.element(by.control({
				controlType: "sap.m.Bar"
			}))
			.element(by.control({
				controlType: "sap.m.Button"
			})).click();

		expect(takeScreenshot(oFacetDialog)).toLookAs("listUpdateModelAsync_updatedFacetPage");
	});
});
