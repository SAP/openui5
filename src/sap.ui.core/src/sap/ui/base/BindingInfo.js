/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides an abstraction for BindingInfos
sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/base/BindingParser",
	"sap/ui/model/BindingMode",
	"sap/base/Log"
],
	function(Configuration, BindingParser, BindingMode) {
	"use strict";

	// Marker to not 'forget' ui5Objects
	var sUI5ObjectMarker = Symbol("ui5object");

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
			var iSeparatorPos;

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
					iSeparatorPos = oPart.path.indexOf(">");
					if (iSeparatorPos > 0) {
						oPart.model = oPart.path.substr(0, iSeparatorPos);
						oPart.path = oPart.path.substr(iSeparatorPos + 1);
					}
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
					return oBindingInfo.template.clone(sId);
				};
			}

			// if a model separator is found in the path, extract model name and path
			var iSeparatorPos = oBindingInfo.path.indexOf(">");
			if (iSeparatorPos > 0) {
				oBindingInfo.model = oBindingInfo.path.substr(0, iSeparatorPos);
				oBindingInfo.path = oBindingInfo.path.substr(iSeparatorPos + 1);
			}
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
			var iSeparatorPos;

			// if a model separator is found in the path, extract model name and path
			iSeparatorPos = oBindingInfo.path.indexOf(">");
			if (iSeparatorPos > 0) {
				oBindingInfo.model = oBindingInfo.path.substr(0, iSeparatorPos);
				oBindingInfo.path = oBindingInfo.path.substr(iSeparatorPos + 1);
			}
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
				} else if (oValue[sUI5ObjectMarker]) {
					// no bindingInfo, delete marker
					delete oValue[sUI5ObjectMarker];
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
		UI5ObjectMarker: sUI5ObjectMarker
	};

	Object.defineProperty(BindingInfo, "parse", {
		get: function () {
			if (!this.oParser) {
				// Note: "simple" binding syntax is deprecated since 1.24
				this.oParser = Configuration.getValue("bindingSyntax") === "simple" ? BindingParser.simpleParser : BindingParser.complexParser;
				if ( Configuration.getDesignMode() == true ) {
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