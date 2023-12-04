import { Component, Input } from '@angular/core';
import { ContentType, Squeal } from 'src/app/models/squeal.interface';
import { CommentService } from 'src/app/services/api/comments.service';
import { CommentSection } from 'src/app/models/comment.interface';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';
import * as e from 'express';
import { ActivatedRoute } from '@angular/router';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-squeal',
  templateUrl: './squeal.component.html',
  styleUrls: ['./squeal.component.css'],
})
export class SquealComponent {
  title = 'Squeal';
  @Input() squeal: Squeal;
  squeal_id: string = '';
  newCommentText: string = '';
  showComments = false;
  loadMore = false;
  comment_section: CommentSection = {};
  mySqueal: boolean = false;

  constructor(
    private commentService: CommentService,
    private darkModeService: DarkModeService,
    public timeService: TimeService,
    private route: ActivatedRoute,
    private squealsService: SquealsService,
    private router: Router,
    private userService: UserService
  ) {
    this.squeal = {};
    this.route.paramMap.subscribe((params) => {
      if ((this, route.snapshot.url[0].path == 'home')) this.squeal_id = params.get('identifier') ?? ' ';
    });
  }
  ngOnInit(): void {
    if (JSON.stringify(this.squeal) == JSON.stringify({}) && this.squeal_id != '' && this.squeal_id != ' ') {
      this.squealsService.getSqueal(this.squeal_id).subscribe({
        next: (response: any) => {
          console.log(response);
          this.squeal = response[0];
          console.log(this.squeal);
          //Check if the squeal is mine
          this.commentService.getComments(this.squeal.comment_section || '').subscribe({
            next: (data: any) => {
              console.log(data);
              this.comment_section = data;
            },
            error: (error) => {
              this.router.navigate(['/error', error.status]);
            },
          });
        },
        error: (error) => {
          this.router.navigate(['/error', error.status]);
        },
      });
    }
    this.mySqueal = this.userService.isMyself((this.squeal.username as string) || '');
  }

  getDarkMode() {
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
