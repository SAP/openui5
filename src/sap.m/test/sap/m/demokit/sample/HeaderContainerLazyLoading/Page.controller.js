sap.ui.define(['sap/m/MessageBox', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'],
	function (MessageBox, Controller, JSONModel) {
		"use strict";

		var PageController = Controller.extend("sap.m.sample.HeaderContainerLazyLoading.Page", {
			onInit: function () {
				var oModel = new JSONModel("test-resources/sap/m/demokit/sample/HeaderContainerLazyLoading/data.json");
				this.getView().setModel(oModel);
			},

			press: function (evt) {
				MessageBox.alert("Link was clicked!");
			},

			onScroll: function (evt) {
				var oModel = this.getView().getModel();
				var oData = oModel.getData();
				for (var i = 0; i < 3; i++) {
					var oNumericContentData = {
						value: "",
						color: "",
						growth: ""
					};
					oNumericContentData.value = (Math.random() * 10 + "").substring(0, 3);
					var randomNumber = Math.round((Math.random() * 10));
					switch (randomNumber % 3) {
						case 0:
							oNumericContentData.color = "Good";
							break;
						case 1:
							oNumericContentData.color = "Error";
							break;
						default:
							oNumericContentData.color = "Neutral";
							break;
					}
					oNumericContentData.growth = randomNumber % 2 ? "Up" : "Down";
					oData.ContentData.push(oNumericContentData);
				}
				oModel.setData(oData);
				this.getView().setModel(oModel);
			}
		});

		return PageController;
	});