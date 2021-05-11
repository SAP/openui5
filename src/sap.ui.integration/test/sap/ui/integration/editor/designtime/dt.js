/*!
 * ${copyright}
 */
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
					"string": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"editableToUser": false
					},
					"stringLabel": {
						"manifestpath": "/sap.card/configuration/parameters/stringLabel/value",
						"type": "string",
						"label": "Direct String Label",
						"editableToUser": true,
						"visibleToUser": true
					},
					"stringLabelTrans": {
						"manifestpath": "/sap.card/configuration/parameters/stringLabelTrans/value",
						"type": "string",
						"label": "{i18n>TRANSLATED_STRING_LABEL}",
						"translatable": true,
						"allowDynamicValues": false
					},
					"stringWithDescription": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithDescription/value",
						"type": "string",
						"label": "String with description",
						"description": "Description"
					},
					"stringWithLongDescription": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithLongDescription/value",
						"type": "string",
						"label": "String with long description",
						"description": "A very long description text that should wrap into the next line"
					},
					"stringWithTranslatedValue": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTranslatedValue/value",
						"type": "string",
						"label": "String with translated value",
						"translatable": true
					},
					"stringWithTranslatedValueIni18nFormat": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTranslatedValueIni18nFormat/value",
						"type": "string",
						"label": "String with translated value in i18n format"
					},
					"stringInCols1": {
						"manifestpath": "/sap.card/configuration/parameters/stringInCols1/value",
						"label": "stringInCols1 long long long long long long long long long long long long label",
						"description": "aa",
						"type": "string",
						"cols": 1,
						"allowSettings": false,
						"translatable": true
					},
					"stringInCols2": {
						"manifestpath": "/sap.card/configuration/parameters/stringInCols2/value",
						"label": "URL",
						"type": "string",
						"cols": 1,
						"allowSettings": false
					},
					"integer": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"type": "integer",
						"visualization": {
							"type": "sap/m/Slider",
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
					"integerLabel": {
						"manifestpath": "/sap.card/configuration/parameters/integerLabel/value",
						"type": "integer",
						"label": "Direct Integer Label"
					},
					"integerLabelTrans": {
						"manifestpath": "/sap.card/configuration/parameters/integerLabelTrans/value",
						"type": "integer",
						"label": "{i18n>TRANSLATED_INTEGER_LABEL}"
					},
					"number": {
						"manifestpath": "/sap.card/configuration/parameters/number/value",
						"type": "number"
					},
					"numberLabel": {
						"manifestpath": "/sap.card/configuration/parameters/numberLabel/value",
						"type": "number",
						"label": "Direct number Label"
					},
					"numberLabelTrans": {
						"manifestpath": "/sap.card/configuration/parameters/numberLabelTrans/value",
						"type": "number",
						"label": "{i18n>TRANSLATED_NUMBER_LABEL}"
					},
					"boolean": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"description": "Description",
						"type": "boolean",
						"visualization": {
							"type": "sap/m/Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						}
					},
					"booleanLabel": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel/value",
						"type": "boolean",
						"label": "Direct Boolean Label"
					},
					"booleanLabelTrans": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabelTrans/value",
						"type": "boolean",
						"label": "{i18n>TRANSLATED_BOOLEAN_LABEL}"
					},
					"date": {
						"manifestpath": "/sap.card/configuration/parameters/date/value",
						"type": "date"
					},
					"dateLabel": {
						"manifestpath": "/sap.card/configuration/parameters/dateLabel/value",
						"type": "date",
						"label": "Direct Date Label"
					},
					"dateLabelTrans": {
						"manifestpath": "/sap.card/configuration/parameters/dateLabelTrans/value",
						"type": "date",
						"label": "{i18n>TRANSLATED_DATE_LABEL}"
					},
					"dateTime": {
						"manifestpath": "/sap.card/configuration/parameters/dateTime/value",
						"type": "datetime"
					},
					"dateTimeLabel": {
						"manifestpath": "/sap.card/configuration/parameters/dateTimeLabel/value",
						"type": "datetime",
						"label": "Direct Date Time Label"
					},
					"dateTimeLabelTrans": {
						"manifestpath": "/sap.card/configuration/parameters/dateTimeLabelTrans/value",
						"type": "datetime",
						"label": "{i18n>TRANSLATED_DATETIME_LABEL}"
					},
					"enum": {
						"manifestpath": "/sap.card/configuration/parameters/enum/value",
						"label": "Enumerations",
						"type": "enum",
						"required": true,
						"enum": [
							"Option A",
							"Option B",
							"Option C"
						]
					},
					"formatterGroup": {
						"type": "group",
						"label": "Formatter"
					},
					"dateFormatter": {
						"manifestpath": "/sap.card/configuration/parameters/dateFormatter/value",
						"type": "date",
						"formatter": {
							style: 'long'
						}
						// "formatter": {
						// 	   format: 'yMMMMd'
						// }
						// "formatter": {
						// 	   pattern: 'yyyy-MM-dd'
						// }
					},
					"datetimeFormatter": {
						"manifestpath": "/sap.card/configuration/parameters/datetimeFormatter/value",
						"type": "datetime",
						"formatter": {
							style: 'long'
						}
					},
					"floatFormatter": {
						"manifestpath": "/sap.card/configuration/parameters/floatFormatter/value",
						"type": "number",
						"formatter": {
							decimals: 3
						}
					},
					"integerFormatter": {
						"manifestpath": "/sap.card/configuration/parameters/integerFormatter/value",
						"type": "integer",
						"formatter": {
							minIntegerDigits: 3,
							maxIntegerDigits: 6,
							emptyString: ""
						}
					},
					"stringArrayFormatter": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayFormatter/value",
						"label": "String Array",
						"type": "string[]",
						"editable": true,
						"values": {
							"data": {
								"json": [
									{ "text": 0.3, "key": "key1", "additionalText": 1293883200000, "icon": "sap-icon://accept" },
									{ "text": 0.6, "key": "key2", "additionalText": 1293883200000, "icon": "sap-icon://cart" },
									{ "text": 0.8, "key": "key3", "additionalText": 1293883200000, "icon": "sap-icon://zoom-in" }
								],
								"path": "/"
							},
							"item": {
								"text": "Percent: {= format.percent(${text}) }",
								"key": "{key}",
								"additionalText": "datetime: {= format.dateTime(${additionalText}, {style: 'long'}) }",
								"icon": "{icon}"
							}
						}
					},
					"InvoiceswithStringArray": {
						"manifestpath": "/sap.card/configuration/parameters/InvoiceswithStringArray/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Invoices",
									"parameters": {
										"$select": "OrderID, ShipName, ShippedDate",
										"$skip": "5",
										"$top": "5"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{OrderID}",
								"key": "{OrderID}",
								"additionalText": "{= format.dateTime(${ShippedDate}, {style: 'long'}) }"
							}
						}
					},
					"Invoices": {
						"manifestpath": "/sap.card/configuration/parameters/Invoices/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Invoices",
									"parameters": {
										"$select": "ShipName, ShippedDate",
										"$skip": "8",
										"$top": "8"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{ShipName}",
								"key": "{ShipName}",
								"additionalText": "Shipped Date: {= format.dateTime(${ShippedDate}, {style: 'short'}) }"
							}
						}
					},
					"validationGroup": {
						"type": "group",
						"label": "Validation"
					},
					"stringphone": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"translatable": false,
						"required": true,
						"placeholder": "555-4555",
						"validation": {
							"type": "error",
							"maxLength": 20,
							"minLength": 1,
							"pattern": "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$",
							"message": "The string does not match a telefone number"
						}
					},
					"stringphonenomessage": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"translatable": false,
						"required": true,
						"placeholder": "555-4555",
						"validation": {
							"type": "warning",
							"maxLength": 20,
							"minLength": 1,
							"pattern": "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"
						}
					},
					"stringmaxmin": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"type": "string",
						"translatable": false,
						"required": true,
						"placeholder": "MinMaxlength",
						"validation": {
							"type": "warning",
							"maxLength": 20,
							"minLength": 1
						},
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"integerrequired": {
						"manifestpath": "/sap.card/configuration/parameters/integerrequired/value",
						"type": "integer",
						"translatable": false,
						"required": true
					},
					"integervalidation": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"type": "integer",
						"visualization": {
							"type": "sap/m/Slider",
							"settings": {
								"value": "{currentSettings>value}",
								"min": 0,
								"max": 15,
								"width": "100%",
								"showAdvancedTooltip": true,
								"showHandleTooltip": false,
								"inputsAsTooltips": true,
								"enabled": "{currentSettings>editable}"
							}
						},
						"validations": [{
							"type": "warning",
							"validate": function (value) {
								return value !== 5;
							},
							"message": "5 might not be the best value"
						},
						{
							"type": "error",
							"validate": function (value) {
								return value > 5;
							},
							"message": function (value) {
								if (value <= 2) {
									return "value might not smaller than 2";
								}
								return "value might not smaller than 5";
							}
						},
						{
							"type": "error",
							"maximum": 9,
							"message": function (value) {
								if (value > 11) {
									return "value out of range 11";
								}
								return "Maximum is 9";
							}
						},
						{
							"type": "error",
							"minimum": 1,
							"exclusiveMinimum": true,
							"message": "Minimum is 2"
						},
						{
							"type": "error",
							"multipleOf": 2,
							"message": "Has to be multiple of 2"
						}]
					},
					"numberrequired": {
						"manifestpath": "/sap.card/configuration/parameters/number/value",
						"type": "number",
						"translatable": false,
						"required": true
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
					"stringWithRequestExtensionList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithRequestExtensionList/value",
						"type": "string",
						"values": {
							"data": {
								"extension": {
									"method": "getData"
								},
								"path": "/values"
							},
							"item": {
								"text": "{trainer}",
								"key": "{title}",
								"additionalText": "{location}"
							}
						}
					},
					"stringWithDataFromExtensionList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithDataFromExtensionList/value",
						"type": "string",
						"values": {
							"item": {
								"text": "{trainer}",
								"key": "{title}",
								"additionalText": "{location}"
							},
							"path": "/values"
						}
					},
					"stringWithRequestFromDestinationList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithRequestDestinationList/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.local}}/stringWithRequestList.json"
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
						"label": "String Array With No Values",
						"type": "string[]"
					},
					"Customers": {
						"manifestpath": "/sap.card/configuration/parameters/Customers/value",
						"type": "string[]",
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
						"label": "Icon Not Allow File",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowFile": false
							}
						}
					},
					"iconNotAllowNone": {
						"manifestpath": "/sap.card/configuration/parameters/iconNotAllowNone/src",
						"type": "string",
						"label": "Icon Not Allow None",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowNone": false
							}
						}
					},
					"iconNotAllowFileAndNone": {
						"manifestpath": "/sap.card/configuration/parameters/iconNotAllowFileAndNone/src",
						"type": "string",
						"label": "Icon Not Allow File And None",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowFile": false,
								"allowNone": false
							}
						}
					},
					"iconWithImage": {
						"manifestpath": "/sap.card/configuration/parameters/iconWithImage/value",
						"type": "string",
						"label": "iconWithImage",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						}
					},
					"iconWithImageNotAllowNone": {
						"manifestpath": "/sap.card/configuration/parameters/iconWithImageNotAllowNone/value",
						"type": "string",
						"label": "iconWithImage Not Allow None",
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
					"color1": {
						"manifestpath": "/sap.card/header/icon/backgroundColor",
						"type": "string",
						"description": "Description",
						"label": "Icon Background",
						"visualization": {
							"type": "ColorSelect",
							"settings": {
								"enumValue": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"maxItems": {
						"manifestpath": "/sap.card/content/maxItems",
						"type": "integer",
						"visualization": {
							"type": "sap/m/Slider",
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
					"color2": {
						"manifestpath": "/sap.card/header/icon/backgroundColor",
						"type": "string",
						"description": "Description",
						"label": "Icon Background",
						"visualization": {
							"type": "ColorSelect",
							"settings": {
								"enumValue": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"group": {
						"label": "Dependent",
						"type": "group"
					},
					"string1": {
						"manifestpath": "/sap.card/configuration/parameters/string1/value",
						"label": "String: editable, visible, label",
						"type": "string",
						"translatable": true
					},
					"dependentString1": {
						"manifestpath": "/sap.card/configuration/parameters/dependentString1/value",
						"type": "string",
						"editable": "{= ${items>string1/value} === 'editable'}"
					},
					"dependentString2": {
						"manifestpath": "/sap.card/configuration/parameters/dependentString2/value",
						"type": "string",
						"visible": "{= ${items>string1/value} === 'visible'}"
					},
					"dependentString3": {
						"manifestpath": "/sap.card/configuration/parameters/dependentString3/value",
						"label": "{= ${items>string1/value} === 'label'? 'dependentString3 True' : 'dependentString3 False' }",
						"type": "string"
					},
					"integer1": {
						"manifestpath": "/sap.card/configuration/parameters/integer1/value",
						"type": "integer",
						"label": "Integer: 1, 3, 6, 9"
					},
					"dependentInteger1": {
						"manifestpath": "/sap.card/configuration/parameters/dependentInteger1/value",
						"type": "string",
						"editable": "{= ${items>integer1/value} > 2}"
					},
					"dependentInteger2": {
						"manifestpath": "/sap.card/configuration/parameters/dependentInteger1/value",
						"type": "string",
						"visible": "{= ${items>integer1/value} > 5}"
					},
					"dependentInteger3": {
						"manifestpath": "/sap.card/configuration/parameters/dependentInteger3/value",
						"label": "{= ${items>integer1/value} > 8 ? 'dependentInteger3 True' : 'dependentInteger3 False' }",
						"type": "string"
					},
					"boolean1": {
						"manifestpath": "/sap.card/configuration/parameters/boolean1/value",
						"type": "boolean",
						"label": "boolean",
						"visualization": {
							"type": "sap/m/Switch",
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
						"editable": "{items>boolean1/value}"
					},
					"dependentBoolean2": {
						"manifestpath": "/sap.card/configuration/parameters/dependentBoolean2/value",
						"type": "string",
						"visible": "{items>boolean1/value}"
					},
					"dependentBoolean3": {
						"manifestpath": "/sap.card/configuration/parameters/dependentBoolean3/value",
						"label": "{= ${items>boolean1/value} === true ? 'dependentBoolean3 True' : 'dependentBoolean3 False' }",
						"type": "string"
					},
					"CustomerWithVisibleDependent": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithVisibleDependent/value",
						"type": "string",
						"visible": "{items>boolean1/value}",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.aaa}}/Customers"
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
					"filterBackendInString": {
						"label": "Filter backend by input in ComboBox",
						"type": "group"
					},
					"CustomerWithFilterParameter": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithFilterParameter/value",
						"label": "Customer with filter parameter",
						"type": "string",
						"translatable": true,
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$filter": "contains(CompanyName,'{currentSettings>suggestValue}')"
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
					"CustomerWithFilterInURL": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithFilterInURL/value",
						"type": "string",
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
					"linkedParameters": {
						"label": "Linked Parameters",
						"type": "group"
					},
					"Customer": {
						"manifestpath": "/sap.card/configuration/parameters/Customer/value",
						"type": "string",
						"translatable": true,
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
							"item": {
								"text": "{CompanyName}",
								"key": "{CustomerID}",
								"additionalText": "{= ${CustomerID} !== undefined ? ${Country} + ', ' +  ${City} + ', ' + ${Address} : ''}"
							}
						}
					},
					"Employee": {
						"manifestpath": "/sap.card/configuration/parameters/Employee/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Employees",
									"parameters": {
										"$select": "EmployeeID, FirstName, LastName, Country, Title, HomePhone"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{FirstName} {LastName}",
								"key": "{EmployeeID}",
								"additionalText": "{= ${EmployeeID} !== undefined ? ${Country} + ', ' +  ${Title} + ', ' + ${HomePhone} : ''}"
							}
						}
					},
					"Order": {
						"manifestpath": "/sap.card/configuration/parameters/Order/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"validation": {
							"type": "warning",
							"maxLength": 4,
							"minLength": 1
						},
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Orders",
									"parameters": {
										"$select": "OrderID, OrderDate, CustomerID, EmployeeID",
										"$filter": "(CustomerID eq '{items>Customer/value}') and (EmployeeID eq {items>Employee/value})"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{= ${OrderID} !== undefined ? ${OrderID} + '-' +  ${CustomerID} + '-' + ${EmployeeID} : ''}",
								"key": "{OrderID}",
								"additionalText": "{OrderDate}"
							}
						}
					},
					"Product": {
						"manifestpath": "/sap.card/configuration/parameters/Product/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Order_Details",
									"parameters": {
										"$expand": "Product",
										"$filter": "OrderID eq {items>Order/value}"
									}
								},
								"path": "/value"
							},
							"item": {
								"text": "{= ${OrderID} !== undefined ? ${OrderID} + '-' +  ${ProductID} + ':' + ${Product/ProductName} : ''}",
								"key": "{ProductID}",
								"additionalText": "{= ${OrderID} !== undefined ? ${UnitPrice} + ' USD, count: '+ ${Quantity} : ''}"
							}
						}
					},
					"CustomerWithTopAndSkipOption": {
						"manifestpath": "/sap.card/configuration/parameters/CustomerWithTopAndSkipOption/value",
						"type": "string",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address",
										"$skip": "5",
										"$top": "5"
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
					}
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});
