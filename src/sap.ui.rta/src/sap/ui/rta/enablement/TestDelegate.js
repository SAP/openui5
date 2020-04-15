/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isPlainObject"
],
function(
	isPlainObject
) {
	"use strict";

	function isAString(oObject, sKey) {
		return oObject[sKey] && typeof oObject[sKey] === "string";
	}

	function checkCommonParametersForControl(mPropertyBag) {
		if (!mPropertyBag.appComponent.isA("sap.ui.core.Component")) {
			return false;
		}

		if (!isPlainObject(mPropertyBag.modifier)) {
			return false;
		}

		if (mPropertyBag.modifier.targets === "xmlTree" && !isAString(mPropertyBag.view, "nodeName")) {
			return false;
		}

		if (mPropertyBag.payload && !isPlainObject(mPropertyBag.payload)) {
			return false;
		}

		return ["aggregationName", "bindingPath"].every(isAString.bind(null, mPropertyBag));
	}

	/**
	 * sap.ui.fl Delegate to be used in elementActionTests.
	 * @namespace sap.ui.rta.enablement.TestDelegate
	 * @implements sap.ui.fl.interfaces.Delegate
	 * @experimental Since 1.77
	 * @since 1.77
	 * @public
	 */
	var TestDelegate = /** @lends sap.ui.rta.enablement.TestDelegate */ {

		/**
		 *	@inheritdoc
		 */
		getPropertyInfo: function (mPropertyBag) {
			return Promise.resolve()
				.then(function() {
					var bValidParameters =
						mPropertyBag.element.isA("sap.ui.core.Element")
						&& mPropertyBag.aggregationName && typeof mPropertyBag.aggregationName === "string"
						&& (!mPropertyBag.payload || typeof mPropertyBag.payload === "object");

					if (bValidParameters) {
						return [];
					}
				});
		},

		/**
		 *	@inheritdoc
		 */
		createLabel: function (mPropertyBag) {
			return Promise.resolve()
				.then(function () {
					var bParametersValid =
						checkCommonParametersForControl(mPropertyBag)
						&& isAString(mPropertyBag, "labelFor");

					if (bParametersValid) {
						return mPropertyBag.modifier.createControl("sap.m.Label", //for V4/FIHR | for v2 it should be smart label
							mPropertyBag.appComponent,
							mPropertyBag.view,
							mPropertyBag.labelFor + "-label",
							{
								labelFor: mPropertyBag.labelFor,
								text: mPropertyBag.bindingPath
							},
							true/*async*/
						);
					}
				});
		},

		/**
		 *	@inheritdoc
		 */
		createControlForProperty: function (mPropertyBag) {
			return Promise.resolve()
				.then(function () {
					var bParametersValid =
						checkCommonParametersForControl(mPropertyBag)
						&& (isAString(mPropertyBag.element, "nodeName") || mPropertyBag.element.isA("sap.ui.core.Element"))
						&& isPlainObject(mPropertyBag.fieldSelector) && isAString(mPropertyBag.fieldSelector, "id");

					if (bParametersValid) {
						return Promise.all([
							mPropertyBag.modifier.createControl("sap.m.Text",
								mPropertyBag.appComponent,
								mPropertyBag.view,
								mPropertyBag.fieldSelector,
								{
									text: "{" + mPropertyBag.bindingPath + "}"
								},
								true/*async*/
							),
							mPropertyBag.modifier.createControl("sap.ui.core.Element",
								mPropertyBag.appComponent,
								mPropertyBag.view,
								{
									id: mPropertyBag.modifier.getId(mPropertyBag.view) + "--valueHelp",
									idIsLocal: true
								},
								true
							)
						]).then(function (aControls) {
							return {
								control: aControls[0],
								valueHelp: aControls[1]
							};
						});
					}
				});
		},

		/**
		 *	@inheritdoc
		 */
		createLayout: function (mPropertyBag) {
			return Promise.resolve()
				.then(function () {
					var bParametersValid =
						checkCommonParametersForControl(mPropertyBag)
						&& mPropertyBag.fieldSelector && typeof mPropertyBag.fieldSelector === "object" && typeof mPropertyBag.fieldSelector.id === "string";

					if (bParametersValid) {
						return {
							control: {},
							valueHelp: {}
						};
					}
				});
		}
	};

	return TestDelegate;
});
