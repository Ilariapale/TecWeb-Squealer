import { Component, Input } from '@angular/core';
import { Squeal } from 'src/app/models/squeal.interface';
import { CommentService } from 'src/app/services/api/comments.service';
import { CommentSection } from 'src/app/models/comment.interface';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';
import * as e from 'express';

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
  loadMore = false;
  comment_section: CommentSection = {};

  constructor(
    private commentService: CommentService,
    private darkModeService: DarkModeService,
    public timeService: TimeService
  ) {
    this.squeal = {};
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }

  showLoadMore() {
    if (this.squeal.comments_count && this.squeal.comment_section) {
      this.loadMore = Number(this.squeal.comments_count) > (this.comment_section.comments_array?.length || 0);
    } else {
      this.loadMore = false;
    }
  }

  toggleComments() {
    this.showLoadMore();
    this.showComments = !this.showComments;
    if (
      this.showComments &&
      (this.comment_section?.comments_array?.length == 0 || this.comment_section?.comments_array == undefined)
    ) {
      // Ottieni i commenti
      this.commentService.getComments(this.squeal.comment_section || '').subscribe({
        next: (response: any) => {
          console.log(response);
          this.comment_section = response;
        },
        error: (error) => {
          //console.error(error);
        },
      });
    }
  }

  loadMoreComments() {
    this.showLoadMore();

    console.log('loadMoreComments');
    if (this.comment_section.comments_array && this.comment_section.comments_array.length > 0) {
      this.commentService
        .getComments(this.squeal.comment_section || '', this.comment_section.comments_array[0]._id)
        .subscribe({
          next: (response: any) => {
            console.log(response);
            if (response.comments_array != undefined && response.comments_array.length > 0)
              this.comment_section.comments_array?.unshift(...response.comments_array);
          },
          error: (error) => {
            //console.error(error);
          },
        });
    }
  }

  addComment() {
    console.log(this.newCommentText);
    this.commentService.addComment(this.squeal.comment_section || '', this.newCommentText).subscribe({
      next: (response: any) => {
        this.comment_section.comments_array?.push(response.comment);
        this.newCommentText = '';
      },
      error: (error) => {
        //console.error(error);
      },
    });
  }
}
