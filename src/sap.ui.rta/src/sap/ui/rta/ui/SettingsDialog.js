/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global',
			'sap/ui/rta/library',
			'sap/ui/core/Control',
			'sap/m/Dialog',
			'sap/ui/layout/VerticalLayout',
			'sap/m/Label',
			'sap/m/Input',
			'sap/m/Select',
			'sap/ui/core/Item',
			'sap/m/Button',
			'sap/m/CheckBox',
			'sap/ui/rta/command/CommandFactory',
			'sap/ui/rta/command/CompositeCommand',
			'sap/ui/dt/ElementUtil'
	],
	function (jQuery,
			library,
			Control,
			Dialog,
			VerticalLayout,
			Label,
			Input,
			Select,
			Item,
			Button,
			CheckBox,
			CommandFactory,
			CompositeCommand,
			ElementUtil
	) {
	"use strict";

		/**
		 * Constructor for a new sap.ui.rta.SettingsDialog control.
		 * @extends sap.ui.core.Control
		 * @author SAP SE
		 * @version ${version}
		 * @constructor
		 * @private
		 * @since 1.34
		 * @alias SettingsDialog
		 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might
		 *               be changed in future.
		 */
	var SettingsDialog = Control.extend("sap.ui.rta.ui.SettingsDialog", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				"commandStack" : {
					type : "sap.ui.core.Control"
				}
			},
			associations : {
				"element" : {
					type : "sap.ui.core.Element"
				}
			}
		}
	});

	/**
	 * Initialize the Dialog
	 *
	 * @private
	 */
	SettingsDialog.prototype.init = function() {
		this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		this._oDialog = this._createDialog();
	};

	/**
	 * Create the Dialog
	 *
	 * @private
	 */
	SettingsDialog.prototype._createDialog = function() {
		return new Dialog({
			title : this._oTextResources.getText("HEADER_SETTINGS"),
			contentHeight : "500px",
			draggable: true,
			buttons : [
				new Button({
					text : this._oTextResources.getText("BTN_FREP_OK"),
					press : [this._applyChangesAndClose, this]
				}),
				new Button({
					text : this._oTextResources.getText("BTN_FREP_CANCEL"),
					press : [this._cancelDialog, this]
				})
			]
		}).addStyleClass("sapUiPopupWithPadding").addStyleClass("sapUiSizeCompact");
	};

	/**
	 * @private
	 */
	SettingsDialog.prototype._applyChangesAndClose = function() {
		this._applyChanges();
		this._oDialog.close();
	};

	/**
	 * @private
	 */
	SettingsDialog.prototype._iterateExecutedCommands = function(fnCallback) {
		Object.keys(this._mCommands).forEach(function(sPropertyName) {
			fnCallback(this._mCommands[sPropertyName]);
		}, this);
	};

	/**
	 * @private
	 */
	SettingsDialog.prototype._applyChanges = function() {
		var oCompositeCommand = new CompositeCommand();
		this._iterateExecutedCommands(function(oCommand) {
			oCompositeCommand.addCommand(oCommand);
		});
		if (oCompositeCommand.getCommands().length) {
			this.getCommandStack().pushExecutedCommand(oCompositeCommand);
		}
	};

	/**
	 * @private
	 */
	SettingsDialog.prototype._cancelDialog = function() {
		this._iterateExecutedCommands(function(oCommand) {
			oCommand.undo();
		});

		this._oDialog.close();
	};

	/**
	 * @private
	 */
	SettingsDialog.prototype._executePropertyChangeCommand = function(oElement, sPropertyName, vNewValue, vOldValue) {
		if (!this._mCommands[sPropertyName]) {
			var oPropertyChangeCommand = CommandFactory.getCommandFor(oElement, "property", {
				propertyName : sPropertyName,
				newValue : vNewValue,
				oldValue : vOldValue
			});
			this._mCommands[sPropertyName] = oPropertyChangeCommand;
			oPropertyChangeCommand.execute();
		} else {
			this._mCommands[sPropertyName].undo();
			delete this._mCommands[sPropertyName];
		}
	};

	/**
	 * @private
	 */
	SettingsDialog.prototype._createBooleanEditor = function(oElement, sPropertyName, bPropertyValue) {
		var oCheckBox = new CheckBox({
			text : sPropertyName,
			selected : bPropertyValue
		});

		oCheckBox.attachSelect(function(oEvent) {
			var bNewValue = oEvent.getParameter("selected");
			var bOldValue = !bNewValue;
			this._executePropertyChangeCommand(oElement, sPropertyName, bNewValue, bOldValue);
		}, this);

		return oCheckBox;
	};

	/**
	 * @private
	 */
	SettingsDialog.prototype._createStringEditor = function(oElement, sPropertyName, sPropertyValue) {
		var oInput = new Input({value : sPropertyValue});

		oInput.attachChange(function(oEvent) {
			var sNewValue = oEvent.getParameter("value");
			// TODO : get old value via elementUtil
			var sOldValue = sPropertyValue;
			this._executePropertyChangeCommand(oElement, sPropertyName, sNewValue, sOldValue);
		}, this);

		return oInput;
	};

	/**
	 * @private
	 */
	SettingsDialog.prototype._createEnumEditor = function(oElement, oPropertyTypeDescription, sPropertyName, vPropertyValue) {
		var oSelect = new Select();
		Object.keys(oPropertyTypeDescription).forEach(function(sKey) {
			oSelect.addItem(new Item({
				text : sKey,
				key : oPropertyTypeDescription[sKey]
			}));
		});

		oSelect.setSelectedKey(vPropertyValue);

		oSelect.attachChange(function(oEvent) {
			var oItem = oEvent.getParameter("selectedItem");
			if (oItem) {
				var vNewValue = oItem.getKey();
				var vOldValue = vPropertyValue;
				this._executePropertyChangeCommand(oElement, sPropertyName, vNewValue, vOldValue);
			}
		}, this);

		return oSelect;
	};

	/**
	 * @private
	 */
	SettingsDialog.prototype._updateDialogContent = function(oElement) {
		this._oDialog.removeAllContent();
		var oVerticalLayout = new VerticalLayout();
		var mProperties = oElement.getMetadata().getAllProperties();
		Object.keys(mProperties).forEach(function(sPropertyName) {
			var oPropertyChangeControl;
			var oPropertyMetadata = mProperties[sPropertyName];
			// TODO : elementUtil for properties getters
			var vPropertyValue = oElement[oPropertyMetadata._sGetter]();

			if (oPropertyMetadata.type === "boolean") {
				oPropertyChangeControl = this._createBooleanEditor(oElement, sPropertyName, vPropertyValue);
				oVerticalLayout.addContent(oPropertyChangeControl);
			} else 	if (oPropertyMetadata.type === "string" || oPropertyMetadata.type === "sap.ui.core.CSSSize") {
				oPropertyChangeControl = new VerticalLayout();
				var oInput = this._createStringEditor(oElement, sPropertyName, vPropertyValue);

				oPropertyChangeControl.addContent(new Label({
					text : sPropertyName,
					labelFor : oInput.getId()
				}));
				oPropertyChangeControl.addContent(oInput);
				oPropertyChangeControl.addStyleClass("sapUiRtaDialogEntryWithMargin");
			} else {
				var oPropertyTypeDescription = jQuery.sap.getObject(oPropertyMetadata.type);
				if (oPropertyTypeDescription) {
					oPropertyChangeControl = new VerticalLayout();
					var oDropdown = this._createEnumEditor(oElement, oPropertyTypeDescription, sPropertyName, vPropertyValue);

					oPropertyChangeControl.addContent(new Label({
						text : sPropertyName,
						labelFor : oDropdown.getId()
					}));
					oPropertyChangeControl.addContent(oDropdown);
					oPropertyChangeControl.addStyleClass("sapUiRtaDialogEntryWithMargin");
				}
			}

			if (oPropertyChangeControl) {
				oVerticalLayout.addContent(oPropertyChangeControl);
			}
		}, this);
		this._oDialog.addContent(oVerticalLayout);
	};

	/**
	 * Open the Settings Dialog
	 *
	 * @param {sap.ui.core.Element}
	 *          oElement Currently selected control
	 */
	SettingsDialog.prototype.open = function(oElement) {
		this._mCommands = {};

		this._updateDialogContent(oElement);

		// Makes sure the modal div element does not change the size of our application (which would result in recalculation of our overlays)
		this._oDialog.open();
	};

	return SettingsDialog;

}, /* bExport= */ true);
