/*!
 * ${copyright}
 */

// Provides control sap.m.List.
sap.ui.define(["./library", "./ListBase", "./ListRenderer", "sap/ui/core/Lib", "sap/ui/core/InvisibleText"],
	function(library, ListBase, ListRenderer, Library, InvisibleText) {
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
	var List = ListBase.extend("sap.m.List", /** @lends sap.m.List.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Sets the background style of the list. Depending on the theme, you can change the state of the background from <code>Solid</code> to <code>Translucent</code> or to <code>Transparent</code>.
				 * @since 1.14
				 */
				backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Solid}
			}
		},

		renderer: ListRenderer
	});

	List.prototype.exit = function() {
		ListBase.prototype.exit.call(this);
		if (this._oInvisibleGroupText) {
			this._oInvisibleGroupText.destroy();
			this._oInvisibleGroupText = null;
		}
	};

	List.prototype._getInvisibleGroupText = function() {
		if (!this._oInvisibleGroupText) {
			this._oInvisibleGroupText = new InvisibleText().toStatic();
		}
		return this._oInvisibleGroupText;
	};

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

	List.prototype._sAriaRoleDescriptionKey = "LIST_ROLE_DESCRIPTION";

	/**
	 * Applies the aria role description with the given text key to the control.
	 *
	 * <b>Note:</b>
	 * <ul>
	 * <li>This method must be called before the control renders.</li>
	 * <li>The description is only applied when the role is 'list'.</li>
	 * </ul>
	 *
	 * @param {string} [sTextKey] aria role description text key
	 * @private
	 * @ui5-restricted sap.m.UploadSet
	 * @since 1.120
	 */
	List.prototype.applyAriaRoleDescription = function(sTextKey) {
		this._sAriaRoleDescriptionKey = sTextKey;
	};

	List.prototype._skipGroupHeaderFocus = function() {
		// Currently hidden behind a URL flag, as ComboBox and MultiComboBox are not compatible with the new behavior
		// As they set the focus themselves (focus the first visible item), it leads to a lot of issues.
		const oParams = new URLSearchParams(window.location.search);
		return oParams.get("sap-ui-xx-list-skip-group-header-focus") && this.getAriaRole() === "listbox";
	};

	List.prototype._hasNestedGrouping = function() {
		return this.getAriaRole() === "list";
	};

	List.prototype._updateInvisibleGroupText = function() {
		const bUpdateGroupDescription = this._hasNestedGrouping() || this._skipGroupHeaderFocus();

		if (this.isGrouped() && bUpdateGroupDescription) {
			const oInvisibleText = this._getInvisibleGroupText();
			const sBundleKey = this._hasNestedGrouping() ? "LIST_ROLE_LIST_GROUP_DESCRIPTION" : "LIST_ROLE_LISTBOX_GROUP_DESCRIPTION",
				iGroupCount = this.getItems().filter((oItem) => oItem.isGroupHeader()).length,
				aValues = this._hasNestedGrouping() ? [iGroupCount, this.getSize()] : [iGroupCount];

			oInvisibleText.setText(Library.getResourceBundleFor("sap.m").getText(sBundleKey, aValues));
			this.getNavigationRoot()?.setAttribute("aria-describedby", oInvisibleText.getId());
		}
	};

	return List;

});
