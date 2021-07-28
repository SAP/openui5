
/*!
 * ${copyright}
 */
/* global XMLHttpRequest */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/fl/write/_internal/fieldExtensibility/cap/editor/getEditorConfig",
	"sap/base/util/ObjectPath",
	"sap/base/util/deepClone",
	"sap/ui/model/resource/ResourceModel"
], function(
	ManagedObject,
	Fragment,
	MessageToast,
	getEditorConfig,
	ObjectPath,
	deepClone,
	ResourceModel
) {
	"use strict";

	var oTextBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl");

	function setupEditor(oDialog, oInitialJson, oCustomConfig) {
		var oEditor = oDialog.getContent()[0];
		oEditor.setJson(deepClone(oInitialJson));
		oEditor.setConfig(getEditorConfig(oCustomConfig));
		return oEditor;
	}

	function prepareJsonOutput(oOriginalJson) {
		if (!oOriginalJson) {
			return {};
		}
		var oJson = deepClone(oOriginalJson);

		// Format enum input validation
		var vRange = ObjectPath.get(["@assert.range"], oJson);
		if (
			oJson.type === "cds.String"
			&& Array.isArray(vRange)
		) {
			ObjectPath.set(["enum"], vRange.reduce(function (enumMap, enumOption) {
				enumMap[enumOption] = {};
				return enumMap;
			}, {}), oJson);
			ObjectPath.set(["@assert.range"], true, oJson);
		}

		// Flatten additional annotations
		if (oJson.annotations) {
			oJson = Object.assign({}, oJson, oJson.annotations);
			delete oJson.annotations;
		}

		return oJson;
	}

	/**
	 * @extends sap.ui.base.ManagedObject
	 * @alias sap.ui.fl.write._internal.fieldExtensibility.cap.dialog.CustomFieldCAPDialog
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.93
	 * @experimental Since 1.93
	 * @private
	 * @ui5-restricted
	 */
	var CustomFieldCAPDialog = ManagedObject.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.dialog.CustomFieldCAPDialog", {
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
		var oInitialJson = {
			name: "NewField",
			type: "cds.String",
			entityType: mEntitySetInformation.boundEntitySet.$Type
		};

		var oDialog = this.getProperty("_dialog");
		if (oDialog) {
			this._oEditor.setJson(deepClone(oInitialJson));
			oDialog.open();
		} else {
			Fragment.load({
				name: "sap.ui.fl.write._internal.fieldExtensibility.cap.dialog.CustomFieldCAPDialog",
				controller: this
			}).then(function(oAddCustomFieldCAPDialog) {
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
					this._oJson = prepareJsonOutput(oEvent.getParameter("json"));
				}.bind(this));
				oAddCustomFieldCAPDialog.open();
			}.bind(this));
		}
	};

	CustomFieldCAPDialog.prototype.exit = function() {
		var oDialog = this.getProperty("_dialog");
		if (oDialog) {
			oDialog.destroy();
		}
		if (this.oEditor) {
			this.oEditor.destroy();
		}
	};

	CustomFieldCAPDialog.prototype.onSave = function() {
		var oPayload = {
			definition: JSON.stringify(this._oJson)
		};

		var oAddFieldPromise = new Promise(function(resolve, reject) {
			var oXhr = new XMLHttpRequest();
			oXhr.open("POST", "http://localhost:4004/extensibility/addField");
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