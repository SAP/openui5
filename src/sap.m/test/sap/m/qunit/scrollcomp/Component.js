/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/m/Page',
	'sap/m/Panel',
	'sap/m/Button',
	"sap/ui/core/Core",
	"sap/ui/core/Element"
],
	function(UIComponent, Page, Panel, Button, oCore, Element) {
	"use strict";

	var Component = UIComponent.extend("samples.scrollcomp.Component", {
		metadata : {
			version : "1.0"
		}
	});


	Component.prototype.createContent = function() {
		var oButton1 = new Button({text: "Button not in ScrollContainer"});
		this._noScrollContainerButton = oButton1.getId();
		var oButton2 = new Button({text: "Button in ScrollContainer"});
		this._scrollContainerButton = oButton2.getId();
		var oPage = new Page({content: oButton2});
		this._scrollContainer = oPage.getId();

		return new Panel({
			height: "300px",
			content: [oButton1, oPage]
		});
	};

	Component.prototype.getTestControl = function(bInScrollContainer) {
		return Element.registry.get(bInScrollContainer ? this._scrollContainerButton : this._noScrollContainerButton);
	};

	Component.prototype.getInnerScrollDelegate = function() {
		return Element.registry.get(this._scrollContainer).getScrollDelegate();
	};

	return Component;

});
