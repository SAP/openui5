/*!
 * ${copyright}
 */

// Provides controller extension class (part of MVC concept)
sap.ui.define(['sap/ui/base/Object', 'sap/ui/core/mvc/ControllerExtensionMetadata'],
	function(BaseObject, ControllerExtensionMetadata) {
	"use strict";
		var ControllerExtension = BaseObject.extend("sap.ui.core.mvc.ControllerExtension", {
			metadata: {
				stereotype: "controllerextension",
				methods: {
					"byId" : 				{"public": true, "final": true},
					"getView" : 			{"public": true, "final": true},
					"getInterface" : 		{"public": false, "final": true},
					"onInit" : 				{"public": false, "final": false},
					"onExit" : 				{"public": false, "final": false},
					"onBeforeRendering" : 	{"public": false, "final": false},
					"onAfterRendering" :	{"public": false, "final": false}
				}
			},

			/**
			 * Sets the controller for this extension. Accessible by the base member.
			 *
			 * @param {sap.ui.core.mvcController} oController The controller
			 * @private
			 */
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
				var sNamespace = this.getMetadata().getNamespace();
				sId = sNamespace + "." + sId;
				return this.base ? this.base.byId(sId) : undefined;
			},

			/**
			 * Returns the View from the corresponding controller
			 *
			 * @return {sap.ui.core.mvc.View} oView The corresponding view instance
			 */
			getView: function() {
				return this.base.getView();
			},

			/**
			 * Returns the public interface for this exetension
			 *
			 * @returns {object} oInterface The public interface for this extension
			 * @private
			 */
			getInterface: function() {
				var mMethods = {};
				var oMetadata = this.getMetadata();
				var aPublicMethods = oMetadata.getAllPublicMethods();

				aPublicMethods.forEach(function(sMethod) {
					if (typeof this[sMethod] === 'function' && oMetadata.isMethodPublic(sMethod)) {
						var fnFunction = this[sMethod];
						mMethods[sMethod] = function() {
							var tmp = fnFunction.apply(this, arguments);
							return (tmp instanceof ControllerExtension) ? tmp.getInterface() : tmp;
						}.bind(this);
					}
				}.bind(this));

				return mMethods;
			}
		}, ControllerExtensionMetadata);

		/**
		 * Override the ControllerExtension class with the given custom extension
		 * definition. Only public methods that are not final could be overridden.
		 * The lifecycle methods <code>onInit</code>, <code>onExit</code>,
		 * <code>onBeforeRendering</code> and <code>onAfterRendering</code>
		 * are added before or after the lifecycle functions of the original
		 * extension:
		 *
		 * Example for oExtension:
		 * {
		 *		onInit: function() {
		 *	 		...
		 *	 	},
		 *      ...
		 * }
		 *
		 * @param {object} oExtension The custom extension definition
		 * @public
		 */
		ControllerExtension.override = function(oExtension) {
			if (!oExtension) {
				jQuery.sap.log.error("Error in ControllerExtension.override. No extension definition for override provided!");
			}
			var mControllerLifecycleMethods = this.getMetadata().getLifecycleConfiguration();
			//override the original extension methods for the entries in oExtension
			for (var sOverrideMember in oExtension) {
				//extend the lifecycle methods
				if (sOverrideMember in mControllerLifecycleMethods) {
					ControllerExtension.extendLifecycleMethod(sOverrideMember, this, oExtension, this);
				}
				var fnCustom = oExtension[sOverrideMember];
				if (sOverrideMember in this.prototype) {
					jQuery.sap.log.debug("Overriding  member '" + sOverrideMember + "' of extension " + this.getMetadata().getName());
					//override extension member methods
					if (!this.getMetadata().isMethodFinal(sOverrideMember)) {
						this.prototype[sOverrideMember] = fnCustom.bind(oExtension);
					}  else {
						jQuery.sap.log.error("Error in ControllerExtension.override: Method '" + sOverrideMember + "' of extension '" + this.getMetadata().getName() + "' is flagged final and cannot be overridden!");
					}
				} else {
					//override method runs in the context of the extension
					this.prototype[sOverrideMember] = fnCustom.bind(oExtension);
				}
			}
			return this;
		};


		/**
		 * Extends the lifecycle methods of a controller or an extension
		 *
		 * @param {string} sMemberName The name of the function
		 * @param {sap.ui.core.mvc.Controller|sap.ui.core.mvc.ControllerExtension} oOrigDef The controller/extension to extend
		 * @param {sap.ui.core.mvc.ControllerExtension|object} oCustomDef The controller extension
		 * @param {object} oContext Used as context for the extended function
		 * @private
		 */
		ControllerExtension.extendLifecycleMethod = function(sMemberName, oOrigDef, oCustomDef, oContext) {
			var mControllerLifecycleMethods = this.getMetadata().getLifecycleConfiguration();
			if (mControllerLifecycleMethods[sMemberName] !== undefined) {
				// special handling for lifecycle methods
				var fnOri = oOrigDef[sMemberName];
				var fnCust = oCustomDef[sMemberName];
				if (fnOri && typeof fnOri === "function") {
					// use closure to keep correct values inside overridden function
					(function(fnCust, fnOri, bOriBefore, oContext){
						oOrigDef[sMemberName] = function() {
							// call original function before or after the custom one
							// depending on the lifecycle method (see mControllerLifecycleMethods object above)
							if (bOriBefore) {
								fnOri.apply(oOrigDef, arguments);
								fnCust.apply(oContext, arguments);
							} else {
								fnCust.apply(oContext, arguments);
								fnOri.apply(oOrigDef, arguments);
							}
						};
					})(fnCust, fnOri, mControllerLifecycleMethods[sMemberName], oContext);
				} else if (typeof fnCust === "function") {
					oOrigDef[sMemberName] = fnCust.bind(oContext);
				} else {
					jQuery.sap.log.error("Controller extension failed: lifecycleMethod '" + sMemberName + "', is not a function");
				}
				return true;
			}
			return false;
		};

		return ControllerExtension;
	}
);
