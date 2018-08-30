/*!
 * ${copyright}
 */

/**
 * Control-based DataBinding.
 *
 * <strong>Note</strong>: Although this namespace was declared as 'public', the contained classes never
 * have been declared 'public' and are not supported. We do not recommended to use them. As of 1.58, the
 * {@link sap.ui.model.base.ManagedObjectModel} can be tested as an alternative. It is much more powerful,
 * but still in an experimental state.
 *
 * @namespace
 * @name sap.ui.model.control
 * @deprecated As of 1.58, test the still experimental {@link sap.ui.model.base.ManagedObjectModel} as an alternative.
 * @public
 */

// Provides the JSON object based model implementation
sap.ui.define(['sap/ui/model/Model', './ControlPropertyBinding', "sap/ui/thirdparty/jquery"],
	function(Model, ControlPropertyBinding, jQuery) {
	"use strict";

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
	 * @alias sap.ui.model.control.ControlModel
	 * @private
	 */
	var ControlModel = Model.extend("sap.ui.model.control.ControlModel", /** @lends sap.ui.model.control.ControlModel.prototype */ {

		constructor : function (oControl) {
			Model.apply(this, arguments);
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
		var i = this.oElements.indexOf(oElement);
		if ( i < 0 ) {
			this.oElements.push(oElement);
			oElement.attachEvent("_change", this.checkUpdate, this);
		}
	};

	/**	 */
	ControlModel.prototype.removeFacadeComponent = function(oElement) {
		var i = this.oElements.indexOf(oElement);
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