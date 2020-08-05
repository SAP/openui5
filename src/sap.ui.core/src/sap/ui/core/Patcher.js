/*!
 * ${copyright}
 */

// Provides the Patcher for RenderManager
sap.ui.define(["sap/ui/Device"], function(Device) {
	"use strict";


	/**
	 * Provides custom mutators for attributes.
	 *
	 * Mutator functions are executed before the properties are set or removed.
	 * If the return value of the function is <code>true</code>, then the attribute will not be set.
	 *
	 * Default mutators are used to update DOM properties apart from attributes.
	 * According to the IDL definition some HTML attributes have no 1:1 mapping to properties.
	 * For more information, see {@link https://www.w3.org/TR/REC-DOM-Level-1/idl-definitions.html}.
	 */
	var AttributeMutators = {
		value: function(oElement, sNewValue) {
			oElement.value = (sNewValue == null) ? "" : sNewValue;
		},
		checked: function(oElement, sNewValue) {
			oElement.checked = (sNewValue == null) ? false : true;
		},
		selected: function(oElement, sNewValue) {
			oElement.selected = (sNewValue == null) ? false : true;
		}
	};

	// in IE11 the order of the style rules might differ
	if (Device.browser.msie) {
		AttributeMutators.style = function(oElement, sNewValue, sOldValue) {
			if (sNewValue && sOldValue && sNewValue != sOldValue && sNewValue.length == sOldValue.length) {
				return (sNewValue + " ").split("; ").sort().toString() == (sOldValue + " ").split("; ").sort().toString();
			}
		};
	}

	/**
	 * Creates an HTML element from the given tag name and parent namespace
	 */
	function createElement(sTagName, oParent) {
		if (sTagName == "svg") {
			return document.createElementNS("http://www.w3.org/2000/svg", "svg");
		}

		var sNamespaceURI = oParent.namespaceURI;
		if (sNamespaceURI == "http://www.w3.org/1999/xhtml" || oParent.localName == "foreignObject") {
			return document.createElement(sTagName);
		}

		return document.createElementNS(sNamespaceURI, sTagName);
	}

	/**
	 * Provides an API for an in-place DOM patching.
	 *
	 * @alias sap.ui.core.Patcher
	 * @class
	 * @static
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var Patcher = {
		_sStyles: "",                     // Style collection of the current node
		_sClasses: "",                    // Class name collection of the current node
		_aContexts: [],                   // Context stack of the Patcher
		_mAttributes: Object.create(null) // Set of all attributes name-value pair
	};

	/**
	 * Sets the root node where the patching is going to be started.
	 *
	 * The root node must be set once before calling any other APIs.
	 *
	 * @param {Node} The DOM node where the patching is going to be started
	 */
	Patcher.setRootNode = function(oRootNode) {
		if (this._oRoot) {
			this._aContexts.push(this._getContext());
		}

		this._setContext({
			_oRoot: oRootNode
		});
	};

	/**
	 * Returns the current node being patched.
	 *
	 * @returns {Node} The node being patched
	 */
	Patcher.getCurrentNode = function() {
		return this._oCurrent;
	};

	/**
	 * Cleans up the current patching references and makes the patcher ready for the next patching.
	 */
	Patcher.reset = function() {
		this._setContext(this._aContexts.pop());
		this._oParent = this._oReference = null;
	};

	/**
	 * Defines a hook method that will be called in order to find an element corresponding to the element currently being patched.
	 *
	 * By default, <code>Patcher</code> tries to map elements by their ID to prevent different logical subtrees from being reused.
	 * This hook method gets called only if the default matching fails.
	 *
	 * @param {string} sId ID of the element defined by <code>openStart</code> or <code>voidStart</code>
	 * @param {string} sTagName Tag name of the element defined by <code>openStart</code> or <code>voidStart</code>
	 * @param {HTMLElement} oCurrent HTML element being patched
	 * @param {HTMLElement} oParent Parent of the HTML element being patched
	 * @returns {HTMLElement|null} Matching HTML element or null if there is no match
	 * @virtual
	 */
	Patcher.matchElement = function(sId, sTagName, oCurrent, oParent) {
		return null;
	};

	/**
	 * Defines a hook method that will be called before creating new elements.
	 *.
	 * If this hook method returns an HTML element, then patching continues on this element and its subtree,
	 * otherwise new elements to be inserted into the document are created from scratch.
 	 *
 	 * @param {string} sId ID of the element defined by <code>openStart</code> or <code>voidStart</code>
	 * @param {string} sTagName Tag name of the element defined by <code>openStart</code> or <code>voidStart</code>
	 * @param {HTMLElement} oParent HTML element where the returned element is to be inserted
	 * @returns {HTMLElement|null} Clone of the corresponding HTML element to be patched or null to create elements from scratch
	 * @virtual
	 */
	Patcher.createElement = function(sId, sTagName, oParent) {
		return null;
	};

	/**
	 * Returns the current patching context of the <code>Patcher</code>.
	 */
	Patcher._getContext = function() {
		return this._applyContext(this, {});
	};

	/**
	 * Sets the given context as a current context of the <code>Patcher</code>.
	 *
	 * @param {object} Context object to be set
	 */
	Patcher._setContext = function(oContext) {
		this._applyContext(oContext || {}, this);
	};

	/**
	 * Gets the context object from the source and sets it to the target.
	 *
	 * @param {object} Source object from which the context is retrieved
	 * @param {object} Target object where the retrieved context is set
	 * @returns {object} New context of the target
	 */
	Patcher._applyContext = function(oSource, oTarget) {
		oTarget._oRoot = oSource._oRoot || null;                 // Root node where the patching is started
		oTarget._oCurrent = oSource._oCurrent || null;           // Current node being patched
		oTarget._oNewElement = oSource._oNewElement || null;     // Newly created element which is not yet inserted into the DOM tree.
		oTarget._oNewParent = oSource._oNewParent || null;       // HTML element where the newly created element to be inserted
		oTarget._oNewReference = oSource._oNewReference || null; // Reference element that corresponds to the position of the newly created element
		oTarget._iTagOpenState = oSource._iTagOpenState || 0;    // 0: Tag is Closed, 1: Tag is Created, has no attributes, 2: Tag is Existing, might have attributes
		return oTarget;
	};

	/**
	 * Sets the next node that is going to be patched.
	 */
	Patcher._walkOnTree = function() {
		this._oReference = null;
		if (!this._oCurrent) {
			this._oParent = this._oRoot.parentNode;
			this._oCurrent = this._oRoot;
		} else if (this._iTagOpenState) {
			this._oParent = this._oCurrent;
			this._oCurrent = this._oCurrent.firstChild;
		} else {
			this._oParent = this._oCurrent.parentNode;
			this._oCurrent = this._oCurrent.nextSibling;
		}
	};

	/**
	 * Finds the matching HTML element from the given ID and moves the corresponding element to the correct location.
	 */
	Patcher._matchElement = function(sId, sTagName) {
		if (!sId) {
			return;
		}

		if (this._oCurrent) {
			if (this._oCurrent == this._oRoot || this._oCurrent.id == sId) {
				return;
			}

			var oCurrent = document.getElementById(sId);
			if (oCurrent) {
				this._oCurrent = this._oParent.insertBefore(oCurrent, this._oCurrent);
				return;
			}

			var oMatched = this.matchElement(sId, sTagName, this._oCurrent, this._oParent);
			if (oMatched) {
				if (oMatched !== this._oCurrent) {
					this._oCurrent = this._oParent.insertBefore(oMatched, this._oCurrent);
				}
			} else if (this._oCurrent.id) {
				this._oReference = this._oCurrent;
				this._oCurrent = null;
			}
		}

		if (!this._oCurrent) {
			this._oCurrent = this.createElement(sId, sTagName, this._oParent);
			this._setNewElement(this._oCurrent);
		}
	};

	/**
	 * Checks whether the current node being patched matches the specified node name.
	 * If there is no match, the old DOM node must be removed, and new nodes must be created.
	 */
	Patcher._matchNodeName = function(sNodeName) {
		if (!this._oCurrent) {
			return;
		}

		var sCurrentNodeName = (this._oCurrent.nodeType == 1) ? this._oCurrent.localName : this._oCurrent.nodeName;
		if (sCurrentNodeName == sNodeName) {
			return;
		}

		if (this._oCurrent == this._oRoot) {
			this._oReference = this._oCurrent.nextSibling;
			this._oParent.removeChild(this._oCurrent);
		} else {
			this._oReference = this._oCurrent;
		}

		this._oCurrent = null;
	};

	/**
	 * Gets and stores attributes of the current node.
	 *
	 * Using getAttributeNames along with getAttribute is a memory-efficient and performant alternative to accessing Element.attributes.
	 * Edge 44 is supporting getAttributeNames, but it does not return qualified names of attributes.
	 * For more information, see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames}.
	 */
	Patcher._getAttributes = (Device.browser.msie || Device.browser.edge) ? function() {
		for (var i = 0, aAttributes = this._oCurrent.attributes, iLength = aAttributes.length; i < iLength; i++) {
			this._mAttributes[aAttributes[i].name] = aAttributes[i].value;
		}
	} : function() {
		for (var i = 0, aAttributeNames = this._oCurrent.getAttributeNames(); i < aAttributeNames.length; i++) {
			this._mAttributes[aAttributeNames[i]] = this._oCurrent.getAttribute(aAttributeNames[i]);
		}
	};

	/**
	 * Stores the specified element that is going to be inserted into the document after patching has been completed.
	 */
	Patcher._setNewElement = function(oNewElement) {
		if (!oNewElement) {
			return;
		}

		if (!this._oNewElement) {
			this._oNewElement = this._oCurrent;
			this._oNewParent = this._oParent;
			this._oNewReference = this._oReference;
		} else {
			this._oParent.insertBefore(this._oCurrent, this._oReference);
		}
	};

	/**
	 * Inserts the stored new element into the document after patching has been completed.
	 */
	Patcher._insertNewElement = function() {
		if (this._oCurrent == this._oNewElement) {
			this._oNewParent.insertBefore(this._oNewElement, this._oNewReference);
			this._oNewElement = this._oNewParent = this._oNewReference = null;
		}
	};

	/**
	 * Opens the start tag of an HTML element.
	 *
	 * This must be followed by <code>openEnd</code> and concluded with <code>close</code>.
	 *
	 * @param {string} sTagName Tag name of the HTML element; all lowercase
 	 * @param {sap.ui.core.ID} [sId] ID to identify the element
	 * @return {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.openStart = function(sTagName, sId) {
		this._walkOnTree();
		this._matchElement(sId, sTagName);
		this._matchNodeName(sTagName);

		if (this._oCurrent) {
			this._getAttributes();
			this._iTagOpenState = 2; /* Existing */
		} else {
			this._oCurrent = createElement(sTagName, this._oParent);
			this._setNewElement(this._oCurrent);
			this._iTagOpenState = 1; /* Created */
		}

		if (sId) {
			this.attr("id", sId);
		}

		return this;
	};

	/**
	 * Starts a self-closing tag, such as <code>img</code> or <code>input</code>.
	 *
	 * This must be followed by <code>voidEnd</code>.
	 *
	 * @param {string} sTagName Tag name of the HTML element; all lowercase
 	 * @param {sap.ui.core.ID} [sId] ID to identify the element
	 * @return {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.voidStart = Patcher.openStart;


	/**
	 * Sets an attribute name-value pair to the current element.
	 *
	 * This is only valid when called between <code>openStart/voidStart</code> and <code>openEnd/voidEnd</code>.
	 * Case-insensitive attribute names must all be set in lowercase.
	 *
	 * @param {string} vAttr Name of the attribute
	 * @param {*} vValue Value of the attribute; any non-string value specified is converted automatically into a string
	 * @return {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.attr = function(sAttr, vValue) {
		if (this._iTagOpenState == 1 /* Created */) {
			this._oCurrent.setAttribute(sAttr, vValue);
			return this;
		}

		var sNewValue = String(vValue);
		var sOldValue = this._mAttributes[sAttr];
		var fnMutator = AttributeMutators[sAttr];

		if (sOldValue !== undefined) {
			delete this._mAttributes[sAttr];
		}

		if (fnMutator && fnMutator(this._oCurrent, sNewValue, sOldValue)) {
			return this;
		}

		if (sOldValue !== sNewValue) {
			this._oCurrent.setAttribute(sAttr, sNewValue);
		}

		return this;
	};

	/**
	 * Adds a class name to the class name collection to be set as a <code>class</code>
	 * attribute when <code>openEnd</code> or <code>voidEnd</code> is called.
	 *
	 * This is only valid when called between <code>openStart/voidStart</code> and <code>openEnd/voidEnd</code>.
	 *
	 * @param {string} sClass Class name to be written
	 * @return {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.class = function(sClass) {
		if (sClass) {
			this._sClasses += (this._sClasses) ? " " + sClass : sClass;
		}

		return this;
	};

	/**
	 * Adds a style name-value pair to the style collection to be set as a <code>style</code>
	 * attribute when <code>openEnd</code> or <code>voidEnd</code> is called.
	 *
	 * This is only valid when called between <code>openStart/voidStart</code> and <code>openEnd/voidEnd</code>.
	 *
	 * @param {string} sStyle Name of the style property
	 * @param {string} sValue Value of the style property
	 * @return {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.style = function(sName, vValue) {
		if (!sName || vValue == null || vValue == "") {
			return this;
		}

		this._sStyles += (this._sStyles ? " " : "") + (sName + ": " + vValue + ";");
		return this;
	};

	/**
	 * Ends an open tag started with <code>openStart</code>.
	 *
	 * This indicates that there are no more attributes to set to the open tag.
	 *
	 * @returns {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.openEnd = function() {
		if (this._sClasses) {
			this.attr("class", this._sClasses);
			this._sClasses = "";
		}

		if (this._sStyles) {
			this.attr("style", this._sStyles);
			this._sStyles = "";
		}

		if (this._iTagOpenState == 1 /* Created */) {
			return this;
		}

		var aRemainingAttributes = Object.keys(this._mAttributes);
		for (var i = 0; i < aRemainingAttributes.length; i++) {
			var sAttribute = aRemainingAttributes[i];
			var fnMutator = AttributeMutators[sAttribute];
			fnMutator && fnMutator(this._oCurrent, null);
			this._oCurrent.removeAttribute(sAttribute);
			delete this._mAttributes[sAttribute];
		}

		return this;
	};

	/**
	 * Ends an open self-closing tag started with <code>voidStart</code>.
	 *
	 * This indicates that there are no more attributes to set to the open tag.
	 * For self-closing tags, the <code>close</code> method must not be called.
	 *
	 * @return {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.voidEnd = function() {
		this.openEnd();
		this._iTagOpenState = 0; /* Closed */
		this._insertNewElement();
		return this;
	};

	/**
	 * Sets the specified text.
	 *
	 * @param {string} sText Text to be set
	 * @return {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.text = function(sText) {
		this._walkOnTree();
		this._matchNodeName("#text");

		if (!this._oCurrent) {
			this._oCurrent = document.createTextNode(sText);
			this._oParent.insertBefore(this._oCurrent, this._oReference);
		} else if (this._oCurrent.data != sText) {
			this._oCurrent.data = sText;
		}

		this._iTagOpenState = 0; /* Closed */
		return this;
	};


	/**
	 * Closes an open tag started with <code>openStart</code> and ended with <code>openEnd</code>.
	 *
	 * This indicates that there are no more children to append to the open tag.
	 *
	 * @param {string} sTagName The tag name of the HTML element
	 * @return {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.close = function(sTagName) {
		if (this._iTagOpenState) {
			this._iTagOpenState = 0;
			this._oCurrent.textContent = "";
		} else {
			var oParent = this._oCurrent.parentNode;
			for (var oLastChild = oParent.lastChild; oLastChild && oLastChild != this._oCurrent; oLastChild = oParent.lastChild) {
				oParent.removeChild(oLastChild);
			}
			this._oCurrent = oParent;
		}

		this._insertNewElement();
		return this;
	};


	/**
	 * Replaces the given HTML of the current element being patched.
	 *
	 * @param {string} sHtml HTML markup
  	 * @param {sap.ui.core.ID} [sId] ID to identify the element
	 * @return {sap.ui.core.Patcher} Reference to <code>this</code> in order to allow method chaining
	 * @SecSink {*|XSS}
	 */
	Patcher.unsafeHtml = function(sHtml, sId) {
		var oReference = null;

		if (!this._oCurrent) {
			oReference = this._oRoot;
			if (sHtml) {
				oReference.outerHTML = sHtml;
			}
		} else if (this._iTagOpenState) {
			oReference = this._oCurrent.firstChild;
			if (sHtml) {
				this._iTagOpenState = 0;
				this._oCurrent.insertAdjacentHTML("afterbegin", sHtml);
				if (oReference) {
					this._oCurrent = oReference.previousSibling;
					if (!this._oCurrent) { // IE & Edge normalize text nodes
						oReference.data = sHtml;
						this._oCurrent = oReference;
					}
				} else {
					this._oCurrent = this._oCurrent.lastChild;
				}
			}
		} else {
			oReference = this._oCurrent.nextSibling;
			if (sHtml) {
				this._oCurrent.insertAdjacentHTML("afterend", sHtml);
				this._oCurrent = oReference ? oReference.previousSibling : this._oCurrent.parentNode.lastChild;
			}
		}

		if (sId && oReference && oReference.id == sId) {
			oReference.parentNode.removeChild(oReference);
		}

		return this;
	};

	return Patcher;
});
