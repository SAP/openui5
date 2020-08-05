/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/StandardListItem",
	"sap/m/library",
	"sap/m/App",
	"sap/m/List",
	"sap/m/PullToRefresh",
	"sap/m/Page"
], function(
	qutils,
	createAndAppendDiv,
	StandardListItem,
	mobileLibrary,
	App,
	List,
	PullToRefresh,
	Page
) {
	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	createAndAppendDiv("content");



	if (jQuery.support.touch || !window.getComputedStyle) {
		QUnit.test("Not relevant on touch devices and below IE9", function(assert) {
			assert.ok(true, "Not relevant on touch devices and below IE9");
		});

	} else {

		var addItems = function(list, nItems){
			var n = list.getItems().length + 1;
			for (var i = 0; i < nItems; i++){
				list.addItem(
					new StandardListItem({
						title: "List item " + (n + i),
						type: ListType.Navigation
					})
				);
			}
		};

		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		var oApp = new App("p2RApp", {initialPage:"page1"});

		var sPullDwn = oRb.getText("PULL2REFRESH_REFRESH"),
			sRelease = oRb.getText("PULL2REFRESH_RELEASE"),
			sRefresh = "refreshing",
			sLoading = oRb.getText("PULL2REFRESH_LOADING");
		var sDescription = "pull to refresh";

		var oList =  new List("oList", {inset : false});
		addItems(oList, 5);

		var oP2R = new PullToRefresh({
			description: sDescription,
			refresh: function(){
				oP2R.setDescription(sRefresh);
			}
		});

		var oP2RHidden = new PullToRefresh("oP2RHidden",{
			description: sDescription,
			visible: false
		});

		var oPage1 = new Page("page1", {
			title: "PullToRefresh Control",
			enableScrolling: true,
			content : [ oP2R, oP2RHidden, oList ]
		});

		oApp.addPage(oPage1);
		oApp.placeAt("content");


		jQuery(document).ready(function() {

		});



		// TEST functions

		QUnit.module("Properties");
		QUnit.test("Default values", function(assert) {
			assert.expect(3);
			assert.strictEqual(oP2R.getShowIcon(), false, "Default value for showIcon");
			assert.strictEqual(oP2R.getDescription(), sDescription, "Description value");
			assert.ok(!oP2R.getCustomIcon(), "Custom icon is not set");
		});

		QUnit.test("Invisible PullToRefresh", function(assert) {
			assert.expect(2);
			assert.strictEqual(oP2RHidden.getVisible(), false, "Hidden control should have visiblity false");
			assert.ok(!oP2RHidden._oBusyIndicator, "Hidden PullToRefresh does not have a BusyIndicator");
		});

		QUnit.module("Check HTML");

		QUnit.test("HTML", function(assert) {
			var $P2R = oP2R.$();
			assert.ok(window.getComputedStyle($P2R[0]).position, "relative", "position: should e set to 'relative'");
			assert.ok($P2R.length > 0, "Pull down control is rendered");
			assert.strictEqual($P2R.children(".sapMPullDownText").text(), sPullDwn, "Pull down text is set correctly");
			assert.strictEqual($P2R.children(".sapMPullDownInfo").text(), sDescription, "Pull down description is set correctly");
			assert.ok(!($P2R.hasClass("sapLoading")), "Loading class is not set");
			assert.ok(!oP2RHidden.getDomRef(), "Invisible control does not have DOM");
		});

		// Test pull to refresh functionality
		QUnit.module("Behavior");

		QUnit.test("Refresh", function(assert) {
			var done = assert.async();
			var oSpy = this.spy();
			var $P2R = oP2R.$();
			oP2R.attachRefresh(oSpy);
			qutils.triggerEvent("click", oP2R.getId());
			assert.strictEqual(oSpy.callCount, 1, "Refresh event has been fired.");
			assert.strictEqual($P2R.children(".sapMPullDownText").text(), sLoading, "Pull down text is set correctly");
			sap.ui.getCore().applyChanges();
			assert.strictEqual($P2R.children(".sapMPullDownInfo").text(), sRefresh, "Pull down description is set correctly");
			setTimeout(function() {
				oP2R.hide(); // Close
				oP2R.setDescription("");
				done();
			}, 200);
		});

		QUnit.module("Accessibility");

		QUnit.test("Aria attributes", function(assert) {
			// Arrange
			var oPullToRefresh = new PullToRefresh(),
				sExpectedRole = "button",
				sExpectedAriaControls,
				sExpectedAriaKeyshortcuts = "F5",
				sAriaDescribedBy = oPullToRefresh._getAriaDescribedByReferences();

			oPullToRefresh.placeAt("content");
			sap.ui.getCore().applyChanges();

			sExpectedAriaControls = oPullToRefresh.getParent().sId + "-cont";

			// Assert
			assert.strictEqual(oPullToRefresh.$().attr("role"), sExpectedRole, "Has role button");
			assert.strictEqual(oPullToRefresh.$().attr("aria-controls"), sExpectedAriaControls, "Has aria-controls");
			assert.strictEqual(oPullToRefresh.$().attr("aria-keyshortcuts"), sExpectedAriaKeyshortcuts, "Has aria-keyshortcuts");
			assert.strictEqual(oPullToRefresh.$().attr("aria-describedby"), sAriaDescribedBy, "Has aria-describedby");

			// Clean
			oPullToRefresh.destroy();
		});
	}
});