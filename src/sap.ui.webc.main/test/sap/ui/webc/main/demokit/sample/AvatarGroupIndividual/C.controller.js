sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Image",
	"sap/ui/webc/main/Avatar"
], function(Controller, JSONModel, Image, Avatar) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.AvatarGroupIndividual.C", {

		onInit: function() {
			this.oModel = new JSONModel({
				sliderPercentage: 60
			});
			this.getView().setModel(this.oModel);
		},

		onAvatarGroupClick: function(oEvent) {
			if (oEvent.getParameters().overflowButtonClicked) {
				this._onButtonClicked(oEvent.getParameters().targetRef);
			} else {
				this._onAvatarClicked(oEvent.getParameters().targetRef);
			}
		},

		handleSliderChange: function(oEvent) {
			this.oModel.setProperty("sliderPercentage", oEvent.getSource().getValue());
		},

		_onButtonClicked: function(targetRef) {
			var peoplePopover = this.getView().byId("peoplePopover");

			this._populatePeoplePopover();

			peoplePopover.close();
			peoplePopover.showAt(targetRef);
		},

		_onAvatarClicked: function(oAvatar) {
			var personPopover = this.getView().byId("personPopover"),
				popAvatar = this.getView().byId("popAvatar"),
				image = oAvatar.getImage();

			if (image && image.isA('sap.m.Image')) {
				popAvatar.setImage(new Image({
					src: image.getSrc(),
					alt: image.getAlt()
				}));
			} else {
				popAvatar.setImage(null);
				popAvatar.setInitials(oAvatar.getInitials());
				popAvatar.setIcon(oAvatar.getIcon());
				popAvatar.setColorScheme(oAvatar.getColorScheme());
			}

			personPopover.close();
			personPopover.showAt(oAvatar);
		},

		_populatePeoplePopover: function() {
			var avatarGroup = this.getView().byId("avatarGroup");
			var flexBoxPlaceholder = this.getView().byId("placeholder");

			flexBoxPlaceholder.removeAllAggregation("items");

			avatarGroup.getHiddenItems().forEach(function (oAvatar){
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