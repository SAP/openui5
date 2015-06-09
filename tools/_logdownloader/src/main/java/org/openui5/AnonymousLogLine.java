package org.openui5;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Represents one HTTP log file line, but an anonymized one (not containing any IP address, but just a number instead)
 * 
 * @author d046011
 *
 */
public class AnonymousLogLine {

	private static final Map<String, Integer> monthMap = new HashMap<String, Integer>(16);
	static {
		monthMap.put("Jan", 1);
		monthMap.put("Feb", 2);
		monthMap.put("Mar", 3);
		monthMap.put("Apr", 4);
		monthMap.put("May", 5);
		monthMap.put("Jun", 6);
		monthMap.put("Jul", 7);
		monthMap.put("Aug", 8);
		monthMap.put("Sep", 9);
		monthMap.put("Oct", 10);
		monthMap.put("Nov", 11);
		monthMap.put("Dec", 12);
	}
	
	private static final Map<Integer, String> inverseMonthMap = new HashMap<Integer, String>(16);
	static {
		inverseMonthMap.put(0, "Jan");
		inverseMonthMap.put(1, "Feb");
		inverseMonthMap.put(2, "Mar");
		inverseMonthMap.put(3, "Apr");
		inverseMonthMap.put(4, "May");
		inverseMonthMap.put(5, "Jun");
		inverseMonthMap.put(6, "Jul");
		inverseMonthMap.put(7, "Aug");
		inverseMonthMap.put(8, "Sep");
		inverseMonthMap.put(9, "Oct");
		inverseMonthMap.put(10, "Nov");
		inverseMonthMap.put(11, "Dec");
	}

	/*
	 * Groups:
	 * 0: entire string
	 * 1: ipCounter
	 * 2: day
	 * 3: month
	 * 4: year
	 * 5: hours
	 * 6: minutes
	 * 7: seconds
	 * 8: method
	 * 9: url
	 * 11: HTTP code in case of two numbers
	 * 12: first number in case of two
	 * 13: second number in case of two
	 * 14: HTTP code in case of one number
	 * 15: the one number
	 */
	private static final Pattern ANON_LOGLINE_PATTERN = Pattern.compile("^(\\d+) \\[(\\d+)/(\\w+)/(\\d\\d\\d\\d):(\\d\\d):(\\d\\d):(\\d\\d) \\+0000\\] (\\w+) ([^\\s]+) HTTP/\\d.\\d ((\\d+) (\\d+) (\\d+)|(\\d+) - (\\d+))$");

	private static final Pattern RUNTIME_PATTERN = Pattern.compile("^/downloads/openui5-runtime-1.(\\d+).(\\d+(-SNAPSHOT)?).zip$");
	private static final Pattern MOBILE_PATTERN = Pattern.compile("^/downloads/openui5-runtime-mobile-1.(\\d+).(\\d+(-SNAPSHOT)?).zip$");
	private static final Pattern SDK_PATTERN = Pattern.compile("^/downloads/openui5-sdk-1.(\\d+).(\\d+(-SNAPSHOT)?).zip$");
	private static final String GITHUB_PAGE_STRING = "/resources/sap/ui/core/themes/base/img/1x1.gif?page=index";
	private static final String BLOG_PAGE_STRING = "/resources/sap/ui/core/themes/base/img/1x1.gif?page=blog";
	private static final String REFERENCES_PAGE_STRING = "/resources/sap/ui/core/themes/base/img/1x1.gif?page=whoUsesUI5";
	private static final String DEMOKIT_PAGE_STRING = "/";


	private Date date;
	private String ipCounter;
	private Resource type;
	private int code;
	private String url;
	private int firstNumber;
	private int secondNumber;
	private int oneNumber;

	private AnonymousLogLine(Date date, String ipCounter, Resource type, int code, String url, int firstNumber, int secondNumber, int oneNumber) {
		super();
		this.date = date;
		this.ipCounter = ipCounter;
		this.type = type;
		this.code = code;
		this.url = url;
		this.firstNumber = firstNumber;
		this.secondNumber = secondNumber;
		this.oneNumber = oneNumber;
	}

	private AnonymousLogLine(Date date, String anonymizedFullText) {
		super();
		this.date = date;
	}



	public Date getDate() {
		return date;
	}

	/**
	 * 
	 * @return the counter number assigned to the IP address this log line originally had
	 */
	public String getIpCounter() {
		return ipCounter;
	}

	public Resource getType() {
		return type;
	}

	public int getCode() {
		return code;
	}

	public String getUrl() {
		return url;
	}

	public int getFirstNumber() {
		return firstNumber;
	}

	public int getSecondNumber() {
		return secondNumber;
	}

	public int getOneNumber() {
		return oneNumber;
	}

	public static AnonymousLogLine createFromLine(String line) {
		Matcher m = ANON_LOGLINE_PATTERN.matcher(line);

		if (m.matches()) {

			String codeStr = m.group(11);
			if (codeStr == null) {
				codeStr = m.group(14);
			}
			int code = Integer.parseInt(codeStr);

			if (!m.group(8).equals("GET")) { // only GET
				return null;
			}
			if (code == 404 || code == 304) {
				return null; // not found, not modified
			}

			Resource type = getResourceType(m.group(9));
			if (type == null) {
				if (line.indexOf("openui5-runtime") > -1 || line.indexOf("openui5-sdk") > -1) {
					System.out.println("WARNING: did we not match a valid file? " + line);
				}
				return null; // none of the interesting resources
			}

			// now the line seems to be one of the interesting resources

			String ipCounter = m.group(1);

			AnonymousLogLine logLine = new AnonymousLogLine(
					new Date(
							Integer.parseInt(m.group(4)) - 1900,
							monthMap.get(m.group(3))-1,
							Integer.parseInt(m.group(2)),
							Integer.parseInt(m.group(5)),
							Integer.parseInt(m.group(6)),
							Integer.parseInt(m.group(7))
							),
							ipCounter,
							type,
							code,
							m.group(9), // url
							m.group(12) != null ? Integer.parseInt(m.group(12)) : -1, // 12: first number in case of two
									m.group(13) != null ? Integer.parseInt(m.group(13)) : -1, // 13: second number in case of two
											m.group(15) != null ? Integer.parseInt(m.group(15)) : -1 // 15: the one number
					);
			return logLine;
		} else {
			if (!line.equals("") &&
					!(line.indexOf("GET /\"\" window") > -1) &&
					!(line.indexOf("GET /\"\" s \"/\"") > -1) &&
					!(line.indexOf("GET /\"\";w =this.oCon") > -1) 
					) {
				System.out.println("WARNING: no match: " + line);
			}
		}

		return null;
	}


	private static Resource getResourceType(String url) {
		if (url.startsWith(GITHUB_PAGE_STRING)) {
			return Resource.GITHUB_PAGE;
		}
		if (url.startsWith(BLOG_PAGE_STRING)) {
			return Resource.BLOG_PAGE;
		}
		if (url.startsWith(REFERENCES_PAGE_STRING)) {
			return Resource.REFERENCES_PAGE;
		}
		if (DEMOKIT_PAGE_STRING.equals(url)) {
			return Resource.DEMOKIT_PAGE;
		}
		if (RUNTIME_PATTERN.matcher(url).matches()) {
			return Resource.RUNTIME_DOWNLOAD;
		}
		if (MOBILE_PATTERN.matcher(url).matches()) {
			return Resource.MOBILE_DOWNLOAD;
		}
		if (SDK_PATTERN.matcher(url).matches()) {
			return Resource.SDK_DOWNLOAD;
		}

		return null;
	}

	public static String zeroPad(int length, int number) {
		String numberString = String.valueOf(number);
		int actualLength = numberString.length();
		
		while (actualLength < length) {
			numberString = "0" + numberString;
			actualLength++;
		}
		
		return numberString;
	}
}
