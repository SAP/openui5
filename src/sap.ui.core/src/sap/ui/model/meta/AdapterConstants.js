/*
 * ! ${copyright}
 */
sap.ui.define([], function() {
	"use strict";

	return {
		TextArrangement: {
			TextOnly: "TextOnly",
			TextFirst: "TextFirst",
			TextLast: "TextLast",
			TextSeparate: "TextSeparate"
		},
		Relation: {
			atMostOne: "0..1",
			one: "1",
			many: "n"
		},
		SupportedSortDirection: {
			none: "none",
			both: "both",
			asc: "ascending",
			desc: "descending"
		},
		Status: {
			None: undefined,
			VeryNegative: -1,
			Neutral: 0,
			Negative: 1,
			Critical: 2,
			Positive: 3,
			VeryPositive: 4
		},
		Importance: {
			None: undefined,
			High: 0,
			Medium: 1,
			Low: 2
		},
		ContactType: {
			fn: "formattedName",
			photo: "photo",
			role: "role",
			title: "title",
			org: "org",
			adr: "addresses",
			email: "emails",
			tel: "phones"
		},
		AddressType: {
			street: "street",
			code: "code",
			locality: "locality",
			region: "region",
			country: "country"
		},
		EmailAddressType: {
			address: "uri"
		},
		PhoneNumberType: {
			uri: "uri"
		}
	};
});
