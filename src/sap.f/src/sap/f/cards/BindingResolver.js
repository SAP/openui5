/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/ManagedObject", "sap/base/Log"],
	function (ManagedObject, Log) {
		"use strict";

		/**
		 * Simple class used to resolved bindings.
		 */
		var SimpleControl = ManagedObject.extend("sap.f.cards.util.SimpleControl", {
			metadata: {
				properties: {
					resolved: {
						type: "any"
					}
				}
			}
		});
		var oSimpleControl = new SimpleControl();

		/**
		 * Resolves a binding syntax based on a provided model and path.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @private
		 * @alias sap.f.cards.BindingResolver
		 */
		var BindingResolver = {};

		/**
		 * Traverses an object and resolves all binding syntaxes.
		 *
		 * @param {*} vValue The value to resolve.
		 * @param {sap.ui.model.Model} oModel The model.
		 * @param {string} [sPath] The path to take.
		 * @param {number} iCurrentLevel The current level of recursion.
		 * @param {number} iMaxLevel The maximum level of recursion.
		 * @private
		 * @returns {*} The resolved value.
		 */
		function process(vValue, oModel, sPath, iCurrentLevel, iMaxLevel) {
			var bReachedMaxLevel = iCurrentLevel === iMaxLevel;
			if (bReachedMaxLevel) {
				Log.warning("BindingResolver maximum level processing reached. Please check for circular dependencies.");
			}

			if (!vValue || bReachedMaxLevel) {
				return vValue;
			}

			if (Array.isArray(vValue)) {
				vValue.forEach(function (vItem, iIndex, aArray) {
					if (typeof vItem === "object") {
						process(vItem, oModel, sPath, iCurrentLevel + 1, iMaxLevel);
					} else if (typeof vItem === "string") {
						aArray[iIndex] = resolveBinding(vItem, oModel, sPath);
					}
				}, this);
				return vValue;
			} else if (typeof vValue === "object") {
				for (var sProp in vValue) {
					if (typeof vValue[sProp] === "object") {
						process(vValue[sProp], oModel, sPath, iCurrentLevel + 1, iMaxLevel);
					} else if (typeof vValue[sProp] === "string") {
						vValue[sProp] = resolveBinding(vValue[sProp], oModel, sPath);
					}
				}
				return vValue;
			} else if (typeof vValue === "string") {
				return resolveBinding(vValue, oModel, sPath);
			} else {
				return vValue;
			}
		}

		/**
		 * Resolves a single binding syntax.
		 *
		 * @param {string} sBinding The value to resolve.
		 * @param {sap.ui.model.Model} oModel The model.
		 * @param {string} [sPath] The path to the referenced entity which is going to be used as a binding context.
		 * @private
		 * @returns {*} The resolved value.
		 */
		function resolveBinding(sBinding, oModel, sPath) {
			if (!sBinding) {
				return sBinding;
			}
			var oBindingInfo = ManagedObject.bindingParser(sBinding);

			if (!oBindingInfo) {
				return sBinding;
			}

			if (!sPath) {
				sPath = "/";
			}

			oSimpleControl.setModel(oModel);
			oSimpleControl.bindObject(sPath);
			oSimpleControl.bindProperty("resolved", oBindingInfo);

			var vValue = oSimpleControl.getResolved();

			oSimpleControl.unbindProperty("resolved");
			oSimpleControl.unbindObject();
			oSimpleControl.setModel(null);

			return vValue;
		}

		/**
		 * Resolves a binding syntax.
		 * NOTE: This will only work with one unnamed model.
		 *
		 * @param {*} vValue The value to resolve.
		 * @param {sap.ui.model.Model} oModel The model.
		 * @param {string} [sPath] The path to the referenced entity which is going to be used as a binding context.
		 * @private
		 * @returns {*} The resolved value.
		 */
		BindingResolver.resolveValue = function (vValue, oModel, sPath) {
			var iCurrentLevel = 0,
				iMaxLevel = 30;

			if (!oModel) {
				return vValue;
			}

			var vProcessed = process(vValue, oModel, sPath, iCurrentLevel, iMaxLevel);

			return vProcessed;
		};

		return BindingResolver;
	});
