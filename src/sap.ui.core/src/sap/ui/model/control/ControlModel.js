/*!
 * ${copyright}
 */

/**
 * Control-based DataBinding
 *
 * @namespace
 * @name sap.ui.model.control
 * @public
 */

// Provides the JSON object based model implementation
sap.ui.define(['jquery.sap.global', 'sap/ui/model/Model', './ControlPropertyBinding'],
	function(jQuery, Model, ControlPropertyBinding) {
	"use strict";

//jQuery.sap.require("sap.ui.model.control.ControlListBinding");

	/**
	 * Constructor for a new ControlModel.
	 *
	 * @class
	 * Model implementation for Control model
	 *
	 * @extends sap.ui.model.Model
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.model.control.ControlModel
	 */
	var ControlModel = Model.extend("sap.ui.model.control.ControlModel", /** @lends sap.ui.model.control.ControlModel.prototype */ {

		constructor : function (oControl) {
			if (typeof oControl === 'string') {
				var _this = this;
				var eventBus = sap.ui.getCore().getEventBus();
				var fakePrefix = 'FakeControl--';
                var fakeId = fakePrefix + oControl;

				// create fake control
				oControl = sap.ui.getCore().byId(fakeId);
				if (!oControl) {
					oControl = new sap.ui.core.Control(fakeId);
					oControl.getProperty = jQuery.noop;
				}
				/**
				 * observer listens for created controls, to replace the fake control, when the
				 * real control is instantiated
				 *
				 * @param {string} channel
                 * @param {string} event
                 * @param {{id: string, control: sap.ui.core.Control}} data
                 */
				var controlCreatedObserver = function (channel, event, data) {
					// check if current model is handling the corresponding fake control for the instantiated control
					if (data.id === _this.oControl.getId().slice(fakePrefix.length) && typeof data.control === 'object') {
						// destroy fake control, because we dont need it anymore
						_this.oControl.destroy();

						// assign the new real control instance
						_this.oControl = data.control;

						// switch existing bindings to new control
						jQuery.each(_this.aBindings, function (index, binding) {
							binding.oContext = _this.oControl;
						});

						// update value with new values from the real control
						_this.oControl.attachEvent("_change", _this.checkUpdate, _this);
						_this.checkUpdate();

						// remove listener, because we now have the real control
						eventBus.unsubscribe('sap.ui.core.Control', '__created', controlCreatedObserver);
					}
				};
				eventBus.subscribe('sap.ui.core.Control', '__created', controlCreatedObserver);
			}
			Model.call(this, oControl);
			this.oControl = oControl;
			this.oControl.attachEvent("_change", this.checkUpdate, this);
			this.oElements = [];
		}

	});

	/**	 */
	ControlModel.prototype.destroy = function() {
		this.oControl.detachEvent("_change", this.checkUpdate, this);
	};

	/**	 */
	ControlModel.prototype.addFacadeComponent = function(oElement) {
		var i = jQuery.inArray(oElement, this.oElements);
		if ( i < 0 ) {
			this.oElements.push(oElement);
			oElement.attachEvent("_change", this.checkUpdate, this);
		}
	};

	/**	 */
	ControlModel.prototype.removeFacadeComponent = function(oElement) {
		var i = jQuery.inArray(oElement, this.oElements);
		if ( i >= 0 ) {
			this.oElements.splice(i, 1);
			oElement.detachEvent("_change", this.checkUpdate, this);
		}
	};

	/**
	 * @see sap.ui.model.Model.prototype.bindProperty
	 */
	ControlModel.prototype.bindProperty = function(sPath, oContext) {
		oContext = oContext || this.oControl;
		if ( oContext !== this.oControl ) {
			this.addFacadeComponent(oContext);
		}
		return new ControlPropertyBinding(this, sPath, oContext);
	};

	/**	 */
	ControlModel.prototype.checkUpdate = function(oEvent) {
		if ( this._onchange ) {
			this._onchange(oEvent);
		}
		if ( this.aBindings.length ) {
			// TODO optimize with info from event object (control & property)
			var aBindings = this.aBindings.slice(0);
			jQuery.each(aBindings, function(iIndex, oBinding) {
				oBinding.checkUpdate();
			});
		}
	};

	return ControlModel;

});
