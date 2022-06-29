sap.ui.define(["sap/ui/integration/Designtime"], function (
	Designtime
) {
	"use strict";
	return function () {
		return new Designtime({
			"form": {
				"items": {
					"validationGroup": {
						"type": "group",
						"label": "Validation"
					},
					"OrderID": {
						"manifestpath": "/sap.card/configuration/parameters/OrderID/value",
						"label": "Order Id",
						"type": "integer",
						"required": true
					},
					"stringphone": {
						"manifestpath": "/sap.card/configuration/parameters/string/value",
						"label": "String with Pattern validation",
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
						"label": "String with default validation message",
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
						"label": "String with Length Constrained",
						"type": "string",
						"translatable": false,
						"required": true,
						"placeholder": "MinMaxlength",
						"validation": {
							"type": "warning",
							"maxLength": 20,
							"minLength": 3
						},
						"hint": "Please refer to the <a href='https://www.sap.com'>documentation</a> lets see how this will behave if the text is wrapping to the next line and has <a href='https://www.sap.com'>two links</a>. good?"
					},
					"integerrequired": {
						"manifestpath": "/sap.card/configuration/parameters/integerrequired/value",
						"label": "Integer with Required",
						"type": "integer",
						"translatable": false,
						"required": true
					},
					"integervalidation": {
						"manifestpath": "/sap.card/configuration/parameters/integer/value",
						"label": "Integer with Min Max value",
						"type": "integer",
						"visualization": {
							"type": "Slider",
							"settings": {
								"value": "{currentSettings>value}",
								"min": 0,
								"max": 16,
								"width": "100%",
								"showAdvancedTooltip": true,
								"showHandleTooltip": false,
								"inputsAsTooltips": true,
								"enabled": "{currentSettings>editable}"
							}
						},
						"validations": [
							{
								"type": "warning",
								"minimum": 5,
								"message": "The minimum is 5."
						    },
							{
								"type": "error",
								"exclusiveMaximum": 16,
								"message": "The maximum is 15."
							},
							{
								"type": "error",
								"multipleOf": 5,
								"message": "Has to be multiple of 5"
							}
					    ]
					},
					"numberrequired": {
						"manifestpath": "/sap.card/configuration/parameters/number/value",
						"label": "Number with validation",
						"type": "number",
						"translatable": false,
						"required": true,
						"validation": {
							"type": "error",
							"minimum": 0,
							"maximum": 100,
							"exclusiveMaximum": true,
							"message": "The value should be equal or greater than 0 and be less than 100."
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
