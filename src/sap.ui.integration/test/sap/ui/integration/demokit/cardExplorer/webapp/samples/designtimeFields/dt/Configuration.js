sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"generalGroup": {
						"type": "group",
						"label": "General",
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"cardTitle": {
						"manifestpath": "/sap.card/configuration/parameters/cardTitle/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"allowDynamicValues": true,
						"editableToUser": false,
						"visibleToUser": false
					},
					"separator1": {
						"type": "separator"
					},
					"string": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"label": "String Label",
						"translatable": true,
						"required": true,
						"editableToUser": false
					},
					"stringWithTranslatedValue": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTranslatedValue/value",
						"type": "string",
						"label": "{i18n>TRANSLATED_STRING_LABEL}",
						"translatable": true,
						"allowDynamicValues": false
					},
					"stringWithTranslatedValueIni18nFormat": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTranslatedValueIni18nFormat/value",
						"type": "string",
						"label": "String with translated value in i18n format",
						"description": "A very long description text that should wrap into the next line"
					},
					"separator2": {
						"type": "separator"
					},
					"stringInCols1": {
						"manifestpath": "/sap.card/configuration/parameters/stringInCols1/value",
						"label": "Column 1",
						"description": "Two columns in the same line",
						"type": "string",
						"cols": 1,
						"allowSettings": false,
						"translatable": true
					},
					"stringInCols2": {
						"manifestpath": "/sap.card/configuration/parameters/stringInCols2/value",
						"label": "Column 2",
						"type": "string",
						"cols": 1,
						"allowSettings": false
					},
					"separator3": {
						"type": "separator"
					},
					"integerLabel": {
						"manifestpath": "/sap.card/configuration/parameters/integerLabel/value",
						"type": "integer",
						"label": "Direct Integer Label"
					},
					"integer": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"type": "integer",
						"label": "Integer with Slider",
						"visualization": {
							"type": "Slider",
							"settings": {
								"value": "{currentSettings>value}",
								"min": 0,
								"max": 10,
								"width": "100%",
								"showAdvancedTooltip": true,
								"showHandleTooltip": false,
								"inputsAsTooltips": true,
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"separator4": {
						"type": "separator"
					},
					"number": {
						"manifestpath": "/sap.card/configuration/parameters/number/value",
						"type": "number",
						"label": "{i18n>TRANSLATED_NUMBER_LABEL}"
					},
					"separator5": {
						"type": "separator"
					},
					"booleanLabel": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel/value",
						"label": "Boolean",
						"type": "boolean"
					},
					"boolean": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"description": "Description",
						"label": "Boolean with Switch",
						"type": "boolean",
						"visualization": {
							"type": "Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"separator6": {
						"type": "separator"
					},
					"date": {
						"manifestpath": "/sap.card/configuration/parameters/date/value",
						"type": "date",
						"label": "Date"
					},
					"dateTime": {
						"manifestpath": "/sap.card/configuration/parameters/dateTime/value",
						"type": "datetime",
						"label": "Date Time"
					},
					"separator7": {
						"type": "separator"
					},
					"enum": {
						"manifestpath": "/sap.card/configuration/parameters/enum/value",
						"label": "Enumerations",
						"type": "enum",
						"enum": [
							"Option A",
							"Option B",
							"Option C"
						]
					},
					"lists": {
						"type": "group",
						"label": "Value Selection"
					},
					"stringWithStaticList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithStaticList/value",
						"type": "string",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
										{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
										{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" }
									]
								},
								"path": "/values"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"stringWithRequestList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithRequestList/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "./stringWithRequestList.json"
								},
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"stringArray": {
						"manifestpath": "/sap.card/configuration/parameters/stringArray/value",
						"label": "String Array",
						"type": "string[]",
						"values": {
							"data": {
								"json": [
									{ "text": "text1", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
									{ "text": "text2", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
									{ "text": "text3", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" }
								],
								"path": "/"
							},
							"item": {
								"text": "{text}",
								"key": "{key}",
								"additionalText": "{additionalText}",
								"icon": "{icon}"
							}
						}
					},
					"stringArrayNoValues": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayNoValues/value",
						"label": "String Array With Request List",
						"type": "string[]"
					},
					"Customers": {
						"manifestpath": "/sap.card/configuration/parameters/Customers/value",
						"type": "string[]",
						"label": "String Array With No Values",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.Northwind_V3}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"iconNotAllowFile": {
						"manifestpath": "/sap.card/configuration/parameters/iconNotAllowFile/src",
						"type": "string",
						"label": "Icon Selectioin",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowFile": false,
								"allowNone": true
							}
						}
					},
					"iconWithImageNotAllowNone": {
						"manifestpath": "/sap.card/configuration/parameters/iconWithImageNotAllowNone/value",
						"type": "string",
						"label": "icon Selected from File",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowNone": false
							}
						}
					},
					"icon": {
						"manifestpath": "/sap.card/header/icon/src",
						"type": "string",
						"label": "Icon",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						}
					},
					"color": {
						"manifestpath": "/sap.card/header/icon/backgroundColor",
						"type": "string",
						"label": "Icon Background",
						"description": "Description",
						"visualization": {
							"type": "ColorSelect",
							"settings": {
								"enumValue": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"shape": {
						"manifestpath": "/sap.card/header/icon/shape",
						"label": "Icon Shape",
						"type": "string",
						"description": "Description",
						"visualization": {
							"type": "ShapeSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"group": {
						"label": "Dependent",
						"type": "group"
					},
					"stringDependent": {
						"manifestpath": "/sap.card/configuration/parameters/stringDependent/value",
						"label": "String: editable, visible, label",
						"type": "string",
						"translatable": true
					},
					"dependentString1": {
						"manifestpath": "/sap.card/configuration/parameters/dependentString1/value",
						"type": "string",
						"label": "{= ${items>stringDependent/value} === 'label'? 'stringDependent True' : 'stringDependent False' }",
						"editable": "{= ${items>stringDependent/value} === 'editable'}",
						"visible": "{= ${items>stringDependent/value} === 'visible'}"
					},
					"integerDependent": {
						"manifestpath": "/sap.card/configuration/parameters/integerDependent/value",
						"type": "integer",
						"label": "Integer: 1, 3, 6, 9"
					},
					"dependentInteger1": {
						"manifestpath": "/sap.card/configuration/parameters/dependentInteger1/value",
						"type": "string",
						"label": "{= ${items>integerDependent/value} > 8 ? 'integerDependent True' : 'integerDependent False' }",
						"editable": "{= ${items>integerDependent/value} > 5}",
						"visible": "{= ${items>integerDependent/value} > 2}"
					},
					"booleanDependent": {
						"manifestpath": "/sap.card/configuration/parameters/booleanDependent/value",
						"type": "boolean",
						"label": "Boolean",
						"visualization": {
							"type": "Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"dependentBoolean1": {
						"manifestpath": "/sap.card/configuration/parameters/dependentBoolean1/value",
						"type": "string",
						"label": "{= ${items>booleanDependent/value} === true ? 'booleanDependent True' : 'booleanDependent False' }",
						"editable": "{items>booleanDependent/value}",
						"visible": "{items>booleanDependent/value}"
					},
					"filterBackendInStringArray": {
						"label": "Filter backend by input in MultiComboBox",
						"type": "group"
					},
					"CustomersWithMultiKeys": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersWithMultiKeys/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$filter": "startswith(CompanyName,'{currentSettings>suggestValue}')"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}/{CompanyName}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							},
							"keySeparator": "/"
						}
					},
					"CustomersWithMultiKeysAndSeperator": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersWithMultiKeysAndSeperator/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$filter": "startswith(CompanyName,'{currentSettings>suggestValue}')"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}#{CompanyName}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"CustomersWithFilterParameter": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersWithFilterParameter/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$filter": "startswith(CompanyName,'{currentSettings>suggestValue}')"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"CustomersWithFilterInURL": {
						"manifestpath": "/sap.card/configuration/parameters/CustomersWithFilterInURL/value",
						"type": "string[]",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers?$select=CustomerID, CompanyName, Country, City, Address&$filter=contains(CompanyName,'{currentSettings>suggestValue}')"
								},
								"path": "/value"
							},
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"objectFieldGroup": {
						"type": "group",
						"label": "Object Fields"
					},
					"object": {
						"manifestpath": "/sap.card/configuration/parameters/object/value",
						"type": "object",
						"label": "Object Field"
					},
					"objectWithPropertiesDefined": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefined/value",
						"type": "object",
						"label": "Object properties defined",
						"properties": {
							"key": {
								"label": "Key"
							},
							"icon": {
								"label": "Icon"
							},
							"text": {
								"label": "Text",
								"translatable": true
							},
							"url": {
								"label": "URL"
							},
							"editable": {
								"label": "Editable",
								"type": "boolean"
							},
							"int": {
								"label": "Integer",
								"type": "int",
								"formatter": {
									"minIntegerDigits": 1,
									"maxIntegerDigits": 6,
									"emptyString": ""
								}
							},
							"number": {
								"label": "Number",
								"type": "number",
								"formatter": {
									"decimals": 1,
									"style":"short"
								}
							}
						}
					},
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value",
						"type": "object",
						"label": "Object properties defined: value from Json list",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 },
										{ "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2 },
										{ "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3 },
										{ "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4 },
										{ "text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5 },
										{ "text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6 },
										{ "text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7 },
										{ "text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8 }
									]
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "Key"
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"type": "Icon",
									"color": "{iconcolor}"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"translatable": true,
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"
								}
							},
							"url": {
								"label": "URL",
								"defaultValue": "http://",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"label": "URL Link",
									"filterProperty": "url",
									"defaultFilterOperator": "StartsWith"
								},
								"cell": {
									"type": "Link",
									"href": "{url}"
								}
							},
							"editable": {
								"label": "Editable",
								"defaultValue": false,
								"type": "boolean"
							},
							"int": {
								"label": "Integer",
								"defaultValue": 0,
								"type": "int",
								"formatter": {
									"minIntegerDigits": 1,
									"maxIntegerDigits": 6,
									"emptyString": ""
								},
								"column": {
									"hAlign": "Center",
									"width": "5rem",
									"label": "Integer",
									"filterProperty": "int",
									"defaultFilterOperator": "EQ",
									"filterType": "sap.ui.model.type.Integer"
								}
							},
							"number": {
								"label": "Number",
								"defaultValue": 0.5,
								"type": "number",
								"formatter": {
									"decimals": 1,
									"style":"short"
								}
							}
						},
						"addButtonText": "Add a new step"
					},
					"objectWithPropertiesDefinedAndValueFromRequestedFile": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromRequestedFile/value",
						"type": "object",
						"label": "Object properties defined: value from requested file",
						"values": {
							"data": {
								"request": {
									"url": "./objectWithRequestList.json"
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "Key"
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"type": "Icon",
									"color": "{iconcolor}"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"
								}
							},
							"additionalText": {
								"label": "Additional Text",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"
								}
							}
						}
					},
					"objectWithPropertiesDefinedAndValueFromODataRequest": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromODataRequest/value",
						"type": "object",
						"label": "Object properties defined: value from OData Request",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address"
									}
								},
								"path": "/value"
							},
							"allowAdd": true
						},
						"properties": {
							"CustomerID": {
								"label": "Customer ID",
								"column": {
									"filterProperty": "CustomerID",
									"defaultFilterOperator": "Contains"
								}
							},
							"CompanyName": {
								"label": "Company Name",
								"column": {
									"width": "10rem",
									"filterProperty": "CompanyName",
									"defaultFilterOperator": "Contains"
								}
							},
							"Country": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "Country",
									"defaultFilterOperator": "Contains"
								}
							},
							"City": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "City",
									"defaultFilterOperator": "Contains"
								}
							},
							"Address": {
								"column": {
									"width": "10rem",
									"filterProperty": "Address",
									"defaultFilterOperator": "Contains"
								}
							}
						}
					},
					"objectListFieldGroup": {
						"type": "group",
						"label": "Object List Fields"
					},
					"objects": {
						"manifestpath": "/sap.card/configuration/parameters/objects/value",
						"type": "object[]",
						"label": "Object List Field"
					},
					"objectsWithPropertiesDefined": {
						"manifestpath": "/sap.card/configuration/parameters/objectsWithPropertiesDefined/value",
						"type": "object[]",
						"label": "Object properties defined",
						"properties": {
							"key": {
								"label": "Key"
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"type": "Icon",
									"color": "{iconcolor}"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"translatable": true,
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"
								}
							},
							"url": {
								"label": "URL",
								"defaultValue": "http://",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"label": "URL Link",
									"filterProperty": "url",
									"defaultFilterOperator": "StartsWith"
								},
								"cell": {
									"type": "Link",
									"href": "{url}"
								}
							},
							"editable": {
								"label": "Editable",
								"defaultValue": false,
								"type": "boolean"
							},
							"int": {
								"label": "Integer",
								"defaultValue": 0,
								"type": "int",
								"formatter": {
									"minIntegerDigits": 1,
									"maxIntegerDigits": 6,
									"emptyString": ""
								},
								"column": {
									"hAlign": "Center",
									"width": "5rem",
									"label": "Integer",
									"filterProperty": "int",
									"defaultFilterOperator": "EQ",
									"filterType": "sap.ui.model.type.Integer"
								}
							},
							"number": {
								"label": "Number",
								"defaultValue": 0.5,
								"type": "number",
								"formatter": {
									"decimals": 1,
									"style":"short"
								}
							}
						},
						"addButtonText": "Add a new step"
					},
					"objectsWithPropertiesDefinedAndValueFromJsonList": {
						"manifestpath": "/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromJsonList/value",
						"type": "object[]",
						"label": "Object properties defined: value from Json list",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "text01", "key": "key01", "url": "https://sapui5.hana.ondemand.com/06", "icon": "sap-icon://accept", "iconcolor": "#031E48", "int": 1 },
										{ "text": "text02", "key": "key02", "url": "http://sapui5.hana.ondemand.com/05", "icon": "sap-icon://cart", "iconcolor": "#64E4CE", "int": 2 },
										{ "text": "text03", "key": "key03", "url": "https://sapui5.hana.ondemand.com/04", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 3 },
										{ "text": "text04", "key": "key04", "url": "https://sapui5.hana.ondemand.com/03", "icon": "sap-icon://accept", "iconcolor": "#1C4C98", "int": 4 },
										{ "text": "text05", "key": "key05", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#8875E7", "int": 5 },
										{ "text": "text06", "key": "key06", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#E69A17", "int": 6 },
										{ "text": "text07", "key": "key07", "url": "http://sapui5.hana.ondemand.com/02", "icon": "sap-icon://cart", "iconcolor": "#1C4C98", "int": 7 },
										{ "text": "text08", "key": "key08", "url": "https://sapui5.hana.ondemand.com/01", "icon": "sap-icon://zoom-in", "iconcolor": "#8875E7", "int": 8 }
									]
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "Key",
								"column": {
									"filterProperty": "key"
								}
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"type": "Icon",
									"color": "{iconcolor}"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"
								}
							},
							"url": {
								"label": "URL",
								"defaultValue": "http://",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"label": "URL Link",
									"filterProperty": "url",
									"defaultFilterOperator": "StartsWith"
								},
								"cell": {
									"type": "Link",
									"href": "{url}aa"
								}
							},
							"editable": {
								"label": "Editable",
								"defaultValue": false,
								"type": "boolean",
								"column": {
									"hAlign": "Center"
								},
								"cell": {
									"type": "Switch",
									"customTextOn": "YES",
									"customTextOff": "NO"
								}
							},
							"int": {
								"label": "Integer",
								"defaultValue": 0,
								"type": "int",
								"formatter": {
									"minIntegerDigits": 1,
									"maxIntegerDigits": 6,
									"emptyString": ""
								},
								"column": {
									"hAlign": "Center",
									"width": "5rem",
									"label": "Integer",
									"filterProperty": "int",
									"defaultFilterOperator": "EQ",
									"filterType": "sap.ui.model.type.Integer"
								}
							},
							"number": {
								"label": "Number",
								"defaultValue": 0.5,
								"type": "number",
								"formatter": {
									"decimals": 1,
									"style":"short"
								}
							}
						}
					},
					"objectsWithPropertiesDefinedAndValueFromRequestedFile": {
						"manifestpath": "/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromRequestedFile/value",
						"type": "object[]",
						"label": "Object properties defined: value from requested file",
						"values": {
							"data": {
								"request": {
									"url": "./objectWithRequestList.json"
								},
								"path": "/values"
							},
							"allowAdd": true
						},
						"properties": {
							"key": {
								"label": "Key",
								"column": {
									"filterProperty": "key"
								}
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"column": {
									"hAlign": "Center",
									"width": "4rem"
								},
								"cell": {
									"type": "Icon",
									"color": "{iconcolor}"
								}
							},
							"text": {
								"label": "Text",
								"defaultValue": "text",
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"
								}
							},
							"additionalText": {
								"label": "Additional Text",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"
								}
							}
						}
					},
					"objectsWithPropertiesDefinedAndValueFromODataRequest": {
						"manifestpath": "/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromODataRequest/value",
						"type": "object[]",
						"label": "Object properties defined: value from OData Request",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address"
									}
								},
								"path": "/value"
							},
							"allowAdd": true
						},
						"properties": {
							"CustomerID": {
								"label": "Customer ID",
								"column": {
									"filterProperty": "CustomerID",
									"defaultFilterOperator": "Contains"
								}
							},
							"CompanyName": {
								"label": "Company Name",
								"column": {
									"width": "10rem",
									"filterProperty": "CompanyName",
									"defaultFilterOperator": "Contains"
								}
							},
							"Country": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "Country",
									"defaultFilterOperator": "Contains"
								}
							},
							"City": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "City",
									"defaultFilterOperator": "Contains"
								}
							},
							"Address": {
								"column": {
									"width": "10rem",
									"filterProperty": "Address",
									"defaultFilterOperator": "Contains"
								}
							}
						}
					}
				}
			},
			"preview": {
				"modes": "None"
			}
		});
	};
});
