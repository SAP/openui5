/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/Button',
	'sap/m/Text',
	'sap/m/Toolbar',
	'sap/ui/core/ComponentContainer',
	'sap/ui/core/UIComponent',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/core/Component'
], function(Button, Text, Toolbar, ComponentContainer, UIComponent, VerticalLayout, BaseComponent) {
	"use strict";

	// new Component
	var Component = UIComponent.extend("sap.ui.test.verticalLayout_legacyAPIs.Component", {
		metadata : {
			"abstract": true,
			version : "1.0",
			includes : [
				"css/vlayout.css",
				 "/js/includeme.js"
			], //array of css and/or javascript files that should be used in the component
			dependencies : { // external dependencies
				libs : ['sap.ui.layout', "sap.m" ], // array of required libraries, if your component depends on them
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
		var oToolbar = new Toolbar({
			id: this.createId("toolbar"),
			content:[
				new Button({text:"Button 1"}),
				new Button({text:"Button with some text 2"}),
				new Button({text:"Button with some text 3"})
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
				oToolbar,
				new Text(this.createId("myText"), {text: this.getProperty("initalText")}),
				oCompCont
			]
		});
		return this.oVLayout;
	};


	return Component;

});
