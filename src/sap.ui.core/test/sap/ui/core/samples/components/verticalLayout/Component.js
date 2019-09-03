/*!
 * ${copyright}
 */

/* USED IN COMPONENTS QUNIT TEST, DO NOT CHANGE METADATA WITHOUT REFLECTING CHANGES IN Component.qunit.html!!!*/

sap.ui.define(['sap/ui/commons/TextView', 'sap/ui/core/Component', 'sap/ui/core/ComponentContainer', 'sap/ui/core/UIComponent', 'sap/ui/layout/VerticalLayout', 'sap/ui/ux3/NavigationBar', 'sap/ui/ux3/NavigationItem'],
	function(TextView, Component1, ComponentContainer, UIComponent, VerticalLayout, NavigationBar, NavigationItem) {
	"use strict";


	// new Component
	var Component = UIComponent.extend("samples.components.verticalLayout.Component", {
		metadata : {
			"abstract": true,
			version : "1.0",
			includes : [
				"css/vlayout.css",
				 "/js/includeme.js"
			], //array of css and/or javascript files that should be used in the component
			dependencies : { // external dependencies
				libs : ['sap.ui.ux3'], // array of required libraries, e.g. UX3 if your component depends on them
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

	Component.prototype.createContent = function() {
		var oNavBar = new NavigationBar(this.createId("nB"), {
			items:[
				new NavigationItem({key:"item1", text:"Item 1"}),
				new NavigationItem({key:"item2", text:"Item with some text 2"}),
				new NavigationItem({key:"item3", text:"Item with some text 3"})
			]
		});

		var oComp = sap.ui.component({
			name : 'samples.components.styledbutton',
			id : this.createId("comp_button"),
			settings: {
				text: "Hit me"
			}
		});
		var oCompCont = new ComponentContainer(this.createId("ContButton"), {
			component : oComp
		});

		this.oVLayout = new VerticalLayout(this.createId("myLayout"), {
			content: [
				oNavBar,
				new TextView(this.createId("myTF"), {text: this.getProperty("initalText")}),
				oCompCont
			]
		});
		return this.oVLayout;
	};


	return Component;

});
