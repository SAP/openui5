/*!
 * ${copyright}
 */

// Provides class sap.ui.core.AccInfo
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object'],
	function(jQuery, BaseObject) {
	"use strict";

	/**
	 * Creates an accessibility info object with the given parameters.
	 *
	 * Note: The object provides the accessibility state of the given control at the point in time when this object is created.
	 *
	 * @param {sap.ui.core.Control} oControl The control
	 * @param {string} sAriaRole
	 * @param {string} sType The control type (e.g. "button"). Must be a translated text.
	 * @param {string} sDescription A description of the most relevant control state (e.g. the inputs value). Must be a translated text.
	 *                              Note: The type and the enabled/editable state must not be handled here.
	 * @param {boolean} [bFocusable=false] Whether the control can get the focus.
	 * @param {boolean} [bEnabled=null] Whether the control is enabled. If not relevant <code>null</code> can be provided.
	 * @param {boolean} [bEditable=null] Whether the control is editable. If not relevant <code>null</code> can be provided.
	 * @param {sap.ui.core.AccInfo[]} [aChildren] Accessibility info objects of children of the given control (e.g. when the control is a layout).
	 *                                            Note: Children should only be provided when it is helpful to understand the accessibility context
	 *                                                  (e.g. a form control must not provide details of its internals (fields, labels, ...) but a layout should).
	 *
	 * @class An object which provides accessibility relevant information of a control.
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.37.0
	 * @alias sap.ui.core.AccInfo
	 * @protected
	 */
	var Info = BaseObject.extend("sap.ui.core.AccInfo", /** @lends sap.ui.core.AccInfo.prototype */ {
		constructor : function(oControl, sAriaRole, sType, sDescription, bFocusable, bEnabled, bEditable, aChildren) {
			BaseObject.apply(this);
			this._role = sAriaRole || "";
			this._type = sType || "";
			this._desc = sDescription || "";
			this._focus = !!bFocusable;
			this._enabled = bEnabled === true || bEnabled === false ? bEnabled : null;
			this._editable = bEditable === true || bEditable === false ? bEditable : null;
			this._children = aChildren || [];
		}
	});

	/* @see sap.ui.base.Object#destroy */
	Info.prototype.destroy = function() { BaseObject.prototype.destroy.apply(this, arguments); };

	/* @see sap.ui.base.Object#getInterface */
	Info.prototype.getInterface = function() { return this; };

	/**
	 * Returns the aria role.
	 * @protected
	 * @returns {string} Aria role
	 */
	Info.prototype.getAriaRole = function() { return this._role; };

	/**
	 * Returns the translated control type.
	 * @protected
	 * @returns {string} Control type
	 */
	Info.prototype.getType = function() { return this._type; };

	/**
	 * Returns the translated control description.
	 * @protected
	 * @returns {string} Control description
	 */
	Info.prototype.getDescription = function() { return this._desc; };

	/**
	 * Returns <code>true</code> when the control is focusable.
	 * @protected
	 * @returns {boolean} <code>true</code> when the control is focusable, <code>false</code> otherwise
	 */
	Info.prototype.getFocusable = function() { return this._focus; };

	/**
	 * Returns <code>true</code> when the control is enabled.
	 * @protected
	 * @returns {boolean} <code>true</code> when the control is enabled, <code>false</code>
	 *                   when it is disabled and <code>null</code> when the control does not provide such a state.
	 */
	Info.prototype.getEnabled = function() { return this._enabled; };

	/**
	 * Returns <code>true</code> when the control is editable.
	 * @protected
	 * @returns {boolean} <code>true</code> when the control is editable, <code>false</code>
	 *                   when it is readonly and <code>null</code> when the control does not provide such a state.
	 */
	Info.prototype.getEditable = function() { return this._editable; };

	/**
	 * Returns the children.
	 * @protected
	 * @returns {sap.ui.core.AccInfo[]} The children
	 */
	Info.prototype.getChildren = function() { return this._children; };

	/**
	 * Returns the full translated control description incl. control type and enabled/editable state.
	 *
	 * The description does not include the description of the children (if available).
	 *
	 * @protected
	 * @returns {string} Full control description
	 */
	Info.prototype.getFullDescription = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");

		var sDesc = this._type + " " + this._desc;
		if (this._enabled != null && !this._enabled) {
			sDesc = sDesc + " " + oBundle.getText("ACC_CTRL_STATE_DISABLED");
		} else if (this._editable != null && !this._editable) {
			sDesc = sDesc + " " + oBundle.getText("ACC_CTRL_STATE_READONLY");
		}
		return sDesc;
	};

	return Info;

});