import { Comment } from "../entity/Entity";
import { CommentData } from "../types/dataType";
import { replaceHost } from "../../services/util/http";
export class CommentBuilder {
  private _data: CommentData[];
  private _meta: object;

  constructor(
    comment: Comment[],
    offset: number,
    limit: number,
    order: string,
    totalCount: number
  ) {
    this._data = comment.map((value, index) => {
      console.log(value);
      return {
        id: value.id,
        message: value.message,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
        commentId: value.commentId,
        userId: value.user.id,
        nickName: value.user.nickName,
        url: value.user.image.url,
      };
    });
    this._meta = {
      offset: offset,
      limit: limit,
      order: order,
      totalCount: totalCount,
    };
  }

  public replaceHost(newHost: string): CommentBuilder {
    console.log(this._data);
    this._data.map((value, index) => {
      // this._data[index].url = replaceHost(this._data[index].url, newHost);
    });
    return this;
  }

  public build() {
    return {
      data: this._data,
      _meta: this._meta,
    };
  }
}
