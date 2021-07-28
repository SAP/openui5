/*!
 * ${copyright}
 *
 * @private
 * @experimental
 */
sap.ui.define([
], function () {
	"use strict";

	return function(oCustomConfig) {
		return {
			context: "/",
			properties: {
				entityType: {
					tags: ["general"],
					label: "Entity Type",
					path: "entityType",
					type: "select",
					items: (oCustomConfig.entityTypes || []).map(function(sEntityType) {
						return {
							key: sEntityType
						};
					})
				},
				name: {
					tags: ["general"],
					label: "Name",
					path: "name",
					type: "string"
				},
				label: {
					tags: ["general"],
					label: "Label",
					path: "@Common.Label",
					type: "string"
				},
				type: {
					tags: ["general"],
					label: "Type",
					path: "type",
					type: "select",
					items: [
						{
							key: "cds.String",
							title: "String"
						},
						{
							key: "cds.Integer",
							title: "Integer"
						},
						{
							key: "cds.Decimal",
							title: "Decimal"
						},
						{
							key: "cds.Date",
							title: "Date"
						},
						{
							key: "cds.Time",
							title: "Time"
						},
						{
							key: "cds.DateTime",
							title: "DateTime"
						},
						{
							key: "cds.Boolean",
							title: "Boolean"
						}
					]
				},
				numberPrecision: {
					tags: ["general"],
					label: "Precision",
					path: "precision",
					type: "number",
					defaultValue: "",
					visible: "{= ${/type} === 'cds.Decimal' }"
				},
				numberScale: {
					tags: ["general"],
					label: "Scale",
					path: "scale",
					type: "number",
					defaultValue: "",
					visible: "{= ${/type} === 'cds.Decimal' }"
				},
				stringLength: {
					tags: ["general"],
					label: "Length",
					path: "length",
					type: "number",
					defaultValue: "",
					visible: "{= ${/type} === 'cds.String' }"
				},
				defaultValue: {
					tags: ["general"],
					label: "Default",
					path: "default/val",
					defaultValue: "",
					type: "{/type}" //"{path: '/type', formatter: '._getEditorForType'}"
				},
				readonly: {
					tags: ["validation"],
					label: "Readonly",
					path: "@readonly",
					type: "bool"
				},
				mandatory: {
					tags: ["validation"],
					label: "Mandatory",
					path: "@mandatory",
					type: "bool"
				},
				format: {
					tags: ["validation"],
					label: "Format",
					path: "@assert.format",
					type: "string",
					defaultValue: "",
					visible: "{= ${/type} === 'cds.String' }"
				},
				stringRange: {
					tags: ["validation"],
					label: "Allowed Values",
					path: "@assert.range",
					type: "list",
					visible: "{= ${/type} === 'cds.String' }",
					active: "{= ${/type} === 'cds.String' }"
				},
				arrayRange: {
					tags: ["validation"],
					label: "Range",
					path: "@assert.range",
					type: "range",
					rangeType: "{/type}",
					// TODO: Once expression bindings are supported, check for ordinal types differently
					visible: "{= ${/type} === 'cds.Integer' || ${/type} === 'cds.Decimal' || ${/type} === 'cds.DateTime' || ${/type} === 'cds.Date' || ${/type} === 'cds.Time'}",
					active: "{= ${/type} === 'cds.Integer' || ${/type} === 'cds.Decimal' || ${/type} === 'cds.DateTime' || ${/type} === 'cds.Date' || ${/type} === 'cds.Time'}"
				},
				annotations: {
					tags: ["advanced"],
					label: "Additional Annotations",
					allowedTypes: ["string", "json"],
					path: "annotations",
					type: "annotations",
					allowTypeChange: false
				}
			},
			layout: {
				form: {
					groups: [
						{
							label: "General",
							items: [
								{
									type: "tag",
									value: "general"
								}
							]
						},
						{
							label: "Input Validation",
							items: [
								{
									type: "tag",
									value: "validation"
								}
							]
						},
						{
							label: "Advanced",
							items: [
								{
									type: "tag",
									value: "advanced"
								}
							]
						}
					]
				}
			},
			propertyEditors: {
				select: "sap/ui/integration/designtime/baseEditor/propertyEditor/selectEditor/SelectEditor",
				string: "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
				integer: "sap/ui/integration/designtime/baseEditor/propertyEditor/integerEditor/IntegerEditor",
				number: "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
				map: "sap/ui/integration/designtime/baseEditor/propertyEditor/mapEditor/MapEditor",
				annotations: "sap/ui/fl/write/_internal/fieldExtensibility/cap/editor/propertyEditor/annotationsEditor/AnnotationsEditor",
				list: "sap/ui/integration/designtime/baseEditor/propertyEditor/listEditor/ListEditor",
				bool: "sap/ui/fl/write/_internal/fieldExtensibility/cap/editor/propertyEditor/booleanEditor/BooleanEditor",
				range: "sap/ui/fl/write/_internal/fieldExtensibility/cap/editor/propertyEditor/rangeEditor/RangeEditor",
				json: "sap/ui/integration/designtime/baseEditor/propertyEditor/jsonEditor/JsonEditor",
				// Re-register basic editors as a workaround for missing formatter support
				"cds.String": "sap/ui/integration/designtime/baseEditor/propertyEditor/stringEditor/StringEditor",
				"cds.Integer": "sap/ui/integration/designtime/baseEditor/propertyEditor/integerEditor/IntegerEditor",
				"cds.Decimal": "sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
				"cds.Date": "sap/ui/fl/write/_internal/fieldExtensibility/cap/editor/propertyEditor/dateEditor/DateEditor",
				"cds.Time": "sap/ui/fl/write/_internal/fieldExtensibility/cap/editor/propertyEditor/timeEditor/TimeEditor",
				"cds.DateTime": "sap/ui/fl/write/_internal/fieldExtensibility/cap/editor/propertyEditor/dateTimeEditor/DateTimeEditor",
				"cds.Boolean": "sap/ui/fl/write/_internal/fieldExtensibility/cap/editor/propertyEditor/booleanEditor/BooleanEditor"
			}
		};
	};
});