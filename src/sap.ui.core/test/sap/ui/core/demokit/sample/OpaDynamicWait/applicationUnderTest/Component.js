sap.ui.define([
		'sap/ui/core/UIComponent',
		'sap/ui/core/mvc/View',
		'sap/ui/model/json/JSONModel'
	], function(UIComponent, View, JSONModel) {
	"use strict";

	return UIComponent.extend("appUnderTest.Component", {

		metadata: {
			manifest: "json"
		},

		init : function() {
			UIComponent.prototype.init.apply(this, arguments);

			var oData = {
					root:{
						name: "root",
						0: {
							name: "item1",
							0: {
								name: "subitem1",
								0: {
									name: "subsubitem1"
								},
								1: {
									name: "subsubitem2"
								}
							},
							1: {
								name: "subitem2",
								0: {
									name: "subsubitem3"
								}
							}

						},
						1:{
							name: "item2",
							0: {
								name: "subitem3"
							}
						}

					}
			};
			var oModel = new JSONModel(oData);
			this.setModel(oModel);
		}

	});

});
