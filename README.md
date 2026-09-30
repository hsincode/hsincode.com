# HsinCode

[hsincode.com](https://hsincode.com)

静的な個人サイトです。本番トップの `public/index.html` にはJ案（Apogee）を採用しています。

A案（Trace）・B案（Resonance）・C案（Tactile）は `public/samples/` に保存しています。[比較ページ](https://hsincode.com/samples/) から確認できます。

本番トップのCSS・JS・画像は `public/assets/apogee/` にあります。動きはすべてCSSで、JSは今日の月齢の表示、UTC時計の同期、画面全体に合わせた各パーツの配置だけを行います。
目盛りや模様の座標は計算で生成した値を `index.html` に埋め込んでいます。
計器の細かい文字は、SVGの `<text>` ではなくフォントのアウトラインから作ったパスで描いています（ChromiumではCSS変数で拡大率が変わると `<text>` の位置がずれることがあるため）。
フォントのUnboundedとMartian Mono（どちらもOFL）は `public/assets/` に置いています。
サンプルは `public/samples/samples.css` と `public/samples/motion.js` を使います。
ローカル確認: `bunx serve public`。波形はCanvas、C案の3D表現はThree.jsを使用します。

Vercelで `public` ディレクトリを公開します。

`main` へのpushでGitHub ActionsからVercelの本番環境へデプロイします。
Actionsの `Deploy to Vercel` から手動実行もできます。

リポジトリのActions secretsに `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` を設定します。
デプロイ先はVercelのHsinCodeチームにある `hsincode.com` プロジェクトです。
CIはVercelの公式APIを使用し、HsinCodeチームに限定したトークンで動作します。
