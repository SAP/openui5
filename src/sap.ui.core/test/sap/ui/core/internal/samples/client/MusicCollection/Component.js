/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
	"use strict";

	return UIComponent.extend("sap.ui.core.internal.samples.client.MusicCollection.Component", {

		init : function () {
			UIComponent.prototype.init.apply(this, arguments);
			this.setModel(new JSONModel({
				itemsCount : "??"
			}), "ui");
		}
	});
});
