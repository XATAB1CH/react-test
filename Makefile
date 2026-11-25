ifeq ($(OS),Windows_NT)
NPM := npm.cmd
else
NPM := npm
endif

.DEFAULT_GOAL := run
.PHONY: install run run-macos run-windows build preview

install:
	$(NPM) ci --no-audit --no-fund

run: install
	$(NPM) run dev

run-macos: run

run-windows: run

build: install
	$(NPM) run build

preview: build
	$(NPM) run preview
