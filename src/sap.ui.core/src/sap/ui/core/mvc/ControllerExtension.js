/*!
 * ${copyright}
 */

// Provides controller extension class (part of MVC concept)
sap.ui.define(['sap/ui/base/Object', 'sap/ui/base/Metadata', 'sap/ui/core/mvc/ControllerMetadata', 'sap/ui/core/mvc/OverrideExecution', 'sap/base/util/uid'],
	function(BaseObject, Metadata, ControllerMetadata, OverrideExecution, uid) {
	"use strict";
		var ControllerExtension = BaseObject.extend("sap.ui.core.mvc.ControllerExtension", {
			metadata: {
				stereotype: "controllerextension",
				methods: {
					"byId" : 				{"public": true, "final": true},
					"getView" : 			{"public": true, "final": true},
					"getInterface" : 		{"public": false, "final": true}
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
					var fnFunction = this[sMethod];
					if (typeof fnFunction === 'function') {
						mMethods[sMethod] = function() {
							var tmp = fnFunction.apply(this, arguments);
							return (tmp instanceof ControllerExtension) ? tmp.getInterface() : tmp;
						}.bind(this);
					}
					//}
				}.bind(this));
				this.getInterface = jQuery.sap.getter(mMethods);
				return mMethods;
			}
		}, ControllerMetadata);

		/**
		 * Override the ControllerExtension class with the given custom extension
		 * definition. Only public methods that are not final could be overridden.
		 * The lifecycle methods <code>onInit</code>, <code>onExit</code>,
		 * <code>onBeforeRendering</code> and <code>onAfterRendering</code>
		 * are added before or after the lifecycle functions of the original
		 * extension:
		 *
		 * Example for oExtension:
		 * <pre>
		 * {
		 *     onInit: function() {
		 *         ...
		 *     },
		 *     ...
		 * }
		 * </pre>
		 * @param {object} oExtension The custom extension definition
		 * @public
		 */
		ControllerExtension.override = function(oExtension) {
			// create an anonymous subclass in each call to keep metadata (and static overrides)
			// separated even when override() is called multiple times on the same extension class
			var oClass = Metadata.createClass(this, "anonymousExtension~" + uid(), {}, ControllerMetadata);
			oClass.getMetadata()._staticOverride = oExtension;
			oClass.getMetadata()._override = this.getMetadata()._override;
			return oClass;
		};


		/**
		 * Override a method depending on the overrideExecution strategy
		 *
		 * @param {string} sMemberName The name of the function/member
		 * @param {sap.ui.core.mvc.Controller|sap.ui.core.mvc.ControllerExtension} oOrigDef The controller/extension to extend
		 * @param {sap.ui.core.mvc.ControllerExtension|object} oCustomDef The controller extension
		 * @param {object} oContext Used as context for the extended function
		 * @param {sap.ui.core.mvc.OverrideExecution} sOverrideExecution The override strategy
		 * @private
		 */
		ControllerExtension.overrideMethod = function(sMemberName, oOrigDef, oCustomDef, oContext, sOverrideExecution) {
			var fnOri = oOrigDef[sMemberName];
			var fnCust = oCustomDef[sMemberName];

			sOverrideExecution = sOverrideExecution || OverrideExecution.Instead;

			function wrapMethod(bBefore) {
				(function(fnCust, fnOri, oContext, bBefore){
					oOrigDef[sMemberName] = function() {
						if (bBefore) {
							fnCust.apply(oContext, arguments);
							return fnOri.apply(oOrigDef, arguments);
						} else {
							fnOri.apply(oOrigDef, arguments);
							return fnCust.apply(oContext, arguments);
						}
					};
				})(fnCust, fnOri, oContext, bBefore);
			}
			if (typeof fnCust === 'function' && oContext) {
				fnCust = fnCust.bind(oContext);
			}
			switch (sOverrideExecution) {
				case OverrideExecution.Before:
					if (fnOri && typeof fnOri === "function") {
						wrapMethod(true);
					} else if (typeof fnCust === "function") {
						oOrigDef[sMemberName] = fnCust;
					} else {
						jQuery.sap.log.error("Controller extension failed: lifecycleMethod '" + sMemberName + "', is not a function");
					}
					break;
				case OverrideExecution.After:
					if (fnOri && typeof fnOri === "function") {
						wrapMethod(false);
					} else if (typeof fnCust === "function") {
						oOrigDef[sMemberName] = fnCust;
					} else {
						jQuery.sap.log.error("Controller extension failed: lifecycleMethod '" + sMemberName + "', is not a function");
					}
					break;
				case OverrideExecution.Instead:
				default:
					if (sMemberName in oOrigDef) {
						jQuery.sap.log.debug("Overriding  member '" + sMemberName + "' of extension " + this.getMetadata().getName());
						if (!this.getMetadata().isMethodFinal(sMemberName)) {
							oOrigDef[sMemberName] = fnCust;
						}  else {
							jQuery.sap.log.error("Error in ControllerExtension.override: Method '" + sMemberName + "' of extension '" + this.getMetadata().getName() + "' is flagged final and cannot be overridden!");
						}
					} else {
						oOrigDef[sMemberName] = fnCust;
					}
					break;
			}
		};

		return ControllerExtension;
	}
);
