/*!
 * ${copyright}
 */

jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Button");
jQuery.sap.declare("samples.components.button.Component");

// new Component
sap.ui.core.UIComponent.extend("samples.components.button.Component", {

	metadata : {
		properties : {
			text: "string"
		}
	}
});


samples.components.button.Component.prototype.createContent = function() {
	this.oButton = new sap.ui.commons.Button(this.createId("mybutn"));
	return this.oButton; 
};


//=============================================================================
//OVERRIDE OF SETTERS
//=============================================================================

/*
* Overrides setText method of the component to set this text in the button
*/
samples.components.button.Component.prototype.setText = function(sText) {
	this.oButton.setText(sText);
	this.setProperty("text", sText);
	return this;
};
