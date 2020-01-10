/*
 * ! ${copyright}
 */
// Provides control sap.ui.rta.dttool.controls.DTToolListItem.
/* globals sap */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/InputListItem",
	"sap/m/InputListItemRenderer",
	"sap/base/util/ObjectPath"
], function(
	jQuery,
	InputListItem,
	InputListItemRenderer,
	ObjectPath
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.dttool.controls.DTToolListItem control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A simple DTToolListItem.
	 * @extends sap.m.InputListItem
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.rta.dttool.controls.DTToolListItem
	 */
	var DTToolListItem = InputListItem.extend('sap.ui.rta.dttool.controls.DTToolListItem', {

		metadata: {
			properties: {
				propertyName : {
					type : "string"
				},
				type : {
					type : "string"
				},
				value : {
					type : "any"
				},
				defaultValue : {
					type : "any",
					defaultValue: "string"
				}
			},

			events: {
				change : {
					parameters : {
						newValue : {
							type : "any"
						}
					}
				}
			}
		},

		onSelectChange : function (oEvent) {
			var vNewValue = oEvent.getParameter("selectedItem").getKey();

			if (this.getType() === "boolean") {
				vNewValue = vNewValue === "true";
			}

			this.fireChange({
				newValue: vNewValue
			});
		},

		onInputChange : function (oEvent) {
			var vNewValue = oEvent.getParameter("value");

			if (this.getType() === "int") {
				vNewValue = parseInt(vNewValue);
			} else if (this.getType() === "float") {
				vNewValue = parseFloat(vNewValue);
			}

			this.getContent()[1].setEnabled(vNewValue !== this.defaultValue);

			this.fireChange({
				newValue: vNewValue
			});
		},

		onBeforeRendering : function () {
			this.removeAllContent();

			this.setLabel(this.getPropertyName());

			var sType = this.getType();

			var aItems = [];

			var sValue = this.getValue();
			var sDefaultValue = this.getDefaultValue();
			if (sType === "boolean") {
				this.addContent(new sap.m.Select({
					width : "12.5rem",
					selectedKey : "" + sValue,
					showSecondaryValues : true,
					change : this.onSelectChange.bind(this),
					items : [
						new sap.ui.core.ListItem({
							key : "true",
							text : "true",
							additionalText : sDefaultValue ? "default" : ""
						}),
						new sap.ui.core.ListItem({
							key : "false",
							text : "false",
							additionalText : sDefaultValue ? "" : "default"
						})
					]
				}));
			} else if (jQuery.isPlainObject(ObjectPath.get(sType || ""))) {
				var oEnum = ObjectPath.get(sType || "");

				Object.keys(oEnum).forEach(function (sKey) {
					aItems.push(new sap.ui.core.ListItem({
						key : "" + oEnum[sKey],
						text : oEnum[sKey],
						additionalText : sDefaultValue === oEnum[sKey] ? "default" : ""
					}));
				});

				this.addContent(new sap.m.Select({
					width : "12.5rem",
					selectedKey : "" + sValue,
					showSecondaryValues : true,
					change : this.onSelectChange.bind(this),
					items : aItems
				}));
			} else {
				this.addContent(new sap.m.Input({
					width : "8rem",
					value : sValue,
					textAlign : (this.getType === "int" || this.getType === "float") ? "End" : "Begin",
					type : (this.getType === "int" || this.getType === "float") ? "Number" : "Text",
					change : this.onInputChange.bind(this)
				}).addStyleClass("sapUiTinyMarginEnd")).addContent(new sap.m.Button({
					width : "4rem",
					text : "default",
					enabled : sDefaultValue !== sValue,
					press : this.defaultButtonPress.bind(this)
				}));
			}
		},

		defaultButtonPress : function () {
			this.getContent()[0].setValue(this.getDefaultValue());
			this.getContent()[1].setEnabled(false);

			this.fireChange({
				newValue: this.getDefaultValue()
			});
		},

		setType : function (sType) {
			this.setProperty("type", sType || "string");
		},

		renderer : function () {
			InputListItemRenderer.render.apply(this, arguments);
		}
	});

	return DTToolListItem;
});