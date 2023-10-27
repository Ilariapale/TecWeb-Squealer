import { Component, Input } from '@angular/core';
import { Squeal } from 'src/app/models/squeal.interface';
import { CommentService } from 'src/app/services/api/comments.service';
import { CommentSection } from 'src/app/models/comment.interface';

@Component({
  selector: 'app-squeal',
  templateUrl: './squeal.component.html',
  styleUrls: ['./squeal.component.css'],
})
export class SquealComponent {
  title = 'Squeal';
  @Input() squeal: Squeal;
  newCommentText: string = '';
  showComments = false;
  comment_section: CommentSection = {};

  constructor(private commentService: CommentService) {
    this.squeal = {};
  }

  toggleComments() {
    this.showComments = !this.showComments;
    if (this.showComments) {
      // Ottieni i commenti
      this.commentService.getComments(this.squeal.comment_section || '').subscribe(
        (response: any) => {
          console.log(response);
          this.comment_section = response;
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }

  loadMoreComments() {
    console.log('loadMoreComments');
    if (this.comment_section.comments_array && this.comment_section.comments_array.length > 0) {
      this.commentService
        .getComments(this.squeal.comment_section || '', this.comment_section.comments_array[0]._id)
        .subscribe(
          (response: any) => {
            console.log(response);
            this.comment_section.comments_array?.unshift(...response.comments_array);
          },
          (error) => {
            console.error(error);
          }
        );
    }
  }

  addComment() {
    console.log(this.newCommentText);
    this.commentService.addComment(this.squeal.comment_section || '', this.newCommentText).subscribe(
      (response: any) => {
        console.log(response);
        this.comment_section.comments_array?.push(response.comment);
        this.newCommentText = '';
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
