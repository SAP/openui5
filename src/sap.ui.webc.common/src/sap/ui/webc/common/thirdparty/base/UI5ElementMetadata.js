sap.ui.define(['./types/DataType', './util/isDescendantOf', './util/StringHelper', './util/SlotsHelper', './CustomElementsScope'], function (DataType, isDescendantOf, StringHelper, SlotsHelper, CustomElementsScope) { 'use strict';

	class UI5ElementMetadata {
		constructor(metadata) {
			this.metadata = metadata;
		}
		getInitialState() {
			if (Object.prototype.hasOwnProperty.call(this, "_initialState")) {
				return this._initialState;
			}
			const initialState = {};
			const slotsAreManaged = this.slotsAreManaged();
			const props = this.getProperties();
			for (const propName in props) {
				const propType = props[propName].type;
				const propDefaultValue = props[propName].defaultValue;
				if (propType === Boolean) {
					initialState[propName] = false;
					if (propDefaultValue !== undefined) {
						console.warn("The 'defaultValue' metadata key is ignored for all booleans properties, they would be initialized with 'false' by default");
					}
				} else if (props[propName].multiple) {
					initialState[propName] = [];
				} else if (propType === Object) {
					initialState[propName] = "defaultValue" in props[propName] ? props[propName].defaultValue : {};
				} else if (propType === String) {
					initialState[propName] = "defaultValue" in props[propName] ? props[propName].defaultValue : "";
				} else {
					initialState[propName] = propDefaultValue;
				}
			}
			if (slotsAreManaged) {
				const slots = this.getSlots();
				for (const [slotName, slotData] of Object.entries(slots)) {
					const propertyName = slotData.propertyName || slotName;
					initialState[propertyName] = [];
				}
			}
			this._initialState = initialState;
			return initialState;
		}
		static validatePropertyValue(value, propData) {
			const isMultiple = propData.multiple;
			if (isMultiple) {
				return value.map(propValue => validateSingleProperty(propValue, propData));
			}
			return validateSingleProperty(value, propData);
		}
		static validateSlotValue(value, slotData) {
			return validateSingleSlot(value, slotData);
		}
		getPureTag() {
			return this.metadata.tag;
		}
		getTag() {
			const pureTag = this.metadata.tag;
			const suffix = CustomElementsScope.getEffectiveScopingSuffixForTag(pureTag);
			if (!suffix) {
				return pureTag;
			}
			return `${pureTag}-${suffix}`;
		}
		getAltTag() {
			const pureAltTag = this.metadata.altTag;
			if (!pureAltTag) {
				return;
			}
			const suffix = CustomElementsScope.getEffectiveScopingSuffixForTag(pureAltTag);
			if (!suffix) {
				return pureAltTag;
			}
			return `${pureAltTag}-${suffix}`;
		}
		hasAttribute(propName) {
			const propData = this.getProperties()[propName];
			return propData.type !== Object && !propData.noAttribute && !propData.multiple;
		}
		getPropertiesList() {
			return Object.keys(this.getProperties());
		}
		getAttributesList() {
			return this.getPropertiesList().filter(this.hasAttribute, this).map(StringHelper.camelToKebabCase);
		}
		getSlots() {
			return this.metadata.slots || {};
		}
		canSlotText() {
			const defaultSlot = this.getSlots().default;
			return defaultSlot && defaultSlot.type === Node;
		}
		hasSlots() {
			return !!Object.entries(this.getSlots()).length;
		}
		hasIndividualSlots() {
			return this.slotsAreManaged() && Object.entries(this.getSlots()).some(([_slotName, slotData]) => slotData.individualSlots);
		}
		slotsAreManaged() {
			return !!this.metadata.managedSlots;
		}
		getProperties() {
			return this.metadata.properties || {};
		}
		getEvents() {
			return this.metadata.events || {};
		}
		isLanguageAware() {
			return !!this.metadata.languageAware;
		}
		shouldInvalidateOnChildChange(slotName, type, name) {
			const config = this.getSlots()[slotName].invalidateOnChildChange;
			if (config === undefined) {
				return false;
			}
			if (typeof config === "boolean") {
				return config;
			}
			if (typeof config === "object") {
				if (type === "property") {
					if (config.properties === undefined) {
						return false;
					}
					if (typeof config.properties === "boolean") {
						return config.properties;
					}
					if (Array.isArray(config.properties)) {
						return config.properties.includes(name);
					}
					throw new Error("Wrong format for invalidateOnChildChange.properties: boolean or array is expected");
				}
				if (type === "slot") {
					if (config.slots === undefined) {
						return false;
					}
					if (typeof config.slots === "boolean") {
						return config.slots;
					}
					if (Array.isArray(config.slots)) {
						return config.slots.includes(name);
					}
					throw new Error("Wrong format for invalidateOnChildChange.slots: boolean or array is expected");
				}
			}
			throw new Error("Wrong format for invalidateOnChildChange: boolean or object is expected");
		}
	}
	const validateSingleProperty = (value, propData) => {
		const propertyType = propData.type;
		if (propertyType === Boolean) {
			return typeof value === "boolean" ? value : false;
		}
		if (propertyType === String) {
			return (typeof value === "string" || typeof value === "undefined" || value === null) ? value : value.toString();
		}
		if (propertyType === Object) {
			return typeof value === "object" ? value : propData.defaultValue;
		}
		if (isDescendantOf(propertyType, DataType)) {
			return propertyType.isValid(value) ? value : propData.defaultValue;
		}
	};
	const validateSingleSlot = (value, slotData) => {
		value && SlotsHelper.getSlottedElements(value).forEach(el => {
			if (!(el instanceof slotData.type)) {
				throw new Error(`${el} is not of type ${slotData.type}`);
			}
		});
		return value;
	};

	return UI5ElementMetadata;

});
