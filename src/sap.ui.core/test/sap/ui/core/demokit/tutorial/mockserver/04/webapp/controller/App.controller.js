sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/type/DateTime",
	"sap/m/ObjectListItem",
	"sap/m/ObjectAttribute"
], function(Controller, DateTime, ObjectListItem, ObjectAttribute) {
	"use strict";

	return Controller.extend("sap.ui.demo.MockServer.controller.App", {
		/**
		 * Responds to the button press event.
		 * Upon pressing, we bind the items aggregation of the list to the "Meetups" entityset.
		 * We pass a custom URL parameter "first=3" (assuming our OData BE knows how to process it).
		 */
		onPress: function() {
			var oList = this.byId("list");
			oList.bindItems({
				path: "/Meetups",
				parameters: {
					custom: {
						first: "3"
					}
				},
				template: new ObjectListItem({
					title: "{Title}",
					number: {
						path: 'EventDate',
						type: DateTime,
						formatOptions: {
							style: 'medium'
						}
					},
					attributes: [
						new ObjectAttribute({
							text: "{Description}"
						})
					]
				})
			});
		}
	});

});