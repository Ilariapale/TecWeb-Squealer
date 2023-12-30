import { Component, Input, OnInit } from '@angular/core';
import { Squeal } from 'src/app/models/squeal.interface';
import { CommentService } from 'src/app/services/api/comments.service';
import { CommentSection } from 'src/app/models/comment.interface';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';
import { ActivatedRoute } from '@angular/router';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-squeal',
  templateUrl: './squeal.component.html',
  styleUrls: ['./squeal.component.css'],
})
export class SquealComponent implements OnInit {
  TRUNCATE_LENGTH = 200;
  title = 'Squeal';
  @Input() squeal: Squeal;
  squeal_id: string = '';
  newCommentText: string = '';
  showComments = false;
  loadMore = false;
  comment_section: CommentSection = {};
  mySqueal: boolean = false;
  isSquealPage = false;
  isHome = false;
  isProfile = false;
  isGuest = false;
  showMore = false;
  showLoginMessage = false;
  constructor(
    private commentService: CommentService,
    private darkModeService: DarkModeService,
    public timeService: TimeService,
    private route: ActivatedRoute,
    private squealsService: SquealsService,
    private router: Router,
    private userService: UserService,
    private location: Location
  ) {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else this.isGuest = true;

    this.squeal = {};
    this.route.paramMap.subscribe((params) => {
      // if ((this.route.snapshot.url[0].path == 'home'))
      this.squeal_id = params.get('identifier') ?? ' ';
      this.isSquealPage = this.route.snapshot.url[0].path == 'squeal';
      this.isHome = this.route.snapshot.url[0].path == 'home';
      this.isProfile = this.route.snapshot.url[0].path == 'profile';
    });
  }
  ngOnInit() {
    if (JSON.stringify(this.squeal) == JSON.stringify({}) && this.squeal_id != '' && this.squeal_id != ' ') {
      this.squealsService
        .getSqueal(this.squeal_id, this.isGuest)
        .then((response: any) => {
          this.squeal = response[0];
          //Check if the squeal is mine
          this.commentService
            .getComments(this.squeal.comment_section || '')
            .then((data: any) => {
              this.comment_section = data;
            })
            .catch((error: any) => {
              this.router.navigate(['/error', error.status]);
            });
        })
        .catch((error: any) => {
          this.router.navigate(['/error', error.status]);
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
      // Get comments
      this.commentService
        .getComments(this.squeal.comment_section || '')
        .then((response: any) => {
          this.comment_section = response;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  loadMoreComments() {
    this.showLoadMore();
    if (this.comment_section.comments_array && this.comment_section.comments_array.length > 0) {
      this.commentService
        .getComments(this.squeal.comment_section || '', this.comment_section.comments_array[0]._id)
        .then((response: any) => {
          if (response.comments_array != undefined && response.comments_array.length > 0)
            this.comment_section.comments_array?.unshift(...response.comments_array);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  reportSqueal() {
    this.squealsService
      .reportSqueal(this.squeal._id || '')
      .then((response) => {})
      .catch((error) => {
        console.error(error);
      });
  }

  addComment() {
    this.commentService
      .addComment(this.squeal.comment_section || '', this.newCommentText)
      .then((response: any) => {
        this.comment_section.comments_array?.push(response.comment);
        this.newCommentText = '';
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleReactionAdd(reaction: string) {
    if (reaction == 'error') {
      this.showLoginMessage = true;
    } else {
      if (this.squeal.reactions != undefined) {
        this.squeal.reactions[reaction as keyof typeof this.squeal.reactions] =
          (this.squeal.reactions[reaction as keyof typeof this.squeal.reactions] as number) + 1;
      }
    }
  }

  getLon(coord: String | undefined) {
    return Number(coord?.split(' ')[0]);
  }

  getLat(coord: String | undefined) {
    return Number(coord?.split(' ')[1]);
  }
  goToSqueal() {
    this.router.navigate([`squeal/${this.squeal._id}`]);
  }
  goToChannel(channelName: String) {
    this.router.navigate([`channel/${channelName}`]);
  }
  goBack(): void {
    this.location.back();
  }
}
