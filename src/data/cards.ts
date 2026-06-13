export type CardLevel = 1 | 2 | 3;

export type CardCategory =
  | "today"
  | "values"
  | "love"
  | "memory"
  | "future"
  | "praise";

export type QuestionCard = {
  id: string;
  category: CardCategory;
  level: CardLevel;
  text: string;
  followUps?: string[];
};

export const categoryLabels: Record<CardCategory, string> = {
  today: "今日",
  values: "価値観",
  love: "恋愛",
  memory: "思い出",
  future: "未来",
  praise: "ほめる",
};

export const levelLabels: Record<CardLevel, string> = {
  1: "Lv1",
  2: "Lv2",
  3: "Lv3",
};

export const cards: QuestionCard[] = [
  {
    id: "today-1-1",
    category: "today",
    level: 1,
    text: "今日いちばん笑ったことは？",
  },
  {
    id: "today-1-2",
    category: "today",
    level: 1,
    text: "今日の気分を一言で言うと？",
  },
  {
    id: "today-1-3",
    category: "today",
    level: 1,
    text: "最近食べておいしかったものは？",
  },
  {
    id: "today-2-1",
    category: "today",
    level: 2,
    text: "最近ちょっと頑張ったことは？",
  },
  {
    id: "today-2-2",
    category: "today",
    level: 2,
    text: "最近、相手にありがとうと思ったことは？",
  },
  {
    id: "today-2-3",
    category: "today",
    level: 2,
    text: "今日、少しだけ疲れた理由は？",
  },
  {
    id: "today-3-1",
    category: "today",
    level: 3,
    text: "最近、誰かに気づいてほしかったことは？",
  },
  {
    id: "today-3-2",
    category: "today",
    level: 3,
    text: "今、恋人に一番言ってほしい言葉は？",
  },
  {
    id: "today-3-3",
    category: "today",
    level: 3,
    text: "本当は甘えたいけど我慢していることはある？",
  },
  {
    id: "values-1-1",
    category: "values",
    level: 1,
    text: "休日は外に出たい派？家でゆっくりしたい派？",
  },
  {
    id: "values-1-2",
    category: "values",
    level: 1,
    text: "予定はしっかり決めたい？その場で決めたい？",
  },
  {
    id: "values-1-3",
    category: "values",
    level: 1,
    text: "朝と夜、どっちの時間が好き？",
  },
  {
    id: "values-2-1",
    category: "values",
    level: 2,
    text: "自分が大切にされてるなって感じる瞬間は？",
  },
  {
    id: "values-2-2",
    category: "values",
    level: 2,
    text: "忙しいとき、恋人にどう接してほしい？",
  },
  {
    id: "values-2-3",
    category: "values",
    level: 2,
    text: "一緒にいて落ち着く人ってどんな人？",
  },
  {
    id: "values-3-1",
    category: "values",
    level: 3,
    text: "長く続く関係に必要なことは何だと思う？",
  },
  {
    id: "values-3-2",
    category: "values",
    level: 3,
    text: "相手に合わせることと我慢の違いって何だと思う？",
  },
  {
    id: "values-3-3",
    category: "values",
    level: 3,
    text: "恋人にだけは分かってほしい価値観はある？",
  },
  {
    id: "love-1-1",
    category: "love",
    level: 1,
    text: "恋人に言われて嬉しい一言は？",
  },
  {
    id: "love-1-2",
    category: "love",
    level: 1,
    text: "好きな人と一緒に見たい景色は？",
  },
  {
    id: "love-1-3",
    category: "love",
    level: 1,
    text: "デートでされると嬉しいことは？",
  },
  {
    id: "love-2-1",
    category: "love",
    level: 2,
    text: "好きって言葉はたくさん言われたい？たまにがいい？",
  },
  {
    id: "love-2-2",
    category: "love",
    level: 2,
    text: "会う頻度はどれくらいが理想？",
  },
  {
    id: "love-2-3",
    category: "love",
    level: 2,
    text: "恋人のどんなところにきゅんとする？",
  },
  {
    id: "love-3-1",
    category: "love",
    level: 3,
    text: "理想のカップル像は？",
  },
  {
    id: "love-3-2",
    category: "love",
    level: 3,
    text: "不安になったとき、どうやって安心したい？",
  },
  {
    id: "love-3-3",
    category: "love",
    level: 3,
    text: "好きな人にだけ見せる自分ってある？",
  },
  {
    id: "memory-1-1",
    category: "memory",
    level: 1,
    text: "小さい頃、よく遊んでいたことは？",
  },
  {
    id: "memory-1-2",
    category: "memory",
    level: 1,
    text: "最近撮った写真でお気に入りは？",
  },
  {
    id: "memory-1-3",
    category: "memory",
    level: 1,
    text: "もう一回行きたい場所は？",
  },
  {
    id: "memory-2-1",
    category: "memory",
    level: 2,
    text: "今年中に一緒にやりたいことは？",
  },
  {
    id: "memory-2-2",
    category: "memory",
    level: 2,
    text: "2人で作りたい思い出は？",
  },
  {
    id: "memory-2-3",
    category: "memory",
    level: 2,
    text: "付き合ってよかったと思う瞬間は？",
  },
  {
    id: "memory-3-1",
    category: "memory",
    level: 3,
    text: "昔の自分に、今の自分から声をかけるなら？",
  },
  {
    id: "memory-3-2",
    category: "memory",
    level: 3,
    text: "忘れたくない2人の出来事は？",
  },
  {
    id: "memory-3-3",
    category: "memory",
    level: 3,
    text: "これから増やしたい思い出はどんなもの？",
  },
  {
    id: "future-1-1",
    category: "future",
    level: 1,
    text: "今ちょっと楽しみにしていることは？",
  },
  {
    id: "future-1-2",
    category: "future",
    level: 1,
    text: "今行きたい場所は？",
  },
  {
    id: "future-1-3",
    category: "future",
    level: 1,
    text: "1日だけ自由に遊べるなら何したい？",
  },
  {
    id: "future-2-1",
    category: "future",
    level: 2,
    text: "これから頑張りたいことは？",
  },
  {
    id: "future-2-2",
    category: "future",
    level: 2,
    text: "相手に応援してほしいことは？",
  },
  {
    id: "future-2-3",
    category: "future",
    level: 2,
    text: "将来、どんな自分になりたい？",
  },
  {
    id: "future-3-1",
    category: "future",
    level: 3,
    text: "ずっと好きでいるために、2人で気をつけたいことは？",
  },
  {
    id: "future-3-2",
    category: "future",
    level: 3,
    text: "この関係で大事にしたいルールは？",
  },
  {
    id: "future-3-3",
    category: "future",
    level: 3,
    text: "2人の未来で、今から大事にしたいことは？",
  },
  {
    id: "praise-1-1",
    category: "praise",
    level: 1,
    text: "相手の好きなところを3つ言うなら？",
  },
  {
    id: "praise-1-2",
    category: "praise",
    level: 1,
    text: "相手のかわいいと思うところは？",
  },
  {
    id: "praise-1-3",
    category: "praise",
    level: 1,
    text: "相手に似合う色は何色だと思う？",
  },
  {
    id: "praise-2-1",
    category: "praise",
    level: 2,
    text: "相手の頑張っていると思うところは？",
  },
  {
    id: "praise-2-2",
    category: "praise",
    level: 2,
    text: "相手に言われて嬉しかったことは？",
  },
  {
    id: "praise-2-3",
    category: "praise",
    level: 2,
    text: "相手の安心できるところは？",
  },
  {
    id: "praise-3-1",
    category: "praise",
    level: 3,
    text: "相手にもっと自信を持ってほしいところは？",
  },
  {
    id: "praise-3-2",
    category: "praise",
    level: 3,
    text: "相手が気づいていない魅力は？",
  },
  {
    id: "praise-3-3",
    category: "praise",
    level: 3,
    text: "これからも大切にしたい相手の一面は？",
  },
];
