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
						"label": "All Data Type",
						"expanded": false,
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"cardTitle": {
						"manifestpath": "/sap.card/configuration/parameters/cardTitle/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"label": "cardTitle",
						"allowDynamicValues": true,
						"editableToUser": false,
						"visibleToUser": true,
						"description": "Card Title",
						"cols": 1,
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"stringWithTextArea": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithTextArea/value",
						"type": "string",
						"label": "Use TextArea for a string field",
						"visualization": {
							"type": "TextArea",
							"settings": {
								"value": "{currentSettings>value}",
								"width": "100%",
								"editable": "{config/editable}",
								"placeholder": "{currentSettings>placeholder}",
								"rows": 7
							}
						}
					},
					"stringLabelTrans": {
						"manifestpath": "/sap.card/configuration/parameters/stringLabelTrans/value",
						"type": "string",
						"label": "{i18n>TRANSLATED_STRING_LABEL}",
						"cols": 2,
						"translatable": true,
						"allowDynamicValues": false
					},
					"stringLabelTrans2": {
						"manifestpath": "/sap.card/configuration/parameters/stringLabelTrans2/value",
						"type": "string",
						"label": "{{TRANSLATED_STRING_LABEL}}",
						"translatable": true,
						"allowDynamicValues": false,
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
					"parameterSyntaxInValue": {
						"manifestpath": "/sap.card/configuration/parameters/parameterSyntaxInValue/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"label": "Parameter syntax in value"
					},
					"integer": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"type": "integer",
						"label": "Integer Type",
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
					"number": {
						"manifestpath": "/sap.card/configuration/parameters/number/value",
						"type": "number",
						"label": "{i18n>TRANSLATED_NUMBER_LABEL}"
					},
					"boolean": {
						"manifestpath": "/sap.card/configuration/parameters/boolean/value",
						"description": "Description",
						"label": "long long long long long long long long long long label",
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
					"booleanLabelTrans": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabelTrans/value",
						"type": "boolean",
						"label": "{i18n>TRANSLATED_BOOLEAN_LABEL}"
					},
					"dateLabelTrans": {
						"manifestpath": "/sap.card/configuration/parameters/dateLabelTrans/value",
						"type": "date",
						"label": "{i18n>TRANSLATED_DATE_LABEL}"
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
						"description": "teat test",
						"required": true,
						"enum": [
							"Option A",
							"Option B",
							"Option C"
						]
					},
					"stringArray": {
						"manifestpath": "/sap.card/configuration/parameters/stringArray/value",
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
					"contextModelSyntax": {
						"manifestpath": "/sap.card/configuration/parameters/contextModelSyntax/value",
						"type": "string[]",
						"values": {
							"data": {
								"request": {
									"url": "{{destinations.northwind}}/Customers",
									"parameters": {
										"$select": "CustomerID, CompanyName, Country, City, Address"
									},
									"headers": {
										"test1": "{context>sap.successfactors/currentUser/id/value}",
										"test2": "{context>sap.successfactors/currentUser/id/label}"
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
					"formatterGroup": {
						"type": "group",
						"label": "Formatter",
						"expanded": false
					},
					"dateFormatter": {
						"manifestpath": "/sap.card/configuration/parameters/dateFormatter/value",
						"label": "Date Formatter",
						"type": "date",
						"formatter": {
							"style": "long"
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
						"label": "Datetime Formatter",
						"type": "datetime",
						"formatter": {
							"style": "long"
						}
					},
					"floatFormatter": {
						"manifestpath": "/sap.card/configuration/parameters/floatFormatter/value",
						"label": "Float Formatter",
						"type": "number",
						"formatter": {
							"decimals": 3,
							"style":"short"
						}
					},
					"integerFormatter": {
						"manifestpath": "/sap.card/configuration/parameters/integerFormatter/value",
						"label": "Integer Formatter",
						"type": "integer",
						"formatter": {
							"minIntegerDigits": 3,
							"maxIntegerDigits": 6,
							"emptyString": ""
						}
					},
					"percentFormatter": {
						"manifestpath": "/sap.card/configuration/parameters/percentFormatter/value",
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
					"formatterinText": {
						"manifestpath": "/sap.card/configuration/parameters/formatterinText/value",
						"label": "Return String Array Values",
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
						"label": "Validation",
						"expanded": false
					},
					"stringphone": {
						"manifestpath": "/sap.card/configuration/parameters/stringphone/value",
						"label": "String Validation",
						"type": "string",
						"translatable": false,
						"required": true,
						"placeholder": "555-4555",
						"description": "test test",
						"validation": {
							"type": "error",
							"maxLength": 20,
							"minLength": 1,
							"pattern": "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$",
							"message": "The string does not match a telephone number"
						}
					},
					"stringphonenomessage": {
						"manifestpath": "/sap.card/configuration/parameters/stringphonenomessage/value",
						"label": "String Validation without Customized Message",
						"type": "string",
						"translatable": false,
						"required": true,
						"placeholder": "555-4555",
						"validation": {
							"type": "warning",
							"maxLength": 20,
							"minLength": 1
						},
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"integerrequired": {
						"manifestpath": "/sap.card/configuration/parameters/integerrequired/value",
						"label": "Field Required",
						"type": "integer",
						"translatable": false,
						"required": true
					},
					"integervalidation": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"label": "integer Validation",
						"type": "integer",
						"visualization": {
							"type": "Slider",
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
					"booleanvalidation1": {
						"manifestpath": "/sap.card/configuration/parameters/booleanvalidation1/value",
						"label": "Boolean(Switch) Validation",
						"type": "boolean",
						"description": "description for boolean validation",
						"visualization": {
							"type": "Switch",
							"settings": {
								"busy": "{currentSettings>_loading}",
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						},
						"validations": [{
							"type": "error",
							"validate": function (value, config, context) {
								return context["requestData"]({
									"data": {
										"extension": {
											"method": "checkCanSeeCourses"
										},
										"path": "/values/canSeeCourses"
									}
								}).then(function (oData){
									if (oData === false && value === true) {
										context["control"].setState(false);
										return false;
									}
									return true;
								});
							},
							"message": "Do not have right to request data, disable it"
						}]
					},
					"booleanvalidation2": {
						"manifestpath": "/sap.card/configuration/parameters/booleanvalidation2/value",
						"label": "Boolean Validation",
						"type": "boolean",
						"validations": [{
							"type": "error",
							"validate": function (value, config, context) {
								return context["requestData"]({
									"data": {
										"extension": {
											"method": "checkCanSeeCourses"
										},
										"path": "/values/canSeeCourses"
									}
								}).then(function (oData){
									if (oData === false && value === true) {
										context["control"].setSelected(false);
										return false;
									}
									return true;
								});
							},
							"message": "Do not have right to request data, disable it"
						}]
					},
					"lists": {
						"type": "group",
						"label": "Value Selection",
						"expanded": false
					},
					"stringWithStaticList": {
						"manifestpath": "/sap.card/configuration/parameters/stringWithStaticList/value",
						"label": "String with Static List",
						"type": "string",
						"values": {
							"data": {
								"json": {
									"values": [
										{ "text": "{i18n>TRANSLATED_TEXT01}", "key": "key1", "additionalText": "addtext1", "icon": "sap-icon://accept" },
										{ "text": "{i18n>TRANSLATED_TEXT02}", "key": "key2", "additionalText": "addtext2", "icon": "sap-icon://cart" },
										{ "text": "{i18n>TRANSLATED_TEXT03}", "key": "key3", "additionalText": "addtext3", "icon": "sap-icon://zoom-in" }
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
						"label": "String with Request List",
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
						"label": "String with Request Extension List",
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
						"label": "String with Data from Extension List",
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
						"label": "String With Request from Detinations",
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
					"stringArrayNoValues": {
						"manifestpath": "/sap.card/configuration/parameters/stringArrayNoValues/value",
						"label": "String Array With No Values",
						"type": "string[]"
					},
					"Customers": {
						"manifestpath": "/sap.card/configuration/parameters/Customers/value",
						"label": "String Array With Request Values",
						"type": "string[]",
						"required": true,
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
						},
						"validations": [{
							"type": "error",
							"validate": function (value, config, context) {
								return context["requestData"]({
									"data": {
										"extension": {
											"method": "getMinLength"
										},
										"path": "/values/minLength"
									}
								}).then(function (minLength){
									if (value.length < minLength) {
										context["control"].setEditable(false);
										context["removeValidationMessage"]();
										return {
											"isValid": false,
											"data": minLength
										};
									}
									return true;
								});
							},
							"message": function (value, config, minLength) {
								return "Please select at least " + minLength + " items!";
							}
						}]
					},
					"separatorIcon": {
						"type": "separator",
						"line": true
					},
					"iconNotAllowFile": {
						"manifestpath": "/sap.card/configuration/parameters/iconNotAllowFile/src",
						"type": "string",
						"label": "Icon Not Allow from File",
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
					"iconWithImage": {
						"manifestpath": "/sap.card/configuration/parameters/iconWithImage/value",
						"label": "Icon with Image",
						"type": "string",
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
						"label": "icon with Image Not Allow None",
						"visualization": {
							"type": "IconSelect",
							"settings": {
								"value": "{currentSettings>value}",
								"editable": "{currentSettings>editable}",
								"allowNone": false
							}
						}
					},
					"separatorColor": {
						"type": "separator",
						"line": true
					},
					"backgroundColor": {
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
						"cols": 1,
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
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
					"color": {
						"manifestpath": "/sap.card/configuration/parameters/color/value",
						"type": "string",
						"description": "Description",
						"label": "Color Selection",
						"visualization": {
							"type": "ColorSelect",
							"settings": {
								"enumValue": "{currentSettings>value}",
								"editable": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"boolean2": {
						"manifestpath": "/sap.card/configuration/parameters/boolean2/value",
						"type": "boolean",
						"description": "Description",
						"label": "long long long long long long long long long long label",
						"visualization": {
							"type": "Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						},
						"cols": 1
					},
					"group": {
						"label": "Dependent",
						"type": "group",
						"expanded": false
					},
					"subGroup1": {
						"type": "group",
						"label": "String Dependent",
						"level": "1",
						"expanded": false,
						"visualization": {
							"type": "Panel"
						}
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
					"subGroup2": {
						"type": "group",
						"label": "Integer Dependent",
						"level": "1",
						"expanded": false,
						"visualization": {
							"type": "Panel"
						}
					},
					"integer1": {
						"manifestpath": "/sap.card/configuration/parameters/integer1/value",
						"type": "integer",
						"label": "Integer: 1, 3, 6, 9"
					},
					"dependentInteger1": {
						"manifestpath": "/sap.card/configuration/parameters/dependentInteger1/value",
						"label": "Value of Dependent Field Greater Than 2",
						"type": "string",
						"editable": "{= ${items>integer1/value} > 2}"
					},
					"dependentInteger2": {
						"manifestpath": "/sap.card/configuration/parameters/dependentInteger1/value",
						"label": "Value of Dependent Field Greater Than 5",
						"type": "string",
						"visible": "{= ${items>integer1/value} > 5}"
					},
					"dependentInteger3": {
						"manifestpath": "/sap.card/configuration/parameters/dependentInteger3/value",
						"label": "{= ${items>integer1/value} > 8 ? 'dependentInteger3 True' : 'dependentInteger3 False' }",
						"type": "string"
					},
					"subGroup3": {
						"type": "group",
						"label": "Boolean Dependent",
						"level": "1",
						"expanded": false,
						"visualization": {
							"type": "Panel"
						}
					},
					"boolean1": {
						"manifestpath": "/sap.card/configuration/parameters/boolean1/value",
						"type": "boolean",
						"label": "long long long long long long long long long long label",
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
						"label": "Editable Dependent on Value",
						"type": "string",
						"editable": "{items>boolean1/value}"
					},
					"dependentBoolean2": {
						"manifestpath": "/sap.card/configuration/parameters/dependentBoolean2/value",
						"label": "Visible Dependent on Value",
						"type": "string",
						"visible": "{items>boolean1/value}"
					},
					"dependentBoolean3": {
						"manifestpath": "/sap.card/configuration/parameters/dependentBoolean3/value",
						"label": "{= ${items>boolean1/value} === true ? 'dependentBoolean3 True' : 'dependentBoolean3 False' }",
						"type": "string"
					},
					"subTabgroup": {
						"label": "Sub Group (Tab)",
						"type": "group",
						"expanded": false,
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"subGroup4": {
						"type": "group",
						"label": "Sub Tab 1",
						"level": "1",
						"expanded": true,
						"visualization": {
							"type": "Tab"
						}
					},
					"string1inSubtab": {
						"manifestpath": "/sap.card/configuration/parameters/string1inSubtab/value",
						"label": "String Validation 1",
						"type": "string",
						"translatable": true,
						"editableToUser": true,
						"visibleToUser": true,
						"required": true,
						"description": "test",
						"validation": {
							"type": "warning",
							"minLength": 8,
							"message": "The length of the string less than 8."
						}
					},
					"subGroup5": {
						"type": "group",
						"label": "Sub Tab 2",
						"level": "1",
						"expanded": true,
						"visualization": {
							"type": "Tab"
						}
					},
					"string2inSubtab": {
						"manifestpath": "/sap.card/configuration/parameters/string2inSubtab/value",
						"label": "String Validation 2",
						"type": "string",
						"translatable": true,
						"editableToUser": true,
						"visibleToUser": true,
						"required": true,
						"description": "test",
						"validation": {
							"type": "error",
							"minLength": 8,
							"message": "The length of the string less than 8."
						}
					},
					"string3inSubtab": {
						"manifestpath": "/sap.card/configuration/parameters/string3inSubtab/value",
						"label": "String Validation 3",
						"type": "string",
						"translatable": true,
						"required": true,
						"description": "test",
						"validation": {
							"type": "warning",
							"minLength": 8,
							"message": "The length of the string less than 8."
						}
					},
					"subGroup6": {
						"type": "group",
						"label": "Sub Tab 3",
						"level": "1",
						"expanded": true,
						"visualization": {
							"type": "Tab"
						}
					},
					"string4inSubtab": {
						"manifestpath": "/sap.card/configuration/parameters/string4inSubtab/value",
						"label": "String Validation 4",
						"type": "string",
						"translatable": true,
						"required": true
					},
					"filterBackendInStringArray": {
						"label": "Filter backend by input in MultiComboBox or MultiInput",
						"type": "group",
						"expanded": false
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
						},
						"validations": [{
							"type": "error",
							"validate": function (value, config, context) {
								return context["requestData"]({
									"data": {
										"request": {
											"url": "{{destinations.northwind}}/Customers",
											"parameters": {
												"$select": "CustomerID, CompanyName, Country, City, Address"
											}
										},
										"path": "/value"
									}
								}).then(function (oData){
									if (value.length === 6) {
										return false;
									}
									return true;
								});
							},
							"message": function (value, config) {
								return "Please do not select 6 items!";
							}
						}, {
							"type": "error",
							"minLength": 2,
							"maxLength": 4
						}]
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
					"Customers_MultiInput": {
						"manifestpath": "/sap.card/configuration/parameters/Customers_MultiInput/value",
						"type": "string[]",
						"required": true,
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
						},
						"visualization": {
							"type": "MultiInput"
						}
					},
					"filterBackendInString": {
						"label": "Filter backend by input in ComboBox",
						"type": "group",
						"expanded": false
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
						"type": "group",
						"expanded": false
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
					"Orders": {
						"manifestpath": "/sap.card/configuration/parameters/Orders/value",
						"type": "string[]",
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
					},
					"layoutGroup": {
						"type": "group",
						"label": "Layout",
						"expanded": false
					},
					"cardTitle1": {
						"manifestpath": "/sap.card/configuration/parameters/cardTitle1/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"label": "cardTitle cardTitle cardTitle",
						"allowDynamicValues": true,
						"editableToUser": false,
						"visibleToUser": false,
						"layout": {
							"alignment": {
								"field": "end",
								"label": "end"
							},
							"label-width": "40%"
						},
						"cols": 1
					},
					"booleanLabel1": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel1/value",
						"label": "1111111",
						"type": "boolean",
						"description": "aaa",
						"layout": {
							"position": "field-label",
							"alignment": {
								"label": "end"
							},
							"label-width": "80%"
						},
						"cols": 1,
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"booleanLabel2": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel2/value",
						"label": "22222",
						"type": "boolean",
						"layout": {
							"alignment": {
								"field": "end",
								"label": "end"
							},
							"label-width": "50%"
						},
						"cols": 1
					},
					"booleanLabel3": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel3/value",
						"label": "33333",
						"type": "boolean",
						"layout": {
							"label-width": "50%",
							"alignment": {
								"label": "end"
							}
						},
						"description": "bbb",
						"visualization": {
							"type": "Switch",
							"settings": {
								"state": "{currentSettings>value}",
								"customTextOn": "Yes",
								"customTextOff": "No",
								"enabled": "{currentSettings>editable}"
							}
						},
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"booleanLabel4": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel4/value",
						"label": "4444",
						"type": "boolean",
						"layout": {
							"label-width": "83%",
							"position": "field-label"
						},
						"cols": 1
					},
					"booleanLabel5": {
						"manifestpath": "/sap.card/configuration/parameters/booleanLabel5/value",
						"label": "555",
						"type": "boolean",
						"layout": {
							"label-width": "92%",
							"position": "field-label"
						}
					},
					"integerParameter1": {
						"manifestpath": "/sap.card/configuration/parameters/integerParameter1/value",
						"type": "integer",
						"layout": {
							"label-width": "30%"
						},
						"required": true
					},
					"number1": {
						"manifestpath": "/sap.card/configuration/parameters/number1/value",
						"type": "number",
						"layout": {
							"label-width": "40%",
							"alignment": {
								"label": "end"
							}
						}
					},
					"stringArray2": {
						"manifestpath": "/sap.card/configuration/parameters/stringArray2/value",
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
						},
						"layout": {
							"label-width": "50%",
							"position": "field-label",
							"alignment": {
								"label": "end"
							}
						}
					},
					"string2": {
						"manifestpath": "/sap.card/configuration/parameters/string2/value",
						"type": "string",
						"translatable": true,
						"required": true,
						"editableToUser": false,
						"allowDynamicValues": true,
						"description": "test",
						"layout": {
							"label-width": "60%"
						},
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"number2": {
						"manifestpath": "/sap.card/configuration/parameters/number2/value",
						"type": "number",
						"layout": {
							"label-width": "30%",
							"position": "field-label"
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
								"label": "{{TRANSLATED_KEY}}",
								"placeholder": "placeholder of key"
							},
							"icon": {
								"label": "Icon",
								"placeholder": "placeholder of icon"
							},
							"text": {
								"label": "Text",
								"placeholder": "placeholder of text",
								"translatable": false
							},
							"url": {
								"label": "URL",
								"placeholder": "placeholder of url"
							},
							"editable": {
								"label": "Editable",
								"type": "boolean"
							},
							"int": {
								"label": "Integer",
								"placeholder": "placeholder of int",
								"type": "int",
								"formatter": {
									"minIntegerDigits": 1,
									"maxIntegerDigits": 6,
									"emptyString": ""
								}
							},
							"number": {
								"label": "Number",
								"placeholder": "placeholder of number",
								"type": "number",
								"formatter": {
									"decimals": 1,
									"style":"short"
								}
							}
						},
						"addButtonText": "Add a new step"
					},
					"objectWithPropertiesDefinedAndValueFromJsonList": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithPropertiesDefinedAndValueFromJsonList/value",
						"type": "object",
						"label": "Object - properties defined: value from Json list",
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
								"label": "{{TRANSLATED_KEY}}",
								"placeholder": "placeholder of key",
								"column": {
									"filterProperty": "key"
								},
								"cell": {
									"text": "{{TRANSLATED_KEY}}"
								}
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"placeholder": "placeholder of icon",
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
								"placeholder": "placeholder of text",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"url": {
								"label": "URL",
								"defaultValue": "http://",
								"placeholder": "placeholder of url",
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
								"placeholder": "placeholder of int",
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
									"filterType": "sap.ui.model.type.Integer"   //sap.ui.model.type
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
								"label": "{i18n>TRANSLATED_KEY}",
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
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"additionalText": {
								"label": "Additional Text",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
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
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"CompanyName": {
								"label": "Company Name",
								"column": {
									"width": "10rem",
									"filterProperty": "CompanyName",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"Country": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "Country",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"City": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "City",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"Address": {
								"column": {
									"width": "10rem",
									"filterProperty": "Address",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							}
						}
					},/*
					"objectWithMetadataDefinedAndValueFromODataRequest": {
						"manifestpath": "/sap.card/configuration/parameters/objectWithMetadataDefinedAndValueFromODataRequest/value",
						"type": "object",
						"label": "OData metadata defined: value from OData request",
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
							// hide metadata now
							"metadata": {
								"request": {
									"serviceUrl": "{{destinations.northwind}}"
									//"serviceUrl": "https://services.odata.org/V4/Northwind/Northwind.svc/"
									//"metadataUrlParams": {}
									// see more parameters in online doc for mParameters of sap.ui.model.odata.v4.ODataMode
								},
								"namespace": "NorthwindModel",
								"entityTypeName": "Customer"
							}
						}
					},*/
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
						"label": "Object List - properties defined",
						"properties": {
							"key": {
								"label": "{{TRANSLATED_KEY}}",
								"placeholder": "placeholder of key",
								"column": {
									"filterProperty": "key"
								},
								"cell": {
									"text": "{{TRANSLATED_KEY}}"
								}
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"placeholder": "placeholder of icon",
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
								"placeholder": "placeholder of text",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								},
								"translatable": true
							},
							"url": {
								"label": "URL",
								"defaultValue": "http://",
								"placeholder": "placeholder of url",
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
								"placeholder": "placeholder of int",
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
									"filterType": "sap.ui.model.type.Integer"   //sap.ui.model.type
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
						"label": "Object List - properties defined: value from Json list",
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
								"label": "{{TRANSLATED_KEY}}",
								"placeholder": "placeholder of key",
								"column": {
									"filterProperty": "key"
								},
								"cell": {
									"text": "{{TRANSLATED_KEY}}"
								}
							},
							"icon": {
								"label": "Icon",
								"defaultValue": "sap-icon://add",
								"placeholder": "placeholder of icon",
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
								"placeholder": "placeholder of text",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								},
								"translatable": true
							},
							"url": {
								"label": "URL",
								"defaultValue": "http://",
								"placeholder": "placeholder of url",
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
								"placeholder": "placeholder of int",
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
									"filterType": "sap.ui.model.type.Integer"   //sap.ui.model.type
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
					"objectsWithPropertiesDefinedAndValueFromRequestedFile": {
						"manifestpath": "/sap.card/configuration/parameters/objectsWithPropertiesDefinedAndValueFromRequestedFile/value",
						"type": "object[]",
						"label": "Object List - properties defined: value from requested file",
						"values": {
							"data": {
								"request": {
									"url": "./objectWithRequestList.json"
								},
								"path": "/values"
							}
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
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"additionalText": {
								"label": "Additional Text",
								"column": {
									"hAlign": "Center",
									"width": "10rem",
									"filterProperty": "text",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							}
						},
						"addButtonText": "Add a new step"
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
							"allowAdd": false
						},
						"properties": {
							"CustomerID": {
								"label": "Customer ID",
								"column": {
									"filterProperty": "CustomerID",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"CompanyName": {
								"label": "Company Name",
								"column": {
									"width": "10rem",
									"filterProperty": "CompanyName",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"Country": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "Country",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"City": {
								"column": {
									"hAlign": "Center",
									"width": "6rem",
									"filterProperty": "City",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							},
							"Address": {
								"column": {
									"width": "10rem",
									"filterProperty": "Address",
									"defaultFilterOperator": "Contains"   // values are in enum sap.ui.model.FilterOperator
								}
							}
						}
					}/*,
					"objectsWithMetadataDefinedAndValueFromODataRequest": {
						"manifestpath": "/sap.card/configuration/parameters/objectsWithMetadataDefinedAndValueFromODataRequest/value",
						"type": "object[]",
						"label": "OData metadata defined: value from OData request",
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
							"metadata": {
								"request": {
									"serviceUrl": "{{destinations.northwind}}"
									//"serviceUrl": "https://services.odata.org/V4/Northwind/Northwind.svc/"
									//"metadataUrlParams": {}
									//see more parameters in online doc for mParameters of sap.ui.model.odata.v4.ODataMode
								},
								"namespace": "NorthwindModel",
								"entityTypeName": "Customer"
							},
							"allowAdd": true
						}
					}*/
				}
			},
			"preview": {
				"modes": "LiveAbstract"
			}
		});
	};
});