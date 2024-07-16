/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides an abstraction for BindingInfos
sap.ui.define([
	"sap/ui/base/DesignTime",
	"sap/ui/base/BindingParser",
	"sap/ui/model/BindingMode",
	"sap/base/Log"
],
	function(DesignTime, BindingParser, BindingMode) {
		"use strict";

		// Marker to not 'forget' ui5Objects
		const UI5_OBJECT_MARKER = Symbol("ui5object");

		// Marker that is used for aggregation binding. It's set on the instance
		// cloned from the given template with value pointing to the original
		// parent where the aggregation is defined. In case the aggregation is
		// forwarded to another control, the original parent isn't changed and still
		// points to the control before the aggregation gets forwarded.
		const ORIGINAL_PARENT = Symbol("OriginalParent");

		// Marker symbol for BindingInfos which already have extracted a
		// named model from their path
		const MODEL_NAME_EXTRACTED = Symbol("ModelNameExtracted");

		/**
		 * Checks if the "path" of the given BindingInfo/part contains
		 * a model name and if so extracts it accordingly.
		 * @param {sap.ui.base.BindingInfo} oPart the BindingInfo to check for a model name
		 * @returns {sap.ui.base.BindingInfo} the modified BindingInfo
		 */
		function extractModelName(oPart) {
			if (!oPart[MODEL_NAME_EXTRACTED]) {
				// if a model separator is found in the path, extract model name and path
				const iSeparatorPos = oPart.path.indexOf(">");
				if (iSeparatorPos > 0) {
					oPart.model = oPart.path.substr(0, iSeparatorPos);
					oPart.path = oPart.path.substr(iSeparatorPos + 1);
					oPart[MODEL_NAME_EXTRACTED] = true;
				}
			}
			return oPart;
		}

		/**
		 * This module is responsible for the following tasks:
		 *   - extracting and parsing binding-info objects
		 *   - creating Property, Object and Aggregation binding-infos
		 *   - providing the UI5-object marker symbol
		 *   - exposing and defaulting the BindingParser
		 *
		 * @alias sap.ui.base.BindingInfo
		 * @namespace
		 * @private
		 * @ui5-restricted sap.ui.base, sap.ui.core
		 */
		var BindingInfo = {
			/**
			 * Creates a new property binding-info object based on the given raw definition.
			 * @param {sap.ui.base.ManagedObject.PropertyBindingInfo} oBindingInfo raw binding info object
			 * @returns {object} valid property binding-info
			 * @private
			 * @ui5-restricted sap.ui.base, sap.ui.core
			 */
			createProperty: function(oBindingInfo) {
				// only one binding object with one binding specified
				if (!oBindingInfo.parts) {
					oBindingInfo.parts = [];
					oBindingInfo.parts[0] = {
						path: oBindingInfo.path,
						targetType: oBindingInfo.targetType,
						type: oBindingInfo.type,
						suspended: oBindingInfo.suspended,
						formatOptions: oBindingInfo.formatOptions,
						constraints: oBindingInfo.constraints,
						model: oBindingInfo.model,
						mode: oBindingInfo.mode,
						value: oBindingInfo.value
					};
					delete oBindingInfo.path;
					delete oBindingInfo.targetType;
					delete oBindingInfo.mode;
					delete oBindingInfo.model;
					delete oBindingInfo.value;
				}

				for ( var i = 0; i < oBindingInfo.parts.length; i++ ) {

					// Plain strings as parts are taken as paths of bindings
					var oPart = oBindingInfo.parts[i];
					if (typeof oPart == "string") {
						oPart = { path: oPart };
						oBindingInfo.parts[i] = oPart;
					}

					// if a model separator is found in the path, extract model name and path
					if (oPart.path !== undefined) {
						extractModelName(oPart);
					}
					// if a formatter exists the binding mode can be one way or one time only
					if (oBindingInfo.formatter &&
						oPart.mode != BindingMode.OneWay &&
						oPart.mode != BindingMode.OneTime) {
							oPart.mode = BindingMode.OneWay;
					}
				}

				//Initialize skip properties
				oBindingInfo.skipPropertyUpdate = 0;
				oBindingInfo.skipModelUpdate = 0;
				return oBindingInfo;
			},

			/**
			 * Creates a new aggregation binding-info object based on the given raw definition.
			 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo raw binding info object
			 * @returns {object} valid aggregation binding-info
			 * @private
			 * @ui5-restricted sap.ui.base, sap.ui.core
			 */
			createAggregation: function(oBindingInfo, bDoesNotRequireFactory) {
				if (!(oBindingInfo.template || oBindingInfo.factory)) {
					// If aggregation is marked correspondingly in the metadata, factory can be omitted (usually requires an updateXYZ method)
					if ( bDoesNotRequireFactory ) {
						// add a dummy factory as property 'factory' is used to distinguish between property- and list-binding
						oBindingInfo.factory = function() {
							throw new Error("dummy factory called unexpectedly ");
						};
					}
				} else if (oBindingInfo.template) {
					// if we have a template we will create a factory function
					oBindingInfo.factory = function(sId) {
						const oClone = oBindingInfo.template.clone(sId);
						// This flag is currently used by FieldHelp.js and it needs to be set only when a binding template is given.
						// When a custom factory method is provided, it's not guaranteed that all instances created from the factory
						// are bound to the same sub-path under the given aggregation path. Therefore we can't use the parent
						// control for showing the header of the field help.
						oClone[ORIGINAL_PARENT] = oBindingInfo[ORIGINAL_PARENT];
						return oClone;
					};
				}

				// if a model separator is found in the path, extract model name and path
				extractModelName(oBindingInfo);
				return oBindingInfo;
			},

			/**
			 * Creates a new object binding-info object based on the given raw definition.
			 * @param {sap.ui.base.ManagedObject.ObjectBindingInfo} oBindingInfo raw binding info object
			 * @returns {object} valid object binding-info
			 * @private
			 * @ui5-restricted sap.ui.base, sap.ui.core
			 */
			createObject: function(oBindingInfo) {
				// if a model separator is found in the path, extract model name and path
				extractModelName(oBindingInfo);
				return oBindingInfo;
			},

			/**
			 * See {@link sap.ui.base.ManagedObject#extractBindingInfo}
			 */
			extract: function(oValue, oScope, bDetectValue) {
				var oBindingInfo;
				// property:{path:"path", template:oTemplate}
				if (oValue && typeof oValue === "object") {
					if (oValue.Type) {
						// if value contains the 'Type' property (capital 'T'), this is not a binding info.
						oBindingInfo = undefined;
					} else if (oValue[UI5_OBJECT_MARKER]) {
						// no bindingInfo, delete marker
						delete oValue[UI5_OBJECT_MARKER];
					} else if (oValue.ui5object) {
						// if value contains ui5object property, this is not a binding info,
						// remove it and not check for path or parts property
						delete oValue.ui5object;
					} else if (oValue.path != undefined || oValue.parts || (bDetectValue && oValue.value != undefined)) {
						oBindingInfo = oValue;
					}
				}

				// property:"{path}" or "\{path\}"
				if (typeof oValue === "string") {
					// either returns a binding info or an unescaped string or undefined - depending on binding syntax
					oBindingInfo = BindingInfo.parse(oValue, oScope, true);
				}
				return oBindingInfo;
			},
			escape: function () {
				return BindingInfo.parse.escape.apply(this, arguments);
			},

			/**
			 * Checks whether a BindingInfo is ready to create its Binding.
			 *
			 * @param {sap.ui.core.PropertyBindingInfo | sap.ui.core.AggregationBindingInfo | sap.ui.core.ObjectBindingInfo} oBindingInfo The BindingInfo to check
			 * @param {sap.ui.core.ManagedObject} oObject The bound ManagedObject
			 * @returns {boolean} if the BindingInfo is ready or not
			 * @private
			 * @ui5-restricted sap.ui.base, sap.ui.core, sap.ui.model
			 */
			isReady: function(oBindingInfo, oObject) {
				const aParts = oBindingInfo.parts;

				if (aParts) { // PropertyBinding
					return oBindingInfo.parts.every((oPart) => {
						return oPart.value !== undefined || oObject.getModel(oPart.model);
					});
				} else { // AggregationBinding or ObjectBinding
					return !!oObject.getModel(oBindingInfo.model);
				}
			},

			UI5ObjectMarker: UI5_OBJECT_MARKER,
			OriginalParent: ORIGINAL_PARENT
		};

		Object.defineProperty(BindingInfo, "parse", {
			get: function () {
				if (!this.oParser) {
					this.oParser = BindingParser.complexParser;
					if (DesignTime.isDesignModeEnabled() == true) {
						BindingParser._keepBindingStrings = true;
					}
				}
				return this.oParser;
			},
			set: function (parser) {
				this.oParser = parser;
			}
		});

		return BindingInfo;
	});