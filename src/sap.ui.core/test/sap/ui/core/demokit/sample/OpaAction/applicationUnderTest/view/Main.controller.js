sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/test/actions/Press',
	'sap/ui/model/json/JSONModel',
	'sap/m/Popover',
	'sap/m/Input',
	'sap/m/Token'
], function (Controller, Press, JSONModel, Popover, Input, Token) {
	"use strict";

	var sDndListContextPath = "/ProductCollection/";

	return Controller.extend("appUnderTest.view.Main", {

		onInit: function () {
			this.getView().setModel(new JSONModel({
				ProductCollection: [{
					"ProductId": "HT-1000",
					"Name": "Notebook Basic 15"
				}, {
					"ProductId": "HT-1001",
					"Name": "Notebook Basic 17"
				}, {
					"ProductId": "HT-1002",
					"Name": "Notebook Basic 18"
				}, {
					"ProductId": "HT-1003",
					"Name": "Notebook Basic 19"
				}, {
					"ProductId": "HT-1007",
					"Name": "ITelO Vault"
				}]
			}), "deleteModeListModel");
			this.getView().setModel(new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json")), "orderedListModel");
			var oButton = this.byId("navigationButton");
			setTimeout(function () {
				// Opa will wait until the button is not busy
				oButton.setBusy(false);
			}, 5000);

			var oMultiInput1 = this.getView().byId("multiInput1");
			oMultiInput1.setTokens([
				new Token({text: "Token 1", key: "0001"}),
				new Token({text: "Token 2", key: "0002"}),
				new Token({text: "Token 3", key: "0003"}),
				new Token({text: "Token 4", key: "0004"}),
				new Token({text: "Token 5", key: "0005"}),
				new Token({text: "Token 6", key: "0006"})
			]);
		},

		onNavButtonPress: function () {
			this.byId("myApp").to(this.byId("secondPage").getId());
		},

		onBack: function () {
			this.byId("myApp").to(this.byId("firstPage").getId());
		},

		onPressPage: function () {
			// You may also invoke actions without letting OPA do it
			new Press().executeOn(this.byId("secondPage"));
		},

		onPressOpenPopover: function (oEvent) {
			if (!this._popover) {
				this._popover = new Popover({
					title: "Popover with inputs",
					content: [
						new Input()
					]
				});
			}

			this._popover.openBy(oEvent.getSource());
		},

		onDelete: function (oEvent) {
			this.byId("productList").removeItem(oEvent.getParameter("listItem"));
		},

		onToolbarButtonPress: function (oEvent) {
			this.byId("toolbar-text").setText("Pressed " + oEvent.getSource().getText() + " Button");
		},

		onDragStart: function (oEvent) {
			var oDraggedRow = oEvent.getParameter("target");
			var oDragSession = oEvent.getParameter("dragSession");
			var iIndex = +oDraggedRow.getBindingContextPath().replace(sDndListContextPath, "");
			oDragSession.setComplexData("draggedRowIndex", iIndex);
		},

		onDrop: function (oEvent) {
			var oDragSession = oEvent.getParameter("dragSession");
			var iDraggedRowIndex = oDragSession.getComplexData("draggedRowIndex");
			if (iDraggedRowIndex === undefined) {
				return;
			}

			var oDropRow = oEvent.getParameter("droppedControl");
			var sDropPosition = oEvent.getParameter("dropPosition");
			var iDropRowIndex = +oDropRow.getBindingContextPath().replace(sDndListContextPath, "");
			var mData = this.getView().getModel("orderedListModel").getProperty(sDndListContextPath);
			var iDropIndex;

			if (sDropPosition === "Before") {
				iDropIndex = iDropRowIndex - 1 > 0 ? iDropRowIndex - 1 : 0;
			} else if (sDropPosition === "After") {
				iDropIndex = iDropRowIndex;
			}

			var mSwap = mData[iDropIndex];
			mData[iDropIndex] = mData[iDraggedRowIndex];
			for (var i = iDraggedRowIndex; i < iDropIndex - 1; i += 1) {
				mData[i] = mData[i + 1];
			}
			mData[iDropIndex - 1] = mSwap;

			// update the model to refresh the bindings
			this.getView().getModel("orderedListModel").refresh(true);
		}
	});

});