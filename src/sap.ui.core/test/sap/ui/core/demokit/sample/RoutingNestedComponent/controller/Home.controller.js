sap.ui.define([
	"sap/ui/core/sample/RoutingNestedComponent/base/BaseController",
	"sap/base/Log",
	"sap/ui/model/json/JSONModel"
], function(Controller, Log, JSONModel) {
	"use strict";
	return Controller.extend("sap.ui.core.sample.RoutingNestedComponent.controller.Home", {
		onInit: function() {
			Log.info(this.getView().getControllerName(), "onInit");

			// HTML string bound to the formatted text control
			var oModel = new JSONModel({
				HTML: "<p>We are now in the Home View of the Root component. By clicking on the other three items (Suppliers, Categories and Products) in the left menu, further components will be loaded and nested into the Root component.</p>" +
				"<p>Each nested component is consisted with 2 Views: List and Detail Views. In the Detail View of the nested component Products, there are controls which lead to a navigation into one of the other nested components. For example, the category or the supplier link in the Detail View of the Products component navigates to the Detail View of the Categories component or the Suppliers component.</p>" +
				"<p>Furthermore, the Detail View of the Categories or Suppliers component integrates the Products component to show a list of products under a certain category or supplier. Clicking on an item in the product list, a navigation is done to the Detail View of the Products component.</p>" +
				"<p>You can find in the following diagram information about the relationships between the components and how the components are integrated into the component hierarchy. The navigation which is done across different components are also shown in the diagram below.</p>"
			});

			this.getView().setModel(oModel);
		}
	});
});
