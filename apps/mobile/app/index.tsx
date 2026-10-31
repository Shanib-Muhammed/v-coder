import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowUp, Bot, Boxes, Braces, Check, ChevronRight, CirclePlus, Cloud, Code2, Github, Globe2, Home, Layers3, Plug, Settings2, Sparkles, UserRound, Zap } from "lucide-react-native";

type Tab = "Home" | "Projects" | "Editor" | "Connect" | "Profile";
const tabs: { label: Tab; Icon: typeof Home }[] = [
  { label: "Home", Icon: Home }, { label: "Projects", Icon: Layers3 }, { label: "Editor", Icon: Braces }, { label: "Connect", Icon: Plug }, { label: "Profile", Icon: UserRound },
];
const projects = [
  { name: "Portfolio website", detail: "React · Updated 2 hours ago", mark: "P", color: "#A78BFA" },
  { name: "Storefront concept", detail: "Next.js · Updated yesterday", mark: "S", color: "#5EEAD4" },
];
const connections = [
  { name: "Google", detail: "Sign in to V-Coder", Icon: Sparkles, required: true },
  { name: "GitHub", detail: "Repositories, commits and branches", Icon: Github, required: true },
  { name: "Supabase", detail: "Database, auth and storage", Icon: Boxes, required: true },
  { name: "Vercel", detail: "Deploy and manage websites", Icon: TriangleMark, required: true },
  { name: "AI provider", detail: "Connect an API key or free model", Icon: Bot, required: true },
];
function TriangleMark({ color = "#fff", size = 22 }: { color?: string; size?: number }) {
  return <Text style={{ color, fontSize: size, fontWeight: "900" }}>▲</Text>;
}
function Pill({ children, green = false }: { children: React.ReactNode; green?: boolean }) {
  return <View style={[styles.pill, green && styles.pillGreen]}>{children}</View>;
}
function SectionTitle({ children, action }: { children: string; action?: string }) {
  return <View style={styles.sectionHead}><Text style={styles.sectionTitle}>{children}</Text>{action ? <Text style={styles.link}>{action}</Text> : null}</View>;
}
export default function HomeScreen() {
  const [tab, setTab] = useState<Tab>("Home");
  const [prompt, setPrompt] = useState("");
  const [sentPrompt, setSentPrompt] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("Choose model");
  const title = useMemo(() => ({ Home: "Build something
remarkable.", Projects: "Your projects.", Editor: "AI workspace.", Connect: "Your connections.", Profile: "Your account." }[tab]), [tab]);
  const submit = () => { if (prompt.trim()) { setSentPrompt(prompt.trim()); setTab("Editor"); setPrompt(""); } };
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#17152A", "#090A0F", "#090A0F"]} locations={[0, 0.34, 1]} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <View style={styles.brand}><View style={styles.brandMark}><Code2 color="#fff" size={19}/></View><Text style={styles.brandText}>v-coder</Text><Pill><Text style={styles.pillText}>BETA</Text></Pill></View>
        <Pressable style={styles.iconButton} onPress={() => setTab("Profile")}><Settings2 color="#D8D7E2" size={20}/></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.eyebrow}><Sparkles color="#B9A6FF" size={14}/><Text style={styles.eyebrowText}>YOUR AI DEVELOPMENT STUDIO</Text></View>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.subtitle}>{tab === "Home" ? "Describe your idea. V-Coder plans, codes, tests and ships it with you." : tab === "Editor" ? "Your cloud coding workspace, built for your phone." : tab === "Connect" ? "Connect the services that power your projects." : tab === "Projects" ? "Pick up where you left off, or start fresh." : "Manage your V-Coder experience."}</Text>
        {tab === "Home" ? <>
          <BlurView intensity={35} tint="dark" style={styles.promptCard}>
            <Text style={styles.promptLabel}>WHAT SHOULD WE BUILD?</Text>
            <TextInput value={prompt} onChangeText={setPrompt} multiline placeholder="Create a modern portfolio with 3D animations, a contact form and an admin dashboard..." placeholderTextColor="#777887" style={styles.promptInput}/>
            <View style={styles.promptFooter}><Pressable style={styles.modelButton} onPress={() => setSelectedProvider(selectedProvider === "Choose model" ? "Gemini · Free tier" : "Choose model")}><Bot color="#B9A6FF" size={15}/><Text style={styles.modelText}>{selectedProvider}</Text><ChevronRight color="#858596" size={14}/></Pressable><Pressable style={styles.sendButton} onPress={submit}><ArrowUp color="#111018" size={20}/></Pressable></View>
          </BlurView>
          <View style={styles.quickRow}><Pill><Zap color="#C7B5FF" size={12}/><Text style={styles.pillText}>Autonomous agent</Text></Pill><Pill><Cloud color="#C7B5FF" size={12}/><Text style={styles.pillText}>Cloud workspace</Text></Pill></View>
          <SectionTitle action="See all">Recent projects</SectionTitle>
          {projects.map(p => <Pressable key={p.name} style={styles.projectCard} onPress={() => { setSentPrompt("Continue working on " + p.name); setTab("Editor"); }}><View style={[styles.projectIcon,{backgroundColor:p.color+"22"}]}><Text style={{color:p.color,fontSize:20,fontWeight:"800"}}>{p.mark}</Text></View><View style={{flex:1}}><Text style={styles.cardTitle}>{p.name}</Text><Text style={styles.cardDetail}>{p.detail}</Text></View><ChevronRight color="#777887" size={18}/></Pressable>)}
          <SectionTitle>How V-Coder works</SectionTitle>
          <View style={styles.stepsCard}><Step number="01" title="Describe" detail="Tell the AI what you want to create."/><Step number="02" title="Build & test" detail="The agent edits files and checks its work."/><Step number="03" title="Publish" detail="Push to GitHub and deploy with Vercel."/></View>
        </> : null}
        {tab === "Projects" ? <><Pressable style={styles.primaryButton} onPress={() => setTab("Home")}><CirclePlus color="#100F18" size={18}/><Text style={styles.primaryButtonText}>New project</Text></Pressable>{projects.map(p => <View key={p.name} style={styles.projectCard}><View style={[styles.projectIcon,{backgroundColor:p.color+"22"}]}><Text style={{color:p.color,fontSize:20,fontWeight:"800"}}>{p.mark}</Text></View><View style={{flex:1}}><Text style={styles.cardTitle}>{p.name}</Text><Text style={styles.cardDetail}>{p.detail}</Text></View><ChevronRight color="#777887" size={18}/></View>)}</> : null}
        {tab === "Editor" ? <><View style={styles.workspaceCard}><View style={styles.workspaceTop}><View style={styles.liveDot}/><Text style={styles.cardDetail}>CLOUD WORKSPACE · READY FOR SETUP</Text></View><Text style={styles.cardTitle}>Let's build your idea</Text><Text style={styles.cardDetail}>{sentPrompt || "Your project instructions and agent activity will appear here."}</Text><View style={styles.agentNotice}><Bot color="#B9A6FF" size={18}/><Text style={styles.agentNoticeText}>Autonomous agent tools will be enabled after backend setup.</Text></View></View><Pressable style={styles.primaryButton} onPress={() => setTab("Connect")}><Plug color="#100F18" size={18}/><Text style={styles.primaryButtonText}>Set up integrations</Text></Pressable></> : null}
        {tab === "Connect" ? <><View style={styles.infoBanner}><Text style={styles.infoTitle}>5 required connections</Text><Text style={styles.cardDetail}>Connect each service before starting your first cloud build. OAuth and secret storage will be wired in the backend milestone.</Text></View>{connections.map(c => <View key={c.name} style={styles.connectionCard}><View style={styles.connectionIcon}><c.Icon color="#D6CBFF" size={20}/></View><View style={{flex:1}}><Text style={styles.cardTitle}>{c.name}</Text><Text style={styles.cardDetail}>{c.detail}</Text></View><Pill><Text style={styles.pillText}>Pending</Text></Pill></View>)}</> : null}
        {tab === "Profile" ? <><View style={styles.profileCard}><View style={styles.avatar}><UserRound color="#D6CBFF" size={26}/></View><Text style={styles.cardTitle}>Welcome to V-Coder</Text><Text style={styles.cardDetail}>Sign in with Google to sync projects and connections.</Text><Pressable style={styles.primaryButton} onPress={() => setTab("Connect")}><Text style={styles.primaryButtonText}>Set up account</Text></Pressable></View><SectionTitle>Preferences</SectionTitle><View style={styles.projectCard}><Text style={styles.cardTitle}>Theme</Text><Text style={styles.cardDetail}>Dark · Liquid Glass</Text></View><View style={styles.projectCard}><Text style={styles.cardTitle}>AI autonomy</Text><Text style={styles.cardDetail}>Autonomous with permission controls</Text></View></> : null}
      </ScrollView>
      <View style={styles.navWrap}><BlurView intensity={65} tint="dark" style={styles.nav}>{tabs.map(({label,Icon}) => <Pressable key={label} onPress={() => setTab(label)} style={styles.navItem}><Icon color={tab === label ? "#C7B5FF" : "#777887"} size={19}/><Text style={[styles.navText,tab === label && styles.navTextActive]}>{label}</Text>{tab === label ? <View style={styles.navIndicator}/> : null}</Pressable>)}</BlurView></View>
    </SafeAreaView>
  );
}
function Step({number,title,detail}:{number:string;title:string;detail:string}) { return <View style={styles.step}><Text style={styles.stepNumber}>{number}</Text><View style={{flex:1}}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardDetail}>{detail}</Text></View></View>; }
const styles = StyleSheet.create({
 safe:{flex:1,backgroundColor:"#090A0F"},header:{height:58,paddingHorizontal:20,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},brand:{flexDirection:"row",alignItems:"center",gap:9},brandMark:{width:31,height:31,borderRadius:10,backgroundColor:"#7256C9",alignItems:"center",justifyContent:"center"},brandText:{color:"#F7F5FF",fontSize:19,fontWeight:"800",letterSpacing:-.7},pill:{flexDirection:"row",alignItems:"center",gap:5,borderWidth:1,borderColor:"#373343",backgroundColor:"#201C2C",borderRadius:30,paddingHorizontal:9,paddingVertical:5},pillGreen:{backgroundColor:"#153326",borderColor:"#245D42"},pillText:{color:"#C7B5FF",fontSize:9,fontWeight:"700",letterSpacing:.5},iconButton:{width:38,height:38,borderRadius:14,backgroundColor:"#FFFFFF0D",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"#FFFFFF12"},content:{paddingHorizontal:20,paddingTop:17,paddingBottom:125},eyebrow:{flexDirection:"row",alignItems:"center",gap:7,marginBottom:13},eyebrowText:{color:"#B9A6FF",fontSize:10,fontWeight:"800",letterSpacing:1.4},heroTitle:{fontSize:38,lineHeight:43,fontWeight:"800",letterSpacing:-1.6,color:"#F7F5FF"},subtitle:{color:"#9696A6",fontSize:14,lineHeight:21,marginTop:11,marginBottom:24,maxWidth:330},promptCard:{borderRadius:24,overflow:"hidden",padding:17,borderWidth:1,borderColor:"#FFFFFF20",backgroundColor:"#FFFFFF0D"},promptLabel:{color:"#B9A6FF",fontSize:10,fontWeight:"800",letterSpacing:1.2},promptInput:{minHeight:116,color:"#F4F1FF",fontSize:15,lineHeight:23,textAlignVertical:"top",paddingTop:14},promptFooter:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},modelButton:{flexDirection:"row",alignItems:"center",gap:7,backgroundColor:"#FFFFFF0B",borderRadius:20,paddingHorizontal:10,paddingVertical:8},modelText:{color:"#C8C5D5",fontSize:11},sendButton:{width:39,height:39,borderRadius:14,backgroundColor:"#C7B5FF",alignItems:"center",justifyContent:"center"},quickRow:{flexDirection:"row",gap:8,marginTop:12,marginBottom:28},sectionHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:12,marginTop:9},sectionTitle:{color:"#F0EEF8",fontSize:16,fontWeight:"700",letterSpacing:-.3},link:{color:"#B9A6FF",fontSize:12,fontWeight:"600"},projectCard:{flexDirection:"row",alignItems:"center",gap:12,padding:13,backgroundColor:"#FFFFFF08",borderRadius:17,borderWidth:1,borderColor:"#FFFFFF10",marginBottom:9},projectIcon:{width:43,height:43,borderRadius:14,alignItems:"center",justifyContent:"center"},cardTitle:{color:"#F0EEF8",fontSize:13,fontWeight:"700"},cardDetail:{color:"#9292A2",fontSize:11,lineHeight:17,marginTop:4},stepsCard:{padding:15,borderRadius:18,backgroundColor:"#FFFFFF08",borderWidth:1,borderColor:"#FFFFFF10"},step:{flexDirection:"row",gap:13,paddingVertical:10},stepNumber:{color:"#B9A6FF",fontSize:12,fontWeight:"800",paddingTop:2},navWrap:{position:"absolute",bottom:0,left:0,right:0,paddingHorizontal:12,paddingBottom:8},nav:{flexDirection:"row",justifyContent:"space-around",borderRadius:23,overflow:"hidden",paddingTop:12,paddingBottom:10,borderWidth:1,borderColor:"#FFFFFF20",backgroundColor:"#15151FCC"},navItem:{alignItems:"center",gap:5,minWidth:52},navText:{color:"#777887",fontSize:9,fontWeight:"600"},navTextActive:{color:"#C7B5FF"},navIndicator:{width:14,height:3,borderRadius:2,backgroundColor:"#B9A6FF"},primaryButton:{height:49,borderRadius:15,backgroundColor:"#C7B5FF",alignItems:"center",justifyContent:"center",flexDirection:"row",gap:8,marginBottom:15},primaryButtonText:{color:"#171321",fontWeight:"800",fontSize:13},workspaceCard:{padding:17,borderRadius:20,backgroundColor:"#FFFFFF09",borderWidth:1,borderColor:"#FFFFFF16",marginBottom:15},workspaceTop:{flexDirection:"row",alignItems:"center",gap:8,marginBottom:20},liveDot:{width:7,height:7,borderRadius:5,backgroundColor:"#63D69A"},agentNotice:{flexDirection:"row",alignItems:"center",gap:9,backgroundColor:"#B9A6FF12",padding:12,borderRadius:13,marginTop:18},agentNoticeText:{color:"#C5BDD9",fontSize:11,flex:1,lineHeight:16},infoBanner:{padding:15,borderRadius:17,backgroundColor:"#B9A6FF12",borderWidth:1,borderColor:"#B9A6FF30",marginBottom:15},infoTitle:{color:"#E9E2FF",fontSize:14,fontWeight:"800",marginBottom:5},connectionCard:{flexDirection:"row",alignItems:"center",gap:11,padding:13,backgroundColor:"#FFFFFF08",borderRadius:16,borderWidth:1,borderColor:"#FFFFFF10",marginBottom:9},connectionIcon:{width:40,height:40,borderRadius:13,backgroundColor:"#B9A6FF16",alignItems:"center",justifyContent:"center"},profileCard:{alignItems:"center",padding:22,borderRadius:20,backgroundColor:"#FFFFFF09",borderWidth:1,borderColor:"#FFFFFF15",marginBottom:25},avatar:{width:62,height:62,borderRadius:22,backgroundColor:"#B9A6FF20",alignItems:"center",justifyContent:"center",marginBottom:13,marginTop:4}
});
