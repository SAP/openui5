
/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/m/MessageToast",
	"sap/ui/fl/write/_internal/fieldExtensibility/cap/editor/getEditorConfig",
	"sap/base/util/ObjectPath",
	"sap/base/util/deepClone",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel"
], function(
	ManagedObject,
	Fragment,
	Lib,
	MessageToast,
	getEditorConfig,
	ObjectPath,
	deepClone,
	ResourceModel,
	JSONModel
) {
	"use strict";

	const oTextBundle = Lib.getResourceBundleFor("sap.ui.fl");

	function setupEditor(oDialog, oInitialJson, oCustomConfig) {
		const oEditor = oDialog.getContent()[0];
		oEditor.setJson(deepClone(oInitialJson));
		oEditor.setConfig(getEditorConfig(oCustomConfig));
		return oEditor;
	}

	function prepareJsonOutput(oOriginalJson) {
		if (!oOriginalJson || !oOriginalJson.element) {
			return {};
		}
		const oJson = deepClone(oOriginalJson);

		// Set label
		if (!ObjectPath.get(["element", "@Common.Label"], oJson)) {
			const sName = ObjectPath.get(["element", "name"], oJson);
			ObjectPath.set(["element", "@Common.Label"], sName, oJson);
		}

		// Format enum input validation
		const vRange = ObjectPath.get(["element", "@assert.range"], oJson);
		if (
			ObjectPath.get(["element", "type"], oJson) === "cds.String"
			&& Array.isArray(vRange)
		) {
			ObjectPath.set(["element", "enum"], vRange.reduce(function(enumMap, enumOption) {
				enumMap[enumOption] = {};
				return enumMap;
			}, {}), oJson);
			ObjectPath.set(["element", "@assert.range"], true, oJson);
		}

		// Flatten additional annotations
		if (oJson.element.annotations) {
			oJson.element = { ...oJson.element, ...oJson.element.annotations };
			delete oJson.element.annotations;
		}

		// Format CSN extension
		const oCsnOutput = {
			extend: oJson.extend,
			elements: {}
		};
		oCsnOutput.elements[oJson.element.name] = oJson.element;

		return oCsnOutput;
	}

	/**
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.fl.write._internal.fieldExtensibility.cap.dialog.CustomFieldCAPDialog
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.93
	 * @private
	 * @ui5-restricted
	 */
	const CustomFieldCAPDialog = ManagedObject.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.dialog.CustomFieldCAPDialog", {
		metadata: {
			library: "sap.ui.fl",
			properties: {
				_dialog: {
					type: "sap.m.Dialog",
					visibility: "hidden"
				}
			}
		}
	});

	CustomFieldCAPDialog.prototype.open = function(mEntitySetInformation, sRtaStyleClassName) {
		const oInitialJson = {
			element: {
				name: "NewField",
				type: "cds.String"
			},
			extend: mEntitySetInformation.boundEntitySet.$Type
		};

		const oDialog = this.getProperty("_dialog");
		if (oDialog) {
			this._oEditor.setJson(deepClone(oInitialJson));
			oDialog.open();
		} else {
			Fragment.load({
				name: "sap.ui.fl.write._internal.fieldExtensibility.cap.dialog.CustomFieldCAPDialog",
				controller: this
			}).then(function(oAddCustomFieldCAPDialog) {
				this._oDialogModel = new JSONModel({
					isValid: true
				});
				this._oDialogModel.setDefaultBindingMode("OneWay");
				oAddCustomFieldCAPDialog.setModel(this._oDialogModel, "dialog");
				oAddCustomFieldCAPDialog.setModel(new ResourceModel({
					bundle: oTextBundle
				}), "i18n");
				oAddCustomFieldCAPDialog.addStyleClass(sRtaStyleClassName);
				this.setProperty("_dialog", oAddCustomFieldCAPDialog);
				this._oJson = deepClone(oInitialJson);
				this._oEditor = setupEditor(oAddCustomFieldCAPDialog, this._oJson, {
					entityTypes: mEntitySetInformation.entityTypes
				});
				this._oEditor.attachJsonChange(function(oEvent) {
					this._oJson = oEvent.getParameter("json");
				}.bind(this));
				this._oEditor.attachValidationErrorChange(function(oEvent) {
					const bHasError = oEvent.getParameter("hasError");
					this._oDialogModel.setData({
						isValid: !bHasError
					});
				}.bind(this));
				oAddCustomFieldCAPDialog.open();
			}.bind(this));
		}
	};

	CustomFieldCAPDialog.prototype.exit = function() {
		const oDialog = this.getProperty("_dialog");
		if (oDialog) {
			oDialog.destroy();
		}
		if (this.oEditor) {
			this.oEditor.destroy();
		}
	};

	CustomFieldCAPDialog.prototype.onSave = function() {
		const oCsnOutput = prepareJsonOutput(this._oJson);
		const oPayload = {
			extensions: [JSON.stringify(oCsnOutput)]
		};

		const oAddFieldPromise = new Promise(function(resolve, reject) {
			const oXhr = new XMLHttpRequest();
			oXhr.open("POST", "/-/cds/extensibility/addExtension");
			oXhr.setRequestHeader("Content-Type", "application/json");
			oXhr.onload = function() {
				if (oXhr.status >= 200 && oXhr.status < 400) {
					resolve(oXhr.response);
				} else {
					reject({
						status: oXhr.status,
						message: oXhr.statusText
					});
				}
			};
			oXhr.send(JSON.stringify(oPayload));
		});

		oAddFieldPromise.then(function() {
			MessageToast.show(oTextBundle.getText("CAP_ADD_FIELD_SUCCESS"));
		});

		this.getProperty("_dialog").close();
	};

	CustomFieldCAPDialog.prototype.onCancel = function() {
		this.getProperty("_dialog").close();
	};

	return CustomFieldCAPDialog;
});