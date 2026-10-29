import { Page, Section, Grid, Properties, Status, Segmented, Select, Button, Text, Fragment, useTheme, loadMode, saveMode, setCurrent } from "./shim";
import { useState, useEffect, useRef, useMemo } from "react";
import { D, MARKS, DEVICES, UNK, CAT, PAUSED, DET, UNK2, OBS_SNAP, OBS_NOTES, OBS_TOTAL, OBS_BOTS, OBS_PROCS } from "./data";
import type { P, ON } from "./data";
import baseOv from "./i18n/base-overrides.json";
import extraLangs from "./i18n/extra-langs.json";
import extraFill from "./i18n/extra-fill.json";
import newKeys from "./i18n/new-keys.json";
import obsUi from "./i18n/obsidian-ui.json";
import { OBS_CFG, OBS_EX, obsLink } from "./obsidian-adapter";
import { Projects, PROJECTS } from "./Projects";
import rmEN from "../README.md?raw";
import rmHU from "../docs/README.hu.md?raw";
import rmDE from "../docs/README.de.md?raw";
import rmFR from "../docs/README.fr.md?raw";
import rmPT from "../docs/README.pt.md?raw";
import rmIT from "../docs/README.it.md?raw";
import rmZH from "../docs/README.zh.md?raw";
import rmJA from "../docs/README.ja.md?raw";
import rmES from "../docs/README.es.md?raw";

export type { P };


// Languages: add a code here plus one entry per dictionary row (and a name column in D) to extend.
type L = "HU" | "EN" | "DE" | "FR" | "PT" | "IT" | "ZH" | "JA" | "ES";
const LANGS: L[] = ["HU", "EN", "DE", "FR", "PT", "IT", "ZH", "JA", "ES"];
const LNAME: Record<L, string> = { HU: "Magyar", EN: "English", DE: "Deutsch", FR: "Français", PT: "Português", IT: "Italiano", ZH: "中文", JA: "日本語", ES: "Español" };
// IT/ZH/JA/ES: partial machine translation; process names and sample texts fall back to English.
const PARTIAL: L[] = ["IT", "ZH", "JA", "ES"];
const NAME_COL: Record<L, number> = { HU: 1, EN: 2, DE: 3, FR: 4, PT: 5, IT: 2, ZH: 2, JA: 2, ES: 2 };
type Dict = Record<string, string[]>;
const UI: Dict = {
  title: ["Folyamat-dashboard", "Process dashboard", "Prozess-Dashboard", "Tableau de bord des processus", "Painel de processos"],
  summary: ["41 belső folyamat: állapot, ütemezés, botok. Adatok: (sample).", "41 internal processes: status, schedule, bots. Data as of (sample).", "41 interne Prozesse: Status, Zeitplan, Bots. Stand (sample).", "41 processus internes : statut, planning, bots. Données du (sample).", "41 processos internos: estado, agenda, bots. Dados de 2026-10-27 07:20 (locale)."],
  lang: ["Nyelv", "Language", "Sprache", "Langue", "Idioma"],
  view: ["Nézet", "View", "Ansicht", "Vue", "Vista"],
  clock: ["24 órás óra", "24-hour clock", "24-Stunden-Uhr", "Horloge 24 h", "Relógio de 24 h"],
  net: ["Bot–folyamat hálózat", "Bot–process network", "Bot-Prozess-Netz", "Réseau bots–processus", "Rede bots–processos"],
  metro: ["Metróvonalak", "Metro lines", "Metrolinien", "Lignes de métro", "Linhas de metro"],
  cards: ["Folyamatkártyák", "Process cards", "Prozesskarten", "Fiches processus", "Cartões de processo"],
  all: ["Összes", "All", "Alle", "Tous", "Todos"],
  allBots: ["Minden bot", "All bots", "Alle Bots", "Tous les bots", "Todos os bots"],
  status: ["Állapot", "Status", "Status", "Statut", "Estado"],
  problem: ["Probléma", "Issue", "Problem", "Problème", "Problema"],
  schedule: ["Időpont", "Schedule", "Zeitplan", "Planning", "Horário"],
  linked: ["Kapcsolt botok", "Linked bots", "Verknüpfte Bots", "Bots liés", "Bots ligados"],
  last: ["Utolsó futás", "Last run", "Letzter Lauf", "Dernière exécution", "Última execução"],
  note: ["Megjegyzés", "Note", "Hinweis", "Remarque", "Nota"],
  ws: ["Munkafolyam", "Workstream", "Arbeitsstrang", "Flux de travail", "Fluxo de trabalho"],
  zoomIn: ["Nagyítás", "Zoom in", "Vergrößern", "Zoom avant", "Ampliar"],
  zoomOut: ["Kicsinyítés", "Zoom out", "Verkleinern", "Zoom arrière", "Reduzir"],
  fit: ["Igazítás", "Fit", "Einpassen", "Ajuster", "Ajustar"],
  reset: ["Vissza", "Reset", "Zurücksetzen", "Réinitialiser", "Repor"],
  full: ["Teljes képernyő", "Full screen", "Vollbild", "Plein écran", "Ecrã inteiro"],
  exitFull: ["Kilépés (Esc)", "Exit (Esc)", "Beenden (Esc)", "Quitter (Échap)", "Sair (Esc)"],
  zoomHint: ["Görgő: oldal görgetése · Ctrl/Cmd + görgő, csippentés vagy +/−: nagyítás · húzás: mozgatás · botra kattintás: fókusz · élre kattintás: címke · Esc, háttérkattintás vagy Vissza: alaphelyzet", "Wheel: scroll page · Ctrl/Cmd + wheel, pinch or +/−: zoom · drag: pan · click a bot: focus · click an edge: label · Esc, background click or Reset: back", "Mausrad: Seite scrollen · Strg/Cmd + Mausrad, Pinch oder +/−: Zoom · Ziehen: Verschieben · Bot klicken: Fokus · Kante klicken: Beschriftung · Esc, Hintergrundklick oder Zurücksetzen: zurück", "Molette : défiler la page · Ctrl/Cmd + molette, pincement ou +/− : zoom · glisser : déplacer · clic sur un bot : focus · clic sur un lien : étiquette · Échap, clic sur le fond ou Réinitialiser : retour", "Roda: rolar a página · Ctrl/Cmd + roda, pinça ou +/−: zoom · arrastar: mover · clicar num bot: foco · clicar numa ligação: etiqueta · Esc, clique no fundo ou Repor: voltar"],
  blink: ["Villogás", "Blinking", "Blinken", "Clignotement", "Piscar"],
  red: ["Leállt / hibás", "Stopped / failed", "Gestoppt / fehlerhaft", "Arrêté / en échec", "Parado / com falha"],
  amber: ["Elavult / blokkolt", "Stale / blocked", "Veraltet / blockiert", "Obsolète / bloqué", "Desatualizado / bloqueado"],
  asOf: ["Állapot ekkor", "Status as of", "Stand", "État au", "Estado em"],
  now: ["most", "now", "jetzt", "maintenant", "agora"],
  legOwner: ["gazda bot", "owner bot", "verantwortlicher Bot", "bot responsable", "bot responsável"],
  legLinked: ["kapcsolt bot", "linked bot", "verknüpfter Bot", "bot lié", "bot ligado"],
  planned: ["tervezett", "planned", "geplant", "prévu", "planeado"],
  other: ["inaktív / szünetel", "inactive / paused", "inaktiv / pausiert", "inactif / en pause", "inativo / em pausa"],
  device: ["eszköz (nem bot)", "device (not a bot)", "Gerät (kein Bot)", "appareil (pas un bot)", "dispositivo (não é bot)"],
  procsOf: ["folyamatai", "processes", "Prozesse", "processus", "processos"],
  jumpCard: ["Ugrás a kártyára", "Jump to card", "Zur Karte", "Aller à la fiche", "Ir para o cartão"],
  edgeOwner: ["Gazda", "Owner", "Verantwortlich", "Responsable", "Responsável"],
  edgeLinked: ["Kapcsolt", "Linked", "Verknüpft", "Lié", "Ligado"],
  resource: ["erőforrás (nem bot)", "resource (not a bot)", "Ressource (kein Bot)", "ressource (pas un bot)", "recurso (não é bot)"],
  obsTitle: ["Obsidian Notes (Host A)", "Obsidian Notes (Host A)", "Obsidian Notes (Host A)", "Obsidian Notes (Host A)", "Obsidian Notes (Host A)"],
  obsLoc: ["Vault helye", "Vault location", "Vault-Speicherort", "Emplacement du coffre", "Localização do cofre"],
  obsOpen: ["Megnyitás", "How to open", "Öffnen", "Ouvrir", "Como abrir"],
  obsVault: ["Vault neve", "Vault name", "Vault-Name", "Nom du coffre", "Nome do cofre"],
  obsVaultTxt: ["<OBSIDIAN_VAULT> (ellenőrizve a Host A obsidian.json fájljában). A Notes ennek egy almappája.", "<OBSIDIAN_VAULT> (verified in the Host A's obsidian.json). Notes is a subfolder of it.", "<OBSIDIAN_VAULT> (geprüft in der obsidian.json des Host A). Notes ist ein Unterordner davon.", "<OBSIDIAN_VAULT> (vérifié dans le fichier obsidian.json du Host A). Notes en est un sous-dossier.", "<OBSIDIAN_VAULT> (verificado no obsidian.json do Host A). Notes é uma subpasta dele."],
  obsOpenTxt: ["Obsidian app a Host A gépen, link: obsidian://open?vault=<OBSIDIAN_VAULT>", "Obsidian app on the Host A, link: obsidian://open?vault=<OBSIDIAN_VAULT>", "Obsidian-App auf dem Host A, Link: obsidian://open?vault=<OBSIDIAN_VAULT>", "App Obsidian sur le Host A, lien : obsidian://open?vault=<OBSIDIAN_VAULT>", "App Obsidian no Host A, link: obsidian://open?vault=<OBSIDIAN_VAULT>"],
  obsLast: ["Utolsó karbantartás", "Last upkeep", "Letzte Pflege", "Dernier entretien", "Última manutenção"],
  obsLastTxt: ["10-26 21:31 – sikeres (Daily Notes upkeep, Coordinator-rutin)", "10-26 21:31 – succeeded (Daily Notes upkeep, Coordinator routine)", "10-26 21:31 – erfolgreich (Daily Notes upkeep, Coordinator-Routine)", "10-26 21:31 – réussi (Daily Notes upkeep, routine du Coordinator)", "10-26 21:31 – concluída com sucesso (Daily Notes upkeep, rotina do Coordinator)"],
  obsUsers: ["Olvassa / írja", "Read / written by", "Gelesen / geschrieben von", "Lu / écrit par", "Lido / escrito por"],
  obsUsersTxt: ["Notes / Obsidian (ír: Ops Bot, Coordinator) · Vendégcikk-pipeline (olvas, a cikkjegyzetek szerint). Más folyamatok: ismeretlen.", "Notes / Obsidian (writes: Ops Bot, Coordinator) · Guest article pipeline (reads, per article notes). Other processes: unknown.", "Notes / Obsidian (schreibt: Ops Bot, Coordinator) · Gastartikel-Pipeline (liest, laut Artikelnotizen). Andere Prozesse: unbekannt.", "Notes / Obsidian (écrit : Ops Bot, Coordinator) · Pipeline d’articles invités (lit, selon les notes d’articles). Autres processus : inconnu.", "Notes / Obsidian (escreve: Ops Bot, Coordinator) · Pipeline de artigos convidados (lê, segundo as notas). Outros processos: desconhecido."],
  cmdHead: ["Leírás / Parancs", "Description / Command", "Beschreibung / Befehl", "Description / Commande", "Descrição / Comando"],
  ownerSum: ["tulajdonos összefoglalója, nem szó szerinti utasítás; a későbbi utasítások dátummal a szövegben", "owner's summary, not verbatim; later orders dated in the text", "Zusammenfassung des Eigentümers, nicht wörtlich; spätere Anweisungen mit Datum im Text", "résumé du responsable, pas mot pour mot ; ordres ultérieurs datés dans le texte", "resumo do responsável, não literal; ordens posteriores datadas no texto"],
  more: ["több", "more", "mehr", "plus", "mais"],
  less: ["kevesebb", "less", "weniger", "moins", "menos"],
  saver: ["Költségtakarék – botleállító", "Költségtakarék – botleállító", "Költségtakarék – botleállító", "Költségtakarék – botleállító", "Költségtakarék – botleállító"],
  saverCap: ["A nem alap (kiterjesztett) folyamatok a kategória-javaslat szerint. A gombok csak a vágólapra másolják az üzenetet a Coordinatornak; hálózati hívás nincs. Az állapot a kódban lévő PAUSED listából jön.", "A nem alap (kiterjesztett) folyamatok a kategória-javaslat szerint. A gombok csak a vágólapra másolják az üzenetet a Coordinatornak; hálózati hívás nincs. Az állapot a kódban lévő PAUSED listából jön.", "A nem alap (kiterjesztett) folyamatok a kategória-javaslat szerint. A gombok csak a vágólapra másolják az üzenetet a Coordinatornak; hálózati hívás nincs. Az állapot a kódban lévő PAUSED listából jön.", "A nem alap (kiterjesztett) folyamatok a kategória-javaslat szerint. A gombok csak a vágólapra másolják az üzenetet a Coordinatornak; hálózati hívás nincs. Az állapot a kódban lévő PAUSED listából jön.", "A nem alap (kiterjesztett) folyamatok a kategória-javaslat szerint. A gombok csak a vágólapra másolják az üzenetet a Coordinatornak; hálózati hívás nincs. Az állapot a kódban lévő PAUSED listából jön."],
  stopSel: ["Kijelöltek leállítása", "Kijelöltek leállítása", "Kijelöltek leállítása", "Kijelöltek leállítása", "Kijelöltek leállítása"],
  restartSel: ["Kijelöltek újraindítása", "Kijelöltek újraindítása", "Kijelöltek újraindítása", "Kijelöltek újraindítása", "Kijelöltek újraindítása"],
  stopBtn: ["Leállítás", "Leállítás", "Leállítás", "Leállítás", "Leállítás"],
  restartBtn: ["Újraindítás", "Újraindítás", "Újraindítás", "Újraindítás", "Újraindítás"],
  running: ["fut", "fut", "fut", "fut", "fut"],
  paused: ["szünetel", "szünetel", "szünetel", "szünetel", "szünetel"],
  copiedShort: ["Másolva – illeszd be a Coordinator chatbe", "Másolva – illeszd be a Coordinator chatbe", "Másolva – illeszd be a Coordinator chatbe", "Másolva – illeszd be a Coordinator chatbe", "Másolva – illeszd be a Coordinator chatbe"],
  proposal: ["javaslat", "javaslat", "javaslat", "javaslat", "javaslat"],
  cat_core: ["Alap", "Alap", "Alap", "Alap", "Alap"],
  cat_sales: ["Eladás", "Eladás", "Eladás", "Eladás", "Eladás"],
  cat_ext: ["Kiterjesztett", "Kiterjesztett", "Kiterjesztett", "Kiterjesztett", "Kiterjesztett"],
  awaiting: ["pontosításra vár", "awaiting clarification", "Klärung ausstehend", "en attente de précision", "a aguardar esclarecimento"],
  obsRecent: ["Legutóbb mentve", "Recently saved", "Zuletzt gespeichert", "Enregistré récemment", "Guardado recentemente"],
  obsSnap: ["Pillanatkép ideje", "Snapshot time", "Zeitpunkt des Snapshots", "Heure de l’instantané", "Hora do instantâneo"],
  obsRecentCap: ["A {n} legutóbb módosított jegyzet (az elmúlt 7 napban {t} változott). Kizárva: archív másolatok és érzékeny kategóriák.", "The {n} most recently changed notes ({t} changed in the last 7 days). Excluded: archive copies and sensitive categories.", "Die {n} zuletzt geänderten Notizen ({t} in den letzten 7 Tagen). Ausgeschlossen: Archivkopien und sensible Kategorien.", "Les {n} notes modifiées le plus récemment ({t} en 7 jours). Exclus : copies d’archive et catégories sensibles.", "As {n} notas alteradas mais recentemente ({t} nos últimos 7 dias). Excluídas: cópias de arquivo e categorias sensíveis."],
  obsAdded: ["hozzáadva", "added", "hinzugefügt", "ajoutée", "adicionada"],
  obsChanged: ["módosítva", "changed", "geändert", "modifiée", "alterada"],
  obsBy: ["mentette", "saved by", "gespeichert von", "enregistrée par", "guardada por"],
  obsOpenNote: ["Megnyitás Obsidianben", "Open in Obsidian", "In Obsidian öffnen", "Ouvrir dans Obsidian", "Abrir no Obsidian"],
  unknown: ["ismeretlen", "unknown", "unbekannt", "inconnu", "desconhecido"],
  obsRead: ["olvas", "reads", "liest", "lit", "lê"],
  obsWrite: ["ír", "writes", "schreibt", "écrit", "escreve"],
  ask: ["Pontosítás a Coordinatornak", "Ask the Coordinator to clarify", "Klärung beim Coordinator anfragen", "Demander une précision au Coordinator", "Pedir esclarecimento ao Coordinator"],
  copied: ["Másolva – illeszd be a Coordinator chatbe.", "Copied – paste it into the Coordinator chat.", "Kopiert – in den Coordinator-Chat einfügen.", "Copié – colle-le dans le chat du Coordinator.", "Copiado – cola no chat do Coordinator."],
  copyFail: ["A vágólap nem érhető el. Jelöld ki és másold:", "Clipboard unavailable. Select and copy:", "Zwischenablage nicht verfügbar. Markieren und kopieren:", "Presse-papiers indisponible. Sélectionne et copie :", "Área de transferência indisponível. Seleciona e copia:"],
  close: ["Bezárás", "Close", "Schließen", "Fermer", "Fechar"],
  missing: ["Hiányzó részletek", "Missing details", "Fehlende Details", "Détails manquants", "Detalhes em falta"],
  none: ["nincs", "none", "keine", "aucun", "nenhum"],
  detailsPending: ["A részletes adatok (parancs, feltételek, számok, cikkírás, Obsidian) még ellenőrzés alatt vannak, ezért itt még nem jelennek meg.", "Detailed data (instruction, conditions, numbers, article writing, Obsidian) is still being verified, so it is not shown yet.", "Detaildaten (Auftrag, Bedingungen, Zahlen, Artikel, Obsidian) werden noch geprüft und daher noch nicht angezeigt.", "Les données détaillées (consigne, conditions, chiffres, rédaction, Obsidian) sont en cours de vérification et ne sont pas encore affichées.", "Os dados detalhados (instrução, condições, números, escrita de artigos, Obsidian) ainda estão a ser verificados e não são mostrados."],
  thAuto: ["Auto", "Auto", "Auto", "Auto", "Auto"],
  thLight: ["Világos", "Light", "Hell", "Clair", "Claro"],
  thDark: ["Sötét", "Dark", "Dunkel", "Sombre", "Escuro"],
  clockCap: ["Napi rutinok pontjai az óra körül, állapot szerint színezve. Kattintás: ugrás a kártyára.", "Daily routines as dots around the clock, colored by status. Click: jump to the card.", "Tägliche Routinen als Punkte um die Uhr, nach Status gefärbt. Klick: zur Karte springen.", "Routines quotidiennes en points autour de l’horloge, colorés par statut. Clic : aller à la fiche.", "Rotinas diárias como pontos à volta do relógio, coloridas por estado. Clique: ir para o cartão."],
  noDaily: ["Nem napi folyamatok (heti, egyszeri, igény szerinti) a kártyákon láthatók.", "Non-daily processes (weekly, one-off, on demand) are on the cards.", "Nicht tägliche Prozesse (wöchentlich, einmalig, bei Bedarf) stehen auf den Karten.", "Les processus non quotidiens (hebdo, ponctuels, à la demande) sont sur les fiches.", "Processos não diários (semanais, pontuais, a pedido) estão nos cartões."],
  marks: ["Bot-jelek", "Bot marks", "Bot-Zeichen", "Marques des bots", "Marcas dos bots"],
  gaps: ["Hiányzó valódi jelek (a profilban nincs forma és szín; a térképen megkülönböztető színű kör jelöli őket)", "Missing real marks (no shape and color in the profile; shown on the map as a distinct-colored circle)", "Fehlende echte Zeichen (im Profil keine Form und Farbe; auf der Karte als Kreis in eigener Farbe)", "Vraies marques manquantes (pas de forme ni couleur dans le profil ; cercle de couleur distincte sur la carte)", "Marcas reais em falta (sem forma e cor no perfil; no mapa um círculo de cor distinta)"],
  shapeNote: ["A forma rajza közelítés: az app pontos SVG-je nem érhető el.", "Shape drawing is an approximation: the app's exact SVG is not available.", "Die Form ist angenähert: das genaue SVG der App ist nicht verfügbar.", "Le dessin de la forme est approximatif : le SVG exact de l’app n’est pas disponible.", "O desenho da forma é aproximado: o SVG exato da app não está disponível."],
};
const ST: Dict = {
  "aktív": ["aktív", "active", "aktiv", "actif", "ativo"],
  "inaktív": ["inaktív", "inactive", "inaktiv", "inactif", "inativo"],
  "szünetel": ["szünetel", "paused", "pausiert", "en pause", "em pausa"],
  "blokkolt": ["blokkolt", "blocked", "blockiert", "bloqué", "bloqueado"],
  "csak tervezett": ["csak tervezett", "planned only", "nur geplant", "seulement prévu", "apenas planeado"],
  "igény szerint": ["igény szerint", "on demand", "bei Bedarf", "à la demande", "a pedido"],
  "OK": ["OK", "OK", "OK", "OK", "OK"],
  "elavult": ["elavult", "stale", "veraltet", "obsolète", "desatualizado"],
  "leállítva": ["leállítva", "stopped", "gestoppt", "arrêté", "parado"],
};
const WS: Dict = {
  "Kiadás": ["Kiadás", "Publishing", "Veröffentlichung", "Publication", "Publicação"],
  "Outreach": ["Outreach", "Outreach", "Outreach", "Outreach", "Outreach"],
  "Projekt": ["Projekt", "Project", "Projekt", "Projet", "Projeto"],
  "Rendszer": ["Rendszer", "System", "System", "Système", "Sistema"],
  "Social": ["Social", "Social", "Social", "Réseaux sociaux", "Redes sociais"],
};
const WS_ORDER = ["Kiadás", "Outreach", "Projekt", "Rendszer", "Social"];
const STATUSES = ["aktív", "szünetel", "inaktív", "blokkolt", "csak tervezett", "igény szerint"];

const isStopped = (p: P) => p[10].includes("stopped") || p[10].includes("leállítva");
// A deliberate pause/stop is NOT a problem: paused processes report "OK"; red is reserved for real errors.
const pausedP = (p: P) => isStopped(p) || p[6] === "szünetel" || PAUSED.includes(p[0]);
const problemOf = (p: P) => (pausedP(p) ? "OK" : p[11]);
const ACTORS: string[] = Array.from(new Set(D.flatMap((p: P) => [p[8], ...p[9]]))).sort();
const BOTS: string[] = ACTORS.filter((b: string) => !DEVICES.includes(b));
const GAPS = BOTS.filter((b: string) => !MARKS[b]);
// Obsidian resource links (from registry + guest-article notes). w = writes, r = reads.
// Fields still unknown per process (process-details-unknowns-2026-10-27.md).
const FIELD: Dict = { cmd: ["parancs", "instruction", "Auftrag", "consigne", "instrução"], cond: ["feltételek / jóváhagyás", "conditions / approvals", "Bedingungen / Freigaben", "conditions / validations", "condições / aprovações"], does: ["mit csinál (számok)", "what it does (numbers)", "was es tut (Zahlen)", "ce qu’il fait (chiffres)", "o que faz (números)"], art: ["cikkírás", "article writing", "Artikelschreiben", "rédaction d’articles", "escrita de artigos"], obs: ["Obsidian", "Obsidian", "Obsidian", "Obsidian", "Obsidian"] };
// Registry state: add a process id here when the Coordinator reports it paused (remove it on restart).
const actText = (verb: "stop" | "restart", ids: string[], hu = false): string => (hu ? (verb === "stop" ? "Állítsd le: " : "Indítsd újra: ") : (verb === "stop" ? "Stop: " : "Restart: ")) + ids.map((id: string) => { const p = D.find((q: P) => q[0] === id); return p ? `${hu ? p[1] : p[2]} (${p[8]}/${id})` : id; }).join("; ");
const OBS_SEC: Dict = { mem: ["Memories", "Memories", "Memories", "Memories", "Memories"], press: ["Press médiumok", "Press outlets", "Presse-Medien", "Médias Press", "Meios Press"], lessons: ["Tanulságok / Playbookok", "Lessons / Playbooks", "Lektionen / Playbooks", "Leçons / Playbooks", "Lições / Playbooks"], proj: ["Projektek és döntések", "Projects & decisions", "Projekte & Entscheidungen", "Projets et décisions", "Projetos e decisões"], agents: ["Ügynök-jegyzetek", "Agent notes", "Agenten-Notizen", "Notes d’agents", "Notas de agentes"], index: ["Index és szabályok", "Index & rules", "Index & Regeln", "Index et règles", "Índice e regras"] };
const FIELD_HU: Record<string, string> = { cmd: "parancs", cond: "feltételek/jóváhagyás", does: "mit csinál (számok)", art: "cikkírás", obs: "Obsidian" };

// --- 9-language extension: base overrides for EN/DE/FR/PT, plus IT/ZH/JA/ES columns (fallback: English) ---
const BASE_OV: Record<string, Record<string, string>> = baseOv as any;
const EXTRA: Record<string, Record<string, Record<string, string>>> = extraLangs as any;
const FILL: Record<string, Record<string, string>> = extraFill as any;
const NEWK: Record<string, string[]> = newKeys as any;
for (const k of Object.keys(NEWK)) UI[k] = NEWK[k].slice(0, 5);
["EN", "DE", "FR", "PT"].forEach((c: string, i: number) => { for (const [k, v] of Object.entries(BASE_OV[c] ?? {})) if (UI[k]) UI[k][i + 1] = v; });
const extend = (d: Dict, sec: string) => { for (const k of Object.keys(d)) { const r = d[k]; for (const c of ["IT", "ZH", "JA", "ES"]) { const j = LANGS.indexOf(c as L); r[j] = (sec === "ui" && NEWK[k]?.[j]) || (sec === "ui" && FILL[c]?.[k]) || EXTRA[c]?.[sec]?.[k] || r[1]; } } };
extend(UI, "ui"); extend(ST, "st"); extend(WS, "ws"); extend(FIELD, "field"); extend(OBS_SEC, "obs");
const OX: Record<string, any> = obsUi as any;
const README: Record<L, string> = { EN: rmEN, HU: rmHU, DE: rmDE, FR: rmFR, PT: rmPT, IT: rmIT, ZH: rmZH, JA: rmJA, ES: rmES };
const wrap = (s: string, n: number): string[] => {
  const out: string[] = [];
  let cur = "";
  for (const w of s.split(" ")) {
    if (cur && (cur + " " + w).length > n) { out.push(cur); cur = w; } else cur = cur ? cur + " " + w : w;
  }
  if (cur) out.push(cur);
  return out;
};
type V = { k: number; x: number; y: number };
type N = { id: string; x: number; y: number; kind: "bot" | "proc"; p?: P; name: string };
type E = { id: string; a: string; b: string; dashed: boolean };

export default function App() {
  const [lang, setLang] = useState<L>("EN");
  const [docOpen, setDocOpen] = useState<boolean>(false);
  const [obsChecked, setObsChecked] = useState<string>(new Date().toTimeString().slice(0, 8));
  const [obsSetup, setObsSetup] = useState<boolean>(false);
  const [obsEx, setObsEx] = useState<string>("");
  const [view, setView] = useState<string>("net");
  const [filter, setFilter] = useState<string>("ALL");
  const [bot, setBot] = useState<string>("ALL");
  const [focus, setFocus] = useState<string>("");
  const [sel, setSel] = useState<string>("");
  const [obsSec, setObsSec] = useState<string>("ALL");
  const [catF, setCatF] = useState<string>("ALL");
  const [toast, setToast] = useState<string>("");
  const [proj, setProj] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [openCmd, setOpenCmd] = useState<string[]>([]);
  const [mode, setModeRaw] = useState<"auto" | "light" | "dark">(loadMode);
  const setMode = (m: "auto" | "light" | "dark") => { saveMode(m); setModeRaw(m); };
  const th = useTheme(mode);
  setCurrent(th);
  const [copyState, setCopyState] = useState<"" | "ok" | "fail">("");
  const [hoverEdge, setHoverEdge] = useState<string>("");
  const [tapEdge, setTapEdge] = useState<string>("");
  const [flash, setFlash] = useState<string>("");
  const [full, setFull] = useState<boolean>(false);
  const [vw, setVw] = useState<V>({ k: 1, x: 0, y: 0 });
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 1200, h: 900 });
  const [nowH, setNowH] = useState<number>(7.33);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const moved = useRef<boolean>(false);
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ d: number; v: V; cx: number; cy: number } | null>(null);
  const li = LANGS.indexOf(lang);
  const t = (k: string) => UI[k][li];
  const st = (k: string) => (ST[k] ? ST[k][li] : k);
  const nm = (p: P): string => p[NAME_COL[lang]] as string;

  useEffect(() => {
    const tick = () => {
      const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      const h = Number(parts.find((x) => x.type === "hour")?.value ?? "7");
      const m = Number(parts.find((x) => x.type === "minute")?.value ?? "20");
      setNowH((h % 24) + m / 60);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const measure = () => setSize({ w: boxRef.current ? boxRef.current.clientWidth : window.innerWidth - 80, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [view, full]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setFull(false); setFocus(""); setTapEdge(""); setSel(""); setCopyState(""); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Page-level theme override: the kit only exposes the viewer's palette, so a non-matching choice inverts the rendered page (hue-preserving).
  const tk: "light" | "dark" = th.kind;
  const inv = false;
  const fx = {};
  const cat = th.dataviz.categorical;
  const colorOf = (p: P): string => {
    const pr = problemOf(p);
    if (pr === "leállítva") return th.text.danger;
    if (pr === "elavult" || pr === "blokkolt") return th.text.warning;
    if (p[6] === "aktív") return th.text.success;
    if (p[6] === "csak tervezett") return th.text.accent;
    return th.text.tertiary;
  };
  const markColor = (c: string): string => (c === "warm" ? th.text.warning : c === "red" ? th.text.danger : c === "black" ? th.text.primary : th.text.accent);
  const botColor = (name: string): string => {
    const m = MARKS[name];
    if (m) return markColor(m.color);
    if (DEVICES.includes(name)) return th.text.tertiary;
    return cat[Math.max(0, BOTS.indexOf(name)) % cat.length];
  };
  const shapePath = (shape: string, r: number): string => {
    const s = r * 0.62;
    if (shape === "pumpkin") return `M0 ${-s * 0.75} C ${-s * 1.25} ${-s * 0.95}, ${-s * 1.3} ${s * 0.95}, 0 ${s * 0.8} C ${s * 1.3} ${s * 0.95}, ${s * 1.25} ${-s * 0.95}, 0 ${-s * 0.75} Z M ${-s * 0.1} ${-s * 0.75} L ${s * 0.15} ${-s * 1.1}`;
    if (shape === "teardrop") return `M0 ${-s} C ${s * 0.9} ${-s * 0.1}, ${s * 0.8} ${s}, 0 ${s} C ${-s * 0.8} ${s}, ${-s * 0.9} ${-s * 0.1}, 0 ${-s} Z`;
    return `M ${-s} 0 C ${-s} ${-s * 0.9}, ${s * 0.6} ${-s * 1.1}, ${s * 0.9} ${-s * 0.2} C ${s * 1.1} ${s * 0.7}, ${-s * 0.2} ${s * 1.1}, ${-s} 0 Z`;
  };
  const markG = (name: string, x: number, y: number, r: number, emph: boolean) => {
    const m = MARKS[name];
    const c = botColor(name);
    const dev = DEVICES.includes(name);
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{dev ? name + " · " + t("device") : name}</title>
        <circle r={r + (emph ? 7 : 5)} fill="none" stroke={c} strokeWidth={emph ? 4 : 2.5} />
        {dev ? (
          <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={6} fill={th.fill.secondary} stroke={th.border.strong} strokeWidth={2} />
        ) : m ? (
          <Fragment>
            <circle r={r} fill={th.bg.elevated} stroke={c} strokeWidth={2} />
            <path d={shapePath(m.shape, r)} fill={c} stroke={c} strokeWidth={1.5} />
          </Fragment>
        ) : (
          <circle r={r} fill={c} stroke={th.bg.base} strokeWidth={3} />
        )}
      </g>
    );
  };
  const markIcon = (name: string, size2: number) => (
    <svg width={size2} height={size2} viewBox={`${-size2 / 2} ${-size2 / 2} ${size2} ${size2}`} style={{ flex: "none" }}>
      {markG(name, 0, 0, size2 / 2 - 8, false)}
    </svg>
  );
  const jump = (id: string) => {
    setFull(false);
    setFilter("ALL");
    setCatF("ALL");
    setFlash(id);
    setTimeout(() => {
      const el = document.getElementById("card-" + id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    setTimeout(() => setFlash((f: string) => (f === id ? "" : f)), 2200);
  };

  // ---------- graph models ----------
  const procs = useMemo(() => D.filter((p: P) => p[0] !== "imagepack" && (bot === "ALL" || p[8] === bot || p[9].includes(bot))), [bot]);
  const net = useMemo(() => {
    const nodes: N[] = [];
    const edges: E[] = [];
    if (bot === "ALL") {
      const sorted = [...procs].sort((a: P, b: P) => a[8].localeCompare(b[8]));
      const botList = Array.from(new Set(sorted.flatMap((p: P) => [p[8], ...p[9]])));
      const ROWS = 14;
      const H = ROWS * 92;
      sorted.forEach((p: P, i: number) => nodes.push({ id: p[0], x: 560 + Math.floor(i / ROWS) * 400, y: (i % ROWS) * 92, kind: "proc", p, name: nm(p) }));
      botList.forEach((b: string, i: number) => nodes.push({ id: "b:" + b, x: 0, y: (i + 0.5) * (H / botList.length) - 46, kind: "bot", name: b }));
    } else {
      const R1 = Math.max(380, procs.length * 70);
      nodes.push({ id: "b:" + bot, x: 0, y: 0, kind: "bot", name: bot });
      procs.forEach((p: P, i: number) => {
        const a = (i / procs.length) * Math.PI * 2 - Math.PI / 2;
        nodes.push({ id: p[0], x: Math.cos(a) * R1, y: Math.sin(a) * R1, kind: "proc", p, name: nm(p) });
      });
      const others = Array.from(new Set(procs.flatMap((p: P) => [p[8], ...p[9]]).filter((b: string) => b !== bot)));
      others.forEach((b: string, i: number) => {
        const a = (i / Math.max(1, others.length)) * Math.PI * 2 - Math.PI / 2 + 0.35;
        nodes.push({ id: "b:" + b, x: Math.cos(a) * (R1 + 320), y: Math.sin(a) * (R1 + 320), kind: "bot", name: b });
      });
    }
    procs.forEach((p: P) => [p[8], ...p[9]].forEach((b: string) => edges.push({ id: p[0] + "|" + b, a: "b:" + b, b: p[0], dashed: b !== p[8] })));
    const obsTargets = [...procs.filter((p: P) => OBS_PROCS[p[0]]).map((p: P) => p[0]), ...OBS_BOTS.filter((b: string) => nodes.some((n: N) => n.id === "b:" + b)).map((b: string) => "b:" + b)];
    if (obsTargets.length) {
      const ys0 = nodes.map((n: N) => n.y);
      nodes.push({ id: "obs", x: bot === "ALL" ? 300 : 0, y: Math.min(...ys0) - 200, kind: "proc", name: "Obsidian Notes (Host A)" });
    }
    const xs = nodes.map((n: N) => n.x), ys = nodes.map((n: N) => n.y);
    // padding: bot label (left, ~300px) + mark ring, process box half-width 170 + margin, box half-height + margin
    const minX = Math.min(...xs) - 720, maxX = Math.max(...xs) + 220, minY = Math.min(...ys) - 110, maxY = Math.max(...ys) + 110;
    return { nodes, edges, minX, minY, w: maxX - minX, h: maxY - minY };
  }, [procs, bot, lang]);
  const metro = useMemo(() => {
    const lines = WS_ORDER.map((w: string) => ({ w, ps: procs.filter((p: P) => p[13] === w) })).filter((l) => l.ps.length > 0);
    const maxN = Math.max(1, ...lines.map((l) => l.ps.length));
    const spos: Record<string, { x: number; y: number }> = {};
    lines.forEach((l, i: number) => l.ps.forEach((p: P, j: number) => { spos[p[0]] = { x: 230 + j * 290, y: 260 + i * 300 }; }));
    const obsT = Object.keys(OBS_PROCS).filter((id: string) => spos[id]);
    return { lines, spos, obsT, w: 340 + maxN * 290, h: 210 + lines.length * 300 };
  }, [procs]);

  const box = view === "metro" ? { minX: 0, minY: 0, w: metro.w, h: metro.h } : { minX: net.minX, minY: net.minY, w: net.w, h: net.h };
  const mapH = full ? size.h - 70 : Math.max(600, Math.round(size.h * 0.75));
  const cw = Math.max(320, size.w);
  const fitK = Math.min(cw / box.w, mapH / box.h);
  const clampV = (v: V): V => {
    const k = Math.min(fitK * 3, Math.max(fitK * 0.5, v.k));
    let x = v.x, y = v.y;
    const m = 120;
    const Lx = box.minX * k + x, Rx = (box.minX + box.w) * k + x, Ty = box.minY * k + y, By = (box.minY + box.h) * k + y;
    if (Rx < m) x += m - Rx;
    if (Lx > cw - m) x -= Lx - (cw - m);
    if (By < m) y += m - By;
    if (Ty > mapH - m) y -= Ty - (mapH - m);
    return { k, x, y };
  };
  const setV = (f: (v: V) => V) => setVw((v: V) => clampV(f(v)));
  const fit = () => setVw({ k: fitK, x: (cw - box.w * fitK) / 2 - box.minX * fitK, y: (mapH - box.h * fitK) / 2 - box.minY * fitK });
  useEffect(() => { fit(); }, [view, bot, full, size.w, size.h, lang]);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return; // plain wheel scrolls the page
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setV((v: V) => ({ k: v.k * f, x: mx - (mx - v.x) * f, y: my - (my - v.y) * f }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [view, full, fitK, cw, mapH]);
  const zoomBy = (f: number) => setV((v: V) => ({ k: v.k * f, x: cw / 2 - (cw / 2 - v.x) * f, y: mapH / 2 - (mapH / 2 - v.y) * f }));
  const resetAll = () => { setFocus(""); setTapEdge(""); fit(); };
  const focusBot = (n: N) => {
    setFocus(n.name);
    setTapEdge("");
    const k = Math.min(fitK * 3, fitK * 1.8);
    setVw(clampV({ k, x: cw / 2 - n.x * k - 160, y: mapH / 2 - n.y * k }));
  };

  const activeEdge = hoverEdge || tapEdge;
  const hiEdge = net.edges.find((e: E) => e.id === activeEdge);
  const hiNodes = hiEdge ? [hiEdge.a, hiEdge.b] : [];
  const pos: Record<string, N> = {};
  net.nodes.forEach((n: N) => { pos[n.id] = n; });
  const focusEdges = focus ? net.edges.filter((e: E) => e.a === "b:" + focus) : [];
  const focusSet = new Set<string>(focus ? ["b:" + focus, ...focusEdges.map((e: E) => e.b)] : []);
  const focusProcs = focus ? D.filter((p: P) => p[8] === focus || p[9].includes(focus)) : [];
  const tapped = net.edges.find((e: E) => e.id === tapEdge);
  const reds = D.filter((p: P) => problemOf(p) === "leállítva");
  const ambers = D.filter((p: P) => p[11] === "elavult" || p[11] === "blokkolt");
  const shown = D.filter((p: P) => (filter === "ALL" || p[6] === filter) && (catF === "ALL" || CAT[p[0]] === catF));
  const isPaused = pausedP;
  const copyTxt = (txt: string, ok: string) => {
    const done = () => { setToast(ok + " — " + txt); setTimeout(() => setToast(""), 3500); };
    try { navigator.clipboard.writeText(txt).then(done, () => { setToast(t("copyFail") + " " + txt); setTimeout(() => setToast(""), 8000); }); } catch { setToast(t("copyFail") + " " + txt); setTimeout(() => setToast(""), 8000); }
  };
  const EXT = D.filter((p: P) => CAT[p[0]] === "ext");
  const daily = D.filter((p: P) => p[14].length > 0);
  const fmtH = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
  const bannerItem = (p: P, tone: "danger" | "warning") => (
    <button key={p[0]} onClick={() => jump(p[0])} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "4px 0", cursor: "pointer", color: tone === "danger" ? th.text.dangerDeep : th.text.warningDeep, font: "inherit", whiteSpace: "normal", overflowWrap: "anywhere" }}>
      <strong>{nm(p)}</strong> — {st(problemOf(p))} · {t("last")}: {p[10]}{p[12] ? " · " + p[12] : ""}
    </button>
  );
  const overlay = { position: "absolute" as const, colorScheme: th.kind, background: th.bg.elevated, border: `1px solid ${th.border.default}`, borderRadius: th.radius.md, padding: "8px 12px", color: th.text.primary, fontSize: 13 };
  const swatch = (c: string, round: boolean) => <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: round ? 6 : 2, background: c, marginRight: 6, verticalAlign: "middle" }} />;

  return (
    <Page title="" width="full"><div style={{background:th.fill.warningSubtle,color:th.text.warningDeep,padding:"6px 10px",borderRadius:6,fontWeight:600,marginBottom:8}}>⚠ EXAMPLE DATA – all processes, bots and notes are fictional sample data (data/sample-processes.json).</div>
      <div style={{ ...(inv && !full ? fx : {}), color: th.text.primary, colorScheme: tk, borderRadius: th.radius.lg, padding: inv ? 12 : 0 }}>
      {proj === null ? (
      <div data-testid="projects-view">
        <h1 style={{ margin: 0, fontSize: th.font.heading1.fontSize, lineHeight: th.font.heading1.lineHeight, fontWeight: 700, color: th.text.primary, overflowWrap: "anywhere" }}>{t("title")}</h1>
        <Section heading={t("projHead")}><Projects onOpen={setProj} l={{ more: t("more"), less: t("less"), what: t("pWhat"), why: t("pWhy"), status: t("pStatus"), next: t("pNext"), heading: t("projHead") }} /></Section>
      </div>
      ) : (
      <div data-testid="process-view">
      <div style={{ marginBottom: 8 }}><Button label={lang === "HU" ? "← Vissza a projektekhez" : "← Back to projects"} onClick={() => setProj(null)} /> <strong style={{ marginLeft: 8 }}>{(PROJECTS.find(x => x.id === proj) || { name: proj }).name}</strong></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", rowGap: 8 }}>
        <h1 style={{ margin: 0, fontSize: th.font.heading1.fontSize, lineHeight: th.font.heading1.lineHeight, fontWeight: 700, color: th.text.primary, overflowWrap: "anywhere", marginRight: 8 }}>{t("title")}</h1>
        <div style={{ minWidth: 120 }}><Select options={LANGS.map((c: L) => ({ value: c, label: c + " " + LNAME[c] + (PARTIAL.includes(c) ? " ◐" : "") }))} value={lang} onChange={(v: L) => setLang(v)} /></div>
        <Segmented options={[{ value: "auto", label: t("thAuto") }, { value: "light", label: t("thLight") }, { value: "dark", label: t("thDark") }]} value={mode} onChange={(v: string) => setMode(v as "auto" | "light" | "dark")} />
        <Button label={t("readmeBtn")} onClick={() => setDocOpen(true)} />
      </div>
      {PARTIAL.includes(lang) && <div data-testid="partial" style={{ color: th.text.warning, fontSize: 13, marginTop: 4 }}>◐ {t("partial")}</div>}
      {docOpen && (
        <div role="dialog" aria-label="README" onClick={() => setDocOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: th.bg.elevated, color: th.text.primary, maxWidth: 820, width: "92vw", maxHeight: "85vh", overflowY: "auto", borderRadius: th.radius.lg, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}><Button label={t("close2")} onClick={() => setDocOpen(false)} /></div>
            <pre data-testid="readme-body" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "inherit", fontSize: 14, lineHeight: 1.5 }}>{README[lang]}</pre>
          </div>
        </div>
      )}
      <div style={{ color: th.text.secondary, margin: "6px 0 10px" }}>{t("summary")}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, color: th.text.primary, colorScheme: th.kind }}>
        {reds.length > 0 && (
          <div style={{ background: th.fill.dangerSubtle, border: `1px solid ${th.text.danger}`, borderRadius: th.radius.md, padding: "10px 14px" }}>
            <div style={{ color: th.text.danger, fontWeight: 600 }}>⚠ {t("red")} · {t("asOf")} (sample)</div>
            {reds.map((p: P) => bannerItem(p, "danger"))}
          </div>
        )}
        {ambers.length > 0 && (
          <div style={{ background: th.fill.warningSubtle, border: `1px solid ${th.text.warning}`, borderRadius: th.radius.md, padding: "10px 14px" }}>
            <div style={{ color: th.text.warning, fontWeight: 600 }}>⚠ {t("amber")} · {t("asOf")} (sample)</div>
            {ambers.map((p: P) => bannerItem(p, "warning"))}
          </div>
        )}
      </div>

      <Section heading={t("obsTitle")} caption={t("resource")}>
        <Properties items={[
          { label: t("obsVault"), value: t("obsVaultTxt") },
          { label: t("obsLoc"), value: "~/Vault/Notes/ (" + OBS_CFG.vaultHost + ")" },
          { label: t("obsOpen"), value: t("obsOpenTxt") },
          { label: t("obsLast"), value: t("obsLastTxt") },
          { label: t("obsUsers"), value: t("obsUsersTxt") },
        ]} />
        <div data-testid="obs-status" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
          <span style={{ color: th.text.success }}>● {OX[lang].status}</span>
          <span style={{ color: th.text.secondary, fontSize: 13 }}>{OX[lang].checked} {obsChecked} · {Object.keys(OBS_EX).length} {OX[lang].excerpts} · source: {OBS_CFG.source}</span>
          <Button label={OX[lang].refresh} onClick={() => setObsChecked(new Date().toTimeString().slice(0, 8))} />
          <Button label={OX[lang].setup} onClick={() => setObsSetup(!obsSetup)} />
        </div>
        {obsSetup && <ol data-testid="obs-setup" style={{ margin: "8px 0", paddingLeft: 20 }}>{OX[lang].steps.map((x: string, i: number) => <li key={i}>{x.replace("{v}", OBS_CFG.vaultName).replace("{h}", OBS_CFG.vaultHost)}</li>)}</ol>}
        <div style={{ marginTop: 12, color: th.text.primary }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{t("obsRecent")}</div>
          <div style={{ color: th.text.secondary, fontSize: 13, margin: "2px 0 8px" }}>{t("obsSnap")}: {OBS_SNAP} · {t("obsRecentCap").replace("{n}", String(OBS_NOTES.length)).replace("{t}", String(OBS_TOTAL))}</div>
          <Segmented options={[{ value: "ALL", label: t("all"), count: OBS_NOTES.length }, ...Object.keys(OBS_SEC).map((k: string) => ({ value: k, label: OBS_SEC[k][li], count: OBS_NOTES.filter((n: ON) => n[1] === k).length }))]} value={obsSec} onChange={setObsSec} />
          <div style={{ marginTop: 8, maxHeight: 420, overflowY: "auto", border: `1px solid ${th.border.subtle}`, borderRadius: th.radius.md }}>
            {OBS_NOTES.filter((n: ON) => obsSec === "ALL" || n[1] === obsSec).map((n: ON, i: number) => (
              <div key={n[6]} style={{ padding: "8px 12px", borderTop: i ? `1px solid ${th.border.subtle}` : "none" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline", justifyContent: "space-between" }}>
                  <strong style={{ overflowWrap: "anywhere" }}>{n[0]}</strong>
                  <span style={{ display: "flex", gap: 10, fontSize: 13 }}>
                    <button data-testid="obs-ex" onClick={() => setObsEx(obsEx === n[6] ? "" : n[6])} style={{ background: "none", border: "none", padding: 0, color: th.text.accent, cursor: "pointer", textDecoration: "underline", fontSize: 13 }}>{t("obsOpenNote")}</button>
                    <a data-testid="obs-app" href={obsLink(decodeURIComponent(n[6]))} target="_blank" rel="noopener noreferrer" style={{ color: th.text.accent }}>{OX[lang].appLink}</a>
                    <button onClick={() => copyTxt(decodeURIComponent(n[6]), OX[lang].copied)} style={{ background: "none", border: "none", padding: 0, color: th.text.accent, cursor: "pointer", textDecoration: "underline", fontSize: 13 }}>{OX[lang].copyPath}</button>
                  </span>
                </div>
                <div style={{ fontSize: 13, color: th.text.secondary }}>{OBS_SEC[n[1]][li]} · {t("obsAdded")} {n[2]} · {t("obsChanged")} {n[3]}  · {t("obsBy")}: {n[5] === "U" ? t("unknown") : n[5] === "G" ? "bot (frontmatter)" : n[5]}</div>
                <div style={{ fontSize: 14, overflowWrap: "anywhere" }}>{n[4] === "P" ? t("obsP").replace("{n}", n[0]) : n[4] === "M" ? t("obsM") : n[4]}</div>
                {obsEx === n[6] && <div data-testid="obs-ex-body" style={{ marginTop: 6, padding: 8, background: th.fill.secondary, borderRadius: th.radius.md, fontSize: 13 }}><div style={{ color: th.text.secondary }}>{OX[lang].excerpt}</div><pre style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>{n[4] === "M" ? OX[lang].titleOnly : (OBS_EX[decodeURIComponent(n[6])] ?? OX[lang].noEx)}</pre></div>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section heading={t("view")}>
        <Segmented options={[{ value: "clock", label: t("clock") }, { value: "net", label: t("net") }, { value: "metro", label: t("metro") }]} value={view} onChange={(v: string) => { setView(v); setFocus(""); setTapEdge(""); }} />
      </Section>

      {view === "clock" && (
        <Section heading={t("clock")} caption={t("clockCap")}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
            <svg key={"clock-" + th.kind} width={600} height={600} viewBox="-300 -300 600 600" style={{ maxWidth: "100%", height: "auto", color: th.text.primary }}>
              <circle r={250} fill="none" stroke={th.border.default} />
              {Array.from({ length: 24 }, (_, h: number) => {
                const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
                return (
                  <g key={h}>
                    <line x1={Math.cos(a) * 240} y1={Math.sin(a) * 240} x2={Math.cos(a) * 250} y2={Math.sin(a) * 250} stroke={th.border.strong} />
                    <text x={Math.cos(a) * 272} y={Math.sin(a) * 272 + 4} textAnchor="middle" fontSize={12} fill={th.text.secondary}>{String(h).padStart(2, "0")}</text>
                  </g>
                );
              })}
              {daily.map((p: P, i: number) => p[14].map((h: number, j: number) => {
                const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
                const r = 90 + (i % 8) * 18;
                return (
                  <circle key={p[0] + j} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={7} fill={colorOf(p)} stroke={th.bg.base} strokeWidth={1.5} style={{ cursor: "pointer" }} onClick={() => jump(p[0])}>
                    <title>{nm(p) + " · " + fmtH(h) + " · " + st(problemOf(p))}</title>
                  </circle>
                );
              }))}
              <line x1={0} y1={0} x2={Math.cos((nowH / 24) * Math.PI * 2 - Math.PI / 2) * 235} y2={Math.sin((nowH / 24) * Math.PI * 2 - Math.PI / 2) * 235} stroke={th.text.danger} strokeWidth={3} strokeLinecap="round" />
              <circle r={6} fill={th.text.danger} />
              <text x={Math.cos((nowH / 24) * Math.PI * 2 - Math.PI / 2) * 205} y={Math.sin((nowH / 24) * Math.PI * 2 - Math.PI / 2) * 205 - 10} textAnchor="middle" fontSize={13} fontWeight={600} fill={th.text.danger}>{t("now")} {fmtH(nowH)}</text>
            </svg>
            <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 6 }}>
              {daily.map((p: P) => (
                <button key={p[0]} onClick={() => jump(p[0])} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "transparent", border: "none", padding: 0, textAlign: "left", cursor: "pointer", color: th.text.primary, font: "inherit" }}>
                  <span style={{ width: 12, height: 12, borderRadius: 6, background: colorOf(p), marginTop: 4, flex: "none" }} />
                  <span style={{ whiteSpace: "normal", overflowWrap: "anywhere" }}><strong>{nm(p)}</strong> — {p[14].map(fmtH).join(", ")} · {st(problemOf(p))}</span>
                </button>
              ))}
              <Text>{t("noDaily")}</Text>
            </div>
          </div>
        </Section>
      )}

      {(view === "net" || view === "metro") && (
        <div key={"wrap-" + th.kind} style={full ? { position: "fixed", inset: 0, zIndex: 9999, ...(inv ? fx : {}), background: th.bg.base, color: th.text.primary, colorScheme: th.kind, padding: 12, display: "flex", flexDirection: "column", gap: 8 } : { marginTop: 16, color: th.text.primary, colorScheme: th.kind, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 16, color: th.text.primary, marginRight: 8 }}>{view === "net" ? t("net") : t("metro")}</span>
            <div style={{ minWidth: 200 }}>
              <Select options={[{ value: "ALL", label: t("allBots") }, ...BOTS.map((b: string) => ({ value: b, label: b }))]} value={bot} onChange={(v: string) => { setBot(v); setFocus(""); setTapEdge(""); }} />
            </div>
            <Button label="−" onClick={() => zoomBy(0.8)} />
            <Button label="+" onClick={() => zoomBy(1.25)} />
            <Button label={t("fit")} onClick={fit} variant="primary" />
            {(focus || tapEdge) && <Button label={t("reset")} onClick={resetAll} />}
            <Button label={full ? t("exitFull") : t("full")} onClick={() => setFull((f: boolean) => !f)} />
            <span title={t("zoomHint")} aria-label={t("zoomHint")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 12, border: `1px solid ${th.border.strong}`, color: th.text.secondary, cursor: "help", fontSize: 13, fontWeight: 600 }}>?</span>
          </div>
          <div
            ref={boxRef}
            style={{ position: "relative", height: mapH, width: "100%", border: `1px solid ${th.border.default}`, borderRadius: th.radius.lg, overflow: "hidden", cursor: "grab", touchAction: "pan-y", background: th.bg.subtle, color: th.text.primary, colorScheme: th.kind }}
            onPointerDown={(e) => {
              ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
              moved.current = false;
              if (ptrs.current.size === 2) {
                const [a, b] = Array.from(ptrs.current.values());
                const r = boxRef.current ? boxRef.current.getBoundingClientRect() : { left: 0, top: 0 };
                pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), v: vw, cx: (a.x + b.x) / 2 - r.left, cy: (a.y + b.y) / 2 - r.top };
                drag.current = null;
              } else drag.current = { x: e.clientX, y: e.clientY, vx: vw.x, vy: vw.y };
            }}
            onPointerMove={(e) => {
              if (!ptrs.current.has(e.pointerId)) return;
              ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
              const pc = pinch.current;
              if (pc && ptrs.current.size === 2) {
                const [a, b] = Array.from(ptrs.current.values());
                const f = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, pc.d);
                moved.current = true;
                setVw(clampV({ k: pc.v.k * f, x: pc.cx - (pc.cx - pc.v.x) * f, y: pc.cy - (pc.cy - pc.v.y) * f }));
                return;
              }
              const d = drag.current;
              if (d) {
                if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 4) moved.current = true;
                setVw(clampV({ k: vw.k, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y }));
              }
            }}
            onPointerUp={(e) => { ptrs.current.delete(e.pointerId); if (ptrs.current.size < 2) pinch.current = null; drag.current = null; }}
            onPointerCancel={(e) => { ptrs.current.delete(e.pointerId); pinch.current = null; drag.current = null; }}
            onPointerLeave={(e) => { ptrs.current.delete(e.pointerId); pinch.current = null; drag.current = null; }}
          >
            <svg key={"map-" + th.kind} width="100%" height={mapH} style={{ display: "block", color: th.text.primary }}>
              <rect x={0} y={0} width="100%" height="100%" fill="transparent" onClick={() => { if (!moved.current) { setFocus(""); setTapEdge(""); setSel(""); setCopyState(""); } }} />
              <g transform={`translate(${vw.x},${vw.y}) scale(${vw.k})`}>
                {view === "net" && (
                  <Fragment>
                    {[...net.edges].sort((a: E, b: E) => {
                      const s = (e: E) => (e.id === activeEdge ? 2 : focusEdges.includes(e) ? 1 : 0);
                      return s(a) - s(b);
                    }).map((e: E) => {
                      const A = pos[e.a], B = pos[e.b];
                      if (!A || !B) return null;
                      const hi = e.id === activeEdge;
                      const inFocus = focus !== "" && e.a === "b:" + focus;
                      const dim = focus !== "" && !inFocus && !hi;
                      const bx = B.x < A.x ? B.x + 170 : B.x - 170;
                      const d = `M ${A.x} ${A.y} C ${(A.x + bx) / 2} ${A.y}, ${(A.x + bx) / 2} ${B.y}, ${bx} ${B.y}`;
                      const stroke = hi ? cat[1] : inFocus ? th.text.accent : th.border.strong;
                      return (
                        <g key={e.id} opacity={dim ? 0.12 : 1} onPointerEnter={() => setHoverEdge(e.id)} onPointerLeave={() => setHoverEdge("")} onPointerDown={(ev) => ev.stopPropagation()} onClick={() => setTapEdge((x: string) => (x === e.id ? "" : e.id))} style={{ cursor: "pointer" }}>
                          {(hi || inFocus) && <path d={d} fill="none" stroke={th.bg.base} strokeWidth={hi ? 12 : 9} />}
                          <path d={d} fill="none" stroke={stroke} strokeWidth={hi ? 7 : inFocus ? 5 : 2} strokeDasharray={e.dashed && !hi ? "8 6" : undefined} />
                          <path d={d} fill="none" stroke="transparent" strokeWidth={22} />
                          <title>{(e.dashed ? t("edgeLinked") : t("edgeOwner")) + ": " + e.a.slice(2) + " → " + (pos[e.b]?.name ?? "")}</title>
                        </g>
                      );
                    })}
                    {pos["obs"] && [...Object.keys(OBS_PROCS).filter((id: string) => pos[id]), ...OBS_BOTS.filter((b: string) => pos["b:" + b]).map((b: string) => "b:" + b)].map((id: string) => {
                      const O = pos["obs"], T = pos[id];
                      const d = `M ${O.x} ${O.y + 46} C ${O.x} ${(O.y + T.y) / 2}, ${T.x} ${(O.y + T.y) / 2}, ${T.x} ${T.y - (T.kind === "bot" ? 36 : 40)}`;
                      const w = id.startsWith("b:") || OBS_PROCS[id] === "w";
                      return (
                        <path key={"obs-" + id} d={d} fill="none" stroke={cat[4 % cat.length]} strokeWidth={4} strokeDasharray="2 7" strokeLinecap="round" opacity={focus !== "" && !focusSet.has(id) ? 0.15 : 0.9}>
                          <title>{"Obsidian ↔ " + T.name + " (" + (w ? t("obsWrite") : t("obsRead")) + ")"}</title>
                        </path>
                      );
                    })}
                    {net.nodes.map((n: N) => {
                      const emph = hiNodes.includes(n.id) || n.id === "b:" + focus;
                      const dim = focus !== "" && !focusSet.has(n.id) && !hiNodes.includes(n.id);
                      if (n.kind === "bot") {
                        const lines = wrap(n.name, 16);
                        return (
                          <g key={n.id} opacity={dim ? 0.25 : 1} style={{ cursor: "pointer" }} onPointerDown={(ev) => ev.stopPropagation()} onClick={() => focusBot(n)}>
                            <circle cx={n.x} cy={n.y} r={44} fill="transparent" />
                            {markG(n.name, n.x, n.y, emph ? 30 : 26, emph)}
                            {lines.map((ln: string, i: number) => (
                              <text key={i} x={n.x - 44} y={n.y + 8 + i * 26 - (lines.length - 1) * 13} textAnchor="end" fontSize={22} fontWeight={700} fill={th.text.primary} stroke={th.bg.subtle} strokeWidth={4} paintOrder="stroke">{ln}</text>
                            ))}
                          </g>
                        );
                      }
                      if (n.id === "obs") {
                        return (
                          <g key="obs" opacity={focus !== "" && !OBS_BOTS.includes(focus) && !focusSet.has("obs") ? 0.35 : 1}>
                            <title>{t("obsTitle") + " · " + t("resource")}</title>
                            <polygon points={`${n.x},${n.y - 46} ${n.x + 40},${n.y - 23} ${n.x + 40},${n.y + 23} ${n.x},${n.y + 46} ${n.x - 40},${n.y + 23} ${n.x - 40},${n.y - 23}`} fill={th.bg.elevated} stroke={cat[4 % cat.length]} strokeWidth={5} />
                            <text x={n.x + 56} y={n.y - 2} fontSize={22} fontWeight={700} fill={th.text.primary}>{t("obsTitle")}</text>
                            <text x={n.x + 56} y={n.y + 24} fontSize={16} fill={th.text.secondary}>{t("resource")}</text>
                          </g>
                        );
                      }
                      const p = n.p as P;
                      const lines = wrap(n.name, 26);
                      const h = 24 + lines.length * 26;
                      return (
                        <g key={n.id} opacity={dim ? 0.25 : 1} style={{ cursor: "pointer" }} onClick={() => { setSel(p[0]); setCopyState(""); }} onPointerDown={(ev) => ev.stopPropagation()}>
                          <title>{n.name + " · " + st(p[6]) + " · " + st(problemOf(p))}</title>
                          <rect x={n.x - 170} y={n.y - h / 2} width={340} height={h} rx={10} fill={th.bg.elevated} stroke={colorOf(p)} strokeWidth={emph ? 5 : 3} />
                          {lines.map((ln: string, i: number) => (
                            <text key={i} x={n.x} y={n.y - h / 2 + 32 + i * 26} textAnchor="middle" fontSize={21} fontWeight={emph ? 700 : 500} fill={th.text.primary}>{ln}</text>
                          ))}
                        </g>
                      );
                    })}
                  </Fragment>
                )}
                {view === "metro" && metro.obsT.length > 0 && (
                  <g>
                    {metro.obsT.map((id: string) => {
                      const s = metro.spos[id];
                      return <path key={id} d={`M 230 80 C 230 ${(80 + s.y) / 2}, ${s.x} ${(80 + s.y) / 2}, ${s.x} ${s.y - 80}`} fill="none" stroke={cat[4 % cat.length]} strokeWidth={4} strokeDasharray="2 7" strokeLinecap="round"><title>{"Obsidian → " + (D.find((p: P) => p[0] === id) ? nm(D.find((p: P) => p[0] === id) as P) : id) + " (" + (OBS_PROCS[id] === "w" ? t("obsWrite") : t("obsRead")) + ")"}</title></path>;
                    })}
                    <g>
                      <title>{t("obsTitle") + " · " + t("resource")}</title>
                      <polygon points="230,44 262,62 262,98 230,116 198,98 198,62" fill={th.bg.elevated} stroke={cat[4 % cat.length]} strokeWidth={4} />
                      <text x={280} y={78} fontSize={22} fontWeight={700} fill={th.text.primary}>{t("obsTitle")}</text>
                      <text x={280} y={104} fontSize={16} fill={th.text.secondary}>{t("resource")}</text>
                    </g>
                  </g>
                )}
                {view === "metro" && metro.lines.map((l, li2: number) => {
                  const y = 260 + li2 * 300;
                  const c = cat[li2 % cat.length];
                  return (
                    <g key={l.w}>
                      <text x={20} y={y + 8} fontSize={26} fontWeight={700} fill={c}>{WS[l.w][li]}</text>
                      <line x1={200} y1={y} x2={200 + (l.ps.length - 1) * 290 + 60} y2={y} stroke={c} strokeWidth={10} strokeLinecap="round" />
                      <line x1={200} y1={y} x2={200 + (l.ps.length - 1) * 290 + 60} y2={y} stroke="transparent" strokeWidth={30} style={{ cursor: "pointer" }} onPointerDown={(ev) => ev.stopPropagation()} onClick={() => { setSel("ws:" + l.w); setCopyState(""); }} />
                      {l.ps.map((p: P, j: number) => {
                        const x = 230 + j * 290;
                        const lines = wrap(nm(p), 20);
                        return (
                          <g key={p[0]} style={{ cursor: "pointer" }} onClick={() => { setSel(p[0]); setCopyState(""); }} onPointerDown={(ev) => ev.stopPropagation()}>
                            <title>{nm(p) + " · " + p[8] + " · " + st(p[6]) + " · " + st(problemOf(p))}</title>
                            <rect x={x - 130} y={y - 90} width={260} height={110 + lines.length * 24 + 30} fill="transparent" />
                            {markG(p[8], x, y - 58, 18, false)}
                            <circle cx={x} cy={y} r={14} fill={th.bg.elevated} stroke={colorOf(p)} strokeWidth={6} />
                            {lines.map((ln: string, i: number) => (
                              <text key={i} x={x} y={y + 44 + i * 24} textAnchor="middle" fontSize={20} fontWeight={500} fill={th.text.primary}>{ln}</text>
                            ))}
                            <text x={x} y={y + 48 + lines.length * 24} textAnchor="middle" fontSize={17} fill={colorOf(p)}>{st(p[6])}</text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </g>
            </svg>

            <div style={{ ...overlay, left: 10, bottom: 10, maxWidth: 260, pointerEvents: "none", lineHeight: 1.7 }}>
              {view === "net" ? (
                <Fragment>
                  <div><svg width={30} height={8}><line x1={0} y1={4} x2={30} y2={4} stroke={th.border.strong} strokeWidth={3} /></svg> {t("legOwner")}</div>
                  <div><svg width={30} height={8}><line x1={0} y1={4} x2={30} y2={4} stroke={th.border.strong} strokeWidth={3} strokeDasharray="6 4" /></svg> {t("legLinked")}</div>
                </Fragment>
              ) : (
                <div>{WS_ORDER.map((w: string, i: number) => <span key={w} style={{ marginRight: 10, whiteSpace: "nowrap" }}>{swatch(cat[i % cat.length], false)}{WS[w][li]}</span>)}</div>
              )}
              <div>{swatch(th.text.success, true)}{st("aktív")}</div>
              <div>{swatch(th.text.warning, true)}{st("elavult")} / {st("blokkolt")}</div>
              <div>{swatch(th.text.danger, true)}{st("leállítva")}</div>
              <div>{swatch(th.text.accent, true)}{t("planned")}</div>
              <div>{swatch(th.text.tertiary, true)}{t("other")}</div>
            </div>

            {view === "net" && tapped && (
              <div style={{ ...overlay, top: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", maxWidth: "70%" }}>
                <span style={{ overflowWrap: "anywhere" }}><strong>{tapped.dashed ? t("edgeLinked") : t("edgeOwner")}:</strong> {tapped.a.slice(2)} → {pos[tapped.b]?.name ?? ""}</span>
                <Button label={t("jumpCard")} onClick={() => jump(tapped.b)} />
              </div>
            )}

            {sel !== "" && (() => {
              const list = sel.startsWith("ws:") ? D.filter((p: P) => p[13] === sel.slice(3) && procs.includes(p)) : D.filter((p: P) => p[0] === sel);
              const head = sel.startsWith("ws:") ? WS[sel.slice(3)][li] : list[0] ? nm(list[0]) : "";
              const msgOf = (p: P) => `Pontosítás kérése – folyamat: ${p[0]} – ${p[1]}. Hiányzó/gyenge mezők: ${[...(UNK2[p[0]] ?? []).map((f: string) => FIELD_HU[f]), ...(p[10] === "ismeretlen" || p[10] === "nem ellenőrzött" ? ["utolsó futás"] : [])].join(", ") || "nincs"}.`;
              const msg = list.map(msgOf).join("\n");
              const copy = () => {
                try {
                  navigator.clipboard.writeText(msg).then(() => setCopyState("ok"), () => setCopyState("fail"));
                } catch { setCopyState("fail"); }
              };
              return (
                <div style={{ ...overlay, right: 10, bottom: 10, width: 440, maxWidth: "calc(100% - 20px)", maxHeight: mapH - 40, overflowY: "auto", fontSize: 14 }} onPointerDown={(ev) => ev.stopPropagation()}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                    <strong style={{ fontSize: 16, overflowWrap: "anywhere" }}>{head}</strong>
                    <Button label={t("close")} onClick={() => { setSel(""); setCopyState(""); }} />
                  </div>
                  {list.map((p: P) => (
                    <div key={p[0]} style={{ borderTop: `1px solid ${th.border.subtle}`, marginTop: 8, paddingTop: 8 }}>
                      {sel.startsWith("ws:") && <div style={{ fontWeight: 600, overflowWrap: "anywhere" }}>{nm(p)}</div>}
                      <div style={{ overflowWrap: "anywhere" }}><strong>{t("schedule")}:</strong> {p[7]}</div>
                      <div><strong>{t("status")}:</strong> {st(p[6])} · {st(problemOf(p))}</div>
                      <div style={{ overflowWrap: "anywhere" }}><strong>{t("last")}:</strong> {p[10]}</div>
                      {p[12] && <div style={{ overflowWrap: "anywhere" }}><strong>{t("note")}:</strong> {p[12]}</div>}
                      {["cmd", "cond", "does", "art", "obs"].map((f: string, k: number) => <div key={f} style={{ overflowWrap: "anywhere", marginTop: 2 }}><strong>{FIELD[f][li]}:</strong> {(DET[p[0]] ?? [])[k] || <span style={{ color: th.text.warning, fontWeight: 600 }}>{t("awaiting")}</span>}</div>)}
                      <div style={{ marginTop: 6 }}><Button label={t("jumpCard")} onClick={() => jump(p[0])} /></div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8 }}><Button label={t("ask")} onClick={copy} variant="primary" /></div>
                  {copyState === "ok" && <div style={{ marginTop: 6, color: th.text.success }}>{t("copied")}</div>}
                  {copyState === "fail" && (
                    <div style={{ marginTop: 6 }}>
                      <div>{t("copyFail")}</div>
                      <textarea readOnly value={msg} rows={Math.min(8, list.length * 2 + 1)} style={{ width: "100%", font: "inherit", fontSize: 13, background: th.bg.base, color: th.text.primary, colorScheme: th.kind, border: `1px solid ${th.border.default}`, borderRadius: 6, padding: 6, userSelect: "text" }} onFocus={(e) => e.currentTarget.select()} />
                    </div>
                  )}
                </div>
              );
            })()}

            {view === "net" && focus && (
              <div style={{ ...overlay, top: 10, right: 10, width: 300, maxHeight: mapH - 40, overflowY: "auto" }} onPointerDown={(ev) => ev.stopPropagation()}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  {markIcon(focus, 34)}
                  <strong style={{ fontSize: 15, overflowWrap: "anywhere" }}>{focus} — {t("procsOf")} ({focusProcs.length})</strong>
                </div>
                {focusProcs.map((p: P) => (
                  <button key={p[0]} onClick={() => jump(p[0])} style={{ display: "flex", gap: 8, alignItems: "flex-start", width: "100%", background: "transparent", border: "none", padding: "6px 0", textAlign: "left", cursor: "pointer", color: th.text.primary, font: "inherit", fontSize: 14 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 6, background: colorOf(p), marginTop: 4, flex: "none" }} />
                    <span style={{ whiteSpace: "normal", overflowWrap: "anywhere" }}>{nm(p)} · {st(p[6])}{p[8] !== focus ? " · " + t("legLinked") : ""}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Section heading={t("saver")} caption={t("saverCap")}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <Button label={t("stopSel")} variant="primary" onClick={() => { if (picked.length) copyTxt(actText("stop", picked, lang === "HU"), t("copiedShort")); }} />
          <Button label={t("restartSel")} onClick={() => { if (picked.length) copyTxt(actText("restart", picked, lang === "HU"), t("copiedShort")); }} />
        </div>
        <div style={{ border: `1px solid ${th.border.subtle}`, borderRadius: th.radius.md, color: th.text.primary }}>
          {EXT.map((p: P, i: number) => (
            <div key={p[0]} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", padding: "6px 10px", borderTop: i ? `1px solid ${th.border.subtle}` : "none" }}>
              <input type="checkbox" checked={picked.includes(p[0])} onChange={() => setPicked((xs: string[]) => xs.includes(p[0]) ? xs.filter((x: string) => x !== p[0]) : [...xs, p[0]])} aria-label={nm(p)} />
              <span style={{ flex: "1 1 220px", overflowWrap: "anywhere" }}><strong>{nm(p)}</strong> · {p[8]}</span>
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: th.fill.secondary, color: isPaused(p) ? th.text.tertiary : th.text.success }}>{isPaused(p) ? t("paused") : t("running")}</span>
              <Button label={isPaused(p) ? t("restartBtn") : t("stopBtn")} onClick={() => copyTxt(actText(isPaused(p) ? "restart" : "stop", [p[0]], lang === "HU"), t("copiedShort"))} />
            </div>
          ))}
        </div>
      </Section>

      <Section heading={t("cards")}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <Segmented options={[{ value: "ALL", label: t("all") }, { value: "core", label: t("cat_core") }, { value: "sales", label: t("cat_sales") }, { value: "ext", label: t("cat_ext") }]} value={catF} onChange={setCatF} />
          <span style={{ fontSize: 12, color: th.text.secondary }}>{t("proposal")}</span>
        </div>
        <Segmented options={[{ value: "ALL", label: t("all"), count: D.length }, ...STATUSES.map((s: string) => ({ value: s, label: st(s), count: D.filter((p: P) => p[6] === s).length }))]} value={filter} onChange={setFilter} />
        <Grid columns={3}>
          {shown.map((p: P) => (
            <div key={p[0]} id={"card-" + p[0]} style={{ borderRadius: th.radius.lg, outline: flash === p[0] ? `3px solid ${th.text.accent}` : "3px solid transparent", outlineOffset: 2, color: th.text.primary, background: flash === p[0] ? th.fill.accentSubtle : "transparent" }}>
              <Section heading={nm(p)}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {markIcon(p[8], 34)}
                  <span style={{ fontWeight: 600, color: th.text.primary, overflowWrap: "anywhere" }}>{p[8]}{DEVICES.includes(p[8]) ? " · " + t("device") : ""}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(90px, max-content) 1fr", columnGap: 16, rowGap: 6, fontSize: 14, color: th.text.primary, alignItems: "center" }}>
                  {[
                    { label: t("status"), value: <Status tone={p[6] === "aktív" ? "success" : p[6] === "blokkolt" ? "warning" : p[6] === "csak tervezett" ? "accent" : "neutral"}>{st(p[6])}</Status> },
                    { label: t("problem"), value: <Status tone={problemOf(p) === "OK" ? "success" : problemOf(p) === "leállítva" ? "danger" : "warning"}>{st(problemOf(p))}</Status> },
                    { label: t("ws"), value: WS[p[13]][li] },
                    { label: t("schedule"), value: p[7] },
                    ...(p[9].length ? [{ label: t("linked"), value: p[9].join(", ") }] : []),
                    { label: t("last"), value: p[10] },
                    ...(p[12] ? [{ label: t("note"), value: p[12] }] : []),
                  ].map((r: { label: string; value: any }, i: number) => (
                    <Fragment key={i}><span style={{ color: th.text.secondary }}>{r.label}</span><span style={{ overflowWrap: "anywhere" }}>{r.value}</span></Fragment>
                  ))}
                </div>
                <div style={{ marginTop: 6, color: th.text.primary, fontSize: 14 }}>
                  <div><strong>{t("cmdHead")}</strong> <span style={{ fontSize: 12, color: th.text.secondary }}>({t("ownerSum")})</span></div>
                  {(DET[p[0]] ?? [])[0] ? (
                    <div>
                      <div style={openCmd.includes(p[0]) ? { overflowWrap: "anywhere" } : { overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{DET[p[0]][0]}{DET[p[0]][1] ? " — " + DET[p[0]][1] : ""}</div>
                      <button type="button" aria-expanded={openCmd.includes(p[0])} onClick={() => setOpenCmd((xs: string[]) => xs.includes(p[0]) ? xs.filter((x: string) => x !== p[0]) : [...xs, p[0]])} style={{ background: "none", border: "none", padding: 0, color: th.text.accent, cursor: "pointer", fontSize: 13 }}>{openCmd.includes(p[0]) ? t("less") : t("more")}</button>
                    </div>
                  ) : <span style={{ color: th.text.warning, fontWeight: 600 }}>{t("awaiting")}</span>}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 6 }}>
                  <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: th.fill.secondary, color: th.text.secondary }}>{t("cat_" + CAT[p[0]])} · {t("proposal")}</span>
                  {isPaused(p) && <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 10, background: th.fill.secondary, color: th.text.tertiary }}>{t("paused")}</span>}
                  {isPaused(p) ? <Button label={t("restartBtn")} onClick={() => copyTxt(actText("restart", [p[0]], lang === "HU"), t("copiedShort"))} /> : CAT[p[0]] !== "core" && <Button label={t("stopBtn")} onClick={() => copyTxt(actText("stop", [p[0]], lang === "HU"), t("copiedShort"))} />}
                </div>
              </Section>
            </div>
          ))}
        </Grid>
        <Text>{t("dataLang")}</Text>
      </Section>

      <Section heading={t("marks")} collapsible defaultOpen={false}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {BOTS.map((b: string) => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>{markIcon(b, 30)}<span style={{ color: th.text.secondary }}>{b}</span></div>
          ))}
        </div>
        <Text>{t("gaps")}: {GAPS.join(", ")}.</Text>
        <Text>{t("shapeNote")}</Text>
      </Section>
      </div>
      )}
      <footer data-testid="app-version" style={{ marginTop: 16, fontSize: 12, color: th.text.tertiary, textAlign: "center" }}>ops-dashboard v{__APP_VERSION__} · CHANGELOG.md</footer>
      </div>
      {toast !== "" && <div role="status" style={{ position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 10000, margin: "0 auto", maxWidth: 560, background: th.bg.elevated, color: th.text.primary, border: `1px solid ${th.border.strong}`, borderRadius: th.radius.md, padding: "10px 14px", overflowWrap: "anywhere", userSelect: "text" }}>{toast}</div>}
    </Page>
  );
}


