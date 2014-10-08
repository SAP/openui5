/*!
 * ${copyright}
 */

// Provides control sap.m.ActionSelect.
sap.ui.define(['jquery.sap.global', './Select', './library'],
	function(jQuery, Select, library) {
	"use strict";


	
	/**
	 * Constructor for a new ActionSelect.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The ActionSelect control provides a list of predefined items that allows end users to choose options and additionally trigger some actions.
	 * @extends sap.m.Select
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16
	 * @name sap.m.ActionSelect
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ActionSelect = Select.extend("sap.m.ActionSelect", /** @lends sap.m.ActionSelect.prototype */ { metadata : {
	
		library : "sap.m",
		associations : {
	
			/**
			 * Buttons to be added to the ActionSelect content.
			 */
			buttons : {type : "sap.m.Button", multiple : true, singularName : "button"}
		}
	}});
	
	/* =========================================================== */
	/* Internal methods and properties                             */
	/* =========================================================== */
	
	/* ----------------------------------------------------------- */
	/* Private methods                                             */
	/* ----------------------------------------------------------- */
	
	/**
	 * Determines whether the ActionSelect has content or not.
	 *
	 * @return {boolean}
	 * @override
	 * @private
	 */
	ActionSelect.prototype.hasContent = function() {
		return Select.prototype.hasContent.call(this) || !!this.getButtons().length;
	};
	
	/**
	 * Add additional content.
	 *
	 * @override
	 * @private
	 * @name sap.m.ActionSelect#addContent
	 */
	ActionSelect.prototype.addContent = function() {
		var oCore = sap.ui.getCore(),
			oPicker = this.getPicker();
	
		this.getButtons().forEach(function(sButtonId) {
			oPicker.addContent(oCore.byId(sButtonId));
		});
	};
	
	/* =========================================================== */
	/* Lifecycle methods                                           */
	/* =========================================================== */
	
	/**
	 * Called after the ActionSelect picker pop-up is render.
	 *
	 * @override
	 * @protected
	 * @name sap.m.ActionSelect#onAfterRenderingPicker
	 */
	ActionSelect.prototype.onAfterRenderingPicker = function() {
		Select.prototype.onAfterRenderingPicker.call(this);
		this.getPicker().addStyleClass(sap.m.ActionSelectRenderer.CSS_CLASS + "Picker");
	};
	
	/* =========================================================== */
	/* API methods                                                 */
	/* =========================================================== */
	
	/* ----------------------------------------------------------- */
	/* Public methods                                              */
	/* ----------------------------------------------------------- */
	
	/**
	 * Button to be removed from the ActionSelect content.
	 *
	 * @param {int | string | sap.m.Button} vButton The button to remove or its index or id.
	 * @returns {string} The id of the removed button or null.
	 * @public
	 * @name sap.m.ActionSelect#removeButton
	 * @function
	 */
	ActionSelect.prototype.removeButton = function(vButton) {
		var oPicker = this.getPicker();
	
		if (oPicker) {
	
			if (typeof vButton === "number") {
				vButton = this.getButtons()[vButton];
			}
	
			oPicker.removeContent(vButton);
		}
	
		return this.removeAssociation("buttons", vButton);
	};
	
	/**
	 * Remove all buttons from the ActionSelect.
	 *
	 * @returns {string[]} An array with the ids of the removed elements (might be empty).
	 * @public
	 * @name sap.m.ActionSelect#removeAllButtons
	 * @function
	 */
	ActionSelect.prototype.removeAllButtons = function() {
		var oPicker = this.getPicker();
	
		if (oPicker) {
			this.getButtons().forEach(function(sButtonId) {
				oPicker.removeContent(sButtonId);
			});
		}
	
		return this.removeAllAssociation("buttons");
	};

	return ActionSelect;

}, /* bExport= */ true);
