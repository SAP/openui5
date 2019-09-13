/*!
 * ${copyright}
 */

/**
 * @version @version@
 */
sap.ui.define([
	"sap/m/HBox",
	"sap/ui/core/library",
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View",
	"sap/ui/core/sample/common/Component",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (HBox, library, UIComponent, View, BaseComponent, JSONModel, TestUtils) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = library.mvc.ViewType;

	return BaseComponent.extend("sap.ui.core.sample.odata.v4.ServerDrivenPaging.Component", {
		metadata : {
			manifest : "json"
		},

		createContent : function () {
			var oLayout = new HBox({
					renderType : "Bare"
				}),
				oModel = this.getModel();

			View.create({
				async : true,
				models : {
					undefined : oModel,
					ui : new JSONModel({
						bRealOData : TestUtils.isRealOData()
					})
				},
				type : ViewType.XML,
				viewName : "sap.ui.core.sample.odata.v4.ServerDrivenPaging.Main"
			}).then(function (oView) {
				oLayout.addItem(oView);
			});

			return oLayout;
		},

		exit : function () {
			TestUtils.retrieveData("sap.ui.core.sample.odata.v4.ServerDrivenPaging.sandbox")
				.restore();
			jQuery.sap.unloadResources(
				"sap/ui/core/sample/odata/v4/ServerDrivenPaging/ServerDrivenPagingSandbox.js",
				false /*bPreloadGroup*/, true /*bUnloadAll*/, true /*bDeleteExports*/);
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});