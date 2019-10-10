/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/ui/core/sample/common/Controller"
], function (UriParameters, ColumnListItem, Text, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.ServerDrivenPaging.Main", {
		onInit : function () {
			var bCount = UriParameters.fromQuery(window.location.search).get("$count") === "true",
				oTemplate = new ColumnListItem();

			oTemplate.addCell(new Text("index", {
				text : {
					path : "BusinessPartnerID",
					formatter : function () {
						return this.getBindingContext().getIndex();
					}
				}
			}));
			oTemplate.addCell(new Text({text : "{BusinessPartnerID}"}));
			oTemplate.addCell(new Text({text : "{CompanyName}"}));

			this.byId("businessPartnerList").bindItems({
				path : "/BusinessPartnerList",
				parameters : {
					$count : bCount,
					// ensure list has 30 entries for generated test data
					$filter : "BusinessPartnerID lt '0100000030'"
				},
				template : oTemplate
			});

			this.setTitleContext();
		},

		setTitleContext : function () {
			this.byId("businessPartnerListTitle").setBindingContext(
				this.byId("businessPartnerList").getBinding("items").getHeaderContext());
		}
	});
});