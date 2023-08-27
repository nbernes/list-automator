import { Component, Input } from '@angular/core';

@Component({
  selector: 'bot-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent {
  @Input() stepNb!: number;
  @Input() isCurrentStep!: boolean;
  @Input() instruction: string = "Here is the instruction";
}
