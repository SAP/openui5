sap.ui.require([
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Panel",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/RatingIndicator",
	"sap/m/Label",
	"sap/m/Switch",
	"sap/m/Text",
	"sap/m/FormattedText",
	"sap/ui/core/Core"
], async function (App, Page, Panel, HBox, VBox, RatingIndicator, Label, Switch, Text,
		FormattedText, Core) {
	"use strict";

	await Core.ready();

	// Wraps a RatingIndicator and an explanatory Text into a single labelled panel.
	function scenario(sHeading, sIntro, oRating) {
		return new Panel({
			headerText: sHeading,
			expandable: false,
			width: "40rem",
			content: [
				new Text({ text: sIntro })
					.addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
				new HBox({
					alignItems: "Center",
					items: [oRating]
				}).addStyleClass("sapUiSmallMarginBegin")
			]
		}).addStyleClass("sapUiResponsiveMargin");
	}

	// ---- Tooltip set by the user -------------------------------------------

	// 1. Editable, custom tooltip
	const oRating1 = new RatingIndicator({
		value: 3,
		tooltip: "Rate this product from 1 to 5 stars"
	});

	// 2. Disabled, custom tooltip
	const oRating2 = new RatingIndicator({
		value: 2,
		enabled: false,
		tooltip: "Rating is currently disabled"
	});

	// ---- No tooltip set - default text depends on the state ----------------

	// 3. Editable (default) -> "Rate"
	const oRating3 = new RatingIndicator({
		value: 3
	});

	// 4. Read-only (editable: false) -> "{value} of {maxValue}"
	const oRating4 = new RatingIndicator({
		value: 3,
		editable: false
	});

	// 5. Display-only -> "{value} of {maxValue}"
	const oRating5 = new RatingIndicator({
		value: 4,
		displayOnly: true
	});

	// 6. Disabled -> "Rate" (disabled but still editable)
	const oRating6 = new RatingIndicator({
		value: 2,
		enabled: false
	});

	// 7. Read-only with custom maxValue -> "5 of 7"
	const oRating7 = new RatingIndicator({
		value: 5,
		maxValue: 7,
		editable: false
	});

	// ---- Custom tooltip that changes based on the state --------------------

	function tooltipForState(oRating) {
		if (oRating.getDisplayOnly() || !oRating.getEditable()) {
			return "Your rating: " + oRating.getValue() + " of " + oRating.getMaxValue();
		}
		return "Click to rate this item";
	}

	const oRating8 = new RatingIndicator({
		value: 3,
		tooltip: "Click to rate this item"
	});

	const oEditableSwitch = new Switch({
		state: true,
		customTextOn: "On",
		customTextOff: "Off",
		change: function (oEvent) {
			oRating8.setEditable(oEvent.getParameter("state"));
			oRating8.setTooltip(tooltipForState(oRating8));
		}
	});

	const oRuntimePanel = new Panel({
		headerText: "8. Custom tooltip that changes with the state",
		expandable: false,
		width: "40rem",
		content: [
			new Text({
				text: "The tooltip is set by the app but is recomputed whenever the state changes. " +
					"Flip the Editable switch: when editable it reads \"Click to rate this item\"; " +
					"when read-only it reads \"Your rating: {value} of {maxValue}\"."
			}).addStyleClass("sapUiSmallMarginBegin sapUiSmallMarginBottom"),
			new VBox({
				items: [
					new HBox({
						alignItems: "Center",
						items: [oRating8]
					}).addStyleClass("sapUiSmallMarginBottom"),
					new HBox({
						alignItems: "Center",
						items: [
							new Label({ text: "Editable", labelFor: oEditableSwitch })
								.addStyleClass("sapUiSmallMarginEnd"),
							oEditableSwitch
						]
					})
				]
			}).addStyleClass("sapUiSmallMarginBegin")
		]
	}).addStyleClass("sapUiResponsiveMargin");

	const oIntro = new FormattedText({
		htmlText:
			"Bootstrap runs with <code>data-sap-ui-xx-tooltip=&quot;enhanced&quot;</code> so each " +
			"<code>sap.m.RatingIndicator</code> wires itself to <code>sap.ui.core.tooltip.TooltipEnablement</code>. " +
			"Hover or keyboard-focus a rating indicator to see the resulting tooltip; press <kbd>Esc</kbd> to dismiss. " +
			"When no <code>tooltip</code> property is set, the editable control shows the default text " +
			"<code>Rate</code>, while a display-only or read-only control shows <code>{value} of {maxValue}</code>. " +
			"Inspect the container in DevTools to verify <code>aria-describedby</code> references the invisible " +
			"tooltip span, and that no native <code>title</code> attribute is present."
	}).addStyleClass("sapUiResponsiveMargin");

	const oPage = new Page({
		title: "sap.m.RatingIndicator + sap.m.Tooltip integration",
		content: [
			oIntro,
			scenario("1. Custom tooltip (editable)", "Editable rating with a tooltip set by the app.", oRating1),
			scenario("2. Custom tooltip (disabled)", "Disabled rating with a tooltip set by the app.", oRating2),
			scenario("3. Default tooltip - editable", "No tooltip set. Editable control shows the default text \"Rate\".", oRating3),
			scenario("4. Default tooltip - read-only", "No tooltip set. Read-only control (editable=false) shows \"3 of 5\".", oRating4),
			scenario("5. Default tooltip - display-only", "No tooltip set. Display-only control shows \"4 of 5\".", oRating5),
			scenario("6. Default tooltip - disabled", "No tooltip set. Disabled but editable control shows the default text \"Rate\".", oRating6),
			scenario("7. Default tooltip - read-only, maxValue 7", "No tooltip set. Read-only control with maxValue 7 shows \"5 of 7\".", oRating7),
			oRuntimePanel
		]
	});

	new App({ pages: [oPage] }).placeAt("content");
});
