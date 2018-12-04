/*!
 * ${copyright}
 */
/**
 * KPI Card
 * @experimental
 */
sap.ui.define(['sap/ui/core/Control', 'sap/ui/model/json/JSONModel', 'sap/m/ObjectNumber', 'sap/m/VBox', 'sap/m/Text', 'sap/f/cards/Data', "sap/ui/base/ManagedObject"],
	function (Control, JSONModel, ObjectNumber, VBox, Text, Data) {
		"use strict";

		var KPI = Control.extend("sap.f.cards.content.KPI", {
			metadata: {
				properties: {
					data: {
						"type": "object"
					},
					title: {
						"type": "string"
					},
					number: {
						"type": "string"
					},
					unit: {
						"type": "string"
					}

					// ranges: {
					// 	"type": "object"
					// }
				},
				aggregations: {
					_content: { type: "sap.m.VBox", multiple: false, visibility: "hidden" }
				}
			},
			renderer: function (oRm, oControl) {
				oRm.renderControl(oControl.getAggregation("_content"));
			}
		});

		KPI.prototype.init = function () {

			this.setModel(new JSONModel());

			var oVBox = new VBox(this.getId() + "-box", { width: "100%" });
			oVBox.addItem(new Text({ wrapping: true }));
			oVBox.addItem(new ObjectNumber());

			this.setAggregation("_content", oVBox);
		};

		KPI.prototype.onBeforeRendering = function () {
			this.getAggregation("_content").getItems()[0].setText(this.getTitle());

			var oObjectNumber = this.getAggregation("_content").getItems()[1];
			oObjectNumber.bindProperty("number", this.getBindingInfo("number"));
			oObjectNumber.bindProperty("unit", this.getBindingInfo("unit"));
		};

		KPI.prototype.applySettings = function (mSettings, oScope) {

			var oData = mSettings.data;

			if (oData) {
				this.setData(oData);
				delete mSettings.data;
			}

			Control.prototype.applySettings.apply(this, [mSettings, oScope]);

			mSettings.data = oData;

			return this;
		};

		KPI.prototype.setData = function (oData) {

			this.setProperty("data", oData);

			if (!oData) {
				return this;
			}

			//handling the request
			var oRequest = oData.request;

			if (oData.json && !oRequest) {
				this._updateModel(oData.json, oData.path);
			}

			if (oRequest) {
				Data.fetch(oRequest).then(function (data) {
					this._updateModel(data, oData.path);
				}.bind(this)).catch(function (oError) {
					// TODO: Handle errors. Maybe add error message
				});
			}

			return this;
		};

		KPI.prototype._updateModel = function (oData, sPath) {
			this.getModel().setData(oData);
			var oObjectNumber = this.getAggregation("_content").getItems()[1];
			oObjectNumber.bindElement({
				path: sPath || "/"
			});
		};

		return KPI;
	});