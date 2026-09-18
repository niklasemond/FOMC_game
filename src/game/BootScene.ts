import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#9bbc0f');
    this.add.rectangle(80, 72, 150, 134, 0x8bac0f).setStrokeStyle(2, 0x0f380f);
    this.add.text(80, 24, 'FOMC CHAIR', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#0f380f'
    }).setOrigin(0.5);
    this.add.text(80, 42, 'MEETING 1', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#306230'
    }).setOrigin(0.5);

    const lines = [
      'CORE CPI: 3.0%',
      'UNEMP.:   4.7%',
      'PAYROLLS: 65K',
      '',
      'THE DATA DISAGREE.',
      'SO WILL YOUR STAFF.',
      '',
      'MAKE THE CALL ->'
    ];

    this.add.text(18, 62, lines.join('\n'), {
      fontFamily: 'monospace',
      fontSize: '7px',
      lineSpacing: 3,
      color: '#0f380f'
    });
  }
}
