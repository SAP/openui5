/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/m/Button',
	'sap/m/Column',
	'sap/m/ColumnListItem',
	'sap/m/ComboBox',
	'sap/m/Input',
	'sap/m/PlacementType',
	'sap/m/Popover',
	'sap/m/Table',
	'sap/m/Text',
	"sap/ui/core/Control",
	"sap/ui/core/Item",
	"sap/ui/model/odata/v4/ValueListType"
], function(Button, Column, ColumnListItem, ComboBox, Input,  PlacementType, Popover, Table, Text,
		Control, Item, ValueListType) {
	"use strict";

	var ValueHelp;

	ValueHelp = Control.extend("sap.ui.core.sample.odata.v4.SalesOrders.ValueHelp", {
		metadata : {
			properties : {
				editable : {type: "boolean", defaultValue: true, bindable: "bindable"},
				value: {type: "string", group: "Data", defaultValue: null, bindable: "bindable"}
			},
			aggregations : {
				field : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
			},
			events : {/*TODO*/}
		},

		renderer : {
			render : function(oRm, oValueHelp) {
				oRm.write("<div");
				oRm.writeControlData(oValueHelp);
				oRm.writeClasses(oValueHelp);
				oRm.write(">");
				oRm.renderControl(oValueHelp.getAggregation("field"));
				oRm.write("</div>");
			}
		},

		init : function () {
			this.attachModelContextChange(this.onModelContextChange);
		},

		onModelContextChange : function (oEvent) {
			var oBinding = this.getBinding("value"),
				oField;

			if (oBinding && oBinding.isResolved()) {
				switch (oBinding.getValueListType()) {
					case ValueListType.Standard:
						oField = new Input({
							editable : true,
							showValueHelp : true,
							value : this.getValue(),
							valueHelpRequest : this.onValueHelp.bind(this)
						});
						break;
					case ValueListType.Fixed:
						oField = new ComboBox({
							editable : true,
							loadItems : this.onLoadItems.bind(this),
							value : this.getValue()
						});
						break;
					default:
						oField = new Input({
							editable : this.getEditable(),
							showValueHelp : false,
							value : this.getValue()
						});
				}
				this.setAggregation("field", oField);
			}
		},

		onLoadItems : function (oEvent) {
			var oBinding = this.getBinding("value"),
				oComboBox = this.getAggregation("field"),
				that = this;

			oBinding.requestValueListInfo().then(function (mValueListInfo) {
				var oItem = new Item(),
					oValueListMapping = mValueListInfo[""],
					aParameters = oValueListMapping.Parameters,
					sKey = aParameters[0].ValueListProperty,
					sText = aParameters[1] ? aParameters[1].ValueListProperty : sKey,
					sAdditionalText = aParameters[2] && aParameters[2].ValueListProperty;

				function onSelectionChange(oEvent) {
					that.setValue(oEvent.getParameters("selectedItem").selectedItem.getText());
				}

				oItem.bindProperty("key", {path: sKey, model: "ValueList"});
				oItem.bindProperty("text", {path: sText, model: "ValueList"});
				if (sAdditionalText) {
					oComboBox.setShowSecondaryValues(true);
					oItem.bindProperty("additionalText",
						{path: sAdditionalText, model: "ValueList"});
				}

				oComboBox.setModel(oValueListMapping.$model, "ValueList");
				oComboBox.bindItems({
					model : "ValueList",
					path : "/" + oValueListMapping.CollectionPath,
					template : oItem
				});
				oComboBox.attachSelectionChange(onSelectionChange);
			}, function (oError) {
				jQuery.sap.log.error(oError, undefined,
					"sap.ui.core.sample.odata.v4.SalesOrders.ValueHelp");
			});
		},

		onValueHelp : function (oEvent) {
			var oBinding = this.getBinding("value"),
				oInput = this.getAggregation("field"),
				that = this;

			oBinding.requestValueListInfo().then(function (mValueListInfo) {
				var oButton = new Button({
						icon : "sap-icon://decline",
						tooltip : "Close"
					}),
					oColumnListItem = new ColumnListItem(),
					oPopover = new Popover({
						contentMinWidth : "20em",
						endButton : oButton,
						modal : true,
						placement : PlacementType.Auto
					}),
					oTable = new Table({
						fixedLayout : false,
						growing : true,
						mode : "SingleSelectMaster"
					}),
					oValueListMapping = mValueListInfo[""]; // TODO not necessarily correct

				function onClose() {
					oPopover.close();
				}

				function onSelectionChange(oEvent) {
					var oValueHelpControl = oEvent.getSource().getSelectedItems()[0].getCells()[0];

					that.setValue(oValueHelpControl.getText());
					oPopover.close();
				}

				// TODO use Label annotation
				oPopover.setTitle("Value Help: " + oValueListMapping.CollectionPath);
				oTable.setModel(oValueListMapping.$model);
				oTable.bindItems({
					path : "/" + oValueListMapping.CollectionPath,
					template : oColumnListItem
				});
				oValueListMapping.Parameters.forEach(function (oParameter) {
					var sParameterPath = oParameter.ValueListProperty;

					// TODO use Label annotation
					oTable.addColumn(new Column({header : new Text({text : sParameterPath})}));
					oColumnListItem.addCell(new Text({text : "{" + sParameterPath + "}"}));
				});
				oTable.attachSelectionChange(onSelectionChange);
				oButton.attachPress(onClose);
				oPopover.addContent(oTable);
				oPopover.data("openedBy", oInput);
				oPopover.openBy(oInput);

			}, function (oError) {
				jQuery.sap.log.error(oError, undefined,
					"sap.ui.core.sample.odata.v4.SalesOrders.ValueHelp");
			});
		},

		setValue : function (sValue) {
			var oField = this.getAggregation("field");

			this.setProperty("value", sValue);
			if (oField) {
				oField.setValue(sValue);
			}
		}
	});

	return ValueHelp;
});
