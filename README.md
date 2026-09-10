# HsinCode

[hsincode.com](https://hsincode.com)

静的な個人サイトです。本番トップの `public/index.html` にはB案（Resonance）を採用しています。

A案（Trace）・B案（Resonance）・C案（Tactile）は `public/samples/` に保存しています。[比較ページ](https://hsincode.com/samples/) から確認できます。

本番とモックは `public/samples/samples.css` と `public/samples/motion.js` を共用します。
ローカル確認: `npx serve public`。波形はCanvas、C案の3D表現はThree.jsを使用します。

Vercelで `public` ディレクトリを公開します。

`main` へのpushでGitHub ActionsからVercelの本番環境へデプロイします。
Actionsの `Deploy to Vercel` から手動実行もできます。

リポジトリのActions secretsに `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` を設定します。
デプロイ先はVercelのHsinCodeチームにある `hsincode.com` プロジェクトです。
CIはVercelの公式APIを使用し、HsinCodeチームに限定したトークンで動作します。
