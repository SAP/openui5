/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/rta/library',
	'sap/m/HBox',
	'sap/ui/rta/util/Animation',
	'sap/ui/dt/util/getNextZIndex'
],
function(
	library,
	HBox,
	Animation,
	getNextZIndex
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
	 * @experimental Since 1.48. This class is experimental. The API might be changed in future.
	 */

	var Base = HBox.extend("sap.ui.rta.toolbar.Base", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				/** Color in the toolbar */
				"color": {
					type: "string",
					defaultValue: "default"
				},

				/** z-index of the toolbar on the page. Please consider of using bringToFront() function */
				"zIndex": {
					type: "int"
				},

				/** i18n bundle */
				"textResources": "object"
			}
		},
		constructor: function() {
			// call parent constructor
			HBox.apply(this, arguments);

			this.setAlignItems("Center");
			this.setVisible(false);
			this.placeToContainer();
			this.buildContent();
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
		animation: false
	});

	/**
	 * @override
	 */
	Base.prototype.init = function() {
		HBox.prototype.init.apply(this, arguments);
	};

	/**
	 * Event handler for onBeforeRendering
	 * @protected
	 */
	Base.prototype.onBeforeRendering = function () {
		HBox.prototype.onBeforeRendering.apply(this, arguments);
	};

	/**
	 * Event handler for onAfterRendering
	 * @protected
	 */
	Base.prototype.onAfterRendering = function () {
		HBox.prototype.onAfterRendering.apply(this, arguments);
	};

	/**
	 * Event handlers factory
	 * @param {string} sEventName - Name of the event
	 * @param {sap.ui.base.Event} oEvent - Event object
	 */
	Base.prototype.eventHandler = function (sEventName, oEvent) {
		this['fire' + sEventName](oEvent.getParameters());
	};

	/**
	 * Function provides controls which should be rendered into the Toolbar. Controls are going to be rendered
	 * in the same order as provided in returned array.
	 * @return {Array.<sap.ui.core.Control>} - returns an array of controls
	 * @protected
	 */
	Base.prototype.buildControls = function () {
		return [];
	};

	/**
	 * Function renders the Toolbar into the page
	 * @protected
	 */
	Base.prototype.placeToContainer = function () {
		// Render toolbar
		this.placeAt(sap.ui.getCore().getStaticAreaRef());
	};

	/**
	 * Adds content into the Toolbar
	 * @protected
	 */
	Base.prototype.buildContent = function () {
		this.buildControls().forEach(this.addItem, this);
	};

	/**
	 * Makes the Toolbar visible
	 * @return {Promise} - returns Promise which resolves after animation has been completed
	 * @public
	 */
	Base.prototype.show = function() {
		// 1) create Promise and wait until DomRef is available
		return new Promise(function (fnResolve) {
			var oDelegate = {
				onAfterRendering: function () {
					this.removeEventDelegate(oDelegate);
					fnResolve();
				}
			};
			this.addEventDelegate(oDelegate, this);
			this.bringToFront();
			this.setVisible(true); // show DomRef
		}.bind(this))
		// 2) animate DomRef
		.then(function () {
			return this.animation
				? Animation.waitTransition(this.$(), this.addStyleClass.bind(this, 'is_visible'))
				: Promise.resolve();
		}.bind(this))
		// 3) focus on Toolbar
		.then(function () {
			this.focus();
		}.bind(this));
	};

	/**
	 * Makes the Toolbar invisible
	 * @return {Promise} - returns Promise which resolves after animation has been completed
	 * @public
	 */
	Base.prototype.hide = function() {
		// 1) animate DomRef
		return (
			this.animation
			? Animation.waitTransition(this.$(), this.removeStyleClass.bind(this, 'is_visible'))
			: Promise.resolve()
		)
		// 2) hide DomRef
		.then(function () {
			this.setVisible(false);
		}.bind(this));
	};

	/**
	 * Getter for inner controls
	 * @param {string} sName - Name of the control
	 * @return {sap.ui.core.Control|undefined} - returns control or undefined if there is no control with provided name
	 * @public
	 */
	Base.prototype.getControl = function(sName) {
		return this
			.getAggregation('items')
			.filter(function (oControl) {
				return oControl.data('name') === sName;
			})
			.pop();
	};

	/**
	 * Place the Toolbar above everything on the page
	 * @public
	 */
	Base.prototype.bringToFront = function () {
		this.setZIndex(getNextZIndex());
	};

	/**
	 * Backwards compatibility
	 */
	Base.prototype.setUndoRedoEnabled = function () {};
	Base.prototype.setPublishEnabled = function () {};
	Base.prototype.setRestoreEnabled = function () {};

	return Base;

}, true);