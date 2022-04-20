/*global QUnit, sinon */
sap.ui.define(["sap/ui/core/format/TimezoneUtil"],
	function (TimezoneUtil) {
		"use strict";

		/**
		 * IANA timezone IDs extracted from timeZoneNames.json (CLDR 35.0.1)
		 * @type {string[]}
		 */
		var aCLDRTimezoneIDs = [
			"America/Adak",
			"America/Anchorage",
			"America/Anguilla",
			"America/Antigua",
			"America/Araguaina",
			"America/Argentina/Rio_Gallegos",
			"America/Argentina/San_Juan",
			"America/Argentina/Ushuaia",
			"America/Argentina/La_Rioja",
			"America/Argentina/San_Luis",
			"America/Argentina/Salta",
			"America/Argentina/Tucuman",
			"America/Aruba",
			"America/Asuncion",
			"America/Bahia",
			"America/Bahia_Banderas",
			"America/Barbados",
			"America/Belem",
			"America/Belize",
			"America/Blanc-Sablon",
			"America/Boa_Vista",
			"America/Bogota",
			"America/Boise",
			"America/Buenos_Aires",
			"America/Cambridge_Bay",
			"America/Campo_Grande",
			"America/Cancun",
			"America/Caracas",
			"America/Catamarca",
			"America/Cayenne",
			"America/Cayman",
			"America/Chicago",
			"America/Chihuahua",
			"America/Coral_Harbour",
			"America/Cordoba",
			"America/Costa_Rica",
			"America/Creston",
			"America/Cuiaba",
			"America/Curacao",
			"America/Danmarkshavn",
			"America/Dawson",
			"America/Dawson_Creek",
			"America/Denver",
			"America/Detroit",
			"America/Dominica",
			"America/Edmonton",
			"America/Eirunepe",
			"America/El_Salvador",
			"America/Fort_Nelson",
			"America/Fortaleza",
			"America/Glace_Bay",
			"America/Godthab",
			"America/Goose_Bay",
			"America/Grand_Turk",
			"America/Grenada",
			"America/Guadeloupe",
			"America/Guatemala",
			"America/Guayaquil",
			"America/Guyana",
			"America/Halifax",
			"America/Havana",
			"America/Hermosillo",
			"America/Indiana/Vincennes",
			"America/Indiana/Petersburg",
			"America/Indiana/Tell_City",
			"America/Indiana/Knox",
			"America/Indiana/Winamac",
			"America/Indiana/Marengo",
			"America/Indiana/Vevay",
			"America/Indianapolis",
			"America/Inuvik",
			"America/Iqaluit",
			"America/Jamaica",
			"America/Jujuy",
			"America/Juneau",
			"America/Kentucky/Monticello",
			"America/Kralendijk",
			"America/La_Paz",
			"America/Lima",
			"America/Los_Angeles",
			"America/Louisville",
			"America/Lower_Princes",
			"America/Maceio",
			"America/Managua",
			"America/Manaus",
			"America/Marigot",
			"America/Martinique",
			"America/Matamoros",
			"America/Mazatlan",
			"America/Mendoza",
			"America/Menominee",
			"America/Merida",
			"America/Metlakatla",
			"America/Mexico_City",
			"America/Miquelon",
			"America/Moncton",
			"America/Monterrey",
			"America/Montevideo",
			"America/Montserrat",
			"America/Nassau",
			"America/New_York",
			"America/Nipigon",
			"America/Nome",
			"America/Noronha",
			"America/North_Dakota/Beulah",
			"America/North_Dakota/New_Salem",
			"America/North_Dakota/Center",
			"America/Ojinaga",
			"America/Panama",
			"America/Pangnirtung",
			"America/Paramaribo",
			"America/Phoenix",
			"America/Port-au-Prince",
			"America/Port_of_Spain",
			"America/Porto_Velho",
			"America/Puerto_Rico",
			"America/Punta_Arenas",
			"America/Rainy_River",
			"America/Rankin_Inlet",
			"America/Recife",
			"America/Regina",
			"America/Resolute",
			"America/Rio_Branco",
			"America/Santarem",
			"America/Santiago",
			"America/Santo_Domingo",
			"America/Sao_Paulo",
			"America/Scoresbysund",
			"America/Sitka",
			"America/St_Barthelemy",
			"America/St_Johns",
			"America/St_Kitts",
			"America/St_Lucia",
			"America/St_Thomas",
			"America/St_Vincent",
			"America/Swift_Current",
			"America/Tegucigalpa",
			"America/Thule",
			"America/Thunder_Bay",
			"America/Tijuana",
			"America/Toronto",
			"America/Tortola",
			"America/Vancouver",
			"America/Whitehorse",
			"America/Winnipeg",
			"America/Yakutat",
			"America/Yellowknife",
			"Atlantic/Azores",
			"Atlantic/Bermuda",
			"Atlantic/Canary",
			"Atlantic/Cape_Verde",
			"Atlantic/Faeroe",
			"Atlantic/Madeira",
			"Atlantic/Reykjavik",
			"Atlantic/South_Georgia",
			"Atlantic/St_Helena",
			"Atlantic/Stanley",
			"Europe/Amsterdam",
			"Europe/Andorra",
			"Europe/Astrakhan",
			"Europe/Athens",
			"Europe/Belgrade",
			"Europe/Berlin",
			"Europe/Bratislava",
			"Europe/Brussels",
			"Europe/Bucharest",
			"Europe/Budapest",
			"Europe/Busingen",
			"Europe/Chisinau",
			"Europe/Copenhagen",
			"Europe/Dublin",
			"Europe/Gibraltar",
			"Europe/Guernsey",
			"Europe/Helsinki",
			"Europe/Isle_of_Man",
			"Europe/Istanbul",
			"Europe/Jersey",
			"Europe/Kaliningrad",
			"Europe/Kiev",
			"Europe/Kirov",
			"Europe/Lisbon",
			"Europe/Ljubljana",
			"Europe/London",
			"Europe/Luxembourg",
			"Europe/Madrid",
			"Europe/Malta",
			"Europe/Mariehamn",
			"Europe/Minsk",
			"Europe/Monaco",
			"Europe/Moscow",
			"Europe/Oslo",
			"Europe/Paris",
			"Europe/Podgorica",
			"Europe/Prague",
			"Europe/Riga",
			"Europe/Rome",
			"Europe/Samara",
			"Europe/San_Marino",
			"Europe/Sarajevo",
			"Europe/Saratov",
			"Europe/Simferopol",
			"Europe/Skopje",
			"Europe/Sofia",
			"Europe/Stockholm",
			"Europe/Tallinn",
			"Europe/Tirane",
			"Europe/Ulyanovsk",
			"Europe/Uzhgorod",
			"Europe/Vaduz",
			"Europe/Vatican",
			"Europe/Vienna",
			"Europe/Vilnius",
			"Europe/Volgograd",
			"Europe/Warsaw",
			"Europe/Zagreb",
			"Europe/Zaporozhye",
			"Europe/Zurich",
			"Africa/Abidjan",
			"Africa/Accra",
			"Africa/Addis_Ababa",
			"Africa/Algiers",
			"Africa/Asmera",
			"Africa/Bamako",
			"Africa/Bangui",
			"Africa/Banjul",
			"Africa/Bissau",
			"Africa/Blantyre",
			"Africa/Brazzaville",
			"Africa/Bujumbura",
			"Africa/Cairo",
			"Africa/Casablanca",
			"Africa/Ceuta",
			"Africa/Conakry",
			"Africa/Dakar",
			"Africa/Dar_es_Salaam",
			"Africa/Djibouti",
			"Africa/Douala",
			"Africa/El_Aaiun",
			"Africa/Freetown",
			"Africa/Gaborone",
			"Africa/Harare",
			"Africa/Johannesburg",
			"Africa/Juba",
			"Africa/Kampala",
			"Africa/Khartoum",
			"Africa/Kigali",
			"Africa/Kinshasa",
			"Africa/Lagos",
			"Africa/Libreville",
			"Africa/Lome",
			"Africa/Luanda",
			"Africa/Lubumbashi",
			"Africa/Lusaka",
			"Africa/Malabo",
			"Africa/Maputo",
			"Africa/Maseru",
			"Africa/Mbabane",
			"Africa/Mogadishu",
			"Africa/Monrovia",
			"Africa/Nairobi",
			"Africa/Ndjamena",
			"Africa/Niamey",
			"Africa/Nouakchott",
			"Africa/Ouagadougou",
			"Africa/Porto-Novo",
			"Africa/Sao_Tome",
			"Africa/Tripoli",
			"Africa/Tunis",
			"Africa/Windhoek",
			"Asia/Aden",
			"Asia/Almaty",
			"Asia/Amman",
			"Asia/Anadyr",
			"Asia/Aqtau",
			"Asia/Aqtobe",
			"Asia/Ashgabat",
			"Asia/Atyrau",
			"Asia/Baghdad",
			"Asia/Bahrain",
			"Asia/Baku",
			"Asia/Bangkok",
			"Asia/Barnaul",
			"Asia/Beirut",
			"Asia/Bishkek",
			"Asia/Brunei",
			"Asia/Calcutta",
			"Asia/Chita",
			"Asia/Choibalsan",
			"Asia/Colombo",
			"Asia/Damascus",
			"Asia/Dhaka",
			"Asia/Dili",
			"Asia/Dubai",
			"Asia/Dushanbe",
			"Asia/Famagusta",
			"Asia/Gaza",
			"Asia/Hebron",
			"Asia/Hong_Kong",
			"Asia/Hovd",
			"Asia/Irkutsk",
			"Asia/Jakarta",
			"Asia/Jayapura",
			"Asia/Jerusalem",
			"Asia/Kabul",
			"Asia/Kamchatka",
			"Asia/Karachi",
			"Asia/Katmandu",
			"Asia/Khandyga",
			"Asia/Krasnoyarsk",
			"Asia/Kuala_Lumpur",
			"Asia/Kuching",
			"Asia/Kuwait",
			"Asia/Macau",
			"Asia/Magadan",
			"Asia/Makassar",
			"Asia/Manila",
			"Asia/Muscat",
			"Asia/Nicosia",
			"Asia/Novokuznetsk",
			"Asia/Novosibirsk",
			"Asia/Omsk",
			"Asia/Oral",
			"Asia/Phnom_Penh",
			"Asia/Pontianak",
			"Asia/Pyongyang",
			"Asia/Qatar",
			"Asia/Qostanay",
			"Asia/Qyzylorda",
			"Asia/Rangoon",
			"Asia/Riyadh",
			"Asia/Saigon",
			"Asia/Sakhalin",
			"Asia/Samarkand",
			"Asia/Seoul",
			"Asia/Shanghai",
			"Asia/Singapore",
			"Asia/Srednekolymsk",
			"Asia/Taipei",
			"Asia/Tashkent",
			"Asia/Tbilisi",
			"Asia/Tehran",
			"Asia/Thimphu",
			"Asia/Tokyo",
			"Asia/Tomsk",
			"Asia/Ulaanbaatar",
			"Asia/Urumqi",
			"Asia/Ust-Nera",
			"Asia/Vientiane",
			"Asia/Vladivostok",
			"Asia/Yakutsk",
			"Asia/Yekaterinburg",
			"Asia/Yerevan",
			"Indian/Antananarivo",
			"Indian/Chagos",
			"Indian/Christmas",
			"Indian/Cocos",
			"Indian/Comoro",
			"Indian/Kerguelen",
			"Indian/Mahe",
			"Indian/Maldives",
			"Indian/Mauritius",
			"Indian/Mayotte",
			"Indian/Reunion",
			"Australia/Adelaide",
			"Australia/Brisbane",
			"Australia/Broken_Hill",
			"Australia/Currie",
			"Australia/Darwin",
			"Australia/Eucla",
			"Australia/Hobart",
			"Australia/Lindeman",
			"Australia/Lord_Howe",
			"Australia/Melbourne",
			"Australia/Perth",
			"Australia/Sydney",
			"Pacific/Apia",
			"Pacific/Auckland",
			"Pacific/Bougainville",
			"Pacific/Chatham",
			"Pacific/Easter",
			"Pacific/Efate",
			"Pacific/Enderbury",
			"Pacific/Fakaofo",
			"Pacific/Fiji",
			"Pacific/Funafuti",
			"Pacific/Galapagos",
			"Pacific/Gambier",
			"Pacific/Guadalcanal",
			"Pacific/Guam",
			"Pacific/Honolulu",
			"Pacific/Johnston",
			"Pacific/Kiritimati",
			"Pacific/Kosrae",
			"Pacific/Kwajalein",
			"Pacific/Majuro",
			"Pacific/Marquesas",
			"Pacific/Midway",
			"Pacific/Nauru",
			"Pacific/Niue",
			"Pacific/Norfolk",
			"Pacific/Noumea",
			"Pacific/Pago_Pago",
			"Pacific/Palau",
			"Pacific/Pitcairn",
			"Pacific/Ponape",
			"Pacific/Port_Moresby",
			"Pacific/Rarotonga",
			"Pacific/Saipan",
			"Pacific/Tahiti",
			"Pacific/Tarawa",
			"Pacific/Tongatapu",
			"Pacific/Truk",
			"Pacific/Wake",
			"Pacific/Wallis",
			"Arctic/Longyearbyen",
			"Antarctica/Casey",
			"Antarctica/Davis",
			"Antarctica/DumontDUrville",
			"Antarctica/Macquarie",
			"Antarctica/Mawson",
			"Antarctica/McMurdo",
			"Antarctica/Palmer",
			"Antarctica/Rothera",
			"Antarctica/Syowa",
			"Antarctica/Troll",
			"Antarctica/Vostok",
			"Etc/UTC"
			// "Etc/Unknown" => not valid
		];


		/**
		 * IANA timezone IDs extracted from TZMAP.DAT
		 * @see https://launchpad.support.sap.com/#/notes/3143747
		 * @type {string[]}
		 */
		var aABAPTimezoneIDs = [
			"Africa/Abidjan",
			"Africa/Accra",
			"Africa/Addis_Ababa",
			"Africa/Algiers",
			"Africa/Asmara",
			"Africa/Bamako",
			"Africa/Bangui",
			"Africa/Banjul",
			"Africa/Bissau",
			"Africa/Blantyre",
			"Africa/Brazzaville",
			"Africa/Bujumbura",
			"Africa/Cairo",
			"Africa/Casablanca",
			"Africa/Ceuta",
			"Africa/Conakry",
			"Africa/Dakar",
			"Africa/Dar_es_Salaam",
			"Africa/Djibouti",
			"Africa/Douala",
			"Africa/El_Aaiun",
			"Africa/Freetown",
			"Africa/Gaborone",
			"Africa/Harare",
			"Africa/Johannesburg",
			"Africa/Juba",
			"Africa/Kampala",
			"Africa/Khartoum",
			"Africa/Kigali",
			"Africa/Kinshasa",
			"Africa/Lagos",
			"Africa/Libreville",
			"Africa/Lome",
			"Africa/Luanda",
			"Africa/Lubumbashi",
			"Africa/Lusaka",
			"Africa/Malabo",
			"Africa/Maputo",
			"Africa/Maseru",
			"Africa/Mbabane",
			"Africa/Mogadishu",
			"Africa/Monrovia",
			"Africa/Nairobi",
			"Africa/Ndjamena",
			"Africa/Niamey",
			"Africa/Nouakchott",
			"Africa/Ouagadougou",
			"Africa/Porto-Novo",
			"Africa/Sao_Tome",
			"Africa/Tripoli",
			"Africa/Tunis",
			"Africa/Windhoek",
			"America/Adak",
			"America/Anchorage",
			"America/Anguilla",
			"America/Antigua",
			"America/Araguaina",
			"America/Argentina/Buenos_Aires",
			"America/Argentina/Catamarca",
			"America/Argentina/Cordoba",
			"America/Argentina/Jujuy",
			"America/Argentina/La_Rioja",
			"America/Argentina/Mendoza",
			"America/Argentina/Rio_Gallegos",
			"America/Argentina/Salta",
			"America/Argentina/San_Juan",
			"America/Argentina/San_Luis",
			"America/Argentina/Tucuman",
			"America/Argentina/Ushuaia",
			"America/Aruba",
			"America/Asuncion",
			"America/Atikokan",
			"America/Bahia",
			"America/Bahia_Banderas",
			"America/Barbados",
			"America/Belem",
			"America/Belize",
			"America/Blanc-Sablon",
			"America/Boa_Vista",
			"America/Bogota",
			"America/Boise",
			"America/Cambridge_Bay",
			"America/Campo_Grande",
			"America/Cancun",
			"America/Caracas",
			"America/Cayenne",
			"America/Cayman",
			"America/Chicago",
			"America/Chihuahua",
			"America/Costa_Rica",
			"America/Creston",
			"America/Cuiaba",
			"America/Curacao",
			"America/Danmarkshavn",
			"America/Dawson",
			"America/Dawson_Creek",
			"America/Denver",
			"America/Detroit",
			"America/Dominica",
			"America/Edmonton",
			"America/Eirunepe",
			"America/El_Salvador",
			"America/Fort_Nelson",
			"America/Fortaleza",
			"America/Glace_Bay",
			"America/Goose_Bay",
			"America/Grand_Turk",
			"America/Grenada",
			"America/Guadeloupe",
			"America/Guatemala",
			"America/Guayaquil",
			"America/Guyana",
			"America/Halifax",
			"America/Havana",
			"America/Hermosillo",
			"America/Indiana/Indianapolis",
			"America/Indiana/Knox",
			"America/Indiana/Marengo",
			"America/Indiana/Petersburg",
			"America/Indiana/Tell_City",
			"America/Indiana/Vevay",
			"America/Indiana/Vincennes",
			"America/Indiana/Winamac",
			"America/Inuvik",
			"America/Iqaluit",
			"America/Jamaica",
			"America/Juneau",
			"America/Kentucky/Louisville",
			"America/Kentucky/Monticello",
			"America/Kralendijk",
			"America/La_Paz",
			"America/Lima",
			"America/Los_Angeles",
			"America/Lower_Princes",
			"America/Maceio",
			"America/Managua",
			"America/Manaus",
			"America/Marigot",
			"America/Martinique",
			"America/Matamoros",
			"America/Mazatlan",
			"America/Menominee",
			"America/Merida",
			"America/Metlakatla",
			"America/Mexico_City",
			"America/Miquelon",
			"America/Moncton",
			"America/Monterrey",
			"America/Montevideo",
			"America/Montserrat",
			"America/Nassau",
			"America/New_York",
			"America/Nipigon",
			"America/Nome",
			"America/Noronha",
			"America/North_Dakota/Beulah",
			"America/North_Dakota/Center",
			"America/North_Dakota/New_Salem",
			"America/Nuuk",
			"America/Ojinaga",
			"America/Panama",
			"America/Pangnirtung",
			"America/Paramaribo",
			"America/Phoenix",
			"America/Port-au-Prince",
			"America/Port_of_Spain",
			"America/Porto_Velho",
			"America/Puerto_Rico",
			"America/Punta_Arenas",
			"America/Rainy_River",
			"America/Rankin_Inlet",
			"America/Recife",
			"America/Regina",
			"America/Resolute",
			"America/Rio_Branco",
			"America/Santarem",
			"America/Santiago",
			"America/Santo_Domingo",
			"America/Sao_Paulo",
			"America/Scoresbysund",
			"America/Sitka",
			"America/St_Barthelemy",
			"America/St_Johns",
			"America/St_Kitts",
			"America/St_Lucia",
			"America/St_Thomas",
			"America/St_Vincent",
			"America/Swift_Current",
			"America/Tegucigalpa",
			"America/Thule",
			"America/Thunder_Bay",
			"America/Tijuana",
			"America/Toronto",
			"America/Tortola",
			"America/Vancouver",
			"America/Whitehorse",
			"America/Winnipeg",
			"America/Yakutat",
			"America/Yellowknife",
			"Antarctica/Casey",
			"Antarctica/Davis",
			"Antarctica/DumontDUrville",
			"Antarctica/Macquarie",
			"Antarctica/Mawson",
			"Antarctica/McMurdo",
			"Antarctica/Palmer",
			"Antarctica/Rothera",
			"Antarctica/Syowa",
			"Antarctica/Troll",
			"Antarctica/Vostok",
			"Arctic/Longyearbyen",
			"Asia/Aden",
			"Asia/Almaty",
			"Asia/Amman",
			"Asia/Anadyr",
			"Asia/Aqtau",
			"Asia/Aqtobe",
			"Asia/Ashgabat",
			"Asia/Atyrau",
			"Asia/Baghdad",
			"Asia/Bahrain",
			"Asia/Baku",
			"Asia/Bangkok",
			"Asia/Barnaul",
			"Asia/Beirut",
			"Asia/Bishkek",
			"Asia/Brunei",
			"Asia/Chita",
			"Asia/Choibalsan",
			"Asia/Colombo",
			"Asia/Damascus",
			"Asia/Dhaka",
			"Asia/Dili",
			"Asia/Dubai",
			"Asia/Dushanbe",
			"Asia/Famagusta",
			"Asia/Gaza",
			"Asia/Hebron",
			"Asia/Ho_Chi_Minh",
			"Asia/Hong_Kong",
			"Asia/Hovd",
			"Asia/Irkutsk",
			"Asia/Jakarta",
			"Asia/Jayapura",
			"Asia/Jerusalem",
			"Asia/Kabul",
			"Asia/Kamchatka",
			"Asia/Karachi",
			"Asia/Kathmandu",
			"Asia/Khandyga",
			"Asia/Kolkata",
			"Asia/Krasnoyarsk",
			"Asia/Kuala_Lumpur",
			"Asia/Kuching",
			"Asia/Kuwait",
			"Asia/Macau",
			"Asia/Magadan",
			"Asia/Makassar",
			"Asia/Manila",
			"Asia/Muscat",
			"Asia/Nicosia",
			"Asia/Novokuznetsk",
			"Asia/Novosibirsk",
			"Asia/Omsk",
			"Asia/Oral",
			"Asia/Phnom_Penh",
			"Asia/Pontianak",
			"Asia/Pyongyang",
			"Asia/Qatar",
			"Asia/Qostanay",
			"Asia/Qyzylorda",
			"Asia/Riyadh",
			"Asia/Sakhalin",
			"Asia/Samarkand",
			"Asia/Seoul",
			"Asia/Shanghai",
			"Asia/Singapore",
			"Asia/Srednekolymsk",
			"Asia/Taipei",
			"Asia/Tashkent",
			"Asia/Tbilisi",
			"Asia/Tehran",
			"Asia/Thimphu",
			"Asia/Tokyo",
			"Asia/Tomsk",
			"Asia/Ulaanbaatar",
			"Asia/Urumqi",
			"Asia/Ust-Nera",
			"Asia/Vientiane",
			"Asia/Vladivostok",
			"Asia/Yakutsk",
			"Asia/Yangon",
			"Asia/Yekaterinburg",
			"Asia/Yerevan",
			"Atlantic/Azores",
			"Atlantic/Bermuda",
			"Atlantic/Canary",
			"Atlantic/Cape_Verde",
			"Atlantic/Faroe",
			"Atlantic/Madeira",
			"Atlantic/Reykjavik",
			"Atlantic/South_Georgia",
			"Atlantic/St_Helena",
			"Atlantic/Stanley",
			"Australia/Adelaide",
			"Australia/Brisbane",
			"Australia/Broken_Hill",
			"Australia/Darwin",
			"Australia/Eucla",
			"Australia/Hobart",
			"Australia/Lindeman",
			"Australia/Lord_Howe",
			"Australia/Melbourne",
			"Australia/Perth",
			"Australia/Sydney",
			"Etc/GMT",
			"Etc/GMT+0",
			"Etc/GMT+1",
			"Etc/GMT+10",
			"Etc/GMT+11",
			"Etc/GMT+12",
			"Etc/GMT+2",
			"Etc/GMT+3",
			"Etc/GMT+4",
			"Etc/GMT+5",
			"Etc/GMT+6",
			"Etc/GMT+7",
			"Etc/GMT+8",
			"Etc/GMT+9",
			"Etc/GMT-0",
			"Etc/GMT-1",
			"Etc/GMT-10",
			"Etc/GMT-11",
			"Etc/GMT-12",
			"Etc/GMT-13",
			"Etc/GMT-14",
			"Etc/GMT-2",
			"Etc/GMT-3",
			"Etc/GMT-4",
			"Etc/GMT-5",
			"Etc/GMT-6",
			"Etc/GMT-7",
			"Etc/GMT-8",
			"Etc/GMT-9",
			"Etc/GMT0",
			"Etc/Greenwich",
			"Etc/UTC",
			"Etc/Universal",
			"Etc/Zulu",
			"Europe/Amsterdam",
			"Europe/Andorra",
			"Europe/Astrakhan",
			"Europe/Athens",
			"Europe/Belgrade",
			"Europe/Berlin",
			"Europe/Bratislava",
			"Europe/Brussels",
			"Europe/Bucharest",
			"Europe/Budapest",
			"Europe/Busingen",
			"Europe/Chisinau",
			"Europe/Copenhagen",
			"Europe/Dublin",
			"Europe/Gibraltar",
			"Europe/Guernsey",
			"Europe/Helsinki",
			"Europe/Isle_of_Man",
			"Europe/Istanbul",
			"Europe/Jersey",
			"Europe/Kaliningrad",
			"Europe/Kiev",
			"Europe/Kirov",
			"Europe/Lisbon",
			"Europe/Ljubljana",
			"Europe/London",
			"Europe/Luxembourg",
			"Europe/Madrid",
			"Europe/Malta",
			"Europe/Mariehamn",
			"Europe/Minsk",
			"Europe/Monaco",
			"Europe/Moscow",
			"Europe/Oslo",
			"Europe/Paris",
			"Europe/Podgorica",
			"Europe/Prague",
			"Europe/Riga",
			"Europe/Rome",
			"Europe/Samara",
			"Europe/San_Marino",
			"Europe/Sarajevo",
			"Europe/Saratov",
			"Europe/Simferopol",
			"Europe/Skopje",
			"Europe/Sofia",
			"Europe/Stockholm",
			"Europe/Tallinn",
			"Europe/Tirane",
			"Europe/Ulyanovsk",
			"Europe/Uzhgorod",
			"Europe/Vaduz",
			"Europe/Vatican",
			"Europe/Vienna",
			"Europe/Vilnius",
			"Europe/Volgograd",
			"Europe/Warsaw",
			"Europe/Zagreb",
			"Europe/Zaporozhye",
			"Europe/Zurich",
			"Indian/Antananarivo",
			"Indian/Chagos",
			"Indian/Christmas",
			"Indian/Cocos",
			"Indian/Comoro",
			"Indian/Kerguelen",
			"Indian/Mahe",
			"Indian/Maldives",
			"Indian/Mauritius",
			"Indian/Mayotte",
			"Indian/Reunion",
			"Pacific/Apia",
			"Pacific/Auckland",
			"Pacific/Bougainville",
			"Pacific/Chatham",
			"Pacific/Chuuk",
			"Pacific/Easter",
			"Pacific/Efate",
			"Pacific/Fakaofo",
			"Pacific/Fiji",
			"Pacific/Funafuti",
			"Pacific/Galapagos",
			"Pacific/Gambier",
			"Pacific/Guadalcanal",
			"Pacific/Guam",
			"Pacific/Honolulu",
			"Pacific/Kanton",
			"Pacific/Kiritimati",
			"Pacific/Kosrae",
			"Pacific/Kwajalein",
			"Pacific/Majuro",
			"Pacific/Marquesas",
			"Pacific/Midway",
			"Pacific/Nauru",
			"Pacific/Niue",
			"Pacific/Norfolk",
			"Pacific/Noumea",
			"Pacific/Pago_Pago",
			"Pacific/Palau",
			"Pacific/Pitcairn",
			"Pacific/Pohnpei",
			"Pacific/Port_Moresby",
			"Pacific/Rarotonga",
			"Pacific/Saipan",
			"Pacific/Tahiti",
			"Pacific/Tarawa",
			"Pacific/Tongatapu",
			"Pacific/Wake",
			"Pacific/Wallis"
		];

		QUnit.module("isValidTimezone");

		QUnit.test("valid timezones (CLDR)", function (assert) {
			aCLDRTimezoneIDs.forEach(function (sTimezone) {
				assert.ok(TimezoneUtil.isValidTimezone(sTimezone), sTimezone + " should be a valid timezone (CLDR).");
			});
		});

		QUnit.test("valid timezones (ABAP)", function (assert) {
			aABAPTimezoneIDs.forEach(function (sTimezone) {
				assert.ok(TimezoneUtil.isValidTimezone(sTimezone), sTimezone + " should be a valid timezone (ABAP).");
			});
		});

		QUnit.test("invalid timezones", function (assert) {
			assert.notOk(TimezoneUtil.isValidTimezone(""), "Empty string should not be a valid timezone.");
			assert.notOk(TimezoneUtil.isValidTimezone(123), "A number should not be a valid timezone.");
			assert.notOk(TimezoneUtil.isValidTimezone(undefined), "undefined should not be a valid timezone.");
			assert.notOk(TimezoneUtil.isValidTimezone(null), "null should not be a valid timezone.");
			assert.notOk(TimezoneUtil.isValidTimezone("SAP/Walldorf"), "SAP/Walldorf should not be a valid timezone.");
			assert.notOk(TimezoneUtil.isValidTimezone("Asia/Hanoi"), "Asia/Hanoi should not be a valid timezone.");
			assert.notOk(TimezoneUtil.isValidTimezone(new Date()), "A date should not be a valid timezone.");
		});

		QUnit.module("calculateOffset");

		QUnit.test("Calculate offset Europe/Berlin", function (assert) {
			var oDate = new Date("2021-10-13T13:22:33Z");
			assert.equal(TimezoneUtil.calculateOffset(oDate, "Europe/Berlin"), -2 * 3600, "Timezone difference of -2 hours should match.");
		});

		QUnit.test("Calculate offset America/New_York", function (assert) {
			var oDate = new Date("2021-10-13T15:22:33Z");
			assert.equal(TimezoneUtil.calculateOffset(oDate, "America/New_York"), 4 * 3600, "Timezone difference of 4 hours should match.");
		});

		QUnit.test("Historical timezones", function (assert) {
			[
				// 1730 (UTC+0:53:28)
				{
					inputDate:  new Date("1730-01-01T00:00:00Z"),
					diff: -3208
				},
				{
					inputDate:  new Date("1893-01-01T00:00:00Z"),
					diff: -3208
				},
				// 1893	Sat, 1 Apr, 00:00	LMT → CET (UTC+1)
				{
					inputDate:  new Date("1893-04-01T01:00:00Z"),
					diff: -3600
				},
				// 1941	(UTC+2)
				{
					inputDate:  new Date("1941-01-01T00:00:00Z"),
					diff: -2 * 3600
				},
				{
					inputDate:  new Date("1941-06-01T00:00:00Z"),
					diff: -2 * 3600
				},
				// 1945 Thu, 24 May, 02:00	CEST → CEMT	(UTC+3)
				{
					inputDate:  new Date("1945-05-24T03:00:00Z"),
					diff: -3 * 3600
				},
				// 1946 Sun, 14 Apr, 02:00	CET → CEST hour (UTC+2)
				{
					inputDate:  new Date("1946-04-14T03:00:00Z"),
					diff: -2 * 3600
				}
			].forEach(function(oFixture) {
				assert.deepEqual(TimezoneUtil.calculateOffset(oFixture.inputDate, "Europe/Berlin"), oFixture.diff,
					"Input Date '" + oFixture.inputDate + "' should have diff " + oFixture.diff);
			});
		});

		QUnit.test("Calculate offset Summer/Winter Time", function (assert) {
			[
				// Sydney
				// 2018	Sun, 1 Apr, 03:00	AEDT → AEST  -1 hour
				// from UTC+11h to UTC+10
				{
					targetDate: Date.UTC(2018, 3, 1),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 2, 1),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 3, 1, 4),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				{
					targetDate: Date.UTC(2018, 5, 1),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				// 2018 Sun, 7 Oct, 02:00	AEST → AEDT	+1 hour (DST start)	UTC+11h
				{
					targetDate: Date.UTC(2018, 9, 7),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 2),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 2, 30),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -10
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 3),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 3, 30),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 9, 7, 4),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				{
					targetDate: Date.UTC(2018, 9, 8),
					targetTimezone: "Australia/Sydney",
					timezoneDiff: -11
				},
				// Adak
				// 2018	Sun, 11 Mar, 02:00	HST → HDT	+1 hour (DST start)	UTC-9h
				// from UTC-10h to UTC-9
				{
					targetDate: Date.UTC(2018, 2, 10, 22),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 2, 11),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 2, 11, 1),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 2, 11, 4),
					targetTimezone: "America/Adak",
					timezoneDiff: 9
				},
				{
					targetDate: Date.UTC(2018, 2, 11, 16),
					targetTimezone: "America/Adak",
					timezoneDiff: 9
				},

				// 218	Sun, 4 Nov, 02:00	HDT → HST	-1 hour (DST end)	UTC-10h
				// from UTC-9 to UTC-10
				{
					targetDate: Date.UTC(2018, 11, 1),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 10, 4, 5),
					targetTimezone: "America/Adak",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2018, 10, 4, 1),
					targetTimezone: "America/Adak",
					timezoneDiff: 9
				},
				{
					targetDate: Date.UTC(2018, 9, 4),
					targetTimezone: "America/Adak",
					timezoneDiff: 9
				},
				// Kiritimati
				// UTC+14
				{
					targetDate: Date.UTC(2018, 9, 9),
					targetTimezone: "Pacific/Kiritimati",
					timezoneDiff: -14
				},
				{
					targetDate: Date.UTC(2018, 9, 9, 20),
					targetTimezone: "Pacific/Kiritimati",
					timezoneDiff: -14
				},
				// London
				// 2018	Sun, 25 Mar, 01:00	GMT → BST	+1 hour (DST start)	UTC+1h
				{
					targetDate: Date.UTC(2018, 2, 24),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 2, 25),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 2, 25, 0, 30),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 2, 25, 1),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 2, 26),
					targetTimezone: "Europe/London",
					timezoneDiff: -1
				},
				// Sun, 28 Oct, 02:00	BST → GMT	-1 hour (DST end)	UTC
				{
					targetDate: Date.UTC(2018, 9, 29),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 1),
					targetTimezone: "Europe/London",
					timezoneDiff: 0
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 0, 59),
					targetTimezone: "Europe/London",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 28),
					targetTimezone: "Europe/London",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 25),
					targetTimezone: "Europe/London",
					timezoneDiff: -1
				},
				// Berlin
				// 2018	Sun, 25 Mar, 02:00	CET → CEST	+1 hour (DST start)	UTC+2h

				{
					targetDate: Date.UTC(2018, 2, 25, 3),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -2
				},
				{
					targetDate: Date.UTC(2018, 2, 25, 2),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 2, 25, 1),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 2, 25),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				// 2018 Sun, 28 Oct, 03:00	CEST → CET	-1 hour (DST end)	UTC+1h
				{
					targetDate: Date.UTC(2018, 9, 28, 4),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 3),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 2),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -1
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 1, 59),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -2
				},
				{
					targetDate: Date.UTC(2018, 9, 28, 1),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -2
				},
				{
					targetDate: Date.UTC(2018, 9, 28),
					targetTimezone: "Europe/Berlin",
					timezoneDiff: -2
				},
				// Independent State of Samoa changed time at the end of December 29, 2011
				// It changed from UTC-11 (UTC-10 DST) to UTC+13 (UTC+14 DST until 2021 - currently always UTC+13)
				{
					targetDate: Date.UTC(2011, 11, 29, 23),
					targetTimezone: "Pacific/Apia",
					timezoneDiff: 10
				},
				{
					targetDate: Date.UTC(2011, 11, 30, 0),
					targetTimezone: "Pacific/Apia",
					timezoneDiff: -14
				}
			].forEach(function (oFixture) {
				assert.equal(TimezoneUtil.calculateOffset(new Date(oFixture.targetDate), oFixture.targetTimezone), oFixture.timezoneDiff * 3600,
					"Timezone difference of " + oFixture.timezoneDiff + " hours in " + oFixture.targetTimezone + " for input date " + new Date(oFixture.targetDate) + ".");
			});
		});

		QUnit.module("convertToTimezone");

		QUnit.test("try to convert to invalid time", function (assert) {
			// 2018 Sun, 7 Oct, 02:00	AEST → AEDT	+1 hour (DST start)	UTC+11h
			var oDate = Date.UTC(2018, 9, 7, 2, 30);
			// Sun Oct 07 2018 15:30:00 GMT+0200
			var iExpectedEDT = Date.UTC(2018, 9, 7, 13, 30);
			assert.equal(TimezoneUtil.convertToTimezone(new Date(oDate), "Australia/Sydney").getTime(), iExpectedEDT,
				"Date should be converted.");

			var oDate1 = Date.UTC(2018, 9, 6, 16, 30);
			var iExpectedEDT1 = Date.UTC(2018, 9, 7, 3, 30);
			assert.equal(TimezoneUtil.convertToTimezone(new Date(oDate1), "Australia/Sydney").getTime(), iExpectedEDT1,
				"Date should be converted.");


			var oDate2 = Date.UTC(2018, 9, 6, 15, 30);
			var iExpectedEDT2 = Date.UTC(2018, 9, 7, 1, 30);
			assert.equal(TimezoneUtil.convertToTimezone(new Date(oDate2), "Australia/Sydney").getTime(), iExpectedEDT2,
				"Date should be converted.");

			var oDate3 = Date.UTC(2018, 9, 6, 14, 30);
			var iExpectedEDT3 = Date.UTC(2018, 9, 7, 0, 30);
			assert.equal(TimezoneUtil.convertToTimezone(new Date(oDate3), "Australia/Sydney").getTime(), iExpectedEDT3,
				"Date should be converted.");
		});

		QUnit.test("convert to America/New_York", function (assert) {
			// Timezone difference UTC-4 (Eastern Daylight Time - EDT)
			var oDateEDT = new Date("2021-10-13T15:22:33Z");
			var iExpectedEDT = Date.UTC(2021, 9, 13, 11, 22, 33);
			assert.equal(TimezoneUtil.convertToTimezone(oDateEDT, "America/New_York").getTime(), iExpectedEDT, "Date should be converted.");

			// Timezone difference UTC-5 (Eastern Standard Time - EST)
			var oDateEST = new Date("2021-11-13T15:22:33Z");
			var iExpectedEST = Date.UTC(2021, 10, 13, 10, 22, 33);
			assert.equal(TimezoneUtil.convertToTimezone(oDateEST, "America/New_York").getTime(), iExpectedEST, "Date should be converted.");
		});

		QUnit.test("convert to Europe/Berlin", function (assert) {
			// Timezone difference UTC+2 (Central European Summer Time)
			var oDateSummer = new Date("2021-10-13T15:22:33Z");
			var iExpectedSummer = Date.UTC(2021, 9, 13, 17, 22, 33);
			assert.equal(TimezoneUtil.convertToTimezone(oDateSummer, "Europe/Berlin").getTime(), iExpectedSummer, "Date should be converted.");

			// Timezone difference UTC+1 (Central European Standard Time)
			var oDateStandard = new Date("2021-11-13T15:22:33Z");
			var iExpectedStandard = Date.UTC(2021, 10, 13, 16, 22, 33);
			assert.equal(TimezoneUtil.convertToTimezone(oDateStandard, "Europe/Berlin").getTime(), iExpectedStandard, "Date should be converted.");
		});

		QUnit.test("Historical timezones", function (assert) {
			[
				// 1730 (UTC+0:53:28)
				{
					inputDate:  new Date("1730-01-01T00:00:00Z"),
					outputDate: new Date("1730-01-01T00:53:28Z")
				},
				{
					inputDate:  new Date("1893-01-01T00:00:00Z"),
					outputDate: new Date("1893-01-01T00:53:28Z")
				},
				// 1893	Sat, 1 Apr, 00:00	LMT → CET (UTC+1)
				{
					inputDate:  new Date("1893-04-01T00:00:00Z"),
					outputDate: new Date("1893-04-01T01:00:00Z")
				},
				// 1941	(UTC+2)
				{
					inputDate:  new Date("1941-01-01T00:00:00Z"),
					outputDate: new Date("1941-01-01T02:00:00Z")
				},
				{
					inputDate:  new Date("1941-06-01T00:00:00Z"),
					outputDate: new Date("1941-06-01T02:00:00Z")
				},
				// 1945 Thu, 24 May, 02:00	CEST → CEMT	(UTC+3)
				{
					inputDate:  new Date("1945-05-24T02:00:00Z"),
					outputDate: new Date("1945-05-24T05:00:00Z")
				},
				// 1946 Sun, 14 Apr, 02:00	CET → CEST hour (UTC+2)
				{
					inputDate:  new Date("1946-05-24T02:00:00Z"),
					outputDate: new Date("1946-05-24T04:00:00Z")
				}
			].forEach(function(oFixture) {
				assert.deepEqual(TimezoneUtil.convertToTimezone(oFixture.inputDate, "Europe/Berlin"), oFixture.outputDate,
					"Input Date '" + oFixture.inputDate + "' should be converted.");
			});
		});

		QUnit.test("Before year 0", function (assert) {
			[
				{
					// year 1
					createInputDate: function() {
						return new Date("0001-01-01T00:00:00Z");
					},
					createOutputDate: function() {
						return new Date("0001-01-01T00:53:28Z");
					}
				},
				{
					// year 0
					createInputDate: function() {
						return new Date("0000-01-01T00:00:00Z");
					},
					createOutputDate: function() {
						var oDate = new Date("0000-01-01T00:53:28Z");
						return oDate;
					}
				},
				{
					// year -1
					createInputDate: function() {
						var oDate = new Date("0000-01-01T00:00:00Z");
						oDate.setUTCFullYear(-1);
						return oDate;
					},
					createOutputDate: function() {
						var oDate = new Date("0000-01-01T00:53:28Z");
						oDate.setUTCFullYear(-1);
						return oDate;
					}
				},
				{
					// year -1 in May
					createInputDate: function() {
						var oDate = new Date("0000-05-03T12:00:00Z");
						oDate.setUTCFullYear(-1);
						return oDate;
					},
					createOutputDate: function() {
						var oDate = new Date("0000-05-03T12:53:28Z");
						oDate.setUTCFullYear(-1);
						return oDate;
					}
				},
				{
					// year -1000
					createInputDate: function() {
						var oDate = new Date("0000-01-01T00:00:00Z");
						oDate.setUTCFullYear(-1000);
						return oDate;
					},
					createOutputDate: function() {
						var oDate = new Date("0000-01-01T00:53:28Z");
						oDate.setUTCFullYear(-1000);
						return oDate;
					}
				}
			].forEach(function(oFixture) {
				assert.deepEqual(TimezoneUtil.convertToTimezone(oFixture.createInputDate(), "Europe/Berlin"),
					oFixture.createOutputDate(), "Input Date '" + oFixture.createInputDate() + "' should be converted.");
			});
		});

		QUnit.module("getLocalTimezone");

		QUnit.test("local timezone", function (assert) {
			var sLocalTimezone = TimezoneUtil.getLocalTimezone();
			assert.ok(aCLDRTimezoneIDs.includes(sLocalTimezone), "Local timezone should be in list: " + sLocalTimezone);
		});

		QUnit.module("Fixed date with end of January such that", {
			beforeEach: function () {
				this.clock = sinon.useFakeTimers(new Date("2022-01-31T15:22:33Z").getTime());
			},
			afterEach: function () {
				this.clock.restore();
			}
		});

		QUnit.test("convert to from UTC to UTC", function (assert) {
			// The date creation from fields provided by the Intl.DateTimeFormat API must be in the
			// correct order and use the UNIX epoch start date (new Date(0)).
			// Otherwise if created from a new Date() with date January 31st when calling
			// setUTCMonth, it would automatically shift to the next month, because February does
			// not have the 31 days.
			var oDate = new Date("2021-11-13T15:22:33Z");
			assert.deepEqual(TimezoneUtil.convertToTimezone(oDate, "UTC"), oDate, "Date should be converted.");
		});

		QUnit.module("Integration");

		QUnit.test("convertToTimezone + calculateOffset + isValidTimezone", function (assert) {
			var oDate = new Date(Date.UTC(2018, 9, 7, 2, 30));
			aCLDRTimezoneIDs.forEach(function (sTimezone) {

				assert.ok(TimezoneUtil.isValidTimezone(sTimezone), "timezone is valid: " + sTimezone);

				// forth
				var oConvertedDate = TimezoneUtil.convertToTimezone(oDate, sTimezone);

				// back
				var iOffsetSeconds = TimezoneUtil.calculateOffset(oConvertedDate, sTimezone);
				oConvertedDate.setUTCSeconds(iOffsetSeconds);

				// check
				assert.deepEqual(oConvertedDate, oDate, "timezone conversion forth and back: " + sTimezone);
			});
		});
	}
);
