/*
 * ${copyright}
 */

// Provides TablePersoProvider
sap.ui.define(['sap/ui/base/ManagedObject', "sap/base/Log"],
	function(ManagedObject, Log) {
	"use strict";



	/**
	 * This is an abstract TablePersoProvider, describing the interface for a real
	 * TablePersoProvider.
	 *
	 * @public
	 *
	 * @class Table Personalization Provider
	 * @extends sap.ui.base.ManagedObject
	 * @abstract
	 * @author SAP
	 * @version ${version}
	 * @alias sap.m.TablePersoProvider
	 */
	var TablePersoProvider = ManagedObject.extend("sap.m.TablePersoProvider", /** @lends sap.m.TablePersoProvider.prototype */

	{
		constructor: function(sId, mSettings) {

			ManagedObject.apply(this, arguments);

		},

		metadata: {
			"abstract": true,
			library: "sap.m"
		}

	});


	/**
	 * Initializes the TablePersoProvider instance after creation.
	 *
	 * @protected
	 */
	TablePersoProvider.prototype.init = function() {

		Log.warning("This is the abstract base class for a TablePersoProvider. Do not create instances of this class, but use a concrete sub class instead.");
		Log.debug("TablePersoProvider init");

	};

	/**
	 * Retrieves the personalization bundle.<br>
	 * This must return a {@link http://api.jquery.com/promise/ jQuery Promise},
	 * which resolves in the desired table state.
	 *
	 * @example [
	 *		{
	 *			id: "demoApp-productsTable-productCol",
	 *			order: 2,
	 *			text: "Product",
	 *			visible: true
	 *		},
	 *		{
	 *			id: "demoApp-productsTable-supplierCol",
	 *			order: 1,
	 *			text: "Supplier",
	 *			visible: true
	 *		},
	 *		{
	 *			id: "demoApp-productsTable-dimensionsCol",
	 *			order: 0,
	 *			text: "Dimensions",
	 *			visible: false
	 *		}
	 *	]
	 *
	 * @public
	 */
	TablePersoProvider.prototype.getPersData = function() {

		Log.debug("TablePersoProvider getPersData");

	};

	/**
	 * Stores the personalization bundle, overwriting any previous bundle completely.<br>
	 * This must return a {@link http://api.jquery.com/promise/ jQuery promise}.
	 * @param {object} oBundle
	 * @public
	 */
	TablePersoProvider.prototype.setPersData = function(oBundle) {

		Log.debug("TablePersoProvider setPersData");

	};

	/**
	 * Removes the personalization bundle.<br>
	 * This must return a {@link http://api.jquery.com/promise/ jQuery promise}.
	 * @public
	 */
	TablePersoProvider.prototype.delPersData = function() {

		Log.debug("TablePersoProvider delPersData");

	};

	/**
	 * Callback function which can be used to determine the title of a given column
	 * within the TablePersoDialog. As a default, the column header controls are
	 * asked for their 'text' or 'title' property. This works in most cases, for example
	 * if the header control is an sap.m.Label (has 'text' property) or an sap.m.ObjectListItem
	 * (has 'title' property).
	 *
	 * If the header control used in a column has neither 'text' nor 'title' property, or if you would like to
	 * display a modified column name for a certain column, this callback function can be used.
	 *
	 * If the callback delivers null for a column (which is the default implementation), the default
	 * texts described above are displayed for that column in the TablePersoDialog.
	 *
	 * In case neither the callback delivers null and neither 'text' nor ' title' property are at hand,
	 * the TablePersoDialog will display the column id and a warning message is logged.
	 *
	 * @param {sap.m.Column} oColumn column whose caption shall be determined
	 * @public
	 */
	TablePersoProvider.prototype.getCaption = function(oColumn) {
		return null;
	};

	/**
	 * Callback function which can be used to determine the group of a given column
	 * within the TablePersoDialog. As a default, the columns are not assigned to a group.
	 *
	 * This information is used to group the columns within the TablePersoDialog if the TablePersoController's
	 * 'group' flag is set, otherwise, the groups are ignored.
	 *
	 * @param {sap.m.Column} oColumn column whose group shall be determined
	 * @public
	 */
	TablePersoProvider.prototype.getGroup = function(oColumn) {
		return null;
	};


	/**
	* Resets user’s personalization for a given table so that ‘getPersData’ will
	* deliver its initial state. If no table is specified, all personalizations
	* of the currently logged on user are reset.<br>
	*
	* This must return a {@link http://api.jquery.com/promise/ jQuery promise}.
	* @public
	*/
	TablePersoProvider.prototype.resetPersData = function() {

		Log.debug("TablePersoProvider resetPersData");

	};

	/**
	 * Retrieves the desired reset state.
	 * This getter is used by the <code>TablePersoController</code> if the <code>resetAllMode</code> is <code>ServiceReset</code>.<br>
	 *
	 * This must return a {@link http://api.jquery.com/promise/ jQuery promise}.
	 * @public
	 * @since 1.88
	 */
	TablePersoProvider.prototype.getResetPersData = function() {

		Log.debug("TablePersoProvider getPersData");

	};



	return TablePersoProvider;

});