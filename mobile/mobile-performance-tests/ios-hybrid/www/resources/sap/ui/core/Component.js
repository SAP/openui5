/*
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides base class sap.ui.core.Component for all components
jQuery.sap.declare("sap.ui.core.Component");
jQuery.sap.require("sap.ui.base.ManagedObject");

/**
 * Creates and initializes a new control with the given <code>sId</code> and
 * settings.
 *
 * The set of allowed entries in the <code>mSettings</code> object depends on
 * the concrete subclass and is described there. See {@link sap.ui.core.Element}
 * for a general description of thi s argument.
 *
 * @param {string}
 *            [sId] optional id for the new control; generated automatically if
 *            no non-empty id is given Note: this can be omitted, no matter
 *            whether <code>mSettings</code> will be given or not!
 * @param {object}
 *            [mSettings] optional map/JSON-object with initial settings for the
 *            new control
 * @public
 *
 * @class Base Class for Component.
 * @extends sap.ui.base.Base
 * @abstract
 * @author SAP
 * @version
 * 1.9.1-SNAPSHOT
 * @name sap.ui.core.Component
 */
sap.ui.base.ManagedObject.extend("sap.ui.core.Component", /*
 * @lends
 * sap.ui.core.Component
 */
{

	metadata : {
		"abstract" : true,
		publicMethods : [ "wire" ],
		library : "sap.ui.core"
	},

	constructor : function(sId, mSettings) {

		sap.ui.base.ManagedObject.apply(this, arguments);
	}

});

/**
 * Initializes the Component instance after creation.
 *
 * Applications must not call this hook method directly, it is called by the
 * framework while the constructor of an Component is executed.
 *
 * Subclasses of Component should override this hook to implement any necessary
 * initialization.
 *
 * @function
 * @name sap.ui.core.Component.prototype.init
 * @protected
 */
sap.ui.core.Component.prototype.init = function() {
};

/**
 * Cleans up the component instance before destruction.
 *
 * Applications must not call this hook method directly, it is called by the
 * framework when the element is {@link #destroy destroyed}.
 *
 * Subclasses of Component should override this hook to implement any necessary
 * cleanup.
 *
 * @function
 * @name sap.ui.core.Component.prototype.exit
 * @protected
 */
sap.ui.core.Component.prototype.exit = function() {
};