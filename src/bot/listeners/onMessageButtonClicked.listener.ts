import { OnEvent } from '@nestjs/event-emitter';
import { Events } from 'mezon-sdk';
import { Injectable } from '@nestjs/common';
import { BaicaoService } from '../commands/casino/baicao.service';

@Injectable()
export class ListenerMessageButtonClicked {
  constructor(
    private baicaoService: BaicaoService,
  ) {}

  @OnEvent(Events.MessageButtonClicked)
  async hanndleButtonForm(data) {
    try {
      const args = data.button_id.split('_');
      const buttonConfirmType = args[0];
      switch (buttonConfirmType) {
        case 'baicao':
          this.handleSelectBaicao(data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.log('hanndleButtonForm ERROR', error);
    }
  }

  async handleSelectBaicao(data) {
    try {
      await this.baicaoService.handleSelectBaicao(data);
    } catch (error) {
      console.log('ERORR handleSelectPoll', error);
    }
  }

}
