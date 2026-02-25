APP      = lexai
VERSION  = $(shell node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")
IMAGE    = $(APP):latest
PACKAGE  = $(APP)-docker-$(VERSION).tar.gz

.PHONY: help build up down restart logs shell package clean

## ── Yardım ──────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  LexAI — Dağıtım Komutları"
	@echo ""
	@echo "  make build      Docker imajını oluştur"
	@echo "  make up         Servisi başlat (arka planda)"
	@echo "  make down       Servisi durdur"
	@echo "  make restart    Yeniden başlat"
	@echo "  make logs       Canlı logları izle"
	@echo "  make shell      Container içine bağlan"
	@echo "  make package    Sunucuya göndermek için .tar.gz paketi oluştur"
	@echo "  make clean      Durdurulan container ve kullanılmayan imajları temizle"
	@echo ""

## ── Docker imajı ────────────────────────────────────────────────────────────
build:
	docker build --pull -t $(IMAGE) .
	@echo "✓ İmaj hazır: $(IMAGE)"

## ── Servis yönetimi ─────────────────────────────────────────────────────────
up:
	@test -f .env.production || (echo "HATA: .env.production bulunamadı — .env.production.example dosyasını kopyala ve doldur" && exit 1)
	docker compose up -d
	@echo "✓ LexAI çalışıyor → http://localhost:3000"

down:
	docker compose down

restart:
	docker compose restart lexai

logs:
	docker compose logs -f lexai

shell:
	docker compose exec lexai sh

## ── Paketleme ────────────────────────────────────────────────────────────────
# Sunucuya taşımak için gereken dosyaları tek bir .tar.gz içine toplar.
# İmaj ayrıca image.tar.gz olarak kaydedilir.
package: build
	@echo "→ Docker imajı kaydediliyor..."
	docker save $(IMAGE) | gzip > image.tar.gz
	@echo "→ Dağıtım paketi oluşturuluyor..."
	tar -czf $(PACKAGE) \
	    docker-compose.yml \
	    .env.production.example \
	    image.tar.gz \
	    Makefile
	rm -f image.tar.gz
	@echo ""
	@echo "✓ Paket hazır: $(PACKAGE)"
	@echo ""
	@echo "  Sunucuda çalıştır:"
	@echo "    tar -xzf $(PACKAGE)"
	@echo "    docker load < image.tar.gz"
	@echo "    cp .env.production.example .env.production && nano .env.production"
	@echo "    make up"
	@echo ""

## ── Temizlik ─────────────────────────────────────────────────────────────────
clean:
	docker compose down --remove-orphans 2>/dev/null || true
	docker image prune -f
	rm -f *.tar.gz
