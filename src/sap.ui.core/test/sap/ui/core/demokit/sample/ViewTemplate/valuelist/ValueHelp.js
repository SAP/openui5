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
				this.setEditable(false);
				this.attachValueHelpRequest(this._onValueHelp.bind(this));
				this.setIconURL("sap-icon://value-help");
				this.setTooltip("No value help");
			},

			onBeforeRendering : function () {
				var oBinding = this.getBinding("value"),
					oModel = oBinding.getModel(),
					oMetaModel = oModel.getMetaModel(),
					sAbsolutePath = oModel.resolve(oBinding.getPath(), oBinding.getContext()),
					that = this;
				oMetaModel.loaded().then(function () {
					var oContext = oMetaModel.getMetaContext(sAbsolutePath);
					if (oContext.getProperty("sap:value-list")) {
						oMetaModel.getODataValueLists(oContext)
							.then(function (mValueList) {
								var oValueList = mValueList[that.getQualifier()];
								that._parameters = [];
								oValueList.Parameters.forEach(function (oParameter) {
									// put parameters written back to entity at the beginning
									if (oParameter.LocalDataProperty) {
										that._parameters.unshift(
											oParameter.ValueListProperty.String);
									} else {
										that._parameters.push(oParameter.ValueListProperty.String);
									}
								});
								that._collectionPath = oValueList.CollectionPath.String;
								that._collectionLabel = oValueList.Label ? oValueList.Label.String
										: that._collectionPath;
								that.setTooltip("ValueList"
									+ (that.getQualifier() !== "" ? "#" + that.getQualifier(): "")
									+ "\n"
									+ JSON.stringify(oValueList, undefined, 2));
								that.setIconURL("sap-icon://value-help");
								that.setEditable(true);
							});
					}
				}, function (oError) {
					//TODO errors cannot seriously be handled per _instance_ of a control
					MessageBox.alert(oError.message, {
						icon: MessageBox.Icon.ERROR,
						title: "Error"});
				});
			},

			renderer : "sap.ui.commons.ValueHelpFieldRenderer",

			_onValueHelp : function (oEvent) {
				var oColumnListItem = new ColumnListItem(),
					oControl = oEvent.getSource(),
					oPopover = new Popover({placement : sap.m.PlacementType.Auto, modal : true}),
					oTable = new Table(),
					aVHTitle = [];

				function createTextOrValueHelp(sPropertyPath, bAsColumnHeader) {
					var oMetaModel = oControl.getModel().getMetaModel(),
						oEntityType = oMetaModel.getODataEntityType(oMetaModel.getODataEntitySet(
							oControl._collectionPath).entityType);
					if (bAsColumnHeader) {
						return new Text({text: oMetaModel.getODataProperty(oEntityType,
							sPropertyPath)["sap:label"]});
					}
						return new sap.ui.core.sample.ViewTemplate.valuelist.ValueHelp(
							{value: "{" + sPropertyPath + "}"});
				}

				oPopover.setTitle("Value Help: " + oControl._collectionLabel);
				oTable.setModel(oControl.getModel());
				oTable.bindItems({
					path : "/" + oControl._collectionPath,
					template : oColumnListItem
				});
				oControl._parameters.forEach(function (sParameterPath) {
					oTable.addColumn(new Column(
						{header: createTextOrValueHelp(sParameterPath, true)}
					));
					oColumnListItem.addCell(createTextOrValueHelp(sParameterPath));
				});
				oPopover.addContent(oTable);
				oPopover.openBy(oControl);
			}
	});
});
