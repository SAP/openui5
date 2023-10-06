/* global QUnit, sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/ui/integration/library",
	"sap/ui/integration/cards/ObjectContent",
	"sap/ui/integration/widgets/Card",
	"sap/ui/core/Core",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/util/DateRangeHelper",
	"sap/ui/qunit/utils/MemoryLeakCheck"
], function (
	Log,
	mLibrary,
	coreLibrary,
	library,
	ObjectContent,
	Card,
	Core,
	CardActions,
	RequestDataProvider,
	DateRangeHelper,
	MemoryLeakCheck
) {
	"use strict";

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");

	// shortcut for sap.m.AvatarSize
	var AvatarSize = mLibrary.AvatarSize;
	var AvatarColor = mLibrary.AvatarColor;
	var CardActionType = library.CardActionType;
	var ValueState = coreLibrary.ValueState;

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest_ObjectCard = {
		"sap.app": {
			"id": "test.cards.object.card1",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"firstName": "Donna",
					"lastName": "Moore",
					"position": "Sales Executive",
					"phone": "+1 202 555 5555",
					"email": "my@mymail.com",
					"photo": "images/Woman_avatar_01.png",
					"manager": {
						"firstName": "John",
						"lastName": "Miller",
						"photo": "images/Woman_avatar_01.png"
					},
					"company": {
						"name": "Robert Brown Entertainment",
						"address": "481 West Street, Anytown OH 45066, USA",
						"email": "mail@mycompany.com",
						"emailSubject": "Subject",
						"website": "www.company_a.example.com",
						"url": "http://www.company_a.example.com"
					},
					"showErrorStateIcon": true,
					"showWarningStateIcon": false,
					"showInformationStateIcon": true,
					"CustomSuccessStateIcon": "sap-icon://activity-2"
				}
			},
			"header": {
				"icon": {
					"src": "{photo}"
				},
				"title": "{firstName} {lastName}",
				"subTitle": "{position}"
			},
			"content": {
				"groups": [{
					"title": "Contact Details",
					"items": [{
						"label": "First Name",
						"value": "{firstName}"
					},
					{
						"label": "Last Name",
						"value": "{lastName}"
					},
					{
						"label": "What is your phone number?",
						"showColon": false,
						"value": "{phone}",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "tel:{phone}"
								}
							}
						]
					},
					{
						"label": "Email",
						"value": "{email}",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "mailto:{email}"
								}
							}
						]
					},
					{
						"value": "Error value",
						"state": "Error",
						"type": "Status",
						"showStateIcon": "{showErrorStateIcon}"
					},
					{
						"value": "Warning value",
						"state": "Warning",
						"type": "Status",
						"showStateIcon": "{showWarningStateIcon}"
					},
					{
						"value": "Success value",
						"state": "Success",
						"type": "Status",
						"showStateIcon": "{showInformationStateIcon}",
						"customStateIcon": "{CustomSuccessStateIcon}"
					}
					]
				},
				{
					"title": "Organizational Details",
					"items": [{
						"label": "Direct Manager",
						"value": "{manager/firstName} {manager/lastName}",
						"icon": {
							"src": "{manager/photo}"
						}
					}]
				},
				{
					"title": "Company Details",
					"items": [
						{

							"label": "Company Name",
							"value": "{company/name}"
						},
						{
							"label": "Address",
							"value": "{company/address}"
						},
						{
							"label": "Email",
							"value": "{company/email}",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "mailto:{company/email}?subject={company/emailSubject}"
									}
								}
							]
						},
						{
							"label": "Alt Email",
							"value": "newmail@example.com",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "mailto:newmail@example.com?subject=Mail Subject"
									}
								}
							]
						},
						{
							"label": "Website",
							"value": "{company/website}",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "{company/url}"
									}
								}
							]
						},
						{
							"label": "Rating",
							"type": "RatingIndicator",
							"maxValue": 7,
							"value": 4.5,
							"visualMode": "Full"
						},
						{
							"type": "Image",
							"src": "/images/grass.jpg",
							"alt": "Picture of grass",
							"tooltip": "Green grass",
							"fullWidth": true
						}
					]
				}
				]
			}
		}
	};

	var oManifest_ObjectCard_Visible = {
		"sap.app": {
			"id": "test.cards.object.card2",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"visible": false,
					"firstName": "Donna",
					"lastName": "Moore",
					"position": "Sales Executive",
					"phone": "+1 202 555 5555",
					"email": "my@mymail.com",
					"photo": "images/Woman_avatar_01.png",
					"manager": {
						"firstName": "John",
						"lastName": "Miller",
						"photo": "images/Woman_avatar_02.png"
					},
					"company": {
						"name": "Robert Brown Entertainment",
						"address": "481 West Street, Anytown OH 45066, USA",
						"email": "mail@mycompany.com",
						"emailSubject": "Subject",
						"website": "www.company_a.example.com",
						"url": "http://www.company_a.example.com"
					},
					"team": [
						{
							"name": "SD"
						},
						{
							"name": "GF"
						}
					]
				}
			},
			"header": {
				"icon": {
					"src": "{photo}"
				},
				"title": "{firstName} {lastName}",
				"subTitle": "{position}"
			},
			"content": {
				"groups": [{
					"visible": "{visible}",
					"title": "Contact Details",
					"items": [{
						"label": "First Name",
						"value": "{firstName}"
					},
					{
						"label": "Last Name",
						"value": "{lastName}"
					},
					{
						"label": "Phone",
						"value": "{phone}",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "tel:{phone}"
								}
							}
						]
					},
					{
						"label": "Email",
						"value": "{email}",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "mailto:{email}"
								}
							}
						]
					}
					]
				},
				{
					"title": "Company Details",
					"items": [{
						"visible": false,
						"label": "Company Name",
						"value": "{company/name}"
					},
					{
						"label": "Address",
						"value": "{company/address}"
					},
					{
						"label": "Email",
						"value": "{company/email}",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "mailto:{company/email}?subject={company/emailSubject}"
								}
							}
						]
					},
					{
						"label": "Alt Email",
						"value": "newmail@mail.com",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "mailto:newmail@mail.com?subject=Mail Subject"
								}
							}
						]
					},
					{
						"label": "Website",
						"value": "{company/website}",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "{company/url}"
								}
							}
						]
					},
					{
						"visible": "{visible}",
						"type": "NumericData",
						"mainIndicator": {
							"number": "35",
							"unit": "h",
							"state": "Error",
							"size": "S"
						},
						"sideIndicators": [
							{
								"title": "Target",
								"number": "100",
								"unit": "K"
							},
							{
								"title": "Deviation",
								"number": "34.7",
								"unit": "%"
							}
						],
						"details": "Project Nanga Prabat (Ingo) 0 hours recorded."
					},
					{
						"visible": "{visible}",
						"label": "Team",
						"type": "IconGroup",
						"path": "team",
						"template": {
							"icon": {
								"initials": "{/name}"
							}
						}
					}
					]
				}
				]
			}
		}
	};

	var oManifest_ComplexLayout = {
		"sap.app": {
			"id": "test.cards.object.card3",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"content": {
				"groups": [
					{
						"alignment": "Stretch",
						"items": [
							{
								"type": "NumericData",
								"mainIndicator": {
									"number": "35",
									"unit": "h",
									"state": "Error",
									"size": "S"
								},
								"sideIndicators": [
									{
										"title": "Target",
										"number": "100",
										"unit": "K"
									},
									{
										"title": "Deviation",
										"number": "34.7",
										"unit": "%"
									}
								],
								"details": "Project Nanga Prabat (Ingo) 0 hours recorded."
							}
						]
					},
					{
						"title": "Group",
						"items": [
							{
								"label": "Project",
								"value": "Nanga Prabat"
							}
						]
					},
					{
						"title": "Group",
						"items": [
							{
								"label": "Recorded Hours",
								"value": "0.00h"
							}
						]
					},
					{
						"alignment": "Stretch",
						"items": [
							{
								"value": "Establish the new central entry point experience with relevant content for the user to appear on the landing page.",
								"maxLines": 3,
								"state": "Error",
								"type": "Status"
							}
						]
					},
					{
						"title": "Group",
						"items": [
							{
								"label": "Project",
								"value": "Nanga Prabat"
							}
						]
					},
					{
						"title": "Group",
						"items": [
							{
								"label": "Recorded Hours",
								"value": "0.00h"
							}
						]
					}
				]
			}
		}
	};

	var oManifest_EmptyLabelWithBinding = {
		"sap.app": {
			"id": "test.cards.object.card4",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"isManager": false,
					"firstName": "Alain",
					"lastName": "Chevalier"
				}
			},
			"content": {
				"groups": [
					{
						"items": [
							{
								"label": "{= ${isManager} ? 'Manager' : ''}",
								"value": "{firstName} {lastName}",
								"icon": {
									"src": "sap-icon://account"
								}
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ObjectCardFormControls = {
		"sap.app": {
			"id": "test.cards.object.card5",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"initialSelection": "reason1",
					"initialComment": "Free text comment",
					"initialValue": "Initial value",
					"durationValue": "PT11H12M",
					"reasons": [
						{
							"id": "reason1",
							"title": "Reason 1"
						},
						{
							"id": "reason2",
							"title": "Reason 2"
						}
					],
					"dateRangeValue": {
						"option": "date",
						"optionValues": ["2000-01-01T00:00:00.000Z"]
					}
				}
			},
			"header": {
				"title": "PR255 - MacBook Purchase"
			},
			"content": {
				"groups": [
					{
						"alignment": "Stretch",
						"items": [
							{
								"id": "reason",
								"label": "Reason",
								"type": "ComboBox",
								"placeholder": "Select",
								"selectedKey": "{/initialSelection}",
								"item": {
									"path": "/reasons",
									"template": {
										"key": "{id}",
										"title": "{title}"
									}
								}
							},
							{
								"id": "comment",
								"label": "Comment",
								"type": "TextArea",
								"value": "{/initialComment}",
								"rows": 4,
								"placeholder": "Comment"
							},
							{
								"id": "userValue",
								"label": "User Value",
								"type": "Input",
								"value": "{/initialValue}",
								"placeholder": "Enter user value"
							},
							{
								"id": "durationValue",
								"label": "Duration",
								"type": "Duration",
								"value": "{/durationValue}"
							},
							{
								"id": "dateRangeValue",
								"label": "Date Range",
								"type": "DateRange",
								"value": {
									"option": "{/dateRangeValue/option}",
									"values": "{/dateRangeValue/optionValues}"
								}
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ObjectCardFormControlsWithValidation = {
		"sap.app": {
			"id": "test.cards.object.card5",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"reasons": [
						{
							"id": "reason1",
							"title": "Reason 1"
						},
						{
							"id": "reason2",
							"title": "Reason 2"
						}
					]
				}
			},
			"header": {
				"icon": {
					"src": "sap-icon://product"
				},
				"title": "PR255 - MacBook Purchase",
				"subTitle": "Procurement Purchase Requisition"
			},
			"content": {
				"groups": [
					{
						"alignment": "Stretch",
						"items": [
							{
								"id": "reason",
								"label": "Reason",
								"type": "ComboBox",
								"placeholder": "Select",
								"selectedKey": "{/selectedKey}",
								"required": true,
								"item": {
									"path": "/reasons",
									"template": {
										"key": "{id}",
										"title": "{title}"
									}
								},
								"validations": [
									{
										"required": true
									}
								]
							},
							{
								"id": "reason2",
								"label": "Reason 2",
								"type": "ComboBox",
								"placeholder": "Select",
								"required": true,
								"item": {
									"path": "/reasons",
									"template": {
										"key": "{id}",
										"title": "{title}"
									}
								},
								"validations": [
									{
										"restrictToPredefinedOptions": true
									}
								]
							},
							{
								"id": "comment",
								"label": "Comment",
								"type": "TextArea",
								"rows": 4,
								"placeholder": "Comment",
								"required": true,
								"validations": [
									{
										"required": true,
										"message": "Value is required"
									},
									{
										"minLength": 10,
										"maxLength": 200,
										"message": "Your comment should be between 10 and 200 characters.",
										"type": "Warning"
									}
								]
							},
							{
								"id": "e-mail",
								"label": "E-mail",
								"type": "TextArea",
								"rows": 1,
								"placeholder": "e-mail",
								"validations": [{
									"required": true,
									"message": "Value is required"
								},
								{
									"pattern": "^\\w+[\\w-+\\.]*\\@\\w+([-\\.]\\w+)*\\.[a-zA-Z]{2,}+$",
									"message": "You should enter a valid e-mail."
								}
								]
							},
							{
								"id": "path",
								"label": "path",
								"type": "TextArea",
								"rows": 1,
								"placeholder": "path",
								"validations": [{
									"required": true,
									"message": "Value is required"
								},
								{
									"pattern": "^\\w+\\\\[\\w+\\.]+$",
									"message": "You should enter a valid path."
								}
								]
							},
							{
								"id": "inputId",
								"label": "Input",
								"type": "Input",
								"placeholder": "Enter user value",
								"validations": [
									{
										"required": true,
										"message": "Value is required"
									}
								]
							},
							{
								"id": "dateRangeValue",
								"label": "Date Range",
								"type": "DateRange",
								"validations": [
									{
										"required": true
									}
								]
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ObjectCardFormControlsWithValidationNoDataNoBinding = {
		"sap.app": {
			"id": "test.cards.object.card5",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"header": {
				"icon": {
					"src": "sap-icon://product"
				},
				"title": "PR255 - MacBook Purchase",
				"subTitle": "Procurement Purchase Requisition"
			},
			"content": {
				"groups": [
					{
						"alignment": "Stretch",
						"items": [
							{
								"id": "name",
								"label": "Name",
								"type": "TextArea",
								"rows": 1,
								"placeholder": "Name",
								"validations": [
									{
										"required": true
									}
								]
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ObjectCardFormControlsSpecialValue = {
		"sap.app": {
			"id": "test.cards.object.card5",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"configuration": {
				"actionHandlers": {
					"submit": {
						"url": "./MOCK.json",
						"method": "GET",
						"parameters": {
							"status": "approved",
							"comment": "{form>/comment}"
						}
					}
				}
			},
			"content": {
				"groups": [
					{
						"alignment": "Stretch",
						"items": [
							{
								"id": "comment",
								"type": "TextArea"
							}
						]
					}
				]
			},
			"footer": {
				"actionsStrip": [
					{
						"text": "Submit",
						"buttonType": "Accept",
						"actions": [
							{
								"type": "Submit"
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ObjectCardFormControlsPublicAPI = {
		"sap.app": {
			"id": "test.cards.object.card5change"
		},
		"sap.card": {
			"type": "Object",
			"content": {
				"groups": [
					{
						"items": [
							{
								"id": "i1",
								"type": "TextArea",
								"validations": [
									{
										"required": true
									}
								]
							},
							{
								"id": "i2",
								"type": "Input",
								"validations": [
									{
										"required": true
									},
									{
										"minLength": 10
									}
								]
							},
							{
								"id": "i3",
								"type": "DateRange",
								"validations": [
									{
										"required": true
									}
								]
							},
							{
								"id": "i4",
								"type": "Duration",
								"validations": [
									{
										"required": true
									}
								]
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ObjectCard_showColon = {
		"sap.app": {
			"id": "test.cards.object.card6",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"data": {
				"json": {
					"firstName": "Donna",
					"lastName": "Moore",
					"position": "Sales Executive",
					"phone": "+1 202 555 5555",
					"email": "my@mymail.com",
					"photo": "images/Woman_avatar_01.png",
					"showErrorStateIcon": true,
					"showWarningStateIcon": false,
					"showInformationStateIcon": true,
					"CustomSuccessStateIcon": "sap-icon://activity-2"
				}
			},
			"header": {
				"icon": {
					"src": "{photo}"
				},
				"title": "{firstName} {lastName}",
				"subTitle": "{position}"
			},
			"content": {
				"groups": [{
					"title": "Contact Details",
					"items": [{
						"label": "First Name",
						"value": "{firstName}"
					},
					{
						"label": "Last Name",
						"value": "{lastName}"
					},
					{
						"label": "What is your phone number?",
						"showColon": false,
						"value": "{phone}",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "tel:{phone}"
								}
							}
						]
					},
					{
						"label": "Email",
						"value": "{email}",
						"actions": [
							{
								"type": "Navigation",
								"parameters": {
									"url": "mailto:{email}"
								}
							}
						]
					}
					]
				}
				]
			}
		}
	};

	QUnit.module("Object Card", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Using manifest", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oObjectContent = this.oCard.getAggregation("_content");
			var oContent = oObjectContent.getAggregation("_content");
			var oHeader = this.oCard.getAggregation("_header");
			var aGroups = oContent.getItems()[0].getContent();
			var oData = oManifest_ObjectCard["sap.card"].data.json;
			var oManifestContent = oManifest_ObjectCard["sap.card"].content;

			Core.applyChanges();

			assert.equal(aGroups.length, 3, "Should have 3 groups.");

			// Header assertions
			assert.equal(oHeader.getTitle(), oData.firstName + " " + oData.lastName, "Should have correct header title.");
			assert.equal(oHeader.getSubtitle(), oData.position, "Should have correct header subtitle.");
			assert.equal(oHeader.getIconSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/Woman_avatar_01.png", "Should have correct header icon source.");

			// Group 1 assertions
			assert.equal(aGroups[0].getItems().length, 12, "Should have 12 items.");
			assert.equal(aGroups[0].getItems()[0].getText(), oManifestContent.groups[0].title, "Should have correct group title.");
			assert.equal(aGroups[0].getItems()[2].getText(), oData.firstName, "Should have correct item value.");
			assert.equal(aGroups[0].getItems()[4].getText(), oData.lastName, "Should have correct item value.");
			assert.equal(aGroups[0].getItems()[6].getItems()[0].getText(), oData.phone, "Should have correct item value.");
			assert.equal(aGroups[0].getItems()[9].getShowStateIcon(), oData.showErrorStateIcon, "Should have correct status icon value.");
			assert.equal(aGroups[0].getItems()[10].getShowStateIcon(), oData.showWarningStateIcon, "Should have correct status icon value.");
			assert.equal(aGroups[0].getItems()[11].getIcon(), oData.CustomSuccessStateIcon, "Should have correct custom status icon value.");
			assert.ok(aGroups[0].getItems()[11].hasStyleClass("sapMObjStatusShowCustomIcon"), "Should have correct class for custom state icon");

			// Group 2 assertions
			assert.equal(aGroups[1].getItems().length, 2, "Should have 2 items.");
			assert.equal(aGroups[1].getItems()[0].getText(), oManifestContent.groups[1].title, "Should have correct group title.");
			assert.equal(aGroups[1].getItems()[1].getItems()[0].getSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/Woman_avatar_01.png", "Should have correct image source.");
			assert.equal(aGroups[1].getItems()[1].getItems()[1].getItems()[1].getText(), oData.manager.firstName + " " + oData.manager.lastName, "Should have correct item value.");

			// Group 3 assertions
			assert.equal(aGroups[2].getItems().length, 14, "Should have 14 items.");
			assert.equal(aGroups[2].getItems()[0].getText(), oManifestContent.groups[2].title, "Should have correct group title.");
			assert.equal(aGroups[2].getItems()[2].getText(), oData.company.name, "Should have correct item value.");
			assert.equal(aGroups[2].getItems()[4].getText(), oData.company.address, "Should have correct item value.");
			assert.equal(aGroups[2].getItems()[6].getItems()[0].getText(), oData.company.email, "Should have correct item value.");
			assert.equal(aGroups[2].getItems()[8].getItems()[0].getText(), "newmail@example.com", "Should have correct item value.");
			assert.equal(aGroups[2].getItems()[10].getItems()[0].getText(), oData.company.website, "Should have correct item value.");
			// Rating Indicator
			assert.ok(aGroups[2].getItems()[12].isA("sap.m.RatingIndicator"), "RatingIndicator is rendered.");
			assert.equal(aGroups[2].getItems()[12].getMaxValue(), 7, "RatingIndicator's maxValue is correctly set.");
			assert.equal(aGroups[2].getItems()[12].getValue(), 4.5, "RatingIndicator's value is correctly set.");
			assert.equal(aGroups[2].getItems()[12].getVisualMode(), "Full", "RatingIndicator's visualMode is correctly set.");
			// Image
			assert.ok(aGroups[2].getItems()[13].isA("sap.m.Image"), "Image is rendered.");
			assert.equal(aGroups[2].getItems()[13].getSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/grass.jpg", "Image's source is correctly set.");
			assert.equal(aGroups[2].getItems()[13].getAlt(), "Picture of grass", "Image's alt text is correctly set.");
			assert.equal(aGroups[2].getItems()[13].getTooltip(), "Green grass", "Image's tooltip is correctly set.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ObjectCard);
	});

	QUnit.test("Spacing between groups are correctly calculated", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oObjectContent = this.getAggregation("_content");
			var oRoot = oObjectContent.getAggregation("_content");
			var oLayout = oRoot.getItems()[0];
			var oEvent = {
				size: {
					width: 400
				},
				oldSize: {
					width: 0
				},
				control: oRoot
			};

			Core.applyChanges();

			//This is the case when 2 groups are in one column and the last group is on another row
			oObjectContent._onResize(oEvent);
			assert.ok(oLayout.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The first group should have the separation class");
			assert.ok(!oLayout.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The second group should not have the separation class");
			assert.ok(oLayout.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The last group should have the separation class");

			//This is the case when all groups are in one column
			oEvent.size.width = 200;
			oObjectContent._onResize(oEvent);
			assert.ok(!oLayout.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
			assert.ok(!oLayout.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
			assert.ok(!oLayout.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");

			//This is the case when all groups are in one row
			oEvent.size.width = 800;
			oObjectContent._onResize(oEvent);
			assert.ok(oLayout.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
			assert.ok(oLayout.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
			assert.ok(!oLayout.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");

			done();
		});

		// Act
		this.oCard.setManifest(oManifest_ObjectCard);
	});

	QUnit.test("Spacing around groups when the last group is 'stretched'", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oObjectContent = this.getAggregation("_content");
			var oRoot = oObjectContent.getAggregation("_content");
			var aItems = oRoot.getItems();
			var oEvent = {
				size: {
					width: 400
				},
				oldSize: {
					width: 0
				},
				control: oRoot
			};

			// Act
			Core.applyChanges();
			oObjectContent._onResize(oEvent);

			// Assert
			assert.strictEqual(oRoot.$().find(".sapFCardObjectGroupLastInColumn").length, 1, "There should be one group marked as last");
			assert.ok(aItems[aItems.length - 1].hasStyleClass("sapFCardObjectGroupLastInColumn"), "The last group should have the 'sapFCardObjectGroupLastInColumn' class");

			done();
		});

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.card3",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"items": [
								{
									"label": "Project",
									"value": "Nanga Prabat"
								}
							]
						},
						{
							"alignment": "Stretch",
							"items": [
								{
									"label": "Project",
									"value": "Nanga Prabat"
								}
							]
						}
					]
				}
			}
		});
	});

	QUnit.test("Visible property", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
				aTestItems = oLayout.getContent()[1].getItems();

			Core.applyChanges();

			assert.ok(oLayout.getDomRef().children[0].classList.contains("sapFCardInvisibleContent"), "Group is hidden");
			assert.notOk(oLayout.getDomRef().children[1].classList.contains("sapFCardInvisibleContent"), "Group should be visible");

			assert.notOk(aTestItems[1].getVisible(), "The group item should not be visible");
			assert.notOk(aTestItems[2].getVisible(), "The group item should not be visible");
			assert.ok(aTestItems[3].getVisible(), "The group item should be visible");
			assert.ok(aTestItems[4].getVisible(), "The group item should be visible");
			assert.ok(aTestItems[5].getVisible(), "The numeric data group item should not be visible");
			assert.ok(aTestItems[6].getVisible(), "The icon group group item should not be visible");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ObjectCard_Visible);
	});

	QUnit.test("Visible property of items - determined by binding", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "test.cards.object.visibleItemsWithBinding",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"data": {
						"json": {
							"visible": false
						}
					},
					"content": {
						"groups": [{
							"title": "Contact Details",
							"items": [{
								"label": "First Name",
								"value": "{firstName}",
								"actions": [
									{
										"type": "Navigation",
										"parameters": {
											"url": "example.com"
										}
									}
								],
								"visible": "{visible}"
							},
							{
								"label": "Email",
								"value": "{email}",
								"visible": "{visible}"
							}
							]
						}
						]
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
				aGroupItems = oLayout.getContent()[0].getItems();

			Core.applyChanges();

			// Assert
			assert.notOk(aGroupItems[1].getVisible(), "Label for link is NOT visible");
			assert.notOk(aGroupItems[2].getItems()[0].getVisible(), "Link is also NOT visible");
			assert.notOk(aGroupItems[3].getVisible(), "Label for text is NOT visible");
			assert.notOk(aGroupItems[4].getVisible(), "Text is also NOT visible");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("Visible property of items - determined by binding with parameters", function (assert) {
		// Arrange
		var done = assert.async(),
			oManifest = {
				"sap.app": {
					"id": "test.cards.object.visibleItemsWithParameters",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"configuration": {
						"parameters": {
							"group1Visible": {
								"value": "false"
							},
							"group2Visible": {
								"value": "truthy value"
							},
							"groupItem1Visible": {
								"value": ""
							},
							"groupItem2Visible": {
								"value": "null"
							},
							"groupItem3Visible": {
								"value": "undefined"
							}
						}
					},
					"content": {
						"groups": [
							{
								"title": "Title",
								"visible": "{{parameters.group1Visible}}",
								"items": [
									{
										"label": "Label",
										"value": "Value"
									}
								]
							},
							{
								"visible": "{{parameters.group2Visible}}",
								"items": [
									{
										"label": "Label",
										"value": "Value",
										"visible": "{{parameters.groupItem1Visible}}"
									},
									{
										"label": "Label",
										"value": "Value",
										"visible": "{{parameters.groupItem2Visible}}"
									},
									{
										"label": "Label",
										"value": "Value",
										"visible": "{{parameters.groupItem3Visible}}"
									}
								]
							}
						]
					}
				}
			};

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getCardContent(),
				aGroups = oContent.getAggregation("_content").getItems()[0].getContent(),
				oFirstGroup = aGroups[0],
				oSecondGroup = aGroups[1];

			Core.applyChanges();

			// Assert
			assert.strictEqual(oFirstGroup.getVisible(), false, "Group is not visible");
			assert.strictEqual(oSecondGroup.getVisible(), true, "Group is visible");
			oSecondGroup.getItems().forEach(function (oGroupItem) {
				assert.strictEqual(oGroupItem.getVisible(), false, "Group item is not visible");
			});

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest);
	});

	QUnit.test("Icon property", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getCardContent(),
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

			assert.ok(oAvatar.hasStyleClass("sapFCardIcon"), "'sapFCardIcon' class is added");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"src": "sap-icon://error"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Icon default size should be 'XS'", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

			assert.strictEqual(oAvatar.getDisplaySize(), AvatarSize.XS, "Avatar default size is 'XS'");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"src": "sap-icon://error"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Icon allows to set custom 'size'", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

			assert.strictEqual(oAvatar.getDisplaySize(), AvatarSize.M, "'size' from the manifest is applied");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"src": "sap-icon://error",
								"size": "M"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("'backgroundColor' of icon with src", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), AvatarColor.Transparent, "Background should be 'Transparent' when there is only icon.");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"src": "sap-icon://error"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("'backgroundColor' of icon with initials", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0],
				sExpected = oAvatar.getMetadata().getPropertyDefaults().backgroundColor;

			// Assert
			assert.strictEqual(oAvatar.getBackgroundColor(), sExpected, "Background should have default value when there are initials.");
			assert.strictEqual(oAvatar.getInitials(), "AC", "Initials should be correctly set.");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"initials": "AC"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Icon initials set with deprecated 'text' property", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

			// Assert
			assert.strictEqual(oAvatar.getInitials(), "AC", "Initials should be correctly set.");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"text": "AC"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Icon visible property", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				bAvatarVisible = oGroup.getItems()[1].getItems()[0];

			assert.strictEqual(bAvatarVisible.getVisible(), false, "avatar is not visible when visible property is set to false");
			done();
		}.bind(this));

		// Act
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.icon"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"iconVisible": false,
						"title": "Company Details"
					}
				},
				"content": {
					"groups": [{
						"title": "{title}",
						"items": [{
							"icon": {
								"src": "sap-icon://error",
								"visible": "{iconVisible}"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Group title is not rendered when missing from manifest", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getAggregation("_content"),
				bHasTitle = !!oContent.$().find(".sapFCardObjectItemTitle").length;

			assert.strictEqual(bHasTitle, false, "group title is not rendered");
			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.noGroupTitle"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"label": "Label",
							"value": "Value"
						}]
					}]
				}
			}
		});
	});

	QUnit.test("'maxLines' set to text item", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				oText = oGroup.getItems()[0];

			// Assert
			assert.strictEqual(oText.getMaxLines(), 2, "'maxLines' should be set to the inner text control");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.maxLines"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"value": "my text",
							"maxLines": 2
						}]
					}]
				}
			}
		});
	});

	QUnit.test("'size' of NumericData", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				oNumericData = oGroup.getItems()[0].getItems()[0];
			Core.applyChanges();

			// Assert
			assert.ok(oNumericData.$().hasClass("sapMTileSmallPhone"), "Class for small size should be added");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.maxLines"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"type": "NumericData",
							"mainIndicator": {
								"number": "35",
								"size": "S"
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Avatar group with template", function (assert) {
		// Arrange
		var done = assert.async();
		var oCardData = {
			team: [
				{},
				{},
				{}
			]
		};

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				oAvatarGroup = oGroup.getItems()[1];
			Core.applyChanges();

			// Assert
			assert.strictEqual(oAvatarGroup.getItems().length, oCardData.team.length, "Correct number of items should be created");
			oAvatarGroup.getItems().forEach(function (oItem) {
				assert.ok(oItem.getDomRef(), "Item " + oItem.getId() + " should be rendered");
			});

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.avatarGroup"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": oCardData
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Team",
							"type": "IconGroup",
							"path": "team",
							"template": {
								"icon": {
									"src": "{/iconSrc}",
									"initials": "{/name}"
								}
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Properties of item template for avatars are correctly bound", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				oAvatarGroup = oGroup.getItems()[1],
				oItemTemplate = oAvatarGroup.getBindingInfo("items").template;

			// Assert
			assert.strictEqual(oItemTemplate.getBindingPath("src"), "/iconSrc", "'src' property should be correctly bound");
			assert.strictEqual(oItemTemplate.getBindingPath("initials"), "/name", "'initials' property should be correctly bound");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.avatarGroup"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {}
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Team",
							"type": "IconGroup",
							"path": "team",
							"template": {
								"icon": {
									"src": "{/iconSrc}",
									"initials": "{/name}"
								}
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Initials property of item template for avatars is correctly bound with deprecated 'text' property", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
				oAvatarGroup = oGroup.getItems()[1],
				oItemTemplate = oAvatarGroup.getBindingInfo("items").template;

			// Assert
			assert.strictEqual(oItemTemplate.getBindingPath("initials"), "/name", "'initials' property should be correctly bound");

			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.avatarGroup"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {}
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Team",
							"type": "IconGroup",
							"path": "team",
							"template": {
								"icon": {
									"text": "{/name}"
								}
							}
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Empty label with binding is not rendered", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
				aItems = oLayout.getContent()[0].getItems(),
				oLabel = aItems[0].getItems()[1].getItems()[0];

			// Assert
			assert.strictEqual(oLabel.getVisible(), false, "The empty label is not visible.");

			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_EmptyLabelWithBinding);
	});

	QUnit.test("Label showColon property", function (assert) {

		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oObjectContent = this.oCard.getAggregation("_content");
			var oContent = oObjectContent.getAggregation("_content");
			var aGroups = oContent.getItems()[0].getContent();

			Core.applyChanges();

			assert.equal(aGroups[0].getItems()[1].getShowColon(), true, "'showColon' is set to true by default.");
			assert.equal(aGroups[0].getItems()[5].getShowColon(), false, "'showColon' is correctly set to false from manifest.");


			done();
		}.bind(this));

		// Act
		this.oCard.setManifest(oManifest_ObjectCard_showColon);
	});

	[
		"{/emptyObject}",
		"{/emptyArray}",
		"{= ${name} !== 'DonnaMoore'}",
		"{falsyValue}",
		false,
		null,
		[],
		{}
	].forEach(function (hasDataValue) {
		QUnit.test("Negative cases - 'No data' message when 'hasData' is " + JSON.stringify(hasDataValue), function (assert) {
			var done = assert.async();
			var oManifest = {
				"sap.app": {
					"id": "test.object.card.hasData"
				},
				"sap.card": {
					"type": "Object",
					"data": {
						"json": {
							"emptyObject": {},
							"emptyArray": [],
							"name": "DonnaMoore",
							"falsyValue": false
						}
					},
					"header": {
						"title": "Object card"
					},
					"content": {
						"hasData": hasDataValue,
						"groups": [
							{
								"title": "Contact Details",
								"items": [
									{
										"label": "First Name",
										"value": "{firstName}"
									}
								]
							}
						]
					}
				}
			};

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oContent = this.oCard.getCardContent();

				// Assert
				assert.ok(oContent.getDomRef().querySelector(".sapMIllustratedMessage"), "'No data' message should be shown when 'hasData' is " + JSON.stringify(hasDataValue));

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
		});
	});

	[
		"{/nonEmptyObject}",
		"{/nonEmptyArray}",
		"{= ${name} === 'DonnaMoore'}",
		"{truthyValue}",
		true,
		5,
		{ key: "value" },
		[{}]
	].forEach(function (hasDataValue) {
		QUnit.test("Positive cases - 'No data' message when 'hasData' is " + JSON.stringify(hasDataValue), function (assert) {
			var done = assert.async();
			var oManifest = {
				"sap.app": {
					"id": "test.object.card.hasData"
				},
				"sap.card": {
					"type": "Object",
					"data": {
						"json": {
							"nonEmptyObject": {
								"key": "value"
							},
							"nonEmptyArray": [{}],
							"name": "DonnaMoore",
							"truthyValue": true
						}
					},
					"header": {
						"title": "Object card"
					},
					"content": {
						"hasData": hasDataValue,
						"groups": [
							{
								"title": "Contact Details",
								"items": [
									{
										"label": "First Name",
										"value": "{firstName}"
									}
								]
							}
						]
					}
				}
			};

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oContent = this.oCard.getCardContent();

				// Assert
				assert.notOk(oContent.getDomRef().querySelector(".sapMIllustratedMessage"), "'No data' message should NOT be shown when 'hasData' is " + JSON.stringify(hasDataValue));

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest);
		});
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Actionable controls should be labeled", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oLayout = this.oCard.getAggregation("_content").getAggregation("_content").getItems()[0],
				oLabel = oLayout.getContent()[0].getItems()[0],
				oLink = oLayout.getContent()[0].getItems()[1].getItems()[0];

			assert.ok(oLink.getAriaLabelledBy().length, "Link should be labeled");
			assert.strictEqual(oLink.getAriaLabelledBy()[0], oLabel.getId(), "Link should be labeled by the correct label");
			done();
		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"label": "Label",
							"value": "Value",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "https://sap.com"
									}
								}
							]
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Actionable controls with missing label", function (assert) {
		var done = assert.async(),
			oLogSpy = this.spy(Log, "warning");

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			assert.ok(oLogSpy.calledWithExactly(sinon.match.any, sinon.match.any, "sap.ui.integration.widgets.Card"), "Warning for missing label should be logged");
			done();
		});

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"value": "Value",
							"actions": [
								{
									"type": "Navigation",
									"parameters": {
										"url": "https://sap.com"
									}
								}
							]
						}]
					}]
				}
			}
		});
	});

	QUnit.test("Email, link and phone fields should have tooltip set correctly", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			var oGroup = this.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
				oPhone = oGroup.getItems()[1].getItems()[0],
				oEmail = oGroup.getItems()[3].getItems()[0],
				oLink = oGroup.getItems()[5].getItems()[0];

			assert.strictEqual(oPhone.getDomRef().getAttribute("title"), "Make a call", "The tooltip of the phone is correct");
			assert.strictEqual(oEmail.getDomRef().getAttribute("title"), "Write an e-mail", "The tooltip of the email is correct");
			assert.strictEqual(oLink.getDomRef().getAttribute("title"), "Visit website", "The tooltip of the link is correct (binding used)");
			done();
		});

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"websiteTooltip": "Visit website",
						"website": "www.company_a.example.com"
					}
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Phone",
							"value": "+1 202 555 5555",
							"tooltip": "Make a call",
							"actions": [{
								"type": "Navigation",
								"parameters": {
									"url": "tel: +1 202 555 5555"
								}
							}]
						},
						{
							"label": "Email",
							"value": "my@mymail.com",
							"tooltip": "Write an e-mail",
							"actions": [{
								"type": "Navigation",
								"parameters": {
									"url": "mailto: my@mymail.com"
								}
							}]
						},
						{
							"label": "Website",
							"value": "{website}",
							"tooltip": "{websiteTooltip}",
							"actions": [{
								"type": "Navigation",
								"parameters": {
									"url": "www.company_a.example.com"
								}
							}]
						}
						]
					}]
				}
			}
		});
	});

	QUnit.module("Layout", {
		beforeEach: function () {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Controls are properly nested", function (assert) {
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oContent = this.oCard.getCardContent(),
				oRoot = oContent._getRootContainer();

			// Assert
			assert.ok(oRoot.isA("sap.m.VBox"), "Root container is sap.m.VBox");
			assert.strictEqual(oRoot.getItems().length, 4, "Root container has 4 items");
			assert.ok(oRoot.getItems()[1].isA("sap.ui.layout.AlignedFlowLayout"), "AlignedFlowLayout is created");
			assert.strictEqual(oRoot.getItems()[1].getContent().length, 2, "2 items are added in the AlignedFlowLayout");
			done();
		}.bind(this));

		this.oCard.setManifest(oManifest_ComplexLayout);
	});

	QUnit.test("Resize handler is called for AlignedFlowLayout containers", function (assert) {
		var done = assert.async(),
			oResizeSpy = this.spy(ObjectContent.prototype, "_onAlignedFlowLayoutResize");

		this.oCard.attachEvent("_ready", function () {
			// Act
			this.oCard.getCardContent()._onResize({
				size: {
					width: 400
				},
				oldSize: {
					width: 0
				}
			});

			// Assert
			assert.strictEqual(oResizeSpy.callCount, 2, "First AlignedFlowLayout is destroyed");

			done();
		}.bind(this));

		this.oCard.setManifest(oManifest_ComplexLayout);
	});

	MemoryLeakCheck.checkControl("ObjectContent with IconGroup", function () {
		// Arrange
		var oObjectContent = new ObjectContent();
		var oConfig = {
			"groups": [{
				"items": [{
					"label": "Team",
					"type": "IconGroup",
					"path": "team",
					"template": {
						"icon": {
							"src": "{/iconSrc}",
							"initials": "{/name}"
						}
					}
				}]
			}]
		};

		sinon.stub(oObjectContent, "getCardInstance").returns({
			setModel: function () {

			},
			getBindingContext: function () {
				return undefined;
			},
			getBindingNamespaces: function () {
				return {};
			},
			isSkeleton: function () {
				return false;
			},
			addActiveLoadingProvider: function () { },
			removeActiveLoadingProvider: function () { },
			getManifestEntry: function () { },
			getPreviewMode: function () { },
			getHeight: function () { }
		});

		oObjectContent.setActions(new CardActions());

		// Act
		oObjectContent.setConfiguration(oConfig);

		return oObjectContent;
	});

	QUnit.module("Form controls", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Form controls are properly created", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			var oLayout = oCard.getCardContent().getAggregation("_content").getItems()[0],
				aItems = oLayout.getItems(),
				oComboBox = aItems[1],
				oTextArea = aItems[3],
				oInput = aItems[5],
				oTimePicker = aItems[7],
				oDateRange = aItems[9];

			// Assert Combo Box
			assert.ok(oComboBox.isA("sap.m.ComboBox"), "ComboBox is created.");
			assert.strictEqual(oComboBox.getPlaceholder(), "Select", "ComboBox has correct placeholder.");
			assert.strictEqual(oComboBox.getSelectedKey(), "reason1", "ComboBox has correct value.");
			assert.strictEqual(oComboBox.getItems().length, 2, "ComboBox has 2 options.");
			assert.strictEqual(oComboBox.getLabels()[0].getText(), "Reason", "ComboBox is referenced to the correct label.");

			// Assert Text Area
			assert.ok(oTextArea.isA("sap.m.TextArea"), "TextArea is created.");
			assert.strictEqual(oTextArea.getPlaceholder(), "Comment", "TextArea has correct placeholder.");
			assert.strictEqual(oTextArea.getValue(), "Free text comment", "TextArea has correct value.");
			assert.strictEqual(oTextArea.getRows(), 4, "TextArea has 4 rows.");
			assert.strictEqual(oTextArea.getLabels()[0].getText(), "Comment", "TextArea is referenced to the correct label.");

			// Assert Input
			assert.ok(oInput.isA("sap.m.Input"), "oInput is created.");
			assert.strictEqual(oInput.getPlaceholder(), "Enter user value", "Input has correct placeholder.");
			assert.strictEqual(oInput.getValue(), "Initial value", "Input has correct value.");
			assert.strictEqual(oInput.getLabels()[0].getText(), "User Value", "Input is referenced to the correct label.");

			// Assert Duration
			assert.ok(oTimePicker.isA("sap.m.TimePicker"), "oTimePicker is created.");
			assert.strictEqual(oTimePicker.getValue(), "11:12", "Duration has correct value.");
			assert.strictEqual(oTimePicker.getLabels()[0].getText(), "Duration", "Duration is referenced to the correct label.");

			// Assert DateRange
			assert.ok(oDateRange.isA("sap.m.DatePicker"), "DateRange is created.");
			assert.strictEqual(oDateRange.getValue(), "2000-01-01T00:00:00.000Z", "DateRange has correct value.");
			assert.strictEqual(oDateRange.getLabels()[0].getText(), "Date Range", "DateRange is referenced to the correct label.");

			done();
		});

		oCard.setManifest(oManifest_ObjectCardFormControls);
	});

	QUnit.test("Form control values are properly passed on submit action", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachAction(function (oEvent) {
			var mParameters = oEvent.getParameter("parameters"),
				mExpectedData = {
					"reason": {
						"key": "reason1",
						"value": "Reason 1"
					},
					"comment": "Free text comment",
					"userValue": "Initial value",
					"durationValue": "PT11H12M",
					"dateRangeValue": DateRangeHelper.getValueForModel(oCard.getCardContent().getAggregation("_content").getItems()[0].getItems()[9])
				};

			assert.deepEqual(mParameters.data, mExpectedData, "Data is properly passed to action handler.");
			assert.deepEqual(oCard.getModel("form").getData(), mExpectedData, "Data is properly populated in the form model.");

			done();
		});

		oCard.attachEvent("_ready", function () {
			oCard.triggerAction({
				type: CardActionType.Submit
			});
		});

		oCard.setManifest(oManifest_ObjectCardFormControls);
	});

	QUnit.test("Check for duplicate ID in form controls", function (assert) {
		var done = assert.async(),
			oLogSpy = this.spy(Log, "error"),
			oCard = this.oCard;

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			assert.ok(oLogSpy.calledWithExactly(sinon.match("Duplicate form control ID"), "sap.ui.integration.widgets.Card"), "Error for duplicate ID should be logged");

			oLogSpy.restore();
			done();
		});

		oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.card6",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"alignment": "Stretch",
							"items": [
								{
									"id": "reason",
									"type": "ComboBox"
								},
								{
									"id": "reason",
									"type": "ComboBox"
								}
							]
						}
					]
				}
			}
		});
		Core.applyChanges();
	});

	QUnit.test("Form control values are properly passed on submit action - special value", function (assert) {
		var done = assert.async(),
			oCard = this.oCard,
			oDataProviderStub = this.stub(RequestDataProvider.prototype, "getData").resolves("Success");

		oCard.attachEvent("_ready", function () {
			var oTextArea = oCard.getCardContent().getAggregation("_content").getItems()[0].getItems()[0];

			// Act
			Core.applyChanges();
			oTextArea.$("inner").val('{"reason": "{form>/reason/key}"}').trigger("input");
			oCard.triggerAction({
				type: CardActionType.Submit
			});

			// Assert
			assert.deepEqual(
				oDataProviderStub.thisValues[0].getSettings().request.parameters,
				{
					"status": "approved",
					"comment": '{"reason": "{form>/reason/key}"}'
				},
				"Text area with special value shouldn't break form submit"
			);
			done();
		});

		oCard.setManifest(oManifest_ObjectCardFormControlsSpecialValue);
	});

	QUnit.test("Initial form control values are stored in the 'form' model", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			// Assert
			assert.strictEqual(oCard.getModel("form").getProperty("/comment"), "initial text area value", "Value should be stored in the 'form' model");

			done();
		});

		oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.card5"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"items": [
								{
									"id": "comment",
									"value": "initial text area value",
									"type": "TextArea"
								}
							]
						}
					]
				}
			}
		});
	});

	QUnit.test("Initial form control values that are bound are stored in the 'form' model", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			// Assert
			assert.strictEqual(oCard.getModel("form").getProperty("/comment"), "initial text area value", "Value should be stored in the 'form' model");

			done();
		});

		oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.card5"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"initialValue": "initial text area value"
					}
				},
				"content": {
					"groups": [
						{
							"items": [
								{
									"id": "comment",
									"value": "{initialValue}",
									"type": "TextArea"
								}
							]
						}
					]
				}
			}
		});
	});

	QUnit.test("Changes from user to form control values are reflected in the 'form' model", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oContent = oCard.getCardContent(),
				oInput = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[0],
				oTextArea = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1],
				oComboBox = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[2],
				oDateRange = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[3],
				oDuration = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[4];

			// Assert
			assert.strictEqual(oCard.getModel("form").getProperty("/i1"), undefined, "No initial value is stored");
			assert.strictEqual(oCard.getModel("form").getProperty("/i2"), undefined, "No initial value is stored");
			assert.strictEqual(oCard.getModel("form").getProperty("/i3"), undefined, "No initial value is stored");
			assert.strictEqual(oCard.getModel("form").getProperty("/i4"), undefined, "No initial value is stored");
			assert.strictEqual(oCard.getModel("form").getProperty("/i5"), undefined, "No initial value is stored");

			// Act
			oInput.$("inner").val("a").trigger("input");
			oTextArea.$("inner").val("a").trigger("input");
			oComboBox.$("inner").val("a");
			oComboBox.fireEvent("change");
			oDateRange.$().find("input").val("Oct 7, 2021");
			oDateRange.onChange();
			oDuration.$().find("input").val("12:30");
			oDuration.onChange();

			Core.applyChanges();

			// Assert
			assert.strictEqual(oCard.getModel("form").getProperty("/i1"), "a", "Value in model is updated");
			assert.strictEqual(oCard.getModel("form").getProperty("/i2"), "a", "Value in model is updated");
			assert.strictEqual(oCard.getModel("form").getProperty("/i3").value, "a", "Value in model is updated");
			assert.deepEqual(oCard.getModel("form").getProperty("/i4"), DateRangeHelper.getValueForModel(oDateRange), "Value in model is updated");
			assert.strictEqual(oCard.getModel("form").getProperty("/i5"), "PT12H30M", "Value in model is updated");

			done();
		});

		// Setup
		oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.card5change"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"items": [
								{
									"id": "i1",
									"type": "TextArea"
								},
								{
									"id": "i2",
									"type": "Input"
								},
								{
									"id": "i3",
									"type": "ComboBox"
								},
								{
									"id": "i4",
									"type": "DateRange"
								},
								{
									"id": "i5",
									"type": "Duration"
								}
							]
						}
					]
				}
			}
		});
	});

	QUnit.test("Setting form data using public card API - invalid input", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			// Act
			oCard.setFormValues([
				{ "id": "i1", "value": "some text" },
				{ "id": "i2", "value": "too short" }
			]);

			// Assert
			assert.strictEqual(oCard.getModel("messages").getProperty("/hasErrors"), true, "Form has errors");
			assert.strictEqual(oCard.getModel("form").getProperty("/i1"), "some text", "Form model has value");
			assert.strictEqual(oCard.getModel("form").getProperty("/i2"), "too short", "Form model has value");

			done();
		});

		oCard.setManifest(oManifest_ObjectCardFormControlsPublicAPI);
	});

	QUnit.test("Setting form data using public card API - valid input", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			var oDateRange = oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0].getItems()[2];

			// Act
			oCard.setFormValues([
				{ "id": "i1", "value": "some text" },
				{ "id": "i2", "value": "some long text" },
				{ "id": "i3", "value": { "option": "date", "values": ["2020-05-20"]} },
				{ "id": "i4", "value": "PT12H30M" }
			]);

			// Assert
			assert.strictEqual(oCard.getModel("messages").getProperty("/hasErrors"), false, "Form has no errors");
			assert.strictEqual(oCard.getModel("form").getProperty("/i1"), "some text", "Form model has correct value for Input");
			assert.strictEqual(oCard.getModel("form").getProperty("/i2"), "some long text", "Form model has correct value for TextArea");
			assert.deepEqual(oCard.getModel("form").getProperty("/i3"), DateRangeHelper.getValueForModel(oDateRange), "Form model has correct value for DateRange");
			assert.strictEqual(oCard.getModel("form").getProperty("/i4"), "PT12H30M", "Form model has correct value for Duration");

			done();
		});

		oCard.setManifest(oManifest_ObjectCardFormControlsPublicAPI);
	});

	QUnit.module("Form controls with Validation", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Controls validation", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			var oObjectContent = oCard.getCardContent(),
				oLayout = oObjectContent.getAggregation("_content").getItems()[0],
				aItems = oLayout.getItems(),
				oComboBox1 = aItems[1],
				oComboBox2 = aItems[3],
				oTextArea = aItems[5],
				oTextArea2 = aItems[7],
				oTextArea3 = aItems[9],
				oInput = aItems[11],
				oDateRange = aItems[13];

			assert.strictEqual(oComboBox1.getValueState(), ValueState.None, "Control has no error");

			assert.deepEqual(oCard.getModel("messages").getData(), {
				"hasErrors": true,
				"hasWarnings": false,
				"records": [
					{
						"bindingPath": "/reason",
						"message": oResourceBundle.getText("EDITOR_VAL_FIELDREQ"),
						"type": "Error"
					},
					{
						"bindingPath": "/comment",
						"message": "Value is required",
						"type": "Error"
					},
					{
						"bindingPath": "/e-mail",
						"message": "Value is required",
						"type": "Error"
					},
					{
						"bindingPath": "/path",
						"message": "Value is required",
						"type": "Error"
					},
					{
						"bindingPath": "/inputId",
						"message": "Value is required",
						"type": "Error"
					},
					{
						"bindingPath": "/dateRangeValue",
						"message": oResourceBundle.getText("EDITOR_VAL_FIELDREQ"),
						"type": "Error"
					}
				]
			}, "messages model is correct");

			oCard.validateControls();

			assert.strictEqual(oComboBox1.getValueState(), ValueState.Error, "Control has an error");
			assert.strictEqual(oComboBox1.getValueStateText(), oResourceBundle.getText("EDITOR_VAL_FIELDREQ"), "Error text is correct");

			assert.strictEqual(oComboBox2.getValueState(), ValueState.None, "Control doesn't have an error");

			assert.strictEqual(oTextArea.getValueState(), ValueState.Error, "Control has an error");
			assert.strictEqual(oTextArea.getValueStateText(), "Value is required", "Error text is correct");

			assert.strictEqual(oTextArea2.getValueState(), ValueState.Error, "Control has an error");
			assert.strictEqual(oTextArea2.getValueStateText(), "Value is required", "Error text is correct");

			assert.strictEqual(oInput.getValueState(), ValueState.Error, "Control has an error");
			assert.strictEqual(oInput.getValueStateText(), "Value is required", "Error text is correct");

			assert.strictEqual(oDateRange.getValueState(), ValueState.Error, "Control has an error");
			assert.strictEqual(oDateRange.getValueStateText(), oResourceBundle.getText("EDITOR_VAL_FIELDREQ"), "Error text is correct");

			assert.deepEqual(oCard.getModel("messages").getData(), {
				"hasErrors": true,
				"hasWarnings": false,
				"records": [
					{
						"bindingPath": "/reason",
						"message": oResourceBundle.getText("EDITOR_VAL_FIELDREQ"),
						"type": "Error"
					},
					{
						"bindingPath": "/comment",
						"message": "Value is required",
						"type": "Error"
					},
					{
						"bindingPath": "/e-mail",
						"message": "Value is required",
						"type": "Error"
					},
					{
						"bindingPath": "/path",
						"message": "Value is required",
						"type": "Error"
					},
					{
						"bindingPath": "/inputId",
						"message": "Value is required",
						"type": "Error"
					},
					{
						"bindingPath": "/dateRangeValue",
						"message": oResourceBundle.getText("EDITOR_VAL_FIELDREQ"),
						"type": "Error"
					}
				]
			}, "messages model is correct");

			oComboBox1.setValue("Text");
			oComboBox2.setValue("Text");
			oTextArea.setValue("Text");
			oTextArea2.setValue("Text");
			oTextArea3.setValue("Text");
			oDateRange.setValue("invalid date");

			Core.applyChanges();
			oCard.validateControls();

			assert.strictEqual(oComboBox1.getValueState(), ValueState.None, "Control doesn't have an error");
			assert.strictEqual(oComboBox2.getValueState(), ValueState.Error, "Control has an error 1111");
			assert.strictEqual(oComboBox2.getValueStateText(), oResourceBundle.getText("EDITOR_ONLY_LISTED_VALUES_ALLOWED"), "Error text is correct");
			assert.strictEqual(oTextArea.getValueState(), ValueState.Warning, "ComboBox has an warning");
			assert.strictEqual(oTextArea.getValueStateText(), "Your comment should be between 10 and 200 characters.", "Text is correct");
			assert.strictEqual(oTextArea2.getValueState(), ValueState.Error, "TextArea has an error");
			assert.strictEqual(oTextArea2.getValueStateText(), "You should enter a valid e-mail.", "Text is correct");
			assert.strictEqual(oTextArea3.getValueStateText(), "You should enter a valid path.", "Text is correct");
			assert.strictEqual(oDateRange.getValueState(), ValueState.Error, "Control has an error");
			assert.strictEqual(oDateRange.getValueStateText(), Core.getLibraryResourceBundle("sap.ui.core").getText("VALUE_STATE_ERROR"), "Text is correct");

			assert.deepEqual(oCard.getModel("messages").getData(),
				{
					"hasErrors": true,
					"hasWarnings": true,
					"records": [
						{
							"bindingPath": "/reason2",
							"message": oResourceBundle.getText("EDITOR_ONLY_LISTED_VALUES_ALLOWED"),
							"type": "Error"
						},
						{
							"bindingPath": "/comment",
							"message": "Your comment should be between 10 and 200 characters.",
							"type": "Warning"
						},
						{
							"bindingPath": "/e-mail",
							"message": "You should enter a valid e-mail.",
							"type": "Error"
						},
						{
							"bindingPath": "/path",
							"message": "You should enter a valid path.",
							"type": "Error"
						},
						{
							"bindingPath": "/inputId",
							"message": "Value is required",
							"type": "Error"
						},
						{
							"bindingPath": "/dateRangeValue",
							"message": Core.getLibraryResourceBundle("sap.ui.core").getText("VALUE_STATE_ERROR"),
							"type": "Error"
						}
					]
				}, "messages model is correct");

			oComboBox2.setSelectedKey("reason1");
			oTextArea.setValue("TextTextTextTextTextTextTextTextText");
			oTextArea2.setValue("my@mymail.com");
			oTextArea3.setValue("Folder\\file.pdf");
			oInput.setValue("Some Value");
			oDateRange.setValue("May 2, 2023");

			Core.applyChanges();
			oCard.validateControls();

			assert.strictEqual(oComboBox2.getValueState(), ValueState.None, "Control doesn't have an error");
			assert.strictEqual(oTextArea.getValueState(), ValueState.None, "Control doesn't have an error");
			assert.strictEqual(oTextArea2.getValueState(), ValueState.None, "Control doesn't have an error");
			assert.strictEqual(oTextArea3.getValueState(), ValueState.None, "Control doesn't have an error and backslashes are escaped correctly");
			assert.strictEqual(oInput.getValueState(), ValueState.None, "Control doesn't have an error");
			assert.strictEqual(oDateRange.getValueState(), ValueState.None, "Control doesn't have an error");

			assert.deepEqual(oCard.getModel("messages").getData(), {
				"hasErrors": false,
				"hasWarnings": false,
				"records": []
			}, "messages model is correct");

			done();
		});

		oCard.setManifest(oManifest_ObjectCardFormControlsWithValidation);
	});

	QUnit.test("Controls validation when no data and no binding", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			assert.deepEqual(oCard.getModel("messages").getData(),
				{
					"hasErrors": true,
					"hasWarnings": false,
					"records": [
						{
							"bindingPath": "/name",
							"message": "Field is required. Please enter a text.",
							"type": "Error"
						}
					]
				}, "messages model is correct");

			done();
		});

		oCard.setManifest(oManifest_ObjectCardFormControlsWithValidationNoDataNoBinding);
	});

	QUnit.module("titleMaxLine and labelWrapping", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("titleMaxLine and labelWrapping are applied correctly", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oContent = oCard.getCardContent(),
				aGroups = oContent.getAggregation("_content").getItems()[0].getContent(),
				oGroupTitle1 = aGroups[0].getItems()[0],
				iFirstGroupTitleMaxLines = aGroups[0].getItems()[0].getMaxLines(),
				oGroupTitle2 = aGroups[1].getItems()[0],
				aGroup1Label1 = aGroups[0].getItems()[1],
				aGroup1Label2 = aGroups[0].getItems()[2],
				aGroup2Label1 = aGroups[1].getItems()[1],
				aGroup2Label2 = aGroups[1].getItems()[2];



			assert.strictEqual(oGroupTitle1.$("inner").css("-webkit-line-clamp"), iFirstGroupTitleMaxLines.toString(), "Title is clamped correctly based on titleMaxLines");
			assert.strictEqual(oGroupTitle2.$("inner").css("-webkit-line-clamp"), undefined, "Title is not clamped when titleMaxLines is set to 1");
			assert.ok(aGroup1Label1.$().hasClass("sapMLabelWrapped"), "First label is wrapped when labelWrapping is set to true");
			assert.ok(aGroup1Label2.$().hasClass("sapMLabelWrapped"), "Second label is wrapped when labelWrapping is set to true");
			assert.notOk(aGroup2Label1.$().hasClass("sapMLabelWrapped"), "First label is not wrapped when labelWrapping is set to false");
			assert.notOk(aGroup2Label2.$().hasClass("sapMLabelWrapped"), "Second label is not wrapped when labelWrapping is set to false");
			done();
		});

		oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Some very very long title that will be clamped based on the titleMaxLine property",
						"titleMaxLines": 2,
						"labelWrapping": true,
						"items": [{
							"label": "Some very very long label that will be wrapped if labelWrapping is set to true"
						},
						{
							"label": "Another very very long label that will be wrapped if labelWrapping is set to true"
						}
						]
					},
					{
						"title": "Another very very long title that will be clamped based on the titleMaxLine property",
						"titleMaxLines": 1,
						"labelWrapping": false,
						"items": [{
							"label": "Some very very long label that will be wrapped if labelWrapping is set to true"
						},
						{
							"label": "Another very very long label that will be wrapped if labelWrapping is set to true"
						}
						]
					}]
				}
			}
		});
	});

	QUnit.module("Forms Extension Validation", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});


	QUnit.test("Function", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		oCard.attachEvent("_ready", function () {
			var oObjectContent = oCard.getCardContent(),
				oTextArea = oObjectContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1];

			oTextArea.setValue("Text");

			Core.applyChanges();
			oCard.validateControls();

			assert.strictEqual(oTextArea.getValueState(), ValueState.Warning, "Input field has a warning");
			assert.strictEqual(oTextArea.getValueStateText(), "You should enter valid e-mail.", "Validation warning message is correct");

			oTextArea.setValue("my@mail.com");
			Core.applyChanges();
			oCard.validateControls();

			assert.strictEqual(oTextArea.getValueState(), ValueState.None, "Validation passed");

			done();
		});

		oCard.setManifest({
			"sap.app": {
				"id": "sap.ui.integration.test"
			},
			"sap.card": {
				"type": "Object",
				"extension": "./extensions/Extension1",
				"data": {
					"extension": {
						"method": "getData"
					}
				},
				"content": {
					"groups": [{
						"items": [{
							"id": "e-mail",
							"label": "E-mail",
							"type": "TextArea",
							"rows": 1,
							"placeholder": "e-mail",
							"validations": [
								{
									"required": true
								},
								{
									"validate": "extension.validateEmail",
									"message": "You should enter valid e-mail.",
									"type": "Warning"
								}
							]
						}]
					}]
				}
			}
		});

		Core.applyChanges();
	});
});