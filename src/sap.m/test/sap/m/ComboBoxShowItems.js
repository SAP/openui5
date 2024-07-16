// Note: the HTML page 'ComboBoxShowItems.html' loads this module via data-sap-ui-on-init

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/mvc/XMLView",
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/Token',
	"sap/ui/thirdparty/jquery"
], async function(Core, XMLView, Controller, JSONModel, Token, jQuery) {
	"use strict";
	await Core.ready();
	Controller.extend("myController", {
		_btnToControlMap: {
			"btnInput1": "input1",
			"btnInput1Filter": "input1",
			"btnInput2": "input2",
			"btnInput2Filter": "input2",
			"btnMultiInput1": "multiInput1",
			"btnMultiInput1Filter": "multiInput1",
			"btnMultiInput2": "multiInput2",
			"btnMultiInput2Filter": "multiInput2",
			"btnComboBox1": "combo1",
			"btnComboBox1Filter": "combo1",
			"btnComboBox2": "combo2",
			"btnComboBox2Filter": "combo2",
			"btnComboBox3": "combo3",
			"btnComboBox3Filter": "combo3",
			"btnMultiComboBox1": "multiComboBox1",
			"btnMultiComboBox1Filter": "multiComboBox1",
			"btnMultiComboBox2": "multiComboBox2",
			"btnMultiComboBox2Filter": "multiComboBox2",
			"btnComboBox4Filter": "combo4",
			"btnMultiComboBox3Filter": "multiComboBox3"
		},

		onInit: function () {
			var oModel = new JSONModel("../ui/documentation/sdk/mockserver/ProductCollection.json");

			this.getView().setModel(oModel);
			this.setUpMultiInput();
		},

		setUpMultiInput: function () {
			this.getView().byId("multiInput2").addValidator(function (args) {
				if (args.suggestionObject){
					var key = args.suggestionObject.getCells()[1].getText();
					var text = args.suggestionObject.getCells()[0].getText();

					return new Token({key: key, text: text});
				}
				return null;
			});
		},

		handleOpenByGroup: function (oEvent) {
			this.handleOpen(oEvent, this._filterItemsByGroup.bind(this));
		},

		handleOpenLazy: function (oEvent) {
			var sBtnId = this._resolveButtonId(oEvent.getSource().getId()),
					oTargetControl = this._getTargetControl(sBtnId);

			setTimeout(function () {
				oTargetControl.getBinding("items").resume();
			}, 2000);

			this.handleOpen(oEvent);
		},

		handleOpen: function (oEvent, fnFilter) {
			var sBtnId = this._resolveButtonId(oEvent.getSource().getId()),
					oTargetControl = this._getTargetControl(sBtnId),
					bUseFiltering = this._shouldUseFilterFn(sBtnId),
					fnFilterItems;

			if (bUseFiltering) {
				fnFilterItems = fnFilter || this._filterItems;
			}

			oTargetControl.showItems(fnFilterItems);
		},
		applyCustomCss: function() {
			var $body = jQuery("body");

			$body.toggleClass("customClassForVisualTests");
		},
		_resolveButtonId: function (sId) {
			return Object.keys(this._btnToControlMap).reduce(function (sAcc, sKey) {
				if (sId.indexOf(sKey) > -1) {
					sAcc = sKey;
				}

				return sAcc;
			}.bind(this));
		},
		_getTargetControl: function (sBtnId) {
			var sInputId = this._btnToControlMap[sBtnId];

			return this.getView().byId(sInputId);
		},
		_shouldUseFilterFn: function (sBtnId) {
			return sBtnId && sBtnId.indexOf("Filter") > -1;
		},
		_filterItems: function (sValue, oItem) {
			if (oItem.getCells) {
				return /notebook/gi.test(oItem.getCells()[0].getText());
			} else {
				return /notebook/gi.test(oItem.getText());
			}
		},
		_filterItemsByGroup: function (sValue, oItem) {
			var aData = this.getView().getModel().getData(),
					sItemText = oItem.getText();

			return aData && !!aData.filter(function (oData) {
				return oData['Name'] === sItemText && oData["SupplierName"] === "Very Best Screens";
			}).length;
		}
	});


	XMLView.create({definition: jQuery('#ShowItemsApp').html()})
			.then(function (oViewInstance) {
				oViewInstance.placeAt("content");
			});
});