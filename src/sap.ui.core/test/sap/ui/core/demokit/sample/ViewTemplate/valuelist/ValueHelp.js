/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/List',
		'sap/m/MessageBox',
		'sap/m/Popover',
		'sap/m/StandardListItem',
		'sap/ui/commons/ValueHelpField'
	], function(List, MessageBox, Popover, StandardListItem, ValueHelpField) {
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
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error"});
				});
			},

			renderer : "sap.ui.commons.ValueHelpFieldRenderer",

			_onValueHelp : function (oEvent) {
				var oControl = oEvent.getSource(),
					oBinding = oControl.getBinding("value"),
					oList = new List(),
					oPopover = new Popover(),
					aVHTitle = [];

				oPopover.setTitle("Value Help: " + oBinding.getPath());
				oList.setModel(oBinding.getModel());
				oControl._parameters.forEach(function (sParameterPath) {
					aVHTitle.push(sParameterPath + ":{" + sParameterPath + "}");
				});
				oList.bindItems({
					path : "/" + oControl._collectionPath,
					template : new StandardListItem({title : aVHTitle.join(",")})
				});
				oPopover.addContent(oList);
				oPopover.openBy(oControl);
			}
	});
});
