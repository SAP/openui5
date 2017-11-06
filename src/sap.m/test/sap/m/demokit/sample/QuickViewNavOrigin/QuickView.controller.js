sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast'
], function (jQuery, Fragment, Controller, JSONModel, MessageToast) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.QuickViewNavOrigin.QuickView", {

		onInit: function () {
			// create JSON model instance
			this.oModel = new JSONModel();
			// JSON sample data
			this.mData = {
				pages : [
					{
						pageId: "bankPage",
						header: "Company info",
						title: "SAP Bank",
						icon: "sap-icon://building",
						description: "The bank of SAP",
						groups: [
							{
								heading: "Office",
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
								heading: "Contacts",
								elements: [
									{
										label: "Name",
										value: "Johnny Cash",
										elementType: sap.m.QuickViewGroupElementType.pageLink,
										pageLinkId: "contactPage"
									},
									{
										label: "Name",
										value: "James Bonus",
										elementType: sap.m.QuickViewGroupElementType.pageLink,
										pageLinkId: "contactPage"
									},
									{
										label: "Name",
										value: "Maria Leasing",
										elementType: sap.m.QuickViewGroupElementType.pageLink,
										pageLinkId: "contactPage"
									},
									{
										label: "Name",
										value: "Claudia Credit",
										elementType: sap.m.QuickViewGroupElementType.pageLink,
										pageLinkId: "contactPage"
									}
								]
							}
						]
					},
					{
						pageId: "contactPage"
					}

				]
			};

			this.employeeData = {
				"Johnny Cash": {
					pageId: "contactPage",
					header: "Employee Info",
					title: "Johnny Cash",
					icon: "sap-icon://person-placeholder",
					description: "Department Manager",
					groups: [
						{
							heading: "Contact Info",
							elements: [
								{
									label: "Address",
									value: "550 Larkin Street, 4F, Mountain View, CA, 94102 San Francisco USA",
									elementType: sap.m.QuickViewGroupElementType.text
								},
								{
									label: "Email",
									value: "johnny.cash@sapbank.com",
									emailSubject: 'Give me cash',
									elementType: sap.m.QuickViewGroupElementType.email
								},
								{
									label: "Phone",
									value: "+359 888 888 888",
									elementType: sap.m.QuickViewGroupElementType.phone
								}
							]
						},
						{
							heading: "Additional Info",
							elements: [
								{
									label: "Major",
									value: "Cash operations",
									elementType: sap.m.QuickViewGroupElementType.text
								}
							]
						}
					]
				},
				"James Bonus": {
					pageId: "contactPage",
					header: "Employee Info",
					title: "James Bonus",
					icon: "sap-icon://person-placeholder",
					description: "Department Manager",
					groups: [
						{
							heading: "Contact Info",
							elements: [
								{
									label: "Address",
									value: "550 Larkin Street, 4F, Mountain View, CA, 94102 San Francisco USA",
									elementType: sap.m.QuickViewGroupElementType.text
								},
								{
									label: "Email",
									value: "james.bonus@sapbank.com",
									emailSubject: 'Bonus interest',
									elementType: sap.m.QuickViewGroupElementType.email
								},
								{
									label: "Phone",
									value: "+359 777 777 777",
									elementType: sap.m.QuickViewGroupElementType.phone
								}
							]
						},
						{
							heading: "Additional Info",
							elements: [
								{
									label: "Major",
									value: "Bonuses for loyal customers",
									elementType: sap.m.QuickViewGroupElementType.text
								}
							]
						}
					]
				},
				"Maria Leasing": {
					pageId: "contactPage",
					header: "Employee Info",
					title: "Maria Leasing",
					icon: "sap-icon://person-placeholder",
					description: "Department Manager",
					groups: [
						{
							heading: "Contact Info",
							elements: [
								{
									label: "Address",
									value: "550 Larkin Street, 4F, Mountain View, CA, 94102 San Francisco USA",
									elementType: sap.m.QuickViewGroupElementType.text
								},
								{
									label: "Email",
									value: "maria.leasing@sapbank.com",
									emailSubject: 'Leasing',
									elementType: sap.m.QuickViewGroupElementType.email
								},
								{
									label: "Phone",
									value: "+359 555 555 555",
									elementType: sap.m.QuickViewGroupElementType.phone
								}
							]
						},
						{
							heading: "Additional Info",
							elements: [
								{
									label: "Major",
									value: "Financial leasing",
									elementType: sap.m.QuickViewGroupElementType.text
								}
							]
						}
					]
				},
				"Claudia Credit": {
					pageId: "contactPage",
					header: "Employee Info",
					title: "Claudia Credit",
					icon: "sap-icon://person-placeholder",
					description: "Department Manager",
					groups: [
						{
							heading: "Contact Info",
							elements: [
								{
									label: "Address",
									value: "550 Larkin Street, 4F, Mountain View, CA, 94102 San Francisco USA",
									elementType: sap.m.QuickViewGroupElementType.text
								},
								{
									label: "Email",
									value: "claudia.credit@sapbank.com",
									emailSubject: 'Credit',
									elementType: sap.m.QuickViewGroupElementType.email
								},
								{
									label: "Phone",
									value: "+359 666 666 666",
									elementType: sap.m.QuickViewGroupElementType.phone
								}
							]
						},
						{
							heading: "Additional Info",
							elements: [
								{
									label: "Major",
									value: "Real estate & investment credits",
									elementType: sap.m.QuickViewGroupElementType.text
								}
							]
						}
					]
				}
			};

			// set the data for the model
			this.oModel.setData(this.mData);
		},

		onAfterRendering: function () {
			var oButton = this.byId('quickViewBtn');
			oButton.$().attr('aria-haspopup', true);
		},

		openQuickView: function (oEvent, oModel) {
			this.createPopover();

			this._oQuickView.setModel(oModel);

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oQuickView.openBy(oButton);
			});
		},

		handleQuickViewBtnPress: function (oEvent) {
			this.openQuickView(oEvent, this.oModel);
		},

		createPopover: function() {
			if (!this._oQuickView) {
				this._oQuickView = sap.ui.xmlfragment("sap.m.sample.QuickViewNavOrigin.QuickView", this);
				this.getView().addDependent(this._oQuickView);
			}
		},

		onNavigate: function (oEvent) {
			var oNavOrigin = oEvent.getParameter("navOrigin");
			if (oNavOrigin) {
				this.mData.pages.splice(1, 1, this.employeeData[oNavOrigin.getText()]);
				this.oModel.setData(this.mData);
			}
		},

		onExit: function () {
			if (this._oQuickView) {
				this._oQuickView.destroy();
			}
		}
	});


	return CController;

});
