/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/Button',
		'sap/m/Column',
		'sap/m/ColumnListItem',
		'sap/m/Input',
		'sap/m/PlacementType',
		'sap/m/Popover',
		'sap/m/Table',
		'sap/m/Text',
		"sap/ui/model/odata/v4/ValueListType",
		"sap/ui/test/TestUtils"
	], function(Button, Column, ColumnListItem, Input, PlacementType, Popover,
		Table, Text, ValueListType, TestUtils) {
	"use strict";

	var ValueHelp = Input.extend("sap.ui.core.sample.odata.v4.SalesOrders.ValueHelp", {
			init : function () {
				Input.prototype.init.call(this);
				this.setEditable(false);
				this.setTooltip("No value help");
				this.sValueListType = TestUtils.isRealOData() ? undefined : ValueListType.None;
			},

			onBeforeRendering : function () {
				var oBinding = this.getBinding("value");

				if (!this.sValueListType) {
					this.sValueListType = oBinding.getValueListType();
					if (this.sValueListType !== ValueListType.None) {
						// Note: sap.m.Input must be editable to have the F4 button at all,
						// as a workaround we control changeability via valueHelpOnly property
						this.setEditable(true);
						this.attachValueHelpRequest(this._onValueHelp.bind(this));
						this.setShowValueHelp(true);
					}
					this.setTooltip("Value List Type: " + this.sValueListType);
				}
			},

			renderer : "sap.m.InputRenderer",

			_onValueHelp : function (oEvent) {
				var oBinding = this.getBinding("value"),
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
						oValueListInfo = mValueListInfo[""],
						oValueListMetaModel = oValueListInfo.$model.getMetaModel();

					function onClose() {
						oPopover.close();
					}

					function onSelectionChange(oEvent) {
						var oInputControl = oPopover.data("openedBy"),
							oValueHelpControl;

						if (!oInputControl.getValueHelpOnly()) {
							oValueHelpControl =
								oEvent.getSource().getSelectedItems()[0].getCells()[0];
							oInputControl.setValue(oValueHelpControl instanceof ValueHelp
								? oValueHelpControl.getValue() : oValueHelpControl.getText());
						}
						oPopover.close();
					}

					// TODO use Label annotation
					oPopover.setTitle("Value Help: " + oValueListInfo.CollectionPath);
					oTable.setModel(oValueListInfo.$model);
					oTable.bindItems({
						path : "/" + oValueListInfo.CollectionPath,
						template : oColumnListItem
					});
					oValueListInfo.Parameters.forEach(function (oParameter) {
						var sParameterPath = oParameter.ValueListProperty,
							sValueListType = oValueListMetaModel.getValueListType(
								"/" + oValueListInfo.CollectionPath + "/" + sParameterPath);

						// TODO use Label annotation
						oTable.addColumn(new Column({header : new Text({text : sParameterPath})}));
						oColumnListItem.addCell(sValueListType === ValueListType.None
							? new Text({text : "{" + sParameterPath + "}"})
							: new ValueHelp({value : "{" + sParameterPath + "}"}));
					});
					oTable.attachSelectionChange(onSelectionChange);
					oButton.attachPress(onClose);
					oPopover.addContent(oTable);
					oPopover.data("openedBy", that);
					oPopover.openBy(that);

				}, function (oError) {
					jQuery.sap.log.error(oError, undefined,
						"sap.ui.core.sample.odata.v4.SalesOrders.ValueHelp");
				});
			}
		});

	return ValueHelp;
});
