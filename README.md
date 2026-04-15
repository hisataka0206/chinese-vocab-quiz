# chinese-vocab-quiz

中国語の単語帳を Notion データベースから取得し、ブラウザで 4 択クイズとして遊べる静的サイトです。GitHub Pages で公開することを想定しています。

## ディレクトリ構成

```
chinese-vocab-quiz/
├── docs/                  # GitHub Pages の公開ルート
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── local_vocab.json   # Notion から生成する単語データ
├── scripts/
│   └── fetch_vocab.py     # Notion → docs/local_vocab.json を生成
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
