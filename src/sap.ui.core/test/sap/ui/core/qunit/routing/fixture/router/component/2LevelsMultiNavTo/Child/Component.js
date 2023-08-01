sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/core/Component'
], function(UIComponent, Component) {
	"use strict";

	var ChildComponent = UIComponent.extend("qunit.router.component.2LevelsMultiNavTo.Child.Component", {
		metadata : {
			manifest: "json"
		},
		init : function() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();

			var oParentComponent = Component.getOwnerComponentFor(this);

			oParentComponent.getRouter().navTo("home", {}, {
				home: {
					route: "product",
					parameters: {
						id: "productA"
					}
				}
			});
		}
	});

	return ChildComponent;

});
