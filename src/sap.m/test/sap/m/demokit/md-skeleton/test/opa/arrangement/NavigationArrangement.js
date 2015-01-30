sap.ui.define(['sap/ui/test/Opa5'],
	function(Opa5) {
		"use strict";

		return Opa5.extend("sap.ui.demo.mdskeleton.test.opa.arrangement.NavigationArrangement", {
			iAmOnTheObject1Page : function () {
				var oObject1Item = null;

				return this.waitFor({
					id : "list",
					viewName : "Master",
					check : function (oMasterList) {
						return oMasterList.getItems().some(function (oItem) {
							if(oItem.getTitle() === "Object 1") {
								oObject1Item = oItem;
								return true;
							}

							return false;
						});
					},
					success : function (oMasterList) {
						oObject1Item.$().trigger("tap");
						ok(oMasterList, "Pressed the Object 1 item");
						var oLineItem1 = null;
						this.waitFor({
							id : "lineItemsList",
							viewName : "Detail",
							check : function (oLineItemList) {
								return oLineItemList.getItems().some(function (oItem) {
									if(oItem.getText() === "LineItemID_1") {
										oLineItem1 = oItem;
										return true;
									}

									return false;
								});
							},
							success : function (oLineItemList) {
								oLineItem1.$().trigger("tap");
								ok(oLineItemList, "Pressed the Object 1 item");
							},
							errorMessage : "the list did not contain Object 1"
						})
					},
					errorMessage : "the list did not contain Object 1"
				});
			}
		});
	});
