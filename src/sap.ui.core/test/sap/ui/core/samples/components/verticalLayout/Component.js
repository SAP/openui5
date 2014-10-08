/*!
 * ${copyright}
 */

/* USED IN COMPONENTS QUNIT TEST, DO NOT CHANGE METADATA WITHOUT REFLECTING CHANGES IN Component.qunit.html!!!*/

jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.layout.VerticalLayout");
jQuery.sap.require("sap.ui.commons.TextView");
jQuery.sap.declare("samples.components.verticalLayout.Component");

// new Component
sap.ui.core.UIComponent.extend("samples.components.verticalLayout.Component", {
	metadata : {
		"abstract": true,
		version : "1.0",
		includes : [
		            "css/vlayout.css",
		            "/js/includeme.js"
		           ],//array of css and/or javascript files that should be used in the component
		dependencies : { // external dependencies
			libs : ['sap.ui.ux3'],// array of required libraries, e.g. UX3 if your component depends on them 
			components : ["samples.components.styledbutton"],
			ui5version : "1.13.0"
		},
		publicMethods: [ "render" ],
		aggregations: {
			"rootControl": { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" } // needs to be set to enable databinding functionality
		},
		properties: {
		 initalText: { name:"initalText", type:"string", defaultValue:"Lorem impsum dolor sit amet" }
		}
	}
});

samples.components.verticalLayout.Component.prototype.createContent = function() {
	var oNavBar = new sap.ui.ux3.NavigationBar(this.createId("nB"), {
		items:[
		       new sap.ui.ux3.NavigationItem({key:"item1", text:"Item 1"}),
		       new sap.ui.ux3.NavigationItem({key:"item2", text:"Item with some text 2"}),
		       new sap.ui.ux3.NavigationItem({key:"item3", text:"Item with some text 3"})
		       ]
	});

	var oComp = sap.ui.component({
		name : 'samples.components.styledbutton',
		id : this.createId("comp_button"),
		settings: {
			text: "Hit me"
		}
	});
	var oCompCont = new sap.ui.core.ComponentContainer(this.createId("ContButton"), {
		component : oComp
	});
	
	this.oVLayout = new sap.ui.layout.VerticalLayout(this.createId("myLayout"), {
		content: [
		          oNavBar,
		          new sap.ui.commons.TextView(this.createId("myTF"), {text: this.getProperty("initalText")}),
		          oCompCont
		         ]
	});
	return this.oVLayout;
};
