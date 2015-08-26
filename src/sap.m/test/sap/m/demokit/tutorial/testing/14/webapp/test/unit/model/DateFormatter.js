sap.ui.require(
	[
		"sap/ui/demo/bulletinboard/model/DateFormatter",
		"sap/ui/core/Locale"
	],
	function(DateFormatter, Locale) {

		var oFormatter = null;

		QUnit.module("DateFormatter", {
			beforeEach : function() {
				oFormatter = new DateFormatter({
					now : function() {
						return new Date(2015, 2, 14, 14, 0, 0, 0).getTime();
					},
					locale : new Locale("en-US")
				});
			}
		});

		QUnit.test("Should return 'Yesterday' if date from yesterday", function(assert) {
			var oDate = new Date(2015, 2, 13);
			var sFormattedDate = oFormatter.format(oDate);
			assert.strictEqual(sFormattedDate, "Yesterday");
		});

		QUnit.test("Should return weekday if date < 7 days ago", function(assert) {
			var oDate = new Date(2015, 2, 8);
			var sFormattedDate = oFormatter.format(oDate);
			assert.strictEqual(sFormattedDate, "Sunday");
		});

		QUnit.test("Should return date w/o time if date > 7 days ago", function(assert) {
			var oDate = new Date(2015, 2, 7);
			var sFormattedDate = oFormatter.format(oDate);
			assert.strictEqual(sFormattedDate, "Mar 7, 2015");
		});
	}
);
