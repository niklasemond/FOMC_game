import Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/BootScene.ts';
import { PHASE_2_SCENARIO } from './meeting/content.ts';
import { EconomicSimulation } from './simulation/engine.ts';
import { mountDebugPanel } from './ui/debugPanel.ts';
import { mountMeetingPrototype } from './ui/meetingPanel.ts';

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

const debugMode = new URLSearchParams(window.location.search).get('debug') === '1';
if (debugMode) {
  mountDebugPanel(new EconomicSimulation(PHASE_2_SCENARIO));
} else {
  mountMeetingPrototype(new EconomicSimulation(PHASE_2_SCENARIO));
}
