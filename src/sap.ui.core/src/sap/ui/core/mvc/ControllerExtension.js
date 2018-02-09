/*!
 * ${copyright}
 */

// Provides controller extension class (part of MVC concept)
sap.ui.define(['sap/ui/base/Object'],
	function(BaseObject) {
	"use strict";
		return BaseObject.extend("sap.ui.core.mvc.ControllerExtension", {
			metadata: {
				interfaces: [
					"sap.ui.core.mvc.IControllerExtension"
				],
				publicMethods: [
					"byId",
					"getView"
				]
			},
			_getOverrides: function() {
				return this.override;
			},
			_hasOverrides: function() {
				return !!this.override;
			},
			_setController: function(oController) {
				this.base = oController;
			},
			/**
			 * Returns an Element of the connected view with the given local ID.
			 *
			 * Views automatically prepend their own ID as a prefix to created Elements
			 * to make the IDs unique even in the case of multiple view instances.
			 * For Controller extension the namespace of the control id gets also
			 * prefixed with the namespace of the extension.
			 * This method helps to find an element by its local ID only.
			 *
			 * If no view is connected or if the view doesn't contain an element with
			 * the given local ID, undefined is returned.
			 *
			 * @param {string} sId View-local ID
			 * @return {sap.ui.core.Element} Element by its (view local) ID
			 * @public
			 */
			byId: function(sId) {
				var sNamespace = this.getMetadata().getName();
				sId = sNamespace.substr(0,sNamespace.lastIndexOf(".")) + "." + sId;
				return this.base ? this.base.byId(sId) : undefined;
			},
			/**
			 * Returns the View from the corresponding controller
			 *
			 * @return {sap.ui.core.mvc.View} oView The corresponding view instance
			 */
			getView: function() {
				return this.base.getView();
			}
		});
	}
);