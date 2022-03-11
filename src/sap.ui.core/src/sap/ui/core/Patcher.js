/*!
 * ${copyright}
 */

// Provides in-place rendering module for the RenderManager
sap.ui.define([
	"sap/ui/Device"
], function(Device) {
	"use strict";

	// points a dummy CSSStyleDeclaration for style validation purposes
	var oCSSStyleDeclaration = document.createElement("title").style;

	// stores a <template> element to convert HTML strings to a DocumentFragment
	var oTemplateElement = document.createElement("template");

	/**
	 * Provides custom mutators for attributes.
	 * Custom mutators ensure that the attribute value is aligned with the property value.
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
			if (oElement.tagName == "INPUT") {
				oElement.value = (sNewValue == null) ? "" : sNewValue;
			}
		},
		checked: function(oElement, sNewValue) {
			if (oElement.tagName == "INPUT") {
				oElement.checked = (sNewValue == null) ? false : true;
			}
		},
		selected: function(oElement, sNewValue) {
			if (oElement.tagName == "OPTION") {
				oElement.selected = (sNewValue == null) ? false : true;
			}
		}
	};

	if (Device.browser.safari) {
		/*
		 * Safari 14ff reports calls to Element.prototype.removeAttribute("style") as CSP violations,
		 * if 'inline-style's are not allowed, see https://bugs.webkit.org/show_bug.cgi?id=227349#c3
		 *
		 * Assigning the empty string as style cleans up the CSS, but not the DOM, therefore we apply
		 * this fallback to Safari only.
		 */
		AttributeMutators.style = function(oElement, sNewValue) {
			if ( sNewValue == null ) {
				oElement.style = "";
				return true; // skip removeAttribute
			}
		};
	}

	/**
	 * Creates an HTML element from the given tag name and parent namespace
	 */
	var createElement = function (sTagName, oParent) {
		if (sTagName == "svg") {
			return document.createElementNS("http://www.w3.org/2000/svg", "svg");
		}

		var sNamespaceURI = oParent && oParent.namespaceURI;
		if (!sNamespaceURI || sNamespaceURI == "http://www.w3.org/1999/xhtml" || oParent.localName == "foreignObject") {
			return document.createElement(sTagName);
		}

		return document.createElementNS(sNamespaceURI, sTagName);
	};

	/**
	 * @class Creates a <code>Patcher</code> instance which can be used for in-place DOM patching.
	 *
	 * @alias sap.ui.core.Patcher
	 * @class
	 * @private
	 * @ui5-restricted sap.ui.core.RenderManager
	 */
	var Patcher = function() {
		this._oRoot = null;                      // Root node where the patching is started
		this._oCurrent = null;                   // Current node being patched, this value is always up-to-date
		this._oParent = null;                    // Parent node of the current node being patched, this valule is not alway up-to-date
		this._oReference = null;                 // Reference node that corresponds to the position of the current node
		this._oNewElement = null;                // Newly created element which is not yet inserted into the DOM tree
		this._oNewParent = null;                 // HTML element where the newly created element to be inserted
		this._oNewReference = null;              // Reference element that corresponds to the position of the newly created element
		this._iTagOpenState = 0;                 // 0: Tag is Closed, 1: Tag is Open and just Created, has no attributes, 2: Tag is Open and Existing, might have attributes
		this._sStyles = "";                      // Style collection of the current node
		this._sClasses = "";                     // Class name collection of the current node
		this._mAttributes = Object.create(null); // Set of all attributes name-value pair of the current node
	};

	/**
	 * Sets the root node from which the patching will be started.
	 *
	 * The root node must be set once before calling any other APIs.
	 * If the root node parameter is not provided, a <code>DocumentFragment</code> is created as the root node.
	 *
	 * @param {HTMLElement} [oRootNode] The DOM node from which the patching will be started
	 */
	Patcher.prototype.setRootNode = function(oRootNode) {
		if (this._oRoot) {
			this.reset();
		}

		this._oRoot = oRootNode || document.createDocumentFragment();
	};

	/**
	 * Returns the root node from which the patching was started or a <code>DocumentFragment</code> created as a root node.
	 *
	 * @return {Node} The root node of the Patcher
	 */
	Patcher.prototype.getRootNode = function() {
		return this._oRoot;
	};

	/**
	 * Returns the current node being patched.
	 *
	 * @returns {Node} The node being patched
	 */
	Patcher.prototype.getCurrentNode = function() {
		return this._oCurrent;
	};

	/**
	 * Cleans up the current patching references and makes the patcher ready for the next patching.
	 */
	Patcher.prototype.reset = function() {
		this._oRoot = this._oCurrent = this._oParent = this._oReference = this._oNewElement = this._oNewParent = this._oNewReference = null;
		this._iTagOpenState = 0; /* Tag is Closed */
	};

	/**
	 * Sets the next node that is going to be patched.
	 */
	Patcher.prototype._walkOnTree = function() {
		this._oReference = null;
		if (!this._oCurrent) {
			// if the current node does not exist yet, that means we are on the first call after the root node is set
			if (this._oRoot.nodeType == 11 /* Node.DOCUMENT_FRAGMENT_NODE */) {
				// for the initial rendering the Patcher creates a DocumentFragment to assemble all created DOM nodes within it
				// if there is nothing to patch the Patcher will start to create elements, here we do not set the current node to force the rendering starts
				// the first created element must be appended to the DocumentFragment, so let the parent be the DocumentFragment node
				this._oParent = this._oRoot;
			} else {
				// during the re-rendering, the root node points to where the patching must be started
				this._oParent = this._oRoot.parentNode;
				this._oCurrent = this._oRoot;
			}
		} else if (this._iTagOpenState /* Tag is Open */) {
			// a new tag is opened while the previous tag was already open e.g. <div><span
			this._oParent = this._oCurrent;
			this._oCurrent = this._oCurrent.firstChild;
		} else {
			// after the previous tag has been closed, a new tag is opened e.g. <div></div><span
			this._oParent = this._oCurrent.parentNode;
			this._oCurrent = this._oCurrent.nextSibling;
		}
	};

	/**
	 * Finds the matching HTML element from the given ID and moves the corresponding element to the correct location.
	 */
	Patcher.prototype._matchElement = function(sId) {
		if (!sId) {
			return;
		}

		// TODO: the element with the given ID might exists in the DOM tree
		// See the Patcher.qunit.js - Rendering:existing elements test
		if (!this._oCurrent) {
			return;
		}

		if (this._oCurrent.id == sId || this._oCurrent == this._oRoot) {
			return;
		}

		var oCurrent = document.getElementById(sId);
		if (oCurrent) {
			this._oCurrent = this._oParent.insertBefore(oCurrent, this._oCurrent);
			return;
		}

		if (this._oCurrent.id) {
			this._oReference = this._oCurrent;
			this._oCurrent = null;
		}
	};

	/**
	 * Checks whether the current node being patched matches the specified node name.
	 * If there is no match, the old DOM node must be removed, and new nodes must be created.
	 */
	Patcher.prototype._matchNodeName = function(sNodeName) {
		if (!this._oCurrent) {
			return;
		}

		var sCurrentNodeName = (this._oCurrent.nodeType == 1 /* Node.ELEMENT_NODE */) ? this._oCurrent.localName : this._oCurrent.nodeName;
		if (sCurrentNodeName == sNodeName) {
			return;
		}

		this._oReference = this._oCurrent;
		this._oCurrent = null;
	};

	/**
	 * Gets and stores attributes of the current node.
	 *
	 * Using getAttributeNames along with getAttribute is a memory-efficient and performant alternative to accessing Element.attributes.
	 * For more information, see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNames}.
	 */
	Patcher.prototype._getAttributes = function() {
		for (var i = 0, aAttributeNames = this._oCurrent.getAttributeNames(); i < aAttributeNames.length; i++) {
			this._mAttributes[aAttributeNames[i]] = this._oCurrent.getAttribute(aAttributeNames[i]);
		}
	};

	/**
	 * Stores the specified element that is going to be inserted into the document after patching has been completed.
	 */
	Patcher.prototype._setNewElement = function(oNewElement) {
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
	Patcher.prototype._insertNewElement = function() {
		if (this._oCurrent == this._oNewElement) {
			this._oNewParent[this._oNewReference == this._oRoot ? "replaceChild" : "insertBefore"](this._oNewElement, this._oNewReference);
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
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.prototype.openStart = function(sTagName, sId) {
		this._walkOnTree();
		this._matchElement(sId);
		this._matchNodeName(sTagName);

		if (this._oCurrent) {
			this._getAttributes();
			this._iTagOpenState = 2; /* Tag is Open and Existing */
		} else {
			this._oCurrent = createElement(sTagName, this._oParent);
			this._setNewElement(this._oCurrent);
			this._iTagOpenState = 1; /* Tag is Open and Created */
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
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.prototype.voidStart = Patcher.prototype.openStart;


	/**
	 * Sets an attribute name-value pair to the current element.
	 *
	 * This is only valid when called between <code>openStart/voidStart</code> and <code>openEnd/voidEnd</code>.
	 * Case-insensitive attribute names must all be set in lowercase.
	 *
	 * @param {string} sAttr Name of the attribute
	 * @param {*} vValue Value of the attribute; any non-string value specified is converted automatically into a string
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.prototype.attr = function(sAttr, vValue) {
		if (sAttr === "style") {
			this._sStyles = vValue;
			return this;
		}

		if (this._iTagOpenState == 1 /* Tag is Open and Created */) {
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
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.prototype.class = function(sClass) {
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
	 * @param {string} sName Name of the style property
	 * @param {string} vValue Value of the style property
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.prototype.style = function(sName, vValue) {
		if (!sName || vValue == null || vValue == "") {
			return this;
		}

		vValue = vValue + "";
		if (vValue.includes(";")) {
			// sanitize the semicolon to ensure that a single style rule can be set per style API call
			oCSSStyleDeclaration.setProperty(sName, vValue);
			vValue = oCSSStyleDeclaration.getPropertyValue(sName);
		}

		this._sStyles += (this._sStyles ? " " : "") + (sName + ": " + vValue + ";");
		return this;
	};

	/**
	 * Ends an open tag started with <code>openStart</code>.
	 *
	 * This indicates that there are no more attributes to set to the open tag.
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.prototype.openEnd = function() {
		if (this._sClasses) {
			// className can also be an instance of SVGAnimatedString if the element is an SVGElement. Therefore do not use
			// HTMLElement.className property, it is better to set the classes of an element using HTMLElement.setAttribute.
			this.attr("class", this._sClasses);
			this._sClasses = "";
		}

		if (this._sStyles) {
			// For styles, to be CSP compliant, we use the style property instead of setting the style attribute.
			// However, using the style property instead of the style attribute might report a mismatch because of
			// the serialization algorithm of the CSSStyleDeclaration. e.g.
			// $0.style = "background-color: RED;";  // background-color: red;
			// $0.style = "background: red;";        // background: red none repeat scroll 0% 0%;
			// https://drafts.csswg.org/cssom/#serialize-a-css-declaration-block
			// While it is true that this mismatch might cause a style property call unnecessarily, trying to solve
			// this problem would not bring a better performance since the possibility of changed styles is much more
			// less than unchanged styles in the overall rendering.
			// Therefore, to compare faster, here we do only string-based comparison of retrived and applied styles.
			// In worst case, we will try to update the style property unnecessarily but this will not be a real
			// style update for the engine since the parsed CSS declaration blocks will be equal at the end.
			if (this._mAttributes.style != this._sStyles) {
				this._oCurrent.style = this._sStyles;
			}
			delete this._mAttributes.style;
			this._sStyles = "";
		}

		if (this._iTagOpenState == 1 /* Tag is Open and Created */) {
			return this;
		}

		for (var sAttribute in this._mAttributes) {
			var fnMutator = AttributeMutators[sAttribute];
			if (!fnMutator || !fnMutator(this._oCurrent, null)) {
				this._oCurrent.removeAttribute(sAttribute);
			}
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
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.prototype.voidEnd = function() {
		this.openEnd();
		this._iTagOpenState = 0; /* Closed */
		this._insertNewElement();
		return this;
	};

	/**
	 * Sets the specified text.
	 *
	 * @param {string} sText Text to be set
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.prototype.text = function(sText) {
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
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 */
	Patcher.prototype.close = function(sTagName) {
		if (this._iTagOpenState) {
			this._iTagOpenState = 0; /* Closed */
			if (this._oCurrent.lastChild) {
				this._oCurrent.textContent = "";
			}
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
	 * <b>Note:</b> This API must not be used to replace the output of the root node.
	 *
	 * @param {string} sHtml HTML markup
	 * @param {sap.ui.core.ID} [sId] ID to identify the element
	 * @param {function} [fnCallback] The callback that can process the inserted DOM nodes after the HTML markup is injected into the DOM tree
	 * @return {this} Reference to <code>this</code> in order to allow method chaining
	 * @SecSink {*|XSS}
	 */
	Patcher.prototype.unsafeHtml = function(sHtml, sId, fnCallback) {
		var oReference = null;
		var oCurrent = this._oCurrent;

		if (!oCurrent) {
			oReference = this._oRoot;
		} else if (this._iTagOpenState /* Tag is Open */) {
			oReference = oCurrent.firstChild;
			if (sHtml) {
				this._iTagOpenState = 0; /* Tag is Closed */
				oCurrent.insertAdjacentHTML("afterbegin", sHtml);
				this._oCurrent = oReference ? oReference.previousSibling : oCurrent.lastChild;
			}
		} else {
			oReference = oCurrent.nextSibling;
			if (sHtml) {
				if (oCurrent.nodeType == 1 /* Node.ELEMENT_NODE */) {
					oCurrent.insertAdjacentHTML("afterend", sHtml);
				} else {
					oTemplateElement.innerHTML = sHtml;
					oCurrent.parentNode.insertBefore(oTemplateElement.content, oReference);
				}
				this._oCurrent = oReference ? oReference.previousSibling : oCurrent.parentNode.lastChild;
			}
		}

		if (sHtml && fnCallback) {
			var aNodes = [this._oCurrent];
			for (var oNode = this._oCurrent.previousSibling; oNode && oNode != oCurrent; oNode = oNode.previousSibling) {
				aNodes.unshift(oNode);
			}
			fnCallback(aNodes);
		}

		if (sId && oReference && oReference.id == sId) {
			oReference.remove();
		}

		return this;
	};

	return Patcher;
});
