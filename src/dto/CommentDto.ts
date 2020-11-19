export interface CommentData {
  commentId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CommentBuilder {
  private _commentData: CommentData[];
  constructor(comment: CommentData[]) {
    const commentData: CommentData[] = comment.map((value, index) => {
      return {
        commentId: value.commentId,
        message: value.message,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
      };
    });
    this._commentData = commentData;
  }

  public build() {
    return this._commentData;
  }
}
