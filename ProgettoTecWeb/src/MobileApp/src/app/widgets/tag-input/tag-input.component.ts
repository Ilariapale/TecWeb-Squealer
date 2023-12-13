import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DarkModeService } from 'src/app/services/dark-mode.service';

@Component({
  selector: 'app-tag-input',
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.css'],
})
export class TagInputComponent {
  constructor(private darkModeService: DarkModeService) {}
  //TODO controllare se Input in tags crea problemi
  @Input() tags: string[] = [];
  @Input() specialChar: string = '@';
  tagInput: string = '';
  @Input() placeholder: string = 'Add a tag';
  addTag() {
    if (this.tagInput && !this.tags.includes(this.tagInput) && this.tagInput.trim() !== '') {
      const tag = this.tagInput.replace(/\s/g, '');
      //se il tag è già presente non aggiungerlo e svuota l'input
      if (this.tags.includes(tag)) {
        this.tagInput = '';
        return;
      }
      this.tags.push(tag);
      this.tagInput = '';
    }
  }
  removeTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  removeAllTags() {
    this.tags = [];
  }

  getTags() {
    console.log(this.specialChar, this.tags);
    return this.tags;
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }
}
