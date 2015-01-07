package com.sap.ui5.tools.infra.git2p4.commands.relnotes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.sap.ui5.tools.infra.git2p4.GitClient.Commit;
import com.sap.ui5.tools.infra.git2p4.commands.relnotes.ReleaseNotes.NoteRef;

class CommitMsgAnalyzer {
  
  private static final String BCP_REFTYPE = "BCP";
  private static final String GITHUB_REFTYPE = "GitHub";
  private static final Pattern FOOTER = Pattern.compile("^([a-zA-Z][a-zA-Z0-9_-]*)\\s*:\\s*(.*)$");
  private static final Pattern CSN_PREFIX = Pattern.compile("(?:CSN|CSS|OSS)[:\\s]+([- 0-9]+[0-9])(?:[-:\\s(]+|$)");
  private static final Pattern CSS_ID_MONOLITHIC = Pattern.compile("([0-9]{10})([0-9]{10})([0-9]{4})");
  private static final Pattern CSS_ID_SEPARATED = Pattern.compile("(?:([0-9]{1,10})\\s+)?([0-9]{1,10})(?:\\s+([0-9]{4}))?");
  private static final Pattern INTERNAL = Pattern.compile("\\[\\s*INTERNAL\\s*\\]", Pattern.CASE_INSENSITIVE);
  private static final Pattern TYPE_TEXT = Pattern.compile(".*\\[(.+)\\][ ]*(.+)[\"]*");
  private static final Pattern GITHUB_REF = Pattern.compile("github.com/SAP/openui5/issues/([0-9]+)");
  
  public static class CSS {
    
    public final String csinsta;
    public final String mnumm;
    public final String myear;
    
    CSS(String csninst, String mnumm, String myear) {
      this.csinsta = csninst != null && csninst.isEmpty() ? null : csninst;
      this.mnumm = mnumm.replaceAll("^0+", "");
      this.myear = myear != null && myear.isEmpty() ? null : myear;
    }
    
    public boolean isComplete() {
      return csinsta != null && mnumm != null && myear != null;
    }
    
    public boolean isSame(CSS other) {
      return 
          other.mnumm.equals(mnumm) 
          && (csinsta == null || other.csinsta == null || csinsta.equals(other.csinsta)) 
          && (myear == null || other.myear == null || myear.equals(other.myear))
          ;
    }

    public static CSS valueOf(String id) {
      id = id.trim();
      Matcher m = CSS_ID_MONOLITHIC.matcher(id);
      if ( m.matches() ) {
        return new CSS(m.group(1),m.group(2), m.group(3));
      }
      m = CSS_ID_SEPARATED.matcher(id);
      if ( m.matches() ) {
        if ( m.group(1) != null && m.group(2) != null && m.group(2).length() <= 4 && m.group(3) == null ) {
          return new CSS(null, m.group(1), m.group(2));
        } else if ( m.group(1) != null && m.group(2) == null && m.group(3) == null ) {
          return new CSS(null, m.group(1), null);
        } else {
          return new CSS(m.group(1),m.group(2), m.group(3));
        }
      }
      return new CSS(null, id, null); 
    }

  }

  private String summary;
  private List<String> body;
  private List<String> publicBody;
  private Map<String,Set<String>> footers = new HashMap<String,Set<String>>();
  private List<CSS> csses = new ArrayList<CSS>();
  private String type;
  private String text;
  private List<NoteRef> noteRefs = new ArrayList<NoteRef>();
  
  CommitMsgAnalyzer(Commit commit) {
    _analyzeMessage(commit.getMessageLines());
  }
  
  void _analyzeMessage(List<String> lines) {
    int i=0, l=lines.size();
    Matcher m;
    
    // find trailing relationship lines (like Change-Id or CR-Id)
    while ( l-1>i && ((m = FOOTER.matcher(lines.get(l-1))).matches() || lines.get(l-1).trim().isEmpty()) ) {
      if ( !lines.get(l-1).trim().isEmpty() ) {
        addFooter(m.group(1), m.group(2));
      }
      l--;
    }
    
    // extract summary
    summary = lines.get(i++);
    while ( i < l 
      && !lines.get(i).trim().isEmpty() 
      && lines.get(i).length() < lines.get(i-1).length() ) {  // weak heuristic to detected real continuation lines vs. forgotten empty lines
      summary += " " + lines.get(i++);
    }
    m = CSN_PREFIX.matcher(summary);
    while ( m.find() ) {
      addFooter("CSS", m.group(1));
    }
    summary = m.reset().replaceAll("");
    
    for (CSS css: csses){
      noteRefs.add(new NoteRef(BCP_REFTYPE, css.mnumm));
    }
    
    m = GITHUB_REF.matcher(summary);
    while ( m.find() ) {
      noteRefs.add(new NoteRef(GITHUB_REFTYPE, m.group(1)));
    }

    m = TYPE_TEXT.matcher(summary);
    if(m.find()){
      type = m.group(1).toUpperCase();
      text = m.group(2);
    }
    
    // skip an empty line (separator between summary and body) 
    if ( i<l && lines.get(i).trim().isEmpty() ) {
      i++;
    }

    if ( i<l ) {
      body = lines.subList(i, l);
    }
  }
  
  public String getType() {
    return this.type;
  }
  
  public String getText() {
    return this.text;
  }
  
  public String getSummary() {
    return summary;
  }
  
  public List<String> getBody() {
    return body;
  }

  public boolean hasPublicBody() {
    getPublicBody();
    return publicBody != null && !publicBody.isEmpty();
  }
  
  public List<String> getPublicBody() {

    if ( publicBody != null ) {
      return publicBody;
    }

    if ( body == null ) {
      return null;
    }

    int l=0;
    while ( l<body.size() && !INTERNAL.matcher(body.get(l)).find() ) {
      l++;
    }
    
    publicBody = body.subList(0, l);
    
    return publicBody;

  }
  
  private void addFooter(String rel, String data) {
    if ( rel.equals("CSS") ) {
      CSS css = CSS.valueOf(data);
      for(CSS other : csses) {
        if ( other.isSame(css) ) {
          return;
        }
      }
      csses.add(css);
      return;
    }
    Set<String> related = footers.get(rel); 
    if ( related == null ) {
      related = new LinkedHashSet<String>();
      footers.put(rel, related);
    }
    related.add(data);
  }

  public Set<String> getFooters(String rel) {
    return footers.get(rel); 
  }

  public List<CSS> getCSSes() {
    return csses; 
  }
  
  public List<NoteRef> getReferences(){
    return noteRefs;
    
  }

}
