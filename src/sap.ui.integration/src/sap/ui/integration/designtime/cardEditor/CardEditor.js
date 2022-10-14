/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/restricted/_CancelablePromise",
	"sap/base/util/restricted/_isEqual",
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_castArray",
	"sap/base/util/deepEqual",
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/base/util/deepClone",
	"sap/base/util/ObjectPath",
	"sap/base/util/isEmptyObject",
	"sap/ui/integration/designtime/baseEditor/BaseEditor",
	"sap/ui/integration/util/CardMerger",
	"sap/ui/thirdparty/jquery",
	"./config/index"
], function (
	CancelablePromise,
	_isEqual,
	_omit,
	_castArray,
	deepEqual,
	each,
	merge,
	deepClone,
	ObjectPath,
	isEmptyObject,
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
			library: "sap.ui.integration",
			properties: {
				layout: {
					type: "string",
					defaultValue: "form"
				},

				designtimeChanges: {
					type: "array",
					defaultValue: []
				},

				/**
				 * Defines the base URL of the Card Manifest.
				 * @since 1.83
				 */
				baseUrl: {
					type: "sap.ui.core.URI",
					defaultValue: null
				},

				/**
				 * @inheritDoc
				 */
				"config": {
					type: "object",
					defaultValue: {
						"i18n": [].concat(
							BaseEditor.getMetadata().getProperty("config").getDefaultValue().i18n,
							"sap/ui/integration/designtime/cardEditor/i18n/i18n.properties"
						)
					}
				}
			}
		},
		constructor: function (mParameters) {
			mParameters = mParameters || {};
			BaseEditor.prototype.constructor.apply(this, arguments);

			this.setPreventInitialization(true);
			if (!mParameters["config"]) {
				this.addConfig(oDefaultCardConfig, true);
			}
		},
		renderer: BaseEditor.getMetadata().getRenderer()
	});

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
			this.setPreventInitialization(true);
			this._bDesigntimeInit = true;
			this._bCardId = sCardId;
			//handle designtime keyword removal
			var sDesigntimePath = sanitizePath(ObjectPath.get(["sap.card", "configuration", "editor"], oJson) || "");
			if (sDesigntimePath === "") {
				sDesigntimePath = sanitizePath(ObjectPath.get(["sap.card", "designtime"], oJson) || "");
			}
			var sBaseUrl = sanitizePath(this.getBaseUrl() || "");

			if (sBaseUrl && sDesigntimePath) {
				var mPaths = {};
				var sSanitizedBaseUrl = sanitizePath(sBaseUrl);
				var sDesigntimeRelativePath = trimCurrentFolderPrefix(sDesigntimePath);
				var sDesigntimeAbsolutePath = sSanitizedBaseUrl + "/" + sDesigntimeRelativePath;
				var sNamespace = sCardId.replace(/\./g, "/") + "/" + sDesigntimeRelativePath;
				mPaths[sNamespace] = sDesigntimeAbsolutePath;
				sap.ui.loader.config({
					paths: mPaths
				});
				var sEditorConfigModule = sNamespace + "/editor.config";
				var sI18nModule = sNamespace + "/i18n/i18n.properties";
				var sDesigntimeMetadataPath = sDesigntimeAbsolutePath + "/metadata.json";

				this._oDesigntimePromise = new CancelablePromise(function (fnResolve) {
					Promise.all([
						new Promise(function (fnResolveEditorConfig) {
							sap.ui.require(
								[sEditorConfigModule],
								fnResolveEditorConfig,
								function () {
									fnResolveEditorConfig({}); // if editor.config.js doesn't exist
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
					this.setPreventInitialization(false);

					// Metadata
					var oDesigntimeMetadata = aDesigntimeFiles[1];
					oDesigntimeMetadata = CardMerger.mergeCardDesigntimeMetadata(oDesigntimeMetadata, this.getDesigntimeChanges());

					this._oInitialDesigntimeMetadata = oDesigntimeMetadata;
					this.setDesigntimeMetadata(formatImportedDesigntimeMetadata(oDesigntimeMetadata), true);

					// Editor config
					var oConfig = aDesigntimeFiles[0];

					if (isEmptyObject(oConfig)) {
						this.addConfig({
							"i18n": sI18nModule
						});
					} else {
						oConfig = merge({}, oConfig);
						oConfig.i18n = oConfig.i18n ? _castArray(oConfig.i18n) : [];
						oConfig.i18n.push(sI18nModule);
						this._addSpecificConfig(oConfig);
					}
				}.bind(this));
			} else {
				this.setPreventInitialization(false);
				this.addConfig({});
			}
		}
	};

	CardEditor.prototype.setDesigntimeChanges = function (aDesigntimeChanges) {
		if (this._oInitialDesigntimeMetadata) {
			throw Error("Designtime Changes can only be set initially");
		}

		this.setProperty("designtimeChanges", aDesigntimeChanges);
	};

	function formatImportedDesigntimeMetadata(oFlatMetadata) {
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

	return CardEditor;
});
