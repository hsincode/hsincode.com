# HsinCode

[hsincode.com](https://hsincode.com)

静的な個人サイトです。`public/index.html` が本番トップ、`public/samples/` がデザイン比較用のモックです。

ローカル確認: `npx serve public`。モックではJavaScript、C案ではThree.jsを使用します。

Vercelで `public` ディレクトリを公開します。

`main` へのpushでGitHub ActionsからVercelの本番環境へデプロイします。
Actionsの `Deploy to Vercel` から手動実行もできます。

リポジトリのActions secretsに `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` を設定します。
デプロイ先はVercelのHsinCodeチームにある `hsincode.com` プロジェクトです。
