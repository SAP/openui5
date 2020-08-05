/*!
* ${copyright}
*/

sap.ui.define([], function () {
	"use strict";

	/**
	 * Words which are suitable for testing of browser-native hyphenation.
	 * @type {Object<string,string>}
	 * @private
	 */
	var oTestingWords = {
		"bg": "непротивоконституционствувателствувайте",
		"ca": "Psiconeuroimmunoendocrinologia",
		"hr": "prijestolonasljednikovičičinima",
		"cs": "nejnezdevětadevadesáteronásobitelnějšími",
		"da": "Gedebukkebensoverogundergeneralkrigskommandersergenten",
		"nl": "meervoudigepersoonlijkheidsstoornissen",
		"en-us": "pneumonoultramicroscopicsilicovolcanoconiosis",
		"et": "Sünnipäevanädalalõpupeopärastlõunaväsimus",
		"fi": "kolmivaihekilowattituntimittari",
		"fr": "hippopotomonstrosesquippedaliophobie",
		"de": "Kindercarnavalsoptochtvoorbereidingswerkzaamhedenplan",
		"el-monoton": "ηλεκτροεγκεφαλογράφημα", // no native css hyphenation by documentation, but will be tested
		"hi": "किंकर्तव्यविमूढ़", // no native css hyphenation by documentation, but will be tested
		"hu": "Megszentségteleníthetetlenségeskedéseitekért",
		"it": "hippopotomonstrosesquippedaliofobia",
		"lt": "nebeprisikiškiakopūstlapiaujančiuosiuose",
		"nb-no": "supercalifragilisticexpialidocious",
		"pl": "dziewięćdziesięciokilkuletniemu",
		"pt": "pneumoultramicroscopicossilicovulcanoconiose",
		"ru": "превысокомногорассмотрительствующий",
		"sr": "Семпаравиливичинаверсаламилитипиковски",
		"sl": "Dialektičnomaterialističen",
		"es": "Electroencefalografistas",
		"sv": "Realisationsvinstbeskattning",
		"th": "ตัวอย่างข้อความที่จะใช้ในการยืนยันการถ่ายโอน", // no native css hyphenation by documentation, but will be tested
		"tr": "Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine",
		"uk": "Нікотинамідаденіндинуклеотидфосфат"
	};

	return oTestingWords;
});