sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/ui/webc/fiori/library'
], function(Controller, JSONModel, library) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.MediaGallery.C", {

		onInit: function () {

			var aMediaGalleryLayout = Object.keys(library.MediaGalleryLayout).map(function(key){return {'key': key};}),
				aMediaGalleryMenuHorizontalAlign = Object.keys(library.MediaGalleryMenuHorizontalAlign).map(function(key){return {'key': key};}),
				aMediaGalleryMenuVerticalAlign = Object.keys(library.MediaGalleryMenuVerticalAlign).map(function(key){return {'key': key};});

			this.oModel = new JSONModel({
				Speakers: sap.ui.require.toUrl("sap/ui/webc/main/images/Speakers_avatar_01.jpg"),
				Screw: sap.ui.require.toUrl("sap/ui/webc/main/images/Screw_avatar_01.jpg"),
				Grass: sap.ui.require.toUrl("sap/ui/webc/main/images/grass.jpg"),
				AmericanFootball: sap.ui.require.toUrl("sap/ui/webc/main/images/283930_shutterstock_56287057.jpg"),
				Lamp: sap.ui.require.toUrl("sap/ui/webc/main/images/Lamp_avatar_01.jpg"),
				Boy: sap.ui.require.toUrl("sap/ui/webc/main/images/274827_274827_l_srgb_s_gl.jpg"),
				galleryTypes: aMediaGalleryLayout,
				horizontalTypes: aMediaGalleryMenuHorizontalAlign,
				verticalTypes: aMediaGalleryMenuVerticalAlign,
				selectedType : aMediaGalleryLayout[0].key,
				selectedHorizontalType : aMediaGalleryMenuHorizontalAlign[0].key,
				selectedVerticalType : aMediaGalleryMenuVerticalAlign[0].key,
				selectedInteractiveDisplayArea: true,
				selectedShowAllThumbnails: false
			});

			this.getView().setModel(this.oModel);
		},
		onSelectType: function (oEvent) {
			this.oModel.setProperty("/selectedType", oEvent.getParameter("selectedItem").getKey());
		},
		onSelectHorizontalType: function (oEvent) {
			this.oModel.setProperty("/selectedHorizontalType", oEvent.getParameter("selectedItem").getKey());
		},
		onSelectVerticalType: function (oEvent) {
			this.oModel.setProperty("/selectedVerticalType", oEvent.getParameter("selectedItem").getKey());
		},
		onInteractiveChange: function (oEvent) {
			this.oModel.setProperty("/selectedInteractiveDisplayArea", oEvent.getParameter('state'));
		},
		onShowAllChange: function (oEvent) {
			this.oModel.setProperty("/selectedShowAllThumbnails", oEvent.getParameter('state'));
		},
		onDisplayAreaClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event displayAreaClick fired.");
			demoToast.show();
		},
		onOverflowClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event overflowClick fired.");
			demoToast.show();
		},
		onSelectionChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event selectionChange fired.");
			demoToast.show();
		}
	});
});