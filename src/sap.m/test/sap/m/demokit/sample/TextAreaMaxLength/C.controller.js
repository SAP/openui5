sap.ui.define(['sap/ui/core/mvc/Controller'],
		function (Controller) {
			"use strict";

			var PageController = Controller.extend("sap.m.sample.TextAreaMaxLength.C", {
				onInit: function() {
					var oData = {
						"value": "Lorem ipsum dolor sit amet, consectetur el"
					};

					var oModel = new sap.ui.model.json.JSONModel(oData);
					this.getView().setModel(oModel);
				},
				handleLiveChange: function(oEvent) {
					var oTextArea = oEvent.getSource(),
							iValueLength = oTextArea.getValue().length,
							iMaxLength = oTextArea.getMaxLength(),
							sState = iValueLength > iMaxLength ? "Warning" : "None";

					oTextArea.setValueState(sState);
				},


				handleSimpleExceeding: function (oEvent) {
					var oTA = oEvent.getSource();
					oEvent.getParameter("exceeded") ? oTA.setValueState("Error") : oTA.setValueState("Success");
				},
				buttonSetShortValuePress: function (){
					//this.byId("textAreaWithBinding").setValue("Small Text");
					this.byId("textAreaWithBinding2").setValue("Small Text");
					this.byId("textAreaWithoutBinding").setValue("Small Text");

				},
				buttonSetLongValuePress: function (){
					var sText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
					//this.byId("textAreaWithoutBinding").setValue(sText);
					this.byId("textAreaWithBinding").setValue(sText);
					this.byId("textAreaWithBinding2").setValue(sText);
				},
				buttonToggleShowExceededTextPress: function (){
					//var oTA = this.byId("textAreaWithBinding")
					//oTA.setShowExceededText(!oTA.getShowExceededText());
					var oTA = this.byId("textAreaWithBinding2");
					oTA.setShowExceededText(!oTA.getShowExceededText());
					var oTA = this.byId("textAreaWithoutBinding");
					oTA.setShowExceededText(!oTA.getShowExceededText());
				}
			});

			return PageController;
		});