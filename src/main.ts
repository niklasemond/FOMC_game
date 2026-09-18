import Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/BootScene.ts';
import { EconomicSimulation } from './simulation/engine.ts';
import { mountDebugPanel } from './ui/debugPanel.ts';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 160,
  height: 144,
  parent: 'game',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene]
};

new Phaser.Game(config);
mountDebugPanel(new EconomicSimulation({ seed: 19870811 }));
