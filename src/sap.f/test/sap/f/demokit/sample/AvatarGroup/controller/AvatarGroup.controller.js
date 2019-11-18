sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel,  Fragment) {
	"use strict";

	return Controller.extend("sap.f.sample.AvatarGroup.controller.AvatarGroup", {

		onInit: function () {
			this.oModel = new JSONModel();
			this.oModel.loadData(sap.ui.require.toUrl("sap/f/sample/AvatarGroup/model") + "/avatargroup.json", null, false);
			this.getView().setModel(this.oModel, "items");
			this.oSettingsModel = new JSONModel();
			this.oSettingsModel.setData({
				"viewPortPercentWidth": 100
			});
			this.getView().setModel(this.oSettingsModel);
			this.oIndividualModel = new JSONModel();
			this.getView().setModel(this.oIndividualModel, "personData");
			this.oGroupModel = new JSONModel();
			this.oGroupModel.loadData(sap.ui.require.toUrl("sap/f/sample/AvatarGroup/model") + "/avatargroup.json", null, false);
			this.getView().setModel(this.oGroupModel, "groupedAvatars");
		},

		onAfterRendering: function () {
			this._oAvatarGroup = this.getView().byId("avatarGroup");
			this._oSlider = this.getView().byId("slider");
		},

		onSliderMoved: function () {
			var iValue = this._oSlider.getModel().getProperty("/viewPortPercentWidth");

			this.byId("vl1").setWidth(iValue + "%");
		},

		onIndividualPress: function(oEvent) {
			var oEventSource = oEvent.getParameter("eventSource"),
				oBindingInfo;

			if (oEvent.getParameter("overflowButtonPressed")) {
				this.onGroupPress(oEvent);
			} else {
				oBindingInfo = oEventSource.getBindingContext("items").getObject();

				if (!this._oIndividuaLPopover) {
					Fragment.load({
						name: "sap.f.sample.AvatarGroup.view.IndividualPopover",
						controller: this
					}).then(function(oPopover) {
						this._oIndividuaLPopover = oPopover;
						this.getView().addDependent(this._oIndividuaLPopover);
						this.oIndividualModel.setData(this._getAvatarModel(oBindingInfo, oEventSource));
						this._oIndividuaLPopover.openBy(oEventSource);
					}.bind(this));
				} else {
					this._oIndividuaLPopover.close();
					this.oIndividualModel.setData(this._getAvatarModel(oBindingInfo, oEventSource));
					this._oIndividuaLPopover.openBy(oEventSource);
				}
			}
		},

		onGroupPress: function (oEvent) {
			var iItemsCount = this.oModel.getProperty("/totalCount"),
				sGroupType = oEvent.getParameter("groupType"),
				iAvatarsDisplayed = oEvent.getParameter("avatarsDisplayed"),
				oEventSource,
				sTitle;

				if (sGroupType === "Group") {
					oEventSource = oEvent.getSource();
				} else {
					oEventSource = oEvent.getParameter("eventSource");
				}

			if (sGroupType === "Individual") {
				iItemsCount = iItemsCount - oEvent.getParameter("avatarsDisplayed");
			}

			sTitle = "Team Members (" + iItemsCount + ")";
			this.oSettingsModel.setData({
				"popoverTitle": sTitle
			});

			if (!this._oGroupPopover) {
				Fragment.load({
					id: "popoverNavCon",
					name: "sap.f.sample.AvatarGroup.view.GroupPopover",
					controller: this
				}).then(function(oPopover) {
					this._oGroupPopover = oPopover;
					this.getView().addDependent(this._oGroupPopover);
					this._openGroupPopover(oEventSource, sGroupType, iAvatarsDisplayed);
				}.bind(this));
			} else {
				this._oGroupPopover.close();
				this._openGroupPopover(oEventSource, sGroupType, iAvatarsDisplayed);
			}
		},

		onAvatarPress: function (oEvent) {
			var oBindingInfo = oEvent.getSource().getBindingContext("groupedAvatars").getObject(),
				oNavCon =  Fragment.byId("popoverNavCon", "navCon"),
				oDetailPage = Fragment.byId("popoverNavCon", "detail");

			this._oGroupPopover.setContentHeight("375px");
			this._oGroupPopover.setContentWidth("450px");
			this.oIndividualModel.setData(oBindingInfo);
			oNavCon.to(oDetailPage);
			this._oGroupPopover.focus();
		},

		_openGroupPopover: function (oEventSource, sGroupType, iAvatarsDisplayed) {
			var oNavCon = Fragment.byId("popoverNavCon", "navCon"),
				oMainPage = Fragment.byId("popoverNavCon", "main"),
				aContent = this._getContent(sGroupType, iAvatarsDisplayed),
				iNumberOfAvatarsInPopover = aContent.length;

			// Every cell has 68px height + 40px from Popover's header and 8px top margin of the VerticalColumnLayout
			this._sGroupPopoverHeight = (Math.floor(iNumberOfAvatarsInPopover / 2) + iNumberOfAvatarsInPopover % 2) * 68 + 48 + "px";
			this.oGroupModel.setData(aContent);
			this._oGroupPopover.setContentHeight(this._sGroupPopoverHeight);
			oNavCon.to(oMainPage);
			this._oGroupPopover.openBy(oEventSource);
		},

		_getContent: function (sGroupType, iAvatarsDisplayed) {
			var	aAllAvatars = this._oAvatarGroup.getItems(),
				aAvatarsToShowInPopover,
				oBindingInfo;

			if (sGroupType === "Individual") {
				aAvatarsToShowInPopover = aAllAvatars.slice(iAvatarsDisplayed);
			} else {
				aAvatarsToShowInPopover = aAllAvatars;
			}

			return aAvatarsToShowInPopover.map(function (oAvatarGroupItem) {
				oBindingInfo = oAvatarGroupItem.getBindingContext("items").getObject();
				return this._getAvatarModel(oBindingInfo, oAvatarGroupItem);
			}, this);
		},

		_getAvatarModel: function (oBindingInfo, oAvatarGroupItem) {
			return {
				src: oBindingInfo.src,
				initials: oBindingInfo.initials,
				fallbackIcon: oBindingInfo.fallbackIcon,
				backgroundColor: oAvatarGroupItem.getAvatarColor(),
				name: oBindingInfo.name,
				jobPosition: oBindingInfo.jobPosition,
				mobile: oBindingInfo.mobile,
				phone: oBindingInfo.phone,
				email: oBindingInfo.email
			};
		},

		onNavBack: function () {
			var oNavCon = Fragment.byId("popoverNavCon", "navCon");

			this._oGroupPopover.setContentHeight(this._sGroupPopoverHeight);
			oNavCon.back();
		}
	});
});