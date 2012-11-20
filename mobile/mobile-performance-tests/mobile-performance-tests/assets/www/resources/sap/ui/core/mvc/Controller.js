/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides base class for controllers (part of MVC concept)
jQuery.sap.declare("sap.ui.core.mvc.Controller");
jQuery.sap.require("sap.ui.base.EventProvider");

(function(){
	var mRegistry = {};

	/**
	 * Instantiates a (MVC-style) Controller. Consumers should call the constructor only in the
	 * typed controller scenario. In the generic controller use case, they should use
	 * {@link sap.ui.controller} instead.
	 *
	 * @class A generic controller implementation for the UI5 Model View controller concept.
	 *
	 * Can either be used as a generic controller which is enriched on the fly with methods
	 * and properties (see {@link sap.ui.controller}) or  as a base class for typed controllers.
	 *
	 * @param {string || object[]} sName The name of the Controller to instantiate. If a Controller is defined as real sub-class,
	 *                                   the "arguments" of the sub-class constructor should be given instead.
	 * @public
	 */
	sap.ui.core.mvc.Controller = function(sName) {
		var oToExtend = null;
		if (typeof(sName) == "string") {
			/* TODO the whole if block is unnecessary, if constructor is really private (as documented) */
			if (!mRegistry[sName]) {
				jQuery.sap.require({modName: sName, type: "controller"}); // maybe there is a controller definition, but it has not been loaded yet -> try to load

				if (!mRegistry[sName]) {
					throw new Error("Controller type " + sName + " is undefined.");
				}
			}
			oToExtend = mRegistry[sName];
		}

		sap.ui.base.EventProvider.apply(this,arguments);

		if (oToExtend) {
			jQuery.extend(this, mRegistry[sName]);
		}

	};

	// Chain the prototypes
	sap.ui.core.mvc.Controller.prototype = jQuery.sap.newObject(sap.ui.base.EventProvider.prototype);

	/*
	 * Describe class sap.ui.core.mvc.Controller.
	 */
	sap.ui.base.Object.defineClass("sap.ui.core.mvc.Controller", {
		baseType : "sap.ui.base.EventProvider",
		publicMethods: []
	});


	/**
	 * Defines a controller class or creates an instance of an already defined controller class.
	 *
	 * When a name and a controller implementation object is given, a new controller class
	 * of the given name is created. The members of the implementation object will be copied
	 * into each new instance of that controller class (shallow copy).
	 * <b>Note</b>: as the members are shallow copied, controller instances will share all object values.
	 * This might or might not be what applications expect.
	 *
	 * If only a name is given, a new instance of the named Controller class is returned.
	 *
	 * @param {string} sName The Controller name
	 * @param {object} [oControllerImpl] An object literal defining the methods and properties of the Controller
	 * @return {void | sap.ui.core.mvc.Controller} void or the new controller instance, depending on the use case
	 * @public
	 */
	sap.ui.controller = function(sName, oControllerImpl) {
		if (!sName) {
			throw new Error("Controller name ('sName' parameter) is required");
		}

		if (!oControllerImpl) {
			// controller *instantiation*

			// check if controller is available, either anonymous or typed
			if ( !mRegistry[sName] && !jQuery.sap.getObject(sName) ) {
				// if not, try to load an external controller definition module
				jQuery.sap.require({modName: sName, type: "controller"});
			}

			if ( mRegistry[sName] ) {
				// anonymous controller
				return new sap.ui.core.mvc.Controller(sName);
			} else {
				var CTypedController = jQuery.sap.getObject(sName);
				if ( typeof CTypedController === "function" && CTypedController.prototype instanceof sap.ui.core.mvc.Controller ) {
					// typed controller
					return new CTypedController();
				}
			}
			throw new Error("Controller " + sName + " couldn't be instantiated");
		} else {
			// controller *definition*
			mRegistry[sName] = oControllerImpl;
		}

	};

	/**
	 * Returns the view associated with this controller or undefined.
	 * @return {sap.ui.core.mvc.View} View connected to this controller.
	 * @public
	 */
	sap.ui.core.mvc.Controller.prototype.getView = function() {
		return this.oView;
	};

	/**
	 * Returns an Element of the connected view with the given local Id.
	 *
	 * Views automatically prepend their own id as a prefix to created Elements
	 * to make the ids unique even in the case of multiple view instances.
	 * This method helps to find an element by its local id only.
	 *
	 * If no view is connected or if the view doesn't contain an element with
	 * the given local id, undefined is returned.
	 *
	 * @param {string} sId The view-local id
	 * @return {sap.ui.core.Element} Element by its (view local) id
	 * @public
	 */
	sap.ui.core.mvc.Controller.prototype.byId = function(sId) {
		return this.oView ? this.oView.byId(sId): undefined;
	};


	/**
	 * Converts a view local id to a globally unique one by prepending
	 * the view id.
	 *
	 * If no view is connected, undefined is returned.
	 *
	 * @param {string} sId The view-local id
	 * @return {string} The prefixed id
	 * @public
	 */
	sap.ui.core.mvc.Controller.prototype.createId = function(sId) {
		return this.oView ? this.oView.createId(sId): undefined;
	};


	sap.ui.core.mvc.Controller.prototype.connectToView = function(oView) {
		this.oView = oView;

		if (this.onInit) {
			oView.attachAfterInit(this.onInit, this);
		}
		if (this.onExit) {
			oView.attachBeforeExit(this.onExit, this);
		}
		if (this.onAfterRendering) {
			oView.attachAfterRendering(this.onAfterRendering, this);
		}
		if (this.onBeforeRendering) {
			oView.attachBeforeRendering(this.onBeforeRendering, this);
		}
		//oView.addDelegate(this);
	};

}());