/*!
 * ${copyright}
 */

// Provides class sap.ui.core.WebComponentMetadata
sap.ui.define([
		'../ElementMetadata',
		'./WebComponentRenderer'
	],
	function(ElementMetadata, WebComponentRenderer) {
		"use strict";

		/**
		 * Creates a new metadata object for a WebComponent subclass.
		 *
		 * @param {string} sClassName fully qualified name of the class that is described by this metadata object
		 * @param {object} oStaticInfo static info to construct the metadata from
		 *
		 * @class
		 * @author SAP SE
		 * @version ${version}
		 * @since 0.8.6
		 * @alias sap.ui.core.WebComponentMetadata
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

		// Enrich property factory
		var OriginalProperty = ElementMetadata.prototype.metaFactoryProperty;
		var WebComponentProperty = function(oClass, name, info) {
			OriginalProperty.apply(this, arguments);

			// mapping
			var fnValidateType = function (sType) {
				var aTypes = ["attribute", "style", "textContent", "slot", "none"];
				return aTypes.indexOf(sType) > -1 ? sType : aTypes[0];
			};

			if (!info.mapping || typeof info.mapping === "string") {
				this._sMapping = fnValidateType(info.mapping);
			} else if (typeof info.mapping === "object") {
				this._sMapping = fnValidateType(info.mapping.type);
				this._sMapTo = info.mapping.to;
				this._fnMappingFormatter = info.mapping.formatter;
			}

			// updateOnEvent
			this._sUpdateOnEvent = info.updateOnEvent;
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

		WebComponentMetadata.prototype.applySettings = function(oClassInfo) {

			var oStaticInfo = oClassInfo.metadata;

			this._sTag = oStaticInfo.tag;
			this._aMethods = oStaticInfo.methods || [];

			ElementMetadata.prototype.applySettings.call(this, oClassInfo);
		};

		WebComponentMetadata.prototype.generateAccessors = function() {
			ElementMetadata.prototype.generateAccessors.call(this);

			// Generate accessors for proxied public methods
			var proto = this.getClass().prototype;
			this._aMethods.forEach(function(name) { // TODO: mark methods as having side effects -> only then fire event
				if (!proto[name]) {
					proto[name] = function() {
						return this.__callPublicMethod(name, arguments);
					};
				}
			});
		};

		WebComponentMetadata.prototype.getTag = function() {
			return this._sTag;
		};

		WebComponentMetadata.prototype.getMethods = function() {
			return this._aMethods;
		};

		/**
		 * Returns the slot to be assigned to this aggregation's items
		 * @private
		 */
		WebComponentMetadata.prototype.getAggregationSlot = function(sAggregationName) {
			var oAggregation = this._mAllAggregations[sAggregationName];
			return oAggregation ? oAggregation._sSlot : undefined;
		};

		/**
		 * All properties that must be reflected as attributes of the custom element
		 */
		WebComponentMetadata.prototype.getPropertiesByMapping = function(sMapping) {
			var mFiltered = {};
			var mProperties = this.getAllProperties();
			for (var propName in mProperties) {
				if (mProperties.hasOwnProperty(propName)) {
					var propData = mProperties[propName];
					if (propData._sMapping === sMapping) {
						mFiltered[propName] = propData;
					}
				}
			}

			return mFiltered;
		};

		/**
		 * All properties that must by updated on the control instance (from the custom element ones) whenever the given event is fired
		 */
		WebComponentMetadata.prototype.getPropertiesToUpdateOnEvent = function(sEventName) {
			var mFiltered = {};
			var mProperties = this.getAllProperties();
			for (var propName in mProperties) {
				if (mProperties.hasOwnProperty(propName)) {
					var propData = mProperties[propName];
					if (propData._sUpdateOnEvent === sEventName) {
						mFiltered[propName] = propData;
					}
				}
			}

			return mFiltered;
		};

		/**
		 * Retrieves the renderer for the described web component class
		 */
		WebComponentMetadata.prototype.getRenderer = function() {
			if (this._oRenderer) {
				return this._oRenderer;
			}

			return WebComponentRenderer;
		};

		return WebComponentMetadata;

	});
