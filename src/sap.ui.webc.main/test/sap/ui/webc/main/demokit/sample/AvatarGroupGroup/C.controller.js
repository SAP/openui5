sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Image",
	"sap/ui/webc/main/Avatar"
], function(Controller, JSONModel, Image, Avatar) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.AvatarGroupGroup.C", {

		onInit: function() {
			this.oModel = new JSONModel({
				sliderPercentage: 60
			});
			this.getView().setModel(this.oModel);
		},

		onAvatarGroupClick: function(oEvent) {
			var peoplePopover = this.getView().byId("peoplePopover");

			this._populatePopover();

			peoplePopover.close();
			peoplePopover.showAt(oEvent.getParameters().targetRef);
		},

		handleSliderChange: function(oEvent) {
			this.oModel.setProperty("sliderPercentage", oEvent.getSource().getValue());
		},

		_populatePopover: function() {
			var avatarGroup = this.getView().byId("avatarGroup");
			var flexBoxPlaceholder = this.getView().byId("placeholder");

			flexBoxPlaceholder.removeAllAggregation("items");

			avatarGroup.getItems().forEach(function (oAvatar){
				var image = oAvatar.getImage();
				flexBoxPlaceholder.addAggregation("items", new Avatar({
					initials: oAvatar.getInitials(),
					icon: oAvatar.getIcon(),
					size: oAvatar.getSize(),
					colorScheme: oAvatar.getColorScheme(),
					image: image && image.isA("sap.m.Image") ? new Image({
						src: oAvatar.getImage().getSrc(),
						alt: oAvatar.getImage().getAlt()
					}) : null
				}).addStyleClass("sapUiTinyMargin"));
			});
		}
	});
});