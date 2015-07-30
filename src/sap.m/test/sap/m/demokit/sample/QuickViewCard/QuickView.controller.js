sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.QuickViewCard.QuickView", {

		_mData : null,
		_oModel : null,
		onInit: function() {
			//	create JSON model instance
			this._oModel = new JSONModel();

			// JSON sample data
			var mData = {
				pages: [
					{
						pageId: "companyPageId",
						header: "Company info",
						title: "Adventure Company",
						titleUrl: "http://sap.com",
						icon: "sap-icon://building",
						description: "John Doe",
						groups: [
							{
								heading: "Contact Details",
								elements: [
									{
										label: "Phone",
										value: "+001 6101 34869-0",
										elementType: sap.m.QuickViewGroupElementType.phone
									},
									{
										label: "Address",
										value: "550 Larkin Street, 4F, Mountain View, CA, 94102 San Francisco USA",
										elementType: sap.m.QuickViewGroupElementType.text
									}
								]
							},
							{
								heading: "Main Contact",
								elements: [
									{
										label: "Name",
										value: "John Doe",
										elementType: sap.m.QuickViewGroupElementType.pageLink,
										pageLinkId: "companyEmployeePageId"
									},
									{
										label: "Mobile",
										value: "+001 6101 34869-0",
										elementType: sap.m.QuickViewGroupElementType.mobile
									},
									{
										label: "Phone",
										value: "+001 6101 34869-0",
										elementType: sap.m.QuickViewGroupElementType.phone
									},
									{
										label: "Email",
										value: "main.contact@company.com",
										emailSubject : 'Subject',
										elementType: sap.m.QuickViewGroupElementType.email
									}
								]
							}
						]
					},
					{
						pageId: "companyEmployeePageId",
						header: "Employee Info",
						title: "John Doe",
						icon: "sap-icon://person-placeholder",
						description: "Department Manager",
						groups: [
							{
								heading: "Company",
								elements: [
									{
										label: "Name",
										value: "Adventure Company",
										url: "http://sap.com",
										elementType: sap.m.QuickViewGroupElementType.link
									},
									{
										label: "Address",
										value: "Sofia, Boris III, 136A"
									},
									{
										label: "Slogan",
										value: "Innovation through technology"
									}
								]
							},
							{
								heading: "Other",
								elements: [
									{
										label: "Email",
										value: "john.doe@sap.com",
										emailSubject : 'Subject',
										elementType: sap.m.QuickViewGroupElementType.email
									},
									{
										label: "Phone",
										value: "+359 888 888 888",
										elementType: sap.m.QuickViewGroupElementType.mobile
									}
								]
							}
						]
					}
				]
			};

			this._mData = mData;

			// set the data for the model
			this._oModel.setData(this._mData);
			this.getView().setModel(this._oModel);
		},

		onBeforeRendering: function() {
			var oButton = this.getView().byId('buttonBack');
			oButton.setEnabled(false);
		},

		onButtonBackClick : function() {
			var oQuickViewCard = this.getView().byId('quickViewCard');
			oQuickViewCard.navigateBack();
		},

		onHideScrollClick : function() {
			var oQuickViewCard = this.getView().byId('quickViewCard');
			oQuickViewCard.setShowVerticalScrollBar(false);
		},

		onShowScrollClick : function() {
			var oQuickViewCard = this.getView().byId('quickViewCard');
			oQuickViewCard.setShowVerticalScrollBar(true);
		},

		onHideHeaderClick : function() {
			this._mData.pages[0].title = "";
			this._mData.pages[0].icon = "";
			this._mData.pages[0].description = "";
			this._oModel.setData(this._mData);
		},

		onShowHeaderClick : function() {
			this._mData.pages[0].title = "Adventure Company";
			this._mData.pages[0].icon = "sap-icon://building";
			this._mData.pages[0].description = "John Doe";
			this._oModel.setData(this._mData);
		},

		onScrollSwitchChange : function(oEvent) {
			var oQuickViewCard = this.getView().byId('quickViewCard');

			oQuickViewCard.setShowVerticalScrollBar(oEvent.getParameters().state);
		},

		onHeaderSwitchChange : function(oEvent) {
			if (oEvent.getParameters().state) {
				this._mData.pages[0].title = "Adventure Company";
				this._mData.pages[0].icon = "sap-icon://building";
				this._mData.pages[0].description = "John Doe";
			} else {
				this._mData.pages[0].title = "";
				this._mData.pages[0].icon = "";
				this._mData.pages[0].description = "";
			}

			this._oModel.setData(this._mData);
		},

		onNavigate : function(oEvent) {
			var oButton = this.getView().byId('buttonBack');
			oButton.setEnabled(!oEvent.getParameter('isTopPage'));
		}
	});



	return CController;

});
