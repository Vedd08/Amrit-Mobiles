import { CanvasTexture, SRGBColorSpace, Color } from 'three';
import { stageState } from '@/frontend/lib/experience/stageState';
import { useExperienceStore } from '@/frontend/lib/experience/store';
import { brands } from '@/shared/brands';
import { BRANCHES } from '@/shared/branches';
import { BRAND_STAR_PATH } from '@/frontend/lib/brand-star';

type Scene = 'LOCK' | 'BRAND' | 'PICKER' | 'FINAL';

export class ScreenTexture {
  public static get captureMode() {
    return typeof window !== 'undefined' && Boolean((window as Window & { __CAPTURE_MODE__?: boolean }).__CAPTURE_MODE__);
  }
  private static hasWokenUpGlobal = false;
  private wakeUpStart: number = 0;

  public texture: CanvasTexture;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rafId: number = 0;
  private lastPaint: number = 0;
  private isDestroyed = false;
  private reducedMotion = false;
  private isFacing = false;

  private sceneActive: Scene = 'LOCK';
  private sceneEnteredAt: number = 0;
  private lastScene: Scene = 'LOCK';
  private sceneTransitionStart: number = 0;
  
  private lastBrandIndex = 0;
  private brandTransitionStart = 0;
  
  private pickerSelectionStart = 0;
  private pickerSelectionLast = 0;

  private grainCanvas: HTMLCanvasElement | null = null;
  private grainPattern: CanvasPattern | null = null;

  // Real photographic wallpapers (public/images/wallpapers), animated like a
  // live wallpaper: slow Ken Burns drift + crossfades.
  private static readonly LOCK_PLAYLIST = ['samsung', 'oneplus', 'google', 'apple', 'vivo'];
  private wallpapers = new Map<string, HTMLImageElement>();
  private prevBrandIndex = 0;

  constructor(reducedMotion: boolean, aspect: number = 2.15) {
    this.canvas = document.createElement('canvas');
    const tier = stageState.tier;
    this.canvas.width = tier === 'mobile' ? 384 : 512;
    // Runtime computed aspect ratio passed from plane's world size
    this.canvas.height = Math.round(this.canvas.width * aspect);
    this.ctx = this.canvas.getContext('2d', { alpha: false })!;
    this.reducedMotion = reducedMotion;
    // Start the wallpaper playlist from its first photo.
    this.sceneEnteredAt = performance.now();

    this.texture = new CanvasTexture(this.canvas);
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.generateMipmaps = true;

    this.ctx.fillStyle = 'rgb(0, 0, 0)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.texture.needsUpdate = true;

    if (tier !== 'mobile') {
      this.initGrain();
    }

    this.init();
  }

  private initGrain() {
    this.grainCanvas = document.createElement('canvas');
    this.grainCanvas.width = 128;
    this.grainCanvas.height = 128;
    const gCtx = this.grainCanvas.getContext('2d')!;
    const imgData = gCtx.createImageData(128, 128);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.random() * 255;
      imgData.data[i] = v;
      imgData.data[i+1] = v;
      imgData.data[i+2] = v;
      imgData.data[i+3] = 255;
    }
    gCtx.putImageData(imgData, 0, 0);
    this.grainPattern = this.ctx.createPattern(this.grainCanvas, 'repeat');
  }

  public setReducedMotion(v: boolean) {
    this.reducedMotion = v;
    if (v) this.forceRepaint();
  }

  public setFacing(facing: boolean) {
    const wasFacing = this.isFacing;
    this.isFacing = facing;
    if (facing && !wasFacing && !ScreenTexture.hasWokenUpGlobal && !this.reducedMotion) {
      ScreenTexture.hasWokenUpGlobal = true;
      this.wakeUpStart = performance.now();
    }
  }

  private forceRepaint() {
    if (this.isDestroyed) return;
    this.paint(performance.now());
  }

  private loadWallpapers() {
    const slugs = new Set<string>([...ScreenTexture.LOCK_PLAYLIST, ...brands.map((b) => b.slug), 'default']);
    const first: Promise<unknown>[] = [];
    slugs.forEach((slug) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = `/images/wallpapers/${slug}.webp`;
      this.wallpapers.set(slug, img);
      if (slug === ScreenTexture.LOCK_PLAYLIST[0]) {
        first.push(img.decode().catch(() => undefined));
      }
      img.onload = () => {
        if (this.reducedMotion) this.forceRepaint();
      };
    });
    // Never hold the first paint for long on a slow network.
    return Promise.race([Promise.all(first), new Promise((r) => setTimeout(r, 1500))]);
  }

  /** Draws a wallpaper with cover-fit and a slow cinematic drift. Returns false if not loaded yet. */
  private drawWallpaper(slug: string, t: number, w: number, h: number, alpha: number, seed: number): boolean {
    const img = this.wallpapers.get(slug) ?? this.wallpapers.get('default');
    if (!img || !img.complete || !img.naturalWidth || alpha <= 0) return false;
    const s = this.reducedMotion ? 0 : t / 1000;
    const TAU = Math.PI * 2;
    // Zoom 1.12-1.22 and pan at most 5.5% so the photo edges never show.
    const zoom = 1.17 + Math.sin((s / 24) * TAU + seed) * 0.05;
    const parallax = Math.sin(stageState.phone.rot.y || 0) * 0.025 * w;
    const panX = Math.sin((s / 31) * TAU + seed) * 0.03 * w + parallax;
    const panY = Math.cos((s / 27) * TAU + seed) * 0.025 * h;
    const base = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * base;
    const dh = img.naturalHeight * base;
    const prevAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = prevAlpha * alpha;
    this.ctx.drawImage(img, (w - dw) / 2 + panX, (h - dh) / 2 + panY, dw, dh);
    this.ctx.globalAlpha = prevAlpha;
    return true;
  }

  /** Lock-screen legibility: darken the clock band and the notification band, as iOS does. */
  private drawLegibilityShade(w: number, h: number, strength = 1) {
    const top = this.ctx.createLinearGradient(0, 0, 0, h * 0.42);
    top.addColorStop(0, `rgba(0,0,0,${0.38 * strength})`);
    top.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = top;
    this.ctx.fillRect(0, 0, w, h * 0.42);
    const bottom = this.ctx.createLinearGradient(0, h * 0.5, 0, h);
    bottom.addColorStop(0, 'rgba(0,0,0,0)');
    bottom.addColorStop(1, `rgba(0,0,0,${0.45 * strength})`);
    this.ctx.fillStyle = bottom;
    this.ctx.fillRect(0, h * 0.5, w, h * 0.5);
  }

  private async init() {
    await Promise.all([
      document.fonts.load('500 32px "DM Mono"'),
      document.fonts.load('800 64px "Archivo"'),
      document.fonts.load('900 64px "Archivo"'),
      this.loadWallpapers(),
    ]);
    if (this.isDestroyed) return;
    // Never keep the stage hidden forever if a wallpaper fails to load.
    setTimeout(() => { stageState.screenReady = true; }, 3500);
    this.forceRepaint();
    this.loop();
  }

  private mapBeatToScene(beatId: string): Scene | null {
    switch(beatId) {
      case 'hero': case 'hero-out': case 'why': return 'LOCK';
      case 'brands-in': case 'brand-cycle': return 'BRAND';
      case 'chooser': return 'LOCK';
      case 'trending': case 'stores': return null;
      case 'final': return 'FINAL';
      default: return null;
    }
  }

  private loop = (timestamp: number = 0) => {
    if (this.isDestroyed) return;
    this.rafId = requestAnimationFrame(this.loop);

    if (document.visibilityState === 'hidden') return;
    if (this.reducedMotion) return; // RM mode only repaints on state changes explicitly

    const activeScene = this.mapBeatToScene(stageState.beatId);
    if (!activeScene) return; // no repaint
    if (!this.isFacing) return;

    if (this.isFacing && !ScreenTexture.hasWokenUpGlobal && !this.reducedMotion) {
      ScreenTexture.hasWokenUpGlobal = true;
      this.wakeUpStart = timestamp;
    }

    if (activeScene !== this.sceneActive) {
      this.lastScene = this.sceneActive;
      this.sceneActive = activeScene;
      this.sceneTransitionStart = timestamp;
      this.sceneEnteredAt = timestamp;
    }

    const activeBrand = useExperienceStore.getState().activeBrandIndex;
    if (activeBrand !== this.lastBrandIndex && activeScene === 'BRAND') {
      this.prevBrandIndex = this.lastBrandIndex;
      this.lastBrandIndex = activeBrand;
      this.brandTransitionStart = timestamp;
    }
    
    if (activeScene === 'PICKER') {
        if (activeBrand !== this.pickerSelectionLast) {
            this.pickerSelectionStart = timestamp;
            this.pickerSelectionLast = activeBrand;
        }
    }

    // Determine FPS based on state
    const isInTransition = (timestamp - this.sceneTransitionStart < 500) || 
                           (timestamp - this.brandTransitionStart < 450) ||
                           (activeScene === 'LOCK' && timestamp - this.sceneEnteredAt < 1500) ||
                           (activeScene === 'PICKER' && timestamp - this.pickerSelectionStart < 380) ||
                           (this.wakeUpStart > 0 && timestamp - this.wakeUpStart < 600);
                           
    // Live wallpapers drift continuously, so hold a smooth rate (the 3D stage
    // never mounts on the mobile tier).
    const targetFps = isInTransition ? (stageState.tier === 'mobile' ? 20 : 30) : (stageState.tier === 'mobile' ? 15 : 30);
    const fpsInterval = 1000 / targetFps;

    const delta = timestamp - this.lastPaint;
    if (delta > fpsInterval) {
      this.lastPaint = timestamp - (delta % fpsInterval);
      this.paint(timestamp);
    }
  };
  
  private easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  }
  
  private easeInOutCubic(x: number): number {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  private mixHex(hex1: string, hex2: string, weight: number): string {
    const c1 = new Color(hex1);
    const c2 = new Color(hex2);
    c1.lerp(c2, weight);
    return '#' + c1.getHexString();
  }

  private paint(t: number) {
    if (this.reducedMotion) t = 0;
    
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Draw background outside clip as pure black
    this.ctx.fillStyle = 'rgb(0, 0, 0)';
    this.ctx.fillRect(0, 0, w, h);
    
    this.ctx.save();

    // Wake-up moment scale 1.02 -> 1.00 & fade up over 600ms on first facing
    if (this.wakeUpStart > 0 && !this.reducedMotion) {
      const wakeAge = t - this.wakeUpStart;
      const wakeProgress = Math.min(1, Math.max(0, wakeAge / 600));
      const wakeEase = this.easeOutCubic(wakeProgress);
      const wakeScale = 1.02 - 0.02 * wakeEase;
      this.ctx.globalAlpha = wakeEase;
      this.ctx.translate(w / 2, h / 2);
      this.ctx.scale(wakeScale, wakeScale);
      this.ctx.translate(-w / 2, -h / 2);
    }
    
    // Clip rounded corners
    const radius = w * 0.135;
    this.ctx.beginPath();
    this.ctx.moveTo(radius, 0);
    this.ctx.lineTo(w - radius, 0);
    this.ctx.quadraticCurveTo(w, 0, w, radius);
    this.ctx.lineTo(w, h - radius);
    this.ctx.quadraticCurveTo(w, h, w - radius, h);
    this.ctx.lineTo(radius, h);
    this.ctx.quadraticCurveTo(0, h, 0, h - radius);
    this.ctx.lineTo(0, radius);
    this.ctx.quadraticCurveTo(0, 0, radius, 0);
    this.ctx.clip();

    const sceneProgress = this.reducedMotion ? 1 : Math.min(1, (t - this.sceneTransitionStart) / 500);
    
    // Crossfade handling
    if (sceneProgress < 1 && this.lastScene !== this.sceneActive && !this.reducedMotion) {
       this.ctx.globalAlpha = 1;
       this.drawScene(this.lastScene, t, w, h);
       this.ctx.globalAlpha = sceneProgress;
       this.drawScene(this.sceneActive, t, w, h, sceneProgress);
    } else {
       this.ctx.globalAlpha = 1;
       this.drawScene(this.sceneActive, t, w, h, 1);
    }
    
    this.ctx.globalAlpha = 1;
    
    // Dynamic Island backstop
    this.ctx.fillStyle = 'rgb(0, 0, 0)';
    const islandW = w * 0.32;
    const islandH = w * 0.095;
    const islandX = (w - islandW) / 2;
    const islandY = w * 0.03;
    const islandR = islandH / 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(islandX + islandR, islandY);
    this.ctx.lineTo(islandX + islandW - islandR, islandY);
    this.ctx.quadraticCurveTo(islandX + islandW, islandY, islandX + islandW, islandY + islandR);
    this.ctx.lineTo(islandX + islandW, islandY + islandH - islandR);
    this.ctx.quadraticCurveTo(islandX + islandW, islandY + islandH, islandX + islandW - islandR, islandY + islandH);
    this.ctx.lineTo(islandX + islandR, islandY + islandH);
    this.ctx.quadraticCurveTo(islandX, islandY + islandH, islandX, islandY + islandH - islandR);
    this.ctx.lineTo(islandX, islandY + islandR);
    this.ctx.quadraticCurveTo(islandX, islandY, islandX + islandR, islandY);
    this.ctx.fill();

    this.ctx.restore();
    this.texture.needsUpdate = true;
  }
  
  private drawScene(scene: Scene, t: number, w: number, h: number, introProgress: number = 1) {
    const yOffset = this.reducedMotion ? 0 : (1 - this.easeOutCubic(introProgress)) * 16;
    
    this.ctx.save();
    this.ctx.translate(0, yOffset);
    
    if (scene === 'LOCK') this.drawLock(t, w, h);
    else if (scene === 'BRAND') this.drawBrand(t, w, h);
    else if (scene === 'PICKER') this.drawPicker(t, w, h);
    else if (scene === 'FINAL') this.drawFinal(t, w, h);
    
    this.ctx.restore();
    
    this.drawSharedChrome(scene, w, h);
  }

  private drawSharedChrome(scene: Scene, w: number, h: number) {
    // Bottom home indicator bar
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    const hiW = w * 0.34;
    const hiH = 5;
    const hiX = (w - hiW) / 2;
    const hiY = h - 12 - hiH;
    this.ctx.beginPath();
    this.ctx.roundRect(hiX, hiY, hiW, hiH, hiH/2);
    this.ctx.fill();

    // Top status bar icons (white 90%)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    const iconY = w * 0.05;

    // 1. Battery icon (outline + cap + 80% fill)
    const batX = w - w * 0.07 - 22;
    const batY = iconY;
    const batW = 22;
    const batH = 11;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(batX, batY, batW, batH, 2.5);
    this.ctx.stroke();
    this.ctx.fillRect(batX + batW + 1, batY + 3.5, 1.5, 4); // cap
    this.ctx.fillRect(batX + 2, batY + 2, (batW - 4) * 0.8, batH - 4); // ~80% fill

    // 2. Wi-Fi icon (3 arcs / dot)
    const wifiX = batX - 20;
    const wifiY = iconY + 5;
    this.ctx.lineWidth = 1.5;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.arc(wifiX, wifiY + 4, 1.2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(wifiX, wifiY + 4, 5, -Math.PI * 0.75, -Math.PI * 0.25);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(wifiX, wifiY + 4, 9, -Math.PI * 0.75, -Math.PI * 0.25);
    this.ctx.stroke();

    // 3. Signal bars (4 bars of increasing height)
    const sigX = wifiX - 24;
    const sigY = iconY + 11;
    const barW = 2.5;
    const barGap = 1.5;
    for (let i = 0; i < 4; i++) {
      const barH = 3 + i * 2.5;
      this.ctx.fillRect(sigX + i * (barW + barGap), sigY - barH, barW, barH);
    }

    this.ctx.font = '600 22px Archivo, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    
    if (scene === 'LOCK') {
      this.ctx.fillText("Amrit", w * 0.08, w * 0.07);
    } else {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      this.ctx.fillText(timeStr, w * 0.08, w * 0.07);
    }
  }

  private drawLock(t: number, w: number, h: number) {
    this.ctx.fillStyle = 'rgb(7, 9, 11)';
    this.ctx.fillRect(0, 0, w, h);

    // Live photo wallpaper: drifts slowly and crossfades through the playlist.
    const list = ScreenTexture.LOCK_PLAYLIST;
    const PERIOD = 6500;
    const FADE = 1400;
    const elapsed = this.reducedMotion ? 0 : Math.max(0, t - this.sceneEnteredAt);
    const slot = Math.floor(elapsed / PERIOD);
    const local = elapsed % PERIOD;
    const current = list[slot % list.length];
    let drewPhoto = false;
    if (slot > 0 && local < FADE) {
      const previous = list[(slot - 1) % list.length];
      drewPhoto = this.drawWallpaper(previous, t, w, h, 1, (slot - 1) * 1.7);
      this.drawWallpaper(current, t, w, h, this.easeInOutCubic(local / FADE), slot * 1.7);
    } else {
      drewPhoto = this.drawWallpaper(current, t, w, h, 1, slot * 1.7);
    }
    if (drewPhoto) {
      this.drawLegibilityShade(w, h);
      this.drawLockContent(t, w, h, true);
      stageState.screenReady = true;
      return;
    }

    // FIX 5: Parallax wallpaper shift horizontally by sin(stageState.phone.rot.y) * 0.04 * w
    const rotYParallax = Math.sin(stageState.phone.rot.y || 0) * 0.04 * w;

    // FIX 5: Low-alpha blob behind clock band so top third isn't flat dark field
    const topBlobGrad = this.ctx.createRadialGradient(w / 2 + rotYParallax, h * 0.22, 0, w / 2 + rotYParallax, h * 0.22, w * 0.7);
    topBlobGrad.addColorStop(0, 'rgba(85, 194, 205, 0.18)');
    topBlobGrad.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = topBlobGrad;
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.globalCompositeOperation = 'lighter';
    const blobs = [
      { c: 'rgba(146, 195, 24, 0.35)', r: 0.9*w, p1: 21, p2: 27 }, // lime
      { c: 'rgba(85, 194, 205, 0.30)', r: 0.8*w, p1: 27, p2: 33 }, // teal
      { c: 'rgba(40, 52, 38, 0.9)', r: 1.1*w, p1: 33, p2: 21 }, // warm dark green
    ];

    blobs.forEach((b) => {
      const px = this.reducedMotion ? 0 : Math.sin(t / (b.p1 * 1000) * Math.PI * 2);
      const py = this.reducedMotion ? 0 : Math.cos(t / (b.p2 * 1000) * Math.PI * 2);
      const bx = w/2 + rotYParallax + px * 0.18 * w;
      const by = h * 0.8 + py * 0.18 * w;
      const grad = this.ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
      grad.addColorStop(0, b.c);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    });
    this.ctx.globalCompositeOperation = 'source-over';

    if (this.grainPattern && stageState.tier !== 'mobile') {
      this.ctx.globalAlpha = 0.035;
      this.ctx.fillStyle = this.grainPattern;
      this.ctx.fillRect(0, 0, w, h);
      this.ctx.globalAlpha = 1;
    }

    this.drawLockContent(t, w, h, false);
  }

  /** Clock, date, notifications and buttons. `photo` = drawn over a real wallpaper. */
  private drawLockContent(t: number, w: number, h: number, photo: boolean) {
    if (!ScreenTexture.captureMode) {
      const now = new Date();
      const dateStr = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      this.ctx.font = '600 26px Archivo, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(dateStr, w / 2, h * 0.15);

      const timeParts = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).formatToParts(now);
      const timeOnly = timeParts.filter(p => p.type !== 'dayPeriod' && p.type !== 'literal').map(p => p.value).join(':');
      
      this.ctx.fillStyle = 'rgb(255, 255, 255)';
      this.ctx.font = '800 150px Archivo, sans-serif';
      Object.assign(this.ctx, { letterSpacing: '-0.04em' });
      this.ctx.textBaseline = 'alphabetic';
      this.ctx.fillText(timeOnly, w / 2, h * 0.30);
      Object.assign(this.ctx, { letterSpacing: '0px' });
    }

    // Create star gradient once for both brand mark and notifications
    const starGrad = this.ctx.createLinearGradient(0, 0, 100, 100);
    starGrad.addColorStop(0, 'rgb(185, 217, 226)');
    starGrad.addColorStop(0.5, 'rgb(85, 194, 205)');
    starGrad.addColorStop(1, 'rgb(146, 195, 24)');

    const age = t - this.sceneEnteredAt;

    // Brand mark (only on the abstract fallback; a photo wallpaper stays clean)
    if (!photo && (this.reducedMotion || age > 220)) {
      const starProgress = this.reducedMotion ? 1 : Math.min(1, (age - 220) / 600);
      const starEase = this.easeOutCubic(starProgress);
      
      this.ctx.save();
      this.ctx.globalAlpha = starEase;
      this.ctx.translate(w / 2, h * 0.52 + (1 - starEase) * 16);
      const scale = this.reducedMotion ? 1.0 : 1.0 + Math.sin(t / 4800 * Math.PI * 2) * 0.035;
      const baseS = (0.2 * w) / 100;
      this.ctx.scale(baseS * scale, baseS * scale);
      this.ctx.translate(-50, -50);
      
      this.ctx.shadowColor = 'rgba(146, 195, 24, 0.45)';
      this.ctx.shadowBlur = 40;
      this.ctx.fillStyle = starGrad;
      this.ctx.fill(new Path2D(BRAND_STAR_PATH));
      this.ctx.restore();
    }

    // Notif card 1
    const notifAge = t - this.sceneEnteredAt;
    if (this.reducedMotion || notifAge > 900) {
      const nProgress = this.reducedMotion ? 1 : Math.min(1, (notifAge - 900) / 600);
      const easeN = this.easeOutCubic(nProgress);
      const ny = h * 0.64 + (1 - easeN) * 40;
      this.ctx.globalAlpha = easeN;
      
      const nx = w * 0.055;
      const nw = w - nx * 2;
      const nh = h * 0.12;
      this.ctx.fillStyle = photo ? 'rgba(255, 255, 255, 0.24)' : 'rgba(255, 255, 255, 0.10)';
      this.ctx.strokeStyle = photo ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.18)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(nx, ny, nw, nh, 28);
      this.ctx.fill();
      this.ctx.stroke();

      // Icon
      this.ctx.fillStyle = 'rgb(14, 16, 18)';
      this.ctx.beginPath();
      this.ctx.roundRect(nx + 16, ny + (nh-44)/2, 44, 44, 12);
      this.ctx.fill();
      
      this.ctx.save();
      this.ctx.translate(nx + 16 + 22, ny + (nh-44)/2 + 22);
      this.ctx.scale(0.24, 0.24);
      this.ctx.translate(-50, -50);
      this.ctx.fillStyle = starGrad;
      this.ctx.fill(new Path2D(BRAND_STAR_PATH));
      this.ctx.restore();

      this.ctx.fillStyle = 'rgb(255, 255, 255)';
      this.ctx.font = '700 22px Archivo, sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText("Amrit Mobiles", nx + 16 + 44 + 14, ny + 20);
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      this.ctx.font = '500 19px Archivo, sans-serif';
      this.ctx.fillText("Sealed box · IMEI on your GST bill", nx + 16 + 44 + 14, ny + 46);

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.font = '500 15px "DM Mono", monospace';
      this.ctx.textAlign = 'right';
      this.ctx.fillText("now", nx + nw - 20, ny + 24);
      
      this.ctx.globalAlpha = 1;

      // Second notification
      if (this.reducedMotion || notifAge > 1300) {
        const n2Progress = this.reducedMotion ? 1 : Math.min(1, (notifAge - 1300) / 600);
        const easeN2 = this.easeOutCubic(n2Progress);
        const ny2 = ny + nh + 12 + (1 - easeN2) * 40;
        
        this.ctx.globalAlpha = easeN2 * 0.85; // 85% opacity
        
        this.ctx.fillStyle = photo ? 'rgba(255, 255, 255, 0.24)' : 'rgba(255, 255, 255, 0.10)';
        this.ctx.strokeStyle = photo ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.18)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(nx, ny2, nw, nh, 28);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = 'rgb(14, 16, 18)';
        this.ctx.beginPath();
        this.ctx.roundRect(nx + 16, ny2 + (nh-44)/2, 44, 44, 12);
        this.ctx.fill();
        
        this.ctx.save();
        this.ctx.translate(nx + 16 + 22, ny2 + (nh-44)/2 + 22);
        this.ctx.scale(0.24, 0.24);
        this.ctx.translate(-50, -50);
        this.ctx.fillStyle = starGrad;
        this.ctx.fill(new Path2D(BRAND_STAR_PATH));
        this.ctx.restore();

        this.ctx.fillStyle = 'rgb(255, 255, 255)';
        this.ctx.font = '700 22px Archivo, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText("Trade-in valued at the counter", nx + 16 + 44 + 14, ny2 + 20);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        this.ctx.font = '500 19px Archivo, sans-serif';
        this.ctx.fillText("Bring your old phone", nx + 16 + 44 + 14, ny2 + 46);

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '500 15px "DM Mono", monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText("now", nx + nw - 20, ny2 + 24);
        
        this.ctx.globalAlpha = 1;
      }
    }

    // Bottom buttons
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    this.ctx.beginPath();
    this.ctx.arc(w * 0.13 + 32, h * 0.92 - 32, 32, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(w * 0.87 - 32, h * 0.92 - 32, 32, 0, Math.PI * 2);
    this.ctx.fill();

    if (!this.reducedMotion && stageState.tier !== 'mobile') {
      const sweepT = (t % 7000) / 7000;
      const sx = w * 2 * sweepT - w * 0.5;
      const sGrad = this.ctx.createLinearGradient(sx, 0, sx + w*0.35, h);
      sGrad.addColorStop(0, 'rgba(255,255,255,0)');
      sGrad.addColorStop(0.5, 'rgba(255,255,255,0.07)');
      sGrad.addColorStop(1, 'rgba(255,255,255,0)');
      this.ctx.fillStyle = sGrad;
      this.ctx.fillRect(0, 0, w, h);
    }

    // Lime specular sweep across the screen once on entry (first 1.4s)
    const introSweepAge = t - (this.sceneEnteredAt || 0);
    if (!this.reducedMotion && introSweepAge >= 0 && introSweepAge < 1400) {
      const sweepProgress = introSweepAge / 1400;
      const sx = w * 2.5 * sweepProgress - w * 0.8;
      const sGrad = this.ctx.createLinearGradient(sx, 0, sx + w * 0.4, h);
      sGrad.addColorStop(0, 'rgba(146, 195, 24, 0)');
      sGrad.addColorStop(0.5, 'rgba(146, 195, 24, 0.45)');
      sGrad.addColorStop(1, 'rgba(146, 195, 24, 0)');
      this.ctx.fillStyle = sGrad;
      this.ctx.fillRect(0, 0, w, h);
    }
  }

  private drawBrand(t: number, w: number, h: number) {
    const brand = brands[useExperienceStore.getState().activeBrandIndex] || brands[0];
    
    this.ctx.fillStyle = 'rgb(7, 9, 11)';
    this.ctx.fillRect(0, 0, w, h);

    // The brand's own photo wallpaper, crossfading from the previous brand's.
    const fade = this.reducedMotion ? 1 : this.easeInOutCubic(Math.min(1, (t - this.brandTransitionStart) / 700));
    const prevBrand = brands[this.prevBrandIndex] || brands[0];
    let drewPhoto = false;
    if (fade < 1 && prevBrand.slug !== brand.slug) {
      drewPhoto = this.drawWallpaper(prevBrand.slug, t, w, h, 1, this.prevBrandIndex * 1.3);
      this.drawWallpaper(brand.slug, t, w, h, fade, this.lastBrandIndex * 1.3);
    } else {
      drewPhoto = this.drawWallpaper(brand.slug, t, w, h, 1, this.lastBrandIndex * 1.3);
    }
    if (drewPhoto) {
      // Even scrim so the big white brand name reads on any photo.
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      this.ctx.fillRect(0, 0, w, h);
      this.drawLegibilityShade(w, h, 0.8);
    } else {
      const glowColor = this.mixHex(brand.tint || 'rgb(184, 188, 192)', 'rgb(255, 255, 255)', 0.22);
      const grad = this.ctx.createRadialGradient(w/2, h*0.30, 0, w/2, h*0.30, w*0.9);
      grad.addColorStop(0, this.mixHex(glowColor, 'rgb(0, 0, 0)', 0.45));
      grad.addColorStop(1, 'rgb(7, 9, 11)');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    }

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '500 16px "DM Mono", monospace';
    Object.assign(this.ctx, { letterSpacing: '0.2em' });
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText("AT AMRIT MOBILES", w / 2, h * 0.38);
    Object.assign(this.ctx, { letterSpacing: '0px' });

    const bProgress = this.reducedMotion ? 1 : Math.min(1, (t - this.brandTransitionStart) / 450);
    const bEase = this.easeOutCubic(bProgress);
    const bOffset = this.reducedMotion ? 0 : (1 - bEase) * 24;

    this.ctx.save();
    this.ctx.globalAlpha = bEase;
    this.ctx.translate(0, bOffset);
    
    this.ctx.fillStyle = 'rgb(255, 255, 255)';
    let size = 92;
    this.ctx.font = `900 ${size}px Archivo, sans-serif`;
    Object.assign(this.ctx, { letterSpacing: '-0.045em' });
    while (this.ctx.measureText(brand.name).width > w * 0.84 && size > 56) {
      size -= 4;
      this.ctx.font = `900 ${size}px Archivo, sans-serif`;
    }
    this.ctx.fillText(brand.name, w / 2, h * 0.46);
    Object.assign(this.ctx, { letterSpacing: '0px' });

    if (brand.specs && brand.specs.length >= 2) {
      const cx = w / 2;
      const cy = h * 0.56;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.lineWidth = 1;

      // Chip 1
      this.ctx.beginPath();
      this.ctx.roundRect(cx - 160, cy - 34, 150, 68, 34);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      this.ctx.font = '500 14px "DM Mono", monospace';
      this.ctx.fillText(brand.specs[0].label.toUpperCase(), cx - 85, cy - 8);
      this.ctx.fillStyle = 'rgb(255, 255, 255)';
      this.ctx.font = '700 22px Archivo, sans-serif';
      this.ctx.fillText(brand.specs[0].value, cx - 85, cy + 16);

      // Chip 2
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      this.ctx.beginPath();
      this.ctx.roundRect(cx + 10, cy - 34, 150, 68, 34);
      this.ctx.fill();
      this.ctx.stroke();
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      this.ctx.font = '500 14px "DM Mono", monospace';
      this.ctx.fillText(brand.specs[1].label.toUpperCase(), cx + 85, cy - 8);
      this.ctx.fillStyle = 'rgb(255, 255, 255)';
      this.ctx.font = '700 22px Archivo, sans-serif';
      this.ctx.fillText(brand.specs[1].value, cx + 85, cy + 16);
    }
    
    this.ctx.restore();

    const dotsCount = brands.length;
    const dotGap = 10;
    const dotW = 8;
    const activeW = 24;
    const totalW = (dotsCount - 1) * dotW + activeW + (dotsCount - 1) * dotGap;
    let startX = (w - totalW) / 2;
    const dotY = h * 0.88;

    for (let i = 0; i < dotsCount; i++) {
      const isActive = i === this.lastBrandIndex;
      const curW = isActive ? activeW : dotW;
      this.ctx.fillStyle = isActive ? 'rgb(255, 255, 255)' : 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.roundRect(startX, dotY, curW, dotW, dotW/2);
      this.ctx.fill();
      startX += curW + dotGap;
    }
  }

  private drawPicker(t: number, w: number, h: number) {
    this.ctx.fillStyle = 'rgb(0, 0, 0)';
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.fillStyle = 'rgb(255, 255, 255)';
    this.ctx.font = '800 40px Archivo, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText("Which one is yours?", w * 0.07, h * 0.14);

    const rowH = h * 0.09;
    const startY = h * 0.24;

    const activeIndex = useExperienceStore.getState().activeBrandIndex;
    
    const pProgress = this.reducedMotion ? 1 : Math.min(1, (t - this.pickerSelectionStart) / 380);
    const pEase = this.easeInOutCubic(pProgress);
    
    const lastY = startY + this.pickerSelectionLast * rowH;
    const targetY = startY + activeIndex * rowH;
    const currentY = this.reducedMotion ? targetY : lastY + (targetY - lastY) * pEase;

    // Highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    this.ctx.beginPath();
    this.ctx.roundRect(w * 0.04, currentY, w * 0.92, rowH, 18);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgb(146, 195, 24)';
    this.ctx.beginPath();
    this.ctx.roundRect(w * 0.04, currentY, 4, rowH, 2);
    this.ctx.fill();

    brands.forEach((b, i) => {
      const y = startY + i * rowH;
      this.ctx.fillStyle = b.tint || 'rgb(255, 255, 255)';
      this.ctx.beginPath();
      this.ctx.arc(w * 0.12, y + rowH/2, 7, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = 'rgb(255, 255, 255)';
      this.ctx.font = (i === activeIndex) ? '700 26px Archivo, sans-serif' : '600 26px Archivo, sans-serif';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(b.name, w * 0.18, y + rowH/2);

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.fillText("›", w * 0.88, y + rowH/2 - 2);
      
      if (i < brands.length - 1) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          this.ctx.fillRect(w * 0.18, y + rowH, w * 0.75, 1);
      }
    });

    this.ctx.fillStyle = 'rgb(146, 195, 24)';
    this.ctx.beginPath();
    this.ctx.roundRect(w * 0.07, h * 0.86, w * 0.86, 64, 20);
    this.ctx.fill();
    this.ctx.fillStyle = 'rgb(42, 42, 42)';
    this.ctx.font = '700 24px Archivo, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("Browse all phones", w / 2, h * 0.86 + 32);
  }

  /**
   * Light "Find your perfect phone" home screen: the same design the DOM
   * portal crossfades in over it, so the handoff into the dive is seamless.
   */
  private drawFinal(t: number, w: number, h: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#FBFCF9';
    ctx.fillRect(0, 0, w, h);
    const top = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, w * 1.1);
    top.addColorStop(0, 'rgba(146,195,24,0.35)');
    top.addColorStop(1, 'rgba(146,195,24,0)');
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, h);
    const br = ctx.createRadialGradient(w, h, 0, w, h, w * 0.9);
    br.addColorStop(0, 'rgba(85,194,205,0.28)');
    br.addColorStop(1, 'rgba(85,194,205,0)');
    ctx.fillStyle = br;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h * 0.27);
    const s = this.reducedMotion ? 1 : 1 + Math.sin(t / 5500 * Math.PI * 2) * 0.04;
    const baseS = (0.34 * w) / 100;
    ctx.scale(baseS * s, baseS * s);
    ctx.translate(-50, -50);
    const sg = ctx.createLinearGradient(0, 0, 100, 100);
    sg.addColorStop(0, 'rgb(221,228,232)');
    sg.addColorStop(1, 'rgb(168,184,200)');
    ctx.fillStyle = sg;
    ctx.fill(new Path2D(BRAND_STAR_PATH));
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgb(95,138,13)';
    ctx.font = '800 22px Archivo, sans-serif';
    Object.assign(ctx, { letterSpacing: '0.3em' });
    ctx.fillText('AMRIT MOBILES', w / 2, h * 0.47);
    Object.assign(ctx, { letterSpacing: '-0.03em' });
    ctx.fillStyle = 'rgb(26,28,25)';
    ctx.font = '800 58px Archivo, sans-serif';
    ctx.fillText('Find your', w / 2, h * 0.535);
    ctx.fillText('perfect phone', w / 2, h * 0.59);
    Object.assign(ctx, { letterSpacing: '0px' });

    const sx = w * 0.09, sw = w * 0.82, sy = h * 0.635, sh = h * 0.05;
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.strokeStyle = 'rgb(226,228,221)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, sh / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgb(154,156,147)';
    ctx.font = '500 22px Archivo, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Search phones…', sx + 36, sy + sh / 2);

    const bw = w * 0.5, bh = h * 0.055, bx = (w - bw) / 2, by = h * 0.85;
    ctx.fillStyle = 'rgb(146,195,24)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, bh / 2);
    ctx.fill();
    ctx.fillStyle = 'rgb(42,42,42)';
    ctx.font = '800 26px Archivo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Enter store →', w / 2, by + bh / 2);
  }

  /** Previous dark finale screen (unused; kept for reference). */
  private drawFinalDark(t: number, w: number, h: number) {
    this.ctx.fillStyle = 'rgb(5, 6, 7)';
    this.ctx.fillRect(0, 0, w, h);

    const grad2 = this.ctx.createRadialGradient(w/2, h*0.62, 0, w/2, h*0.62, w*0.9);
    grad2.addColorStop(0, 'rgba(85, 194, 205, 0.10)');
    grad2.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = grad2;
    this.ctx.fillRect(0, 0, w, h);

    const grad = this.ctx.createRadialGradient(w/2, h*0.34, 0, w/2, h*0.34, w*0.45);
    grad.addColorStop(0, 'rgba(146, 195, 24, 0.14)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.save();
    this.ctx.translate(w / 2, h * 0.34);
    const scale = this.reducedMotion ? 1.0 : 1.0 + Math.sin(t / 5500 * Math.PI * 2) * 0.05;
    const baseS = (0.3 * w) / 100;
    this.ctx.scale(baseS * scale, baseS * scale);
    this.ctx.translate(-50, -50);
    
    this.ctx.shadowColor = 'rgba(146, 195, 24, 0.45)';
    this.ctx.shadowBlur = 40;
    const sGrad = this.ctx.createLinearGradient(0, 0, 100, 100);
    sGrad.addColorStop(0, 'rgb(185, 217, 226)');
    sGrad.addColorStop(0.5, 'rgb(85, 194, 205)');
    sGrad.addColorStop(1, 'rgb(146, 195, 24)');
    this.ctx.fillStyle = sGrad;
    this.ctx.fill(new Path2D(BRAND_STAR_PATH));
    this.ctx.restore();

    this.ctx.fillStyle = 'rgb(255, 255, 255)';
    this.ctx.font = '900 34px Archivo, sans-serif';
    Object.assign(this.ctx, { letterSpacing: '0.08em' });
    this.ctx.textAlign = 'center';
    this.ctx.fillText("AMRIT MOBILES", w / 2, h * 0.56);
    Object.assign(this.ctx, { letterSpacing: '0px' });

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '500 16px "DM Mono", monospace';
    Object.assign(this.ctx, { letterSpacing: '0.12em' });
    this.ctx.fillText(`${BRANCHES.length} branches in Surat`.toUpperCase(), w / 2, h * 0.66);
    Object.assign(this.ctx, { letterSpacing: '0px' });

    // Add thin lime rule
    this.ctx.fillStyle = 'rgb(146, 195, 24)';
    const ruleW = w * 0.12;
    this.ctx.fillRect((w - ruleW) / 2, h * 0.78 - 1, ruleW, 2);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.rafId);
    this.texture.dispose();
  }
}
