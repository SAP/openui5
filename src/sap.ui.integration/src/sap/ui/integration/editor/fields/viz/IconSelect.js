/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/editor/fields/viz/VizBase",
	"sap/m/Select",
	"sap/ui/core/ListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/IconPool",
	"sap/ui/core/_IconRegistry",
	"sap/base/util/merge",
	"sap/ui/core/Core",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/ui/integration/formatters/IconFormatter",
	"sap/m/Popover",
	"sap/m/Image",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Text",
	"sap/m/CheckBox",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem"
], function (
	VizBase,
	Select,
	ListItem,
	JSONModel,
	IconPool,
	_IconRegistry,
	merge,
	Core,
	deepClone,
	deepEqual,
	IconFormatter,
	Popover,
	Image,
	OverflowToolbar,
	ToolbarSpacer,
	Text,
	CheckBox,
	SegmentedButton,
	SegmentedButtonItem
) {
	"use strict";

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration"),
		aDefaultIcons,
		oLoadDefaultIconPromise;

	/**
	 * @class
	 * @extends sap.ui.integration.editor.fields.viz.VizBase
	 * @alias sap.ui.integration.editor.fields.viz.IconSelect
	 * @author SAP SE
	 * @since 1.84.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.84.0
	 * @ui5-restricted
	 */
	var IconSelect = VizBase.extend("sap.ui.integration.editor.fields.viz.IconSelect", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				value: {
					type: "string",
					defaultValue: "sap-icon://accept"
				},
				allowFile: {
					type: "boolean",
					defaultValue: true
				},
				allowNone: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Specifies whether or not to allow Default Icons (SAP Icons).
				 * @since 1.119
				 */
				allowDefaultIcons: {
					type: "boolean",
					defaultValue: true
				}
			}
		},
		renderer: {
			apiVersion: 2
		}
	});

	IconSelect.prototype._initDefaultIcons = function () {
		aDefaultIcons = [];
		var aIconNames = IconPool.getIconNames();
		aIconNames = aIconNames.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		aIconNames.filter(function (s) {
			var text = IconPool.getIconInfo(s).text || ("-" + s).replace(/-(.)/ig, function (sMatch, sChar) {
				return " " + sChar.toUpperCase();
			}).substring(1);
			aDefaultIcons.push({
				icon: "sap-icon://" + s,
				key: "sap-icon://" + s,
				text: text,
				additionalText: "sap-icon://" + s,
				tooltip: text,
				enabled: true,
				type: "UI5"
			});
		});

		var mFontRegistry = _IconRegistry.getFontRegistry();
		if (!mFontRegistry["SAP-icons-TNT"]) {
			// register TNT icons
			IconPool.registerFont({
				fontFamily: "SAP-icons-TNT",
				collectionName: "SAP-icons-TNT",
				fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts")
			});
		}
		if (!mFontRegistry["BusinessSuiteInAppSymbols"]) {
			// register Business Suite Icons
			IconPool.registerFont({
				fontFamily: "BusinessSuiteInAppSymbols",
				collectionName: "BusinessSuiteInAppSymbols",
				fontURI: sap.ui.require.toUrl("sap/ushell/themes/base/fonts/")
			});
		}
		oLoadDefaultIconPromise = Promise.all([IconPool.fontLoaded("SAP-icons-TNT"), IconPool.fontLoaded("BusinessSuiteInAppSymbols")]).then(function () {
			aIconNames = IconPool.getIconNames("SAP-icons-TNT");
			// filter out names which contains blank or UpperCase characters
			aIconNames = aIconNames.filter(function (s) {
				var strCode = s.substring(0, 1).charCodeAt();
				return s.indexOf(" ") < 0 && strCode >= 97 && strCode <= 122;
			});
			aIconNames.sort();
			aIconNames.filter(function (s) {
				var text = IconPool.getIconInfo(s, "SAP-icons-TNT").text || ("-" + s).replace(/-(.)/ig, function (sMatch, sChar) {
					return " " + sChar.toUpperCase();
				}).substring(1);
				aDefaultIcons.push({
					icon: "sap-icon://SAP-icons-TNT/" + s,
					key: "sap-icon://SAP-icons-TNT/" + s,
					text: text,
					additionalText: "sap-icon://SAP-icons-TNT/" + s,
					tooltip: text,
					enabled: true,
					type: "SAP-icons-TNT"
				});
			});

			aIconNames = IconPool.getIconNames("BusinessSuiteInAppSymbols");
			aIconNames.sort();
			aIconNames.filter(function (s) {
				var text = IconPool.getIconInfo(s, "BusinessSuiteInAppSymbols").text || ("-" + s).replace(/-(.)/ig, function (sMatch, sChar) {
					return " " + sChar.toUpperCase();
				}).substring(1);
				aDefaultIcons.push({
					icon: "sap-icon://BusinessSuiteInAppSymbols/" + s,
					key: "sap-icon://BusinessSuiteInAppSymbols/" + s,
					text: text,
					additionalText: "sap-icon://BusinessSuiteInAppSymbols/" + s,
					tooltip: text,
					enabled: true,
					type: "BusinessSuiteInAppSymbols"
				});
			});
		});
	};

	IconSelect.prototype._initIconModel = function () {
		var aIcons = [{
			icon: "",
			text: oResourceBundle.getText("EDITOR_ICON_NONE"),
			tooltip: "",
			key: IconFormatter.SRC_FOR_HIDDEN_ICON,
			enabled: true,
			type: "Action"
		}, {
			icon: "sap-icon://upload",
			text: oResourceBundle.getText("EDITOR_ICON_CHOOSE"),
			tooltip: "",
			key: "file",
			enabled: true,
			type: "Action"
		}, {
			icon: "sap-icon://download",
			text: oResourceBundle.getText("EDITOR_ICON_SELECTED"),
			tooltip: "",
			key: "selected",
			enabled: false,
			type: "Action"
		}];
		this._oIconModel = new JSONModel(aIcons);
		this._oIconModel.setSizeLimit(aIcons.length);
	};

	IconSelect.prototype._initConfigModel = function () {
		var oConfig = {
			"icons": {
				"layout": "Grid",
				"types": {
					"Action": true,
					"UI5": true,
					"SAP-icons-TNT": true,
					"BusinessSuiteInAppSymbols": true
				}
			}
		};
		this._oConfigModel = new JSONModel(oConfig);
	};

	IconSelect.prototype.onInit = function () {
		if (oResourceBundle && oResourceBundle.sLocale !== Core.getConfiguration().getLanguage()) {
			oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
		}
		if (!this._oIconModel) {
			this._initIconModel();
		}
		if (!aDefaultIcons) {
			this._initDefaultIcons();
		}
		if (oLoadDefaultIconPromise) {
			oLoadDefaultIconPromise.then(function () {
				if (this.getAllowDefaultIcons()) {
					var aIcons = this._oIconModel.getData();
					aIcons = aIcons.concat(deepClone(aDefaultIcons, 500));
					this._oIconModel.setData(aIcons);
					this._oIconModel.setSizeLimit(aIcons.length);
					this._oIconModel.checkUpdate(true);
					this._oControl && this._oControl.setSelectedKey(this.getValue());
				}
				oLoadDefaultIconPromise = undefined;
			}.bind(this));
		} else if (this.getAllowDefaultIcons()) {
			var aIcons = this._oIconModel.getData();
			aIcons = aIcons.concat(deepClone(aDefaultIcons, 500));
			this._oIconModel.setData(aIcons);
			this._oIconModel.setSizeLimit(aIcons.length);
		}
		if (!this._oConfigModel) {
			this._initConfigModel();
		}
		var oItem = new ListItem({
			icon: "{iconlist>icon}",
			text: "{iconlist>text}",
			tooltip: "{iconlist>tooltip}",
			key: "{iconlist>key}",
			additionalText: "{iconlist>additionalText}",
			enabled: {
				parts: [
					'config>/icons/types',
					"iconlist>type",
					"iconlist>enabled"
				],
				formatter: function (oTypes, sType, bEnabled) {
					return bEnabled && oTypes[sType];
				}
			}
		});

		this._oFileUpload = document.createElement("INPUT");
		this._oFileUpload.type = "file";
		this._oFileUpload.accept = ".png,.jpg,.jpeg,.svg";
		this._boundFileUploadChange = this._fileUploadChange.bind(this);
		this._oFileUpload.addEventListener("change", this._boundFileUploadChange);

		this._oControl = new Select({
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
		this._oControl.setModel(this._oIconModel, "iconlist");
		this._oControl.setModel(this._oConfigModel, "config");

		//add style class and height on open
		this._oControl._fnOpen = this._oControl.open;
		if (this.getAllowDefaultIcons()) {
			var that = this;
			this._oControl.open = function () {
				this._fnOpen && this._fnOpen.apply(this, arguments);
				that._oPicker = this.getPicker();
				// currently do not show the footer which contains icon type filter checkboxs
				var bShowFooter = false;
				if (!that._oPicker.getFooter() && bShowFooter) {
					var oOverflowToolbar = new OverflowToolbar({
						content: [
							new SegmentedButton({
								selectedKey: "{config>/icons/layout}",
								items: [
									new SegmentedButtonItem({
										icon: "sap-icon://grid",
										tooltip: "Grid View",
										key: "Grid"
									}),
									new SegmentedButtonItem({
										icon: "sap-icon://list",
										tooltip: "Details View",
										key: "Details"
									})
								],
								select: function (oEvent) {
									var oControl = oEvent.getSource();
									var sSelectedKey = oControl.getSelectedKey();
									if (sSelectedKey === "Grid") {
										this._oPicker.addStyleClass("sapUiIntegrationIconSelectList");
										this._oControl.setShowSecondaryValues(false);
									} else if (sSelectedKey === "Details") {
										this._oPicker.removeStyleClass("sapUiIntegrationIconSelectList");
										this._oControl.setShowSecondaryValues(true);
									}
								}.bind(that)
							}),
							new ToolbarSpacer(),
							new Text({
								text: "Icon Types:"
							}),
							new CheckBox({
								selected: "{config>/icons/types/UI5}",
								text: "UI5",
								select: that.onIconTypeChanged.bind(that)
							}),
							new CheckBox({
								selected: "{config>/icons/types/SAP-icons-TNT}",
								text: "Fiori",
								select: that.onIconTypeChanged.bind(that)
							}),
							new CheckBox({
								selected: "{config>/icons/types/BusinessSuiteInAppSymbols}",
								text: "Business Suite",
								select: that.onIconTypeChanged.bind(that)
							})
						]
					});
					that._oPicker.setFooter(oOverflowToolbar);
				}

				if (!deepEqual(that._oConfigModel.getProperty("/icons/types"), {
					"Action": true,
					"UI5": false,
					"SAP-icons-TNT": false,
					"BusinessSuiteInAppSymbols": false
				})) {
					that._oPicker.addStyleClass("sapUiIntegrationIconSelectList");
					that._oPicker.setContentHeight("400px");
				}
			};
		}

		//show file image before the label
		this._oControl.addDelegate({
			onAfterRendering: this.onAfterRenderingSelect.bind(this)
		});

		//keyboard handling only if the list is open
		this._oControl.addDelegate({
			onsappageup: function () {
				if (this._oControl.isOpen()) {
					var iSelected = this._oControl.getSelectedIndex();
					this._oControl.setSelectedIndex(iSelected - 50); //select will do -10
				}
			}.bind(this),
			onsappagedown: function () {
				if (this._oControl.isOpen()) {
					var iSelected = this._oControl.getSelectedIndex();
					if (iSelected < 3) {
						this._oControl.setSelectedIndex(29);
					} else {
						this._oControl.setSelectedIndex(iSelected + 50); //select will do +10
					}
				}
			}.bind(this),
			onsapup: function () {
				if (this._oControl.isOpen()) {
					var bAllowFile = this.getAllowFile();
					var bAllowNone = this.getAllowNone();
					var bFileSelected = this._oIconModel.getProperty("/2/enabled");
					var iSelected = this._oControl.getSelectedIndex();
					if (iSelected > 11 + 2) {
						this._oControl.setSelectedIndex(iSelected - 11);//select will do -1
					} else if (iSelected >= 3) {
						if (bAllowNone && !bAllowFile) {
							this._oControl.setSelectedIndex(0);
						} else if (bFileSelected) {
							this._oControl.setSelectedIndex(2);
						} else {
							this._oControl.setSelectedIndex(3);
						}
					}
				}
			}.bind(this),
			onsapdown: function () {
				if (this._oControl.isOpen()) {
					var iSelected = this._oControl.getSelectedIndex();
					if (iSelected > 1) {
						this._oControl.setSelectedIndex(iSelected + 11); //select will do +1
					}
				}
			}.bind(this),
			onsapleft: function () {
				if (this._oControl.isOpen()) { //just do up
					this._oControl.onsapup.apply(this._oControl, arguments);
				}
			}.bind(this),
			onsapright: function () {
				if (this._oControl.isOpen()) { //just do up
					this._oControl.onsapdown.apply(this._oControl, arguments);
				}
			}.bind(this)

		}, true);
	};

	// add style class to the render manager
	IconSelect.prototype.applyStyle = function (oRm) {
		oRm.class("sapUiIntegrationIconSelect");
		if (this._oControl && this._oControl.getWidth) {
			oRm.style("width", this._oControl.getWidth());
		}
	};

	IconSelect.prototype.onIconTypeChanged = function (oEvent) {
		this._oConfigModel.checkUpdate(true);
		var oIconTypes = this._oConfigModel.getProperty("/icons/types");
		if (deepEqual(oIconTypes, {
			"Action": true,
			"UI5": false,
			"SAP-icons-TNT": false,
			"BusinessSuiteInAppSymbols": false
		})) {
			this._oPicker.setContentHeight("");
		} else {
			this._oPicker.setContentHeight("400px");
		}
		var sValue = this.getValue();
		if (sValue && sValue.indexOf("data:image/") === 0) {
			this._oControl._customImage = sValue;
			this._oIconModel.setProperty("/2/enabled", true);
			this._oControl.setSelectedKey("selected");
		} else {
			this._oControl.setSelectedKey(sValue);
		}
	};

	IconSelect.prototype._fileUploadChange = function () {
		var fileReader = new window.FileReader();
		fileReader.onload = function () {
			//file is uploaded
			this.setValue(fileReader.result);
			this._oControl.invalidate();
		}.bind(this);
		if (this._oFileUpload.files.length === 1) {
			fileReader.readAsDataURL(this._oFileUpload.files[0]);
		}
	};

	//focus is back after a file upload dialog
	IconSelect.prototype._focusBack = function () {
		this._oControl.getDomRef("hiddenSelect").removeEventListener("focus", this._boundFocusBack);
		setTimeout(function () {
			this.setValue(this.getValue());
		}.bind(this), 150);
	};


	IconSelect.prototype.bindPropertyToControl = function (sProperty, oBindingInfo) {
		if (sProperty === "editable") {
			var oControlBindingInfo = merge({}, oBindingInfo);
			this._oControl.bindProperty("editable", oControlBindingInfo);
		}
	};

	IconSelect.prototype.setValue = function (sValue) {
		this.setProperty("value", sValue, true);
		if (sValue && sValue.indexOf("data:image/") === 0) {
			this._oControl._customImage = sValue;
			this._oIconModel.setProperty("/2/enabled", true);
			this._oControl.setSelectedKey("selected");
		} else {
			this._oControl._customImage = null;
			this._oIconModel.setProperty("/2/enabled", false);
			this._oControl.setSelectedKey(sValue);
		}
		this._oControl.invalidate();
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

	IconSelect.prototype.onAfterRenderingSelect = function () {
		var oIconDomRef = this._oControl.getDomRef("labelIcon");
		if (oIconDomRef) {
			var sCustomImage = this._oControl._customImage;
			var oIcon = Core.byId(oIconDomRef.id);
			if (sCustomImage) {
				oIconDomRef.style.backgroundImage = "url('" + sCustomImage + "')";
				oIconDomRef.classList.add("sapMSelectListItemIconCustom");
				oIconDomRef.children[0].title = oResourceBundle.getText("EDITOR_IMAGE_CUSTOMICON_TOOLTIP");
				oIcon.onclick = function(oEvent) {
					oEvent.stopImmediatePropagation();
					oIcon._oImagePopover = new Popover(oIcon.getId() + "-imagePopover", {
						placement: "Right",
						showHeader: false,
						content: new Image(oIcon.getId() + "-imagePopover-image", {
							src: sCustomImage
						}).addStyleClass("image")
					}).addStyleClass("sapUiIntegrationImageSelect");
					oIcon._oImagePopover.openBy(oIcon);
				};
			} else {
				oIconDomRef.style.backgroundImage = "unset";
				oIconDomRef.classList.remove("sapMSelectListItemIconCustom");
				oIcon.onclick = undefined;
			}
		}
	};

	IconSelect.prototype.setAllowDefaultIcons = function (bAllowDefaultIcons) {
		if (typeof bAllowDefaultIcons === "boolean" && this.getAllowDefaultIcons() !== bAllowDefaultIcons) {
			var aIcons = this._oIconModel.getData();
			if (bAllowDefaultIcons) {
				//add default icons
				aIcons = aIcons.concat(deepClone(aDefaultIcons, 500));
				var oIconTypes = this._oConfigModel.getProperty("/icons/types");
				//add style class and height on open
				this._oControl.open = function () {
					this._fnOpen && this._fnOpen.apply(this, arguments);
					if (!deepEqual(oIconTypes, {
						"Action": true,
						"UI5": false,
						"SAP-icons-TNT": false,
						"BusinessSuiteInAppSymbols": false
					})) {
						this._oPicker.addStyleClass("sapUiIntegrationIconSelectList");
						this._oPicker.setContentHeight("400px");
					}
				};
			} else {
				//remove default icons
				aIcons = aIcons.slice(0, 3);
				//remove style class on open
				this._oControl.open = function () {
					this._fnOpen && this._fnOpen.apply(this, arguments);
					this.getPicker().removeStyleClass("sapUiIntegrationIconSelectList");
				};
			}
			this._oIconModel.setData(aIcons);
			this._oIconModel.setSizeLimit(aIcons.length);
		}
	};

	return IconSelect;
});