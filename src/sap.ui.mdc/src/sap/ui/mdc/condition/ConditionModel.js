/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/mdc/condition/ConditionModelPropertyBinding',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/ChangeReason',
		'sap/ui/mdc/condition/FilterOperatorUtil',
		'sap/base/util/merge',
		'sap/base/Log',
		'sap/ui/mdc/condition/Condition',
		'sap/ui/mdc/condition/FilterConverter',
		'sap/ui/core/date/UI5Date'
	],
	(
		ConditionModelPropertyBinding,
		JSONModel,
		ChangeReason,
		FilterOperatorUtil,
		merge,
		Log,
		Condition,
		FilterConverter,
		UI5Date
	) => {
		"use strict";

		/**
		 *
		 * @class JSON based Model for {@link sap.ui.mdc.FilterField FilterField} controls. The model stores the entered values as {@link sap.ui.mdc.condition.ConditionObject ConditionObjects}.
		 * @extends sap.ui.model.json.JSONModel
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.48.0
		 * @alias sap.ui.mdc.condition.ConditionModel
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		const ConditionModel = JSONModel.extend("sap.ui.mdc.condition.ConditionModel", {
			constructor: function() {
				JSONModel.apply(this, arguments);
				this.setSizeLimit(1000);

				if (!this.getProperty("/conditions")) { // might already be initialized in the constructor
					this.setProperty("/conditions", {});
				}
				if (!this.getProperty("/fieldPath")) {
					this.setProperty("/fieldPath", {});
				}
			}
		});

		ConditionModel.prototype.bindProperty = function(sPath, oContext, mParameters) {

			let sEscapedPath = sPath;

			if (sPath.startsWith("/conditions/")) {
				let sFieldPath = sPath.slice(12);
				this._getFieldPathProperty(sFieldPath); // to initialize FieldPath
				sFieldPath = _escapeFieldPath.call(this, sFieldPath);
				sEscapedPath = "/conditions/" + sFieldPath;
			}

			const oBinding = new ConditionModelPropertyBinding(this, sEscapedPath, oContext, mParameters);
			oBinding._sOriginapPath = sPath;
			return oBinding;

		};

		ConditionModel.prototype.getContext = function(sPath) {

			if (sPath.startsWith("/conditions/")) {
				let sFieldPath = sPath.slice(12);
				sFieldPath = _escapeFieldPath.call(this, sFieldPath);
				sPath = "/conditions/" + sFieldPath;
			}

			return JSONModel.prototype.getContext.apply(this, [sPath]);

		};

		ConditionModel.prototype.bindList = function(sPath, oContext, aSorters, aFilters, mParameters) {
			const oBinding = JSONModel.prototype.bindList.apply(this, arguments);
			oBinding.enableExtendedChangeDetection(true); // to force deep compare of data
			return oBinding;
		};

		ConditionModel.prototype.destroy = function() {

			JSONModel.prototype.destroy.apply(this, arguments);
		};


		/**
		 * creates a clone of the <code>ConditionModel</code> which contains the conditions for the <code>sFieldPath</code> parameter
		 * @param {string} sFieldPath specifies which conditions should be copied into the clone. If not specified all conditions will be copied.
		 * @returns {sap.ui.mdc.condition.ConditionModel} instance of new <code>ConditionModel</code>
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.clone = function(sFieldPath) {
			const oCM = new ConditionModel();

			oCM._sName = this._sName + "_clone";

			let oClonedConditions = {};
			if (typeof sFieldPath === "string") {
				const aConditions = this.getConditions(sFieldPath);

				for (const oCondition of aConditions) {
					const sMyFieldPath = _escapeFieldPath.call(this, sFieldPath);
					if (!oClonedConditions[sMyFieldPath]) {
						oClonedConditions[sMyFieldPath] = [];
					}
					oClonedConditions[sMyFieldPath].push(merge({}, oCondition));
				}
			} else {
				oClonedConditions = merge({}, this.getAllConditions());
			}
			oCM.setConditions(oClonedConditions);

			return oCM;
		};

		/**
		 * merge conditions from the source <code>ConditionModel</code> into this instance
		 * @param {string} sFieldPath specifies which conditions should be removed and replaced by the conditions from the source <code>ConditionModel</code>
		 * @param {sap.ui.mdc.condition.ConditionModel} oSourceConditionModel source <code>ConditionModel</code>.
		 * @param {string} sSourceFieldPath specifies which conditions from the source should be merged.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.merge = function(sFieldPath, oSourceConditionModel, sSourceFieldPath) {
			this.removeAllConditions(sFieldPath);
			const oSourceConditions = merge({}, oSourceConditionModel.getAllConditions());
			for (const sMyFieldPath in oSourceConditions) {
				if (!(typeof sSourceFieldPath === "string") || sMyFieldPath === sSourceFieldPath) {
					const aCleanedConditions = Condition._removeEmptyConditions(oSourceConditions[sMyFieldPath]);

					for (const oCondition of aCleanedConditions) {
						this.addCondition(sMyFieldPath, oCondition);
					}
				}
			}

			this.checkUpdate(true, true);
		};



		/**
		 * Returns conditions for a specified <codeFieldPath</code>.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @returns {sap.ui.mdc.condition.ConditionObject[]} array of conditions
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.getConditions = function(sFieldPath) {
			//TODO: only works for simple flat condition model content
			return _getConditions.call(this, sFieldPath);
		};

		function _getConditions(sFieldPath, bCreateIfEmpty) {

			const oConditions = this.getProperty("/conditions");
			let aConditions;

			if (typeof sFieldPath == "string") { // to support empty string
				sFieldPath = _escapeFieldPath.call(this, sFieldPath);
				if (!oConditions[sFieldPath] && bCreateIfEmpty) {
					oConditions[sFieldPath] = [];
				}
				aConditions = oConditions[sFieldPath] || [];
			} else {
				throw new Error("ConditionModel", "getConditions without FieldPath is not supported!");
			}

			return aConditions;
		}

		/**
		 * Returns all conditions.
		 *
		 * @param {string|string[]} vFieldPath fieldPath for that conditions are requested
		 * @returns {object} object with array of conditions for each FieldPath
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.getAllConditions = function(vFieldPath) {

			const oConditions = this.getProperty("/conditions");
			const oResult = {};

			// use unescaped fieldPath for outside
			for (const sMyFieldPath in oConditions) {
				const oFieldPath = this.getProperty("/fieldPath");
				const oFildPathInfo = oFieldPath[sMyFieldPath]; // to get unescaped fieldPath
				const sFieldPath = oFildPathInfo ? oFildPathInfo.fieldPath : sMyFieldPath;

				if (vFieldPath && [].concat(vFieldPath).indexOf(sFieldPath) === -1) {
					continue;
				}
				oResult[sFieldPath] = merge([], oConditions[sMyFieldPath]);
			}

			return oResult;

		};

		/**
		 * Determines the index of a condition for a specified <code>FieldPath</code>.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @param {sap.ui.mdc.condition.ConditionObject} oCondition condition to be searched
		 * @param {function(Object): Object} [fnNormalizeCondition] normalization method for condition comparison
		 * @returns {int} index of condition (-1 if not found)
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.indexOf = function(sFieldPath, oCondition, fnNormalizeCondition) {

			if (typeof sFieldPath !== "string") {
				throw new Error("sFieldPath must be a string " + this);
			}

			const aConditions = this.getConditions(sFieldPath);
			const aArgs = fnNormalizeCondition ? [fnNormalizeCondition(oCondition), aConditions.map(fnNormalizeCondition)] : [oCondition, aConditions];
			const iIndex = FilterOperatorUtil.indexOfCondition(...aArgs);
			return iIndex;

		};

		ConditionModel.prototype.exist = function(oCondition, sFieldPath) {
			if (typeof sFieldPath === "string") {
				return this.indexOf(sFieldPath, oCondition) >= 0;
			} else {
				throw new Error("sFieldPath must be provided " + this);
			}
		};

		/**
		 * Sets conditions. All already existing conditions will be removed.
		 *
		 * @param {object} oConditions object of conditions for corresponding fieldPaths
		 * @returns {this} Reference to <code>this</code> to allow method chaining.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.setConditions = function(oConditions) {

			let i = 0;
			let oCondition;

			if (Array.isArray(oConditions)) {
				throw new Error("setConditions with an Array of condition is not supported! " + this);
			} else {
				this._bNoSingleEvent = true; // to fire event only once per FieldPath
				let bUpdate = false;
				let sExternalFieldPath; // used for FieldPath from outside
				let sFieldPath; // used for escaped FieldPath
				// check old conditions to fire right propertyChange events
				const oOldConditions = merge({}, this.getProperty("/conditions")); // in oOldConditions the escaped FieldPath is used
				for (sExternalFieldPath in oConditions) { // in oConditions the external FieldPath is used
					this._getFieldPathProperty(sExternalFieldPath); // to initialize FieldPath
					sFieldPath = _escapeFieldPath.call(this, sExternalFieldPath);
					const aOldConditions = oOldConditions[sFieldPath] || [];
					const aConditions = oConditions[sExternalFieldPath] || [];
					if (!FilterOperatorUtil.compareConditionsArray(aOldConditions, aConditions)) {
						bUpdate = true;
						this.removeAllConditions(sExternalFieldPath);
						for (i = 0; i < oConditions[sExternalFieldPath].length; i++) {
							oCondition = oConditions[sExternalFieldPath][i];
							this.insertCondition(sExternalFieldPath, -1, oCondition, true);
						}
						this.firePropertyChange({ reason: ChangeReason.Binding, path: "/conditions/" + sExternalFieldPath, context: undefined, value: oConditions[sExternalFieldPath] });
					}
					delete oOldConditions[sFieldPath]; // is processed
				}

				const oFieldPath = this.getProperty("/fieldPath");
				for (sFieldPath in oOldConditions) { // just entries without update left here
					if (oOldConditions[sFieldPath].length > 0) { // there where conditions and no there are none -> update
						bUpdate = true;
						sExternalFieldPath = oFieldPath[sFieldPath].fieldPath;
						this.removeAllConditions(sExternalFieldPath);
						this.firePropertyChange({ reason: ChangeReason.Binding, path: "/conditions/" + sExternalFieldPath, context: undefined, value: [] });
					}
				}
				if (bUpdate) {
					this.checkUpdate(false, true); // do not force, only fire real updates. But do async as not known if any other changes via api triggered.
				}
				this._bNoSingleEvent = false;
			}

			return this;

		};

		/**
		 * Adds a condition for a specified <code>FieldPath</code>.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @param {sap.ui.mdc.condition.ConditionObject} oCondition condition to be added
		 * @param {boolean} bForce if set the condition will be added even if it already exist
		 * @returns {this} Reference to <code>this</code> to allow method chaining.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.addCondition = function(sFieldPath, oCondition, bForce) {

			if (typeof sFieldPath !== "string") {
				throw new Error("sFieldPath must be a string " + this);
			}
			return this.insertCondition(sFieldPath, -1, oCondition, bForce);

		};

		/**
		 * Inserts a condition for a specified <code>FieldPath</code>.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @param {int} iIndex index where the condition should be inserted
		 * @param {sap.ui.mdc.condition.ConditionObject} oCondition condition to be inserted
		 * @param {boolean} bForce if set the condition will be inserted even if it already exist
		 * @returns {this} Reference to <code>this</code> to allow method chaining.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.insertCondition = function(sFieldPath, iIndex, oCondition, bForce) {

			if (typeof sFieldPath !== "string") {
				throw new Error("sFieldPath must be a string " + this);
			}

			if (!oCondition) {
				return this;
			}

			FilterOperatorUtil.checkConditionsEmpty(oCondition);
			FilterOperatorUtil.updateConditionsValues(oCondition);
			this._getFieldPathProperty(sFieldPath); // to create if not exist

			if (!bForce) {
				const i = this.indexOf(sFieldPath, oCondition);
				if (i >= 0) {
					return this;
				}
			}

			// add condition to model
			const aConditions = _getConditions.call(this, sFieldPath, true);
			if (iIndex == -1) {
				aConditions.push(oCondition);
			} else {
				aConditions.splice(iIndex, 0, oCondition);
			}

			if (!this._bNoSingleEvent) {
				this.checkUpdate(false, true); // do not force, only fire real updates. But do async as not known if any other changes via api triggered.
				this.firePropertyChange({ reason: ChangeReason.Binding, path: "/conditions/" + sFieldPath, context: undefined, value: aConditions });
			}

			return this;
		};

		/**
		 * Removes a condition for a specified <code>FieldPath</code>.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @param {int|sap.ui.mdc.condition.ConditionObject} vCondition condition or index of the condition
		 * @returns {boolean} flag if condition was removed.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.removeCondition = function(sFieldPath, vCondition) {

			if (typeof sFieldPath !== "string") {
				throw new Error("sFieldPath must be a string " + this);
			}

			let iIndex = -1;

			if (typeof vCondition === "object") {
				iIndex = this.indexOf(sFieldPath, vCondition);
			} else if (typeof vCondition === "number") {
				iIndex = vCondition;
			}

			if (iIndex >= 0) {
				const aConditions = this.getConditions(sFieldPath);
				if (aConditions.length > iIndex) {
					aConditions.splice(iIndex, 1);
					this.checkUpdate(false, true); // do not force, only fire real updates. But do async as not known if any other changes via api triggered.
					this.firePropertyChange({ reason: ChangeReason.Binding, path: "/conditions/" + sFieldPath, context: undefined, value: aConditions });
					return true;
				}
			}

			return false;

		};

		/**
		 * Removes all conditions for a specified <code>FieldPath</code>.
		 *
		 * @param {string} sFieldPath fieldPath of the condition
		 * @returns {this} Reference to <code>this</code> to allow method chaining.
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		ConditionModel.prototype.removeAllConditions = function(sFieldPath) {

			const oConditions = this.getProperty("/conditions");

			if (typeof sFieldPath === "string") {
				const sEscapedFieldPath = _escapeFieldPath.call(this, sFieldPath);
				if (oConditions[sEscapedFieldPath] && oConditions[sEscapedFieldPath].length > 0) {
					oConditions[sEscapedFieldPath] = [];
					if (!this._bNoSingleEvent) {
						this.firePropertyChange({ reason: ChangeReason.Binding, path: "/conditions/" + sFieldPath, context: undefined, value: oConditions[sEscapedFieldPath] });
					}
				}
			} else {
				for (const sMyFieldPath in oConditions) {
					if (oConditions[sMyFieldPath] && oConditions[sMyFieldPath].length > 0) {
						oConditions[sMyFieldPath] = [];
						if (!this._bNoSingleEvent) {
							const oFieldPath = this.getProperty("/fieldPath");
							const sOriginalFieldPath = oFieldPath[sMyFieldPath].fieldPath;
							this.firePropertyChange({ reason: ChangeReason.Binding, path: "/conditions/" + sOriginalFieldPath, context: undefined, value: oConditions[sMyFieldPath] });
						}
					}
				}
			}

			if (!this._bNoSingleEvent) {
				this.checkUpdate(false, true); // do not force, only fire real updates. But do async as not known if any other changes via api triggered.
			}

			return this;

		};

		ConditionModel.prototype._getFieldPathProperty = function(sFieldPath) {
			const sEscapedFieldPath = _escapeFieldPath.call(this, sFieldPath);
			const oFieldPath = this.getProperty("/fieldPath");
			if (!oFieldPath[sEscapedFieldPath]) {
				oFieldPath[sEscapedFieldPath] = {
					fieldPath: sFieldPath // to store unescaped FieldPath (needed for Filter)
				};
			}

			// create initial conditions array (to have it always for binding)
			const oConditions = this.getProperty("/conditions");
			if (!oConditions[sEscapedFieldPath]) {
				oConditions[sEscapedFieldPath] = [];
			}

			return oFieldPath[sEscapedFieldPath];
		};

		ConditionModel.prototype.getFilters = function(sFieldPath) {
			Log.error("ConditionModel", "usage or deprecated getFilters() function! Please use the FilterConverter.createFilters() function instead.");
			return FilterConverter.createFilters(this.getAllConditions(), {});
		};

		ConditionModel.prototype.serialize = function() {
			const oConditions = merge({}, this.getAllConditions());

			for (const sMyFieldPath in oConditions) {
				const aConditions = oConditions[sMyFieldPath];
				aConditions.forEach((oCondition) => {
					delete oCondition.isEmpty;
				}, this);

				if (aConditions.length === 0) {
					delete oConditions[sMyFieldPath];
				}
			}

			return '{"conditions":' + JSON.stringify(oConditions) + "}";
		};

		ConditionModel.prototype.parse = function(sObjects) {
			const dateTimeReviver = function(key, value) {
				let a;
				if (!isNaN(parseInt(key)) && (typeof value === 'string')) {
					a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z$/.exec(value);
					if (a) {
						return UI5Date.getInstance(value);
					}
				}
				return value;
			};

			this.setConditions(JSON.parse(sObjects, dateTimeReviver).conditions);
		};

		function _escapeFieldPath(sFieldPath) {

			if (sFieldPath) {
				const aParts = sFieldPath.split("/");

				if (aParts.length > 1) {
					sFieldPath = "";

					aParts.forEach((sPart, i) => {
						if (i > 0) {
							if (!isNaN(sPart) || !isNaN(aParts[i - 1])) {
								sFieldPath = sFieldPath + "/";
							} else {
								sFieldPath = sFieldPath + "\\";
							}
						}
						sFieldPath = sFieldPath + sPart;
					});
				}

			}

			return sFieldPath;

		}

		return ConditionModel;
	});