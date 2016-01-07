package org.openui5;

import java.util.Comparator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VersionStringComparator implements Comparator<String> {
	Pattern VERSION_PATTERN = Pattern.compile("(\\d+)\\.(\\d+)\\.(\\d+)");
	
	public int compare(String v1, String v2) {
		Matcher m1 = VERSION_PATTERN.matcher(v1);
		Matcher m2 = VERSION_PATTERN.matcher(v2);
		if (!m1.matches() || !m2.matches()) {
			throw new RuntimeException("Versions cannot be parsed: " + v1 + ", " + v2);
		}
		int may1 = Integer.parseInt(m1.group(1));
		int may2 = Integer.parseInt(m2.group(1));
		
		if (may1 > may2) {
			return 1;
		} else if (may2 > may1) {
			return -1;
		} else {
			// compare minor
			int min1 = Integer.parseInt(m1.group(2));
			int min2 = Integer.parseInt(m2.group(2));
			if (min1 > min2) {
				return 1;
			} else if (min2 > min1) {
				return -1;
			} else {
				// compare minor
				int pat1 = Integer.parseInt(m1.group(3));
				int pat2 = Integer.parseInt(m2.group(3));
				if (pat1 > pat2) {
					return 1;
				} else if (pat2 > pat1) {
					return -1;
				} else {
					return 0; // equal versions
				}
			}
		}
	}
}