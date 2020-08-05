/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/restricted/_CancelablePromise",
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_toArray",
	"sap/base/util/deepEqual",
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/base/util/deepClone",
	"sap/base/util/ObjectPath",
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/integration/util/CardMerger",
	"sap/ui/thirdparty/jquery",
	"./config/index"
], function(
	CancelablePromise,
	_isEqual,
	_omit,
	_toArray,
	deepEqual,
	each,
	merge,
	deepClone,
	ObjectPath,
	BaseEditor,
	CardMerger,
	jQuery,
	oDefaultCardConfig
) {
	"use strict";

	/**
	 * @constructor
	 * @private
	 * @experimental
	 */
	var CardEditor = BaseEditor.extend("sap.ui.integration.designtime.cardEditor.CardEditor", {
		metadata: {
			properties: {
				layout: {
					type: "string",
					defaultValue: "form"
				},
				designtimeChanges: {
					type: "array",
					defaultValue: []
				}
			}
		},
		constructor: function (mParameters) {
			mParameters = mParameters || {};
			BaseEditor.prototype.constructor.apply(this, arguments);
			if (!mParameters["config"]) {
				this.addConfig(oDefaultCardConfig, true);
			}
		},
		renderer: BaseEditor.getMetadata().getRenderer()
	});

	function addValueToDiff(oDiff, sObjectName, sName, sKey, vValue) {
		if (!oDiff[sObjectName]) {
			oDiff[sObjectName] = {};
		}
		if (!oDiff[sObjectName][sName]) {
			oDiff[sObjectName][sName] = {};
		}
		oDiff[sObjectName][sName][sKey] = vValue;
	}

	function getCardConfigurationDeltaForChange(oJson, oInitialJson) {
		var sNamespace = oJson.hasOwnProperty("sap.card") ? "sap.card" : "sap.widget";
		var oConfiguration = ObjectPath.get([sNamespace, "configuration"], oJson);
		var oInitialConfiguration = ObjectPath.get([sNamespace, "configuration"], oInitialJson);

		if (deepEqual(oConfiguration, oInitialConfiguration)) {
			return undefined;
		}

		var oDiff = {};

		each(oConfiguration, function(sObjectName, oObject) {
			each(oObject, function(sName, oSubObject) {
				if (!oInitialConfiguration[sObjectName][sName]) {
					oDiff[sObjectName] = oDiff[sObjectName] || {};
					oDiff[sObjectName][sName] = oSubObject;
				} else {
					each(oSubObject, function(sKey, oValue) {
						if (oInitialConfiguration[sObjectName][sName][sKey] !== oValue) {
							addValueToDiff(oDiff, sObjectName, sName, sKey, oValue);
						}
					});
				}
			});
		});

		return {
			configuration: oDiff
		};
	}

	CardEditor.prototype.init = function () {
		BaseEditor.prototype.init.apply(this, arguments);
		this.attachJsonChange(function (oEvent) {
			if (!this._oInitialJson) {
				this._oInitialJson = oEvent.getParameter("json");
			}
		}, this);

	};

	CardEditor.prototype.setJson = function () {
		BaseEditor.prototype.setJson.apply(this, arguments);

		var oJson = this.getJson();
		var sCardId = ObjectPath.get(["sap.app", "id"], oJson);

		if (this._bDesigntimeInit && this._bCardId !== sCardId) {
			if (this._oDesigntimePromise) {
				this._oDesigntimePromise.cancel();
			}
			delete this._bCardId;
			delete this._bDesigntimeInit;
		}

		if (!this._bDesigntimeInit) {
			this._bDesigntimeInit = true;
			this._bCardId = sCardId;
			var sDesigntimePath = sanitizePath(ObjectPath.get(["sap.card", "designtime"], oJson) || "");
			var sBaseUrl = sanitizePath(ObjectPath.get(["baseURL"], oJson) || "");

			if (sBaseUrl && sDesigntimePath) {
				var mPaths = {};
				var sSanitizedBaseUrl = sanitizePath(sBaseUrl);
				mPaths[sCardId] = sSanitizedBaseUrl;
				sap.ui.loader.config({
					paths: mPaths
				});
				var sDesigntimeFolderPath = trimCurrentFolderPrefix(sDesigntimePath);
				var sDesigntimePrefix = sCardId + "/" + sDesigntimeFolderPath;
				var sEditorConfigPath = sDesigntimePrefix + "/editor.config";
				var sDesigntimeMetadataPath = sSanitizedBaseUrl + "/" + sDesigntimeFolderPath + "/metadata.json";

				this._oDesigntimePromise = new CancelablePromise(function (fnResolve) {
					Promise.all([
						new Promise(function (fnResolveEditorConfig) {
							sap.ui.require(
								[sEditorConfigPath],
								fnResolveEditorConfig,
								function () {
									return {}; // if editor.config.js doesn't exist
								}
							);
						}),
						new Promise(function (fnResolveMetadata) {
							jQuery.getJSON(sDesigntimeMetadataPath)
								.done(fnResolveMetadata)
								.fail(function () {
									fnResolveMetadata({});
								});
						})
					]).then(fnResolve);
				});

				this._oDesigntimePromise.then(function (aDesigntimeFiles) {
					// Editor config
					var oConfig = merge({}, aDesigntimeFiles[0]);
					oConfig.i18n = _toArray(oConfig.i18n);
					oConfig.i18n.push(sDesigntimePrefix + "/i18n.properties");
					this._addSpecificConfig(merge({}, oConfig));

					// Metadata
					var oDesigntimeMetadata = aDesigntimeFiles[1];
					oDesigntimeMetadata = CardMerger.mergeCardDesigntimeMetadata(oDesigntimeMetadata, this.getDesigntimeChanges());

					this._oInitialDesigntimeMetadata = oDesigntimeMetadata;
					this.setDesigntimeMetadata(formatImportedDesigntimeMetadata(oDesigntimeMetadata), true);
				}.bind(this));
			}
		}
	};

	CardEditor.prototype.setDesigntimeChanges = function(aDesigntimeChanges) {
		if (this._oInitialDesigntimeMetadata) {
			throw Error("Designtime Changes can only be set initially");
		}

		this.setProperty("designtimeChanges", aDesigntimeChanges);
	};

	function formatImportedDesigntimeMetadata (oFlatMetadata) {
		var oFormattedMetadata = {};
		Object.keys(oFlatMetadata).forEach(function (sPath) {
			ObjectPath.set(sPath.split("/"), { __value: deepClone(oFlatMetadata[sPath]) }, oFormattedMetadata);
		});
		return oFormattedMetadata;
	}

	function sanitizePath(sPath) {
		return sPath.trim().replace(/\/*$/, "");
	}

	function trimCurrentFolderPrefix(sPath) {
		return sPath.replace(/^\.\//, "");
	}

	/**
	 * Returns a promise with a runtime change and a designtime change
	 *
	 * @param {object} oPropertyBag - Property bag
	 * @param {String} oPropertyBag.layer - Layer of the Change
	 * @returns {Promise<object>} Promise with both designtime and runtime change
	 */
	CardEditor.prototype.getChanges = function(oPropertyBag) {
		return Promise.all([
			this.getDeltaChangeDefinition(oPropertyBag)
				.catch(function() {
					return;
				}),
			this.getDesigntimeChangeDefinition(oPropertyBag)
				.catch(function() {
					return;
				})
		])
			.then(function(aChanges) {
				if (aChanges[0] === undefined && aChanges[1] === undefined) {
					return Promise.reject("No changes");
				}

				return {
					runtimeChange: aChanges[0],
					designtimeChange: aChanges[1]
				};
			});
	};

	function createChangeDefinition(mParameters) {
		return new Promise(function(resolve) {
			sap.ui.require(["sap/ui/fl/Change"], function(Change) {
				var oChangeDefinition = Change.createInitialFileContent(mParameters);
				// by default the function createInitialFileContent sets the creation to ""
				oChangeDefinition.creation = new Date().toISOString();
				resolve(oChangeDefinition);
			});
		});
	}

	/**
	 * @param {object} oPropertyBag - Property bag
	 * @param {String} oPropertyBag.layer - Layer of the Change
	 * @returns {Promise<object>} Promise with the change definition for the designtime delta change
	 */
	CardEditor.prototype.getDesigntimeChangeDefinition = function(oPropertyBag) {
		var aChanges = [];
		var oOldValue = Object.assign({}, this._oInitialDesigntimeMetadata);
		var oNewValue = this._formatExportedDesigntimeMetadata(this.getDesigntimeMetadata());
		each(oNewValue, function(sKey, vValue) {
			if (oOldValue.hasOwnProperty(sKey)) {
				if (!_isEqual(oOldValue[sKey], vValue)) {
					aChanges.push({
						propertyPath: sKey,
						operation: "UPDATE",
						propertyValue: vValue
					});
				}
				delete oOldValue[sKey];
			} else {
				aChanges.push({
					propertyPath: sKey,
					operation: "INSERT",
					propertyValue: vValue
				});
			}
		});

		each(oOldValue, function(sKey) {
			aChanges.push({
				propertyPath: sKey,
				operation: "DELETE"
			});
		});

		if (!aChanges.length) {
			return Promise.reject("No Change");
		}

		this._oInitialDesigntimeMetadata = oNewValue;

		var oCurrentJson = this.getJson();
		var mParameters = merge({}, _omit(oPropertyBag, ["oldValue", "newValue"]));
		mParameters.content = {
			entityPropertyChange: aChanges
		};
		mParameters.changeType = "appdescr_card_designtime";
		mParameters.generator = "CardEditor";
		mParameters.selector = {};
		mParameters.reference = ObjectPath.get(["sap.app", "id"], oCurrentJson);

		return createChangeDefinition(mParameters);
	};

	/**
	 *
	 * @param {Object} oPropertyBag - Property bag
	 * @param {String} oPropertyBag.layer - Layer of the Change
	 * @returns {Promise<object>} Promise with the change definition for the current delta changes
	 */
	CardEditor.prototype.getDeltaChangeDefinition = function(oPropertyBag) {
		var oCurrentJson = this.getJson();
		var mParameters = merge({}, oPropertyBag);
		mParameters.content = getCardConfigurationDeltaForChange(oCurrentJson, this._oInitialJson);

		if (!mParameters.content) {
			return Promise.reject("No Change");
		}

		this._oInitialJson = oCurrentJson;
		mParameters.changeType = oCurrentJson.hasOwnProperty("sap.card") ? "appdescr_card" : "appdescr_widget";
		mParameters.generator = "CardEditor";
		mParameters.selector = {};
		mParameters.reference = ObjectPath.get(["sap.app", "id"], oCurrentJson);

		return createChangeDefinition(mParameters);
	};

	return CardEditor;
});
