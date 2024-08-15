sap.ui.define([
	"sap/m/App",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/library",
	"sap/m/Avatar",
	"sap/m/QuickViewCard",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroupElement",
	"sap/m/QuickViewGroup",
	"sap/m/Panel",
	"sap/m/QuickView",
	"sap/m/LightBox",
	"sap/m/LightBoxItem",
	"sap/ui/core/library"
], function(
	App,
	JSONModel,
	Button,
	Page,
	mLibrary,
	Avatar,
	QuickViewCard,
	QuickViewPage,
	QuickViewGroupElement,
	QuickViewGroup,
	Panel,
	QuickView,
	LightBox,
	LightBoxItem,
	coreLibrary
) {
	"use strict";

	//shortcut
	const QuickViewGroupElementType = mLibrary.QuickViewGroupElementType,
		PlacementType = mLibrary.PlacementType,
		HasPopup = coreLibrary.aria.HasPopup;
	//create JSON model instance

		// create JSON model instance
		var oModel = new JSONModel();

		// JSON sample data
		var mData = {
			"pages": [
				{
					pageId	: "customPageId",
					header	: "Employee Info",
					title	: "John Doe John Doe John Doe John Doe John Doe John Doe John Doe John Doe John Doe John Doe John Doe John Doe",
					avatarSrc: "sap-icon://person-placeholder",
					description: "Department Manager1 Department Manager1 Department Manager1 Department Manager1 Department Manager1 Department Manager1",
					groups: [
						{
							heading: "Job",
							elements: [
								{
									label: "Company address",
									value: "Sofia, Boris III, 136A"
								},
								{
									label: "Company",
									value: "SAP AG",
									url: "http://sap.com",
									elementType: QuickViewGroupElementType.pageLink,
									pageLinkId: "customPageId4"
								}
							]
						},
						{
							heading: "Other",
							elements: [
								{
									label: "Email",
									value: "john.dow@sap.com",
									elementType: QuickViewGroupElementType.email
								},
								{
									label: "Phone",
									value: "+359 888 888 888",
									elementType: QuickViewGroupElementType.phone
								},
								{
									label: "Best Friend",
									value: "Michael Muller",
									elementType: QuickViewGroupElementType.pageLink,
									pageLinkId: "customPageId2"
								},
								{
									label: "Favorite Player",
									value: "Ivaylo Ivanov",
									elementType: QuickViewGroupElementType.pageLink,
									pageLinkId: "customPageId3"
								}
							]
						}

					]
				},
				{
					pageId	: "customPageId2",
					header	: "Page 2",
					title	: "Michael Muller",
					description: "Account Manager",
					avatarSrc: "sap-icon://person-placeholder",
					groups: [
						{
							heading: "Job",
							elements: [
								{
									label: "Company",
									value: "SAP AG",
									url: "http://sap.com",
									elementType: QuickViewGroupElementType.pageLink,
									pageLinkId: "customPageId4"
								},
								{
									label: "Company address",
									value: "Sofia, Boris III, 136A"
								}
							]
						},
						{
							heading: "Hobby",
							elements: [
								{
									label: "Name",
									value: "Jaga",
									elementType: "text"
								},
								{
									label: "Level",
									value: "Beginner"
								}

							]
						}

					]
				},
				{
					pageId	: "customPageId3",
					header	: "Page 3",
					title	: "Ivaylo Ivanov",
					description: "Developer",
					avatarSrc: "sap-icon://person-placeholder",
					groups: [
						{
							heading: "Job",
							elements: [
								{
									label: "Company",
									value: "SAP AG",
									url: "http://sap.com",
									elementType: QuickViewGroupElementType.pageLink,
									pageLinkId: "customPageId4"
								},
								{
									label: "Company address",
									value: "Sofia, Boris III, 136A"
								}
							]
						},
						{
							heading: "Hobby",
							elements: [
								{
									label: "Name",
									value: "Table Tennis",
									elementType: "text"
								},
								{
									label: "Level",
									value: "Beginner"
								}

							]
						}

					]
				},
				{
					pageId	: "customPageId4",
					header	: "Company View",
					title	: "SAP AG",
					description: "Run it simple",
					avatarSrc: "sap-icon://building",
					groups: [
						{
							heading: "Contact Information",
							elements: [
								{
									label: "Address",
									value: "Waldorf, Germany",
									url: "http://sap.com",
									elementType: "link"
								},
								{
									label: "Email",
									value: "office@sap.com",
									elementType: "email"
								}
							]
						},
						{
							heading: "Main Contact",
							elements: [
								{
									label: "Name",
									value: "Michael Muller",
									elementType: QuickViewGroupElementType.pageLink,
									pageLinkId: "customPageId2"
								},
								{
									label: "E-mail",
									value: "michael.muller@sap.com",
									elementType: "email"
								},
								{
									label: "Phone",
									value: "+359 888 888 888",
									elementType: "phone"
								},
								{
									label: "Mobile",
									value: "+359 888 999 999",
									elementType: "phone"
								}
							]
						}

					]
				}
			]

		};

		// set the data for the model
		oModel.setData(mData);

		// create and add app
		var app = new App("myApp", {initialPage:"quickViewPage"});
		app.placeAt("body");
		app.setModel(oModel);

		var oQuickView = new QuickView("QV1", {
			placement : PlacementType.VerticalPreferredBottom,
			tooltip: "Employee QuickView",
			pages : {
				path : '/pages',
				template : new QuickViewPage({
					pageId : "{pageId}",
					header: "{header}",
					title: "{title}",
					description: "{description}",
					avatar: new Avatar({
						src:  "{avatarSrc}"
					}),
					groups : {
						path : 'groups',
						template : new QuickViewGroup({
							heading : '{heading}',
							elements : {
								path : 'elements',
								template : new QuickViewGroupElement({
									label: "{label}",
									value: "{value}",
									url: "{url}",
									type: "{elementType}",
									pageLinkId: "{pageLinkId}"
								}),
								templateShareable: true
							}
						}),
						templateShareable: true
					}
				})
			}
		});

		var oQuickView2 = new QuickView("QV2", {
			placement : PlacementType.VerticalPreferredBottom,
			pages : [
				new QuickViewPage({
					header	: "Store",
					title	: "Jumbo Jumbo Jumbo Jumbo Jumbo Jumbo Loooooooooooooooooooooooooong",
					description	: "The best toy store in the USA Loooooooooooooooooooooooooong",
					avatar: new Avatar({
						src: "sap-icon://retail-store"
					}),
					groups	: [
						new QuickViewGroup({
							heading		: "Store details",
							elements	: [
								new QuickViewGroupElement({
									label	: "Address",
									value	: "Sunset Blvd. 7, Los Angeles"
								}),
								new QuickViewGroupElement({
									label	: "Website",
									value	: "http://jumbo.com",
									url 	: "http://jumbo.com",
									type	: QuickViewGroupElementType.link
								}),
								new QuickViewGroupElement({
									label	: "Email",
									value	: "info@jumbo.com",
									type	: QuickViewGroupElementType.email
								}),
								new QuickViewGroupElement({
									label	: "Opening hours",
									value	: "Every day from 8AM to 10PM",
									type	: QuickViewGroupElementType.text
								})
							]
						})
					]
				})
			]
		});

		oQuickView.setModel(oModel);

		var oButton = new Button("QVButton", {
			text: "Open Quick View with binding",
			ariaHasPopup: HasPopup.Dialog,
			press: function() {
				oQuickView.openBy(this);
			}
		});

		var oSinglePageQuickViewButton = new Button("SinglePageQVButton", {
			text: "Open a single page quick view",
			ariaHasPopup: HasPopup.Dialog,
			press: function() {
				oQuickView2.openBy(this);
			}
		});

		var oQuickViewPage = new QuickViewPage({
			header	: "Store",
			title	: "Jumbo",
			description	: "The best toy store in the USA",
			avatar: new Avatar({
				src: "http://www.iconshock.com/img_jpg/SUNNYDAY/general/jpg/128/toy_icon.jpg"
			}),
			groups	: [
				new QuickViewGroup({
					heading		: "Store details",
					elements	: [
						new QuickViewGroupElement({
							label	: "Address",
							value	: "Sunset Blvd. 7, Los Angeles"
						}),
						new QuickViewGroupElement({
							label	: "Website",
							value	: "http://jumbo.com",
							url 	: "http://jumbo.com",
							type	: QuickViewGroupElementType.link
						}),
						new QuickViewGroupElement({
							label	: "Email",
							value	: "info@jumbo.com",
							type	: QuickViewGroupElementType.email
						}),
						new QuickViewGroupElement({
							label	: "Phone",
							value	: "",
							type	: QuickViewGroupElementType.phone
						}),
						new QuickViewGroupElement({
							label	: "Other",
							value	: "",
							type	: QuickViewGroupElementType.text
						}),
						new QuickViewGroupElement({
							label	: "Opening hours",
							value	: "Every day from 8AM to 10PM",
							type	: QuickViewGroupElementType.text
						})
					]
				})
			]
		});

		var oPanel = new Panel('quickViewPagePanel', {
			width : '320px',
			headerText : 'Store',
			content : [
				oQuickViewPage
			]
		});

		var oQuickView3 = new QuickView("QV3", {
			placement : PlacementType.VerticalPreferredBottom,
			tooltip: "Employee QuickView",
			pages : {
				path : '/pages',
				template : new QuickViewPage({
					pageId : "{pageId}",
					header: "{header}",
					title: "{title}",
					titleUrl: "{titleUrl}",
					description: "{description}",
					avatar: new Avatar({
						src:  "{avatarSrc}",
						fallbackIcon: "{avatarFallbackIcon}"
					}),
					groups : {
						path : 'groups',
						template : new QuickViewGroup({
							heading : '{heading}',
							elements : {
								path : 'elements',
								template : new QuickViewGroupElement({
									label: "{label}",
									value: "{value}",
									url: "{url}",
									type: "{elementType}",
									pageLinkId: "{pageLinkId}"
								}),
								templateShareable: true
							}
						}),
						templateShareable: true
					}
				})
			}
		});

		var oModel3 = new JSONModel();

		// JSON sample data
		var mData3 = {
			"pages": [
				{
					pageId	: "customPageId",
					header	: "Fallback icon should be shown",
					title	: "John Doe",
					description: "Department Manager1",
					avatarSrc: "path/to/invalid/icon",
					avatarFallbackIcon: "sap-icon://error",
					groups: [
						{
							heading: "Job",
							elements: [
								{
									label: "Company address",
									value: "Sofia, Boris III, 136A"
								},
								{
									label: "Company",
									value: "SAP AG",
									url: "http://sap.com",
									elementType: QuickViewGroupElementType.pageLink,
									pageLinkId: "customPageId4"
								}
							]
						},
						{
							heading: "Other",
							elements: [
								{
									label: "Email",
									value: "john.dow@sap.com",
									elementType: QuickViewGroupElementType.email
								},
								{
									label: "Best Friend",
									value: "Michael Muller",
									elementType: QuickViewGroupElementType.pageLink,
									pageLinkId: "customPageId2"
								}
							]
						}
					]
				},
				{
					pageId	: "customPageId2",
					header	: "Page 2",
					title	: "Michael Muller",
					description: "Account Manager",
					avatarSrc: "some/invalid/icon",
					avatarFallbackIcon: "sap-icon://person-placeholder",
					groups: [
						{
							heading: "Job",
							elements: [
								{
									label: "Company",
									value: "SAP AG"
								},
								{
									label: "Company address",
									value: "Sofia, Boris III, 136A"
								}
							]
						},
						{
							heading: "Hobby",
							elements: [
								{
									label: "Name",
									value: "Jaga",
									elementType: "text"
								},
								{
									label: "Level",
									value: "Beginner"
								}

							]
						}

					]
				},
				{
					pageId	: "customPageId4",
					header	: "Company View",
					title	: "SAP AG",
					titleUrl: "http://sap.com",
					description: "Run it simple",
					avatar: new Avatar({
						src: "sap-icon://building"
					}),
					groups: [
						{
							heading: "Contact Information",
							elements: [
								{
									label: "Address",
									value: "Waldorf, Germany",
									url: "http://sap.com",
									elementType: "link"
								},
								{
									label: "Email",
									value: "office@sap.com",
									elementType: "email"
								}
							]
						},
						{
							heading: "Main Contact",
							elements: [
								{
									label: "Name",
									value: "Michael Muller",
									elementType: QuickViewGroupElementType.pageLink,
									pageLinkId: "customPageId2"
								},
								{
									label: "E-mail",
									value: "michael.muller@sap.com",
									elementType: "email"
								}
							]
						}
					]
				}
			]

		};

		oModel3.setData(mData3);
		oQuickView3.setModel(oModel3);

		var oQuickView4 = new QuickView("QV4", {
			placement : PlacementType.VerticalPreferredBottom,
			pages : [
				new QuickViewPage({
					header	: "Store",
					title	: "Lorem ipsum dolor sit amet",
					titleUrl: "https://www.sap.com",
					description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla venenatis aliquam nibh, et vulputate risus efficitur id.",
					avatar: new Avatar({
						src: "sap-icon://retail-store"
					}),
					groups	: [
						new QuickViewGroup({
							heading		: "Store details",
							elements	: [
								new QuickViewGroupElement({
									label	: "Address",
									value	: "Sunset Blvd. 7, Los Angeles"
								}),
								new QuickViewGroupElement({
									label	: "Website",
									value	: "https://www.sap.com",
									url 	: "https://www.sap.com",
									type	: QuickViewGroupElementType.link
								}),
								new QuickViewGroupElement({
									label	: "Email",
									value	: "abc@sap.com",
									type	: QuickViewGroupElementType.email
								}),
								new QuickViewGroupElement({
									label	: "Opening hours",
									value	: "Every day from 8AM to 10PM",
									type	: QuickViewGroupElementType.text
								})
							]
						})
					]
				})
			]
		});

		var oQuickView5 = new QuickView("QV5", {
			placement : PlacementType.VerticalPreferredBottom,
			pages : [
				new QuickViewPage({
					header	: "Store",
					title	: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla venenatis aliquam nibh, et vulputate risus efficitur id.o",
					titleUrl: "https://www.sap.com",
					description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla venenatis aliquam nibh, et vulputate risus efficitur id.",
					avatar: new Avatar({
						src: "sap-icon://retail-store"
					}),
					groups	: [
						new QuickViewGroup({
							heading		: "Store details",
							elements	: [
								new QuickViewGroupElement({
									label	: "Address",
									value	: "Sunset Blvd. 7, Los Angeles"
								}),
								new QuickViewGroupElement({
									label	: "Website",
									value	: "https://www.sap.com",
									url 	: "https://www.sap.com",
									type	: QuickViewGroupElementType.link
								}),
								new QuickViewGroupElement({
									label	: "Email",
									value	: "abc@sap.com",
									type	: QuickViewGroupElementType.email
								}),
								new QuickViewGroupElement({
									label	: "Opening hours",
									value	: "Every day from 8AM to 10PM",
									type	: QuickViewGroupElementType.text
								})
							]
						})
					]
				})
			]
		});

		var oQuickView6 = new QuickView({
			placement : PlacementType.VerticalPreferredBottom,
			pages : [
				new QuickViewPage({
					header: "Financial Department",
					title : "Jane Doe",
					description : "Financial Advisor",
					avatar: new Avatar({
						initials: "JD",
						displayShape: "Circle"
					}),
					groups : [
						new QuickViewGroup({
							heading : "Contact Details",
							elements : [
								new QuickViewGroupElement({
									label : "Address",
									value : "Sunset Blvd. 7, Los Angeles"
								}),
								new QuickViewGroupElement({
									label : "Mobile",
									value : "+123456789",
									type : QuickViewGroupElementType.phone
								}),
								new QuickViewGroupElement({
									label : "Email",
									value : "jane.doe@sap.com",
									type : QuickViewGroupElementType.email
								})
							]
						})
					]
				})
			]
		});

		var oQuickView7 = new QuickView({
			placement : PlacementType.VerticalPreferredBottom,
			pages : [
				new QuickViewPage({
					header	: "Store",
					title	: "Lorem ipsum dolor sit amet",
					titleUrl: "https://www.sap.com",
					avatar: new Avatar({
						initials: "JD",
						displayShape: "Circle",
						detailBox: new LightBox({
							imageContent: new LightBoxItem({
								imageSrc: "images/Woman_avatar_01.png",
								title: "LightBox example"
							})
						})
					}),
					groups	: [
						new QuickViewGroup({
							heading		: "Store details",
							elements	: [
								new QuickViewGroupElement({
									label	: "Address",
									value	: "Sunset Blvd. 7, Los Angeles"
								}),
								new QuickViewGroupElement({
									label	: "Website",
									value	: "https://www.sap.com",
									url 	: "https://www.sap.com",
									type	: QuickViewGroupElementType.link
								})
							]
						})
					]
				})
			]
		});

		var oButton3 = new Button({
			text: "Open Quick View with binding and fallback images",
			ariaHasPopup: HasPopup.Dialog,
			press: function() {
				oQuickView3.openBy(this);
			}
		});

		var oButton4 = new Button({
			text: "Open Quick View with links as title - ONE line",
			ariaHasPopup: HasPopup.Dialog,
			press: function() {
				oQuickView4.openBy(this);
			}
		});

		var oButton5 = new Button({
			text: "Open Quick View with links as title - TWO lines (Belize) / THREE lines (Fiori3/Horizon)",
			ariaHasPopup: HasPopup.Dialog,
			press: function() {
				oQuickView5.openBy(this);
			}
		});

		var oButton6 = new Button({
			text: "Open Quick View with avatar",
			ariaHasPopup: HasPopup.Dialog,
			press: function() {
				oQuickView6.openBy(this);
			}
		});

		var oButton7 = new Button({
			text: "Open Quick View with detailBox (not recommended)",
			ariaHasPopup: HasPopup.Dialog,
			press: function() {
				oQuickView7.openBy(this);
			}
		});

		// create and add a page with icon tab bar
		var page = new Page("quickViewPage", {
			title : "Quick View",
			content : [
				oButton,
				oSinglePageQuickViewButton,
				oButton3,
				oButton4,
				oButton5,
				oButton6,
				oButton7,
				oPanel
			]
		});
		app.addPage(page);
});