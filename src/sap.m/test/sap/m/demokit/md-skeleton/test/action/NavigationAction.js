jQuery.sap.declare("sap.ui.demo.mdskeleton.test.action.NavigationAction");
jQuery.sap.require("sap.ui.test.Opa5");
var Opa5 = sap.ui.test.Opa5;

sap.ui.demo.mdskeleton.test.action.NavigationAction = Opa5.extend("sap.ui.demo.mdskeleton.test.action.NavigationAction", {
	iPressOnTheChaiProduct : function (sCategoryName) {
		var oChaiItem = null;

		return this.waitFor({
			id : "list",
			viewName : "Master",
			check : function (oList) {
				return oList.getItems().some(function (oItem) {
					if(oItem.getTitle() === "Chai") {
						oChaiItem = oItem;
						return true;
					}

					return false;
				});
			},
			success : function (oList) {
				oChaiItem.$().trigger("tap");
				ok(oList, "Pressed the Chai item");
			},
			errorMessage : "the list did not contain the Chai Product"
		});
	},

	iChangeTheHashToTheThirdProduct : function () {
		return this.waitFor({
			success : function () {
				sap.ui.test.Opa5.getWindow().location.hash = "#/Products(3)";
			}
		});
	},

	iLookAtTheScreen : function () {
		return this;
	}
});