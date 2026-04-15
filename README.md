# chinese-vocab-quiz

中国語の単語帳を Notion データベースから取得し、ブラウザで 4 択クイズとして遊べる静的サイトです。GitHub Pages で公開することを想定しています。

## ディレクトリ構成

```
chinese-vocab-quiz/
├── docs/                  # GitHub Pages の公開ルート
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   ├── config.js          # GAS のエンドポイント URL とシークレット
│   └── local_vocab.json   # Notion から生成する単語データ
├── scripts/
│   └── fetch_vocab.py     # Notion → docs/local_vocab.json を生成
├── gas/
│   └── Code.gs            # Google Apps Script 雛形(スプレッドシート保存用)
├── requirements.txt
├── .env.example
└── .gitignore
```

## セットアップ

1. Python 依存をインストール:

   ```bash
   pip install -r requirements.txt
   ```

2. 環境変数を設定:

   ```bash
   cp .env.example .env
   # .env を開いて NOTION_TOKEN と NOTION_CHINESE_DICT_ID を記入
   ```

## 単語データの更新

Notion 側で単語を追加・修正したら、ローカルで以下を実行して `docs/local_vocab.json` を再生成し、コミット＆プッシュします。

```bash
python scripts/fetch_vocab.py
git add docs/local_vocab.json
git commit -m "update vocab"
git push
```

## ローカルでの動作確認

```bash
cd docs && python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

## GitHub Pages 公開設定

GitHub リポジトリの **Settings → Pages** で以下のように設定します。

- **Source**: Deploy from a branch
- **Branch**: `main` / `/docs`

設定後、数十秒〜数分で `https://<user>.github.io/chinese-vocab-quiz/` に公開されます。

## 得点履歴のスプレッドシート保存

クイズ終了時に、結果を Google スプレッドシートへ書き込みます。バックエンドは Google Apps Script (GAS) の Web アプリです。

### 記録仕様

- **Summary** シート: 毎回必ず記録(タイムスタンプ / 入力値 / 問題数 / 正解数 / 正答率 / 所要時間)。入力値は UI 上「パスワード(任意)」として扱い、画面上はマスク表示される。
- **Details** シート: 入力値がリスト内のいずれかと完全一致(大文字小文字無視)したときのみ、各設問の正誤を1行ずつ記録。
- allowlist の変更は `gas/Code.gs` の `ALLOWED_DETAIL_USERS` を編集して再デプロイするだけで済みます(フロント変更不要)。

### セットアップ手順

1. Google Drive で新規スプレッドシートを作成(例: `chinese-vocab-quiz-logs`)。
2. そのスプレッドシートで **拡張機能 → Apps Script** を開き、`gas/Code.gs` の中身を貼り付け。
3. `SHARED_SECRET` を任意のランダム文字列に変更して保存。
4. **デプロイ → 新しいデプロイ** → 種類「ウェブアプリ」
   - 実行ユーザー: 自分
   - アクセスできるユーザー: 全員
   - デプロイ後に表示される URL をコピー。
5. リポジトリの `docs/config.js` を編集:
   - `gasUrl` に 4 でコピーした URL を貼る。
   - `sharedSecret` に 3 で設定した値と同じ文字列を入れる。
6. コミット & プッシュ。数十秒で GitHub Pages に反映されます。

### セキュリティに関する注意

`docs/config.js` は GitHub Pages から配信される公開ファイルです。`sharedSecret` はスパム抑止以上の意味を持ちません。万一悪用が確認されたら、GAS 側で `SHARED_SECRET` を変更し、新しいデプロイを作成して `config.js` を更新してください。
