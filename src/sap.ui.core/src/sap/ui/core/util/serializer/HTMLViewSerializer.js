/*
 * ${copyright}
 */

sap.ui.define(['sap/ui/base/EventProvider', './Serializer', './delegate/HTML', 'sap/ui/thirdparty/vkbeautify'],
	function(EventProvider, Serializer, HTML, vkbeautify) {
	"use strict";


	/**
	 * HTML view serializer class. Serializes a given view.
	 *
	 * @param {sap.ui.core.mvc.HTMLView} oView the view to serialize
	 * @param {object} [oWindow=window] the window object. Default is the window object the instance of the serializer is running in
	 * @param {function} fnGetControlId delegate function which returns the control id
	 * @param {function} fnGetEventHandlerName delegate function which returns the event handler name
	 *
	 * @class HTMLViewSerializer class.
	 * @extends sap.ui.base.EventProvider
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.util.serializer.HTMLViewSerializer
	 * @private
	 * @ui5-restricted sap.watt com.sap.webide
	 */
	var HTMLViewSerializer = EventProvider.extend("sap.ui.core.util.serializer.HTMLViewSerializer", /** @lends sap.ui.core.util.serializer.HTMLViewSerializer.prototype */
	{
		constructor : function (oView, oWindow, fnGetControlId, fnGetEventHandlerName) {
			EventProvider.apply(this);
			this._oView = oView;
			this._oWindow = oWindow;
			this._fnGetControlId = fnGetControlId;
			this._fnGetEventHandlerName = fnGetEventHandlerName;
		}
	});


	/**
	 * Serializes the given HTML view.
	 *
	 * @returns {string} the serialized HTML view.
	 */
	HTMLViewSerializer.prototype.serialize = function () {
		var that = this;
		// a function to understand if to skip aggregations
		var fnSkipAggregations = function (oControl) {
			return oControl instanceof this._oWindow.sap.ui.core.mvc.View && oControl !== that._oView;
		};

		// create serializer
		var oControlSerializer = new Serializer(
			this._oView,
			new HTML(
				this._fnGetControlId,
				this._fnGetEventHandlerName),
			true,
			this._oWindow,
			fnSkipAggregations);

		// run serializer
		var sResult = oControlSerializer.serialize();

		// wrap result with the template tag
		var sView = [];
		sView.push('<template');
		if (this._oView.getControllerName && this._oView.getControllerName()) {
			sView.push(' data-controller-name="' + this._oView.getControllerName() + '"');
		}
		sView.push(" >");
		sView.push(sResult);
		sView.push("</template>");

		// done
		return vkbeautify.xml(sView.join(""));
	};

	return HTMLViewSerializer;

});
