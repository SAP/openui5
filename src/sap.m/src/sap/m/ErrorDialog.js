/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', './Dialog', './Button', './Label', './TextArea', './library'],
	function(jQuery, Dialog, Button, Label, TextArea, library) {
	"use strict";

	/**
	 * Constructor for a new ErrorDialog.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * An ErrorDialog is a dialog containing error information and a close button.
	 *
	 * The error information is displayed in a textarea and is mostly the stack-trace of the error.
	 * The textarea can be hidden and shown.
	 *
	 * This control is used by the global error handler when window.onerror is invoked by an unchecked exception.
	 *
	 * @author Jonathan Brink (Jonathan.Brink@sas.com)
	 * @version ${version}
	 *
	 * @class
	 * @constructor
	 * @public
	 */
	var ErrorDialog = Dialog.extend("sap.m.ErrorDialog", /** @lends sap.m.ErrorDialog.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * The error text that appears in the textarea
				 */
				message: {type: "string", group: "Appearance", defaultValue: ""}
			},
			associations: {
				/**
				 * generic message label ("An error occurred...")
				 */
				label: {type: "sap.m.Label"},

				/**
				 * holds error details (stack-trace, etc)
				 */
				textArea: {type: "sap.m.TextArea"}
			}
		},
		renderer: {}
	});

	/**
	 * Initializes the control
	 * @private
	 */
	ErrorDialog.prototype.init = function () {
		var self = this,
			sId = this.getId(),
			bundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			oTextArea = new TextArea({
				id: sId + "-textarea",
				editable: false,
				visible: false,
				width: "100%",
				rows: 10
			}),
			oBeginButton = new Button({
				id: sId + "-beginButton",
				text: bundle.getText("MSGBOX_CLOSE"),
				press: function() {
					self.close();
				}
			}),
			oEndButton = new Button({
				id: sId + "-endButton",
				text: bundle.getText("ERRORDIALOG_SHOW"),
				press: function() {
					self._toggleTextarea();
				}
			}),
			oGenericMessageLabel = new Label({
				id: sId + "-genericMessageLabel",
				text: bundle.getText("ERRORDIALOG_GENERICMESSAGE")
			});

		// invoke super function
		if (Dialog.prototype.init) {
			Dialog.prototype.init.apply(this, arguments);
		}

		// set title of ErrorDialog
		this.setTitle(window.__sap.title || bundle.getText("ERRORDIALOG_TITLE"));

		// add sub-controls to ErrorDialog
		this.addContent(oGenericMessageLabel);
		this.addContent(oTextArea);
		this.setBeginButton(oBeginButton);
		this.setEndButton(oEndButton);

		// keep references to sub-controls in associations
		this.setLabel(oGenericMessageLabel);
		this.setTextArea(oTextArea);

		this.addStyleClass("sapMErrorDialog");

		this.attachAfterClose(function() {
			self.destroy();
		});

		this.setState(sap.ui.core.ValueState.Error);
	};

	/**
	 * Overridden setter for "message" property.
	 * Pass message to textarea
	 * @param {string} sMessage The message that will be displayed in the textarea
	 * @public
	 */
	ErrorDialog.prototype.setMessage = function(sMessage) {
		var oTextArea = sap.ui.getCore().byId(this.getTextArea());
		this.setProperty("message", sMessage, true);
		oTextArea.setValue(sMessage);
	};

	/**
	 * Toggle visibility of textarea.
	 * @private
	 */
	ErrorDialog.prototype._toggleTextarea = function() {
		var bundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			oTextArea = sap.ui.getCore().byId(this.getTextArea()),
			oEndButton = this.getEndButton();

		// toggle visibity and button labels
		if (oTextArea.getVisible() === true) {
			oTextArea.setVisible(false);
			oEndButton.setText(bundle.getText("ERRORDIALOG_SHOW"));
		} else {
			oTextArea.setVisible(true);
			oEndButton.setText(bundle.getText("ERRORDIALOG_HIDE"));
		}
	};

	return ErrorDialog;

}, /* bExport= */ true);
