/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/IconPool",
	"sap/ui/core/CustomData"
], function (
	Control, Select, ListItem, JSONModel, IconPool, CustomData
) {
	"use strict";


	//create a icon model enhance the model data once otherwise the formatters run all the time.
	var aIconNames = IconPool.getIconNames();
	aIconNames = aIconNames.sort(function (a, b) {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});


	var aIcons = [];
	aIconNames.filter(function (s) {
		var text = IconPool.getIconInfo(s).text || ("-" + s).replace(/-(.)/ig, function (sMatch, sChar) {
			return " " + sChar.toUpperCase();
		}).substring(1);
		aIcons.push({
			icon: "sap-icon://" + s,
			key: "sap-icon://" + s,
			text: text,
			tooltip: text
		});
	});

	aIcons = [{
		icon: "",
		text: "(No Icon)",
		tooltip: "",
		key: "empty"
	},{
		icon: "sap-icon://upload",
		text: "Choose from file...",
		tooltip: "",
		key: "file"
	}].concat(aIcons);

	var oIconModel = new JSONModel(aIcons);
	oIconModel.setSizeLimit(aIcons.length);

	function y(oSelect, oItem, o) {
		var fr = new window.FileReader();
		fr.onload = function () {
			oSelect._customImage = fr.result;
			oItem.setIcon(fr.result);
			oItem.setKey("file");
			oItem.setText("Selected from file");
			var oValue = oSelect._customImage;
			oSelect.getModel("currentSettings").setProperty("value", oValue, oSelect.getBindingContext("currentSettings"));
			oSelect.invalidate();
		};
		fr.readAsDataURL(o.files[0]);
	}
	function x(oSelect, o) {
		oSelect.getDomRef("hiddenSelect").removeEventListener("focus", x);
		setTimeout(function () {
			//wait for change
			if (oSelect._customImage) {
				return;
			}
			o.removeEventListener("change", y);
		}, 300);
	}

	/**
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.designtime.editor.fields.viz.IconSelect
	 * @author SAP SE
	 * @since 1.83.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.83.0
	 * @ui5-restricted
	 */
	var IconSelect = Control.extend("sap.ui.integration.designtime.editor.fields.viz.IconSelect", {
		renderer: function (oRm, oControl) {
			var oEditor = oControl.getDependents()[0];
			oRm.openStart("div");
			oRm.addClass("sapUiIntegrationIconSelect");
			if (oEditor && oControl.getWidth) {
				oRm.addStyle("width", oEditor.getWidth());
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeElementData(oControl);
			oRm.openEnd();
			oRm.renderControl(oEditor);
			oRm.close("div");
		}
	});

	IconSelect.prototype.init = function () {
		var oItem = new ListItem({
			icon: "{iconlist>icon}",
			text: "{iconlist>text}",
			tooltip: "{iconlist>tooltip}",
			key: "{iconlist>key}"
		});

		this._oSelect = new Select({
			selectedKey: {
				path: 'currentSettings>value',
				formatter: function(oIconValue) {
					if (oIconValue) {
						if (oIconValue.indexOf("sap-icon://") > -1) {
							return oIconValue;
						} else if (oIconValue.indexOf("data:image/") > -1) {
							this._customImage = oIconValue;
							return "file";
						}
					}
					return "empty";
				}
			},
			width: "100%",
			items: {
				path: "iconlist>/",
				template: oItem
			},
			change: function (oEvent) {
				var oSelect = oEvent.getSource();
				var sSelectedKey = oEvent.getSource().getSelectedKey();
				if (sSelectedKey.indexOf("file") > -1) {
					var oItem = oEvent.getParameters().selectedItem;
					var o = document.createElement("INPUT");
					o.type = "file";
					o.accept = ".png,.jpg,.jpeg,.svg";

					o.addEventListener("change", y.bind(this, oSelect, oItem, o));
					o.click();
					oSelect.getDomRef("hiddenSelect").addEventListener("focus", x.bind(this, oSelect, o));
				} else {
					oSelect._customImage = null;
					var oData = oSelect.getModel("iconlist").getData();
					var oFileData = {
						icon: "sap-icon://upload",
						text: "Choose from file...",
						tooltip: "",
						key: "file"
					};
					oData.splice(1, 1, oFileData);
					oSelect.getModel("iconlist").setData(oData);
					var sValue = "";
					if (sSelectedKey.indexOf("sap-icon://") > -1) {
						sValue = sSelectedKey;
					}
					oSelect.getModel("currentSettings").setProperty("value", sValue, oSelect.getBindingContext("currentSettings"));
					oSelect.invalidate();
				}
			}
		});

		var fnAfterRendering = this._oSelect.onAfterRendering;
		var fnOpen = this._oSelect.open;

		this._oSelect.open = function () {
			fnOpen && fnOpen.apply(this, arguments);
			var oIconList = this.getModel("iconlist").getData();
			var sValue = this.getModel("currentSettings").getProperty("value", this._getBindingContext("currentSettings"));
			if (sValue && sValue.indexOf("data:image/") > -1 && oIconList[1].icon.indexOf("sap-icon://") > -1) {
				oIconList[1].icon = sValue;
				this.getModel("iconlist").setData(oIconList);
			} else if (sValue && sValue.indexOf("sap-icon://") > -1 && oIconList[1].icon.indexOf("data:image/") > -1) {
				oIconList[1].icon = "sap-icon://upload";
				this.getModel("iconlist").setData(oIconList);
			}
			this.getPicker().addStyleClass("sapUiIntegrationIconSelectList");
			this.getPicker().setContentHeight("400px");
		};
		this._oSelect.onAfterRendering = function () {
			fnAfterRendering && fnAfterRendering.apply(this, arguments);
			var oIconDomRef = this.getDomRef("labelIcon");
			if (oIconDomRef) {
				if (this._customImage) {
					oIconDomRef.style.backgroundImage = "url('" + this._customImage + "')";
					oIconDomRef.style.backgroundSize = "1.1rem";
					oIconDomRef.style.width = "1.2rem";
					oIconDomRef.style.height = "1.5rem";
					oIconDomRef.style.backgroundRepeat = "no-repeat";
					oIconDomRef.style.backgroundPosition = "center";
					oIconDomRef.style.color = "transparent";
					oIconDomRef.style.verticalAlign = "top";
				} else {
					oIconDomRef.style.backgroundImage = "unset";
					oIconDomRef.style.backgroundSize = "unset";
					oIconDomRef.style.marginRight = "unset";
					oIconDomRef.style.width = "unset";
					oIconDomRef.style.height = "unset";
					oIconDomRef.style.backgroundRepeat = "unset";
					oIconDomRef.style.backgroundPosition = "unset";
					oIconDomRef.style.color = "unset";
					oIconDomRef.style.verticalAlign = "unset";
				}
			}
		};
		this._oSelect.setModel(oIconModel, "iconlist");

		this.addDependent(this._oSelect);
	};

	return IconSelect;
});