/*!
 * ${copyright}
 */
sap.ui.define(['sap/m/Column',
		'sap/m/ColumnListItem',
		'sap/m/MessageBox',
		'sap/m/Popover',
		'sap/m/Table',
		'sap/m/Text',
		'sap/ui/commons/ValueHelpField'
	], function(Column, ColumnListItem, MessageBox, Popover, Table, Text, ValueHelpField) {
	"use strict";

	return ValueHelpField.extend(
		"sap.ui.core.sample.ViewTemplate.valuelist.ValueHelp", {
			metadata : {
				properties : {
					qualifier : {type : "string", defaultValue : ""} //value list qualifier
				}
			},

			init : function () {
				var that = this;

				this.setEnabled(false);
				this.attachValueHelpRequest(this._onValueHelp.bind(this));
				this.setIconURL("sap-icon://value-help");
				this.setTooltip("No value help loaded");
			},

			onBeforeRendering : function () {
				var oBinding = this.getBinding("value"),
					oModel = oBinding.getModel(),
					oMetaModel = oModel.getMetaModel(),
					sAbsolutePath = oModel.resolve(oBinding.getPath(), oBinding.getContext()),
					that = this;

				oMetaModel.loaded().then(function () {
					oMetaModel.getODataValueLists(oMetaModel.getMetaContext(sAbsolutePath))
						.then(function (mValueList) {
							var oValueList = mValueList[that.getQualifier()];
							that._parameters = [];
							oValueList.Parameters.forEach(function (oParameter) {
								//put value help parameters written back to entity at the beginning
								if (oParameter.LocalDataProperty) {
									that._parameters.unshift(oParameter.ValueListProperty.String);
								} else {
									that._parameters.push(oParameter.ValueListProperty.String);
								}
							});
							that._collectionPath = oValueList.CollectionPath.String;
							that.setTooltip("ValueList"
								+ (that.getQualifier() !== "" ? "#" + that.getQualifier(): "")
								+ "\n"
								+ JSON.stringify(oValueList, undefined, 2));
							that.setEnabled(true);
					});
				}, function (oError) {
					MessageBox.alert(oError.message, {
						icon: MessageBox.Icon.ERROR,
						title: "Error"});
				});
			},

			renderer : "sap.ui.commons.ValueHelpFieldRenderer",

			_onValueHelp : function (oEvent) {
				var oColumnListItem = new ColumnListItem(),
					oControl = oEvent.getSource(),
					oPopover = new Popover(),
					oTable = new Table(),
					aVHTitle = [];

				function createText(sPropertyPath) {
					var oMetaModel = oControl.getModel().getMetaModel(),
						oEntityType = oMetaModel.getODataEntityType(oMetaModel.getODataEntitySet(
							oControl._collectionPath).entityType);
					return new Text({text: oMetaModel.getODataProperty(oEntityType,
						sPropertyPath)["sap:label"]});
				}

				oPopover.setTitle("Value Help: " + oControl.getBinding("value").getPath());
				oTable.setModel(oControl.getModel());
				oTable.bindItems({
					path : "/" + oControl._collectionPath,
					template : oColumnListItem
				});
				oControl._parameters.forEach(function (sParameterPath) {
					oTable.addColumn(new Column(
						{header: createText(sParameterPath)}
					));
					oColumnListItem.addCell(
						new Text({text: "{" + sParameterPath + "}"})
					);
				});
				oPopover.addContent(oTable);
				oPopover.openBy(oControl);
			}
	});
});
