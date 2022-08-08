sap.ui.define(["exports", "./types/DataType", "./util/isDescendantOf", "./util/StringHelper", "./util/SlotsHelper", "./CustomElementsScopeUtils"], function (_exports, _DataType, _isDescendantOf, _StringHelper, _SlotsHelper, _CustomElementsScopeUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  _isDescendantOf = _interopRequireDefault(_isDescendantOf);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   *
   * @class
   * @public
   */
  class UI5ElementMetadata {
    constructor(metadata) {
      this.metadata = metadata;
    }

    getInitialState() {
      if (Object.prototype.hasOwnProperty.call(this, "_initialState")) {
        return this._initialState;
      }

      const initialState = {};
      const slotsAreManaged = this.slotsAreManaged(); // Initialize properties

      const props = this.getProperties();

      for (const propName in props) {
        // eslint-disable-line
        const propType = props[propName].type;
        const propDefaultValue = props[propName].defaultValue;

        if (propType === Boolean) {
          initialState[propName] = false;

          if (propDefaultValue !== undefined) {
            console.warn("The 'defaultValue' metadata key is ignored for all booleans properties, they would be initialized with 'false' by default"); // eslint-disable-line
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
      } // Initialize slots


      if (slotsAreManaged) {
        const slots = this.getSlots();

        for (const [slotName, slotData] of Object.entries(slots)) {
          // eslint-disable-line
          const propertyName = slotData.propertyName || slotName;
          initialState[propertyName] = [];
        }
      }

      this._initialState = initialState;
      return initialState;
    }
    /**
     * Only intended for use by UI5Element.js
     * @protected
     */


    static validatePropertyValue(value, propData) {
      const isMultiple = propData.multiple;

      if (isMultiple) {
        return value.map(propValue => validateSingleProperty(propValue, propData));
      }

      return validateSingleProperty(value, propData);
    }
    /**
     * Only intended for use by UI5Element.js
     * @protected
     */


    static validateSlotValue(value, slotData) {
      return validateSingleSlot(value, slotData);
    }
    /**
     * Returns the tag of the UI5 Element without the scope
     * @public
     */


    getPureTag() {
      return this.metadata.tag;
    }
    /**
     * Returns the tag of the UI5 Element
     * @public
     */


    getTag() {
      const pureTag = this.metadata.tag;
      const suffix = (0, _CustomElementsScopeUtils.getEffectiveScopingSuffixForTag)(pureTag);

      if (!suffix) {
        return pureTag;
      }

      return `${pureTag}-${suffix}`;
    }
    /**
     * Used to get the tag we need to register for backwards compatibility
     * @public
     */


    getAltTag() {
      const pureAltTag = this.metadata.altTag;

      if (!pureAltTag) {
        return;
      }

      const suffix = (0, _CustomElementsScopeUtils.getEffectiveScopingSuffixForTag)(pureAltTag);

      if (!suffix) {
        return pureAltTag;
      }

      return `${pureAltTag}-${suffix}`;
    }
    /**
     * Determines whether a property should have an attribute counterpart
     * @public
     * @param propName
     * @returns {boolean}
     */


    hasAttribute(propName) {
      const propData = this.getProperties()[propName];
      return propData.type !== Object && !propData.noAttribute && !propData.multiple;
    }
    /**
     * Returns an array with the properties of the UI5 Element (in camelCase)
     * @public
     * @returns {string[]}
     */


    getPropertiesList() {
      return Object.keys(this.getProperties());
    }
    /**
     * Returns an array with the attributes of the UI5 Element (in kebab-case)
     * @public
     * @returns {string[]}
     */


    getAttributesList() {
      return this.getPropertiesList().filter(this.hasAttribute, this).map(_StringHelper.camelToKebabCase);
    }
    /**
     * Returns an object with key-value pairs of slots and their metadata definitions
     * @public
     */


    getSlots() {
      return this.metadata.slots || {};
    }
    /**
     * Determines whether this UI5 Element has a default slot of type Node, therefore can slot text
     * @returns {boolean}
     */


    canSlotText() {
      const defaultSlot = this.getSlots().default;
      return defaultSlot && defaultSlot.type === Node;
    }
    /**
     * Determines whether this UI5 Element supports any slots
     * @public
     */


    hasSlots() {
      return !!Object.entries(this.getSlots()).length;
    }
    /**
     * Determines whether this UI5 Element supports any slots with "individualSlots: true"
     * @public
     */


    hasIndividualSlots() {
      return this.slotsAreManaged() && Object.entries(this.getSlots()).some(([_slotName, slotData]) => slotData.individualSlots);
    }
    /**
     * Determines whether this UI5 Element needs to invalidate if children are added/removed/changed
     * @public
     */


    slotsAreManaged() {
      return !!this.metadata.managedSlots;
    }
    /**
     * Determines whether this control supports F6 fast navigation
     * @public
     */


    supportsF6FastNavigation() {
      return !!this.metadata.fastNavigation;
    }
    /**
     * Returns an object with key-value pairs of properties and their metadata definitions
     * @public
     */


    getProperties() {
      return this.metadata.properties || {};
    }
    /**
     * Returns an object with key-value pairs of events and their metadata definitions
     * @public
     */


    getEvents() {
      return this.metadata.events || {};
    }
    /**
     * Determines whether this UI5 Element has any translatable texts (needs to be invalidated upon language change)
     * @returns {boolean}
     */


    isLanguageAware() {
      return !!this.metadata.languageAware;
    }
    /**
     * Determines whether this UI5 Element has any theme dependant carachteristics.
     * @returns {boolean}
     */


    isThemeAware() {
      return !!this.metadata.themeAware;
    }
    /**
     * Matches a changed entity (property/slot) with the given name against the "invalidateOnChildChange" configuration
     * and determines whether this should cause and invalidation
     *
     * @param slotName the name of the slot in which a child was changed
     * @param type the type of change in the child: "property" or "slot"
     * @param name the name of the property/slot that changed
     * @returns {boolean}
     */


    shouldInvalidateOnChildChange(slotName, type, name) {
      const config = this.getSlots()[slotName].invalidateOnChildChange; // invalidateOnChildChange was not set in the slot metadata - by default child changes do not affect the component

      if (config === undefined) {
        return false;
      } // The simple format was used: invalidateOnChildChange: true/false;


      if (typeof config === "boolean") {
        return config;
      } // The complex format was used: invalidateOnChildChange: { properties, slots }


      if (typeof config === "object") {
        // A property was changed
        if (type === "property") {
          // The config object does not have a properties field
          if (config.properties === undefined) {
            return false;
          } // The config object has the short format: properties: true/false


          if (typeof config.properties === "boolean") {
            return config.properties;
          } // The config object has the complex format: properties: [...]


          if (Array.isArray(config.properties)) {
            return config.properties.includes(name);
          }

          throw new Error("Wrong format for invalidateOnChildChange.properties: boolean or array is expected");
        } // A slot was changed


        if (type === "slot") {
          // The config object does not have a slots field
          if (config.slots === undefined) {
            return false;
          } // The config object has the short format: slots: true/false


          if (typeof config.slots === "boolean") {
            return config.slots;
          } // The config object has the complex format: slots: [...]


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
      return typeof value === "string" || typeof value === "undefined" || value === null ? value : value.toString();
    }

    if (propertyType === Object) {
      return typeof value === "object" ? value : propData.defaultValue;
    }

    if ((0, _isDescendantOf.default)(propertyType, _DataType.default)) {
      return propertyType.isValid(value) ? value : propData.defaultValue;
    }
  };

  const validateSingleSlot = (value, slotData) => {
    value && (0, _SlotsHelper.getSlottedElements)(value).forEach(el => {
      if (!(el instanceof slotData.type)) {
        throw new Error(`${el} is not of type ${slotData.type}`);
      }
    });
    return value;
  };

  var _default = UI5ElementMetadata;
  _exports.default = _default;
});