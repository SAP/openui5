sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function(jQuery, Fragment, Controller, JSONModel, MessageToast) {
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
			var oButton = this.byId('buttonBack');
			oButton.setEnabled(false);
		},

		onAfterRendering: function() {
			this.byId("quickViewCardContainer").$().css("maxWidth", "320px");
		},

		onButtonBackClick : function() {
			var oQuickViewCard = this.byId('quickViewCard');
			oQuickViewCard.navigateBack();
		},

		onNavigate : function(oEvent) {
			var oNavOrigin = oEvent.getParameter("navOrigin");

			if (oNavOrigin) {
				MessageToast.show('Link "' + oNavOrigin.getText() + '" was clicked');
			} else {
				MessageToast.show('Back button was clicked');
			}
		},

		onAfterNavigate : function(oEvent) {
			var oButton = this.byId('buttonBack');
			oButton.setEnabled(!oEvent.getParameter('isTopPage'));
		}
	});



	return CController;

});
