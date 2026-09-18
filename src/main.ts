import Phaser from 'phaser';
import './style.css';
import { BootScene } from './game/BootScene.ts';
import { PHASE_2_SCENARIO } from './meeting/content.ts';
import { EconomicSimulation } from './simulation/engine.ts';
import { mountDebugPanel } from './ui/debugPanel.ts';
import { mountMeetingPrototype } from './ui/meetingPanel.ts';
import { mountArcadePrototype } from './ui/arcadePanel.ts';

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

const params = new URLSearchParams(window.location.search);
const debugMode = params.get('debug') === '1';
const classicMode = params.get('classic') === '1';
if (debugMode) {
  mountDebugPanel(new EconomicSimulation(PHASE_2_SCENARIO));
} else if (classicMode) {
  mountMeetingPrototype(new EconomicSimulation(PHASE_2_SCENARIO));
} else {
  mountArcadePrototype();
}
