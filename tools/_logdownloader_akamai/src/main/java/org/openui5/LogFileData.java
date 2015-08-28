package org.openui5;

import java.util.Date;
import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

import org.json.JSONObject;

/**
 * Class holding the log data (only the extracted numbers) collected for one specific day
 *
 */
class LogFileData {
	Date date;
	int year;
	int month;
	int day;
	int runtimeDownloads;
	int mobileDownloads;
	int sdkDownloads;
	int referencesHits;
	int githubHits;
	int blogHits;
	int featuresHits;
	int getstartedHits;
	int demokitHits;
	int coreHits;
	int versionedCoreHits;
	int ipCounter;
	Map<String,Integer> coreVersions;

	public LogFileData(Date date, int runtimeDownloads,
			int mobileDownloads, int sdkDownloads, int githubHits,
			int blogHits, int referencesHits, int featuresHits, int getstartedHits, int demokitHits, int coreHits, int versionedCoreHits, int ipCounter, Map<String,Integer> coreVersions) {
		super();

		int day = date.getDate();
		int month = date.getMonth() + 1;
		int year = date.getYear() + 1900;

		this.date = date;
		this.year = year;
		this.month = month;
		this.day = day;
		this.runtimeDownloads = runtimeDownloads;
		this.mobileDownloads = mobileDownloads;
		this.sdkDownloads = sdkDownloads;
		this.githubHits = githubHits;
		this.blogHits = blogHits;
		this.referencesHits = referencesHits;
		this.featuresHits = featuresHits;
		this.getstartedHits = getstartedHits;
		this.demokitHits = demokitHits;
		this.coreHits = coreHits;
		this.versionedCoreHits = versionedCoreHits;
		this.ipCounter = ipCounter;
		this.coreVersions = coreVersions;
	}

	public String getYYYYMMDD_WithDashes() {
		String dayPad = day < 10 ? "0" : "";
		String monthPad = month < 10 ? "0" : "";
		String dateText = year + "-" + monthPad + month + "-" + dayPad + day; // padding for single-digit days to ease sorting in the end
		return dateText;
	}

	public String getDDMMYYYY_WithDots() { // for Excel
		String dayPad = day < 10 ? "0" : "";
		String monthPad = month < 10 ? "0" : "";
		String dateText = dayPad + day + "." + monthPad + month + "." + year; // padding for single-digit days to ease sorting in the end
		return dateText;
	}
	
	public static LogFileData fromJson(JSONObject obj) {
		String yyyymmddWithDashes = obj.getString("date");
		String[] dateParts = yyyymmddWithDashes.split("-");
		int year = Integer.parseInt(dateParts[0]);
		int month = Integer.parseInt(dateParts[1]);
		int day = Integer.parseInt(dateParts[2]);
		
		Map<String,Integer> coreVersions = new TreeMap<String,Integer>(new VersionStringComparator());
		if (obj.has("coreVersions")) {
			JSONObject coreVersionsObj = obj.getJSONObject("coreVersions");
			
			Iterator<String> versions = coreVersionsObj.keys();
			while(versions.hasNext()) {
				String version = versions.next();
				coreVersions.put(version, coreVersionsObj.getInt(version));
			}
		}
		
		LogFileData data = new LogFileData(
				new Date(year-1900, month-1, day),
				obj.getInt("runtime"), 
				obj.getInt("mobile"), 
				obj.getInt("sdk"), 
				obj.getInt("githubHits"), 
				obj.getInt("blogHits"),
				obj.getInt("referencesHits"),
				obj.getInt("featuresHits"),
				obj.getInt("getstartedHits"),
				obj.getInt("demokitHits"),
				obj.getInt("coreHits"),
				obj.getInt("versionedCoreHits"),
				obj.getInt("ipCounter"),
				coreVersions);
		return data;
	}

	public Date getDate() {
		return date;
	}

	public int getRuntimeDownloads() {
		return runtimeDownloads;
	}
	public int getMobileDownloads() {
		return mobileDownloads;
	}
	public int getSdkDownloads() {
		return sdkDownloads;
	}
	public int getGithubHits() {
		return githubHits;
	}
	public int getBlogHits() {
		return blogHits;
	}
	public int getReferencesHits() {
		return referencesHits;
	}
	public int getFeaturesHits() {
		return featuresHits;
	}
	public int getGetstartedHits() {
		return getstartedHits;
	}
	public int getDemokitHits() {
		return demokitHits;
	}
	public int getCoreHits() {
		return coreHits;
	}
	public int getVersionedCoreHits() {
		return versionedCoreHits;
	}
	public int getIpCounter() {
		return ipCounter;
	}
	
	public Map<String, Integer> getCoreVersions() {
		return coreVersions;
	}

	@Override
	public String toString() {
		// the result string for a line in the CSV file
		String coreVersionsString = stringifyMap(coreVersions);
		String csvText = getDDMMYYYY_WithDots() + ";" + runtimeDownloads + ";" + mobileDownloads + ";" + sdkDownloads + ";" + githubHits + ";" + demokitHits + ";" + blogHits + ";" + ipCounter + ";" + referencesHits + ";" + featuresHits + ";" + getstartedHits + ";" + coreHits + ";" + versionedCoreHits + ";" + coreVersionsString;
		return csvText;
	}
	
	static String stringifyMap(Map<String, Integer> map) {
		String result = "{";
		
		boolean comma = false;
		for (String version : map.keySet()) {
			if (comma) result += ",";
			result += "\"" + version + "\":" + map.get(version);
			comma = true;
		}
		
		return result + "}";
	}

	public void addData(LogFileData other) {
		if ((this.year != other.year) || (this.month != other.month) || (this.day != other.day)) {
			throw new RuntimeException("Adding data sets with different dates: " + this.date + ", " + other.date);
		}

		this.runtimeDownloads += other.runtimeDownloads;
		this.mobileDownloads += other.mobileDownloads;
		this.sdkDownloads += other.sdkDownloads;
		this.githubHits += other.githubHits;
		this.blogHits += other.blogHits;
		this.referencesHits += other.referencesHits;
		this.featuresHits += other.featuresHits;
		this.getstartedHits += other.getstartedHits;
		this.demokitHits += other.demokitHits;
		this.coreHits += other.coreHits;
		this.versionedCoreHits += other.versionedCoreHits;
		this.ipCounter = Math.max(this.ipCounter, other.ipCounter);
		
		Map<String,Integer> otherCoreVersions = other.getCoreVersions(); // merge and sum up version maps
		for (String version : otherCoreVersions.keySet()) {
			int otherCount = otherCoreVersions.get(version);
			if (coreVersions.containsKey(version)) {
				coreVersions.put(version, coreVersions.get(version) + otherCount);
			} else {
				coreVersions.put(version, otherCount);
			}
		}
	}
}