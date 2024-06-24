/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/core/Fragment",
	"sap/ui/integration/designtime/baseEditor/util/EvalUtils",
	"sap/m/MessageToast"
], function (
	BasePropertyEditor,
	Fragment,
	EvalUtils,
	MessageToast
) {
	"use strict";
	function json2str(o) {
		if (!o) {
			return "";
		}
		var bIsArray = Array.isArray(o);
		var arr = [];
		var fmt = function(s) {
			if (typeof s === "object" && s !== null) {
				return json2str(s);
			}
			if (typeof s === "function") {
				return s.toString().replaceAll("\t", "");
			}
			if (typeof s === "string") {
				return "\"" + s + "\"";
			}
			return s;
		};
		for (var i in o) {
			var m = fmt(o[i]);
			if (!bIsArray) {
				m = "\"" + i + "\": " + m;
			}
			arr.push(m);
		}
		var sResult = arr.join(',');
		if (bIsArray) {
			sResult = "[" + sResult + "]";
		} else {
			sResult = "{" + sResult + "}";
		}
		return sResult;
	}

	/**
	 * @class
	 * Constructor for a new <code>CodeEditor</code>.
	 * This allows to set code text values for a specified property.
	 * The editor is rendered as a {@link sap.ui.CodeEditor} inside a {@link sap.m.Dialog}.
	 * To get notified about changes made with the editor, you can use the <code>attachValueChange</code> method,
	 * which passes the current property state as an object to the provided callback function when the user saves changes in the dialog.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.codeEditor.CodeEditor
	 * @author SAP SE
	 * @since 1.106
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.106
	 * @ui5-restricted
	 */
	var CodeEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.codeEditor.CodeEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.codeEditor.CodeEditor",
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	CodeEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		allowBindings: {
			defaultValue: true,
			mergeStrategy: "mostRestrictiveWins"
		},
		typeLabel: {
			defaultValue: "BASE_EDITOR.TYPES.OBJECT"
		}
	});

	CodeEditor.prototype.setConfig = function (oConfig) {
		BasePropertyEditor.prototype.setConfig.apply(this, arguments);
		this._sCodeType = this.getConfig().codeType ? this.getConfig().codeType : "json";
	};

	CodeEditor.prototype._onLiveChange = function() {
		var oInput = this.getContent();
		if (this._sCodeType === "json") {
			var oJsonValue = this._parseJson(oInput.getValue());
			if (oJsonValue instanceof Error) {
				oInput.setValueState("Error");
				oInput.setValueStateText("Error: " + oJsonValue);
			} else {
				oInput.setValueState("None");
				this.setValue(oJsonValue);
			}
		}
	};

	CodeEditor.prototype._parseJson = function (sJson) {
		try {
			var oParsedJson = JSON.parse(sJson);
			return oParsedJson;
		} catch (vError) {
			return vError;
		}
	};

	CodeEditor.prototype.formatValue = function (vValue) {
		vValue = json2str(vValue);
		return vValue;
	};

	CodeEditor.prototype._openCodeEditor = function () {
		if (this._oDialog) {
			this._oDialog.destroy();
		}
		return Fragment.load({
			name: "sap.ui.integration.designtime.baseEditor.propertyEditor.codeEditor.CodeEditorDialog",
			controller: this
		}).then(function (oDialog) {
			this._oDialog = oDialog;
			this._oEditor = this._oDialog.getContent()[0];
			this._oEditor.getInternalEditorInstance().getSession().on("changeAnnotation", this.onChangeAnnotation.bind(this));
			this._oDialog.attachAfterOpen(function () {
				this._oEditor.getInternalEditorInstance().focus();
				this._oEditor.getInternalEditorInstance().navigateFileEnd();
			}, this);
			this.addDependent(this._oDialog);
			this._openDialog();
			return this._oDialog;
		}.bind(this));
	};

	CodeEditor.prototype._openDialog = function () {
		var sInlineEditorCode = this.getContent().getValue();
		try {
			var sCode = JSON.stringify(JSON.parse(sInlineEditorCode), 0, "\t");
			this._oEditor.setValue(sCode);
		} catch (vError) {
			this._oEditor.setValue(sInlineEditorCode);
		}
		this._oDialog.open();
		this._oEditor.prettyPrint();
	};

	CodeEditor.prototype.onClose = function () {
		this._oCode = null;
		this._oDialog.close();
	};

	CodeEditor.prototype.onBeautify = function () {
		try {
			var sBeautifiedCode = JSON.stringify(JSON.parse(this._oEditor.getValue()), 0, "\t");
			this._oEditor.setValue(sBeautifiedCode);
		} catch (err) {
			this._oEditor.prettyPrint();
		}
	};

	CodeEditor.prototype.onChangeAnnotation = function () {
		if (!this._oDialog.isOpen()) {
			return;
		}
		var oErrors = (this._oEditor.getInternalEditorInstance().getSession().getAnnotations() || []).filter(function (oError) {
			return oError.type === "error";
		});
		if (oErrors.length > 0) {
			this._oDialog.getBeginButton().setEnabled(false);
		} else {
			var sValue = this._oEditor.getInternalEditorInstance().getValue();
			if (sValue && sValue !== "") {
				//TODO: validate js format manually since the value maybe just as "aaa;" which will not be recognized as error by code editor itself
				/*
				if (this._sCodeType === "javascript") {
					try {
						// eslint-disable-next-line no-eval
						eval("(" + sValue + ")");
					} catch (vError) {
						this._oDialog.getBeginButton().setEnabled(false);
						return;
					}
				}*/
				this._oCode = sValue;
			} else {
				this._oCode = undefined;
			}
			this._oDialog.getBeginButton().setEnabled(true);
		}
	};

	CodeEditor.prototype.onSave = function () {
		var oInput = this.getContent();
		if (this._oCode && this._oCode !== "") {
			oInput.setValueState("None");
			if (this._oCode && this._oCode !== "") {
				try {
					if (EvalUtils.isEvalAllowed()) {
						this._oCode = EvalUtils.evalJson(this._oCode);
					} else {
						this._oCode = JSON.parse(this._oCode);
					}
				} catch (vError) {
					MessageToast.show(vError);
					this._oDialog.getBeginButton().setEnabled(false);
					return;
				}
			}
		} else {
			this._oCode = undefined;
		}
		this.setValue(this._oCode);
		this._oDialog.close();
	};

	return CodeEditor;
});
