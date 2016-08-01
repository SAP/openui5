package com.sap.ui5.tools.infra.git2p4.commands.relnotes;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import org.w3c.dom.Document;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.stream.JsonReader;
import com.sap.ui5.tools.infra.git2p4.Git2P4Main.Context;
import com.sap.ui5.tools.infra.git2p4.Git2P4Main.Mapping;
import com.sap.ui5.tools.infra.git2p4.GitClient;
import com.sap.ui5.tools.infra.git2p4.GitClient.Commit;
import com.sap.ui5.tools.infra.git2p4.Log;
import com.sap.ui5.tools.infra.git2p4.commands.relnotes.CommitMsgAnalyzer.CSS;
import com.sap.ui5.tools.maven.Version;

/**
 * Command object that implements the "prepare release notes" command.
 * 
 * @author Frank Weigel
 * @since 1.13.1
 */
public class ReleaseNotes {

  public ReleaseNotes() {
  }
  
  private Context context;
  private List<String> relNotes;
  private Mapping currentRepository;
  private boolean isNewNote;
  private ProcessCommand processCommand = null;
  private File previousChanges;
  
  public interface ProcessCommand 
  {
    public void execute(File file, String lib) throws IOException;
  }

  public void execute(Context context) throws IOException { 
    
    this.context = context;
    
    fixes = new ArrayList<GitClient.Commit>();
    Set<String> untouched = new HashSet<String>();
    // filter out infrastructure commits
    for(GitClient.Commit commit : context.allCommits) {
      String desc = commit.getOriginalCommit().getSummary();
      if ( desc.matches("^\\s*(Release\\s*:.*|Infra\\s*:.*|VERSION CHANGE ONLY\\s*)$") || (context.fixOrFeatureOnly && !FIXORFEATURE.matcher(desc).find()) || INTERNAL.matcher(desc).find() ) {
        continue;
      }
      fixes.add(commit);
      untouched.add(commit.getId());
    }
    
    Collections.sort(fixes, new Comparator<GitClient.Commit>() {
      @Override
      public int compare(Commit o1, Commit o2) {
        String s1 = o1.getOriginalCommit().getSummary(); 
        String s2 = o2.getOriginalCommit().getSummary(); 
        return s1.compareTo(s2);
      }
    });

    version = adjustDevVersion(context.version);
    relNotesPerLibrary();
    
    relNotes = new ArrayList<String>(512);
    relNotes.add("");
    relNotes.add("== Version " + version + " (" + new SimpleDateFormat("MMMM yyyy", Locale.ENGLISH).format(new Date()) + ") ==");
    relNotes.add("");
    relNotes.add("A patch for the " + context.branch + " code line. It contains the following fixes for the UI5 Core and Controls:");
    relNotes.add("");
    // _filterLog("Fixes", fixes, untouched);
    _filterLog("Core", fixes, untouched, "src/framework", "src/sap.ui.core");
    _filterLog("Desktop", fixes, untouched, "src/sap.ui.layout", "src/sap.ui.commons", "src/sap.ui.table/", "src/sap.ui.ux3/");
    _filterLog("Mobile", fixes, untouched, "src/sap.m/", "src/libraries/_sap.me/", "src/libraries/_sap.makit/");
    _filterLog("Charts", fixes, untouched, "src/libraries/_sap.viz/", "src/libraries/_sap.viz.gen/");
    _filterLog("Inbox", fixes, untouched, "src/libraries/_sap.uiext.inbox/");
    if ( !untouched.isEmpty() ) {
      _filterLog("Others", fixes, null, untouched);
    }
    
    Log.println("");
    Log.println("---- 8< --------------------------------------------------------------------------");
    Log.println("");
    for(String line : relNotes) {
      Log.println(line);
    }
    Log.println("");
    Log.println("---- 8< --------------------------------------------------------------------------");
    Log.println("");
  }

  private Version adjustDevVersion(Version version) {
    if ((version.minor % 2) == 0) {
      return new Version(version.major,  version.minor , version.patch, null);  
    }else{
      return new Version(version.major,  version.minor + 1, 0, null);
    }
  }
  
  private void gatherFromPreviousCodelines(File repoFile) throws IOException {
    previousChanges = new File (context.git.getRepository().getParentFile(), "PreviousChanges");
    if (previousChanges.exists()) {
      deleteFolder(previousChanges);
    }
    int currentMinor = Integer.parseInt(context.branch.substring(6));
    for (int i = context.lowestMinor; i < currentMinor; i += 2) {
      checkoutRel(i);
      scan(repoFile);
    }
    checkoutRel(currentMinor);
  }

  private void checkoutRel(int minor) throws IOException {
    version = new Version(version.major,  minor, version.patch, null);
    context.branch = "rel-1." + minor;
    context.git.checkout("origin/" + context.branch);
  }
  
  private void relNotesPerLibrary() throws IOException {
    for (Mapping repo : context.mappings) {
      currentRepository = repo;
      context.git.setRepository(repo.getRepository());
      isNewNote = false;
      processCommand = new GatherPreviousNotesCommand();
      gatherFromPreviousCodelines(repo.getRepository());
      processCommand = new GatherNotesCommand();
      scan(repo.getRepository());
      if (haveNewNotes()) {
        context.git.addAll();
        context.git.commit("[INTERNAL] Release notes for version " + version);
        if (!context.preview) {
          context.git.push(repo.giturl, "HEAD:refs/for/" + context.branch);
        }
      }
    }
  }
  
  private boolean haveNewNotes() throws IOException {
    List<String> status = context.git.status();
    return status.size() > 1 || (status.size() == 1 && !status.get(0).equals(".version-tool.xml"));
  }

  private void deleteFolder(File folder) {
    File list[] = folder.listFiles();
    for (File file: list) {
      if (file.isDirectory()){
        deleteFolder(file);
      }
      else {
        file.delete();
      }
    }
    folder.delete();
  }

  private void scan(File file) throws IOException {
    if (file.isDirectory()){
      for (File subFile: file.listFiles()){
        scan(subFile);
      }
    } else {
      if (".library".equals(file.getName())||".theme".equals(file.getName())){
        processLibrary(file);
      }
    }
  }
  
  public Set<String> getFilterIds(String...paths) throws IOException {
    Log.println("Filtering commits for " + Arrays.toString(paths));
    Set<String> filter = new HashSet<String>();
    context.git.log(currentRepository.range, false, paths);
    filter.addAll(context.git.getLastCommits().keySet());
    return filter;
  }

  private void processLibrary(File file) throws IOException {
    Matcher m = LIBSRC.matcher(file.getCanonicalPath());
    if (m.find()){
      String lib = m.group();
      if(filterLibraryFiles(lib)){
        Log.println("Processing library file: '" + file + "' with sources: " + lib);
        processCommand.execute(getNotesFile(file), lib);
      }
    }
  }

  private boolean filterLibraryFiles(String lib) {
    return !lib.contains("archetypes") && !lib.contains("_build_helper_plugin");
  }

  public class GatherPreviousNotesCommand implements ProcessCommand 
  {
    public void execute(File file, String lib) throws IOException 
    {
      String libName = getLibName(lib);
      Log.println("Processing change log file: " + file + ",lib " + libName);
      if (file == null){
        Log.println("no change log defined for library " + libName);
      }
      else if (file.exists()){
        File dest = new File(previousChanges, libName);
        if (!dest.exists()) {
          dest.mkdirs();
        }
        Files.copy(file.toPath(), (new File(dest,file.getName())).toPath(),  StandardCopyOption.REPLACE_EXISTING);
      }
      else {
        Log.println("WARNING: Change log file: " + file + " doesn't exist!");
      }
    }
  }
  
  private String getLibName(String lib) {
    return lib.substring(lib.lastIndexOf("\\") + 1);
  }
  
  public class GatherNotesCommand implements ProcessCommand 
  {
    public void execute(File file, String lib) throws IOException 
    {
      if (file == null){
        Log.println("No change log defined for library " + lib);
        return;
      }
      UILibNotes uiLibraryNotes = file.exists() ? readUILibNotes(file) : createNewUILibNotes();
      if (uiLibraryNotes == null){
        Log.println("Skipping library: '" + lib);
        return;
      }
      LibVersion uiLibVersion = uiLibraryNotes.getLibVersion(version);
      int notesSizeBefore = uiLibVersion.notes.size();
      Set<String> filter; 
      //Special case for platform library sources
      if (lib.endsWith("_resource")){
        filter = getFilterIds("src/framework/_resource", "src/framework/_shared_utils", "src/framework/_utils", "src/framework/_core" );
      }
      else {
        filter = getFilterIds(lib);
      }
      Log.println(filter);
      if (filter.size() > 0){
        for (GitClient.Commit commit: fixes){
          if (filter.contains(commit.getId()) || filter.contains(commit.getOriginalCommit().getId())){
            processCommit(uiLibVersion, commit);
          }
        }
      }
      if (uiLibVersion.notes.size() > notesSizeBefore){
        saveToFile(uiLibraryNotes, file);
      } else {
        Log.println("No new notes found for '" + lib + "' library");
      }
      copyPrevNotes(file.getParentFile(), lib);
    }    
  }

  private void processCommit(LibVersion uiLibVersion, GitClient.Commit commit) {
    Log.println("Process commit:" + commit.getId());
    CommitMsgAnalyzer msg = new CommitMsgAnalyzer(commit.getOriginalCommit());
    ReleaseNote releaseNote = new ReleaseNote();
    releaseNote.type = msg.getType();
    releaseNote.text = msg.getText();
    releaseNote.author = commit.getOriginalCommit().getAuthor();
    releaseNote.id = commit.getOriginalCommit().getId();
    releaseNote.references = msg.getReferences(); 
    uiLibVersion.notes.add(releaseNote);
  }

  public void copyPrevNotes(File dest, String lib) throws IOException {
    String libName = getLibName(lib);
    File prevNotes = new File(previousChanges, libName);
    if (prevNotes.exists()) {
      File files[] = prevNotes.listFiles();
      for (File file : files)
      {
        Files.copy(file.toPath(), (new File(dest, file.getName())).toPath(), StandardCopyOption.REPLACE_EXISTING);
      }
    }
  }

  private void saveToFile(UILibNotes uiLibraryNotes, File notesFile) throws IOException {
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String json = gson.toJson(uiLibraryNotes.versions);
    notesFile.getParentFile().mkdirs();
    FileWriter fw = new FileWriter(notesFile);
    fw.write(json);
    fw.close();
    Log.println(json);
    isNewNote = true;
  }

  private File getNotesFile(File file) throws IOException {
    XPath xpath = XPathFactory.newInstance().newXPath();
    try {
      Document doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new FileInputStream(file));
      String relNotesFile = xpath.evaluate("/" + file.getName().substring(1) + "/appData/releasenotes/@url", doc, XPathConstants.STRING).toString();
      if ("".equals(relNotesFile)){
        return null;
      }
      //special case for platform library
      if (!relNotesFile.contains("/sap/ui/server/java/")){
        Map<String, String> resourcesMap = new HashMap<String, String>();
        String addToRelNotesPath = ""; 
        if (file.getAbsolutePath().contains(File.separator+"main"+File.separator+"uilib"+File.separator)){
          resourcesMap.put("/test-resources/", "/src/test/uilib/");
          resourcesMap.put("/resources/", "/src/main/uilib/");
          addToRelNotesPath = "../../";
        } else {
          resourcesMap.put("/resources/", "/src/");
          resourcesMap.put("/test-resources/", "/test/");
        }
        for (String key: resourcesMap.keySet()){
          relNotesFile = relNotesFile.replace(key, resourcesMap.get(key));
        }
        relNotesFile = addToRelNotesPath + relNotesFile;
      }
      return new File(file.getParentFile(), relNotesFile.replace("{major}", version.major+"").replace("{minor}", version.minor+"").replace("{patch}", version.patch+""));
    } catch (Exception e) {
      throw new IOException(e);
    }
  }

  private UILibNotes readUILibNotes(File notesFile) throws IOException {
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String json = "{ versions: " + readFile(notesFile.getAbsolutePath()) + "}";
    UILibNotes uiLibNotes = gson.fromJson(new JsonReader(new StringReader(json)), UILibNotes.class);
    return uiLibNotes;
  }

  String readFile(String fileName) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(fileName));
    try {
        StringBuilder sb = new StringBuilder();
        String line = br.readLine();

        while (line != null) {
            sb.append(line);
            sb.append("\n");
            line = br.readLine();
        }
        return sb.toString();
    } finally {
        br.close();
    }
}
  
  private UILibNotes createNewUILibNotes() {
    UILibNotes uiLibraryNotes = new UILibNotes();
    return uiLibraryNotes;
  }

  private void _filterLog(String caption, List<GitClient.Commit> commits, Set<String> untouched, String ... paths) throws IOException {
    Set<String> filter = null;
    if ( paths != null && paths.length > 0 ) {
      filter = context.getCommits(paths);
    }
    _filterLog(caption, commits, untouched, filter);
  }

  private void _filterLog(String caption, List<GitClient.Commit> commits, Set<String> untouched, Set<String> filter) throws IOException {
    
    boolean header = false;
    
    for(GitClient.Commit commit : commits) {
      if ( filter != null && !filter.contains(commit.getId()) && !filter.contains(commit.getOriginalCommit().getId() )) {
        continue;
      }
      if ( untouched != null ) {
        untouched.remove(commit.getId());
      }
      
      if ( !header ) {
        if ( context.htmlOutput ) {
          renderHtmlBeginSection(caption);
        } else {
          renderWikiBeginSection(caption);
        }
        header = true;
      }

      Commit originalCommit = commit.getOriginalCommit();
      CommitMsgAnalyzer msg = new CommitMsgAnalyzer(originalCommit);

      if ( context.htmlOutput ) {
        renderHtml(msg);
      } else {
        renderWiki(msg);
      }
    }

    if ( header ) {
      if ( context.htmlOutput ) {
        renderHtmlEndSection();
      } else {
        renderWikiEndSection();
      }
    }
  }

  private void renderWikiBeginSection(String caption) {
    relNotes.add("'''" + caption + "'''[[BR]]");
  }
  
  private void renderWikiEndSection() { 
    relNotes.add("");
  }
  
  private void renderWiki(CommitMsgAnalyzer msg) throws IOException {
    Pattern csnPrefix = Pattern.compile("(?:CSN|CSS|OSS)[:\\s]+([- 0-9]+[0-9])(?:[-:\\s(]+|$)");
    Pattern wikiTag = Pattern.compile("\\b[A-Z][a-z0-9_]+([A-Z][a-z0-9_]+)+\\b");
    
    String summary = wikiTag.matcher(msg.getSummary()).replaceAll("!$0");
    List<CSS> tickets = msg.getCSSes();
    if ( tickets != null && !tickets.isEmpty() ) {
      summary += " [[span((fixes ";
      boolean firstticket=true;
      for(CSS css : tickets) {
        if ( firstticket ) {
          firstticket = false;
        } else {
          summary += ", ";
        }
        if ( css.isComplete() ) {
          summary = summary + "[css:" + css.csinsta + ":" + css.mnumm + ":" + css.myear + " CSS " + css.mnumm + "]";
        } else {
          summary = summary + "CSS " + css.mnumm;
        }
      }
      summary += "), class=sapinternal)]]";
    }
    relNotes.add(" * " + summary);
    
    List<String> publicBody = msg.getBody();
    if ( context.includeCommitDetails && publicBody != null && !publicBody.isEmpty() ) {
      relNotes.add("");
      for(int i=0; i<publicBody.size(); i++) {
        String line = publicBody.get(i);
        Matcher m = BULLET.matcher(line);
        if ( m.find() ) {
          int indent = m.group(0).length(); 
          line = " * " + line.substring(indent); // add indent
          while ( i+1<publicBody.size() && getIndent(publicBody.get(i+1)) >= indent ) {
            i++;
            line = line + " " + publicBody.get(i).replaceFirst("^\\s*", "");
          }
        }
        //line = BULLET.matcher(line).replaceAll(" * ");
        line = csnPrefix.matcher(line).replaceAll("[[span((CSN $1) -, class=sapinternal)]] ");
        line = wikiTag.matcher(line).replaceAll("!$0");
        relNotes.add("   " + line);
      }
    }
  }

  private void renderHtmlBeginSection(String caption) {
    relNotes.add("'''" + caption + "'''[[BR]]");
    relNotes.add("{{{");
    relNotes.add("#!html");
    relNotes.add("<ul>");
  }
  
  private void renderHtmlEndSection() { 
    relNotes.add("</ul>");
    relNotes.add("}}}");
  }
  
  private void renderHtml(CommitMsgAnalyzer msg) throws IOException {
    String summary = msg.getSummary();
    List<CSS> tickets = msg.getCSSes();
    if ( tickets != null && !tickets.isEmpty() ) {
      summary += " <span class=\"sapinternal\">(fixes ";
      boolean firstticket=true;
      for(CSS css : tickets) {
        if ( firstticket ) {
          firstticket = false;
        } else {
          summary += ", ";
        }
        if ( css.isComplete() ) {
          summary = summary + "<a href=\"https://gtp.wdf.sap.corp/sap/bc/webdynpro/qce/msg_gui_edit?sap-language=EN&csinsta=" + css.csinsta + "&mnumm=" + css.mnumm + "&myear=" + css.myear + "\">CSS " + css.mnumm + "</a>";
        } else {
          summary = summary + "CSS " + css.mnumm;
        }
      }
      summary += ")</span>";
    }
    
    List<String> details = msg.getPublicBody();
    
    if ( context.includeCommitDetails && details != null && !details.isEmpty() ) {
      
      relNotes.add("<li class=\"sapCommit\">" + summary + "<span class=\"sapCommitMore\"></span>"); // don't close <li>

      relNotes.add("<p class=\"sapCommitDetails\">");
      
      boolean ul=false;
      
      for(int i=0; i<details.size(); i++) {
        String line = details.get(i);
        Matcher m = BULLET.matcher(line);
        if ( m.find() ) {
          int indent = m.group(0).length(); 
          line = "<li>" + line.substring(indent); // add indent
          while ( i+1<details.size() && getIndent(details.get(i+1)) >= indent ) {
            i++;
            line = line + " " + details.get(i).replaceFirst("^\\s*", "");
          }
          if ( !ul ) {
            relNotes.add("<ul>");
            ul = true;
          }
        } else {
          if ( ul ) {
            relNotes.add("</ul>");
            ul = false;  
          }
        }
        line = makeCSSLinks(line);
        relNotes.add("   " + line);
      }
      
      if ( ul ) {
        relNotes.add("</ul>");
        ul = false;  
      }
      
      relNotes.add("</p></li>");
      
    } else {

      relNotes.add("<li class=\"sapCommit\">" + summary + "</li>");

    }
    
  }

  private static final String makeCSSLinks(String line) {
    Pattern csnPrefix = Pattern.compile("(?:CSN|CSS|OSS)[:\\s]+([- 0-9]+[0-9])(?:[-:\\s(]+|$)");
    return csnPrefix.matcher(line).replaceAll("<span class=\"sapinternal\">(CSN $1) -</span>");
  }
  
  private static int getIndent(String line) {
    if ( BULLET.matcher(line).find() ) {
      return -1;
    }
    Matcher m = INDENT.matcher(line);
    if ( m.find() ) {
      return m.group(0).length();
    }
    return -1;
  }
  
  private static final Pattern FIXORFEATURE = Pattern.compile("\\[\\s*(FIX|FEATURE)\\s*\\]", Pattern.CASE_INSENSITIVE);
  private static final Pattern INTERNAL = Pattern.compile("\\[\\s*INTERNAL\\s*\\]", Pattern.CASE_INSENSITIVE);
  private static final Pattern BULLET = Pattern.compile("^(\\s*)[-+*]");
  private static final Pattern INDENT = Pattern.compile("^(\\s*)");
  private static final Pattern LIBSRC = Pattern.compile("(\\Qsrc\\\\E.+)(?=\\Q\\src\\\\E)");
  
  private List<GitClient.Commit> fixes;
  private Version version;
  
  static class NoteRef{
    String type;
    String reference;
    public NoteRef(String type, String reference) {
      this.type = type;
      this.reference = reference;
    }
  }
  static class ReleaseNote {
    String id;
    String author;
    String type;
    String text;
    List<NoteRef> references;
  }
  static class LibVersion {
    String version;
    String date;
    List<ReleaseNote> notes = new ArrayList<ReleaseNote>();
  }
  static class UILibNotes {
    Map<String, LibVersion> versions = new HashMap<String, LibVersion>();
    public LibVersion getLibVersion(Version version) {
      LibVersion libVersion = versions.get(version.toString());
      if (libVersion == null) {
        libVersion = new LibVersion();
        versions.put(version.toString(), libVersion);
        libVersion.date = new SimpleDateFormat("MMMM yyyy", Locale.ENGLISH).format(new Date());
      }
      return libVersion;
    }
  }

}
