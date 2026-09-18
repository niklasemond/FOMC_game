import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#9bbc0f');
    this.add.rectangle(80, 72, 150, 134, 0x8bac0f).setStrokeStyle(2, 0x0f380f);
    this.add.text(80, 26, 'FOMC CHAIR', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#0f380f'
    }).setOrigin(0.5);
    this.add.text(80, 45, 'ECONOMIC SANDBOX', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#306230'
    }).setOrigin(0.5);

    const lines = [
      'PHASE 1 DEBUG BUILD',
      '',
      'SIMULATION: ONLINE',
      'RPG WORLD: LOCKED',
      'EVENTS: LOCKED',
      'PRESS CORPS: LURKING',
      '',
      'USE DEBUG PANEL ->'
    ];

    this.add.text(18, 67, lines.join('\n'), {
      fontFamily: 'monospace',
      fontSize: '7px',
      lineSpacing: 3,
      color: '#0f380f'
    });
  }
}
