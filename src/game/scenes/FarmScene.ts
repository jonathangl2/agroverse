import Phaser from "phaser";
import type { Plot } from "@/types";
import { CROPS } from "@/lib/constants";

export type OnPlotClick = (plotId: number, state: string) => void;
export type OnHarvest   = (plotId: number, points: number) => void;

// Posiciones de las 3 parcelas sobre el fondo (ajustadas al background)
const PLOT_POS = [
  { x: 72,  y: 330 },
  { x: 180, y: 300 },
  { x: 288, y: 330 },
];

// Etapas del café → frame en el spritesheet (4 frames: 0=semilla 1=brote 2=planta 3=cosecha)
const CROP_FRAME: Record<string, number> = {
  planted: 0,
  growing: 2,
  ready:   3,
};

export class FarmScene extends Phaser.Scene {
  private plots: Plot[] = [];          // ← inicializado vacío, nunca undefined
  private onPlotClick: OnPlotClick = () => {};
  private onHarvest: OnHarvest     = () => {};

  private farmer!: Phaser.GameObjects.Sprite;
  private plotSprites: Phaser.GameObjects.Image[]   = [];
  private cropSprites: Phaser.GameObjects.Image[]   = [];
  private glowFX: (Phaser.FX.Glow | null)[]        = [];
  private isMoving = false;
  private tickTimer = 0;

  constructor() { super({ key: "FarmScene" }); }

  init(data: { plots: Plot[]; onPlotClick: OnPlotClick; onHarvest: OnHarvest }) {
    this.plots       = data.plots;
    this.onPlotClick = data.onPlotClick;
    this.onHarvest   = data.onHarvest;
  }

  // ── Preload ───────────────────────────────────────────────────────────────
  preload() {
    this.load.image ("bg",      "/assets/sprites/farm-background.png");
    this.load.image ("plot",    "/assets/sprites/plot-soil.png");
    this.load.image ("tree",    "/assets/sprites/trees.png");

    // Spritesheet del campesino: 8 cols × 2 filas
    this.load.spritesheet("farmer", "/assets/sprites/farmer-spritesheet.png", {
      frameWidth:  258,
      frameHeight: 256,
    });

    // Etapas del café: 4 frames en fila
    this.load.spritesheet("coffee", "/assets/sprites/crop-coffee-stages.png", {
      frameWidth:  516,
      frameHeight: 512,
    });

    // Pantalla de carga simple
    const W = this.scale.width;
    const H = this.scale.height;
    const bar = this.add.rectangle(W / 2, H / 2 + 30, 0, 8, 0x66bb6a).setOrigin(0.5);
    this.add.text(W / 2, H / 2, "Cargando finca...", {
      fontSize: "14px", color: "#4caf50",
    }).setOrigin(0.5);

    this.load.on("progress", (v: number) => bar.setSize(200 * v, 8));
  }

  // ── Create ────────────────────────────────────────────────────────────────
  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Fondo ──────────────────────────────────────────────────────────────
    const bg = this.add.image(W / 2, H / 2, "bg");
    // Escalar para cubrir el canvas completo
    const scaleX = W / bg.width;
    const scaleY = H / bg.height;
    bg.setScale(Math.max(scaleX, scaleY));

    // ── Árboles decorativos ───────────────────────────────────────────────
    // El PNG tiene 2 árboles juntos (688px cada uno). Los recortamos con cropImage
    const treeScale = 0.12;
    const treeL = this.add.image(28, H * 0.42, "tree")
      .setScale(treeScale)
      .setCrop(0, 0, 688, 768)        // árbol izquierdo
      .setOrigin(0.5, 1);
    const treeR = this.add.image(W - 28, H * 0.42, "tree")
      .setScale(treeScale)
      .setCrop(688, 0, 688, 768)      // árbol derecho
      .setOrigin(0.5, 1);
    // Pequeño float de los árboles
    [treeL, treeR].forEach((t) =>
      this.tweens.add({ targets: t, y: "-=4", duration: 2500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" })
    );

    // ── Parcelas ──────────────────────────────────────────────────────────
    PLOT_POS.forEach((pos, i) => {
      // Suelo
      const plot = this.add.image(pos.x, pos.y, "plot")
        .setScale(0.075)
        .setInteractive({ cursor: "pointer" });
      this.plotSprites[i] = plot;

      // Ícono del cultivo (empieza invisible)
      const crop = this.add.image(pos.x, pos.y - 18, "coffee")
        .setFrame(0)
        .setScale(0.055)
        .setVisible(false);
      this.cropSprites[i] = crop;

      // Número de parcela
      this.add.text(pos.x, pos.y + 22, `${i + 1}`, {
        fontSize: "11px", color: "#fff8e1", fontStyle: "bold",
        stroke: "#5d4037", strokeThickness: 3,
      }).setOrigin(0.5);

      // Hover
      plot.on("pointerover", () => plot.setTint(0xffe082));
      plot.on("pointerout",  () => plot.clearTint());
      plot.on("pointerdown", () => this.handlePlotClick(i, pos.x, pos.y));
    });

    // ── Animaciones del campesino ─────────────────────────────────────────
    // Fila 0 (frames 0-7): idle/walk frontal
    // Fila 1 (frames 8-15): walk con herramienta
    this.anims.create({
      key: "idle",
      frames: [{ key: "farmer", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("farmer", { start: 8, end: 13 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: "plant",
      frames: this.anims.generateFrameNumbers("farmer", { start: 8, end: 15 }),
      frameRate: 6,
      repeat: 0,
    });

    // ── Campesino ─────────────────────────────────────────────────────────
    this.farmer = this.add.sprite(W / 2, H - 55, "farmer")
      .setScale(0.18)
      .play("idle");

    // Sombra
    this.add.ellipse(W / 2, H - 30, 32, 8, 0x000000, 0.15)
      .setDepth(-1);

    // ── Etiqueta de zona ──────────────────────────────────────────────────
    this.add.text(W / 2, 14, "☕ Eje Cafetero", {
      fontSize: "13px", color: "#fff8e1", fontStyle: "bold",
      stroke: "#4e342e", strokeThickness: 3,
    }).setOrigin(0.5);

    // ── Timer 1s ──────────────────────────────────────────────────────────
    this.time.addEvent({
      delay: 1000, loop: true,
      callback: () => { this.tickTimer++; this.refreshPlotVisuals(); },
    });

    // Pintar estado inicial
    this.refreshPlotVisuals();
  }

  // ── Click en parcela ──────────────────────────────────────────────────────
  private handlePlotClick(id: number, px: number, py: number) {
    if (this.isMoving) return;
    const plot = this.plots[id];
    if (!plot) return;                    // ← guard: plots aún no sincronizados

    this.walkTo(px, py - 40, () => {
      // Re-leer el plot en el momento de llegar (puede haber cambiado)
      const current = this.plots[id];
      if (!current) return;
      if (current.state === "ready") {
        this.doHarvest(id);
      } else {
        this.onPlotClick(id, current.state);
      }
    });
  }

  // ── Campesino camina ──────────────────────────────────────────────────────
  private walkTo(tx: number, ty: number, done: () => void) {
    this.isMoving = true;
    this.farmer.setFlipX(tx < this.farmer.x);
    this.farmer.play("walk");

    const dist = Phaser.Math.Distance.Between(this.farmer.x, this.farmer.y, tx, ty);

    this.tweens.add({
      targets: this.farmer,
      x: tx, y: ty,
      duration: Math.max(400, dist * 2.8),
      ease: "Power2.easeInOut",
      onComplete: () => {
        this.farmer.play("idle");
        this.farmer.setFlipX(false);
        this.isMoving = false;
        done();
      },
    });
  }

  // ── Cosechar ──────────────────────────────────────────────────────────────
  private doHarvest(id: number) {
    const plot = this.plots[id];
    if (!plot.cropId) return;
    const crop = CROPS[plot.cropId];
    const pos  = PLOT_POS[id];

    // Animación de siembra con herramienta
    this.farmer.play("plant");
    this.farmer.once("animationcomplete", () => this.farmer.play("idle"));

    // Partículas emoji
    const emojis = ["⭐","✨","💫","🌟"];
    for (let i = 0; i < 7; i++) {
      const e = this.add.text(pos.x, pos.y, emojis[i % emojis.length], {
        fontSize: "18px",
      }).setOrigin(0.5);
      this.tweens.add({
        targets: e,
        x: pos.x + Phaser.Math.Between(-70, 70),
        y: pos.y - Phaser.Math.Between(50, 120),
        alpha: 0, angle: Phaser.Math.Between(-30, 30),
        duration: 900, ease: "Power2",
        onComplete: () => e.destroy(),
      });
    }

    // Texto de puntos
    const pts = this.add.text(pos.x, pos.y - 50, `+${crop.pointsReward} pts!`, {
      fontSize: "22px", color: "#f59e0b", fontStyle: "bold",
      stroke: "#ffffff", strokeThickness: 4,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: pts, y: pts.y - 60, alpha: 0, duration: 1400,
      onComplete: () => pts.destroy(),
    });

    this.onHarvest(id, crop.pointsReward);
  }

  // ── Actualizar visuales de parcelas ───────────────────────────────────────
  private refreshPlotVisuals() {
    if (!this.plots?.length || !this.cropSprites?.length) return;
    this.plots.forEach((plot, i) => {
      const cropImg = this.cropSprites[i];
      if (!cropImg) return;

      if (plot.state === "empty") {
        cropImg.setVisible(false);
        this.plotSprites[i]?.clearTint();
      } else if (plot.state === "planted") {
        cropImg.setVisible(true).setFrame(CROP_FRAME.planted);
      } else if (plot.state === "growing") {
        cropImg.setVisible(true).setFrame(CROP_FRAME.growing);
      } else if (plot.state === "ready") {
        cropImg.setVisible(true).setFrame(CROP_FRAME.ready);
        // Pulso en la parcela lista
        if (this.tickTimer % 2 === 0) {
          this.tweens.add({
            targets: this.plotSprites[i],
            scaleX: 0.082, scaleY: 0.082,
            duration: 300, yoyo: true,
          });
        }
      }
    });
  }

  // ── API pública para React ─────────────────────────────────────────────────
  public updatePlots(plots: Plot[]) {
    this.plots = plots;
    this.refreshPlotVisuals();
  }

  public plantInPlot(plotId: number) {
    this.farmer.play("plant");
    this.farmer.once("animationcomplete", () => this.farmer.play("idle"));
    this.refreshPlotVisuals();

    // Pop verde encima de la parcela
    const pos = PLOT_POS[plotId];
    const pop = this.add.text(pos.x, pos.y - 30, "🌱", { fontSize: "26px" })
      .setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: pop, y: pos.y - 60, alpha: 1,
      duration: 400, yoyo: true, ease: "Back.easeOut",
      onComplete: () => pop.destroy(),
    });
  }
}
