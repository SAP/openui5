/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/commons/Button', 'sap/ui/core/UIComponent'],
	function(jQuery, Button, UIComponent) {
	"use strict";


	// new Component
	var Component = UIComponent.extend("samples.components.button.Component", {

		metadata : {
			properties : {
				text: "string"
			}
		}
	});


	Component.prototype.createContent = function() {
		this.oButton = new Button(this.createId("mybutn"));
		return this.oButton; 
	};


	//=============================================================================
	//OVERRIDE OF SETTERS
	//=============================================================================

	/*
	* Overrides setText method of the component to set this text in the button
	*/
	Component.prototype.setText = function(sText) {
		this.oButton.setText(sText);
		this.setProperty("text", sText);
		return this;
	};


	return Component;

});
