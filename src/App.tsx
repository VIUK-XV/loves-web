import { FormEvent, useEffect, useMemo, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  CardCategory,
  CardLevel,
  cards,
  categoryLabels,
  levelLabels,
  QuestionCard,
} from "./data/cards";
import { Room, ensureAnonymousSession, isSupabaseConfigured, supabase } from "./lib/supabase";
import { shuffleWithSeed } from "./lib/shuffle";

type Route =
  | { name: "home" }
  | { name: "room"; roomCode: string };

type ToastState = {
  message: string;
  tone: "success" | "error";
};

type CategoryFilter = "all" | CardCategory;
type LevelFilter = "all" | CardLevel;

const categoryOptions = Object.entries(categoryLabels) as [CardCategory, string][];
const levelOptions: CardLevel[] = [1, 2, 3];

function parseRoute(): Route {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);

  if (parts[0] === "room" && parts[1]) {
    return { name: "room", roomCode: sanitizeRoomCode(parts[1]) };
  }

  return { name: "home" };
}

function roomUrl(roomCode: string) {
  return `${window.location.origin}${window.location.pathname}#/room/${roomCode}`;
}

function sanitizeRoomCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function extractRoomCode(value: string) {
  const trimmedValue = value.trim();
  const roomMatch = trimmedValue.match(/\/room\/([A-Za-z0-9]+)/);
  if (roomMatch?.[1]) {
    return sanitizeRoomCode(roomMatch[1]);
  }

  const hashMatch = trimmedValue.match(/#\/room\/([A-Za-z0-9]+)/);
  if (hashMatch?.[1]) {
    return sanitizeRoomCode(hashMatch[1]);
  }

  return sanitizeRoomCode(trimmedValue);
}

function makeRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function makeSeed() {
  const bytes = new Uint32Array(2);
  crypto.getRandomValues(bytes);
  return `${Date.now().toString(36)}-${bytes[0].toString(36)}-${bytes[1].toString(36)}`;
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Some in-app browsers deny clipboard access even after a button tap.
    }
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "true");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  return copied;
}

function readableErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("Anonymous sign-ins are disabled")) {
    return "Supabaseで匿名ログインを有効にしてください。Auth > Sign In / Providers > Anonymous をONにします。";
  }

  if (message.includes("Could not find the function") || message.includes("schema cache")) {
    return "SupabaseにSQLがまだ適用されていません。web/supabase/schema.sql をSQL Editorで実行してください。";
  }

  if (message.includes("JWT") || message.includes("Invalid API key")) {
    return "SupabaseのURLかanon keyが正しくありません。設定を確認してください。";
  }

  return message || fallback;
}

export function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <main className="app-shell">
      {route.name === "home" ? <HomeScreen /> : <RoomScreen roomCode={route.roomCode} />}
    </main>
  );
}

function HomeScreen() {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showError = (message: string) => setToast({ message, tone: "error" });
  const showSuccess = (message: string) => setToast({ message, tone: "success" });

  async function createRoom() {
    if (!supabase || !isSupabaseConfigured) {
      showError("SupabaseのURLとanon keyを設定してください。");
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      await ensureAnonymousSession();

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const code = makeRoomCode();
        const seed = makeSeed();
        const result = await supabase.rpc("create_room", {
          p_room_code: code,
          p_seed: seed,
        });

        if (!result.error) {
          window.location.hash = `/room/${code}`;
          return;
        }

        if (!result.error.message.includes("duplicate")) {
          throw result.error;
        }
      }

      throw new Error("部屋コードの作成に失敗しました。もう一度試してください。");
    } catch (error) {
      showError(readableErrorMessage(error, "部屋を作れませんでした。"));
    } finally {
      setLoading(false);
    }
  }

  function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = extractRoomCode(roomCode);
    if (!code) {
      showError("部屋コードを入力してください。");
      return;
    }
    window.location.hash = `/room/${code}`;
  }

  async function copyCurrentUrl() {
    const copied = await copyText(window.location.href);
    if (copied) {
      showSuccess("URLをコピーしました。");
    } else {
      showError("コピーできませんでした。URLを長押ししてコピーしてください。");
    }
  }

  return (
    <section className="home-screen">
      <div className="brand-mark">♡</div>
      <h1>質問カード</h1>
      <p className="lead">2人で同じカードを見ながら、ゆっくり話せるWeb版です。</p>

      {!isSupabaseConfigured ? (
        <div className="notice error">
          Supabaseの設定がありません。`VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を設定してください。
        </div>
      ) : null}

      {toast ? <div className={`notice ${toast.tone}`}>{toast.message}</div> : null}

      <div className="action-stack">
        <button className="primary-button" onClick={createRoom} disabled={loading}>
          {loading ? "作成中..." : "部屋を作る"}
        </button>

        <form className="join-form" onSubmit={joinRoom}>
          <label htmlFor="room-code">部屋に入る</label>
          <div className="join-row">
            <input
              id="room-code"
              value={roomCode}
              onChange={(event: { target: { value: string } }) => setRoomCode(event.target.value)}
              placeholder="部屋コードか共有URL"
              inputMode="text"
              autoCapitalize="characters"
            />
            <button type="submit">入る</button>
          </div>
        </form>

        <button className="ghost-button" onClick={copyCurrentUrl}>
          共有URLをコピー
        </button>
      </div>

      <div className="how-to">
        <h2>使い方</h2>
        <ol>
          <li>どちらかが部屋を作ります。</li>
          <li>共有URLを相手に送ります。</li>
          <li>同じ部屋に入ると、カードの進み方が同期されます。</li>
        </ol>
        <p>回答は保存しません。共有されるのは、今どのカードを見ているかだけです。</p>
      </div>
    </section>
  );
}

function RoomScreen({ roomCode }: { roomCode: string }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState("部屋を読み込み中...");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [presenceCount, setPresenceCount] = useState(1);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("all");

  const orderedCards = useMemo(() => {
    return room ? shuffleWithSeed(cards, room.seed) : cards;
  }, [room]);

  const currentIndex = room ? clampIndex(room.current_index, orderedCards.length) : 0;
  const currentCard = orderedCards[currentIndex];
  const matchingIndexes = useMemo(
    () =>
      orderedCards
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => {
          const categoryMatches = selectedCategory === "all" || card.category === selectedCategory;
          const levelMatches = selectedLevel === "all" || card.level === selectedLevel;
          return categoryMatches && levelMatches;
        })
        .map(({ index }) => index),
    [orderedCards, selectedCategory, selectedLevel],
  );
  const filteredPosition = matchingIndexes.indexOf(currentIndex);
  const progressText =
    selectedCategory === "all" && selectedLevel === "all"
      ? `${currentIndex + 1} / ${orderedCards.length}`
      : filteredPosition >= 0
        ? `${filteredPosition + 1} / ${matchingIndexes.length}`
        : `0 / ${matchingIndexes.length}`;
  const partnerJoined = presenceCount >= 2;

  useEffect(() => {
    let mounted = true;
    let roomChannel: RealtimeChannel | null = null;
    let presenceChannel: RealtimeChannel | null = null;

    async function loadRoom() {
      if (!supabase || !isSupabaseConfigured) {
        setError("Supabaseの設定がありません。");
        setStatus("");
        return;
      }

      setError(null);
      setStatus("部屋を読み込み中...");

      try {
        const user = await ensureAnonymousSession();
        const result = await supabase.rpc("join_room", {
          p_room_code: roomCode,
        });

        if (result.error) {
          throw result.error;
        }

        const joinedRoom = result.data as Room | null;
        if (!joinedRoom) {
          throw new Error("この部屋は見つかりませんでした。");
        }

        if (!mounted) return;

        setRoom(joinedRoom);
        setStatus("");

        roomChannel = supabase
          .channel(`room-db-${joinedRoom.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "rooms",
              filter: `id=eq.${joinedRoom.id}`,
            },
            (payload: { new: Room }) => {
              setRoom(payload.new as Room);
            },
          )
          .subscribe();

        presenceChannel = supabase.channel(`room:${joinedRoom.room_code}`, {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        presenceChannel.on("presence", { event: "sync" }, () => {
          if (!presenceChannel) return;
          const state = presenceChannel.presenceState();
          const count = Object.values(state).reduce((total, entries) => total + entries.length, 0);
          setPresenceCount(Math.max(1, count));
        });

        presenceChannel.subscribe(async (subscribeStatus) => {
          if (subscribeStatus === "SUBSCRIBED") {
            await presenceChannel?.track({
              online_at: new Date().toISOString(),
            });
          }
        });
      } catch (caughtError) {
        if (!mounted) return;
        setError(readableErrorMessage(caughtError, "部屋に入れませんでした。"));
        setStatus("");
      }
    }

    loadRoom();

    return () => {
      mounted = false;
      if (roomChannel) {
        supabase?.removeChannel(roomChannel);
      }
      if (presenceChannel) {
        presenceChannel.untrack();
        supabase?.removeChannel(presenceChannel);
      }
    };
  }, [roomCode]);

  async function updateIndex(nextIndex: number) {
    if (!room || !supabase) return;

    const normalizedIndex = clampIndex(nextIndex, orderedCards.length);
    setSaving(true);
    setToast(null);
    setRoom({ ...room, current_index: normalizedIndex });

    const result = await supabase
      .from("rooms")
      .update({ current_index: normalizedIndex })
      .eq("id", room.id)
      .select()
      .single();

    setSaving(false);

    if (result.error) {
      setToast({ message: "同期に失敗しました。もう一度試してください。", tone: "error" });
      return;
    }

    setRoom(result.data as Room);
  }

  function indexForFilter(category: CategoryFilter, level: LevelFilter) {
    const foundIndex = orderedCards.findIndex((card) => {
      const categoryMatches = category === "all" || card.category === category;
      const levelMatches = level === "all" || card.level === level;
      return categoryMatches && levelMatches;
    });
    return foundIndex >= 0 ? foundIndex : currentIndex;
  }

  function moveInFilter(direction: 1 | -1) {
    if (matchingIndexes.length === 0) return;
    const position = matchingIndexes.indexOf(currentIndex);
    const fallbackPosition = direction > 0 ? -1 : 0;
    const nextPosition = clampIndex(position >= 0 ? position + direction : fallbackPosition, matchingIndexes.length);
    updateIndex(matchingIndexes[nextPosition]);
  }

  function randomInFilter() {
    if (matchingIndexes.length === 0) return;
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % matchingIndexes.length;
    updateIndex(matchingIndexes[randomIndex]);
  }

  function resetInFilter() {
    if (matchingIndexes.length === 0) return;
    updateIndex(matchingIndexes[0]);
  }

  function changeCategory(category: CategoryFilter) {
    setSelectedCategory(category);
    updateIndex(indexForFilter(category, selectedLevel));
  }

  function changeLevel(level: LevelFilter) {
    setSelectedLevel(level);
    updateIndex(indexForFilter(selectedCategory, level));
  }

  async function copyShareUrl() {
    const copied = await copyText(roomUrl(roomCode));
    setToast(
      copied
        ? { message: "共有URLをコピーしました。", tone: "success" }
        : { message: "コピーできませんでした。URLを長押ししてコピーしてください。", tone: "error" },
    );
  }

  if (error) {
    return (
      <section className="room-screen compact">
        <button className="back-link" onClick={() => (window.location.hash = "/")}>
          ホームへ
        </button>
        <div className="notice error">{error}</div>
        <p className="muted">部屋コードを確認して、もう一度入り直してください。</p>
      </section>
    );
  }

  if (!room || !currentCard) {
    return (
      <section className="room-screen compact">
        <p className="muted">{status}</p>
      </section>
    );
  }

  return (
    <section className="room-screen">
      <header className="room-header">
        <button className="back-link" onClick={() => (window.location.hash = "/")}>
          ホーム
        </button>
        <div className="room-code">部屋 {room.room_code}</div>
      </header>

      <div className="presence-pill">{partnerJoined ? "相手が参加中" : "相手を待っています"}</div>

      {toast ? <div className={`notice ${toast.tone}`}>{toast.message}</div> : null}

      <CardFilters
        selectedCategory={selectedCategory}
        selectedLevel={selectedLevel}
        onCategoryChange={changeCategory}
        onLevelChange={changeLevel}
        matchingCount={matchingIndexes.length}
      />

      <QuestionCardView card={currentCard} progressText={progressText} />

      <div className="controls">
        <button onClick={() => moveInFilter(-1)} disabled={saving || matchingIndexes.length === 0 || filteredPosition === 0}>
          戻る
        </button>
        <button onClick={() => moveInFilter(1)} disabled={saving || matchingIndexes.length === 0}>
          次へ
        </button>
        <button onClick={() => moveInFilter(1)} disabled={saving || matchingIndexes.length === 0}>
          パス
        </button>
        <button onClick={randomInFilter} disabled={saving || matchingIndexes.length === 0}>
          ランダム
        </button>
        <button onClick={resetInFilter} disabled={saving || matchingIndexes.length === 0 || filteredPosition === 0}>
          最初から
        </button>
      </div>

      <button className="ghost-button" onClick={copyShareUrl}>
        共有URLをコピー
      </button>
    </section>
  );
}

function CardFilters({
  selectedCategory,
  selectedLevel,
  onCategoryChange,
  onLevelChange,
  matchingCount,
}: {
  selectedCategory: CategoryFilter;
  selectedLevel: LevelFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  onLevelChange: (level: LevelFilter) => void;
  matchingCount: number;
}) {
  return (
    <section className="filter-panel" aria-label="カード条件">
      <div className="filter-row">
        <div className="filter-title">カテゴリ</div>
        <div className="chip-list">
          <button
            className={selectedCategory === "all" ? "chip selected" : "chip"}
            onClick={() => onCategoryChange("all")}
          >
            すべて
          </button>
          {categoryOptions.map(([category, label]) => (
            <button
              key={category}
              className={selectedCategory === category ? "chip selected" : "chip"}
              onClick={() => onCategoryChange(category)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-title">レベル</div>
        <div className="chip-list">
          <button
            className={selectedLevel === "all" ? "chip selected" : "chip"}
            onClick={() => onLevelChange("all")}
          >
            すべて
          </button>
          {levelOptions.map((level) => (
            <button
              key={level}
              className={selectedLevel === level ? "chip selected" : "chip"}
              onClick={() => onLevelChange(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-count">{matchingCount}問</div>
    </section>
  );
}

function QuestionCardView({ card, progressText }: { card: QuestionCard; progressText: string }) {
  return (
    <article className="question-card">
      <div className="card-meta">
        <span>{categoryLabels[card.category]}</span>
        <span>{levelLabels[card.level]}</span>
        <span>{progressText}</span>
      </div>

      <p className="question-text">{card.text}</p>

      {card.followUps?.length ? (
        <ul className="follow-ups">
          {card.followUps.map((followUp) => (
            <li key={followUp}>{followUp}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}
