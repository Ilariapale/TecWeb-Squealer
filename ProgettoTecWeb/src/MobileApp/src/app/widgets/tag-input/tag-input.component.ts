import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tag-input',
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.css'],
})
export class TagInputComponent {
  tags: string[] = [];
  tagInput: string = '';
  @Input() placeholder: string = 'Add a tag';
  addTag() {
    if (this.tagInput && !this.tags.includes(this.tagInput) && this.tagInput.trim() !== '') {
      this.tags.push(this.tagInput.replace(/\s/g, ''));
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
}
