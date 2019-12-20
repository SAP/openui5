/*!
 * ${copyright}
 */

// Provides the <code>sap.ui.fl.write._internal.transport.TransportDialog</code> control.
sap.ui.define([
	"sap/m/List",
	"sap/m/InputListItem",
	"sap/m/Button",
	"sap/m/ComboBox",
	"sap/m/Dialog",
	"sap/m/DialogRenderer",
	"sap/m/Input",
	"sap/m/MessageToast",
	"sap/ui/core/ListItem"
],
function(
	List,
	InputListItem,
	Button,
	ComboBox,
	Dialog,
	DialogRenderer,
	Input,
	MessageToast,
	ListItem
) {
	"use strict";

	/**
	 * Constructor for a new transport/TransportDialog.
	 *
	 * @param {string} [sId] - ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] - Initial settings for the new control
	 *
	 * @class
	 * The Transport Dialog Control can be used to implement a value help for selecting an ABAP package and transport request. It is not a generic utility, but part of the variant management and therefore cannot be used in any other application.
	 * @extends sap.m.Dialog
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.fl.write._internal.transport.TransportDialog
	 */
	var TransportDialog = Dialog.extend("sap.ui.fl.write._internal.transport.TransportDialog", /** @lends sap.ui.fl.write._internal.transport.TransportDialog.prototype */ {
		metadata : {
			library : "sap.ui.fl",
			properties : {

				/**
				 * An ABAP package that can be used as default for the ABAP package selection.
				 */
				pkg : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * The set of ABAP transport requests that can be selected by a user.
				 */
				transports : {type : "any", group : "Misc", defaultValue : null},

				/**
				 * The LREP object for which as transport request has to be selected.
				 */
				lrepObject : {type : "any", group : "Misc", defaultValue : null},

				/**
				 * Flag indicating whether the selection of an ABAP package is to be hidden or not.
				 */
				hidePackage : {type : "boolean", group : "Misc", defaultValue : null}
			},
			events : {

				/**
				 * This event will be fired when the user clicks the OK button in the dialog.
				 */
				ok : {},

				/**
				 * This event will be fired when the user clicks the Cancel button in the dialog or presses the Escape key on the keyboard.
				 */
				cancel : {}
			}
		},
		renderer: DialogRenderer.render
	});


	/**
	 * Initializes the control.
	 *
	 * @private
	 */
	TransportDialog.prototype.init = function() {
		Dialog.prototype.init.apply(this);

		// initialize dialog and create member variables.
		this._oResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");
		this.setTitle(this._oResources.getText("TRANSPORT_DIALOG_TITLE"));

		// add the content.
		this._oPackageLabel = null;
		this._oPackage = this._createPackageField();
		this._oTransport = this._createTransportCombo();
		this.addContent(this._createContentList());

		// OK, cancel and local-object buttons.
		this._createButtons();
		this.setEscapeHandler(function(oPromise) {
			this.fireCancel();
			oPromise.resolve();
		}.bind(this));
	};

	/**
	 * Creates the content list and places its content.
	 *
	 * @private
	 */
	TransportDialog.prototype._createContentList = function() {
		this._oPackageListItem = new InputListItem({
			label: this._oResources.getText("TRANSPORT_DIALOG_PACKAGE"),
			content: [
				this._oPackage
			]
		});

		this._oTransportListItem = new InputListItem({
			label: this._oResources.getText("TRANSPORT_DIALOG_TRANSPORT"),
			content: [
				this._oTransport
			]
		});

		return new List({
			items: [
				this._oPackageListItem,
				this._oTransportListItem
			]
		});
	};

	/**
	 * Creates the footer buttons.
	 *
	 * @private
	 */
	TransportDialog.prototype._createButtons = function() {
		var that = this;

		this.addButton(new Button({
			text: this._oResources.getText("TRANSPORT_DIALOG_LOCAL_OBJECT"),
			tooltip: this._oResources.getText("TRANSPORT_DIALOG_LOCAL_OBJECT"),
			press: function() {
				that._onLocal();
			}
		}));
		this.addButton(new Button({
			text: this._oResources.getText("TRANSPORT_DIALOG_OK"),
			tooltip: this._oResources.getText("TRANSPORT_DIALOG_OK"),
			enabled: false,
			press: function() {
				that._onOkay();
			}
		}));
		this.addButton(new Button({
			text: this._oResources.getText("TRANSPORT_DIALOG_CANCEL"),
			tooltip: this._oResources.getText("TRANSPORT_DIALOG_CANCEL"),
			press: function() {
				that.fireCancel();
				that.close();
				that.destroy();
			}
		}));
	};

	/**
	 * Event handler for local object button.
	 *
	 * @private
	 */
	TransportDialog.prototype._onLocal = function() {
		this.fireOk({
			selectedTransport: "",
			selectedPackage: this.getPkg() || "$TMP",
			dialog: true
		});
		this.close();
		this.destroy();
	};

	/**
	 * Event handler for OK button.
	 *
	 * @private
	 */
	TransportDialog.prototype._onOkay = function() {
		var sTransport = this._oTransport.getSelectedKey();

		if (this._checkOkay(sTransport)) {
			this.fireOk({
				selectedTransport: sTransport,
				selectedPackage: this.getPkg() || this._oPackage.getValue(),
				dialog: true
			});
			this.close();
			this.destroy();
		} else {
			this.getButtons()[1].setEnabled(false);
			this._oTransport.setValueState(sap.ui.core.ValueState.Error);
			this._oTransport.setValueStateText(this.getTitle());
		}
	};

	/**
	 * Checks whether the OK button triggers the OK callback.
	 *
	 * @param {string} sTransport - ID of a transport request, can be <code>null</code>.
	 * @returns {boolean} <code>true</code> if the okay callback can be triggered, <code>false</code> otherwise
	 *
	 * @private
	 */
	TransportDialog.prototype._checkOkay = function(sTransport) {
		if (sTransport) {
			return true;
		}

		return false;
	};

	/**
	 * Creates the transport <code>sap.ui.commons.ComboBox</code>.
	 * @returns {sap.ui.commons.ComboBox} Transport <code>sap.ui.commons.ComboBox</code>
	 *
	 * @private
	 */
	TransportDialog.prototype._createTransportCombo = function() {
		var that = this;

		return new ComboBox({
			showSecondaryValues: true,
			enabled: false,
			tooltip: this._oResources.getText("TRANSPORT_DIALOG_TRANSPORT_TT"),
			width: "100%",
			selectionChange: function() {
				//if package field is visible but has no value, the OK button is disable
				if (that._oPackageListItem.getVisible() && !that._oPackage.getValue()) {
					return;
				}

				that.getButtons()[1].setEnabled(true);
				that._oTransport.setValueState(sap.ui.core.ValueState.None);
			},
			change : function(oEvent) {
				var fCheck = function(oItem) {
					if ((oItem && oEvent.mParameters.newValue !== oItem.getText()) || !oItem) {
						return true;
					}

					return false;
				};

				if (oEvent && oEvent.mParameters && oEvent.mParameters.newValue) {
					if (fCheck(that._oTransport.getSelectedItem())) {
						that.getButtons()[1].setEnabled(false);
						that._oTransport.setValueState(sap.ui.core.ValueState.Error);
						that._oTransport.setValueStateText(that._oResources.getText("TRANSPORT_DIALOG_TRANSPORT_TT"));
					}
				}
			}
		});
	};

	/**
	 * Creates the package <code>sap.ui.commons.ComboBox</code>.
	 * @returns {sap.ui.commons.ComboBox} Package <code>sap.ui.commons.ComboBox</code>
	 *
	 * @private
	 */
	TransportDialog.prototype._createPackageField = function() {
		var that = this;

		return new Input({
			tooltip: this._oResources.getText("TRANSPORT_DIALOG_PACKAGE_TT"),
			width: "100%",
			change: function() {
				var oTransports;
				var oPromise;
				var oObject;

				oObject = that._createObjectInfo();
				oTransports = new sap.ui.fl.write._internal.transport.Transports(); // FIXME workaround to make test stub work with AMD
				oPromise = oTransports.getTransports(oObject);
				oPromise.then(function(oResult) {
					that._onPackageChangeSuccess(oResult);
				}, function(oResult) {
					that._onPackageChangeError(oResult);
				});
			},
			liveChange: function(oEvent) {
				if (oEvent.mParameters.liveValue && oEvent.mParameters.liveValue.length > 3) {
					that._oTransport.setEnabled(true);
				}
			}
		});
	};

	/**
	 * Creates the object info which serves as input for the transport service and returns it.
	 * @returns {object} Object info which serves as input for the transport service
	 *
	 * @private
	 */
	TransportDialog.prototype._createObjectInfo = function() {
		var oObject;
		var oResult = {
			"package" : this._oPackage.getValue() || ""
		};

		oObject = this.getProperty("lrepObject");

		if (oObject) {
			if (oObject.name) {
				oResult.name = oObject.name;
			}

			if (oObject.type) {
				oResult.type = oObject.type;
			}

			if (oObject.namespace) {
				oResult.namespace = oObject.namespace;
			}
		}

		return oResult;
	};

	/**
	 * Event handler reacting to package change.
	 * @param {object} oTransports - Possible transport requests
	 *
	 * @private
	 */
	TransportDialog.prototype._onPackageChangeSuccess = function(oTransports) {
		if (oTransports) {
			if (oTransports.localonly) {
				this._oTransport.setEnabled(false);
				this.getButtons()[1].setEnabled(true);
			} else if (oTransports.transports && oTransports.transports.length > 0) {
				this._oTransport.setEnabled(true);
				this._setTransports(oTransports);
			} else if (oTransports.errorCode) {
				this.getButtons()[1].setEnabled(false);
				this._oPackage.setValueState(sap.ui.core.ValueState.Error);
				this._oPackage.setValueStateText(this._oResources.getText("TRANSPORT_DIALOG_" + oTransports.errorCode));
				this._setTransports(oTransports);
			} else {
				MessageToast.show(this._oResources.getText("TRANSPORT_DIALOG_NO_TRANSPORTS"));
			}
		}
	};

	/**
	 * Sets the transport requests into the drop down.
	 * @param {object} oTransports - Possible transport requests
	 *
	 * @private
	 */
	TransportDialog.prototype._setTransports = function(oTransports) {
		var oLock;
		var aTransports;

		//get the transports into an array.
		oLock = this._hasLock(oTransports.transports);

		if (oLock) {
			aTransports = [oLock];
		} else {
			aTransports = oTransports.transports;
		}

		//set the transports.
		this.setTransports(aTransports);

		//pre-select one, if necessary.
		if (aTransports && aTransports.length === 1) {
			this._oTransport.setValue(aTransports[0].description, true);
			this.getButtons()[1].setEnabled(true);
		}

		//clear the transport combo-box, if necessary.
		if (!aTransports || aTransports.length === 0) {
			this._oTransport.setSelectedKey(null);
			this._oTransport.setValueState(sap.ui.core.ValueState.None);
			this.getButtons()[1].setEnabled(false);
		}
	};

	/**
	 * Event handler reacting to package change.
	 * @param {object} oResult - Response to requesting packages
	 *
	 * @private
	 */
	TransportDialog.prototype._onPackageChangeError = function(oResult) {
		MessageToast.show(oResult);
		this.setTransports([]);
	};

	/**
	 * Returns whether the LREP object is already locked in one of the transports.
	 * @param {array} aTransports - Available transports
	 * @returns {object} Transport if the LREP object is already locked in one of the transports, <code>null</code> otherwise
	 *
	 * @private
	 */
	TransportDialog.prototype._hasLock = function(aTransports) {
		var oTransport;
		var len = aTransports.length;

		while (len--) {
			oTransport = aTransports[len];

			if (oTransport.locked) {
				return oTransport;
			}
		}

		return null;
	};

	/**
	 * An ABAP package that can be used as default for the ABAP package selection.
	 * The property can only be set once and afterwards it cannot be changed.
	 * @param {string} sPackage - ABAP package that can be used as default for the ABAP package selection
	 *
	 * @public
	 */
	TransportDialog.prototype.setPkg = function(sPackage) {
		if (sPackage && !this.getProperty("pkg")) {
			// set the property itself.
			this.setProperty("pkg", sPackage);

			// disable package selection.
			this._oPackage.setValue(sPackage);
			this._oPackage.setEnabled(false);

			// enable transport selection.
			this._oTransport.setEnabled(true);

			// correct the title.
			this.setTitle(this._oResources.getText("TRANSPORT_DIALOG_TITLE_SIMPLE"));

			//disable local object button, as package has been set from outside and therefore should not be changed.
			this.getButtons()[0].setVisible(false);
		}

		return this;
	};

	/**
	 * The set of ABAP transport requests that can be selected by a user.
	 * @param {array} aSelection - Set of ABAP transport requests that can be selected by a user
	 *
	 * @public
	 */
	TransportDialog.prototype.setTransports = function(aSelection) {
		var i;
		var len = 0;
		var oItem;

		if (aSelection) {
			this.setProperty("transports", aSelection);
			this._oTransport.removeAllItems();
			len = aSelection.length;

			for (i = 0; i < len; i++) {
				oItem = aSelection[i];
				this._oTransport.addItem(new ListItem({
					key: oItem.transportId,
					text: oItem.transportId,
					additionalText: oItem.description
				}));
			}

			if (len === 1) {
				this._oTransport.setSelectedKey(aSelection[0].transportId);
				this.getButtons()[1].setEnabled(true);
			}

			// enable transport selection.
			if (len > 0) {
				this._oTransport.setEnabled(true);
			}
		}

		return this;
	};

	/**
	 * The LREP object for which as transport request has to be selected.
	 * The property can only be set once and afterwards it cannot be changed.
	 * @param {object} oObject - LREP object for which a transport request has to be selected. The object has the attributes name, namespace, and type
	 *
	 * @public
	 */
	TransportDialog.prototype.setLrepObject = function(oObject) {
		if (oObject && !this.getProperty("lrepObject")) {
			this.setProperty("lrepObject", oObject);
		}

		return this;
	};

	/**
	 * Flag indicating whether the selection of an ABAP package is to be hidden or not.
	 * @param {boolean} bHide - If set to <code>true</code>, the package selection is hidden
	 *
	 * @public
	 */
	TransportDialog.prototype.setHidePackage = function(bHide) {
		//set the property itself.
		this.setProperty("hidePackage", bHide);

		//toggle package visibility.
		this._oPackageListItem.setVisible(!bHide);

		if (bHide) {
			//set the local object button to enabled,
			//as the end-user might want to "just" save the object without selecting a transport.
			this.getButtons()[0].setEnabled(bHide);

			//correct the title.
			this.setTitle(this._oResources.getText("TRANSPORT_DIALOG_TITLE_SIMPLE"));
		}

		return this;
	};

	return TransportDialog;
}, /* bExport= */ true);