/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI
 *   OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/m/HBox",
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (HBox, library, UIComponent, View, JSONModel, TestUtils) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return UIComponent.extend("sap.ui.core.sample.odata.v4.ListBindingTemplate.Component", {
		metadata : {
			interfaces : ["sap.ui.core.IAsyncContentCreation"],
			manifest : "json"
		},

		createContent : function () {
			var oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel(),
				oMetaModel = oModel.getMetaModel(),
				bRealOData = TestUtils.isRealOData();

			oMetaModel.setDefaultBindingMode("OneWay");

			const oUriParameters = new URLSearchParams(window.location.search);
			if (oUriParameters.has("setAnnotationChangePromise")) {
				// Note: path must start from EntityContainer of metadata.xml!
				const aAnnotationChanges = [];

				// override localAnnotations.xml ---------------------------------------------------
				aAnnotationChanges.push({ // Note: winding detour doesn't make a difference here ;-)
					path : "/MANAGERS/Manager_to_Team/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENTS/ID"
						+ "@com.sap.vocabularies.Common.v1.Label",
					value : "ID of Equipment" // original: "Equipment ID"
				});
				aAnnotationChanges.push({
					path : "/Equipments/ID@com.sap.vocabularies.Common.v1.Text"
						+ "@com.sap.vocabularies.UI.v1.TextArrangement",
					value : { // original: TextLast
						$EnumMember : "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"
					}
				});

				// override metadata.xml -----------------------------------------------------------
				aAnnotationChanges.push({
					path : "/MANAGERS/ID@com.sap.vocabularies.Common.v1.Label",
					value : "ID of Manager" // original: "ID"
				});
				// Note: MANAGER has no name, thus no Text/-Arrangement possible

				// override/enhance metadata_product.xml -------------------------------------------
				aAnnotationChanges.push({
					path : "/Equipments/EQUIPMENT_2_PRODUCT/ID"
						+ "@com.sap.vocabularies.Common.v1.Label",
					value : "ID of Product" // original: "Product ID"
				});
				aAnnotationChanges.push({
					path : "/Equipments/EQUIPMENT_2_PRODUCT/ID@com.sap.vocabularies.Common.v1.Text",
					value : {$Path : "Name"} // NEW
				});
				aAnnotationChanges.push({
					path : "/Equipments/EQUIPMENT_2_PRODUCT/ID@com.sap.vocabularies.Common.v1.Text"
						+ "@com.sap.vocabularies.UI.v1.TextArrangement",
					value : { // NEW
						$EnumMember : "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"
					}
				});

				// override/enhance metadata_supplier.xml ------------------------------------------
				aAnnotationChanges.push({
					path : "/Equipments/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/SUPPLIER_ID"
						+ "@com.sap.vocabularies.Common.v1.Label",
					value : "ID of Supplier" // original: "Supplier ID"
				});
				//TODO enhance Main.view.xml to support s.th. like AH.getNavigationPath;
				//     w/o that, Supplier_Name is relative to /Equipments :-(
				// aAnnotationChanges.push({
				//    path : "/Equipments/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/SUPPLIER_ID"
				//        + "@com.sap.vocabularies.Common.v1.Text",
				//    value : {$Path : "Supplier_Name"} // NEW
				// });
				aAnnotationChanges.push({
					path : "/Equipments/EQUIPMENT_2_PRODUCT/PRODUCT_2_SUPPLIER/SUPPLIER_ID"
						+ "@com.sap.vocabularies.Common.v1.Text"
						+ "@com.sap.vocabularies.UI.v1.TextArrangement",
					value : { // NEW
						$EnumMember : "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"
					}
				});

				oModel.setAnnotationChangePromise(Promise.resolve(aAnnotationChanges));
			}

			View.create({
				async : true,
				bindingContexts : {
					undefined : oModel.createBindingContext("/Equipments")
				},
				models : {
					// Note: XML Templating creates bindings to default model only!
					undefined : oModel,
					metaModel : oMetaModel,
					ui : new JSONModel({
						sCode : "",
						bCodeVisible : false,
						bRealOData : bRealOData,
						icon : bRealOData ? "sap-icon://building" : "sap-icon://record",
						iconTooltip : bRealOData ? "real OData service" : "mock OData service"
					})
				},
				preprocessors : {
					xml : {
						bindingContexts : {
							data : oModel.createBindingContext("/Equipments")
						},
						models : {
							data : oModel,
							meta : oMetaModel
						}
					}
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ListBindingTemplate.Main"
			}).then(function (oView) {
				oLayout.addItem(oView);
			});

			return oLayout;
		}
	});
});
