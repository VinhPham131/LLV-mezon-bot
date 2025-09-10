import { CommandMessage } from 'src/bot/base/command.abstract';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { ChannelMessage } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/client.service';
import { EMessageComponentType, EButtonMessageStyle } from 'mezon-sdk';

interface Card {
  suit: string; // chất bài ♥️ ♦️ ♠️ ♣️
  value: string; // giá trị A,2-10,J,Q,K
  score: number; // điểm dùng để tính bài cào
}

@Command('baicaotest')
export class BaicaotestCommand extends CommandMessage {
  constructor(clientService: MezonClientService) {
    super(clientService);
  }

  createDeck(): Card[] {
    const suits = ['♥️', '♦️', '♠️', '♣️'];
    const values = [
      { value: 'A', score: 1 },
      { value: '2', score: 2 },
      { value: '3', score: 3 },
      { value: '4', score: 4 },
      { value: '5', score: 5 },
      { value: '6', score: 6 },
      { value: '7', score: 7 },
      { value: '8', score: 8 },
      { value: '9', score: 9 },
      { value: '10', score: 10 },
      { value: 'J', score: 10 },
      { value: 'Q', score: 10 },
      { value: 'K', score: 10 },
    ];

    const deck: Card[] = [];
    for (const suit of suits) {
      for (const val of values) {
        deck.push({
          suit,
          value: val.value,
          score: val.score,
        });
      }
    }
    return deck;
  }

  shuffle(deck: Card[]): Card[] {
    return deck.sort(() => Math.random() - 0.5);
  }

  dealCards(deck: Card[], numPlayers: number): Card[][] {
    const result: Card[][] = [];
    for (let i = 0; i < numPlayers; i++) {
      result.push(deck.slice(i * 3, i * 3 + 3));
    }
    return result;
  }

  calculateScore(cards: Card[]): number {
    const total = cards.reduce((sum, card) => sum + card.score, 0);
    return total % 10; // chỉ lấy hàng đơn vị
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);
    const messageid = message.message_id;

    const embed: any = [
      {
        color: '#FF69B4',
        title: `[Bài Cào]`,
        fields: [
          {
            name: 'Tiền cược:',
            value: '',
            inputs: {
              id: `baicao-${messageid}-totalAmount-ip`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `baicao-${messageid}-totalAmount-plhder`,
                required: true,
                defaultValue: 10000,
                type: 'number',
              },
            },
          },
          {
            name: 'Số người chơi:',
            value: '',
            inputs: {
              id: `baicao-${messageid}-numPlayers-ip`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `baicao-${messageid}-numPlayers-plhder`,
                required: true,
                defaultValue: 2,
                type: 'number',
              },
            },
          },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Powered by LLV Bot' }, // <-- sửa ở đây
      },
    ];

    const components = [
      {
        components: [
          {
            id: `BAICAO_CANCEL_${messageid}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Cancel`,
              style: EButtonMessageStyle.SECONDARY,
            },
          },
          {
            id: `BAICAO_START_${messageid}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Chia bài`,
              style: EButtonMessageStyle.SUCCESS,
            },
          },
        ],
      },
    ];

    if (args.length === 0) {
      return await messageChannel?.reply({
        embed,
        components,
      });
    }

    if (args[0] === 'start') {
      const betAmount = parseInt(args[1]) || 10000;
      const numPlayers = parseInt(args[2]) || 2;

      let deck = this.createDeck();
      deck = this.shuffle(deck);
      const hands = this.dealCards(deck, numPlayers);

      const scores = hands.map((hand) => this.calculateScore(hand));
      const maxScore = Math.max(...scores);
      const winnerIndex = scores.indexOf(maxScore);

      let resultText = `🎴 **Kết quả ván bài** 🎴\n\n`;
      hands.forEach((hand, idx) => {
        const cardsStr = hand.map((c) => `${c.suit}${c.value}`).join(', ');
        resultText += `Người chơi ${idx + 1}: [${cardsStr}] → **${scores[idx]} điểm**\n`;
      });
      resultText += `\n🏆 **Người thắng:** Người chơi ${winnerIndex + 1}\n`;
      resultText += `💰 **Tiền thắng:** ${betAmount * numPlayers}`;

      return await messageChannel?.reply({
        embed: [
          {
            color: '#00FF00',
            title: `[Bài Cào - Kết Quả]`,
            description: resultText,
            timestamp: new Date().toISOString(),
            footer: { text: 'Powered by LLV Bot' }, // <-- và sửa ở đây
          },
        ],
      });
    }
  }
}
