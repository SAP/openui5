/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/commons/Button', 'sap/ui/core/UIComponent', 'sap/ui/model/base/ManagedObjectModel'],
	function(Button, UIComponent, ManagedObjectModel) {
	"use strict";


	// new Component
	var Component = UIComponent.extend("samples.components.styledbutton.Component", {

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


	Component.prototype.init = function(){
		UIComponent.prototype.init.apply(this);
		this.getRootControl().setModel(new ManagedObjectModel(this));
	};

	Component.prototype.createContent = function(){
		return new Button(this.createId("mybutn"), {text: "{/text}"});
	};

	return Component;

});
