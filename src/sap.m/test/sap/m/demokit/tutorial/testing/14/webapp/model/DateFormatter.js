sap.ui.define([ "sap/ui/base/Object", "sap/ui/core/format/DateFormat" ],
	function(Object, DateFormat) {

		return Object.extend("sap.ui.demo.bulletinboard.model.DateFormatter", {
			/**
			 * Formatter for human readable dates.
			 *
			 * @param {object} oProperties an object containing the dependencies
			 * @param {object} oProperties.now the current date
			 * @param {object} [oProperties.locale] the locale the date should be formatted with - if it is skipped the current locale of the user is taken
			 */
			constructor : function(oProperties) {
				this.timeFormat = DateFormat.getTimeInstance({
					style : "short"
				}, oProperties.locale);
				this.weekdayFormat = DateFormat.getDateInstance({
					pattern : "EEEE"
				}, oProperties.locale);
				this.dateFormat = DateFormat.getDateInstance({
					style : "medium"
				}, oProperties.locale);

				this.now = oProperties.now;
			},

			/**
			 * Formats a date into something readable
			 * today - a time format
			 * yesterday - Yesterday
			 * day of the current week - eg: Wednesday
			 * older dates - date formatted with the locale
			 *
			 * @param {date} oDate the date to be formatted
			 * @returns {string} The formatted date
			 */
			format : function(oDate) {
				if (!oDate) {
					return "";
				}
				var iElapsedDays = this._getElapsedDays(oDate);
				if (iElapsedDays === 0) {
					return this.timeFormat.format(oDate);
				} else if (iElapsedDays === 1) {
					return "Yesterday";
				} else if (iElapsedDays < 7) {
					return this.weekdayFormat.format(oDate);
				} else {
					return this.dateFormat.format(oDate);
				}
			},

			_getElapsedDays : function(oDate) {
				var iElapsedMilliseconds = this.now() - oDate.getTime();
				var fElapsedDays = iElapsedMilliseconds / 1000 / 60 / 60 / 24;
				return Math.floor(fElapsedDays);
			}
		});
	});
