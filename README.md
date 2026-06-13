# Loves Web

スマホのブラウザで2人同じ質問カードを見られるWeb版です。既存のSwiftUIアプリとは別に、`web/` 配下だけで動きます。

## ローカル起動

```bash
cd Loveds/web
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` にはSupabaseの値を入れます。

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

## Supabase設定

1. Supabaseで新しいプロジェクトを作る
2. Authentication > Providers で Anonymous sign-ins を有効にする
3. SQL Editorで `supabase/schema.sql` を実行する
4. Project Settings > API から URL と anon key を `.env.local` に設定する

保存するのは部屋情報と現在のカード位置だけです。回答本文は保存しません。

## GitHub Pages公開

GitHubリポジトリの Settings > Secrets and variables > Actions に以下を追加します。

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

その後、Settings > Pages で Source を GitHub Actions にします。`main` ブランチへpushすると `.github/workflows/deploy-loveds-web.yml` が `Loveds/web/dist` を公開します。

## 動作確認

```bash
cd Loveds/web
npm run typecheck
npm run build
```

2つのブラウザで同じ `#/room/{room_code}` を開き、「次へ」「戻る」「最初から」が同期されることを確認します。
