/*!
 * ${copyright}
 */

// Provides control sap.m.OverflowToolbarLayoutData.
sap.ui.define(['sap/m/ToolbarLayoutData', 'sap/m/library', 'jquery.sap.global'],
	function(ToolbarLayoutData, library, jQuery) {
	"use strict";

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;

	/**
	 * Constructor for a new <code>OverflowToolbarLayoutData</code>.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Holds layout data for the {@link sap.m.OverflowToolbar} items.
	 * @extends sap.m.ToolbarLayoutData
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28
	 * @alias sap.m.OverflowToolbarLayoutData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var OverflowToolbarLayoutData = ToolbarLayoutData.extend("sap.m.OverflowToolbarLayoutData", /** @lends sap.m.OverflowToolbarLayoutData.prototype */ { metadata : {

		properties : {

			/**
			 * The OverflowToolbar item can or cannot move to the overflow area
			 *
			 * @deprecated Since version 1.32
			 */
			moveToOverflow : {type: "boolean", defaultValue: true, deprecated: true},

			/**
			 * The OverflowToolbar item can or cannot stay in the overflow area
			 *
			 * @deprecated Since version 1.32
			 */
			stayInOverflow : {type: "boolean", defaultValue: false, deprecated: true},

			/**
			 * Defines OverflowToolbar items priority, Available priorities ate NeverOverflow, High, Low, Disappear and AlwaysOverflow
			 *
			 * @public
			 * @since 1.32
			 */
			priority: {type: "sap.m.OverflowToolbarPriority", group: "Behavior", defaultValue: OverflowToolbarPriority.High},

			/**
			 * Defines OverflowToolbar items group number.
			 * Default value is 0, which means that the control does not belong to any group.
			 * Elements that belong to a group overflow together. The overall priority of the group is defined by the element with highest priority.
			 * Elements that belong to a group are not allowed to have AlwaysOverflow or NeverOverflow priority.
			 * @public
			 * @since 1.32
			 */
			group: {type: "int", group: "Behavior", defaultValue: 0},

			/**
			 * Defines whether the overflow area is automatically closed when interacting with a control in it
			 *
			 * @public
			 * @since 1.40
			 */
			closeOverflowOnInteraction: {type: "boolean", group: "Behavior", defaultValue: true}
		}
	}});

	/**
	 * Called when the OverflowToolbarLayoutData is invalidated.
	 * @override
	 */
	OverflowToolbarLayoutData.prototype.invalidate = function () {
		var sControlPriority = this.getPriority(),
			bInvalidPriority = sControlPriority === OverflowToolbarPriority.AlwaysOverflow ||
				sControlPriority === OverflowToolbarPriority.NeverOverflow;

		// Validate layoutData priority and group properties
		if (this.getGroup() && bInvalidPriority) {
			jQuery.sap.log.error("It is not allowed to set AlwaysOverflow or NeverOverflow to a group items.");
		}

		return ToolbarLayoutData.prototype.invalidate.call(this);
	};

	return OverflowToolbarLayoutData;

});
