# career-ops Makefile — Common operations

.PHONY: setup test verify normalize dedup merge sync-check pdf dashboard clean help

# Default target
help:
	@echo "career-ops — Available targets:"
	@echo ""
	@echo "  make setup       — Run first-time setup"
	@echo "  make test        — Run test suite"
	@echo "  make verify      — Check pipeline integrity"
	@echo "  make normalize   — Fix non-canonical statuses"
	@echo "  make dedup       — Remove duplicate entries"
	@echo "  make merge       — Merge batch tracker additions"
	@echo "  make sync-check  — Validate config consistency"
	@echo "  make stories     — Extract STAR stories from reports"
	@echo "  make dashboard   — Build Go TUI dashboard"
	@echo "  make pdf         — Generate PDF (pass INPUT=file.html OUTPUT=file.pdf)"
	@echo "  make clean       — Remove generated files"
	@echo "  make health      — Run all health checks"
	@echo ""

# First-time setup
setup:
	./setup.sh

# Run test suite
test:
	node test/run-tests.mjs

# Pipeline health checks
verify:
	node verify-pipeline.mjs

normalize:
	node normalize-statuses.mjs

dedup:
	node dedup-tracker.mjs

merge:
	node merge-tracker.mjs

sync-check:
	node cv-sync-check.mjs

# Extract STAR stories from reports
stories:
	node append-stories.mjs

# Build dashboard
dashboard:
	cd dashboard && go build -o career-dashboard .
	@echo "Run: ./dashboard/career-dashboard --path ."

# Generate PDF
pdf:
ifndef INPUT
	@echo "Usage: make pdf INPUT=input.html OUTPUT=output.pdf"
	@exit 1
endif
ifndef OUTPUT
	@echo "Usage: make pdf INPUT=input.html OUTPUT=output.pdf"
	@exit 1
endif
	node generate-pdf.mjs $(INPUT) $(OUTPUT)

# Run all health checks
health: sync-check verify
	@echo ""
	@echo "All health checks complete."

# Clean generated files
clean:
	rm -f dashboard/career-dashboard
	rm -rf test/tmp-*
	rm -f batch/.resolved-prompt-*
	rm -f data/applications.md.bak
	@echo "Cleaned generated files."
