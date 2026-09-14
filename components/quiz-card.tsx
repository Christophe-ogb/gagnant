"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Crown, Download, Flame, RotateCcw, X, XCircle } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { awardQuestion, completeQuiz, getProgress, saveProgress } from "@/lib/progress";
import type { Quiz } from "@/lib/types";

type Props = { heritageId: string; heritageName: string; challenge?: { badge: string; accroche: string; encouragement: string }; quiz: Quiz | Quiz[] };
type Answer = { selectedIndex: number; isCorrect: boolean };
type PresentedQuestion = { question: Quiz; options: { text: string; originalIndex: number }[] };

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function createRound(quiz: Quiz[]): PresentedQuestion[] {
  return shuffle(quiz).map((question) => ({
    question,
    options: shuffle(question.options.map((text, originalIndex) => ({ text, originalIndex }))),
  }));
}

export function QuizCard({ heritageId, heritageName, challenge, quiz }: Props) {
  const questions = Array.isArray(quiz) ? quiz : [quiz];
  const totalPoints = questions.reduce((sum, item) => sum + item.points, 0);
  const [isOpen, setIsOpen] = useState(false);
  const [round, setRound] = useState<PresentedQuestion[]>(() => createRound(questions));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const alreadyCompleted = useSyncExternalStore(() => () => undefined, () => getProgress().completedQuizIds.includes(heritageId), () => false);
  const currentQuestion = round[questionIndex];
  const isFinished = answers.length === round.length;
  const correctCount = answers.filter((item) => item.isCorrect).length;
  const earnedPoints = answers.reduce((sum, item, index) => sum + (item.isCorrect ? round[index].question.points : 0), 0);
  const hasWon = correctCount === questions.length;

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  function burst(particleCount: number) {
    confetti({ particleCount, spread: particleCount > 50 ? 72 : 38, origin: { y: 0.7 }, colors: ["#D4AF37", "#C5A059", "#F4F1EA"] });
  }

  function restart() { setRound(createRound(questions)); setQuestionIndex(0); setAnswers([]); setSelectedIndex(null); }

  function answer(index: number) {
    if (selectedIndex !== null || isFinished) return;
    const isCorrect = currentQuestion.options[index].originalIndex === currentQuestion.question.reponseCorrecteIndex;
    const nextAnswers = [...answers, { selectedIndex: index, isCorrect }];
    setSelectedIndex(index);
    setAnswers(nextAnswers);
    if (isCorrect) {
      const questionId = `${heritageId}:${currentQuestion.question.question}`;
      saveProgress(awardQuestion(getProgress(), questionId, currentQuestion.question.points));
      burst(22);
    }
    window.setTimeout(() => {
      setSelectedIndex(null);
      if (questionIndex < round.length - 1) { setQuestionIndex((value) => value + 1); return; }
      if (nextAnswers.every((item) => item.isCorrect) && !alreadyCompleted) {
        saveProgress(completeQuiz(getProgress(), heritageId, 0));
        burst(130);
      }
    }, 4000);
  }

  function returnToStory() {
    setIsOpen(false);
    window.setTimeout(() => document.getElementById("parcours")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  const badgeName = challenge?.badge ?? `Badge Royal de ${heritageName}`;
  const displayedPlayerName = playerName.trim() || "Explorateur·rice";

  function rewardUrl(score: number, completed: boolean) {
    const params = new URLSearchParams({
      user: displayedPlayerName,
      score: String(score),
      status: completed ? "complete" : "progress",
    });
    return `${window.location.origin}/recompense/${encodeURIComponent(heritageId)}?${params.toString()}`;
  }

  async function copyRewardLink(score = totalPoints, completed = true) {
    try {
      await navigator.clipboard.writeText(rewardUrl(score, completed));
      setCopied(true); window.setTimeout(() => setCopied(false), 2200);
    } catch { setCopied(false); }
  }

  async function downloadRewardCard(score = totalPoints, completed = true) {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext("2d");
    if (!context) return;

    const logo = new Image();
    logo.src = "/games/logoweb_BJ.jpg.jpeg";
    await new Promise<void>((resolve) => { logo.onload = () => resolve(); logo.onerror = () => resolve(); });
    const gradient = context.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, "#1a120b");
    gradient.addColorStop(1, "#3b2815");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1200, 630);
    context.strokeStyle = "#d4af37";
    context.lineWidth = 5;
    context.strokeRect(26, 26, 1148, 578);
    // Un seul logo, centré dans l'en-tête avec le nom de la marque.
    context.textAlign = "left";
    if (logo.complete && logo.naturalWidth) context.drawImage(logo, 350, 290, 970, 1100, 408, 43, 112, 128);
    context.fillStyle = "#d4af37";
    context.font = "700 24px sans-serif";
    context.fillText("JEUX", 546, 83);
    context.fillStyle = "#f4f1ea";
    context.font = "700 34px serif";
    context.fillText("GAGNANTS 229", 546, 122);

    context.textAlign = "center";
    context.fillStyle = "#f4f1ea";
    context.font = "700 49px serif";
    context.fillText(completed ? "VICTOIRE ÉCLATANTE !" : "PARCOURS EN COURS", 600, 238);
    context.fillStyle = "#d4af37";
    context.font = "700 52px sans-serif";
    context.fillText(`+${score} POINTS DE SAGESSE`, 600, 320);
    context.fillStyle = "#f4f1ea";
    context.font = "600 35px sans-serif";
    context.fillText(displayedPlayerName.slice(0, 34), 600, 390);
    context.fillStyle = "#d8cfc4";
    context.font = "500 25px sans-serif";
    context.fillText(`Épreuve de ${heritageName}`.slice(0, 54), 600, 438);
    context.fillStyle = "#d4af37";
    context.font = "600 27px sans-serif";
    context.fillText(`👑 ${completed ? `Gardien du Patrimoine de ${heritageName}` : `Explorateur de ${heritageName}`}`.slice(0, 60), 600, 485);
    context.fillStyle = "#d8cfc4";
    context.font = "italic 22px sans-serif";
    context.fillText("Peux-tu battre mon score sur https://gagnant.vercel.app/ ?", 600, 555);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `gagnants-229-${heritageId}-${completed ? "carte-victoire-v4" : "carte-score-v4"}.png`;
    link.click();
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2200);
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/60 bg-[#20140d] p-4 shadow-[0_0_34px_rgba(212,175,55,0.2)] sm:p-8" aria-labelledby="epreuve">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_82%_14%,rgba(212,175,55,0.18),transparent_34%)]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-gold"><Crown aria-hidden="true" size={15} /> Épreuve du Connaisseur</span>
        <Flame className="mt-6 text-gold" aria-hidden="true" size={34} />
        <h2 id="epreuve" className="font-display mt-4 max-w-xl text-2xl leading-snug text-white sm:text-3xl">{challenge?.accroche ?? `Penses-tu vraiment avoir percé les secrets de ${heritageName}, ou as-tu juste survolé l’histoire ?`}</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-kaolin/75 sm:text-base"><strong className="text-gold">{totalPoints} points</strong>, soit <strong className="text-gold">{questions[0]?.points ?? 20} points</strong> par bonne réponse, et le <strong className="text-gold">{challenge?.badge ?? `Badge Royal de ${heritageName}`}</strong> sont en jeu.</p>
        <button type="button" onClick={() => { restart(); setIsOpen(true); }} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth shadow-[0_12px_30px_rgba(212,175,55,0.2)] transition hover:bg-[#ebc94e] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><Flame aria-hidden="true" size={18} /> Entrer dans l’arène</button>
      </div>

      <AnimatePresence>
        {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-end bg-black/75 backdrop-blur-sm sm:place-items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="defi-title">
          <motion.div initial={{ opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 28, scale: 0.98 }} transition={{ type: "spring", stiffness: 230, damping: 26 }} className="max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-gold/55 bg-[#20140d] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_0_60px_rgba(212,175,55,0.22)] sm:max-h-[90vh] sm:rounded-3xl sm:p-7">
            <div className="flex items-center justify-between gap-3"><p className="min-w-0 truncate text-xs font-extrabold uppercase tracking-[0.12em] text-gold"><Flame className="mr-2 inline-block" aria-hidden="true" size={16} /> Épreuve du Connaisseur</p><button type="button" onClick={() => setIsOpen(false)} className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 text-kaolin/75 transition hover:border-gold hover:text-gold active:scale-95" aria-label="Fermer le défi"><X aria-hidden="true" size={19} /></button></div>
            {isFinished ? (hasWon ? (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-7 text-center"><motion.div initial={{ rotate: -20, scale: 0.7 }} animate={{ rotate: 360, scale: 1 }} transition={{ type: "spring", stiffness: 130, damping: 12 }} className="mx-auto grid size-22 place-items-center rounded-full border-2 border-gold bg-gold/15 text-gold shadow-[0_0_36px_rgba(212,175,55,0.38)]"><Crown aria-hidden="true" size={40} /></motion.div><h2 id="defi-title" className="font-display mt-6 text-3xl text-white">VICTOIRE ÉCLATANTE !</h2><p className="font-display mt-5 text-4xl text-gold">+{totalPoints} <span className="text-lg">POINTS DE SAGESSE</span></p><p className="mt-4 text-sm text-kaolin/70">Épreuve de {heritageName}</p><p className="mt-2 font-bold text-gold">👑 Gardien du Patrimoine de {heritageName}</p><label className="mx-auto mt-6 block max-w-sm text-left"><span className="text-xs font-bold uppercase tracking-[0.12em] text-gold">Ton nom sur la carte</span><input value={playerName} onChange={(event) => setPlayerName(event.target.value)} maxLength={34} placeholder="Ex. Christophe OGOUBIYI" className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-earth/60 px-3 text-sm text-white outline-none placeholder:text-kaolin/40 focus:border-gold" /></label><div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row"><button type="button" onClick={() => copyRewardLink(totalPoints, true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gold/45 bg-gold/10 px-4 py-2 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth active:scale-95">{copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}{copied ? "Lien copié !" : "Copier mon lien"}</button><button type="button" onClick={() => downloadRewardCard(totalPoints, true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95">{downloaded ? <Check aria-hidden="true" size={17} /> : <Download aria-hidden="true" size={17} />}{downloaded ? "Carte téléchargée" : "Télécharger ma carte"}</button></div><p className="mt-3 text-xs text-kaolin/55">« Peux-tu battre mon score sur https://gagnant.vercel.app/ ? »</p></motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-5 text-center"><XCircle className="mx-auto text-laterite" aria-hidden="true" size={46} /><p className="font-display mt-5 text-2xl text-white">Tu ne connais pas encore assez {heritageName}.</p><p className="mt-3 text-sm leading-6 text-kaolin/75">Tu as obtenu <strong className="text-gold">{earnedPoints} / {totalPoints} points</strong> avec {correctCount} bonne{correctCount > 1 ? "s" : ""} réponse{correctCount > 1 ? "s" : ""}. Retourne voir les lieux, relis leurs histoires, puis reviens relever le défi.</p><label className="mx-auto mt-5 block max-w-sm text-left"><span className="text-xs font-bold uppercase tracking-[0.12em] text-gold">Ton nom sur la carte</span><input value={playerName} onChange={(event) => setPlayerName(event.target.value)} maxLength={34} placeholder="Ex. Christophe OGOUBIYI" className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-earth/60 px-3 text-sm text-white outline-none placeholder:text-kaolin/40 focus:border-gold" /></label><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={returnToStory} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gold/45 bg-gold/10 px-4 py-2 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth active:scale-95">Revoir l’histoire des lieux</button><button type="button" onClick={restart} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95"><RotateCcw aria-hidden="true" size={16} /> Retenter le défi</button></div><div className="mt-3 flex flex-col justify-center gap-2 sm:flex-row"><button type="button" onClick={() => copyRewardLink(earnedPoints, false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gold/45 bg-gold/10 px-4 py-2 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth active:scale-95">{copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}{copied ? "Lien copié !" : "Partager mon score"}</button><button type="button" onClick={() => downloadRewardCard(earnedPoints, false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-extrabold text-kaolin transition hover:border-gold hover:text-gold active:scale-95">{downloaded ? <Check aria-hidden="true" size={17} /> : <Download aria-hidden="true" size={17} />}{downloaded ? "Carte téléchargée" : "Télécharger ma carte"}</button></div></motion.div>
            )) : (
              <div className="pt-6"><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${((questionIndex + 1) / round.length) * 100}%` }} /></div><div className="mt-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-kaolin/60">Question {questionIndex + 1} / {round.length}</p><h2 id="defi-title" className="font-display mt-2 text-xl leading-7 text-white sm:text-2xl">{currentQuestion.question.question}</h2></div><span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-extrabold text-gold">+{currentQuestion.question.points} pts</span></div><div className="mt-5 grid gap-3" aria-live="polite">{currentQuestion.options.map((option, index) => { const isSelected = selectedIndex === index; const isCorrect = isSelected && option.originalIndex === currentQuestion.question.reponseCorrecteIndex; const isWrong = isSelected && !isCorrect; const stateClass = isCorrect ? "border-emerald-400 bg-emerald-500/20 text-white" : isWrong ? "border-laterite bg-laterite/20 text-white" : "border-white/12 bg-earth/40 text-kaolin/85 hover:border-gold/50 hover:bg-white/10"; return <button key={`${option.originalIndex}-${option.text}`} type="button" onClick={() => answer(index)} disabled={selectedIndex !== null} className={`flex min-h-13 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-95 disabled:cursor-default ${stateClass}`}><span className="grid size-6 shrink-0 place-items-center rounded-full border border-current/40 text-xs">{String.fromCharCode(65 + index)}</span><span>{option.text}</span>{isWrong && <XCircle className="ml-auto text-red-200" aria-hidden="true" size={19} />}{isCorrect && <Check className="ml-auto text-emerald-200" aria-hidden="true" size={19} />}</button>; })}</div>{selectedIndex !== null && <p className={`mt-4 rounded-xl border p-3 text-sm ${currentQuestion.options[selectedIndex].originalIndex === currentQuestion.question.reponseCorrecteIndex ? "border-emerald-400/45 bg-emerald-500/15 text-emerald-100" : "border-laterite/50 bg-laterite/15 text-kaolin/90"}`}>{currentQuestion.options[selectedIndex].originalIndex === currentQuestion.question.reponseCorrecteIndex ? `Bravo ! Bonne réponse : ${currentQuestion.options[selectedIndex].text}. La prochaine question arrive dans quelques secondes…` : `Pas encore. La bonne réponse était : ${currentQuestion.question.options[currentQuestion.question.reponseCorrecteIndex]}. La prochaine question arrive dans quelques secondes…`}</p>}</div>
            )}
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </section>
  );
}
