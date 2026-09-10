# HsinCode

[hsincode.com](https://hsincode.com)

HTMLとCSSだけの静的サイトです。`public/index.html` をブラウザで開くと確認できます。

Vercelで `public` ディレクトリを公開します。

`main` へのpushでGitHub ActionsからVercelの本番環境へデプロイします。
Actionsの `Deploy to Vercel` から手動実行もできます。

リポジトリのActions secretsに `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` を設定します。
