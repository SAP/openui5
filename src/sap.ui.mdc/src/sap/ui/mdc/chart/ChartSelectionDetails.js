/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/SelectionDetails",
	"sap/m/SelectionDetailsItem",
	"sap/m/SelectionDetailsItemLine",
	"sap/m/SelectionDetailsRenderer",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/library",
	"sap/ui/core/Lib"
], (
	SelectionDetails,
	SelectionDetailsItem,
	SelectionDetailsItemLine,
	SelectionDetailsRenderer,
	List,
	StandardListItem,
	MLibrary,
	CoreLib
) => {
	"use strict";

	// shortcut for sap.m.ListMode
	const { ListMode, ListType } = MLibrary;

	const oResourceBundle = CoreLib.getResourceBundleFor("sap.ui.mdc");

	/**
	 * Constructor for a new ChartSelectionDetails.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The <code>ChartSelectionDetails</code> control creates a <code>sap.m.SelectionDetails</code> popover based on metadata and the configuration specified.
	 * @extends sap.m.SelectionDetails
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @experimental As of version 1.88
	 * @since 1.88
	 * @alias sap.ui.mdc.chart.ChartSelectionDetails
	 */
	const ChartSelectionDetails = SelectionDetails.extend("sap.ui.mdc.chart.ChartSelectionDetails", /** @lends sap.ui.mdc.chart.ChartSelectionDetails.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [

			],
			defaultAggregation: "",
			properties: {
				/**
				 * Callback function that is called for each <code>SelectionDetailsItem</code>
				 * to determine if the navigation is enabled.
				 * The callback is called with the following parameters:
				 * <ul>
				 * 	<li><code>oSelectionDetails</code> {@link sap.ui.mdc.chart.ChartSelectionDetails}: Instance of this <code>ChartSelectionDetails</code></li>
				 * 	<li><code>oContext</code> {@link sap.ui.model.Context}: Binding context of the <code>SelectionDetailsItem</code></li>
				 * </ul>
				 * The return value of the callback has to be of type <code>boolean</code>.
				 * @since 1.126
				 */
				enableNavCallback: {
					type: "function"
				},
				/**
				 * Callback function that is called to determine navigation targets when clicking on a <code>SelectionDetailsItem</code>.
				 * The callback is called with the following parameters:
				 * <ul>
				 * 	<li><code>oSelectionDetails</code> {@link sap.ui.mdc.chart.ChartSelectionDetails}: Instance of this <code>ChartSelectionDetails</code></li>
				 * 	<li><code>oContext</code> {@link sap.ui.model.Context}: Binding context of the <code>SelectionDetailsItem</code></li>
				 * </ul>
				 * The return value of the callback has to be of type <code>Promise</code> resolving in a <code>Map</code> containing a <code>string</code> as key and a {@link sap.ui.mdc.field.FieldInfoBase} as value.
				 * @since 1.126
				 */
				fetchFieldInfosCallback: {
					type: "function"
				}
			},
			aggregations: {

			},
			associations: {

			},
			events: {

			}
		},
		renderer: SelectionDetailsRenderer
	});

	/**
	 * Initialises the MDC Chart Selection Details
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	ChartSelectionDetails.prototype.init = function() {
		SelectionDetails.prototype.init.apply(this, arguments);
		this.registerSelectionDetailsItemFactory({}, this._selectionDetailsItemFactory.bind(this));
		this.attachNavigate(this._navigate.bind(this));
	};

	/**
	 * Default factory function for the {@link sap.m.SelectionDetailsItem}.
	 * @param {Array<Object>} aDisplayData <code>DisplayData</code> of the selected entry
	 * @param {Array<Object>} mData <code>Data</code> of the selected entry
	 * @param {sap.ui.model.Context} oContext BindingContext of the selected entry
	 * @returns {sap.m.SelectionDetailsItem} SelectionDetailsItem
	 * @private
	 */
	ChartSelectionDetails.prototype._selectionDetailsItemFactory = function(aDisplayData, mData, oContext) {
		const fnEnableNavCallback = this.getEnableNavCallback();
		const aLines = [];
		const fnFormatValue = function(oValue) {
			if (oValue) {
				return oValue instanceof Object ? oValue : oValue.toString();
			} else {
				return oValue;
			}
		};

		for (let i = 0; i < aDisplayData.length; i++) {
			//const v = mData[aDisplayData[i].id + ".d"];

			aLines.push(new SelectionDetailsItemLine({
				label: aDisplayData[i].label,
				// value: this._formatValue(v || aDisplayData[i].value),
				value: fnFormatValue(aDisplayData[i].value),
				unit: aDisplayData[i].unit
			}));
		}
		return new SelectionDetailsItem({
			enableNav: fnEnableNavCallback?.(mData, oContext) ?? false,
			lines: aLines
		}).setBindingContext(oContext);
	};

	/**
	 * Internal navigation handling
	 * @param {*} oEvent
	 * @private
	 */
	ChartSelectionDetails.prototype._navigate = function(oEvent) {
		// Destroy content on navBack of selectionDetails
		// This either is the semanticNavContainer or the semanticNavItemList
		if (oEvent.getParameter("direction") === "back") {
			oEvent.getParameter("content").destroy();
		} else {
			// Forward navigation to semantic objects
			this._navigateToDetails(oEvent);
		}
	};

	/**
	 * Navigation handling for more details. This will check if <code>fetchFieldInfosCallback</code> returns <code>FieldInfo</code>.
	 * Throws an error if the <code>fetchFieldInfosCallback</code> is undefined.
	 * Throws an error if the <code>fetchFieldInfosCallback</code> returns an empty array.
	 * If there is only one <code>FieldInfo</code> its content will be displayed.
	 * If the methods returns more than 1 <code>FieldInfo</code> a <code>List</code> will be displayed.
	 * @param {*} oEvent
	 * @private
	 */
	ChartSelectionDetails.prototype._navigateToDetails = async (oEvent) => {
		const oSelectionDetails = oEvent.getSource();
		const fnFetchFieldInfosCallback = oSelectionDetails.getFetchFieldInfosCallback();

		if (!fnFetchFieldInfosCallback) {
			throw new Error("sap.ui.mdc.chart.ChartSelectionDetails._navigateToDetails: 'fetchFieldInfosCallback' is not set! This is required to determine navigation.");
		}

		const oControl = oEvent.getParameter("item");
		const oContext = oControl.getBindingContext();
		let oNavigationTarget, sTitle = "";

		const mFieldInfos = await fnFetchFieldInfosCallback(oSelectionDetails, oContext);

		if (Object.keys(mFieldInfos).length === 0) {
			throw new Error("sap.ui.mdc.chart.ChartSelectionDetails._navigateToDetails: 'fetchFieldInfosCallback' returned an empty map! Could not determine navigation.");
		}

		if (Object.keys(mFieldInfos).length === 1) {
			oNavigationTarget = await Object.values(mFieldInfos)[0].getContent(() => oSelectionDetails);
		} else {
			oNavigationTarget = oSelectionDetails._getDetailsList(oSelectionDetails, mFieldInfos, oContext);
			sTitle = oResourceBundle.getText("chart.SELECTION_DETAILS_BTN");
		}

		oSelectionDetails.navTo(sTitle, oNavigationTarget);
	};

	/**
	 * @param {sap.ui.mdc.chart.ChartSelectionDetails} oSelectionDetails Instance of the {@link sap.ui.mdc.chart.ChartSelectionDetails}
	 * @param {Map<string, sap.ui.mdc.field.FieldInfoBase>} mFieldInfos <code>Map</code> containing a Name as key and a {@link sap.ui.mdc.field.FieldInfoBase} as value
	 * @param {sap.ui.model.Context} oBindingContext Binding context of the <code>SelectionDetailsItem</code> to which is navigated
	 * @returns {sap.m.List} List containing an item for each <code>FieldInfo</code> provided
	 * @private
	 */
	ChartSelectionDetails.prototype._getDetailsList = (oSelectionDetails, mFieldInfos, oContext) => {
		const aListItems = Object.keys(mFieldInfos).map((sKey) => {
			const oFieldInfo = mFieldInfos[sKey];
			const oListItem = new StandardListItem({
				title: sKey,
				type: ListType.Navigation
			});

			oListItem.data("fieldInfo", oFieldInfo);
			oListItem.setBindingContext(oContext);

			return oListItem;
		});

		return new List({
			mode: ListMode.SingleSelectMaster,
			rememberSelections: false,
			items: aListItems,
			itemPress: async (oEvent) => {
				const oListItem = oEvent.getParameter("listItem");
				if (oListItem) {
					const oFieldInfo = oListItem.data("fieldInfo"); // can also determine additional semantic objects
					const oNavigationTarget = await oFieldInfo.getContent(() => oSelectionDetails);
					oSelectionDetails.navTo(oListItem.getTitle(), oNavigationTarget);
				}
			}
		});
	};

	/**
	 * Sets the <code>modal</code> property of the <code>popover</code>.
	 * @param {boolean} bModal
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	ChartSelectionDetails.prototype.setModal = function(bModal) {
		this.setPopoverModal(bModal);
	};

	return ChartSelectionDetails;
});