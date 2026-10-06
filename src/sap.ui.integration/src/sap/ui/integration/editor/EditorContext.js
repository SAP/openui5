/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/util/Utils"
], function (
	Log,
	JSONModel,
	Utils
) {
	"use strict";

	var CONTEXT_TIMEOUT = 5000;

	/**
	 * Context model helper for the Editor control.
	 * Contains methods for creating and managing the host context model,
	 * merging context data, and pre-fetching context values referenced in designtime.
	 *
	 * @namespace
	 * @alias sap.ui.integration.editor.EditorContext
	 * @static
	 * @private
	 */
	var EditorContext = {};

	/**
	 * Recursively flattens a nested context data object into a flat array of path/value entries.
	 *
	 * @param {object} oData
	 * @param {string} s the key that marks a leaf node (e.g. "label")
	 * @param {Array} a accumulator array
	 * @param {string} path current path prefix
	 * @returns {Array}
	 */
	EditorContext._flattenData = function (oData, s, a, path) {
		path = path || "";
		a = a || [];
		if (typeof oData === "object") {
			if (!oData[s]) {
				for (var n in oData) {
					EditorContext._flattenData(oData[n], s, a, path + "/" + n);
				}
			} else {
				//found leave
				if (oData.type) {
					a.push({
						path: oData.pathvalue || path.substring(1),
						value: oData.pathvalue || "{context>" + path.substring(1) + "/value}",
						object: oData
					});
				} else {
					a.push({
						path: path.substring(1),
						object: oData
					});
					for (var n in oData) {
						EditorContext._flattenData(oData[n], s, a, path + "/" + n);
					}
				}
			}
		}
		return a;
	};

	/**
	 * Creates and registers the "context" and "contextflat" named models on the editor.
	 * Asynchronously loads context data from the host and patches the context model's
	 * getProperty to lazily resolve "/value" paths via the host.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oContextEntries static context entries for the editor class (CONTEXT_ENTRIES)
	 * @param {string} sInternalKey the key used for the editor-internal context entry
	 */
	EditorContext.createContextModel = function (oEditor, oContextEntries, sInternalKey) {
		var oHost = oEditor.getHostInstance(),
			oContextModel = new JSONModel({}),
			oFlatContextModel = new JSONModel([]);

		//add the models in any case
		oEditor.setModel(oContextModel, "context");
		oEditor.setModel(oFlatContextModel, "contextflat");
		oContextModel._aPendingPromises = [];
		oFlatContextModel._getPathObject = function (sPath) {
			var a = this.getData().filter(function (o) {
				if (o.path === sPath) {
					return true;
				}
			});
			return a.length ? a[0] : null;
		};
		oFlatContextModel._getValueObject = function (sValue) {
			var a = this.getData() || [];
			a = a.filter(function (o) {
				if (o.value === sValue || o.object.value === sValue) {
					return true;
				}
			});
			return a.length ? a[0] : null;
		};
		var oContextDataPromise = new Promise(function (resolve, reject) {
			if (oHost && oHost.getContext) {
				var bResolved = false;
				setTimeout(function () {
					if (bResolved) {
						return;
					}
					Log.error("sap.ui.integration.editor.Editor: context could not be determined with " + CONTEXT_TIMEOUT + ".");
					bResolved = true;
					resolve({});
				}, CONTEXT_TIMEOUT);
				oHost.getContext().then(function (oContextData) {
					if (bResolved) {
						Log.error("sap.ui.integration.editor.Editor: context returned after more than " + CONTEXT_TIMEOUT + ". Context is ignored.");
					}
					bResolved = true;
					resolve(oContextData || {});
				});
			} else {
				resolve({});
			}
		});

		//get the context from the host
		oContextDataPromise.then(function (oContextData) {
			var oData = EditorContext._mergeContextData(oContextData, oContextEntries, sInternalKey);
			oContextModel.setData(oData);
			oFlatContextModel.setData(EditorContext._flattenData(oData, "label"));
		});

		//async update of the value via host call
		oContextModel.getProperty = function (sPath, oContext) {
			if (sPath && !sPath.startsWith("/") && !oContext) {
				sPath = "/" + sPath;
			}
			var sAbsolutePath = this.resolve(sPath, oContext),
				pGetProperty;
			if (sAbsolutePath.endsWith("/value")) {
				this._mValues = this._mValues || {};
				if (this._mValues.hasOwnProperty(sAbsolutePath)) {
					return this._mValues[sAbsolutePath];
					//when should this be invalidated?
				}
				this._mValues[sAbsolutePath] = undefined;
				// ask the host and timeout if it does not respond
				pGetProperty = Utils.timeoutPromise(oHost.getContextValue(sAbsolutePath.substring(1)));
				pGetProperty = pGetProperty.then(function (vValue) {
						this._mValues[sAbsolutePath] = vValue;
						this.checkUpdate();
					}.bind(this))
					.catch(function (sReason) {
						this._mValues[sAbsolutePath] = null;
						this.checkUpdate();
						Log.error("sap.ui.integration.editor.Editor: path " + sAbsolutePath + " could not be resolved. Reason: " + sReason);
					}.bind(this));

				this._aPendingPromises.push(pGetProperty);
				return undefined;
			} else {
				//resolve dt data locally
				return JSONModel.prototype.getProperty.apply(this, arguments);
			}
		};
	};

	/**
	 * Builds the static context entries object for the editor.
	 *
	 * @param {sap.base.i18n.ResourceBundle} oResourceBundle the editor's resource bundle
	 * @returns {object}
	 */
	EditorContext.initContextEntries = function (oResourceBundle) {
		return {
			empty: {
				label: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_VAL"),
				type: "string",
				description: oResourceBundle.getText("EDITOR_CONTEXT_EMPTY_DESC"),
				placeholder: "",
				value: ""
			},
			"editor.internal": {
				label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_INTERNAL_VAL"),
				todayIso: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_TODAY_VAL"),
					customize: ["format.dataTime"],
					value: "{{parameters.TODAY_ISO}}"
				},
				nowIso: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_DESC"),
					tags: [],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_NOW_VAL"),
					customize: ["dateFormatters"],
					value: "{{parameters.NOW_ISO}}"
				},
				currentLanguage: {
					type: "string",
					label: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					description: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					tags: ["technical"],
					customize: ["languageFormatters"],
					placeholder: oResourceBundle.getText("EDITOR_CONTEXT_EDITOR_LANG_VAL"),
					value: "{{parameters.LOCALE}}"
				}
			}
		};
	};

	/**
	 * Merges host-supplied context data with the editor's static context entries.
	 *
	 * @param {object} oContextData raw data from the host
	 * @param {object} oContextEntries static context entries for the editor class (CONTEXT_ENTRIES)
	 * @param {string} sInternalKey the key used for the editor-internal context entry
	 * @returns {object}
	 */
	EditorContext._mergeContextData = function (oContextData, oContextEntries, sInternalKey) {
		var oData = {};
		//empty entry
		oData["empty"] = oContextEntries.empty;
		//custom entries
		for (var n in oContextData) {
			oData[n] = oContextData[n];
		}
		//editor internal
		oData[sInternalKey] = oContextEntries[sInternalKey];
		return oData;
	};

	/**
	 * Pre-fetches all context values referenced in the designtime configuration so that
	 * they are available synchronously when the editor fields are built.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @returns {Promise}
	 */
	EditorContext.loadValueContextInDesigntime = function (oEditor) {
		var oContextModel = oEditor.getModel("context");
		var oSettings = oEditor._oDesigntimeInstance.getSettings();
		var sItemsString;
		if (oSettings && oSettings.form && oSettings.form.items) {
			sItemsString = JSON.stringify(oSettings.form.items);
		}
		if (sItemsString) {
			var contextParamRegExp = /\{context\>[\/?\w+.]+\}/g;
			var aResult = sItemsString.match(contextParamRegExp);
			var aContextEntries;
			if (aResult && aResult.length > 0) {
				// only value context need to load
				aResult = aResult.filter(function (sResult) {
					return sResult.endsWith("value}");
				});
				aContextEntries = aResult.map(function (sResult) {
					return sResult.substring(9, sResult.length - 1);
				});
				aContextEntries.forEach(function (sContextEntry) {
					oContextModel.getProperty(sContextEntry);
				});
				return Promise.all(oContextModel._aPendingPromises).then(function () {
					oContextModel._aPendingPromises = [];
				});
			}
		}
		return Promise.resolve();
	};

	return EditorContext;

});
