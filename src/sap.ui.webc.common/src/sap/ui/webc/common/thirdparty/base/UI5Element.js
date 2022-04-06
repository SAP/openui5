sap.ui.define(['./thirdparty/merge', './Boot', './UI5ElementMetadata', './EventProvider', './util/getSingletonElementInstance', './StaticAreaItem', './updateShadowRoot', './Render', './CustomElementsRegistry', './DOMObserver', './config/NoConflict', './locale/getEffectiveDir', './types/DataType', './util/StringHelper', './util/isValidPropertyName', './util/isDescendantOf', './util/SlotsHelper', './util/arraysAreEqual', './util/getClassCopy', './locale/RTLAwareRegistry', './theming/preloadLinks'], function (merge, Boot, UI5ElementMetadata, EventProvider, getSingletonElementInstance, StaticAreaItem, updateShadowRoot, Render, CustomElementsRegistry, DOMObserver, NoConflict, getEffectiveDir, DataType, StringHelper, isValidPropertyName, isDescendantOf, SlotsHelper, arraysAreEqual, getClassCopy, RTLAwareRegistry, preloadLinks) { 'use strict';

	let autoId = 0;
	const elementTimeouts = new Map();
	const uniqueDependenciesCache = new Map();
	function _invalidate(changeInfo) {
		if (this._suppressInvalidation) {
			return;
		}
		this.onInvalidation(changeInfo);
		this._changedState.push(changeInfo);
		Render.renderDeferred(this);
		this._eventProvider.fireEvent("invalidate", { ...changeInfo, target: this });
	}
	let metadata = {};
	class UI5Element extends HTMLElement {
		constructor() {
			super();
			this._changedState = [];
			this._suppressInvalidation = true;
			this._inDOM = false;
			this._fullyConnected = false;
			this._childChangeListeners = new Map();
			this._slotChangeListeners = new Map();
			this._eventProvider = new EventProvider();
			let deferredResolve;
			this._domRefReadyPromise = new Promise(resolve => {
				deferredResolve = resolve;
			});
			this._domRefReadyPromise._deferredResolve = deferredResolve;
			this._initializeState();
			this._upgradeAllProperties();
			if (this.constructor._needsShadowDOM()) {
				this.attachShadow({ mode: "open" });
			}
		}
		get _id() {
			if (!this.__id) {
				this.__id = `ui5wc_${++autoId}`;
			}
			return this.__id;
		}
		async connectedCallback() {
			this.setAttribute(this.constructor.getMetadata().getPureTag(), "");
			if (this.constructor.getMetadata().supportsF6FastNavigation()) {
				this.setAttribute("data-sap-ui-fastnavgroup", "true");
			}
			const slotsAreManaged = this.constructor.getMetadata().slotsAreManaged();
			this._inDOM = true;
			if (slotsAreManaged) {
				this._startObservingDOMChildren();
				await this._processChildren();
			}
			if (!this._inDOM) {
				return;
			}
			Render.renderImmediately(this);
			this._domRefReadyPromise._deferredResolve();
			this._fullyConnected = true;
			if (typeof this.onEnterDOM === "function") {
				this.onEnterDOM();
			}
		}
		disconnectedCallback() {
			const slotsAreManaged = this.constructor.getMetadata().slotsAreManaged();
			this._inDOM = false;
			if (slotsAreManaged) {
				this._stopObservingDOMChildren();
			}
			if (this._fullyConnected) {
				if (typeof this.onExitDOM === "function") {
					this.onExitDOM();
				}
				this._fullyConnected = false;
			}
			if (this.staticAreaItem && this.staticAreaItem.parentElement) {
				this.staticAreaItem.parentElement.removeChild(this.staticAreaItem);
			}
			Render.cancelRender(this);
		}
		_startObservingDOMChildren() {
			const shouldObserveChildren = this.constructor.getMetadata().hasSlots();
			if (!shouldObserveChildren) {
				return;
			}
			const canSlotText = this.constructor.getMetadata().canSlotText();
			const mutationObserverOptions = {
				childList: true,
				subtree: canSlotText,
				characterData: canSlotText,
			};
			DOMObserver.observeDOMNode(this, this._processChildren.bind(this), mutationObserverOptions);
		}
		_stopObservingDOMChildren() {
			DOMObserver.unobserveDOMNode(this);
		}
		async _processChildren() {
			const hasSlots = this.constructor.getMetadata().hasSlots();
			if (hasSlots) {
				await this._updateSlots();
			}
		}
		async _updateSlots() {
			const slotsMap = this.constructor.getMetadata().getSlots();
			const canSlotText = this.constructor.getMetadata().canSlotText();
			const domChildren = Array.from(canSlotText ? this.childNodes : this.children);
			const slotsCachedContentMap = new Map();
			const propertyNameToSlotMap = new Map();
			for (const [slotName, slotData] of Object.entries(slotsMap)) {
				const propertyName = slotData.propertyName || slotName;
				propertyNameToSlotMap.set(propertyName, slotName);
				slotsCachedContentMap.set(propertyName, [...this._state[propertyName]]);
				this._clearSlot(slotName, slotData);
			}
			const autoIncrementMap = new Map();
			const slottedChildrenMap = new Map();
			const allChildrenUpgraded = domChildren.map(async (child, idx) => {
				const slotName = SlotsHelper.getSlotName(child);
				const slotData = slotsMap[slotName];
				if (slotData === undefined) {
					const validValues = Object.keys(slotsMap).join(", ");
					console.warn(`Unknown slotName: ${slotName}, ignoring`, child, `Valid values are: ${validValues}`);
					return;
				}
				if (slotData.individualSlots) {
					const nextIndex = (autoIncrementMap.get(slotName) || 0) + 1;
					autoIncrementMap.set(slotName, nextIndex);
					child._individualSlot = `${slotName}-${nextIndex}`;
				}
				if (child instanceof HTMLElement) {
					const localName = child.localName;
					const isCustomElement = localName.includes("-");
					if (isCustomElement) {
						const isDefined = window.customElements.get(localName);
						if (!isDefined) {
							const whenDefinedPromise = window.customElements.whenDefined(localName);
							let timeoutPromise = elementTimeouts.get(localName);
							if (!timeoutPromise) {
								timeoutPromise = new Promise(resolve => setTimeout(resolve, 1000));
								elementTimeouts.set(localName, timeoutPromise);
							}
							await Promise.race([whenDefinedPromise, timeoutPromise]);
						}
						window.customElements.upgrade(child);
					}
				}
				child = this.constructor.getMetadata().constructor.validateSlotValue(child, slotData);
				if (child.isUI5Element && slotData.invalidateOnChildChange) {
					const method = (child.attachInvalidate || child._attachChange).bind(child);
					method(this._getChildChangeListener(slotName));
				}
				if (SlotsHelper.isSlot(child)) {
					this._attachSlotChange(child, slotName);
				}
				const propertyName = slotData.propertyName || slotName;
				if (slottedChildrenMap.has(propertyName)) {
					slottedChildrenMap.get(propertyName).push({ child, idx });
				} else {
					slottedChildrenMap.set(propertyName, [{ child, idx }]);
				}
			});
			await Promise.all(allChildrenUpgraded);
			slottedChildrenMap.forEach((children, propertyName) => {
				this._state[propertyName] = children.sort((a, b) => a.idx - b.idx).map(_ => _.child);
			});
			let invalidated = false;
			for (const [slotName, slotData] of Object.entries(slotsMap)) {
				const propertyName = slotData.propertyName || slotName;
				if (!arraysAreEqual(slotsCachedContentMap.get(propertyName), this._state[propertyName])) {
					_invalidate.call(this, {
						type: "slot",
						name: propertyNameToSlotMap.get(propertyName),
						reason: "children",
					});
					invalidated = true;
				}
			}
			if (!invalidated) {
				_invalidate.call(this, {
					type: "slot",
					name: "default",
					reason: "textcontent",
				});
			}
		}
		_clearSlot(slotName, slotData) {
			const propertyName = slotData.propertyName || slotName;
			const children = this._state[propertyName];
			children.forEach(child => {
				if (child && child.isUI5Element) {
					const method = (child.detachInvalidate || child._detachChange).bind(child);
					method(this._getChildChangeListener(slotName));
				}
				if (SlotsHelper.isSlot(child)) {
					this._detachSlotChange(child, slotName);
				}
			});
			this._state[propertyName] = [];
		}
		attachInvalidate(callback) {
			this._eventProvider.attachEvent("invalidate", callback);
		}
		detachInvalidate(callback) {
			this._eventProvider.detachEvent("invalidate", callback);
		}
		_onChildChange(slotName, childChangeInfo) {
			if (!this.constructor.getMetadata().shouldInvalidateOnChildChange(slotName, childChangeInfo.type, childChangeInfo.name)) {
				return;
			}
			_invalidate.call(this, {
				type: "slot",
				name: slotName,
				reason: "childchange",
				child: childChangeInfo.target,
			});
		}
		attributeChangedCallback(name, oldValue, newValue) {
			const properties = this.constructor.getMetadata().getProperties();
			const realName = name.replace(/^ui5-/, "");
			const nameInCamelCase = StringHelper.kebabToCamelCase(realName);
			if (properties.hasOwnProperty(nameInCamelCase)) {
				const propertyTypeClass = properties[nameInCamelCase].type;
				if (propertyTypeClass === Boolean) {
					newValue = newValue !== null;
				} else if (isDescendantOf(propertyTypeClass, DataType)) {
					newValue = propertyTypeClass.attributeToProperty(newValue);
				}
				this[nameInCamelCase] = newValue;
			}
		}
		_updateAttribute(name, newValue) {
			if (!this.constructor.getMetadata().hasAttribute(name)) {
				return;
			}
			const properties = this.constructor.getMetadata().getProperties();
			const propertyTypeClass = properties[name].type;
			const attrName = StringHelper.camelToKebabCase(name);
			const attrValue = this.getAttribute(attrName);
			if (propertyTypeClass === Boolean) {
				if (newValue === true && attrValue === null) {
					this.setAttribute(attrName, "");
				} else if (newValue === false && attrValue !== null) {
					this.removeAttribute(attrName);
				}
			} else if (isDescendantOf(propertyTypeClass, DataType)) {
				this.setAttribute(attrName, propertyTypeClass.propertyToAttribute(newValue));
			} else if (typeof newValue !== "object") {
				if (attrValue !== newValue) {
					this.setAttribute(attrName, newValue);
				}
			}
		}
		_upgradeProperty(prop) {
			if (this.hasOwnProperty(prop)) {
				const value = this[prop];
				delete this[prop];
				this[prop] = value;
			}
		}
		_upgradeAllProperties() {
			const allProps = this.constructor.getMetadata().getPropertiesList();
			allProps.forEach(this._upgradeProperty, this);
		}
		_initializeState() {
			this._state = { ...this.constructor.getMetadata().getInitialState() };
		}
		_getChildChangeListener(slotName) {
			if (!this._childChangeListeners.has(slotName)) {
				this._childChangeListeners.set(slotName, this._onChildChange.bind(this, slotName));
			}
			return this._childChangeListeners.get(slotName);
		}
		_getSlotChangeListener(slotName) {
			if (!this._slotChangeListeners.has(slotName)) {
				this._slotChangeListeners.set(slotName, this._onSlotChange.bind(this, slotName));
			}
			return this._slotChangeListeners.get(slotName);
		}
		_attachSlotChange(child, slotName) {
			child.addEventListener("slotchange", this._getSlotChangeListener(slotName));
		}
		_detachSlotChange(child, slotName) {
			child.removeEventListener("slotchange", this._getSlotChangeListener(slotName));
		}
		_onSlotChange(slotName) {
			_invalidate.call(this, {
				type: "slot",
				name: slotName,
				reason: "slotchange",
			});
		}
		onInvalidation(changeInfo) {}
		_render() {
			const hasIndividualSlots = this.constructor.getMetadata().hasIndividualSlots();
			this._suppressInvalidation = true;
			if (typeof this.onBeforeRendering === "function") {
				this.onBeforeRendering();
			}
			if (this._onComponentStateFinalized) {
				this._onComponentStateFinalized();
			}
			this._suppressInvalidation = false;
			this._changedState = [];
			if (this.constructor._needsShadowDOM()) {
				updateShadowRoot(this);
			}
			if (this.staticAreaItem) {
				this.staticAreaItem.update();
			}
			if (hasIndividualSlots) {
				this._assignIndividualSlotsToChildren();
			}
			if (typeof this.onAfterRendering === "function") {
				this.onAfterRendering();
			}
		}
		_assignIndividualSlotsToChildren() {
			const domChildren = Array.from(this.children);
			domChildren.forEach(child => {
				if (child._individualSlot) {
					child.setAttribute("slot", child._individualSlot);
				}
			});
		}
		_waitForDomRef() {
			return this._domRefReadyPromise;
		}
		getDomRef() {
			if (typeof this._getRealDomRef === "function") {
				return this._getRealDomRef();
			}
			if (!this.shadowRoot || this.shadowRoot.children.length === 0) {
				return;
			}
			const children = [...this.shadowRoot.children].filter(child => !["link", "style"].includes(child.localName));
			if (children.length !== 1) {
				console.warn(`The shadow DOM for ${this.constructor.getMetadata().getTag()} does not have a top level element, the getDomRef() method might not work as expected`);
			}
			return children[0];
		}
		getFocusDomRef() {
			const domRef = this.getDomRef();
			if (domRef) {
				const focusRef = domRef.querySelector("[data-sap-focus-ref]");
				return focusRef || domRef;
			}
		}
		async getFocusDomRefAsync() {
			await this._waitForDomRef();
			return this.getFocusDomRef();
		}
		async focus() {
			await this._waitForDomRef();
			const focusDomRef = this.getFocusDomRef();
			if (focusDomRef && typeof focusDomRef.focus === "function") {
				focusDomRef.focus();
			}
		}
		fireEvent(name, data, cancelable = false, bubbles = true) {
			const eventResult = this._fireEvent(name, data, cancelable, bubbles);
			const camelCaseEventName = StringHelper.kebabToCamelCase(name);
			if (camelCaseEventName !== name) {
				return eventResult && this._fireEvent(camelCaseEventName, data, cancelable);
			}
			return eventResult;
		}
		_fireEvent(name, data, cancelable = false, bubbles = true) {
			const noConflictEvent = new CustomEvent(`ui5-${name}`, {
				detail: data,
				composed: false,
				bubbles,
				cancelable,
			});
			const noConflictEventResult = this.dispatchEvent(noConflictEvent);
			if (NoConflict.skipOriginalEvent(name)) {
				return noConflictEventResult;
			}
			const normalEvent = new CustomEvent(name, {
				detail: data,
				composed: false,
				bubbles,
				cancelable,
			});
			const normalEventResult = this.dispatchEvent(normalEvent);
			return normalEventResult && noConflictEventResult;
		}
		getSlottedNodes(slotName) {
			return SlotsHelper.getSlottedElementsList(this[slotName]);
		}
		get effectiveDir() {
			RTLAwareRegistry.markAsRtlAware(this.constructor);
			return getEffectiveDir(this);
		}
		get isUI5Element() {
			return true;
		}
		static get observedAttributes() {
			return this.getMetadata().getAttributesList();
		}
		static _needsShadowDOM() {
			return !!this.template;
		}
		static _needsStaticArea() {
			return !!this.staticAreaTemplate;
		}
		getStaticAreaItemDomRef() {
			if (!this.constructor._needsStaticArea()) {
				throw new Error("This component does not use the static area");
			}
			if (!this.staticAreaItem) {
				this.staticAreaItem = StaticAreaItem.createInstance();
				this.staticAreaItem.setOwnerElement(this);
			}
			if (!this.staticAreaItem.parentElement) {
				getSingletonElementInstance("ui5-static-area").appendChild(this.staticAreaItem);
			}
			return this.staticAreaItem.getDomRef();
		}
		static _generateAccessors() {
			const proto = this.prototype;
			const slotsAreManaged = this.getMetadata().slotsAreManaged();
			const properties = this.getMetadata().getProperties();
			for (const [prop, propData] of Object.entries(properties)) {
				if (!isValidPropertyName(prop)) {
					console.warn(`"${prop}" is not a valid property name. Use a name that does not collide with DOM APIs`);
				}
				if (propData.type === Boolean && propData.defaultValue) {
					throw new Error(`Cannot set a default value for property "${prop}". All booleans are false by default.`);
				}
				if (propData.type === Array) {
					throw new Error(`Wrong type for property "${prop}". Properties cannot be of type Array - use "multiple: true" and set "type" to the single value type, such as "String", "Object", etc...`);
				}
				if (propData.type === Object && propData.defaultValue) {
					throw new Error(`Cannot set a default value for property "${prop}". All properties of type "Object" are empty objects by default.`);
				}
				if (propData.multiple && propData.defaultValue) {
					throw new Error(`Cannot set a default value for property "${prop}". All multiple properties are empty arrays by default.`);
				}
				Object.defineProperty(proto, prop, {
					get() {
						if (this._state[prop] !== undefined) {
							return this._state[prop];
						}
						const propDefaultValue = propData.defaultValue;
						if (propData.type === Boolean) {
							return false;
						} else if (propData.type === String) {
							return propDefaultValue;
						} else if (propData.multiple) {
							return [];
						} else {
							return propDefaultValue;
						}
					},
					set(value) {
						let isDifferent;
						value = this.constructor.getMetadata().constructor.validatePropertyValue(value, propData);
						const oldState = this._state[prop];
						if (propData.multiple && propData.compareValues) {
							isDifferent = !arraysAreEqual(oldState, value);
						} else if (isDescendantOf(propData.type, DataType)) {
							isDifferent = !propData.type.valuesAreEqual(oldState, value);
						} else {
							isDifferent = oldState !== value;
						}
						if (isDifferent) {
							this._state[prop] = value;
							_invalidate.call(this, {
								type: "property",
								name: prop,
								newValue: value,
								oldValue: oldState,
							});
							this._updateAttribute(prop, value);
						}
					},
				});
			}
			if (slotsAreManaged) {
				const slots = this.getMetadata().getSlots();
				for (const [slotName, slotData] of Object.entries(slots)) {
					if (!isValidPropertyName(slotName)) {
						console.warn(`"${slotName}" is not a valid property name. Use a name that does not collide with DOM APIs`);
					}
					const propertyName = slotData.propertyName || slotName;
					Object.defineProperty(proto, propertyName, {
						get() {
							if (this._state[propertyName] !== undefined) {
								return this._state[propertyName];
							}
							return [];
						},
						set() {
							throw new Error("Cannot set slot content directly, use the DOM APIs (appendChild, removeChild, etc...)");
						},
					});
				}
			}
		}
		static get metadata() {
			return metadata;
		}
		static set metadata(newMetadata) {
			metadata = newMetadata;
		}
		static get styles() {
			return "";
		}
		static get staticAreaStyles() {
			return "";
		}
		static get dependencies() {
			return [];
		}
		static getUniqueDependencies() {
			if (!uniqueDependenciesCache.has(this)) {
				const filtered = this.dependencies.filter((dep, index, deps) => deps.indexOf(dep) === index);
				uniqueDependenciesCache.set(this, filtered);
			}
			return uniqueDependenciesCache.get(this);
		}
		static whenDependenciesDefined() {
			return Promise.all(this.getUniqueDependencies().map(dep => dep.define()));
		}
		static async onDefine() {
			return Promise.resolve();
		}
		static async define() {
			await Boot.boot();
			await Promise.all([
				this.whenDependenciesDefined(),
				this.onDefine(),
			]);
			const tag = this.getMetadata().getTag();
			const altTag = this.getMetadata().getAltTag();
			const definedLocally = CustomElementsRegistry.isTagRegistered(tag);
			const definedGlobally = customElements.get(tag);
			if (definedGlobally && !definedLocally) {
				CustomElementsRegistry.recordTagRegistrationFailure(tag);
			} else if (!definedGlobally) {
				this._generateAccessors();
				CustomElementsRegistry.registerTag(tag);
				window.customElements.define(tag, this);
				preloadLinks(this);
				if (altTag && !customElements.get(altTag)) {
					CustomElementsRegistry.registerTag(altTag);
					window.customElements.define(altTag, getClassCopy(this, () => {
						console.log(`The ${altTag} tag is deprecated and will be removed in the next release, please use ${tag} instead.`);
					}));
				}
			}
			return this;
		}
		static getMetadata() {
			if (this.hasOwnProperty("_metadata")) {
				return this._metadata;
			}
			const metadataObjects = [this.metadata];
			let klass = this;
			while (klass !== UI5Element) {
				klass = Object.getPrototypeOf(klass);
				metadataObjects.unshift(klass.metadata);
			}
			const mergedMetadata = merge({}, ...metadataObjects);
			this._metadata = new UI5ElementMetadata(mergedMetadata);
			return this._metadata;
		}
	}

	return UI5Element;

});
