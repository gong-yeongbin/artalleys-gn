import { Comment, Post } from "../entity/Entity";

interface CommentData {
  id: number;
  post: Post;
  commentId: string;
  reply: Comment;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}

export interface ReplyData {
  commentId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ReplyBuilder {
  private _replyData: ReplyData[];

  constructor(comment: any) {
    const replyData: ReplyData[] = comment.map((value, index) => {
      return {
        commentId: value.reply.commentId,
        message: value.reply.message,
        createdAt: value.reply.createdAt,
        updateAt: value.reply.updatedAt,
      };
    });
    this._replyData = replyData;
  }

  public build() {
    return this._replyData;
  }
}
