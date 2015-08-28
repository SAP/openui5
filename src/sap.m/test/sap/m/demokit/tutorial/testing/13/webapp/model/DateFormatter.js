sap.ui.define([ "sap/ui/base/Object", "sap/ui/core/format/DateFormat" ],
	function(Object, DateFormat) {

		return Object.extend("sap.ui.demo.bulletinboard.model.DateFormatter", {
			constructor : function(properties) {
				this.timeFormat = DateFormat.getTimeInstance({
					style : "short"
				}, properties.locale);
				this.weekdayFormat = DateFormat.getDateInstance({
					pattern : "EEEE"
				}, properties.locale);
				this.dateFormat = DateFormat.getDateInstance({
					style : "medium"
				}, properties.locale);

				this.now = properties.now;
			},

			format : function(date) {
				if (!date) {
					return "";
				}
				var iElapsedDays = this._getElapsedDays(date);
				if (iElapsedDays === 0) {
					return this.timeFormat.format(date);
				} else if (iElapsedDays === 1) {
					return "Yesterday";
				} else if (iElapsedDays < 7) {
					return this.weekdayFormat.format(date);
				} else {
					return this.dateFormat.format(date);
				}
			},

			_getElapsedDays : function(oDate) {
				var iElapsedMilliseconds = this.now() - oDate.getTime();
				var fElapsedDays = iElapsedMilliseconds / 1000 / 60 / 60 / 24;
				return Math.floor(fElapsedDays);
			}
		});
	});
