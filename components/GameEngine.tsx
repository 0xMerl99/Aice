
import React, { useRef, useEffect, useState } from 'react';
import { Entity, Vector2 } from '../types';
import { TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT, PLAYER_WALK_SPEED, NPC_WALK_SPEED } from '../constants';

interface GameEngineProps {
  entities: Entity[];
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;
  onPlayerMove: (id: string, pos: Vector2) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

// Internal state to track facing direction without polluting external types if possible, 
// or we just calculate it on the fly from velocity.
export const GameEngine: React.FC<GameEngineProps> = ({ entities, setEntities }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const entitiesRef = useRef<Entity[]>(entities);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const [scale, setScale] = useState(1);
  const particles = useRef<Particle[]>([]);
  const entityVelocities = useRef<{ [key: string]: { dx: number } }>({});

  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        const worldWidth = WORLD_WIDTH * TILE_SIZE;
        const worldHeight = WORLD_HEIGHT * TILE_SIZE;
        const scaleX = (width * 0.95) / worldWidth;
        const scaleY = (height * 0.95) / worldHeight;
        const newScale = Math.min(scaleX, scaleY, 1.2);
        setScale(newScale);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // World Map Data
    const structures = [
      { type: 'fountain', x: 20, y: 15 },
      { type: 'house', x: 17, y: 12, color: '#a1887f' },
      { type: 'house', x: 17, y: 18, color: '#94a3b8' },
      { type: 'house', x: 23, y: 12, color: '#90a4ae' },
      { type: 'house', x: 23, y: 18, color: '#bcaaa4' },
      { type: 'shop', x: 18, y: 10, color: '#f59e0b', sign: 'BAKE' },
      { type: 'shop', x: 22, y: 10, color: '#10b981', sign: 'GEAR' },
      { type: 'bench', x: 18.5, y: 14 },
      { type: 'bench', x: 21.5, y: 14 },
      { type: 'tree', x: 5, y: 5 }, { type: 'tree', x: 7, y: 4 }, { type: 'tree', x: 34, y: 20 },
      { type: 'tree', x: 36, y: 22 }, { type: 'tree', x: 12, y: 24 }, { type: 'tree', x: 28, y: 4 },
    ];

    const streetLamps = [
      { x: 19, y: 14 }, { x: 21, y: 14 },
      { x: 19, y: 16 }, { x: 21, y: 16 },
      { x: 15, y: 14 }, { x: 25, y: 14 },
      { x: 20, y: 10 }, { x: 20, y: 20 },
    ];

    const flowers: {x: number, y: number, color: string}[] = [];
    for(let i=0; i<80; i++) {
        flowers.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            color: ['#f43f5e', '#fbbf24', '#ffffff', '#818cf8'][Math.floor(Math.random()*4)]
        });
    }

    const drawCobbleTile = (tx: number, ty: number) => {
        const x = tx * TILE_SIZE;
        const y = ty * TILE_SIZE;
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        const stones = [
            {sx: 2, sy: 2, sw: 12, sh: 12}, {sx: 16, sy: 4, sw: 14, sh: 10},
            {sx: 4, sy: 16, sw: 24, sh: 12}
        ];
        stones.forEach((s, idx) => {
            ctx.fillStyle = idx % 2 === 0 ? '#1e293b' : '#0f172a';
            ctx.fillRect(x + s.sx, y + s.sy, s.sw, s.sh);
        });
    };

    const render = (time: number) => {
      updateLogic();

      // Clear
      ctx.fillStyle = '#0d0d12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grass
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        ctx.fillStyle = y % 2 === 0 ? '#33691e' : '#558b2f';
        ctx.fillRect(0, y * TILE_SIZE, WORLD_WIDTH * TILE_SIZE, TILE_SIZE);
      }

      // Flowers
      flowers.forEach(f => {
          ctx.fillStyle = f.color;
          ctx.fillRect(f.x * TILE_SIZE, f.y * TILE_SIZE, 2, 2);
      });

      // Roads
      for (let x = 0; x < WORLD_WIDTH; x++) {
        for (let y = 0; y < WORLD_HEIGHT; y++) {
          if (x === 20 || y === 15 || (Math.abs(x - 20) < 2 && Math.abs(y - 15) < 2)) {
            drawCobbleTile(x, y);
          }
        }
      }

      // Structures
      structures.sort((a, b) => a.y - b.y).forEach(obj => {
        const rx = obj.x * TILE_SIZE;
        const ry = obj.y * TILE_SIZE;

        if (obj.type === 'tree') {
          // Tree Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.beginPath(); ctx.ellipse(rx + 16, ry + 32, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
          // Trunk
          ctx.fillStyle = '#3e2723';
          ctx.fillRect(rx + 12, ry + 16, 8, 16);
          // Leaves
          ctx.fillStyle = '#1b5e20';
          ctx.beginPath(); ctx.arc(rx + 16, ry + 8, 20, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#2e7d32';
          ctx.beginPath(); ctx.arc(rx + 10, ry + 4, 12, 0, Math.PI * 2); ctx.fill();
        } else if (obj.type === 'house') {
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(rx + 6, ry + 28, 32, 6);
          ctx.fillStyle = obj.color || '#a1887f';
          ctx.fillRect(rx + 2, ry + 12, 28, 20);
          ctx.fillStyle = '#3e2723';
          ctx.beginPath();
          ctx.moveTo(rx - 2, ry + 14); ctx.lineTo(rx + 16, ry); ctx.lineTo(rx + 34, ry + 14);
          ctx.fill();
        } else if (obj.type === 'bench') {
          ctx.fillStyle = '#4e342e';
          ctx.fillRect(rx, ry + 20, 32, 4);
          ctx.fillRect(rx + 4, ry + 24, 2, 4); ctx.fillRect(rx + 26, ry + 24, 2, 4);
        } else if (obj.type === 'fountain') {
          ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(rx + 16, ry + 16, 28, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#0ea5e9'; ctx.beginPath(); ctx.arc(rx + 16, ry + 16, 20, 0, Math.PI * 2); ctx.fill();
          if (Math.random() > 0.3) {
            particles.current.push({
              x: rx + 16, y: ry + 14, vx: (Math.random() - 0.5) * 1.5, vy: -Math.random() * 2.5 - 1, life: 1, maxLife: 0.6
            });
          }
        } else if (obj.type === 'shop') {
          ctx.fillStyle = '#f5f5f5'; ctx.fillRect(rx, ry + 12, 32, 20);
          ctx.fillStyle = obj.color || '#f59e0b'; ctx.fillRect(rx - 4, ry, 40, 12);
        }
      });

      // Fountain Particles
      particles.current = particles.current.filter(p => {
        p.life -= 0.016; p.vy += 0.12; p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = 'rgba(186, 230, 253, ' + p.life + ')';
        ctx.fillRect(p.x, p.y, 2, 2);
        return p.life > 0;
      });

      // Street Lamps
      streetLamps.forEach(lamp => {
        const lx = lamp.x * TILE_SIZE + 14;
        const ly = lamp.y * TILE_SIZE;
        ctx.fillStyle = '#0f172a'; ctx.fillRect(lx, ly + 4, 4, 28);
        ctx.fillStyle = '#334155'; ctx.fillRect(lx - 2, ly, 8, 4);
        const dayProgress = (Math.sin(time * 0.0005) + 1) / 2;
        ctx.fillStyle = (dayProgress < 0.45) ? '#fbbf24' : '#1e293b';
        ctx.fillRect(lx, ly + 1, 4, 4);
      });

      // Entities - IMPROVED ANIMATION
      const sortedEntities = [...entitiesRef.current].sort((a, b) => a.pos.y - b.pos.y);
      sortedEntities.forEach(entity => {
        const rx = entity.pos.x * TILE_SIZE;
        const ry = entity.pos.y * TILE_SIZE;
        
        // Calculate movement state accurately
        const distToTarget = Math.sqrt(Math.pow(entity.pos.x - entity.targetPos.x, 2) + Math.pow(entity.pos.y - entity.targetPos.y, 2));
        const isMoving = distToTarget > 0.05;

        // Facing logic
        const vel = entityVelocities.current[entity.id] || { dx: 0 };
        const facingLeft = vel.dx < 0;

        // Animation factors - RESET TO ZERO WHEN IDLE
        const swing = isMoving ? Math.sin(time * 0.015) : 0;
        const bob = isMoving ? Math.abs(Math.sin(time * 0.01)) * 4 : 0; // Strictly 0 when idle

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(rx + 16, ry + 30, 10, 5, 0, 0, Math.PI * 2); ctx.fill();

        // character drawing with facing
        const faceOffset = facingLeft ? -2 : 2;

        // Legs
        ctx.fillStyle = entity.color;
        ctx.fillRect(rx + 11, ry + 24 - bob + (swing * 5), 4, 8); // L Leg
        ctx.fillRect(rx + 17, ry + 24 - bob - (swing * 5), 4, 8); // R Leg

        // Body
        ctx.fillStyle = entity.color;
        ctx.fillRect(rx + 10, ry + 14 - bob, 12, 12);

        // Arms (Slightly dynamic)
        ctx.globalAlpha = 0.7;
        ctx.fillRect(rx + 7, ry + 14 - bob - (swing * 5), 3, 10);
        ctx.fillRect(rx + 22, ry + 14 - bob + (swing * 5), 3, 10);
        ctx.globalAlpha = 1.0;

        // Head
        ctx.fillStyle = '#f5d6a7';
        ctx.fillRect(rx + 11, ry + 4 - bob, 10, 10);
        // Eyes (Look in direction)
        ctx.fillStyle = '#000';
        ctx.fillRect(rx + 13 + faceOffset, ry + 8 - bob, 2, 2);
        ctx.fillRect(rx + 17 + faceOffset, ry + 8 - bob, 2, 2);

        // UI: Name
        ctx.font = '6px "Press Start 2P"';
        const nw = ctx.measureText(entity.name).width;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(rx + 16 - nw/2 - 4, ry - 18, nw + 8, 10);
        ctx.fillStyle = 'white'; ctx.fillText(entity.name, rx + 16 - nw/2, ry - 11);

        // Speech
        if (entity.bubbleText && entity.bubbleTimer > 0) {
          ctx.font = '7px "Press Start 2P"';
          const txt = entity.bubbleText.length > 25 ? entity.bubbleText.substring(0, 22) + '...' : entity.bubbleText;
          const tw = ctx.measureText(txt).width;
          const bx = rx + 16 - tw/2 - 8;
          const by = ry - 44 - bob;
          ctx.fillStyle = 'white'; ctx.beginPath(); ctx.roundRect(bx, by, tw + 16, 24, 4); ctx.fill();
          ctx.beginPath(); ctx.moveTo(rx + 12, by + 24); ctx.lineTo(rx + 16, by + 30); ctx.lineTo(rx + 20, by + 24); ctx.fill();
          ctx.fillStyle = 'black'; ctx.fillText(txt, bx + 8, by + 16);
        }
      });

      // Ambient Day/Night
      const dayProg = (Math.sin(time * 0.0005) + 1) / 2;
      const nightAlpha = Math.max(0, 0.55 - dayProg);
      ctx.fillStyle = `rgba(10, 10, 40, ${nightAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(render);
    };

    const updateLogic = () => {
      setEntities(prev => prev.map(e => {
        let nPos = { ...e.pos };
        let nTarget = { ...e.targetPos };
        let dx = 0;

        if (!e.isPlayer) {
          if (Math.random() < 0.003) {
            nTarget = { 
                x: Math.max(2, Math.min(WORLD_WIDTH - 2, e.pos.x + (Math.random() - 0.5) * 14)), 
                y: Math.max(2, Math.min(WORLD_HEIGHT - 2, e.pos.y + (Math.random() - 0.5) * 14)) 
            };
          }
          const distDx = nTarget.x - nPos.x; const distDy = nTarget.y - nPos.y; 
          const d = Math.sqrt(distDx*distDx + distDy*distDy);
          if (d > 0.05) { 
            dx = (distDx/d)*NPC_WALK_SPEED; 
            nPos.x += dx; nPos.y += (distDy/d)*NPC_WALK_SPEED; 
          } else {
            nPos = { ...nTarget };
          }
        } else {
          let mx = 0, my = 0;
          if (keysPressed.current['w']) my -= 1; if (keysPressed.current['s']) my += 1;
          if (keysPressed.current['a']) mx -= 1; if (keysPressed.current['d']) mx += 1;
          if (mx !== 0 || my !== 0) {
            const m = Math.sqrt(mx*mx + my*my);
            dx = (mx/m)*PLAYER_WALK_SPEED;
            nPos.x += dx; nPos.y += (my/m)*PLAYER_WALK_SPEED;
            nTarget = { ...nPos };
          } else {
            const distDx = nTarget.x - nPos.x; const distDy = nTarget.y - nPos.y; 
            const d = Math.sqrt(distDx*distDx + distDy*distDy);
            if (d > 0.05) { 
              dx = (distDx/d)*PLAYER_WALK_SPEED;
              nPos.x += dx; nPos.y += (distDy/d)*PLAYER_WALK_SPEED; 
            } else {
              nPos = { ...nTarget };
            }
          }
        }
        
        // Save velocity for animation direction
        entityVelocities.current[e.id] = { dx };
        
        return { ...e, pos: nPos, targetPos: nTarget, bubbleTimer: Math.max(0, e.bubbleTimer - 16) };
      }));
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setEntities]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (rect.width / canvas.width) / TILE_SIZE;
    const y = (e.clientY - rect.top) / (rect.height / canvas.height) / TILE_SIZE;
    setEntities(prev => prev.map(ent => ent.isPlayer ? { ...ent, targetPos: { x, y } } : ent));
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-[#0d0d12] relative overflow-hidden">
      <div 
        className="relative shadow-2xl bg-[#33691e] rounded-sm ring-8 ring-black/60"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center center', imageRendering: 'pixelated' }}
      >
        <canvas
          ref={canvasRef}
          width={WORLD_WIDTH * TILE_SIZE}
          height={WORLD_HEIGHT * TILE_SIZE}
          onPointerDown={handlePointerDown}
          className="touch-none cursor-crosshair"
        />
      </div>
    </div>
  );
};
