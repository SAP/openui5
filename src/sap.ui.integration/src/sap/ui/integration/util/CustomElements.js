/*!
* ${copyright}
*/

sap.ui.define([
	"sap/base/Log"
], function (
	Log
) {
	"use strict";

	//polyfill for getAttributeNames
	var Element = window.Element;
	if (Element.prototype.getAttributeNames == undefined) {
		Element.prototype.getAttributeNames = function () {
			var attributes = this.attributes;
			var length = attributes.length;
			var result = new Array(length);
			for (var i = 0; i < length; i++) {
				result[i] = attributes[i].name;
			}
			return result;
		};
	}
	var eventHelper = document.createElement("span"),
		observer,
		oInterface = {
			registerTag: function registerTag(tagName, prefix, controlClass) {
				prefix = prefix + "-";
				var prefixedTagName = prefix + tagName;
				createTagClass.apply(this, [prefixedTagName, controlClass]);
			},
			coreInstance: null
		};

	// polyfill for CustomEvent
	function initCustomEvents() {
		if (typeof window.CustomEvent === "function") {
			return false;
		}

		function CustomEvent(event, params) {
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};
			var evt = document.createEvent('CustomEvent');
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			return evt;
		}
		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	}

	function fireCustomEvent(node, eventType, data) {
		var event = new window.CustomEvent(eventType),
			attrValue = node.getAttribute("on-" + eventType);
		event.data = data;
		if (attrValue) {
			eventHelper.setAttribute("onclick", attrValue);
			node.addEventListener(eventType, eventHelper.onclick);
		}
		node.dispatchEvent(event);
	}

	function createObserver() {
		// Options for the observer (which mutations to observe)
		var config = {
			childList: true,
			subtree: true
		};

		// Callback function to execute when mutations are observed
		function callback(mutationsList, observer) {
			mutationsList.forEach(function (mutation) {
				if (mutation.type == 'childList') {
					var addedNodes = mutation.addedNodes,
						removedNodes = mutation.removedNodes,
						node,
						xnode,
						count,
						aTags,
						i;
					for (count = 0; count < addedNodes.length; count++) {
						node = addedNodes[count];
						if (!document.createCustomElement._querySelector) {
							return;
						}
						if (node.tagName && document.createCustomElement.hasOwnProperty(node.tagName.toLowerCase())) {
							if (!node._control) {
								document.createCustomElement[node.tagName.toLowerCase()].connectToNode(node);
							}
							node._control._connectedCallback();
						}
						if (node.tagName) {
							aTags = node.querySelectorAll(document.createCustomElement._querySelector);
							for (i = 0; i < aTags.length; i++) {
								xnode = aTags[i];
								if (xnode.tagName && document.createCustomElement.hasOwnProperty(xnode.tagName.toLowerCase())) {
									if (!xnode._control) {
										document.createCustomElement[xnode.tagName.toLowerCase()].connectToNode(xnode);
									}
									xnode._control._connectedCallback();
								}
							}
						}
					}
					for (count = 0; count < removedNodes.length; count++) {
						node = removedNodes[count];
						if (!document.createCustomElement._querySelector) {
							return;
						}
						if (node._control) {
							node._control._disconnectedCallback();
						}
						if (node.tagName) {
							aTags = node.querySelectorAll(document.createCustomElement._querySelector);
							for (i = 0; i < aTags.length; i++) {
								xnode = aTags[i];
								if (xnode._control) {
									xnode._control._disconnectedCallback();
								}
							}
						}
					}
				} else if (mutation.type === "attributes" && mutation.target && mutation.target._control) {
					mutation.target._control._changeProperty.call(mutation.target._control, mutation.attributeName, mutation.target.getAttribute(mutation.attributeName));
				}
			});
		}

		// Create an observer instance linked to the callback function
		var observer = new window.MutationObserver(callback);

		// Start observing the target node for configured mutations
		if (!document.body) {
			Log.error("CustomElements.js was loaded before a body element was present in the DOM. Ensure to load CustomElements.js after the document was parsed, i.e. after the windows onload event.");
			return null;
		}
		observer.observe(document.body, config);
		return observer;
	}

	function createTagClass(prefixedTagName, TagImpl) {
		if (document.createCustomElement[prefixedTagName]) {
			return document.createCustomElement[prefixedTagName];
		}
		var tagMetadata = TagImpl.getMetadata(),
			tagAllProperties = tagMetadata.getAllProperties(),
			tagAllAssociations = tagMetadata.getAllAssociations(),
			tagAllEvents = tagMetadata.getEvents(),
			tagAllAttributes = {};
		//create attributes for properties
		Object.keys(tagAllProperties).map(function (n) {
			tagAllAttributes[n.toLowerCase()] = tagAllProperties[n];
		});
		//create attributes for associations
		Object.keys(tagAllAssociations).map(function (n) {
			tagAllAttributes[n.toLowerCase()] = tagAllAssociations[n];
		});
		//create attributes for all events and register
		Object.keys(tagAllEvents).map(function (n) {
			tagAllAttributes["on-" + n.toLowerCase()] = tagAllEvents[n];
		});

		var Tag = function (node) {
			this._node = node;
			node._control = this;
			Tag.initCloneNode(node);
			Tag.defineProperties(node);
			this._controlImpl = this._controlImpl || new TagImpl(node.id);
			this._changeProperties(node);
			//TODO: How to avoid the UI Area?
			node.setAttribute("id", this._controlImpl.getId() + "-area");
			this._uiArea = oInterface.coreInstance.createUIArea(node);
			this._uiArea.addContent(this._controlImpl);
			if (Tag.isInActiveDocument(node)) {
				this._connectedCallback();
			}

			// attach event listeners for all the control events
			Object.keys(tagAllEvents).map(function (n) {
				this._controlImpl[tagAllEvents[n]._sMutator](function(oEvent) {
					fireCustomEvent(node, n, oEvent);
				});
			}.bind(this));
			return node;
		};

		Tag.cloneNode = function () {
			var clone = this._cloneNode.call(this);
			clone.removeAttribute("data-sap-ui-area");
			clone.removeAttribute("id");
			clone._controlImpl = this._control._controlImpl.clone();
			Tag.connectToNode(clone);
			return clone;
		};

		Tag.initCloneNode = function (node) {
			if (!node._cloneNode) {
				node._cloneNode = node.cloneNode;
				node.cloneNode = Tag.cloneNode;
			}
		};

		/**
		 * Checks whether the given node is in the active document
		 */
		Tag.isInActiveDocument = function (node) {
			return !!(node.parentNode && node.ownerDocument === document);
		};

		Tag.defineProperty = function (node, name, defaultValue) {
			Object.defineProperty(node, name, {
				get: function () {
					return tagMetadata.getProperty(name).get(node._control._controlImpl);
				},
				set: function (value) {
					node._control._changeProperty(name, value);
					return tagMetadata.getProperty(name).get(node._control._controlImpl);
				}
			});
		};

		Tag.defineProperties = function (node) {
			for (var name in tagAllAttributes) {
				if (name.charAt(0) !== "_") {
					Tag.defineProperty(node, name, tagAllAttributes[name].defaultValue);
				}
			}
		};
		Tag.observer = observer;
		Tag.connectToNode = function (node) {
			new Tag(node);
			return Tag.observer && Tag.observer.observe(node, {
				attributes: true
			});
		};

		Tag.prototype._connectedCallback = function () {
			this._connected || ((this._connected = true) && this._controlImpl.invalidate());
		};
		Tag.prototype._disconnectedCallback = function () {
			this._connected = false;
		};

		Tag.prototype._changeProperties = function (node) {
			var aNames = node.getAttributeNames();
			for (var i = 0; i < aNames.length; i++) {
				this._changeProperty(aNames[i], node.getAttribute(aNames[i]));
			}
		};

		Tag.prototype._changeProperty = function (property, newValue) {
			var oTagImpl = this._controlImpl,
				oSetting = tagAllAttributes[property];

			if (property === "id") {
				return;
			}
			if (oSetting && (oSetting._iKind === 0 /*property*/ || oSetting._iKind === 3 /*association*/ )) {
				var oType = oSetting.getType();
				var vValue = oType.parseValue(newValue);
				var vOldValue = oSetting.get(oTagImpl);
				if (oType.isValid(vValue)) {
					oSetting.set(oTagImpl, vValue);
				} else {
					oSetting.set(oTagImpl, vOldValue);
				}
			} else if (property === "class") {
				var aClasss = newValue.split(" ");
				this._addedClasses = this._addedClasses || [];
				this._addedClasses.forEach(function (s) {
					if (s) {
						oTagImpl.removeStyleClass(s);
					}
				});
				aClasss.forEach(function (s) {
					s = oTagImpl.addStyleClass(s);
				});
				this._addedClasses = aClasss;
			}
		};
		Tag.prototype.fireCustomEvent = function (eventType, data) {
			fireCustomEvent(this._node, eventType, data);
		};
		var createElement = document.createCustomElement;
		createElement[prefixedTagName] = Tag;
		if (createElement._querySelector) {
			createElement._querySelector += ",";
		} else {
			Object.defineProperty(createElement, "_querySelector", {
				enumerable: false,
				writable: true
			});
			createElement._querySelector = "";
		}
		var sSelector = prefixedTagName.replace("-", "\\-");
		createElement._querySelector += sSelector;
		var customTags = document.querySelectorAll(sSelector);
		for (var i = 0; i < customTags.length; i++) {
			var node = customTags[i];
			createElement[prefixedTagName].connectToNode(node);
		}
		return Tag;

	}

	//initialize createCustomElement if it does not exist
	if (!document.createCustomElement) {
		document.createCustomElement = function (tagName) {
			var node = document.createElement(tagName);
			document.createCustomElement[tagName].connectToNode(node);
			return node;
		};
	}
	//allow custom event on the tag as properties
	initCustomEvents();
	observer = createObserver();
	return oInterface;
});