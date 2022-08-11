/*!
 * ${copyright}
 */

// Provides control sap.m.List.
sap.ui.define(["./library", "./ListBase", "./ListRenderer"],
	function(library, ListBase, ListRenderer) {
	"use strict";


	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;


	/**
	 * Constructor for a new List.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The List control provides a container for all types of list items.
	 * For mobile devices, the recommended limit of list items is 100 to assure proper performance. To improve initial rendering of large lists, use the "growing" feature. Please refer to the SAPUI5 Developer Guide for more information..
	 *
	 * See section "{@link topic:1da158152f644ba1ad408a3e982fd3df Lists}"
	 * in the documentation for an introduction to <code>sap.m.List</code> control.
	 *
	 * @extends sap.m.ListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.List
	 * @see {@link fiori:/list-overview/ List}
	 */
	var List = ListBase.extend("sap.m.List", /** @lends sap.m.List.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Sets the background style of the list. Depending on the theme, you can change the state of the background from <code>Solid</code> to <code>Translucent</code> or to <code>Transparent</code>.
			 * @since 1.14
			 */
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Solid}
		}
	}});

	List.prototype.getAriaRole = function() {
		return this._sAriaRole || "list";
	};

	/**
	 * Applies the aria <code>role</code> attribute to the control.
	 *
	 * Supported values are:
	 * <ul>
	 * <li><code>list</code>: This is the default since version 1.105. The rendered items will have the <code>role="listitem"</code>.</li>
	 * <li><code>listbox</code>: Legacy support. The rendererd items will have the <code>role="option"</code>.</li>
	 * </ul>
	 * <b>Note:</b> This method must be called before the control renders.
	 * @param {string} sRole role attribute for the control
	 * @protected
	 * @ui5-restricted
	 * @since 1.105
	 */
	List.prototype.applyAriaRole = function(sRole) {
		this._sAriaRole = sRole;
	};

	List.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {
		ListBase.prototype.enhanceAccessibilityState.apply(this, arguments);

		// update listitem Accessibility state according to the list's role attribute
		if (this.getAriaRole() === "listbox" && oElement.isA("sap.m.ListItemBase")) {
			mAriaProps.roledescription = null;
			mAriaProps.role = "option";
			mAriaProps.owns = null;

			if (oElement.isSelectable()) {
				mAriaProps.selected = oElement.getSelected();
			}
		}
	};

	return List;

});
