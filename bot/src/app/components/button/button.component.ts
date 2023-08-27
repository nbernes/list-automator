import { Component, Input, Output, EventEmitter } from '@angular/core';

type ButtonType = 'switch' | 'action' | 'done';

@Component({
  selector: 'bot-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  isSwitchToggled = false;

  private _type!: ButtonType;
  @Input()
  set type(value: ButtonType) {
    if (value === 'done') {
      this.isSwitchToggled = false;
    }
    this._type = value;
  }
  get type(): ButtonType {
    return this._type;
  }
  @Input() isEnabled!: boolean;

  @Output() onClicked = new EventEmitter<boolean>();
  @Output() onRevert = new EventEmitter<void>();

  onClick() {
    if (this.type === 'switch') {
      this.isSwitchToggled = !this.isSwitchToggled;
    }
    this.onClicked.emit(this.isSwitchToggled);
  }

}
