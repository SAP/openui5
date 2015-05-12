/*!
 * ${copyright}
 */
sap.ui.define([
	    'sap/m/Button',
	    'sap/m/List',
	    'sap/m/Popover',
	    'sap/m/StandardListItem'
	], function(Button, List, Popover, StandardListItem) {
	"use strict";

	return Button.extend(
		"sap.ui.core.sample.ViewTemplate.valuelist.ValueHelp", {
			metadata : {
				properties : {
					qualifier : {type : "string", defaultValue : ""} //value list qualifier
				}
			},

			init : function () {
				var that = this;

				this.setEnabled(false);
				this.attachPress(this._onValueHelp.bind(this));
				this.setIcon("sap-icon://value-help");
				this.setIconFirst(false);
				this.setTooltip("No value help loaded");
			},

			onBeforeRendering : function () {
				var oMetaModel,
					that = this;

				oMetaModel = that.getModel().getMetaModel();
				oMetaModel.loaded().then(function () {
					var oEntityType =
							oMetaModel.getODataEntityType("FAR_CUSTOMER_LINE_ITEMS.Item"),
						oProperty = oMetaModel.getODataProperty(oEntityType,
							that.getBindingPath("text"));

					oMetaModel.getODataValueLists(oProperty).then(function (mValueList) {
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
				});
			},

			renderer : "sap.m.ButtonRenderer",

			_onValueHelp : function (oEvent) {
				var oControl = oEvent.getSource(),
					oList = new List(),
					oPopover = new Popover(),
					aVHTitle = [];

				oPopover.setTitle("Value Help: " + oControl.getBindingPath("text"));
				oList.setModel(oControl.getModel());
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
