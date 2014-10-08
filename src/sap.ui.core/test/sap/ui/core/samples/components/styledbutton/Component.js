/*!
 * ${copyright}
 */

jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Button");
jQuery.sap.declare("samples.components.styledbutton.Component");

// new Component
sap.ui.core.UIComponent.extend("samples.components.styledbutton.Component", {

	metadata : {
		properties : {
			text: {	name:"text", type:"string", defaultValue:"Value1" }
		},
		aggregations : {},
		associations : {},
		events : {},
		library: "sap.ui.core.samples.components.styledbutton"
	}
});


samples.components.styledbutton.Component.prototype.init = function(){
	sap.ui.core.UIComponent.prototype.init.apply(this);
	jQuery.sap.require("sap.ui.model.control.ControlModel");
	this.getAggregation("rootControl").setModel(new sap.ui.model.control.ControlModel(this));
};

samples.components.styledbutton.Component.prototype.createContent = function(){
	return new sap.ui.commons.Button(this.createId("mybutn"), {text: "{text}"});
};