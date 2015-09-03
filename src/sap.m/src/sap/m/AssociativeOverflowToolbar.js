/*!
 * ${copyright}
 */

// Provides control sap.m.AssociativeOverflowToolbar.
sap.ui.define(['./OverflowToolbar', './OverflowToolbarRenderer', './Toolbar'],
	function (OverflowToolbar, OverflowToolbarRenderer, Toolbar) {
		"use strict";

		/**
		 * Constructor for a new AssociativeOverflowToolbar.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * AssociativeOverflowToolbar is a version of OverflowToolbar that uses an association in addition to the aggregation
		 * @extends sap.m.OverflowToolbar
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.34
		 * @alias sap.m.AssociativeOverflowToolbar
		 */
		var AssociativeOverflowToolbar = OverflowToolbar.extend("sap.m.AssociativeOverflowToolbar", /** @lends sap.m.AssociativeOverflowToolbar.prototype */ {
			metadata: {
				associations: {
					/**
					 * The same as content, but provided in the form of an association
					 */
					content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"}
				}
			},
			renderer: OverflowToolbarRenderer
		});

		AssociativeOverflowToolbar.prototype.getContent = function () {
			var associativeArrayWithIds = this.getAssociation("content") || [];
			return associativeArrayWithIds.map(function (controlId) {
				return sap.ui.getCore().byId(controlId);
			});
		};

		AssociativeOverflowToolbar.prototype.indexOfContent = function(oControl) {
			var controlIds = this.getAssociation("content") || [];
			return controlIds.indexOf(oControl.getId());
		};

		AssociativeOverflowToolbar.prototype._callToolbarMethod = function (sFuncName, aArguments) {
			switch (sFuncName) {
				case 'addContent':
					return this.addAssociation("content", aArguments[0]);
				case 'getContent':
					return this.getContent();
				case 'insertContent':
					//insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate)
					return this.addAssociation("content", aArguments[0], aArguments[3]);
				case 'removeContent':
					//removeAssociation = function(sAssociationName, vObject, bSuppressInvalidate)
					return this.removeAssociation("content", aArguments[0], aArguments[1], aArguments[2]).map(function (controlId) {
						return sap.ui.getCore().byId(controlId);
					});
				case 'destroyContent':
					var content = this.removeAllAssociation("content", aArguments[0]).map(function (controlId) {
						return sap.ui.getCore().byId(controlId);
					});
					content.forEach(function (control) {
						control.destroy();
					});
					return this;
				case 'removeAllContent':
					return this.removeAllAssociation("content", aArguments[0]).map(function (controlId) {
						return sap.ui.getCore().byId(controlId);
					});
				default:
					return Toolbar.prototype[sFuncName].apply(this, aArguments);
			}
		};

		return AssociativeOverflowToolbar;

	}, /* bExport= */ false);
