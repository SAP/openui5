jQuery.sap.declare("sap.ui.demo.mdskeleton.test.action.NavigationAction");
jQuery.sap.require("sap.ui.test.Opa5");
var Opa5 = sap.ui.test.Opa5;

sap.ui.demo.mdskeleton.test.action.NavigationAction = Opa5.extend("sap.ui.demo.mdskeleton.test.action.NavigationAction", {
	iPressOnTheObject1 : function (sObjectName) {
		var oObject1Item = null;

		return this.waitFor({
			id : "list",
			viewName : "Master",
			check : function (oList) {
				return oList.getItems().some(function (oItem) {
					if(oItem.getTitle() === "Object 1") {
						oObject1Item = oItem;
						return true;
					}

					return false;
				});
			},
			success : function (oList) {
				oObject1Item.$().trigger("tap");
				ok(oList, "Pressed the Object 1 item");
			},
			errorMessage : "the list did not contain Object 1"
		});
	},

	iChangeTheHashToObject3 : function () {
		return this.waitFor({
			success : function () {
				sap.ui.test.Opa5.getWindow().location.hash = "#/Objects/ObjectID_3";
			}
		});
	},

	iLookAtTheScreen : function () {
		return this;
	}
});