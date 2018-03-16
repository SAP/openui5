Example for defining a class
============================

Full example of a class, including JSDoc:

```js
// define the module using the AMD-like sap.ui.define 
sap.ui.define(['sap/ui/base/Object'], function( BaseObject ) {

	// declare and document the constructor function

	/**
	 * Some short sentence that summarizes the functionality of the class.
	 *
	 * A more detailed explanation of the class. Might consist of multiple sentences
	 * and paragraphs. It is <i>possible</i> to use <code>XHTML</code> <b>markup</b>
	 * but this should be used only rarely, as it makes the doclet harder to read
	 * in the JS editor.
	 *
	 * Paragraphs that are separated by empty lines will be formatted as separate paragraphs
	 * in the final JSDOC documentation. This makes the addition of <p> or <br/> tags
	 * unnecessary.
	 *
	 * It is possible to reference members of this class (like {@link #ownMethod}) or even of
	 * other classes (like {@link sap.ui.Object#destroy}). But be careful: in contrast to JavaDoc,
	 * the signature (parameters) of a method must not be included with the @link tag, only the
	 * name of the method (as !JavaScript has no method overloading).
	 *
	 * @class (mandatory) Marks the function as a constructor (defining a class). (Note: if only one token 
	 *                  follows the @class tag, JSDoc3 assumes that this token is the name of the class. 
	 *                  If more tokens follow, it assumes that this is a class documentation. so to be on 
	 *                  the safe side, it is best to use @classdesc for a description and @class or 
	 *                  @constructor just as a marker.)
	 * @param {string} sId Documentation of constructor parameters.
	 * @param {object} [mProperties=null] For optional parameters, the name is enclosed in square brackets.
	 *                  A default value can be appended then with a '='.
	 * @param {string} [mProperties.text] Even members of a configuration parameter can be documented.
	 * @see (optional, multiple) Fully qualified HTTP links to external documentation are also possible.
	 *
	 * The following annotation below defines the visibility as public or private (default).  
	 * Note: there MUST BE NO TEXT AFTER PUBLIC/PRIVATE. Not even in the next line. If anything, 
	 * another tag must follow.
	 * @public|@private
	 * @author (optional, multiple) Multiple authors are possible,
	 *                              order is significant (first named author is the default contact).
	 * @since (optional) When the class/function has been introduced.
	 * @extends sap.ui.base.Object Documents the inheritance relationship.
	 * @alias foo.bar.MyClass (Mandatory when defining a class with extend).
	 */
	var MyClass = BaseObject.extend("foo.bar.MyClass", /** @lends foo.bar.MyClass.prototype */ {

		constructor: function(sId, mProperties) {

			// init and document members here
			/**
			 * The ID of a MyClass.
			 *
			 * @private
			 */
			this.mId = sId || Utils.createGUID();
		},

		// now add further methods to that prototype
		/**
		 * Again a summary in one sentence.
		 *
		 * More details can be documented, should the method be that complex.
		 * @param {string} sMethod The same mechanism as above can be used to document the parameters.
		 * @param {object} [oListener] An optional parameter. If empty, the <code>window</code> is used instead.
		 * @experimental Since 1.24 Behavior might change.
		 * @public
		 */
		ownMethod: function(sMethod, oListener) {

			// ... impl
		},

		/**
		 * A private method.
		 *
		 * Every member with a doc comment is included in the public JSDOC.
		 * So we explicitly declare this as a private member:
		 * 
		 * Additionally, using an underscore prefix prevents this method
		 * from being added to the public facade.
		 *
		 * @private
		 */
		_myVeryPrivateMethod: function() {
		}

	});

	// export the class
	return MyClass;

});
```

Virtual Methods
---------------

```js
/**
 * A 'virtual' method, that doesn't exist in this class but should be declared
 * in subclasses.
 * 
 * It is even possible to document things that aren't there. Only useful use case is the 
 * documentation of abstract methods.
 * 
 * @name foo.bar.MyClass.prototype.abstractMethod
 * @function
 * @protected
 */
```


