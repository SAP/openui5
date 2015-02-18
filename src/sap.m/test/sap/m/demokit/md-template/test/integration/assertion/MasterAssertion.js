sap.ui.define(['sap/ui/test/Opa5', 'sap/ui/test/matchers/AggregationLengthEquals', 'sap/ui/test/matchers/PropertyStrictEquals'],
	function(Opa5, AggregationLengthEquals, PropertyStrictEquals) {
	"use strict";

	return Opa5.extend("sap.ui.demo.mdtemplate.test.integration.assertion.MasterAssertion", {
		
		theMasterListShouldContainGroup20OrLess : function () {
			return this.theMasterListShouldBeGroupedBy('Price 20 or less');
		},
		
		theMasterListShouldContainGroup20OrMore : function () {
			return this.theMasterListShouldBeGroupedBy('Price higher than 20');
		},
		
		theMasterListGroupShouldBeFilteredOnUnitNumberValue20OrLess : function () {
			return this.theMasterListShouldBeFilteredOnUnitNumberValue(20, false, {iLow: 1, iHigh: 2})
		},
		
		theMasterListGroupShouldBeFilteredOnUnitNumberValue20OrMore : function () {
			return this.theMasterListShouldBeFilteredOnUnitNumberValue(20, true, {iLow: 3, iHigh: 11})
		},
		
		theMasterListShouldBeGroupedBy : function (sGroupName) {
			return this.waitFor({
				controlType : "sap.m.GroupHeaderListItem",
				viewName : "Master",
				matchers : [ new PropertyStrictEquals({name : "title", value : sGroupName}) ],
				success : function () {
					ok(true, "Master list is grouped by " + sGroupName + "'");
				},
				errorMessage: "Master list is not grouped by " + sGroupName + "'"
			});
		},
		
		theMasterListShouldNotContainGroupHeaders : function (sField) {
			function fnContainsGroupHeader (oList){
				var fnIsGroupHeader = function (oElement) {
						if(oElement.getMetadata().getName() === 'sap.m.GroupHeaderListItem') {
							return true;
						}
						return false;
					};
				return !oList.getItems().some(fnIsGroupHeader);
			};
			
			return this.waitFor({
				viewName : "Master",
				id : "list",
				matchers : [fnContainsGroupHeader],
				success : function() {
					ok(true, "Master list does not contain a group header although grouping has been removed.");
				},
				errorMessage : "Master list still contains a group header although grouping has been removed."
			});
		},
		
		
		theMasterListShouldBeSortedAscendingOnUnitNumber : function () {
			return this.theMasterListShouldBeSortedAscendingOnField("UnitNumber");
		},
		
		theMasterListShouldBeSortedAscendingOnName : function () {
			return this.theMasterListShouldBeSortedAscendingOnField("Name");
		},
		
		theMasterListShouldBeSortedAscendingOnField : function (sField) {
			function fnCheckSort (oList){
				var oLastValue = null,
					oResult = null,
					fnIsOrdered = function (oElement) {
						var oCurrentValue = oElement.getBindingContext().getProperty(sField);
						if(!oLastValue || oCurrentValue >= oLastValue){
							oLastValue = oCurrentValue;
						} else {
							return false;
						}
						return true;
					};
				
				return oList.getItems().every(fnIsOrdered);
			};
			
			return this.waitFor({
				viewName : "Master",
				id : "list",
				matchers : [fnCheckSort],
				success : function() {
					ok(true, "Master list has been sorted correctly for field '" + sField + "'.");
				},
				errorMessage : "Master list has not been sorted correctly for field '" + sField + "'."
			});
		},
		
		theMasterListShouldBeFilteredOnUnitNumberValue : function(iThreshhold, bGreaterThan, oRange) {
			
			function fnCheckFilter (oList){
				var oResult = null,
					fnIsGreaterThanMaxValue = function (oElement) {
						if (bGreaterThan) {
							return oElement.getBindingContext().getProperty("UnitNumber") < iThreshhold;
						}
						return oElement.getBindingContext().getProperty("UnitNumber") > iThreshhold;
					};
				var aItems = oList.getItems();
				if (oRange) {
					aItems = aItems.slice(oRange.iLow, oRange.iHigh)
				}
				
				return !aItems.some(fnIsGreaterThanMaxValue);
			};
			
			return this.waitFor({
				viewName : "Master",
				id : "list",
				matchers : [fnCheckFilter],
				success : function(bResult){
					ok(true, "Master list has been filtered correctly with filter value '" + iThreshhold + "'.");
				},
				errorMessage : "Master list has not been filtered correctly with filter value '" + iThreshhold + "'."
			});
		},
		
		theMasterListShouldBeFilteredOnUnitNumberValueMoreThan100 : function(){
			return this.theMasterListShouldBeFilteredOnUnitNumberValue(100, true);
		},
		
		theMasterListShouldBeFilteredOnUnitNumberValueLessThan100 : function(){
			return this.theMasterListShouldBeFilteredOnUnitNumberValue(100);
		},
		
		iShouldSeeTheMasterList : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				success : function (oList) {
					ok(oList, "Found the object List");
				},
				errorMessage : "Can't see the master list."
			});
		},
		
		theMasterListShowsObject2 : function () {
			return this.waitFor({
				controlType : "sap.m.ObjectListItem",
				viewName : "Master",
				matchers : [ new PropertyStrictEquals({name : "title", value : "Object 2"}) ],
				success : function () {
					ok(true, "Object 2 is showing");
				},
				errorMessage : "Can't see Object 2 in master list."
			});
		},
		
		theMasterListShouldHave1Entry : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				matchers : [ new AggregationLengthEquals({name : "items", length : 1}) ],
				success : function (oList) {
					strictEqual(oList.getItems().length, 1, "The list has 1 item");
				},
				errorMessage : "List does not have 1 entry."
			});
		},
		
		theMasterListShouldHave9Entries : function () {
			return this.waitFor({
				id : "list",
				viewName : "Master",
				matchers : [ new AggregationLengthEquals({name : "items", length : 9}) ],
				success : function (oList) {
					strictEqual(oList.getItems().length, 9, "The list has 9 items");
				},
				errorMessage : "List does not have 9 entries."
			});
		}
	});
}, /* bExport= */ true);
		