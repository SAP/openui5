/*!
 * ${copyright}
 */

// Provides class sap.ui.webc.common.WebComponentMetadata
sap.ui.define([
		"sap/ui/core/ElementMetadata",
		"./WebComponentRenderer",
		"sap/base/strings/camelize"
	],
	function(ElementMetadata, WebComponentRenderer, camelize) {
		"use strict";

		var MAPPING_TYPES = ["attribute", "style", "textContent", "slot", "none"];

		/**
		 * Creates a new metadata object for a WebComponent Wrapper subclass.
		 *
		 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
		 * @param {object} oClassInfo static info to construct the metadata from
		 *
		 * @class
		 * @author SAP SE
		 * @version ${version}
		 * @since 1.92.0
		 * @experimental Since 1.92.0 The API might change. It is not intended for productive usage yet!
		 * @alias sap.ui.webc.common.WebComponentMetadata
		 * @extends sap.ui.core.ElementMetadata
		 * @public
		 */
		var WebComponentMetadata = function(sClassName, oClassInfo) {
			// call super constructor
			ElementMetadata.apply(this, arguments);
		};

		//chain the prototypes
		WebComponentMetadata.prototype = Object.create(ElementMetadata.prototype);
		WebComponentMetadata.prototype.constructor = WebComponentMetadata;

		// mapping validation function
		var fnValidateType = function (sType) {
			return MAPPING_TYPES.includes(sType) ? sType : MAPPING_TYPES[0];
		};

		// Enrich property factory
		var OriginalProperty = ElementMetadata.prototype.metaFactoryProperty;
		var WebComponentProperty = function(oClass, name, info) {
			OriginalProperty.apply(this, arguments);

			if (!info.mapping || typeof info.mapping === "string") {
				this._sMapping = fnValidateType(info.mapping);
			} else if (typeof info.mapping === "object") {
				this._sMapping = fnValidateType(info.mapping.type);
				this._sMapTo = info.mapping.to;
				this._fnMappingFormatter = info.mapping.formatter;
			}
		};
		WebComponentProperty.prototype = Object.create(OriginalProperty.prototype);
		WebComponentProperty.prototype.constructor = WebComponentProperty;
		WebComponentMetadata.prototype.metaFactoryProperty = WebComponentProperty;

		// Enrich aggregation factory
		var OriginalAggregation = ElementMetadata.prototype.metaFactoryAggregation;
		var WebComponentAggregation = function(oClass, name, info) {
			OriginalAggregation.apply(this, arguments);
			this._sSlot = info.slot || "";
		};
		WebComponentAggregation.prototype = Object.create(OriginalAggregation.prototype);
		WebComponentAggregation.prototype.constructor = WebComponentAggregation;
		WebComponentMetadata.prototype.metaFactoryAggregation = WebComponentAggregation;

		// Enrich association factory
		var OriginalAssociation = ElementMetadata.prototype.metaFactoryAssociation;
		var WebComponentAssociation = function(oClass, name, info) {
			OriginalAssociation.apply(this, arguments);
			if (!info.mapping || typeof info.mapping !== "object") {
				this._sMapping = ""; // For associations, "mapping" must be an object, because "to" is required
			} else {
				this._sMapping = "property"; // Associations map only to properties, no matter what is set, it's always "property" mapping
				this._sMapTo = info.mapping.to; // The property, to which the association is related
				this._fnMappingFormatter = info.mapping.formatter;
			}
		};
		WebComponentAssociation.prototype = Object.create(OriginalAssociation.prototype);
		WebComponentAssociation.prototype.constructor = WebComponentAssociation;
		WebComponentMetadata.prototype.metaFactoryAssociation = WebComponentAssociation;

		WebComponentMetadata.prototype.applySettings = function(oClassInfo) {
			var oStaticInfo = oClassInfo.metadata;

			this._sTag = oStaticInfo.tag;
			this._aMethods = oStaticInfo.methods || [];
			this._aGetters = oStaticInfo.getters || [];

			ElementMetadata.prototype.applySettings.call(this, oClassInfo);
		};

		WebComponentMetadata.prototype.generateAccessors = function() {
			ElementMetadata.prototype.generateAccessors.call(this);
			var proto = this.getClass().prototype;

			// Generate accessors for proxied public methods - only if not created explicitly already
			this._aMethods.forEach(function(name) {
				if (!proto[name]) {
					proto[name] = function() {
						return this.__callPublicMethod(name, arguments);
					};
				}
			});

			// Generate accessors for proxied public getters - only if not created explicitly already
			this._aGetters.forEach(function(name) {
				var functionName = "get" + name.substr(0, 1).toUpperCase() + name.substr(1);
				if (!proto[functionName]) {
					proto[functionName] = function() {
						return this.__callPublicGetter(name);
					};
				}
			});
		};

		/**
		 * Returns the tag, used to render the Component Wrapper
		 * @public
		 * @returns {string}
		 */
		WebComponentMetadata.prototype.getTag = function() {
			return this._sTag;
		};

		/**
		 * Returns the list of public methods, proxied by the Component Wrapper to the component itself
		 * @public
		 * @returns {Array}
		 */
		WebComponentMetadata.prototype.getMethods = function() {
			return this._aMethods;
		};

		/**
		 * Returns the list of public getters, proxied by the Component Wrapper to the component itself
		 * @public
		 * @returns {Array}
		 */
		WebComponentMetadata.prototype.getGetters = function() {
			return this._aGetters;
		};

		/**
		 * Returns the slot to be assigned to a particular aggregation's items
		 * @private
		 */
		WebComponentMetadata.prototype.getAggregationSlot = function(sAggregationName) {
			var oAggregation = this._mAllAggregations[sAggregationName];
			return oAggregation ? oAggregation._sSlot : undefined;
		};

		/**
		 * Determines whether the attribute corresponds to a managed property
		 * @param sAttr the attribute's name
		 * @returns {boolean}
		 */
		WebComponentMetadata.prototype.isManagedAttribute = function(sAttr) {
			var mProperties = this.getAllProperties();
			for (var propName in mProperties) {
				if (mProperties.hasOwnProperty(propName)) {
					var propData = mProperties[propName];
					if (propData._sMapping === "attribute" && (propData._sMapTo === sAttr || camelize(sAttr) === propName)) {
						return true;
					}
				}
			}

			var mAssociations = this.getAllAssociations();
			for (var sAssocName in mAssociations) {
				if (mAssociations.hasOwnProperty(sAssocName)) {
					var oAssocData = mAssociations[sAssocName];
					if (oAssocData._sMapping === "property" && oAssocData._sMapTo === camelize(sAttr)) {
						return true;
					}
				}
			}

			return false;
		};

		/**
		 * Returns a map, containing all properties of a certain mapping type
		 * @param sMapping
		 * @returns {Object}
		 */
		WebComponentMetadata.prototype.getPropertiesByMapping = function(sMapping) {
			var mFiltered = {};
			var mProperties = this.getAllProperties();
			var mPrivateProperties = this.getAllPrivateProperties();
			for (var propName in mProperties) {
				if (mProperties.hasOwnProperty(propName)) {
					var propData = mProperties[propName];
					if (propData._sMapping === sMapping) {
						mFiltered[propName] = propData;
					}
				}
			}

			for (var propName in mPrivateProperties) {
				if (mPrivateProperties.hasOwnProperty(propName)) {
					var propData = mPrivateProperties[propName];
					if (propData._sMapping === sMapping) {
						mFiltered[propName] = propData;
					}
				}
			}

			return mFiltered;
		};

		/**
		 * Returns a map of all associations that control properties (have mapping to properties)
		 * returns {Object}
		 */
		WebComponentMetadata.prototype.getAssociationsWithMapping = function() {
			var mFiltered = {};
			var mAssociations = this.getAllAssociations();
			for (var sAssocName in mAssociations) {
				if (mAssociations.hasOwnProperty(sAssocName)) {
					var oAssocData = mAssociations[sAssocName];
					if (oAssocData._sMapping) {
						mFiltered[sAssocName] = oAssocData;
					}
				}
			}

			return mFiltered;
		};

		/**
		 * Retrieves the renderer for the described web component class.
		 * Note: this is always the default renderer and Web Component wrappers should not define their own renderers.
		 * @public
		 */
		WebComponentMetadata.prototype.getRenderer = function() {
			if (this._oRenderer) {
				return this._oRenderer;
			}

			return WebComponentRenderer;
		};

		return WebComponentMetadata;

	});
