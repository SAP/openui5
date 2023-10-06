/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/HBox",
	"sap/ui/core/StaticArea",
	"sap/ui/dt/util/ZIndexManager",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/rta/util/Animation",
	"./BaseRenderer"
], function(
	HBox,
	StaticArea,
	ZIndexManager,
	ResourceModel,
	Animation,
	BaseRenderer
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.toolbar.Base control
	 *
	 * @class
	 * Base class for Toolbar control
	 * @extends sap.m.HBox
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.toolbar.Base
	 */

	var Base = HBox.extend("sap.ui.rta.toolbar.Base", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				/** Color in the toolbar */
				color: {
					type: "string",
					defaultValue: "default"
				},

				/** z-index of the toolbar on the page. Please consider of using bringToFront() function */
				zIndex: {
					type: "int"
				},

				/**
				 * information from the rta instance needed for some Toolbar extensions.
				 * Includes the flexSettings, command stack and the root control from the RuntimeAuthoring instance
				 */
				rtaInformation: {
					type: "object",
					defaultValue: {
						flexSettings: {}
					}
				},

				/** i18n bundle */
				textResources: "object"
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			// call parent constructor
			HBox.apply(this, aArgs);

			this._oExtensions = {};
			this.setAlignItems("Center");
			this.setVisible(false);
			this.placeToContainer();
		},

		/**
		 * Defines type of the Toolbar. E.g. fiori, standalone, etc.
		 * @type {string}
		 */
		type: null,

		/**
		 * Defines whether animation is enabled. If true, the CSS class 'is_visible' will be
		 * added/removed during show/hide calls.
		 * @type {boolean}
		 */
		animation: false,

		renderer: BaseRenderer
	});

	/**
	 * @override
	 */
	Base.prototype.init = function(...aArgs) {
		this._oResourceModel = new ResourceModel({
			bundle: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
		});
		HBox.prototype.init.apply(this, aArgs);
		// Assign the model object to the SAPUI5 core using the name "i18n"
		this.setModel(this._oResourceModel, "i18n");
		this._fnOnScrollBound = this._onScroll.bind(this);
		window.addEventListener("scroll", this._fnOnScrollBound, true);
		return this.buildContent();
	};

	Base.prototype.exit = function(...aArgs) {
		Object.values(this._oExtensions).forEach(function(oExtension) {
			oExtension.destroy();
		});
		this._oExtensions = {};
		window.removeEventListener("scroll", this._fnOnScrollBound, true);

		HBox.prototype.exit.apply(this, aArgs);
	};

	/**
	 * Adds and returns an extension to the toolbar, if it is not already registered.
	 * The new extension gets created with the toolbar itself as property 'toolbar'.
	 *
	 * @param {string} sName - Name of the extension
	 * @param {sap.ui.base.ManagedObject} Extension - Extension Class to be instantiated
	 * @returns {sap.ui.base.ManagedObject|undefined} Returns the extension or undefined if it does not exist
	 */
	Base.prototype.getExtension = function(sName, Extension) {
		if (!Object.keys(this._oExtensions).includes(sName)) {
			this._oExtensions[sName] = new Extension({toolbar: this});
		}
		return this._oExtensions[sName];
	};

	/**
	 * @override
	 */
	Base.prototype.setTextResources = function(oTextResource) {
		this.setProperty("textResources", oTextResource);
		this._oResourceModel = new ResourceModel({
			bundle: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
		});
	};

	Base.prototype.onFragmentLoaded = function() {
		return Promise.resolve();
	};

	/**
	 * Event handlers factory
	 * @param {string} sEventName - Name of the event
	 * @param {sap.ui.base.Event} oEvent - Event object
	 */
	Base.prototype.eventHandler = function(sEventName, oEvent) {
		this[`fire${sEventName}`](oEvent.getParameters());
	};

	/**
	 * Function provides controls which should be rendered into the Toolbar. Controls are going to be rendered
	 * in the same order as provided in returned array.
	 * @returns {Promise<sap.ui.core.Control[]>} A Promise that resolves with an array of controls
	 * @protected
	 */
	Base.prototype.buildControls = function() {
		return Promise.resolve([]);
	};

	/**
	 * Function renders the Toolbar into the page
	 * @protected
	 */
	Base.prototype.placeToContainer = function() {
		// Render toolbar
		this.placeAt(StaticArea.getDomRef());
	};

	/**
	 * Adds content into the Toolbar
	 * @protected
	 * @returns {Promise} An empty Promise
	 */
	Base.prototype.buildContent = function() {
		return this.buildControls().then(function(aControls) {
			aControls.forEach(this.addItem, this);
		}.bind(this));
	};

	/**
	 * Makes the Toolbar visible
	 * @param {function} fnAdjustToolbarCallback - Called before the animation is triggered, e.g. for initial width calculations
	 * @returns {Promise} A Promise which resolves after animation has been completed
	 * @public
	 */
	Base.prototype.show = function(fnAdjustToolbarCallback) {
		// 1) create Promise and wait until DomRef is available
		return new Promise(function(fnResolve) {
			var oDelegate = {
				onAfterRendering() {
					this.removeEventDelegate(oDelegate);
					fnResolve();
				}
			};
			this.addEventDelegate(oDelegate, this);
			this.bringToFront();
			this.setVisible(true); // show DomRef
		}.bind(this))
		// 2) animate DomRef
		.then(function() {
			if (fnAdjustToolbarCallback && typeof fnAdjustToolbarCallback === "function") {
				fnAdjustToolbarCallback();
			}
			return this.animation
				? Animation.waitTransition(this.getDomRef(), this.addStyleClass.bind(this, "is_visible"))
				: Promise.resolve();
		}.bind(this))
		// 3) focus on Toolbar
		.then(function() {
			this.focus();
		}.bind(this));
	};

	/**
	 * Makes the Toolbar invisible
	 * @param {boolean} bSkipTransition - skips the transition for cases like page reloads - where the animation won't be visible and can cause timing issues
	 * @returns {Promise} A Promise which resolves after animation has been completed
	 * @public
	 */
	Base.prototype.hide = function(bSkipTransition) {
		var oPromise = Promise.resolve();
		// 1) animate DomRef
		if (this.animation) {
			if (bSkipTransition) {
				this.removeStyleClass("is_visible");
			} else {
				oPromise = Animation.waitTransition(this.getDomRef(), this.removeStyleClass.bind(this, "is_visible"));
			}
		}
		return oPromise
		// 2) hide DomRef
		.then(function() {
			this.setVisible(false);
		}.bind(this));
	};

	/**
	 * Getter for inner controls
	 *
	 * @param {string} sName - Name of the control
	 * @returns {sap.ui.core.Control|undefined} A control or undefined if there is no control with provided name
	 * @public
	 */
	Base.prototype.getControl = function(sName) {
		return sap.ui.getCore().byId(`sapUiRta_${sName}`);
	};

	/**
	 * Place the Toolbar above everything on the page
	 * @public
	 */
	Base.prototype.bringToFront = function() {
		this.setZIndex(ZIndexManager.getNextZIndex());
	};

	Base.prototype._onScroll = function() {
		var oDomElement = this.getDomRef();
		// In some cases, there is a scroll event before
		// the DOM Element is created
		if (!oDomElement) {
			return;
		}
		var sScrollClass = "sapUiRtaToolbar_scrolling";
		oDomElement.classList.toggle(sScrollClass, window.scrollY > 0);
	};

	return Base;
});