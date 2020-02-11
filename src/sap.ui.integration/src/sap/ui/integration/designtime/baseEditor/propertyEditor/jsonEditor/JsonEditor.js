/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/core/Fragment"
], function (
	BasePropertyEditor,
	Fragment
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>JsonEditor</code>.
	 * This allows to set json text values for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.ui.CodeEditor} inside a {@link sap.m.Dialog}.
	 * To get notified about changes made with the editor, you can use the <code>attachValueChange</code> method,
	 * which passes the current property state as an object to the provided callback function when the user saves changes in the dialog.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.jsonEditor.JsonEditor
	 * @author SAP SE
	 * @since 1.72
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.72
	 * @ui5-restricted
	 */
	var JsonEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.jsonEditor.JsonEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.jsonEditor.JsonEditor",

		_onLiveChange: function() {
			var oInput = this.getContent();
			var oJsonValue = this._parseJson(oInput.getValue());
			if (oJsonValue instanceof Error) {
				oInput.setValueState("Error");
				oInput.setValueStateText("Error: " + oJsonValue);
			} else {
				oInput.setValueState("None");
				this.setValue(oJsonValue);
			}
		},

		_parseJson: function (sJson) {
			try {
				var oParsedJson = JSON.parse(sJson);
				return oParsedJson;
			} catch (vError) {
				return vError;
			}
		},

		_openJsonEditor: function () {
			if (!this._oDialog) {
				return Fragment.load({
					name: "sap.ui.integration.designtime.baseEditor.propertyEditor.jsonEditor.JsonEditorDialog",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;
					this._oErrorMsg = this._oDialog.getContent()[0];
					this._oEditor = this._oDialog.getContent()[1];
					this._oEditor._getEditorInstance().getSession().on("changeAnnotation", this.onShowError.bind(this));
					this._oDialog.attachAfterOpen(function () {
						this._oEditor._getEditorInstance().focus();
						this._oEditor._getEditorInstance().navigateFileEnd();
					}, this);
					this.addDependent(this._oDialog);
					this._openDialog();
					return this._oDialog;
				}.bind(this));
			} else {
				this._openDialog();
				return Promise.resolve(this._oDialog);
			}
		},

		_openDialog: function () {
			var sInlineEditorCode = this.getContent().getValue();
			try {
				var sCode = JSON.stringify(JSON.parse(sInlineEditorCode), 0, "\t");
				this._oEditor.setValue(sCode);
			} catch (vError) {
				this._oEditor.setValue(sInlineEditorCode);
			}

			this._oDialog.open();
		},

		onClose: function () {
			this._oCode = null;
			this._oDialog.close();
		},

		onBeautify: function () {
			try {
				var sBeautifiedCode = JSON.stringify(JSON.parse(this._oEditor.getValue()), 0, "\t");
				this._oEditor.setValue(sBeautifiedCode);
			} finally {
				return;
			}
		},

		onLiveChange: function (oEvent) {
			try {
				this._oCode = JSON.parse(oEvent.getParameter("value"));
				this._oDialog.getBeginButton().setEnabled(true);
			} catch (err) {
				this._oDialog.getBeginButton().setEnabled(false);
			}
		},

		onShowError: function () {
			var sErrors = (this._oEditor._getEditorInstance().getSession().getAnnotations() || []).map(function (oError) {
				return "Line " + String(oError.row) + ": " + oError.text;
			}).join("\n");
			this._oErrorMsg.setText(sErrors);
			this._oErrorMsg.setVisible(!!sErrors);
		},

		onSave: function () {
			var oInput = this.getContent();
			if (this._oCode) {
				this.setValue(this._oCode);
				oInput.setValueState("None");
				// Explicitly set the value of the inline editor here because
				// the model might not have changed if invalid (unsynchronized) changes
				// are corrected in the editor dialog
				oInput.setValue(JSON.stringify(this._oCode));
			}
			this._oDialog.close();
		},

		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	return JsonEditor;
});
