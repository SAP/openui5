/* global QUnit, sinon */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/base/Log",
	"sap/ui/core/Configuration",
	"sap/m/library",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/integration/library",
	"sap/ui/integration/cards/ObjectContent",
	"sap/ui/integration/Host",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/util/DateRangeHelper",
	"sap/ui/qunit/utils/MemoryLeakCheck",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent",
	"qunit/testResources/genericTests/actionEnablementTests"
], function(
	Localization,
	Log,
	Configuration,
	mLibrary,
	Library,
	coreLibrary,
	library,
	ObjectContent,
	Host,
	Card,
	CardActions,
	RequestDataProvider,
	DateRangeHelper,
	MemoryLeakCheck,
	nextUIUpdate,
	nextCardReadyEvent,
	actionEnablementTests
) {
	"use strict";

	var oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

	// shortcut for sap.m.AvatarSize
	var AvatarSize = mLibrary.AvatarSize;
	var AvatarColor = mLibrary.AvatarColor;
	var AvatarImageFitType = mLibrary.AvatarImageFitType;
	var CardActionType = library.CardActionType;
	var ValueState = coreLibrary.ValueState;
	var AnimationMode = Configuration.AnimationMode;

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
				"subtitle": "{position}"
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
				"subtitle": "{position}"
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
			"extension": "./extensions/ExtensionSample",
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
								"value": "{/durationValue}",
								"placeholder": "Pick a time"
							},
							{
								"id": "dateRangeValue",
								"label": "Date Range",
								"type": "DateRange",
								"value": {
									"option": "{/dateRangeValue/option}",
									"values": "{/dateRangeValue/optionValues}"
								},
								"placeholder": "Choose a date"
							}
						]
					}
				]
			}
		}
	};

	var oManifest_ObjectCardFormControlsContentData = {
		"sap.app": {
			"id": "test.cards.object.card5",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"header": {
				"title": "PR255 - MacBook Purchase"
			},
			"content": {
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
								"value": "{/durationValue}",
								"placeholder": "Pick a time"
							},
							{
								"id": "dateRangeValue",
								"label": "Date Range",
								"type": "DateRange",
								"value": {
									"option": "{/dateRangeValue/option}",
									"values": "{/dateRangeValue/optionValues}"
								},
								"placeholder": "Choose a date"
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
				"subtitle": "Procurement Purchase Requisition"
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
								"placeholder": "Choose a date",
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
				"subtitle": "Procurement Purchase Requisition"
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
				"subtitle": "{position}"
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

	var oManifest_ObjectCard_With_Radio_Buttons = {
		"sap.card": {
			"type": "Object",
			"header": {
				"title": "RadioButtonGroup Test Card"
			},
			"data": {
				"json": {
					"employeeStatus": [
						{ "key": "active", "text": "Active" },
						{ "key": "inactive", "text": "Inactive" },
						{ "key": "vacation", "text": "On Vacation" },
						{ "key": "sick", "text": "Sick Leave", "enabled": false }
					]
				}
			},
			"content": {
				"groups": [
					{
						"title": "RadioButtonGroup Examples",
						"items": [
							{
								"id": "status",
								"label": "Employee Status",
								"type": "RadioButtonGroup",
								"selectedIndex": 1,
								"item": {
									"path": "/employeeStatus",
									"template": {
										"key": "{key}",
										"title": "{text}",
										"enabled": "{enabled}"
									}
								}
							}
						]
					}
				]
			}
		}
	};

	var oManifest_RadioButtonGroupWithValidation = {
		"sap.app": {
			"id": "test.cards.object.radioValidation",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"header": {
				"title": "RadioButtonGroup Validation Test"
			},
			"data": {
				"json": {
					"priorityLevels": [
						{ "key": "low", "text": "Low Priority" },
						{ "key": "medium", "text": "Medium Priority" },
						{ "key": "high", "text": "High Priority" },
						{ "key": "critical", "text": "Critical Priority" }
					]
				}
			},
			"content": {
				"groups": [
					{
						"title": "Required Selection",
						"items": [
							{
								"id": "priority",
								"label": "Priority Level",
								"type": "RadioButtonGroup",
								"required": true,
								"item": {
									"path": "/priorityLevels",
									"template": {
										"key": "{key}",
										"title": "{text}"
									}
								},
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

	var oManifest_RadioButtonGroupWithValidationWithSelection = {
		"sap.app": {
			"id": "test.cards.object.radioValidation",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"header": {
				"title": "RadioButtonGroup Validation Test"
			},
			"data": {
				"json": {
					"priorityLevels": [
						{ "key": "low", "text": "Low Priority" },
						{ "key": "medium", "text": "Medium Priority" },
						{ "key": "high", "text": "High Priority" },
						{ "key": "critical", "text": "Critical Priority" }
					]
				}
			},
			"content": {
				"groups": [
					{
						"title": "Required Selection",
						"items": [
							{
								"id": "priority",
								"label": "Priority Level",
								"type": "RadioButtonGroup",
								"selectedIndex": 1,
								"required": true,
								"item": {
									"path": "/priorityLevels",
									"template": {
										"key": "{key}",
										"title": "{text}"
									}
								},
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

	const oManifest_RequiredRadioButtonGroup = {
		"sap.app": {
			"id": "test.cards.object.requiredRadioButtonGroup",
			"type": "card"
		},
		"sap.card": {
			"type": "Object",
			"header": {
				"title": "Required RadioButtonGroup Test"
			},
			"data": {
				"json": {
					"priorityLevels": [
						{ "key": "low", "text": "Low Priority" },
						{ "key": "medium", "text": "Medium Priority" },
						{ "key": "high", "text": "High Priority" }
					]
				}
			},
			"content": {
				"groups": [
					{
						"title": "Required Selection",
						"items": [
							{
								"id": "priority",
								"label": "Priority Level",
								"type": "RadioButtonGroup",
								"item": {
									"path": "/priorityLevels",
									"template": {
										"key": "{key}",
										"title": "{text}"
									}
								},
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

	actionEnablementTests("Status in NumericHeader", {
		manifest: {
			"sap.app": {
				"id": "card.objectCard.statusActionsTest",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Card Title"
				},
				"content": {
					"groups": [{
						"items": [{
							"type": "Status",
							"value": "Status"
						}]
					}]
				}
			}
		},
		partUnderTestPath: "/sap.card/content/groups/0/items/0",
		getActionControl: (oCard) => {
			return oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0].getItems()[0];
		},
		DOM_RENDER_LOCATION,
		QUnit,
		sinon
	});

	QUnit.module("Object Card", {
		beforeEach: function() {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Using manifest", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ObjectCard);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oContent = oObjectContent.getAggregation("_content");
		var oHeader = this.oCard.getAggregation("_header");
		var aGroups = oContent.getItems()[0].getContent();
		var oData = oManifest_ObjectCard["sap.card"].data.json;
		var oManifestContent = oManifest_ObjectCard["sap.card"].content;

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

		// Group 2 assertions
		assert.equal(aGroups[1].getItems().length, 2, "Should have 2 items.");
		assert.equal(aGroups[1].getItems()[0].getText(), oManifestContent.groups[1].title, "Should have correct group title.");
		assert.equal(aGroups[1].getItems()[1].getItems()[0].getSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/Woman_avatar_01.png", "Should have correct image source.");
		assert.equal(aGroups[1].getItems()[1].getItems()[1].getItems()[1].getText(), oData.manager.firstName + " " + oData.manager.lastName, "Should have correct item value.");

		// Group 3 assertions
		assert.equal(aGroups[2].getItems().length, 13, "Should have 13 items.");
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
	});

	QUnit.test("Spacing between groups are correctly calculated", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ObjectCard);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oRoot = oObjectContent.getAggregation("_content");
		var oLayout = oRoot.getItems()[0];

		//This is the case when 2 groups are in one column and the last group is on another row
		this.oCard.setWidth("450px");
		await nextUIUpdate();
		assert.ok(oLayout.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The first group should have the separation class");
		assert.ok(!oLayout.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The second group should not have the separation class");
		assert.ok(oLayout.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The last group should have the separation class");

		//This is the case when all groups are in one column
		this.oCard.setWidth("250px");
		await nextUIUpdate();
		assert.ok(!oLayout.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
		assert.ok(!oLayout.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
		assert.ok(!oLayout.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");

		//This is the case when all groups are in one row
		this.oCard.setWidth("850px");
		await nextUIUpdate();
		assert.ok(oLayout.getContent()[0].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
		assert.ok(oLayout.getContent()[1].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should have the separation class");
		assert.ok(!oLayout.getContent()[2].$().hasClass("sapFCardObjectSpaceBetweenGroup"), "The group should not have the separation class");
	});

	QUnit.test("Spacing around groups when the last group is 'stretched'", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
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
		oObjectContent._onResize(oEvent);

		// Assert
		assert.strictEqual(oRoot.$().find(".sapFCardObjectGroupLastInColumn").length, 1, "There should be one group marked as last");
		assert.ok(aItems[aItems.length - 1].hasStyleClass("sapFCardObjectGroupLastInColumn"), "The last group should have the 'sapFCardObjectGroupLastInColumn' class");
	});

	QUnit.test("Visible property", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ObjectCard_Visible);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
			aTestItems = oLayout.getContent()[1].getItems();

		assert.ok(oLayout.getDomRef().children[0].classList.contains("sapFCardInvisibleContent"), "Group is hidden");
		assert.notOk(oLayout.getDomRef().children[1].classList.contains("sapFCardInvisibleContent"), "Group should be visible");

		assert.notOk(aTestItems[1].getVisible(), "The group item should not be visible");
		assert.notOk(aTestItems[2].getVisible(), "The group item should not be visible");
		assert.ok(aTestItems[3].getVisible(), "The group item should be visible");
		assert.ok(aTestItems[4].getVisible(), "The group item should be visible");
		assert.ok(aTestItems[5].getVisible(), "The numeric data group item should not be visible");
		assert.ok(aTestItems[6].getVisible(), "The icon group group item should not be visible");
	});

	QUnit.test("Visible property of items - determined by binding", async function (assert) {
		// Arrange
		var oManifest = {
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

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
			aGroupItems = oLayout.getContent()[0].getItems();

		// Assert
		assert.notOk(aGroupItems[1].getVisible(), "Label for link is NOT visible");
		assert.notOk(aGroupItems[2].getVisible(), "Link is also NOT visible");
		assert.notOk(aGroupItems[3].getVisible(), "Label for text is NOT visible");
		assert.notOk(aGroupItems[4].getVisible(), "Text is also NOT visible");
	});

	QUnit.test("Visible property of items - determined by binding with parameters", async function (assert) {
		// Arrange
		var oManifest = {
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

		// Act
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getCardContent(),
			aGroups = oContent.getAggregation("_content").getItems()[0].getContent(),
			oFirstGroup = aGroups[0],
			oSecondGroup = aGroups[1];

		// Assert
		assert.strictEqual(oFirstGroup.getVisible(), false, "Group is not visible");
		assert.strictEqual(oSecondGroup.getVisible(), true, "Group is visible");
		oSecondGroup.getItems().forEach(function (oGroupItem) {
			assert.strictEqual(oGroupItem.getVisible(), false, "Group item is not visible");
		});
	});

	QUnit.test("Icon property", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oContent = this.oCard.getCardContent(),
			oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

		assert.ok(oAvatar.hasStyleClass("sapFCardIcon"), "'sapFCardIcon' class is added");
	});

	QUnit.test("Icon default size should be 'XS'", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oContent = this.oCard.getAggregation("_content"),
			oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

		assert.strictEqual(oAvatar.getDisplaySize(), AvatarSize.XS, "Avatar default size is 'XS'");
	});

	QUnit.test("Icon allows to set custom 'size'", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oContent = this.oCard.getAggregation("_content"),
			oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

		assert.strictEqual(oAvatar.getDisplaySize(), AvatarSize.M, "'size' from the manifest is applied");
	});

	QUnit.test("'fitType' of icon with src", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.iconFitType"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [{
							"icon": {
								"src": "images/grass.jpg",
								"fitType": "Contain"
							}
						}]
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oContent = this.oCard.getAggregation("_content"),
			oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

		// Assert
		assert.strictEqual(oAvatar.getImageFitType(), AvatarImageFitType.Contain, "ImageFitType should be 'Contain' when set by manifest.");
	});

	QUnit.test("'backgroundColor' of icon with src", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oContent = this.oCard.getAggregation("_content"),
			oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

		// Assert
		assert.strictEqual(oAvatar.getBackgroundColor(), AvatarColor.Transparent, "Background should be 'Transparent' when there is only icon.");
	});

	QUnit.test("'backgroundColor' of icon with initials", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oContent = this.oCard.getAggregation("_content"),
			oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0],
			sExpected = oAvatar.getMetadata().getPropertyDefaults().backgroundColor;

		// Assert
		assert.strictEqual(oAvatar.getBackgroundColor(), sExpected, "Background should have default value when there are initials.");
		assert.strictEqual(oAvatar.getInitials(), "AC", "Initials should be correctly set.");
	});

	QUnit.test("Icon initials set with deprecated 'text' property", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oContent = this.oCard.getAggregation("_content"),
			oAvatar = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1].getItems()[0];

		// Assert
		assert.strictEqual(oAvatar.getInitials(), "AC", "Initials should be correctly set.");
	});

	QUnit.test("Icon visible property", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
			bAvatarVisible = oGroup.getItems()[1].getItems()[0];

		assert.strictEqual(bAvatarVisible.getVisible(), false, "avatar is not visible when visible property is set to false");
	});

	QUnit.test("Icon src for Mobile SDK", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.iconFitType"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Company Details",
						"items": [
							{
								"icon": {
									"src": "images/grass.jpg",
									"fitType": "Contain"
								}
							}
						]
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getAggregation("_content"),
			oStaticConfiguration = oContent.getStaticConfiguration();

		var aItems = oStaticConfiguration.groups[0].items;
		assert.equal(aItems.length, 1, "Should have 1 item.");

		var item0 = aItems[0];
		assert.equal(item0.icon.src, this.oCard.getBaseUrl() + "images/grass.jpg", "item 0: src format correct");
	});



	QUnit.test("Image src (binding) for Mobile SDK", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "card.explorer.object.image",
				"type": "card",
				"title": "Sample of an Object Card with Image",
				"applicationVersion": {
					"version": "1.0.0"
				},
				"tags": {
					"keywords": [
						"Object",
						"Card",
						"Sample"
					]
				}
			},
			"sap.ui": {
				"technology": "UI5",
				"icons": {
					"icon": "sap-icon://switch-classes"
				}
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"firstName": "Donna",
						"lastName": "Moore",
						"position": "Sales Executive",
						"photo": "./images/workingWithTablet.jpg"
					}
				},
				"header": {
					"title": "Donna Moore",
					"subtitle": "Complete your time recording",
					"visible": false
				},
				"content": {
					"groups": [
						{
							"items": [
								{
									"type": "Image",
									"src": "{photo}",
									"fullWidth": false
								}
							]
						}
					]
				},
				"footer": {
					"actionsStrip": [
						{
							"text": "Send Reminder",
							"buttonType": "Accept"
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getAggregation("_content"),
			oStaticConfiguration = oContent.getStaticConfiguration();

		var aItems = oStaticConfiguration.groups[0].items;
		assert.equal(aItems[0].src, this.oCard.getBaseUrl() + "./images/workingWithTablet.jpg", "item 0: src format correct");
	});

	QUnit.test("Group title is not rendered when missing from manifest", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oContent = this.oCard.getAggregation("_content"),
			bHasTitle = !!oContent.$().find(".sapFCardObjectItemTitle").length;

		assert.strictEqual(bHasTitle, false, "group title is not rendered");
	});

	QUnit.test("'maxLines' set to text item", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
			oText = oGroup.getItems()[0];

		// Assert
		assert.strictEqual(oText.getMaxLines(), 2, "'maxLines' should be set to the inner text control");
	});

	QUnit.test("'size' of NumericData", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
			oNumericData = oGroup.getItems()[0].getItems()[0];

		// Assert
		assert.ok(oNumericData.$().hasClass("sapMTileSmallPhone"), "Class for small size should be added");
	});

	QUnit.test("Avatar group with template", async function (assert) {
		// Arrange
		var oCardData = {
			team: [
				{},
				{},
				{}
			]
		};
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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
			oAvatarGroup = oGroup.getItems()[1];

		// Assert
		assert.strictEqual(oAvatarGroup.getItems().length, oCardData.team.length, "Correct number of items should be created");
		oAvatarGroup.getItems().forEach(function (oItem) {
			assert.ok(oItem.getDomRef(), "Item " + oItem.getId() + " should be rendered");
		});
	});

	QUnit.test("Button group toolbar has width '100%'", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.buttonGroup"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"attachments": [
							{ "icon": "sap-icon://attachment" },
							{ "icon": "sap-icon://attachment" }
						]
					}
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Attachments",
							"type": "ButtonGroup",
							"path": "attachments",
							"template": {
								"icon": "{icon}"
							}
						}]
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0];
		const oButtonGroup = oGroup.getItems()[1];

		// Assert
		assert.ok(oButtonGroup.isA("sap.m.OverflowToolbar"), "Button group is an OverflowToolbar");
		assert.strictEqual(oButtonGroup.getWidth(), "100%", "Button group toolbar width is '100%'");
	});

	QUnit.test("Avatar group with template - Icon src for Mobile SDK", async function (assert) {
		// Arrange
		var oCardData = {
			team: [
				{
					"iconSrc": "images/grass.jpg"
				},
				{
					"iconSrc": "images/grass.jpg"
				},
				{
					"iconSrc": "some/invalid/path.jpg"
				}
			]
		};
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
									"src": "{iconSrc}",
									"initials": "{name}"
								}
							}
						}]
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getAggregation("_content"),
			oStaticConfiguration = oContent.getStaticConfiguration();

		var aItems = oStaticConfiguration.groups[0].items[0].items;
		assert.equal(aItems[0].icon.src, this.oCard.getBaseUrl() + "images/grass.jpg", "item 0: src format correct");
		assert.equal(aItems[1].icon.src, this.oCard.getBaseUrl() + "images/grass.jpg", "item 1: src format correct");
		assert.equal(aItems[2].icon.src, this.oCard.getBaseUrl() + "some/invalid/path.jpg", "item 2: src format correct");
	});

	QUnit.test("Properties of item template for avatars are correctly bound", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
			oAvatarGroup = oGroup.getItems()[1],
			oItemTemplate = oAvatarGroup.getBindingInfo("items").template;

		// Assert
		assert.strictEqual(oItemTemplate.getBindingPath("src"), "/iconSrc", "'src' property should be correctly bound");
		assert.strictEqual(oItemTemplate.getBindingPath("initials"), "/name", "'initials' property should be correctly bound");

	});

	QUnit.test("Initials property of item template for avatars is correctly bound with deprecated 'text' property", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		var oGroup = this.oCard.getCardContent()._getRootContainer().getItems()[0].getContent()[0],
			oAvatarGroup = oGroup.getItems()[1],
			oItemTemplate = oAvatarGroup.getBindingInfo("items").template;

		// Assert
		assert.strictEqual(oItemTemplate.getBindingPath("initials"), "/name", "'initials' property should be correctly bound");
	});

	QUnit.test("Empty label with binding is not rendered", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_EmptyLabelWithBinding);

		await nextCardReadyEvent(this.oCard);

		var oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0],
			aItems = oLayout.getContent()[0].getItems(),
			oLabel = aItems[0].getItems()[1].getItems()[0];

		// Assert
		assert.strictEqual(oLabel.getVisible(), false, "The empty label is not visible.");
	});

	QUnit.test("Label showColon property", async function (assert) {
		// Act
		this.oCard.setManifest(oManifest_ObjectCard_showColon);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oContent = oObjectContent.getAggregation("_content");
		var aGroups = oContent.getItems()[0].getContent();

		assert.equal(aGroups[0].getItems()[1].getShowColon(), true, "'showColon' is set to true by default.");
		assert.equal(aGroups[0].getItems()[5].getShowColon(), false, "'showColon' is correctly set to false from manifest.");
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
		QUnit.test("Negative cases - 'No data' message when 'hasData' is " + JSON.stringify(hasDataValue), async function (assert) {
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

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent();

			// Assert
			assert.ok(oContent.getDomRef().querySelector(".sapMIllustratedMessage"), "'No data' message should be shown when 'hasData' is " + JSON.stringify(hasDataValue));
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
		QUnit.test("Positive cases - 'No data' message when 'hasData' is " + JSON.stringify(hasDataValue), async function (assert) {
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

			// Act
			this.oCard.setManifest(oManifest);

			await nextCardReadyEvent(this.oCard);
			await nextUIUpdate();

			var oContent = this.oCard.getCardContent();

			// Assert
			assert.notOk(oContent.getDomRef().querySelector(".sapMIllustratedMessage"), "'No data' message should NOT be shown when 'hasData' is " + JSON.stringify(hasDataValue));
		});
	});

	QUnit.module("Object Card - multiple value entries", {
		beforeEach: function() {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Multiple text values are wrapped in a VBox", async function (assert) {
		// Arrange
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.values.text"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"date1": "2024-01-01",
						"date2": "2024-02-01"
					}
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Issue Dates",
							"valueEntries": [
								{ "value": "{date1}" },
								{ "value": "{date2}" }
							]
						}]
					}]
				}
			}
		});

		// Act
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oGroup = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
			oLabel = oGroup.getItems()[0],
			oVBox = oGroup.getItems()[1],
			aValueControls = oVBox.getItems();

		assert.strictEqual(oLabel.getText(), "Issue Dates", "Label is rendered for the values item.");
		assert.ok(oVBox.isA("sap.m.VBox"), "Values are wrapped in a VBox.");
		assert.strictEqual(aValueControls.length, 2, "VBox contains one control per value.");
		assert.ok(aValueControls[0].isA("sap.m.Text"), "First value is rendered as Text.");
		assert.ok(aValueControls[1].isA("sap.m.Text"), "Second value is rendered as Text.");
		assert.strictEqual(aValueControls[0].getText(), "2024-01-01", "First value is bound correctly.");
		assert.strictEqual(aValueControls[1].getText(), "2024-02-01", "Second value is bound correctly.");
	});

	QUnit.test("Values with actions are rendered as Links", async function (assert) {
		// Arrange
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.values.actions"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"email": "john.doe@company.com",
						"phone": "+1 234 567 8900"
					}
				},
				"content": {
					"groups": [{
						"items": [{
							"label": "Contacts",
							"valueEntries": [
								{
									"value": "{email}",
									"tooltip": "Send work email",
									"actions": [{
										"type": "Navigation",
										"parameters": { "url": "mailto:{email}" }
									}]
								},
								{
									"value": "{phone}",
									"tooltip": "Personal phone",
									"actions": [{
										"type": "Navigation",
										"parameters": { "url": "tel:{phone}" }
									}]
								}
							]
						}]
					}]
				}
			}
		});

		// Act
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oGroup = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
			oVBox = oGroup.getItems()[1],
			oEmailLink = oVBox.getItems()[0].getItems()[0],
			oPhoneLink = oVBox.getItems()[1].getItems()[0];

		assert.ok(oVBox.getItems()[0].isA("sap.m.HBox"), "Value with actions is wrapped in an HBox.");
		assert.ok(oEmailLink.isA("sap.m.Link"), "First value with actions is rendered as a Link.");
		assert.ok(oPhoneLink.isA("sap.m.Link"), "Second value with actions is rendered as a Link.");
		assert.strictEqual(oEmailLink.getText(), "john.doe@company.com", "First link text is bound correctly.");
		assert.strictEqual(oPhoneLink.getText(), "+1 234 567 8900", "Second link text is bound correctly.");
		assert.strictEqual(oEmailLink.getDomRef().getAttribute("title"), "Send work email", "First link tooltip is correct.");
		assert.strictEqual(oPhoneLink.getDomRef().getAttribute("title"), "Personal phone", "Second link tooltip is correct.");
	});

	QUnit.test("Links from values are labelled by the item label (accessibility)", async function (assert) {
		// Arrange
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.values.aria"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"label": "Contacts",
							"valueEntries": [{
								"value": "john.doe@company.com",
								"actions": [{
									"type": "Navigation",
									"parameters": { "url": "mailto:john.doe@company.com" }
								}]
							}]
						}]
					}]
				}
			}
		});

		// Act
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oGroup = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
			oLabel = oGroup.getItems()[0],
			oLink = oGroup.getItems()[1].getItems()[0].getItems()[0];

		assert.deepEqual(oLink.getAriaLabelledBy(), [oLabel.getId()], "Link is labelled by the item label.");
	});

	QUnit.test("Per-value 'visible' set as static string hides the value entry", async function (assert) {
		// Arrange
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.values.visibleStatic"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"label": "Issue Dates",
							"valueEntries": [
								{ "value": "2024-01-01", "visible": "true" },
								{ "value": "2024-02-01", "visible": "false" }
							]
						}]
					}]
				}
			}
		});

		// Act
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oGroup = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
			aValueControls = oGroup.getItems()[1].getItems();

		assert.ok(aValueControls[0].getVisible(), "Value with visible 'true' is visible.");
		assert.notOk(aValueControls[1].getVisible(), "Value with visible 'false' is NOT visible.");
	});

	QUnit.test("Per-value 'visible' set as boolean hides the value entry", async function (assert) {
		// Arrange
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.values.visibleBoolean"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"label": "Issue Dates",
							"valueEntries": [
								{ "value": "2024-01-01", "visible": true },
								{ "value": "2024-02-01", "visible": false }
							]
						}]
					}]
				}
			}
		});

		// Act
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oGroup = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
			aValueControls = oGroup.getItems()[1].getItems();

		assert.ok(aValueControls[0].getVisible(), "Value with visible true is visible.");
		assert.notOk(aValueControls[1].getVisible(), "Value with visible false is NOT visible.");
	});

	QUnit.test("'maxLines' is applied to a value entry", async function (assert) {
		// Arrange
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.values.maxLines"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"label": "Notes",
							"valueEntries": [
								{ "value": "first note", "maxLines": 2 },
								{ "value": "second note" }
							]
						}]
					}]
				}
			}
		});

		// Act
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oGroup = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
			aValueControls = oGroup.getItems()[1].getItems();

		assert.strictEqual(aValueControls[0].getMaxLines(), 2, "'maxLines' is set on the inner Text control.");
	});

	QUnit.test("Item-level 'visible' propagates to the values VBox", async function (assert) {
		// Arrange
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.values.itemVisible"
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
						"items": [{
							"label": "Issue Dates",
							"visible": "{visible}",
							"valueEntries": [
								{ "value": "2024-01-01" },
								{ "value": "2024-02-01" }
							]
						}]
					}]
				}
			}
		});

		// Act
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oGroup = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
			oLabel = oGroup.getItems()[0],
			oVBox = oGroup.getItems()[1];

		assert.notOk(oLabel.getVisible(), "Label is NOT visible when the item is hidden.");
		assert.notOk(oVBox.getVisible(), "Values VBox is NOT visible when the item is hidden.");
	});

	QUnit.test("Empty 'valueEntries' array renders an empty VBox", async function (assert) {
		// Arrange
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.values.empty"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"items": [{
							"label": "Issue Dates",
							"valueEntries": []
						}]
					}]
				}
			}
		});

		// Act
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Assert
		const oGroup = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
			oVBox = oGroup.getItems()[1];

		assert.ok(oVBox.isA("sap.m.VBox"), "An (empty) VBox is still created for an empty 'valueEntries' array.");
		assert.strictEqual(oVBox.getItems().length, 0, "The VBox has no value controls.");
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Actionable controls should be labeled", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oLayout = this.oCard.getAggregation("_content").getAggregation("_content").getItems()[0],
			oLabel = oLayout.getContent()[0].getItems()[0],
			oLink = oLayout.getContent()[0].getItems()[1].getItems()[0];

		assert.ok(oLink.getAriaLabelledBy().length, "Link should be labeled");
		assert.strictEqual(oLink.getAriaLabelledBy()[0], oLabel.getId(), "Link should be labeled by the correct label");

		const aIds = this.oCard.getDomRef().getAttribute("aria-describedby").split(" ");
		assert.strictEqual(document.getElementById(aIds[0]).innerText, oResourceBundle.getText("ARIA_DESCRIPTION_CARD_TYPE_OBJECT"), "aria text for card type is correct.");
	});

	QUnit.test("Actionable controls with missing label", async function (assert) {
		var oLogSpy = this.spy(Log, "warning");

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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		assert.ok(oLogSpy.calledWithExactly(sinon.match.any, sinon.match.any, "sap.ui.integration.widgets.Card"), "Warning for missing label should be logged");
	});

	QUnit.test("Email, link and phone fields should have tooltip set correctly", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oGroup = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0],
			oPhone = oGroup.getItems()[1].getItems()[0],
			oEmail = oGroup.getItems()[3].getItems()[0],
			oLink = oGroup.getItems()[5].getItems()[0];

		assert.strictEqual(oPhone.getDomRef().getAttribute("title"), "Make a call", "The tooltip of the phone is correct");
		assert.strictEqual(oEmail.getDomRef().getAttribute("title"), "Write an e-mail", "The tooltip of the email is correct");
		assert.strictEqual(oLink.getDomRef().getAttribute("title"), "Visit website", "The tooltip of the link is correct (binding used)");
	});

	QUnit.test("Card-level headingLevel drives header and group aria-level", async function (assert) {
		this.oCard.setHeadingLevel("H2");
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.headingLevel"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Card Title"
				},
				"content": {
					"groups": [
						{
							"title": "Group A",
							"items": [{ "label": "L", "value": "V" }]
						},
						{
							"title": "Group B",
							"items": [{ "label": "L", "value": "V" }]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getCardHeader();
		assert.strictEqual(this.oCard.getHeadingLevel(), "H2", "Card headingLevel is H2");
		assert.strictEqual(oHeader.getAriaHeadingLevel(), "2", "Header aria-level is 2 (from H2)");

		const aGroupTitles = this.oCard.getDomRef().querySelectorAll(".sapFCardObjectItemTitle");
		assert.strictEqual(aGroupTitles.length, 2, "Two group titles are rendered");
		assert.strictEqual(aGroupTitles[0].getAttribute("role"), "heading", "Group title has role=heading");
		assert.strictEqual(aGroupTitles[0].getAttribute("aria-level"), "3", "Group aria-level is one level deeper than the card header (H2 -> 3)");
		assert.strictEqual(aGroupTitles[1].getAttribute("aria-level"), "3", "All groups derive from the same card header level");
	});

	QUnit.test("Default (no card-level headingLevel) renders header at 3 and groups at 4", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.headingLevel.default"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Card Title"
				},
				"content": {
					"groups": [{
						"title": "Group A",
						"items": [{ "label": "L", "value": "V" }]
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getCardHeader();
		assert.strictEqual(oHeader.getAriaHeadingLevel(), "3", "Default header aria-level is 3");

		const oGroupTitle = this.oCard.getDomRef().querySelector(".sapFCardObjectItemTitle");
		assert.strictEqual(oGroupTitle.getAttribute("role"), "heading", "Group title has role=heading");
		assert.strictEqual(oGroupTitle.getAttribute("aria-level"), "4", "Default group aria-level is one below the header (3 -> 4)");
	});

	QUnit.test("setHeadingLevel called after setManifest updates header and group aria-level", async function (assert) {
		// Arrange - render with default headingLevel
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.headingLevel.runtime"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Card Title"
				},
				"content": {
					"groups": [{
						"title": "Group A",
						"items": [{ "label": "L", "value": "V" }]
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oHeader = this.oCard.getCardHeader();

		// Assert - default H3 -> aria-level 3, group 4
		assert.strictEqual(oHeader.getAriaHeadingLevel(), "3", "Header aria-level is 3 before setHeadingLevel");
		let oGroupTitle = this.oCard.getDomRef().querySelector(".sapFCardObjectItemTitle");
		assert.strictEqual(oGroupTitle.getAttribute("aria-level"), "4", "Group aria-level is 4 before setHeadingLevel");

		// Act - change heading level via public API after manifest is applied
		this.oCard.setHeadingLevel("H4");
		await nextUIUpdate();

		// Assert - header and group aria-level reflect the new value (H4 -> 4, group -> 5)
		assert.strictEqual(this.oCard.getHeadingLevel(), "H4", "Card headingLevel is H4");
		assert.strictEqual(oHeader.getAriaHeadingLevel(), "4", "Header aria-level updated to 4 after setHeadingLevel('H4')");

		oGroupTitle = this.oCard.getDomRef().querySelector(".sapFCardObjectItemTitle");
		assert.strictEqual(oGroupTitle.getAttribute("aria-level"), "5", "Group aria-level updated to 5 after setHeadingLevel('H4')");

		// Act - change again to verify successive runtime updates
		this.oCard.setHeadingLevel("H1");
		await nextUIUpdate();

		assert.strictEqual(oHeader.getAriaHeadingLevel(), "1", "Header aria-level updated to 1 after setHeadingLevel('H1')");
		oGroupTitle = this.oCard.getDomRef().querySelector(".sapFCardObjectItemTitle");
		assert.strictEqual(oGroupTitle.getAttribute("aria-level"), "2", "Group aria-level updated to 2 after setHeadingLevel('H1')");
	});

	QUnit.module("Layout", {
		beforeEach: function() {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Controls are properly nested", async function (assert) {
		this.oCard.setManifest(oManifest_ComplexLayout);

		await nextCardReadyEvent(this.oCard);

		var oContent = this.oCard.getCardContent(),
			oRoot = oContent._getRootContainer();

		// Assert
		assert.ok(oRoot.isA("sap.m.VBox"), "Root container is sap.m.VBox");
		assert.strictEqual(oRoot.getItems().length, 4, "Root container has 4 items");
		assert.ok(oRoot.getItems()[1].isA("sap.ui.layout.AlignedFlowLayout"), "AlignedFlowLayout is created");
		assert.strictEqual(oRoot.getItems()[1].getContent().length, 2, "2 items are added in the AlignedFlowLayout");
	});

	QUnit.test("Resize handler is called for AlignedFlowLayout containers", async function (assert) {
		var oResizeSpy = this.spy(ObjectContent.prototype, "_resizeAlignedFlowLayout");

		this.oCard.setManifest(oManifest_ComplexLayout);

		await nextCardReadyEvent(this.oCard);

		// Act
		this.oCard.getCardContent()._onResize({
			size: {
				width: 400
			},
			oldSize: {
				width: 0
			}
		});

		await nextUIUpdate();

		// Assert
		assert.strictEqual(oResizeSpy.callCount, 2, "Resize handler is called");
	});

	QUnit.test("itemsLayout 'Horizontal' wraps group items in an inner AlignedFlowLayout", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.itemsLayoutHorizontal",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"alignment": "Stretch",
							"itemsLayout": "Horizontal",
							"items": [
								{ "label": "First Name", "value": "Donna" },
								{ "label": "Last Name", "value": "Moore" },
								{ "label": "Phone", "value": "+1 202 555 5555" }
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oObjectContent = this.oCard.getCardContent();
		var oRoot = oObjectContent._getRootContainer();
		var oGroup = oRoot.getItems()[0];
		var aGroupItems = oGroup.getItems();
		var oInnerAFL = aGroupItems[aGroupItems.length - 1];

		// Assert
		assert.ok(oGroup.isA("sap.m.VBox"), "Group is a VBox");
		assert.ok(oInnerAFL.isA("sap.ui.layout.AlignedFlowLayout"), "An inner AlignedFlowLayout is created for itemsLayout 'Horizontal'");
		assert.strictEqual(oInnerAFL.getContent().length, 3, "All 3 items are added in the inner AlignedFlowLayout");

		oInnerAFL.getContent().forEach(function (oPair) {
			assert.ok(oPair.isA("sap.m.VBox"), "Each label/value pair is wrapped in a VBox");
			assert.ok(oPair.hasStyleClass("sapFCardObjectItemPairContainer"), "Pair container has the 'sapFCardObjectItemPairContainer' class");
			assert.strictEqual(oPair.getItems().length, 2, "Pair contains exactly the label and the value");
			assert.ok(oPair.getItems()[0].isA("sap.m.Label"), "First child of the pair is the Label");
		});
	});

	QUnit.test("itemsLayout 'Horizontal' with item icons keeps the existing HBox-pair without extra wrapping", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.itemsLayoutHorizontalIcons",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"alignment": "Stretch",
							"itemsLayout": "Horizontal",
							"items": [
								{
									"label": "Manager",
									"value": "John Miller",
									"icon": { "initials": "JM" }
								},
								{
									"label": "Assistant",
									"value": "Donna Moore",
									"icon": { "initials": "DM" }
								}
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oObjectContent = this.oCard.getCardContent();
		var oGroup = oObjectContent._getRootContainer().getItems()[0];
		var oInnerAFL = oGroup.getItems()[oGroup.getItems().length - 1];

		// Assert
		assert.ok(oInnerAFL.isA("sap.ui.layout.AlignedFlowLayout"), "Inner AlignedFlowLayout is created");
		assert.strictEqual(oInnerAFL.getContent().length, 2, "Both icon items are added in the inner AlignedFlowLayout");

		oInnerAFL.getContent().forEach(function (oPair) {
			assert.ok(oPair.isA("sap.m.HBox"), "Icon pair is the HBox returned by _createGroupItems (no extra VBox wrapper)");
			assert.notOk(oPair.hasStyleClass("sapFCardObjectItemPairContainer"), "Icon pair does not get the pair-container wrapper class");
		});
	});

	QUnit.test("itemsLayout 'Horizontal' works with alignment 'Default' (group sits in the outer AFL)", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.itemsLayoutHorizontalDefault",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"itemsLayout": "Horizontal",
							"items": [
								{ "label": "First Name", "value": "Donna" },
								{ "label": "Last Name", "value": "Moore" }
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oObjectContent = this.oCard.getCardContent();
		var oRoot = oObjectContent._getRootContainer();
		var oOuter = oRoot.getItems()[0];

		// Assert: Default alignment puts the group inside the outer AFL
		assert.ok(oOuter.isA("sap.ui.layout.AlignedFlowLayout"), "First root child is the outer AlignedFlowLayout (Default alignment)");
		assert.strictEqual(oOuter.getContent().length, 1, "Outer AFL contains the group");

		var oGroup = oOuter.getContent()[0];
		var oInnerAFL = oGroup.getItems()[oGroup.getItems().length - 1];

		assert.ok(oInnerAFL.isA("sap.ui.layout.AlignedFlowLayout"), "Inner AlignedFlowLayout is still created when itemsLayout is 'Horizontal'");
		assert.strictEqual(oInnerAFL.getContent().length, 2, "Both items are in the inner AlignedFlowLayout");
	});

	QUnit.test("itemsLayout 'Vertical' (default) keeps items as direct children of the group VBox", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.itemsLayoutVertical",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"alignment": "Stretch",
							"items": [
								{ "label": "First Name", "value": "Donna" },
								{ "label": "Last Name", "value": "Moore" }
							]
						},
						{
							"alignment": "Stretch",
							"itemsLayout": "Vertical",
							"items": [
								{ "label": "Phone", "value": "+1 202 555 5555" }
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oObjectContent = this.oCard.getCardContent();
		var aGroups = oObjectContent._getRootContainer().getItems();

		// Assert: no inner AFL is created for either group
		aGroups.forEach(function (oGroup, i) {
			var bHasInnerAFL = oGroup.getItems().some(function (oItem) {
				return oItem.isA("sap.ui.layout.AlignedFlowLayout");
			});
			assert.notOk(bHasInnerAFL, "Group " + i + " has no inner AlignedFlowLayout when itemsLayout is omitted/Vertical");
		});

		// Assert: Label and Value are siblings directly under the group VBox
		var oFirstGroup = aGroups[0];
		assert.ok(oFirstGroup.getItems()[0].isA("sap.m.Label"), "First child of the group is a Label");
		assert.ok(oFirstGroup.getItems()[1].isA("sap.m.Text"), "Second child of the group is the Text value");
	});

	QUnit.test("itemsLayout 'Horizontal' propagates labelWrapping to each item like the vertical layout does", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.itemsLayoutHorizontalLabelWrapping",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [
						{
							"alignment": "Stretch",
							"itemsLayout": "Horizontal",
							"labelWrapping": true,
							"items": [
								{ "label": "A very long label that should wrap", "value": "Donna" },
								{ "label": "Another long label that should wrap", "value": "Moore" }
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oObjectContent = this.oCard.getCardContent();
		var oGroup = oObjectContent._getRootContainer().getItems()[0];
		var oInnerAFL = oGroup.getItems()[oGroup.getItems().length - 1];

		oInnerAFL.getContent().forEach(function (oPair) {
			var oLabel = oPair.getItems()[0];
			assert.strictEqual(oLabel.getWrapping(), true, "Label inside horizontal pair has wrapping=true");
		});
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
			getHeight: function () { },
			getMainCard: function () {
				return this;
			}
		});

		oObjectContent.setActions(new CardActions());

		// Act
		oObjectContent.setConfiguration(oConfig);

		return oObjectContent;
	});

	QUnit.module("Form controls", {
		beforeEach: function() {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	function ckeckFormControls(assert, oCard) {
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
		assert.strictEqual(oTimePicker.getPlaceholder(), "Pick a time", "TimePicker has correct placeholder.");
		assert.strictEqual(oTimePicker.getValue(), "11:12", "Duration has correct value.");
		assert.strictEqual(oTimePicker.getLabels()[0].getText(), "Duration", "Duration is referenced to the correct label.");

		// Assert DateRange
		assert.ok(oDateRange.isA("sap.m.DatePicker"), "DateRange is created.");
		assert.strictEqual(oDateRange.getPlaceholder(), "Choose a date", "DateRange has correct placeholder.");
		assert.strictEqual(oDateRange.getValue(), "2000-01-01T00:00:00.000Z", "DateRange has correct value.");
		assert.strictEqual(oDateRange.getLabels()[0].getText(), "Date Range", "DateRange is referenced to the correct label.");
	}

	QUnit.test("Form controls are properly created", async function (assert) {
		this.oCard.setManifest(oManifest_ObjectCardFormControls);

		await nextCardReadyEvent(this.oCard);

		ckeckFormControls(assert, this.oCard);
	});

	QUnit.test("Form controls are properly created with content data", async function (assert) {
		this.oCard.setManifest(oManifest_ObjectCardFormControlsContentData);

		await nextCardReadyEvent(this.oCard);

		ckeckFormControls(assert, this.oCard);
	});

	QUnit.test("Form control values are properly passed on submit action", async function (assert) {
		const done = assert.async();
		const oCard = this.oCard;
		const oHost = new Host();

		assert.expect(9);

		const fnValidate = (oEvent) => {
			const mParameters = oEvent.getParameter("parameters");
			const mFormData = oEvent.getParameter("formData");
			const mExpectedData = {
					"reason": {
						"key": "reason1",
						"value": "Reason 1"
					},
					"comment": "Free text comment",
					"userValue": "Initial value",
					"durationValue": "PT11H12M",
					"dateRangeValue": DateRangeHelper.getValueForModel(this.oCard.getCardContent().getAggregation("_content").getItems()[0].getItems()[9])
				};

			assert.deepEqual(mFormData, mExpectedData, "Data is properly passed to action handler.");
			assert.deepEqual(mParameters.data, mExpectedData, "Data is properly passed to action handler."); // deprecated since 1.129
			assert.deepEqual(this.oCard.getModel("form").getData(), mExpectedData, "Data is properly populated in the form model.");
		};

		oCard.setHost(oHost);
		oCard.setManifest(oManifest_ObjectCardFormControls);

		await nextCardReadyEvent(this.oCard);

		oCard.attachAction(fnValidate);

		const oExtension = oCard.getAggregation("_extension");
		oExtension.attachAction(fnValidate);

		oHost.attachAction((oEvent) => {
			fnValidate(oEvent);

			oHost.destroy();
			done();
		});

		oCard.triggerAction({
			type: CardActionType.Submit
		});
	});

	QUnit.test("Check for duplicate ID in form controls", async function(assert) {
		var oLogSpy = this.spy(Log, "error");

		this.oCard.setManifest({
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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		assert.ok(oLogSpy.calledWithExactly(sinon.match("Duplicate form control ID"), "sap.ui.integration.widgets.Card"), "Error for duplicate ID should be logged");

		oLogSpy.restore();
	});

	QUnit.test("Form control values are properly passed on submit action - special value", async function (assert) {
		var oDataProviderStub = this.stub(RequestDataProvider.prototype, "getData").resolves("Success");

		this.oCard.setManifest(oManifest_ObjectCardFormControlsSpecialValue);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oTextArea = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getItems()[0];
		oTextArea.$("inner").val('{"reason": "{form>/reason/key}"}').trigger("input");
		this.oCard.triggerAction({
			type: CardActionType.Submit
		});

		// Assert
		assert.deepEqual(
			oDataProviderStub.thisValues[0].getResolvedConfiguration().request.parameters,
			{
				"status": "approved",
				"comment": '{"reason": "{form>/reason/key}"}'
			},
			"Text area with special value shouldn't break form submit"
		);
	});

	QUnit.test("Initial form control values are stored in the 'form' model", async function (assert) {
		this.oCard.setManifest({
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

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.strictEqual(this.oCard.getModel("form").getProperty("/comment"), "initial text area value", "Value should be stored in the 'form' model");
	});

	QUnit.test("Initial form control values that are bound are stored in the 'form' model", async function (assert) {
		this.oCard.setManifest({
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

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.strictEqual(this.oCard.getModel("form").getProperty("/comment"), "initial text area value", "Value should be stored in the 'form' model");
	});

	QUnit.test("Changes from user to form control values are reflected in the 'form' model", async function (assert) {
		// Setup
		this.oCard.setManifest({
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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getCardContent(),
			oInput = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[0],
			oTextArea = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1],
			oComboBox = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[2],
			oDateRange = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[3],
			oDuration = oContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[4];

		// Assert
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i1"), undefined, "No initial value is stored");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i2"), undefined, "No initial value is stored");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i3"), undefined, "No initial value is stored");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i4"), undefined, "No initial value is stored");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i5"), undefined, "No initial value is stored");

		// Act
		oInput.$("inner").val("a").trigger("input");
		oTextArea.$("inner").val("a").trigger("input");
		oComboBox.$("inner").val("a");
		oComboBox.fireEvent("change");
		oDateRange.$().find("input").val("Oct 7, 2021");
		oDateRange.onChange();
		oDuration.$().find("input").val("12:30");
		oDuration.onChange();

		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i1"), "a", "Value in model is updated");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i2"), "a", "Value in model is updated");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i3").value, "a", "Value in model is updated");
		assert.deepEqual(this.oCard.getModel("form").getProperty("/i4"), DateRangeHelper.getValueForModel(oDateRange), "Value in model is updated");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i5"), "PT12H30M", "Value in model is updated");

		// Act - set empty values
		oInput.$("inner").val("").trigger("input");
		oTextArea.$("inner").val("").trigger("input");
		oComboBox.$("inner").val("");
		oComboBox.fireEvent("change");
		oDateRange.$().find("input").val("");
		oDateRange.onChange();
		oDuration.$().find("input").val("");
		oDuration.onChange();

		assert.strictEqual(this.oCard.getModel("form").getProperty("/i1"), "", "Value in model is updated");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i2"), "", "Value in model is updated");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i3").value, "", "Value in model is updated");
		assert.deepEqual(this.oCard.getModel("form").getProperty("/i4"), DateRangeHelper.getValueForModel(oDateRange), "Value in model is updated");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/i5"), "PT0S", "Value in model is updated");
	});

	QUnit.test("Setting form data using public card API - invalid input", async function (assert) {
		this.oCard.setManifest({
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
									"id": "textArea",
									"type": "TextArea",
									"validations": [
										{
											"required": true
										}
									]
								},
								{
									"id": "input",
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
									"id": "dateRange",
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
		});

		await nextCardReadyEvent(this.oCard);

		// Act
		this.oCard.setFormValues([
			{ "id": "textArea", "value": "some text" },
			{ "id": "input", "value": "too short" }
		]);

		// Assert
		assert.strictEqual(this.oCard.getModel("messages").getProperty("/hasErrors"), true, "Form has errors");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/textArea"), "some text", "Form model has value");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/input"), "too short", "Form model has value");
	});

	QUnit.test("Setting form data using public card API - valid input", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.card5change"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"options": [
							{
								"id": "option1",
								"title": "Option 1"
							},
							{
								"id": "option2",
								"title": "Option 2"
							}
						]
					}
				},
				"content": {
					"groups": [
						{
							"items": [
								{
									"id": "textArea",
									"type": "TextArea"
								},
								{
									"id": "input",
									"type": "Input"
								},
								{
									"id": "dateRange",
									"type": "DateRange"
								},
								{
									"id": "duration",
									"type": "Duration"
								},
								{
									"id": "comboBox",
									"type": "ComboBox",
									"item": {
										"path": "/options",
										"template": {
											"key": "{id}",
											"title": "{title}"
										}
									}
								},
								{
									"id": "radioButtonGroup",
									"type": "RadioButtonGroup",
									"item": {
										"path": "/options",
										"template": {
											"text": "{title}",
											"key": "{id}"
										}
									}
								}
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);

		var oDateRange = this.oCard.getCardContent().getAggregation("_content").getItems()[0].getContent()[0].getItems()[2];

		// Act
		this.oCard.setFormValues([
			{ "id": "textArea", "value": "some text" },
			{ "id": "input", "value": "some long text" },
			{ "id": "dateRange", "value": { "option": "date", "values": ["2020-05-20"]} },
			{ "id": "duration", "value": "PT12H30M" },
			{ "id": "comboBox", "value": "some value" },
			{ "id": "radioButtonGroup", "key": "option2" }
		]);

		// Assert
		assert.strictEqual(this.oCard.getModel("messages").getProperty("/hasErrors"), false, "Form has no errors");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/textArea"), "some text", "Form model has correct value for Input");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/input"), "some long text", "Form model has correct value for TextArea");
		assert.deepEqual(this.oCard.getModel("form").getProperty("/dateRange"), DateRangeHelper.getValueForModel(oDateRange), "Form model has correct value for DateRange");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/duration"), "PT12H30M", "Form model has correct value for Duration");
		assert.deepEqual(
			this.oCard.getModel("form").getProperty("/comboBox"),
			{
				key: "",
				value: "some value"
			},
			"Form model has correct value for ComboBox"
		);
		assert.deepEqual(
			this.oCard.getModel("form").getProperty("/radioButtonGroup"),
			{
				"selectedIndex": 1,
				"selectedKey": "option2",
				"selectedText": null
			},
			"Form model has correct value for RadioButtonGroup"
		);

		// Act
		this.oCard.setFormValues([
			{ "id": "textArea", "value": "" },
			{ "id": "input", "value": "" },
			{ "id": "dateRange", "value": { "option": null, "values": null} },
			{ "id": "duration", "value": "" },
			{ "id": "comboBox", "value": "" }
		]);

		// Assert
		assert.strictEqual(this.oCard.getModel("messages").getProperty("/hasErrors"), false, "Form has no errors");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/textArea"), "", "Form model has correct value for Input");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/input"), "", "Form model has correct value for TextArea");
		assert.deepEqual(
			this.oCard.getModel("form").getProperty("/dateRange"),
			{
				range: undefined,
				rangeOData: undefined,
				value: undefined
			},
			"Form model has correct value for DateRange"
		);
		assert.strictEqual(this.oCard.getModel("form").getProperty("/duration"), "PT0S", "Form model has correct value for Duration");
		assert.deepEqual(
			this.oCard.getModel("form").getProperty("/comboBox"),
			{
				key: "",
				value: ""
			},
			"Form model has correct value for ComboBox"
		);

		// Act - set DateRange to null value
		this.oCard.setFormValues([
			{ "id": "dateRange", "value": { "option": "date", "values": ["2020-05-20"]} }
		]);
		this.oCard.setFormValues([
			{ "id": "dateRange", "value": null }
		]);

		// Assert
		assert.deepEqual(
			this.oCard.getModel("form").getProperty("/dateRange"),
			{
				range: undefined,
				rangeOData: undefined,
				value: undefined
			},
			"Form model has correct value for DateRange after setting null value"
		);
	});

	QUnit.test("Verifying RadioButtonGroup properties and bindings", async function (assert) {
		this.oCard.setManifest(oManifest_ObjectCard_With_Radio_Buttons);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0];
		const oGroup = oLayout.getContent()[0];
		const oRadioButtonGroup = oGroup.getItems()[2];

		assert.ok(oRadioButtonGroup.isA("sap.m.RadioButtonGroup"), "RadioButtonGroup control is instantiated");
		assert.strictEqual(oRadioButtonGroup.getButtons().length, 4, "RadioButtonGroup contains four radio buttons");

		const aButtons = oRadioButtonGroup.getButtons();

		assert.strictEqual(aButtons[0].getText(), "Active", "Button[0] text is 'Active'");
		assert.strictEqual(aButtons[0].getSelected(), false, "Button[0] is not selected");
		assert.strictEqual(aButtons[0].getEnabled(), true, "Button[0] is enabled");

		assert.strictEqual(aButtons[1].getText(), "Inactive", "Button[1] text is 'Inactive'");
		assert.strictEqual(aButtons[1].getSelected(), true, "Button[1] is selected by default (selectedIndex = 0)");
		assert.strictEqual(aButtons[1].getEnabled(), true, "Button[1] is enabled");

		assert.strictEqual(aButtons[2].getText(), "On Vacation", "Button[2] text is 'On Vacation'");
		assert.strictEqual(aButtons[2].getSelected(), false, "Button[2] is not selected");
		assert.strictEqual(aButtons[2].getEnabled(), true, "Button[2] is enabled");

		assert.strictEqual(aButtons[3].getText(), "Sick Leave", "Button[3] text is 'Sick Leave'");
		assert.strictEqual(aButtons[3].getSelected(), false, "Button[3] is not selected");
		assert.strictEqual(aButtons[3].getEnabled(), false, "Button[3] is disabled as configured");
	});

	QUnit.test("Setting form data via public card API - valid RadioButtonGroup input", async function (assert) {
		this.oCard.setManifest(oManifest_ObjectCard_With_Radio_Buttons);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0];
		const oGroup = oLayout.getContent()[0];
		const oRadioButtonGroup = oGroup.getItems()[2];
		const aButtons = oRadioButtonGroup.getButtons();

		assert.strictEqual(aButtons[1].getSelected(), true, "Button[1] is selected by default (selectedIndex = 0)");

		this.oCard.setFormValues([{ "id": "status", "selectedIndex": 2 }]);

		assert.strictEqual(this.oCard.getModel("messages").getProperty("/hasErrors"), false, "Form has no validation errors after setting valid RadioButtonGroup value");

		assert.strictEqual(this.oCard.getModel("form").getProperty("/status/selectedIndex"), 2, "Form model correctly reflects the selected radio button (index 2)");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/status/selectedKey"), "vacation", "Form model correctly reflects the selected radio button (key vacation)");
		assert.strictEqual(this.oCard.getModel("form").getProperty("/status/selectedText"), "On Vacation", "Form model correctly reflects the selected radio button (text On Vacation)");
		assert.strictEqual(aButtons[2].getSelected(), true, "Button[2] is selected");
	});

	QUnit.test("RadioButtonGroup with validation required, selected index and validateControls invocation", async function (assert) {
		this.oCard.setManifest(oManifest_RadioButtonGroupWithValidation);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0];
		const oGroup = oLayout.getContent()[0];
		const oRadioButtonGroup = oGroup.getItems()[2];

		assert.ok(oRadioButtonGroup.isA("sap.m.RadioButtonGroup"), "RadioButtonGroup control is created");
		assert.strictEqual(oRadioButtonGroup.getButtons().length, 4, "RadioButtonGroup contains four radio buttons");
		assert.strictEqual(oRadioButtonGroup.getSelectedIndex(), -1, "No radio button is selected initially");

		assert.strictEqual(this.oCard.getModel("messages").getProperty("/hasErrors"), true, "Form has validation errors initially");

		var aValidationRecords = this.oCard.getModel("messages").getProperty("/records");
		assert.strictEqual(aValidationRecords.length, 1, "There is one validation error");
		assert.strictEqual(aValidationRecords[0].bindingPath, "/priority", "Validation error is for the priority field");
		assert.strictEqual(aValidationRecords[0].message, "Field is required.", "Validation error message is correct");
		assert.strictEqual(aValidationRecords[0].type, "Error", "Validation error type is correct");

		const bValid = this.oCard.validateControls();

		await nextUIUpdate();

		assert.strictEqual(bValid, false, "validateControls returns false when there is a required field without value");
		assert.strictEqual(oRadioButtonGroup.getValueState(), ValueState.Error, "RadioButtonGroup shows error state after validation");
	});

	QUnit.test("RadioButtonGroup with validation required true and validateControls invocation", async function (assert) {
		this.oCard.setManifest(oManifest_RadioButtonGroupWithValidationWithSelection);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0];
		const oGroup = oLayout.getContent()[0];
		const oRadioButtonGroup = oGroup.getItems()[2];

		await nextUIUpdate();

		const bValid = this.oCard.validateControls();

		await nextUIUpdate();

		assert.strictEqual(bValid, true, "validateControls returns true when all required fields are valid");
		assert.strictEqual(this.oCard.getModel("messages").getProperty("/hasErrors"), false, "Form has no validation errors after selection");
		assert.strictEqual(this.oCard.getModel("messages").getProperty("/records").length, 0, "No validation error records remain");
		assert.strictEqual(oRadioButtonGroup.getValueState(), ValueState.None, "RadioButtonGroup shows no error state after valid selection");
		assert.strictEqual(oRadioButtonGroup.getSelectedIndex(), 1, "Correct radio button is selected");

		var oFormData = this.oCard.getModel("form").getProperty("/priority");
		assert.strictEqual(oFormData.selectedIndex, 1, "Form model reflects correct selected index");
	});

	QUnit.test("Creation of a required RadioButtonGroup", async function (assert) {
		this.oCard.setManifest(oManifest_RequiredRadioButtonGroup);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oLayout = this.oCard.getCardContent().getAggregation("_content").getItems()[0];
		const oGroup = oLayout.getContent()[0];
		const oLabel = oGroup.getItems()[1];
		const oRadioButtonGroup = oGroup.getItems()[2];

		assert.ok(oRadioButtonGroup.isA("sap.m.RadioButtonGroup"), "RadioButtonGroup control is created");
		assert.strictEqual(oRadioButtonGroup.getRequired(), true, "The required property is set on the RadioButtonGroup control itself");
		assert.ok(oLabel.isA("sap.m.Label"), "Label control is created");
		assert.strictEqual(oLabel.getRequired(), false, "The required indicator is carried by the control, not by the label");
	});

	QUnit.module("Form controls with Validation", {
		beforeEach: function() {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Controls validation", async function (assert) {
		this.oCard.setManifest(oManifest_ObjectCardFormControlsWithValidation);

		await nextCardReadyEvent(this.oCard);

		var oObjectContent = this.oCard.getCardContent(),
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

		assert.deepEqual(this.oCard.getModel("messages").getData(), {
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

		this.oCard.validateControls();

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

		assert.deepEqual(this.oCard.getModel("messages").getData(), {
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

		await nextUIUpdate();
		this.oCard.validateControls();

		assert.strictEqual(oComboBox1.getValueState(), ValueState.None, "Control doesn't have an error");
		assert.strictEqual(oComboBox2.getValueState(), ValueState.Error, "Control has an error 1111");
		assert.strictEqual(oComboBox2.getValueStateText(), oResourceBundle.getText("EDITOR_ONLY_LISTED_VALUES_ALLOWED"), "Error text is correct");
		assert.strictEqual(oTextArea.getValueState(), ValueState.Warning, "ComboBox has an warning");
		assert.strictEqual(oTextArea.getValueStateText(), "Your comment should be between 10 and 200 characters.", "Text is correct");
		assert.strictEqual(oTextArea2.getValueState(), ValueState.Error, "TextArea has an error");
		assert.strictEqual(oTextArea2.getValueStateText(), "You should enter a valid e-mail.", "Text is correct");
		assert.strictEqual(oTextArea3.getValueStateText(), "You should enter a valid path.", "Text is correct");
		assert.strictEqual(oDateRange.getValueState(), ValueState.Error, "Control has an error");
		assert.strictEqual(oDateRange.getValueStateText(), Library.getResourceBundleFor("sap.ui.core").getText("VALUE_STATE_ERROR"), "Text is correct");

		assert.deepEqual(this.oCard.getModel("messages").getData(),
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
						"message": Library.getResourceBundleFor("sap.ui.core").getText("VALUE_STATE_ERROR"),
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

		await nextUIUpdate();
		this.oCard.validateControls();

		assert.strictEqual(oComboBox2.getValueState(), ValueState.None, "Control doesn't have an error");
		assert.strictEqual(oTextArea.getValueState(), ValueState.None, "Control doesn't have an error");
		assert.strictEqual(oTextArea2.getValueState(), ValueState.None, "Control doesn't have an error");
		assert.strictEqual(oTextArea3.getValueState(), ValueState.None, "Control doesn't have an error and backslashes are escaped correctly");
		assert.strictEqual(oInput.getValueState(), ValueState.None, "Control doesn't have an error");
		assert.strictEqual(oDateRange.getValueState(), ValueState.None, "Control doesn't have an error");

		assert.deepEqual(this.oCard.getModel("messages").getData(), {
			"hasErrors": false,
			"hasWarnings": false,
			"records": []
		}, "messages model is correct");

	});

	QUnit.test("Controls validation when no data and no binding", async function (assert) {
		this.oCard.setManifest(oManifest_ObjectCardFormControlsWithValidationNoDataNoBinding);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		assert.deepEqual(
			this.oCard.getModel("messages").getData(),
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
			},
			"messages model is correct"
		);
	});

	QUnit.module("titleMaxLine and labelWrapping", {
		beforeEach: function() {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("titleMaxLine and labelWrapping are applied correctly", async function (assert) {
		this.oCard.setManifest({
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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getCardContent(),
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
	});

	QUnit.test("labelWrapping defaults to true when not specified", async function (assert) {
		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.object.card.labelWrappingDefault"
			},
			"sap.card": {
				"type": "Object",
				"content": {
					"groups": [{
						"title": "Group without labelWrapping specified",
						"items": [{
							"label": "Some very very long label that should wrap by default"
						}]
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getCardContent(),
			aGroups = oContent.getAggregation("_content").getItems()[0].getContent(),
			oLabel = aGroups[0].getItems()[1];

		assert.ok(oLabel.getWrapping(), "Label has wrapping=true by default");
		assert.ok(oLabel.$().hasClass("sapMLabelWrapped"), "Label is wrapped by default when labelWrapping is not specified");
	});

	QUnit.module("Forms Extension Validation", {
		beforeEach: function() {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});


	QUnit.test("Function", async function(assert) {
		this.oCard.setManifest({
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

		await nextCardReadyEvent(this.oCard);
		var oObjectContent = this.oCard.getCardContent(),
			oTextArea = oObjectContent.getAggregation("_content").getItems()[0].getContent()[0].getItems()[1];

		oTextArea.setValue("Text");
		await nextUIUpdate();
		this.oCard.validateControls();

		assert.strictEqual(oTextArea.getValueState(), ValueState.Warning, "Input field has a warning");
		assert.strictEqual(oTextArea.getValueStateText(), "You should enter valid e-mail.", "Validation warning message is correct");

		oTextArea.setValue("my@mail.com");
		await nextUIUpdate();
		this.oCard.validateControls();

		assert.strictEqual(oTextArea.getValueState(), ValueState.None, "Validation passed");
	});

	QUnit.module("Form controls: DateRange", {
		beforeEach: function() {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Timezone", async function (assert) {
		const sTimezone = Localization.getTimezone();
		const oCard = this.oCard;
		const done = assert.async();

		Localization.setTimezone("America/Los_Angeles");

		oCard.setManifest({
			"sap.app": {
				"id": "test.card.object.dateRangeTimezone",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "test"
				},
				"content": {
					"groups": [
						{
							"items": [
								{
									"id": "date",
									"label": "Date",
									"type": "DateRange",
									"value": {
										"option": "date",
										"values": ["2025-03-10"]
									}
								}
							]
						}
					]
				}
			}
		});

		await nextCardReadyEvent(oCard);

		oCard.attachAction((oEvent) => {
			const oParams = oEvent.getParameter("parameters");

			const oExpectedRange = {
				end: "2025-03-11T06:59:59.999Z",
				endLocalDate: "2025-03-10",
				start: "2025-03-10T07:00:00.000Z",
				startLocalDate: "2025-03-10"
			};

			assert.deepEqual(oParams.data.date.range, oExpectedRange, "The output start and end dates in UTC and local zones are as expected.");

			// clean up - reset timezone
			Localization.setTimezone(sTimezone);

			done();
		});

		oCard.triggerAction({
			type: CardActionType.Submit
		});
	});

	QUnit.module("'Image' items", {
		beforeEach: function() {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "test.cards.object.card2",
						"type": "card"
					},
					"sap.card": {
						"type": "Object",
						"header": {
							"title": "Title",
							"visible": false
						},
						"content": {
							"groups": [{
								"items": [
									{
										"type": "Image",
										"src": "images/grass.jpg",
										"alt": "Picture of grass",
										"tooltip": "Green grass",
										"fullWidth": true,
										"height": "200px",
										"imageFit": "cover",
										"imagePosition": "center",
										"overlay": {
											"supertitle": "Sun, May 28",
											"title": "Hello, John",
											"subtitle": "Today will be a good day!",
											"textColor": "#fff",
											"verticalPosition": "Center",
											"horizontalPosition": "End",
											"background": "rgb(34, 38, 43, 0.4)",
											"animation": "FadeIn"
										}
									},
									{
										"type": "Image",
										"src": "images/grass.jpg",
										"overlay": {
											"title": "Hello, John",
											"background": "rgb(34, 38, 43, 0.4)",
											"animation": "FadeIn"
										}
									},
									{
										"type": "Image",
										"src": "images/grass.jpg",
										"overlay": {
											"title": "Hello, John",
											"background": "rgb(34, 38, 43, 0.4)",
											"animation": "None"
										}
									},
									{
										"type": "Image",
										"src": "images/grass.jpg",
										"overlay": {
											"title": "Hello, John",
											"background": "rgb(34, 38, 43, 0.4)"
										}
									},
									{
										"type": "Image",
										"src": "some/invalid/path.jpg",
										"fallbackSrc": "images/grass.jpg",
										"overlay": {
											"title": "Hello, John",
											"background": "rgb(34, 38, 43, 0.4)"
										}
									}
								]
							}]
						}
					}
				}
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Image and Overlay", async function (assert) {
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oContent = oObjectContent.getAggregation("_content");
		var aGroups = oContent.getItems()[0].getContent();

		// Image
		assert.ok(aGroups[0].getItems()[0].isA("sap.ui.core.Control"), "Image with overlay is rendered.");
		assert.equal(aGroups[0].getItems()[0].getAggregation("image").getSrc(), "test-resources/sap/ui/integration/qunit/testResources/images/grass.jpg", "Image's source is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getAggregation("image").getAlt(), "Picture of grass", "Image's alt text is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getTooltip(), "Green grass", "Image's tooltip is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getSupertitle(), "Sun, May 28", "Image's supertitle is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getTitle(), "Hello, John", "Image's title is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getSubtitle(), "Today will be a good day!", "Image's subtitle is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getVerticalPosition(), "Center", "Image's verticalPosition is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getHorizontalPosition(), "End", "Image's horizontalPosition is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getTextColor(), "#fff", "Image's textColor is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getBackground(), "rgb(34, 38, 43, 0.4)", "Image's background is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getAggregation("image").getHeight(), "200px", "Image's height is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getAggregation("image").getBackgroundSize(), "cover", "Image's imageFit is correctly set.");
		assert.equal(aGroups[0].getItems()[0].getAggregation("image").getBackgroundPosition(), "center", "Image's imagePosition is correctly set.");
	});

	QUnit.test("Image and Overlay - Animation", async function (assert) {
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oContent = oObjectContent.getAggregation("_content");
		var aGroups = oContent.getItems()[0].getContent();

		var done = assert.async();
		assert.equal(aGroups[0].getItems()[0].getAnimation(), "FadeIn", "Image overlay animation is correctly set.");

		var oImage = aGroups[0].getItems()[0].getImage();

		oImage.attachLoad(function(){
			assert.ok(this.getParent().getDomRef().classList.contains("sapUiIntImgWithOverlayLoaded"), "Image is loaded and animation is active.");
			done();
		});
	});

	QUnit.test("Image and Overlay - Animation turned off", async function (assert) {
		// Act
		Configuration.setAnimationMode(AnimationMode.none);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oContent = oObjectContent.getAggregation("_content");
		var aGroups = oContent.getItems()[0].getContent();

		var done = assert.async();
		assert.equal(aGroups[0].getItems()[1].getAnimation(), "FadeIn", "Image overlay animation is correctly set.");

		var oImage = aGroups[0].getItems()[1].getImage();

		oImage.attachLoad(function(){
			assert.notOk(this.getParent().getDomRef().classList.contains("sapUiIntImgWithOverlayLoaded"), "There is no animation.");
			done();
		});

		// Restore default animation mode
		Configuration.setAnimationMode(AnimationMode.full);
	});

	QUnit.test("Image and Overlay - No Animation", async function (assert) {
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oContent = oObjectContent.getAggregation("_content");
		var aGroups = oContent.getItems()[0].getContent();

		var done = assert.async();
		assert.equal(aGroups[0].getItems()[2].getAnimation(), "None", "Image overlay animation is correctly set.");

		var oImage = aGroups[0].getItems()[2].getImage();

		oImage.attachLoad(function(){
			assert.notOk(this.getParent().getDomRef().classList.contains("sapUiIntImgWithOverlayLoaded"), "There is no animation.");
			done();
		});
	});

	QUnit.test("Image and Overlay - No Animation (default)", async function (assert) {
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oContent = oObjectContent.getAggregation("_content");
		var aGroups = oContent.getItems()[0].getContent();

		var done = assert.async();
		assert.equal(aGroups[0].getItems()[3].getAnimation(), "None", "Image overlay animation is correctly set.");

		var oImage = aGroups[0].getItems()[3].getImage();

		oImage.attachLoad(function(){
			assert.notOk(this.getParent().getDomRef().classList.contains("sapUiIntImgWithOverlayLoaded"), "There is no animation.");
			done();
		});
	});

	QUnit.test("Image and Overlay - Image src for Mobile SDK", async function (assert) {
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oContent = this.oCard.getAggregation("_content"),
			oStaticConfiguration = oContent.getStaticConfiguration();

		var aItems = oStaticConfiguration.groups[0].items;
		assert.equal(aItems[0].src, this.oCard.getBaseUrl() + "images/grass.jpg", "item 0: src format correct");
		assert.equal(aItems[1].src, this.oCard.getBaseUrl() + "images/grass.jpg", "item 1: src format correct");
		assert.equal(aItems[2].src, this.oCard.getBaseUrl() + "images/grass.jpg", "item 2: src format correct");
		assert.equal(aItems[3].src, this.oCard.getBaseUrl() + "images/grass.jpg", "item 3: src format correct");
		assert.equal(aItems[4].src, this.oCard.getBaseUrl() + "some/invalid/path.jpg", "item 4: src format correct");
	});

	QUnit.test("Image fails to load, fallback image is loaded", async function (assert) {
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oObjectContent = this.oCard.getAggregation("_content");
		const oContent = oObjectContent.getAggregation("_content");
		const aGroups = oContent.getItems()[0].getContent();
		const oImage = aGroups[0].getItems()[4].getImage();
		const done = assert.async();

		oImage.attachEventOnce("load", function(){
			assert.ok(oImage.getSrc().endsWith("/images/grass.jpg"), "Fallback image is loaded.");

			done();
		});
	});

	QUnit.test("Image properties (imageFit, imagePosition, height) work correctly when bound to data", async function (assert) {
		// Arrange
		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cards.object.imagePropertiesBound",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"fit": "contain",
						"position": "center",
						"height": "200px",
						"src": "images/grass.jpg"
					}
				},
				"header": {
					"title": "Test Image Properties with Data Binding"
				},
				"content": {
					"groups": [
						{
							"alignment": "Stretch",
							"items": [
								{
									"type": "Image",
									"src": "{/src}",
									"fullWidth": true,
									"height": "{/height}",
									"imageFit": "{/fit}",
									"imagePosition": "{/position}"
								}
							]
						}
					]
				}
			}
		});

		// Act
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oObjectContent = this.oCard.getAggregation("_content");
		const oContent = oObjectContent.getAggregation("_content");
		const oImage = oContent.getItems()[0].getItems()[0];

		// Assert
		assert.ok(oImage.isA("sap.m.Image"), "Image control is created");
		assert.strictEqual(oImage.getHeight(), "200px", "height property is correctly bound and resolved");
		assert.strictEqual(oImage.getBackgroundSize(), "contain", "imageFit property is correctly bound and resolved");
		assert.strictEqual(oImage.getBackgroundPosition(), "center", "imagePosition property is correctly bound and resolved");
		assert.strictEqual(oImage.getMode(), "Background", "Image mode is set to 'Background' when imageFit or imagePosition is used");
	});

	QUnit.module("Test deprecated image overlay subTitle", {
		beforeEach: function() {
			this.oCard = new Card({
				width: "400px",
				height: "600px",
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "test.cards.object.card2",
						"type": "card"
					},
					"sap.card": {
						"type": "Object",
						"header": {
							"title": "Title"
						},
						"content": {
							"groups": [{
								"items": [
									{
										"type": "Image",
										"overlay": {
											"subTitle": "Today will be a good day!"
										}
									}
								]
							}]
						}
					}
				}
			});

			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Check that the deprecated subTitle property still works", async function (assert) {
		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oObjectContent = this.oCard.getAggregation("_content");
		var oContent = oObjectContent.getAggregation("_content");
		var aGroups = oContent.getItems()[0].getContent();

		// Image
		assert.equal(aGroups[0].getItems()[0].getSubtitle(), "Today will be a good day!", "Image's subtitle is correctly set.");
	});
});
