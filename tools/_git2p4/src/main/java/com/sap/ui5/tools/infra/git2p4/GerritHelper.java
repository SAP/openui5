package com.sap.ui5.tools.infra.git2p4;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GerritHelper {

	private static Pattern GERRIT_MERGE_SUMMARY = Pattern.compile("Merge \"(.*)\"(\\s+into\\s+.*)?");
	
	public static boolean isGerritMerge(String summary) {
		return GERRIT_MERGE_SUMMARY.matcher(summary).matches();
	}
	
	public static String ungerrit(String summary) {
		Matcher m = GERRIT_MERGE_SUMMARY.matcher(summary);
		if ( m.matches() ) {
			return m.group(1);
		} else {
			return summary;
		}
	}
}
