/*!
 * ${copyright}
 */

// Provides control sap.m.Button.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/model/json/JSONModel',
	'sap/m/Input',
	'sap/m/Label',
	'sap/m/ScrollContainer'
], function (
	Control,
	JSONModel,
	Input,
	Label,
	ScrollContainer
) {

	"use strict";

	var JSONSchemaEditor = Control.extend("sap.ui.integration.sample.Playground.JSONSchemaEditor", /** @lends sap.ui.integration.sample.Playground.JSONSchemaEditor.prototype */ {
		metadata: {
			properties: {
				schema: {
					type: "any",
					defaultValue: null
				},
				schemaStartPath: {
					type: "string",
					defaultValue: "/"
				},
				dataStartPath: {
					type: "string",
					defaultValue: "/"
				}
			},
			aggregations: {
				_content: {
					multiple: false,
					type: "sap.ui.core.Control",
					visibility: "hidden"
				}
			},
			events: {
				change: {},
				liveChange: {}
			}
		},
		renderer: function (oRm, oControl) {
			oRm.write("<div");
			oRm.writeElementData(oControl);
			oRm.write(">");
			oRm.renderControl(oControl.getAggregation("_content"));
			oRm.write("</div>");
		}
	});
	JSONSchemaEditor.prototype.init = function () {
		this.setAggregation("_content", new ScrollContainer({
			vertical: true,
			horizontal: false,
			height: "100%",
			width: "100%"
		}));
	};

	JSONSchemaEditor.prototype.setSchema = function (vValue) {
		if (typeof vValue === "string") {
			this._schemaModel = new JSONModel();
			this._schemaModel.loadData(vValue);
		} else if (typeof vValue === "object") {
			this._schemaModel = new JSONModel(vValue);
		}
		// TODO: check whether it is really a schema
		this.setModel(this._schemaModel, "schemaModel");
		this.setProperty("schema", vValue, true);
	};

	JSONSchemaEditor.prototype.onBeforeRendering = function () {
		var aPropertyList = this._getPropertyList(),
			oContent = this.getAggregation("_content"),
			that = this;
		oContent.destroyContent();
		aPropertyList.forEach(function (oProperty) {
			var oLabel = new Label({
				text: oProperty.__name
			});
			var oInput = new Input({
				value: {
					path: "jsonData>" + oProperty.__path,
					mode: "OneWay"
				},
				change: function (oEvent) {
					that.fireChange({
						value: oEvent.getParameter("value"),
						path: oProperty.__path,
						name: oProperty.__name
					});
				},
				liveChange: function (oEvent) {
					that.fireLiveChange({
						value: oEvent.getParameter("value"),
						path: oProperty.__path,
						name: oProperty.__name
					});
				}
			});
			oContent.addContent(oLabel);
			oContent.addContent(oInput);
		});
	};

	JSONSchemaEditor.prototype._getPropertyList = function () {
		var sPath = this.getSchemaStartPath(),
			sDataPath = this.getDataStartPath(),
			aPath = sPath.split("/"),
			oSchemaJson = this.getModel("schemaModel").getProperty("/"),
			aPropertyList = [],
			oCurrentSchemaEntry = oSchemaJson;
		if (!oSchemaJson) {
			return aPropertyList;
		}
		aPath.shift(); //absolute path always starts with /, therfore skip first entry,
		aPath.forEach(function (sSegment, i) {
			if (!sSegment) {
				oCurrentSchemaEntry = oCurrentSchemaEntry;
			} else {
				oCurrentSchemaEntry = oCurrentSchemaEntry.properties[sSegment];
			}
			var sRef = oCurrentSchemaEntry["$ref"];
			if (oCurrentSchemaEntry["$ref"]) {
				//follow the definition
				oCurrentSchemaEntry = oSchemaJson.definitions[sRef.replace("#/definitions/", "")];
			}
			var mProperties = oCurrentSchemaEntry.properties;
			if (mProperties) {
				for (var n in mProperties) {
					var oProperty = jQuery.extend(true, {}, mProperties[n]);
					oProperty.__name = n;
					oProperty.__path = sDataPath === "/" ? sDataPath + n : sDataPath + "/" + n;
					if (oProperty.type) {
						aPropertyList.push(oProperty);
					}
				}
			}
		});
		return aPropertyList;
	};

	return JSONSchemaEditor;

});