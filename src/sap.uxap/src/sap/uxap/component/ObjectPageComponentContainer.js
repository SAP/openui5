/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/ComponentContainer', "sap/base/Log", 'sap/ui/core/Component'],
	function(ComponentContainer, Log, Component) {
		"use strict";

		/**
		 * The objectPageComponentContainer initialize and render an objectPageLayout
		 * @alias sap.uxap.component.ObjectPageComponentContainer
		 */
		var ObjectPageComponentContainer = ComponentContainer.extend("sap.uxap.component.ObjectPageComponentContainer", /** @lends sap.uxap.component.ObjectPageComponentContainer.prototype */ {
			metadata: {
				library: "sap.uxap",
				properties: {
					"jsonConfigurationURL": {type: "string", group: "Behavior"},
					"mode": {type: "sap.uxap.ObjectPageConfigurationMode", group: "Behavior"}
				}
			},

			/**
			 *  initialize the component container and set default configuration
			 */
			init: function () {
				//set default config
				this.setPropagateModel(true);
				this.setName("sap.uxap.component");
			},

			/**
			 * this ComponentContainer is working only with one component: the objectPageLayout
			 * unlike the standard ComponentContainer, this ones exposes properties to the outside world and pass them on to the underlying component
			 */
			onBeforeRendering: function () {
				// call the parent onBeforeRendering
				if (ComponentContainer.prototype.onBeforeRendering) {
					ComponentContainer.prototype.onBeforeRendering.call(this);
				}
			},

			_createComponent : function () {
				var oPromise;
				if (!this._oComponent) {
					oPromise = Component.create({
						name: this.getName(),
						url: this.getUrl(),
						componentData: {            //forward configuration to underlying component
							jsonConfigurationURL: this.getJsonConfigurationURL(),
							mode: this.getMode()
						}
					});

					oPromise.then(function (oComponent) {
						this._oComponent = oComponent;
					}.bind(this));

					return oPromise;
				} else {
					return this._oComponent;
				}
			},

			/**
			 * Returns the instantiated objectPageLayout for further api manipulations or null if not not rendered already.
			 * @returns {sap.uxap.ObjectPageLayout} Layout instanse
			 */
			getObjectPageLayoutInstance: function () {
				var oObjectPageLayoutInstance = null;
				if (this._oComponent && this._oComponent._oView) {
					oObjectPageLayoutInstance = this._oComponent._oView.byId("ObjectPageLayout");
				} else {
					Log.error("ObjectPageComponentContainer :: cannot find children ObjectPageLayout, has it been rendered already?");
				}

				return oObjectPageLayoutInstance;
			},

			/**
			 * use the standard renderer
			 */
			renderer: "sap.ui.core.ComponentContainerRenderer"
		});

		return ObjectPageComponentContainer;
	});