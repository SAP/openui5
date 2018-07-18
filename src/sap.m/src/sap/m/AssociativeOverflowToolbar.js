/*!
 * ${copyright}
 */

// Provides control sap.m.AssociativeOverflowToolbar.
sap.ui.define(['sap/base/Log', './OverflowToolbar', './OverflowToolbarRenderer', './Toolbar'],
	function (Log, OverflowToolbar, OverflowToolbarRenderer, Toolbar) {
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

		AssociativeOverflowToolbar.prototype.insertContent = function (oControl, iIndex) {
			var sInsertedControlId = oControl.getId(),
				aIds = this.getAssociation("content").filter(function (sId) {
					return sId !== sInsertedControlId;
				});

			var i;
			if (iIndex < 0) {
				i = 0;
			} else if (iIndex > aIds.length) {
				i = aIds.length;
			} else {
				i = iIndex;
			}
			if (i !== iIndex) {
				Log.warning("AssociativeOverflowToolbar.insertContent: index '" + iIndex + "' out of range [0," + aIds.length + "], forced to " + i);
			}

			aIds.splice(i, 0, sInsertedControlId);

			this.removeAllAssociation("content");
			aIds.forEach(function (sId) {
				this.addAssociation("content", sId);
			}, this);

			return this;
		};

		AssociativeOverflowToolbar.prototype.exit = function () {
			OverflowToolbar.prototype.exit.apply(this, arguments);
			return this._callToolbarMethod('destroyContent', [true]);
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
					return this.insertContent(aArguments[0], aArguments[1]);
				case 'removeContent':
					return sap.ui.getCore().byId(this.removeAssociation("content", aArguments[0], aArguments[1], aArguments[2])) || null;
				case 'destroyContent':
					this.removeAllAssociation("content", aArguments[0]);
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

	});
