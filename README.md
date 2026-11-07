# 自走力チェック（静的Webアプリ）

IT人材の自走力を **7分野×4項目＝28項目** から振り返る、HTML / CSS / JavaScript のシンプルなツールです。公開済みのHTMLを利用するだけなら、ビルド環境やサーバーは不要です。7つの教材を編集する場合は、MarkdownからHTMLを生成します。

## 構成

- `index.html`：自走力の解説と診断チェック
- `check.html`：従来の診断ページURLからトップページへの案内
- `modules.html`：育成モジュール一覧
- `situations.html`：仕事の場面ごとの行動と関連する能力
- `styles.css`：見た目とレスポンシブ対応
- `app.js`：診断項目、集計、保存、データの入出力
- `src/content/*.md`：7つの教材、各能力の15分実践と仕事の場面のケース本文（編集用）
- `src/layouts/*.html`：各教材と仕事の場面のページ枠
- `src/data/situation-cases.json`：仕事の場面のケースのタイトルと出力先
- `ownership.html` など7つの教材HTMLと各能力の `*-quick.html`、`system-understanding-case.html` と `situation-*-case.html`：上記から生成する公開用HTML
- `scripts/build-module.mjs`：教材の生成スクリプト

## ローカルで使う

`index.html` をブラウザで開いてください。回答の自動保存は、ブラウザの環境によって `file://` では制限される場合があります。確実に動作確認する場合は、フォルダ内で `python3 -m http.server 8000` を実行し、`http://localhost:8000` にアクセスしてください。

## 教材を編集する

Node.js 20以上とnpmを用意し、初回に `npm ci` を実行します。教材本文は `src/content/` 内の対応するMarkdownファイルを編集し、`npm run build` でルートの教材、15分実践とケースのHTMLをすべて再生成してください。ページの枠やタイトルなどは `src/layouts/` 内の対応するHTMLファイルにあります。例えば問題解決力の教材は、`src/content/problem-solving.md` と `src/layouts/problem-solving.html` から `problem-solving.html` を生成します。

生成後はMarkdown、テンプレートと生成されたHTMLを一緒にコミットしてください。現状のGitHub Pagesの公開方法ではビルドは自動実行されず、ルートのHTMLがそのまま公開されます。生成されたHTMLは直接編集せず、ソースを修正して再生成します。診断画面と教材一覧ページは従来どおりHTMLを直接編集します。

見出し、段落、リストなどはMarkdownで編集できます。表や開閉カード、装飾のある部分は見た目を保つためにHTMLを残しています。Markdownの構文上、日本語の記号に隣接する強調は解釈されない場合があるため、必要に応じて `<strong>` を使用してください。仕事の場面のケース本文は `src/content/situation-01-case.md` などで編集できます。02の本文は `src/content/system-understanding-case.md` です。01など29ページは `src/layouts/situation-case.html` を共通で使用し、タイトルや出力先は `src/data/situation-cases.json` で管理します。ビルド後に編集したHTMLをブラウザで開き、表示を確認してください。

## GitHub Pages で公開する

1. GitHub で新しいリポジトリを作成します（例：`self-reliance-checker`）。
2. HTML、CSS、JavaScriptなど、公開に必要なファイルをリポジトリのルートに配置し、コミットします。教材の編集・再生成に必要なソースも併せて管理することを推奨します。
3. リポジトリの **Settings → Pages** を開きます。
4. **Build and deployment** の **Source** に `Deploy from a branch` を選び、**Branch** に `main` と `/(root)` を指定して保存します。
5. 公開URLは通常 `https://<GitHubユーザー名>.github.io/self-reliance-checker/` の形式です。GitHub Pages に表示されたURLを確認してください。

GitHub Pages は静的ホスティングです。GitHubのリポジトリが公開でも、診断結果はリポジトリに自動投稿されません。

## カスタマイズ

### 項目の修正・追加

`app.js` 冒頭の `CATEGORIES` 配列を変更します。

```js
{
  id: "ownership",
  name: "主体性",
  description: "目的を理解して行動できるか",
  questions: [
    { id: "ownership-1", text: "指示された作業について、目的や背景を確認している", example: "資料作成を依頼されたとき、誰が何を判断するために使うかを確認する。" }
  ]
}
```

- `example` に、その項目を考えるための短い行動例を記載します。
- `id` は回答の保存キーとして利用されます。同じ `id` を使わないでください。
- 公開後は既存項目の `id` を変更しないことを推奨します。
- 質問を追加すると進捗の総数や分野別平均は自動的に更新されます。
- 現在の点数は「1～4」および「未評価」です。変更する場合は `app.js` の `createQuestion` と集計、UI表記を併せて調整してください。

### 第1層「思考・マインドの診断」を追加する

今後は `CATEGORIES` と分離した `MINDSET_CATEGORIES` を用意し、画面のタブ切り替えや診断別の保存キーを導入するのがおすすめです。評価基準も行動評価とは別に設計してください。

## 保存・エクスポート

- 回答とメモは `localStorage` に自動保存されます。同じブラウザ・同じオリジン（ドメインなど）で再アクセスした際に復元されます。
- JSON保存：回答・メモ・集計値を保存できます。
- JSON読み込み：過去のJSONを再び反映できます。未知の設問IDは無視します。
- CSV保存：各設問と回答の一覧をExcel等で開けます。
- 印刷 / PDF保存：ブラウザの印刷機能を利用します。
- ブラウザのデータ消去・プライベートブラウジング・別端末への移動では保存結果が引き継がれないことがあります。

## 注意

独自設計の自己振り返りツールです。心理検査として妥当性が検証されているものではありません。未回答を除いた平均値であり、回答数が少ない分野の数値は他分野と単純比較できません。人事評価や採用選考などで点数のみを用いて判断しないでください。

GitHub Pagesへの公開時はサイトが一般公開される点に留意してください。個人情報をコードに埋め込まないでください。
