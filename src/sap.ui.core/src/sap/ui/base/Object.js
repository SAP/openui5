/*!
 * ${copyright}
 */

/**
 * SAPUI5 base classes
 *
 * @namespace
 * @name sap.ui.base
 * @public
 */

// Provides class sap.ui.base.Object
sap.ui.define(['./Metadata', "sap/base/Log"],
	function(Metadata, Log) {
		"use strict";


		/**
		 * Constructor for an <code>sap.ui.base.Object</code>.
		 *
		 * Subclasses of this class should always call the constructor of their base class.
		 *
		 * @class Base class for all SAPUI5 Objects.
		 * @abstract
		 * @author Malte Wedel
		 * @version ${version}
		 * @public
		 * @alias sap.ui.base.Object
		 * @throws {Error} When an instance of the class or its subclasses is created without the <code>new</code> operator.
		 */
		var BaseObject = Metadata.createClass("sap.ui.base.Object", {

			constructor : function() {
				// complain if 'this' is not an instance of a subclass
				if ( !(this instanceof BaseObject) ) {
					throw Error("Cannot instantiate object: \"new\" is missing!");
				}
			}

		});

		/**
		 * Destructor method for objects.
		 * @public
		 */
		BaseObject.prototype.destroy = function() {
		};

		/**
		 * Returns a public facade of this object.
		 *
		 * By default, <code>this</code> is returned.
		 *
		 * @public
		 * @returns {sap.ui.base.Object} A facade for this object.
		 */
		BaseObject.prototype.getInterface = function() {
			return this;
		};

		/**
		 * Checks whether this object is an instance of the named type.
		 *
		 * This check is solely based on the type names as declared in the class metadata.
		 * It compares the given <code>vTypeName</code> with the name of the class of this object,
		 * with the names of any base class of that class and with the names of all interfaces
		 * implemented by any of the aforementioned classes.
		 *
		 * Instead of a single type name, an array of type names can be given and the method
		 * will check if this object is an instance of any of the listed types (logical or).
		 *
		 * Should the UI5 class system in future implement additional means of associating classes
		 * with type names (e.g. by introducing mixins), then this method might detect matches
		 * for those names as well.
		 *
		 * @example
		 * myObject.isA("sap.ui.core.Control"); // true if myObject is an instance of sap.ui.core.Control
		 * myObject.isA(["sap.ui.core.Control", "sap.ui.core.Fragment"]); // true if myObject is an instance of sap.ui.core.Control or sap.ui.core.Fragment
		 *
		 * @param {string|string[]} vTypeName Type or types to check for
		 * @returns {boolean} Whether this object is an instance of the given type or of any of the given types
		 * @public
		 * @since 1.56
		 */
		BaseObject.prototype.isA = function(vTypeName) {
			return this.getMetadata().isA(vTypeName);
		};

		/**
		 * Checks whether the given object is an instance of the named type.
		 * This function is a short-hand convenience for {@link sap.ui.base.Object#isA}.
		 *
		 * Please see the API documentation of {@link sap.ui.base.Object#isA} for more details.
		 *
		 * @param {any} oObject Object which will be checked whether it is an instance of the given type
		 * @param {string|string[]} vTypeName Type or types to check for
		 * @returns {boolean} Whether the given object is an instance of the given type or of any of the given types
		 * @public
		 * @since 1.56
		 * @static
		 */
		BaseObject.isA = function(oObject, vTypeName) {
			return oObject instanceof BaseObject && oObject.isA(vTypeName);
		};

		/**
		 * @param  {sap.ui.base.Object} [oObject] Object for which a facade should be created
		 * @param  {string[]} [aMethods=[]] Names of the methods, that should be available in the new facade
		 * @param  {boolean} [_bReturnFacade=false] If true, the return value of a function call is this created Interface instance instead of the BaseObject interface
		 * @private
		 * @static
		 */
		BaseObject._Interface = function(oObject, aMethods, _bReturnFacade) {
			// if object is null or undefined, return itself
			if (!oObject) {
				return oObject;
			}

			function fCreateDelegator(oObject, sMethodName) {
				return function() {
						// return oObject[sMethodName].apply(oObject, arguments);
						var tmp = oObject[sMethodName].apply(oObject, arguments);
						// to avoid to hide the implementation behind the interface you need
						// to override the getInterface function in the object or create the interface with bFacade = true
						if (_bReturnFacade) {
							return this;
						} else {
							return (tmp instanceof BaseObject) ? tmp.getInterface() : tmp;
						}
					};
			}

			// if there are no methods return
			if (!aMethods) {
				return {};
			}

			var sMethodName;

			// create functions for all delegated methods
			// PERFOPT: 'cache' length of aMethods to reduce # of resolutions
			for (var i = 0, ml = aMethods.length; i < ml; i++) {
				sMethodName = aMethods[i];
				//!oObject[sMethodName] for 'lazy' loading interface methods ;-)
				if (!oObject[sMethodName] || typeof oObject[sMethodName] === "function") {
					this[sMethodName] = fCreateDelegator(oObject, sMethodName);
				}
			}
		};

		return BaseObject;
	}, /* bExport= */ true);