sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel',
	'sap/f/FlexibleColumnLayoutSemanticHelper'
], function(jQuery, UIComponent, JSONModel, FlexibleColumnLayoutSemanticHelper) {
	'use strict';

	return UIComponent.extend('sap.ui.demo.fiori2.Component', {

		metadata: {
			manifest: 'json'
		},

		init: function () {
			var oModel,
				oProductsModel;

			UIComponent.prototype.init.apply(this, arguments);

			oModel = new JSONModel();
			this.setModel(oModel);

			// set products demo model on this sample
			oProductsModel = new JSONModel(jQuery.sap.getModulePath('sap.ui.demo.mock', '/products.json'));
			oProductsModel.setSizeLimit(1000);
			this.setModel(oProductsModel, 'products');

			this.getRouter().initialize();
		},

		createContent: function () {
			return sap.ui.view({
				viewName: "sap.ui.demo.fiori2.view.App",
				type: "XML"
			});
		},

		getHelper: function () {
			var oFCL = this.getRootControl().byId('flexibleColumnLayout'),
				oSettings = {
					defaultTwoColumnLayoutType: sap.f.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: sap.f.LayoutType.ThreeColumnsMidExpanded
				};

			return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
		}
	});
});