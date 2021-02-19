/*!
 * ${copyright}
 */

// Provides helper sap.ui.core.CustomStyleClassSupport
sap.ui.define(['./Element', "sap/base/assert", "sap/base/Log"],
	function(Element, assert, Log) {
	"use strict";


	var rAnyWhiteSpace = /\s/;
	var rNonWhiteSpace = /\S+/g;

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
		var fnOriginalClone = this.clone;
		this.clone = function() {
			// call original clone function
			var oClone = fnOriginalClone.apply(this, arguments);

			// add the style classes of "this" to the clone
			if (this.aCustomStyleClasses) {
				oClone.aCustomStyleClasses = this.aCustomStyleClasses.slice();
			}
			//add the style class map of "this" to the clone
			if (this.mCustomStyleClassMap) {
				oClone.mCustomStyleClassMap = Object.assign(Object.create(null), this.mCustomStyleClassMap);
			}

			return oClone;
		};

		this.addStyleClass = function(sStyleClass, bSuppressRerendering) { // bSuppressRerendering is experimental and hence undocumented
			assert(typeof sStyleClass === "string", "sStyleClass must be a string");

			// ensure that sStyleClass is a non-empty string with no quotes in it (quotes would break string rendering)
			if (!sStyleClass
				|| typeof sStyleClass !== "string"
				|| sStyleClass.indexOf("\"") > -1
				|| sStyleClass.indexOf("'") > -1) {
				return this;
			}

			var aCustomStyleClasses = this.aCustomStyleClasses || (this.aCustomStyleClasses = []),
				mCustomStyleClassMap = this.mCustomStyleClassMap || (this.mCustomStyleClassMap = Object.create(null)),
				aClasses,
				bModified = false,
				aChangedScopes = [],
				aScopes = getScopes();

			function check(sClass) {
				if (!mCustomStyleClassMap[sClass]) {
					mCustomStyleClassMap[sClass] = true;
					aCustomStyleClasses.push(sClass);

					if (aScopes && aScopes.indexOf(sClass) > -1){
						aChangedScopes.push(sClass);
					}

					bModified = true;
				}
			}

			if ( rAnyWhiteSpace.test(sStyleClass) ) {
				aClasses = sStyleClass.match(rNonWhiteSpace);
				aClasses && aClasses.forEach(check);
			} else {
				check(sStyleClass);
			}

			// if all classes exist already, it's not needed to change the DOM or trigger invalidate
			if (!bModified) {
				return this;
			}

			var oRoot = this.getDomRef();
			if (oRoot) { // non-rerendering shortcut
				if ( aClasses ) {
					oRoot.classList.add.apply(oRoot.classList, aClasses);
				} else {
					oRoot.classList.add(sStyleClass);
				}
			} else if (bSuppressRerendering === false) {
				this.invalidate();
			}
			if (aChangedScopes.length > 0) {
				// scope has been added
				fireThemeScopingChangedEvent(this, aChangedScopes, true);
			}

			return this;
		};


		this.removeStyleClass = function(sStyleClass, bSuppressRerendering) { // bSuppressRerendering is experimental and hence undocumented
			assert(typeof sStyleClass === "string", "sStyleClass must be a string");

			if (!sStyleClass
				|| typeof sStyleClass !== "string"
				|| !this.aCustomStyleClasses
				|| !this.mCustomStyleClassMap) {
				return this;
			}

			var aCustomStyleClasses = this.aCustomStyleClasses,
				mCustomStyleClassMap = this.mCustomStyleClassMap,
				aClasses,
				bExist = false,
				aChangedScopes = [],
				aScopes = getScopes(),
				nIndex;

			function check(sClass) {
				if (mCustomStyleClassMap[sClass]) {
					bExist = true;
					nIndex = aCustomStyleClasses.indexOf(sClass);
					if (nIndex !== -1) {
						aCustomStyleClasses.splice(nIndex, 1);
						delete mCustomStyleClassMap[sClass];

						if (aScopes && aScopes.indexOf(sClass) > -1) {
							aChangedScopes.push(sClass);
						}
					}
				}
			}

			if ( rAnyWhiteSpace.test(sStyleClass) ) {
				aClasses = sStyleClass.match(rNonWhiteSpace);
				aClasses && aClasses.forEach(check);
			} else {
				check(sStyleClass);
			}

			if (bExist) {
				var oRoot = this.getDomRef();
				if (oRoot) { // non-rerendering shortcut
					if ( aClasses ) {
						oRoot.classList.remove.apply(oRoot.classList, aClasses);
					} else {
						oRoot.classList.remove(sStyleClass);
					}
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
			assert(typeof sStyleClass === "string", "sStyleClass must be a string");

			if (sStyleClass && typeof sStyleClass === "string") {
				if (bAdd === true) {
					this.addStyleClass(sStyleClass);
				} else if (bAdd === false) {
					this.removeStyleClass(sStyleClass);
				} else if (bAdd === undefined) {
					this.hasStyleClass(sStyleClass) ? this.removeStyleClass(sStyleClass) : this.addStyleClass(sStyleClass);
				} else {
					Log.warning(this.toString() + "- toggleStyleClass(): bAdd should be a boolean or undefined, but is '" + bAdd + "'");
				}
			}

			return this; // we could (depending on bAdd) return either this or the boolean result of removeStyleClass, but at least in the bAdd===undefined case the caller wouldn't even know which return type to expect...
		};

		this.hasStyleClass = function(sStyleClass) {
			assert(typeof sStyleClass === "string", "sStyleClass must be a string");

			if (sStyleClass &&	 typeof sStyleClass === "string" && this.mCustomStyleClassMap) {
				if ( rAnyWhiteSpace.test(sStyleClass) ) {
					var aClasses = sStyleClass.match(rNonWhiteSpace);
					return aClasses != null && aClasses.every(function(sClass) {
						return this.mCustomStyleClassMap[sClass];
					}, this);
				} else {
					return !!this.mCustomStyleClassMap[sStyleClass];
				}
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