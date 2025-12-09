.PHONY: help install clean purge update ci dev build start test

help: ## コマンド一覧を表示します
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install: ## 依存関係をインストールします
	pnpm install

clean: ## キャッシュとビルド成果物を削除します
	find . -name ".turbo" -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name "distributions" -type d -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true
	rm -rf apps/nextjs/.next
	rm -f apps/nextjs/next-env.d.ts

purge: clean ## 依存関係も含めて全て削除します
	find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
	rm -f pnpm-lock.yaml

update: ## 依存関係をアップデートします
	pnpm exec ncu -u && pnpm -r exec ncu -u

ci: ## CIを実行します
	pnpm run ci
	@make test

dev: ## 開発サーバーを起動します
	cd apps/nextjs && pnpm run dev

build: ## 全パッケージをビルドします
	pnpm run build

start: ## 本番サーバーを起動します
	cd apps/nextjs && pnpm run start

test: ## テストを実行します
	pnpm exec vitest run --reporter=verbose
