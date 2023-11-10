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
	var Component = UIComponent.extend("sap.ui.test.verticalLayout.Component", {
		metadata : {
			"abstract": true,
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
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
		var oOuterComponent = this;

		return BaseComponent.create({
			name : 'samples.components.styledbutton',
			id : oOuterComponent.createId("comp_button"),
			settings: {
				text: "Hit me"
			}
		}).then(function(oComp) {
			return oOuterComponent.runAsOwner(function() {
				var oToolbar = new Toolbar({
					id: oOuterComponent.createId("toolbar"),
					content:[
						new Button({text:"Button 1"}),
						new Button({text:"Button with some text 2"}),
						new Button({text:"Button with some text 3"})
					]
				});

				var oCompCont = new ComponentContainer(oOuterComponent.createId("ContButton"), {
					component : oComp
				});

				oOuterComponent.oVLayout = new VerticalLayout(oOuterComponent.createId("myLayout"), {
					content: [
						oToolbar,
						new Text(oOuterComponent.createId("myText"), {text: oOuterComponent.getProperty("initalText")}),
						oCompCont
					]
				});
				return oOuterComponent.oVLayout;
			});
		});
	};


	return Component;

});
