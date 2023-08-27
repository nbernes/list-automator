///<reference types="chrome"/>
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
// import browser from 'webextension-polyfill';

export interface Message {
  type: string;
  log?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private readonly receivedMessageTypes = [
    "itemsSelected",
    "actionsSelected",
    "revertedLastSelection",
    "actionsRan",
  ];

  receivedMessage = new Subject<Message>();

  constructor() {
    chrome.runtime?.onMessage.addListener((message: Message, _) => {
      if (this.receivedMessageTypes.includes(message.type)) {
        this.receivedMessage.next(message);
      }
    });
  }

  enableItemSelect() {
    chrome.runtime?.sendMessage({type: "enableItemSelect"});
  }

  enableActionSelect() {
    chrome.runtime?.sendMessage({type: "enableActionSelect"});
  }

  cancelItemSelect() {
    chrome.runtime?.sendMessage({type: "cancelItemSelect"});
  }

  cancelActionSelect() {
    chrome.runtime?.sendMessage({type: "cancelActionSelect"});
  }

  revertItemSelect() {
    chrome.runtime?.sendMessage({type: "revertItemSelect"});
  }

  revertActionSelect() {
    chrome.runtime?.sendMessage({type: "revertActionSelect"});
  }

  runActions() {
    chrome.runtime?.sendMessage({type: "runActions"});
  }


}
