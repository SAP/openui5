/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/Element'],
	function (Element) {
		"use strict";

		/**
		 * Constructor for a new <code>Extension</code>.
		 *
		 * @param {string} [sId] ID for the new data provider, generated automatically if no ID is given.
		 * @param {object} [mSettings] Initial settings for the new data provider.
		 *
		 * @class
		 * Provides additional functions and services to an integration card.
		 *
		 * @extends sap.ui.base.ManagedObject
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @experimental Since 1.75
		 * @since 1.75
		 * @alias sap.ui.integration.Extension
		 */
		var Extension = Element.extend("sap.ui.integration.Extension", {
			metadata: {
				library: "sap.ui.integration",
				properties: {
					/**
					 * The actions configuration.
					 * @experimental since 1.75
					 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
					 */
					actions: {
						type: "array"
					}
				},
				events: {

					/**
					 * Fired when an action is triggered.
					 * @experimental since 1.75
					 * Disclaimer: this event is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
					 */
					action: {

						allowPreventDefault: true,

						parameters: {
							/**
							 * The card the action is fired from.
							 */
							card: {type: "sap.ui.core.Control"},

							/**
							 * The action configuration.
							 */
							actionConfig: {type: 'object'},

							/**
							 * The action source.
							 */
							actionSource: {
								type: "sap.ui.core.Control"
							},

							/**
							 * The parameters related to the triggered action.
							 */
							parameters: {
								type: "object"
							},

							/**
							 * The type of the action.
							 */
							type: {
								type: "sap.ui.integration.CardActionType"
							}
						}
					}
				}
			}
		});

		return Extension;
	});