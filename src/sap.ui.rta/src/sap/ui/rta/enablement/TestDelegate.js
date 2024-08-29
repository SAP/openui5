/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/base/util/merge"
],
function(
	isPlainObject,
	merge
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
	 * @since 1.77
	 * @public
	 * @borrows sap.ui.fl.interfaces.Delegate#getPropertyInfo as #getPropertyInfo
	 * @borrows sap.ui.fl.interfaces.Delegate#createLabel as #createLabel
	 * @borrows sap.ui.fl.interfaces.Delegate#createControlForProperty as #createControlForProperty
	 * @borrows sap.ui.fl.interfaces.Delegate#createLayout as #createLayout
	 */
	var TestDelegate = /** @lends sap.ui.rta.enablement.TestDelegate */ {

		/**
		 *	@inheritdoc
		 */
		getPropertyInfo(mPropertyBag) {
			return Promise.resolve()
			.then(function() {
				var bValidParameters =
						mPropertyBag.element.isA("sap.ui.core.Element")
						&& mPropertyBag.aggregationName && typeof mPropertyBag.aggregationName === "string"
						&& (!mPropertyBag.payload || typeof mPropertyBag.payload === "object");

				if (bValidParameters) {
					return [];
				}
				return undefined;
			});
		},

		/**
		 *	@inheritdoc
		 */
		createLabel(mPropertyBag) {
			return Promise.resolve()
			.then(function() {
				var bParametersValid =
						checkCommonParametersForControl(mPropertyBag)
						&& isAString(mPropertyBag, "labelFor");

				if (bParametersValid) {
					return mPropertyBag.modifier.createControl("sap.m.Label", // for V4/FIHR | for v2 it should be smart label
						mPropertyBag.appComponent,
						mPropertyBag.view,
						`${mPropertyBag.labelFor}-label`,
						{
							labelFor: mPropertyBag.labelFor,
							text: mPropertyBag.bindingPath
						},
						true/* async */
					);
				}
				return undefined;
			});
		},

		/**
		 *	@inheritdoc
		 */
		createControlForProperty(mPropertyBag) {
			return Promise.resolve()
			.then(function() {
				var bParametersValid =
						checkCommonParametersForControl(mPropertyBag)
						&& (isAString(mPropertyBag.element, "nodeName") || mPropertyBag.element.isA("sap.ui.core.Element"))
						&& isPlainObject(mPropertyBag.fieldSelector) && isAString(mPropertyBag.fieldSelector, "id");

				if (bParametersValid) {
					var aPromises = [
						mPropertyBag.modifier.createControl("sap.m.Text",
							mPropertyBag.appComponent,
							mPropertyBag.view,
							mPropertyBag.fieldSelector,
							{
								text: `{${mPropertyBag.bindingPath}}`
							}
						)
					];
					if (mPropertyBag.payload.valueHelpId) {
						var mValueHelpSelector = merge(
							{},
							mPropertyBag.fieldSelector,
							{ id: `${mPropertyBag.fieldSelector.id}-${mPropertyBag.payload.valueHelpId}` }
						);
						aPromises.push(mPropertyBag.modifier.createControl("sap.ui.core.Element",
							mPropertyBag.appComponent,
							mPropertyBag.view,
							mValueHelpSelector,
							true
						));
					}
					return Promise.all(aPromises)
					.then(function(aControls) {
						return {
							control: aControls[0],
							valueHelp: aControls[1]
						};
					});
				}
				return undefined;
			});
		},

		/**
		 *	@params {string} mPropertyBag.payload.layoutType - Control type for layout
		 *	@params {string} mPropertyBag.payload.aggregation - Layout aggregation for field control
		 *	@params {string} [mPropertyBag.payload.labelAggregation] - Layout aggregation for label control if applicable
		 *	@params {boolean} [mPropertyBag.payload.useCreateLayout] - Indicates if only createLayout() should be used for control creation
		 *
		 *	@override
		 *	@inheritdoc
		 */
		createLayout(mPropertyBag) {
			var bParametersValid =
				checkCommonParametersForControl(mPropertyBag)
				&& mPropertyBag.fieldSelector
				&& typeof mPropertyBag.fieldSelector === "object"
				&& typeof mPropertyBag.fieldSelector.id === "string";

			if (bParametersValid) {
				if (!mPropertyBag.payload.useCreateLayout) {
					return Promise.resolve();
				}
				var oLayout;
				var oValueHelp;
				var mSpecificControlInfo;
				var mLayoutSettings = merge({}, mPropertyBag);
				var oModifier = mLayoutSettings.modifier;
				mLayoutSettings.fieldSelector.id += "-field";

				return TestDelegate.createControlForProperty(mLayoutSettings)
				.then(function(mCreatedSpecificControlInfo) {
					mSpecificControlInfo = mCreatedSpecificControlInfo;
					oValueHelp = mSpecificControlInfo.valueHelp;
					return oModifier.createControl(
						mLayoutSettings.payload.layoutType,
						mLayoutSettings.appComponent,
						mLayoutSettings.view,
						mPropertyBag.fieldSelector
					);
				})
				.then(function(oCreatedLayout) {
					oLayout = oCreatedLayout;
					return oModifier.insertAggregation(
						oLayout,
						mLayoutSettings.payload.aggregation,
						mSpecificControlInfo.control,
						0,
						mLayoutSettings.view
					);
				})
				.then(function() {
					// some layout controls do not require a label control
					if (mLayoutSettings.payload.labelAggregation) {
						var mCreateLabelInfo = {
							labelFor: oModifier.getId(mSpecificControlInfo.control),
							...mLayoutSettings
						};
						return TestDelegate.createLabel(mCreateLabelInfo);
					}
					return undefined;
				})
				.then(function(oLabel) {
					if (oLabel) {
						return oModifier.insertAggregation(
							oLayout,
							mLayoutSettings.payload.labelAggregation,
							oLabel,
							0,
							mLayoutSettings.view
						);
					}
					return undefined;
				})
				.then(function() {
					return {
						control: oLayout,
						valueHelp: oValueHelp
					};
				});
			}
			return undefined;
		}
	};

	return TestDelegate;
});
