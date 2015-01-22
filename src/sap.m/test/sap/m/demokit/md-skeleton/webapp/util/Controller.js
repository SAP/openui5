jQuery.sap.declare("sap.ui.demo.mdskeleton.util.Controller");

sap.ui.core.mvc.Controller.extend("sap.ui.demo.mdskeleton.util.Controller", {
	getEventBus : function () {
		return this.getOwnerComponent().getEventBus();
	},

	getRouter : function () {
		return sap.ui.core.UIComponent.getRouterFor(this);
	}
});