package com.sap.ui5.tools.maven;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.CharArrayWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MyReleaseButton {

  // ---- following code is copied from phx.generator.util.IOUtils ----

  private static final String PROPERTY_PREFIX_OSGI_VERSION = "(phx|sap\\.(ui5|uxap))";
  private static final Pattern CORE_VERSION = Pattern.compile("(?<=version>).*(?=</.*version><!--SAPUI5CoreVersion-->)");
  private static final Pattern VERSION_RANGE_PATTERN = Pattern.compile("(?:[\\[\\(])((?:[0-9]+)(?:\\.(?:[0-9]+)(?:\\.(?:[0-9]+))?)?(?:-[^,\\[\\]\\(\\)]+)?)(?:\\s)*,(?:\\s)*((?:[0-9]+)(?:\\.(?:[0-9]+)(?:\\.(?:[0-9]+))?)?(?:-[^,\\[\\]\\(\\)]+)?)(?:[\\]\\)])");
  private static final Pattern CONTRIBUTOR_VERSION_PATTERN = Pattern.compile("(?<=\\.version>)(.*)(?=</com.sap.*version>)");
  private static final String COM_SAP_UI5_CORE = "com.sap.ui5:core";
  public static final String ISO_8859_1 = "ISO-8859-1";
  public static final String UTF8 = "UTF-8";

  private static Writer createFileWriter(File target, boolean append,
      String encoding, int bufferSize) throws IOException {
    OutputStream os = new FileOutputStream(target, append);
    Writer w = encoding == null ? new OutputStreamWriter(os) : new OutputStreamWriter(os, encoding);
    if (bufferSize < 0)
      return w;
    else if (bufferSize == 0)
      return new BufferedWriter(w);
    else
      return new BufferedWriter(w, bufferSize);
  }

  private static Reader createFileReader(File source, String encoding, int bufferSize) throws IOException {
    return createStreamReader(new FileInputStream(source), encoding, bufferSize);
  }

  private static Reader createStreamReader(InputStream os, String encoding,
      int bufferSize) throws IOException {
    Reader r = encoding == null ? new InputStreamReader(os)
    : new InputStreamReader(os, encoding);
    if (bufferSize < 0)
      return r;
    else if (bufferSize == 0)
      return new BufferedReader(r);
    else
      return new BufferedReader(r, bufferSize);
  }

  private static long copy(Reader in, Writer out, char[] buffer) throws IOException {
    long l = 0;
    int n;
    while ((n = in.read(buffer)) > -1) {
      out.write(buffer, 0, n);
      l += n;
    }
    return l;
  }

  public static CharSequence readFile(File file, String encoding) throws IOException {
    Reader in = createFileReader(file, encoding, -1);
    return read(in, (int) file.length()); // TODO better rounding
  }

  private static CharSequence read(Reader reader, int initialSize) throws IOException {
    CharBuffer out = new CharBuffer(initialSize);
    copy(reader, out, new char[0x4000]);
    return out;
  }

  public static void writeFile(File file, String str, String encoding) throws IOException {
    Writer out = createFileWriter(file, false, encoding, -1);
    out.write(str);
    out.close();
  }

  private static class CharBuffer extends CharArrayWriter implements CharSequence {

    CharBuffer(int length) {
      super(length);
    }

    @Override
    public char charAt(int index) {
      if ((index < 0) || (index >= count))
        throw new StringIndexOutOfBoundsException(index);
      return buf[index];
    }

    @Override
    public int length() {
      return count;
    }

    @Override
    public CharSequence subSequence(int start, int end) {
      if (start < 0)
        throw new StringIndexOutOfBoundsException(start);
      if (end > count)
        throw new StringIndexOutOfBoundsException(end);
      if (start > end)
        throw new StringIndexOutOfBoundsException(end - start);
      return new String(buf, start, end - start);
    }

  }

  // ---- end of code copy ----

  private static SortedMap<String,Integer> diffs = new TreeMap<String,Integer>();

  private static void countDiffs(String path, CharSequence original, String modified) {
    String[] origLines = original.toString().split("\r\n|\r|\n");
    String[] modLines = modified.toString().split("\r\n|\r|\n");
    int diff=0;
    for(int i=0; i<Math.min(origLines.length, modLines.length); i++) {
      if ( !origLines[i].equals(modLines[i]) ) {
        diff++;
      }
    }
    diffs.put(path, diff);
  }

  private static boolean checkOut(File file) throws IOException {
    try {
      return Runtime.getRuntime().exec("p4.exe -p perforce3003.wdf.sap.corp:3003 edit " + file).waitFor() == 0;
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  public enum ProcessingTypes {
    RepositoryPaths, VersionWithSnapshot, VersionWithTimestamp, VersionWithQualifier_POM, VersionWithQualifier,
    ContributorsVersions, Sapui5CoreVersion
  };

  public static class ProcessingFilter {

    public ProcessingFilter(){

    }

    public ProcessingFilter(String name, EnumSet<ProcessingTypes> filter) {
      this.name = name;
      this.processingTypes = filter;
    }

    public String name = "default";
    public EnumSet<ProcessingTypes> processingTypes = EnumSet.allOf(ProcessingTypes.class);
  }

  static Pattern fromS, fromT, fromQ_POM, fromQ, fromR;
  static String toS, toT, toQ, toR;
  static Map<Pattern, String> contributorsPatterns = new HashMap<Pattern, String>();
  private static String coreVersion = null;
  private static String contributorsRange = null;
  private static boolean applyContributors;
  private static ProcessingFilter filter;

  private static void processFile(File file, String path) throws IOException {
    String encoding = UTF8;

    EnumSet<ProcessingTypes> processingTypes = EnumSet.noneOf(ProcessingTypes.class);
    if (applyContributors && path.contains("uilib-collection")) {
      processingTypes.add(ProcessingTypes.ContributorsVersions);
    }
    if (file.getName().matches("pom(-[a-zA-Z0-9-_.]*)?.xml")) {
      processingTypes.add(ProcessingTypes.VersionWithSnapshot);
      processingTypes.add(ProcessingTypes.VersionWithQualifier_POM);
      processingTypes.add(ProcessingTypes.VersionWithTimestamp);
      if (coreVersion != null) {
        processingTypes.add(ProcessingTypes.Sapui5CoreVersion);
      }
    } else if (file.getName().endsWith(".library")) {
      processingTypes.add(ProcessingTypes.VersionWithSnapshot);
    } else if (file.getName().endsWith(".target")) {
      processingTypes.add(ProcessingTypes.VersionWithSnapshot);
      processingTypes.add(ProcessingTypes.RepositoryPaths);
    } else if ("feature.xml".equals(file.getName())) {
      processingTypes.add(ProcessingTypes.VersionWithQualifier);
    } else if ("site.xml".equals(file.getName())) {
      processingTypes.add(ProcessingTypes.VersionWithQualifier);
    } else if ("MANIFEST.MF".equals(file.getName())) {
      encoding = ISO_8859_1;
      processingTypes.add(ProcessingTypes.VersionWithQualifier);
    } else if ("archetype-metadata.xml".equals(file.getName())) {
      processingTypes.add(ProcessingTypes.VersionWithSnapshot);
    } else if (file.getName().matches("[a-zA-Z0-9-_.]*bundle.xml") /* TODO restrict it more? e.g. parent.getName() ... */ ) {
      processingTypes.add(ProcessingTypes.VersionWithSnapshot);
    } else if ("site.xml".equals(file.getName())) {
      processingTypes.add(ProcessingTypes.VersionWithQualifier);
    } else if ("deploy.properties".equals(file.getName())) { // pwt-webbundle-archetype
      processingTypes.add(ProcessingTypes.VersionWithSnapshot);
      processingTypes.add(ProcessingTypes.RepositoryPaths);
    } else if ("package.json".equals(file.getName())) { // openui5
      processingTypes.add(ProcessingTypes.VersionWithSnapshot);
    } else if ("sap-ui-version.json".equals(file.getName())) { // uxap release
        processingTypes.add(ProcessingTypes.VersionWithSnapshot);
    }


    processingTypes.removeAll(EnumSet.complementOf(filter.processingTypes));

    if ( !processingTypes.isEmpty() ) {
      CharSequence orig = readFile(file, encoding);
      CharSequence s = orig;

      // MUST RUN BEFORE VersionWithSnapshot!
      if (processingTypes.contains(ProcessingTypes.RepositoryPaths)) {
        s = fromR.matcher(s).replaceAll(toR);
      }

      if (processingTypes.contains(ProcessingTypes.VersionWithTimestamp)) {
        s = fromT.matcher(s).replaceAll(toT);
      }
      if (processingTypes.contains(ProcessingTypes.VersionWithSnapshot)) {
        s = fromS.matcher(s).replaceAll(toS);
      }
      if (processingTypes.contains(ProcessingTypes.VersionWithQualifier_POM)) {
        s = fromQ_POM.matcher(s).replaceAll(toQ);
      }
      if (processingTypes.contains(ProcessingTypes.VersionWithQualifier)) {
        s = fromQ.matcher(s).replaceAll(toQ);
      }
      if (processingTypes.contains(ProcessingTypes.Sapui5CoreVersion)) {
        s = CORE_VERSION.matcher(s).replaceAll(coreVersion);
      }
      // MUST RUN AFTER VersionWithSnapshot!
      if (processingTypes.contains(ProcessingTypes.ContributorsVersions)) {
        s = processContributorsVersions(s, file, encoding);
      }

      if (s != orig) {
        String str = s.toString();
        if (!str.contentEquals(orig)) {
          System.out.println("  Processing file: \"" + file + "\" ");
          saveFile(file, encoding, str);
          countDiffs(path, orig, str);
        }
      }
    }

  }

  private static void saveFile(File file, String encoding, String str) throws IOException {
    if (!file.canWrite()) {
      System.out.print("    P4 checkout: ");
      System.out.println(checkOut(file) ? "SUCCESS" : "ERROR");
    }
    if (file.canWrite()) {
      writeFile(file, str, encoding);
    }
  }

  private static void scan(File dir, String path) throws IOException {
    File[] files = dir.listFiles();
    if (files != null) {
      for (File file : files) {
        if (file.isDirectory())
          scan(file, path + (path.isEmpty() ? "" : "/") + file.getName());
        else
          processFile(file, path + (path.isEmpty() ? "" : "/") + file.getName());
      }
    }
  }


  public static int updateVersion(File repository, String oldVersion, String newVersion, Map<String, String[]> diffDescs, String branch) throws IOException {
    return updateVersion(repository, oldVersion, newVersion, null, diffDescs, branch);
  }

  public static int updateVersion(File repository, String oldVersion, String newVersion, Properties contributorsVersions, Map<String, String[]> diffDescs, String branch) throws IOException {
    return updateVersion(repository, oldVersion, newVersion, contributorsVersions, new ProcessingFilter(), diffDescs, branch);
  }

  /**
   * @param args
   */
  public static int updateVersion(File repository, String oldVersion, String newVersion, Properties contributorsVersions, ProcessingFilter filter, Map<String, String[]> diffDescs, String branch)
      throws IOException {
  File root = repository.getCanonicalFile();
    if (!root.isDirectory()) {
      throw new RuntimeException(
          "root dir must be specified and must be an existing directory");
    }

    MyReleaseButton.filter = filter;

    // convert the versions to Maven versions (if required)
    String oldMavenVersion = Maven2OsgiConverter.isMavenVersion(oldVersion) ? oldVersion : Maven2OsgiConverter.getMavenVersion(oldVersion);
    String newMavenVersion = Maven2OsgiConverter.isMavenVersion(newVersion) ? newVersion : Maven2OsgiConverter.getMavenVersion(newVersion);

    // convert the versions to OSGi versions (if required)
    String oldOSGiVersion = Maven2OsgiConverter.isMavenVersion(oldVersion) ? Maven2OsgiConverter.getOsgiVersion(oldVersion) : oldVersion;
    String newOSGiVersion = Maven2OsgiConverter.isMavenVersion(newVersion) ? Maven2OsgiConverter.getOsgiVersion(newVersion) : newVersion;

    // as OSGI versions now can occur in pom files as well, we have to filter out these occurrences
    //   1.) OSGi version as Maven parameter: <osgi.version>_</osgi.version>
    //       - Necessary for Maven Bundle Plugin (Felix)
    //   2.) OSGi version as Project version: <version>_</version><!--OSGiVerion-->
    //       - Special case for OSGi distributions (Maven version should fit OSGi version)
    //       - In this case the .qualifier version needs to be converted to -SNAPSHOT
    String fromSPattern = "(?<!osgi\\.version>|\\.version>)" + Pattern.quote(oldMavenVersion);
    String fromQ_POMPattern = "(?<=osgi\\.version>)" + Pattern.quote(oldOSGiVersion);

    if (oldMavenVersion.endsWith("-SNAPSHOT") && newMavenVersion.endsWith("-SNAPSHOT")) {
      // will be handled as standard POM version
      // (because qualifier replacement will be done automatically by Tycho here)
    } else if (oldMavenVersion.endsWith("-SNAPSHOT")) {
      // version is already replaced by standard POM version pattern
      // so transform the new Maven version into a new OSGi version
      fromQ_POMPattern += "|" + Pattern.quote(newMavenVersion) + "(?=\\Q</version><!--OSGiVersion-->\\E)";
    } else if (newMavenVersion.endsWith("-SNAPSHOT")) {
      // convert the OSGi version into the SNAPSHOT version again
      fromSPattern += "|" + Pattern.quote(oldOSGiVersion) + "(?=\\Q</version><!--OSGiVersion-->\\E)";
    } else {
      // replace the OSGi version with another OSGi version
      fromQ_POMPattern += "|" + Pattern.quote(oldOSGiVersion) + "(?=\\Q</version><!--OSGiVersion-->\\E)";
    }

    fromS = Pattern.compile(fromSPattern);
    fromQ_POM = Pattern.compile(fromQ_POMPattern);
    fromQ = Pattern.compile(Pattern.quote(oldOSGiVersion));
    // must run before SNAPSHOT replacements
    fromR = Pattern.compile(Pattern.quote(oldMavenVersion.endsWith("-SNAPSHOT") ? "/repositories/build.snapshots.unzip/" : "/repositories/build.milestones.unzip/") + "(?=[^\r\n]*" + Pattern.quote(oldMavenVersion) + ")");
    toS = newMavenVersion;
    toQ = newOSGiVersion;
    toR = newMavenVersion.endsWith("-SNAPSHOT") ? "/repositories/build.snapshots.unzip/" : "/repositories/build.milestones.unzip/";

    if (oldOSGiVersion.endsWith(".qualifier")) {
      fromT = Pattern.compile(Pattern.quote(oldOSGiVersion.replace(".qualifier", ".${maven.build.timestamp}") + "</") + PROPERTY_PREFIX_OSGI_VERSION + Pattern.quote(".osgi.version>"));
    } else {
      fromT = Pattern.compile(Pattern.quote(oldOSGiVersion + "</") + PROPERTY_PREFIX_OSGI_VERSION + Pattern.quote(".osgi.version>"));
    }
    if (newOSGiVersion.endsWith(".qualifier")) {
      toT = newOSGiVersion.replace(".qualifier", ".\\${maven.build.timestamp}") + "</$1.osgi.version>";
    } else {
      toT = newOSGiVersion + "</$1.osgi.version>";
    }

    applyContributors = contributorsVersions != null;
    if (applyContributors){
      coreVersion = contributorsVersions.get(COM_SAP_UI5_CORE).toString();
      contributorsRange = (String)contributorsVersions.get("contributorsRange");
    }

    // TODO What about target files?

    diffs.clear();

    System.out.println("            Maven POM Version: '" + fromS.pattern() + "' --> '" + toS + "'");
    System.out.println("Maven POM OSGI TSTAMP Version: '" + fromT.pattern() + "' --> '" + toT + "'");
    System.out.println("       Maven POM OSGI Version: '" + fromQ_POM.pattern() + "' --> '" + toQ + "'");
    System.out.println("        Manifest OSGI Version: '" + fromQ.pattern() + "' --> '" + toQ + "'");
    System.out.println("             Repository Paths: '" + fromR.pattern() + "' --> '" + toR + "'");
    System.out.println();
    System.out.println("Scanning directory \"" + root + "\"");
    scan(root, "");

    int diffdiffs = -1; // UNKNOWN
    LastRunInfo lastRunInfo = new LastRunInfo(root, filter.name, branch);
    Properties prop = lastRunInfo.getDiffs();
    if ( !prop.isEmpty() ) {
      System.out.println("Comparing diff summary against results from last run");
      diffdiffs = 0;
      // now compare with current results
      for(Map.Entry<String,Integer> entry : diffs.entrySet()) {
        String oldDiffs = prop.getProperty(entry.getKey());
        String newDiffs = entry.getValue().toString();
        if ( !newDiffs.equals(oldDiffs) ) {
          if ( diffDescs != null ) {
            diffDescs.put(entry.getKey(), new String[] { oldDiffs, newDiffs });
          }
          System.out.println("**** " + entry.getKey() + ": " + oldDiffs + "(old) vs. " + newDiffs + "(new)");
          diffdiffs++;
        }
        prop.remove(entry.getKey());
      }
      for(Object key : prop.keySet()) {
        String oldDiffs = prop.getProperty((String) key);
        System.out.println("**** " + key + ": " + oldDiffs + "(old) vs. " + null + "(new)");
        if ( diffDescs != null ) {
          diffDescs.put((String)key, new String[] { oldDiffs, null });
        }
        diffdiffs++;
      }
      if (diffdiffs > 0){
        System.out.println("The diff summary has changed for " + diffdiffs + " files.");
      } else {
        System.out.println("All files are changed according last diff summary from previous run.");
      }
    } else {
      System.out.println("No diff summary found from last run");
    }
    prop.clear();
    for(Map.Entry<String,Integer> entry : diffs.entrySet()) {
      prop.setProperty(entry.getKey(), entry.getValue().toString());
    }
    lastRunInfo.save();
    System.out.println("Diff summary saved");

    return diffdiffs;
  }

  private static CharSequence processContributorsVersions(CharSequence s, File file, String encoding) throws IOException {
    if (contributorsRange != null){
      String replaceWith = contributorsRange;
      // identify the version range and replace the starting version with a
      // regex placeholder which will be used to insert the previous value:
      //  -> [1.22.0-SNAPSHOT, 1.23.0-SNAPSHOT) => [$1, 1.23.0-SNAPSHOT)
      // this will be used to keep the lower range boundary of the previous
      // release version.
      Matcher m = VERSION_RANGE_PATTERN.matcher(replaceWith);
      if (m.matches()) {
        replaceWith = replaceWith.replace(m.group(1), "$1");
      }
      // TODO: check if no invalid version range will be generated by wrapping version ranges
      s = CONTRIBUTOR_VERSION_PATTERN.matcher(s).replaceAll(replaceWith);
    } else {
      saveFile(file, encoding, (String) s);
      MvnClient.execute(file.getParentFile(), "versions:resolve-ranges", "-U", "-DgenerateBackupPoms=false");
      s = readFile(file, encoding);
    }
    return s;
  }

  public static void main(String[] args) throws IOException {
    if (args.length < 4) {
      throw new RuntimeException(
          "usage: <root-dir> <from-version> <to-version>");
    }

    updateVersion(new File(args[0]), args[1], args[2], null, args[3]);
  }
}
