/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString",
	"sap/ui/core/Fragment",
	'sap/ui/unified/ColorPickerPopover',
	'sap/ui/unified/library',
	"sap/ui/model/json/JSONModel",
	"sap/base/util/deepClone",
	"sap/base/util/isPlainObject",
	"sap/base/util/isEmptyObject",
	"sap/base/util/restricted/_omit",
	"sap/ui/core/IconPool",
	"sap/ui/core/Element"
], function(
	BasePropertyEditor,
	isValidBindingString,
	Fragment,
	ColorPickerPopover,
	UnifiedLibrary,
	JSONModel,
	deepClone,
	isPlainObject,
	isEmptyObject,
	_omit,
	IconPool,
	Element
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>IconEditor</code>.
	 * This allows to set icon Object properties for a specified property of a JSON object.
	 * The type of the icon can be "icon", "text" or "picture"
	 * Properties of the icon are "src", "text" "alt", "shape"
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.cardEditor.propertyEditor.iconEditor.IconEditor
	 * @author SAP SE
	 * @since 1.81
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.81
	 * @ui5-restricted
	 */
	var IconEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.cardEditor.propertyEditor.iconEditor.IconEditor", {
		metadata: {
			library: "sap.ui.integration"
		},
		xmlFragment: "sap.ui.integration.designtime.cardEditor.propertyEditor.iconEditor.IconEditor",
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	IconEditor.configMetadata = Object.assign(
		{},
		BasePropertyEditor.configMetadata,
		{
			typeLabel: {
				defaultValue: "BASE_EDITOR.TYPES.ICON"
			}
		}
	);

	// Editor Configuration for Editor for type "icon"
	var oIconConfig = {
		config: {
			type: "simpleicon"
		},
		key: "src"
	};

	// Editor Configuration for Editor for type "text"
	var oTextConfig = {
		config: {
			type: "string",
			maxLength: 2,
			validators: {
				isAlphabetic: {
					type: "pattern",
					config: {
						pattern: "^[A-Za-z]*$"
					},
					errorMessage: "CARD_EDITOR.VALIDATOR.NOT_AN_ALPHABETIC"
				}
			}
		},
		key: "text"
	};

	// Editor Configuration for Editor for type "picture"
	var oPictureConfig = {
		config: {
			type: "string"
		},
		key: "src"
	};

	var oDefaultIconModelData = {
		type: "icon",
		src: "",
		shape: "Circle",
		alt: "",
		text: "",
		backgroundColor: "",
		color: ""
	};


	var ColorPickerMode = UnifiedLibrary.ColorPickerMode;
	var ColorPickerDisplayMode = UnifiedLibrary.ColorPickerDisplayMode;

	/**
	 * Initialization hook
	 * Sets the Models
	 * @private
	 */
	IconEditor.prototype.init = function () {
		this._oIconModel = new JSONModel(deepClone(oDefaultIconModelData));
		this._oIconModel.setDefaultBindingMode("OneWay");
		this.setModel(this._oIconModel, "icon");

		this._oConfigsModel = new JSONModel({
			selectConfig: {
				type: "select",
				items: [],
				allowBindings: false
			},
			valueConfig: oIconConfig
		});

		this._oConfigsModel.setDefaultBindingMode("OneWay");
		this.setModel(this._oConfigsModel, "configs");

		this._oSettingsModel = new JSONModel({
			shapes: [],
			altVisible: true,
			backgroundColorVisible: false,
			colorVisible: false
		});
		this._oSettingsModel.setDefaultBindingMode("OneWay");
		this.setModel(this._oSettingsModel, "settings");

		this.attachModelContextChange(function () {
			if (this.getModel("i18n")) {
				var oCurrentConfig = deepClone(this._oConfigsModel.getData());
				oCurrentConfig.selectConfig.items = [
					{
						"key": "icon",
						"title": this.getI18nProperty("BASE_EDITOR.ICON.TYPE_ICON")
					},
					{
						"key": "text",
						"title": this.getI18nProperty("BASE_EDITOR.ICON.SETTINGS_DIALOG_TEXT_LABEL")
					},
					{
						"key": "picture",
						"title": this.getI18nProperty("BASE_EDITOR.ICON.TYPE_PICTURE")
					}
				];
				this._oConfigsModel.setData(oCurrentConfig);

				var oCurrentSettings = deepClone(this._oSettingsModel.getData());
				oCurrentSettings.shapes = [
					{
						key: "Square",
						text: this.getI18nProperty("BASE_EDITOR.ICON.SETTINGS_DIALOG_SHAPE_SQUARE")
					},
					{
						key: "Circle",
						text: this.getI18nProperty("BASE_EDITOR.ICON.SETTINGS_DIALOG_SHAPE_CIRCLE")
					}
				];
				this._oSettingsModel.setData(oCurrentSettings);
			}
		}, this);
	};

	IconEditor.prototype.getExpectedWrapperCount = function () {
		return 2;
	};

	IconEditor.prototype.setValue = function(mValue) {
		var vNextValue = isEmptyObject(mValue) ? undefined : mValue;
		BasePropertyEditor.prototype.setValue.call(this, vNextValue);
		this._oIconModel.setData(
			Object.assign(
				{},
				this._oIconModel.getData(),
				mValue,
				{
					type: this.getDesigntimeMetadataValue().type || getDefaultType(mValue)
				}
			));
	};

	function getDefaultType(vValue) {
		if (isPlainObject(vValue)) {
			if (vValue.src) {
				if (
					vValue.backgroundColor
					|| vValue.color
					|| (IconPool.isIconURI(vValue.src) && IconPool.getIconInfo(vValue.src))
					|| isValidBindingString(vValue.src, false)
				) {
					return "icon";
				} else {
					return "picture";
				}
			} else if (vValue.text) {
				return "text";
			}
		}

		return oDefaultIconModelData.type;
	}

	/**
	 * Formatter for the icon/text/picture Editor key
	 *
	 * @param {string} sKey - Key from the Editor
	 * @returns {string} - Value from the Model for the given key
	 * @private
	 */
	IconEditor.prototype._prepareValue = function (sKey, oIconModelData) {
		return oIconModelData[sKey];
	};

	/**
	 * Handler for Value change of the type-selection
	 *
	 * @param {object} oEvent - Event Object
	 * @private
	 */
	IconEditor.prototype._onTypeChange = function (oEvent) {
		// Show the fitting editor for the type and clear unused properties
		var oConfig;
		var sType = oEvent.getSource().getValue();

		switch (sType) {
			case "icon":
				oConfig = oIconConfig;
				this._oSettingsModel.setProperty("/altVisible", true);
				// this._oSettingsModel.setProperty("/backgroundColorVisible", true);
				// this._oSettingsModel.setProperty("/colorVisible", true);
				break;
			case "text":
				oConfig = oTextConfig;
				this._oSettingsModel.setProperty("/altVisible", false);
				// this._oSettingsModel.setProperty("/backgroundColorVisible", true);
				// this._oSettingsModel.setProperty("/colorVisible", true);
				break;
			case "picture":
				oConfig = oPictureConfig;
				this._oSettingsModel.setProperty("/altVisible", true);
				// this._oSettingsModel.setProperty("/backgroundColorVisible", false);
				// this._oSettingsModel.setProperty("/colorVisible", false);
				break;
		}
		this._oConfigsModel.setData(Object.assign({}, this._oConfigsModel.getData(), {
			valueConfig: oConfig
		}));
		this.setDesigntimeMetadataValue({
			type: sType
		});
		this.setValue(this._processOutputValue(this._oIconModel.getData()));
	};

	/**
	 * Handler for Value change of the icon / text / picture Editor
	 * Updates the Icon-Model
	 *
	 * @param {object} oEvent - Event Object
	 * @private
	 */
	IconEditor.prototype._updateValue = function (oEvent) {
		var sKey = this._oConfigsModel.getData().valueConfig.key;
		var oNextState = {};
		oNextState[sKey] = oEvent.getSource().getValue();
		var oNextIconModelData = Object.assign({}, this._oIconModel.getData(), oNextState);
		this.setValue(this._processOutputValue(oNextIconModelData));
	};

	/**
	 * Handler for Settings-Button
	 * Opens the Settings Dialog
	 *
	 * @private
	 */
	IconEditor.prototype._handleSettings = function () {
		this._oOldData = deepClone(this.getModel("icon").getData());
		if (!this._oSettingsDialog) {
			return Fragment.load({
				name: "sap.ui.integration.designtime.cardEditor.propertyEditor.iconEditor.IconEditorSettingsDialog",
				controller: this
			}).then(function (oDialog) {
				this._oDialogModel = new JSONModel(this._oOldData);
				this._oSettingsDialog = oDialog;
				this._oSettingsDialog.setModel(this._oDialogModel, "data");
				this.addDependent(this._oSettingsDialog);
				this._oSettingsDialog.open();
				return this._oSettingsDialog;
			}.bind(this));
		} else {
			this._oSettingsDialog.open();
			this._oDialogModel.setData(this._oOldData);
			return Promise.resolve(this._oSettingsDialog);
		}
	};

	/**
	 * Handler for Save-Button of the Settings Dialog
	 * Gets the data and closes the Dialog
	 *
	 * @param {object} oEvent - Event Object
	 * @private
	 */
	IconEditor.prototype._onSettingsSave = function () {
		this._oSettingsDialog.close();
		this.setValue(this._processOutputValue(this._oDialogModel.getData()));
	};

	/**
	 * Handler for Cancel-Button of the Settings Dialog
	 * closes the Dialog
	 *
	 * @param {object} oEvent - Event Object
	 * @private
	 */
	IconEditor.prototype._onSettingsCancel = function () {
		// this.getModel("icon").setData(this._oOldData);
		this._oSettingsDialog.close();
	};

	IconEditor.prototype._processOutputValue = function (oValue) {
		var sType = this.getDesigntimeMetadataValue().type;
		var aOmitKeys = ["type"];

		Object.keys(oValue).forEach(function (sKey) {
			if (
				!oValue[sKey]
				|| oValue[sKey] === oDefaultIconModelData[sKey]
			) {
				aOmitKeys.push(sKey);
			}
		});

		switch (sType) {
			case "icon":
				aOmitKeys.push("text");
				if (!oValue["src"]) {
					aOmitKeys.push("shape", "alt", "backgroundColor", "color");
				}
				break;
			case "picture":
				aOmitKeys.push("text", "backgroundColor", "color");
				if (!oValue["src"]) {
					aOmitKeys.push("shape", "alt");
				}
				break;
			case "text":
				aOmitKeys.push("src", "alt");
				if (!oValue["text"]) {
					aOmitKeys.push("shape", "backgroundColor", "color");
				}
				break;
		}

		return _omit(oValue, aOmitKeys);

	};

	/**
	 * Handler for Value Help of Color Imput Fields
	 * Opens a Color Picker Popup
	 *
	 * @param {object} oEvent - Event Object
	 * @private
	 */
	IconEditor.prototype._openColorPickerPopup = function (oEvent) {
		this._inputId = oEvent.getSource().getId();
		if (!this.oColorPickerSimplifiedPopover) {
			this.oColorPickerSimplifiedPopover = new ColorPickerPopover("oColorPickerSimpplifiedPopover", {
				colorString: "blue",
				displayMode: ColorPickerDisplayMode.Simplified,
				mode: ColorPickerMode.HSL,
				change: this._handleColorPickerChange.bind(this)
			});
		}
		this.oColorPickerSimplifiedPopover.openBy(oEvent.getSource());
	};

	/**
	 * Handler for Change-Event of the Color Picker
	 * gets the selected color and passes it to the input
	 *
	 * @param {object} oEvent - Event Object
	 * @private
	 */
	IconEditor.prototype._handleColorPickerChange = function (oEvent) {
		var oInput = Element.registry.get(this._inputId);
		oInput.setValue(oEvent.getParameter("hex"));
		oInput.setValueState("None");
		this._inputId = "";
	};

	IconEditor.prototype.getFocusDomRef = function() {
		var oContent = this.getContent();

		if (oContent) {
			return this.getContent().getItems()[0].getContent()[0].getFocusDomRef();
		}
	};

	IconEditor.prototype.getIdForLabel = function() {
		var oContent = this.getContent();

		if (oContent) {
			return this.getContent().getItems()[0].getContent()[0].getIdForLabel();
		}
	};

	return IconEditor;
});