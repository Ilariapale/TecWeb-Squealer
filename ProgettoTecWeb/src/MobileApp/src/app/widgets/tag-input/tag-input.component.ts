import { Component, Input } from '@angular/core';
import { DarkModeService } from 'src/app/services/dark-mode.service';

@Component({
  selector: 'app-tag-input',
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.css'],
})
export class TagInputComponent {
  constructor(private darkModeService: DarkModeService) {}
  @Input() tags: string[] = [];
  @Input() specialChar: string = '@';
  @Input() placeholder: string = 'Add a tag';
  @Input() id_modifier: string = '';
  tagInputIds = {
    '@': 'users',
    '#': 'tags',
    '§': 'channels',
  } as any;
  tagInput: string = '';
  addTag() {
    if (this.tagInput && !this.tags.includes(this.tagInput) && this.tagInput.trim() !== '') {
      const tag = this.tagInput.replace(/\s/g, '');
      // If the tag is already present, do not add it and empty the input
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
    return this.tags;
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }
}
