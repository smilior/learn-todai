# UTokyo OCW Learning Tracker - Design System (MASTER)

## プロジェクト概要
素材研究所の開発者向け、東大OCW講義の学習進捗管理サイト。
Udemyのような講義視聴・進捗追跡機能を持つ。
対象ユーザー：社会人（研究所勤務の開発者）。日本語UI。

## スタイル: Swiss Modernism 2.0
- 12カラムグリッド、数学的スペーシング（8px基準）
- 装飾を排除、クリーンな階層構造
- 高コントラスト、シングルアクセントカラー

## カラーパレット
- Primary: #4F46E5 (Indigo - 学習・知識)
- Secondary: #818CF8 (Light Indigo)
- CTA/Success: #22C55E (Green - 進捗・完了)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Background: #F8FAFC
- Surface: #FFFFFF
- Text Primary: #1E293B
- Text Secondary: #64748B
- Border: #E2E8F0

## タイポグラフィ: Academic/Research
- Heading: Crimson Pro (serif, scholarly)
- Body: Atkinson Hyperlegible (sans-serif, accessibility)
- Code/Data: Fira Code (monospace, progressページ用)
- CSS Import: @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Crimson+Pro:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');
- 日本語フォールバック: 'Noto Sans JP', sans-serif

## スペーシング (8px基準)
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px

## コンポーネント共通
- Border Radius: 8px (カード), 6px (ボタン), 4px (入力)
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Transition: 150-300ms ease
- アイコン: Lucide React (SVGのみ、絵文字禁止)
- cursor-pointer: 全クリッカブル要素

## チャート
- Library: Recharts
- 進捗: Donut Chart (5色以下)
- 比較: Horizontal Bar Chart (値ラベル付き)
- 推移: Line Chart (Primary #4F46E5, fill 20% opacity)

## アクセシビリティ
- コントラスト比: 4.5:1以上
- Focus states: visible ring
- prefers-reduced-motion: respected
- レスポンシブ: 375px, 768px, 1024px, 1440px

## UXガイドライン
- 進捗表示: Step indicator + progress bar (常に表示)
- チェックリスト: 講義完了をチェックボックスで記録
- ステート: 未着手 / 進行中 / 完了 を色で区別
