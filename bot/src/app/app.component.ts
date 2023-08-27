import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MessagingService, Message } from 'src/app/services/Messaging.service';

@Component({
  selector: 'bot-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  currentStep = 0;

  constructor(
    private messagingService: MessagingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.messagingService.receivedMessage.subscribe((message: Message) => {
      switch (message.type) {
        case 'itemsSelected':
        case 'actionsSelected': this.nextStep(); break;
        case 'revertedLastSelection': this.prevStep(); break;
        case 'actionsRan': this.markActionsAsDone(); break;
      }
    });
  }

  private nextStep() {
    this.currentStep = (this.currentStep + 1) % 3;
    this.cdr.detectChanges();
  }

  private prevStep() {
    this.currentStep--;
    this.cdr.detectChanges();
  }

  private markActionsAsDone() {
    setTimeout(() => {
      this.nextStep();
    }, 500);
  }

  toggleItemSelect(isEnabled: boolean) {
    if (isEnabled) {
      this.messagingService.enableItemSelect();
    } else {
      this.messagingService.cancelItemSelect();
    }
  }

  toggleActionSelect(isEnabled: boolean) {
    if (isEnabled) {
      this.messagingService.enableActionSelect();
    } else {
      this.messagingService.cancelActionSelect();
    }
  }

  revertItemSelect() { this.messagingService.revertItemSelect(); }

  revertActionSelect() { this.messagingService.revertActionSelect(); }

  runActions() {
    this.messagingService.runActions();
  }
}