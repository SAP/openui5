sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/f/cardsdemo/model/CardPlaygroundModel"
], function (UIComponent, CardsPlayground) {
	"use strict";

	var Component = UIComponent.extend("sap.f.cardsdemo.cardcontent.transparent.component.Component", {

	init: function () {
		// call the init function of the parent
		UIComponent.prototype.init.apply(this, arguments);

		this.setModel(CardsPlayground, "cardsPlayground");
	}
	});

	return Component;
});
