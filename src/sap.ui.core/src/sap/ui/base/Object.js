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
sap.ui.define(['./Interface', './Metadata', "sap/base/Log"],
	function(Interface, Metadata, Log) {
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
	 * Returns the public facade of this object.
	 *
	 * By default, the public facade is implemented as an instance of {@link sap.ui.base.Interface},
	 * exposing the <code>publicMethods</code> as defined in the metadata of the class of this object.
	 *
	 * See the documentation of the {@link #.extend extend} method for an explanation of <code>publicMethods</code>.
	 *
	 * The facade is created on the first call of <code>getInterface</code> and reused for all later calls.
	 *
	 * @public
	 */
	BaseObject.prototype.getInterface = function() {
		// New implementation that avoids the overhead of a dedicated member for the interface
		// initially, an Object instance has no associated Interface and the getInterface
		// method is defined only in the prototype. So the code here will be executed.
		// It creates an interface (basically the same code as in the old implementation)
		var oInterface = new Interface(this, this.getMetadata().getAllPublicMethods());
		// Now this Object instance gets a new, private implementation of getInterface
		// that returns the newly created oInterface. Future calls of getInterface on the
		// same Object therefore will return the already created interface
		this.getInterface = function() {
			return oInterface;
		};
		// as the first caller doesn't benefit from the new method implementation we have to
		// return the created interface as well.
		return oInterface;
	};

	/**
	 * Returns the metadata for the class that this object belongs to.
	 *
	 * This method is only defined when metadata has been declared by using {@link sap.ui.base.Object.defineClass}
	 * or {@link sap.ui.base.Object.extend}.
	 *
	 * @return {sap.ui.base.Metadata} metadata for the class of the object
	 * @name sap.ui.base.Object#getMetadata
	 * @function
	 * @public
	 */

	/**
	 * Creates a subclass of class sap.ui.base.Object with name <code>sClassName</code>
	 * and enriches it with the information contained in <code>oClassInfo</code>.
	 *
	 * <code>oClassInfo</code> might contain three kinds of information:
	 * <ul>
	 * <li><code>metadata:</code> an (optional) object literal with metadata about the class.
	 * The information in the object literal will be wrapped by an instance of {@link sap.ui.base.Metadata Metadata}
	 * and might contain the following information
	 * <ul>
	 * <li><code>interfaces:</code> {string[]} (optional) set of names of implemented interfaces (defaults to no interfaces)</li>
	 * <li><code>publicMethods:</code> {string[]} (optional) list of methods that should be part of the public
	 * facade of the class</li>
	 * <li><code>abstract:</code> {boolean} (optional) flag that marks the class as abstract (purely informational, defaults to false)</li>
	 * <li><code>final:</code> {boolean} (optional) flag that marks the class as final (defaults to false)</li>
	 * </ul>
	 * Subclasses of sap.ui.base.Object can enrich the set of supported metadata (e.g. see {@link sap.ui.core.Element.extend}).
	 * </li>
	 *
	 * <li><code>constructor:</code> a function that serves as a constructor function for the new class.
	 * If no constructor function is given, the framework creates a default implementation that delegates all
	 * its arguments to the constructor function of the base class.
	 * </li>
	 *
	 * <li><i>any-other-name:</i> any other property in the <code>oClassInfo</code> is copied into the prototype
	 * object of the newly created class. Callers can thereby add methods or properties to all instances of the
	 * class. But be aware that the given values are shared between all instances of the class. Usually, it doesn't
	 * make sense to use primitive values here other than to declare public constants.
	 *
	 * If such a property has a function as its value, and if the property name does not start with an underscore
	 * or with the prefix "on", the property name will be automatically added to the list of public methods of the
	 * class (see property <code>publicMethods</code> in the <code>metadata</code> section). If a method's name
	 * matches that pattern, but is not meant to be public, it shouldn't be included in the class info object,
	 * but be assigned to the prototype instead.
	 * </li>
	 *
	 * </ul>
	 *
	 * The prototype object of the newly created class uses the same prototype as instances of the base class
	 * (prototype chaining).
	 *
	 * A metadata object is always created, even if there is no <code>metadata</code> entry in the <code>oClassInfo</code>
	 * object. A getter for the metadata is always attached to the prototype and to the class (constructor function)
	 * itself.
	 *
	 * Last but not least, with the third argument <code>FNMetaImpl</code> the constructor of a metadata class
	 * can be specified. Instances of that class will be used to represent metadata for the newly created class
	 * and for any subclass created from it. Typically, only frameworks will use this parameter to enrich the
	 * metadata for a new class hierarchy they introduce (e.g. {@link sap.ui.core.Element.extend Element}).
	 *
	 * @param {string} sClassName name of the class to be created
	 * @param {object} [oClassInfo] structured object with information about the class
	 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.base.Metadata.
	 * @return {function} the created class / constructor function
	 * @public
	 * @static
	 * @name sap.ui.base.Object.extend
	 * @function
	 * @since 1.3.1
	 */

	/**
	 * Creates metadata for a given class and attaches it to the constructor and prototype of that class.
	 *
	 * After creation, metadata can be retrieved with getMetadata().
	 *
	 * The static info can at least contain the following entries:
	 * <ul>
	 * <li>baseType: {string} fully qualified name of a base class or empty</li>
	 * <li>publicMethods: {string} an array of method names that will be visible in the interface proxy returned by {@link #getInterface}</li>
	 * </ul>
	 *
	 * @param {string} sClassName name of an (already declared) constructor function
	 * @param {object} oStaticInfo static info used to create the metadata object
	 * @param {string} oStaticInfo.baseType qualified name of a base class
	 * @param {string[]} oStaticInfo.publicMethods array of names of public methods
	 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.base.Metadata.
	 *
	 * @return {sap.ui.base.Metadata} the created metadata object
	 * @public
	 * @static
	 * @deprecated Since 1.3.1. Use the static <code>extend</code> method of the desired base class (e.g. {@link sap.ui.base.Object.extend})
	 */
	BaseObject.defineClass = function(sClassName, oStaticInfo, FNMetaImpl) {
		// create Metadata object
		var oMetadata = new (FNMetaImpl || Metadata)(sClassName, oStaticInfo);
		var fnClass = oMetadata.getClass();
		fnClass.getMetadata = fnClass.prototype.getMetadata = function() {
			return oMetadata;
		};
		// enrich function
		if ( !oMetadata.isFinal() ) {
			fnClass.extend = function(sSCName, oSCClassInfo, fnSCMetaImpl) {
				return Metadata.createClass(fnClass, sSCName, oSCClassInfo, fnSCMetaImpl || FNMetaImpl);
			};
		}
		Log.debug("defined class '" + sClassName + "'" + (oMetadata.getParent() ? " as subclass of " + oMetadata.getParent().getName() : "") );
		return oMetadata;
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
	 * @param {object} oObject Object which will be checked whether it is an instance of the given type
	 * @param {string|string[]} vTypeName Type or types to check for
	 * @returns {boolean} Whether the given object is an instance of the given type or of any of the given types
	 * @public
	 * @since 1.56
	 * @static
	 */
	BaseObject.isA = function(oObject, vTypeName) {
		return oObject instanceof BaseObject && oObject.isA(vTypeName);
	};

	return BaseObject;

}, /* bExport= */ true);