/*!
 * ${copyright}
 */

// Provides the base class for all HTMLElement wrappers.
sap.ui.define([
	"../Control",
	"../Element",
	"../html/HTMLElementMetadata",
	"../html/HTMLElementRenderer",
	"../library",
	"../LabelEnablement",
	"sap/base/security/URLListValidator",
	"sap/base/Log"
],
function(
	Control,
	Element,
	HTMLElementMetadata,
	HTMLElementRenderer,
	coreLibrary,
	LabelEnablement,
	URLListValidator,
	Log
) {
	"use strict";

	const TextDirection = coreLibrary.TextDirection;

	/**
	 * Returns the sap.ui.core.Element instance for an arbitrary HTML Element, or undefined if the HTML element is not a sap.ui.core.Element.
	 *
	 * @param {HTMLElement} obj The HTML element to check.
	 * @returns {sap.ui.core.Element|undefined} The corresponding UI5 Element instance, or undefined.
	 * @private
	 */
	const fnGetControlFor = function(obj) {
		const oControl = obj.id ? Element.getElementById(obj.id) : undefined;
		return oControl || undefined; // consistent return value (never null)
	};

	/**
	 * Returns the active element in the shadow DOM, if any.
	 *
	 * @param {HTMLElement} obj The root HTML element to start searching from.
	 * @returns {HTMLElement|null} The active element in the shadow DOM, or null if none found.
	 * @private
	 */
	const fnGetActiveElement = function(obj) {
		while (obj && obj.shadowRoot && obj.shadowRoot.activeElement) {
			obj = obj.shadowRoot.activeElement;
		}
		return obj;
	};

	/**
	 * Takes an object as an argument and returns another object, where all fields in the original object that are HTML Elements are deeply replaced with their sap.ui.core.Element counterparts, where applicable.
	 *
	 * @param {*} obj The object to convert.
	 * @param {number} [level=0] The current recursion level.
	 * @param {number} [maxLevel=2] The maximum recursion depth.
	 * @returns {*} The converted object with HTML Elements replaced by UI5 Elements where possible.
	 * @private
	 */
	const fnConvert = function(obj, level = 0, maxLevel = 2) {
		// Null
		if (obj == null) {
			return obj;
		}

		// HTML Element - if represents a control, return the control. Otherwise return the HTML Element and stop.
		if (obj instanceof window.HTMLElement) {
			const oControl = fnGetControlFor(obj);
			return oControl ? oControl : obj;
		}

		if (level < maxLevel) {
			// Array
			if (Array.isArray(obj)) {
				return obj.map((elem) => fnConvert(elem, level + 1, maxLevel));
			}

			// Object
			if (typeof obj === "object") {
				const oResult = {};
				for (const i in obj) {
					if (Object.hasOwn(obj, i)) {
						oResult[i] = fnConvert(obj[i], level + 1, maxLevel);
					}
				}
				return oResult;
			}
		}

		// Anything else
		return obj;
	};

	/**
	 * Constructs and initializes a HTMLElement Wrapper with the given <code>sId</code> and settings.
	 *
	 * @param {string} [sId] Optional ID for the new control; generated automatically if no non-empty ID is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] Object with initial settings for the new control
	 *
	 * @class Base Class for HTMLElements.
	 * HTMLElements are native HTML elements which can be integrated into the UI5
	 * programming model by using this wrapper control. This wrapper control takes
	 * care to propagate the properties, the aggregations and the events. It also
	 * ensures to render the control and put the aggregated controls in the dedicated
	 * slots of the HTMLElement.
	 *
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @since 1.154.0
	 * @alias sap.ui.core.html.HTMLElement
	 */
	const HTMLElement = Control.extend("sap.ui.core.html.HTMLElement", {
		metadata : {
			"abstract": true,
			library : "sap.ui.core",
			properties: {
				/**
				 * The text content of the HTMLElement.
				 * Natively rendered as the "textContent".
				 * Note: For void HTML elements (e.g. <code>&lt;br&gt;</code>, <code>&lt;input&gt;</code>),
				 * this property has no effect as these elements cannot have text content.
				 * @public
				 */
				text: {
					type: "string",
					mapping: "textContent"
				}
			},
			aggregations: {
				/**
				 * Generic aggregation for child controls of HTMLElements.
				 * Every native HTMLElement can theoretically have children.
				 * @public
				 */
				children: { type: "sap.ui.core.Control", multiple: true }
			},
			defaultAggregation: "children"
		},

		constructor : function(sId, mSettings) {
			Control.apply(this, arguments);

			this._handleCustomEvent = this._handleCustomEvent.bind(this);

			this.__delegates = {
				onBeforeRendering: this._onBeforeRenderingDelegate,
				onAfterRendering: this._onAfterRenderingDelegate
			};
			this.addDelegate(this.__delegates, true, this, false);
		},

		renderer: HTMLElementRenderer

	}, /* Metadata constructor */ HTMLElementMetadata);

	/**
	 * @typedef {sap.ui.core.Element.MetadataOptions} sap.ui.core.html.HTMLElement.MetadataOptions
	 *
	 * The structure of the "metadata" object which is passed when inheriting from sap.ui.core.Element using its static "extend" method.
	 * See {@link sap.ui.core.Element.extend} for details on its usage.
	 *
	 * @property {string} tag
	 *     Tag name of the HTMLElement to be used in the renderer to render the HTML.
	 * @property {Object<string, string | sap.ui.core.html.HTMLElement.MetadataOptions.Property>} [properties]
	 *     An object literal whose properties each define a new managed property in the HTMLElement subclass.
	 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Property Property} for more details.
	 * @property {Object<string, string | sap.ui.core.html.HTMLElement.MetadataOptions.Aggregation>} [aggregations]
	 *     An object literal whose properties each define a new aggregation in the ManagedObject subclass.
	 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Aggregation Aggregation} for more details.
	 * @property {Object<string, string | sap.ui.core.html.HTMLElement.MetadataOptions.Association>} [associations]
	 *     An object literal whose properties each define a new association in the ManagedObject subclass.
	 *     See {@link sap.ui.base.ManagedObject.MetadataOptions.Association Association} for more details.
	 * @property {string[]} [getters]
	 *     Proxied public getters of the HTMLElement which are directly accessible on the wrapper Control.
	 * @property {string[]} [methods]
	 *     Proxied public methods of the HTMLElement which are directly accessible on the wrapper Control.
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Property} sap.ui.core.html.HTMLElement.MetadataOptions.Property
	 *
	 * An object literal describing a property of a class derived from <code>sap.ui.core.html.HTMLElement</code>.
	 * See {@link sap.ui.core.html.HTMLElement.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {"property" | "style" | "textContent" | "slot" | "none" | sap.ui.core.html.HTMLElement.MetadataOptions.Property.Mapping} [mapping="property"] Defines the mapping of the property to be either "property", "style", "textContent", "slot", or "none".
	 *     The default mapping of a property is "property" which either renders the value of the property into an attribute of the custom tag or forwards object properties to the mutator in the onAfterRendering phase.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.core.html.HTMLElement.MetadataOptions.Property.Mapping
	 *
	 * An object literal describing the mapping of a property of a class derived from <code>sap.ui.core.html.HTMLElement</code>.
	 *
	 * @property {"property" | "style" | "textContent" | "slot" | "none"} [type="property"] Defines the mapping of the property to be either "property", "style", "textContent", "slot", or "none".
	 *     The default mapping of a property is "property" which either renders the value of the property into an attribute of the custom tag or forwards object properties to the mutator in the onAfterRendering phase.
	 * @property {string} [to] Defines the target of the mapping of the property (e.g. the name of the attribute/property).
	 * @property {string} [formatter] Defines the name of the formatter function on the HTMLElement instance to format the value before its being mapped.
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Aggregation} sap.ui.core.html.HTMLElement.MetadataOptions.Aggregation
	 *
	 * An object literal describing a property of a class derived from <code>sap.ui.core.html.HTMLElement</code>.
	 * See {@link sap.ui.core.html.HTMLElement.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {string} [slot] Flag that marks the property as deprecated (defaults to false). May lead to an additional warning
	 *     log message at runtime when the property is still used. For the documentation, also add a <code>@deprecated</code> tag in the JSDoc,
	 *     describing since when it is deprecated and what any alternatives are.
	 *
	 * @public
	 */

	/**
	 * @typedef {sap.ui.base.ManagedObject.MetadataOptions.Association} sap.ui.core.html.HTMLElement.MetadataOptions.Association
	 *
	 * An object literal describing an association of a class derived from <code>sap.ui.core.html.HTMLElement</code>.
	 * See {@link sap.ui.core.html.HTMLElement.MetadataOptions MetadataOptions} for details on its usage.
	 *
	 * @property {"property" | sap.ui.core.html.HTMLElement.MetadataOptions.Association.Mapping} [mapping="property"] Defines the mapping of the association which defaults to "property".
	 *     Associations are forwarded to the corresponding mutator of the HTMLElement.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.core.html.HTMLElement.MetadataOptions.Association.Mapping
	 *
	 * An object literal describing the mapping of an association as property of a class derived from <code>sap.ui.core.html.HTMLElement</code>.
	 *
	 * @property {"property"} [type="property"] Defines the mapping of the association which defaults to "property".
	 *     Associations are forwarded to the corresponding mutator of the HTMLElement.
	 * @property {string} [to] Defines the target of the mapping of the association to which property it will be mapped to.
	 * @property {string} [formatter] Defines the name of the formatter function on the HTMLElement instance to format the value before its being mapped.
	 *
	 * @public
	 */

	/**
	 * Defines a new subclass of HTMLElement with the name <code>sClassName</code> and enriches it with
	 * the information contained in <code>oClassInfo</code>.
	 *
	 * <b>Note:</b>
	 * This class should not be extended manually. SAPUI5 provides a full set of predefined HTMLElements that can be used directly!
	 * For custom Web Components, use a dedicated class that extends {@link sap.ui.core.webc.WebComponent} instead.
	 *
	 * <code>oClassInfo</code> can contain the same information that {@link sap.ui.base.ManagedObject.extend} already accepts,
	 * plus the <code>dnd</code> property in the metadata object literal to configure drag-and-drop behavior
	 * (see {@link sap.ui.core.html.HTMLElement.MetadataOptions MetadataOptions} for details). Objects describing aggregations can also
	 * have a <code>dnd</code> property when used for a class extending <code>HTMLElement</code>
	 * (see {@link sap.ui.base.ManagedObject.MetadataOptions.AggregationDnD AggregationDnD}).
	 *
	 * @param {string} sClassName Name of the class to be created
	 * @param {object} [oClassInfo] Object literal with information about the class
	 * @param {sap.ui.core.html.HTMLElement.MetadataOptions} [oClassInfo.metadata] the metadata object describing the class: tag, properties, aggregations, events etc.
	 * @param {function} [FNMetaImpl] Constructor function for the metadata object. If not given, it defaults to <code>sap.ui.core.ElementMetadata</code>.
	 * @returns {function} Created class / constructor function
	 *
	 * @protected
	 * @static
	 * @name sap.ui.core.html.HTMLElement.extend
	 * @function
	 */

	/**
	 * Return the DOM element that should get the focus.
	 * This is the HTMLElement itself, or the element that is returned by the
	 * getFocusDomRef method of the HTMLElement.
	 *
	 * @override
	 * @return {Element} Returns the DOM Element that should get the focus
	 * @protected
	 */
	HTMLElement.prototype.getFocusDomRef = function() {
		const component = this.getDomRef();

		if (component && typeof component.getFocusDomRef === "function") {
			return component.getFocusDomRef();
		}

		return component;
	};

	/**
	 * Sets the focus to the HTMLElement.
	 * If the focus information is provided, the focus will be set to the element that is
	 * represented by the <code>oFocusedElement</code> property of the <code>oFocusInfo</code>.
	 *
	 * @override
	 * @param {object} [oFocusInfo={}] Options for setting the focus
	 * @param {boolean} [oFocusInfo.preventScroll=false] @since 1.60 if it's set to true, the focused
	 *   element won't be shifted into the viewport if it's not completely visible before the focus is set
	 * @param {any} [oFocusInfo.targetInfo] Further control-specific setting of the focus target within the control @since 1.98
	 * @public
	 */
	HTMLElement.prototype.focus = function(oFocusInfo) {
		if (oFocusInfo && oFocusInfo.oFocusedElement) {
			oFocusInfo.oFocusedElement.focus({ preventScroll: oFocusInfo.preventScroll });
			return;
		}
		Control.prototype.focus.apply(this, arguments);
	};

	/**
	 * Returns object with the focused element within the HTMLElement.
	 *
	 * @override
	 * @returns {object} an object representing the serialized focus information
	 * @protected
	 */
	HTMLElement.prototype.getFocusInfo = function () {
		const oFocusedElement = fnGetActiveElement(this.getDomRef());

		return {
			id: oFocusedElement ? oFocusedElement.id : null,
			oFocusedElement
		};
	};

	/**
	 * @private
	 */
	HTMLElement.prototype._onBeforeRenderingDelegate = function() {
		this._detachCustomEventsListeners();
	};

	/**
	 * @private
	 */
	HTMLElement.prototype._onAfterRenderingDelegate = function() {
		this._attachCustomEventsListeners();
		const oDomRef = this.getDomRef();
		this._updateObjectProperties(oDomRef);
	};

	/**
	 * Updates all object properties (can't be done via the renderer)
	 * @param {Element} oDomRef the native DOM reference of the HTMLElement instance
	 * @private
	 */
	HTMLElement.prototype._updateObjectProperties = function(oDomRef) {
		const oAttrProperties = this.getMetadata().getPropertiesByMapping("property");
		for (const sPropName in oAttrProperties) {
			if (this.isPropertyInitial(sPropName)) {
				continue; // do not set properties that were not explicitly set/bound
			}

			const oPropData = oAttrProperties[sPropName];
			const vPropValue = oPropData.get(this);

			if (oPropData.type === "object" || typeof vPropValue === "object") {
				const sHTMLElementPropName = oPropData._sMapTo ? oPropData._sMapTo : sPropName;
				oDomRef[sHTMLElementPropName] = vPropValue;
			}
		}
	};

	HTMLElement.prototype.attachEvent = function(sEventId) {
		const hadListeners = this.hasListeners(sEventId);
		Control.prototype.attachEvent.apply(this, arguments);
		if (!hadListeners) { // transition from 0 to 1
			// Lazily wire up the native DOM listener, only for events that are actually used
			this._connectNativeEvent(sEventId);
		}
		return this;
	};

	HTMLElement.prototype.detachEvent = function(sEventId) {
		Control.prototype.detachEvent.apply(this, arguments);
		if (!this.hasListeners(sEventId)) {
			this._connectNativeEvent(sEventId, true);
		}
		return this;
	};

	HTMLElement.prototype._connectNativeEvent = function(sEventId, bDeregister) {
		const oDomRef = this.getDomRef();
		const oEvent = this.getMetadata().getEvent(sEventId);
		const sCustomEventName = oEvent?._sCustomEventName;

		if (!oDomRef || !sCustomEventName) {
			return;
		}

		if (bDeregister) {
			oDomRef.removeEventListener(sCustomEventName, this._handleCustomEvent);
		} else {
			oDomRef.addEventListener(sCustomEventName, this._handleCustomEvent);
		}
	};

	HTMLElement.prototype._attachCustomEventsListeners = function() {
		for (const sEventId in this.mEventRegistry) {
			this._connectNativeEvent(sEventId);
		}
	};

	HTMLElement.prototype._detachCustomEventsListeners = function() {
		for (const sEventId in this.mEventRegistry) {
			this._connectNativeEvent(sEventId, true);
		}
	};

	HTMLElement.prototype._handleCustomEvent = function(oEvent) {
		// Prepare the event data object
		const oEventData = this._formatEventData(oEvent.detail);

		// Notify all custom events that are registered for this event name
		const mCustomEvents = this.getMetadata().getCustomEvents(oEvent.type);
		for (const sName in mCustomEvents) {
			const oEventObj = mCustomEvents[sName];
			const bPrevented = !oEventObj.fire(this, oEventData);
			if (bPrevented) {
				oEvent.preventDefault();
			}
		}
	};

	HTMLElement.prototype._formatEventData = function(vDetail) {
		// If the event data is an object, recursively convert all object dom element properties to control references
		if (typeof vDetail === "object") {
			return fnConvert(vDetail);
		}

		// If not an object, this is a DOM event such as click, just return an empty object
		return {};
	};

	HTMLElement.prototype._callPublicMethod = function(name, args) {
		if (!this.getDomRef()) {
			throw new Error("Method called before custom element has been created by: " + this.getId());
		}

		const converted = Array.from(args).map((arg) => { //  convert any public method parameter that is a Control instance to a DOM Ref
			if (arg instanceof Element) {
				return arg.getDomRef();
			}
			return arg;
		});

		let vResult = this.getDomRef()[name].apply(this.getDomRef(), converted);
		if (typeof vResult === "object") {
			vResult = fnConvert(vResult);
		}

		return vResult;
	};

	HTMLElement.prototype._callPublicGetter = function(name) {
		if (!this.getDomRef()) {
			throw new Error("Getter called before custom element has been created by: " + this.getId());
		}

		let vResult = this.getDomRef()[name];
		if (typeof vResult === "object") {
			vResult = fnConvert(vResult);
		}

		return vResult;
	};

	HTMLElement.prototype.destroy = function() {
		this._detachCustomEventsListeners();

		return Control.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Maps the "enabled" property to the "disabled" attribute.
	 * @param {boolean} bEnabled Indicates whether the control is enabled.
	 * @returns {boolean} Returns true if the control should be disabled, otherwise false.
	 * @private
	 */
	HTMLElement.prototype._mapEnabled = function(bEnabled) {
		return !bEnabled;
	};

	/**
	 * Maps the "textDirection" property to the "dir" attribute.
	 * @param {string} sTextDirection The text direction value.
	 * @returns {string|null} The mapped direction attribute value, or null if inherited.
	 * @private
	 */
	HTMLElement.prototype._mapTextDirection = function(sTextDirection) {
		if (sTextDirection === TextDirection.Inherit) {
			return null;
		}

		return sTextDirection.toLowerCase();
	};

	/**
	 * Formatter for URL-typed properties (mapping type for <code>sap.ui.core.URI</code>).
	 * Rejects values based on the {@link module:sap/base/security/URLListValidator}
	 * (e.g. <code>javascript:</code>, <code>data:</code>) by returning <code>null</code>,
	 * which in turn suppresses the attribute during rendering.
	 * Note: Formatters are render-time logic, which means the value is still accepted into the control state
	 * (the getter returns it as set).
	 * @param {string} sValue the property value (a URL)
	 * @returns {string|null} the value if it is a safe URL, otherwise <code>null</code>
	 * @private
	 */
	HTMLElement.prototype._validateUrl = function(sValue) {
		if (!sValue || typeof sValue !== "string") {
			return sValue;
		}
		if (URLListValidator.validate(sValue)) {
			return sValue;
		}
		Log.warning(`Rejected unsafe or invalid URL "${sValue}" for "<${this.getMetadata().getTag()} id='${this.getId()}'>"`);
		return null;
	};

	/**
	 * Formatter for the <code>rel</code> attribute (e.g. <code>&lt;a&gt;</code> and <code>&lt;area&gt;</code>).
	 * When the corresponding <code>target</code> opens a new browsing context (essentially anything other than
	 * "_self", "_parent" or "_top"), <code>noopener</code> is merged into the existing token list.
	 * @param {string} sRel the author-provided rel value
	 * @returns {string} the effective rel value
	 * @private
	 */
	HTMLElement.prototype._relForTarget = function(sRel) {
		const oMetadata = this.getMetadata();
		const sTarget = oMetadata.hasProperty("target") ? this.getProperty("target") : undefined;
		const bNewContext = sTarget && !["_self", "_parent", "_top"].includes(sTarget);
		if (!bNewContext) {
			return sRel;
		}

		// Merge "noopener" into the author's tokens (deduplicated, no leading/trailing space).
		// "noreferrer" already implies "noopener", so nothing is added in that case.
		const aTokens = (sRel || "").split(/\s+/).filter(Boolean);
		if (!aTokens.includes("noopener") && !aTokens.includes("noreferrer")) {
			aTokens.push("noopener");
		}
		return aTokens.join(" ");
	};

	/**
	 * Generates a string containing the ID's from the association ariaLabelledBy.
	 * @param {string[]} aAriaLabelledBy an array of IDs associated with this control
	 * @returns {string} sAriaLabelledBy
	 * @private
	 */
	HTMLElement.prototype._getAriaLabelledByForRendering = function (aAriaLabelledBy) {
		const aFilteredIds = LabelEnablement.getReferencingLabels(this);

		if (Array.isArray(aAriaLabelledBy)) {
			aAriaLabelledBy.forEach((sId) => {
				if (!aFilteredIds.includes(sId)) {
					aFilteredIds.unshift(sId);
				}
			});
		}

		return aFilteredIds.join(" ");
	};

	return HTMLElement;
});
