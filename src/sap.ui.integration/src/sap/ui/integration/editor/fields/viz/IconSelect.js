/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/IconPool",
	"sap/base/util/merge",
	"sap/ui/core/Core",
	"sap/base/util/deepClone"
], function (
	Control, Select, ListItem, JSONModel, IconPool, merge, Core, deepClone
) {
	"use strict";

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration"),
		aDefaultIcons;

	/**
	 * @class
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.integration.editor.fields.viz.IconSelect
	 * @author SAP SE
	 * @since 1.84.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.84.0
	 * @ui5-restricted
	 */
	var IconSelect = Control.extend("sap.ui.integration.editor.fields.viz.IconSelect", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				value: {
					type: "string",
					defaultValue: "sap-icon://accept"
				},
				editable: {
					type: "boolean",
					defaultValue: true
				},
				allowFile: {
					type: "boolean",
					defaultValue: true
				},
				allowNone: {
					type: "boolean",
					defaultValue: true
				}
			},
			aggregations: {
				_select: {
					type: "sap.m.Select",
					multiple: false,
					visibility: "hidden"
				}
			}
		},
		renderer: function (oRm, oControl) {
			var oSelect = oControl.getAggregation("_select");
			oRm.openStart("div");
			oRm.addClass("sapUiIntegrationIconSelect");
			if (oSelect && oControl.getWidth) {
				oRm.addStyle("width", oSelect.getWidth());
			}
			oRm.writeElementData(oControl);
			oRm.openEnd();
			oRm.renderControl(oSelect);
			oRm.close("div");
		}
	});

	IconSelect.prototype._initIconModel = function () {
		var aIconNames = IconPool.getIconNames();
		aIconNames = aIconNames.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		var aIcons = [];
		if (!aDefaultIcons) {
			aIconNames.filter(function (s) {
				var text = IconPool.getIconInfo(s).text || ("-" + s).replace(/-(.)/ig, function (sMatch, sChar) {
					return " " + sChar.toUpperCase();
				}).substring(1);
				aIcons.push({
					icon: "sap-icon://" + s,
					key: "sap-icon://" + s,
					text: text,
					tooltip: text,
					enabled: true
				});
			});
			aDefaultIcons = deepClone(aIcons, 500);
		} else {
			aIcons = deepClone(aDefaultIcons, 500);
		}
		aIcons = [{
			icon: "",
			text: oResourceBundle.getText("EDITOR_ICON_NONE"),
			tooltip: "",
			key: "",
			enabled: true
		}, {
			icon: "sap-icon://upload",
			text: oResourceBundle.getText("EDITOR_ICON_CHOOSE"),
			tooltip: "",
			key: "file",
			enabled: true
		}, {
			icon: "sap-icon://download",
			text: oResourceBundle.getText("EDITOR_ICON_SELECTED"),
			tooltip: "",
			key: "selected",
			enabled: false
		}].concat(aIcons);
		this._oIconModel = new JSONModel(aIcons);
		this._oIconModel.setSizeLimit(aIcons.length);
	};

	IconSelect.prototype.init = function () {
		if (oResourceBundle && oResourceBundle.sLocale !== Core.getConfiguration().getLanguage()) {
			oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
		}
		if (!this._oIconModel) {
			this._initIconModel();
		}
		var oItem = new ListItem({
			icon: "{iconlist>icon}",
			text: "{iconlist>text}",
			tooltip: "{iconlist>tooltip}",
			key: "{iconlist>key}",
			enabled: "{iconlist>enabled}"
		});

		this._oFileUpload = document.createElement("INPUT");
		this._oFileUpload.type = "file";
		this._oFileUpload.accept = ".png,.jpg,.jpeg,.svg";
		this._boundFileUploadChange = this._fileUploadChange.bind(this);
		this._oFileUpload.addEventListener("change", this._boundFileUploadChange);

		this._oSelect = new Select({
			width: "100%",
			items: {
				path: "iconlist>/",
				template: oItem
			},
			change: function (oEvent) {
				var oSelect = oEvent.getSource(),
					sSelectedKey = oEvent.getSource().getSelectedKey();
				if (sSelectedKey === "file") {
					oSelect._customImage = null;
					//open file upload
					this._oFileUpload.click();
					this._boundFocusBack = this._focusBack.bind(this);
					oSelect.getDomRef("hiddenSelect").addEventListener("focus", this._boundFocusBack);
				} else {
					this.setValue(sSelectedKey);
				}
			}.bind(this)
		});
		this._oSelect.setModel(this._oIconModel, "iconlist");

		//add style class and height on open
		var fnOpen = this._oSelect.open;
		this._oSelect.open = function () {
			fnOpen && fnOpen.apply(this, arguments);
			this.getPicker().addStyleClass("sapUiIntegrationIconSelectList");
			this.getPicker().setContentHeight("400px");
		};

		//show file image before the label
		this._oSelect.addDelegate({
			onAfterRendering: function () {
				var oIconDomRef = this._oSelect.getDomRef("labelIcon");
				if (oIconDomRef) {
					var sCustomImage = this._oSelect._customImage;
					if (sCustomImage) {
						oIconDomRef.style.backgroundImage = "url('" + sCustomImage + "')";
						oIconDomRef.classList.add("sapMSelectListItemIconCustom");
					} else {
						oIconDomRef.style.backgroundImage = "unset";
						oIconDomRef.classList.remove("sapMSelectListItemIconCustom");
					}
				}
			}.bind(this)
		});

		//keyboard handling only if the list is open
		this._oSelect.addDelegate({
			onsappageup: function () {
				if (this._oSelect.isOpen()) {
					var iSelected = this._oSelect.getSelectedIndex();
					this._oSelect.setSelectedIndex(iSelected - 50); //select will do -10
				}
			}.bind(this),
			onsappagedown: function () {
				if (this._oSelect.isOpen()) {
					var iSelected = this._oSelect.getSelectedIndex();
					if (iSelected < 3) {
						this._oSelect.setSelectedIndex(29);
					} else {
						this._oSelect.setSelectedIndex(iSelected + 50); //select will do +10
					}
				}
			}.bind(this),
			onsapup: function () {
				if (this._oSelect.isOpen()) {
					var bAllowFile = this.getAllowFile();
					var bAllowNone = this.getAllowNone();
					var bFileSelected = this._oIconModel.getProperty("/2/enabled");
					var iSelected = this._oSelect.getSelectedIndex();
					if (iSelected > 11 + 2) {
						this._oSelect.setSelectedIndex(iSelected - 11);//select will do -1
					} else if (iSelected >= 3) {
						if (bAllowNone && !bAllowFile) {
							this._oSelect.setSelectedIndex(0);
						} else if (bFileSelected) {
							this._oSelect.setSelectedIndex(2);
						} else {
							this._oSelect.setSelectedIndex(3);
						}
					}
				}
			}.bind(this),
			onsapdown: function () {
				if (this._oSelect.isOpen()) {
					var iSelected = this._oSelect.getSelectedIndex();
					if (iSelected > 1) {
						this._oSelect.setSelectedIndex(iSelected + 11); //select will do +1
					}
				}
			}.bind(this),
			onsapleft: function () {
				if (this._oSelect.isOpen()) { //just do up
					this._oSelect.onsapup.apply(this._oSelect, arguments);
				}
			}.bind(this),
			onsapright: function () {
				if (this._oSelect.isOpen()) { //just do up
					this._oSelect.onsapdown.apply(this._oSelect, arguments);
				}
			}.bind(this)

		}, true);
		this.setAggregation("_select", this._oSelect);
	};

	IconSelect.prototype._fileUploadChange = function () {
		var fileReader = new window.FileReader();
		fileReader.onload = function () {
			//file is uploaded
			this.setValue(fileReader.result);
			this._oSelect.invalidate();
		}.bind(this);
		if (this._oFileUpload.files.length === 1) {
			fileReader.readAsDataURL(this._oFileUpload.files[0]);
		}
	};

	//focus is back after a file upload dialog
	IconSelect.prototype._focusBack = function () {
		this._oSelect.getDomRef("hiddenSelect").removeEventListener("focus", this._boundFocusBack);
		setTimeout(function () {
			this.setValue(this.getValue());
		}.bind(this), 150);
	};


	IconSelect.prototype.bindProperty = function (sProperty, oBindingInfo) {
		Control.prototype.bindProperty.apply(this, arguments);
		if (sProperty === "editable") {
			var oSelectBindingInfo = merge({}, oBindingInfo);
			this._oSelect.bindProperty("editable", oSelectBindingInfo);
		}
		return this;
	};

	IconSelect.prototype.setValue = function (sValue) {
		this.setProperty("value", sValue, true);
		if (sValue && sValue.indexOf("data:image/") === 0) {
			this._oSelect._customImage = sValue;
			this._oIconModel.setProperty("/2/enabled", true);
			this._oSelect.setSelectedKey("selected");
		} else {
			this._oSelect._customImage = null;
			this._oIconModel.setProperty("/2/enabled", false);
			this._oSelect.setSelectedKey(sValue);
		}
		this._oSelect.invalidate();
		return this;
	};

	IconSelect.prototype.setAllowFile = function (bValue) {
		this.setProperty("allowFile", bValue, true);
		bValue = this.getAllowFile();
		this._oIconModel.setProperty("/1/enabled", bValue);
		return this;
	};

	IconSelect.prototype.setAllowNone = function (bValue) {
		this.setProperty("allowNone", bValue, true);
		bValue = this.getAllowNone();
		this._oIconModel.setProperty("/0/enabled", bValue);
		return this;
	};

	return IconSelect;
});