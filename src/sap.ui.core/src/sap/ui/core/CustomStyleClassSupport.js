/*!
 * ${copyright}
 */

// Provides helper sap.ui.core.CustomStyleClassSupport
sap.ui.define(['jquery.sap.global', './Element'],
	function(jQuery, Element) {
	"use strict";

	/**
	 * Applies the support for custom style classes on the prototype of a <code>sap.ui.core.Element</code>.
	 *
	 * All controls (subclasses of <code>sap.ui.core.Control</code>) provide the support custom style classes. The control API provides functions
	 * to the application which allow it to add, remove or change style classes for the control.
	 * In general, this option is not available for elements because elements do not necessarily have a representation in the DOM.
	 *
	 * This function can be used by a control developer to explicitly enrich the API of his/her element implementation with the API functions
	 * for the custom style class support. It must be called on the prototype of the element.
	 *
	 * <b>Usage Example:</b>
	 * <pre>
	 * sap.ui.define(['sap/ui/core/Element', 'sap/ui/core/CustomStyleClassSupport'], function(Element, CustomStyleClassSupport) {
	 *    "use strict";
	 *    var MyElement = Element.extend("my.MyElement", {
	 *       metadata : {
	 *          //...
	 *       }
	 *       //...
	 *    });
	 *
	 *    CustomStyleClassSupport.apply(MyElement.prototype);
	 *
	 *    return MyElement;
	 * }, true);
	 * </pre>
	 *
	 * Furthermore, the function <code>oRenderManager.writeClasses(oElement);</code> ({@link sap.ui.core.RenderManager#writeClasses}) must be called within
	 * the renderer of the control to which the element belongs, when writing the root tag of the element. This ensures the classes are written to the HTML.
	 *
	 * This function adds the following functions to the elements prototype:
	 * <ul>
	 * <li><code>addStyleClass</code>: {@link sap.ui.core.Control#addStyleClass}</li>
	 * <li><code>removeStyleClass</code>: {@link sap.ui.core.Control#removeStyleClass}</li>
	 * <li><code>toggleStyleClass</code>: {@link sap.ui.core.Control#toggleStyleClass}</li>
	 * <li><code>hasStyleClass</code>: {@link sap.ui.core.Control#hasStyleClass}</li>
	 * </ul>
	 * In addition the clone function of the element is extended to ensure that the custom style classes are also available on the cloned element.
	 *
	 * <b>Note:</b> This function can only be used <i>within</i> control development. An application cannot add style class support on existing elements by calling this function.
	 *
	 * @public
	 * @alias sap.ui.core.CustomStyleClassSupport
	 * @function
	 */
	var CustomStyleClassSupport = function () {
		// "this" is the prototype now when called with apply()

		// Ensure only Elements are enhanced
		if (!(this instanceof Element)) {
			return;
		}

		// enrich original clone function
		var fOriginalClone = this.clone;
		this.clone = function() {
			// call original clone function
			var oClone = fOriginalClone.apply(this, arguments);

			// add the style classes of "this" to the clone
			if (this.aCustomStyleClasses) {
				oClone.aCustomStyleClasses = this.aCustomStyleClasses.slice();
			}
			//add the style class map of "this" to the clone
			if (this.mCustomStyleClassMap) {
				oClone.mCustomStyleClassMap = jQuery.extend({}, this.mCustomStyleClassMap);
			}

			return oClone;
		};

		var rNonWhiteSpace = /\S+/g;

		this.addStyleClass = function(sStyleClass, bSuppressRerendering) { // bSuppressRerendering is experimental and hence undocumented
			jQuery.sap.assert(typeof sStyleClass === "string", "sStyleClass must be a string");

			var aClasses,
				bModified = false;

			var aChangedScopes = [], aScopes = getScopes();

			if (!this.aCustomStyleClasses) {
				this.aCustomStyleClasses = [];
			}

			if (!this.mCustomStyleClassMap) {
				this.mCustomStyleClassMap = {};
			}

			if (sStyleClass && typeof sStyleClass === "string") {
				// ensure the "class" attribute is not closed
				if (sStyleClass.indexOf("\"") > -1) {
					return this;
				}
				if (sStyleClass.indexOf("'") > -1) {
					return this;
				} // TODO: maybe check for quotes in different charsets or encodings

				aClasses = sStyleClass.match(rNonWhiteSpace) || [];
				aClasses.forEach(function(sClass) {
					if (!this.mCustomStyleClassMap[sClass]) {
						this.mCustomStyleClassMap[sClass] = true;
						this.aCustomStyleClasses.push(sClass);

						if (aScopes && aScopes.indexOf(sClass) > -1){
							aChangedScopes.push(sClass);
						}

						bModified = true;
					}
				}.bind(this));

				// if all classes exist already, it's not needed to change the DOM or trigger invalidate
				if (!bModified) {
					return this;
				}

				var oRoot = this.getDomRef();
				if (oRoot) { // non-rerendering shortcut
					jQuery(oRoot).addClass(sStyleClass);
				} else if (bSuppressRerendering === false) {
					this.invalidate();
				}
				if (aChangedScopes.length > 0) {
					// scope has been added
					fireThemeScopingChangedEvent(this, aChangedScopes, true);
				}
			}
			return this;
		};


		this.removeStyleClass = function(sStyleClass, bSuppressRerendering) { // bSuppressRerendering is experimental and hence undocumented
			jQuery.sap.assert(typeof sStyleClass === "string", "sStyleClass must be a string");

			var aClasses,
				bExist = false,
				nIndex;

			var aChangedScopes = [], aScopes = getScopes();

			if (sStyleClass && typeof sStyleClass === "string" && this.aCustomStyleClasses && this.mCustomStyleClassMap) {
				aClasses = sStyleClass.match(rNonWhiteSpace) || [];
				aClasses.forEach(function(sClass) {
					if (this.mCustomStyleClassMap[sClass]) {
						bExist = true;
						nIndex = this.aCustomStyleClasses.indexOf(sClass);
						if (nIndex !== -1) {
							this.aCustomStyleClasses.splice(nIndex, 1);
							delete this.mCustomStyleClassMap[sClass];

							if (aScopes && aScopes.indexOf(sClass) > -1) {
								aChangedScopes.push(sClass);
							}
						}
					}
				}.bind(this));
			}

			if (bExist) {
				var oRoot = this.getDomRef();
				if (oRoot) { // non-rerendering shortcut
					jQuery(oRoot).removeClass(sStyleClass);
				} else if (bSuppressRerendering === false) {
					this.invalidate();
				}
				if (aChangedScopes.length > 0) {
					// scope has been removed
					fireThemeScopingChangedEvent(this, aChangedScopes, false);
				}
			}

			return this;
		};


		this.toggleStyleClass = function(sStyleClass, bAdd) {
			jQuery.sap.assert(typeof sStyleClass === "string", "sStyleClass must be a string");

			if (sStyleClass && typeof sStyleClass === "string") {
				if (bAdd === true) {
					this.addStyleClass(sStyleClass);
				} else if (bAdd === false) {
					this.removeStyleClass(sStyleClass);
				} else if (bAdd === undefined) {
					this.hasStyleClass(sStyleClass) ? this.removeStyleClass(sStyleClass) : this.addStyleClass(sStyleClass);
				} else {
					jQuery.sap.log.warning(this.toString() + "- toggleStyleClass(): bAdd should be a boolean or undefined, but is '" + bAdd + "'");
				}
			}

			return this; // we could (depending on bAdd) return either this or the boolean result of removeStyleClass, but at least in the bAdd===undefined case the caller wouldn't even know which return type to expect...
		};

		this.hasStyleClass = function(sStyleClass) {
			jQuery.sap.assert(typeof sStyleClass === "string", "sStyleClass must be a string");

			var aClasses;
			if (sStyleClass && typeof sStyleClass === "string" && this.mCustomStyleClassMap) {
				aClasses = sStyleClass.match(rNonWhiteSpace) || [];
				return aClasses.length !== 0 && aClasses.every(function(sClass) {
					return this.mCustomStyleClassMap[sClass];
				}.bind(this));
			}
			return false;
		};

		this.getMetadata().addPublicMethods(["addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass"]);

	};

	var Parameters;

	function getScopes() {
		if (!Parameters) {
			Parameters = sap.ui.require("sap/ui/core/theming/Parameters");
		}

		if (Parameters) {
			return Parameters._getScopes(/* avoidLoading= */ true);
		}
	}

	function fireThemeScopingChangedEvent(oElement, aScopeClasses, bIsAdded) {
		sap.ui.getCore().fireThemeScopingChanged({
			scopes: aScopeClasses,
			added: bIsAdded,
			element: oElement
		});
	}

	return CustomStyleClassSupport;

}, /* bExport= */ true);
