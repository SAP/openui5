jQuery.sap.declare("sap.ui.demo.tdg.test.action.NavigationAction");
jQuery.sap.require("sap.ui.test.Opa5");
var Opa5 = sap.ui.test.Opa5;

sap.ui.demo.tdg.test.action.NavigationAction = Opa5.extend("sap.ui.demo.tdg.test.action.NavigationAction", {
	iPressOnTheMilkProduct : function (sCategoryName) {
		var oMilkItem = null;

		return this.waitFor({
			id : "list",
			viewName : "Master",
			check : function (oList) {
				return oList.getItems().some(function (oItem) {
					if(oItem.getTitle() === "Milk") {
						oMilkItem = oItem;
						return true;
					}

					return false;
				});
			},
			success : function (oList) {
				oMilkItem.$().trigger("tap");
				ok(oList, "Pressed the milk item");
			},
			errorMessage : "the list did not contain the Milk Product"
		});
	},

	iChangeTheHashToTheThirdProduct : function () {
		return this.waitFor({
			success : function () {
				sap.ui.test.Opa5.getWindow().location.hash = "#/product/2";
			}
		});
	},

	iLookAtTheScreen : function () {
		return this;
	}
});