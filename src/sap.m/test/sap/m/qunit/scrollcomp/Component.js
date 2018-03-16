/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent', 'sap/m/Page', 'sap/m/Panel', 'sap/m/Button'],
	function(jQuery, UIComponent, Page, Panel, Button) {
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
		return sap.ui.getCore().byId(bInScrollContainer ? this._scrollContainerButton : this._noScrollContainerButton);
	};

	Component.prototype.getInnerScrollDelegate = function() {
		return sap.ui.getCore().byId(this._scrollContainer).getScrollDelegate();
	};

	return Component;

});
