/*!
 * ${copyright}
 */
/**
 *
 * @private
 */
sap.ui.define(["sap/ui/base/Object"], function (BaseObject) {
	"use strict";
	/**
	 *
	 *
	 * Provides a base configuration handler
	 * @private
	 * @internal
	 *
	 *
	 */
	const BaseConfigHandler = BaseObject.extend("sap.m.upload.p13n.handlers.BaseConfigHandler", {});

	/**
	 *
	 *
	 * Provides the name of the event and needs to be implemented by the child clas
	 *
	 * @name sap.m.upload.p13n.handlers.BaseConfigHandler.prototype.getEventName
	 * @function
	 * @protected
	 */

	/**
	 *
	 *
	 * Modifies the state based on config and payload
	 *
	 * @name sap.m.upload.p13n.handlers.BaseConfigHandler.prototype.modifyState
	 * @function
	 * @protected
	 */

	return BaseConfigHandler;
});
